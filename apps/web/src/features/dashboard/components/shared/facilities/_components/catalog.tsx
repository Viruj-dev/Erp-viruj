"use client";

import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Edit3,
  FileText,
  Plus,
  Search,
  Star,
  Trash2,
  Zap,
} from "lucide-react";
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
      ? "h-11 w-full rounded-xl border border-violet-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-300 focus:bg-white dark:border-violet-400/20 dark:bg-violet-400/[0.08] dark:text-slate-100"
      : "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-slate-100";
  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-3 dark:border-white/[0.08] dark:bg-[#111418]">
      <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_170px_145px_165px]">
        <label className="relative block">
          <span className="sr-only">Search services</span>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />
          <input
            className={inputClass}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search services"
            value={query}
          />
        </label>
        <Select
          label="Category"
          onChange={(value) =>
            onFilterChange({
              ...filters,
              category: value as FilterState["category"],
            })
          }
          value={filters.category}
        >
          <option value="all">All categories</option>
          {facilityCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          onChange={(value) =>
            onFilterChange({
              ...filters,
              status: value as FilterState["status"],
            })
          }
          value={filters.status}
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="draft">Inactive</option>
          <option value="archived">Archived</option>
        </Select>
        <Select
          label="Sort"
          onChange={(value) => onSortChange(value as SortKey)}
          value={sortKey}
        >
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
    <article className="flex min-h-64 flex-col rounded-2xl border border-slate-200/70 bg-white p-5 transition hover:border-slate-300 hover:shadow-md dark:border-white/[0.08] dark:bg-[#15181d]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className={iconClass}>
            <FileText size={21} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-headline text-lg font-semi-bold text-slate-950 dark:text-slate-100">
              {facility.name}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <CategoryPill category={facility.category} />
              <StatusPill
                status={
                  active
                    ? "active"
                    : facility.status === "archived"
                      ? "archived"
                      : "draft"
                }
              />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
        {facility.shortDescription ||
          facility.description ||
          "No description added."}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {facility.isFeatured ? (
          <Badge icon={<Star size={12} />} label="Featured" />
        ) : null}
        {facility.available247 ? (
          <Badge icon={<Zap size={12} />} label="24x7" />
        ) : null}
        {facility.onlineBooking ? (
          <Badge icon={<CalendarCheck size={12} />} label="Online" />
        ) : null}
        {facility.emergencyService ? (
          <Badge
            icon={<AlertTriangle size={12} />}
            label="Emergency"
            tone="danger"
          />
        ) : null}
      </div>

      <div className="mt-auto pt-5">
        <div className="flex items-end justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Price
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
              {formatPrice(facility)}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {permissions.update ? (
              <CardButton
                icon={<Edit3 size={14} />}
                label="Edit"
                onClick={onEdit}
              />
            ) : null}
            {permissions.publish && !active ? (
              <CardButton
                disabled={isUpdating}
                label="Activate"
                onClick={onActivate}
                tone="success"
              />
            ) : null}
            {permissions.update && active ? (
              <CardButton
                disabled={isUpdating}
                label="Deactivate"
                onClick={onDeactivate}
              />
            ) : null}
            {permissions.delete ? (
              <CardButton
                icon={<Trash2 size={14} />}
                label="Delete"
                onClick={onDelete}
                tone="danger"
              />
            ) : null}
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
        tone === "danger" &&
          "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-400/10 dark:text-red-200",
        tone === "success" && "bg-emerald-600 text-white hover:bg-emerald-700",
        !tone &&
          "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/[0.07] dark:text-slate-200 dark:hover:bg-white/[0.12]"
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

export function StatCard({
  icon,
  label,
  tone = "blue",
  value,
}: {
  icon: ReactNode;
  label: string;
  tone?: CatalogTone;
  value: string;
}) {
  const notes: Record<string, string> = {
    "Total Services": "Your complete catalog",
    Active: "Currently active",
    Featured: "Highlighted for discovery",
    "24x7": "Available around the clock",
  };
  return (
    <section className="rounded-[22px] border border-slate-200/60 bg-white p-5 dark:border-white/[0.08] dark:bg-[#111418]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-2xl",
            tone === "violet"
              ? "bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-300"
              : "bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300"
          )}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-2 text-[11px] text-slate-400">
        {notes[label] ?? "In your workspace"}
      </p>
    </section>
  );
}

export function EmptyFacilities({
  onCreate,
  permissions,
  tone = "blue",
  catalogKind = "services",
}: {
  onCreate: () => void;
  permissions: Record<FacilityAction, boolean>;
  tone?: CatalogTone;
  catalogKind?: "services" | "facilities";
}) {
  const singular = catalogKind === "services" ? "service" : "facility";
  const accent =
    tone === "violet"
      ? "bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-300"
      : "bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300";
  return (
    <div className="grid items-center gap-10 p-6 sm:p-9 lg:grid-cols-[1.2fr_1fr] lg:p-10">
      <div>
        <div
          className={cn(
            "mb-6 flex size-14 items-center justify-center rounded-2xl",
            accent
          )}
        >
          <FileText size={25} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Start your catalog
        </p>
        <h3 className="mt-2 max-w-md text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Help patients discover what you offer.
        </h3>
        <p className="mt-3 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
          Add your first {singular} with a clear description, pricing, and
          availability. Review the details before making it visible to patients.
        </p>
        {permissions.create ? (
          <button
            className={cn(
              "mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-xs font-semibold text-white transition",
              tone === "violet"
                ? "bg-violet-700 hover:bg-violet-800 dark:bg-violet-600"
                : "bg-blue-600 hover:bg-blue-700"
            )}
            onClick={onCreate}
            type="button"
          >
            <Plus size={16} />
            Add your first {singular}
          </button>
        ) : (
          <p className="mt-5 text-xs text-slate-500">
            Ask your workspace administrator to add the first {singular}.
          </p>
        )}
      </div>
      <ol className="space-y-6 rounded-3xl border border-slate-100 bg-slate-50/70 p-6 dark:border-white/5 dark:bg-white/[0.025]">
        {[
          [
            "Add the essentials",
            "Give patients a clear name, category, and description.",
          ],
          [
            "Set the details",
            "Add pricing, availability, and booking preferences.",
          ],
          ["Review and publish", "Make your offering visible when it’s ready."],
        ].map(([title, description], index) => (
          <li key={title} className="flex gap-4">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                accent
              )}
            >
              {index + 1}
            </span>
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {title}
              </h4>
              <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function FacilitySkeletonGrid() {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.06]"
          key={index}
        />
      ))}
    </div>
  );
}
