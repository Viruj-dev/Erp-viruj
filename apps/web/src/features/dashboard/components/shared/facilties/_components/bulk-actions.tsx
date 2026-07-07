"use client";

import type { VirujFacilityCategory } from "@/lib/viruj-backend";
import { facilityCategories } from "../constants";
import { BulkButton } from "./primitives";
export function BulkActionBar({
  bulkCategory,
  disabled,
  onBulkCategoryChange,
  onRun,
  selectedCount,
}: {
  bulkCategory: VirujFacilityCategory;
  disabled: boolean;
  onBulkCategoryChange: (category: VirujFacilityCategory) => void;
  onRun: (
    action: "activate" | "archive" | "category" | "deactivate" | "delete"
  ) => void;
  selectedCount: number;
}) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-950 p-3 text-white shadow-sm dark:border-white/[0.08]">
      <p className="text-sm font-semi-bold">{selectedCount} selected</p>
      <div className="flex flex-wrap gap-2">
        <BulkButton
          disabled={disabled}
          label="Activate"
          onClick={() => onRun("activate")}
        />
        <BulkButton
          disabled={disabled}
          label="Deactivate"
          onClick={() => onRun("deactivate")}
        />
        <BulkButton
          disabled={disabled}
          label="Archive"
          onClick={() => onRun("archive")}
        />
        <select
          className="h-9 rounded-lg border border-white/15 bg-white/10 px-3 text-xs font-semibold text-white outline-none"
          onChange={(event) =>
            onBulkCategoryChange(event.target.value as VirujFacilityCategory)
          }
          value={bulkCategory}
        >
          {facilityCategories.map((category) => (
            <option className="text-slate-950" key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <BulkButton
          disabled={disabled}
          label="Change Category"
          onClick={() => onRun("category")}
        />
        <BulkButton
          danger
          disabled={disabled}
          label="Delete"
          onClick={() => onRun("delete")}
        />
      </div>
    </section>
  );
}
