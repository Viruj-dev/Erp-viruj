import { Plus, Trash2, UserPlus } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { weekDays } from "../constants";
import { TimePicker, formatTime } from "../time-picker";
import { FieldLabel, TextField, fieldClassName } from "../fields";
import type { OnboardingDoctor, OnboardingState } from "../types";

const emptyDoctor = (): OnboardingDoctor => ({
  availability: "",
  registrationNumber: "",
  availabilityDays: [],
  availableFrom: "",
  availableTo: "",
  consultationFee: "",
  department: "",
  experience: "",
  id: crypto.randomUUID(),
  inviteEmail: "",
  name: "",
});

export function DoctorsStep({
  data,
  setData,
}: {
  data: OnboardingState;
  setData: Dispatch<SetStateAction<OnboardingState>>;
}) {
  const enabledDepartments = data.departments.filter(
    (department) => !data.disabledDepartments.includes(department.name)
  );
  const updateDoctor = (id: string, patch: Partial<OnboardingDoctor>) => {
    setData((current) => ({
      ...current,
      doctors: current.doctors.map((doctor) =>
        doctor.id === id ? withAvailability({ ...doctor, ...patch }) : doctor
      ),
    }));
  };

  return (
    <div className="space-y-4">
      <button
        className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--onboarding-accent-deep)] px-4 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(7,89,133,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--onboarding-accent-mid)]"
        onClick={() =>
          setData((current) => ({
            ...current,
            doctors: [...current.doctors, emptyDoctor()],
          }))
        }
        type="button"
      >
        <Plus size={16} />
        Add Doctor
      </button>

      <p className="text-sm text-[var(--onboarding-muted)]">
        At least one doctor is required to start your clinic. Select their
        department and weekly availability below.
      </p>
      {data.doctors.length ? (
        <div className="space-y-4">
          {data.doctors.map((doctor, index) => (
            <section
              className="rounded-[24px] border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-4 shadow-sm dark:border-white/[0.10] dark:bg-white/[0.055]"
              key={doctor.id}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-[var(--onboarding-accent-soft)] text-[var(--onboarding-accent)]">
                    <UserPlus size={18} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--onboarding-accent)]">
                      Doctor {index + 1}
                    </p>
                    <h3 className="font-headline text-lg font-semibold text-[var(--onboarding-heading)] dark:text-white">
                      {doctor.name || "Doctor details"}
                    </h3>
                  </div>
                </div>
                <button
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                  onClick={() =>
                    setData((current) => ({
                      ...current,
                      doctors: current.doctors.filter(
                        (item) => item.id !== doctor.id
                      ),
                    }))
                  }
                  type="button"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <TextField
                  required
                  label="Doctor Name"
                  onChange={(value) => updateDoctor(doctor.id, { name: value })}
                  placeholder="Dr. Asha Mehta"
                  value={doctor.name}
                />
                <TextField
                  required
                  label="Registration Number"
                  placeholder="Medical council registration number"
                  value={doctor.registrationNumber}
                  onChange={(value) =>
                    updateDoctor(doctor.id, { registrationNumber: value })
                  }
                />
                <TextField
                  label="Doctor Email"
                  onChange={(value) =>
                    updateDoctor(doctor.id, { inviteEmail: value })
                  }
                  placeholder="doctor@clinic.co"
                  type="email"
                  value={doctor.inviteEmail}
                />
                <label>
                  <FieldLabel required>Assign Department</FieldLabel>
                  <select
                    required
                    className={fieldClassName("appearance-none")}
                    onChange={(event) =>
                      updateDoctor(doctor.id, {
                        department: event.target.value,
                      })
                    }
                    value={doctor.department}
                  >
                    <option value="">Select department</option>
                    {enabledDepartments.map((department) => (
                      <option key={department.name} value={department.name}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </label>
                <TextField
                  required
                  type="number"
                  min={0}
                  step={0.01}
                  label="Consultation Fee (₹)"
                  onChange={(value) =>
                    updateDoctor(doctor.id, { consultationFee: value })
                  }
                  placeholder="800"
                  value={doctor.consultationFee}
                />
                <TextField
                  required
                  type="number"
                  min={0}
                  max={80}
                  step={1}
                  label="Experience (years)"
                  onChange={(value) =>
                    updateDoctor(doctor.id, { experience: value })
                  }
                  placeholder="12"
                  value={doctor.experience}
                />
                <fieldset className="rounded-xl bg-[var(--onboarding-panel-soft)] p-4 md:col-span-2 xl:col-span-3">
                  <legend className="sr-only">
                    Doctor availability in Indian Standard Time
                  </legend>
                  <FieldLabel required>Available days · IST</FieldLabel>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {weekDays.map((day) => (
                      <label
                        key={day}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs ${doctor.availabilityDays.includes(day) ? "border-[var(--onboarding-accent)] bg-[var(--onboarding-accent-soft)]" : "border-[var(--onboarding-border)]"}`}
                      >
                        <input
                          type="checkbox"
                          className="accent-[var(--onboarding-accent)]"
                          checked={doctor.availabilityDays.includes(day)}
                          onChange={(event) =>
                            updateDoctor(doctor.id, {
                              availabilityDays: event.target.checked
                                ? [...doctor.availabilityDays, day]
                                : doctor.availabilityDays.filter(
                                    (d) => d !== day
                                  ),
                            })
                          }
                        />
                        {day.slice(0, 3)}
                      </label>
                    ))}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TimePicker
                      label="Available from"
                      value={doctor.availableFrom}
                      onChange={(value) =>
                        updateDoctor(doctor.id, { availableFrom: value })
                      }
                    />
                    <TimePicker
                      label="Available until"
                      value={doctor.availableTo}
                      onChange={(value) =>
                        updateDoctor(doctor.id, { availableTo: value })
                      }
                    />
                  </div>
                </fieldset>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] px-5 py-12 text-center shadow-sm">
          <UserPlus
            className="mx-auto text-[var(--onboarding-accent)]"
            size={28}
          />
          <h3 className="mt-3 font-headline text-lg font-semibold text-[var(--onboarding-heading)]">
            Add your first doctor
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
            Basic doctor details are enough for onboarding. You can complete
            full doctor profiles later.
          </p>
        </div>
      )}
    </div>
  );
}

function withAvailability(doctor: OnboardingDoctor): OnboardingDoctor {
  return {
    ...doctor,
    availability: `${doctor.availabilityDays.map((day) => day.slice(0, 3)).join(", ")} · ${formatTime(doctor.availableFrom)} – ${formatTime(doctor.availableTo)} IST`,
  };
}
