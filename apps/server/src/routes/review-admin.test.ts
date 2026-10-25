import { beforeEach, expect, mock, test } from "bun:test";
import { Hono } from "hono";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
Bun.env.DATABASE_URL = "postgres://test:test@localhost/test";
Bun.env.BETTER_AUTH_SECRET = "test-secret-at-least-thirty-two-characters";
Bun.env.BETTER_AUTH_URL = "http://localhost:3002";
Bun.env.CORS_ORIGIN = "http://localhost:3001";
Bun.env.CENTRAL_API_JWT_SECRET = "test-central-api-secret-at-least-thirty-two";
Bun.env.NODE_ENV = "test";
Bun.env.ERP_REVIEW_ADMIN_ID = "reviewer";
Bun.env.ERP_REVIEW_ADMIN_PASSWORD_HASH = await Bun.password.hash(
  "correct-test-password"
);
Bun.env.ERP_REVIEW_ADMIN_SECRET = "admin-session-secret-at-least-thirty-two";
Bun.env.ERP_WEB_URL = "https://erp.virujhealth.com";
Bun.env.CENTRAL_API_URL = "http://central.test";
let row = {
  organization_id: "org",
  applicant_id: "owner",
  revision: 1,
  status: "pending",
  reason: null as string | null,
  email: "owner@example.com",
  organization_type: "clinic",
  slug: "example",
  email_sent_at: null as string | null,
};
let mailFails = false,
  delivered = 0;
let sentEmail: { text: string; html?: string } | null = null;
let listQuery = "";
const dialect = new PgDialect();
mock.module("@erp_virujhealth/db", () => ({
  db: {
    execute: async (query: SQL) => {
      const { sql, params } = dialect.sqlToQuery(query);
      if (sql.includes("AS applicant_name")) {
        listQuery = sql;
        const logs = sql.includes("WHERE r.status IN ('approved','rejected')");
        return (
          logs
            ? ["approved", "rejected"].includes(row.status)
            : row.status === "pending"
        )
          ? [{ ...row }]
          : [];
      }
      if (sql.startsWith("UPDATE erp_access_reviews SET status=")) {
        if (row.status !== "pending" || params[3] !== row.revision) return [];
        row.status = String(params[0]);
        row.reason = params[1] as string | null;
        return [{ organization_id: row.organization_id }];
      }
      if (sql.includes("SET email_sent_at")) {
        row.email_sent_at = "sent";
        return [];
      }
      return [{ ...row }];
    },
  },
}));
mock.module("@erp_virujhealth/auth", () => ({
  getCentralApiPermissions: () => [],
}));
mock.module("@erp_virujhealth/auth/access-review", () => ({
  clientIp: () => "127.0.0.1",
  takeRequestLimit: async () => true,
  sendReviewEmail: async (
    _email: string,
    _subject: string,
    text: string,
    html?: string
  ) => {
    sentEmail = { text, html };
    if (mailFails) throw new Error("Delivery failed");
    delivered++;
  },
}));
const { registerReviewAdminRoutes } = await import("./review-admin");
const realFetch = globalThis.fetch;
let cookie = "";
function app() {
  const a = new Hono();
  registerReviewAdminRoutes(a);
  return a;
}
async function post(
  path: string,
  body: object,
  origin = "https://admin.virujhealth.com"
) {
  return app().request(`/auth/review-admin${path}`, {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify(body),
  });
}
beforeEach(async () => {
  row = {
    ...row,
    status: "pending",
    revision: 1,
    reason: null,
    email_sent_at: null,
  };
  mailFails = false;
  delivered = 0;
  sentEmail = null;
  listQuery = "";
  cookie = "";
  globalThis.fetch = (async () =>
    new Response("{}", { status: 200 })) as unknown as typeof fetch;
  const login = await post("/login", {
    id: "reviewer",
    password: "correct-test-password",
  });
  expect(login.status).toBe(200);
  cookie = login.headers.get("set-cookie")!.split(";")[0]!;
});
test("administrator sessions are required and normal ERP origin cannot make decisions", async () => {
  expect(
    (
      await app().request("/auth/review-admin/requests", {
        headers: { Origin: "https://admin.virujhealth.com" },
      })
    ).status
  ).toBe(401);
  expect(
    (
      await post(
        "/requests/org/decision",
        { status: "approved", revision: 1 },
        "https://erp.virujhealth.com"
      )
    ).status
  ).toBe(403);
  expect(
    (await post("/login", { id: "reviewer", password: "wrong" })).status
  ).toBe(401);
});
test("approval sends access once, while repeated and stale decisions conflict", async () => {
  expect(
    (await post("/requests/org/decision", { status: "approved", revision: 1 }))
      .status
  ).toBe(200);
  expect(row.status).toBe("approved");
  expect(delivered).toBe(1);
  expect(sentEmail?.html).toContain('href="https://erp.virujhealth.com/auth"');
  expect(sentEmail?.html).toContain("Sign in to Viruj Health");
  expect(sentEmail?.text).toContain("existing email and password");
  expect(JSON.stringify(sentEmail)).not.toContain("magic-link");
  expect(JSON.stringify(sentEmail)).not.toContain("token=");
  expect(
    (
      await post("/requests/org/decision", {
        status: "rejected",
        revision: 1,
        reason: "Wrong",
      })
    ).status
  ).toBe(409);
  row.status = "pending";
  row.revision = 2;
  expect(
    (await post("/requests/org/decision", { status: "approved", revision: 1 }))
      .status
  ).toBe(409);
});

test("approved and rejected applications move from requests to logs", async () => {
  async function list(view: string) {
    const response = await app().request(
      `/auth/review-admin/requests?view=${view}`,
      {
        headers: { Origin: "https://admin.virujhealth.com", Cookie: cookie },
      }
    );
    expect(response.status).toBe(200);
    return response.json();
  }
  for (const status of ["approved", "rejected"]) {
    row.status = "pending";
    expect(await list("requests")).toHaveLength(1);
    expect(listQuery).toContain("WHERE r.status='pending'");
    expect(await list("logs")).toHaveLength(0);
    expect(
      (
        await post("/requests/org/decision", {
          status,
          revision: 1,
          reason: "Correct the registration details.",
        })
      ).status
    ).toBe(200);
    expect(await list("requests")).toHaveLength(0);
    expect(await list("logs")).toMatchObject([
      { organization_id: "org", status },
    ]);
    expect(listQuery).toContain("ORDER BY r.reviewed_at DESC");
    expect(await list("logs")).toHaveLength(1);
  }
  row.status = "draft";
  expect(await list("requests")).toHaveLength(0);
  expect(await list("logs")).toHaveLength(0);
});
test("rejections require useful notes and failed mail leaves a retryable decision", async () => {
  expect(
    (
      await post("/requests/org/decision", {
        status: "rejected",
        revision: 1,
        reason: "",
      })
    ).status
  ).toBe(400);
  mailFails = true;
  expect(
    (
      await post("/requests/org/decision", {
        status: "rejected",
        revision: 1,
        reason: "Correct registration number.",
      })
    ).status
  ).toBe(502);
  expect(row.status).toBe("rejected");
  expect(row.email_sent_at).toBeNull();
  mailFails = false;
  expect((await post("/requests/org/resend", {})).status).toBe(200);
  expect(row.email_sent_at).toBe("sent");
  expect(delivered).toBe(1);
});
test("rejected applications receive a styled update email with safe review notes", async () => {
  const response = await post("/requests/org/decision", {
    status: "rejected",
    revision: 1,
    reason: "Check <registration> & certificate.",
  });
  expect(response.status).toBe(200);
  expect(sentEmail?.html).toContain("Update application");
  expect(sentEmail?.html).toContain(
    "Check &lt;registration&gt; &amp; certificate."
  );
  expect(sentEmail?.html).toContain('href="https://erp.virujhealth.com/auth"');
  expect(sentEmail?.text).toContain(
    "Your account and saved details are retained"
  );
  expect(JSON.stringify(sentEmail)).not.toContain("Viruj ERP");
});
import { afterAll } from "bun:test";
afterAll(() => {
  globalThis.fetch = realFetch;
});
