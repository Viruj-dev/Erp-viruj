"use client";

import { CheckCircle } from "lucide-react";
import { RoleDashboardPage } from "@/features/dashboard/components/shared/role-dashboard-page";
import {
  DoctorPageShell,
  HospitalPanel,
  StatusBadge,
} from "@/features/dashboard/components/doctor/_components/doctor-shared-ui";

export function DoctorDashboardPage() {
  return <RoleDashboardPage tone="doctor" userName="Dr. Aris Thorne" />;
}
export function DoctorOnboardingCenterPage() {
  const steps = [
    ["Profile Completed", "Done", "Professional profile is ready."],
    ["Verification Submitted", "Done", "Documents submitted for review."],
    ["Verification Approved", "Pending", "Compliance approval is still required."],
    ["Practice Location Added", "Done", "Primary location is configured."],
    ["Availability Configured", "Pending", "Add recurring weekly slots."],
  ] as const;

  return (
    <DoctorPageShell eyebrow="Setup" title="Onboarding Center" subtitle="Complete the readiness checklist before opening the practice to patients.">
      <HospitalPanel title="Progress Tracker" subtitle="60% setup completion">
        <div className="mb-5 h-3 rounded-full bg-slate-100 dark:bg-white/[0.07]">
          <div className="h-3 w-[60%] rounded-full bg-primary dark:bg-blue-500" />
        </div>
        <div className="divide-y divide-slate-200/70 dark:divide-white/[0.07]">
          {steps.map((step, index) => (
            <div className="flex items-center gap-4 py-4" key={step[0]}>
              <span className={step[1] === "Done" ? "flex size-10 items-center justify-center rounded-xl bg-green-50 text-green-600" : "flex size-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600"}>
                {step[1] === "Done" ? <CheckCircle size={18} /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-950 dark:text-slate-100">{step[0]}</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">{step[2]}</p>
              </div>
              <StatusBadge status={step[1]} />
            </div>
          ))}
        </div>
      </HospitalPanel>
    </DoctorPageShell>
  );
}

