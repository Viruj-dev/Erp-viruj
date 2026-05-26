"use client";

import { orpc } from "@/lib/orpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  CalendarDays,
  Check,
  ClipboardCheck,
  Clock,
  FileText,
  Filter,
  Gauge,
  Search,
  Settings,
  SlidersHorizontal,
  Stethoscope,
  TrendingUp,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const appointmentTabs = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "review", label: "Review", icon: ClipboardCheck },
  { id: "patients", label: "Patient Details", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const statusLabels: Record<string, string> = {
  approved: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
  no_show: "No show",
  pending_approval: "Pending Review",
  rejected: "Rejected",
};

type AppointmentTab = (typeof appointmentTabs)[number]["id"];
type AppointmentStatus =
  | "pending_approval"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled"
  | "no_show";

export function ErpDemoAppointments({
  section = "dashboard",
}: {
  section?: AppointmentTab;
}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [decisionReason, setDecisionReason] = useState("");

  const appointmentsQuery = useQuery(orpc.appointments.getAll.queryOptions());
  const updateStatusMutation = useMutation(
    orpc.appointments.updateStatus.mutationOptions({
      onSuccess: async () => {
        setDecisionReason("");
        await queryClient.invalidateQueries({
          queryKey: orpc.appointments.getAll.key(),
        });
      },
    })
  );

  const appointments = appointmentsQuery.data ?? [];
  const departments = useMemo(
    () =>
      Array.from(
        new Set(
          appointments.map(
            (appointment) => appointment.departmentName || "General"
          )
        )
      ).sort(),
    [appointments]
  );
  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "pending_approval"
  );
  const decisionHistory = appointments.filter((appointment) =>
    ["approved", "rejected", "cancelled", "completed", "no_show"].includes(
      appointment.status
    )
  );
  const selectedAppointment =
    appointments.find((appointment) => appointment.id === selectedAppointmentId) ??
    pendingAppointments[0] ??
    appointments[0] ??
    null;
  const filteredReviewAppointments = pendingAppointments.filter(
    (appointment) =>
      matchesAppointmentSearch(appointment, query) &&
      (departmentFilter === "all" ||
        (appointment.departmentName || "General") === departmentFilter)
  );
  const filteredHistory = decisionHistory.filter(
    (appointment) =>
      matchesAppointmentSearch(appointment, query) &&
      (departmentFilter === "all" ||
        (appointment.departmentName || "General") === departmentFilter)
  );

  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === "approved"
  ).length;
  const rejectedCount = appointments.filter(
    (appointment) => appointment.status === "rejected"
  ).length;
  const completedCount = appointments.filter(
    (appointment) => appointment.status === "completed"
  ).length;
  const approvalRate = appointments.length
    ? Math.round((confirmedCount / appointments.length) * 100)
    : 0;

  const handleDecision = (id: string, status: AppointmentStatus) => {
    updateStatusMutation.mutate({
      approvalNotes:
        decisionReason.trim() ||
        (status === "approved"
          ? "Confirmed by appointment handler."
          : "Rejected by appointment handler."),
      id,
      status,
    });
  };

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">
            Appointment Handler
          </p>
          <h1 className="font-headline text-3xl font-black tracking-tight text-on-surface">
            {appointmentTabs.find((tab) => tab.id === section)?.label ??
              "Appointment Operations"}
          </h1>
          <p className="mt-1 max-w-3xl text-sm font-medium text-on-surface-variant">
            Review incoming appointment requests, confirm or reject visits,
            inspect patient appointment history and tune scheduling rules.
          </p>
        </div>
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-right shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
            Tenant Route
          </p>
          <p className="mt-1 text-xs font-black text-primary">
            /hospital/apollo-delhi/appointments/dashboard
          </p>
        </div>
      </div>

      {section === "dashboard" ? (
        <AppointmentDashboard
          approvalRate={approvalRate}
          appointments={appointments}
          completedCount={completedCount}
          confirmedCount={confirmedCount}
          pendingCount={pendingAppointments.length}
          rejectedCount={rejectedCount}
        />
      ) : null}

      {section === "review" ? (
        <ReviewQueue
          appointment={selectedAppointment}
          appointments={filteredReviewAppointments}
          departmentFilter={departmentFilter}
          departments={departments}
          decisionReason={decisionReason}
          isLoading={appointmentsQuery.isPending}
          isUpdating={updateStatusMutation.isPending}
          onDecision={handleDecision}
          onDepartmentFilter={setDepartmentFilter}
          onQuery={setQuery}
          onReason={setDecisionReason}
          onSelect={setSelectedAppointmentId}
          query={query}
          selectedAppointmentId={selectedAppointment?.id ?? null}
        />
      ) : null}

      {section === "patients" ? (
        <PatientDecisionHistory
          appointments={filteredHistory}
          departmentFilter={departmentFilter}
          departments={departments}
          isLoading={appointmentsQuery.isPending}
          onDepartmentFilter={setDepartmentFilter}
          onQuery={setQuery}
          query={query}
        />
      ) : null}

      {section === "settings" ? <AppointmentSettings /> : null}

      {appointmentsQuery.isError ? (
        <div className="rounded-xl border border-error/20 bg-error-container/25 px-4 py-3 text-sm font-bold text-error">
          Unable to load appointments from the backend.
        </div>
      ) : null}

      {updateStatusMutation.isError ? (
        <div className="rounded-xl border border-error/20 bg-error-container/25 px-4 py-3 text-sm font-bold text-error">
          {updateStatusMutation.error.message ||
            "Unable to update appointment status."}
        </div>
      ) : null}
    </div>
  );
}

function AppointmentDashboard({
  approvalRate,
  appointments,
  completedCount,
  confirmedCount,
  pendingCount,
  rejectedCount,
}: {
  approvalRate: number;
  appointments: Array<Record<string, any>>;
  completedCount: number;
  confirmedCount: number;
  pendingCount: number;
  rejectedCount: number;
}) {
  const total = appointments.length || 1;
  const departmentVolume = Object.entries(
    appointments.reduce<Record<string, number>>((acc, appointment) => {
      const department = appointment.departmentName || "General";
      acc[department] = (acc[department] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const trend = [
    confirmedCount,
    pendingCount,
    completedCount,
    rejectedCount,
    Math.max(appointments.length - confirmedCount - pendingCount, 0),
  ];
  const maxTrend = Math.max(...trend, 1);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={CalendarDays}
          label="Total Requests"
          subtext="Live backend records"
          value={appointments.length.toLocaleString()}
        />
        <KpiCard
          icon={Clock}
          label="Pending Review"
          subtext="Need handler decision"
          tone="warning"
          value={pendingCount.toLocaleString()}
        />
        <KpiCard
          icon={Check}
          label="Confirmed"
          subtext={`${approvalRate}% approval rate`}
          tone="success"
          value={confirmedCount.toLocaleString()}
        />
        <KpiCard
          icon={X}
          label="Rejected"
          subtext="Declined or unsafe slots"
          tone="danger"
          value={rejectedCount.toLocaleString()}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                Appointment Analytics
              </p>
              <h2 className="font-headline text-xl font-black text-on-surface">
                Request movement by outcome
              </h2>
            </div>
            <TrendingUp className="text-primary" size={22} />
          </div>
          <div className="mt-8 flex h-64 items-end gap-4 rounded-2xl bg-surface-container-low p-5">
            {trend.map((value, index) => (
              <div className="flex flex-1 flex-col items-center gap-3" key={index}>
                <div
                  className="w-full rounded-t-xl bg-primary shadow-[0_12px_30px_rgba(0,71,141,0.22)]"
                  style={{
                    height: `${Math.max((value / maxTrend) * 100, 8)}%`,
                    opacity: 0.55 + index * 0.08,
                  }}
                />
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-on-surface-variant">
                  {["Ok", "Review", "Done", "Reject", "Other"][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
            Department Load
          </p>
          <h2 className="font-headline text-xl font-black text-on-surface">
            Booking pressure
          </h2>
          <div className="mt-6 space-y-5">
            {departmentVolume.length ? (
              departmentVolume.map(([department, value]) => (
                <div key={department}>
                  <div className="mb-2 flex items-center justify-between text-xs font-black">
                    <span>{department}</span>
                    <span className="text-on-surface-variant">{value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-high">
                    <div
                      className="h-2 rounded-full bg-secondary"
                      style={{ width: `${Math.max((value / total) * 100, 8)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm font-bold text-on-surface-variant">
                No department volume yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <InsightCard title="Queue SLA" value={`${pendingCount} awaiting action`} />
        <InsightCard title="Completion Flow" value={`${completedCount} visits closed`} />
        <InsightCard title="Handler Focus" value="Review pending requests first" />
      </section>
    </div>
  );
}

function ReviewQueue({
  appointment,
  appointments,
  departmentFilter,
  departments,
  decisionReason,
  isLoading,
  isUpdating,
  onDecision,
  onDepartmentFilter,
  onQuery,
  onReason,
  onSelect,
  query,
  selectedAppointmentId,
}: {
  appointment: Record<string, any> | null;
  appointments: Array<Record<string, any>>;
  departmentFilter: string;
  departments: string[];
  decisionReason: string;
  isLoading: boolean;
  isUpdating: boolean;
  onDecision: (id: string, status: AppointmentStatus) => void;
  onDepartmentFilter: (value: string) => void;
  onQuery: (value: string) => void;
  onReason: (value: string) => void;
  onSelect: (id: string) => void;
  query: string;
  selectedAppointmentId: string | null;
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
        <TableToolbar
          departmentFilter={departmentFilter}
          departments={departments}
          onDepartmentFilter={onDepartmentFilter}
          onQuery={onQuery}
          query={query}
          title="Pending Appointment Review"
        />
        <div className="grid grid-cols-[1.1fr_1.25fr_1fr_1fr_1fr] gap-4 border-y border-outline-variant/15 bg-surface-container-low px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
          <span>Time</span>
          <span>Patient</span>
          <span>Provider</span>
          <span>Department</span>
          <span>Mode</span>
        </div>
        {isLoading ? (
          <TableState text="Loading pending requests..." />
        ) : appointments.length ? (
          <div className="divide-y divide-outline-variant/12">
            {appointments.map((item) => (
              <button
                className={`grid w-full grid-cols-[1.1fr_1.25fr_1fr_1fr_1fr] items-center gap-4 px-5 py-4 text-left text-sm transition ${
                  selectedAppointmentId === item.id
                    ? "bg-primary/8"
                    : "hover:bg-surface-container-low"
                }`}
                key={item.id}
                onClick={() => onSelect(item.id)}
                type="button"
              >
                <span>
                  <strong className="block text-on-surface">
                    {item.appointmentTime}
                  </strong>
                  <span className="text-xs text-on-surface-variant">
                    {formatDate(item.appointmentDate)}
                  </span>
                </span>
                <span>
                  <strong className="block truncate text-on-surface">
                    {item.patientName}
                  </strong>
                  <span className="text-xs text-on-surface-variant">
                    {item.patientPhone || "No phone"}
                  </span>
                </span>
                <span className="truncate font-semibold text-on-surface">
                  {item.doctorName}
                </span>
                <span className="truncate text-on-surface-variant">
                  {item.departmentName || "General"}
                </span>
                <span className="font-bold text-primary">
                  {item.appointmentMode}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <TableState text="No pending appointments need review." />
        )}
      </div>

      <aside className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          Decision Controls
        </p>
        {appointment ? (
          <div className="mt-4 space-y-5">
            <div>
              <h2 className="font-headline text-2xl font-black text-on-surface">
                {appointment.patientName}
              </h2>
              <p className="text-sm font-semibold text-on-surface-variant">
                {appointment.patientAge || "Age N/A"} yrs ·{" "}
                {appointment.patientGender || "Gender N/A"} ·{" "}
                {appointment.patientPhone || "No phone"}
              </p>
            </div>
            <DetailGrid appointment={appointment} />
            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-on-surface-variant">
                Request Reason
              </p>
              <p className="mt-2 text-sm font-semibold text-on-surface">
                {appointment.reason || "No reason added by patient."}
              </p>
            </div>
            <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
              Confirmation / rejection reason
              <textarea
                className="mt-2 min-h-28 w-full rounded-xl border border-outline-variant/20 bg-surface px-3 py-3 text-sm font-semibold normal-case tracking-normal text-on-surface outline-none focus:border-primary"
                onChange={(event) => onReason(event.target.value)}
                placeholder="Write why this appointment is confirmed or rejected..."
                value={decisionReason}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-black text-white transition hover:brightness-95 disabled:opacity-60"
                disabled={isUpdating}
                onClick={() => onDecision(appointment.id, "approved")}
                type="button"
              >
                <Check size={16} />
                Confirm
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-error px-4 py-3 text-sm font-black text-white transition hover:brightness-95 disabled:opacity-60"
                disabled={isUpdating}
                onClick={() => onDecision(appointment.id, "rejected")}
                type="button"
              >
                <X size={16} />
                Reject
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm font-bold text-on-surface-variant">
            Select an appointment to review details.
          </p>
        )}
      </aside>
    </section>
  );
}

function PatientDecisionHistory({
  appointments,
  departmentFilter,
  departments,
  isLoading,
  onDepartmentFilter,
  onQuery,
  query,
}: {
  appointments: Array<Record<string, any>>;
  departmentFilter: string;
  departments: string[];
  isLoading: boolean;
  onDepartmentFilter: (value: string) => void;
  onQuery: (value: string) => void;
  query: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
      <TableToolbar
        departmentFilter={departmentFilter}
        departments={departments}
        onDepartmentFilter={onDepartmentFilter}
        onQuery={onQuery}
        query={query}
        title="Confirmed & Rejected Patient History"
      />
      <div className="grid grid-cols-[1.2fr_1.05fr_1fr_1fr_1fr_1.2fr] gap-4 border-y border-outline-variant/15 bg-surface-container-low px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
        <span>Patient</span>
        <span>Date</span>
        <span>Decision</span>
        <span>Provider</span>
        <span>Department</span>
        <span>Reason / Notes</span>
      </div>
      {isLoading ? (
        <TableState text="Loading patient decision history..." />
      ) : appointments.length ? (
        <div className="divide-y divide-outline-variant/12">
          {appointments.map((appointment) => (
            <div
              className="grid grid-cols-[1.2fr_1.05fr_1fr_1fr_1fr_1.2fr] items-center gap-4 px-5 py-4 text-sm"
              key={appointment.id}
            >
              <span>
                <strong className="block text-on-surface">
                  {appointment.patientName}
                </strong>
                <span className="text-xs text-on-surface-variant">
                  {appointment.patientPhone || appointment.patientUserId || "No ID"}
                </span>
              </span>
              <span className="font-semibold text-on-surface">
                {formatDate(appointment.appointmentDate)}
              </span>
              <span className={statusClassName(appointment.status)}>
                {getStatusLabel(appointment.status)}
              </span>
              <span className="truncate font-semibold text-on-surface">
                {appointment.doctorName}
              </span>
              <span className="text-on-surface-variant">
                {appointment.departmentName || "General"}
              </span>
              <span className="line-clamp-2 text-xs font-semibold text-on-surface-variant">
                {appointment.approvalNotes || appointment.reason || "No notes"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <TableState text="No confirmed or rejected patient history yet." />
      )}
    </section>
  );
}

function AppointmentSettings() {
  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          Appointment Settings
        </p>
        <h2 className="font-headline text-2xl font-black text-on-surface">
          Scheduling rules
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["Auto-close stale requests", "Requests older than 72 hours"],
            ["Require rejection reason", "Handlers must explain declined visits"],
            ["Doctor conflict warning", "Detect overlapping confirmed slots"],
            ["Patient duplicate check", "Flag same-day duplicate bookings"],
          ].map(([title, body], index) => (
            <label
              className="flex items-start justify-between gap-4 rounded-2xl bg-surface-container-low p-4"
              key={title}
            >
              <span>
                <span className="block text-sm font-black text-on-surface">
                  {title}
                </span>
                <span className="mt-1 block text-xs font-semibold text-on-surface-variant">
                  {body}
                </span>
              </span>
              <input
                className="mt-1 h-5 w-5 accent-primary"
                defaultChecked={index < 3}
                type="checkbox"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
        <SlidersHorizontal className="text-primary" size={22} />
        <h3 className="mt-4 font-headline text-xl font-black text-on-surface">
          Handler Defaults
        </h3>
        <div className="mt-5 space-y-4">
          <SettingField label="Default review SLA" value="30 minutes" />
          <SettingField label="Queue escalation" value="After 12 pending cases" />
          <SettingField label="Calendar lock window" value="15 minutes before visit" />
        </div>
      </div>
    </section>
  );
}

function TableToolbar({
  departmentFilter,
  departments,
  onDepartmentFilter,
  onQuery,
  query,
  title,
}: {
  departmentFilter: string;
  departments: string[];
  onDepartmentFilter: (value: string) => void;
  onQuery: (value: string) => void;
  query: string;
  title: string;
}) {
  return (
    <div className="grid gap-3 p-5 lg:grid-cols-[1fr_220px_220px]">
      <div>
        <h2 className="font-headline text-xl font-black text-on-surface">
          {title}
        </h2>
        <p className="text-sm font-medium text-on-surface-variant">
          List-first workflow for appointment handler decisions.
        </p>
      </div>
      <label className="relative block">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          size={15}
        />
        <input
          className="h-11 w-full rounded-xl border border-outline-variant/20 bg-surface-container-low py-2 pl-9 pr-3 text-sm font-semibold text-on-surface outline-none focus:border-primary"
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search appointments..."
          value={query}
        />
      </label>
      <label className="relative block">
        <Filter
          className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          size={15}
        />
        <select
          className="h-11 w-full appearance-none rounded-xl border border-outline-variant/20 bg-surface-container-low py-2 pl-9 pr-3 text-sm font-black text-on-surface outline-none focus:border-primary"
          onChange={(event) => onDepartmentFilter(event.target.value)}
          value={departmentFilter}
        >
          <option value="all">All departments</option>
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function DetailGrid({ appointment }: { appointment: Record<string, any> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DetailItem label="Provider" value={appointment.doctorName} />
      <DetailItem label="Department" value={appointment.departmentName || "General"} />
      <DetailItem label="Date" value={formatDate(appointment.appointmentDate)} />
      <DetailItem label="Time" value={appointment.appointmentTime} />
      <DetailItem label="Mode" value={appointment.appointmentMode} />
      <DetailItem label="Status" value={getStatusLabel(appointment.status)} />
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  subtext,
  tone = "default",
  value,
}: {
  icon: typeof Activity;
  label: string;
  subtext: string;
  tone?: "default" | "success" | "warning" | "danger";
  value: string;
}) {
  const toneClass =
    tone === "success"
      ? "bg-secondary/10 text-secondary"
      : tone === "warning"
        ? "bg-primary/10 text-primary"
        : tone === "danger"
          ? "bg-error-container/50 text-error"
          : "bg-surface-container-high text-primary";

  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon size={18} />
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
          Live
        </span>
      </div>
      <p className="mt-5 text-[11px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 font-headline text-4xl font-black text-on-surface">
        {value}
      </p>
      <p className="mt-1 text-sm font-semibold text-on-surface-variant">
        {subtext}
      </p>
    </div>
  );
}

function InsightCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
      <Stethoscope className="text-primary" size={20} />
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
        {title}
      </p>
      <p className="mt-1 text-lg font-black text-on-surface">{value}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-container-low p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-on-surface">{value}</p>
    </div>
  );
}

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
      {label}
      <input
        className="mt-2 h-11 w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 text-sm font-black normal-case tracking-normal text-on-surface outline-none focus:border-primary"
        defaultValue={value}
      />
    </label>
  );
}

function TableState({ text }: { text: string }) {
  return <div className="px-5 py-10 text-sm font-bold text-on-surface-variant">{text}</div>;
}

function matchesAppointmentSearch(appointment: Record<string, any>, query: string) {
  const search = query.toLowerCase().trim();

  if (!search) {
    return true;
  }

  return [
    appointment.patientName,
    appointment.patientPhone,
    appointment.doctorName,
    appointment.departmentName,
    appointment.reason,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(search);
}

function getStatusLabel(status: string) {
  return statusLabels[status] ?? status.replace(/_/g, " ");
}

function statusClassName(status: string) {
  const base =
    "inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]";

  if (status === "approved" || status === "completed") {
    return `${base} bg-secondary-container/45 text-secondary`;
  }

  if (status === "pending_approval") {
    return `${base} bg-primary/10 text-primary`;
  }

  return `${base} bg-error-container/55 text-error`;
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
