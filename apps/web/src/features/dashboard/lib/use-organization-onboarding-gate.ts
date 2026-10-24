import { useWorkspaceApproved } from "./workspace-approval";
import { useEffect, useMemo, useState } from "react";
import {
  resolveOrganizationOnboardingGate,
  type OnboardingOrganizationLike,
  type OnboardingStatusReporter,
} from "./onboarding";
import { virujBackend } from "@/lib/viruj-backend";

export type OrganizationOnboardingGateState =
  | "pending"
  | "start"
  | "skip"
  | "error";

// An unavailable backend shows a retry state instead of trusting browser storage.
const statusTimeoutMs = 7_000;

function statusReporterFor(organizationId: string): OnboardingStatusReporter {
  return async () => {
    try {
      // 404 / network failure inside the reporter resolve to null, which
      // `resolveOrganizationOnboardingGate` treats as an unknown backend state.
      return await Promise.race([
        virujBackend.onboardingStatus.status(organizationId),
        new Promise<null>((resolve) => {
          window.setTimeout(() => resolve(null), statusTimeoutMs);
        }),
      ]);
    } catch {
      return null;
    }
  };
}

/**
 * Subscribes the current decision of the organization onboarding completion
 * gate. Unknown status shows a retry state; browser markers never unlock it.
 */
export function useOrganizationOnboardingGate(
  organizationId: string | null | undefined,
  organizationType: string | null | undefined,
  enabled: boolean
): OrganizationOnboardingGateState {
  const approved = useWorkspaceApproved(organizationId);
  // Memoized so a session refetch that resolves the same workspace does not
  // re-run the effect (and re-fetch the status).
  const organization = useMemo<OnboardingOrganizationLike>(
    () =>
      organizationId && organizationType
        ? { id: organizationId, organizationType }
        : null,
    [organizationId, organizationType]
  );

  const [state, setState] =
    useState<OrganizationOnboardingGateState>("pending");

  useEffect(() => {
    if (approved || !enabled || !organization?.id) {
      setState("pending");
      return;
    }

    let cancelled = false;
    setState("pending");

    resolveOrganizationOnboardingGate(
      organization,
      statusReporterFor(organization.id)
    )
      .then((start) => {
        if (!cancelled) setState(start ? "start" : "skip");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [approved, enabled, organization]);

  return approved ? "skip" : state;
}
