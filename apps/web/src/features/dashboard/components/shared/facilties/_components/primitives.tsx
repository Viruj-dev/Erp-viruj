"use client";

import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Switch } from "@/features/dashboard/components/ui/switch";
import { cn } from "@/lib/utils";
import type { VirujFacilityCategory, VirujFacilityStatus } from "@/lib/viruj-backend";
export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semi-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/[0.08]"
      onClick={onClick}
      type="button"
    >
      <ChevronLeft size={16} />
      Back
    </button>
  );
}

export function PrimaryButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semi-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

export function IconAction({
  danger,
  icon,
  label,
  onClick,
  primary,
}: {
  danger?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semi-bold transition",
        primary &&
          "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950",
        danger &&
          "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-400/10 dark:text-red-200",
        !primary &&
          !danger &&
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/[0.08]"
      )}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

export function MenuButton({
  danger,
  icon,
  label,
  onClick,
}: {
  danger?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-xs font-semi-bold transition hover:bg-slate-100 dark:hover:bg-white/[0.08]",
        danger
          ? "text-red-600 dark:text-red-300"
          : "text-slate-700 dark:text-slate-200"
      )}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

export function Select({
  children,
  label,
  onChange,
  value,
}: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-slate-100"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}

export function FormPanel({
  children,
  subtitle,
  title,
}: {
  children: ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#15181d]">
      <h2 className="font-headline text-lg font-semi-bold text-slate-950 dark:text-slate-100">
        {title}
      </h2>
      <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function DetailPanel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#15181d]">
      <h2 className="font-headline text-base font-semi-bold text-slate-950 dark:text-slate-100">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function TextField({
  className,
  label,
  onChange,
  placeholder,
  value,
}: {
  className?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-[10px] font-semi-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-600">
        {label}
      </span>
      <input
        className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-slate-100"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

export function NumberField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number | null) => void;
  value: number | null;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semi-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-600">
        {label}
      </span>
      <input
        className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-slate-100"
        min={0}
        onChange={(event) =>
          onChange(
            event.target.value === "" ? null : Number(event.target.value)
          )
        }
        type="number"
        value={value ?? ""}
      />
    </label>
  );
}

export function TextAreaField({
  compact,
  label,
  onChange,
  placeholder,
  value,
}: {
  compact?: boolean;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="block md:col-span-2">
      <span className="text-[10px] font-semi-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-600">
        {label}
      </span>
      <textarea
        className={cn(
          "mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none transition focus:border-slate-400 dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-slate-100",
          compact ? "min-h-24" : "min-h-36"
        )}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

export function SelectField({
  children,
  label,
  onChange,
  value,
}: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semi-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-600">
        {label}
      </span>
      <select
        className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-slate-100"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}

export function SwitchRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3 dark:bg-white/[0.055]">
      <span className="text-sm font-semi-bold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

export function BulkButton({
  danger,
  disabled,
  label,
  onClick,
}: {
  danger?: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "h-9 rounded-lg px-3 text-xs font-semi-bold transition disabled:opacity-50",
        danger
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-white/10 text-white hover:bg-white/15"
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

export function CategoryPill({ category }: { category: VirujFacilityCategory }) {
  return (
    <span className="inline-flex w-fit items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700 ring-1 ring-slate-200 dark:bg-white/[0.08] dark:text-slate-200 dark:ring-white/[0.10]">
      {category}
    </span>
  );
}

export function StatusPill({
  className,
  status,
}: {
  className?: string;
  status: VirujFacilityStatus;
}) {
  const styles =
    status === "active"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/14 dark:text-emerald-200"
      : status === "archived"
        ? "bg-slate-200 text-slate-700 dark:bg-white/[0.10] dark:text-slate-300"
        : "bg-amber-100 text-amber-800 dark:bg-amber-400/14 dark:text-amber-200";
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-lg px-2.5 text-[10px] font-bold uppercase tracking-[0.12em]",
        styles,
        className
      )}
    >
      {status}
    </span>
  );
}

export function Badge({
  icon,
  label,
  tone,
}: {
  icon: ReactNode;
  label: string;
  tone?: "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semi-bold",
        tone === "danger"
          ? "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-200"
          : "bg-slate-100 text-slate-700 dark:bg-white/[0.07] dark:text-slate-200"
      )}
    >
      {icon}
      {label}
    </span>
  );
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.055]">
      <p className="text-[10px] font-semi-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 text-sm last:border-b-0 dark:border-white/[0.06]">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right font-semi-bold text-slate-900 dark:text-slate-100">
        {value}
      </span>
    </div>
  );
}
