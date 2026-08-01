import { Checkbox } from "@/features/dashboard/components/ui/checkbox";
import type { VirujAppointmentStatus } from "@/lib/viruj-backend";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { pageSize } from "../constants";
import type { DirectoryPatient } from "../types";
import {
  AppointmentActions,
  PatientIdentity,
  StatusBadge,
} from "./patient-table-cells";

export function usePatientColumns({
  currentPage,
  isUpdating,
  onUpdateAppointment,
  tone = "blue",
}: {
  currentPage: number;
  isUpdating: boolean;
  onUpdateAppointment: (
    patient: DirectoryPatient,
    status: VirujAppointmentStatus
  ) => void;
  tone?: "blue" | "violet";
}) {
  return useMemo<ColumnDef<DirectoryPatient>[]>(
    () => [
      {
        cell: ({ row }) => (
          <Checkbox
            aria-label="Select row"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
        enableHiding: false,
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            aria-label="Select all"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          />
        ),
        id: "select",
      },
      {
        cell: ({ row }) => (
          <span className="text-xs font-bold text-slate-500 dark:text-slate-500">
            {(currentPage - 1) * pageSize + row.index + 1}
          </span>
        ),
        header: "S.No",
        id: "serial",
        size: 64,
      },
      {
        accessorKey: "name",
        cell: ({ row }) => <PatientIdentity patient={row.original} />,
        header: "Name, Gender, Age",
      },
      {
        accessorKey: "bookingAt",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-700 dark:text-slate-300">
              {row.original.bookingAt}
            </p>
            <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-500">
              {row.original.bookingRelative}
            </p>
          </div>
        ),
        header: "Booking Date & Time",
      },
      {
        accessorKey: "scheduleDate",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-700 dark:text-slate-400">
            {row.original.scheduleDate}
          </span>
        ),
        header: "Schedule Date",
      },
      {
        accessorKey: "scheduleTime",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-700 dark:text-slate-400">
            {row.original.scheduleTime}
          </span>
        ),
        header: "Schedule Time",
      },
      {
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge status={row.original.status} tone={tone} />,
        header: "Status",
      },
      {
        cell: ({ row }) => (
          <AppointmentActions
            disabled={isUpdating}
            onApprove={() => onUpdateAppointment(row.original, "approved")}
            onReject={() => onUpdateAppointment(row.original, "rejected")}
            onReschedule={() => onUpdateAppointment(row.original, "rescheduled")}
            patient={row.original}
            tone={tone}
          />
        ),
        header: "Actions",
        id: "actions",
      },
    ],
    [currentPage, isUpdating, onUpdateAppointment, tone]
  );
}
