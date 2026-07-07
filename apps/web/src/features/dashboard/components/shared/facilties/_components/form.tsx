"use client";

import { Loader2, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type { VirujFacility, VirujFacilityCategory, VirujFacilityInput, VirujFacilityStatus } from "@/lib/viruj-backend";
import { facilityCategories } from "../constants";
import { slugify, validateFacilityForm } from "../utils";
import { CategoryPill, SelectField, StatusPill, SwitchRow, TextAreaField, TextField } from "./primitives";

export function FacilityForm({
  existingFacilities,
  initialValue,
  isSaving,
  onCancel,
  onSubmit,
  saveError,
  submitLabel,
}: {
  existingFacilities: VirujFacility[];
  initialValue: VirujFacilityInput;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (input: VirujFacilityInput) => void;
  saveError: Error | null;
  submitLabel: string;
}) {
  const [form, setForm] = useState<VirujFacilityInput>(initialValue);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValue.slug));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const validation = validateFacilityForm(form, existingFacilities);
  const canSubmit = validation.length === 0 && !isSaving;

  function updateField<TKey extends keyof VirujFacilityInput>(field: TKey, value: VirujFacilityInput[TKey]) {
    setDirty(true);
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateName(value: string) {
    setDirty(true);
    setForm((current) => ({
      ...current,
      name: value,
      seoTitle: current.seoTitle || value,
      slug: slugTouched ? current.slug : slugify(value),
    }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setDirty(false);
    onSubmit({
      ...form,
      description: form.description || form.shortDescription,
      seoTitle: form.seoTitle || form.name,
      slug: form.slug || slugify(form.name),
    });
  }

  function cancel() {
    if (dirty && !window.confirm("Discard unsaved service changes?")) return;
    onCancel();
  }

  const active = form.status === "active" && form.isAvailable;

  return (
    <form className="mx-auto max-w-4xl" onSubmit={submit}>
      <section className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#111418] lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryPill category={form.category} />
            <StatusPill status={active ? "active" : form.status === "archived" ? "archived" : "draft"} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Service Name *" onChange={updateName} placeholder="MRI Scan" value={form.name} />
            <SelectField label="Category *" onChange={(value) => updateField("category", value as VirujFacilityCategory)} value={form.category}>
              {facilityCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </SelectField>
          </div>

          <TextAreaField
            compact
            label="Description"
            onChange={(value) => {
              updateField("shortDescription", value);
              updateField("description", value);
            }}
            placeholder="Short patient-facing summary. Example: 24x7 ambulance service with trained emergency staff."
            value={form.shortDescription || form.description}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Price Text" onChange={(value) => updateField("priceText", value)} placeholder="Contact Hospital" value={form.priceText} />
            <TextField
              label="Slug"
              onChange={(value) => {
                setSlugTouched(true);
                updateField("slug", slugify(value));
              }}
              placeholder="mri-scan"
              value={form.slug}
            />
          </div>
        </div>

        <aside className="border-t border-slate-200 bg-slate-50 p-5 dark:border-white/[0.08] dark:bg-white/[0.035] lg:border-l lg:border-t-0">
          <div className="space-y-3">
            <SelectField label="Status" onChange={(value) => {
              const nextStatus = value as VirujFacilityStatus;
              updateField("status", nextStatus);
              updateField("isAvailable", nextStatus === "active");
            }} value={form.status}>
              <option value="active">Active</option>
              <option value="draft">Inactive</option>
              <option value="archived">Archived</option>
            </SelectField>
            <SwitchRow checked={form.isFeatured} label="Featured" onChange={(value) => updateField("isFeatured", value)} />
            <SwitchRow checked={form.onlineBooking} label="Online Booking" onChange={(value) => updateField("onlineBooking", value)} />
            <SwitchRow checked={form.emergencyService} label="Emergency" onChange={(value) => updateField("emergencyService", value)} />
            <SwitchRow checked={form.available247} label="24x7" onChange={(value) => updateField("available247", value)} />
          </div>
        </aside>
      </section>

      {validation.length > 0 ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">{validation[0]}</div>
      ) : null}
      {saveError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200">{saveError.message || "Unable to save service."}</div>
      ) : null}

      <div className="mt-5 flex justify-end gap-3">
        <button className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semi-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200" onClick={cancel} type="button">
          Cancel
        </button>
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semi-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950" disabled={!canSubmit} type="submit">
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}