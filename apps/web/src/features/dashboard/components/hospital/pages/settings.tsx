"use client";

import {
  BellRing,
  Database,
  Download,
  FileImage,
  Filter,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";

export type SettingsSection =
  | "profile"
  | "alerts"
  | "audit"
  | "storage"
  | "export";

const auditLogs = [
  ["May 24, 09:12 AM", "Dr. Smith", "EHR_ACCESS", "#PX-88219", "Success"],
  [
    "May 24, 08:45 AM",
    "System Admin",
    "SEC_POLICY_MOD",
    "#ORG-AUTH-84",
    "Success",
  ],
  [
    "May 23, 11:20 PM",
    "Automated Task",
    "BACKUP_FAILED",
    "#SYS-SRV-01",
    "Warning",
  ],
  ["May 23, 04:30 PM", "Nurse Joy", "PT_UPDATE", "#PX-90812", "Success"],
] as const;

export function ErpDemoSettings({
  section = "profile",
}: {
  section?: SettingsSection;
}) {
  const [alertRules, setAlertRules] = useState({
    billing: false,
    emergency: true,
    lab: true,
  });

  return (
    <div className="space-y-7 p-5 lg:p-8">
      {section === "profile" ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <OrganizationProfile />
          <aside className="space-y-6">
            <PlanCard />
            <StoragePanel />
          </aside>
        </section>
      ) : null}

      {section === "alerts" ? (
        <section className="max-w-2xl rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm">
          <h1 className="flex items-center gap-3 font-headline text-2xl font-semi-bold text-on-surface">
            <BellRing className="text-secondary" size={22} />
            Alert Rules
          </h1>
          <div className="mt-7 space-y-6">
            <AlertToggle
              checked={alertRules.emergency}
              description="Instant SMS/Push for triage events"
              label="Emergency Alerts"
              onChange={() =>
                setAlertRules((rules) => ({
                  ...rules,
                  emergency: !rules.emergency,
                }))
              }
            />
            <AlertToggle
              checked={alertRules.lab}
              description="Email digest of pending results"
              label="Lab Turnaround"
              onChange={() =>
                setAlertRules((rules) => ({ ...rules, lab: !rules.lab }))
              }
            />
            <AlertToggle
              checked={alertRules.billing}
              description="Monthly financial PDF generation"
              label="Billing Reports"
              onChange={() =>
                setAlertRules((rules) => ({
                  ...rules,
                  billing: !rules.billing,
                }))
              }
            />
          </div>
        </section>
      ) : null}

      {section === "audit" ? <AuditLogPanel /> : null}

      {section === "storage" ? (
        <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <StoragePanel />
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm">
            <h1 className="font-headline text-2xl font-semi-bold text-on-surface">
              Storage Governance
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-on-surface-variant">
              Track organization storage across patient records, medical
              imaging, and encrypted clinical logs.
            </p>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <StorageMetric label="Patient files" value="8.2 TB" />
              <StorageMetric label="DICOM archive" value="4.5 TB" />
              <StorageMetric label="Audit retention" value="18 mo" />
            </div>
          </div>
        </section>
      ) : null}

      {section === "export" ? <DataExportPanel /> : null}
    </div>
  );
}

function OrganizationProfile() {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-semi-bold text-primary">
            Organization Profile
          </h1>
          <p className="mt-2 text-sm font-medium text-on-surface-variant">
            Manage your clinical branding and public identity.
          </p>
        </div>
        <button
          className="rounded-lg bg-surface-container-low px-5 py-2.5 text-xs font-semi-bold text-primary transition hover:bg-primary/10"
          type="button"
        >
          Update Profile
        </button>
      </div>

      <div className="mt-8 flex flex-col gap-5 rounded-xl bg-surface-container-low p-5 md:flex-row md:items-center">
        <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest text-outline">
          <FileImage size={22} />
          <span className="mt-2 text-xs font-semibold">Logo</span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-headline text-lg font-semi-bold text-on-surface">
            Official Branding
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-on-surface-variant">
            This logo will appear on all patient reports, appointment reminders,
            and your clinical portal. Recommended size: 512x512px.
          </p>
          <div className="mt-3 flex gap-2">
            <FormatBadge label="PNG" />
            <FormatBadge label="SVG" />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Field
          label="Organization Name"
          value="Viruj Health Specialized Center"
        />
        <Field label="Registration ID" value="HOSP-2024-UI-X99" />
        <Field label="Contact Email" value="admin@virujhealth.com" />
        <Field label="Support Line" value="+1 (555) 000-8888" />
      </div>
    </div>
  );
}

function PlanCard() {
  return (
    <div className="rounded-xl bg-[#003463] p-6 text-white shadow-sm">
      <ShieldCheck className="text-secondary-container" size={22} />
      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-headline text-2xl font-semi-bold">
            Elite Care Access
          </h2>
          <p className="mt-1 text-sm font-medium text-white/62">
            Your subscription is active until Dec 2024.
          </p>
        </div>
        <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-semi-bold uppercase tracking-[0.14em] text-white/70">
          Pro Plan
        </span>
      </div>
      <p className="mt-8 font-headline text-4xl font-semi-bold">
        $1,499{" "}
        <span className="font-sans text-sm font-medium text-white/55">
          /month
        </span>
      </p>
      <button
        className="mt-7 w-full rounded-lg bg-white/75 px-4 py-3 text-xs font-semi-bold uppercase tracking-[0.08em] text-primary transition hover:bg-white"
        type="button"
      >
        Manage Billing
      </button>
    </div>
  );
}

function StoragePanel() {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm">
      <h1 className="font-headline text-lg font-semi-bold uppercase tracking-[0.12em] text-on-surface-variant">
        Storage Usage
      </h1>
      <StorageBar label="Patient Records" value={82} />
      <StorageBar label="Imaging (DICOM)" tone="secondary" value={45} />
    </div>
  );
}

function AuditLogPanel() {
  return (
    <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-3 font-headline text-2xl font-semi-bold text-on-surface">
          <SlidersHorizontal className="text-primary" size={22} />
          Clinical Audit Logs
        </h1>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2.5 text-xs font-semi-bold uppercase tracking-[0.08em] text-on-surface-variant"
            type="button"
          >
            <Filter size={13} />
            Filter
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-xs font-semi-bold uppercase tracking-[0.08em] text-primary"
            type="button"
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-8 overflow-hidden">
        <div className="grid grid-cols-[1.15fr_1fr_1fr_1fr_0.75fr] gap-4 border-b border-outline-variant/15 pb-4 text-[10px] font-semi-bold uppercase tracking-[0.18em] text-on-surface-variant">
          <span>Timestamp</span>
          <span>Entity / User</span>
          <span>Action Type</span>
          <span>Resource ID</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-outline-variant/12">
          {auditLogs.map(([timestamp, entity, action, resource, status]) => (
            <div
              className="grid grid-cols-[1.15fr_1fr_1fr_1fr_0.75fr] items-center gap-4 py-4 text-sm"
              key={`${timestamp}-${resource}`}
            >
              <span className="font-medium text-on-surface-variant">
                {timestamp}
              </span>
              <span className="font-semi-bold text-on-surface">{entity}</span>
              <span
                className={`w-fit rounded-md px-2 py-1 text-[10px] font-semi-bold uppercase tracking-[0.12em] ${
                  status === "Warning"
                    ? "bg-error-container text-error"
                    : action === "PT_UPDATE"
                      ? "bg-secondary-container/50 text-secondary"
                      : "bg-primary/10 text-primary"
                }`}
              >
                {action}
              </span>
              <span className="font-mono text-xs font-semibold text-on-surface-variant">
                {resource}
              </span>
              <span
                className={`font-semi-bold ${
                  status === "Warning" ? "text-error" : "text-on-surface"
                }`}
              >
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DataExportPanel() {
  return (
    <section className="rounded-xl border-l-4 border-error bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="rounded-lg bg-error-container p-3 text-error">
            <Database size={20} />
          </span>
          <div>
            <h1 className="font-headline text-lg font-semi-bold text-on-surface">
              Export All Organization Data
            </h1>
            <p className="mt-1 max-w-3xl text-sm font-medium text-on-surface-variant">
              Securely download all patient records, medical history, and
              clinical logs in an encrypted archive.
            </p>
          </div>
        </div>
        <button
          className="rounded-lg border border-error px-7 py-3 text-xs font-semi-bold uppercase tracking-[0.12em] text-error transition hover:bg-error-container/30"
          type="button"
        >
          Request Export
        </button>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semi-bold uppercase tracking-[0.18em] text-on-surface-variant">
        {label}
      </span>
      <input
        className="mt-2 w-full rounded-lg border border-outline-variant/15 bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none transition focus:border-primary"
        defaultValue={value}
        type="text"
      />
    </label>
  );
}

function FormatBadge({ label }: { label: string }) {
  return (
    <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-semi-bold text-primary">
      {label}
    </span>
  );
}

function StorageMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-container-low p-5">
      <p className="text-[10px] font-semi-bold uppercase tracking-[0.16em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-3 font-headline text-3xl font-semi-bold text-on-surface">
        {value}
      </p>
    </div>
  );
}

function StorageBar({
  label,
  tone = "primary",
  value,
}: {
  label: string;
  tone?: "primary" | "secondary";
  value: number;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between text-xs font-semi-bold">
        <span className="uppercase tracking-[0.12em] text-on-surface">
          {label}
        </span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container-high">
        <div
          className={`h-full rounded-full ${
            tone === "secondary" ? "bg-secondary" : "bg-primary"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function AlertToggle({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-semi-bold text-on-surface">{label}</p>
        <p className="mt-1 text-xs font-medium text-on-surface-variant">
          {description}
        </p>
      </div>
      <button
        aria-pressed={checked}
        className={`relative h-7 w-12 rounded-full transition ${
          checked ? "bg-primary" : "bg-surface-container-high"
        }`}
        onClick={onChange}
        type="button"
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
