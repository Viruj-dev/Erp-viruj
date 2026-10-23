"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/erp/input";
import {
  useDoctorQuery,
  type DoctorAppointment,
  type Page,
} from "@/features/dashboard/lib/doctor-workspace";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DoctorPageShell,
  HospitalPanel,
  StatusBadge,
} from "../_components/doctor-shared-ui";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
export function DoctorAppointmentsPage(_props: { tenant?: ErpTenantContext }) {
  return <DoctorConsultationsPage />;
}
export function DoctorAppointmentDetailPage({
  id,
}: {
  id?: string;
  tenant?: ErpTenantContext;
}) {
  return <DoctorConsultationDetailPage id={id} />;
}
export function DoctorPatientDirectoryPage() {
  return <DoctorConsultationsPage completedOnly />;
}

export function DoctorPatientDetailPage({ id }: { id?: string }) {
  return <DoctorConsultationsPage completedOnly patientId={id} />;
}
export function DoctorConsultationsPage({
  completedOnly = false,
  patientId,
}: { completedOnly?: boolean; patientId?: string } = {}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DoctorAppointment>();
  const q = useDoctorQuery<Page<DoctorAppointment>>(
    `/doctor/appointments?page=${page}&pageSize=20&q=${encodeURIComponent(search)}${completedOnly ? "&status=COMPLETED" : ""}${patientId ? `&patientId=${encodeURIComponent(patientId)}` : ""}`
  );
  return (
    <DoctorPageShell
      eyebrow={completedOnly ? "Patient records" : "Consultations"}
      title={completedOnly ? "Patients" : "Consultations"}
      subtitle={
        completedOnly
          ? "Completed patient appointments across the organisations where you work."
          : "Appointments across your organisations. Staff manage confirmation, cancellation and rescheduling."
      }
    >
      <Input
        aria-label="Search consultations"
        placeholder="Search patient or practice"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      {q.isPending && <p>Loading consultations…</p>}
      {q.isError && (
        <p role="alert">
          Unable to load consultations.{" "}
          <Button onClick={() => void q.refetch()}>Retry</Button>
        </p>
      )}
      {q.data?.data.length === 0 && (
        <HospitalPanel title="No consultations found">
          <p className="text-sm text-muted-foreground">
            Hospital and clinic appointments appear after your account has been
            linked to their doctor roster. A registration number alone does not
            grant access to patient records.
          </p>
        </HospitalPanel>
      )}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted">
            <tr>
              {[
                "Appointment",
                "Patient",
                "Organisation",
                "Date / time",
                "Status",
                ...(completedOnly ? ["Visit details"] : []),
                "Details",
              ].map((h) => (
                <th className="p-4" key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {q.data?.data.map((a) => (
              <tr className="border-t" key={a.id}>
                <td className="p-4">{a.id}</td>
                <td className="p-4">
                  {a.patientDetails?.fullName ||
                    a.patientDetails?.name ||
                    a.patient?.name ||
                    "Patient"}
                </td>
                <td className="p-4">{a.clinic?.name || "Personal practice"}</td>
                <td className="p-4">
                  {new Date(a.startsAt).toLocaleString("en-IN")}
                </td>
                <td className="p-4">
                  <StatusBadge status={a.status} />
                </td>
                {completedOnly && (
                  <td className="p-4">
                    {a.reason || "No visit notes provided"}
                  </td>
                )}
                <td className="p-4">
                  <Button variant="outline" onClick={() => setSelected(a)}>
                    View details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {q.data?.pagination.total ?? 0} appointments · Page {page}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page === 1 || q.isFetching}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={
              q.isFetching || !q.data || page >= q.data.pagination.totalPages
            }
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(undefined);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment details</DialogTitle>
          </DialogHeader>
          {selected && <DoctorVisitDetails appointment={selected} />}
        </DialogContent>
      </Dialog>
    </DoctorPageShell>
  );
}

export function DoctorConsultationDetailPage({ id }: { id?: string }) {
  const q = useDoctorQuery<DoctorAppointment>(
    `/doctor/appointments/${encodeURIComponent(id || "unknown")}`
  );
  return (
    <DoctorPageShell
      eyebrow="Consultation"
      title="Appointment details"
      subtitle="The appointment record shared by your organisation."
    >
      {q.isPending && <p role="status">Loading appointment…</p>}
      {q.isError && (
        <p role="alert">
          Appointment unavailable.{" "}
          <Button onClick={() => void q.refetch()}>Retry</Button>
        </p>
      )}
      {q.data && (
        <HospitalPanel
          title={
            q.data.patientDetails?.fullName ||
            q.data.patientDetails?.name ||
            q.data.patient?.name ||
            "Patient"
          }
        >
          <DoctorVisitDetails appointment={q.data} />
        </HospitalPanel>
      )}
    </DoctorPageShell>
  );
}
function DoctorVisitDetails({
  appointment: a,
}: {
  appointment: DoctorAppointment;
}) {
  const details = a.patientDetails;
  const rows = [
    ["Patient", details?.fullName || details?.name || a.patient?.name],
    ["Organisation", a.clinic?.name],
    ["Appointment", a.id],
    ["Date / time", new Date(a.startsAt).toLocaleString("en-IN")],
    ["Status", a.status],
    ["Phone", details?.phoneNumber || a.patient?.phone],
    ["Age", details?.age],
    ["Gender", details?.gender],
    ["Reason / visit notes", a.reason],
  ];
  return (
    <dl className="divide-y">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-[130px_1fr] gap-3 py-3 text-sm"
        >
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="break-words">{value ?? "Not provided"}</dd>
        </div>
      ))}
    </dl>
  );
}
