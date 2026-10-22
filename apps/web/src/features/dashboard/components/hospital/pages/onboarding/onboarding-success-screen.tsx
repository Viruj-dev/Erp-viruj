import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/erp/card";
import { cn } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";
import type { OnboardingKind } from "./types";

type OnboardingSuccessScreenProps = {
  completionPercentage: number;
  hospitalName: string;
  onContinue: () => void;
  kind?: OnboardingKind | "doctor";
  themeClassName?: string;
  summary: Array<{ label: string; value: string }>;
};

export function OnboardingSuccessScreen({
  hospitalName,
  kind = "hospital",
  onContinue,
  summary,
  themeClassName,
}: OnboardingSuccessScreenProps) {
  return (
    <main
      className={cn(
        "vh-onboarding flex min-h-svh items-center justify-center bg-[var(--onboarding-page)] px-5 py-12 text-[var(--onboarding-text)]",
        kind === "clinic" && "vh-onboarding--clinic",
        kind === "doctor" && "vh-onboarding--doctor",
        themeClassName
      )}
    >
      <Card className="w-full max-w-[560px] gap-0 overflow-hidden rounded-2xl border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] py-0 text-[var(--onboarding-text)] shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
        <CardHeader className="gap-0 px-6 pb-8 pt-8 sm:px-10 sm:pt-10">
          <div
            className="mb-8 flex items-center gap-2.5 text-sm font-medium text-[var(--onboarding-accent)]"
            role="status"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--onboarding-accent-soft)]">
              <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
            </span>
            Setup complete
          </div>
          <h1 className="break-words text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {hospitalName}
          </h1>
          <p className="mt-2 text-lg text-[var(--onboarding-muted)]">
            Your workspace is ready.
          </p>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--onboarding-muted)]">
            Your details are saved. Open your dashboard to start managing your
            organization.
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-8 sm:px-10">
          <dl className="divide-y divide-[var(--onboarding-border)] border-y border-[var(--onboarding-border)]">
            {summary.map((item) => (
              <div
                key={item.label}
                className="grid gap-1 py-4 text-sm sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-5"
              >
                <dt className="text-[var(--onboarding-muted)]">{item.label}</dt>
                <dd className="min-w-0 break-words font-medium sm:text-right">
                  {item.value || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-3 px-6 pb-8 sm:px-10 sm:pb-10">
          <Button
            className="h-12 w-full justify-between rounded-lg bg-[var(--onboarding-accent)] px-4 text-sm font-medium text-white shadow-none hover:bg-[var(--onboarding-accent-deep)]"
            onClick={onContinue}
            type="button"
          >
            Open dashboard
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <p className="text-center text-xs leading-5 text-[var(--onboarding-muted)]">
            You can update these details from your dashboard.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
