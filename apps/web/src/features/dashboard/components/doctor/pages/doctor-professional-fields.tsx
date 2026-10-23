"use client";
import { useState } from "react";
import { ErpSelect } from "@/components/ui/erp/select";
import { Button } from "@/components/ui/button";
import {
  FieldLabel,
  TextField,
  fieldClassName,
} from "../../hospital/pages/onboarding/fields";
import {
  useDoctorQuery,
  type DoctorProfile,
} from "@/features/dashboard/lib/doctor-workspace";
type Department = { id: number; name: string };
const degrees = ["MBBS", "MD", "MS"];
export function validExperienceInput(value: string) {
  return /^\d{0,3}$/.test(value) && (value === "" || Number(value) <= 100);
}
export function DoctorDepartmentSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const query = useDoctorQuery<{ data: Department[] }>(
    "/directory/departments"
  );
  const departments = query.data?.data || [];
  return (
    <div>
      <label>
        <FieldLabel required>Department</FieldLabel>
        <ErpSelect
          required
          className={fieldClassName()}
          value={value}
          disabled={query.isPending}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">
            {query.isPending ? "Loading departments…" : "Select department"}
          </option>
          {value && !departments.some((d) => d.name === value) && (
            <option value={value}>{value}</option>
          )}
          {departments.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </ErpSelect>
      </label>
      {query.isError && (
        <p role="alert" className="mt-2 text-sm">
          Unable to load the department list.{" "}
          <Button
            type="button"
            variant="outline"
            onClick={() => void query.refetch()}
          >
            Retry
          </Button>
        </p>
      )}
    </div>
  );
}
export function DoctorProfessionalFields({
  profile,
  onChange,
}: {
  profile: DoctorProfile;
  onChange: (patch: Partial<DoctorProfile>) => void;
}) {
  const query = useDoctorQuery<{ data: Department[] }>(
    "/directory/departments"
  );
  const departments = query.data?.data || [];
  const [custom, setCustom] = useState(false);
  const isCustom =
    custom ||
    (!!profile.specialization &&
      !departments.some((d) => d.name === profile.specialization));
  return (
    <>
      <div>
        <label>
          <FieldLabel required>Speciality</FieldLabel>
          <ErpSelect
            required
            className={fieldClassName()}
            value={isCustom ? "__custom__" : profile.specialization || ""}
            onChange={(e) => {
              setCustom(e.target.value === "__custom__");
              onChange({
                specialization:
                  e.target.value === "__custom__" ? "" : e.target.value,
              });
            }}
          >
            <option value="">Select speciality</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
            <option value="__custom__">Add your own speciality</option>
          </ErpSelect>
        </label>
        {isCustom && (
          <div className="mt-3">
            <TextField
              required
              label="Your speciality"
              placeholder="Enter your speciality"
              value={profile.specialization || ""}
              onChange={(specialization) => onChange({ specialization })}
            />
          </div>
        )}
      </div>
      <DoctorDepartmentSelect
        value={profile.department || ""}
        onChange={(department) => onChange({ department })}
      />
      <label>
        <FieldLabel required>Qualification / medical degree</FieldLabel>
        <ErpSelect
          required
          className={fieldClassName()}
          value={profile.qualification || ""}
          onChange={(e) => onChange({ qualification: e.target.value })}
        >
          <option value="">Select medical degree</option>
          {profile.qualification &&
            !degrees.includes(profile.qualification) && (
              <option value={profile.qualification}>
                {profile.qualification}
              </option>
            )}
          {degrees.map((degree) => (
            <option key={degree} value={degree}>
              {degree}
            </option>
          ))}
        </ErpSelect>
      </label>
      <label>
        <FieldLabel required>Experience (years)</FieldLabel>
        <input
          required
          className={fieldClassName()}
          type="text"
          inputMode="numeric"
          pattern="[0-9]{1,3}"
          maxLength={3}
          aria-describedby="doctor-experience-help"
          value={profile.yearsOfExperience ?? ""}
          onChange={(e) => {
            if (validExperienceInput(e.target.value))
              onChange({
                yearsOfExperience:
                  e.target.value === "" ? undefined : Number(e.target.value),
              });
          }}
        />
        <p
          id="doctor-experience-help"
          className="mt-2 text-xs text-[var(--onboarding-muted)]"
        >
          Whole years only, from 0 to 100.
        </p>
      </label>
    </>
  );
}
