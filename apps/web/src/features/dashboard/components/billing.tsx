"use client";

import { virujBackend } from "@/lib/viruj-backend";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  CloudUpload,
  CreditCard,
  FileText,
  Mail,
  PlusCircle,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

type InvoiceStatus = "paid" | "insurance_claim" | "pending" | "overdue";

type InvoiceRecord = {
  amount: string;
  date: string;
  id: string;
  patient: {
    initials: string;
    name: string;
    tone: "primary" | "secondary" | "neutral" | "error";
  };
  serviceType: string;
  status: InvoiceStatus;
};

const invoices: InvoiceRecord[] = [
  {
    amount: "$450.00",
    date: "2023-10-24",
    id: "#INV-8821",
    patient: { initials: "EH", name: "Eleanor Henderson", tone: "primary" },
    serviceType: "Consultation",
    status: "paid",
  },
  {
    amount: "$1,280.00",
    date: "2023-10-23",
    id: "#INV-8819",
    patient: { initials: "JM", name: "Julian Martinez", tone: "secondary" },
    serviceType: "Lab Work",
    status: "insurance_claim",
  },
  {
    amount: "$89.50",
    date: "2023-10-21",
    id: "#INV-8815",
    patient: { initials: "AW", name: "Arthur Wright", tone: "neutral" },
    serviceType: "Pharmacy",
    status: "pending",
  },
  {
    amount: "$3,400.00",
    date: "2023-10-18",
    id: "#INV-8810",
    patient: { initials: "SC", name: "Sarah Crawford", tone: "error" },
    serviceType: "Cardiology",
    status: "overdue",
  },
];

const chartBars = [42, 58, 73, 51, 86, 55, 46, 92, 80, 71];

export function ErpDemoBilling() {
  const billingStatusQuery = useQuery({
    queryFn: () => virujBackend.modules.summary("billing"),
    queryKey: virujBackend.modules.key("billing"),
  });

  return (
    <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:p-8">
      <main className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-headline text-3xl font-semi-bold tracking-tight text-on-surface">
              Billing & Invoices
            </h1>
            <p className="mt-1 text-sm font-medium text-on-surface-variant">
              Financial performance and patient transaction management
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semi-bold text-white shadow-sm transition hover:bg-primary-container"
            type="button"
          >
            <PlusCircle size={17} />
            Create New Invoice
          </button>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<Banknote size={18} />}
            label="Total revenue (month)"
            note="+12.5%"
            value="$142,850"
          />
          <SummaryCard
            icon={<ReceiptText size={18} />}
            label="Pending collections"
            note="8 Invoices"
            tone="secondary"
            value="$28,420"
          />
          <SummaryCard
            icon={<ShieldCheck size={18} />}
            label="Insurance claims"
            note="Processing"
            tone="primarySoft"
            value="42"
          />
          <SummaryCard
            icon={<AlertTriangle size={18} />}
            label="Outstanding payments"
            note="Critically Overdue"
            tone="error"
            value="$12,115"
          />
        </section>

        <section className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3">
          <span className="inline-flex items-center gap-2 text-[10px] font-semi-bold uppercase tracking-[0.18em] text-on-surface-variant">
            <RefreshCw size={13} />
            Quick Filters:
          </span>
          <FilterPill label="Date Range: Last 30 Days" />
          <FilterPill label="Status: All Invoices" />
          <FilterPill label="Department: All" />
        </section>

        <section className="overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
          <div className="grid grid-cols-[0.85fr_1.3fr_0.75fr_0.9fr_0.8fr_0.75fr] gap-4 border-b border-outline-variant/15 bg-surface-container-low px-6 py-4 text-[10px] font-semi-bold uppercase tracking-[0.18em] text-on-surface-variant">
            <span>Invoice ID</span>
            <span>Patient Name</span>
            <span>Date</span>
            <span>Service Type</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-outline-variant/12">
            {invoices.map((invoice) => (
              <div
                className="grid grid-cols-[0.85fr_1.3fr_0.75fr_0.9fr_0.8fr_0.75fr] items-center gap-4 px-6 py-4 text-sm transition hover:bg-surface-container-low"
                key={invoice.id}
              >
                <span className="font-semi-bold text-primary">
                  {invoice.id}
                </span>
                <div className="flex min-w-0 items-center gap-3">
                  <PatientInitials
                    initials={invoice.patient.initials}
                    tone={invoice.patient.tone}
                  />
                  <span className="truncate font-semibold text-on-surface">
                    {invoice.patient.name}
                  </span>
                </div>
                <span className="text-xs font-semibold text-on-surface">
                  {formatDate(invoice.date)}
                </span>
                <span className="w-fit rounded-md bg-surface-container-low px-2 py-1 text-[10px] font-semi-bold uppercase tracking-[0.12em] text-on-surface-variant">
                  {invoice.serviceType}
                </span>
                <span className="font-semi-bold text-on-surface">
                  {invoice.amount}
                </span>
                <StatusBadge status={invoice.status} />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/15 px-6 py-5 text-xs font-semibold text-on-surface-variant">
            <span>Showing 1-10 of 124 results</span>
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg p-2 transition hover:bg-surface-container-low"
                type="button"
              >
                <ChevronLeft size={14} />
              </button>
              <button className="font-semi-bold text-primary" type="button">
                1
              </button>
              <button type="button">2</button>
              <button type="button">3</button>
              <button
                className="rounded-lg p-2 transition hover:bg-surface-container-low"
                type="button"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <aside className="space-y-6">
        <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-headline text-lg font-semi-bold text-on-surface">
                Revenue Overview
              </h2>
              <p className="mt-1 text-xs font-semi-bold text-secondary">
                30D TREND
              </p>
            </div>
            <CircleDollarSign className="text-primary" size={20} />
          </div>
          <div className="mt-8 flex h-24 items-end gap-2">
            {chartBars.map((height, index) => (
              <div
                className={`w-full rounded-t-sm ${
                  index === 7 ? "bg-primary" : "bg-primary/45"
                }`}
                key={`${height}-${index}`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <RevenueLine label="Highest Day" value="$12.4k" />
            <RevenueLine label="Average/Day" value="$4.7k" />
          </div>
          {billingStatusQuery.data ? (
            <p className="mt-4 text-[11px] font-bold text-secondary">
              Billing module ready for{" "}
              {billingStatusQuery.data.organizationType || "organization"}.
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
          <h2 className="font-headline text-lg font-semi-bold uppercase tracking-[0.08em] text-primary">
            Quick Actions
          </h2>
          <div className="mt-5 space-y-3">
            <QuickAction
              icon={<ReceiptText size={15} />}
              label="Generate Receipt"
            />
            <QuickAction
              icon={<CreditCard size={15} />}
              label="Process Refund"
            />
            <QuickAction
              icon={<CloudUpload size={15} />}
              label="Upload Insurance Docs"
            />
            <QuickAction icon={<Mail size={15} />} label="Email Statement" />
          </div>
        </section>

        <section className="rounded-xl border border-error/15 bg-error-container/30 p-5 shadow-sm">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-container text-error">
              <AlertTriangle size={17} />
            </span>
            <div>
              <h2 className="font-headline text-base font-semi-bold text-on-surface">
                Audit Required
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-on-surface-variant">
                3 insurance claims have been flagged for manual verification by
                the provider.
              </p>
              <button
                className="mt-3 inline-flex items-center gap-2 text-xs font-semi-bold text-primary"
                type="button"
              >
                View Audit Queue
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  note,
  tone = "primary",
  value,
}: {
  icon: React.ReactNode;
  label: string;
  note: string;
  tone?: "primary" | "secondary" | "primarySoft" | "error";
  value: string;
}) {
  const toneClass = {
    error: "border-error/25 bg-error-container/20 text-error",
    primary:
      "border-outline-variant/20 bg-surface-container-lowest text-primary",
    primarySoft:
      "border-outline-variant/20 bg-surface-container-lowest text-primary",
    secondary:
      "border-outline-variant/20 bg-surface-container-lowest text-secondary",
  }[tone];

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${toneClass}`}>
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </span>
        <p className="text-[10px] font-semi-bold uppercase tracking-[0.16em] text-on-surface-variant">
          {label}
        </p>
      </div>
      <div className="mt-6 flex flex-wrap items-end gap-2">
        <p className="font-headline text-3xl font-semi-bold text-on-surface">
          {value}
        </p>
        <span
          className={`pb-1 text-xs font-semi-bold ${
            tone === "error" ? "text-error" : "text-secondary"
          }`}
        >
          {note}
        </span>
      </div>
    </div>
  );
}

function FilterPill({ label }: { label: string }) {
  return (
    <button
      className="rounded-lg bg-surface-container-lowest px-4 py-2 text-xs font-semibold text-on-surface shadow-sm transition hover:bg-surface-container-high"
      type="button"
    >
      {label}
    </button>
  );
}

function PatientInitials({
  initials,
  tone,
}: {
  initials: string;
  tone: InvoiceRecord["patient"]["tone"];
}) {
  const className = {
    error: "bg-error-container text-error",
    neutral: "bg-surface-container-high text-on-surface-variant",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
  }[tone];

  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semi-bold ${className}`}
    >
      {initials}
    </span>
  );
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const statusMap = {
    insurance_claim: {
      className: "bg-primary/10 text-primary",
      label: "Insurance Claim",
    },
    overdue: {
      className: "bg-error-container text-error",
      label: "Overdue",
    },
    paid: {
      className: "bg-secondary-container/50 text-secondary",
      label: "Paid",
    },
    pending: {
      className: "bg-surface-container-high text-on-surface-variant",
      label: "Pending",
    },
  } satisfies Record<InvoiceStatus, { className: string; label: string }>;

  return (
    <span
      className={`w-fit rounded-md px-2 py-1 text-[10px] font-semi-bold uppercase tracking-[0.1em] ${statusMap[status].className}`}
    >
      {statusMap[status].label}
    </span>
  );
}

function RevenueLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-semi-bold text-on-surface">{value}</span>
    </div>
  );
}

function QuickAction({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      className="flex w-full items-center gap-3 rounded-lg border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-left text-xs font-semi-bold text-on-surface transition hover:border-primary/35 hover:text-primary"
      type="button"
    >
      <span className="text-primary">{icon}</span>
      {label}
    </button>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
