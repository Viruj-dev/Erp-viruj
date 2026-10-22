"use client";
import { Plus, Save } from "lucide-react";
import { DoctorCredentialsPage } from "./doctor-credentials";
import { DoctorProfileForm } from "./doctor-onboarding";
import { DoctorWorkLocationsPage } from "./doctor-work-locations";
import { DoctorCalendarPage } from "./doctor-calendar";
import { DataTable, DoctorPageShell, FilterBar, PrimaryAction, RowActions, SettingsPanel, StatusBadge } from "../_components/doctor-shared-ui";

export function DoctorProfileManagementPage() {
  return <DoctorProfileForm />;
}

export function DoctorVerificationVaultPage() {
  return <DoctorCredentialsPage />;
}
export function DoctorDocumentsPage() {
  return <DoctorCredentialsPage />;
}

export function DoctorPracticeLocationsPage() {
  return <DoctorWorkLocationsPage />;
}
export function DoctorAvailabilityPage() {
  return <DoctorCalendarPage />;
}

export function DoctorLeavesPage() {
  const leaves = [
    ["Nov 14 - Nov 16", "Conference", "Upcoming", "3 days"],
    ["Oct 24 - Oct 28", "Cardiology Summit 2023", "Approved", "5 days"],
    ["Sep 02 - Sep 03", "Personal time", "Past", "2 days"],
  ] as const;

  return (
    <DoctorPageShell
      eyebrow="Schedule"
      title="Leave Management"
      subtitle="Upcoming and past leave periods."
      actions={<PrimaryAction icon={<Plus size={16} />} label="Create Leave" />}
    >
      <FilterBar tabs={["Upcoming", "Past", "All"]} />
      <DataTable
        columns="grid-cols-[1fr_1.4fr_0.8fr_0.8fr_90px]"
        headers={["Duration", "Reason", "Status", "Length", "Actions"]}
        rows={leaves.map((leave) => [
          <strong key="duration">{leave[0]}</strong>,
          leave[1],
          <StatusBadge key="status" status={leave[2]} />,
          leave[3],
          <RowActions key="actions" />,
        ])}
      />
    </DoctorPageShell>
  );
}

export function DoctorSettingsPage() {
  return (
    <DoctorPageShell
      eyebrow="Configuration"
      title="Settings"
      subtitle="Practice behavior, appointment rules, public profile visibility, and notifications."
      actions={
        <PrimaryAction icon={<Save size={16} />} label="Save Settings" />
      }
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <SettingsPanel
          title="Practice Settings"
          rows={[
            "Accept Appointments",
            "Allow Walk-ins",
            "Default Consultation Fee",
            "Timezone",
            "Locale",
          ]}
        />
        <SettingsPanel
          title="Appointment Settings"
          rows={[
            "Accept Online Consultations",
            "Default Slot Duration",
            "Break Duration",
            "Max Patients Per Slot",
          ]}
        />
        <SettingsPanel
          title="Public Profile Settings"
          rows={[
            "Public Profile Enabled",
            "Show Consultation Fee",
            "Show Availability",
          ]}
        />
        <SettingsPanel
          title="Notification Preferences"
          rows={[
            "Appointment Reminders",
            "Verification Updates",
            "Patient Activity Alerts",
          ]}
        />
      </div>
    </DoctorPageShell>
  );
}
