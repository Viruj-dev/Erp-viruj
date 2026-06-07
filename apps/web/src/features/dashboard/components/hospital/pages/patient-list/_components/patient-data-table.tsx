import { Button } from "@/features/dashboard/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/features/dashboard/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/dashboard/components/ui/table";
import type { VirujAppointmentStatus } from "@/lib/viruj-backend";
import {
  type RowSelectionState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import type { DirectoryPatient } from "../types";
import { getColumnLabel } from "../utils";
import { usePatientColumns } from "./patient-table-columns";

export function PatientDataTable({
  currentPage,
  isDeletingAll,
  isUpdating,
  onDeleteAll,
  onNextPage,
  onPreviousPage,
  onSearchChange,
  onUpdateAppointment,
  pageCount,
  patients,
  search,
  totalPatients,
}: {
  currentPage: number;
  isDeletingAll: boolean;
  isUpdating: boolean;
  onDeleteAll: () => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onSearchChange: (value: string) => void;
  onUpdateAppointment: (
    patient: DirectoryPatient,
    status: VirujAppointmentStatus
  ) => void;
  pageCount: number;
  patients: DirectoryPatient[];
  search: string;
  totalPatients: number;
}) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const columns = usePatientColumns({
    currentPage,
    isUpdating,
    onUpdateAppointment,
  });
  const table = useReactTable({
    columnVisibility,
    columns,
    data: patients,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#050505]">
      <div className="mb-4 flex items-center gap-3">
        <input
          className="h-10 w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-slate-300 focus:ring-2 focus:ring-slate-200/70 dark:border-white/[0.09] dark:bg-[#0b0b0c] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-white/[0.16] dark:focus:ring-white/[0.08]"
          onChange={(event) => {
            onSearchChange(event.target.value);
            table.resetRowSelection();
          }}
          placeholder="Filter patients..."
          type="text"
          value={search}
        />
        <Button
          className="ml-auto h-10 border-rose-200 bg-white text-rose-600 shadow-none hover:bg-rose-50 hover:text-rose-700 disabled:text-rose-300 dark:border-rose-400/20 dark:bg-[#0b0b0c] dark:text-rose-300 dark:hover:bg-rose-400/[0.08]"
          disabled={isDeletingAll || totalPatients === 0}
          onClick={onDeleteAll}
          type="button"
          variant="outline"
        >
          {isDeletingAll ? "Deleting..." : "Delete all"}
        </Button>
        <ColumnVisibilityMenu table={table} />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-white/[0.09]">
        <Table>
          <TableHeader className="bg-slate-50/95 dark:bg-white/[0.035]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="border-slate-200/80 hover:bg-transparent dark:border-white/[0.08]"
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => (
                  <TableHead className={headerClassName(header.column.id)} key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="border-slate-200/70 transition hover:bg-slate-50/90 dark:border-white/[0.07] dark:hover:bg-white/[0.04]"
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell className={cellClassName(cell.column.id, index)} key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-sm font-semibold text-slate-500 dark:text-slate-500"
                  colSpan={columns.length}
                >
                  No appointment requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTableFooter
        currentPage={currentPage}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
        pageCount={pageCount}
        selectedRows={table.getFilteredSelectedRowModel().rows.length}
        visibleRows={table.getRowModel().rows.length}
      />
    </section>
  );
}

function ColumnVisibilityMenu({
  table,
}: {
  table: ReturnType<typeof useReactTable<DirectoryPatient>>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-10 border-slate-200 bg-white text-slate-700 shadow-none hover:bg-slate-50 dark:border-white/[0.09] dark:bg-[#0b0b0c] dark:text-slate-300 dark:hover:bg-white/[0.06]"
          variant="outline"
        >
          Columns
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              checked={column.getIsVisible()}
              className="capitalize"
              key={column.id}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {getColumnLabel(column.id)}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DataTableFooter({
  currentPage,
  onNextPage,
  onPreviousPage,
  pageCount,
  selectedRows,
  visibleRows,
}: {
  currentPage: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  pageCount: number;
  selectedRows: number;
  visibleRows: number;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-500">
        {selectedRows} of {visibleRows} row(s) selected.
      </p>
      <div className="flex items-center gap-2">
        <PaginationButton disabled={currentPage <= 1} onClick={onPreviousPage}>
          Previous
        </PaginationButton>
        <PaginationButton disabled={currentPage >= pageCount} onClick={onNextPage}>
          Next
        </PaginationButton>
      </div>
    </div>
  );
}

function PaginationButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      className="h-9 border-slate-200 bg-white text-slate-700 shadow-none disabled:text-slate-400 dark:border-white/[0.09] dark:bg-[#0b0b0c] dark:text-slate-300 dark:disabled:text-slate-600"
      disabled={disabled}
      onClick={onClick}
      type="button"
      variant="outline"
    >
      {children}
    </Button>
  );
}

function headerClassName(columnId: string) {
  const widths: Record<string, string> = {
    actions: "w-[72px] pr-3 text-right",
    bookingAt: "min-w-[190px]",
    id: "w-[180px]",
    mode: "w-[120px]",
    name: "min-w-[210px]",
    schedule: "min-w-[160px]",
    select: "w-10 pl-3 pr-2",
    serial: "w-16",
    status: "w-[140px]",
  };

  return `text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-500 ${
    widths[columnId] ?? ""
  }`;
}

function cellClassName(columnId: string, index: number) {
  return `${index === 0 ? "pl-3 pr-2" : ""} ${
    columnId === "actions" ? "pr-3 text-right" : ""
  }`;
}
