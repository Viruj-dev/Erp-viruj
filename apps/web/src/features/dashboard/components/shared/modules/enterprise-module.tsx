"use client";

import {
  Activity,
  AlertTriangle,
  Bell,
  BrainCircuit,
  CalendarClock,
  ClipboardList,
  FileBarChart,
  FlaskConical,
  HeartPulse,
  ImagePlus,
  Pill,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";

type ModuleKey =
  | "appointments"
  | "doctors"
  | "radiology"
  | "pathology"
  | "pharmacy"
  | "notifications"
  | "reports";

const moduleContent: Record<
  ModuleKey,
  {
    accent: string;
    description: string;
    icon: ReactNode;
    kpis: { label: string; note: string; value: string }[];
    primary: string;
    queue: { label: string; meta: string; status: string }[];
    title: string;
    workflows: string[];
  }
> = {
  appointments: {
    accent: "from-emerald-950 to-teal-800",
    description:
      "Shared appointment review, scheduling, patient decisions, and operational settings for provider tenants.",
    icon: <CalendarClock size={22} />,
    kpis: [
      { label: "Requests", note: "Awaiting tenant context", value: "--" },
      { label: "Approved", note: "Scoped by organization", value: "--" },
      { label: "Reschedules", note: "Clinic and hospital ready", value: "--" },
    ],
    primary: "Appointments",
    queue: [
      {
        label: "Tenant context required",
        meta: "Select a clinic or hospital organization",
        status: "Waiting",
      },
    ],
    title: "Appointments Workspace",
    workflows: ["Appointment review", "Patient decisions", "Scheduling settings"],
  },
  doctors: {
    accent: "from-blue-950 to-cyan-800",
    description:
      "Clinical workbench for assigned patients, notes, prescriptions, diagnostics, and care follow-ups.",
    icon: <Stethoscope size={22} />,
    kpis: [
      { label: "Assigned patients", note: "18 need review", value: "126" },
      { label: "Consults today", note: "42 completed", value: "58" },
      { label: "Open prescriptions", note: "6 draft orders", value: "31" },
    ],
    primary: "Doctor Command",
    queue: [
      {
        label: "Ariya Sterling",
        meta: "Diabetes follow-up | 10:20 AM",
        status: "Vitals ready",
      },
      {
        label: "Thomas Wright",
        meta: "Asthma management | 11:10 AM",
        status: "Lab requested",
      },
      {
        label: "Maya Rodriguez",
        meta: "Post-op recovery | 12:00 PM",
        status: "Notes pending",
      },
    ],
    title: "Doctors Workspace",
    workflows: [
      "Assigned patient timeline",
      "Prescription composer",
      "Medical notes and SOAP records",
      "Lab and radiology requests",
    ],
  },
  radiology: {
    accent: "from-slate-950 to-indigo-800",
    description:
      "Imaging operations for scan queues, MRI/CT/X-ray uploads, report drafting, and modality scheduling.",
    icon: <ImagePlus size={22} />,
    kpis: [
      { label: "Scan queue", note: "7 urgent", value: "44" },
      { label: "Reports pending", note: "Avg 38m", value: "19" },
      { label: "Modalities online", note: "2 in maintenance", value: "12" },
    ],
    primary: "Imaging Control",
    queue: [
      { label: "MRI Brain", meta: "PX-88219 | 09:40 AM", status: "Upload" },
      { label: "CT Chest", meta: "PX-77102 | 10:15 AM", status: "Reporting" },
      {
        label: "X-ray Spine",
        meta: "PX-94018 | 11:05 AM",
        status: "Scheduled",
      },
    ],
    title: "Radiology Operations",
    workflows: [
      "DICOM image management",
      "Scan scheduling",
      "Radiologist report queue",
      "Critical finding escalation",
    ],
  },
  pathology: {
    accent: "from-teal-950 to-emerald-800",
    description:
      "Lab command center for test requests, sample tracking, diagnostics reports, and turnaround monitoring.",
    icon: <FlaskConical size={22} />,
    kpis: [
      { label: "Samples active", note: "14 priority", value: "312" },
      { label: "TAT median", note: "9m faster", value: "41m" },
      { label: "Reports ready", note: "23 awaiting release", value: "88" },
    ],
    primary: "Lab Operations",
    queue: [
      { label: "CBC panel", meta: "Barcode LAB-8821", status: "Processing" },
      { label: "Lipid profile", meta: "Barcode LAB-8830", status: "Verified" },
      { label: "Culture test", meta: "Barcode LAB-8842", status: "Incubating" },
    ],
    title: "Pathology Lab",
    workflows: [
      "Sample collection tracking",
      "Analyzer result upload",
      "Report verification",
      "Diagnostics management",
    ],
  },
  pharmacy: {
    accent: "from-cyan-950 to-blue-800",
    description:
      "Medication operations for prescriptions, stock, dispensing queues, substitutions, and controlled inventory.",
    icon: <Pill size={22} />,
    kpis: [
      { label: "Dispense queue", note: "5 urgent", value: "67" },
      { label: "Low stock", note: "12 reorder alerts", value: "24" },
      { label: "Claims linked", note: "Insurance mapped", value: "91%" },
    ],
    primary: "Pharmacy Desk",
    queue: [
      { label: "Metformin 500mg", meta: "Dr. Elias Vance", status: "Pack" },
      { label: "Atorvastatin", meta: "Insurance claim", status: "Approval" },
      { label: "Nebulizer refill", meta: "Ward 3B", status: "Ready" },
    ],
    title: "Pharmacy Management",
    workflows: [
      "Prescription dispensing",
      "Inventory and batch tracking",
      "Vendor reorder warnings",
      "Drug interaction review",
    ],
  },
  notifications: {
    accent: "from-blue-950 to-sky-700",
    description:
      "Real-time notification center for operational alerts, appointment reminders, escalation rules, and staff tasks.",
    icon: <Bell size={22} />,
    kpis: [
      { label: "Unread alerts", note: "3 critical", value: "28" },
      { label: "Delivery rate", note: "SMS + email", value: "98%" },
      { label: "Escalations", note: "2 need admin action", value: "09" },
    ],
    primary: "Notification Mesh",
    queue: [
      {
        label: "ICU bed threshold",
        meta: "Capacity alert",
        status: "Critical",
      },
      { label: "Appointment reminder", meta: "1,248 sent", status: "Live" },
      { label: "Lab report ready", meta: "Patient portal", status: "Queued" },
    ],
    title: "Notifications Center",
    workflows: [
      "Role-aware alert routing",
      "Patient reminders",
      "Staff task broadcasts",
      "Escalation policies",
    ],
  },
  reports: {
    accent: "from-slate-950 to-blue-800",
    description:
      "Enterprise reporting hub for finance, clinical operations, audit logs, department exports, and board summaries.",
    icon: <FileBarChart size={22} />,
    kpis: [
      { label: "Reports generated", note: "Last 30 days", value: "1,420" },
      { label: "Scheduled exports", note: "PDF and Excel", value: "36" },
      { label: "Audit coverage", note: "RBAC events logged", value: "100%" },
    ],
    primary: "Reports Engine",
    queue: [
      { label: "Monthly finance pack", meta: "GST + claims", status: "Ready" },
      {
        label: "Department performance",
        meta: "Clinical ops",
        status: "Draft",
      },
      { label: "Access audit", meta: "Security review", status: "Scheduled" },
    ],
    title: "Reports & Exports",
    workflows: [
      "PDF and Excel exports",
      "Automated schedules",
      "Audit-ready downloads",
      "AI executive summaries",
    ],
  },
};

export function ErpEnterpriseModule({
  module,
  roleLabel,
}: {
  module: ModuleKey;
  roleLabel: string;
}) {
  const content = moduleContent[module];

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <section
        className={`overflow-hidden rounded-3xl bg-gradient-to-br ${content.accent} p-6 text-white shadow-[0_24px_90px_rgba(15,23,42,0.28)] lg:p-8`}
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/20">
                {content.icon}
              </span>
              <p className="text-xs font-semi-bold uppercase tracking-[0.28em] text-white/60">
                {content.primary}
              </p>
            </div>
            <h1 className="mt-5 font-headline text-4xl font-semi-bold leading-tight lg:text-5xl">
              {content.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
              {content.description}
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p className="text-[10px] font-semi-bold uppercase tracking-[0.2em] text-white/55">
              Active role
            </p>
            <p className="mt-2 font-headline text-xl font-semi-bold">
              {formatRole(roleLabel)}
            </p>
            <p className="mt-1 text-xs text-white/65">
              Permission-aware module surface
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {content.kpis.map((kpi) => (
            <div
              className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
              key={kpi.label}
            >
              <p className="text-[10px] font-semi-bold uppercase tracking-[0.18em] text-white/55">
                {kpi.label}
              </p>
              <p className="mt-2 font-headline text-3xl font-semi-bold">
                {kpi.value}
              </p>
              <p className="mt-1 text-xs text-white/62">{kpi.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-outline-variant/20 bg-white/80 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semi-bold uppercase tracking-[0.2em] text-primary">
                Live Work Queue
              </p>
              <h2 className="mt-1 font-headline text-2xl font-semi-bold text-on-surface">
                Operational stream
              </h2>
            </div>
            <Activity className="text-secondary" size={22} />
          </div>
          <div className="mt-5 divide-y divide-outline-variant/15">
            {content.queue.map((item) => (
              <div
                className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
                key={item.label}
              >
                <div>
                  <p className="font-headline text-lg font-semi-bold text-on-surface">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium text-on-surface-variant">
                    {item.meta}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semi-bold uppercase tracking-[0.14em] text-primary">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <BrainCircuit className="text-primary" size={22} />
              <h3 className="font-headline text-xl font-semi-bold text-on-surface">
                AI Operations Insight
              </h3>
            </div>
            <p className="mt-4 text-sm font-medium leading-6 text-on-surface-variant">
              Viruj AI is watching queue pressure, role permissions, and
              department load. It recommends reassigning overflow tasks before
              SLA breach windows.
            </p>
          </div>
          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-secondary" size={22} />
              <h3 className="font-headline text-xl font-semi-bold text-on-surface">
                RBAC Workflows
              </h3>
            </div>
            <div className="mt-4 space-y-3">
              {content.workflows.map((workflow) => (
                <div
                  className="flex items-center gap-3 rounded-xl bg-surface-container-low px-3 py-2.5 text-sm font-bold text-on-surface"
                  key={workflow}
                >
                  <ClipboardList size={15} />
                  {workflow}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <SignalCard
          icon={<TrendingUp size={18} />}
          label="Real-time updates"
          text="Designed for live queues, staff actions, and operational metrics."
        />
        <SignalCard
          icon={<HeartPulse size={18} />}
          label="Clinical safety"
          text="Critical alerts remain visible and role-gated across workflows."
        />
        <SignalCard
          icon={<AlertTriangle size={18} />}
          label="Audit ready"
          text="Every sensitive action can be tied back to an actor and module."
        />
      </section>
    </div>
  );
}

function SignalCard({
  icon,
  label,
  text,
}: {
  icon: ReactNode;
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <p className="mt-4 font-headline text-lg font-semi-bold text-on-surface">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-on-surface-variant">
        {text}
      </p>
    </div>
  );
}

function formatRole(role: string) {
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
