import { expect, test, mock } from "bun:test";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
Bun.env.DATABASE_URL = "postgres://test:test@localhost/test";
Bun.env.BETTER_AUTH_SECRET = "test-secret-at-least-thirty-two-characters";
Bun.env.BETTER_AUTH_URL = "http://localhost:3002";
Bun.env.CORS_ORIGIN = "http://localhost:3001";
Bun.env.CENTRAL_API_JWT_SECRET = "test-central-api-secret-at-least-thirty-two";
Bun.env.NODE_ENV = "test";
let count = 0;
let queryParameters: unknown[] = [];
let reviews: { status: string }[] = [];
mock.module("@erp_virujhealth/db", () => ({
  db: {
    execute: async (query: SQL) => {
      const compiled = new PgDialect().sqlToQuery(query);
      queryParameters = compiled.params;
      if (compiled.sql.startsWith("SELECT r.status")) return reviews;
      return count < 20 ? [{ count: ++count }] : [];
    },
  },
}));
const { limitWindow, clientIp, takeRequestLimit, requireReviewedSignIn } =
  await import("./access-review");
test("signup days reset at midnight in India", () => {
  expect(
    limitWindow(Date.parse("2026-10-24T18:29:59Z"), 86400).toISOString()
  ).toBe("2026-10-23T18:30:00.000Z");
  expect(
    limitWindow(Date.parse("2026-10-24T18:30:00Z"), 86400).toISOString()
  ).toBe("2026-10-24T18:30:00.000Z");
});

test("rate-limit timestamps use the string representation required by the PostgreSQL driver", async () => {
  count = 0;
  await takeRequestLimit("admin:127.0.0.1", 5, 900);
  expect(typeof queryParameters[1]).toBe("string");
  expect(Number.isFinite(Date.parse(String(queryParameters[1])))).toBe(true);
});
test("the twenty-first signup attempt is denied", async () => {
  count = 0;
  for (let i = 0; i < 20; i++)
    expect(await takeRequestLimit("signup:127.0.0.1", 20, 86400)).toBe(true);
  expect(await takeRequestLimit("signup:127.0.0.1", 20, 86400)).toBe(false);
});
test("development fallback ignores untrusted forwarded IP headers", () => {
  expect(clientIp(new Headers({ "x-forwarded-for": "198.51.100.1" }))).toBe(
    "127.0.0.1"
  );
});

test("pending review blocks sign-in, while approved and unfinished applications can sign in", async () => {
  reviews = [{ status: "pending" }];
  await expect(requireReviewedSignIn("pending-user")).rejects.toMatchObject({
    status: "FORBIDDEN",
    body: { code: "ACCESS_REVIEW_PENDING" },
  });
  expect(queryParameters).toEqual(["pending-user"]);
  for (const statuses of [
    [],
    ["approved"],
    ["rejected"],
    ["draft"],
    ["pending", "approved"],
  ]) {
    reviews = statuses.map((status) => ({ status }));
    await expect(requireReviewedSignIn("user")).resolves.toBeUndefined();
  }
});
