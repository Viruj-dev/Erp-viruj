"use client";

import { doctorPatients } from "@/features/dashboard/components/doctor/_components/doctor-mock-data";
import {
  CompactAppointmentList,
  HospitalPanel,
  PatientRow,
  StatusBadge,
} from "@/features/dashboard/components/doctor/_components/doctor-shared-ui";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  Plus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";

export function ClinicDashboardPage({
  roleLabel,
  userName,
}: {
  roleLabel: string;
  userName: string;
}) {
  const displayName = userName || "Clinic Owner";

  return (
    <div className="space-y-7 p-6 lg:p-4">
      <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#3b146f_0%,#6d28d9_48%,#a855f7_100%)] p-6 text-white shadow-[0_28px_90px_rgba(109,40,217,0.34)] lg:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-fuchsia-300/28 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/35" />
        </div>

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-100/80">
              Independent Clinic Workspace
            </p>
            <h1 className="mt-4 max-w-3xl font-headline text-3xl font-semibold leading-tight tracking-tight lg:text-5xl">
              {displayName}, your clinic is ready for today's patient flow.
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-violet-50/82">
              Manage appointments, doctors, staff, clinic profile, and patient operations from one violet clinic ERP command center.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#5b21b6] shadow-sm transition hover:bg-violet-50" type="button">
                <Plus size={16} />
                Add Service
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
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/70">
                  Clinic Readiness
                </p>
                <p className="mt-2 text-4xl font-bold">88%</p>
              </div>
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-[#6d28d9]">
                <ShieldCheck size={24} />
              </span>
            </div>
            <div className="mt-6 h-3 rounded-full bg-white/20">
              <div className="h-3 w-[88%] rounded-full bg-white" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <ClinicHeroStat label="Appointments Today" value="24" />
              <ClinicHeroStat label="Doctors Active" value="06" />
              <ClinicHeroStat label="Open Requests" value="09" />
              <ClinicHeroStat label="Profile" value="Live" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <HospitalPanel title="Today's Appointments" subtitle="Live clinic queue">
          <CompactAppointmentList />
        </HospitalPanel>
        <HospitalPanel title="Clinic Readiness" subtitle="Profile and operations">
          <ClinicReadinessRows />
        </HospitalPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <HospitalPanel title="Recent Patients" subtitle="Latest clinic activity">
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
        <HospitalPanel title="Quick Actions" subtitle="Frequently used clinic workflows">
          <div className="grid gap-3 sm:grid-cols-2">
            {clinicActions.map((action) => (
              <button
                className="flex h-20 items-center gap-3 rounded-xl bg-violet-50 px-4 text-left text-sm font-semibold text-slate-800 transition hover:bg-violet-100 dark:bg-violet-400/[0.10] dark:text-slate-100 dark:hover:bg-violet-400/[0.16]"
                key={action.label}
                type="button"
              >
                <span className="rounded-lg bg-white p-2 text-[#6d28d9] shadow-sm dark:bg-white/[0.1] dark:text-violet-200">
                  {action.icon}
                </span>
                {action.label}
              </button>
            ))}
          </div>
        </HospitalPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <ClinicMetric
          icon={<CalendarDays size={18} />}
          label="Booked Today"
          value="24"
          status="+8 since morning"
        />
        <ClinicMetric
          icon={<Users size={18} />}
          label="Patient Check-ins"
          value="18"
          status="6 waiting"
        />
        <ClinicMetric
          icon={<Stethoscope size={18} />}
          label="Active Doctors"
          value="06"
          status="2 on break"
        />
        <ClinicMetric
          icon={<Sparkles size={18} />}
          label="Services Live"
          value="14"
          status="3 pending review"
        />
      </div>
    </div>
  );
}

const clinicActions = [
  { icon: <Plus size={16} />, label: "Add Service" },
  { icon: <CalendarDays size={16} />, label: "Book Appointment" },
  { icon: <Users size={16} />, label: "Invite Staff" },
  { icon: <Stethoscope size={16} />, label: "Add Doctor" },
  { icon: <ClipboardList size={16} />, label: "Review Requests" },
  { icon: <FileText size={16} />, label: "Open Reports" },
];

function ClinicHeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-100/70">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function ClinicReadinessRows() {
  return (
    <div className="space-y-2">
      <ClinicSettingsLine label="Verification Status" value="Under Review" />
      <ClinicSettingsLine label="Profile Completion" value="88%" />
      <ClinicSettingsLine label="Public Clinic Page" value="Enabled" />
      <ClinicSettingsLine label="Service Categories" value="14 live" />
    </div>
  );
}

function ClinicSettingsLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-violet-50 px-4 py-3 text-sm dark:bg-violet-400/[0.10]">
      <span className="font-semibold text-slate-600 dark:text-slate-400">{label}</span>
      <strong className="text-slate-950 dark:text-slate-100">{value}</strong>
    </div>
  );
}

function ClinicMetric({
  icon,
  label,
  status,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  status: string;
  value: string;
}) {
  return (
    <section className="rounded-2xl border border-violet-100 bg-white/85 p-5 shadow-sm dark:border-violet-400/[0.12] dark:bg-[#14171b]">
      <div className="flex items-center justify-between">
        <span className="rounded-xl bg-violet-50 p-2.5 text-[#6d28d9] dark:bg-violet-400/[0.12] dark:text-violet-200">
          {icon}
        </span>
        <StatusBadge status={status} />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-headline text-3xl font-semibold text-slate-950 dark:text-slate-100">
        {value}
      </p>
    </section>
  );
}
