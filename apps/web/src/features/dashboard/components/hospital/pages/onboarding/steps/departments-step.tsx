import { cn } from "@/lib/utils";
import { CheckCircle2, Clock3, Edit3, Plus, Stethoscope, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { FieldLabel, TextField, fieldClassName } from "../fields";
import type { Department, OnboardingState } from "../types";

const defaultDepartmentHours = {
  closeTime: "18:00",
  openTime: "09:00",
};

export function DepartmentsStep({
  customDepartment,
  customDepartmentDescription,
  data,
  setCustomDepartment,
  setCustomDepartmentDescription,
  setData,
}: {
  customDepartment: string;
  customDepartmentDescription: string;
  data: OnboardingState;
  setCustomDepartment: (value: string) => void;
  setCustomDepartmentDescription: (value: string) => void;
  setData: Dispatch<SetStateAction<OnboardingState>>;
}) {
  const [newOpenTime, setNewOpenTime] = useState(defaultDepartmentHours.openTime);
  const [newCloseTime, setNewCloseTime] = useState(defaultDepartmentHours.closeTime);

  const toggleDepartment = (departmentName: string) => {
    setData((current) => {
      const disabled = current.disabledDepartments.includes(departmentName)
        ? current.disabledDepartments.filter((item) => item !== departmentName)
        : [...current.disabledDepartments, departmentName];
      return { ...current, disabledDepartments: disabled };
    });
  };

  const updateDepartment = (
    departmentName: string,
    patch: Partial<Department>
  ) => {
    setData((current) => ({
      ...current,
      departments: current.departments.map((department) =>
        department.name === departmentName ? { ...department, ...patch } : department
      ),
    }));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-slate-200/80 bg-white/70 p-4 shadow-sm dark:border-white/[0.10] dark:bg-white/[0.055]">
        <div className="grid gap-3 xl:grid-cols-[minmax(150px,0.9fr)_minmax(220px,1.2fr)_120px_120px_190px] xl:items-end">
          <TextField
            label="Department Name"
            onChange={setCustomDepartment}
            placeholder="Pain Management"
            value={customDepartment}
          />
          <label>
            <FieldLabel>Department Description</FieldLabel>
            <input
              className={fieldClassName()}
              onChange={(event) => setCustomDepartmentDescription(event.target.value)}
              placeholder="Short care-unit description"
              value={customDepartmentDescription}
            />
          </label>
          <label>
            <FieldLabel>Opening</FieldLabel>
            <input
              className={fieldClassName()}
              onChange={(event) => setNewOpenTime(event.target.value)}
              type="time"
              value={newOpenTime}
            />
          </label>
          <label>
            <FieldLabel>Closing</FieldLabel>
            <input
              className={fieldClassName()}
              onChange={(event) => setNewCloseTime(event.target.value)}
              type="time"
              value={newCloseTime}
            />
          </label>
          <button
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#062d4f,#075985_58%,#22d3ee)] px-4 text-sm font-bold text-white shadow-[0_14px_30px_rgba(7,89,133,0.22)] transition hover:-translate-y-0.5"
            onClick={() => {
              const name = customDepartment.trim();
              const description = customDepartmentDescription.trim();
              if (!name) return;
              setData((current) => ({
                ...current,
                departments: current.departments.some(
                  (department) => department.name.toLowerCase() === name.toLowerCase()
                )
                  ? current.departments.map((department) =>
                      department.name.toLowerCase() === name.toLowerCase()
                        ? {
                            ...department,
                            closeTime: newCloseTime,
                            description,
                            openTime: newOpenTime,
                          }
                        : department
                    )
                  : [
                      ...current.departments,
                      {
                        closeTime: newCloseTime,
                        description,
                        name,
                        openTime: newOpenTime,
                      },
                    ],
              }));
              setCustomDepartment("");
              setCustomDepartmentDescription("");
              setNewOpenTime(defaultDepartmentHours.openTime);
              setNewCloseTime(defaultDepartmentHours.closeTime);
            }}
            type="button"
          >
            <Plus size={17} />
            Add Department
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/76 shadow-sm dark:border-white/[0.10] dark:bg-white/[0.055]">
        {data.departments.length ? (
          <div className="divide-y divide-slate-200/80 dark:divide-white/[0.08]">
            {data.departments.map((department) => {
              const enabled = !data.disabledDepartments.includes(department.name);
              return (
                <div
                  className={cn(
                    "grid gap-4 p-4 transition lg:grid-cols-[minmax(0,1fr)_310px] lg:items-center",
                    enabled
                      ? "bg-white/70 dark:bg-cyan-400/[0.05]"
                      : "bg-slate-50/70 opacity-70 dark:bg-white/[0.03]"
                  )}
                  key={department.name}
                >
                  <div className="flex min-w-0 gap-3">
                    <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#e0f2fe] text-[#0284c7] dark:bg-cyan-400/10 dark:text-cyan-300">
                      <Stethoscope size={18} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-headline text-base font-semibold text-slate-950 dark:text-white">
                          {department.name}
                        </h3>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-bold",
                            enabled
                              ? "bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300"
                              : "bg-slate-100 text-slate-500 dark:bg-white/[0.08] dark:text-slate-300"
                          )}
                        >
                          {enabled ? "Enabled" : "Disabled"}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#e0f2fe] px-2.5 py-1 text-[11px] font-bold text-[#0284c7] dark:bg-cyan-400/10 dark:text-cyan-200">
                          <Clock3 size={12} />
                          {department.openTime} - {department.closeTime}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">
                        {department.description || "No description added yet."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-[#e2e3dd] bg-white/80 p-3 dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <div className="grid grid-cols-2 gap-2">
                      <label>
                        <FieldLabel>Opening</FieldLabel>
                        <input
                          className={fieldClassName()}
                          onChange={(event) =>
                            updateDepartment(department.name, {
                              openTime: event.target.value,
                            })
                          }
                          type="time"
                          value={department.openTime}
                        />
                      </label>
                      <label>
                        <FieldLabel>Closing</FieldLabel>
                        <input
                          className={fieldClassName()}
                          onChange={(event) =>
                            updateDepartment(department.name, {
                              closeTime: event.target.value,
                            })
                          }
                          type="time"
                          value={department.closeTime}
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/[0.10] dark:bg-white/[0.08] dark:text-slate-200"
                        onClick={() => toggleDepartment(department.name)}
                        type="button"
                      >
                        <CheckCircle2 size={14} />
                        {enabled ? "Disable" : "Enable"}
                      </button>
                      <button
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/[0.10] dark:bg-white/[0.08] dark:text-slate-200"
                        onClick={() => {
                          const nextName = window.prompt("Edit department name", department.name);
                          if (!nextName?.trim()) return;
                          const nextDescription = window.prompt(
                            "Edit department description",
                            department.description
                          );
                          const trimmedName = nextName.trim();
                          setData((current) => ({
                            ...current,
                            departments: current.departments.map((item) =>
                              item.name === department.name
                                ? {
                                    ...item,
                                    description: nextDescription?.trim() ?? item.description,
                                    name: trimmedName,
                                  }
                                : item
                            ),
                            disabledDepartments: current.disabledDepartments.map((item) =>
                              item === department.name ? trimmedName : item
                            ),
                          }));
                        }}
                        type="button"
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-300"
                        onClick={() =>
                          setData((current) => ({
                            ...current,
                            departments: current.departments.filter(
                              (item) => item.name !== department.name
                            ),
                            disabledDepartments: current.disabledDepartments.filter(
                              (item) => item !== department.name
                            ),
                          }))
                        }
                        type="button"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#e0f2fe] text-[#0284c7] dark:bg-cyan-400/10 dark:text-cyan-300">
              <Stethoscope size={22} />
            </div>
            <h3 className="mt-4 font-headline text-lg font-semibold text-slate-950 dark:text-white">
              No departments added yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">
              Add departments with their individual operating hours. Each care unit can have its own schedule.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}