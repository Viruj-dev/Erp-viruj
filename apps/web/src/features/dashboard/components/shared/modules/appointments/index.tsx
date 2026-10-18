"use client";

import { Button } from "@/components/ui/button";
import {
  Search,
  MoreHorizontal,
  RefreshCw,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/erp/dropdown-menu";
import { Input } from "@/components/ui/erp/input";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { virujBackend } from "@/lib/viruj-backend";
import { useQuery } from "@tanstack/react-query";
import { useState, type CSSProperties } from "react";
import { AppointmentDetailDialog } from "./components/appointment-detail";
import { AppointmentSettings } from "./options/settings";
import type { AppointmentTab } from "./types";
import { formatDate, getStatusLabel, matchesAppointmentSearch } from "./utils";

const appointmentBadgeColors: Record<string, string> = {
  pending_approval:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300",
  approved:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
  completed:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  rescheduled:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
};

export function ErpDemoAppointments({
  section = "dashboard",
  tenant,
  initialAppointmentId,
}: {
  section?: AppointmentTab;
  tenant?: ErpTenantContext;
  initialAppointmentId?: string;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(
    section === "review" ? "pending_approval" : "all"
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    initialAppointmentId ?? null
  );
  const organizationId = tenant?.organizationId;
  const appointments = useQuery({
    enabled: Boolean(organizationId),
    queryKey: virujBackend.appointments.key({ organizationId }),
    queryFn: () => virujBackend.appointments.list({ organizationId }),
    refetchInterval: 15_000,
    retry: false,
  });
  if (!tenant?.capabilities.appointments.enabled)
    return (
      <p className="p-5">Appointments are not enabled for this workspace.</p>
    );
  if (section === "settings")
    return (
      <div className="p-5">
        <AppointmentSettings />
      </div>
    );
  const rows = (appointments.data ?? []).filter(
    (appointment) =>
      matchesAppointmentSearch(appointment, query) &&
      (status === "all" || appointment.status === status)
  );
  const pending =
    appointments.data?.filter(
      (appointment) => appointment.status === "pending_approval"
    ).length ?? 0;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const visibleRows = rows.slice(start, start + pageSize);
  return (
    <div
      style={
        {
          "--appointment-accent":
            tenant.providerType === "clinic"
              ? "#7c3aed"
              : tenant.providerType === "hospital"
                ? "#2563eb"
                : "#15803d",
        } as CSSProperties
      }
      className="erp-appointment-list mx-auto w-[calc(100%-8px)] max-w-[1440px] space-y-5 py-3 sm:w-[calc(100%-16px)] lg:w-[calc(100%-24px)]"
    >
      <div>
        <h2 className="text-2xl font-bold">
          {section === "review" ? "Appointment requests" : "All appointments"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {pending} pending approval. Requested times are confirmed only after
          provider review.
        </p>
      </div>
      <section
        className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white dark:border-white/10 dark:bg-[#17191e]"
        aria-label="Appointment list"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <h3 className="text-sm font-semibold">
            <span className="mr-1.5 tabular-nums">
              {appointments.isPending || appointments.isError
                ? "—"
                : rows.length}
            </span>
            <span className="font-normal text-slate-500">
              {status === "all" ? "All appointments" : getStatusLabel(status)}
            </span>
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <Input
                aria-label="Search appointments"
                className="h-9 w-full rounded-lg pl-9 text-xs sm:w-56"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search patient, doctor or phone"
                value={query}
              />
            </label>
            <select
              aria-label="Appointment status"
              className="h-9 rounded-lg border border-slate-200 bg-transparent px-3 text-xs dark:border-white/10"
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              value={status}
            >
              <option value="all">All statuses</option>
              {[
                "pending_approval",
                "approved",
                "rescheduled",
                "completed",
                "rejected",
                "cancelled",
                "no_show",
              ].map((value) => (
                <option key={value} value={value}>
                  {getStatusLabel(value)}
                </option>
              ))}
            </select>
            <Button
              aria-label="Refresh appointments"
              title="Refresh appointments"
              disabled={appointments.isFetching}
              onClick={() => void appointments.refetch()}
              variant="outline"
              className="size-9 rounded-lg p-0"
            >
              <RefreshCw
                size={15}
                className={
                  appointments.isFetching
                    ? "animate-spin motion-reduce:animate-none"
                    : ""
                }
              />
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-xs">
            <caption className="sr-only">
              Appointments with patient, visit, contact, status and review
              actions
            </caption>
            <thead className="border-b border-slate-200/70 bg-slate-50/70 text-[11px] text-slate-500 dark:border-white/10 dark:bg-white/[0.025]">
              <tr>
                {[
                  "Patient ID",
                  "Patient name",
                  "Type / doctor",
                  "Requested time",
                  "Mobile number",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-5 py-3.5 font-medium"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {appointments.isPending ||
              appointments.isError ||
              !rows.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <CalendarDays
                      size={28}
                      strokeWidth={1.4}
                      className="mx-auto mb-4 text-slate-400"
                      aria-hidden="true"
                    />
                    {appointments.isPending ? (
                      <p role="status">Loading appointments…</p>
                    ) : appointments.isError ? (
                      <p role="alert" className="text-error">
                        {appointments.error.message} Use Refresh to retry.
                      </p>
                    ) : (
                      <>
                        <p className="font-medium">
                          No appointments match these filters
                        </p>
                        <p className="mt-2 text-slate-500">
                          Try another name or status.
                        </p>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                visibleRows.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-3.5 font-medium">
                      <span
                        className="block max-w-28 truncate"
                        title={appointment.patientUserId ?? undefined}
                      >
                        {appointment.patientUserId || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => setSelectedId(appointment.id)}
                        className="flex items-center gap-3 text-left hover:text-[var(--appointment-accent)] focus-visible:outline-2 focus-visible:outline-offset-4"
                        aria-label={`View appointment for ${appointment.patientName}`}
                      >
                        <span
                          aria-hidden="true"
                          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--appointment-accent)]/10 text-[11px] font-semibold text-[var(--appointment-accent)]"
                        >
                          {appointment.patientName
                            .trim()
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                        <span className="max-w-48 truncate font-medium">
                          {appointment.patientName}
                        </span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="capitalize">
                        {appointment.appointmentMode.replace(/_/g, " ")}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {appointment.doctorName}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <p>{appointment.appointmentTime}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {formatDate(
                          appointment.appointmentDate,
                          appointment.timezone
                        )}{" "}
                        · {appointment.timezone || "Asia/Kolkata"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      {appointment.patientPhone ? (
                        <a
                          className="hover:underline"
                          href={`tel:${appointment.patientPhone}`}
                        >
                          {appointment.patientPhone}
                        </a>
                      ) : (
                        <span className="text-slate-400">Not provided</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex whitespace-nowrap rounded border px-2 py-1 text-[10px] font-medium ${appointmentBadgeColors[appointment.status] ?? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"}`}
                      >
                        {getStatusLabel(appointment.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label={`Actions for ${appointment.patientName}`}
                            className="flex size-8 items-center justify-center rounded-lg hover:bg-slate-100 focus-visible:outline-2 dark:hover:bg-white/10"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => setSelectedId(appointment.id)}
                          >
                            {appointment.status === "approved"
                              ? "Details / Verify arrival"
                              : "Review details"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 px-5 py-4 text-xs dark:border-white/10">
          <p className="text-slate-500" aria-live="polite">
            {appointments.isPending
              ? "Loading appointments…"
              : appointments.isError
                ? "Appointments unavailable"
                : `Showing ${rows.length ? start + 1 : 0}–${Math.min(start + pageSize, rows.length)} of ${rows.length} results`}
          </p>
          <div className="flex items-center gap-2">
            <select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="h-8 rounded-lg border border-slate-200 bg-transparent px-2 dark:border-white/10"
            >
              {[10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label="Previous page"
              disabled={
                currentPage <= 1 ||
                appointments.isError ||
                appointments.isPending
              }
              onClick={() => setPage(currentPage - 1)}
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-30 dark:border-white/10"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-2 tabular-nums">
              {currentPage} / {pageCount}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={
                currentPage >= pageCount ||
                appointments.isError ||
                appointments.isPending
              }
              onClick={() => setPage(currentPage + 1)}
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-30 dark:border-white/10"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </footer>
      </section>
      {selectedId ? (
        <AppointmentDetailDialog
          appointmentId={selectedId}
          key={`${tenant.organizationId}:${selectedId}`}
          onClose={() => setSelectedId(null)}
          organizationId={tenant.organizationId}
        />
      ) : null}
    </div>
  );
}
