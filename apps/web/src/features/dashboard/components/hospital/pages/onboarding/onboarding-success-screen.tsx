"use client";
import { SubmitAccessReview } from "@/features/dashboard/components/shared/access-review-gate";
import { WorkspaceApprovalContext } from "@/features/dashboard/lib/workspace-approval";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import type { OnboardingKind } from "./types";
type OnboardingSuccessScreenProps = {
  completionPercentage: number;
  hospitalName: string;
  onContinue: () => void;
  kind?: OnboardingKind | "doctor";
  themeClassName?: string;
  summary: Array<{ label: string; value: string }>;
  notice?: string;
};
export function OnboardingSuccessScreen({
  onContinue,
}: OnboardingSuccessScreenProps) {
  const approvedOrganizationId = useContext(WorkspaceApprovalContext);
  if (approvedOrganizationId)
    return (
      <main className="grid min-h-svh place-items-center bg-background p-6 text-foreground">
        <section className="w-full max-w-lg space-y-5 rounded-2xl border bg-card p-8 text-card-foreground shadow-sm">
          <h1 className="text-2xl font-semibold">Your changes are saved</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Your workspace is already approved. You can continue to your
            dashboard.
          </p>
          <Button onClick={onContinue}>Go to dashboard</Button>
        </section>
      </main>
    );
  return <SubmitAccessReview />;
}
