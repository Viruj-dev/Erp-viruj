export function shouldStartOrganizationOnboarding(
  organization:
    | { id?: string; organizationType?: string; createdAt?: string | Date }
    | null
    | undefined,
  storage: Pick<Storage, "getItem">,
  now = Date.now()
) {
  if (
    !organization?.id ||
    !["hospital", "clinic"].includes(organization.organizationType ?? "")
  ) {
    return false;
  }

  const prefix = `viruj:${organization.organizationType}-onboarding`;
  if (storage.getItem(`${prefix}:start`) === "1") return true;
  if (storage.getItem(`${prefix}:completed:${organization.id}`)) return false;

  // Incomplete onboarding is pending for hospital and clinic workspaces
  // regardless of organization age. The gate no longer expires after two
  // hours, so a deep-linked workspace cannot skip setup just by waiting.
  return true;
}
