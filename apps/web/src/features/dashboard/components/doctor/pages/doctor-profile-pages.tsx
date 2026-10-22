"use client";

import {
  Camera,
  CheckCircle,
  FileBadge,
  Languages,
  MapPin,
  Plus,
  Save,
  ShieldCheck,
  Upload,
  Wallet,
} from "lucide-react";
import { DoctorProfileForm } from "./doctor-onboarding";
import { DoctorWorkLocationsPage } from "./doctor-work-locations";
import { DoctorCalendarPage } from "./doctor-calendar";
import { locations } from "@/features/dashboard/components/doctor/_components/doctor-mock-data";
import {
  DataTable,
  DetailRows,
  DoctorPageShell,
  DocumentCard,
  Field,
  FilterBar,
  HospitalPanel,
  InfoLine,
  MetricCard,
  PrimaryAction,
  RowActions,
  SecondaryAction,
  SettingsLine,
  SettingsPanel,
  StatusBadge,
  TextBlock,
} from "@/features/dashboard/components/doctor/_components/doctor-shared-ui";

export function DoctorProfileManagementPage() {
  return <DoctorProfileForm />;
}

export function DoctorVerificationVaultPage() {
  const docs = [
    [
      "Medical Registration Certificate",
      "Central Medical Council Registry",
      "Approved",
    ],
    ["MBBS Degree", "Image blurry, corners cropped.", "Rejected"],
    [
      "Specialization Certificate",
      "Post-Graduate Cardiology Dept.",
      "Under Review",
    ],
    ["Government ID", "Passport / National ID Card", "Approved"],
  ] as const;

  return (
    <DoctorPageShell
      eyebrow="Compliance"
      title="Verification"
      subtitle="Manage verification status, credentials, and compliance review."
      actions={
        <>
          <SecondaryAction
            icon={<Upload size={15} />}
            label="Upload Document"
          />
          <PrimaryAction label="Submit For Review" />
        </>
      }
    >
      <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-5 text-blue-950 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-100">
        <div className="flex gap-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h2 className="font-semibold">Verification Under Review</h2>
            <p className="mt-1 text-sm text-blue-900/75 dark:text-blue-100/70">
              Clinical credentials are being verified by the compliance team.
              Typical review time is 24-48 business hours.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {docs.map((doc) => (
          <DocumentCard
            description={doc[1]}
            key={doc[0]}
            status={doc[2]}
            title={doc[0]}
          />
        ))}
      </div>
    </DoctorPageShell>
  );
}

export function DoctorDocumentsPage() {
  const files = [
    [
      "PROFILE_PHOTO",
      "profile-photo.png",
      "Dr. Aris Thorne",
      "Today, 09:18 AM",
    ],
    ["LICENSE", "medical-license.pdf", "Dr. Aris Thorne", "Oct 24, 2023"],
    ["CERTIFICATE", "mbbs-degree.pdf", "Compliance Team", "Oct 14, 2023"],
    ["IDENTITY_DOCUMENT", "passport-id.pdf", "Dr. Aris Thorne", "Oct 12, 2023"],
  ] as const;

  return (
    <DoctorPageShell
      eyebrow="Vault"
      title="Documents"
      subtitle="All uploaded profile, certificate, license, and identity files."
      actions={
        <PrimaryAction icon={<Upload size={16} />} label="Upload File" />
      }
    >
      <DataTable
        columns="grid-cols-[0.9fr_1.4fr_1fr_1fr_90px]"
        headers={["Type", "File", "Uploaded By", "Uploaded At", "Actions"]}
        rows={files.map((file) => [
          <StatusBadge key="type" status={file[0]} />,
          <strong key="file">{file[1]}</strong>,
          file[2],
          file[3],
          <RowActions key="actions" />,
        ])}
      />
    </DoctorPageShell>
  );
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
