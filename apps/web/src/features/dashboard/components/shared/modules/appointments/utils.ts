import { statusLabels } from "./constants";
import type { AppointmentRecord } from "./types";
import type { VirujAppointmentStatus } from "@/lib/viruj-backend";

export function availableAppointmentActions(
  appointment: AppointmentRecord,
  permissions: string[]
): VirujAppointmentStatus[] {
  const transitions: Partial<
    Record<VirujAppointmentStatus, VirujAppointmentStatus[]>
  > = {
    pending_approval: ["approved", "rejected", "rescheduled", "cancelled"],
    approved: ["rescheduled", "cancelled", "no_show"],
    rescheduled: ["approved", "cancelled", "no_show"],
  };
  return (transitions[appointment.status] ?? []).filter((status) =>
    permissions.includes(
      `appointment.${{ approved: "approve", rejected: "reject", rescheduled: "reschedule", cancelled: "cancel", no_show: "no_show", completed: "complete", pending_approval: "create" }[status]}`
    )
  );
}

export function appointmentLocalDateTime(iso: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function appointmentUtcDateTime(value: string, timezone: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))
    throw new Error("Select a valid appointment date and time.");
  const wallTime = Date.parse(`${value}:00Z`);
  let timestamp = wallTime;
  for (let attempt = 0; attempt < 3; attempt++) {
    const local = appointmentLocalDateTime(
      new Date(timestamp).toISOString(),
      timezone
    );
    if (local === value) return new Date(timestamp).toISOString();
    timestamp += wallTime - Date.parse(`${local}:00Z`);
  }
  throw new Error(
    "This time does not exist in the provider's timezone. Select another time."
  );
}

export function matchesAppointmentSearch(
  appointment: AppointmentRecord,
  query: string
) {
  const search = query.toLowerCase().trim();

  if (!search) {
    return true;
  }

  return [
    appointment.patientName,
    appointment.patientPhone,
    appointment.doctorName,
    appointment.departmentName,
    appointment.reason,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(search);
}

export function getStatusLabel(status: string) {
  return statusLabels[status] ?? status.replace(/_/g, " ");
}

export function statusClassName(status: string) {
  const base =
    "inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-semi-bold uppercase tracking-[0.14em]";

  if (status === "approved" || status === "completed") {
    return `${base} bg-secondary-container/45 text-secondary`;
  }

  if (status === "pending_approval") {
    return `${base} bg-primary/10 text-primary`;
  }

  return `${base} bg-error-container/55 text-error`;
}

export function formatDate(value: string | Date, timezone = "Asia/Kolkata") {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: timezone,
  }).format(new Date(value));
}
