"use client";

import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck } from "lucide-react";
import { virujBackend } from "@/lib/viruj-backend";
import {
  diagnosticSetupKey,
  needsDiagnosticProfileCompletion,
} from "@/features/dashboard/lib/diagnostic-onboarding";
import {
  mergeOnboardingState,
  validateStep,
} from "../../hospital/pages/onboarding/state";

export function CompleteProfileOption({
  organizationId,
  kind,
  collapsed,
  onContinue,
}: {
  organizationId: string;
  kind: "hospital" | "clinic" | "pathology" | "radiology";
  collapsed: boolean;
  onContinue: () => void;
}) {
  const diagnostic = kind === "pathology" || kind === "radiology";
  const setup = useQuery({
    queryKey: diagnosticSetupKey(organizationId),
    queryFn: () => virujBackend.diagnostics.onboarding(organizationId),
    enabled: diagnostic,
    retry: false,
  });
  const workspace = useQuery({
    queryKey: ["viruj-backend", "workspace-profile", organizationId],
    queryFn: () => virujBackend.directory.workspace(organizationId),
    enabled: !diagnostic,
    retry: false,
  });
  const incomplete = diagnostic
    ? setup.isSuccess && needsDiagnosticProfileCompletion(setup.data, kind)
    : workspace.isSuccess &&
      Boolean(
        validateStep(
          "review",
          mergeOnboardingState(workspace.data.data, undefined, kind),
          kind
        )
      );

  if (!incomplete) return null;
  return (
    <Button
      variant="outline"
      className="h-auto min-h-10 w-full justify-start gap-2 whitespace-normal border-amber-200 bg-amber-50 px-3 py-2.5 text-left text-xs text-amber-950 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
      onClick={() => {
        if (!diagnostic && workspace.data) {
          const prefix = `viruj:${kind}-onboarding`;
          const draftKey = `${prefix}:draft:${organizationId}`;
          if (!window.localStorage.getItem(draftKey)) {
            window.localStorage.setItem(
              draftKey,
              JSON.stringify({
                data: mergeOnboardingState(
                  workspace.data.data,
                  undefined,
                  kind
                ),
                currentStepIndex: 0,
                completedSteps: [],
              })
            );
          }
          window.sessionStorage.setItem(
            `${prefix}:entry:${organizationId}`,
            "1"
          );
        }
        onContinue();
      }}
      aria-label="Complete your profile"
      title="Complete your profile"
    >
      <ClipboardCheck className="size-4 shrink-0" aria-hidden="true" />
      {!collapsed && <span>Complete your profile</span>}
    </Button>
  );
}
