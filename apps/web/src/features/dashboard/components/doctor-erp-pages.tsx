"use client";

import {
  BriefcaseMedical,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  CirclePlus,
  Clock3,
  Download,
  EllipsisVertical,
  Eye,
  FileBadge,
  FileText,
  Filter,
  Gauge,
  GraduationCap,
  Languages,
  Map,
  Pencil,
  Plus,
  Printer,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Upload,
  UsersRound,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";

const patientRows = [
  ["Margot Sterling", "42", "Female", "#PA-2041", "Oct 24, 2023", "12", "Checked-in"],
  ["Jameson Burke", "68", "Male", "#PA-1988", "Nov 02, 2023", "24", "Medical Alert"],
  ["Helena Lowell", "31", "Female", "#PA-2115", "Nov 10, 2023", "3", "Scheduled"],
  ["Arthur Reed", "55", "Male", "#PA-1842", "Oct 15, 2023", "41", "Completed"],
  ["Sarah Davenport", "29", "Female", "#PA-2150", "Nov 12, 2023", "1", "Checked-in"],
];

const locations = [
  ["St. Mary's General Hospital", "HOSPITAL", "London", "$180.00", "Active", true],
  ["The Health Hub Clinic", "CLINIC", "Westminster", "$95.00", "Active", false],
  ["Greenwich Outpatient Center", "HOSPITAL", "Greenwich", "$120.00", "Maintenance", false],
  ["City Heart Specialist Wing", "CLINIC", "London", "$250.00", "Active", false],
];

const appointments = [
  ["APT-1024", "Margot Sterling", "Today, 08:30 AM", "Clinic", "Confirmed", "Chest discomfort"],
  ["APT-1025", "Jameson Burke", "Today, 10:00 AM", "Online", "Requested", "Follow-up review"],
  ["APT-1026", "Helena Lowell", "Tomorrow, 02:00 PM", "Clinic", "In Progress", "Cardiac rhythm consult"],
  ["APT-1027", "Arthur Reed", "Fri, 04:30 PM", "Clinic", "Completed", "Post procedure review"],
];

const consultations = [
  ["CON-4421", "Margot Sterling", "Hypertension review", "In Progress", "Today, 08:45 AM"],
  ["CON-4418", "Arthur Reed", "Post angioplasty follow-up", "Completed", "Oct 24, 2023"],
  ["CON-4407", "Sarah Davenport", "Preventive cardiology", "Draft", "Oct 21, 2023"],
];

export function DoctorDashboardPage() {
  return (
    <DoctorWorkspace title="Doctor Dashboard" subtitle="Daily practice control center for consultations, patient movement, and compliance readiness.">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatBox icon={<CalendarDays size={18} />} label="Today" value="12" trend="appointments" />
        <StatBox icon={<Clock3 size={18} />} label="Upcoming" value="34" trend="next 7 days" />
        <StatBox icon={<ClipboardCheck size={18} />} label="Pending" value="07" trend="consultations" />
        <StatBox icon={<CheckCircle2 size={18} />} label="Completed" value="128" trend="this month" />
        <StatBox icon={<UsersRound size={18} />} label="Seen Today" value="09" trend="patients" />
        <StatBox icon={<Gauge size={18} />} label="Profile" value="92%" trend="completion" />
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_0.8fr]">
        <Panel title="Today's Appointments" toolbar={<DoctorButton label="View All" variant="secondary" />}>
          <AppointmentMiniList />
        </Panel>
        <Panel title="Readiness">
          <ReadinessStack />
        </Panel>
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Recent Patients">
          <div className="mt-4 space-y-3">
            {patientRows.slice(0, 4).map((row) => (
              <CompactPerson key={row[3]} meta={`${row[4]} | ${row[6]}`} name={row[0]} />
            ))}
          </div>
        </Panel>
        <Panel title="Quick Actions">
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {["Add Availability", "Upload Document", "Create Location", "Start Consultation", "Update Profile", "Open Settings"].map((label) => (
              <button className="rounded-md border border-slate-200 bg-slate-50 px-4 py-5 text-left text-sm font-bold text-blue-950 hover:bg-blue-50" key={label} type="button">
                <Plus className="mb-3 text-blue-900" size={18} />
                {label}
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </DoctorWorkspace>
  );
}

export function DoctorOnboardingCenterPage() {
  const steps = [
    ["Profile Completed", "Completed", "Professional profile is ready for patient discovery."],
    ["Verification Submitted", "Completed", "Credentials were sent to compliance review."],
    ["Verification Approved", "Pending", "Compliance approval is still required."],
    ["Practice Location Added", "Completed", "Primary location is configured."],
    ["Availability Configured", "Pending", "Add recurring weekly slots."],
  ];
  return (
    <DoctorWorkspace title="Onboarding Center" subtitle="Complete the remaining setup before opening the practice workflow to patients.">
      <section className="rounded-md border border-blue-200 bg-blue-50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-900">Practice readiness</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-950">60% complete</h2>
            <p className="mt-1 text-sm text-slate-600">Finish verification approval and availability to unlock public discovery.</p>
          </div>
          <div className="h-4 w-full max-w-md rounded-full bg-white">
            <div className="h-4 w-[60%] rounded-full bg-blue-900" />
          </div>
        </div>
      </section>
      <div className="mt-6 grid gap-4">
        {steps.map(([title, status, description], index) => (
          <div className="grid gap-4 rounded-md border border-slate-200 bg-white p-5 md:grid-cols-[44px_1fr_auto]" key={title}>
            <span className={status === "Completed" ? "flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" : "flex size-11 items-center justify-center rounded-full bg-amber-100 text-amber-700"}>
              {status === "Completed" ? <CheckCircle2 size={20} /> : index + 1}
            </span>
            <div>
              <h3 className="font-bold">{title}</h3>
              <p className="text-sm text-slate-600">{description}</p>
            </div>
            <Status label={status} tone={status === "Completed" ? "green" : "neutral"} />
          </div>
        ))}
      </div>
    </DoctorWorkspace>
  );
}

export function DoctorAvailabilityPage() {
  const days = ["MON 12", "TUE 13", "WED 14", "THU 15", "FRI 16", "SAT 17", "SUN 18"];
  const times = ["08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", ""];
  const sessions = [
    { day: 0, row: 0, color: "blue", title: "Morning Clinic", time: "08:00 - 11:30" },
    { day: 2, row: 0, color: "blue", title: "Morning Clinic", time: "08:00 - 10:00" },
    { day: 4, row: 0, color: "blue", title: "Surgery Blocks", time: "08:00 - 14:00" },
    { day: 1, row: 1, color: "teal", title: "Tele-Consults", time: "10:00 - 12:00" },
    { day: 0, row: 3, color: "blue", title: "Evening Rounds", time: "14:00 - 18:00" },
    { day: 2, row: 3, color: "blue", title: "Evening Rounds", time: "14:00 - 17:00" },
    { day: 1, row: 4, color: "blue", title: "Evening Rounds", time: "16:00 - 19:00" },
  ];

  return (
    <DoctorWorkspace title="Availability Management" kicker="Clinical Schedule" subtitle="Manage your recurring weekly slots and upcoming leave periods.">
      <div className="mb-5 flex justify-end gap-3">
        <DoctorButton icon={<CalendarDays size={17} />} label="Block Dates" variant="secondary" />
        <DoctorButton icon={<Plus size={17} />} label="Add Availability" />
      </div>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="grid grid-cols-[64px_repeat(7,minmax(86px,1fr))] border-b border-slate-200 bg-slate-100 text-center text-xs font-bold uppercase text-slate-800">
          <div className="px-3 py-4">Time</div>
          {days.map((day, index) => (
            <div className={index > 4 ? "px-3 py-4 text-red-700" : "px-3 py-4"} key={day}>
              {day.split(" ")[0]}
              <span className="block text-[11px]">{day.split(" ")[1]}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[64px_repeat(7,minmax(86px,1fr))]">
          {times.map((time, row) => (
            <ScheduleRow key={`${time}-${row}`} row={row} sessions={sessions} time={time} />
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-100 px-5 py-3 text-xs">
          <div className="flex gap-5">
            <Legend color="bg-blue-800" label="Clinic Sessions" />
            <Legend color="bg-teal-900" label="Tele-Consults" />
            <Legend color="bg-slate-400" label="Unavailable" />
          </div>
          <p>Total Weekly Availability: <strong>42 Hours</strong></p>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[0.7fr_1.5fr]">
        <Panel title="Leave Management" subtitle="Block dates for seminars, vacations, or personal time.">
          <div className="mt-5 rounded-md bg-slate-100 p-4">
            <p className="text-xs uppercase text-slate-500">Quick Status</p>
            <p className="mt-3 text-3xl font-bold text-blue-900">14</p>
            <p className="text-xs text-slate-500">available leave days</p>
          </div>
        </Panel>
        <Panel title="Upcoming & Past Leaves" toolbar={<Segmented labels={["All", "Upcoming", "History"]} />}>
          <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
            <TableHeader columns={["Duration", "Reason / Type", "Status", "Action"]} />
            <div className="grid grid-cols-4 px-5 py-4 text-sm">
              <div><strong>Oct 24 - Oct 28</strong><span className="block text-xs">5 Days</span></div>
              <div><strong>Cardiology Summit 2023</strong><span className="block text-xs">Professional Development</span></div>
              <div><Status label="Approved" tone="blue" /></div>
              <button className="justify-self-start text-blue-900" type="button"><EllipsisVertical size={18} /></button>
            </div>
          </div>
        </Panel>
      </section>
    </DoctorWorkspace>
  );
}

export function DoctorProfileManagementPage() {
  return (
    <DoctorWorkspace actions={<><DoctorButton label="Preview Public Profile" variant="secondary" /><DoctorButton label="Save Changes" /></>} title="Doctor Profile Management" subtitle="Configure your professional identity and clinical visibility.">
      <Panel icon={<FileBadge size={16} />} title="Identity & Personal Details">
        <div className="mt-5 grid gap-6 lg:grid-cols-[110px_1fr]">
          <div className="space-y-3">
            <div className="relative h-24 w-24 overflow-hidden rounded-md bg-slate-900">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#123b55,#0f172a)]" />
              <div className="absolute left-6 top-4 h-12 w-12 rounded-full bg-amber-200" />
              <button className="absolute bottom-2 right-2 rounded-md bg-blue-900 p-1.5 text-white" type="button"><Camera size={14} /></button>
            </div>
            <button className="text-[11px] font-bold uppercase tracking-wide text-blue-900" type="button">Update Photo</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full Name" value="Dr. Aris Thorne" />
            <SelectField label="Gender" value="Male" />
            <Field label="Date of Birth" value="05/15/1982" />
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase text-slate-500">Profile Status</p>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700"><span className="size-2 rounded-full bg-emerald-600" />Verified Practitioner</span>
            </div>
          </div>
        </div>
      </Panel>

      <Panel icon={<BriefcaseMedical size={16} />} title="Clinical Expertise">
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Field label="Primary Specialization" value="Cardiology" />
          <Field label="Qualifications" value="MBBS, MD" />
          <Field label="Years of Experience (YOE)" value="12 Years" />
          <Field label="Medical Council (Registration)" value="NMC" />
          <Field label="Registration Number" value="12345" />
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel icon={<Wallet size={16} />} title="Consultation Fees">
          <FeeRow label="In-person Visit" value="$ 100" />
          <FeeRow label="Tele-consultation" value="$ 75" />
        </Panel>
        <Panel icon={<Languages size={16} />} title="Languages">
          <div className="mt-5 flex flex-wrap gap-2">
            {["English", "Spanish"].map((item) => <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900" key={item}>{item} ×</span>)}
            <button className="rounded-full border border-dashed border-blue-900 px-3 py-1 text-xs font-bold text-blue-900" type="button">+ Add Language</button>
          </div>
        </Panel>
      </div>

      <Panel icon={<FileText size={16} />} title="Narrative & Professional Summary">
        <TextEditor label="Professional Bio" text="Dr. Aris Thorne is a board-certified cardiologist with over 12 years of experience in managing complex cardiovascular conditions. He specializes in preventative cardiology and heart rhythm disorders, having trained at some of the world's leading medical institutions." />
        <TextEditor label="Career Summary" text="Extensive background in interventional cardiology with a focus on minimally invasive procedures. Currently serving as a Senior Consultant at Metropolitan Heart Institute." />
      </Panel>

      <div className="flex items-center gap-4 rounded-md border border-blue-200 bg-blue-50 p-4">
        <span className="rounded-md bg-blue-900 px-2 py-2 text-sm font-bold text-white">92%</span>
        <div className="flex-1">
          <p className="text-sm font-bold">Profile Completion Score</p>
          <p className="text-xs text-slate-600">Almost there! Add a detailed patient satisfaction summary to reach 100%.</p>
        </div>
        <div className="h-2 w-52 rounded-full bg-blue-100"><div className="h-2 w-[92%] rounded-full bg-blue-900" /></div>
        <Save className="text-blue-900" size={18} />
      </div>
    </DoctorWorkspace>
  );
}

export function DoctorPatientDirectoryPage() {
  return (
    <DoctorWorkspace actions={<DoctorButton icon={<CirclePlus size={17} />} label="Add New Patient" />} kicker="Clinical Architect / Patient Directory" title="Patient Directory">
      <div className="grid gap-5 md:grid-cols-3">
        <StatBox icon={<UsersRound size={18} />} label="Total Patients" trend="12% from last month" value="2,842" />
        <StatBox icon={<ShieldCheck size={18} />} label="Active This Week" trend="Stable trend" value="158" />
        <StatBox icon={<CirclePlus size={18} />} label="New Admissions" trend="8.4% increase" value="42" />
      </div>
      <section className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 p-3">
          <div className="flex gap-2">
            <DoctorButton icon={<Filter size={14} />} label="All Patients" variant="secondary" />
            <DoctorButton icon={<CalendarDays size={14} />} label="Date Range" variant="secondary" />
          </div>
          <div className="flex gap-2">
            <IconButton icon={<Download size={15} />} />
            <IconButton icon={<Printer size={15} />} />
          </div>
        </div>
        <div className="min-w-[760px]">
          <TableHeader columns={["Patient Name", "Age", "Gender", "Patient ID", "Last Visit", "Total Visits", "Status", "Action"]} />
          {patientRows.map((row) => (
            <div className="grid grid-cols-[1.45fr_0.45fr_0.75fr_0.9fr_0.9fr_0.8fr_0.9fr_0.35fr] items-center border-t border-slate-100 px-5 py-4 text-sm" key={row[3]}>
              <div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-900">{row[0].split(" ").map((part) => part[0]).join("")}</span><div><strong>{row[0]}</strong><span className="block text-xs text-slate-500">+1 (555) 123-4567</span></div></div>
              {row.slice(1, 6).map((cell) => <span key={cell}>{cell}</span>)}
              <Status label={row[6]} tone={row[6] === "Medical Alert" ? "red" : row[6] === "Completed" ? "green" : "blue"} />
              <button type="button"><EllipsisVertical size={16} /></button>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-xs">
          <span>Showing 1 to 5 of 2,842 patients</span>
          <div className="flex items-center gap-2"><span className="text-slate-400">‹</span><span className="rounded bg-blue-900 px-3 py-1.5 text-white">1</span><span>2</span><span>3</span><span>...</span><span>568</span><span>›</span></div>
        </div>
      </section>
    </DoctorWorkspace>
  );
}

export function DoctorPracticeLocationsPage() {
  return (
    <DoctorWorkspace actions={<DoctorButton icon={<Plus size={17} />} label="Add Location" />} title="Practice Locations" subtitle="Manage clinical facilities and outpatient consultation hubs.">
      <div className="grid gap-4 md:grid-cols-4">
        <StatBox icon={<BriefcaseMedical size={18} />} label="Total Units" value="08" />
        <StatBox icon={<CheckCircle2 size={18} />} label="Active Now" value="06" />
        <StatBox icon={<Wallet size={18} />} label="Avg Fee" value="$120" />
        <StatBox icon={<Map size={18} />} label="Primary City" value="London" />
      </div>
      <section className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white">
        <TableHeader columns={["Primary", "Location Name", "Type", "City", "Fee (USD)", "Status", "Actions"]} />
        {locations.map((row) => (
          <div className="grid grid-cols-[0.7fr_1.8fr_1fr_1.2fr_1fr_1fr_0.5fr] items-center border-t border-slate-100 px-5 py-6 text-sm" key={row[0].toString()}>
            <Toggle active={Boolean(row[5])} />
            <strong>{row[0]}</strong>
            <Status label={row[1].toString()} tone={row[1] === "CLINIC" ? "green" : "blue"} />
            <span>{row[2]}</span>
            <strong>{row[3]}</strong>
            <Status label={row[4].toString()} tone={row[4] === "Maintenance" ? "neutral" : "green"} />
            <div className="flex flex-col gap-3"><Pencil size={14} /><Trash2 size={14} /></div>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm">
          <span>Showing 4 of 8 locations</span>
          <div className="flex gap-2"><DoctorButton label="Previous" variant="secondary" /><DoctorButton label="Next" /></div>
        </div>
      </section>
      <button className="fixed bottom-8 right-8 flex size-14 items-center justify-center rounded-xl bg-blue-900 text-white shadow-xl" type="button"><Plus size={24} /></button>
    </DoctorWorkspace>
  );
}

export function DoctorVerificationVaultPage() {
  const docs = [
    ["Medical Registration Certificate", "Central Medical Council Registry", "Oct 12, 2023", "Approved"],
    ["MBBS Degree", "Image blurry, corners cropped.", "Oct 14, 2023", "Rejected"],
    ["Specialization Certificate", "Post-Graduate Cardiology Dept.", "Oct 23, 2023", "Under Review"],
    ["Government ID", "Passport / National ID Card", "Oct 12, 2023", "Approved"],
  ];
  return (
    <DoctorWorkspace>
      <div className="rounded-md border border-blue-300 bg-blue-50 p-5">
        <div className="flex gap-4">
          <span className="rounded-md bg-blue-900 p-3 text-white"><ShieldCheck size={20} /></span>
          <div>
            <h2 className="font-bold text-blue-900">Verification Under Review</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-700">Your clinical credentials have been submitted and are currently being verified by our compliance team. This typically takes 24-48 business hours.</p>
            <p className="mt-3 text-xs font-bold uppercase text-blue-900">Status: Submitted <span className="ml-5 font-normal normal-case text-slate-600">Last update: Oct 24, 2023 at 09:15 AM</span></p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Document Vault</h1>
          <p className="text-sm text-slate-600">Manage and verify your professional medical documentation.</p>
        </div>
        <div className="flex gap-3"><DoctorButton icon={<Upload size={15} />} label="Upload Document" variant="secondary" /><DoctorButton label="Submit for Final Review" /></div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {docs.map((doc) => <DocumentCard key={doc[0]} date={doc[2]} description={doc[1]} status={doc[3]} title={doc[0]} />)}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.65fr]">
        <Panel icon={<ShieldCheck size={16} />} title="Verification Guidelines">
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-slate-700">
            <li>Ensure all documents are uploaded in high resolution.</li>
            <li>Supported file formats include PDF, JPEG, and PNG.</li>
            <li>Medical Council registration must be valid for the current calendar year.</li>
          </ol>
        </Panel>
        <div className="rounded-md bg-slate-950 p-6 text-white">
          <h3 className="font-bold">Need Assistance?</h3>
          <p className="mt-3 text-sm text-slate-300">If you are facing issues with document verification, our compliance team is here to help.</p>
          <button className="mt-6 w-full border border-white/40 py-3 text-sm font-bold" type="button">Contact Compliance</button>
          <button className="mt-3 w-full bg-blue-900 py-3 text-sm font-bold" type="button">Knowledge Base</button>
        </div>
      </div>
    </DoctorWorkspace>
  );
}

export function DoctorDocumentsPage() {
  const files = [
    ["PROFILE_PHOTO", "profile-photo.png", "Dr. Aris Thorne", "Today, 09:18 AM"],
    ["LICENSE", "medical-license.pdf", "Dr. Aris Thorne", "Oct 24, 2023"],
    ["CERTIFICATE", "mbbs-degree.pdf", "Compliance Team", "Oct 14, 2023"],
    ["IDENTITY_DOCUMENT", "passport-id.pdf", "Dr. Aris Thorne", "Oct 12, 2023"],
  ];
  return (
    <DoctorWorkspace actions={<DoctorButton icon={<Upload size={15} />} label="Upload File" />} title="Documents" subtitle="Reusable file vault for profile photos, certificates, licenses, and identity documents.">
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <TableHeader columns={["Type", "File", "Uploaded By", "Uploaded At", "Actions"]} />
        {files.map((file) => (
          <div className="grid grid-cols-5 items-center border-t border-slate-100 px-5 py-4 text-sm" key={file[1]}>
            <Status label={file[0]} tone="blue" />
            <strong>{file[1]}</strong>
            <span>{file[2]}</span>
            <span>{file[3]}</span>
            <div className="flex gap-3 text-blue-900"><Eye size={16} /><Download size={16} /><Trash2 size={16} /></div>
          </div>
        ))}
      </section>
    </DoctorWorkspace>
  );
}

export function DoctorLeavesPage() {
  const leaves = [
    ["Nov 14 - Nov 16", "Conference", "Upcoming", "3 days"],
    ["Oct 24 - Oct 28", "Cardiology Summit 2023", "Approved", "5 days"],
    ["Sep 02 - Sep 03", "Personal time", "Past", "2 days"],
  ];
  return (
    <DoctorWorkspace actions={<DoctorButton icon={<Plus size={15} />} label="Create Leave" />} title="Leave Management" subtitle="Plan upcoming absences and review historical leave blocks.">
      <div className="mb-5 flex gap-2"><Segmented labels={["Upcoming", "Past", "All"]} /></div>
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <TableHeader columns={["Duration", "Reason", "Status", "Length", "Actions"]} />
        {leaves.map((leave) => (
          <div className="grid grid-cols-5 items-center border-t border-slate-100 px-5 py-4 text-sm" key={leave[0]}>
            <strong>{leave[0]}</strong>
            <span>{leave[1]}</span>
            <Status label={leave[2]} tone={leave[2] === "Upcoming" ? "blue" : leave[2] === "Approved" ? "green" : "neutral"} />
            <span>{leave[3]}</span>
            <button className="w-fit text-red-700" type="button">Cancel</button>
          </div>
        ))}
      </section>
    </DoctorWorkspace>
  );
}

export function DoctorAppointmentsPage() {
  return (
    <DoctorWorkspace actions={<DoctorButton label="Export" variant="secondary" />} title="Appointments" subtitle="Confirm, reschedule, start consultations, and complete appointment workflows.">
      <ListToolbar tabs={["All", "Requested", "Confirmed", "In Progress", "Completed", "Cancelled"]} />
      <section className="mt-5 overflow-hidden rounded-md border border-slate-200 bg-white">
        <TableHeader columns={["Appointment", "Patient", "Date / Time", "Type", "Status", "Reason", "Actions"]} />
        {appointments.map((appointment) => (
          <div className="grid grid-cols-7 items-center border-t border-slate-100 px-5 py-4 text-sm" key={appointment[0]}>
            <strong>{appointment[0]}</strong>
            <span>{appointment[1]}</span>
            <span>{appointment[2]}</span>
            <span>{appointment[3]}</span>
            <Status label={appointment[4]} tone={appointment[4] === "Completed" ? "green" : appointment[4] === "Requested" ? "neutral" : "blue"} />
            <span>{appointment[5]}</span>
            <button type="button"><EllipsisVertical size={16} /></button>
          </div>
        ))}
      </section>
    </DoctorWorkspace>
  );
}

export function DoctorAppointmentDetailPage({ id }: { id?: string }) {
  return (
    <DoctorWorkspace title={`Appointment ${id ?? "APT-1024"}`} subtitle="Review appointment context and take operational action.">
      <div className="grid gap-5 xl:grid-cols-[1fr_0.75fr]">
        <Panel title="Appointment Information">
          <DetailGrid rows={[["Status", "Confirmed"], ["Date", "Today, 08:30 AM"], ["Type", "Clinic"], ["Reason", "Chest discomfort"]]} />
        </Panel>
        <Panel title="Actions">
          <div className="mt-4 grid gap-3">
            <DoctorButton label="Confirm Appointment" />
            <DoctorButton label="Reschedule" variant="secondary" />
            <DoctorButton label="Start Consultation" variant="secondary" />
          </div>
        </Panel>
        <Panel title="Patient Summary">
          <CompactPerson meta="42 | Female | #PA-2041" name="Margot Sterling" />
        </Panel>
        <Panel title="Previous Visits">
          <Timeline items={["Oct 24, 2023 | Checked-in", "Sep 18, 2023 | Consultation completed", "Aug 03, 2023 | Report uploaded"]} />
        </Panel>
      </div>
    </DoctorWorkspace>
  );
}

export function DoctorPatientDetailPage({ id }: { id?: string }) {
  return (
    <DoctorWorkspace title={`Patient ${id ?? "#PA-2041"}`} subtitle="Clinical overview, history, timeline, reports, and notes.">
      <Segmented labels={["Overview", "Appointments", "Consultations", "Timeline", "Reports", "Notes"]} />
      <div className="mt-5 grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <Panel title="Overview">
          <CompactPerson meta="42 | Female | +1 (555) 123-4567" name="Margot Sterling" />
          <DetailGrid rows={[["Last Consultation", "Oct 24, 2023"], ["Total Visits", "12"], ["Status", "Checked-in"]]} />
        </Panel>
        <Panel title="Timeline">
          <Timeline items={["Appointment created", "Appointment completed", "Consultation completed", "Report uploaded", "Note created"]} />
        </Panel>
      </div>
    </DoctorWorkspace>
  );
}

export function DoctorConsultationsPage() {
  return (
    <DoctorWorkspace actions={<DoctorButton icon={<Plus size={15} />} label="Create Consultation" />} title="Consultations" subtitle="Manage draft, in-progress, and completed clinical consultations.">
      <ListToolbar tabs={["All", "Draft", "In Progress", "Completed", "Cancelled"]} />
      <section className="mt-5 overflow-hidden rounded-md border border-slate-200 bg-white">
        <TableHeader columns={["Consultation", "Patient", "Diagnosis", "Status", "Date", "Actions"]} />
        {consultations.map((consultation) => (
          <div className="grid grid-cols-6 items-center border-t border-slate-100 px-5 py-4 text-sm" key={consultation[0]}>
            <strong>{consultation[0]}</strong>
            <span>{consultation[1]}</span>
            <span>{consultation[2]}</span>
            <Status label={consultation[3]} tone={consultation[3] === "Completed" ? "green" : consultation[3] === "Draft" ? "neutral" : "blue"} />
            <span>{consultation[4]}</span>
            <button type="button"><EllipsisVertical size={16} /></button>
          </div>
        ))}
      </section>
    </DoctorWorkspace>
  );
}

export function DoctorConsultationDetailPage({ id }: { id?: string }) {
  return (
    <DoctorWorkspace actions={<><DoctorButton label="Save Draft" variant="secondary" /><DoctorButton label="Complete Consultation" /></>} title={`Consultation ${id ?? "CON-4421"}`} subtitle="Structured workspace for diagnosis, observations, plan, recommendations, and SOAP notes.">
      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <Panel title="Patient Summary">
          <CompactPerson meta="42 | Female | #PA-2041" name="Margot Sterling" />
        </Panel>
        <Panel title="Clinical Notes">
          <TextEditor label="Chief Complaint" text="Chest discomfort and fatigue after exertion." />
          <TextEditor label="Symptoms" text="Shortness of breath, palpitations, mild dizziness." />
          <TextEditor label="Diagnosis" text="Hypertension review with possible rhythm irregularity." />
          <TextEditor label="Observations" text="BP elevated, pulse irregular. ECG advised." />
          <TextEditor label="Treatment Plan" text="Adjust medication dosage and schedule follow-up in two weeks." />
          <TextEditor label="Recommendations" text="Low sodium diet, daily BP monitoring, avoid strenuous activity." />
          <TextEditor label="SOAP Notes" text="Subjective, objective, assessment, and plan captured for clinical continuity." />
        </Panel>
      </div>
    </DoctorWorkspace>
  );
}

export function DoctorSettingsPage() {
  return (
    <DoctorWorkspace actions={<DoctorButton icon={<Save size={15} />} label="Save Settings" />} title="Settings" subtitle="Configure practice behavior, appointment rules, public visibility, and notification preferences.">
      <div className="grid gap-5 xl:grid-cols-2">
        <SettingsPanel title="Practice Settings" rows={["Accept Appointments", "Allow Walk-ins", "Default Consultation Fee", "Timezone", "Locale"]} />
        <SettingsPanel title="Appointment Settings" rows={["Accept Online Consultations", "Default Slot Duration", "Break Duration", "Max Patients Per Slot"]} />
        <SettingsPanel title="Public Profile Settings" rows={["Public Profile Enabled", "Show Consultation Fee", "Show Availability"]} />
        <SettingsPanel title="Notification Preferences" rows={["Appointment Reminders", "Verification Updates", "Patient Activity Alerts"]} />
      </div>
    </DoctorWorkspace>
  );
}

function DoctorWorkspace({ actions, children, kicker, subtitle, title }: { actions?: ReactNode; children: ReactNode; kicker?: string; subtitle?: string; title?: string }) {
  return (
    <div className="min-h-full bg-[#f5f7fb] p-5 text-slate-950 lg:p-8">
      {(title || actions) ? (
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            {kicker ? <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-900">{kicker}</p> : null}
            {title ? <h1 className="text-3xl font-bold tracking-tight">{title}</h1> : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </div>
  );
}

function ScheduleRow({ row, sessions, time }: { row: number; sessions: Array<{ day: number; row: number; color: string; title: string; time: string }>; time: string }) {
  return (
    <>
      <div className="min-h-20 border-b border-r border-slate-200 bg-slate-50 px-2 py-3 text-xs font-medium">{time}</div>
      {Array.from({ length: 7 }).map((_, day) => {
        const session = sessions.find((item) => item.day === day && item.row === row);
        return (
          <div className="relative min-h-20 border-b border-r border-slate-200 p-1.5" key={`${row}-${day}`}>
            {row === 2 && day < 5 ? <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] italic text-slate-500">LUNCH BREAK</span> : null}
            {session ? <div className={session.color === "teal" ? "rounded-sm border-l-4 border-teal-900 bg-teal-100 p-2 text-xs font-bold text-teal-950" : "rounded-sm border-l-4 border-blue-900 bg-blue-100 p-2 text-xs font-bold text-blue-950"}>{session.title}<span className="block">{session.time}</span></div> : null}
          </div>
        );
      })}
    </>
  );
}

function DoctorButton({ icon, label, variant = "primary" }: { icon?: ReactNode; label: string; variant?: "primary" | "secondary" }) {
  return <button className={variant === "primary" ? "inline-flex h-10 items-center gap-2 rounded-md bg-blue-900 px-5 text-sm font-bold text-white" : "inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-bold text-slate-900"} type="button">{icon}{label}</button>;
}

function IconButton({ icon }: { icon: ReactNode }) {
  return <button className="flex size-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700" type="button">{icon}</button>;
}

function Panel({ children, icon, subtitle, title, toolbar }: { children: ReactNode; icon?: ReactNode; subtitle?: string; title: string; toolbar?: ReactNode }) {
  return <section className="rounded-md border border-slate-200 bg-white p-5">{<div className="flex items-start justify-between gap-4"><div>{icon ? <span className="mb-2 inline-flex text-blue-900">{icon}</span> : null}<h2 className="font-bold">{title}</h2>{subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}</div>{toolbar}</div>}{children}</section>;
}

function TableHeader({ columns }: { columns: string[] }) {
  return <div className="grid grid-cols-[repeat(var(--cols),minmax(0,1fr))] bg-slate-100 px-5 py-4 text-xs font-bold uppercase text-slate-700" style={{ "--cols": columns.length } as React.CSSProperties}>{columns.map((column) => <span key={column}>{column}</span>)}</div>;
}

function Status({ label, tone }: { label: string; tone: "blue" | "green" | "red" | "neutral" }) {
  const classes = tone === "green" ? "bg-emerald-100 text-emerald-800" : tone === "red" ? "bg-red-100 text-red-800" : tone === "neutral" ? "bg-slate-200 text-slate-700" : "bg-blue-100 text-blue-900";
  return <span className={`w-fit rounded px-2 py-1 text-[10px] font-bold uppercase ${classes}`}>{label}</span>;
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-2 uppercase"><span className={`size-3 rounded-full ${color}`} />{label}</span>;
}

function Segmented({ labels }: { labels: string[] }) {
  return <div className="flex gap-1">{labels.map((label, index) => <button className={index === 0 ? "border border-slate-400 bg-slate-200 px-3 py-1 text-xs uppercase" : "px-3 py-1 text-xs uppercase"} key={label} type="button">{label}</button>)}</div>;
}

function Field({ label, value }: { label: string; value: string }) {
  return <label className="block"><span className="mb-2 block text-[11px] font-bold uppercase text-slate-500">{label}</span><input className="h-10 w-full rounded-sm border border-slate-300 bg-slate-50 px-3 text-sm font-medium" readOnly value={value} /></label>;
}

function SelectField({ label, value }: { label: string; value: string }) {
  return <label className="block"><span className="mb-2 block text-[11px] font-bold uppercase text-slate-500">{label}</span><span className="flex h-10 items-center justify-between rounded-sm border border-slate-300 bg-slate-50 px-3 text-sm font-medium">{value}<ChevronDown size={14} /></span></label>;
}

function FeeRow({ label, value }: { label: string; value: string }) {
  return <div className="mt-4 flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm"><span className="font-bold">{label}</span><span className="font-bold">{value}</span></div>;
}

function TextEditor({ label, text }: { label: string; text: string }) {
  return <div className="mt-5"><p className="mb-2 text-[11px] font-bold uppercase text-slate-500">{label}</p><div className="border border-slate-300 bg-slate-50"><div className="flex gap-4 border-b border-slate-300 px-3 py-2 text-xs font-bold"><span>B</span><span>I</span><span>≡</span><span>∞</span></div><p className="p-4 text-sm leading-6">{text}</p></div></div>;
}

function StatBox({ icon, label, trend, value }: { icon: ReactNode; label: string; trend?: string; value: string }) {
  return <div className="rounded-md border border-slate-200 bg-white p-5"><div className="flex items-start justify-between"><span className="rounded bg-blue-100 p-2 text-blue-900">{icon}</span><p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">{label}</p></div><p className="mt-4 text-3xl font-bold text-blue-950">{value}</p>{trend ? <p className="mt-1 text-xs font-semibold text-emerald-700">{trend}</p> : null}</div>;
}

function Toggle({ active }: { active: boolean }) {
  return <span className={active ? "flex h-5 w-9 items-center rounded-full bg-blue-900 p-0.5" : "flex h-5 w-9 items-center rounded-full bg-slate-300 p-0.5"}><span className={active ? "ml-auto size-4 rounded-full bg-white" : "size-4 rounded-full bg-white"} /></span>;
}

function DocumentCard({ date, description, status, title }: { date: string; description: string; status: string; title: string }) {
  const rejected = status === "Rejected";
  return <div className="rounded-md border border-slate-200 bg-white p-5"><div className="flex items-start justify-between"><span className={rejected ? "rounded bg-red-50 p-3 text-red-700" : "rounded bg-blue-50 p-3 text-blue-900"}>{rejected ? <GraduationCap size={20} /> : <FileBadge size={20} />}</span><Status label={status} tone={rejected ? "red" : status === "Approved" ? "green" : "neutral"} /></div><h3 className="mt-5 font-bold">{title}</h3><p className={rejected ? "text-sm text-red-700" : "text-sm text-slate-600"}>{description}</p>{rejected ? <p className="text-sm font-bold text-red-700">Please re-upload a clear copy.</p> : null}<div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500"><span>{date}</span><button className={rejected ? "inline-flex items-center gap-1 rounded bg-red-700 px-3 py-2 text-white" : "inline-flex items-center gap-1 font-bold text-blue-900"} type="button">{rejected ? <Upload size={13} /> : <Eye size={13} />}{rejected ? "Replace" : "View"}</button></div></div>;
}

function AppointmentMiniList() {
  return (
    <div className="mt-4 space-y-3">
      {appointments.slice(0, 3).map((appointment) => (
        <div className="grid gap-3 rounded-md bg-slate-50 p-4 text-sm md:grid-cols-[0.8fr_1fr_1fr_auto]" key={appointment[0]}>
          <strong>{appointment[2]}</strong>
          <span>{appointment[1]}</span>
          <span>{appointment[5]}</span>
          <Status label={appointment[4]} tone={appointment[4] === "Requested" ? "neutral" : "blue"} />
        </div>
      ))}
    </div>
  );
}

function ReadinessStack() {
  return (
    <div className="mt-4 space-y-3">
      <ReadinessLine label="Verification Status" value="Under Review" />
      <ReadinessLine label="Profile Completion" value="92%" />
      <ReadinessLine label="Public Profile" value="Enabled" />
      <ReadinessLine label="Availability" value="42 hours / week" />
    </div>
  );
}

function ReadinessLine({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3 text-sm"><span className="font-semibold text-slate-600">{label}</span><strong>{value}</strong></div>;
}

function CompactPerson({ meta, name }: { meta: string; name: string }) {
  return <div className="flex items-center gap-3 rounded-md bg-slate-50 p-4"><span className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-900">{name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><p className="font-bold">{name}</p><p className="text-sm text-slate-600">{meta}</p></div></div>;
}

function ListToolbar({ tabs }: { tabs: string[] }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab, index) => <button className={index === 0 ? "rounded bg-blue-900 px-3 py-2 text-xs font-bold uppercase text-white" : "rounded bg-slate-100 px-3 py-2 text-xs font-bold uppercase text-slate-700"} key={tab} type="button">{tab}</button>)}
        </div>
        <div className="flex gap-2">
          <div className="flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-500"><Search size={15} /> Search</div>
          <DoctorButton icon={<SlidersHorizontal size={14} />} label="Filters" variant="secondary" />
        </div>
      </div>
    </div>
  );
}

function DetailGrid({ rows }: { rows: Array<[string, string]> }) {
  return <div className="mt-4 grid gap-3">{rows.map(([label, value]) => <div className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3 text-sm" key={label}><span className="font-semibold text-slate-500">{label}</span><strong>{value}</strong></div>)}</div>;
}

function Timeline({ items }: { items: string[] }) {
  return <div className="mt-4 space-y-3">{items.map((item) => <div className="flex gap-3 text-sm" key={item}><span className="mt-1 size-2 rounded-full bg-blue-900" /><span>{item}</span></div>)}</div>;
}

function SettingsPanel({ rows, title }: { rows: string[]; title: string }) {
  return (
    <Panel title={title}>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <label className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3 text-sm" key={row}>
            <span className="font-bold">{row}</span>
            {row.includes("Fee") || row.includes("Timezone") || row.includes("Locale") || row.includes("Duration") || row.includes("Patients") ? (
              <input className="h-9 w-44 rounded border border-slate-300 bg-white px-3 text-right" defaultValue={row.includes("Fee") ? "$120" : row.includes("Timezone") ? "Asia/Kolkata" : row.includes("Locale") ? "en-IN" : "30"} />
            ) : (
              <Toggle active />
            )}
          </label>
        ))}
      </div>
    </Panel>
  );
}
