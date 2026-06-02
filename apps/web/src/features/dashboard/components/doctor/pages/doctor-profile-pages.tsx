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
  return (
    <DoctorPageShell
      eyebrow="Profile"
      title="Doctor Profile Management"
      subtitle="Configure professional identity and clinical visibility."
      actions={<><SecondaryAction label="Preview Public Profile" /><PrimaryAction icon={<Save size={16} />} label="Save Changes" /></>}
    >
      <HospitalPanel title="Identity & Personal Details" subtitle="Basic profile data">
        <div className="grid gap-5 xl:grid-cols-[140px_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="relative flex size-24 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-white">
              <span className="text-2xl font-bold">AT</span>
              <button className="absolute bottom-2 right-2 rounded-lg bg-primary p-2 text-white" type="button">
                <Camera size={14} />
              </button>
            </div>
            <SecondaryAction label="Update Photo" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full Name" value="Dr. Aris Thorne" />
            <Field label="Gender" value="Male" />
            <Field label="Date of Birth" value="05/15/1982" />
            <InfoLine label="Profile Status" value="Verified Practitioner" />
          </div>
        </div>
      </HospitalPanel>

      <HospitalPanel title="Professional Information" subtitle="Clinical credentials and expertise">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Primary Specialization" value="Cardiology" />
          <Field label="Qualifications" value="MBBS, MD" />
          <Field label="Years of Experience" value="12 Years" />
          <Field label="Medical Council" value="NMC" />
          <Field label="Registration Number" value="12345" />
          <Field label="Sub Specialization" value="Interventional Cardiology" />
        </div>
      </HospitalPanel>

      <div className="grid gap-4 xl:grid-cols-2">
        <HospitalPanel title="Consultation Fees" subtitle="Patient-facing fee defaults">
          <SettingsLine label="In-person Visit" value="$100" />
          <SettingsLine label="Tele-consultation" value="$75" />
        </HospitalPanel>
        <HospitalPanel title="Languages" subtitle="Languages visible on public profile">
          <div className="flex flex-wrap gap-2">
            {["English", "Spanish"].map((language) => (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-400/14 dark:text-blue-200" key={language}>
                {language}
              </span>
            ))}
            <SecondaryAction icon={<Languages size={14} />} label="Add Language" />
          </div>
        </HospitalPanel>
      </div>

      <HospitalPanel title="About" subtitle="Narrative and professional summary">
        <TextBlock title="Professional Bio" text="Board-certified cardiologist with over 12 years of experience managing complex cardiovascular conditions." />
        <TextBlock title="Career Summary" text="Specializes in preventative cardiology and rhythm disorders, with a focus on minimally invasive procedures." />
      </HospitalPanel>
    </DoctorPageShell>
  );
}

export function DoctorVerificationVaultPage() {
  const docs = [
    ["Medical Registration Certificate", "Central Medical Council Registry", "Approved"],
    ["MBBS Degree", "Image blurry, corners cropped.", "Rejected"],
    ["Specialization Certificate", "Post-Graduate Cardiology Dept.", "Under Review"],
    ["Government ID", "Passport / National ID Card", "Approved"],
  ] as const;

  return (
    <DoctorPageShell
      eyebrow="Compliance"
      title="Verification"
      subtitle="Manage verification status, credentials, and compliance review."
      actions={<><SecondaryAction icon={<Upload size={15} />} label="Upload Document" /><PrimaryAction label="Submit For Review" /></>}
    >
      <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-5 text-blue-950 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-100">
        <div className="flex gap-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h2 className="font-semibold">Verification Under Review</h2>
            <p className="mt-1 text-sm text-blue-900/75 dark:text-blue-100/70">
              Clinical credentials are being verified by the compliance team. Typical review time is 24-48 business hours.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {docs.map((doc) => (
          <DocumentCard description={doc[1]} key={doc[0]} status={doc[2]} title={doc[0]} />
        ))}
      </div>
    </DoctorPageShell>
  );
}

export function DoctorDocumentsPage() {
  const files = [
    ["PROFILE_PHOTO", "profile-photo.png", "Dr. Aris Thorne", "Today, 09:18 AM"],
    ["LICENSE", "medical-license.pdf", "Dr. Aris Thorne", "Oct 24, 2023"],
    ["CERTIFICATE", "mbbs-degree.pdf", "Compliance Team", "Oct 14, 2023"],
    ["IDENTITY_DOCUMENT", "passport-id.pdf", "Dr. Aris Thorne", "Oct 12, 2023"],
  ] as const;

  return (
    <DoctorPageShell eyebrow="Vault" title="Documents" subtitle="All uploaded profile, certificate, license, and identity files." actions={<PrimaryAction icon={<Upload size={16} />} label="Upload File" />}>
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
  return (
    <DoctorPageShell eyebrow="Practice" title="Practice Locations" subtitle="Manage clinical facilities and outpatient consultation hubs." actions={<PrimaryAction icon={<Plus size={16} />} label="Add Location" />}>

      <DataTable
        columns="grid-cols-[1.4fr_0.8fr_0.9fr_0.8fr_0.8fr_90px]"
        headers={["Location", "Type", "City", "Fee", "Status", "Actions"]}
        rows={locations.map((location) => [
          <strong key="name">{location[0]}</strong>,
          <StatusBadge key="type" status={location[1]} />,
          location[2],
          <strong key="fee">{location[3]}</strong>,
          <StatusBadge key="status" status={location[4]} />,
          <RowActions key="actions" edit />,
        ])}
      />
    </DoctorPageShell>
  );
}

export function DoctorAvailabilityPage() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const slots = [
    ["Mon", "08:00 - 11:30", "Morning Clinic"],
    ["Tue", "10:00 - 12:00", "Tele-consults"],
    ["Wed", "14:00 - 17:00", "Evening Rounds"],
    ["Fri", "08:00 - 14:00", "Surgery Blocks"],
  ] as const;

  return (
    <DoctorPageShell eyebrow="Clinical Schedule" title="Availability" subtitle="Weekly calendar, slot duration, break duration, and online consultation rules." actions={<PrimaryAction icon={<Plus size={16} />} label="Add Availability" />}>
      <HospitalPanel title="Weekly Calendar" subtitle="Recurring availability overview">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => (
            <div className="min-h-40 rounded-xl bg-slate-100 p-3 dark:bg-white/[0.06]" key={day}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{day}</p>
              <div className="mt-3 space-y-2">
                {slots.filter((slot) => slot[0] === day).map((slot) => (
                  <div className="rounded-lg bg-white p-3 text-xs shadow-sm dark:bg-white/[0.08]" key={slot[1]}>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{slot[2]}</p>
                    <p className="mt-1 text-slate-500">{slot[1]}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </HospitalPanel>
      <DataTable
        columns="grid-cols-[0.8fr_1fr_1fr_1fr_1fr_90px]"
        headers={["Day", "Time", "Slot Duration", "Break", "Online", "Actions"]}
        rows={slots.map((slot) => [slot[0], slot[1], "30 min", "10 min", <StatusBadge key="online" status="Enabled" />, <RowActions key="actions" edit />])}
      />
    </DoctorPageShell>
  );
}

export function DoctorLeavesPage() {
  const leaves = [
    ["Nov 14 - Nov 16", "Conference", "Upcoming", "3 days"],
    ["Oct 24 - Oct 28", "Cardiology Summit 2023", "Approved", "5 days"],
    ["Sep 02 - Sep 03", "Personal time", "Past", "2 days"],
  ] as const;

  return (
    <DoctorPageShell eyebrow="Schedule" title="Leave Management" subtitle="Upcoming and past leave periods." actions={<PrimaryAction icon={<Plus size={16} />} label="Create Leave" />}>
      <FilterBar tabs={["Upcoming", "Past", "All"]} />
      <DataTable
        columns="grid-cols-[1fr_1.4fr_0.8fr_0.8fr_90px]"
        headers={["Duration", "Reason", "Status", "Length", "Actions"]}
        rows={leaves.map((leave) => [<strong key="duration">{leave[0]}</strong>, leave[1], <StatusBadge key="status" status={leave[2]} />, leave[3], <RowActions key="actions" />])}
      />
    </DoctorPageShell>
  );
}

export function DoctorSettingsPage() {
  return (
    <DoctorPageShell eyebrow="Configuration" title="Settings" subtitle="Practice behavior, appointment rules, public profile visibility, and notifications." actions={<PrimaryAction icon={<Save size={16} />} label="Save Settings" />}>
      <div className="grid gap-4 xl:grid-cols-2">
        <SettingsPanel title="Practice Settings" rows={["Accept Appointments", "Allow Walk-ins", "Default Consultation Fee", "Timezone", "Locale"]} />
        <SettingsPanel title="Appointment Settings" rows={["Accept Online Consultations", "Default Slot Duration", "Break Duration", "Max Patients Per Slot"]} />
        <SettingsPanel title="Public Profile Settings" rows={["Public Profile Enabled", "Show Consultation Fee", "Show Availability"]} />
        <SettingsPanel title="Notification Preferences" rows={["Appointment Reminders", "Verification Updates", "Patient Activity Alerts"]} />
      </div>
    </DoctorPageShell>
  );
}
