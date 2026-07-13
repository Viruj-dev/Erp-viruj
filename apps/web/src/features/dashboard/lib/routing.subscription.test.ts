import { describe, expect, test } from "bun:test";
import {
  canAccessSubscriptionPage,
  getAllowedDashboardPages,
  resolveAccessibleDashboardPage,
  subscriptionReadPermission,
} from "./routing";
import {
  getBillingPermissionsFromMember,
  hasBillingPermission,
  isCanonicalBillingPermission,
  subscriptionBillingPermissionNames,
} from "../../subscription/utils/subscription-access";

const ownerBillingPermissions = Array.from(subscriptionBillingPermissionNames);

describe("subscription dashboard access", () => {
  test("owner can access Plans & Subscription with subscription.read", () => {
    expect(canAccessSubscriptionPage(ownerBillingPermissions)).toBe(true);
    expect(
      getAllowedDashboardPages("OWNER", ownerBillingPermissions)
    ).toContain("subscription");
    expect(
      resolveAccessibleDashboardPage(
        "subscription",
        "OWNER",
        ownerBillingPermissions
      )
    ).toBe("subscription");
  });

  test("billing admin can access according to granted permissions", () => {
    expect(
      getAllowedDashboardPages("billing", [subscriptionReadPermission])
    ).toContain("subscription");
  });

  test("normal staff cannot access Plans & Subscription", () => {
    expect(getAllowedDashboardPages("STAFF", [])).not.toContain("subscription");
    expect(resolveAccessibleDashboardPage("subscription", "STAFF", [])).toBe(
      "dashboard"
    );
  });

  test("user without permission does not see sidebar item", () => {
    expect(getAllowedDashboardPages("OWNER", [])).not.toContain(
      "subscription"
    );
  });


  test("owner member without permission field still receives default billing grants", () => {
    const permissions = getBillingPermissionsFromMember({ role: "OWNER" });

    expect(permissions).toContain("subscription.read");
    expect(getAllowedDashboardPages("OWNER", permissions)).toContain(
      "subscription"
    );
  });

  test("explicit empty permission array keeps Payments hidden", () => {
    const permissions = getBillingPermissionsFromMember({
      permissions: [],
      role: "OWNER",
    });

    expect(permissions).toEqual([]);
    expect(getAllowedDashboardPages("OWNER", permissions)).not.toContain(
      "subscription"
    );
  });
  test("permission-name mismatch is rejected by client helpers", () => {
    expect(hasBillingPermission(["billing.subscription.read"], "subscription.read"))
      .toBe(false);
    expect(isCanonicalBillingPermission("billing.subscription.read")).toBe(false);
    expect(isCanonicalBillingPermission("subscriptions.read")).toBe(false);
    expect(isCanonicalBillingPermission("subscription.read")).toBe(true);
  });
});