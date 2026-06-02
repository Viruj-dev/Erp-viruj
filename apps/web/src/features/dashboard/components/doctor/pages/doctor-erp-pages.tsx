"use client";

import {
  CalendarDays,
  Camera,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileBadge,
  FileText,
  Filter,
  GraduationCap,
  Languages,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
  Timer,
  Trash2,
  Upload,
  UserRoundPlus,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { ErpDemoPatients } from "@/features/dashboard/components/hospital/pages/patients";
import { ErpDemoAppointments } from "@/features/dashboard/components/shared/modules/appointments";

const doctorPatients = [
  ["Margot Sterling", "#PA-2041", "Today, 09:15 AM", "12", "Checked-in", "MS", "blue"],
  ["Jameson Burke", "#PA-1988", "Nov 02, 2023", "24", "Medical Alert", "JB", "rose"],
  ["Helena Lowell", "#PA-2115", "Nov 10, 2023", "3", "Scheduled", "HL", "indigo"],
  ["Arthur Reed", "#PA-1842", "Oct 15, 2023", "41", "Completed", "AR", "teal"],
  ["Sarah Davenport", "#PA-2150", "Nov 12, 2023", "1", "Checked-in", "SD", "blue"],
] as const;

const appointments = [
  ["APT-1024", "Margot Sterling", "Today, 08:30 AM", "Clinic", "Confirmed", "Chest discomfort"],
  ["APT-1025", "Jameson Burke", "Today, 10:00 AM", "Online", "Requested", "Follow-up review"],
  ["APT-1026", "Helena Lowell", "Tomorrow, 02:00 PM", "Clinic", "In Progress", "Cardiac rhythm consult"],
  ["APT-1027", "Arthur Reed", "Fri, 04:30 PM", "Clinic", "Completed", "Post procedure review"],
] as const;

const consultations = [
  ["CON-4421", "Margot Sterling", "Hypertension review", "In Progress", "Today, 08:45 AM"],
  ["CON-4418", "Arthur Reed", "Post angioplasty follow-up", "Completed", "Oct 24, 2023"],
  ["CON-4407", "Sarah Davenport", "Preventive cardiology", "Draft", "Oct 21, 2023"],
] as const;

const locations = [
  ["St. Mary's General Hospital", "HOSPITAL", "London", "$180.00", "Active", "Primary"],
  ["The Health Hub Clinic", "CLINIC", "Westminster", "$95.00", "Active", "Secondary"],
  ["Greenwich Outpatient Center", "HOSPITAL", "Greenwich", "$120.00", "Maintenance", "Secondary"],
  ["City Heart Specialist Wing", "CLINIC", "London", "$250.00", "Active", "Secondary"],
] as const;

export function DoctorDashboardPage() {
  return (
    <div className="space-y-7 p-6 lg:p-4">
      <section className="overflow-hidden rounded-[2rem] bg-[#0f766e] p-6 text-white shadow-[0_24px_80px_rgba(15,118,110,0.24)] lg:p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-100/80">
              Individual Doctor Workspace
            </p>
            <h1 className="mt-4 max-w-3xl font-headline text-3xl font-semibold leading-tight tracking-tight lg:text-5xl">
              Dr. Aris Thorne, your practice is ready for today's clinical flow.
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-emerald-50/80">
              Review appointments, keep consultations moving, and watch profile readiness from one doctor ERP command center.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#0f766e] shadow-sm transition hover:bg-emerald-50" type="button">
                <Plus size={16} />
                Add Availability
              </button>
              <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/12 px-4 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/18" type="button">
                <CalendarDays size={16} />
                View Appointments
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white/12 p-5 ring-1 ring-white/18 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/70">
                  Profile Completion
                </p>
                <p className="mt-2 text-4xl font-bold">92%</p>
              </div>
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-[#0f766e]">
                <ShieldCheck size={24} />
              </span>
            </div>
            <div className="mt-6 h-3 rounded-full bg-white/20">
              <div className="h-3 w-[92%] rounded-full bg-white" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <DashboardHeroStat label="Appointments Today" value="12" />
              <DashboardHeroStat label="Patients Seen" value="08" />
              <DashboardHeroStat label="Pending Consults" value="07" />
              <DashboardHeroStat label="Verification" value="Approved" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard accent="border-blue-200" icon={<CalendarDays size={16} />} label="Appointments Today" tone="blue" value="12" />
        <MetricCard accent="border-orange-200" icon={<Clock size={16} />} label="Pending Consultations" tone="orange" value="07" />
        <MetricCard accent="border-green-200" icon={<CheckCircle size={16} />} label="Completed Consults" tone="green" value="128" />
        <MetricCard accent="border-indigo-200" icon={<Users size={16} />} label="New Patients" tone="indigo" value="42" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <HospitalPanel title="Today's Appointments" subtitle="Live operational queue">
          <CompactAppointmentList />
        </HospitalPanel>
        <HospitalPanel title="Profile Readiness" subtitle="Public profile and compliance">
          <ReadinessRows />
        </HospitalPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <HospitalPanel title="Recent Patients" subtitle="Latest patient activity">
          <div className="divide-y divide-slate-200/70 dark:divide-white/[0.07]">
            {doctorPatients.slice(0, 4).map((patient) => (
              <PatientRow
                key={patient[1]}
                initials={patient[5]}
                meta={`${patient[1]} | ${patient[2]}`}
                name={patient[0]}
                status={patient[4]}
                tone={patient[6]}
              />
            ))}
          </div>
        </HospitalPanel>
        <HospitalPanel title="Quick Actions" subtitle="Frequently used doctor workflows">
          <div className="grid gap-3 sm:grid-cols-2">
            {["Update Profile", "Upload Document", "Add Location", "Add Availability", "Start Consultation", "Open Settings"].map((label) => (
              <button
                className="flex h-20 items-center gap-3 rounded-xl bg-slate-100 px-4 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:bg-white/[0.1]"
                key={label}
                type="button"
              >
                <span className="rounded-lg bg-white p-2 text-primary shadow-sm dark:bg-white/[0.1] dark:text-blue-200">
                  <Plus size={16} />
                </span>
                {label}
              </button>
            ))}
          </div>
        </HospitalPanel>
      </div>
    </div>
  );
}

export function DoctorOnboardingCenterPage() {
  const steps = [
    ["Profile Completed", "Done", "Professional profile is ready."],
    ["Verification Submitted", "Done", "Documents submitted for review."],
    ["Verification Approved", "Pending", "Compliance approval is still required."],
    ["Practice Location Added", "Done", "Primary location is configured."],
    ["Availability Configured", "Pending", "Add recurring weekly slots."],
  ] as const;

  return (
    <DoctorPageShell eyebrow="Setup" title="Onboarding Center" subtitle="Complete the readiness checklist before opening the practice to patients.">
      <HospitalPanel title="Progress Tracker" subtitle="60% setup completion">
        <div className="mb-5 h-3 rounded-full bg-slate-100 dark:bg-white/[0.07]">
          <div className="h-3 w-[60%] rounded-full bg-primary dark:bg-blue-500" />
        </div>
        <div className="divide-y divide-slate-200/70 dark:divide-white/[0.07]">
          {steps.map((step, index) => (
            <div className="flex items-center gap-4 py-4" key={step[0]}>
              <span className={step[1] === "Done" ? "flex size-10 items-center justify-center rounded-xl bg-green-50 text-green-600" : "flex size-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600"}>
                {step[1] === "Done" ? <CheckCircle size={18} /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-950 dark:text-slate-100">{step[0]}</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">{step[2]}</p>
              </div>
              <StatusBadge status={step[1]} />
            </div>
          ))}
        </div>
      </HospitalPanel>
    </DoctorPageShell>
  );
}

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
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard accent="border-blue-200" icon={<MapPin size={16} />} label="Total Units" tone="blue" value="08" />
        <MetricCard accent="border-green-200" icon={<CheckCircle size={16} />} label="Active Now" tone="green" value="06" />
        <MetricCard accent="border-orange-200" icon={<Wallet size={16} />} label="Avg Fee" tone="orange" value="$120" />
        <MetricCard accent="border-indigo-200" icon={<MapPin size={16} />} label="Primary City" tone="indigo" value="London" />
      </div>
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

export function DoctorAppointmentsPage() {
  return <ErpDemoAppointments section="review" />;
}

export function DoctorAppointmentDetailPage({ id }: { id?: string }) {
  return (
    <DoctorPageShell eyebrow="Appointment Detail" title={id ?? "APT-1024"} subtitle="Appointment context, patient summary, previous visits, and action controls.">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <HospitalPanel title="Appointment Information" subtitle="Current appointment state">
          <DetailRows rows={[["Status", "Confirmed"], ["Date", "Today, 08:30 AM"], ["Type", "Clinic"], ["Reason", "Chest discomfort"]]} />
        </HospitalPanel>
        <HospitalPanel title="Actions" subtitle="Operational controls">
          <div className="grid gap-2">
            <PrimaryAction label="Start Consultation" />
            <SecondaryAction label="Reschedule" />
            <SecondaryAction label="Cancel Appointment" />
          </div>
        </HospitalPanel>
        <HospitalPanel title="Patient Summary" subtitle="Core patient context">
          <PatientRow initials="MS" meta="42 yrs | Female | #PA-2041" name="Margot Sterling" status="Checked-in" tone="blue" />
        </HospitalPanel>
        <HospitalPanel title="Previous Visits" subtitle="Recent clinical activity">
          <Timeline items={["Oct 24, 2023 | Checked-in", "Sep 18, 2023 | Consultation completed", "Aug 03, 2023 | Report uploaded"]} />
        </HospitalPanel>
      </div>
    </DoctorPageShell>
  );
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

function DoctorPageShell({
  actions,
  children,
  eyebrow,
  subtitle,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  eyebrow: string;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="space-y-7 p-6 lg:p-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-600">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-headline text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-500">
            {subtitle}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

function DashboardHeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/70">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function HospitalPanel({
  children,
  subtitle,
  title,
}: {
  children: ReactNode;
  subtitle?: string;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
      <div className="mb-4">
        <h2 className="font-headline text-base font-semibold text-slate-950 dark:text-slate-100">
          {title}
        </h2>
        {subtitle ? <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  accent,
  icon,
  label,
  tone,
  value,
}: {
  accent: string;
  icon: ReactNode;
  label: string;
  tone: "blue" | "green" | "indigo" | "orange";
  value: string;
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    indigo: "bg-indigo-50 text-indigo-600",
    orange: "bg-orange-50 text-orange-600",
  }[tone];

  return (
    <div className={`rounded-2xl border-2 bg-white/85 p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b] ${accent}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-500">{label}</p>
        <span className={`rounded-lg p-1.5 ${toneClass}`}>{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-950 dark:text-slate-100">{value}</p>
    </div>
  );
}

function DataTable({
  columns,
  headers,
  rows,
}: {
  columns: string;
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
      <div className={`grid ${columns} gap-5 border-b border-slate-200/80 bg-slate-50/80 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-slate-500`}>
        {headers.map((header) => <span key={header}>{header}</span>)}
      </div>
      <div className="divide-y divide-slate-200/70 dark:divide-white/[0.07]">
        {rows.map((row, index) => (
          <div className={`grid ${columns} items-center gap-5 px-6 py-4 text-sm transition hover:bg-slate-50 dark:hover:bg-white/[0.04]`} key={index}>
            {row.map((cell, cellIndex) => <div className="min-w-0" key={cellIndex}>{cell}</div>)}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 px-6 py-4 dark:border-white/[0.08]">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-500">Showing 1 to {rows.length} of 24 records</p>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
          <button className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.08]" type="button"><ChevronLeft size={17} /></button>
          <button className="flex size-9 items-center justify-center rounded-lg bg-primary text-white dark:bg-blue-500" type="button">1</button>
          <button className="flex size-9 items-center justify-center rounded-lg transition hover:bg-slate-100 dark:hover:bg-white/[0.08]" type="button">2</button>
          <button className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.08]" type="button"><ChevronRight size={17} /></button>
        </div>
      </div>
    </section>
  );
}

function Toolbar() {
  return (
    <section className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-600">Filter Schedule</p>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/[0.06]">
          {["Past", "Present", "Upcoming"].map((filter) => (
            <button className={filter === "Present" ? "h-10 rounded-lg bg-white text-xs font-semibold text-primary shadow-sm dark:bg-white/[0.12] dark:text-blue-200" : "h-10 rounded-lg text-xs font-semibold text-slate-500 transition hover:bg-white/70 hover:text-slate-900 dark:text-slate-500"} key={filter} type="button">{filter}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="h-11 w-full rounded-xl border-none bg-slate-100 pl-12 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 dark:bg-white/[0.06]" placeholder="Quick search..." type="text" />
        </div>
        <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-300" type="button"><SlidersHorizontal size={18} /></button>
      </div>
    </section>
  );
}

function FilterBar({ tabs }: { tabs: string[] }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab, index) => (
          <button className={index === 0 ? "h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-white dark:bg-blue-500" : "h-9 rounded-lg bg-slate-100 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-400"} key={tab} type="button">{tab}</button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <SecondaryAction icon={<Filter size={15} />} label="Filters" />
        <SecondaryAction icon={<Search size={15} />} label="Search" />
      </div>
    </div>
  );
}

function PrimaryAction({ icon, label }: { icon?: ReactNode; label: string }) {
  return (
    <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 dark:bg-blue-500 dark:hover:bg-blue-400" type="button">
      {icon}
      {label}
    </button>
  );
}

function SecondaryAction({ icon, label }: { icon?: ReactNode; label: string }) {
  return (
    <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/[0.1]" type="button">
      {icon}
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const statusClass = normalized.includes("rejected") || normalized.includes("alert")
    ? "bg-rose-100 text-rose-800 dark:bg-rose-400/14 dark:text-rose-200"
    : normalized.includes("approved") || normalized.includes("completed") || normalized.includes("active") || normalized.includes("done")
    ? "bg-teal-100 text-teal-800 dark:bg-teal-400/14 dark:text-teal-200"
    : normalized.includes("pending") || normalized.includes("requested") || normalized.includes("review")
    ? "bg-orange-100 text-orange-800 dark:bg-orange-400/14 dark:text-orange-200"
    : "bg-blue-100 text-blue-800 dark:bg-blue-400/14 dark:text-blue-200";

  return <span className={`w-fit rounded-full px-3 py-1 text-[11px] font-medium ${statusClass}`}>{status}</span>;
}

function PatientIdentity({ initials, name, tone }: { initials: string; name: string; tone: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar initials={initials} tone={tone} />
      <p className="truncate font-headline text-[15px] font-semibold text-slate-950 dark:text-slate-100">{name}</p>
    </div>
  );
}

function PatientRow({ initials, meta, name, status, tone }: { initials: string; meta: string; name: string; status: string; tone: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Avatar initials={initials} tone={tone} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-headline text-[15px] font-semibold text-slate-950 dark:text-slate-100">{name}</p>
        <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-500">{meta}</p>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

function Avatar({ initials, tone }: { initials: string; tone: string }) {
  const toneClass = {
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-400/18 dark:text-blue-200",
    indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-400/18 dark:text-indigo-200",
    rose: "bg-rose-100 text-rose-800 dark:bg-rose-400/18 dark:text-rose-200",
    teal: "bg-teal-100 text-teal-800 dark:bg-teal-400/18 dark:text-teal-200",
  }[tone] ?? "bg-slate-200 text-slate-700 dark:bg-slate-600/30 dark:text-slate-200";

  return <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${toneClass}`}>{initials}</span>;
}

function RowActions({ edit = false }: { edit?: boolean }) {
  return (
    <div className="flex justify-end gap-2 text-slate-400">
      {edit ? <Pencil size={17} /> : <Eye size={17} />}
      <MoreHorizontal size={17} />
    </div>
  );
}

function CompactAppointmentList() {
  return (
    <div className="divide-y divide-slate-200/70 dark:divide-white/[0.07]">
      {appointments.slice(0, 4).map((appointment) => (
        <div className="grid gap-3 py-4 text-sm md:grid-cols-[0.8fr_1fr_1fr_auto]" key={appointment[0]}>
          <strong className="text-slate-950 dark:text-slate-100">{appointment[2]}</strong>
          <span>{appointment[1]}</span>
          <span className="text-slate-500">{appointment[5]}</span>
          <StatusBadge status={appointment[4]} />
        </div>
      ))}
    </div>
  );
}

function ReadinessRows() {
  return (
    <div className="space-y-2">
      <SettingsLine label="Verification Status" value="Under Review" />
      <SettingsLine label="Profile Completion" value="92%" />
      <SettingsLine label="Public Profile" value="Enabled" />
      <SettingsLine label="Availability" value="42 hours / week" />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <input className="h-11 w-full rounded-xl border-none bg-slate-100 px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 dark:bg-white/[0.06] dark:text-slate-100" readOnly value={value} />
    </label>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-200">
        <CheckCircle size={16} />
        {value}
      </p>
    </div>
  );
}

function SettingsLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3 text-sm dark:bg-white/[0.06]">
      <span className="font-semibold text-slate-600 dark:text-slate-400">{label}</span>
      <strong className="text-slate-950 dark:text-slate-100">{value}</strong>
    </div>
  );
}

function TextBlock({ text, title }: { text: string; title: string }) {
  return (
    <div className="rounded-xl bg-slate-100 p-4 dark:bg-white/[0.06]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{text}</p>
    </div>
  );
}

function DocumentCard({ description, status, title }: { description: string; status: string; title: string }) {
  const rejected = status === "Rejected";
  return (
    <HospitalPanel title={title} subtitle={description}>
      <div className="flex items-center justify-between">
        <span className={rejected ? "rounded-xl bg-rose-50 p-3 text-rose-700" : "rounded-xl bg-blue-50 p-3 text-blue-700"}>
          {rejected ? <GraduationCap size={20} /> : <FileBadge size={20} />}
        </span>
        <StatusBadge status={status} />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-200/80 pt-4 dark:border-white/[0.08]">
        <span className="text-xs font-semibold text-slate-500">Oct 24, 2023</span>
        <SecondaryAction icon={rejected ? <Upload size={14} /> : <Eye size={14} />} label={rejected ? "Replace" : "View"} />
      </div>
    </HospitalPanel>
  );
}

function DetailRows({ rows }: { rows: Array<[string, string]> }) {
  return <div className="space-y-2">{rows.map((row) => <SettingsLine key={row[0]} label={row[0]} value={row[1]} />)}</div>;
}

function Timeline({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div className="flex gap-3 text-sm" key={item}>
          <span className="mt-1.5 size-2 rounded-full bg-primary dark:bg-blue-400" />
          <span className="font-medium text-slate-700 dark:text-slate-300">{item}</span>
        </div>
      ))}
    </div>
  );
}

function SettingsPanel({ rows, title }: { rows: string[]; title: string }) {
  return (
    <HospitalPanel title={title}>
      <div className="space-y-2">
        {rows.map((row) => (
          <SettingsLine key={row} label={row} value={row.includes("Fee") ? "$120" : row.includes("Timezone") ? "Asia/Kolkata" : row.includes("Locale") ? "en-IN" : "Enabled"} />
        ))}
      </div>
    </HospitalPanel>
  );
}
