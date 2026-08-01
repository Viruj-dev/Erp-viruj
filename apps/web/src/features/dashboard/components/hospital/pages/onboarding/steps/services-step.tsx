import { cn } from "@/lib/utils";
import { Check, Plus, Trash2, Wrench } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { clinicServiceCategories, clinicServiceNames } from "../constants";
import { FieldLabel, TextField, fieldClassName } from "../fields";
import type { OnboardingService, OnboardingState } from "../types";

const emptyService = (): OnboardingService => ({
  availableOnline: true,
  category: "Consultation",
  description: "",
  duration: "30 min",
  id: crypto.randomUUID(),
  name: "",
  price: "",
});

export function ServicesStep({
  data,
  setData,
}: {
  data: OnboardingState;
  setData: Dispatch<SetStateAction<OnboardingState>>;
}) {
  const addService = (name = "") => {
    setData((current) => ({
      ...current,
      services: [...current.services, { ...emptyService(), name }],
    }));
  };

  const updateService = (id: string, patch: Partial<OnboardingService>) => {
    setData((current) => ({
      ...current,
      services: current.services.map((service) =>
        service.id === id ? { ...service, ...patch } : service
      ),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--onboarding-accent-deep)] px-4 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(7,89,133,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--onboarding-accent-mid)]"
          onClick={() => addService()}
          type="button"
        >
          <Plus size={16} />
          Add Service
        </button>
        {clinicServiceNames.map((name) => (
          <button
            className="h-9 rounded-full border border-[var(--onboarding-border-strong)] bg-[var(--onboarding-accent-soft)] px-3 text-xs font-bold text-[var(--onboarding-accent)] transition hover:bg-[var(--onboarding-panel)]"
            key={name}
            onClick={() => addService(name)}
            type="button"
          >
            {name}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {data.services.map((service) => (
          <section
            className="rounded-[24px] border border-slate-200/80 bg-white/78 p-4 shadow-sm dark:border-white/[0.10] dark:bg-white/[0.055]"
            key={service.id}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--onboarding-accent-soft)] text-[var(--onboarding-accent)]">
                  <Wrench size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-headline text-lg font-semibold text-slate-950 dark:text-white">
                    {service.name || "Service details"}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {service.category || "Category pending"}
                  </p>
                </div>
              </div>
              <button
                className="inline-flex h-9 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                onClick={() =>
                  setData((current) => ({
                    ...current,
                    services: current.services.filter((item) => item.id !== service.id),
                  }))
                }
                type="button"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_180px_140px_140px]">
              <TextField
                label="Name"
                onChange={(value) => updateService(service.id, { name: value })}
                placeholder="General Consultation"
                value={service.name}
              />
              <label>
                <FieldLabel>Category</FieldLabel>
                <select
                  className={fieldClassName("appearance-none")}
                  onChange={(event) => updateService(service.id, { category: event.target.value })}
                  value={service.category}
                >
                  {clinicServiceCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <TextField
                label="Price"
                onChange={(value) => updateService(service.id, { price: value })}
                placeholder="500"
                value={service.price}
              />
              <TextField
                label="Duration"
                onChange={(value) => updateService(service.id, { duration: value })}
                placeholder="30 min"
                value={service.duration}
              />
              <label className="md:col-span-2 xl:col-span-3">
                <FieldLabel>Description</FieldLabel>
                <input
                  className={fieldClassName()}
                  onChange={(event) => updateService(service.id, { description: event.target.value })}
                  placeholder="Short description shown to patients"
                  value={service.description}
                />
              </label>
              <button
                className={cn(
                  "inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition",
                  service.availableOnline
                    ? "border-[var(--onboarding-border-strong)] bg-[var(--onboarding-accent-soft)] text-[var(--onboarding-accent)]"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                )}
                onClick={() => updateService(service.id, { availableOnline: !service.availableOnline })}
                type="button"
              >
                <Check size={15} />
                {service.availableOnline ? "Available Online" : "Offline Only"}
              </button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

