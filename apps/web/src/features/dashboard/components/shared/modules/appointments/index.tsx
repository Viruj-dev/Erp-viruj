"use client";

import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { virujBackend } from "@/lib/viruj-backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PatientDecisionHistory } from "./options/patients";
import { ReviewQueue } from "./options/review";
import { AppointmentSettings } from "./options/settings";
import type { AppointmentStatus, AppointmentTab } from "./types";
import { matchesAppointmentSearch } from "./utils";

export function ErpDemoAppointments({
  section = "dashboard",
  tenant,
}: {
  section?: AppointmentTab;
  tenant?: ErpTenantContext;
}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [decisionReason, setDecisionReason] = useState("");
  const organizationId = tenant?.organizationId;
  const appointmentQueryKey = virujBackend.appointments.key({ organizationId });
  const departmentLabel = tenant?.terminology.departmentLabel ?? "Department";

  const appointmentsQuery = useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => virujBackend.appointments.list({ organizationId }),
    queryKey: appointmentQueryKey,
    retry: false,
  });
  const updateStatusMutation = useMutation({
    mutationFn: virujBackend.appointments.updateStatus,
    onSuccess: async () => {
      setDecisionReason("");
      await queryClient.invalidateQueries({ queryKey: appointmentQueryKey });
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


  const handleDecision = (id: string, status: AppointmentStatus) => {
    updateStatusMutation.mutate({
      approvalNotes:
        decisionReason.trim() ||
        (status === "approved"
          ? "Confirmed by appointment handler."
          : "Rejected by appointment handler."),
      id,
      organizationId,
      status,
    });
  };

  if (!tenant || !tenant.capabilities.appointments.enabled) {
    return (
      <div className="p-5 lg:p-8">
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm font-bold text-muted-foreground">
          Appointments are not enabled for this workspace.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-5 lg:p-8">

      {(section === "review" || section === "dashboard") ? (
        <ReviewQueue
          appointment={selectedAppointment}
          appointments={filteredReviewAppointments}
          departmentFilter={departmentFilter}
          departmentLabel={departmentLabel}
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
          departmentLabel={departmentLabel}
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
