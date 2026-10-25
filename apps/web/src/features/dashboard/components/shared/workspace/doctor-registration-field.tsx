"use client";
import { Input } from "@/components/ui/erp/input";
export type RegistryRecord = {
  id: number;
  name: string;
  registrationNumber: string;
  medicalCouncil: string;
  qualification: string;
  removed: boolean;
};
export function singleRegistryMatch(rows: RegistryRecord[]) {
  const matches = rows.filter((row) => !row.removed);
  return matches.length === 1 ? matches[0] : undefined;
}

export function DoctorRegistrationField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (record: RegistryRecord) => void;
  organizationId: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Registration number
        <Input
          required
          maxLength={100}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Medical council registration number"
        />
      </label>
      <p className="text-xs text-muted-foreground">
        Our team will review your registration details and documents manually.
      </p>
    </div>
  );
}
