import { useState, type Dispatch, type SetStateAction } from "react";
import { Check, Search, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/erp/dialog";
import { Button } from "@/components/ui/button";
import { hospitalServiceGroups } from "../constants";
import { fieldClassName } from "../fields";
import { toggleServiceSelection } from "../state";
import type { OnboardingState } from "../types";

export function ServicesStep({
  data,
  setData,
}: {
  data: OnboardingState;
  setData: Dispatch<SetStateAction<OnboardingState>>;
}) {
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const groups = hospitalServiceGroups
    .map((group) => ({
      ...group,
      services: group.services.filter((name) =>
        `${group.name} ${name}`.toLowerCase().includes(search)
      ),
    }))
    .filter((group) => group.services.length);
  const toggle = (name: string, category: string) =>
    setData((current) => ({
      ...current,
      services: toggleServiceSelection(current.services, name, category),
    }));
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-5">
        <div>
          <h3 className="font-semibold">Hospital services</h3>
          <p className="mt-1 text-sm text-[var(--onboarding-muted)]">
            Choose what your hospital offers. {data.services.length} selected.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              className="h-11 bg-[var(--onboarding-accent-deep)] px-4 text-white"
            >
              Choose services
            </Button>
          </DialogTrigger>
          <DialogContent className="vh-onboarding max-h-[90svh] gap-4 overflow-hidden bg-[var(--onboarding-panel)] text-[var(--onboarding-text)] sm:max-w-3xl">
            <DialogTitle>Choose hospital services</DialogTitle>
            <DialogDescription>
              Click a service to add or remove it. {data.services.length}{" "}
              selected.
            </DialogDescription>
            <label className="relative">
              <span className="sr-only">Search services</span>
              <Search
                size={18}
                className="absolute left-3 top-3 text-[var(--onboarding-muted)]"
                aria-hidden="true"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={fieldClassName("pl-10")}
                placeholder="Search services or categories…"
              />
            </label>
            <div className="max-h-[55svh] space-y-6 overflow-y-auto pr-1">
              {groups.map((group) => (
                <section key={group.name} className="space-y-3">
                  <h3 className="text-sm font-semibold">{group.name}</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.services.map((name) => {
                      const selected = data.services.some(
                        (service) => service.name === name
                      );
                      return (
                        <label
                          key={name}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${selected ? "border-[var(--onboarding-accent)] bg-[var(--onboarding-accent-soft)]" : "border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] hover:border-[var(--onboarding-accent)]"}`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggle(name, group.name)}
                            className="mt-0.5 size-4 shrink-0 accent-[var(--onboarding-accent)]"
                          />
                          {name}
                        </label>
                      );
                    })}
                  </div>
                </section>
              ))}
              {!groups.length && (
                <p className="p-6 text-center text-sm text-[var(--onboarding-muted)]">
                  No services found.
                </p>
              )}
            </div>
            <DialogClose asChild>
              <Button
                type="button"
                className="h-11 bg-[var(--onboarding-accent-deep)] text-white"
              >
                <Check size={16} aria-hidden="true" />
                Done · {data.services.length} selected
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
      {!data.services.length && (
        <p className="rounded-2xl border border-dashed border-[var(--onboarding-border)] p-8 text-center text-sm text-[var(--onboarding-muted)]">
          Select the services available at your hospital to get started.
        </p>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {data.services.map((service) => (
          <div
            key={service.id}
            className="flex items-center gap-3 rounded-xl border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-4"
          >
            <Check
              size={18}
              className="shrink-0 text-[var(--onboarding-accent)]"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold">{service.name}</h3>
              <p className="mt-1 text-xs text-[var(--onboarding-muted)]">
                {service.category}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove ${service.name}`}
              onClick={() => toggle(service.name, service.category)}
            >
              <Trash2 size={16} aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
