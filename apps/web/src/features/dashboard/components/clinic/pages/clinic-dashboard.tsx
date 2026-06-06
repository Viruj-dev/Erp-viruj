"use client";

import {
  BarChart3,
  Camera,
  Eye,
  ImagePlus,
  Plus,
  Sparkles,
  Star,
  Stethoscope,
} from "lucide-react";
import type { ReactNode } from "react";

const kpis = [
  ["Profile Views", "48.2k", "+18% this month"],
  ["Appointment Requests", "1,842", "+246 this week"],
  ["Active Doctors", "06", "2 pending approval"],
  ["Active Services", "14", "3 draft services"],
  ["Average Rating", "4.8", "Across 1,284 reviews"],
  ["Review Count", "1,284", "+42 new reviews"],
] as const;

const doctors = [
  ["Dr. Aditi Rao", "Dermatology", "18.4k", "428", "4.8"],
  ["Dr. Karan Mehta", "Orthopedics", "12.2k", "301", "4.7"],
  ["Dr. Nisha Kapoor", "Fertility", "8.9k", "176", "4.9"],
] as const;

const services = [
  ["Full Body Checkup", "642 requests", "Visible"],
  ["Dental Cleaning", "388 requests", "Visible"],
  ["Skin Consultation", "219 requests", "Draft"],
] as const;

const activity = [
  ["New review received", "Riya Sharma rated the clinic 5 stars."],
  ["Doctor added", "Dr. Nisha Kapoor was attached to this clinic."],
  ["Service published", "Dental Cleaning is now visible on Viruj."],
  ["Gallery image uploaded", "Reception area photo added to public gallery."],
  ["Clinic profile updated", "Cover image and description were refreshed."],
] as const;

export function ClinicDashboardPage({
  userName,
}: {
  roleLabel: string;
  userName: string;
}) {
  const displayName = userName || "Clinic Owner";

  return (
    <div className="space-y-7 p-6 lg:p-5">
      <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#39106d_0%,#6d28d9_48%,#d946ef_100%)] p-6 text-white shadow-[0_28px_90px_rgba(109,40,217,0.34)] lg:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-fuchsia-200/28 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/35" />
        </div>
        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-100/80">
              Viruj Marketplace Presence
            </p>
            <h1 className="mt-4 max-w-3xl font-headline text-3xl font-semibold leading-tight tracking-tight lg:text-5xl">
              {displayName}, your clinic listing is ready to grow on Viruj.
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-violet-50/82">
              Manage public profile quality, doctors, services, facilities, gallery, reviews, and visibility from one marketplace command center.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <HeroAction icon={<Stethoscope size={16} />} label="Add Doctor" primary />
              <HeroAction icon={<Sparkles size={16} />} label="Create Service" />
              <HeroAction icon={<ImagePlus size={16} />} label="Upload Photos" />
            </div>
          </div>

          <div className="rounded-3xl bg-white/12 p-5 ring-1 ring-white/18 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/70">
                  Listing Score
                </p>
                <p className="mt-2 text-4xl font-bold">88%</p>
              </div>
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-[#6d28d9]">
                <Eye size={24} />
              </span>
            </div>
            <div className="mt-6 h-3 rounded-full bg-white/20">
              <div className="h-3 w-[88%] rounded-full bg-white" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <HeroStat label="Profile Views" value="48.2k" />
              <HeroStat label="Requests" value="1,842" />
              <HeroStat label="Rating" value="4.8" />
              <HeroStat label="Visibility" value="Public" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <KpiCard key={kpi[0]} label={kpi[0]} note={kpi[2]} value={kpi[1]} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <ChartPanel title="Profile Views Trend" />
        <ChartPanel title="Appointment Request Trend" />
        <ChartPanel title="Review Rating Trend" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr_360px]">
        <Panel title="Most Viewed Doctors" subtitle="Doctor marketplace performance">
          <div className="space-y-3">
            {doctors.map((doctor) => (
              <DoctorPerformance key={doctor[0]} doctor={doctor} />
            ))}
          </div>
        </Panel>
        <Panel title="Most Requested Services" subtitle="Service demand and visibility">
          <div className="space-y-3">
            {services.map((service) => (
              <ServiceRow key={service[0]} service={service} />
            ))}
          </div>
        </Panel>
        <Panel title="Quick Actions" subtitle="Presence management">
          <div className="grid gap-3">
            {[
              ["Add Doctor", <Stethoscope size={16} />],
              ["Create Service", <Sparkles size={16} />],
              ["Add Facility", <Plus size={16} />],
              ["Upload Photos", <Camera size={16} />],
              ["Edit Clinic Profile", <Eye size={16} />],
            ].map(([label, icon]) => (
              <button
                className="flex h-14 items-center gap-3 rounded-xl bg-violet-50 px-4 text-left text-sm font-semibold text-slate-800 transition hover:bg-violet-100 dark:bg-violet-400/[0.10] dark:text-slate-100"
                key={label as string}
                type="button"
              >
                <span className="rounded-lg bg-white p-2 text-[#6d28d9] shadow-sm dark:bg-white/[0.1] dark:text-violet-200">
                  {icon as ReactNode}
                </span>
                {label}
              </button>
            ))}
          </div>
        </Panel>
      </section>

      <Panel title="Recent Activity" subtitle="Marketplace listing updates">
        <div className="space-y-3">
          {activity.map((item, index) => (
            <div className="flex gap-4 rounded-2xl bg-violet-50/70 p-4 dark:bg-violet-400/[0.08]" key={item[0]}>
              <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#6d28d9] shadow-sm dark:bg-white/[0.08]">
                {index + 1}
              </span>
              <div>
                <p className="font-bold text-slate-950 dark:text-white">{item[0]}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item[1]}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function HeroAction({ icon, label, primary }: { icon: ReactNode; label: string; primary?: boolean }) {
  return (
    <button className={primary ? "inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#5b21b6] shadow-sm transition hover:bg-violet-50" : "inline-flex h-11 items-center gap-2 rounded-xl bg-white/12 px-4 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/18"} type="button">
      {icon}
      {label}
    </button>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-100/70">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function KpiCard({ label, note, value }: { label: string; note: string; value: string }) {
  return (
    <section className="rounded-2xl border border-violet-100 bg-white/88 p-5 shadow-sm dark:border-violet-400/[0.12] dark:bg-[#14171b]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-3 font-headline text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
      <p className="mt-2 text-xs font-medium text-slate-500">{note}</p>
    </section>
  );
}

function Panel({ children, subtitle, title }: { children: ReactNode; subtitle: string; title: string }) {
  return (
    <section className="rounded-2xl border border-violet-100/80 bg-white/88 p-5 shadow-sm dark:border-violet-400/[0.12] dark:bg-[#14171b]">
      <h2 className="font-headline text-base font-semibold text-slate-950 dark:text-slate-100">{title}</h2>
      <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ChartPanel({ title }: { title: string }) {
  return (
    <Panel title={title} subtitle="Last 30 days">
      <div className="flex h-44 items-end gap-3">
        {[42, 68, 54, 82, 72, 96, 88, 110, 104, 128].map((height, index) => (
          <div className="flex flex-1 items-end" key={index}>
            <div className="w-full rounded-t-xl bg-[linear-gradient(180deg,#d946ef,#6d28d9)]" style={{ height }} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DoctorPerformance({ doctor }: { doctor: readonly [string, string, string, string, string] }) {
  return (
    <div className="rounded-2xl bg-violet-50/70 p-4 dark:bg-violet-400/[0.08]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-slate-950 dark:text-white">{doctor[0]}</p>
          <p className="mt-1 text-sm font-medium text-slate-500">{doctor[1]}</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
          <Star size={13} fill="currentColor" />
          {doctor[4]}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <MiniStat label="Profile Views" value={doctor[2]} />
        <MiniStat label="Requests" value={doctor[3]} />
      </div>
    </div>
  );
}

function ServiceRow({ service }: { service: readonly [string, string, string] }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-violet-50/70 p-4 dark:bg-violet-400/[0.08]">
      <div>
        <p className="font-bold text-slate-950 dark:text-white">{service[0]}</p>
        <p className="mt-1 text-sm font-medium text-slate-500">{service[1]}</p>
      </div>
      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#6d28d9] shadow-sm dark:bg-white/[0.08]">
        {service[2]}
      </span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3 dark:bg-white/[0.06]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
