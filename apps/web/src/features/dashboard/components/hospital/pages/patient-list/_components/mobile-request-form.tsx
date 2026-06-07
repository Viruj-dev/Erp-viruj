import type { VirujAppointment } from "@/lib/viruj-backend";
import { Send } from "lucide-react";

import type { PatientRequestForm } from "../types";
import { appointmentStatusLabel } from "../utils";

export function MobileRequestForm({
  errorMessage,
  form,
  isSubmitting,
  lastRequest,
  onChange,
  onSubmit,
}: {
  errorMessage?: string;
  form: PatientRequestForm;
  isSubmitting: boolean;
  lastRequest: VirujAppointment | null;
  onChange: (form: PatientRequestForm) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#14171b]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-600">
            Mobile App Request
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Send a real appointment request and track approval feedback in the list.
          </p>
        </div>
        {lastRequest ? (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-400/14 dark:text-blue-200">
            Last request: {appointmentStatusLabel(lastRequest.status)}
          </span>
        ) : null}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_0.5fr_0.7fr_1fr_1.4fr_auto]">
        <RequestInput
          onChange={(patientName) => onChange({ ...form, patientName })}
          placeholder="Patient name"
          value={form.patientName}
        />
        <RequestInput
          onChange={(mobileUserId) => onChange({ ...form, mobileUserId })}
          placeholder="Mobile user id"
          value={form.mobileUserId}
        />
        <RequestInput
          onChange={(patientAge) => onChange({ ...form, patientAge })}
          placeholder="Age"
          type="number"
          value={form.patientAge}
        />
        <RequestInput
          onChange={(patientPhone) => onChange({ ...form, patientPhone })}
          placeholder="Phone"
          value={form.patientPhone}
        />
        <RequestInput
          onChange={(requestedAt) => onChange({ ...form, requestedAt })}
          type="datetime-local"
          value={form.requestedAt}
        />
        <RequestInput
          onChange={(reason) => onChange({ ...form, reason })}
          placeholder="Reason"
          value={form.reason}
        />
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSubmitting || !form.patientName.trim() || !form.mobileUserId.trim()}
          onClick={onSubmit}
          type="button"
        >
          <Send size={16} />
          Send
        </button>
      </div>

      {errorMessage ? (
        <p className="mt-3 text-sm font-semibold text-rose-600">{errorMessage}</p>
      ) : null}
    </section>
  );
}

function RequestInput({
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
}) {
  return (
    <input
      className="h-11 rounded-xl border-none bg-slate-100 px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 dark:bg-white/[0.06] dark:text-slate-100"
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type={type}
      value={value}
    />
  );
}
