"use client";

import {
  Building2,
  CalendarDays,
  Camera,
  Eye,
  EyeOff,
  ImagePlus,
  Plus,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import {
  ClinicGalleryBento,
  defaultClinicGalleryItems,
  type ClinicGalleryBentoItem,
} from "@/features/dashboard/components/clinic/clinic-gallery-bento";
import { DashboardPageShell } from "@/features/dashboard/components/shared/dashboard-page-shell";
import type { ReactNode } from "react";

type DashboardTone = "clinic" | "hospital" | "doctor";
type RoleDashboardKpi = {
  label: string;
  note: string;
  value: string;
};

type RoleDashboardChart = {
  title: string;
  values: number[];
};

type RoleDashboardListItem = {
  badge?: string;
  id?: string;
  meta?: string;
  subtitle: string;
  title: string;
};

export type RoleDashboardAnalytics = {
  activity?: RoleDashboardListItem[];
  charts?: RoleDashboardChart[];
  doctors?: RoleDashboardListItem[];
  gallery?: {
    completeness: number;
    imageUrlsById?: Record<string, string | undefined>;
    items?: ClinicGalleryBentoItem[];
    liveCount: number;
  };
  heroStats?: Record<string, string>;
  listingScore?: number;
  services?: RoleDashboardListItem[];
  stats?: RoleDashboardKpi[];
};

type ProfileVisibilityControl = {
  isPublic: boolean;
  isUpdating?: boolean;
  onToggle?: () => void;
};

type ToneConfig = {
  accent: string;
  accentDark: string;
  accentSoft: string;
  border: string;
  chart: string;
  glowA: string;
  glowB: string;
  hero: string;
  hoverSoft: string;
  name: string;
  shadow: string;
  soft: string;
  textSoft: string;
};

const tones: Record<DashboardTone, ToneConfig> = {
  clinic: {
    accent: "#6d28d9",
    accentDark: "#5b21b6",
    accentSoft: "text-violet-100/70",
    border: "border-violet-100 dark:border-violet-400/[0.12]",
    chart: "bg-[linear-gradient(180deg,#d946ef,#6d28d9)]",
    glowA: "bg-fuchsia-200/28",
    glowB: "bg-indigo-200/20",
    hero:
      "bg-[linear-gradient(135deg,#39106d_0%,#6d28d9_48%,#d946ef_100%)]",
    hoverSoft: "hover:bg-violet-100",
    name: "clinic",
    shadow: "shadow-[0_28px_90px_rgba(109,40,217,0.34)]",
    soft: "bg-violet-50/70 dark:bg-violet-400/[0.08]",
    textSoft: "text-violet-50/80",
  },
  hospital: {
    accent: "#00478d",
    accentDark: "#00376d",
    accentSoft: "text-blue-100/70",
    border: "border-blue-100 dark:border-blue-400/[0.12]",
    chart: "bg-[linear-gradient(180deg,#38bdf8,#00478d)]",
    glowA: "bg-sky-200/28",
    glowB: "bg-blue-200/20",
    hero:
      "bg-[linear-gradient(135deg,#082f66_0%,#00478d_48%,#38bdf8_100%)]",
    hoverSoft: "hover:bg-blue-100",
    name: "hospital",
    shadow: "shadow-[0_28px_90px_rgba(0,71,141,0.34)]",
    soft: "bg-blue-50/70 dark:bg-blue-400/[0.08]",
    textSoft: "text-blue-50/80",
  },
  doctor: {
    accent: "#0f766e",
    accentDark: "#115e59",
    accentSoft: "text-emerald-100/70",
    border: "border-emerald-100 dark:border-emerald-400/[0.12]",
    chart: "bg-[linear-gradient(180deg,#34d399,#0f766e)]",
    glowA: "bg-emerald-200/28",
    glowB: "bg-teal-200/20",
    hero:
      "bg-[linear-gradient(135deg,#064e3b_0%,#0f766e_48%,#34d399_100%)]",
    hoverSoft: "hover:bg-emerald-100",
    name: "doctor",
    shadow: "shadow-[0_28px_90px_rgba(15,118,110,0.34)]",
    soft: "bg-emerald-50/70 dark:bg-emerald-400/[0.08]",
    textSoft: "text-emerald-50/80",
  },
};

const baseStats = [
  ["Patients", "0", "No appointment requesters yet"],
  ["Appointment Requests", "0", "0 pending, 0 completed"],
  ["Active Doctors", "0", "0 waiting to publish"],
  ["Active Services", "0", "0 draft services"],
  ["Average Rating", "0.0", "Review backend has no rating yet"],
  ["Gallery Photos", "0", "0% gallery completeness"],
] as const;

export function RoleDashboardPage({
  analytics,
  tone,
  userName,
  visibility,
}: {
  analytics?: RoleDashboardAnalytics;
  tone: DashboardTone;
  userName: string;
  visibility?: ProfileVisibilityControl;
}) {
  const theme = tones[tone];
  const displayName =
    userName || (tone === "doctor" ? "Doctor" : `${capitalize(theme.name)} Owner`);
  const subject =
    tone === "doctor"
      ? "practice profile"
      : tone === "hospital"
        ? "hospital listing"
        : "clinic listing";
  const primaryAction =
    tone === "doctor"
      ? "Add Availability"
      : tone === "hospital"
        ? "Add Department"
        : "Add Doctor";
  const PrimaryIcon =
    tone === "doctor" ? CalendarDays : tone === "hospital" ? Building2 : Stethoscope;
  const listingScore = analytics?.listingScore ?? 0;
  const isProfilePublic = visibility?.isPublic ?? (analytics?.heroStats?.Visibility ?? "Public") !== "Private";
  const visibilityLabel = isProfilePublic ? "Public" : "Private";
  const dashboardStats = analytics?.stats ?? baseStats.map(([label, value, note]) => ({ label, note, value }));
  const dashboardCharts = analytics?.charts ?? [];
  const chartPanels = [
    "Appointment Request Trend",
    "Doctor Publish Trend",
    "Service Publish Trend",
  ];
  const dashboardDoctors = analytics?.doctors ?? [];
  const dashboardServices = analytics?.services ?? [];
  const dashboardActivity = analytics?.activity ?? [];
  const gallery = analytics?.gallery;

  return (
    <DashboardPageShell
      eyebrow={`${capitalize(theme.name)} Dashboard`}
      subtitle="Track marketplace readiness, appointment demand, doctors, services, gallery health, and recent activity."
      title="Marketplace Command Center"
      tone={tone === "clinic" ? "violet" : "blue"}
    >
      <section
        className={`relative overflow-hidden rounded-[2rem] p-6 text-white ${theme.hero} ${theme.shadow} lg:p-8`}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className={`absolute -right-20 -top-24 h-72 w-72 rounded-full ${theme.glowA} blur-3xl`} />
          <div className={`absolute -bottom-28 left-1/3 h-72 w-72 rounded-full ${theme.glowB} blur-3xl`} />
          <div className="absolute inset-x-0 top-0 h-px bg-white/35" />
        </div>
        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0">
            <p className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${theme.textSoft}`}>
              Viruj Marketplace Presence
            </p>
            <h1 className="mt-4 max-w-3xl font-headline text-3xl font-semibold leading-tight tracking-tight lg:text-5xl">
              {displayName}, your {subject} is ready to grow on Viruj.
            </h1>
            <p className={`mt-4 max-w-2xl text-sm font-medium leading-6 ${theme.textSoft}`}>
              Manage public profile quality, doctors, services, facilities,
              gallery, reviews, and visibility from one marketplace command
              center.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <HeroAction
                color={theme.accentDark}
                hoverClass={theme.hoverSoft}
                icon={<PrimaryIcon size={16} />}
                label={primaryAction}
                primary
              />
              <HeroAction icon={<Sparkles size={16} />} label="Create Service" />
              <HeroAction icon={<ImagePlus size={16} />} label="Upload Photos" />
            </div>
          </div>

          <div className="rounded-3xl bg-white/12 p-5 ring-1 ring-white/18 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${theme.accentSoft}`}>
                  Listing Score
                </p>
                <p className="mt-2 text-4xl font-bold">{listingScore}%</p>
              </div>
              <span
                className="flex size-14 items-center justify-center rounded-2xl bg-white"
                style={{ color: theme.accent }}
              >
                <Eye size={24} />
              </span>
            </div>
            <div className="mt-6 h-3 rounded-full bg-white/20">
              <div className="h-3 rounded-full bg-white" style={{ width: `${listingScore}%` }} />
            </div>
            {visibility?.onToggle ? (
              <button
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-70"
                disabled={visibility.isUpdating}
                onClick={visibility.onToggle}
                style={{ color: theme.accent }}
                type="button"
              >
                {isProfilePublic ? <EyeOff size={16} /> : <Eye size={16} />}
                {visibility.isUpdating ? "Updating..." : isProfilePublic ? "Make Private" : "Make Public"}
              </button>
            ) : null}
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <HeroStat label="Profile Views" theme={theme} value={analytics?.heroStats?.["Profile Views"] ?? "0"} />
              <HeroStat label="Requests" theme={theme} value={analytics?.heroStats?.Requests ?? "0"} />
              <HeroStat label="Rating" theme={theme} value={analytics?.heroStats?.Rating ?? "0.0"} />
              <HeroStat label="Visibility" theme={theme} value={visibilityLabel} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {dashboardStats.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} note={kpi.note} theme={theme} value={kpi.value} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        {chartPanels.map((title) => (
          <ChartPanel
            key={title}
            theme={theme}
            title={title}
            values={findDashboardChart(dashboardCharts, title)}
          />
        ))}
      </section>

      <Panel subtitle="Bento preview of photos patients see on your listing" theme={theme} title="Public Gallery">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {gallery?.liveCount ?? 0} photos live - {gallery?.completeness ?? 0}% gallery completeness
          </p>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition"
            style={{ backgroundColor: theme.accent }}
            type="button"
          >
            <ImagePlus size={16} />
            Manage Gallery
          </button>
        </div>
        <ClinicGalleryBento
          imageUrlsById={gallery?.imageUrlsById}
          items={gallery?.items?.length ? gallery.items : defaultClinicGalleryItems}
        />
      </Panel>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr_360px]">
        <Panel subtitle="Doctor marketplace performance" theme={theme} title="Most Viewed Doctors">
          <div className="space-y-3">
            {dashboardDoctors.length ? (
              dashboardDoctors.map((doctor) => (
                <DoctorPerformance doctor={doctor} key={doctor.title} theme={theme} />
              ))
            ) : (
              <EmptyPanelRow label="No doctors added yet." theme={theme} />
            )}
          </div>
        </Panel>
        <Panel subtitle="Service demand and visibility" theme={theme} title="Most Requested Services">
          <div className="space-y-3">
            {dashboardServices.length ? (
              dashboardServices.map((service) => (
                <ServiceRow key={service.title} service={service} theme={theme} />
              ))
            ) : (
              <EmptyPanelRow label="No services or facilities added yet." theme={theme} />
            )}
          </div>
        </Panel>
        <Panel subtitle="Presence management" theme={theme} title="Quick Actions">
          <div className="grid gap-3">
            {[
              { label: primaryAction, icon: <PrimaryIcon size={16} /> },
              { label: "Create Service", icon: <Sparkles size={16} /> },
              { label: "Add Facility", icon: <Plus size={16} /> },
              { label: "Upload Photos", icon: <Camera size={16} /> },
              { label: `Edit ${capitalize(theme.name)} Profile`, icon: <Eye size={16} /> },
            ].map((action) => (
              <button
                className={`flex h-14 items-center gap-3 rounded-xl px-4 text-left text-sm font-semibold text-slate-800 transition ${theme.soft} ${theme.hoverSoft} dark:text-slate-100`}
                key={action.label}
                type="button"
              >
                <span
                  className="rounded-lg bg-white p-2 shadow-sm dark:bg-white/[0.1]"
                  style={{ color: theme.accent }}
                >
                  {action.icon}
                </span>
                {action.label}
              </button>
            ))}
          </div>
        </Panel>
      </section>

      <Panel subtitle="Marketplace listing updates" theme={theme} title="Recent Activity">
        <div className="space-y-3">
          {dashboardActivity.length ? (
            dashboardActivity.map((item, index) => (
              <div className={`flex gap-4 rounded-2xl p-4 ${theme.soft}`} key={item.id ?? `${item.title}-${index}`}>
                <span
                  className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold shadow-sm dark:bg-white/[0.08]"
                  style={{ color: theme.accent }}
                >
                  {index + 1}
                </span>
                <div>
                  <p className="font-bold text-slate-950 dark:text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.subtitle}</p>
                </div>
              </div>
            ))
          ) : (
            <EmptyPanelRow label="No recent activity yet." theme={theme} />
          )}
        </div>
      </Panel>
    </DashboardPageShell>
  );
}

function HeroAction({
  color,
  hoverClass,
  icon,
  label,
  primary,
}: {
  color?: string;
  hoverClass?: string;
  icon: ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      className={
        primary
          ? `inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold shadow-sm transition ${hoverClass}`
          : "inline-flex h-11 items-center gap-2 rounded-xl bg-white/12 px-4 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/18"
      }
      style={primary ? { color } : undefined}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function HeroStat({
  label,
  theme,
  value,
}: {
  label: string;
  theme: ToneConfig;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
      <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${theme.accentSoft}`}>
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function KpiCard({
  label,
  note,
  theme,
  value,
}: {
  label: string;
  note: string;
  theme: ToneConfig;
  value: string;
}) {
  return (
    <section className={`rounded-2xl border bg-white/88 p-5 shadow-sm ${theme.border} dark:bg-[#14171b]`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 font-headline text-3xl font-semibold text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-2 text-xs font-medium text-slate-500">{note}</p>
    </section>
  );
}

function Panel({
  children,
  subtitle,
  theme,
  title,
}: {
  children: ReactNode;
  subtitle: string;
  theme: ToneConfig;
  title: string;
}) {
  return (
    <section className={`rounded-2xl border bg-white/88 p-5 shadow-sm ${theme.border} dark:bg-[#14171b]`}>
      <h2 className="font-headline text-base font-semibold text-slate-950 dark:text-slate-100">
        {title}
      </h2>
      <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ChartPanel({ theme, title, values }: { theme: ToneConfig; title: string; values?: number[] }) {
  const bars = chartHeights(values);
  return (
    <Panel subtitle="Last 30 days" theme={theme} title={title}>
      <div className="flex h-44 items-end gap-3">
        {bars.map((height, index) => (
          <div className="flex flex-1 items-end" key={index}>
            <div className={`w-full rounded-t-xl ${theme.chart}`} style={{ height }} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DoctorPerformance({
  doctor,
  theme,
}: {
  doctor: RoleDashboardListItem;
  theme: ToneConfig;
}) {
  return (
    <div className={`rounded-2xl p-4 ${theme.soft}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-slate-950 dark:text-white">{doctor.title}</p>
          <p className="mt-1 text-sm font-medium text-slate-500">{doctor.subtitle}</p>
          {doctor.meta ? <p className="mt-2 text-xs font-semibold text-slate-500">{doctor.meta}</p> : null}
        </div>
        {doctor.badge ? (
          <span
            className="rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm dark:bg-white/[0.08]"
            style={{ color: theme.accent }}
          >
            {doctor.badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ServiceRow({
  service,
  theme,
}: {
  service: RoleDashboardListItem;
  theme: ToneConfig;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 rounded-2xl p-4 ${theme.soft}`}>
      <div>
        <p className="font-bold text-slate-950 dark:text-white">{service.title}</p>
        <p className="mt-1 text-sm font-medium text-slate-500">{service.subtitle}</p>
        {service.meta ? <p className="mt-2 text-xs font-semibold text-slate-500">{service.meta}</p> : null}
      </div>
      {service.badge ? (
        <span
          className="rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm dark:bg-white/[0.08]"
          style={{ color: theme.accent }}
        >
          {service.badge}
        </span>
      ) : null}
    </div>
  );
}

function EmptyPanelRow({ label, theme }: { label: string; theme: ToneConfig }) {
  return (
    <div className={`rounded-2xl p-4 text-sm font-semibold text-slate-500 ${theme.soft}`}>
      {label}
    </div>
  );
}
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3 dark:bg-white/[0.06]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-bold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function findDashboardChart(charts: RoleDashboardChart[], title: string) {
  return charts.find((chart) => chart.title === title)?.values;
}

function chartHeights(values?: number[]) {
  const cleanValues = values?.filter((value) => Number.isFinite(value)).slice(-10) ?? [];
  const bars = cleanValues.length ? cleanValues : Array.from({ length: 10 }, () => 0);
  const max = Math.max(...bars, 1);
  return bars.map((value) => value <= 0 ? 4 : Math.max(18, Math.round((value / max) * 128)));
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
