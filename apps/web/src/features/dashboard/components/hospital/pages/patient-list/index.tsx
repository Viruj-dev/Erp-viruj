"use client";

import { virujBackend } from "@/lib/viruj-backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DashboardPageShell } from "@/features/dashboard/components/shared/dashboard-page-shell";
import { AppointmentDetailDialog } from "@/features/dashboard/components/shared/modules/appointments/components/appointment-detail";
import { PatientDataTable } from "./_components/patient-data-table";
import { pageSize } from "./constants";
import type { DirectoryPatient } from "./types";
import { isFakeAppointment, mapAppointmentToPatient } from "./utils";

export function ErpDemoPatients({
  organizationId,
  tone = "blue",
}: {
  organizationId?: string;
  tone?: "blue" | "violet";
}) {
  if (!organizationId)
    return (
      <p className="p-5">Select a provider workspace to view appointments.</p>
    );
  return (
    <PatientAppointments
      key={organizationId}
      organizationId={organizationId}
      tone={tone}
    />
  );
}

function PatientAppointments({
  organizationId,
  tone,
}: {
  organizationId: string;
  tone: "blue" | "violet";
}) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const appointmentQueryKey = virujBackend.appointments.key({ organizationId });
  const appointments = useQuery({
    queryFn: () => virujBackend.appointments.list({ organizationId }),
    queryKey: appointmentQueryKey,
    refetchInterval: 15_000,
    retry: false,
  });
  const permissions = useQuery({
    queryKey: [...appointmentQueryKey, "permissions"],
    queryFn: () => virujBackend.appointments.permissions(organizationId),
    retry: false,
  });
  const canDelete = permissions.data?.includes("appointments.write") ?? false;
  const deletion = useMutation({
    mutationFn: async (patientsToDelete: DirectoryPatient[]) => {
      if (!canDelete)
        throw new Error("Appointment management permission is required.");
      const appointmentIds = patientsToDelete
        .map((patient) => patient.appointmentId)
        .filter((id): id is string => Boolean(id));
      if (!appointmentIds.length)
        return virujBackend.patients.deleteAll({ organizationId });
      const results = await Promise.all(
        appointmentIds.map((id) =>
          virujBackend.appointments.delete({ id, organizationId })
        )
      );
      return {
        deleted: results.reduce((sum, result) => sum + result.deleted, 0),
      };
    },
    onSuccess: async () => {
      setPage(1);
      await queryClient.invalidateQueries({ queryKey: appointmentQueryKey });
    },
  });
  const patients = useMemo(
    () =>
      (appointments.data ?? [])
        .filter((appointment) => !isFakeAppointment(appointment))
        .map(mapAppointmentToPatient),
    [appointments.data]
  );
  const filtered = useMemo(
    () =>
      patients.filter((patient) =>
        [patient.name, patient.doctor]
          .join(" ")
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      ),
    [patients, search]
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const deleteAppointments = (selected: DirectoryPatient[]) => {
    if (!canDelete || deletion.isPending) return;
    const confirmed = window.confirm(
      selected.length
        ? `Delete ${selected.length === 1 ? "this appointment" : "these appointments"}? This cannot be undone.`
        : "Delete all patients and their linked appointment data from the backend? This cannot be undone."
    );
    if (confirmed) deletion.mutate(selected);
  };
  return (
    <DashboardPageShell
      eyebrow="Patients"
      subtitle="Review appointment requests, provider decisions and verified arrivals."
      title="Patient Directory"
      tone={tone}
    >
      {appointments.isPending ? (
        <p role="status">Loading patient appointments...</p>
      ) : null}
      {appointments.isError ? (
        <p role="alert" className="text-error">
          {appointments.error.message} Use Reload to retry.
        </p>
      ) : null}
      {deletion.isError ? (
        <p role="alert" className="text-error">
          {deletion.error.message}
        </p>
      ) : null}
      <PatientDataTable
        canDelete={canDelete}
        currentPage={currentPage}
        isDeletingAll={deletion.isPending}
        isReloading={appointments.isFetching}
        onDeleteAppointments={deleteAppointments}
        onNextPage={() => setPage((value) => Math.min(pageCount, value + 1))}
        onPreviousPage={() => setPage((value) => Math.max(1, value - 1))}
        onReload={() => void appointments.refetch()}
        onSearchChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        onViewAppointment={(patient) =>
          setSelectedId(patient.appointmentId ?? null)
        }
        pageCount={pageCount}
        patients={visible}
        search={search}
        tone={tone}
        totalPatients={filtered.length}
      />
      {selectedId ? (
        <AppointmentDetailDialog
          appointmentId={selectedId}
          key={`${organizationId}:${selectedId}`}
          onClose={() => setSelectedId(null)}
          organizationId={organizationId}
        />
      ) : null}
    </DashboardPageShell>
  );
}
