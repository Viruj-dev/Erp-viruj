import type { AppointmentRecord } from "../types";
import { formatDate, getStatusLabel } from "../utils";

export function DetailGrid({
  appointment,
}: {
  appointment: AppointmentRecord;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DetailItem label="Provider" value={appointment.doctorName} />
      <DetailItem
        label="Department"
        value={appointment.departmentName || "General"}
      />
      <DetailItem
        label="Date"
        value={formatDate(appointment.appointmentDate)}
      />
      <DetailItem label="Time" value={appointment.appointmentTime} />
      <DetailItem label="Mode" value={appointment.appointmentMode} />
      <DetailItem label="Status" value={getStatusLabel(appointment.status)} />
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-container-low p-3">
      <p className="text-[10px] font-semi-bold uppercase tracking-[0.16em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 text-sm font-semi-bold text-on-surface">{value}</p>
    </div>
  );
}
