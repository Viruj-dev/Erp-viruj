import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, Check, ClipboardCheck, Hospital, ShieldCheck, Sparkles } from "lucide-react";
import type { OnboardingKind } from "./types";

type OnboardingSuccessScreenProps = {
  completionPercentage: number;
  hospitalName: string;
  onContinue: () => void;
  kind?: OnboardingKind;
  summary: Array<{ label: string; value: string }>;
};

export function OnboardingSuccessScreen({
  completionPercentage,
  hospitalName,
  kind = "hospital",
  onContinue,
  summary,
}: OnboardingSuccessScreenProps) {
  return (
    <div className={cn("vh-onboarding min-h-screen bg-[var(--onboarding-page)] p-2 text-[var(--onboarding-text)] md:p-3", kind === "clinic" && "vh-onboarding--clinic")}>
      <div className="relative flex min-h-[calc(100vh-1rem)] items-center justify-center overflow-hidden rounded-[24px] border border-black/5 bg-[var(--onboarding-shell)] px-5 py-10 shadow-[0_28px_110px_rgba(0,0,0,0.22)] md:min-h-[calc(100vh-1.5rem)]">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute left-[10%] top-[14%] h-24 w-64 rounded-[28px] bg-[var(--onboarding-accent-soft)] blur-sm" />
          <div className="absolute right-[12%] top-[22%] h-44 w-80 rounded-[32px] bg-[var(--onboarding-accent-soft)] blur-md" />
          <div className="absolute bottom-[12%] left-[18%] h-36 w-[460px] rounded-[30px] bg-[var(--onboarding-panel-soft)] blur-sm" />
          <div className="absolute inset-x-[18%] top-[32%] h-64 rounded-[36px] bg-[var(--onboarding-accent-deep)] opacity-10 blur-xl" />
        </div>

        <motion.section
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-[520px] overflow-hidden rounded-[30px] border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] shadow-[0_34px_120px_rgba(15,23,42,0.24)]"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <div className="relative overflow-hidden vh-onboarding-gradient p-7 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.34),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_50%)]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-white/12 text-white/85 shadow-xl ring-1 ring-white/12">
                  <Sparkles size={24} />
                </div>
                <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/85">
                  Setup complete
                </span>
              </div>

              <h1 className="mt-7 text-3xl font-semibold leading-tight tracking-tight">
                Your organization has been successfully configured.
              </h1>
              <p className="mt-3 text-sm font-medium leading-6 text-white/80">
                {hospitalName} is ready for daily operations. Continue to the dashboard to manage daily operations and patient-facing details.
              </p>
            </div>
          </div>

          <div className="bg-[var(--onboarding-shell)] p-5">
            <div className="mb-4 grid gap-2 sm:grid-cols-3">
              <SuccessMetric
                icon={<ShieldCheck size={15} />}
                label="Completion"
                value={`${completionPercentage}%`}
              />
              <SuccessMetric
                icon={<ClipboardCheck size={15} />}
                label="Items saved"
                value={summary.length.toString()}
              />
              <SuccessMetric
                icon={<Hospital size={15} />}
                label="Workspace"
                value="Ready"
              />
            </div>

            <div className="mb-5 grid gap-2 rounded-2xl border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-3">
              {summary.slice(0, 4).map((item) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-xl bg-[var(--onboarding-panel-soft)] px-3 py-2 text-sm"
                  key={item.label}
                >
                  <span className="flex min-w-0 items-center gap-2 font-medium text-[var(--onboarding-muted)]">
                    <Check className="shrink-0 text-[var(--onboarding-accent)]" size={14} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="max-w-[160px] truncate text-right font-semibold text-[var(--onboarding-text)]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <button
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl vh-onboarding-gradient text-sm font-bold text-white shadow-[0_16px_34px_var(--onboarding-accent-shadow)] transition hover:-translate-y-0.5"
              onClick={onContinue}
              type="button"
            >
              Continue to dashboard
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function SuccessMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-3 shadow-sm">
      <div className="flex items-center gap-2 text-[var(--onboarding-accent)]">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--onboarding-muted)]">
          {label}
        </span>
      </div>
      <p className="mt-2 text-xl font-semibold text-[var(--onboarding-text)]">{value}</p>
    </div>
  );
}
