import { Badge } from "@/features/dashboard/components/ui/badge";
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
}: {
  currentPage: number;
  isUpdating: boolean;
  onUpdateAppointment: (
    patient: DirectoryPatient,
    status: VirujAppointmentStatus
  ) => void;
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
        accessorKey: "id",
        cell: ({ row }) => (
          <span className="block max-w-[190px] whitespace-normal break-all font-semibold leading-5 text-slate-800 dark:text-slate-300">
            {row.original.id}
          </span>
        ),
        header: "ID",
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
        accessorKey: "schedule",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-700 dark:text-slate-400">
            {row.original.schedule}
          </span>
        ),
        header: "Schedule",
      },
      {
        accessorKey: "mode",
        cell: ({ row }) => (
          <Badge
            className="rounded-full border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-slate-300"
            variant="outline"
          >
            {row.original.mode}
          </Badge>
        ),
        header: "Mode",
      },
      {
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
          />
        ),
        header: "Actions",
        id: "actions",
      },
    ],
    [currentPage, isUpdating, onUpdateAppointment]
  );
}
