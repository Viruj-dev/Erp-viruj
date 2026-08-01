import { Clock3 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { FieldLabel, TextField, fieldClassName } from "../fields";
import type { OnboardingState, WorkingHour } from "../types";

export function WorkingHoursStep({
  data,
  setData,
}: {
  data: OnboardingState;
  setData: Dispatch<SetStateAction<OnboardingState>>;
}) {
  const updateHours = (day: string, patch: Partial<WorkingHour>) => {
    setData((current) => ({
      ...current,
      workingHours: current.workingHours.map((hours) =>
        hours.day === day ? { ...hours, ...patch } : hours
      ),
    }));
  };

  return (
    <div className="space-y-3">
      {data.workingHours.map((hours) => (
        <section
          className="grid gap-3 rounded-[22px] border border-slate-200/80 bg-white/78 p-4 shadow-sm md:grid-cols-[140px_1fr] md:items-center dark:border-white/[0.10] dark:bg-white/[0.055]"
          key={hours.day}
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-[var(--onboarding-accent-soft)] text-[var(--onboarding-accent)]">
              <Clock3 size={18} />
            </span>
            <div>
              <p className="font-headline text-base font-semibold text-slate-950 dark:text-white">
                {hours.day}
              </p>
              <label className="mt-1 inline-flex items-center gap-2 text-xs font-bold text-slate-500">
                <input
                  checked={hours.isOpen}
                  className="size-4 rounded border-slate-300"
                  onChange={(event) => updateHours(hours.day, { isOpen: event.target.checked })}
                  type="checkbox"
                />
                {hours.isOpen ? "Open" : "Closed"}
              </label>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <label>
              <FieldLabel>Opening Time</FieldLabel>
              <input
                className={fieldClassName()}
                disabled={!hours.isOpen}
                onChange={(event) => updateHours(hours.day, { openingTime: event.target.value })}
                type="time"
                value={hours.openingTime}
              />
            </label>
            <label>
              <FieldLabel>Closing Time</FieldLabel>
              <input
                className={fieldClassName()}
                disabled={!hours.isOpen}
                onChange={(event) => updateHours(hours.day, { closingTime: event.target.value })}
                type="time"
                value={hours.closingTime}
              />
            </label>
            <TextField
              label="Lunch Break"
              onChange={(value) => updateHours(hours.day, { lunchBreak: value })}
              placeholder="13:00 - 14:00"
              value={hours.lunchBreak}
            />
            <TextField
              label="Emergency Hours (optional)"
              onChange={(value) => updateHours(hours.day, { emergencyHours: value })}
              placeholder="24x7 on call"
              value={hours.emergencyHours}
            />
          </div>
        </section>
      ))}
    </div>
  );
}
