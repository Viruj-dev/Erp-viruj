"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CalendarDays,
  FlaskConical,
  RefreshCw,
  ScanLine,
} from "lucide-react";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { virujBackend } from "@/lib/viruj-backend";
import { cn } from "@/lib/utils";
import { getStatusLabel } from "./appointments/utils";

export function DiagnosticWorkspace({
  tenant,
  organizationName,
}: {
  tenant: ErpTenantContext;
  organizationName?: string;
}) {
  const pathology = tenant.providerType === "pathology";
  const Icon = pathology ? FlaskConical : ScanLine;
  const appointments = useQuery({
    queryKey: virujBackend.appointments.key({
      organizationId: tenant.organizationId,
    }),
    queryFn: () =>
      virujBackend.appointments.list({ organizationId: tenant.organizationId }),
    retry: false,
  });
  const rows = appointments.data ?? [];
  const ready = appointments.isSuccess;
  const stats = [
    {
      label: "Booking requests",
      value: rows.filter((row) => row.status === "pending_approval").length,
      detail: "Awaiting reception review",
    },
    {
      label: "Confirmed bookings",
      value: rows.filter((row) => row.status === "approved").length,
      detail: "Approved appointment records",
    },
    {
      label: "Rescheduled bookings",
      value: rows.filter((row) => row.status === "rescheduled").length,
      detail: "Review the updated times",
    },
  ];
  const accent = pathology
    ? "bg-orange-700 text-white hover:bg-orange-800"
    : "bg-zinc-700 text-white hover:bg-zinc-800";
  return (
    <div className="w-full space-y-6">
      <header
        className={cn(
          "relative overflow-hidden rounded-3xl border p-6 sm:p-9",
          pathology
            ? "border-orange-200 bg-orange-50 dark:border-orange-500/20 dark:bg-orange-950/20"
            : "border-zinc-300 bg-zinc-100 dark:border-zinc-500/20 dark:bg-zinc-900"
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-xl space-y-4">
            <p
              className={cn(
                "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]",
                pathology
                  ? "text-orange-800 dark:text-orange-300"
                  : "text-zinc-600 dark:text-zinc-300"
              )}
            >
              <Icon size={17} aria-hidden="true" />
              {pathology ? "Pathology" : "Radiology"} reception
            </p>
            <h1 className="font-headline text-3xl font-semibold tracking-tight sm:text-4xl">
              {organizationName ||
                (pathology ? "Your laboratory" : "Your imaging centre")}
            </h1>
            <p className="text-sm leading-7 text-muted-foreground">
              {pathology
                ? "A focused reception desk for laboratory bookings and patient requests."
                : "Keep imaging bookings and patient requests in one workspace."}
            </p>
            <Link
              className={cn(
                "inline-flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold transition-colors",
                accent
              )}
              href={tenant.buildRoute("appointments-review")}
            >
              Review booking requests{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div
            className={cn(
              "hidden size-24 items-center justify-center rounded-3xl border sm:flex",
              pathology
                ? "border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300"
                : "border-zinc-300 bg-zinc-200 text-zinc-600 dark:border-zinc-500/20 dark:bg-zinc-500/10 dark:text-zinc-300"
            )}
          >
            <Icon size={42} strokeWidth={1.2} aria-hidden="true" />
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3" aria-label="Booking summary">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="my-3 text-4xl font-semibold tabular-nums">
              {ready ? stat.value : "—"}
            </p>
            <p className="text-xs text-muted-foreground">{stat.detail}</p>
          </div>
        ))}
      </div>

      <section
        className="overflow-hidden rounded-2xl border bg-card"
        aria-labelledby="diagnostic-bookings-title"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <h2
            id="diagnostic-bookings-title"
            className="flex items-center gap-2 font-semibold"
          >
            <CalendarDays size={17} aria-hidden="true" />
            Bookings
          </h2>
          <Link
            href={tenant.buildRoute("appointments")}
            className="text-sm underline underline-offset-4"
          >
            View all bookings
          </Link>
        </div>
        {appointments.isPending ? (
          <p className="p-6 text-sm text-muted-foreground" role="status">
            Loading bookings…
          </p>
        ) : appointments.isError ? (
          <div className="space-y-3 p-6" role="alert">
            <p className="text-sm">
              Unable to load bookings. Check your connection and booking access.
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
              onClick={() => void appointments.refetch()}
            >
              <RefreshCw size={14} aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="space-y-2 p-8 text-center">
            <h3 className="font-semibold">No bookings yet</h3>
            <p className="text-sm text-muted-foreground">
              Bookings for this organisation will appear here when received.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Patient
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Requested date
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Time
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Booking status
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 6).map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-5 py-4 font-medium">{row.patientName}</td>
                    <td className="px-5 py-4">{row.appointmentDate}</td>
                    <td className="px-5 py-4">{row.appointmentTime}</td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-1 text-xs",
                          pathology
                            ? "bg-orange-100 text-orange-900 dark:bg-orange-500/10 dark:text-orange-200"
                            : "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100"
                        )}
                      >
                        {getStatusLabel(row.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
        {pathology
          ? "Sample tracking, structured test results and report authorisation"
          : "Machine scheduling, imaging studies and radiologist reporting"}{" "}
        will be added in the diagnostic workflow phase. Booking completion does
        not indicate a released diagnostic report.
      </div>
    </div>
  );
}
