import { afterEach, beforeEach, expect, mock, spyOn, test } from "bun:test";
import { Hono } from "hono";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";

// Use inert configuration; all database operations below are intercepted.
Bun.env.DATABASE_URL = "postgres://test:test@localhost:5432/viruj_test";
Bun.env.BETTER_AUTH_SECRET = "test-secret-for-security-regressions";
Bun.env.BETTER_AUTH_URL = "http://localhost:3002/auth";
Bun.env.CORS_ORIGIN = "http://localhost:3001";
Bun.env.ERP_WEB_URL = "http://localhost:3001";
Bun.env.CENTRAL_API_JWT_SECRET = "test-central-api-jwt-secret-32-bytes";

const { auth } = await import("@erp_virujhealth/auth");
const { db } = await import("@erp_virujhealth/db");
const { member, organization } =
  await import("@erp_virujhealth/db/schema/auth");
const { createApp } = await import("./app/create-app");
const { registerHttpMiddleware } = await import("./middleware/http");
const { handleServerError } = await import("./middleware/error-handler");

let selectResults: unknown[][];
let session: unknown;
let createdOrganization: unknown[];
let memberFailure: boolean;
const writes: Array<{ table: unknown; values: Record<string, unknown> }> = [];
const selectParameters: unknown[][] = [];
const transaction = mock(async (callback: (tx: unknown) => Promise<unknown>) =>
  callback(db)
);

beforeEach(() => {
  spyOn(db, "execute").mockResolvedValue([{ status: "approved" }] as never);
  selectResults = [];
  createdOrganization = [];
  memberFailure = false;
  writes.length = 0;
  selectParameters.length = 0;
  transaction.mockClear();
  session = {
    user: { id: "attacker", name: "Test", email: "test@example.test" },
    session: { id: "session-id", token: "test-token" },
    activeOrganization: { id: "hospital-id", organizationType: "hospital" },
    activeMember: { role: "STAFF" },
  };
  spyOn(auth.api, "getSession").mockImplementation(
    (async () => session) as typeof auth.api.getSession
  );
  spyOn(db, "select").mockImplementation((() => {
    const rows = selectResults.shift() ?? [];
    const query = {
      from: () => query,
      innerJoin: () => query,
      where: (predicate: SQL) => {
        selectParameters.push(new PgDialect().sqlToQuery(predicate).params);
        return query;
      },
      limit: async () => rows,
      orderBy: async () => rows,
    };
    return query;
  }) as unknown as typeof db.select);
  spyOn(db, "insert").mockImplementation(((table: unknown) => ({
    values: (values: Record<string, unknown>) => {
      writes.push({ table, values });
      if (table === member && memberFailure) {
        throw new Error("private database connection details");
      }
      return {
        onConflictDoNothing: () => ({
          returning: async () => createdOrganization,
        }),
      };
    },
  })) as unknown as typeof db.insert);
  spyOn(db, "update").mockImplementation(((table: unknown) => ({
    set: (values: Record<string, unknown>) => {
      writes.push({ table, values });
      return { where: async () => [] };
    },
  })) as unknown as typeof db.update);
  spyOn(db, "delete").mockImplementation(() => {
    throw new Error("Unexpected delete");
  });
  spyOn(db, "transaction").mockImplementation(
    transaction as typeof db.transaction
  );
  spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => mock.restore());

test("pending applicants get no sign-in session and review status is checked only after password verification", async () => {
  const context = await auth.$context;
  const now = new Date();
  spyOn(context.internalAdapter, "findUserByEmail").mockResolvedValue({
    user: {
      id: "pending-user",
      email: "pending@example.test",
      name: "Pending",
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    },
    accounts: [
      {
        id: "account",
        userId: "pending-user",
        accountId: "pending-user",
        providerId: "credential",
        password: "test-hash",
        createdAt: now,
        updatedAt: now,
      },
    ],
  });
  const verify = spyOn(context.password, "verify").mockResolvedValue(true);
  const review = spyOn(db, "execute").mockResolvedValue([
    { status: "pending" },
  ] as never);
  const insert = spyOn(db, "insert");
  const signIn = () =>
    auth.handler(
      new Request("http://localhost:3002/auth/sign-in/email", {
        method: "POST",
        headers: {
          Origin: "http://localhost:3001",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "pending@example.test",
          password: "test-password",
        }),
      })
    );
  const response = await signIn();
  expect(response.status).toBe(403);
  expect(await response.json()).toMatchObject({
    code: "ACCESS_REVIEW_PENDING",
  });
  expect(response.headers.has("set-cookie")).toBe(false);
  expect(insert).not.toHaveBeenCalled();
  review.mockClear();
  verify.mockResolvedValue(false);
  const invalid = await signIn();
  expect(invalid.status).toBe(401);
  expect(await invalid.json()).not.toHaveProperty(
    "code",
    "ACCESS_REVIEW_PENDING"
  );
  expect(review).not.toHaveBeenCalled();
});

function bootstrap() {
  return createApp().request("/auth/bootstrap-organization", {
    method: "POST",
    headers: {
      Origin: "http://localhost:3001",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      slug: "victim-hospital",
      organizationType: "hospital",
    }),
  });
}

test("bootstrap cannot grant ownership when a slug already exists or loses an insert race", async () => {
  // No membership, and INSERT ... ON CONFLICT returns no newly created row.
  selectResults = [
    [],
    [{ organizationId: "victim-id", organizationType: "hospital" }],
  ];
  const response = await bootstrap();
  expect(response.status).toBe(409);
  expect(transaction).toHaveBeenCalledTimes(1);
  expect(writes.map((write) => write.table)).toEqual([organization]);
});

test("bootstrap creates owner membership only for the newly created organization", async () => {
  createdOrganization = [
    { organizationId: "new-id", organizationType: "hospital" },
  ];
  const response = await bootstrap();
  expect(response.status).toBe(200);
  expect(transaction).toHaveBeenCalledTimes(1);
  expect(writes.find((write) => write.table === member)?.values).toMatchObject({
    organizationId: "new-id",
    userId: "attacker",
    role: "OWNER",
  });
  expect(await response.json()).toEqual({
    id: "new-id",
    organizationType: "hospital",
  });
});

test("bootstrap keeps an existing membership without elevating its role", async () => {
  selectResults = [
    [{ organizationId: "existing-id", organizationType: "hospital" }],
  ];
  expect((await bootstrap()).status).toBe(200);
  expect(transaction).not.toHaveBeenCalled();
  expect(writes.some((write) => write.table === member)).toBe(false);
});

test("one email retains four provider roles and tokens follow only the selected workspace", async () => {
  const { jwtVerify } = await import("jose");
  const app = createApp();
  const providerTypes = ["hospital", "clinic", "pathology", "radiology"];
  for (const type of providerTypes) {
    selectResults = [[]];
    createdOrganization = [
      { organizationId: `${type}-id`, organizationType: type },
    ];
    const created = await app.request("/auth/bootstrap-organization", {
      method: "POST",
      headers: {
        Origin: "http://localhost:3001",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `My ${type}`,
        slug: `${type}-test`,
        organizationType: type,
      }),
    });
    expect(created.status).toBe(200);
    expect(selectParameters.at(-1)).toEqual(["attacker", type]);
  }
  const memberships = writes.filter((write) => write.table === member);
  expect(memberships).toHaveLength(4);
  expect(memberships.map((write) => write.values.userId)).toEqual(
    Array(4).fill("attacker")
  );
  expect(
    new Set(memberships.map((write) => write.values.organizationId)).size
  ).toBe(4);
  for (const type of providerTypes) {
    selectResults = [
      [{ organizationId: `${type}-id`, organizationType: type }],
    ];
    const activated = await app.request("/auth/activate-organization", {
      method: "POST",
      headers: {
        Origin: "http://localhost:3001",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ organizationId: `${type}-id` }),
    });
    expect(activated.status).toBe(200);
    expect(selectParameters.at(-1)).toEqual([`${type}-id`, "attacker"]);
    expect(writes.at(-1)?.values).toEqual({
      activeOrganizationId: `${type}-id`,
    });
    (session as { activeOrganization: unknown }).activeOrganization = {
      id: `${type}-id`,
      organizationType: type,
    };
    selectResults = [
      [{ organizationId: `${type}-id`, organizationType: type, role: "OWNER" }],
    ];
    const response = await app.request("/auth/central-api-token");
    expect(response.status).toBe(200);
    expect(selectParameters.at(-1)).toEqual([`${type}-id`, "attacker"]);
    const { token } = (await response.json()) as { token: string };
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(Bun.env.CENTRAL_API_JWT_SECRET)
    );
    expect(payload.sub).toBe("attacker");
    expect(payload.tenant_id).toBe(`${type}-id`);
    expect(payload.organization_type).toBe(type);
  }
  expect(writes.filter((write) => write.table === member)).toHaveLength(4);
});

test("provider switching cannot activate a workspace outside the account's memberships", async () => {
  selectResults = [[]];
  const response = await createApp().request("/auth/activate-organization", {
    method: "POST",
    headers: {
      Origin: "http://localhost:3001",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ organizationId: "someone-elses-workspace" }),
  });
  expect(response.status).toBe(403);
  expect(selectParameters.at(-1)).toEqual([
    "someone-elses-workspace",
    "attacker",
  ]);
  expect(writes).toHaveLength(0);
});

test("failed owner creation never activates the organization or leaks database errors", async () => {
  createdOrganization = [
    { organizationId: "new-id", organizationType: "hospital" },
  ];
  memberFailure = true;
  const response = await bootstrap();
  expect(response.status).toBe(500);
  expect(await response.text()).not.toContain("private database");
  expect(writes).toHaveLength(2);
});

test("staff cannot mutate or publish doctors through any route", async () => {
  for (const [method, path] of [
    ["POST", "/erp/doctors"],
    ["PATCH", "/erp/doctors/other-doctor"],
    ["DELETE", "/erp/doctors/other-doctor"],
    ["POST", "/erp/doctors/other-doctor/publish"],
    ["POST", "/erp/doctors/publish"],
  ]) {
    const response = await createApp().request(path!, {
      method,
      headers: { Origin: "http://localhost:3001" },
    });
    expect(response.status).toBe(403);
  }
  expect(writes).toHaveLength(0);
});

test("staff can read doctors, owners reach mutation validation, and unauthenticated users are denied", async () => {
  expect((await createApp().request("/erp/doctors")).status).toBe(200);
  (session as { activeMember: { role: string } }).activeMember.role = "OWNER";
  expect(
    (
      await createApp().request("/erp/doctors", {
        method: "POST",
        headers: { Origin: "http://localhost:3001" },
        body: "{}",
      })
    ).status
  ).toBe(400);
  session = null;
  expect((await createApp().request("/erp/doctors")).status).toBe(401);
  expect((await bootstrap()).status).toBe(401);
});

test("unsafe cross-origin and originless cookie requests stop before route execution", async () => {
  const app = new Hono();
  registerHttpMiddleware(app);
  let calls = 0;
  app.all("/mutation", (context) => {
    calls += 1;
    return context.text("ok");
  });
  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    for (const origin of [
      "https://attacker.example",
      "http://localhost:3001.evil.test",
      "null",
      undefined,
    ]) {
      const headers: Record<string, string> = {
        Cookie: "session=test",
        "Content-Type": "text/plain",
      };
      if (origin) headers.Origin = origin;
      expect((await app.request("/mutation", { method, headers })).status).toBe(
        403
      );
    }
  }
  expect(calls).toBe(0);
  for (const origin of ["http://localhost:3001", "http://localhost:3002"]) {
    expect(
      (
        await app.request("/mutation", {
          method: "POST",
          headers: { Cookie: "session=test", Origin: origin },
        })
      ).status
    ).toBe(200);
  }
  expect((await app.request("/mutation", { method: "POST" })).status).toBe(200);
  expect(calls).toBe(3);
});

test("errors are generic and central API tokens cannot be cached", async () => {
  const app = new Hono();
  app.onError(handleServerError);
  app.get("/error", () => {
    throw new Error("private database credentials");
  });
  const response = await app.request("/error");
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "Internal Server Error" });
  session = null;
  const tokenResponse = await createApp().request("/auth/central-api-token");
  expect(tokenResponse.headers.get("Cache-Control")).toBe("no-store");
});

test("doctor owner token carries doctor workspace identity and onboarding permissions", async () => {
  session = {
    user: { id: "doctor-owner" },
    activeOrganization: { id: "doctor-workspace", organizationType: "doctor" },
  };
  selectResults = [
    [
      {
        organizationId: "doctor-workspace",
        organizationType: "doctor",
        role: "OWNER",
      },
    ],
  ];
  const response = await createApp().request("/auth/central-api-token");
  expect(response.status).toBe(200);
  const { token } = (await response.json()) as { token: string };
  const { jwtVerify } = await import("jose");
  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(Bun.env.CENTRAL_API_JWT_SECRET),
    { issuer: "viruj-auth", audience: "viruj-central-api" }
  );
  expect(payload.organization_type).toBe("doctor");
  expect(payload.tenant_id).toBe("doctor-workspace");
  for (const permission of [
    "doctor.profile.read",
    "doctor.profile.update",
    "doctor.dashboard.read",
    "doctor.location.read",
    "doctor.verification.read",
    "doctor.verification.submit",
    "doctor.file.create",
  ])
    expect(payload.permissions).toContain(permission);
});

test("legacy access links lead to password login without creating a session", async () => {
  const handler = spyOn(auth, "handler").mockResolvedValue(
    new Response("unexpected authentication")
  );
  const response = await createApp().request(
    "/auth/magic-link/verify?token=old-link-token&callbackURL=https://untrusted.example"
  );
  expect(response.status).toBe(303);
  expect(response.headers.get("Location")).toBe("http://localhost:3001/auth");
  expect(response.headers.get("Set-Cookie")).toBeNull();
  expect(handler).not.toHaveBeenCalled();
  expect(
    (
      await createApp().request("/auth/sign-in/magic-link", {
        method: "POST",
        headers: { Origin: "http://localhost:3001" },
      })
    ).status
  ).toBe(410);
});

test("pending workspaces cannot use the legacy ERP routes", async () => {
  spyOn(db, "execute").mockResolvedValue([] as never);
  expect((await createApp().request("/erp/doctors")).status).toBe(403);
});

test("signup middleware refuses attempt twenty-one before account creation", async () => {
  const handler = spyOn(auth, "handler").mockImplementation(
    async () => new Response("account creation")
  );
  let attempts = 0;
  spyOn(db, "execute").mockImplementation((async () =>
    ++attempts <= 20
      ? [{ count: attempts }]
      : []) as unknown as typeof db.execute);
  const app = createApp();
  for (let attempt = 0; attempt < 20; attempt++) {
    expect(
      (
        await app.request("/auth/sign-up/email", {
          method: "POST",
          headers: { Origin: "http://localhost:3001" },
        })
      ).status
    ).toBe(200);
  }
  expect(
    (
      await app.request("/auth/sign-up/email", {
        method: "POST",
        headers: { Origin: "http://localhost:3001" },
      })
    ).status
  ).toBe(429);
  expect(handler).toHaveBeenCalledTimes(20);
});
