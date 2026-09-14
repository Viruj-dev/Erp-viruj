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

  const createdTime = organization.createdAt
    ? new Date(organization.createdAt).getTime()
    : 0;
  return createdTime > 0 && now - createdTime < 2 * 60 * 60 * 1000;
}
