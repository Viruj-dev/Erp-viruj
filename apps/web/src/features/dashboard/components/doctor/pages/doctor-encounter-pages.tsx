"use client";

import { Plus, Save } from "lucide-react";
import { consultations } from "@/features/dashboard/components/doctor/_components/doctor-mock-data";
import {
  DataTable,
  DetailRows,
  DoctorPageShell,
  FilterBar,
  HospitalPanel,
  PatientRow,
  PrimaryAction,
  RowActions,
  SecondaryAction,
  StatusBadge,
  TextBlock,
  Timeline,
} from "@/features/dashboard/components/doctor/_components/doctor-shared-ui";
import { ErpDemoPatients } from "@/features/dashboard/components/hospital/pages/patients";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { ErpDemoAppointments } from "@/features/dashboard/components/shared/modules/appointments";

export function DoctorAppointmentsPage({ tenant }: { tenant?: ErpTenantContext }) {
  return <ErpDemoAppointments section="dashboard" tenant={tenant} />;
}

export function DoctorAppointmentDetailPage({ id, tenant }: { id?: string; tenant?: ErpTenantContext }) {
  return <ErpDemoAppointments initialAppointmentId={id} section="dashboard" tenant={tenant} />;
}

export function DoctorPatientDirectoryPage() {
  return <ErpDemoPatients />;
}

export function DoctorPatientDetailPage({ id }: { id?: string }) {
  return (
    <DoctorPageShell eyebrow="Patient Detail" title={id ?? "#PA-2041"} subtitle="Overview, appointment history, consultation history, reports, notes, and timeline.">
      <FilterBar tabs={["Overview", "Appointments", "Consultations", "Timeline", "Reports", "Notes"]} />
      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <HospitalPanel title="Overview" subtitle="Patient snapshot">
          <PatientRow initials="MS" meta="42 yrs | Female | +1 (555) 123-4567" name="Margot Sterling" status="Checked-in" tone="blue" />
          <DetailRows rows={[["Last Consultation", "Oct 24, 2023"], ["Total Visits", "12"], ["Status", "Checked-in"]]} />
        </HospitalPanel>
        <HospitalPanel title="Timeline" subtitle="Chronological clinical history">
          <Timeline items={["Appointment created", "Appointment completed", "Consultation completed", "Report uploaded", "Note created"]} />
        </HospitalPanel>
      </div>
    </DoctorPageShell>
  );
}

export function DoctorConsultationsPage() {
  return (
    <DoctorPageShell eyebrow="Consultations" title="Consultations" subtitle="Manage draft, in-progress, and completed clinical consultations." actions={<PrimaryAction icon={<Plus size={16} />} label="Create Consultation" />}>
      <FilterBar tabs={["All", "Draft", "In Progress", "Completed", "Cancelled"]} />
      <DataTable
        columns="grid-cols-[0.9fr_1.2fr_1.5fr_0.9fr_1fr_90px]"
        headers={["Consultation", "Patient", "Diagnosis", "Status", "Date", "Actions"]}
        rows={consultations.map((consultation) => [
          <strong key="id">{consultation[0]}</strong>,
          consultation[1],
          consultation[2],
          <StatusBadge key="status" status={consultation[3]} />,
          consultation[4],
          <RowActions key="actions" />,
        ])}
      />
    </DoctorPageShell>
  );
}

export function DoctorConsultationDetailPage({ id }: { id?: string }) {
  return (
    <DoctorPageShell eyebrow="Consultation Detail" title={id ?? "CON-4421"} subtitle="Structured workspace for diagnosis, observations, treatment plan, recommendations, and SOAP notes." actions={<><SecondaryAction icon={<Save size={15} />} label="Save Draft" /><PrimaryAction label="Complete Consultation" /></>}>
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <HospitalPanel title="Patient Summary" subtitle="Consultation context">
          <PatientRow initials="MS" meta="42 yrs | Female | #PA-2041" name="Margot Sterling" status="Checked-in" tone="blue" />
        </HospitalPanel>
        <HospitalPanel title="Clinical Notes" subtitle="SOAP-ready consultation workspace">
          <div className="grid gap-3">
            {["Chief Complaint", "Symptoms", "Diagnosis", "Observations", "Treatment Plan", "Recommendations", "SOAP Notes"].map((item) => (
              <TextBlock key={item} title={item} text="Clinical content captured here with a compact editor area matching the ERP form rhythm." />
            ))}
          </div>
        </HospitalPanel>
      </div>
    </DoctorPageShell>
  );
}
