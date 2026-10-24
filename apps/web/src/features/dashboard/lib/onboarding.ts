export type OnboardingOrganizationLike =
  | {
      id?: string;
      organizationType?: string;
    }
  | null
  | undefined;

export type OnboardingStatusReport = {
  organizationId?: string;
  providerType?: string;
  onboardingCompleted?: boolean;
  hospitalOrClinicCompleted?: boolean;
  diagnosticsCompleted?: boolean;
  source?: string;
} | null;

export type OnboardingStatusReporter = () => Promise<OnboardingStatusReport>;

export async function resolveOrganizationOnboardingGate(
  organization: OnboardingOrganizationLike,
  fetchStatus: OnboardingStatusReporter
): Promise<boolean> {
  if (
    !organization?.id ||
    !["hospital", "clinic"].includes(organization.organizationType ?? "")
  )
    return false;

  const status = await fetchStatus();
  const completed =
    status?.onboardingCompleted ?? status?.hospitalOrClinicCompleted;
  if (
    status?.organizationId !== organization.id ||
    (status.providerType &&
      status.providerType !== organization.organizationType) ||
    typeof completed !== "boolean"
  ) {
    throw new Error("Unable to verify organization setup. Please try again.");
  }
  return !completed;
}

export function shouldRedirectDiagnosticOnboarding(
  page: string,
  completedAt: unknown
) {
  return page !== "onboarding" && !completedAt;
}
