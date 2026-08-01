"use client";

import { virujBackend, type VirujAppointment, type VirujAppointmentStatus } from "@/lib/viruj-backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { DashboardPageShell } from "@/features/dashboard/components/shared/dashboard-page-shell";
import { PatientDataTable } from "./_components/patient-data-table";
import { pageSize } from "./constants";
import type { DirectoryPatient, PatientRequestForm } from "./types";
import {
  defaultRequestDateTime,
  isFakeAppointment,
  mapAppointmentToPatient,
} from "./utils";

export function ErpDemoPatients({
  organizationId,
  tone = "blue",
}: {
  organizationId?: string;
  tone?: "blue" | "violet";
}) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [requestForm, setRequestForm] = useState<PatientRequestForm>({
    mobileUserId: "x-mobile-user",
    patientAge: "29",
    patientGender: "Female",
    patientName: "Mobile App Patient",
    patientPhone: "+919876543210",
    reason: "Appointment request from mobile app.",
    requestedAt: defaultRequestDateTime(),
  });
  const [lastRequest, setLastRequest] = useState<VirujAppointment | null>(null);

  const appointmentQueryKey = virujBackend.appointments.key({ organizationId });
  const appointmentsQuery = useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => virujBackend.appointments.list({ organizationId }),
    queryKey: appointmentQueryKey,
  });
  const createRequestMutation = useMutation({
    mutationFn: virujBackend.appointments.createMobileRequest,
    onSuccess: async (appointment) => {
      setLastRequest(appointment);
      setPage(1);
      await queryClient.invalidateQueries({ queryKey: appointmentQueryKey });
    },
  });
  const updateStatusMutation = useMutation({
    mutationFn: virujBackend.appointments.updateStatus,
    onSuccess: async (appointment) => {
      setLastRequest(appointment);
      await queryClient.invalidateQueries({ queryKey: appointmentQueryKey });
    },
  });
  const deleteAppointmentsMutation = useMutation({
    mutationFn: async (patientsToDelete: DirectoryPatient[]) => {
      const appointmentIds = patientsToDelete
        .map((patient) => patient.appointmentId)
        .filter((id): id is string => Boolean(id));

      if (!appointmentIds.length) {
        return virujBackend.patients.deleteAll({ organizationId });
      }

      const results = await Promise.all(
        appointmentIds.map((id) =>
          virujBackend.appointments.delete({ id, organizationId })
        )
      );
      return { deleted: results.reduce((sum, result) => sum + result.deleted, 0) };
    },
    onSuccess: async () => {
      setLastRequest(null);
      setPage(1);
      await queryClient.invalidateQueries({ queryKey: appointmentQueryKey });
    },
  });

  const patients = useMemo(
    () =>
      appointmentsQuery.data
        ? appointmentsQuery.data
            .filter((appointment) => !isFakeAppointment(appointment))
            .map(mapAppointmentToPatient)
        : [],
    [appointmentsQuery.data]
  );
  const filteredPatients = useMemo(
    () => filterPatients(patients, search),
    [patients, search]
  );
  const pageCount = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visiblePatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const updateAppointment = useCallback(
    (patient: DirectoryPatient, status: VirujAppointmentStatus) => {
      if (!patient.appointmentId) {
        return;
      }

      if (status === "rescheduled") {
        rescheduleAppointment(patient, status, organizationId, updateStatusMutation.mutate);
        return;
      }

      updateStatusMutation.mutate({
        organizationId,
        approvalNotes:
          status === "approved"
            ? "Approved by ERP user."
            : "Rejected by ERP user.",
        id: patient.appointmentId,
        status,
      });
    },
    [organizationId, updateStatusMutation]
  );

  const sendMobileRequest = () => {
    createRequestMutation.mutate({
      organizationId,
      mobileUserId: requestForm.mobileUserId,
      patientAge: Number(requestForm.patientAge) || null,
      patientGender: requestForm.patientGender,
      patientName: requestForm.patientName,
      patientPhone: requestForm.patientPhone,
      reason: requestForm.reason,
      requestedAt: requestForm.requestedAt
        ? new Date(requestForm.requestedAt).toISOString()
        : undefined,
    });
  };
  const deleteAppointments = (selectedPatients: DirectoryPatient[]) => {
    const confirmed = window.confirm(
      selectedPatients.length
        ? `Delete ${selectedPatients.length === 1 ? "this appointment" : "these appointments"}? This cannot be undone.`
        : "Delete all patients and their linked appointment data from the backend? This cannot be undone."
    );
    if (!confirmed) return;

    deleteAppointmentsMutation.mutate(selectedPatients);
  };

  return (
    <DashboardPageShell
      eyebrow="Patients"
      subtitle="Review patient requests, approval status, appointment movement, and backend patient records."
      title="Patient Directory"
      tone={tone}
    >
      <PatientDataTable
        currentPage={currentPage}
        isDeletingAll={deleteAppointmentsMutation.isPending}
        isReloading={appointmentsQuery.isFetching}
        isUpdating={updateStatusMutation.isPending}
        onDeleteAppointments={deleteAppointments}
        onNextPage={() => setPage((value) => Math.min(pageCount, value + 1))}
        onPreviousPage={() => setPage((value) => Math.max(1, value - 1))}
        onReload={() => void appointmentsQuery.refetch()}
        onSearchChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        onUpdateAppointment={updateAppointment}
        pageCount={pageCount}
        patients={visiblePatients}
        search={search}
        tone={tone}
        totalPatients={filteredPatients.length}
      />
    </DashboardPageShell>
  );
}

function filterPatients(patients: DirectoryPatient[], search: string) {
  const value = search.trim().toLowerCase();

  if (!value) {
    return patients;
  }

  return patients.filter((patient) =>
    [patient.name, patient.doctor]
      .join(" ")
      .toLowerCase()
      .includes(value)
  );
}

function rescheduleAppointment(
  patient: DirectoryPatient,
  status: VirujAppointmentStatus,
  organizationId: string | undefined,
  mutate: (input: {
    approvalNotes?: string | null;
    endsAt?: string | null;
    id: string;
    organizationId?: string;
    startsAt?: string | null;
    status: VirujAppointmentStatus;
  }) => void
) {
  const value = window.prompt("New appointment date/time", "");
  if (!value || !patient.appointmentId) return;

  const startsAt = new Date(value);
  if (Number.isNaN(startsAt.getTime())) {
    window.alert("Please enter a valid date/time.");
    return;
  }

  const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);
  mutate({
    approvalNotes: "Rescheduled by ERP user.",
    organizationId,
    endsAt: endsAt.toISOString(),
    id: patient.appointmentId,
    startsAt: startsAt.toISOString(),
    status,
  });
}

