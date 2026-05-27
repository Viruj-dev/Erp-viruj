"use client";

import { virujBackend } from "@/lib/viruj-backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { appointmentTabs } from "./constants";
import { AppointmentDashboard } from "./options/dashboard";
import { PatientDecisionHistory } from "./options/patients";
import { ReviewQueue } from "./options/review";
import { AppointmentSettings } from "./options/settings";
import type { AppointmentStatus, AppointmentTab } from "./types";
import { matchesAppointmentSearch } from "./utils";

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

  const appointmentsQuery = useQuery({
    queryFn: virujBackend.appointments.list,
    queryKey: virujBackend.appointments.key,
  });
  const updateStatusMutation = useMutation({
    mutationFn: virujBackend.appointments.updateStatus,
    onSuccess: async () => {
      setDecisionReason("");
      await queryClient.invalidateQueries({
        queryKey: virujBackend.appointments.key,
      });
    },
  });

  const appointments = useMemo(
    () => appointmentsQuery.data ?? [],
    [appointmentsQuery.data]
  );
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
    appointments.find(
      (appointment) => appointment.id === selectedAppointmentId
    ) ??
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
