"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type CSSProperties } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  RefreshCw,
} from "lucide-react";
import {
  Bar,
  BarChart,
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
import type { VirujAppointment } from "@/lib/viruj-backend";
import {
  formatDate,
  getStatusLabel,
  statusClassName,
} from "./modules/appointments/utils";
import { AppointmentDetailDialog } from "./modules/appointments/components/appointment-detail";
import { DoctorAvatar } from "./workspace/doctor-avatar";

type DashboardTone = "clinic" | "hospital" | "doctor";
type RoleDashboardKpi = { label: string; note: string; value: string };
type RoleDashboardChart = {
  title: string;
  values: number[];
  labels?: string[];
  period?: string;
};
type RoleDashboardListItem = {
  imageUrl?: string;
  gender?: string;
  badge?: string;
  id?: string;
  meta?: string;
  subtitle: string;
  title: string;
};
export type RoleDashboardAnalytics = {
  appointments?: VirujAppointment[];
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
const panel =
  "overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#17191e]";
const subtle = "text-slate-500 dark:text-slate-400";
const textLink =
  "inline-flex items-center gap-1.5 text-xs font-medium text-[var(--dashboard-accent)] hover:underline underline-offset-4";
const control =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10";

export function RoleDashboardPage({
  analytics,
  tone,
  userName,
  organizationName,
  organizationId,
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
  organizationId?: string;
  visibility?: ProfileVisibilityControl;
  loading?: boolean;
  unavailable?: string[];
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const pathname = usePathname();
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(
    null
  );
  const [requestFilter, setRequestFilter] = useState<"all" | "pending">("all");
  const [chartIndex, setChartIndex] = useState(0);
  const segments = pathname.split("/").filter(Boolean);
  const slug =
    segments[1] && !isDashboardPage(segments[1]) ? segments[1] : undefined;
  const href = (page: DashboardPage) =>
    slug
      ? buildTenantDashboardPath(tone, slug, page)
      : buildDashboardPath(tone, page);
  const profilePage =
    tone === "clinic"
      ? "clinic-profile"
      : tone === "doctor"
        ? "profile"
        : "hospital-profile";
  const statuses = analytics?.appointmentStatuses ?? [];
  const pending =
    statuses.find((item) => item.label === "Awaiting approval")?.value ?? 0;
  const appointmentTotal = statuses.reduce((sum, item) => sum + item.value, 0);
  const appointmentsUnavailable =
    unavailable.includes("appointments") || !analytics;
  const rows = [...(analytics?.appointments ?? [])]
    .filter(
      (item) => requestFilter === "all" || item.status === "pending_approval"
    )
    .sort((a, b) =>
      String(b.createdAt ?? b.appointmentDate).localeCompare(
        String(a.createdAt ?? a.appointmentDate)
      )
    )
    .slice(0, 5);
  const chart = analytics?.charts?.[chartIndex];
  const points =
    chart?.values.map((value, index) => ({
      label: chart.labels?.[index] ?? String(index + 1),
      value,
    })) ?? [];
  const hasTrend = points.some((point) => point.value > 0);
  const chartUnavailable =
    !analytics ||
    unavailable.includes(["appointments", "doctors", "services"][chartIndex]) ||
    (chartIndex === 0 && unavailable.includes("analytics"));
  const team = analytics?.doctors ?? [];
  const services = analytics?.services ?? [];
  const ready = !loading && !!analytics;
  return (
    <div
      style={
        {
          "--dashboard-brand-light":
            tone === "clinic"
              ? "#c4b5fd"
              : tone === "hospital"
                ? "#93c5fd"
                : "#6ee7b7",
          "--dashboard-brand":
            tone === "clinic"
              ? "#7855c7"
              : tone === "hospital"
                ? "#3569ba"
                : "#278565",
        } as CSSProperties
      }
      className="[--dashboard-accent:var(--dashboard-brand)] dark:[--dashboard-accent:var(--dashboard-brand-light)] min-w-0 bg-[#fafafa] px-4 py-6 text-slate-900 dark:bg-[#111318] dark:text-slate-100 sm:px-6 lg:px-8 [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-4 [&_button]:focus-visible:outline-[var(--dashboard-accent)] [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-[var(--dashboard-accent)]"
    >
      <div className="mx-auto max-w-[1440px] space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
            <p className={`mt-1.5 text-sm ${subtle}`}>
              {userName
                ? `Welcome back, ${userName.split(" ")[0]}.`
                : "Your workspace overview."}{" "}
              Here’s where things stand
              {organizationName ? ` at ${organizationName}` : ""}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                className={control}
                disabled={refreshing}
                onClick={onRefresh}
              >
                <RefreshCw
                  size={14}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Refreshing" : "Refresh"}
              </button>
            )}
            <Link
              href={href("appointments-review")}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--dashboard-brand)] px-3.5 py-2 text-xs font-medium text-white transition hover:opacity-90"
            >
              Open appointments
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </header>
        {unavailable.length > 0 && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
          >
            <CircleAlert size={15} className="mt-0.5 shrink-0" />
            Couldn’t load {unavailable.join(", ")}. Refresh to try again.
          </div>
        )}
        <section
          aria-label="Workspace summary"
          aria-busy={loading}
          className="grid grid-cols-2 gap-y-5 border-y border-slate-200/80 py-5 dark:border-white/10 lg:grid-cols-4"
        >
          {[
            {
              key: "Appointment Requests",
              label: "Appointment requests",
              source: "appointments",
              page: "appointments-dashboard",
            },
            {
              key: "Patients",
              label: "Patients",
              source: "appointments",
              page: "patients",
            },
            {
              key: "Active Doctors",
              label: "Published doctors",
              source: "doctors",
              page: "doctors",
            },
            {
              key: "Active Services",
              label: "Live services",
              source: "services",
              page: "services",
            },
          ].map((metric, index) => {
            const stat = analytics?.stats?.find(
              (item) => item.label === metric.key
            );
            return (
              <Link
                href={href(metric.page as DashboardPage)}
                key={metric.key}
                className={`group px-4 first:pl-0 sm:px-6 ${index % 2 ? "border-l border-slate-200/80 dark:border-white/10" : "lg:border-l lg:border-slate-200/80 lg:dark:border-white/10"} lg:first:border-0`}
              >
                <div className={`flex items-center gap-2 text-xs ${subtle}`}>
                  {metric.label}
                  <ArrowUpRight
                    size={12}
                    className="opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                </div>
                <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
                  {ready && !unavailable.includes(metric.source)
                    ? (stat?.value ?? "—")
                    : "—"}
                </p>
                <p className={`mt-1.5 text-[11px] leading-5 ${subtle}`}>
                  {loading
                    ? "Loading…"
                    : unavailable.includes(metric.source)
                      ? "Unavailable"
                      : (stat?.note ?? "No information yet")}
                </p>
              </Link>
            );
          })}
        </section>
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-5">
            <section className={panel} aria-label="Recent appointments">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-sm font-semibold">Appointment inbox</h2>
                  {ready && !appointmentsUnavailable && pending > 0 && (
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                      {pending} to review
                    </span>
                  )}
                </div>
                <Link
                  href={href("appointments-dashboard")}
                  className={textLink}
                >
                  View all
                  <ArrowUpRight size={13} />
                </Link>
              </div>
              <div className="flex gap-5 border-b border-slate-100 px-5 dark:border-white/10">
                {(
                  [
                    { id: "all", label: "Recent requests" },
                    { id: "pending", label: "Awaiting approval" },
                  ] as const
                ).map((filter) => (
                  <button
                    type="button"
                    key={filter.id}
                    aria-pressed={requestFilter === filter.id}
                    onClick={() => setRequestFilter(filter.id)}
                    className={`border-b-2 pb-3 text-xs font-medium transition ${requestFilter === filter.id ? "border-[var(--dashboard-accent)] text-[var(--dashboard-accent)]" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              {loading ? (
                <EmptyBlock title="Loading appointments…" />
              ) : appointmentsUnavailable ? (
                <EmptyBlock
                  title="Appointments are unavailable"
                  description="Refresh to reconnect to your appointment inbox."
                />
              ) : rows.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-xs">
                    <thead
                      className={`bg-slate-50/60 text-[11px] dark:bg-white/[0.02] ${subtle}`}
                    >
                      <tr>
                        {["Patient", "Requested slot", "Doctor", "Status"].map(
                          (label) => (
                            <th
                              scope="col"
                              key={label}
                              className="px-5 py-3 font-medium"
                            >
                              {label}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {rows.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
                        >
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              disabled={!organizationId}
                              onClick={() => setSelectedAppointment(item.id)}
                              className="text-left font-medium hover:text-[var(--dashboard-accent)] hover:underline disabled:cursor-default"
                              aria-label={`Review appointment for ${item.patientName}`}
                            >
                              {item.patientName}
                            </button>
                            <p
                              className={`mt-1 max-w-40 truncate text-[11px] ${subtle}`}
                            >
                              {item.reason || item.appointmentMode}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4">
                            <p>
                              {formatDate(item.appointmentDate, item.timezone)}
                            </p>
                            <p className={`mt-1 text-[11px] ${subtle}`}>
                              {item.appointmentTime}
                            </p>
                          </td>
                          <td className="px-5 py-4">{item.doctorName}</td>
                          <td className="px-5 py-4">
                            <span className={statusClassName(item.status)}>
                              {getStatusLabel(item.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex min-h-[230px] flex-col items-center justify-center px-5 py-9 text-center">
                  <CalendarDays
                    size={27}
                    strokeWidth={1.3}
                    className="mb-4 text-slate-400"
                  />
                  <h3 className="text-sm font-medium">
                    {requestFilter === "pending"
                      ? "You’re all caught up"
                      : "No appointment requests yet"}
                  </h3>
                  <p className={`mt-2 max-w-xs text-xs leading-5 ${subtle}`}>
                    {requestFilter === "pending"
                      ? "New requests that need your approval will appear here."
                      : "When patients request a visit, you’ll see their details and requested time here."}
                  </p>
                  <Link
                    href={href(
                      requestFilter === "pending"
                        ? "appointments-dashboard"
                        : profilePage
                    )}
                    className={`${textLink} mt-5`}
                  >
                    {requestFilter === "pending"
                      ? "Open appointments"
                      : "Review your patient-app listing"}
                    <ArrowRight size={13} />
                  </Link>
                </div>
              )}
              <div
                className={`flex items-center gap-1.5 border-t border-slate-100 px-5 py-2.5 text-[10px] dark:border-white/5 ${subtle}`}
              >
                <Clock3 size={12} />
                Requested times are confirmed after approval.
              </div>
            </section>
            <section className={panel}>
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
                <div>
                  <h2 className="text-sm font-semibold">Activity</h2>
                  <p className={`mt-1 text-[11px] ${subtle}`}>
                    {chart?.period ?? "Recent activity"}
                  </p>
                </div>
                <select
                  aria-label="Activity metric"
                  value={chartIndex}
                  onChange={(event) =>
                    setChartIndex(Number(event.target.value))
                  }
                  className={`${control} py-1.5`}
                >
                  {["Appointments", "Doctors", "Services"].map(
                    (label, index) => (
                      <option key={label} value={index}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>
              {loading ? (
                <EmptyBlock title="Loading activity…" />
              ) : chartUnavailable ? (
                <EmptyBlock
                  title="Activity is unavailable"
                  description="Refresh to load this trend."
                />
              ) : !hasTrend ? (
                <div className="m-5 flex min-h-28 items-center gap-4 rounded-lg border border-dashed border-slate-200 p-5 dark:border-white/10">
                  <Clock3
                    aria-hidden="true"
                    size={22}
                    strokeWidth={1.3}
                    className="shrink-0 text-slate-400"
                  />
                  <div>
                    <h3 className="text-xs font-medium">
                      No activity in this period
                    </h3>
                    <p className={`mt-1.5 text-xs leading-5 ${subtle}`}>
                      A trend will appear here as{" "}
                      {chartIndex === 0
                        ? "patients request appointments"
                        : chartIndex === 1
                          ? "doctor profiles are published"
                          : "services are published"}
                      .
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  role="img"
                  aria-label={points
                    .map((point) => `${point.label}: ${point.value}`)
                    .join(", ")}
                  className="mt-3 h-48 pr-5"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={points}
                      accessibilityLayer
                      margin={{ top: 10, right: 0, left: -20, bottom: 10 }}
                    >
                      <CartesianGrid
                        vertical={false}
                        stroke="var(--border, #e2e8f0)"
                        strokeDasharray="3 5"
                      />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        minTickGap={30}
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                      />
                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                      />
                      <Tooltip
                        cursor={{ fill: "#94a3b812" }}
                        contentStyle={{
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#334155",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        name={
                          [
                            "Requests",
                            "Doctors published",
                            "Services published",
                          ][chartIndex]
                        }
                        fill="var(--dashboard-accent)"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={20}
                        isAnimationActive={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {appointmentTotal > 0 && !appointmentsUnavailable && (
                <div className="border-t border-slate-100 p-5 dark:border-white/5">
                  <p className={`mb-3 text-[11px] ${subtle}`}>
                    Appointment status · all loaded requests
                  </p>
                  <div
                    aria-label="Appointment status distribution"
                    className="flex h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5"
                  >
                    {statuses
                      .filter((item) => item.value > 0)
                      .map((item) => (
                        <span
                          key={item.label}
                          title={`${item.label}: ${item.value}`}
                          style={{
                            width: `${(item.value / appointmentTotal) * 100}%`,
                            background: item.color,
                          }}
                        />
                      ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                    {statuses
                      .filter((item) => item.value > 0)
                      .map((item) => (
                        <span
                          key={item.label}
                          className={`flex items-center gap-1.5 text-[10px] ${subtle}`}
                        >
                          <span
                            className="size-1.5 rounded-full"
                            style={{ background: item.color }}
                          />
                          {item.label}
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            {item.value}
                          </span>
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </section>
          </div>
          <aside className="min-w-0 space-y-5">
            <section className={panel}>
              <div className="flex items-center justify-between px-5 pt-4">
                <h2 className="text-sm font-semibold">Patient-app listing</h2>
                <span
                  className={`size-2 rounded-full ${visibility?.isPublic ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}
                  aria-hidden="true"
                />
              </div>
              <div className="p-5 pt-3">
                <p className={`text-xs leading-5 ${subtle}`}>
                  {visibility?.statusLabel ?? "Listing status is unavailable."}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <Link href={href(profilePage)} className={textLink}>
                    Manage profile
                    <ArrowUpRight size={13} />
                  </Link>
                  {visibility?.onToggle && (
                    <button
                      type="button"
                      role="switch"
                      aria-label="Patient-app listing visibility"
                      aria-checked={visibility.isPublic}
                      disabled={visibility.isUpdating}
                      onClick={visibility.onToggle}
                      className={`relative h-5 w-9 rounded-full transition disabled:opacity-50 ${visibility.isPublic ? "bg-[var(--dashboard-brand)]" : "bg-slate-300 dark:bg-slate-600"}`}
                    >
                      <span
                        className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${visibility.isPublic ? "left-0.5 translate-x-4" : "left-0.5"}`}
                      />
                    </button>
                  )}
                </div>
              </div>
            </section>
            <section className={panel}>
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/5">
                <h2 className="text-sm font-semibold">Your doctors</h2>
                <Link href={href("doctors")} className={textLink}>
                  Manage
                  <ArrowUpRight size={13} />
                </Link>
              </div>
              {loading || unavailable.includes("doctors") || !team.length ? (
                <EmptyBlock
                  title={
                    loading
                      ? "Loading doctors…"
                      : unavailable.includes("doctors")
                        ? "Doctor list is unavailable"
                        : "Build your care team"
                  }
                  description={
                    !loading && !unavailable.includes("doctors")
                      ? "Add doctor profiles so patients can find the right specialist."
                      : undefined
                  }
                />
              ) : (
                <ul className="divide-y divide-slate-100 px-5 dark:divide-white/5">
                  {team.slice(0, 4).map((doctor, index) => (
                    <li
                      key={doctor.id ?? `${doctor.title}-${index}`}
                      className="flex items-center gap-3 py-4"
                    >
                      <DoctorAvatar
                        name={doctor.title}
                        imageUrl={doctor.imageUrl}
                        gender={doctor.gender}
                        tone={tone}
                        className="size-10"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          {doctor.title}
                        </p>
                        <p className={`mt-1 truncate text-[11px] ${subtle}`}>
                          {doctor.subtitle}
                        </p>
                      </div>
                      {doctor.badge === "Shown in app" ? (
                        <Check
                          size={14}
                          aria-label="Published"
                          className="shrink-0 text-emerald-600"
                        />
                      ) : (
                        <span className={`text-[10px] ${subtle}`}>
                          {doctor.badge}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className={panel}>
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-sm font-semibold">Services</h2>
                <Link href={href("services")} className={textLink}>
                  Manage
                  <ArrowUpRight size={13} />
                </Link>
              </div>
              {loading ||
              unavailable.includes("services") ||
              !services.length ? (
                <div className="px-5 pb-5">
                  <p className={`text-xs leading-5 ${subtle}`}>
                    {loading
                      ? "Loading services…"
                      : unavailable.includes("services")
                        ? "Services are unavailable."
                        : "List the care you offer, with fees and consultation details."}
                  </p>
                  {!loading && !unavailable.includes("services") && (
                    <Link
                      className={`${textLink} mt-3`}
                      href={href("services")}
                    >
                      Add a service
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 px-5 dark:divide-white/5">
                  {services.slice(0, 3).map((service, index) => (
                    <li
                      key={service.id ?? `${service.title}-${index}`}
                      className="flex items-start justify-between gap-3 py-3 first:pt-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">
                          {service.title}
                        </p>
                        <p className={`mt-1 truncate text-[11px] ${subtle}`}>
                          {service.subtitle}
                        </p>
                      </div>
                      <span className={`shrink-0 text-[11px] ${subtle}`}>
                        {service.meta || service.badge}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>
        {analytics?.activity?.length ? (
          <section className="border-t border-slate-200/80 pt-5 dark:border-white/10">
            <h2 className="text-sm font-semibold">Recent updates</h2>
            <ol className="mt-3 grid gap-x-6 md:grid-cols-2">
              {analytics.activity.slice(0, 4).map((item, index) => (
                <li
                  key={item.id ?? `${item.title}-${index}`}
                  className="flex gap-3 py-3"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600"
                  />
                  <div>
                    <p className="text-xs font-medium">{item.title}</p>
                    <p className={`mt-1 text-[11px] leading-5 ${subtle}`}>
                      {item.subtitle}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>
      {selectedAppointment && organizationId && (
        <AppointmentDetailDialog
          key={`${organizationId}:${selectedAppointment}`}
          appointmentId={selectedAppointment}
          organizationId={organizationId}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
}
function EmptyBlock({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="px-5 py-8">
      <p className="text-xs font-medium">{title}</p>
      {description && (
        <p className={`mt-2 text-xs leading-5 ${subtle}`}>{description}</p>
      )}
    </div>
  );
}
