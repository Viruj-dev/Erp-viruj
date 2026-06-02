import { ClipboardCheck, FileText, Gauge, Settings } from "lucide-react";

export const appointmentTabs = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "review", label: "Review", icon: ClipboardCheck },
  { id: "patients", label: "Patient Details", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export const statusLabels: Record<string, string> = {
  approved: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
  no_show: "No show",
  pending_approval: "Pending Review",
  rejected: "Rejected",
};
