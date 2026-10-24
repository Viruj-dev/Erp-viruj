type ReviewWorkspace = {
  id: string;
  slug: string;
  organizationType?: string | null;
};

export function resolveReviewWorkspace(
  session: unknown,
  activeOrganization: ReviewWorkspace | null | undefined
): ReviewWorkspace | null {
  if (
    session &&
    typeof session === "object" &&
    "activeOrganization" in session
  ) {
    const org = session.activeOrganization;
    if (
      org &&
      typeof org === "object" &&
      "id" in org &&
      typeof org.id === "string" &&
      "slug" in org &&
      typeof org.slug === "string"
    )
      return {
        id: org.id,
        slug: org.slug,
        organizationType:
          "organizationType" in org && typeof org.organizationType === "string"
            ? org.organizationType
            : null,
      };
  }
  return activeOrganization ?? null;
}
