import { describe, expect, test } from "bun:test";
import type { SubscriptionBillingPermissionName } from "./index";

Bun.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/viruj_test";
Bun.env.BETTER_AUTH_SECRET ??= "test-secret-for-rbac-permission-tests";
Bun.env.BETTER_AUTH_URL ??= "http://localhost:3001/auth";
Bun.env.CORS_ORIGIN ??= "http://localhost:3001";
Bun.env.CENTRAL_API_JWT_SECRET ??= "test-central-api-jwt-secret-32-bytes";

const authModule = import("./index");

const expectedBillingPermissions = [
  "subscription.read",
  "subscription.change_plan",
  "subscription.cancel",
  "subscription.reactivate",
  "billing.profile.read",
  "billing.profile.update",
  "billing.invoices.read",
  "billing.invoices.download",
  "billing.transactions.read",
  "billing.payment_methods.read",
  "billing.payment_methods.manage",
  "billing.refunds.read",
] as const satisfies readonly SubscriptionBillingPermissionName[];

describe("subscription billing RBAC", () => {
  test("owner and super-admin roles receive subscription permissions", async () => {
    const { getOrganizationPermissions, hasOrganizationPermission } =
      await authModule;

    for (const role of ["OWNER", "owner", "ADMIN", "ORG_ADMIN", "admin"]) {
      expect(getOrganizationPermissions(role)).toEqual(
        Array.from(expectedBillingPermissions)
      );
      expect(
        hasOrganizationPermission(role, { subscription: ["read"] })
      ).toBe(true);
    }
  });

  test("billing admin can access according to granted permissions", async () => {
    const { getOrganizationPermissions } = await authModule;
    const permissions = getOrganizationPermissions("billing");

    expect(permissions).toContain("subscription.read");
    expect(permissions).toContain("subscription.change_plan");
    expect(permissions).toContain("billing.invoices.download");
    expect(permissions).toContain("billing.payment_methods.manage");
  });

  test("normal staff cannot access subscription billing permissions", async () => {
    const { getOrganizationPermissions, hasOrganizationPermission } =
      await authModule;

    expect(getOrganizationPermissions("STAFF")).toEqual([]);
    expect(
      hasOrganizationPermission("STAFF", { subscription: ["read"] })
    ).toBe(false);
  });

  test("stale token refresh obtains newly assigned permissions", async () => {
    const { getOrganizationPermissions } = await authModule;
    const staleTokenPermissions: string[] = [];
    const refreshedSessionPermissions = getOrganizationPermissions("OWNER");

    expect(staleTokenPermissions).not.toContain("subscription.read");
    expect(refreshedSessionPermissions).toContain("subscription.read");
    expect(refreshedSessionPermissions).toContain("billing.profile.update");
  });

  test("permission-name mismatch cannot occur in canonical billing list", async () => {
    const { subscriptionBillingPermissionNames } = await authModule;

    expect(subscriptionBillingPermissionNames).toEqual(
      Array.from(expectedBillingPermissions)
    );
    expect(subscriptionBillingPermissionNames).not.toContain(
      "billing.subscription.read" as SubscriptionBillingPermissionName
    );
    expect(subscriptionBillingPermissionNames).not.toContain(
      "subscriptions.read" as SubscriptionBillingPermissionName
    );
  });
});
