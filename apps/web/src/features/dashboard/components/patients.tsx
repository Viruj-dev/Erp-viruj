"use client";

import { patients } from "@/features/dashboard/components/data";
import type { PatientRecord } from "@/features/dashboard/components/types";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Download,
  Filter,
  TrendingUp,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";

type PatientDirectoryRecord = PatientRecord & {
  condition: string;
  mrn: string;
  visitContext: string;
};

const supplementalPatients: PatientDirectoryRecord[] = [
  {
    age: 34,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
    bloodGroup: "A Positive",
    condition: "Type 1 Diabetic",
    conditions: [],
    email: "aria.sterling@example.com",
    gender: "Female",
    id: "MRN-2024-8891",
    insurance: {
      policyNumber: "VH-8891",
      provider: "Viruj Care",
      status: "Active",
    },
    lastVisit: "2023-10-12",
    mrn: "MRN-2024-8891",
    name: "Aria Sterling",
    phone: "+1 (555) 821-4981",
    status: "Stable",
    timeline: [],
    visitContext: "Routine Follow-up",
    vitals: { bp: "118/76", bpm: 72, spo2: 99 },
  },
  {
    age: 68,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
    bloodGroup: "B Positive",
    condition: "Hypertension",
    conditions: [],
    email: "julian.vane@example.com",
    gender: "Male",
    id: "MRN-2024-1204",
    insurance: {
      policyNumber: "VH-1204",
      provider: "Viruj Care",
      status: "Active",
    },
    lastVisit: "2023-10-24",
    mrn: "MRN-2024-1204",
    name: "Julian Vane",
    phone: "+1 (555) 662-1204",
    status: "Critical",
    timeline: [],
    visitContext: "Critical Escalation",
    vitals: { bp: "148/92", bpm: 84, spo2: 96 },
  },
];

const directoryPatients: PatientDirectoryRecord[] = [
  ...supplementalPatients,
  ...patients.map((patient, index) => ({
    ...patient,
    condition:
      patient.conditions[0]?.name ??
      ["Post-Op Recovery", "Asthma Management", "Osteoarthritis"][index] ??
      "General Review",
    mrn: patient.id.replace("VH-", "MRN-"),
    visitContext:
      patient.status === "Critical"
        ? "Critical Escalation"
        : ([
            "In-patient Observation",
            "Tele-consult Scheduled",
            "Physiotherapy Review",
          ][index] ?? "Routine Follow-up"),
  })),
].slice(0, 5);

export function ErpDemoPatients() {
  return (
    <div className="space-y-7 p-5 lg:p-8">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
        <div className="rounded-xl bg-[#003463] p-7 text-white shadow-sm">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
                Total Longitudinal Records
              </p>
              <p className="mt-2 font-headline text-4xl font-black leading-none">
                12,842
              </p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-white/70">
              <UsersRound size={20} />
            </span>
          </div>
          <span className="mt-7 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs font-black text-white/72">
            <TrendingUp size={13} />
            8.4% increase from last quarter
          </span>
        </div>

        <MetricCard
          icon={<UserRoundPlus className="text-secondary" size={18} />}
          label="New patients (month)"
          note="+12.5% vs last month"
          value="342"
        />
        <MetricCard
          icon={<Clock className="text-error" size={18} />}
          label="Avg. triage wait"
          note="Steady clinic flow"
          noteTone="error"
          value="14m"
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <ToolButton icon={<Filter size={14} />} label="Filter" />
            <ToolButton icon={<Download size={14} />} label="Export" />
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-on-surface-variant">
            <span>Showing 1-10 of 12,842 patients</span>
            <button
              className="rounded-lg p-2 text-outline transition hover:bg-surface-container-low"
              type="button"
            >
              <ArrowLeft size={14} />
            </button>
            <button
              className="rounded-lg bg-surface-container-low p-2 text-primary transition hover:bg-primary/10"
              type="button"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
          <div className="grid grid-cols-[1.45fr_0.75fr_0.9fr_0.9fr_0.65fr] gap-4 border-b border-outline-variant/15 bg-surface-container-low px-6 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
            <span>Patient Name</span>
            <span>MRN / ID</span>
            <span>Last Visit</span>
            <span>Condition / Triage</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-outline-variant/12">
            {directoryPatients.map((patient) => (
              <div
                className="grid grid-cols-[1.45fr_0.75fr_0.9fr_0.9fr_0.65fr] items-center gap-4 px-6 py-4 text-sm transition hover:bg-surface-container-low"
                key={patient.id}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {patient.avatar ? (
                    <img
                      alt={patient.name}
                      className="h-11 w-11 shrink-0 rounded-lg object-cover"
                      src={patient.avatar}
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-headline text-sm font-black text-primary">
                      {getInitials(patient.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-headline text-base font-black text-on-surface">
                      {patient.name}
                    </p>
                    <p className="truncate text-xs font-medium text-on-surface-variant">
                      {patient.gender.charAt(0)} - {patient.age} yrs -{" "}
                      {patient.condition}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-xs font-semibold text-on-surface-variant">
                  {patient.mrn}
                </span>

                <div>
                  <p className="font-black text-on-surface">
                    {formatDate(patient.lastVisit)}
                  </p>
                  <p
                    className={`text-xs font-black ${
                      patient.status === "Critical"
                        ? "text-error"
                        : "text-secondary"
                    }`}
                  >
                    {patient.visitContext}
                  </p>
                </div>

                <TriageBadge status={patient.status} />

                <button
                  className="text-right text-xs font-black text-primary transition hover:text-primary-container"
                  type="button"
                >
                  Open Chart
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/15 px-6 py-5">
            <button
              className="inline-flex items-center gap-2 text-sm font-black text-on-surface-variant transition hover:text-primary"
              type="button"
            >
              <ArrowLeft size={14} />
              Previous
            </button>
            <div className="flex items-center gap-3 text-sm font-black text-on-surface">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white"
                type="button"
              >
                1
              </button>
              <button className="h-9 w-9" type="button">
                2
              </button>
              <button className="h-9 w-9" type="button">
                3
              </button>
              <span>...</span>
              <button className="h-9 w-9" type="button">
                128
              </button>
            </div>
            <button
              className="inline-flex items-center gap-2 text-sm font-black text-primary transition hover:text-primary-container"
              type="button"
            >
              Next
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                Longitudinal Data Integrity
              </p>
              <p className="mt-5 text-sm font-black text-on-surface">
                Profile Completion Rate
              </p>
            </div>
            <span className="text-sm font-black text-secondary">94%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-full w-[94%] rounded-full bg-secondary" />
          </div>
          <p className="mt-5 text-sm font-medium italic text-on-surface-variant">
            Clinicians are reminded to update family medical history for 42
            pending patient profiles.
          </p>
        </div>

        <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UsersRound size={22} />
          </span>
          <h3 className="mt-5 font-headline text-lg font-black text-on-surface">
            Demographic Shift
          </h3>
          <p className="mx-auto mt-2 max-w-52 text-sm font-medium text-on-surface-variant">
            Geriatric intake has increased by 4% since last quarter.
          </p>
          <button
            className="mt-5 text-xs font-black text-primary transition hover:text-primary-container"
            type="button"
          >
            View Analytics Report
          </button>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  note,
  noteTone = "secondary",
  value,
}: {
  icon: React.ReactNode;
  label: string;
  note: string;
  noteTone?: "secondary" | "error";
  value: string;
}) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant">
          {label}
        </p>
        {icon}
      </div>
      <p className="mt-7 font-headline text-3xl font-black text-on-surface">
        {value}
      </p>
      <p
        className={`mt-5 text-xs font-black ${
          noteTone === "error" ? "text-error" : "text-secondary"
        }`}
      >
        {note}
      </p>
    </div>
  );
}

function ToolButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-4 py-2.5 text-xs font-black text-on-surface shadow-sm transition hover:bg-surface-container-low"
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function TriageBadge({ status }: { status: PatientRecord["status"] }) {
  const className =
    status === "Critical"
      ? "bg-error-container/70 text-error"
      : status === "Recovered"
        ? "bg-surface-container-high text-on-surface-variant"
        : "bg-secondary-container/55 text-secondary";
  const label =
    status === "Critical"
      ? "Urgent"
      : status === "Recovered"
        ? "Monitoring"
        : "Stable";

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-black ${className}`}
    >
      {label}
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}
