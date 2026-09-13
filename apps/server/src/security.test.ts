import { afterEach, beforeEach, expect, mock, spyOn, test } from "bun:test";
import { Hono } from "hono";

// Use inert configuration; all database operations below are intercepted.
Bun.env.DATABASE_URL = "postgres://test:test@localhost:5432/viruj_test";
Bun.env.BETTER_AUTH_SECRET = "test-secret-for-security-regressions";
Bun.env.BETTER_AUTH_URL = "http://localhost:3002/auth";
Bun.env.CORS_ORIGIN = "http://localhost:3001";
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
const transaction = mock(async (callback: (tx: unknown) => Promise<unknown>) =>
  callback(db)
);

beforeEach(() => {
  selectResults = [];
  createdOrganization = [];
  memberFailure = false;
  writes.length = 0;
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
      where: () => query,
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
