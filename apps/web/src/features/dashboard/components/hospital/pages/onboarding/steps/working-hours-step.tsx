import { Clock3, Copy } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { TextField } from "../fields";
import { TimePicker } from "../time-picker";
import type { OnboardingState, WorkingHour } from "../types";

export function WorkingHoursStep({
  data,
  setData,
}: {
  data: OnboardingState;
  setData: Dispatch<SetStateAction<OnboardingState>>;
}) {
  const updateHours = (day: string, patch: Partial<WorkingHour>) =>
    setData((current) => ({
      ...current,
      workingHours: current.workingHours.map((hours) =>
        hours.day === day ? { ...hours, ...patch } : hours
      ),
    }));
  const firstOpenDay = data.workingHours.find((h) => h.isOpen);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--onboarding-accent-soft)] p-4">
        <div>
          <p className="flex items-center gap-2 font-semibold text-[var(--onboarding-accent)]">
            <Clock3 size={18} />
            Weekly opening hours
          </p>
          <p className="mt-1 text-xs text-[var(--onboarding-muted-strong)]">
            12-hour time · Indian Standard Time (IST, UTC+05:30)
          </p>
        </div>
        <button
          type="button"
          disabled={!firstOpenDay}
          className="flex items-center gap-2 rounded-lg border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] px-3 py-2 text-xs font-semibold disabled:opacity-50"
          onClick={() => {
            if (firstOpenDay)
              setData((current) => ({
                ...current,
                workingHours: current.workingHours.map((h) =>
                  h.isOpen
                    ? {
                        ...h,
                        openingTime: firstOpenDay.openingTime,
                        closingTime: firstOpenDay.closingTime,
                        lunchBreak: firstOpenDay.lunchBreak,
                      }
                    : h
                ),
              }));
          }}
        >
          <Copy size={14} />
          Copy {firstOpenDay?.day || "first open day"} to open days
        </button>
      </div>
      {data.workingHours.map((hours) => {
        const [lunchStart = "", lunchEnd = ""] = hours.lunchBreak.split(" - ");
        return (
          <section
            key={hours.day}
            className="rounded-2xl border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-4"
          >
            <div className="grid items-center gap-4 sm:grid-cols-[170px_1fr_1fr]">
              <div>
                <h3 className="font-semibold">{hours.day}</h3>
                <label
                  className={`mt-2 inline-flex cursor-pointer items-center gap-2 text-xs font-semibold ${hours.isOpen ? "text-emerald-700 dark:text-emerald-400" : "text-[var(--onboarding-muted)]"}`}
                >
                  <input
                    type="checkbox"
                    role="switch"
                    aria-label={`${hours.day} open`}
                    checked={hours.isOpen}
                    className="size-4 accent-emerald-600"
                    onChange={(event) =>
                      updateHours(hours.day, {
                        isOpen: event.target.checked,
                        openingTime: hours.openingTime || "09:00",
                        closingTime: hours.closingTime || "18:00",
                      })
                    }
                  />
                  {hours.isOpen ? "Open" : "Closed"}
                </label>
              </div>
              {hours.isOpen ? (
                <>
                  <TimePicker
                    label="Opens at"
                    value={hours.openingTime}
                    onChange={(value) =>
                      updateHours(hours.day, { openingTime: value })
                    }
                  />
                  <TimePicker
                    label="Closes at"
                    value={hours.closingTime}
                    onChange={(value) =>
                      updateHours(hours.day, { closingTime: value })
                    }
                  />
                </>
              ) : (
                <p className="text-sm text-[var(--onboarding-muted)] sm:col-span-2">
                  Closed all day
                </p>
              )}
            </div>
            {hours.isOpen && (
              <details className="mt-4 border-t border-[var(--onboarding-border)] pt-3">
                <summary className="cursor-pointer text-xs font-semibold text-[var(--onboarding-muted-strong)]">
                  Break & emergency hours · Optional
                </summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <TimePicker
                    required={false}
                    label="Break starts"
                    value={lunchStart}
                    onChange={(value) =>
                      updateHours(hours.day, {
                        lunchBreak: `${value} - ${lunchEnd}`,
                      })
                    }
                  />
                  <TimePicker
                    required={false}
                    label="Break ends"
                    value={lunchEnd}
                    onChange={(value) =>
                      updateHours(hours.day, {
                        lunchBreak: `${lunchStart} - ${value}`,
                      })
                    }
                  />
                  <button
                    type="button"
                    className="text-left text-xs text-[var(--onboarding-accent)] underline"
                    onClick={() => updateHours(hours.day, { lunchBreak: "" })}
                  >
                    Remove break
                  </button>
                  <TextField
                    label="Emergency hours"
                    placeholder="24×7 on call"
                    value={hours.emergencyHours}
                    onChange={(value) =>
                      updateHours(hours.day, { emergencyHours: value })
                    }
                  />
                </div>
              </details>
            )}
          </section>
        );
      })}
    </div>
  );
}
