import type { VirujAppointment, VirujAppointmentStatus } from "@/lib/viruj-backend";

import type { DirectoryPatient, PatientStatus } from "./types";

export function mapAppointmentToPatient(appointment: VirujAppointment): DirectoryPatient {
  const status = appointmentStatusLabel(appointment.status);
  const scheduleDate = new Date(appointment.appointmentDate);
  const bookingDate = appointment.createdAt ? new Date(appointment.createdAt) : null;

  return {
    age: appointment.patientAge ?? 0,
    appointmentId: appointment.id,
    appointmentStatus: appointment.status,
    bookingAt: formatBookingDate(bookingDate),
    bookingRelative: formatBookingLeadTime(bookingDate, scheduleDate),
    doctor: appointment.doctorName,
    doctorInitials: getInitials(appointment.doctorName),
    gender: appointment.patientGender === "Male" ? "M" : "F",
    id: appointment.patientUserId ?? appointment.id,
    initials: getInitials(appointment.patientName),
    mode: appointment.appointmentMode || "Clinic",
    name: appointment.patientName,
    schedule: `${formatAppointmentDate(scheduleDate)}, ${appointment.appointmentTime}`,
    status,
    tone:
      status === "Rejected" || status === "Cancelled"
        ? "rose"
        : status === "Rescheduled"
          ? "teal"
          : "blue",
  };
}

export function isFakeAppointment(appointment: VirujAppointment) {
  return [appointment.id, appointment.patientUserId]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().startsWith("fake-"));
}

export function appointmentStatusLabel(status: VirujAppointmentStatus): PatientStatus {
  switch (status) {
    case "approved":
      return "Approved";
    case "cancelled":
      return "Cancelled";
    case "completed":
      return "Completed";
    case "no_show":
      return "No Show";
    case "pending_approval":
      return "Pending Approval";
    case "rejected":
      return "Rejected";
    case "rescheduled":
      return "Rescheduled";
  }
}

export function defaultRequestDateTime() {
  const value = new Date(Date.now() + 24 * 60 * 60 * 1000);
  value.setMinutes(0, 0, 0);

  const offsetMs = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function getColumnLabel(columnId: string) {
  const labels: Record<string, string> = {
    actions: "Actions",
    bookingAt: "Booking Date",
    id: "ID",
    mode: "Mode",
    name: "Name",
    schedule: "Schedule",
    serial: "S.No",
    status: "Status",
  };

  return labels[columnId] ?? columnId;
}

export function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "VH";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatAppointmentDate(value: Date) {
  if (Number.isNaN(value.getTime())) {
    return "Requested";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatBookingDate(value: Date | null) {
  if (!value || Number.isNaN(value.getTime())) {
    return "Request received";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatBookingLeadTime(bookingDate: Date | null, scheduleDate: Date) {
  if (
    !bookingDate ||
    Number.isNaN(bookingDate.getTime()) ||
    Number.isNaN(scheduleDate.getTime())
  ) {
    return "Booking time unavailable";
  }

  const diffMinutes = Math.max(
    0,
    Math.round((scheduleDate.getTime() - bookingDate.getTime()) / 60_000)
  );

  if (diffMinutes < 60) {
    return `Booked ${diffMinutes} min before`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;

  if (diffHours < 24) {
    return remainingMinutes
      ? `Booked ${diffHours} hr ${remainingMinutes} min before`
      : `Booked ${diffHours} hr before`;
  }

  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  return remainingHours
    ? `Booked ${diffDays} day ${remainingHours} hr before`
    : `Booked ${diffDays} day before`;
}
