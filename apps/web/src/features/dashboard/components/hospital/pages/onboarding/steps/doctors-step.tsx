import { Plus, Trash2, UserPlus } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { FieldLabel, TextField, fieldClassName } from "../fields";
import type { OnboardingDoctor, OnboardingState } from "../types";

const emptyDoctor = (): OnboardingDoctor => ({
  availability: "Mon-Sat, 10:00 - 16:00",
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
        doctor.id === id ? { ...doctor, ...patch } : doctor
      ),
    }));
  };

  return (
    <div className="space-y-4">
      <button
        className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--onboarding-accent-deep)] px-4 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(7,89,133,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--onboarding-accent-mid)]"
        onClick={() =>
          setData((current) => ({ ...current, doctors: [...current.doctors, emptyDoctor()] }))
        }
        type="button"
      >
        <Plus size={16} />
        Add Doctor
      </button>

      {data.doctors.length ? (
        <div className="space-y-4">
          {data.doctors.map((doctor, index) => (
            <section
              className="rounded-[24px] border border-slate-200/80 bg-white/78 p-4 shadow-sm dark:border-white/[0.10] dark:bg-white/[0.055]"
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
                    <h3 className="font-headline text-lg font-semibold text-slate-950 dark:text-white">
                      {doctor.name || "Doctor details"}
                    </h3>
                  </div>
                </div>
                <button
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                  onClick={() =>
                    setData((current) => ({
                      ...current,
                      doctors: current.doctors.filter((item) => item.id !== doctor.id),
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
                  label="Existing Doctors"
                  onChange={(value) => updateDoctor(doctor.id, { name: value })}
                  placeholder="Dr. Asha Mehta"
                  value={doctor.name}
                />
                <TextField
                  label="Invite Doctor"
                  onChange={(value) => updateDoctor(doctor.id, { inviteEmail: value })}
                  placeholder="doctor@clinic.co"
                  type="email"
                  value={doctor.inviteEmail}
                />
                <label>
                  <FieldLabel>Assign Department</FieldLabel>
                  <select
                    className={fieldClassName("appearance-none")}
                    onChange={(event) => updateDoctor(doctor.id, { department: event.target.value })}
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
                  label="Consultation Fee"
                  onChange={(value) => updateDoctor(doctor.id, { consultationFee: value })}
                  placeholder="800"
                  value={doctor.consultationFee}
                />
                <TextField
                  label="Experience"
                  onChange={(value) => updateDoctor(doctor.id, { experience: value })}
                  placeholder="12 years"
                  value={doctor.experience}
                />
                <TextField
                  label="Availability"
                  onChange={(value) => updateDoctor(doctor.id, { availability: value })}
                  placeholder="Mon-Sat, 10:00 - 16:00"
                  value={doctor.availability}
                />
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/70 px-5 py-12 text-center shadow-sm">
          <UserPlus className="mx-auto text-[var(--onboarding-accent)]" size={28} />
          <h3 className="mt-3 font-headline text-lg font-semibold text-slate-950">
            Add or invite your first doctor
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
            Basic doctor details are enough for onboarding. You can complete full doctor profiles later.
          </p>
        </div>
      )}
    </div>
  );
}
