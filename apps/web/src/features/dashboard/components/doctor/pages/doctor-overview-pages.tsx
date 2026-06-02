"use client";

import { CalendarDays, CheckCircle, Clock, Plus, ShieldCheck, Users } from "lucide-react";
import { doctorPatients } from "@/features/dashboard/components/doctor/_components/doctor-mock-data";
import {
  CompactAppointmentList,
  DashboardHeroStat,
  DoctorPageShell,
  HospitalPanel,
  MetricCard,
  PatientRow,
  PrimaryAction,
  ReadinessRows,
  SecondaryAction,
  StatusBadge,
} from "@/features/dashboard/components/doctor/_components/doctor-shared-ui";

export function DoctorDashboardPage() {
  return (
    <div className="space-y-7 p-6 lg:p-4">
      <section className="overflow-hidden rounded-[2rem] bg-[#0f766e] p-6 text-white shadow-[0_24px_80px_rgba(15,118,110,0.24)] lg:p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-100/80">
              Individual Doctor Workspace
            </p>
            <h1 className="mt-4 max-w-3xl font-headline text-3xl font-semibold leading-tight tracking-tight lg:text-5xl">
              Dr. Aris Thorne, your practice is ready for today's clinical flow.
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-emerald-50/80">
              Review appointments, keep consultations moving, and watch profile readiness from one doctor ERP command center.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#0f766e] shadow-sm transition hover:bg-emerald-50" type="button">
                <Plus size={16} />
                Add Availability
              </button>
              <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/12 px-4 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/18" type="button">
                <CalendarDays size={16} />
                View Appointments
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white/12 p-5 ring-1 ring-white/18 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/70">
                  Profile Completion
                </p>
                <p className="mt-2 text-4xl font-bold">92%</p>
              </div>
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-[#0f766e]">
                <ShieldCheck size={24} />
              </span>
            </div>
            <div className="mt-6 h-3 rounded-full bg-white/20">
              <div className="h-3 w-[92%] rounded-full bg-white" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <DashboardHeroStat label="Appointments Today" value="12" />
              <DashboardHeroStat label="Patients Seen" value="08" />
              <DashboardHeroStat label="Pending Consults" value="07" />
              <DashboardHeroStat label="Verification" value="Approved" />
            </div>
          </div>
        </div>
      </section>



      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <HospitalPanel title="Today's Appointments" subtitle="Live operational queue">
          <CompactAppointmentList />
        </HospitalPanel>
        <HospitalPanel title="Profile Readiness" subtitle="Public profile and compliance">
          <ReadinessRows />
        </HospitalPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <HospitalPanel title="Recent Patients" subtitle="Latest patient activity">
          <div className="divide-y divide-slate-200/70 dark:divide-white/[0.07]">
            {doctorPatients.slice(0, 4).map((patient) => (
              <PatientRow
                key={patient[1]}
                initials={patient[5]}
                meta={`${patient[1]} | ${patient[2]}`}
                name={patient[0]}
                status={patient[4]}
                tone={patient[6]}
              />
            ))}
          </div>
        </HospitalPanel>
        <HospitalPanel title="Quick Actions" subtitle="Frequently used doctor workflows">
          <div className="grid gap-3 sm:grid-cols-2">
            {["Update Profile", "Upload Document", "Add Location", "Add Availability", "Start Consultation", "Open Settings"].map((label) => (
              <button
                className="flex h-20 items-center gap-3 rounded-xl bg-slate-100 px-4 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:bg-white/[0.1]"
                key={label}
                type="button"
              >
                <span className="rounded-lg bg-white p-2 text-primary shadow-sm dark:bg-white/[0.1] dark:text-blue-200">
                  <Plus size={16} />
                </span>
                {label}
              </button>
            ))}
          </div>
        </HospitalPanel>
      </div>
    </div>
  );
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
