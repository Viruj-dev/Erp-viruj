import { statusLabels } from "./constants";
import type { AppointmentRecord } from "./types";

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
    "inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]";

  if (status === "approved" || status === "completed") {
    return `${base} bg-secondary-container/45 text-secondary`;
  }

  if (status === "pending_approval") {
    return `${base} bg-primary/10 text-primary`;
  }

  return `${base} bg-error-container/55 text-error`;
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
