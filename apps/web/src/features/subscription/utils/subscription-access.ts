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
  if (
    member &&
    typeof member === "object" &&
    "permissions" in member &&
    Array.isArray(member.permissions)
  ) {
    return member.permissions.filter(
      (permission): permission is string => typeof permission === "string"
    );
  }

  return [];
}

export function hasFeature(entitlements: Iterable<string>, featureCode: string) {
  return new Set(entitlements).has(featureCode);
}