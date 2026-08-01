import { Clock3, Edit3, Plus, Stethoscope, Trash2 } from "lucide-react";
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
      <div className="rounded-[18px] border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-3 shadow-sm">
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
              className={fieldClassName("h-9 text-xs")}
              onChange={(event) => setCustomDepartmentDescription(event.target.value)}
              placeholder="Short care-unit description"
              value={customDepartmentDescription}
            />
          </label>
          <label>
            <FieldLabel>Opening</FieldLabel>
            <input
              className={fieldClassName("h-9 text-xs")}
              onChange={(event) => setNewOpenTime(event.target.value)}
              type="time"
              value={newOpenTime}
            />
          </label>
          <label>
            <FieldLabel>Closing</FieldLabel>
            <input
              className={fieldClassName("h-9 text-xs")}
              onChange={(event) => setNewCloseTime(event.target.value)}
              type="time"
              value={newCloseTime}
            />
          </label>
          <button
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg vh-onboarding-gradient px-3 text-xs font-bold text-white shadow-[0_12px_24px_var(--onboarding-accent-shadow)] transition hover:-translate-y-0.5"
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
                        head: "",
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

      <div className="overflow-hidden rounded-[18px] border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] shadow-sm">
        {data.departments.length ? (
          <div className="divide-y divide-[var(--onboarding-border)]">
            {data.departments.map((department) => (
              <div
                className="grid gap-3 px-3 py-2.5 transition hover:bg-[var(--onboarding-panel-soft)] lg:grid-cols-[minmax(0,1fr)_250px_150px] lg:items-center"
                key={department.name}
              >
                <div className="flex min-w-0 gap-2.5">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--onboarding-accent-soft)] text-[var(--onboarding-accent)]">
                    <Stethoscope size={15} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-headline text-sm font-semibold text-[var(--onboarding-heading)]">
                        {department.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--onboarding-accent-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--onboarding-accent)]">
                        <Clock3 size={11} />
                        {department.openTime} - {department.closeTime}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs font-medium leading-5 text-[var(--onboarding-muted)]">
                      {department.description || "No description added yet."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label>
                    <FieldLabel>Opening</FieldLabel>
                    <input
                      className={fieldClassName("h-9 text-xs")}
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
                      className={fieldClassName("h-9 text-xs")}
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

                <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                  <button
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] px-2.5 text-[11px] font-bold text-[var(--onboarding-muted-strong)] transition hover:bg-[var(--onboarding-panel-soft)]"
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
                    <Edit3 size={13} />
                    Edit
                  </button>
                  <button
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-rose-300/25 bg-rose-500/10 px-2.5 text-[11px] font-bold text-rose-500 transition hover:bg-rose-500/15 dark:text-rose-300"
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
                    <Trash2 size={13} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-[var(--onboarding-accent-soft)] text-[var(--onboarding-accent)]">
              <Stethoscope size={22} />
            </div>
            <h3 className="mt-4 font-headline text-base font-semibold text-[var(--onboarding-heading)]">
              No departments added yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-[var(--onboarding-muted)]">
              Add departments with their individual operating hours. Each care unit can have its own schedule.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}