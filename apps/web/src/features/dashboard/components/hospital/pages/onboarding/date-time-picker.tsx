"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { DayPicker } from "react-day-picker";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldLabel, fieldClassName } from "./fields";
import { TimePicker } from "./time-picker";

export function DateTimePicker({
  label,
  value,
  onChange,
  themeClassName = "",
  timezone = "Asia/Kolkata",
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  themeClassName?: string;
  timezone?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [date = "", time = "09:00"] = value.split("T");
  const selected = date ? new Date(`${date}T12:00:00`) : undefined;
  return (
    <div className={`vh-onboarding ${themeClassName} space-y-3`}>
      <div>
        <FieldLabel required={required}>{label} · Date</FieldLabel>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className={fieldClassName(
                "flex items-center justify-between gap-3"
              )}
              aria-label={`${label} date: ${date || "Choose date"}`}
            >
              <span>
                {selected
                  ? selected.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Choose date"}
              </span>
              <CalendarDays size={16} />
            </button>
          </DialogTrigger>
          <DialogContent
            className={`vh-onboarding ${themeClassName} border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] text-[var(--onboarding-text)] sm:max-w-sm`}
          >
            <DialogTitle>{label} date</DialogTitle>
            <DialogDescription>
              Choose an appointment date · {timezone}
            </DialogDescription>
            <DayPicker
              mode="single"
              selected={selected}
              defaultMonth={selected}
              showOutsideDays
              onSelect={(day) => {
                if (!day) return;
                const next = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
                onChange(`${next}T${time}`);
                setOpen(false);
              }}
              classNames={{
                root: "relative mx-auto w-full",
                months: "w-full",
                month: "w-full",
                month_caption: "flex h-12 items-center font-semibold",
                nav: "absolute right-0 top-0 flex h-12 gap-2",
                button_previous: "rounded-lg border p-2",
                button_next: "rounded-lg border p-2",
                chevron: "size-4 fill-current",
                month_grid: "w-full border-collapse",
                weekday:
                  "py-3 text-xs font-medium text-[var(--onboarding-muted)]",
                day: "p-0.5 text-center",
                day_button:
                  "mx-auto flex size-9 items-center justify-center rounded-full text-sm hover:bg-[var(--onboarding-accent-soft)] focus-visible:outline-2",
                selected:
                  "rounded-full bg-[var(--onboarding-accent)] text-white",
                today: "font-bold underline",
                outside: "opacity-35",
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <TimePicker
        label={`${label} · Time`}
        value={time}
        required={required}
        themeClassName={themeClassName}
        timezoneLabel={`Timezone: ${timezone}`}
        onChange={(next) => onChange(`${date}T${next}`)}
      />
    </div>
  );
}
