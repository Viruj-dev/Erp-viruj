export const subscriptionBillingPermissionNames = [
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
] as const;

export type BillingPermission =
  (typeof subscriptionBillingPermissionNames)[number];

const subscriptionBillingPermissionSet = new Set<string>(
  subscriptionBillingPermissionNames
);

const defaultSubscriptionBillingRoles = new Set([
  "OWNER",
  "CLINIC_OWNER",
  "ADMIN",
  "CLINIC_ADMIN",
  "MANAGER",
  "ORG_ADMIN",
  "owner",
  "admin",
  "billing",
  "manager",
]);
export function hasBillingPermission(
  permissions: readonly string[] | null | undefined,
  permission: BillingPermission
) {
  return permissions?.includes(permission) ?? false;
}

export function isCanonicalBillingPermission(
  permission: string
): permission is BillingPermission {
  return subscriptionBillingPermissionSet.has(permission);
}

export function getBillingPermissionsFromMember(member: unknown) {
  if (!member || typeof member !== "object") {
    return [];
  }

  if ("permissions" in member) {
    return Array.isArray(member.permissions)
      ? member.permissions.filter(
          (permission): permission is string => typeof permission === "string"
        )
      : [];
  }

  if (
    "role" in member &&
    typeof member.role === "string" &&
    defaultSubscriptionBillingRoles.has(member.role)
  ) {
    return Array.from(subscriptionBillingPermissionNames);
  }

  return [];
}

export function hasFeature(entitlements: Iterable<string>, featureCode: string) {
  return new Set(entitlements).has(featureCode);
}