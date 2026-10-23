"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/erp/checkbox";
import { ErpSelect } from "@/components/ui/erp/select";
import { TimePicker } from "../../hospital/pages/onboarding/time-picker";
import {
  FieldLabel,
  fieldClassName,
} from "../../hospital/pages/onboarding/fields";
import type {
  WorkingHours,
  WorkLocation,
} from "@/features/dashboard/lib/doctor-workspace";

export function DoctorWorkingHoursFields({
  locations,
  value,
  onChange,
}: {
  locations: WorkLocation[];
  value: WorkingHours[];
  onChange: (value: WorkingHours[]) => void;
}) {
  function patch(index: number, change: Partial<WorkingHours>) {
    onChange(
      value.map((row, i) => (i === index ? { ...row, ...change } : row))
    );
  }
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Allocate recurring working hours to the organisations that added you.
        These hours appear with that organisation in the app. Times are in
        Indian Standard Time. Availability does not create appointments or
        calendar events.
      </p>
      {!locations.length && (
        <p className="text-sm">
          Your workplaces will appear when an organisation adds your verified
          registration number and email. You can save general availability now
          and allocate it later.
        </p>
      )}
      {value.map((row, index) => (
        <fieldset key={index} className="space-y-4 rounded-xl border p-4">
          <legend className="px-2 text-sm font-medium">
            Working hours {index + 1}
          </legend>
          <label>
            <FieldLabel required>Organisation</FieldLabel>
            <ErpSelect
              className={fieldClassName()}
              value={row.locationId}
              onChange={(e) => patch(index, { locationId: e.target.value })}
              required={locations.length > 0}
            >
              <option value="">
                {locations.length
                  ? "Select organisation"
                  : "General availability"}
              </option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </ErpSelect>
          </label>
          <div className="flex flex-wrap gap-3">
            {[
              "MONDAY",
              "TUESDAY",
              "WEDNESDAY",
              "THURSDAY",
              "FRIDAY",
              "SATURDAY",
              "SUNDAY",
            ].map((day) => (
              <label key={day} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={row.days.includes(day)}
                  onCheckedChange={(checked) =>
                    patch(index, {
                      days: checked
                        ? [...row.days, day]
                        : row.days.filter((d) => d !== day),
                    })
                  }
                />
                {day.slice(0, 3)}
              </label>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TimePicker
              label="Working from"
              value={row.startTime}
              onChange={(startTime) => patch(index, { startTime })}
              themeClassName="vh-onboarding--doctor"
            />
            <TimePicker
              label="Working until"
              value={row.endTime}
              onChange={(endTime) => patch(index, { endTime })}
              themeClassName="vh-onboarding--doctor"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            Remove hours
          </Button>
        </fieldset>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          onChange([
            ...value,
            {
              locationId: locations[0]?.id || "",
              days: ["MONDAY"],
              startTime: "09:00",
              endTime: "13:00",
            },
          ])
        }
      >
        Add working hours
      </Button>
    </div>
  );
}
