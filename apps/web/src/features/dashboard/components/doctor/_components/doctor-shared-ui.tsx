"use client";

import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileBadge,
  Filter,
  GraduationCap,
  MoreHorizontal,
  Pencil,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import type { ReactNode } from "react";
import { appointments } from "@/features/dashboard/components/doctor/_components/doctor-mock-data";

export function DoctorPageShell({
  actions,
  children,
  eyebrow,
  subtitle,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  eyebrow: string;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="space-y-7 p-6 lg:p-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-600">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-headline text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-500">
            {subtitle}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

export function DashboardHeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/70">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

export function HospitalPanel({
  children,
  subtitle,
  title,
}: {
  children: ReactNode;
  subtitle?: string;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
      <div className="mb-4">
        <h2 className="font-headline text-base font-semibold text-slate-950 dark:text-slate-100">
          {title}
        </h2>
        {subtitle ? <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function MetricCard({
  accent,
  icon,
  label,
  tone,
  value,
}: {
  accent: string;
  icon: ReactNode;
  label: string;
  tone: "blue" | "green" | "indigo" | "orange";
  value: string;
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    indigo: "bg-indigo-50 text-indigo-600",
    orange: "bg-orange-50 text-orange-600",
  }[tone];

  return (
    <div className={`rounded-2xl border-2 bg-white/85 p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b] ${accent}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-500">{label}</p>
        <span className={`rounded-lg p-1.5 ${toneClass}`}>{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-950 dark:text-slate-100">{value}</p>
    </div>
  );
}

export function DataTable({
  columns,
  headers,
  rows,
}: {
  columns: string;
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
      <div className={`grid ${columns} gap-5 border-b border-slate-200/80 bg-slate-50/80 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-slate-500`}>
        {headers.map((header) => <span key={header}>{header}</span>)}
      </div>
      <div className="divide-y divide-slate-200/70 dark:divide-white/[0.07]">
        {rows.map((row, index) => (
          <div className={`grid ${columns} items-center gap-5 px-6 py-4 text-sm transition hover:bg-slate-50 dark:hover:bg-white/[0.04]`} key={index}>
            {row.map((cell, cellIndex) => <div className="min-w-0" key={cellIndex}>{cell}</div>)}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 px-6 py-4 dark:border-white/[0.08]">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-500">Showing 1 to {rows.length} of 24 records</p>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
          <button className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.08]" type="button"><ChevronLeft size={17} /></button>
          <button className="flex size-9 items-center justify-center rounded-lg bg-primary text-white dark:bg-blue-500" type="button">1</button>
          <button className="flex size-9 items-center justify-center rounded-lg transition hover:bg-slate-100 dark:hover:bg-white/[0.08]" type="button">2</button>
          <button className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.08]" type="button"><ChevronRight size={17} /></button>
        </div>
      </div>
    </section>
  );
}

export function FilterBar({ tabs }: { tabs: string[] }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab, index) => (
          <button className={index === 0 ? "h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-white dark:bg-blue-500" : "h-9 rounded-lg bg-slate-100 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-400"} key={tab} type="button">{tab}</button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <SecondaryAction icon={<Filter size={15} />} label="Filters" />
        <SecondaryAction icon={<Search size={15} />} label="Search" />
      </div>
    </div>
  );
}

export function PrimaryAction({ icon, label }: { icon?: ReactNode; label: string }) {
  return (
    <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 dark:bg-blue-500 dark:hover:bg-blue-400" type="button">
      {icon}
      {label}
    </button>
  );
}

export function SecondaryAction({ icon, label }: { icon?: ReactNode; label: string }) {
  return (
    <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/[0.1]" type="button">
      {icon}
      {label}
    </button>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const statusClass = normalized.includes("rejected") || normalized.includes("alert")
    ? "bg-rose-100 text-rose-800 dark:bg-rose-400/14 dark:text-rose-200"
    : normalized.includes("approved") || normalized.includes("completed") || normalized.includes("active") || normalized.includes("done")
    ? "bg-teal-100 text-teal-800 dark:bg-teal-400/14 dark:text-teal-200"
    : normalized.includes("pending") || normalized.includes("requested") || normalized.includes("review")
    ? "bg-orange-100 text-orange-800 dark:bg-orange-400/14 dark:text-orange-200"
    : "bg-blue-100 text-blue-800 dark:bg-blue-400/14 dark:text-blue-200";

  return <span className={`w-fit rounded-full px-3 py-1 text-[11px] font-medium ${statusClass}`}>{status}</span>;
}

export function PatientRow({ initials, meta, name, status, tone }: { initials: string; meta: string; name: string; status: string; tone: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Avatar initials={initials} tone={tone} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-headline text-[15px] font-semibold text-slate-950 dark:text-slate-100">{name}</p>
        <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-500">{meta}</p>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

function Avatar({ initials, tone }: { initials: string; tone: string }) {
  const toneClass = {
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-400/18 dark:text-blue-200",
    indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-400/18 dark:text-indigo-200",
    rose: "bg-rose-100 text-rose-800 dark:bg-rose-400/18 dark:text-rose-200",
    teal: "bg-teal-100 text-teal-800 dark:bg-teal-400/18 dark:text-teal-200",
  }[tone] ?? "bg-slate-200 text-slate-700 dark:bg-slate-600/30 dark:text-slate-200";

  return <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${toneClass}`}>{initials}</span>;
}

export function RowActions({ edit = false }: { edit?: boolean }) {
  return (
    <div className="flex justify-end gap-2 text-slate-400">
      {edit ? <Pencil size={17} /> : <Eye size={17} />}
      <MoreHorizontal size={17} />
    </div>
  );
}

export function CompactAppointmentList() {
  return (
    <div className="divide-y divide-slate-200/70 dark:divide-white/[0.07]">
      {appointments.slice(0, 4).map((appointment) => (
        <div className="grid gap-3 py-4 text-sm md:grid-cols-[0.8fr_1fr_1fr_auto]" key={appointment[0]}>
          <strong className="text-slate-950 dark:text-slate-100">{appointment[2]}</strong>
          <span>{appointment[1]}</span>
          <span className="text-slate-500">{appointment[5]}</span>
          <StatusBadge status={appointment[4]} />
        </div>
      ))}
    </div>
  );
}

export function ReadinessRows() {
  return (
    <div className="space-y-2">
      <SettingsLine label="Verification Status" value="Under Review" />
      <SettingsLine label="Profile Completion" value="92%" />
      <SettingsLine label="Public Profile" value="Enabled" />
      <SettingsLine label="Availability" value="42 hours / week" />
    </div>
  );
}

export function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <input className="h-11 w-full rounded-xl border-none bg-slate-100 px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 dark:bg-white/[0.06] dark:text-slate-100" readOnly value={value} />
    </label>
  );
}

export function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-200">
        <CheckCircle size={16} />
        {value}
      </p>
    </div>
  );
}

export function SettingsLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3 text-sm dark:bg-white/[0.06]">
      <span className="font-semibold text-slate-600 dark:text-slate-400">{label}</span>
      <strong className="text-slate-950 dark:text-slate-100">{value}</strong>
    </div>
  );
}

export function TextBlock({ text, title }: { text: string; title: string }) {
  return (
    <div className="rounded-xl bg-slate-100 p-4 dark:bg-white/[0.06]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{text}</p>
    </div>
  );
}

export function DocumentCard({ description, status, title }: { description: string; status: string; title: string }) {
  const rejected = status === "Rejected";
  return (
    <HospitalPanel title={title} subtitle={description}>
      <div className="flex items-center justify-between">
        <span className={rejected ? "rounded-xl bg-rose-50 p-3 text-rose-700" : "rounded-xl bg-blue-50 p-3 text-blue-700"}>
          {rejected ? <GraduationCap size={20} /> : <FileBadge size={20} />}
        </span>
        <StatusBadge status={status} />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-200/80 pt-4 dark:border-white/[0.08]">
        <span className="text-xs font-semibold text-slate-500">Oct 24, 2023</span>
        <SecondaryAction icon={rejected ? <Upload size={14} /> : <Eye size={14} />} label={rejected ? "Replace" : "View"} />
      </div>
    </HospitalPanel>
  );
}

export function DetailRows({ rows }: { rows: Array<[string, string]> }) {
  return <div className="space-y-2">{rows.map((row) => <SettingsLine key={row[0]} label={row[0]} value={row[1]} />)}</div>;
}

export function Timeline({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div className="flex gap-3 text-sm" key={item}>
          <span className="mt-1.5 size-2 rounded-full bg-primary dark:bg-blue-400" />
          <span className="font-medium text-slate-700 dark:text-slate-300">{item}</span>
        </div>
      ))}
    </div>
  );
}

export function SettingsPanel({ rows, title }: { rows: string[]; title: string }) {
  return (
    <HospitalPanel title={title}>
      <div className="space-y-2">
        {rows.map((row) => (
          <SettingsLine key={row} label={row} value={row.includes("Fee") ? "$120" : row.includes("Timezone") ? "Asia/Kolkata" : row.includes("Locale") ? "en-IN" : "Enabled"} />
        ))}
      </div>
    </HospitalPanel>
  );
}

export function Toolbar() {
  return (
    <section className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-600">Filter Schedule</p>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/[0.06]">
          {["Past", "Present", "Upcoming"].map((filter) => (
            <button className={filter === "Present" ? "h-10 rounded-lg bg-white text-xs font-semibold text-primary shadow-sm dark:bg-white/[0.12] dark:text-blue-200" : "h-10 rounded-lg text-xs font-semibold text-slate-500 transition hover:bg-white/70 hover:text-slate-900 dark:text-slate-500"} key={filter} type="button">{filter}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="h-11 w-full rounded-xl border-none bg-slate-100 pl-12 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 dark:bg-white/[0.06]" placeholder="Quick search..." type="text" />
        </div>
        <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-300" type="button"><SlidersHorizontal size={18} /></button>
      </div>
    </section>
  );
}
