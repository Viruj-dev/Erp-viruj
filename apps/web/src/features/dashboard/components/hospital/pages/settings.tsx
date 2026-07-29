/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars, react/no-unescaped-entities, react-hooks/set-state-in-effect */
// @ts-nocheck
"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Search, ChevronDown, ChevronRight, ChevronLeft, X, Plus, Check, AlertTriangle,
  AlertCircle, Info, Lock, Shield, Bell, SlidersHorizontal, Clock, RefreshCw,
  Trash2, Copy, Eye, EyeOff, MoreVertical, Filter, ExternalLink, Loader2,
  CheckCircle2, History, Download, KeyRound, Globe, Smartphone, Mail,
  MessageSquare, LayoutGrid, Send, Users, Save, RotateCcw, ShieldAlert,
  ShieldOff, MapPin, Wifi, CalendarClock, Siren, FileClock, ChevronsUpDown,
  CircleAlert, PanelRightClose,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { virujBackend } from "@/lib/viruj-backend";

/* ============================================================================
   DESIGN TOKENS — mirrors the existing Viruj ERP dashboard: slate/blue,
   rounded-2xl white cards on a slate-50 canvas, navy hero accents.
============================================================================ */
const cx = (...a) => a.filter(Boolean).join(" ");

/* ============================================================================
   STATIC CONFIG / MOCK DATA
============================================================================ */
const TIMEZONES = ["Asia/Kolkata (IST, UTC+5:30)", "Asia/Dubai (GST, UTC+4:00)", "Asia/Dhaka (BST, UTC+6:00)", "UTC"];
const LOCALES = ["English (India)", "English (US)", "Hindi", "Bengali"];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const TIME_FORMATS = ["12-hour", "24-hour"];
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
const FISCAL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const NUMBER_TOKENS = ["{SEQ}", "{YYYY}", "{MM}", "{DD}", "{DEPT}"];

const DEFAULT_HOURS = () =>
  Object.fromEntries(DAY_KEYS.map((d) => [d, { closed: d === "sun", open: "09:00", close: "18:00" }]));

const DEFAULT_OPERATIONAL = {
  timezone: TIMEZONES[0],
  locale: LOCALES[0],
  dateFormat: DATE_FORMATS[0],
  timeFormat: TIME_FORMATS[0],
  workingDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
  hours: DEFAULT_HOURS(),
  slotDuration: 15,
  consultDuration: 20,
  advanceBookingDays: 30,
  cancellationHours: 6,
  reschedulingHours: 6,
  walkIn: true,
  emergency: true,
  patientPattern: "PT-{YYYY}-{SEQ}",
  appointmentPattern: "APT-{DEPT}-{SEQ}",
  queuePattern: "Q-{SEQ}",
  fiscalMonth: "April",
};

const CHANNEL_DEFS = [
  { key: "in_app", label: "In-app", icon: LayoutGrid, available: true, enabled: true, integration: "Native — always on", reason: null },
  { key: "email", label: "Email", icon: Mail, available: true, enabled: true, integration: "Connected via Postmark", reason: null },
  { key: "sms", label: "SMS", icon: Smartphone, available: true, enabled: false, integration: "Connected via Twilio", reason: null },
  { key: "push", label: "Push", icon: Bell, available: false, enabled: false, integration: "Not connected", reason: "No mobile push provider configured for this tenant" },
  { key: "whatsapp", label: "WhatsApp", icon: Send, available: false, enabled: false, integration: "Not connected", reason: "WhatsApp Business API pending approval" },
];

const DEFAULT_NOTIFICATIONS = {
  channels: Object.fromEntries(CHANNEL_DEFS.map((c) => [c.key, c.enabled])),
  quietHours: { enabled: true, start: "22:00", end: "07:00", timezone: TIMEZONES[0] },
  reminders: [30, 120, 1440],
  escalation: { enabled: false, delayMinutes: 30, priority: "Normal" },
};

const CATEGORY_OPTIONS = ["Appointments", "Billing", "Lab Results", "Inventory", "Staff", "System"];
const PRIORITY_OPTIONS = ["Low", "Normal", "High", "Critical"];

const MOCK_RULES = [
  { id: "r1", event: "Appointment confirmed", category: "Appointments", recipients: "Patient", channels: ["in_app", "email", "sms"], priority: "Normal", enabled: true, protected: true, updatedAt: "2026-07-18 10:04" },
  { id: "r2", event: "Appointment cancelled", category: "Appointments", recipients: "Patient, Front desk", channels: ["in_app", "sms"], priority: "High", enabled: true, protected: false, updatedAt: "2026-07-18 10:04" },
  { id: "r3", event: "Lab result ready", category: "Lab Results", recipients: "Patient, Attending doctor", channels: ["in_app", "email"], priority: "High", enabled: true, protected: false, updatedAt: "2026-07-15 09:12" },
  { id: "r4", event: "Invoice overdue", category: "Billing", recipients: "Billing team", channels: ["email"], priority: "Normal", enabled: false, protected: false, updatedAt: "2026-07-10 16:40" },
  { id: "r5", event: "Critical stock shortage", category: "Inventory", recipients: "Pharmacy roles", channels: ["in_app", "email"], priority: "Critical", enabled: true, protected: true, updatedAt: "2026-06-30 08:55" },
  { id: "r6", event: "Shift roster published", category: "Staff", recipients: "All staff", channels: ["in_app"], priority: "Low", enabled: true, protected: false, updatedAt: "2026-06-28 14:20" },
  { id: "r7", event: "System maintenance window", category: "System", recipients: "Admins", channels: ["in_app", "email"], priority: "Normal", enabled: true, protected: true, updatedAt: "2026-06-20 11:02" },
];

const IP_ENTRIES = [
  { id: "ip1", value: "203.0.113.14/32", type: "IPv4" },
  { id: "ip2", value: "198.51.100.0/24", type: "CIDR" },
  { id: "ip3", value: "2001:db8::/32", type: "IPv6" },
];

const HISTORY_ROWS = [
  { id: "h1", fields: "MFA policy", actor: "Abhishek Negi", at: "2026-07-20 18:22", version: "v12 → v13", reason: "Tightened policy after audit", requestId: "req_8a21f0" },
  { id: "h2", fields: "Password policy, Login protection", actor: "System (migration)", at: "2026-07-01 03:00", version: "v11 → v12", reason: "Platform minimum enforcement rollout", requestId: "req_7c904d" },
  { id: "h3", fields: "IP allowlist", actor: "Abhishek Negi", at: "2026-06-22 12:11", version: "v10 → v11", reason: "Added clinic branch office range", requestId: "req_5f11ab" },
  { id: "h4", fields: "Session policy", actor: "Priya Sharma", at: "2026-06-10 09:47", version: "v9 → v10", reason: "Reduced session timeout", requestId: "req_44e2c9" },
];

/* ============================================================================
   PRIMITIVES
============================================================================ */
function Badge({ tone = "slate", children, icon: Icon }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600 border-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", tones[tone])}>
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}

function Field({ label, hint, error, required, children, className }) {
  return (
    <label className={cx("block", className)}>
      {label && (
        <span className="mb-1.5 flex items-center gap-1 text-[13px] font-medium text-slate-700">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-1 flex items-center gap-1 text-[12px] text-rose-600">
          <AlertCircle className="h-3 w-3" /> {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-[12px] text-slate-400">{hint}</span>
      ) : null}
    </label>
  );
}

function TextInput({ className, disabled, ...props }) {
  return (
    <input
      disabled={disabled}
      className={cx(
        "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400",
        "focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
        disabled && "cursor-not-allowed bg-slate-50 text-slate-400",
        className
      )}
      {...props}
    />
  );
}

function Select({ className, disabled, children, ...props }) {
  return (
    <div className="relative">
      <select
        disabled={disabled}
        className={cx(
          "h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-[13px] text-slate-800 outline-none transition",
          "focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
          disabled && "cursor-not-allowed bg-slate-50 text-slate-400",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cx(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors outline-none",
        "focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1",
        checked ? "bg-blue-600" : "bg-slate-200",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className={cx("inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform", checked ? "translate-x-4.5 ml-1" : "translate-x-1")} />
    </button>
  );
}

function Checkbox({ checked, onChange, disabled, label }) {
  return (
    <label className={cx("flex select-none items-center gap-2 text-[13px] text-slate-700", disabled ? "cursor-not-allowed text-slate-400" : "cursor-pointer")}>
      <span
        onClick={() => !disabled && onChange(!checked)}
        className={cx(
          "flex h-4 w-4 items-center justify-center rounded border transition-colors",
          checked ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white",
          disabled && "border-slate-200 bg-slate-100"
        )}
      >
        {checked && <Check className="h-3 w-3 text-white" />}
      </span>
      {label}
    </label>
  );
}

function Button({ variant = "secondary", size = "md", className, icon: Icon, children, ...props }) {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:text-slate-300",
    ghost: "text-slate-500 hover:bg-slate-100 disabled:text-slate-300",
    danger: "bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 disabled:text-rose-200",
    dangerSolid: "bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300",
  };
  const sizes = { sm: "h-7 px-2.5 text-[12px]", md: "h-9 px-3.5 text-[13px]" };
  return (
    <button
      className={cx("inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:cursor-not-allowed", variants[variant], sizes[size], className)}
      {...props}
    >
      {Icon && <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />}
      {children}
    </button>
  );
}

function SectionCard({ title, eyebrow, description, actions, children, id }) {
  return (
    <section id={id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          {eyebrow && <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">{eyebrow}</p>}
          <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
          {description && <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

function InlineBanner({ tone = "amber", icon: Icon = AlertTriangle, title, children, action }) {
  const tones = {
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    rose: "border-rose-200 bg-rose-50 text-rose-800",
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
  };
  return (
    <div className={cx("flex items-start gap-3 rounded-xl border p-3.5", tones[tone])}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1 text-[13px] leading-relaxed">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div>
      </div>
      {action}
    </div>
  );
}

function Skeleton({ className }) {
  return <div className={cx("animate-pulse rounded-md bg-slate-200/70", className)} />;
}

function EmptyState({ icon: Icon = Info, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-[14px] font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/50 px-6 py-14 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-rose-200">
        <AlertTriangle className="h-5 w-5 text-rose-500" />
      </div>
      <p className="text-[14px] font-semibold text-slate-700">Couldn't load settings</p>
      <p className="mt-1 max-w-sm text-[13px] text-slate-500">Something went wrong while fetching this tab's settings and capabilities. Your existing data hasn't been changed.</p>
      <Button variant="primary" size="sm" icon={RefreshCw} className="mt-4" onClick={onRetry}>Retry</Button>
    </div>
  );
}

function Toasts({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cx(
            "pointer-events-auto flex items-start gap-2.5 rounded-xl border p-3 shadow-lg backdrop-blur-sm animate-[fadeIn_.15s_ease-out]",
            t.tone === "error" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
          )}
        >
          {t.tone === "error" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
          <div className="flex-1 text-[13px] leading-snug">{t.message}</div>
          <button onClick={() => onDismiss(t.id)} className="text-current opacity-60 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function ConfirmDialog({ open, tone = "amber", title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className={cx("mb-3 flex h-10 w-10 items-center justify-center rounded-full", tone === "rose" ? "bg-rose-50" : "bg-amber-50")}>
          <AlertTriangle className={cx("h-5 w-5", tone === "rose" ? "text-rose-500" : "text-amber-500")} />
        </div>
        <h4 className="text-[15px] font-semibold text-slate-900">{title}</h4>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={tone === "rose" ? "dangerSolid" : "primary"} size="sm" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

function ConflictDialog({ open, onKeepMine, onReload, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
          <ChevronsUpDown className="h-5 w-5 text-amber-500" />
        </div>
        <h4 className="text-[15px] font-semibold text-slate-900">This tab changed since you started editing</h4>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
          Someone else saved a newer version (v13) while you were editing v12. You can overwrite it with your changes, or discard yours and reload the latest version.
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>Keep editing</Button>
          <Button variant="secondary" size="sm" onClick={onReload}>Discard mine &amp; reload</Button>
          <Button variant="primary" size="sm" onClick={onKeepMine}>Overwrite with mine</Button>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ version, updatedAt, updatedBy, readOnly }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-400">
      <span className="inline-flex items-center gap-1"><History className="h-3 w-3" /> Version {version}</span>
      <span>Updated {updatedAt}</span>
      <span>by {updatedBy}</span>
      {readOnly && <Badge tone="slate" icon={Lock}>Read-only for your role</Badge>}
    </div>
  );
}

/* ============================================================================
   OPERATIONAL TAB
============================================================================ */
function OperationalTab({ data, setData, readOnly, search }) {
  const set = (patch) => setData((d) => ({ ...d, ...patch }));
  const setHour = (day, patch) => setData((d) => ({ ...d, hours: { ...d.hours, [day]: { ...d.hours[day], ...patch } } }));

  const [copyMenuFor, setCopyMenuFor] = useState(null);
  const hoursError = (day) => {
    const h = data.hours[day];
    if (h.closed) return null;
    if (h.open >= h.close) return "Opening time must be before closing time";
    return null;
  };

  const applyWeekdayHours = () => {
    const mon = data.hours.mon;
    setData((d) => {
      const hours = { ...d.hours };
      ["tue", "wed", "thu", "fri"].forEach((k) => (hours[k] = { ...hours[k], open: mon.open, close: mon.close, closed: false }));
      return { ...d, hours };
    });
  };
  const clearHours = () => setData((d) => ({ ...d, hours: DEFAULT_HOURS() }));
  const copyDayTo = (from, to) => {
    setData((d) => ({ ...d, hours: { ...d.hours, [to]: { ...d.hours[from] } } }));
    setCopyMenuFor(null);
  };

  const patternError = (val) => {
    if (!val.includes("{SEQ}")) return "Pattern must include the {SEQ} token";
    const tokenRegex = /\{[A-Z]+\}/g;
    const found = val.match(tokenRegex) || [];
    const bad = found.filter((t) => !NUMBER_TOKENS.includes(t));
    if (bad.length) return `Unsupported token${bad.length > 1 ? "s" : ""}: ${bad.join(", ")}`;
    return null;
  };
  const preview = (pattern) =>
    pattern.replace("{SEQ}", "00042").replace("{YYYY}", "2026").replace("{MM}", "07").replace("{DD}", "29").replace("{DEPT}", "CARD");

  const sections = [
    { id: "localization", text: "localization timezone locale date time format working days" },
    { id: "hours", text: "operating hours open close day copy apply weekdays clear" },
    { id: "rules", text: "appointment consultation duration booking cancellation rescheduling walk-in emergency" },
    { id: "numbering", text: "numbering configuration patient appointment queue pattern token" },
    { id: "fiscal", text: "fiscal year starting month" },
  ];
  const q = search.trim().toLowerCase();
  const visible = (id) => !q || sections.find((s) => s.id === id).text.includes(q);

  const isDefault = (val, def) => JSON.stringify(val) === JSON.stringify(def);

  return (
    <div className="flex flex-col gap-5">
      {visible("localization") && (
        <SectionCard
          title="Localization"
          eyebrow="Regional format"
          description="Controls how dates, times, and language render across the hospital workspace."
          actions={
            <Button variant="ghost" size="sm" icon={RotateCcw} disabled={readOnly} onClick={() => set({ timezone: DEFAULT_OPERATIONAL.timezone, locale: DEFAULT_OPERATIONAL.locale, dateFormat: DEFAULT_OPERATIONAL.dateFormat, timeFormat: DEFAULT_OPERATIONAL.timeFormat, workingDays: DEFAULT_OPERATIONAL.workingDays })}>
              Reset section
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Timezone">
              <Select disabled={readOnly} value={data.timezone} onChange={(e) => set({ timezone: e.target.value })}>
                {TIMEZONES.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Locale">
              <Select disabled={readOnly} value={data.locale} onChange={(e) => set({ locale: e.target.value })}>
                {LOCALES.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Date format" hint={!isDefault(data.dateFormat, DEFAULT_OPERATIONAL.dateFormat) ? "Custom" : "Default"}>
              <Select disabled={readOnly} value={data.dateFormat} onChange={(e) => set({ dateFormat: e.target.value })}>
                {DATE_FORMATS.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Time format">
              <Select disabled={readOnly} value={data.timeFormat} onChange={(e) => set({ timeFormat: e.target.value })}>
                {TIME_FORMATS.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
          </div>
          <div className="mt-4">
            <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Working days</span>
            <div className="flex flex-wrap gap-2">
              {DAY_KEYS.map((d) => {
                const on = data.workingDays.includes(d);
                return (
                  <button
                    key={d}
                    disabled={readOnly}
                    onClick={() => set({ workingDays: on ? data.workingDays.filter((x) => x !== d) : [...data.workingDays, d] })}
                    className={cx(
                      "rounded-full border px-3 py-1.5 text-[12px] font-medium transition",
                      on ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                      readOnly && "cursor-not-allowed opacity-60"
                    )}
                  >
                    {DAY_LABELS[d].slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>
        </SectionCard>
      )}

      {visible("hours") && (
        <SectionCard
          title="Operating hours"
          eyebrow="Availability"
          description="Set per-day opening and closing times used for scheduling and the public listing."
          actions={
            <>
              <Button variant="secondary" size="sm" disabled={readOnly} onClick={applyWeekdayHours}>Apply Monday's hours to weekdays</Button>
              <Button variant="ghost" size="sm" icon={RotateCcw} disabled={readOnly} onClick={clearHours}>Clear hours</Button>
            </>
          }
        >
          <div className="overflow-hidden rounded-xl border border-slate-100">
            {DAY_KEYS.map((d, i) => {
              const h = data.hours[d];
              const err = hoursError(d);
              return (
                <div key={d} className={cx("flex flex-wrap items-center gap-3 px-4 py-3", i !== 0 && "border-t border-slate-100", h.closed && "bg-slate-50/60")}>
                  <div className="flex w-32 items-center gap-2">
                    <Toggle checked={!h.closed} onChange={(v) => setHour(d, { closed: !v })} disabled={readOnly} label={`${DAY_LABELS[d]} open`} />
                    <span className="text-[13px] font-medium text-slate-700">{DAY_LABELS[d]}</span>
                  </div>
                  {h.closed ? (
                    <Badge tone="slate">Closed</Badge>
                  ) : (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <TextInput type="time" className="w-32" disabled={readOnly} value={h.open} onChange={(e) => setHour(d, { open: e.target.value })} />
                      <span className="text-[12px] text-slate-400">to</span>
                      <TextInput type="time" className="w-32" disabled={readOnly} value={h.close} onChange={(e) => setHour(d, { close: e.target.value })} />
                      {err && <span className="flex items-center gap-1 text-[12px] text-rose-600"><AlertCircle className="h-3 w-3" />{err}</span>}
                    </div>
                  )}
                  <div className="relative ml-auto">
                    <Button variant="ghost" size="sm" icon={Copy} disabled={readOnly} onClick={() => setCopyMenuFor(copyMenuFor === d ? null : d)}>Copy to…</Button>
                    {copyMenuFor === d && (
                      <div className="absolute right-0 top-9 z-10 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                        {DAY_KEYS.filter((x) => x !== d).map((x) => (
                          <button key={x} onClick={() => copyDayTo(d, x)} className="block w-full rounded-md px-2.5 py-1.5 text-left text-[12px] text-slate-600 hover:bg-slate-50">
                            {DAY_LABELS[x]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {visible("rules") && (
        <SectionCard title="Appointment &amp; consultation rules" eyebrow="Scheduling" description="Booking windows and durations enforced across the scheduling flow.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Appointment slot duration" hint="minutes">
              <TextInput type="number" min={5} step={5} disabled={readOnly} value={data.slotDuration} onChange={(e) => set({ slotDuration: +e.target.value })} />
            </Field>
            <Field label="Consultation duration" hint="minutes">
              <TextInput type="number" min={5} step={5} disabled={readOnly} value={data.consultDuration} onChange={(e) => set({ consultDuration: +e.target.value })} />
            </Field>
            <Field label="Advance booking window" hint="days ahead patients can book">
              <TextInput type="number" min={1} disabled={readOnly} value={data.advanceBookingDays} onChange={(e) => set({ advanceBookingDays: +e.target.value })} />
            </Field>
            <Field label="Cancellation window" hint="hours before appointment">
              <TextInput type="number" min={0} disabled={readOnly} value={data.cancellationHours} onChange={(e) => set({ cancellationHours: +e.target.value })} />
            </Field>
            <Field label="Rescheduling window" hint="hours before appointment">
              <TextInput type="number" min={0} disabled={readOnly} value={data.reschedulingHours} onChange={(e) => set({ reschedulingHours: +e.target.value })} />
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap gap-6 border-t border-slate-100 pt-4">
            <label className="flex items-center gap-2.5 text-[13px] font-medium text-slate-700">
              <Toggle checked={data.walkIn} onChange={(v) => set({ walkIn: v })} disabled={readOnly} label="Walk-in" /> Allow walk-in patients
            </label>
            <label className="flex items-center gap-2.5 text-[13px] font-medium text-slate-700">
              <Toggle checked={data.emergency} onChange={(v) => set({ emergency: v })} disabled={readOnly} label="Emergency service" /> Emergency service enabled
            </label>
          </div>
        </SectionCard>
      )}

      {visible("numbering") && (
        <SectionCard title="Numbering configuration" eyebrow="Identifiers" description="Patterns used to generate patient, appointment, and queue numbers.">
          <div className="mb-4 flex flex-wrap items-center gap-1.5 rounded-lg bg-slate-50 p-2.5 text-[12px] text-slate-500">
            <span className="mr-1 font-medium text-slate-600">Supported tokens:</span>
            {NUMBER_TOKENS.map((t) => <code key={t} className="rounded bg-white px-1.5 py-0.5 font-mono text-slate-700 ring-1 ring-slate-200">{t}</code>)}
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {[
              { key: "patientPattern", label: "Patient number pattern" },
              { key: "appointmentPattern", label: "Appointment number pattern" },
              { key: "queuePattern", label: "Queue number pattern" },
            ].map(({ key, label }) => {
              const err = patternError(data[key]);
              return (
                <Field key={key} label={label} error={err} required>
                  <TextInput disabled={readOnly} value={data[key]} onChange={(e) => set({ [key]: e.target.value })} className="font-mono" />
                  {!err && <p className="mt-1.5 text-[12px] text-slate-400">Preview: <span className="font-mono text-slate-600">{preview(data[key])}</span></p>}
                </Field>
              );
            })}
          </div>
        </SectionCard>
      )}

      {visible("fiscal") && (
        <SectionCard title="Fiscal configuration" eyebrow="Finance" description="Used to align billing and analytics reporting periods.">
          <Field label="Fiscal year starting month" className="max-w-xs">
            <Select disabled={readOnly} value={data.fiscalMonth} onChange={(e) => set({ fiscalMonth: e.target.value })}>
              {FISCAL_MONTHS.map((m) => <option key={m}>{m}</option>)}
            </Select>
          </Field>
        </SectionCard>
      )}

      {q && !sections.some((s) => visible(s.id)) && (
        <EmptyState icon={Search} title={`No settings match "${search}"`} description="Try a different search term, or clear the search to see all operational settings." />
      )}
    </div>
  );
}

/* ============================================================================
   NOTIFICATIONS TAB
============================================================================ */
const REMINDER_MIN = 5;
const REMINDER_MAX = 43200; // 30 days in minutes
function formatMinutes(m) {
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"}`;
  if (m < 1440) { const h = m / 60; return `${h % 1 === 0 ? h : h.toFixed(1)} hour${h === 1 ? "" : "s"}`; }
  const d = m / 1440; return `${d % 1 === 0 ? d : d.toFixed(1)} day${d === 1 ? "" : "s"}`;
}

function RuleDrawer({ open, onClose, rule, onSave }) {
  const isEdit = !!rule?.id;
  const [form, setForm] = useState(() => rule || { event: "", category: CATEGORY_OPTIONS[0], enabled: true, channels: ["in_app"], recipientType: "Roles", roles: [], priority: "Normal" });
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  useEffect(() => { setForm(rule || { event: "", category: CATEGORY_OPTIONS[0], enabled: true, channels: ["in_app"], recipientType: "Roles", roles: [], priority: "Normal" }); setDirty(false); }, [rule, open]);

  if (!open) return null;
  const update = (patch) => { setForm((f) => ({ ...f, ...patch })); setDirty(true); };
  const toggleChannel = (key) => {
    const c = CHANNEL_DEFS.find((c) => c.key === key);
    if (!c.available) return;
    update({ channels: form.channels.includes(key) ? form.channels.filter((k) => k !== key) : [...form.channels, key] });
  };
  const requestClose = () => (dirty ? setConfirmClose(true) : onClose());

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-slate-900/30" onClick={requestClose} />
      <div className="fixed right-0 top-0 z-[75] flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-[15px] font-semibold text-slate-900">{isEdit ? "Edit notification rule" : "Create notification rule"}</h3>
            {isEdit && form.protected && <Badge tone="amber" icon={Shield} className="mt-1">Protected rule</Badge>}
          </div>
          <button onClick={requestClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {isEdit && form.protected && (
            <InlineBanner tone="amber" title="This rule is protected">
              System-critical rules can't be fully disabled because downstream workflows depend on them. You can still edit recipients and channels.
            </InlineBanner>
          )}
          <Field label="Event category" required>
            <Select value={form.category} onChange={(e) => update({ category: e.target.value })}>
              {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Event type" required hint="What triggers this notification">
            <TextInput placeholder="e.g. Appointment confirmed" value={form.event} onChange={(e) => update({ event: e.target.value })} />
          </Field>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
            <span className="text-[13px] font-medium text-slate-700">Rule enabled</span>
            <Toggle checked={form.enabled} disabled={isEdit && form.protected} onChange={(v) => update({ enabled: v })} />
          </div>
          <div>
            <span className="mb-2 block text-[13px] font-medium text-slate-700">Channels</span>
            <div className="flex flex-wrap gap-2">
              {CHANNEL_DEFS.map((c) => {
                const active = form.channels.includes(c.key);
                return (
                  <button
                    key={c.key}
                    type="button"
                    disabled={!c.available}
                    onClick={() => toggleChannel(c.key)}
                    title={!c.available ? c.reason : ""}
                    className={cx(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition",
                      active ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500",
                      !c.available && "cursor-not-allowed opacity-40"
                    )}
                  >
                    <c.icon className="h-3.5 w-3.5" /> {c.label}
                  </button>
                );
              })}
            </div>
          </div>
          <Field label="Recipient type">
            <div className="flex gap-2">
              {["Roles", "Users", "Departments"].map((t) => (
                <button key={t} onClick={() => update({ recipientType: t, roles: [] })} className={cx("flex-1 rounded-lg border px-3 py-2 text-[12px] font-medium", form.recipientType === t ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500")}>
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <Field label={`Select ${form.recipientType.toLowerCase()}`} hint="Search is scoped to your tenant; duplicates are prevented automatically.">
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-slate-200 p-2">
              {form.roles.map((r) => (
                <span key={r} className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[12px] text-slate-600">
                  {r} <button onClick={() => update({ roles: form.roles.filter((x) => x !== r) })}><X className="h-3 w-3" /></button>
                </span>
              ))}
              <input
                placeholder="Type to search &amp; press Enter…"
                className="min-w-[120px] flex-1 border-none text-[13px] outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    const v = e.currentTarget.value.trim();
                    if (!form.roles.includes(v)) update({ roles: [...form.roles, v] });
                    e.currentTarget.value = "";
                  }
                }}
              />
            </div>
          </Field>
          <Field label="Escalation delay" hint="minutes before escalating an unread critical alert">
            <TextInput type="number" min={0} value={form.escalationDelay ?? 15} onChange={(e) => update({ escalationDelay: +e.target.value })} />
          </Field>
          <Field label="Priority">
            <Select value={form.priority} onChange={(e) => update({ priority: e.target.value })}>
              {PRIORITY_OPTIONS.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button variant="secondary" onClick={requestClose}>Cancel</Button>
          <Button variant="primary" icon={Check} disabled={!form.event.trim()} onClick={() => onSave(form)}>Save rule</Button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmClose}
        title="Discard unsaved changes?"
        description="You have unsaved edits to this rule. Closing now will discard them."
        confirmLabel="Discard"
        tone="rose"
        onCancel={() => setConfirmClose(false)}
        onConfirm={() => { setConfirmClose(false); onClose(); }}
      />
    </>
  );
}

function NotificationsTab({ data, setData, readOnly, rules, setRules, pushToast }) {
  const set = (patch) => setData((d) => ({ ...d, ...patch }));
  const [reminderInput, setReminderInput] = useState({ value: 1, unit: "hours" });
  const [reminderError, setReminderError] = useState("");
  const [drawer, setDrawer] = useState({ open: false, rule: null });
  const [ruleFilters, setRuleFilters] = useState({ search: "", category: "All", channel: "All", priority: "All", enabled: "All", page: 1 });
  const [pendingDisable, setPendingDisable] = useState(null);
  const PAGE_SIZE = 5;

  const addReminder = () => {
    const mult = { minutes: 1, hours: 60, days: 1440 }[reminderInput.unit];
    const minutes = Math.round(reminderInput.value * mult);
    if (minutes < REMINDER_MIN || minutes > REMINDER_MAX) return setReminderError(`Must be between ${REMINDER_MIN} minutes and ${formatMinutes(REMINDER_MAX)}`);
    if (data.reminders.includes(minutes)) return setReminderError("That reminder already exists");
    setReminderError("");
    set({ reminders: [...data.reminders, minutes].sort((a, b) => a - b) });
  };
  const removeReminder = (m) => set({ reminders: data.reminders.filter((x) => x !== m) });

  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (ruleFilters.search && !r.event.toLowerCase().includes(ruleFilters.search.toLowerCase())) return false;
      if (ruleFilters.category !== "All" && r.category !== ruleFilters.category) return false;
      if (ruleFilters.channel !== "All" && !r.channels.includes(ruleFilters.channel)) return false;
      if (ruleFilters.priority !== "All" && r.priority !== ruleFilters.priority) return false;
      if (ruleFilters.enabled !== "All" && (ruleFilters.enabled === "Enabled") !== r.enabled) return false;
      return true;
    });
  }, [rules, ruleFilters]);
  const totalPages = Math.max(1, Math.ceil(filteredRules.length / PAGE_SIZE));
  const pageRules = filteredRules.slice((ruleFilters.page - 1) * PAGE_SIZE, ruleFilters.page * PAGE_SIZE);

  const saveRule = (form) => {
    if (form.id) {
      setRules((rs) => rs.map((r) => (r.id === form.id ? { ...r, ...form, updatedAt: "just now" } : r)));
      pushToast("Rule updated");
    } else {
      setRules((rs) => [{ ...form, id: `r${Date.now()}`, protected: false, updatedAt: "just now" }, ...rs]);
      pushToast("Rule created");
    }
    setDrawer({ open: false, rule: null });
  };
  const duplicateRule = (r) => { setRules((rs) => [{ ...r, id: `r${Date.now()}`, event: `${r.event} (copy)`, protected: false, updatedAt: "just now" }, ...rs]); pushToast("Rule duplicated"); };
  const deleteRule = (r) => { setRules((rs) => rs.filter((x) => x.id !== r.id)); pushToast("Rule deleted"); };
  const toggleEnabled = (r) => {
    if (r.enabled && r.priority === "Critical") return setPendingDisable(r);
    setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, enabled: !x.enabled } : x)));
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Channels" eyebrow="Delivery" description="Availability depends on tenant integrations. Unavailable channels can't be toggled here.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CHANNEL_DEFS.map((c) => (
            <div key={c.key} className={cx("rounded-xl border p-3.5", c.available ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/60")}>
              <div className="mb-2 flex items-center justify-between">
                <c.icon className={cx("h-4 w-4", c.available ? "text-blue-600" : "text-slate-300")} />
                {c.available ? (
                  <Toggle checked={data.channels[c.key]} disabled={readOnly} onChange={(v) => set({ channels: { ...data.channels, [c.key]: v } })} label={c.label} />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-slate-300" />
                )}
              </div>
              <p className="text-[13px] font-semibold text-slate-800">{c.label}</p>
              <Badge tone={c.available ? "emerald" : "slate"} className="mt-1.5">{c.available ? "Available" : "Unavailable"}</Badge>
              <p className="mt-2 text-[11px] leading-snug text-slate-400">{c.available ? c.integration : c.reason}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Quiet hours" eyebrow="Delivery timing" description="Non-critical notifications are held during this window and delivered afterward.">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
          <span className="text-[13px] font-medium text-slate-700">Enable quiet hours</span>
          <Toggle checked={data.quietHours.enabled} disabled={readOnly} onChange={(v) => set({ quietHours: { ...data.quietHours, enabled: v } })} />
        </div>
        {data.quietHours.enabled && (
          <>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Start time"><TextInput type="time" disabled={readOnly} value={data.quietHours.start} onChange={(e) => set({ quietHours: { ...data.quietHours, start: e.target.value } })} /></Field>
              <Field label="End time"><TextInput type="time" disabled={readOnly} value={data.quietHours.end} onChange={(e) => set({ quietHours: { ...data.quietHours, end: e.target.value } })} /></Field>
              <Field label="Timezone">
                <Select disabled={readOnly} value={data.quietHours.timezone} onChange={(e) => set({ quietHours: { ...data.quietHours, timezone: e.target.value } })}>
                  {TIMEZONES.map((t) => <option key={t}>{t}</option>)}
                </Select>
              </Field>
            </div>
            <InlineBanner tone="blue" icon={Clock} className="mt-4">
              Active {data.quietHours.start}–{data.quietHours.end}{data.quietHours.start > data.quietHours.end ? " (crosses midnight)" : ""}, {data.quietHours.timezone.split(" ")[0]}.
            </InlineBanner>
          </>
        )}
      </SectionCard>

      <SectionCard title="Reminder schedule" eyebrow="Appointments" description="Patients get reminders at each of these offsets before their appointment.">
        <div className="mb-4 flex flex-wrap gap-2">
          {data.reminders.map((m) => (
            <span key={m} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700">
              {formatMinutes(m)} before
              {!readOnly && <button onClick={() => removeReminder(m)} className="text-slate-400 hover:text-rose-500"><X className="h-3 w-3" /></button>}
            </span>
          ))}
          {data.reminders.length === 0 && <span className="text-[13px] text-slate-400">No reminders configured.</span>}
        </div>
        {!readOnly && (
          <div className="flex flex-wrap items-end gap-2">
            <Field label="Add reminder">
              <div className="flex gap-2">
                <TextInput type="number" min={1} className="w-24" value={reminderInput.value} onChange={(e) => setReminderInput((r) => ({ ...r, value: +e.target.value }))} />
                <Select className="w-32" value={reminderInput.unit} onChange={(e) => setReminderInput((r) => ({ ...r, unit: e.target.value }))}>
                  <option value="minutes">minutes</option>
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                </Select>
              </div>
            </Field>
            <Button variant="secondary" icon={Plus} onClick={addReminder}>Add reminder</Button>
          </div>
        )}
        {reminderError && <p className="mt-2 flex items-center gap-1 text-[12px] text-rose-600"><AlertCircle className="h-3 w-3" />{reminderError}</p>}
      </SectionCard>

      <SectionCard title="Escalation" eyebrow="Critical alerts" description="Re-notify a wider group if a critical alert isn't acknowledged in time.">
        <InlineBanner tone="amber" className="mb-4">
          Escalation delivery is configuration-only on the current plan — rules save, but escalated sends are queued rather than delivered until this is enabled on your subscription.
        </InlineBanner>
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
          <span className="text-[13px] font-medium text-slate-700">Enable escalation</span>
          <Toggle checked={data.escalation.enabled} disabled={readOnly} onChange={(v) => set({ escalation: { ...data.escalation, enabled: v } })} />
        </div>
        {data.escalation.enabled && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Escalation delay" hint="minutes">
              <TextInput type="number" min={1} disabled={readOnly} value={data.escalation.delayMinutes} onChange={(e) => set({ escalation: { ...data.escalation, delayMinutes: +e.target.value } })} />
            </Field>
            <Field label="Priority">
              <Select disabled={readOnly} value={data.escalation.priority} onChange={(e) => set({ escalation: { ...data.escalation, priority: e.target.value } })}>
                {PRIORITY_OPTIONS.map((p) => <option key={p}>{p}</option>)}
              </Select>
            </Field>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Notification rules"
        eyebrow="Rule engine"
        description="Which events notify whom, on which channels."
        actions={<Button variant="primary" size="sm" icon={Plus} onClick={() => setDrawer({ open: true, rule: null })}>Create rule</Button>}
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <TextInput className="pl-8" placeholder="Search rules…" value={ruleFilters.search} onChange={(e) => setRuleFilters((f) => ({ ...f, search: e.target.value, page: 1 }))} />
          </div>
          <Select className="w-40" value={ruleFilters.category} onChange={(e) => setRuleFilters((f) => ({ ...f, category: e.target.value, page: 1 }))}>
            <option>All</option>{CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Select className="w-36" value={ruleFilters.channel} onChange={(e) => setRuleFilters((f) => ({ ...f, channel: e.target.value, page: 1 }))}>
            <option value="All">All channels</option>{CHANNEL_DEFS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </Select>
          <Select className="w-32" value={ruleFilters.priority} onChange={(e) => setRuleFilters((f) => ({ ...f, priority: e.target.value, page: 1 }))}>
            <option>All</option>{PRIORITY_OPTIONS.map((p) => <option key={p}>{p}</option>)}
          </Select>
          <Select className="w-32" value={ruleFilters.enabled} onChange={(e) => setRuleFilters((f) => ({ ...f, enabled: e.target.value, page: 1 }))}>
            <option>All</option><option>Enabled</option><option>Disabled</option>
          </Select>
        </div>

        {filteredRules.length === 0 ? (
          <EmptyState icon={Filter} title="No rules match your filters" description="Try clearing filters or search terms." action={<Button variant="secondary" size="sm" onClick={() => setRuleFilters({ search: "", category: "All", channel: "All", priority: "All", enabled: "All", page: 1 })}>Clear filters</Button>} />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[820px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2.5 font-medium">Event</th>
                  <th className="px-3 py-2.5 font-medium">Category</th>
                  <th className="px-3 py-2.5 font-medium">Recipients</th>
                  <th className="px-3 py-2.5 font-medium">Channels</th>
                  <th className="px-3 py-2.5 font-medium">Priority</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Updated</th>
                  <th className="px-3 py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRules.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-3 py-2.5 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">{r.event} {r.protected && <Shield className="h-3 w-3 text-amber-500" />}</div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500">{r.category}</td>
                    <td className="px-3 py-2.5 text-slate-500">{r.recipients}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        {r.channels.map((k) => { const c = CHANNEL_DEFS.find((c) => c.key === k); return <c.icon key={k} className="h-3.5 w-3.5 text-slate-400" />; })}
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><Badge tone={r.priority === "Critical" ? "rose" : r.priority === "High" ? "amber" : "slate"}>{r.priority}</Badge></td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => toggleEnabled(r)} className="inline-flex items-center gap-1.5">
                        <Toggle checked={r.enabled} onChange={() => toggleEnabled(r)} label="Rule enabled" />
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-slate-400">{r.updatedAt}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setDrawer({ open: true, rule: r })}>Edit</Button>
                        <Button variant="ghost" size="sm" icon={Copy} onClick={() => duplicateRule(r)} />
                        <Button variant="ghost" size="sm" icon={Trash2} className="hover:text-rose-600" onClick={() => deleteRule(r)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between text-[12px] text-slate-400">
          <span>{filteredRules.length} rule{filteredRules.length === 1 ? "" : "s"}</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={ChevronLeft} disabled={ruleFilters.page <= 1} onClick={() => setRuleFilters((f) => ({ ...f, page: f.page - 1 }))} />
            <span>Page {ruleFilters.page} of {totalPages}</span>
            <Button variant="ghost" size="sm" icon={ChevronRight} disabled={ruleFilters.page >= totalPages} onClick={() => setRuleFilters((f) => ({ ...f, page: f.page + 1 }))} />
          </div>
        </div>
      </SectionCard>

      <RuleDrawer open={drawer.open} rule={drawer.rule} onClose={() => setDrawer({ open: false, rule: null })} onSave={saveRule} />
      <ConfirmDialog
        open={!!pendingDisable}
        tone="rose"
        title="Disable a critical, protected rule?"
        description={`"${pendingDisable?.event}" is marked critical and protected. Disabling it may stop time-sensitive alerts from reaching staff.`}
        confirmLabel="Disable anyway"
        onCancel={() => setPendingDisable(null)}
        onConfirm={() => { setRules((rs) => rs.map((x) => (x.id === pendingDisable.id ? { ...x, enabled: false } : x))); setPendingDisable(null); }}
      />
    </div>
  );
}

/* ============================================================================
   SECURITY TAB
============================================================================ */
function LockedField({ label, hint, children }) {
  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        {children}
        <Lock className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
      </div>
    </Field>
  );
}

function SecurityTab({ security, historyFilters, setHistoryFilters, historyRows }) {
  const [historyDetail, setHistoryDetail] = useState(null);
  const rows = historyRows || HISTORY_ROWS;
  const filteredHistory = rows.filter((h) => {
    if (historyFilters.actor !== "All" && h.actor !== historyFilters.actor) return false;
    return true;
  });
  const actors = ["All", ...new Set(rows.map((h) => h.actor))];

  return (
    <div className="flex flex-col gap-5">
      <InlineBanner tone="rose" icon={ShieldAlert} title="Security settings are read-only right now">
        Changing security policy requires proof of recent reauthentication, which this session doesn't have yet. You can review every setting below, but editing is disabled until you reauthenticate — there's no client-side confirmation that can unlock this.
      </InlineBanner>

      <SectionCard title="Capabilities" eyebrow="Security" description="What this environment's authentication backend currently supports.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
            <Badge tone="emerald" icon={CheckCircle2}>Available</Badge>
            <ul className="mt-2 space-y-1 text-[12px] text-slate-600">
              <li>Password policy</li><li>Login protection</li><li>IP allowlist</li><li>Login hours</li>
            </ul>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5">
            <Badge tone="amber" icon={SlidersHorizontal}>Configuration-only</Badge>
            <ul className="mt-2 space-y-1 text-[12px] text-slate-600">
              <li>Session policy</li><li>MFA (Optional tier only)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5">
            <Badge tone="rose" icon={ShieldOff}>Unsupported</Badge>
            <ul className="mt-2 space-y-1 text-[12px] text-slate-600">
              <li>Active session listing &amp; revocation</li><li>Emergency break-glass access</li>
            </ul>
          </div>
        </div>
        <p className="mt-3 text-[12px] text-slate-400">Reauthentication required for changes · Session management: not yet available in this environment.</p>
      </SectionCard>

      <SectionCard title="Password policy" eyebrow="Authentication" description="Minimums are floored by the platform-wide policy and can only be made stricter.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <LockedField label="Minimum password length" hint="Platform minimum: 10"><TextInput disabled value={security.minLength} /></LockedField>
          <LockedField label="Password expiry" hint="days · 0 = never"><TextInput disabled value={security.expiryDays} /></LockedField>
          <LockedField label="Password history" hint="prevents reusing the last N passwords"><TextInput disabled value={security.historyCount} /></LockedField>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4">
          {[["Require uppercase", security.reqUpper], ["Require lowercase", security.reqLower], ["Require a number", security.reqNumber], ["Require a special character", security.reqSpecial]].map(([label, val]) => (
            <Checkbox key={label} label={label} checked={val} disabled onChange={() => {}} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Multi-factor authentication" eyebrow="Authentication" description="Only Optional is currently enforceable by the authentication backend.">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {["Optional", "Required for admins", "Required for privileged users", "Required for everyone"].map((opt) => {
            const supported = opt === "Optional";
            const active = security.mfa === opt;
            return (
              <div key={opt} className={cx("flex items-center justify-between rounded-lg border px-3.5 py-2.5", active ? "border-blue-200 bg-blue-50/60" : "border-slate-200", !supported && "opacity-60")}>
                <span className="flex items-center gap-2 text-[13px] font-medium text-slate-700">
                  <span className={cx("h-3.5 w-3.5 rounded-full border-2", active ? "border-blue-600 bg-blue-600" : "border-slate-300")} />
                  {opt}
                </span>
                {supported ? <Badge tone="emerald">Enforceable</Badge> : <span className="flex items-center gap-1 text-[11px] text-slate-400"><Lock className="h-3 w-3" />Not supported by current authentication infrastructure</span>}
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Login protection" eyebrow="Authentication">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <LockedField label="Failed login attempt limit"><TextInput disabled value={security.failedAttempts} /></LockedField>
          <LockedField label="Account lockout duration" hint="minutes"><TextInput disabled value={security.lockoutMinutes} /></LockedField>
        </div>
        <div className="mt-4 flex flex-wrap gap-6 border-t border-slate-100 pt-4">
          <label className="flex items-center gap-2.5 text-[13px] font-medium text-slate-700"><Toggle checked={security.loginAlerts} disabled onChange={() => {}} /> Login alerts</label>
          <label className="flex items-center gap-2.5 text-[13px] font-medium text-slate-700"><Toggle checked={security.sensitiveReauth} disabled onChange={() => {}} /> Reauthenticate for sensitive actions</label>
        </div>
      </SectionCard>

      <SectionCard title="Session policy" eyebrow="Sessions" description="Configuration-only — the backend accepts these values but doesn't enforce them yet.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <LockedField label="Session timeout" hint="minutes · not enforced"><TextInput disabled value={security.sessionTimeout} /></LockedField>
          <LockedField label="Maximum active sessions" hint="not enforced"><TextInput disabled value={security.maxSessions} /></LockedField>
          <LockedField label="Trusted device duration" hint="days · not enforced"><TextInput disabled value={security.trustedDeviceDays} /></LockedField>
        </div>
      </SectionCard>

      <SectionCard title="Active sessions" eyebrow="Sessions">
        <EmptyState icon={ShieldOff} title="Session listing isn't available yet" description="Viewing and revoking individual sessions requires backend support that hasn't shipped for this environment. Nothing is hidden — there's simply no session data to show." />
      </SectionCard>

      <SectionCard title="IP allowlist" eyebrow="Network access" description="Restrict admin sign-in to specific IP ranges.">
        <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
          <span className="text-[13px] font-medium text-slate-700">Enable IP allowlist</span>
          <Toggle checked={security.ipAllowlistEnabled} disabled onChange={() => {}} />
        </div>
        <InlineBanner tone="amber" className="mb-4">
          Your current IP isn't in this list. Enabling the allowlist without adding it first would lock you out — this is blocked by design.
        </InlineBanner>
        <div className="overflow-hidden rounded-xl border border-slate-100">
          {(security.ipEntries || IP_ENTRIES).map((e, i) => (
            <div key={e.id} className={cx("flex items-center justify-between px-4 py-2.5", i !== 0 && "border-t border-slate-100")}>
              <span className="font-mono text-[13px] text-slate-700">{e.value}</span>
              <div className="flex items-center gap-2">
                <Badge tone="slate">{e.type}</Badge>
                <Button variant="ghost" size="sm" icon={Trash2} disabled />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <TextInput disabled placeholder="Add IPv4 address…" className="max-w-[200px]" />
          <TextInput disabled placeholder="Add IPv6 address…" className="max-w-[200px]" />
          <TextInput disabled placeholder="Add CIDR range…" className="max-w-[200px]" />
          <Button variant="secondary" size="sm" icon={Plus} disabled>Add</Button>
        </div>
      </SectionCard>

      <SectionCard title="Login hours" eyebrow="Network access" description={`Restrict admin sign-in to a weekly schedule. Uses the timezone set in Operational Settings (${DEFAULT_OPERATIONAL.timezone}).`}>
        <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
          <span className="text-[13px] font-medium text-slate-700">Enable login hours</span>
          <Toggle checked={false} disabled onChange={() => {}} />
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-100 opacity-60">
          {DAY_KEYS.map((d, i) => (
            <div key={d} className={cx("flex items-center gap-3 px-4 py-2.5", i !== 0 && "border-t border-slate-100")}>
              <span className="w-28 text-[13px] font-medium text-slate-600">{DAY_LABELS[d]}</span>
              <Badge tone="slate">08:00–20:00</Badge>
              <Button variant="ghost" size="sm" icon={Plus} disabled>Add interval</Button>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Emergency access" eyebrow="Break-glass">
        <EmptyState icon={Siren} title="No break-glass mechanism exists yet" description="Emergency access (with a required reason and a time-boxed session) isn't implemented on the backend. These controls will appear here once it ships." />
      </SectionCard>

      <SectionCard
        title="Security policy history"
        eyebrow="Audit"
        description="Every change to security settings, who made it, and why."
        actions={
          <Select className="w-44" value={historyFilters.actor} onChange={(e) => setHistoryFilters({ actor: e.target.value })}>
            {actors.map((a) => <option key={a}>{a}</option>)}
          </Select>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2.5 font-medium">Changed fields</th>
                <th className="px-3 py-2.5 font-medium">Actor</th>
                <th className="px-3 py-2.5 font-medium">Date &amp; time</th>
                <th className="px-3 py-2.5 font-medium">Version</th>
                <th className="px-3 py-2.5 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((h) => (
                <tr key={h.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-3 py-2.5 font-medium text-slate-800">{h.fields}</td>
                  <td className="px-3 py-2.5 text-slate-500">{h.actor}</td>
                  <td className="px-3 py-2.5 text-slate-400">{h.at}</td>
                  <td className="px-3 py-2.5"><Badge tone="blue">{h.version}</Badge></td>
                  <td className="px-3 py-2.5 text-right"><Button variant="ghost" size="sm" onClick={() => setHistoryDetail(h)}>View</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {historyDetail && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setHistoryDetail(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-[15px] font-semibold text-slate-900">Change details</h4>
              <button onClick={() => setHistoryDetail(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <dl className="space-y-2.5 text-[13px]">
              {[["Changed fields", historyDetail.fields], ["Actor", historyDetail.actor], ["Date & time", historyDetail.at], ["Version transition", historyDetail.version], ["Reason", historyDetail.reason], ["Request ID", historyDetail.requestId]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-slate-50 pb-2">
                  <dt className="text-slate-400">{k}</dt>
                  <dd className={cx("text-right font-medium text-slate-700", k === "Request ID" && "font-mono")}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

const DEFAULT_SECURITY = {
  minLength: 10, expiryDays: 90, historyCount: 5,
  reqUpper: true, reqLower: true, reqNumber: true, reqSpecial: false,
  mfa: "Optional",
  failedAttempts: 5, lockoutMinutes: 15, loginAlerts: true, sensitiveReauth: true,
  sessionTimeout: 30, maxSessions: 3, trustedDeviceDays: 14,
  ipAllowlistEnabled: false,
};
const WEEKDAY_TO_UI = { MONDAY: "mon", TUESDAY: "tue", WEDNESDAY: "wed", THURSDAY: "thu", FRIDAY: "fri", SATURDAY: "sat", SUNDAY: "sun" };
const UI_TO_WEEKDAY = { mon: "MONDAY", tue: "TUESDAY", wed: "WEDNESDAY", thu: "THURSDAY", fri: "FRIDAY", sat: "SATURDAY", sun: "SUNDAY" };
const MONTH_TO_NUMBER = Object.fromEntries(FISCAL_MONTHS.map((month, index) => [month, index + 1]));

function normalizeSettingsSection(section) {
  if (section === "notifications" || section === "alerts") return "notifications";
  if (section === "security" || section === "audit") return "security";
  return "operational";
}
function timezoneToUi(value) { return TIMEZONES.find((timezone) => timezone.startsWith(value)) || value || TIMEZONES[0]; }
function timezoneFromUi(value) { return String(value || TIMEZONES[0]).split(" ")[0]; }
function localeToUi(value) { if (value === "en-US") return "English (US)"; if (value === "hi-IN") return "Hindi"; if (value === "bn-IN") return "Bengali"; return "English (India)"; }
function localeFromUi(value) { if (value === "English (US)") return "en-US"; if (value === "Hindi") return "hi-IN"; if (value === "Bengali") return "bn-IN"; return "en-IN"; }
function formatUpdatedAt(value) { if (!value) return "from defaults"; return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function metaFromEnvelope(envelope, fallback) { if (!envelope?.data) return fallback; return { version: `v${envelope.data.version}`, updatedAt: formatUpdatedAt(envelope.data.updatedAt), updatedBy: envelope.data.updatedBy?.id || "System" }; }
function operationalFromBackend(settings) {
  const hours = DEFAULT_HOURS();
  Object.entries(settings.operatingHours || {}).forEach(([day, value]) => { const key = WEEKDAY_TO_UI[day]; if (key) hours[key] = { closed: !!value.closed, open: value.openTime || "09:00", close: value.closeTime || "18:00" }; });
  return { timezone: timezoneToUi(settings.timezone), locale: localeToUi(settings.locale), dateFormat: settings.dateFormat, timeFormat: settings.timeFormat === "H12" ? "12-hour" : "24-hour", workingDays: (settings.workingDays || []).map((day) => WEEKDAY_TO_UI[day]).filter(Boolean), hours, slotDuration: settings.defaultAppointmentSlotMinutes, consultDuration: settings.defaultConsultationDurationMinutes, advanceBookingDays: settings.maximumAdvanceBookingDays, cancellationHours: Math.round((settings.cancellationCutoffMinutes || 0) / 60), reschedulingHours: Math.round((settings.reschedulingCutoffMinutes || 0) / 60), walkIn: settings.walkInAppointmentsEnabled, emergency: settings.emergencyServicesEnabled, patientPattern: settings.patientIdPattern, appointmentPattern: settings.appointmentNumberPattern, queuePattern: DEFAULT_OPERATIONAL.queuePattern, fiscalMonth: FISCAL_MONTHS[(settings.fiscalYearStartMonth || 4) - 1] || "April" };
}
function operationalToBackend(data, current) {
  const operatingHours = {}; DAY_KEYS.forEach((day) => { const backendDay = UI_TO_WEEKDAY[day]; const value = data.hours[day]; operatingHours[backendDay] = value.closed ? { closed: true } : { closed: false, openTime: value.open, closeTime: value.close }; });
  return { admissionNumberPattern: current?.admissionNumberPattern || "ADM-{YYYY}-{SEQ}", appointmentNumberPattern: data.appointmentPattern, cancellationCutoffMinutes: Number(data.cancellationHours || 0) * 60, dateFormat: data.dateFormat, defaultAppointmentSlotMinutes: Number(data.slotDuration || 15), defaultConsultationDurationMinutes: Number(data.consultDuration || 15), emergencyServicesEnabled: !!data.emergency, fiscalYearStartMonth: MONTH_TO_NUMBER[data.fiscalMonth] || 4, invoiceNumberPattern: current?.invoiceNumberPattern || "INV-{YYYY}-{SEQ}", locale: localeFromUi(data.locale), maximumAdvanceBookingDays: Number(data.advanceBookingDays || 1), minimumBookingNoticeMinutes: current?.minimumBookingNoticeMinutes ?? 0, operatingHours, patientIdPattern: data.patientPattern, prescriptionNumberPattern: current?.prescriptionNumberPattern || "RX-{YYYY}-{SEQ}", queueEnabled: current?.queueEnabled ?? true, reschedulingCutoffMinutes: Number(data.reschedulingHours || 0) * 60, timeFormat: data.timeFormat === "12-hour" ? "H12" : "H24", timezone: timezoneFromUi(data.timezone), tokenGenerationEnabled: current?.tokenGenerationEnabled ?? true, walkInAppointmentsEnabled: !!data.walkIn, weekStartsOn: current?.weekStartsOn || "MONDAY", workingDays: data.workingDays.map((day) => UI_TO_WEEKDAY[day]).filter(Boolean) };
}
function notificationsFromBackend(settings) { return { channels: Object.fromEntries(CHANNEL_DEFS.map((channel) => [channel.key, (settings.enabledChannels || []).includes(channel.key.toUpperCase())])), quietHours: { enabled: !!settings.quietHoursEnabled, start: settings.quietHoursStart || "22:00", end: settings.quietHoursEnd || "07:00", timezone: timezoneToUi(settings.quietHoursTimezone) }, reminders: [...(settings.defaultReminderMinutes || [])].sort((a, b) => a - b), escalation: { enabled: !!settings.escalationEnabled, delayMinutes: DEFAULT_NOTIFICATIONS.escalation.delayMinutes, priority: DEFAULT_NOTIFICATIONS.escalation.priority } }; }
function notificationsToBackend(data) { return { enabledChannels: Object.entries(data.channels).filter(([, enabled]) => enabled).map(([channel]) => channel.toUpperCase()), quietHoursEnabled: !!data.quietHours.enabled, quietHoursStart: data.quietHours.enabled ? data.quietHours.start : undefined, quietHoursEnd: data.quietHours.enabled ? data.quietHours.end : undefined, quietHoursTimezone: timezoneFromUi(data.quietHours.timezone), defaultReminderMinutes: [...data.reminders].sort((a, b) => a - b), escalationEnabled: !!data.escalation.enabled }; }
function ruleFromBackend(rule) { return { id: rule.id, event: rule.eventType, category: humanTitle(rule.eventCategory), recipients: humanTitle(rule.recipientType), channels: (rule.channels || []).map((channel) => channel.toLowerCase()), priority: humanTitle(rule.priority), enabled: !!rule.enabled, protected: rule.priority === "CRITICAL", updatedAt: formatUpdatedAt(rule.updatedAt), backendVersion: rule.version }; }
function securityFromBackend(settings) { return { minLength: settings.minimumPasswordLength, expiryDays: settings.passwordExpiryDays ?? 0, historyCount: settings.passwordHistoryCount, reqUpper: settings.requireUppercase, reqLower: settings.requireLowercase, reqNumber: settings.requireNumber, reqSpecial: settings.requireSpecialCharacter, mfa: humanTitle(settings.mfaPolicy), failedAttempts: settings.failedLoginAttemptLimit, lockoutMinutes: settings.accountLockoutMinutes, loginAlerts: settings.loginAlertsEnabled, sensitiveReauth: settings.sensitiveActionReauthenticationEnabled, sessionTimeout: settings.sessionTimeoutMinutes, maxSessions: settings.maximumActiveSessions, trustedDeviceDays: settings.trustedDeviceDurationDays, ipAllowlistEnabled: settings.ipAllowlistEnabled, ipEntries: (settings.allowedIpRanges || []).map((value, index) => ({ id: `ip-${index}`, value, type: value.includes(":") ? "IPv6" : value.includes("/") ? "CIDR" : "IPv4" })) }; }
function historyFromBackend(entry) { return { id: entry.id, fields: (entry.changedFields || []).map(humanTitle).join(", ") || "Settings", actor: entry.actor?.id || "System", at: formatUpdatedAt(entry.createdAt), version: `v${entry.beforeVersion ?? "?"} -> v${entry.afterVersion ?? "?"}`, reason: entry.reason || "No reason recorded", requestId: entry.requestId || "-" }; }
function humanTitle(value) { return String(value || "").replace(/[._-]/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()); }

/* ============================================================================
   ROOT PAGE
============================================================================ */
const TABS = [
  { key: "operational", label: "Operational", icon: SlidersHorizontal },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Shield },
];

export type SettingsSection = "operational" | "notifications" | "security" | "profile" | "alerts" | "audit" | "storage" | "export";

export function ErpDemoSettings({ organizationId, section = "operational" }: { organizationId?: string; section?: SettingsSection }) {
  const queryClient = useQueryClient();
  const [pageState, setPageState] = useState("loading"); // loading | ready | error | empty
  const [activeTab, setActiveTab] = useState(normalizeSettingsSection(section));
  const [canEdit] = useState(true); // permission-aware read-only mode
  const [search, setSearch] = useState("");

  const [operational, setOperational] = useState(DEFAULT_OPERATIONAL);
  const [operationalSaved, setOperationalSaved] = useState(DEFAULT_OPERATIONAL);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [notificationsSaved, setNotificationsSaved] = useState(DEFAULT_NOTIFICATIONS);
  const [rules, setRules] = useState(MOCK_RULES);
  const [securitySettings, setSecuritySettings] = useState(DEFAULT_SECURITY);
  const [securityHistory, setSecurityHistory] = useState(HISTORY_ROWS);

  const [meta, setMeta] = useState({
    operational: { version: "v7", updatedAt: "2026-07-22 11:30", updatedBy: "Abhishek Negi" },
    notifications: { version: "v4", updatedAt: "2026-07-19 09:15", updatedBy: "Priya Sharma" },
    security: { version: "v13", updatedAt: "2026-07-20 18:22", updatedBy: "Abhishek Negi" },
  });

  const [historyFilters, setHistoryFilters] = useState({ actor: "All" });
  const [toasts, setToasts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [forceConflict, setForceConflict] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);
  const [navWarningOpen, setNavWarningOpen] = useState(false);
  const operationalQuery = useQuery({ queryFn: () => virujBackend.hospitalSettings.getOperational({ organizationId }), queryKey: virujBackend.hospitalSettings.key("operational", organizationId), retry: false, staleTime: 30_000 });
  const notificationsQuery = useQuery({ queryFn: () => virujBackend.hospitalSettings.getNotifications({ organizationId }), queryKey: virujBackend.hospitalSettings.key("notifications", organizationId), retry: false, staleTime: 30_000 });
  const notificationRulesQuery = useQuery({ queryFn: () => virujBackend.hospitalSettings.getNotificationRules({ organizationId }), queryKey: virujBackend.hospitalSettings.notificationRulesKey(organizationId), retry: false, staleTime: 30_000 });
  const securityQuery = useQuery({ queryFn: () => virujBackend.hospitalSettings.getSecurity({ organizationId }), queryKey: virujBackend.hospitalSettings.key("security", organizationId), retry: false, staleTime: 30_000 });
  const securityHistoryQuery = useQuery({ queryFn: () => virujBackend.hospitalSettings.getSecurityHistory({ organizationId }), queryKey: virujBackend.hospitalSettings.securityHistoryKey(organizationId), retry: false, staleTime: 30_000 });

  const activeSettingsQuery = activeTab === "operational" ? operationalQuery : activeTab === "notifications" ? notificationsQuery : securityQuery;
  const retryActiveSettings = () => {
    setPageState("loading");
    void activeSettingsQuery.refetch();
  };

  const saveOperationalMutation = useMutation({
    mutationFn: () => virujBackend.hospitalSettings.updateOperational({ organizationId, settings: operationalToBackend(operational, operationalQuery.data?.data.settings), version: operationalQuery.data?.data.version ?? 0 }),
    onSuccess: (response) => {
      const next = operationalFromBackend(response.data.settings);
      setOperational(next);
      setOperationalSaved(next);
      setMeta((m) => ({ ...m, operational: metaFromEnvelope(response, m.operational) }));
      queryClient.setQueryData(virujBackend.hospitalSettings.key("operational", organizationId), response);
    },
  });

  const saveNotificationsMutation = useMutation({
    mutationFn: () => virujBackend.hospitalSettings.updateNotifications({ organizationId, settings: notificationsToBackend(notifications), version: notificationsQuery.data?.data.version ?? 0 }),
    onSuccess: (response) => {
      const next = notificationsFromBackend(response.data.settings);
      setNotifications(next);
      setNotificationsSaved(next);
      setMeta((m) => ({ ...m, notifications: metaFromEnvelope(response, m.notifications) }));
      queryClient.setQueryData(virujBackend.hospitalSettings.key("notifications", organizationId), response);
    },
  });

  useEffect(() => setActiveTab(normalizeSettingsSection(section)), [section]);
  useEffect(() => {
    if (!operationalQuery.data) return;
    const next = operationalFromBackend(operationalQuery.data.data.settings);
    setOperational(next);
    setOperationalSaved(next);
    setMeta((m) => ({ ...m, operational: metaFromEnvelope(operationalQuery.data, m.operational) }));
  }, [operationalQuery.data]);
  useEffect(() => {
    if (!notificationsQuery.data) return;
    const next = notificationsFromBackend(notificationsQuery.data.data.settings);
    setNotifications(next);
    setNotificationsSaved(next);
    setMeta((m) => ({ ...m, notifications: metaFromEnvelope(notificationsQuery.data, m.notifications) }));
  }, [notificationsQuery.data]);
  useEffect(() => { if (notificationRulesQuery.data?.data.rules) setRules(notificationRulesQuery.data.data.rules.map(ruleFromBackend)); }, [notificationRulesQuery.data]);
  useEffect(() => {
    if (!securityQuery.data) return;
    setSecuritySettings(securityFromBackend(securityQuery.data.data.settings));
    setMeta((m) => ({ ...m, security: metaFromEnvelope(securityQuery.data, m.security) }));
  }, [securityQuery.data]);
  useEffect(() => { if (securityHistoryQuery.data?.data.entries) setSecurityHistory(securityHistoryQuery.data.data.entries.map(historyFromBackend)); }, [securityHistoryQuery.data]);
  useEffect(() => {
    if (activeSettingsQuery.isError) { setPageState("error"); return; }
    if (activeSettingsQuery.data && pageState === "loading") setPageState("ready");
  }, [activeSettingsQuery.data, activeSettingsQuery.isError, pageState]);

  const pushToast = useCallback((message, tone = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const dirty = useMemo(
    () => JSON.stringify(operational) !== JSON.stringify(operationalSaved) || JSON.stringify(notifications) !== JSON.stringify(notificationsSaved),
    [operational, operationalSaved, notifications, notificationsSaved]
  );

  const requestTabChange = (key) => {
    if (dirty) { setPendingTab(key); setNavWarningOpen(true); }
    else setActiveTab(key);
  };
  const confirmDiscardAndSwitch = () => {
    setOperational(operationalSaved);
    setNotifications(notificationsSaved);
    setNavWarningOpen(false);
    if (pendingTab) setActiveTab(pendingTab);
    setPendingTab(null);
  };

  const handleReset = () => { setOperational(operationalSaved); setNotifications(notificationsSaved); pushToast("Changes reset"); };

  const doSave = async (overwrite = false) => {
    setSaving(true);
    try {
      if (forceConflict && !overwrite) { setConflictOpen(true); return; }
      if (activeTab === "operational") await saveOperationalMutation.mutateAsync();
      if (activeTab === "notifications") await saveNotificationsMutation.mutateAsync();
      setForceConflict(false);
      pushToast("Settings saved");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Settings save failed";
      if (message.includes("VERSION_CONFLICT")) setConflictOpen(true);
      else pushToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const currentMeta = meta[activeTab];
  const readOnly = !canEdit || activeTab === "security";

  return (
    <div className="hospital-settings-page min-h-screen bg-slate-50 pb-28 font-sans text-slate-800 dark:bg-[#0f141b] dark:text-slate-200">
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform: translateY(4px);} to {opacity:1; transform:none;} }
        input[type="time"]::-webkit-calendar-picker-indicator { opacity: 0.5; }
        .dark .hospital-settings-page { color-scheme: dark; }
        .dark .hospital-settings-page .bg-white { background-color: #171d26; }
        .dark .hospital-settings-page .bg-slate-50,
        .dark .hospital-settings-page .bg-slate-50\/50,
        .dark .hospital-settings-page .bg-slate-50\/60 { background-color: rgba(30, 41, 59, 0.46); }
        .dark .hospital-settings-page .bg-slate-100 { background-color: rgba(51, 65, 85, 0.78); }
        .dark .hospital-settings-page .bg-slate-200\/70 { background-color: rgba(71, 85, 105, 0.48); }
        .dark .hospital-settings-page .bg-blue-50,
        .dark .hospital-settings-page .bg-blue-50\/60 { background-color: rgba(37, 99, 235, 0.16); }
        .dark .hospital-settings-page .bg-emerald-50 { background-color: rgba(16, 185, 129, 0.14); }
        .dark .hospital-settings-page .bg-amber-50 { background-color: rgba(245, 158, 11, 0.14); }
        .dark .hospital-settings-page .bg-rose-50,
        .dark .hospital-settings-page .bg-rose-50\/50 { background-color: rgba(244, 63, 94, 0.14); }
        .dark .hospital-settings-page .border-slate-50 { border-color: rgba(148, 163, 184, 0.12); }
        .dark .hospital-settings-page .border-slate-100 { border-color: rgba(148, 163, 184, 0.14); }
        .dark .hospital-settings-page .border-slate-200,
        .dark .hospital-settings-page .border-slate-300 { border-color: rgba(148, 163, 184, 0.22); }
        .dark .hospital-settings-page .border-blue-200,
        .dark .hospital-settings-page .border-blue-300 { border-color: rgba(96, 165, 250, 0.35); }
        .dark .hospital-settings-page .border-emerald-200 { border-color: rgba(52, 211, 153, 0.32); }
        .dark .hospital-settings-page .border-amber-200 { border-color: rgba(251, 191, 36, 0.32); }
        .dark .hospital-settings-page .border-rose-100,
        .dark .hospital-settings-page .border-rose-200 { border-color: rgba(251, 113, 133, 0.32); }
        .dark .hospital-settings-page .text-slate-900,
        .dark .hospital-settings-page .text-slate-800,
        .dark .hospital-settings-page .text-slate-700 { color: #e5edf7; }
        .dark .hospital-settings-page .text-slate-600,
        .dark .hospital-settings-page .text-slate-500 { color: #a8b3c3; }
        .dark .hospital-settings-page .text-slate-400 { color: #7f8da1; }
        .dark .hospital-settings-page .text-blue-700,
        .dark .hospital-settings-page .text-blue-600 { color: #93c5fd; }
        .dark .hospital-settings-page .text-emerald-700 { color: #6ee7b7; }
        .dark .hospital-settings-page .text-amber-700,
        .dark .hospital-settings-page .text-amber-800 { color: #fcd34d; }
        .dark .hospital-settings-page .text-rose-600,
        .dark .hospital-settings-page .text-rose-700,
        .dark .hospital-settings-page .text-rose-800 { color: #fda4af; }
        .dark .hospital-settings-page input,
        .dark .hospital-settings-page select,
        .dark .hospital-settings-page textarea { background-color: rgba(15, 23, 42, 0.58); border-color: rgba(148, 163, 184, 0.24); color: #e5edf7; }
        .dark .hospital-settings-page input::placeholder,
        .dark .hospital-settings-page textarea::placeholder { color: #64748b; }
        .dark .hospital-settings-page input:disabled,
        .dark .hospital-settings-page select:disabled,
        .dark .hospital-settings-page textarea:disabled { background-color: rgba(15, 23, 42, 0.34); color: #7f8da1; }
        .dark .hospital-settings-page .shadow-sm,
        .dark .hospital-settings-page .shadow-lg,
        .dark .hospital-settings-page .shadow-xl,
        .dark .hospital-settings-page .shadow-2xl { box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28); }
        .dark .hospital-settings-page .ring-slate-200 { --tw-ring-color: rgba(148, 163, 184, 0.24); }
        .dark .hospital-settings-page .hover\:bg-slate-50:hover,
        .dark .hospital-settings-page .hover\:bg-slate-100:hover { background-color: rgba(51, 65, 85, 0.64); }
        .dark .hospital-settings-page .hover\:text-slate-700:hover,
        .dark .hospital-settings-page .hover\:text-slate-600:hover { color: #e5edf7; }
        .dark .hospital-settings-page table thead tr { background-color: rgba(30, 41, 59, 0.72); }
        .dark .hospital-settings-page table tbody tr:hover { background-color: rgba(30, 41, 59, 0.36); }
        .dark .hospital-settings-page .bg-white\/95 { background-color: rgba(23, 29, 38, 0.95); }
        .dark .hospital-settings-page .bg-slate-900\/40 { background-color: rgba(2, 6, 23, 0.72); }
      `}</style>

      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">Hospital workspace</p>
              <h1 className="text-[22px] font-semibold text-slate-900">Settings</h1>
              <p className="mt-1 text-[13px] text-slate-500">Operational rules, notification behavior, and security policy for Yashoda Hospital.</p>
            </div>          </div>

          {pageState === "ready" && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => requestTabChange(t.key)}
                    className={cx("flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition", activeTab === t.key ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                  >
                    <t.icon className="h-3.5 w-3.5" /> {t.label}
                  </button>
                ))}
              </div>
              <MetaRow {...currentMeta} readOnly={readOnly} />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
        {pageState === "loading" && (
          <div className="flex flex-col gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <Skeleton className="mb-4 h-4 w-40" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Skeleton className="h-9" /><Skeleton className="h-9" /><Skeleton className="h-9" />
                </div>
                <Skeleton className="mt-4 h-24 w-full" />
              </div>
            ))}
          </div>
        )}

        {pageState === "error" && <ErrorState onRetry={retryActiveSettings} />}

        {pageState === "empty" && (
          <EmptyState
            icon={SlidersHorizontal}
            title="No settings configured yet"
            description="This hospital hasn't set up operational, notification, or security settings. Start with operational basics — timezone, hours, and booking rules."
            action={<Button variant="primary" icon={Plus} onClick={() => setPageState("ready")}>Set up settings</Button>}
          />
        )}

        {pageState === "ready" && (
          <>
            {activeTab === "operational" && (
              <>
                <div className="relative mb-5 max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <TextInput className="pl-9" placeholder="Search operational settings…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <OperationalTab data={operational} setData={setOperational} readOnly={!canEdit} search={search} />
              </>
            )}
            {activeTab === "notifications" && (
              <NotificationsTab data={notifications} setData={setNotifications} readOnly={!canEdit} rules={rules} setRules={setRules} pushToast={pushToast} />
            )}
            {activeTab === "security" && (
              <SecurityTab security={securitySettings} historyFilters={historyFilters} setHistoryFilters={setHistoryFilters} historyRows={securityHistory} />
            )}
          </>
        )}
      </div>

      {/* Sticky dirty-state save bar */}
      {pageState === "ready" && dirty && activeTab !== "security" && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
            <div className="flex items-center gap-2 text-[13px] text-slate-600">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              You have unsaved changes on this tab.
              <label className="ml-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                <input type="checkbox" checked={forceConflict} onChange={(e) => setForceConflict(e.target.checked)} className="h-3 w-3" />
                simulate version conflict on save
              </label>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={RotateCcw} onClick={handleReset}>Reset changes</Button>
              <Button variant="primary" icon={saving ? Loader2 : Save} className={saving && "opacity-80"} onClick={() => doSave(false)}>
                {saving ? <span className="flex items-center gap-1.5"><Loader2 className="h-4 w-4 animate-spin" /> Saving…</span> : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Toasts toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
      <ConflictDialog
        open={conflictOpen}
        onCancel={() => setConflictOpen(false)}
        onKeepMine={() => { setConflictOpen(false); doSave(true); }}
        onReload={() => { setConflictOpen(false); handleReset(); setForceConflict(false); pushToast("Reloaded latest version"); }}
      />
      <ConfirmDialog
        open={navWarningOpen}
        title="Leave this tab without saving?"
        description="You have unsaved changes. Switching tabs now will discard them."
        confirmLabel="Discard &amp; switch"
        tone="rose"
        onCancel={() => { setNavWarningOpen(false); setPendingTab(null); }}
        onConfirm={confirmDiscardAndSwitch}
      />
    </div>
  );
}