import { Badge } from "@/features/dashboard/components/ui/badge";
import { Button } from "@/features/dashboard/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/features/dashboard/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

import type { DirectoryPatient, PatientStatus } from "../types";

export function PatientIdentity({ patient }: { patient: DirectoryPatient }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar initials={patient.initials} tone={patient.tone} />
      <div className="min-w-0">
        <p className="truncate font-headline text-[15px] font-semibold text-slate-950 dark:text-slate-100">
          {patient.name}
        </p>
        <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-500">
          {patient.gender}, {patient.age} yrs
        </p>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: PatientStatus }) {
  const statusClass = {
    Approved:
      "bg-teal-100 text-teal-800 dark:bg-teal-400/14 dark:text-teal-200",
    "Checked-in":
      "bg-teal-100 text-teal-800 dark:bg-teal-400/14 dark:text-teal-200",
    Cancelled:
      "bg-rose-100 text-rose-800 dark:bg-rose-400/14 dark:text-rose-200",
    Completed:
      "bg-slate-200 text-slate-700 dark:bg-slate-500/18 dark:text-slate-300",
    Critical:
      "bg-rose-100 text-rose-800 dark:bg-rose-400/14 dark:text-rose-200",
    Discharged:
      "bg-slate-200 text-slate-700 dark:bg-slate-500/18 dark:text-slate-300",
    "Follow-up":
      "bg-cyan-100 text-cyan-800 dark:bg-cyan-400/14 dark:text-cyan-200",
    "No Show":
      "bg-amber-100 text-amber-800 dark:bg-amber-400/14 dark:text-amber-200",
    "Pending Approval":
      "bg-blue-100 text-blue-800 dark:bg-blue-400/14 dark:text-blue-200",
    Rejected:
      "bg-rose-100 text-rose-800 dark:bg-rose-400/14 dark:text-rose-200",
    Rescheduled:
      "bg-cyan-100 text-cyan-800 dark:bg-cyan-400/14 dark:text-cyan-200",
    Scheduled:
      "bg-blue-100 text-blue-800 dark:bg-blue-400/14 dark:text-blue-200",
  }[status];

  return (
    <Badge
      className={`rounded-full border-transparent px-3 py-1 text-[11px] font-medium ${statusClass}`}
      variant="outline"
    >
      {status}
    </Badge>
  );
}

export function AppointmentActions({
  disabled,
  onApprove,
  onReject,
  onReschedule,
  patient,
}: {
  disabled: boolean;
  onApprove: () => void;
  onReject: () => void;
  onReschedule: () => void;
  patient: DirectoryPatient;
}) {
  const canReview =
    Boolean(patient.appointmentId) &&
    (patient.appointmentStatus === "pending_approval" ||
      patient.appointmentStatus === "approved" ||
      patient.appointmentStatus === "rescheduled");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Open actions for ${patient.name}`}
          className="ml-auto text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.08] dark:hover:text-slate-100"
          size="icon"
          type="button"
          variant="ghost"
        >
          <MoreHorizontal size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem disabled={disabled || !canReview} onClick={onApprove}>
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem disabled={disabled || !canReview} onClick={onReject}>
          Reject
        </DropdownMenuItem>
        <DropdownMenuItem disabled={disabled || !canReview} onClick={onReschedule}>
          Reschedule
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Avatar({
  initials,
  tone,
}: {
  initials: string;
  tone: DirectoryPatient["tone"];
}) {
  const toneClass = {
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-400/18 dark:text-blue-200",
    indigo:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-400/18 dark:text-indigo-200",
    rose: "bg-rose-100 text-rose-800 dark:bg-rose-400/18 dark:text-rose-200",
    slate:
      "bg-slate-200 text-slate-700 dark:bg-slate-600/30 dark:text-slate-200",
    teal: "bg-teal-100 text-teal-800 dark:bg-teal-400/18 dark:text-teal-200",
  }[tone];

  return (
    <span
      className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${toneClass}`}
    >
      {initials}
    </span>
  );
}
