"use client";

import { ErpSelect } from "@/components/ui/erp/select";


import { createContext, useContext, useState } from "react";
import { Clock3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldLabel, fieldClassName } from "./fields";
import type { OnboardingKind } from "./types";

export const OnboardingTheme = createContext<OnboardingKind>("hospital");
export function formatTime(value: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return "Set time";
  const [hours, minutes] = value.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

export function TimePicker({
  label,
  value,
  onChange,
  required = true,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  const kind = useContext(OnboardingTheme);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("09:00");
  const [mode, setMode] = useState<"hour" | "minute">("hour");
  const [hours, minutes] = draft.split(":").map(Number);
  const hour12 = hours % 12 || 12;
  const setTime = (hour: number, minute: number) =>
    setDraft(
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
    );
  const angle = (mode === "hour" ? hour12 * 30 : minutes * 6) - 90;
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) {
            setDraft(value || "09:00");
            setMode("hour");
          }
          setOpen(next);
        }}
      >
        <DialogTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label={`${label}: ${formatTime(value)}, Indian Standard Time`}
            className={fieldClassName(
              "flex items-center justify-between gap-2 tabular-nums"
            )}
          >
            {formatTime(value)}
            <Clock3 size={16} className="text-[var(--onboarding-accent)]" />
          </button>
        </DialogTrigger>
        <DialogContent
          className={`vh-onboarding ${kind === "clinic" ? "vh-onboarding--clinic" : ""} max-h-[90dvh] overflow-y-auto border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] text-[var(--onboarding-text)] sm:max-w-sm`}
        >
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>
            Indian Standard Time · IST (UTC+05:30)
          </DialogDescription>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              aria-label="Select hour"
              aria-pressed={mode === "hour"}
              onClick={() => setMode("hour")}
              className={`rounded-xl px-3 py-2 text-3xl font-semibold ${mode === "hour" ? "bg-[var(--onboarding-accent-soft)] text-[var(--onboarding-accent)]" : ""}`}
            >
              {String(hour12).padStart(2, "0")}
            </button>
            <span className="text-3xl">:</span>
            <button
              type="button"
              aria-label="Select minutes"
              aria-pressed={mode === "minute"}
              onClick={() => setMode("minute")}
              className={`rounded-xl px-3 py-2 text-3xl font-semibold ${mode === "minute" ? "bg-[var(--onboarding-accent-soft)] text-[var(--onboarding-accent)]" : ""}`}
            >
              {String(minutes).padStart(2, "0")}
            </button>
            <div className="grid gap-1">
              {["AM", "PM"].map((period) => (
                <button
                  type="button"
                  key={period}
                  aria-pressed={hours >= 12 === (period === "PM")}
                  onClick={() =>
                    setTime((hours % 12) + (period === "PM" ? 12 : 0), minutes)
                  }
                  className={`rounded-md px-3 py-1 text-xs font-bold ${hours >= 12 === (period === "PM") ? "bg-[var(--onboarding-accent)] text-white" : "bg-[var(--onboarding-panel-muted)]"}`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div
            className="relative mx-auto size-64 rounded-full bg-[var(--onboarding-panel-muted)]"
            role="group"
            aria-label={mode === "hour" ? "Clock hours" : "Clock minutes"}
          >
            <svg
              viewBox="0 0 256 256"
              className="pointer-events-none absolute inset-0 size-full text-[var(--onboarding-accent)]"
              aria-hidden="true"
            >
              <line
                x1="128"
                y1="128"
                x2={128 + 98 * Math.cos((angle * Math.PI) / 180)}
                y2={128 + 98 * Math.sin((angle * Math.PI) / 180)}
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="128" cy="128" r="5" fill="currentColor" />
            </svg>
            {Array.from({ length: 12 }, (_, index) => {
              const number = mode === "hour" ? index + 1 : index * 5;
              const degrees = (mode === "hour" ? number * 30 : number * 6) - 90;
              const selected =
                mode === "hour" ? number === hour12 : number === minutes;
              return (
                <button
                  key={number}
                  type="button"
                  aria-label={`${number} ${mode === "hour" ? "hours" : "minutes"}`}
                  aria-pressed={selected}
                  onClick={() => {
                    if (mode === "hour") {
                      setTime((number % 12) + (hours >= 12 ? 12 : 0), minutes);
                      setMode("minute");
                    } else setTime(hours, number);
                  }}
                  style={{
                    left: 128 + 98 * Math.cos((degrees * Math.PI) / 180),
                    top: 128 + 98 * Math.sin((degrees * Math.PI) / 180),
                  }}
                  className={`absolute flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${selected ? "bg-[var(--onboarding-accent)] text-white" : "hover:bg-[var(--onboarding-accent-soft)]"}`}
                >
                  {mode === "minute" ? String(number).padStart(2, "0") : number}
                </button>
              );
            })}
          </div>
          <label className="flex items-center justify-between gap-3 text-xs">
            Exact minute
            <ErpSelect
              aria-label="Exact minute"
              className={fieldClassName("w-24")}
              value={minutes}
              onChange={(event) => setTime(hours, Number(event.target.value))}
            >
              {Array.from({ length: 60 }, (_, n) => (
                <option key={n} value={n}>
                  {String(n).padStart(2, "0")}
                </option>
              ))}
            </ErpSelect>
          </label>
          <button
            type="button"
            className="h-11 rounded-lg bg-[var(--onboarding-accent-deep)] font-semibold text-white"
            onClick={() => {
              onChange(draft);
              setOpen(false);
            }}
          >
            Set {formatTime(draft)}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
