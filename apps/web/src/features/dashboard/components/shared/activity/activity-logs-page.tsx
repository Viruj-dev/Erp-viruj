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
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
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
  const [selected, setSelected] = useState<VirujActivity | null>(null);

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
  const groups = useMemo(
    () =>
      activities.reduce<Record<string, VirujActivity[]>>((result, item) => {
        (result[item.dayLabel] ??= []).push(item);
        return result;
      }, {}),
    [activities]
  );
  const activeFilters = [module, action, from, to].filter(Boolean).length;
  const uniqueActors = new Set(
    activities.map((item) => item.actorId ?? item.actorName)
  ).size;
  const uniqueModules = new Set(activities.map((item) => item.module)).size;

  useEffect(() => {
    if (selected && !activities.some((item) => item.id === selected.id)) {
      setSelected(null);
    }
  }, [activities, selected]);

  const resetFilters = () => {
    setSearch("");
    setModule("");
    setAction("");
    setFrom("");
    setTo("");
  };

  return (
    <DashboardPageShell
      actions={
        <button
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
          type="button"
        >
          <RefreshCw
            className={cn("size-3.5", query.isFetching && "animate-spin")}
          />
          Refresh ledger
        </button>
      }
      eyebrow="Workspace intelligence"
      subtitle="A tamper-conscious timeline of meaningful business actions across your workspace."
      title="Activity logs"
      tone="slate"
    >
      <section className="grid gap-3 sm:grid-cols-3">
        <Metric
          icon={Activity}
          label="Matching events"
          value={pagination?.total ?? 0}
          note="Across the selected range"
        />
        <Metric
          icon={UserRound}
          label="Actors on page"
          value={uniqueActors}
          note="People and system agents"
        />
        <Metric
          icon={ShieldCheck}
          label="Modules on page"
          value={uniqueModules}
          note="Operational surfaces touched"
        />
      </section>

      <section className="rounded-2xl border border-slate-200/90 bg-white/90 p-3 shadow-[0_16px_50px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-[#111418]">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search activity logs"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-slate-100"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search actor, resource, title or description"
              value={search}
            />
          </label>
          <FilterSelect
            label="All modules"
            onChange={setModule}
            options={modules}
            value={module}
          />
          <FilterSelect
            label="All actions"
            onChange={setAction}
            options={actions}
            value={action}
          />
          <label className="relative">
            <CalendarDays className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="From date"
              className="h-11 rounded-xl border border-slate-200 bg-white pl-9 pr-2 text-xs font-semibold text-slate-600 outline-none focus:border-blue-400 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-slate-300"
              onChange={(event) => setFrom(event.target.value)}
              type="date"
              value={from}
            />
          </label>
          <label>
            <input
              aria-label="To date"
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-blue-400 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-slate-300"
              onChange={(event) => setTo(event.target.value)}
              type="date"
              value={to}
            />
          </label>
          {(activeFilters > 0 || search) && (
            <button
              className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
              onClick={resetFilters}
              type="button"
            >
              <X className="size-3.5" />
              Clear
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          <SlidersHorizontal className="size-3" />
          {activeFilters
            ? activeFilters + " filters active"
            : "Live workspace scope"}
          <span className="h-px flex-1 bg-slate-100 dark:bg-white/[0.06]" />
          Tenant isolated
        </div>
      </section>

      <div className="grid min-h-[520px] gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 dark:border-white/[0.08] dark:bg-[#111418]">
          {query.isPending ? (
            <LoadingTimeline />
          ) : query.isError ? (
            <State
              description={
                query.error instanceof Error
                  ? query.error.message
                  : "The activity service could not be reached."
              }
              title="Couldn’t open the ledger"
            />
          ) : activities.length === 0 ? (
            <State
              description="Meaningful business actions will appear here as modules call the central activity service."
              title="No activity matches this view"
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/[0.055]">
              {Object.entries(groups).map(([label, items]) => (
                <div key={label}>
                  <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-100 bg-slate-50/95 px-5 py-2.5 backdrop-blur dark:border-white/[0.055] dark:bg-[#15191e]/95">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      {label}
                    </span>
                    <span className="h-px flex-1 bg-slate-200/70 dark:bg-white/[0.07]" />
                    <span className="text-[10px] tabular-nums text-slate-400">
                      {items.length} events
                    </span>
                  </div>
                  <div>
                    {items.map((item) => (
                      <ActivityRow
                        active={selected?.id === item.id}
                        item={item}
                        key={item.id}
                        onClick={() => setSelected(item)}
                      />
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
        <DetailsPanel activity={selected ?? activities[0] ?? null} />
      </div>
    </DashboardPageShell>
  );
}

function ActivityRow({
  active,
  item,
  onClick,
}: {
  active: boolean;
  item: VirujActivity;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "group grid w-full grid-cols-[32px_minmax(0,1fr)_auto] gap-3 px-5 py-4 text-left transition",
        active
          ? "bg-blue-50/80 dark:bg-blue-500/[0.08]"
          : "hover:bg-slate-50/80 dark:hover:bg-white/[0.025]"
      )}
      onClick={onClick}
      type="button"
    >
      <span
        className={cn(
          "mt-0.5 flex size-8 items-center justify-center rounded-xl border",
          actionTone(item.action)
        )}
      >
        <CircleDot className="size-3.5" />
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <strong className="font-headline text-sm font-semibold text-slate-900 dark:text-slate-100">
            {item.title}
          </strong>
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
            {item.module}
          </span>
        </span>
        <span className="mt-1 block truncate text-xs text-slate-500">
          <b className="font-semibold text-slate-700 dark:text-slate-300">
            {item.actorName}
          </b>
          {" · "}
          {item.display.summary}
        </span>
      </span>
      <span className="pt-0.5 text-[11px] font-medium tabular-nums text-slate-400">
        {formatTime(item.createdAt)}
      </span>
    </button>
  );
}

function DetailsPanel({ activity }: { activity: VirujActivity | null }) {
  if (!activity) {
    return (
      <aside className="hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 xl:block dark:border-white/[0.08] dark:bg-white/[0.02]">
        <p className="text-sm font-semibold text-slate-500">
          Select an event to inspect its context.
        </p>
      </aside>
    );
  }
  const metadata = Object.entries(activity.metadata ?? {});
  return (
    <aside className="rounded-2xl border border-slate-200/90 bg-[#f8fafb] p-5 dark:border-white/[0.08] dark:bg-[#101317]">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "rounded-lg border px-2 py-1 text-[10px] font-bold tracking-[0.12em]",
            actionTone(activity.action)
          )}
        >
          {activity.action}
        </span>
        <span className="text-[10px] font-semibold text-slate-400">
          {formatTime(activity.createdAt)}
        </span>
      </div>
      <h2 className="mt-5 font-headline text-xl font-semibold text-slate-950 dark:text-white">
        {activity.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        {activity.description || activity.display.summary}
      </p>
      <dl className="mt-6 space-y-4 border-t border-slate-200/80 pt-5 dark:border-white/[0.07]">
        <Detail
          label="Actor"
          value={activity.actorName}
          hint={activity.actorRole ?? undefined}
        />
        <Detail
          label="Resource"
          value={activity.display.resource}
          hint={activity.resource}
        />
        <Detail label="Module" value={activity.module} />
        <Detail
          label="Workspace"
          value={activity.workspaceType}
          hint={activity.workspaceId}
        />
      </dl>
      {metadata.length > 0 && (
        <div className="mt-6 border-t border-slate-200/80 pt-5 dark:border-white/[0.07]">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Context metadata
          </p>
          <div className="mt-3 space-y-2">
            {metadata.slice(0, 8).map(([key, value]) => (
              <div
                className="flex items-start justify-between gap-4 text-xs"
                key={key}
              >
                <span className="text-slate-400">{humanize(key)}</span>
                <span className="max-w-[170px] truncate font-mono text-[10px] text-slate-600 dark:text-slate-300">
                  {formatMetadata(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mt-7 break-all font-mono text-[9px] text-slate-300 dark:text-slate-700">
        EVENT {activity.id}
      </p>
    </aside>
  );
}

function Metric({
  icon: Icon,
  label,
  note,
  value,
}: {
  icon: typeof Activity;
  label: string;
  note: string;
  value: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/85 p-4 dark:border-white/[0.08] dark:bg-[#111418]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 font-headline text-3xl font-semibold tabular-nums text-slate-950 dark:text-white">
            {value}
          </p>
        </div>
        <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/[0.06]">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">{note}</p>
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

function Detail({
  hint,
  label,
  value,
}: {
  hint?: string;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
        {humanize(value)}
      </dd>
      {hint && (
        <dd className="mt-0.5 truncate font-mono text-[9px] text-slate-400">
          {hint}
        </dd>
      )}
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

function LoadingTimeline() {
  return (
    <div className="space-y-2 p-5">
      {Array.from({ length: 7 }, (_, index) => (
        <div
          className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.04]"
          key={index}
        />
      ))}
    </div>
  );
}

function actionTone(action: string) {
  if (["DELETE", "REJECT", "CANCEL", "REMOVE"].includes(action))
    return "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300";
  if (["APPROVE", "COMPLETE", "CONFIRM", "PAY", "CREATE"].includes(action))
    return "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300";
  return "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300";
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
function humanize(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function formatMetadata(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value);
}
