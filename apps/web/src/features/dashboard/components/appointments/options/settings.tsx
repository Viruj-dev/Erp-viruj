import { SlidersHorizontal } from "lucide-react";

export function AppointmentSettings() {
  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          Appointment Settings
        </p>
        <h2 className="font-headline text-2xl font-black text-on-surface">
          Scheduling rules
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["Auto-close stale requests", "Requests older than 72 hours"],
            ["Require rejection reason", "Handlers must explain declined visits"],
            ["Doctor conflict warning", "Detect overlapping confirmed slots"],
            ["Patient duplicate check", "Flag same-day duplicate bookings"],
          ].map(([title, body], index) => (
            <label
              className="flex items-start justify-between gap-4 rounded-2xl bg-surface-container-low p-4"
              key={title}
            >
              <span>
                <span className="block text-sm font-black text-on-surface">
                  {title}
                </span>
                <span className="mt-1 block text-xs font-semibold text-on-surface-variant">
                  {body}
                </span>
              </span>
              <input
                className="mt-1 h-5 w-5 accent-primary"
                defaultChecked={index < 3}
                type="checkbox"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
        <SlidersHorizontal className="text-primary" size={22} />
        <h3 className="mt-4 font-headline text-xl font-black text-on-surface">
          Handler Defaults
        </h3>
        <div className="mt-5 space-y-4">
          <SettingField label="Default review SLA" value="30 minutes" />
          <SettingField label="Queue escalation" value="After 12 pending cases" />
          <SettingField label="Calendar lock window" value="15 minutes before visit" />
        </div>
      </div>
    </section>
  );
}

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
      {label}
      <input
        className="mt-2 h-11 w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 text-sm font-black normal-case tracking-normal text-on-surface outline-none focus:border-primary"
        defaultValue={value}
      />
    </label>
  );
}
