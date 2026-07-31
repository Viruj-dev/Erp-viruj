import type { VirujAppointmentStatus } from "@/lib/viruj-backend";

export type PatientStatus =
  | "Checked-in"
  | "Scheduled"
  | "Discharged"
  | "Critical"
  | "Follow-up"
  | "Pending Approval"
  | "Approved"
  | "Rejected"
  | "Rescheduled"
  | "Cancelled"
  | "Completed"
  | "No Show";

export type DirectoryPatient = {
  age: number;
  bookingAt: string;
  bookingRelative: string;
  doctor: string;
  doctorInitials: string;
  gender: "F" | "M";
  id: string;
  initials: string;
  mode: string;
  name: string;
  scheduleDate: string;
  scheduleTime: string;
  status: PatientStatus;
  tone: "blue" | "indigo" | "slate" | "rose" | "teal";
  appointmentId?: string;
  appointmentStatus?: VirujAppointmentStatus;
};

export type PatientRequestForm = {
  mobileUserId: string;
  patientAge: string;
  patientGender: string;
  patientName: string;
  patientPhone: string;
  reason: string;
  requestedAt: string;
};
