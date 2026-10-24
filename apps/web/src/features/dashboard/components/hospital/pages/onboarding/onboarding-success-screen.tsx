"use client";
import { SubmitAccessReview } from "@/features/dashboard/components/shared/access-review-gate";
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
export function OnboardingSuccessScreen(_props: OnboardingSuccessScreenProps) {
  return <SubmitAccessReview />;
}
