import { TableState } from "../components/table-state";
import { TableToolbar } from "../components/table-toolbar";
import type { AppointmentRecord } from "../types";
import { formatDate, getStatusLabel, statusClassName } from "../utils";

export function PatientDecisionHistory({
  appointments,
  departmentFilter,
  departments,
  isLoading,
  onDepartmentFilter,
  onQuery,
  query,
}: {
  appointments: AppointmentRecord[];
  departmentFilter: string;
  departments: string[];
  isLoading: boolean;
  onDepartmentFilter: (value: string) => void;
  onQuery: (value: string) => void;
  query: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
      <TableToolbar
        departmentFilter={departmentFilter}
        departments={departments}
        onDepartmentFilter={onDepartmentFilter}
        onQuery={onQuery}
        query={query}
        title="Confirmed & Rejected Patient History"
      />
      <div className="grid grid-cols-[1.2fr_1.05fr_1fr_1fr_1fr_1.2fr] gap-4 border-y border-outline-variant/15 bg-surface-container-low px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
        <span>Patient</span>
        <span>Date</span>
        <span>Decision</span>
        <span>Provider</span>
        <span>Department</span>
        <span>Reason / Notes</span>
      </div>
      {isLoading ? (
        <TableState text="Loading patient decision history..." />
      ) : appointments.length ? (
        <div className="divide-y divide-outline-variant/12">
          {appointments.map((appointment) => (
            <div
              className="grid grid-cols-[1.2fr_1.05fr_1fr_1fr_1fr_1.2fr] items-center gap-4 px-5 py-4 text-sm"
              key={appointment.id}
            >
              <span>
                <strong className="block text-on-surface">
                  {appointment.patientName}
                </strong>
                <span className="text-xs text-on-surface-variant">
                  {appointment.patientPhone || appointment.patientUserId || "No ID"}
                </span>
              </span>
              <span className="font-semibold text-on-surface">
                {formatDate(appointment.appointmentDate)}
              </span>
              <span className={statusClassName(appointment.status)}>
                {getStatusLabel(appointment.status)}
              </span>
              <span className="truncate font-semibold text-on-surface">
                {appointment.doctorName}
              </span>
              <span className="text-on-surface-variant">
                {appointment.departmentName || "General"}
              </span>
              <span className="line-clamp-2 text-xs font-semibold text-on-surface-variant">
                {appointment.approvalNotes || appointment.reason || "No notes"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <TableState text="No confirmed or rejected patient history yet." />
      )}
    </section>
  );
}
