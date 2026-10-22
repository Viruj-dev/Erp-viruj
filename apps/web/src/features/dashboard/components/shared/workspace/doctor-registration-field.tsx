"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/erp/input";
import { doctorWorkspaceRequest } from "@/lib/viruj-backend";
export type RegistryRecord = {
  id: number;
  name: string;
  registrationNumber: string;
  medicalCouncil: string;
  qualification: string;
  removed: boolean;
};
export function DoctorRegistrationField({
  value,
  onChange,
  onSelect,
  organizationId,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (record: RegistryRecord) => void;
  organizationId: string;
}) {
  const [results, setResults] = useState<{
    number: string;
    rows: RegistryRecord[];
  }>();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function lookup() {
    setPending(true);
    setError("");
    setResults(undefined);
    try {
      const rows = await doctorWorkspaceRequest<RegistryRecord[]>(
        `/doctors/registry?registrationNumber=${encodeURIComponent(value.trim())}`,
        organizationId
      );
      setResults({ number: value, rows });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registry lookup failed");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Registration number
        <Input
          required
          maxLength={100}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setResults(undefined);
          }}
          placeholder="Medical council registration number"
        />
      </label>
      <Button
        type="button"
        variant="outline"
        disabled={pending || !value.trim()}
        onClick={() => void lookup()}
      >
        {pending ? "Checking NMC..." : "Check NMC register"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {results?.number === value && (
        <div aria-live="polite" className="space-y-2 text-sm">
          {!results.rows.length && (
            <p>No exact registration found. Check the number and council.</p>
          )}
          {results.rows.map((row) => (
            <div className="rounded-lg border p-3" key={row.id}>
              <p className="font-medium">{row.name}</p>
              <p>
                {row.medicalCouncil} · {row.qualification}
              </p>
              {row.removed ? (
                <p className="text-destructive">
                  Removed from register · cannot use
                </p>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onSelect?.(row)}
                >
                  Use these details
                </Button>
              )}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            A registry match confirms a listed record. Identity and certificate
            approval are reviewed separately.
          </p>
        </div>
      )}
    </div>
  );
}
