"use client";

import { DashboardPageShell } from "@/features/dashboard/components/shared/dashboard-page-shell";
import { cn } from "@/lib/utils";
import { type VirujActivity, virujBackend } from "@/lib/viruj-backend";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Filter,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

const modules = [
  "AUTHENTICATION",
  "USERS",
  "DOCTORS",
  "PATIENTS",
  "CLINICS",
  "HOSPITALS",
  "APPOINTMENTS",
  "CONSULTATIONS",
  "INVENTORY",
  "PAYMENTS",
  "ROLES",
  "SYSTEM",
];

const actions = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "REJECT",
  "ASSIGN",
  "BOOK",
  "CONFIRM",
  "RESCHEDULE",
  "CANCEL",
  "CHECK_IN",
  "COMPLETE",
  "PAY",
  "REFUND",
  "LOGIN",
  "LOGOUT",
  "INVITE",
];

export function ActivityLogsPage({
  organizationId,
}: {
  organizationId?: string;
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [module, setModule] = useState("");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [deferredSearch, module, action, from, to]);

  const filters = {
    action: action || undefined,
    from: from || undefined,
    limit: 20,
    module: module || undefined,
    organizationId,
    page,
    search: deferredSearch || undefined,
    to: to || undefined,
  };

  const query = useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => virujBackend.activity.list(filters),
    queryKey: virujBackend.activity.key(filters),
    placeholderData: (previous) => previous,
  });

  const activities = query.data?.data ?? [];
  const pagination = query.data?.pagination;
  const groupedActivities = useMemo(
    () =>
      activities.reduce<Record<string, VirujActivity[]>>((result, item) => {
        (result[item.dayLabel] ??= []).push(item);
        return result;
      }, {}),
    [activities]
  );
  const activeFilters = [module, action, from, to].filter(Boolean).length;

  return (
    <div className="h-screen space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 dark:border-white/[0.08] dark:bg-[#111418]">
        {query.isPending ? (
          <LoadingList />
        ) : query.isError ? (
          <State
            description={
              query.error instanceof Error
                ? query.error.message
                : "The ERP activity service could not be reached."
            }
            title="Couldn't load ERP activity"
          />
        ) : activities.length === 0 ? (
          <State
            description="ERP actions will appear here as appointments, staff, payments, doctors, patients, and system modules change."
            title="No ERP actions match this view"
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/[0.055]">
            {Object.entries(groupedActivities).map(([label, items]) => (
              <div key={label}>
                <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-100 bg-slate-50/95 px-5 py-2.5 backdrop-blur dark:border-white/[0.055] dark:bg-[#15191e]/95">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    {label}
                  </span>
                  <span className="h-px flex-1 bg-slate-200/70 dark:bg-white/[0.07]" />
                  <span className="text-[10px] tabular-nums text-slate-400">
                    {items.length} actions
                  </span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/[0.055]">
                  {items.map((item) => (
                    <ActivityCard item={item} key={item.id} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination
          onNext={() => setPage((value) => value + 1)}
          onPrevious={() => setPage((value) => Math.max(1, value - 1))}
          page={pagination?.page ?? page}
          totalPages={pagination?.totalPages ?? 0}
        />
      </section>
    </div>
  );
}

function ActivityCard({ item }: { item: VirujActivity }) {
  const metadata = Object.entries(item.metadata ?? {}).filter(
    ([, value]) => !isEmptyValue(value)
  );

  return (
    <article className="px-5 py-4 transition hover:bg-slate-50/80 dark:hover:bg-white/[0.025]">
      <div className="grid gap-3 md:grid-cols-[32px_minmax(0,1fr)_auto]">
        <span
          className={cn(
            "mt-0.5 flex size-8 items-center justify-center rounded-xl border",
            actionTone(item.action)
          )}
        >
          <CircleDot className="size-3.5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                actionTone(item.action)
              )}
            >
              {humanize(item.action)}
            </span>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
              {humanize(item.module)}
            </span>
            <time
              className="text-[11px] font-medium tabular-nums text-slate-400 md:hidden"
              dateTime={item.createdAt}
            >
              {formatDateTime(item.createdAt)}
            </time>
          </div>
          <h2 className="mt-2 font-headline text-base font-semibold text-slate-950 dark:text-white">
            {item.title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {item.description || item.display.summary}
          </p>
        </div>
        <time
          className="hidden pt-1 text-right text-[11px] font-medium tabular-nums text-slate-400 md:block"
          dateTime={item.createdAt}
        >
          {formatDateTime(item.createdAt)}
        </time>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <InfoChip
          label="Actor"
          value={item.actorName}
          hint={item.actorRole ?? "No role recorded"}
        />
        <InfoChip
          label="Resource"
          value={item.display.resource}
          hint={item.resourceId ?? item.resource}
        />
        <InfoChip
          label="Workspace"
          value={item.workspaceType}
          hint={item.workspaceId}
        />
        <InfoChip label="Event ID" value={item.id} mono />
      </div>

      {metadata.length > 0 ? (
        <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-white/[0.07] dark:bg-white/[0.025]">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Action context
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {metadata.map(([key, value]) => (
              <div className="min-w-0 text-xs" key={key}>
                <span className="block font-semibold text-slate-400">
                  {humanize(key)}
                </span>
                <span className="mt-0.5 block break-words font-mono text-[11px] leading-5 text-slate-700 dark:text-slate-300">
                  {formatMetadata(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function InfoChip({
  hint,
  label,
  mono = false,
  value,
}: {
  hint?: string | null;
  label: string;
  mono?: boolean;
  value: string | null;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200/80 bg-white px-3 py-2 dark:border-white/[0.07] dark:bg-white/[0.025]">
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-200",
          mono && "font-mono text-[11px]"
        )}
      >
        {value ? (mono ? value : humanize(value)) : "Not recorded"}
      </p>
      {hint ? (
        <p className="mt-0.5 truncate font-mono text-[9px] text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="relative">
      <Filter className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
      <select
        className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-xs font-semibold text-slate-600 outline-none focus:border-blue-400 dark:border-white/[0.08] dark:bg-[#15191e] dark:text-slate-300"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {humanize(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Pagination({
  onNext,
  onPrevious,
  page,
  totalPages,
}: {
  onNext: () => void;
  onPrevious: () => void;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-white/[0.055]">
      <span className="text-[11px] font-medium text-slate-400">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-1">
        <button
          aria-label="Previous page"
          className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 dark:border-white/10"
          disabled={page <= 1}
          onClick={onPrevious}
          type="button"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          aria-label="Next page"
          className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 dark:border-white/10"
          disabled={page >= totalPages}
          onClick={onNext}
          type="button"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function State({ description, title }: { description: string; title: string }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.05]">
        <Activity className="size-5" />
      </span>
      <h2 className="mt-4 font-headline text-lg font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </h2>
      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function LoadingList() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 7 }, (_, index) => (
        <div
          className="h-36 animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.04]"
          key={index}
        />
      ))}
    </div>
  );
}

function actionTone(action: string) {
  if (["DELETE", "REJECT", "CANCEL", "REMOVE"].includes(action)) {
    return "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300";
  }
  if (["APPROVE", "COMPLETE", "CONFIRM", "PAY", "CREATE"].includes(action)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300";
  }
  return "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function humanize(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMetadata(value: unknown) {
  if (value === null || value === undefined) return "Not recorded";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

function isEmptyValue(value: unknown) {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}
