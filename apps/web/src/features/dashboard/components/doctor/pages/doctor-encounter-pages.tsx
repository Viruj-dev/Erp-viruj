"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/erp/input";
import {
  useDoctorQuery,
  type DoctorAppointment,
  type Page,
} from "@/features/dashboard/lib/doctor-workspace";
import { Save } from "lucide-react";
import {
  DetailRows,
  DoctorPageShell,
  FilterBar,
  HospitalPanel,
  PatientRow,
  PrimaryAction,
  SecondaryAction,
  StatusBadge,
  TextBlock,
  Timeline,
} from "@/features/dashboard/components/doctor/_components/doctor-shared-ui";
import { ErpDemoPatients } from "@/features/dashboard/components/hospital/pages/patients";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { ErpDemoAppointments } from "@/features/dashboard/components/shared/modules/appointments";

export function DoctorAppointmentsPage({
  tenant,
}: {
  tenant?: ErpTenantContext;
}) {
  return <ErpDemoAppointments section="dashboard" tenant={tenant} />;
}

export function DoctorAppointmentDetailPage({
  id,
  tenant,
}: {
  id?: string;
  tenant?: ErpTenantContext;
}) {
  return (
    <ErpDemoAppointments
      initialAppointmentId={id}
      section="dashboard"
      tenant={tenant}
    />
  );
}

export function DoctorPatientDirectoryPage() {
  return <ErpDemoPatients />;
}

export function DoctorPatientDetailPage({ id }: { id?: string }) {
  return (
    <DoctorPageShell
      eyebrow="Patient Detail"
      title={id ?? "#PA-2041"}
      subtitle="Overview, appointment history, consultation history, reports, notes, and timeline."
    >
      <FilterBar
        tabs={[
          "Overview",
          "Appointments",
          "Consultations",
          "Timeline",
          "Reports",
          "Notes",
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <HospitalPanel title="Overview" subtitle="Patient snapshot">
          <PatientRow
            initials="MS"
            meta="42 yrs | Female | +1 (555) 123-4567"
            name="Margot Sterling"
            status="Checked-in"
            tone="blue"
          />
          <DetailRows
            rows={[
              ["Last Consultation", "Oct 24, 2023"],
              ["Total Visits", "12"],
              ["Status", "Checked-in"],
            ]}
          />
        </HospitalPanel>
        <HospitalPanel
          title="Timeline"
          subtitle="Chronological clinical history"
        >
          <Timeline
            items={[
              "Appointment created",
              "Appointment completed",
              "Consultation completed",
              "Report uploaded",
              "Note created",
            ]}
          />
        </HospitalPanel>
      </div>
    </DoctorPageShell>
  );
}

export function DoctorConsultationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const q = useDoctorQuery<Page<DoctorAppointment>>(
    `/doctor/appointments?page=${page}&pageSize=20&q=${encodeURIComponent(search)}`
  );
  return (
    <DoctorPageShell
      eyebrow="Consultations"
      title="Consultations"
      subtitle="Appointments across your authorised hospital, clinic and personal practices. Staff manage confirmation, cancellation and rescheduling."
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
                  {a.patient?.name || a.patientDetails?.name || "Patient"}
                </td>
                <td className="p-4">{a.clinic?.name || "Personal practice"}</td>
                <td className="p-4">
                  {new Date(a.startsAt).toLocaleString("en-IN")}
                </td>
                <td className="p-4">
                  <StatusBadge status={a.status} />
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
    </DoctorPageShell>
  );
}

export function DoctorConsultationDetailPage({ id }: { id?: string }) {
  return (
    <DoctorPageShell
      eyebrow="Consultation Detail"
      title={id ?? "CON-4421"}
      subtitle="Structured workspace for diagnosis, observations, treatment plan, recommendations, and SOAP notes."
      actions={
        <>
          <SecondaryAction icon={<Save size={15} />} label="Save Draft" />
          <PrimaryAction label="Complete Consultation" />
        </>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <HospitalPanel title="Patient Summary" subtitle="Consultation context">
          <PatientRow
            initials="MS"
            meta="42 yrs | Female | #PA-2041"
            name="Margot Sterling"
            status="Checked-in"
            tone="blue"
          />
        </HospitalPanel>
        <HospitalPanel
          title="Clinical Notes"
          subtitle="SOAP-ready consultation workspace"
        >
          <div className="grid gap-3">
            {[
              "Chief Complaint",
              "Symptoms",
              "Diagnosis",
              "Observations",
              "Treatment Plan",
              "Recommendations",
              "SOAP Notes",
            ].map((item) => (
              <TextBlock
                key={item}
                title={item}
                text="Clinical content captured here with a compact editor area matching the ERP form rhythm."
              />
            ))}
          </div>
        </HospitalPanel>
      </div>
    </DoctorPageShell>
  );
}
