import type { DiagnosticOrder } from "./diagnostics";
import type { VirujAppointment } from "@/lib/viruj-backend";
import { diagnosticLabel } from "./diagnostics";
export type DiagnosticBranch = {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  phone: string;
  published: boolean;
  homeCollection: boolean;
};
export type DiagnosticSlot = {
  id: string;
  branchId: string;
  serviceId: string;
  resource: string;
  startsAt: string;
  endsAt: string;
  reserved: boolean;
  blocked: boolean;
  branch: { name: string };
};
export type DiagnosticBooking = {
  reportFile?: {
    filename: string;
    contentType: string;
    size: number;
    createdAt: string;
  } | null;
  arrivalVerifiedAt?: string | null;
  id: string;
  status: "requested" | "accepted" | "declined" | "cancelled";
  version: number;
  note: string;
  collectionMode: string;
  collectionAddress: string;
  createdAt: string;
  slot: DiagnosticSlot;
  order: DiagnosticOrder;
};

export function diagnosticBookingAppointment(
  booking: DiagnosticBooking
): VirujAppointment {
  return {
    id: booking.id,
    version: booking.version,
    statusLabel: diagnosticBookingStatusLabel(booking),
    arrivalVerifiedAt: booking.arrivalVerifiedAt ?? undefined,
    patientName: booking.order.patientName,
    patientPhone: booking.order.patientPhone,
    patientEmail: "",
    doctorName: booking.order.serviceSnapshot.name,
    departmentName: booking.slot.branch.name,
    appointmentMode:
      booking.collectionMode === "home" ? "home_collection" : "centre_visit",
    appointmentDate: booking.slot.startsAt,
    appointmentTime: new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(booking.slot.startsAt)),
    startsAt: booking.slot.startsAt,
    endsAt: booking.slot.endsAt,
    timezone: "Asia/Kolkata",
    createdAt: booking.createdAt,
    reason: booking.note,
    status: {
      requested: "pending_approval",
      accepted: "approved",
      declined: "rejected",
      cancelled: "cancelled",
    }[booking.status] as VirujAppointment["status"],
  };
}

export function diagnosticBookingStatusLabel(booking: DiagnosticBooking) {
  if (booking.status !== "accepted") return diagnosticLabel(booking.status);
  if (booking.arrivalVerifiedAt) return "Confirmed";
  return booking.collectionMode === "home"
    ? "Accepted"
    : "Awaiting verification";
}

export function canVerifyDiagnosticArrival(booking: DiagnosticBooking) {
  return (
    booking.status === "accepted" &&
    booking.collectionMode === "centre" &&
    !booking.arrivalVerifiedAt &&
    ["ordered", "scheduled"].includes(booking.order.status)
  );
}
