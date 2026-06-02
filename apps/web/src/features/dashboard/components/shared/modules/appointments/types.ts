import type { VirujAppointment } from "@/lib/viruj-backend";
import type { appointmentTabs } from "./constants";

export type AppointmentTab = (typeof appointmentTabs)[number]["id"];

export type AppointmentStatus =
  | "pending_approval"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled"
  | "no_show";

export type AppointmentRecord = VirujAppointment;
