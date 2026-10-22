"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/erp/input";
import { Textarea } from "@/components/ui/erp/textarea";
import { ErpSelect } from "@/components/ui/erp/select";
import { DoctorRegistrationField } from "../../shared/workspace/doctor-registration-field";
import {
  DoctorPageShell,
  HospitalPanel,
} from "../_components/doctor-shared-ui";
import {
  useDoctorQuery,
  useDoctorSave,
  useDoctorTenant,
  type DoctorProfile,
} from "@/features/dashboard/lib/doctor-workspace";
import { virujBackend } from "@/lib/viruj-backend";
const fields = [
  ["fullName", "Full name", "text"],
  ["dateOfBirth", "Date of birth", "date"],
  ["phone", "Phone number", "tel"],
  ["email", "Email", "email"],
  ["department", "Department", "text"],
  ["specialization", "Speciality", "text"],
  ["medicalCouncil", "Medical council", "text"],
  ["qualification", "Qualification", "text"],
  ["yearsOfExperience", "Experience (years)", "number"],
  ["consultationFee", "Consultation fee (INR)", "number"],
  ["consultationDurationMinutes", "Consultation duration (minutes)", "number"],
] as const;
export function DoctorProfileForm() {
  const q = useDoctorQuery<DoctorProfile>("/doctor/profile");
  if (q.isPending) return <p className="p-6">Loading your profile…</p>;
  if (q.isError)
    return (
      <p role="alert" className="p-6">
        Unable to load profile.{" "}
        <Button onClick={() => void q.refetch()}>Retry</Button>
      </p>
    );
  return <ProfileForm key={q.data.id} initial={q.data} />;
}
function ProfileForm({ initial }: { initial: DoctorProfile }) {
  const [profile, setProfile] = useState({
    ...initial,
    fullName: initial.fullName === "Individual Doctor" ? "" : initial.fullName,
  });
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const save = useDoctorSave();
  const tenant = useDoctorTenant();
  const verification = useDoctorQuery<{
    status: string;
    documents: { id: string; type: string; fileUrl: string }[];
  }>("/doctor/verification");
  const dob = profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined;
  const now = new Date();
  const age = dob
    ? now.getFullYear() -
      dob.getFullYear() -
      (now.getMonth() < dob.getMonth() ||
      (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())
        ? 1
        : 0)
    : undefined;
  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      await virujBackend.doctorDocuments.upload(file, tenant.organizationId);
      await verification.refetch();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }
  return (
    <DoctorPageShell
      eyebrow="Profile"
      title="Doctor profile"
      subtitle="Your professional details, credentials and consultation preferences."
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(false);
          save.mutate(
            { path: "/doctor/profile", body: profile, method: "PATCH" },
            { onSuccess: () => setSaved(true) }
          );
        }}
      >
        <HospitalPanel title="Personal and professional information">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {fields.map(([key, label, type]) => (
              <label key={key} className="space-y-2 text-sm font-medium">
                {label}
                <Input
                  required
                  type={type}
                  min={
                    type === "number"
                      ? key === "consultationDurationMinutes"
                        ? 5
                        : 0
                      : undefined
                  }
                  max={
                    type === "date"
                      ? now.toLocaleDateString("en-CA")
                      : key === "consultationDurationMinutes"
                        ? 240
                        : key === "yearsOfExperience"
                          ? 100
                          : undefined
                  }
                  step={key === "consultationFee" ? "0.01" : undefined}
                  value={
                    key === "dateOfBirth"
                      ? profile.dateOfBirth?.slice(0, 10) || ""
                      : (profile[key] ?? "")
                  }
                  onChange={(e) => {
                    setSaved(false);
                    setProfile((p) => ({
                      ...p,
                      [key]:
                        type === "number"
                          ? e.target.value === ""
                            ? undefined
                            : Number(e.target.value)
                          : e.target.value,
                    }));
                  }}
                />
                {key === "dateOfBirth" && age !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    Age: {age} years
                  </span>
                )}
              </label>
            ))}
            <label className="text-sm font-medium">
              Gender
              <ErpSelect
                required
                value={profile.gender || ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, gender: e.target.value }))
                }
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="unspecified">Prefer not to say</option>
              </ErpSelect>
            </label>
            <label className="text-sm font-medium">
              Languages (comma separated)
              <Input
                required
                value={profile.languages.join(",")}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    languages: e.target.value.split(","),
                  }))
                }
              />
            </label>
          </div>
        </HospitalPanel>
        <HospitalPanel title="Registration">
          <DoctorRegistrationField
            value={profile.medicalRegistrationNumber || ""}
            organizationId={tenant.organizationId}
            onChange={(v) =>
              setProfile((p) => ({ ...p, medicalRegistrationNumber: v }))
            }
            onSelect={(r) => {
              setProfile((p) => ({
                ...p,
                fullName: r.name,
                medicalRegistrationNumber: r.registrationNumber,
                medicalCouncil: r.medicalCouncil,
                qualification: r.qualification,
              }));
              setSaved(false);
            }}
          />
        </HospitalPanel>
        <HospitalPanel title="About your practice">
          <Textarea
            aria-label="Professional biography"
            value={profile.bio || ""}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
          />
        </HospitalPanel>
        <HospitalPanel
          title="License / registration certificate"
          subtitle="Private credential review. PDF, JPG or PNG, up to 5 MB."
        >
          <Input
            aria-label="Upload medical license"
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            disabled={uploading}
            onChange={(e) => void upload(e.target.files?.[0])}
          />
          {uploading && <p role="status">Uploading…</p>}
          {uploadError && (
            <p role="alert" className="text-destructive">
              {uploadError}
            </p>
          )}
          <p className="mt-3 text-sm">
            {verification.data?.documents.length || 0} document(s) uploaded ·{" "}
            {verification.data?.status || "Not submitted"}
          </p>
          <Button
            className="mt-3"
            type="button"
            variant="outline"
            disabled={!verification.data?.documents.length || save.isPending}
            onClick={() => save.mutate({ path: "/doctor/verification/submit" })}
          >
            Submit credentials for review
          </Button>
        </HospitalPanel>
        {save.isError && (
          <p role="alert" className="text-destructive">
            {save.error.message}
          </p>
        )}
        {saved && (
          <p role="status">
            Profile saved. Continue with your work locations and availability.
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button disabled={save.isPending || uploading} type="submit">
            {save.isPending ? "Saving…" : "Save profile"}
          </Button>
          <Button variant="outline" asChild>
            <Link href={tenant.buildRoute("locations")}>Work locations</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={tenant.buildRoute("availability")}>
              Set availability
            </Link>
          </Button>
        </div>
      </form>
    </DoctorPageShell>
  );
}
