"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  Eye,
  ImageIcon,
  Layers3,
  RefreshCw,
  Stethoscope,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ClinicGalleryBentoItem } from "@/features/dashboard/components/clinic/clinic-gallery-bento";
import {
  buildDashboardPath,
  buildTenantDashboardPath,
  isDashboardPage,
  type DashboardPage,
} from "@/features/dashboard/lib/routing";

type DashboardTone = "clinic" | "hospital" | "doctor";
type RoleDashboardKpi = { label: string; note: string; value: string };
type RoleDashboardChart = {
  title: string;
  values: number[];
  labels?: string[];
  period?: string;
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
  appointmentStatuses?: { label: string; value: number; color: string }[];
};
type ProfileVisibilityControl = {
  isPublic: boolean;
  isUpdating?: boolean;
  onToggle?: () => void;
  statusLabel?: string;
};
const card =
  "rounded-xl border border-slate-200/90 bg-white dark:border-white/10 dark:bg-[#151b22]";
const actionClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--dashboard-accent)] dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10";
const metricIcons = [Users, CalendarDays, Stethoscope, Layers3];

export function RoleDashboardPage({
  analytics,
  tone,
  userName,
  organizationName,
  visibility,
  loading = false,
  unavailable = [],
  onRefresh,
  refreshing = false,
}: {
  analytics?: RoleDashboardAnalytics;
  tone: DashboardTone;
  userName: string;
  organizationName?: string;
  visibility?: ProfileVisibilityControl;
  loading?: boolean;
  unavailable?: string[];
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const pathname = usePathname();
  const [chartIndex, setChartIndex] = useState(0);
  const gradientId = useId().replaceAll(":", "");
  const segments = pathname.split("/").filter(Boolean);
  const slug =
    segments[1] && !isDashboardPage(segments[1]) ? segments[1] : undefined;
  const href = (page: DashboardPage) =>
    slug
      ? buildTenantDashboardPath(tone, slug, page)
      : buildDashboardPath(tone, page);
  const stats = analytics?.stats ?? [];
  const chart = analytics?.charts?.[chartIndex];
  const points =
    chart?.values.map((value, index) => ({
      label: chart.labels?.[index] ?? `${index + 1}`,
      value,
    })) ?? [];
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const statuses = analytics?.appointmentStatuses ?? [];
  const appointmentTotal = statuses.reduce((sum, item) => sum + item.value, 0);
  const pending =
    statuses.find((item) => item.label === "Awaiting approval")?.value ?? 0;
  const completed =
    statuses.find((item) => item.label === "Completed")?.value ?? 0;
  const completedPercent = appointmentTotal
    ? Math.round((completed / appointmentTotal) * 100)
    : 0;
  const profilePage =
    tone === "clinic"
      ? "clinic-profile"
      : tone === "doctor"
        ? "profile"
        : "hospital-profile";
  const dataAvailable = Boolean(analytics) && !loading;

  return (
    <div
      style={
        {
          "--dashboard-accent":
            tone === "clinic"
              ? "#7c3aed"
              : tone === "hospital"
                ? "#2563eb"
                : "#15803d",
          "--dashboard-soft":
            tone === "clinic"
              ? "#ede9fe"
              : tone === "hospital"
                ? "#dbeafe"
                : "#dcfce7",
        } as CSSProperties
      }
      className="min-w-0 space-y-6 bg-[#f6f8fa] p-4 text-slate-900 dark:bg-[#10151b] dark:text-slate-100 dark:[&_.text-slate-500]:text-slate-400 sm:p-6 xl:p-8"
    >
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--dashboard-accent)]" />
            {organizationName ||
              `${tone.charAt(0).toUpperCase() + tone.slice(1)} workspace`}
            <span className="text-slate-300">/</span>Overview
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
            Your practice, at a glance.
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""}. Here’s
            what’s happening across your organization.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onRefresh && (
            <button
              aria-label="Refresh dashboard"
              className={actionClass}
              disabled={refreshing}
              onClick={onRefresh}
              type="button"
            >
              <RefreshCw
                className={refreshing ? "animate-spin" : ""}
                size={14}
              />
              {refreshing ? "Refreshing" : "Refresh"}
            </button>
          )}
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--dashboard-accent)] px-4 py-2.5 text-xs font-medium text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--dashboard-accent)]"
            href={href("appointments-review")}
          >
            <CalendarDays size={15} />
            View appointments
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </header>

      <section className="relative flex items-center justify-between gap-5 overflow-hidden rounded-3xl bg-[var(--dashboard-accent)] px-6 py-6 text-white sm:px-8">
        <div className="relative z-10 max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
            Care starts here
          </p>
          <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
            A little preparation. Better care.
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/80">
            Review appointment requests, keep your team’s details current, and
            help patients find your practice.
          </p>
          <Link
            href={href(profilePage)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[var(--dashboard-accent)]"
          >
            Manage your profile <ArrowRight size={15} />
          </Link>
        </div>
        <svg
          viewBox="0 0 280 180"
          aria-hidden="true"
          className="hidden h-44 w-64 shrink-0 sm:block"
          fill="none"
        >
          <circle cx="160" cy="92" r="85" fill="white" opacity=".1" />
          <rect x="55" y="33" width="150" height="120" rx="18" fill="white" />
          <path
            d="M55 51a18 18 0 0 1 18-18h114a18 18 0 0 1 18 18v20H55Z"
            fill="var(--dashboard-soft)"
          />
          <path
            d="M88 24v23M172 24v23"
            stroke="white"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M79 91h19m18 0h19m18 0h19M79 114h19m18 0h19"
            stroke="var(--dashboard-accent)"
            strokeWidth="8"
            strokeLinecap="round"
            opacity=".45"
          />
          <circle cx="206" cy="132" r="35" fill="#34d399" />
          <path
            d="m190 132 11 11 21-23"
            stroke="#064e3b"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M25 67h18m-9-9v18M229 48h18m-9-9v18"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".65"
          />
        </svg>
      </section>
      {unavailable.length > 0 && (
        <div
          className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
          role="alert"
        >
          <CircleAlert className="mt-0.5 shrink-0" size={16} />
          <span>
            Some information couldn’t load: {unavailable.join(", ")}. Figures
            may be incomplete. Use Refresh to try again.
          </span>
        </div>
      )}

      <section
        aria-label="Organization metrics"
        aria-busy={loading}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4"
      >
        {[
          "Patients",
          "Appointment Requests",
          "Active Doctors",
          "Active Services",
        ].map((label, index) => {
          const stat = stats.find((item) => item.label === label);
          const Icon = metricIcons[index];
          const metricUnavailable = unavailable.includes(
            ["appointments", "appointments", "doctors", "services"][index]
          );
          return (
            <div className={`${card} p-5`} key={label}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-slate-500">
                  {label === "Appointment Requests"
                    ? "Appointment requests"
                    : label === "Active Doctors"
                      ? "Published doctors"
                      : label === "Active Services"
                        ? "Live services"
                        : "Unique patients"}
                </p>
                <Icon className="text-slate-400" size={17} strokeWidth={1.6} />
              </div>
              <p
                className={`mt-4 text-[28px] font-semibold leading-none tracking-tight tabular-nums ${loading ? "animate-pulse text-slate-300" : ""}`}
              >
                {dataAvailable && !metricUnavailable
                  ? (stat?.value ?? "—")
                  : "—"}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] leading-5 text-slate-500">
                <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                {loading
                  ? "Loading organization data"
                  : metricUnavailable
                    ? "Temporarily unavailable"
                    : (stat?.note ?? "No data available")}
              </div>
            </div>
          );
        })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
        <section
          className={`${card} min-w-0 overflow-hidden`}
          aria-label="Activity chart"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 px-5 pt-5 sm:px-6">
            <div>
              <h2 className="text-sm font-semibold">Activity over time</h2>
              <p className="mt-1 text-xs text-slate-500">
                {chart?.period ?? "Daily activity"}
              </p>
            </div>
            <div
              aria-label="Chart metric"
              className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-white/5"
            >
              {["Appointments", "Doctors", "Services"].map((label, index) => (
                <button
                  aria-pressed={chartIndex === index}
                  className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition ${chartIndex === index ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
                  key={label}
                  onClick={() => setChartIndex(index)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-baseline gap-2 px-5 pt-5 sm:px-6">
            <span className="text-3xl font-semibold tracking-tight tabular-nums">
              {dataAvailable ? total.toLocaleString("en-IN") : "—"}
            </span>
            <span className="text-xs text-slate-500">
              {
                ["requests", "doctors published", "services published"][
                  chartIndex
                ]
              }{" "}
              in this period
            </span>
          </div>
          <div
            aria-label={
              points.length
                ? points
                    .map((point) => `${point.label}: ${point.value}`)
                    .join(", ")
                : "No chart data"
            }
            className="mt-3 h-[235px] w-full pr-5"
            role="img"
          >
            {loading ? (
              <div className="mx-6 mt-6 h-40 animate-pulse rounded-lg bg-slate-100 dark:bg-white/5" />
            ) : points.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  accessibilityLayer
                  data={points}
                  margin={{ top: 15, right: 8, left: -12, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--dashboard-accent)"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--dashboard-accent)"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="var(--border, #e2e8f0)"
                    strokeDasharray="3 5"
                    vertical={false}
                  />
                  <XAxis
                    axisLine={false}
                    dataKey="label"
                    minTickGap={28}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    tickLine={false}
                    tickMargin={12}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    domain={[0, (max: number) => Math.max(4, max)]}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      color: "#0f172a",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    dataKey="value"
                    fill={`url(#${gradientId})`}
                    isAnimationActive={false}
                    name={
                      ["Requests", "Doctors published", "Services published"][
                        chartIndex
                      ]
                    }
                    stroke="var(--dashboard-accent)"
                    strokeWidth={2.5}
                    type="monotone"
                    activeDot={{ r: 5, stroke: "white", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState label="Your activity trend will appear here." />
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-slate-100 px-6 py-3 text-[11px] text-slate-500 dark:border-white/5">
            <span className="h-2 w-2 rounded-full bg-[var(--dashboard-accent)]" />
            {chart?.title ?? "Organization activity"}
            {dataAvailable && total === 0 && (
              <span className="ml-auto">
                No activity recorded in this period
              </span>
            )}
          </div>
        </section>

        <section className={`${card} flex flex-col p-5 sm:p-6`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Appointment status</h2>
            <span className="text-[10px] text-slate-400">Loaded records</span>
          </div>
          <div className="flex items-center gap-5 py-6">
            <div
              aria-label={`${completedPercent}% of loaded appointments completed`}
              className="relative grid h-[112px] w-[112px] shrink-0 place-items-center rounded-full"
              role="img"
              style={{
                background: `conic-gradient(var(--dashboard-accent) ${completedPercent}%, var(--border, #e2e8f0) 0)`,
              }}
            >
              <div className="absolute inset-[9px] rounded-full bg-white dark:bg-[#151b22]" />
              <div className="relative text-center">
                <p className="text-2xl font-semibold tabular-nums">
                  {dataAvailable ? `${completedPercent}%` : "—"}
                </p>
                <p className="mt-0.5 text-[9px] text-slate-500">Completed</p>
              </div>
            </div>
            <div>
              <p className="text-3xl font-semibold tabular-nums">
                {dataAvailable ? appointmentTotal.toLocaleString("en-IN") : "—"}
              </p>
              <p className="mt-1 text-xs text-slate-500">total requests</p>
              <Link
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--dashboard-accent)] dark:text-[var(--dashboard-soft)]"
                href={href("appointments-dashboard")}
              >
                View breakdown
                <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            {statuses.length ? (
              statuses.map((status) => (
                <div
                  className="flex items-center gap-2 text-xs"
                  key={status.label}
                >
                  <span
                    className="h-2 w-2 rounded-sm"
                    style={{ background: status.color }}
                  />
                  <span className="text-slate-500">{status.label}</span>
                  <span className="ml-auto font-medium tabular-nums">
                    {loading ? "—" : status.value}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">
                {loading
                  ? "Loading appointments…"
                  : "No appointment records available."}
              </p>
            )}
          </div>
          <Link
            className="mt-5 flex items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
            href={href("appointments-review")}
          >
            <span className="flex items-center gap-2">
              <Clock3 size={14} />
              {dataAvailable
                ? `${pending} awaiting your approval`
                : "Review appointment requests"}
            </span>
            <ArrowRight size={14} />
          </Link>
        </section>
      </div>

      <section
        className={`${card} grid divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0 dark:divide-white/10`}
        aria-label="Organization presence"
      >
        <div className="flex items-center gap-3 p-4">
          <span className="rounded-lg bg-[var(--dashboard-soft)] p-2 text-[var(--dashboard-accent)] dark:bg-teal-950">
            <Eye size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium">Directory visibility</p>
            <p className="mt-1 text-[11px] text-slate-500">
              {visibility?.statusLabel ?? "Not available"}
            </p>
          </div>
          <button
            aria-label="Show organization in patient directory"
            aria-checked={visibility?.isPublic ?? false}
            className={`relative h-5 w-9 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-40 ${visibility?.isPublic ? "bg-[var(--dashboard-accent)]" : "bg-slate-300 dark:bg-slate-600"}`}
            disabled={!visibility?.onToggle || visibility.isUpdating}
            onClick={visibility?.onToggle}
            role="switch"
            type="button"
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${visibility?.isPublic ? "left-0.5 translate-x-4" : "left-0.5"}`}
            />
          </button>
        </div>
        <div className="flex items-center gap-3 p-4">
          <span className="rounded-lg bg-slate-100 p-2 text-slate-500 dark:bg-white/5">
            <ImageIcon size={18} />
          </span>
          <div className="flex-1">
            <p className="text-xs font-medium">Organization gallery</p>
            <p className="mt-1 text-[11px] text-slate-500">
              {dataAvailable
                ? `${analytics?.gallery?.liveCount ?? 0} published photos & videos`
                : "No data available"}
            </p>
          </div>
          <Link
            aria-label="Manage organization gallery"
            className={actionClass}
            href={href("gallery")}
          >
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="flex items-center gap-3 p-4">
          <span className="rounded-lg bg-slate-100 p-2 text-slate-500 dark:bg-white/5">
            <Check size={18} />
          </span>
          <div className="flex-1">
            <p className="text-xs font-medium">Your public profile</p>
            <p className="mt-1 text-[11px] text-slate-500">
              Keep your organization details up to date
            </p>
          </div>
          <Link
            aria-label="Edit organization profile"
            className={actionClass}
            href={href(profilePage)}
          >
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <PeoplePanel
          title="Your doctors"
          subtitle="Profiles connected to your organization"
          items={analytics?.doctors}
          href={href(tone === "doctor" ? "profile" : "doctors")}
          loading={loading}
          icon={<Stethoscope size={18} />}
          empty="No doctor profiles yet."
        />
        <PeoplePanel
          title="Services & facilities"
          subtitle="What patients can discover on Viruj"
          items={analytics?.services}
          href={href(tone === "doctor" ? "profile" : "facilities")}
          loading={loading}
          icon={<Layers3 size={18} />}
          empty="No services added yet."
        />
      </div>

      <section className={`${card} px-5 py-5 sm:px-6`}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Recent activity</h2>
            <p className="mt-1 text-xs text-slate-500">
              The latest changes across your organization
            </p>
          </div>
          <Clock3 className="text-slate-400" size={17} />
        </div>
        {loading ? (
          <EmptyState label="Loading recent activity…" />
        ) : analytics?.activity?.length ? (
          <ol className="divide-y divide-slate-100 dark:divide-white/5">
            {analytics.activity.map((item, index) => (
              <li
                className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                key={item.id ?? `${item.title}-${index}`}
              >
                <span className="mt-0.5 rounded-full bg-slate-100 p-2 text-slate-500 dark:bg-white/5">
                  <ArrowDownRight size={13} />
                </span>
                <div>
                  <p className="text-xs font-medium">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.subtitle}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState label="New appointments and profile updates will appear here." />
        )}
      </section>
      <p className="text-center text-[10px] text-slate-400">
        Your organization’s activity on Viruj
      </p>
    </div>
  );
}

function PeoplePanel({
  title,
  subtitle,
  items,
  href,
  loading,
  icon,
  empty,
}: {
  title: string;
  subtitle: string;
  items?: RoleDashboardListItem[];
  href: string;
  loading: boolean;
  icon: ReactNode;
  empty: string;
}) {
  return (
    <section className={`${card} min-w-0 overflow-hidden`}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5 dark:border-white/5">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <Link
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-[var(--dashboard-accent)] dark:text-[var(--dashboard-soft)]"
          href={href}
        >
          Manage
          <ArrowUpRight size={13} />
        </Link>
      </div>
      {loading ? (
        <EmptyState label="Loading…" />
      ) : items?.length ? (
        <ul className="divide-y divide-slate-100 px-5 dark:divide-white/5">
          {items.map((item, index) => (
            <li
              className="flex items-center gap-3 py-4"
              key={item.id ?? `${item.title}-${index}`}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
                {item.title
                  .replace(/^Dr\.?\s*/i, "")
                  .split(" ")
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join("")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{item.title}</p>
                <p className="mt-1 truncate text-[11px] text-slate-500">
                  {item.subtitle}
                </p>
                {item.meta && (
                  <p className="mt-1 text-[10px] text-slate-400">{item.meta}</p>
                )}
              </div>
              {item.badge && (
                <span
                  className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-medium ${["Shown in app", "Public"].includes(item.badge) ? "bg-[var(--dashboard-soft)] text-[var(--dashboard-accent)] dark:bg-teal-950 dark:text-teal-300" : "bg-slate-100 text-slate-500 dark:bg-white/5"}`}
                >
                  {item.badge === "Shown in app" ? "Published" : item.badge}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex min-h-36 flex-col items-center justify-center gap-3 p-5 text-slate-400">
          {icon}
          <p className="text-xs">{empty}</p>
          <Link
            className="text-xs font-medium text-[var(--dashboard-accent)] dark:text-[var(--dashboard-soft)]"
            href={href}
          >
            Get started
            <ArrowRight className="ml-1 inline" size={12} />
          </Link>
        </div>
      )}
    </section>
  );
}
function EmptyState({ label }: { label: string }) {
  return (
    <div className="grid min-h-28 place-items-center px-6 py-8 text-center text-xs text-slate-500">
      {label}
    </div>
  );
}
