"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Clock3,
  Pin,
  RefreshCw,
  Star,
  Users,
  Highlighter,
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
import { Button } from "@/components/ui/button";
import { DoctorOnboarding } from "./doctor-onboarding-flow";
import {
  useDoctorQuery,
  useDoctorTenant,
  type DoctorProfile,
  type DoctorAppointment,
  type CalendarEvent,
  type WorkLocation,
  type WorkingHours,
} from "@/features/dashboard/lib/doctor-workspace";

export type DoctorDashboardData = {
  totalPatientsSeen: number;
  completedAppointments: number;
  patientsSeenToday: number;
  workingOrganizations: number;
  workingDays: string[];
  averageRating: number | null;
  ratingCount: number;
  nextAppointments: DoctorAppointment[];
  patientTrends: {
    timezone: string;
    weekly: { date: string; patients: number }[];
    monthly: { date: string; patients: number }[];
  };
};
const panel =
  "erp-bento rounded-[22px] border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#17191e]";
const muted = "text-slate-500 dark:text-slate-400";
const highlights: Record<string, string> = {
  blue: "border-l-blue-400 bg-blue-50/60 dark:bg-blue-950/20",
  green: "border-l-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/20",
  amber: "border-l-amber-400 bg-amber-50/60 dark:bg-amber-950/20",
  rose: "border-l-rose-400 bg-rose-50/60 dark:bg-rose-950/20",
};
const days = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];
export function doctorCalendarOverview(
  events: CalendarEvent[],
  now = Date.now()
) {
  const sorted = [...events].sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt)
  );
  return {
    upcoming: sorted.filter((e) => Date.parse(e.endsAt) >= now),
    pinned: sorted.filter((e) => e.pinned),
    highlighted: sorted.filter(
      (e) => e.highlight && Date.parse(e.endsAt) >= now
    ),
  };
}
function eventDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
export function DoctorDashboardPage() {
  const tenant = useDoctorTenant();
  const profile = useDoctorQuery<DoctorProfile>("/doctor/profile");
  const stats = useDoctorQuery<DoctorDashboardData>("/doctor/dashboard");
  const calendar = useDoctorQuery<CalendarEvent[]>("/doctor/calendar");
  const workplaces = useDoctorQuery<WorkLocation[]>("/doctor/locations");
  const hours = useDoctorQuery<WorkingHours[]>("/doctor/working-hours");
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const overview = doctorCalendarOverview(calendar.data || []);
  const points = stats.data?.patientTrends?.[period] || [];
  const queries = [profile, stats, calendar, workplaces, hours];
  const refresh = () => {
    for (const query of queries) void query.refetch();
  };
  const data = stats.data;
  const metrics = [
    {
      label: "Patients seen",
      value: data?.totalPatientsSeen,
      note: `${data?.completedAppointments ?? 0} completed visits · ${data?.patientsSeenToday ?? 0} patients today`,
      icon: Users,
      href: tenant.buildRoute("patients"),
    },
    {
      label: "Organisations working with",
      value: data?.workingOrganizations,
      note: "Currently linked hospital, clinic and lab organisations",
      icon: Building2,
      href: tenant.buildRoute("locations"),
    },
    {
      label: "Working days",
      value: data?.workingDays?.length,
      note: data?.workingDays?.length
        ? data.workingDays.map((d) => d.slice(0, 3)).join(" · ")
        : "No recurring working days set",
      icon: CalendarDays,
      href: tenant.buildRoute("availability"),
    },
    {
      label: "Patient rating",
      value:
        data?.averageRating != null && data.ratingCount > 0
          ? `${data.averageRating.toFixed(1)} / 5`
          : undefined,
      note: data?.ratingCount
        ? `${data.ratingCount} patient ratings`
        : "No ratings yet",
      icon: Star,
      href: tenant.buildRoute("profile"),
    },
  ];
  return (
    <div className="erp-overview min-w-0 px-1 py-3 text-slate-900 dark:text-slate-100 sm:px-2 lg:px-3">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
              Your care workspace
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Your practice, at a glance.
            </h1>
            <p className={`mt-1.5 text-sm ${muted}`}>
              Welcome back, {profile.data?.fullName || "Doctor"}. Your patients,
              workplaces and schedule in one place.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={refresh}
              disabled={queries.some((q) => q.isFetching)}
            >
              <RefreshCw size={14} />
              Refresh
            </Button>
            <Button
              asChild
              className="rounded-full bg-emerald-800 text-white hover:bg-emerald-900"
            >
              <Link href={tenant.buildRoute("availability")}>
                Open calendar
                <ArrowUpRight size={15} />
              </Link>
            </Button>
          </div>
        </header>
        {queries.some((q) => q.isError) && (
          <p
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
          >
            Some dashboard information could not load. Refresh to retry.
          </p>
        )}
        <section
          aria-label="Doctor summary"
          aria-busy={stats.isPending}
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {metrics.map((m, i) => (
            <Link
              href={m.href}
              key={m.label}
              className={`${panel} group p-5 transition hover:-translate-y-0.5 hover:shadow-md ${i === 0 ? "!border-emerald-800 !bg-emerald-800 !text-white" : ""}`}
            >
              <div className="mb-5 flex items-center justify-between">
                <span
                  className={`flex size-10 items-center justify-center rounded-2xl ${i === 0 ? "bg-white/10" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"}`}
                >
                  <m.icon size={19} strokeWidth={1.6} />
                </span>
                <ArrowUpRight size={17} className="opacity-50" />
              </div>
              <p className={`text-xs ${i === 0 ? "text-emerald-100" : muted}`}>
                {m.label}
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">
                {stats.isPending ? "…" : stats.isError ? "—" : (m.value ?? "—")}
              </p>
              <p
                className={`mt-2 text-[11px] leading-5 ${i === 0 ? "text-emerald-100/80" : muted}`}
              >
                {stats.isPending
                  ? "Loading…"
                  : stats.isError || !data
                    ? "Unavailable"
                    : m.note}
              </p>
            </Link>
          ))}
        </section>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <section className={`${panel} min-w-0 p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                  Practice insights
                </p>
                <h2 className="mt-2 text-lg font-semibold">
                  Patients seen per day
                </h2>
                <p className={`mt-1 text-xs ${muted}`}>
                  {period === "weekly" ? "Last 7 days" : "This month"} ·
                  Completed appointments ·{" "}
                  {data?.patientTrends?.timezone || "Asia/Kolkata"}
                </p>
              </div>
              <div className="flex gap-1 rounded-lg border p-1">
                {(["weekly", "monthly"] as const).map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant={period === p ? "default" : "ghost"}
                    aria-pressed={period === p}
                    onClick={() => setPeriod(p)}
                  >
                    {p === "weekly" ? "Weekly" : "Monthly"}
                  </Button>
                ))}
              </div>
            </div>
            {stats.isPending ? (
              <p className={`py-16 text-center text-sm ${muted}`} role="status">
                Loading patient activity…
              </p>
            ) : stats.isError ? (
              <p className="py-16 text-sm" role="alert">
                Patient activity unavailable.
              </p>
            ) : (
              <>
                <div
                  className="mt-6 h-64"
                  role="img"
                  aria-label={
                    points
                      .map((p) => `${p.date}: ${p.patients} patients`)
                      .join(", ") || "No patient activity"
                  }
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={points}
                      margin={{ top: 10, right: 0, left: -20, bottom: 10 }}
                      accessibilityLayer
                    >
                      <CartesianGrid
                        vertical={false}
                        stroke="currentColor"
                        opacity={0.08}
                      />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        minTickGap={period === "monthly" ? 30 : 8}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickFormatter={(date) =>
                          new Date(`${date}T12:00:00Z`).toLocaleDateString(
                            "en-IN",
                            period === "weekly"
                              ? { weekday: "short", timeZone: "UTC" }
                              : {
                                  day: "numeric",
                                  month: "short",
                                  timeZone: "UTC",
                                }
                          )
                        }
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                      />
                      <Tooltip
                        cursor={{ fill: "#05966910" }}
                        contentStyle={{
                          borderRadius: 12,
                          background: "var(--card)",
                          color: "var(--card-foreground)",
                        }}
                        labelFormatter={(value) => String(value)}
                      />
                      <Bar
                        dataKey="patients"
                        name="Patients seen"
                        fill="#278565"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={42}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className={`mt-2 text-xs ${muted}`}>
                  {points.some((p) => p.patients > 0)
                    ? "Each patient record is counted once per day, even with repeat visits."
                    : "No completed patient appointments in this period."}
                </p>
              </>
            )}
          </section>
          <section className={`${panel} p-5`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Upcoming appointments</h2>
              <Link
                className="text-xs text-emerald-700 hover:underline dark:text-emerald-300"
                href={tenant.buildRoute("consultations")}
              >
                View all ↗
              </Link>
            </div>
            <p className={`mt-1 text-xs ${muted}`}>
              Across your linked organisations
            </p>
            <div className="mt-4 space-y-3">
              {stats.isPending ? (
                <p className={`text-sm ${muted}`}>Loading appointments…</p>
              ) : stats.isError ? (
                <p role="alert" className="text-sm">
                  Appointments unavailable.
                </p>
              ) : data?.nextAppointments?.length ? (
                data.nextAppointments.map((a) => (
                  <Link
                    key={a.id}
                    href={`${tenant.buildRoute("consultations")}/${encodeURIComponent(a.id)}`}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 transition hover:bg-emerald-50 dark:border-white/10 dark:hover:bg-emerald-950/20"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40">
                      <Users size={17} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {a.patientDetails?.fullName ||
                          a.patient?.name ||
                          "Patient"}
                      </p>
                      <p className={`mt-1 text-xs ${muted}`}>
                        {a.clinic?.name || "Practice"}
                      </p>
                      <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        {eventDate(a.startsAt)}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div
                  className={`rounded-xl border border-dashed p-6 text-center text-sm ${muted}`}
                >
                  <CalendarDays className="mx-auto mb-3" size={24} />
                  No upcoming appointments.
                </div>
              )}
            </div>
          </section>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <DoctorEventList
            title="Pinned events"
            icon="pin"
            events={overview.pinned}
            loading={calendar.isPending}
            error={calendar.isError}
            workplaces={workplaces.data || []}
            href={tenant.buildRoute("availability")}
            empty="Pin an event in your calendar to keep it here."
          />
          <DoctorEventList
            title="Highlighted events"
            icon="highlight"
            events={overview.highlighted}
            loading={calendar.isPending}
            error={calendar.isError}
            workplaces={workplaces.data || []}
            href={tenant.buildRoute("availability")}
            empty="Highlighted upcoming events will appear here."
          />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <DoctorEventList
            title="Your next calendar events"
            icon="calendar"
            events={overview.upcoming}
            loading={calendar.isPending}
            error={calendar.isError}
            workplaces={workplaces.data || []}
            href={tenant.buildRoute("availability")}
            empty="No upcoming calendar events. Plan your next work session or reminder."
          />
          <section className={`${panel} p-5`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Weekly working schedule</h2>
              <Link
                className="text-xs text-emerald-700 hover:underline dark:text-emerald-300"
                href={tenant.buildRoute("doctor-settings")}
              >
                Manage hours ↗
              </Link>
            </div>
            <p className={`mt-1 text-xs ${muted}`}>
              Recurring hours at each workplace · India Standard Time
            </p>
            <div className="mt-4 space-y-3">
              {workplaces.isPending || hours.isPending ? (
                <p className={`text-sm ${muted}`}>Loading working hours…</p>
              ) : workplaces.isError || hours.isError ? (
                <p role="alert" className="text-sm">
                  Working schedule unavailable.
                </p>
              ) : (
                <>
                  {(workplaces.data || []).map((l) => (
                    <div
                      className="rounded-xl border border-slate-100 p-3 dark:border-white/10"
                      key={l.id}
                    >
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        <Building2 size={16} className="text-emerald-600" />
                        {l.name}
                      </p>
                      <p className={`mt-1 text-xs ${muted}`}>
                        {[l.position, l.department].filter(Boolean).join(" · ")}
                      </p>
                      {l.schedules?.length ? (
                        l.schedules.map((s, i) => (
                          <p
                            key={i}
                            className="mt-2 flex items-center gap-2 text-xs"
                          >
                            <Clock3 size={13} className={muted} />
                            {s.dayOfWeek.slice(0, 3)} {s.startTime}–{s.endTime}
                            <span className={muted}>{s.timezone}</span>
                          </p>
                        ))
                      ) : (
                        <p className={`mt-2 text-xs ${muted}`}>
                          Working hours not allocated
                        </p>
                      )}
                    </div>
                  ))}
                  {(hours.data || [])
                    .filter((h) => !h.locationId)
                    .map((h, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-dashed p-3"
                      >
                        <p className="text-sm font-medium">
                          General availability
                        </p>
                        <p className={`mt-2 text-xs ${muted}`}>
                          {days
                            .filter((d) => h.days.includes(d))
                            .map((d) => d.slice(0, 3))
                            .join(" · ")}{" "}
                          {h.startTime}–{h.endTime} IST
                        </p>
                      </div>
                    ))}
                  {!workplaces.data?.length && !hours.data?.length && (
                    <p
                      className={`rounded-xl border border-dashed p-6 text-sm ${muted}`}
                    >
                      No linked workplaces or working hours yet.
                    </p>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
function DoctorEventList({
  title,
  events,
  loading,
  error,
  workplaces,
  href,
  empty,
  icon,
}: {
  title: string;
  events: CalendarEvent[];
  loading: boolean;
  error: boolean;
  workplaces: WorkLocation[];
  href: string;
  empty: string;
  icon: "pin" | "highlight" | "calendar";
}) {
  const Icon =
    icon === "pin" ? Pin : icon === "highlight" ? Highlighter : CalendarDays;
  return (
    <section className={`${panel} p-5`}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Icon size={17} className="text-emerald-600" />
          {title}
          {!loading && !error && (
            <span className={`text-xs font-normal ${muted}`}>
              {events.length}
            </span>
          )}
        </h2>
        <Link
          href={href}
          className="text-xs text-emerald-700 hover:underline dark:text-emerald-300"
        >
          Calendar ↗
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {loading ? (
          <p className={`text-sm ${muted}`}>Loading calendar…</p>
        ) : error ? (
          <p className="text-sm" role="alert">
            Calendar unavailable.
          </p>
        ) : events.length ? (
          events.slice(0, 5).map((e) => (
            <Link
              key={e.id}
              href={href}
              className={`block rounded-xl border-l-[3px] p-3 transition hover:brightness-95 ${highlights[e.highlight] || highlights.blue}`}
            >
              <p className="flex items-center gap-2 text-sm font-semibold">
                {e.pinned && <Pin size={13} />}
                <span>{e.title}</span>
              </p>
              <p className={`mt-1.5 text-xs ${muted}`}>
                {eventDate(e.startsAt)} – {eventDate(e.endsAt)}
              </p>
              <p className={`mt-1.5 text-xs ${muted}`}>
                {workplaces.find((l) => l.id === e.locationId)?.name ||
                  "Personal event"}{" "}
                ·{" "}
                {e.reminderMinutes
                  ? `${e.reminderMinutes} min reminder`
                  : "Reminder at start"}
              </p>
              {e.notes && (
                <p className={`mt-2 line-clamp-2 text-xs ${muted}`}>
                  {e.notes}
                </p>
              )}
              {e.patientsAttended > 0 && (
                <p className={`mt-2 text-xs ${muted}`}>
                  {e.patientsAttended} patients recorded on this event
                </p>
              )}
            </Link>
          ))
        ) : (
          <p className={`rounded-xl border border-dashed p-6 text-sm ${muted}`}>
            {empty}
          </p>
        )}
      </div>
    </section>
  );
}
export function DoctorOnboardingCenterPage() {
  return <DoctorOnboarding />;
}
