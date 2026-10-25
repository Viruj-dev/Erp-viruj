"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DoctorProfileForm } from "./doctor-onboarding";
import {
  DoctorPageShell,
  HospitalPanel,
  StatusBadge,
} from "../_components/doctor-shared-ui";
import {
  useDoctorQuery,
  useDoctorTenant,
} from "@/features/dashboard/lib/doctor-workspace";
import { doctorWorkspaceRequest } from "@/lib/viruj-backend";
export function DoctorCredentialsPage() {
  const q = useDoctorQuery<{
    status: string;
    documents: { id: string; name?: string; type: string }[];
  }>("/doctor/verification");
  const tenant = useDoctorTenant();
  const [edit, setEdit] = useState(false);
  const [error, setError] = useState("");
  if (edit) return <DoctorProfileForm />;
  async function view(id: string) {
    setError("");
    try {
      const result = await doctorWorkspaceRequest<{ url: string }>(
        `/doctor/license/${encodeURIComponent(id)}`,
        tenant.organizationId
      );
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to open document");
    }
  }
  return (
    <DoctorPageShell
      eyebrow="Credentials"
      title="Verification and documents"
      subtitle="Your private registration certificates and review status."
      actions={
        <Button onClick={() => setEdit(true)}>
          Upload / update credentials
        </Button>
      }
    >
      {q.isPending && <p>Loading credentials…</p>}
      {q.isError && (
        <p role="alert">
          Unable to load credentials.{" "}
          <Button onClick={() => void q.refetch()}>Retry</Button>
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      <HospitalPanel title="Credential review">
        <StatusBadge status={q.data?.status || "NOT_SUBMITTED"} />
        <p className="mt-3 text-sm text-muted-foreground">
          Our team reviews your registration details, identity and certificates
          manually.
        </p>
      </HospitalPanel>
      <div className="grid gap-4 md:grid-cols-2">
        {q.data?.documents.map((d) => (
          <HospitalPanel
            key={d.id}
            title={d.name || d.type.replaceAll("_", " ")}
          >
            <Button variant="outline" onClick={() => void view(d.id)}>
              View private document
            </Button>
          </HospitalPanel>
        ))}
      </div>
      {q.data?.documents.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No credentials uploaded yet.
        </p>
      )}
    </DoctorPageShell>
  );
}
