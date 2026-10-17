import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Check, Search, Stethoscope, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { virujBackend } from "@/lib/viruj-backend";
import { FieldLabel, TextField, fieldClassName } from "../fields";
import { TimePicker } from "../time-picker";
import type { OnboardingKind, OnboardingState } from "../types";

type CatalogDepartment = { id: number; name: string; description?: string };
export function DepartmentsStep({
  data,
  setData,
  kind = "hospital",
  organizationId,
}: {
  data: OnboardingState;
  setData: Dispatch<SetStateAction<OnboardingState>>;
  kind?: OnboardingKind;
  organizationId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [catalog, setCatalog] = useState<CatalogDepartment[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    virujBackend.directory
      .departments(organizationId)
      .then((result) => {
        if (active) setCatalog(result.data);
      })
      .catch(() => {
        if (active)
          setError("Could not load the department directory. Please retry.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [organizationId, retry]);
  const update = (
    name: string,
    patch: Partial<OnboardingState["departments"][number]>
  ) =>
    setData((current) => ({
      ...current,
      departments: current.departments.map((d) =>
        d.name === name ? { ...d, ...patch } : d
      ),
    }));
  const applySelection = () => {
    setData((current) => ({
      ...current,
      disabledDepartments: [],
      departments: selected.map(
        (name) =>
          current.departments.find((d) => d.name === name) ?? {
            name,
            description:
              catalog.find((d) => d.name === name)?.description || "",
            head: "",
            openTime: "09:00",
            closeTime: "18:00",
          }
      ),
      doctors: current.doctors.map((d) =>
        selected.includes(d.department) ? d : { ...d, department: "" }
      ),
    }));
    setOpen(false);
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-5">
        <div>
          <FieldLabel required>Departments / Specialties</FieldLabel>
          <p className="text-sm text-[var(--onboarding-muted)]">
            Select at least one from the mobile app’s department directory.
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            if (next) {
              setSelected(data.departments.map((d) => d.name));
              setQuery("");
            }
            setOpen(next);
          }}
        >
          <DialogTrigger asChild>
            <button
              type="button"
              className="rounded-lg bg-[var(--onboarding-accent-deep)] px-4 py-3 text-sm font-semibold text-white"
            >
              Choose departments
            </button>
          </DialogTrigger>
          <DialogContent
            className={`vh-onboarding ${kind === "clinic" ? "vh-onboarding--clinic" : ""} bg-[var(--onboarding-panel)] text-[var(--onboarding-text)] sm:max-w-2xl`}
          >
            <DialogTitle>Choose departments & specialties</DialogTitle>
            <DialogDescription>
              {catalog.length} departments from the Viruj mobile directory ·{" "}
              {selected.length} selected
            </DialogDescription>
            <label className="relative">
              <span className="sr-only">Search departments</span>
              <Search
                className="absolute left-3 top-3 text-[var(--onboarding-muted)]"
                size={18}
              />
              <input
                className={fieldClassName("pl-10")}
                placeholder="Search departments…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="max-h-[50vh] overflow-y-auto">
              {loading ? (
                <p role="status" className="p-6 text-center">
                  Loading departments…
                </p>
              ) : error ? (
                <div role="alert" className="p-5 text-center">
                  <p>{error}</p>
                  <button
                    type="button"
                    className="mt-3 underline"
                    onClick={() => setRetry((n) => n + 1)}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {catalog
                    .filter((d) =>
                      d.name.toLowerCase().includes(query.toLowerCase())
                    )
                    .map((d) => (
                      <label
                        key={d.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${selected.includes(d.name) ? "border-[var(--onboarding-accent)] bg-[var(--onboarding-accent-soft)]" : "border-[var(--onboarding-border)]"}`}
                      >
                        <input
                          type="checkbox"
                          className="size-4 accent-[var(--onboarding-accent)]"
                          checked={selected.includes(d.name)}
                          onChange={(e) =>
                            setSelected((current) =>
                              e.target.checked
                                ? [...current, d.name]
                                : current.filter((name) => name !== d.name)
                            )
                          }
                        />
                        {d.name}
                      </label>
                    ))}
                </div>
              )}
              {!loading &&
                !error &&
                !catalog.some((d) =>
                  d.name.toLowerCase().includes(query.toLowerCase())
                ) && <p className="p-6 text-center">No departments found.</p>}
            </div>
            <button
              type="button"
              disabled={loading || !!error || !selected.length}
              onClick={applySelection}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--onboarding-accent-deep)] font-semibold text-white disabled:opacity-50"
            >
              <Check size={16} />
              Use {selected.length} selected departments
            </button>
          </DialogContent>
        </Dialog>
      </div>
      {data.departments.map((department) => (
        <section
          key={department.name}
          className="space-y-4 rounded-2xl border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-semibold">
              <Stethoscope
                size={18}
                className="text-[var(--onboarding-accent)]"
              />
              {department.name}
            </h3>
            <button
              type="button"
              aria-label={`Remove ${department.name}`}
              className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
              onClick={() =>
                setData((current) => ({
                  ...current,
                  departments: current.departments.filter(
                    (d) => d.name !== department.name
                  ),
                  doctors: current.doctors.map((d) =>
                    d.department === department.name
                      ? { ...d, department: "" }
                      : d
                  ),
                }))
              }
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TimePicker
              label="Opening"
              value={department.openTime}
              onChange={(value) => update(department.name, { openTime: value })}
            />
            <TimePicker
              label="Closing"
              value={department.closeTime}
              onChange={(value) =>
                update(department.name, { closeTime: value })
              }
            />
          </div>
          <TextField
            label="Description"
            value={department.description}
            placeholder="Care offered by this department"
            onChange={(value) =>
              update(department.name, { description: value })
            }
          />
        </section>
      ))}
      {!data.departments.length && (
        <p className="rounded-2xl border border-dashed border-[var(--onboarding-border)] p-10 text-center text-[var(--onboarding-muted)]">
          Your selected departments will appear here. Doctors can be assigned to
          these departments in the next step.
        </p>
      )}
    </div>
  );
}
