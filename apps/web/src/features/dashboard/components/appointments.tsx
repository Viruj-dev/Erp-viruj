"use client";

import { orpc } from "@/lib/orpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Check,
  Filter,
  LayoutGrid,
  List,
  MoreVertical,
  RefreshCw,
  Search,
  Stethoscope,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const statusLabels: Record<string, string> = {
  approved: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
  no_show: "No show",
  pending_approval: "Pending",
  rejected: "Rejected",
};

const updateableStatuses = [
  "approved",
  "pending_approval",
  "completed",
  "cancelled",
  "rejected",
  "no_show",
] as const;

type AppointmentStatus = (typeof updateableStatuses)[number];

export function ErpDemoAppointments() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [query, setQuery] = useState("");

  const appointmentsQuery = useQuery(orpc.appointments.getAll.queryOptions());
  const updateStatusMutation = useMutation(
    orpc.appointments.updateStatus.mutationOptions({
      onSuccess: async () => {
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
          appointments
            .map((appointment) => appointment.departmentName || "General")
            .filter(Boolean)
        )
      ).sort(),
    [appointments]
  );
  const filteredAppointments = appointments.filter((appointment) => {
    const searchTarget = [
      appointment.patientName,
      appointment.doctorName,
      appointment.departmentName,
      appointment.hospitalName,
      appointment.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (statusFilter === "all" || appointment.status === statusFilter) &&
      (departmentFilter === "all" ||
        (appointment.departmentName || "General") === departmentFilter) &&
      searchTarget.includes(query.toLowerCase().trim())
    );
  });
  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === "approved"
  ).length;
  const pendingCount = appointments.filter(
    (appointment) => appointment.status === "pending_approval"
  ).length;
  const delayedCount = appointments.filter((appointment) =>
    ["cancelled", "rejected", "no_show"].includes(appointment.status)
  ).length;

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    updateStatusMutation.mutate({
      approvalNotes:
        status === "approved"
          ? "Approved from ERP appointment registry."
          : undefined,
      id,
      status,
    });
  };

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-black tracking-tight text-on-surface">
            Appointments Registry
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-on-surface-variant">
            Manage scheduled clinical visits, approvals and resource allocation
            from live backend appointments.
          </p>
        </div>
        <div className="flex rounded-xl border border-outline-variant/20 bg-white p-1 shadow-sm">
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-black text-white"
            type="button"
          >
            <List size={14} />
            Table View
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black text-on-surface-variant"
            type="button"
          >
            <CalendarDays size={14} />
            Calendar
          </button>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <RegistryMetric
          label="Total visits"
          value={appointments.length.toString()}
        />
        <RegistryMetric
          label="Confirmed"
          tone="confirmed"
          value={confirmedCount.toString()}
        />
        <RegistryMetric
          label="Pending review"
          tone="pending"
          value={pendingCount.toString()}
        />
      </section>

      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[220px_220px_1fr_auto]">
          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
              Date range
            </span>
            <button
              className="flex w-full items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-left text-xs font-black text-on-surface"
              type="button"
            >
              <CalendarDays size={14} />
              Live schedule
            </button>
          </label>
          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
              Department
            </span>
            <select
              className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-xs font-black text-on-surface outline-none focus:border-primary"
              onChange={(event) => setDepartmentFilter(event.target.value)}
              value={departmentFilter}
            >
              <option value="all">All Departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
              Search
            </span>
            <span className="relative block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                size={14}
              />
              <input
                className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-low py-2 pl-9 pr-3 text-xs font-semibold text-on-surface outline-none focus:border-primary"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search records..."
                value={query}
              />
            </span>
          </label>
          <button
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-xs font-black text-on-surface transition hover:bg-surface-container-high"
            type="button"
          >
            <Filter size={14} />
            Advanced Filters
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["all", "approved", "pending_approval", "completed"].map(
            (status) => (
              <button
                className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${
                  statusFilter === status
                    ? "bg-primary text-white"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                }`}
                key={status}
                onClick={() => setStatusFilter(status)}
                type="button"
              >
                {status === "all" ? "All Status" : getStatusLabel(status)}
              </button>
            )
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
        <div className="grid grid-cols-[1.1fr_1.35fr_1.15fr_1fr_1fr_auto] gap-4 border-b border-outline-variant/15 bg-surface-container-low px-5 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
          <span>Time & Date</span>
          <span>Patient</span>
          <span>Provider</span>
          <span>Department</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {appointmentsQuery.isPending ? (
          <TableState text="Loading appointment registry..." />
        ) : appointmentsQuery.isError ? (
          <TableState
            text="Unable to load appointment records from the backend."
            tone="error"
          />
        ) : filteredAppointments.length === 0 ? (
          <TableState text="No appointments match the current filters." />
        ) : (
          <div className="divide-y divide-outline-variant/12">
            {filteredAppointments.map((appointment) => (
              <div
                className="grid grid-cols-[1.1fr_1.35fr_1.15fr_1fr_1fr_auto] items-center gap-4 px-5 py-4 text-sm transition hover:bg-surface-container-low"
                key={appointment.id}
              >
                <div>
                  <p className="font-black text-on-surface">
                    {appointment.appointmentTime}
                  </p>
                  <p className="text-xs font-medium text-on-surface-variant">
                    {formatDate(appointment.appointmentDate)}
                  </p>
                </div>
                <div className="flex min-w-0 items-center gap-3">
                  <InitialAvatar name={appointment.patientName} />
                  <div className="min-w-0">
                    <p className="truncate font-black text-on-surface">
                      {appointment.patientName}
                    </p>
                    <p className="truncate text-xs font-medium text-on-surface-variant">
                      ID: {appointment.patientUserId || appointment.id}
                    </p>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-on-surface">
                    {appointment.doctorName}
                  </p>
                  <p className="truncate text-xs text-on-surface-variant">
                    {appointment.doctorSpecialty || "Clinical provider"}
                  </p>
                </div>
                <span className="w-fit rounded-md bg-surface-container-low px-2 py-1 text-xs font-black text-on-surface-variant">
                  {appointment.departmentName || "General"}
                </span>
                <span className={statusClassName(appointment.status)}>
                  {getStatusLabel(appointment.status)}
                </span>
                <div className="flex items-center justify-end gap-2">
                  <select
                    className="max-w-32 rounded-lg border border-outline-variant/20 bg-white px-2 py-2 text-xs font-black text-on-surface outline-none disabled:opacity-50"
                    disabled={updateStatusMutation.isPending}
                    onChange={(event) =>
                      handleStatusChange(
                        appointment.id,
                        event.target.value as AppointmentStatus
                      )
                    }
                    value={appointment.status}
                  >
                    {updateableStatuses.map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                  <button
                    className="rounded-lg p-2 text-outline transition hover:bg-surface-container-high"
                    type="button"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/15 bg-surface-container-low px-5 py-4 text-xs font-bold text-on-surface-variant">
          <span>
            Showing {filteredAppointments.length} of {appointments.length} live
            appointments
          </span>
          <span className="inline-flex items-center gap-2">
            <LayoutGrid size={14} />
            Delayed or declined: {delayedCount}
          </span>
        </div>
      </section>

      {updateStatusMutation.isError ? (
        <div className="rounded-xl border border-error/20 bg-error-container/25 px-4 py-3 text-sm font-bold text-error">
          {updateStatusMutation.error.message ||
            "Unable to update appointment status."}
        </div>
      ) : null}
    </div>
  );
}

function RegistryMetric({
  label,
  tone = "default",
  value,
}: {
  label: string;
  tone?: "default" | "confirmed" | "pending";
  value: string;
}) {
  const icon =
    tone === "confirmed" ? (
      <Check size={16} />
    ) : tone === "pending" ? (
      <RefreshCw size={16} />
    ) : (
      <Stethoscope size={16} />
    );

  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
          Registry
        </span>
      </div>
      <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 font-headline text-4xl font-black text-on-surface">
        {value}
      </p>
    </div>
  );
}

function InitialAvatar({ name }: { name: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black uppercase text-primary">
      {name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)}
    </div>
  );
}

function TableState({
  text,
  tone = "neutral",
}: {
  text: string;
  tone?: "neutral" | "error";
}) {
  return (
    <div
      className={`px-5 py-10 text-sm font-bold ${
        tone === "error" ? "text-error" : "text-on-surface-variant"
      }`}
    >
      {text}
    </div>
  );
}

function getStatusLabel(status: string) {
  return statusLabels[status] ?? status.replace(/_/g, " ");
}

function statusClassName(status: string) {
  const base =
    "inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]";

  if (status === "approved" || status === "completed") {
    return `${base} bg-secondary-container/45 text-secondary before:h-1.5 before:w-1.5 before:rounded-full before:bg-secondary`;
  }

  if (status === "pending_approval") {
    return `${base} bg-primary/10 text-primary before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary`;
  }

  return `${base} bg-error-container/55 text-error before:h-1.5 before:w-1.5 before:rounded-full before:bg-error`;
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
