"use client";

import { useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  MoreVertical,
  X,
} from "lucide-react";
import { appointments } from "@/features/dashboard/components/data";

export function ErpDemoAppointments() {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(
    appointments[0]?.id ?? ""
  );
  const selectedAppointment =
    appointments.find(
      (appointment) => appointment.id === selectedAppointmentId
    ) ?? appointments[0];

  if (!selectedAppointment) {
    return null;
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <TopMetric label="Total bookings" note="+12%" value="1,284" />
        <TopMetric
          label="Confirmed"
          note="Stable"
          value="842"
          tone="secondary"
        />
        <TopMetric
          label="Pending review"
          note="Urgent"
          value="43"
          tone="tertiary"
        />
        <TopMetric label="Cancellations" note="-2%" value="18" tone="neutral" />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] bg-surface-container-low p-3">
        <div className="flex rounded-xl bg-white p-1 shadow-sm">
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"
            type="button"
          >
            Table View
          </button>
          <button
            className="rounded-lg px-4 py-2 text-sm font-semibold text-on-surface-variant"
            type="button"
          >
            Calendar
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <FilterChip label="Status: All" />
          <FilterChip label="Dept: Cardiology" />
          <FilterChip label="Oct 12 - Oct 19, 2023" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="overflow-hidden rounded-[2rem] border border-outline-variant/25 bg-surface-container-lowest shadow-sm">
          <table className="w-full border-collapse text-left">
            <thead className="bg-surface-container-low">
              <tr className="text-[11px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
                <th className="px-6 py-4">Patient name</th>
                <th className="px-6 py-4">Date and time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/12">
              {appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className={`cursor-pointer transition-colors hover:bg-surface-container-low ${
                    appointment.id === selectedAppointment.id
                      ? "bg-surface-container-low"
                      : ""
                  }`}
                  onClick={() => setSelectedAppointmentId(appointment.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {appointment.patientAvatar ? (
                        <img
                          alt={appointment.patientName}
                          className="h-10 w-10 rounded-full object-cover"
                          src={appointment.patientAvatar}
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary">
                          {getInitials(appointment.patientName)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-on-surface">
                          {appointment.patientName}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {appointment.patientId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-on-surface">
                      {appointment.date}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {appointment.time}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={statusClassName(appointment.status)}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {appointment.doctor}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="rounded-lg p-2 text-outline hover:bg-surface-container-low"
                      type="button"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between bg-surface-container-low px-6 py-4 text-sm text-on-surface-variant">
            <p>Showing 1 to 4 of 258 entries</p>
            <div className="flex items-center gap-1">
              <PaginationIcon icon={<ChevronLeft size={16} />} />
              <button
                className="h-8 w-8 rounded-lg bg-primary text-xs font-black text-white"
                type="button"
              >
                1
              </button>
              <PaginationIcon label="2" />
              <PaginationIcon label="3" />
              <PaginationIcon icon={<ChevronRight size={16} />} />
            </div>
          </div>
        </div>

        <aside className="sticky top-24 h-fit overflow-hidden rounded-[2rem] border border-outline-variant/25 bg-white shadow-[0_24px_60px_rgba(25,28,30,0.08)]">
          <div className="flex items-start justify-between border-b border-outline-variant/15 px-6 py-5">
            <div>
              <h3 className="font-headline text-2xl font-black text-on-surface">
                Appointment details
              </h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                Ref {selectedAppointment.id}
              </p>
            </div>
            <button
              className="rounded-full p-2 text-outline hover:bg-surface-container-low"
              type="button"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-6 px-6 py-6">
            <div className="flex gap-4 rounded-[1.25rem] bg-surface-container-low p-4">
              <img
                alt={selectedAppointment.patientName}
                className="h-16 w-16 rounded-[1rem] object-cover"
                src={
                  selectedAppointment.patientAvatar ||
                  "https://images.unsplash.com/photo-1559839734-2b71f1536783?w=100&h=100&fit=crop"
                }
              />
              <div>
                <p className="font-semibold text-on-surface">
                  {selectedAppointment.patientName}
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Patient ID: {selectedAppointment.patientId}
                </p>
                <span className="mt-2 inline-flex rounded-full bg-tertiary/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-tertiary">
                  O+ positive
                </span>
              </div>
            </div>

            <DetailGrid
              items={[
                ["Date", selectedAppointment.date],
                ["Time slot", selectedAppointment.time],
                [
                  "Service type",
                  `${selectedAppointment.department} consultation`,
                ],
                ["Location", "North Wing, Room 4B"],
              ]}
              title="Schedule information"
            />

            {selectedAppointment.notes ? (
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-on-surface-variant">
                  Patient history and notes
                </p>
                <div className="mt-3 rounded-r-2xl border-l-4 border-primary bg-primary/6 p-4">
                  <blockquote className="text-sm italic leading-7 text-on-surface-variant">
                    {selectedAppointment.notes}
                  </blockquote>
                  <p className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                    {selectedAppointment.doctor}
                  </p>
                </div>
              </div>
            ) : null}

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-on-surface-variant">
                Attached files
              </p>
              <div className="mt-3 rounded-[1.2rem] border border-outline-variant/20 p-3">
                <div className="flex items-center gap-3">
                  <FileText className="text-primary" size={18} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-on-surface">
                      Lab_Results_Aug.pdf
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      1.2 MB | Aug 14, 2023
                    </p>
                  </div>
                  <Download className="text-outline" size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-t border-outline-variant/15 bg-surface-container-low px-6 py-5">
            <div className="grid grid-cols-2 gap-3">
              <ActionButton label="Reschedule" variant="secondary" />
              <ActionButton label="Accept Appt." variant="primary" />
            </div>
            <ActionButton label="Mark as Completed" variant="ghost" />
          </div>
        </aside>
      </section>

      <section>
        <h4 className="font-headline text-2xl font-black text-on-surface">
          Upcoming week preview
        </h4>
        <div className="mt-5 grid gap-4 md:grid-cols-4 xl:grid-cols-7">
          {[
            "Mon 12",
            "Tue 13",
            "Wed 14 (Today)",
            "Thu 15",
            "Fri 16",
            "Sat 17",
            "Sun 18",
          ].map((day, index) => (
            <div
              key={day}
              className={`rounded-[1.5rem] border p-4 shadow-sm ${
                index === 2
                  ? "scale-[1.02] border-primary bg-white"
                  : "border-outline-variant/20 bg-surface-container-lowest opacity-75"
              }`}
            >
              <p
                className={`text-xs font-black uppercase tracking-[0.18em] ${
                  index === 2 ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                {day}
              </p>
              <div className="mt-4 space-y-2">
                {index === 2 ? (
                  <>
                    <PreviewLine color="bg-secondary" text="12 appts" />
                    <PreviewLine color="bg-error" text="2 emergency" />
                    <p className="border-t border-outline-variant/20 pt-3 text-[11px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
                      Next: 09:30 AM
                    </p>
                  </>
                ) : (
                  <>
                    <div className="h-1 rounded-full bg-surface-container-high" />
                    <div className="h-1 w-2/3 rounded-full bg-surface-container-high" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function TopMetric({
  label,
  note,
  tone = "primary",
  value,
}: {
  label: string;
  note: string;
  tone?: "primary" | "secondary" | "tertiary" | "neutral";
  value: string;
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    tertiary: "bg-tertiary/10 text-tertiary",
    neutral: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className={`rounded-2xl p-3 ${tones[tone]}`}>
          {tone === "primary" ? (
            <CalendarDays size={18} />
          ) : tone === "secondary" ? (
            <Check size={18} />
          ) : tone === "tertiary" ? (
            <FileText size={18} />
          ) : (
            <X size={18} />
          )}
        </span>
        <span className="text-xs font-black uppercase tracking-[0.16em] text-on-surface-variant">
          {note}
        </span>
      </div>
      <p className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-2 font-headline text-4xl font-black text-on-surface">
        {value}
      </p>
    </div>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <button
      className="rounded-xl border border-outline-variant/20 bg-white px-4 py-2 text-sm font-semibold text-on-surface"
      type="button"
    >
      {label}
    </button>
  );
}

function PaginationIcon({
  icon,
  label,
}: {
  icon?: React.ReactNode;
  label?: string;
}) {
  return (
    <button
      className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-on-surface-variant hover:bg-white"
      type="button"
    >
      {icon ?? label}
    </button>
  );
}

function statusClassName(status: string) {
  if (status === "Confirmed") {
    return "inline-flex rounded-full bg-secondary-container/45 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-secondary";
  }
  if (status === "Pending") {
    return "inline-flex rounded-full bg-error-container px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-error";
  }
  return "inline-flex rounded-full bg-surface-container-high px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant";
}

function DetailGrid({
  items,
  title,
}: {
  items: [string, string][];
  title: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-on-surface-variant">
        {title}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-4">
        {items.map(([label, value]) => (
          <div key={label}>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant">
              {label}
            </p>
            <p className="mt-2 text-sm font-semibold text-on-surface">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  variant,
}: {
  label: string;
  variant: "primary" | "secondary" | "ghost";
}) {
  const className =
    variant === "primary"
      ? "bg-primary text-white shadow-md"
      : variant === "secondary"
        ? "border border-outline-variant/30 bg-white text-on-surface"
        : "border border-secondary/20 bg-transparent text-secondary";

  return (
    <button
      className={`rounded-xl px-4 py-3 text-sm font-black ${className}`}
      type="button"
    >
      {label}
    </button>
  );
}

function PreviewLine({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-on-surface">
        {text}
      </p>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}
