"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/erp/input";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { virujBackend } from "@/lib/viruj-backend";
import { useQuery } from "@tanstack/react-query";
import { useState, type CSSProperties } from "react";
import { AppointmentDetailDialog } from "./components/appointment-detail";
import { AppointmentSettings } from "./options/settings";
import type { AppointmentTab } from "./types";
import {
  formatDate,
  getStatusLabel,
  matchesAppointmentSearch,
  statusClassName,
} from "./utils";

export function ErpDemoAppointments({
  section = "dashboard",
  tenant,
  initialAppointmentId,
}: {
  section?: AppointmentTab;
  tenant?: ErpTenantContext;
  initialAppointmentId?: string;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(
    section === "review" ? "pending_approval" : "all"
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    initialAppointmentId ?? null
  );
  const organizationId = tenant?.organizationId;
  const appointments = useQuery({
    enabled: Boolean(organizationId),
    queryKey: virujBackend.appointments.key({ organizationId }),
    queryFn: () => virujBackend.appointments.list({ organizationId }),
    refetchInterval: 15_000,
    retry: false,
  });
  if (!tenant?.capabilities.appointments.enabled)
    return (
      <p className="p-5">Appointments are not enabled for this workspace.</p>
    );
  if (section === "settings")
    return (
      <div className="p-5">
        <AppointmentSettings />
      </div>
    );
  const rows = (appointments.data ?? []).filter(
    (appointment) =>
      matchesAppointmentSearch(appointment, query) &&
      (status === "all" || appointment.status === status)
  );
  const pending =
    appointments.data?.filter(
      (appointment) => appointment.status === "pending_approval"
    ).length ?? 0;
  return (
    <div
      style={
        {
          "--appointment-accent":
            tenant.providerType === "clinic"
              ? "#7c3aed"
              : tenant.providerType === "hospital"
                ? "#2563eb"
                : "#15803d",
        } as CSSProperties
      }
      className="space-y-5 p-5 lg:p-8"
    >
      <div>
        <h2 className="text-2xl font-bold">
          {section === "review"
            ? "Appointment requests"
            : "Appointments and arrivals"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {pending} pending approval. Requested times are confirmed only after
          provider review.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Input
          aria-label="Search appointments"
          className="max-w-sm"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search patient, doctor or reason"
          value={query}
        />
        <select
          aria-label="Appointment status"
          className="rounded-md border bg-background px-3 py-2 text-sm"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          <option value="all">All statuses</option>
          {[
            "pending_approval",
            "approved",
            "rescheduled",
            "completed",
            "rejected",
            "cancelled",
            "no_show",
          ].map((value) => (
            <option key={value} value={value}>
              {getStatusLabel(value)}
            </option>
          ))}
        </select>
        <Button
          disabled={appointments.isFetching}
          onClick={() => void appointments.refetch()}
          variant="outline"
        >
          Refresh
        </Button>
      </div>
      {appointments.isPending ? (
        <p role="status">Loading appointments...</p>
      ) : appointments.isError ? (
        <p role="alert" className="text-error">
          {appointments.error.message} Use Refresh to retry.
        </p>
      ) : rows.length === 0 ? (
        <p>No appointments match these filters.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-background">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
              <tr>
                {[
                  "Patient",
                  "Doctor & mode",
                  "Requested time",
                  "Status",
                  "",
                ].map((heading, index) => (
                  <th className="px-5 py-4 font-medium" scope="col" key={index}>
                    {heading || <span className="sr-only">Actions</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="transition hover:bg-muted/30"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-[var(--appointment-accent)]"
                      >
                        {appointment.patientName.slice(0, 1).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold">
                          {appointment.patientName}
                        </p>
                        <p className="mt-1 max-w-56 truncate text-xs text-muted-foreground">
                          {appointment.approvalNotes ||
                            appointment.reason ||
                            "Consultation"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p>{appointment.doctorName}</p>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      {appointment.appointmentMode}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p>
                      {formatDate(
                        appointment.appointmentDate,
                        appointment.timezone
                      )}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {appointment.appointmentTime} ·{" "}
                      {appointment.timezone || "Asia/Kolkata"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={statusClassName(appointment.status)}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      onClick={() => setSelectedId(appointment.id)}
                      variant="outline"
                      className="border-[var(--appointment-accent)] text-[var(--appointment-accent)]"
                    >
                      {appointment.status === "approved"
                        ? "Details / Verify arrival"
                        : "Review details"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedId ? (
        <AppointmentDetailDialog
          appointmentId={selectedId}
          key={`${tenant.organizationId}:${selectedId}`}
          onClose={() => setSelectedId(null)}
          organizationId={tenant.organizationId}
        />
      ) : null}
    </div>
  );
}
