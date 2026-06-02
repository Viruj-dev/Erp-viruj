"use client";

import {
  Activity,
  CalendarDays,
  FileText,
  LockKeyhole,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Zap,
} from "lucide-react";
import {
  departmentSplit,
  weeklyBookings,
} from "@/features/dashboard/components/shared/data";
import { MiniBarChart } from "@/features/dashboard/components/shared/charts/chart-primitives";

const roleModuleAccess: Record<string, string[]> = {
  ADMIN: [
    "Staff",
    "Appointments",
    "Patients",
    "Billing",
    "Community",
    "Schedules",
  ],
  APPOINTMENT_HANDLER: ["Appointments", "Patients", "Schedules"],
  COMMUNITY_MANAGER: ["Community", "Public profile"],
  DOCTOR: ["Appointments", "Patients", "Consultations", "Prescriptions"],
  MANAGER: ["Staff", "Appointments", "Patients", "Community", "Schedules"],
  ORG_ADMIN: [
    "Staff",
    "Appointments",
    "Patients",
    "Billing",
    "Community",
    "Schedules",
  ],
  OWNER: [
    "Staff",
    "Appointments",
    "Patients",
    "Billing",
    "Community",
    "Schedules",
  ],
  RECEPTIONIST: ["Appointments", "Patients", "Schedules"],
  STAFF: ["Appointments", "Patients"],
  TECHNICIAN: ["Diagnostics", "Patients", "Reports"],
};

export function ErpDemoDashboard({
  organizationLabel,
  roleLabel,
  userName,
}: {
  organizationLabel: string;
  roleLabel: string;
  userName: string;
}) {
  const normalizedRole = roleLabel.toUpperCase().replace(/\s+/g, "_");
  const modules =
    roleModuleAccess[normalizedRole] ?? roleModuleAccess.OWNER;

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-primary-container p-8 text-white shadow-[0_24px_80px_rgba(0,71,141,0.28)]">
          <p className="text-xs font-semi-bold uppercase tracking-[0.3em] text-white/70">
            Clinical command center
          </p>
          <h1 className="mt-4 max-w-xl font-headline text-4xl font-semi-bold leading-tight lg:text-5xl">
            {userName || "ERP Admin"}, your {organizationLabel.toLowerCase()}{" "}
            workspace is ready.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78">
            You are signed in as {formatRole(roleLabel)}. Use Staff to invite
            test users, switch roles, remove access, and verify audit logging.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <MetricChip label="Consults today" value="86" />
            <MetricChip label="Lab turnaround" value="41m" />
            <MetricChip label="Open escalations" value="04" />
          </div>
        </div>

        <div className="rounded-[2rem] border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b] dark:shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semi-bold uppercase tracking-[0.25em] text-on-surface-variant dark:text-slate-500">
                Acceptance rate
              </p>
              <h2 className="mt-2 font-headline text-2xl font-semi-bold text-on-surface dark:text-slate-100">
                Request efficiency
              </h2>
            </div>
            <ShieldCheck className="text-secondary" size={22} />
          </div>
          <div className="mt-6 rounded-2xl border border-primary/10 bg-primary-container/10 p-4 dark:border-white/[0.08] dark:bg-white/[0.06]">
            <p className="text-[11px] font-semi-bold uppercase tracking-[0.22em] text-primary dark:text-blue-300">
              Current actor
            </p>
            <p className="mt-3 font-headline text-2xl font-semi-bold text-on-surface dark:text-slate-100">
              {formatRole(roleLabel)}
            </p>
            <p className="mt-1 text-sm text-on-surface-variant dark:text-slate-400">
              Tenant: {organizationLabel}
            </p>
          </div>
          <div className="mt-5 space-y-2">
            {modules.map((module) => (
              <div
                className="flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2 text-sm font-semibold text-on-surface dark:bg-white/[0.06] dark:text-slate-200"
                key={module}
              >
                <LockKeyhole size={14} />
                {module}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          accent="bg-primary/10 text-primary"
          icon={<CalendarDays size={18} />}
          label="Total appointments"
          note="+12.5% over last 30 days"
          value="1,284"
        />
        <StatCard
          accent="bg-secondary/10 text-secondary"
          icon={<Activity size={18} />}
          label="Today's progress"
          note="42 of 60 visits completed"
          value="70%"
        />
        <StatCard
          accent="bg-error/10 text-error"
          icon={<FileText size={18} />}
          label="Pending approvals"
          note="4 urgent files need review"
          value="18"
        />
        <StatCard
          accent="bg-tertiary/10 text-tertiary"
          icon={<TrendingUp size={18} />}
          label="Revenue this week"
          note="Steady climb from OPD and imaging"
          value="$72k"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Panel
          eyebrow="Testing workflow"
          title="Auth and access checks"
          description="Use this sequence after creating an OWNER account."
        >
          <div className="space-y-3">
            <ActivityRow
              badge="1"
              detail="Create an organization from the auth page."
              title="Confirm owner lands in the selected workspace"
            />
            <ActivityRow
              badge="2"
              detail="Open Staff, invite ADMIN, DOCTOR, RECEPTIONIST, or TECHNICIAN."
              title="Copy the invitation ID from Pending Invitations"
            />
            <ActivityRow
              badge="3"
              detail="Sign out, accept invite, and verify navigation changes."
              title="Check Recent Audit for every staff action"
            />
          </div>
        </Panel>
        <Panel
          eyebrow="Weekly booking trends"
          title="Patient flow by day"
          description="The demo dashboard's primary chart translated to the Next app."
        >
          <MiniBarChart data={weeklyBookings} />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel
            eyebrow="Real-time activity"
            title="Current floor events"
            description="Recent patient and staff activity snapshots."
          >
            <div className="space-y-4">
              <ActivityRow
                badge="ARRIVED"
                detail="Today, 09:42 AM | Dr. Robertson"
                title="Sarah Jenkins checked in for Cardiology"
              />
              <ActivityRow
                badge="REVIEW"
                detail="Today, 09:15 AM | General wellness"
                title="New appointment request submitted by Mark Vance"
              />
              <ActivityRow
                badge="LAB"
                detail="Today, 08:48 AM | Main diagnostics"
                title="CBC and lipid panel released for Eleanor Harris"
              />
            </div>
          </Panel>
          <Panel
            eyebrow="Department split"
            title="Clinical mix"
            description="The main service distribution from the demo dataset."
          >
            <div className="space-y-4">
              {departmentSplit.map((item) => (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-on-surface dark:text-slate-200">
                      {item.name}
                    </span>
                    <span className="font-bold text-on-surface-variant dark:text-slate-400">
                      {item.value}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-high dark:bg-white/[0.08]">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: item.color,
                        width: `${item.value}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel
            eyebrow="Quick actions"
            title="Fast operations"
            description="Operational shortcuts from the demo shell."
          >
            <div className="grid grid-cols-2 gap-3">
              <QuickAction icon={<UserPlus size={18} />} label="Add Patient" />
              <QuickAction
                icon={<FileText size={18} />}
                label="Generate Report"
              />
              <QuickAction
                icon={<CalendarDays size={18} />}
                label="Staff Rota"
              />
              <QuickAction icon={<Activity size={18} />} label="Lab Order" />
            </div>
          </Panel>

          <div className="relative overflow-hidden rounded-[2rem] bg-secondary p-6 text-white shadow-[0_18px_50px_rgba(0,106,106,0.28)]">
            <div className="relative z-10">
              <p className="text-xs font-semi-bold uppercase tracking-[0.3em] text-white/65">
                Maintenance notice
              </p>
              <h1>Scheduled database window at 02:00 AM</h1>
              <h3 className="mt-3 font-headline text-2xl font-semi-bold">
                Scheduled database window at 02:00 AM
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/80">
                Backups will run overnight. Analytics exports and background
                syncs may respond more slowly during that period.
              </p>
            </div>
            <Zap
              className="absolute -bottom-6 -right-4 text-white/14"
              size={120}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function formatRole(role: string) {
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Panel({
  children,
  description,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="rounded-[2rem] border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b] dark:shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
      <p className="text-[11px] font-semi-bold uppercase tracking-[0.26em] text-on-surface-variant dark:text-slate-500">
        {eyebrow}
      </p>
      <h3 className="mt-3 font-headline text-2xl font-semi-bold text-on-surface dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-2 text-sm text-on-surface-variant dark:text-slate-400">
        {description}
      </p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function StatCard({
  accent,
  icon,
  label,
  note,
  value,
}: {
  accent: string;
  icon: React.ReactNode;
  label: string;
  note: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-outline-variant/25 bg-surface-container-lowest p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b] dark:shadow-[0_18px_48px_rgba(0,0,0,0.2)]">
      <div className="flex items-start justify-between">
        <div className={`rounded-2xl p-3 ${accent}`}>{icon}</div>
      </div>
      <p className="mt-5 text-[11px] font-semi-bold uppercase tracking-[0.22em] text-on-surface-variant dark:text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-headline text-4xl font-semi-bold text-on-surface dark:text-slate-100">
        {value}
      </p>
      <p className="mt-2 text-sm text-on-surface-variant dark:text-slate-400">
        {note}
      </p>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
      <p className="text-[11px] font-semi-bold uppercase tracking-[0.22em] text-white/65">
        {label}
      </p>
      <p className="mt-2 font-headline text-2xl font-semi-bold">{value}</p>
    </div>
  );
}

function LegendRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-medium text-on-surface dark:text-slate-200">
          {label}
        </span>
      </div>
      <span className="font-semi-bold text-on-surface dark:text-slate-100">
        {value}
      </span>
    </div>
  );
}

function ActivityRow({
  badge,
  detail,
  title,
}: {
  badge: string;
  detail: string;
  title: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[1.25rem] bg-surface-container-low p-4 dark:bg-white/[0.055]">
      <div>
        <p className="font-semibold text-on-surface dark:text-slate-100">
          {title}
        </p>
        <p className="mt-1 text-sm text-on-surface-variant dark:text-slate-400">
          {detail}
        </p>
      </div>
      <span className="rounded-full bg-secondary-container/45 px-3 py-1 text-[10px] font-semi-bold uppercase tracking-[0.22em] text-secondary dark:bg-cyan-400/10 dark:text-cyan-200">
        {badge}
      </span>
    </div>
  );
}

function QuickAction({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      className="flex flex-col items-center justify-center gap-3 rounded-[1.25rem] bg-surface-container-low px-4 py-5 text-sm font-bold text-on-surface transition-transform hover:-translate-y-0.5 hover:bg-surface-container-high dark:bg-white/[0.055] dark:text-slate-100 dark:hover:bg-white/[0.09]"
      type="button"
    >
      <span className="rounded-2xl bg-white p-3 text-primary shadow-sm dark:bg-white/[0.09] dark:text-blue-300">
        {icon}
      </span>
      {label}
    </button>
  );
}
