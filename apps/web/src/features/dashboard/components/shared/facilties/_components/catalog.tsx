"use client";

import { AlertTriangle, CalendarCheck, CheckCircle2, Edit3, FileText, Plus, Search, Star, Trash2, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { VirujFacility } from "@/lib/viruj-backend";
import { facilityCategories } from "../constants";
import type { FacilityAction, FilterState, SortKey } from "../types";
import { formatPrice } from "../utils";
import { Badge, CategoryPill, Select, StatusPill } from "./primitives";

type CatalogTone = "blue" | "violet";

export function Toolbar({
  filters,
  onFilterChange,
  onQueryChange,
  onSortChange,
  query,
  sortKey,
  tone = "blue",
}: {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onQueryChange: (value: string) => void;
  onSortChange: (value: SortKey) => void;
  query: string;
  sortKey: SortKey;
  tone?: CatalogTone;
}) {
  const inputClass =
    tone === "violet"
      ? "h-11 w-full rounded-xl border border-violet-200 bg-violet-50/70 pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-300 focus:bg-white dark:border-violet-400/20 dark:bg-violet-400/[0.08] dark:text-slate-100"
      : "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-slate-100";
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/[0.08] dark:bg-[#111418]">
      <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_170px_145px_165px]">
        <label className="relative block">
          <span className="sr-only">Search services</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            className={inputClass}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search services"
            value={query}
          />
        </label>
        <Select label="Category" onChange={(value) => onFilterChange({ ...filters, category: value as FilterState["category"] })} value={filters.category}>
          <option value="all">All categories</option>
          {facilityCategories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </Select>
        <Select label="Status" onChange={(value) => onFilterChange({ ...filters, status: value as FilterState["status"] })} value={filters.status}>
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="draft">Inactive</option>
          <option value="archived">Archived</option>
        </Select>
        <Select label="Sort" onChange={(value) => onSortChange(value as SortKey)} value={sortKey}>
          <option value="updated">Recently updated</option>
          <option value="newest">Newest</option>
          <option value="alphabetical">Alphabetical</option>
          <option value="featured">Featured first</option>
        </Select>
      </div>
    </section>
  );
}

export function FacilityBentoCard({
  facility,
  isUpdating,
  onActivate,
  onDeactivate,
  onDelete,
  onEdit,
  onPublish,
  permissions,
  tone = "blue",
}: {
  checked?: boolean;
  facility: VirujFacility;
  index?: number;
  isArchiving?: boolean;
  isDuplicating?: boolean;
  isUpdating?: boolean;
  onActivate: () => void;
  onArchive?: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onEdit: () => void;
  onPublish: () => void;
  onSelect?: (checked: boolean) => void;
  onView?: () => void;
  permissions: Record<FacilityAction, boolean>;
  tone?: CatalogTone;
}) {
  const active = facility.status === "active" && facility.isAvailable;
  const published = active && facility.visibility === "public";
  const iconClass =
    tone === "violet"
      ? "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-200"
      : "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/[0.07] dark:text-slate-200";

  return (
    <article className="flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-white/[0.08] dark:bg-[#15181d]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className={iconClass}>
            <FileText size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-headline text-lg font-semi-bold text-slate-950 dark:text-slate-100">{facility.name}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <CategoryPill category={facility.category} />
              <StatusPill status={active ? "active" : facility.status === "archived" ? "archived" : "draft"} />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
        {facility.shortDescription || facility.description || "No description added."}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {facility.isFeatured ? <Badge icon={<Star size={12} />} label="Featured" /> : null}
        {facility.available247 ? <Badge icon={<Zap size={12} />} label="24x7" /> : null}
        {facility.onlineBooking ? <Badge icon={<CalendarCheck size={12} />} label="Online" /> : null}
        {facility.emergencyService ? <Badge icon={<AlertTriangle size={12} />} label="Emergency" tone="danger" /> : null}
      </div>

      <div className="mt-auto pt-5">
        <div className="flex items-end justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Price</p>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">{formatPrice(facility)}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {permissions.update ? <CardButton icon={<Edit3 size={14} />} label="Edit" onClick={onEdit} /> : null}
            {permissions.publish && !active ? <CardButton disabled={isUpdating} label="Activate" onClick={onActivate} tone="success" /> : null}
            {permissions.update && active ? <CardButton disabled={isUpdating} label="Deactivate" onClick={onDeactivate} /> : null}
            {permissions.delete ? <CardButton icon={<Trash2 size={14} />} label="Delete" onClick={onDelete} tone="danger" /> : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function CardButton({
  disabled,
  icon,
  label,
  onClick,
  tone,
}: {
  disabled?: boolean;
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  tone?: "danger" | "success";
}) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semi-bold transition disabled:cursor-not-allowed disabled:opacity-50",
        tone === "danger" && "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-400/10 dark:text-red-200",
        tone === "success" && "bg-emerald-600 text-white hover:bg-emerald-700",
        !tone && "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/[0.07] dark:text-slate-200 dark:hover:bg-white/[0.12]"
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

export function StatCard({ icon, label, tone = "blue", value }: { icon: ReactNode; label: string; tone?: CatalogTone; value: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#111418]">
      <div className="flex items-center justify-between gap-3">
        <span className={tone === "violet" ? "flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-200" : "flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.07] dark:text-slate-200"}>{icon}</span>
        <p className="font-headline text-2xl font-semi-bold text-slate-950 dark:text-slate-100">{value}</p>
      </div>
      <p className="mt-3 text-[10px] font-semi-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-500">{label}</p>
    </section>
  );
}

export function EmptyFacilities({ onCreate, permissions, tone = "blue" }: { onCreate: () => void; permissions: Record<FacilityAction, boolean>; tone?: CatalogTone }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
      <div className={tone === "violet" ? "flex size-20 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 text-violet-800 shadow-sm dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200" : "flex size-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-100"}>
        <FileText size={30} />
      </div>
      <h3 className="mt-5 font-headline text-2xl font-semi-bold text-slate-950 dark:text-slate-100">No services have been added yet.</h3>
      <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">Add a service card such as MRI Scan, ICU, Ambulance, Pharmacy, or Health Checkup.</p>
      {permissions.create ? (
        <button className={tone === "violet" ? "mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 text-sm font-semi-bold text-white hover:bg-violet-800 dark:bg-violet-500 dark:hover:bg-violet-400" : "mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semi-bold text-white dark:bg-white dark:text-slate-950"} onClick={onCreate} type="button">
          <Plus size={16} />
          Add Service
        </button>
      ) : null}
    </div>
  );
}

export function FacilitySkeletonGrid() {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.06]" key={index} />
      ))}
    </div>
  );
}