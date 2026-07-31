import { Badge } from "@/features/dashboard/components/ui/badge";
import { Button } from "@/features/dashboard/components/ui/button";
import type { DirectoryPatient, PatientStatus } from "../types";

export function PatientIdentity({ patient }: { patient: DirectoryPatient }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-headline text-[15px] font-semibold text-slate-950 dark:text-slate-100">
        {patient.name}
      </p>
      <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-500">
        {patient.gender}, {patient.age} yrs
      </p>
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
  const isDisabled = disabled || !canReview;

  return (
    <div className="flex justify-end gap-2 whitespace-nowrap">
      <Button
        className="h-8 border-teal-200 px-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 dark:border-teal-400/20 dark:text-teal-200 dark:hover:bg-teal-400/[0.08]"
        disabled={isDisabled}
        onClick={onApprove}
        type="button"
        variant="outline"
      >
        Approve
      </Button>
      <Button
        className="h-8 border-rose-200 px-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-400/20 dark:text-rose-200 dark:hover:bg-rose-400/[0.08]"
        disabled={isDisabled}
        onClick={onReject}
        type="button"
        variant="outline"
      >
        Reject
      </Button>
      <Button
        className="h-8 border-blue-200 px-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-400/20 dark:text-blue-200 dark:hover:bg-blue-400/[0.08]"
        disabled={isDisabled}
        onClick={onReschedule}
        type="button"
        variant="outline"
      >
        Schedule
      </Button>
    </div>
  );
}
