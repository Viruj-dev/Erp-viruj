import { virujBackend } from "@/lib/viruj-backend";
import { BadgeCheck, BedDouble, Building2, Globe2, Hospital, Phone } from "lucide-react";
import {
  clinicOwnershipTypes,
  clinicTypes,
  hospitalOwnershipTypes,
  hospitalTypes,
} from "../constants";
import { FieldLabel, PreviewRow, SelectField, TextField, UploadField, fieldClassName } from "../fields";
import type { OnboardingKind, OnboardingState } from "../types";

export function ProfileStep({
  data,
  kind = "hospital",
  organizationId,
  updateProfile,
}: {
  data: OnboardingState;
  kind?: OnboardingKind;
  organizationId?: string;
  updateProfile: (key: keyof OnboardingState["profile"], value: string) => void;
}) {
  const isClinic = kind === "clinic";
  const displayName = data.profile.hospitalName || (isClinic ? "Your Clinic" : "Your Hospital");
  const categoryOptions = isClinic ? clinicTypes : hospitalTypes;
  const ownershipOptions = isClinic ? clinicOwnershipTypes : hospitalOwnershipTypes;

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2">
        <TextField
          label={isClinic ? "Clinic Name" : "Hospital Name"}
          onChange={(value) => updateProfile("hospitalName", value)}
          placeholder={isClinic ? "Viruj Family Clinic" : "Apollo Delhi"}
          value={data.profile.hospitalName}
        />
        {isClinic ? (
          <TextField
            label="Legal Business Name"
            onChange={(value) => updateProfile("legalBusinessName", value)}
            placeholder="Viruj Family Clinic LLP"
            value={data.profile.legalBusinessName}
          />
        ) : null}
        <SelectField
          label={isClinic ? "Clinic Type" : "Organization Category"}
          onChange={(value) => updateProfile("hospitalType", value)}
          options={categoryOptions}
          value={data.profile.hospitalType}
        />
        <SelectField
          label={isClinic ? "Ownership Type" : "Hospital Type"}
          onChange={(value) => updateProfile("hospitalOwnershipType", value)}
          options={ownershipOptions}
          value={data.profile.hospitalOwnershipType}
        />
        {isClinic ? null : (
          <TextField
            label="Number of Beds"
            onChange={(value) => updateProfile("numberOfBeds", value)}
            placeholder="250"
            type="number"
            value={data.profile.numberOfBeds}
          />
        )}
        <UploadField
          label={isClinic ? "Clinic Logo" : "Logo Upload"}
          name={data.profile.logoName}
          onChange={async (file) => {
            updateProfile("logoName", file.name);
            updateProfile("logoPreviewUrl", file.previewUrl);

            try {
              const media = await virujBackend.organizationProfile.uploadMedia({
                file: file.file,
                kind: "logo",
                organizationId,
              });
              updateProfile("logoUrl", media.url);
              updateProfile("logoPreviewUrl", media.url);
            } catch {
              updateProfile("logoPreviewUrl", file.previewUrl);
            }
          }}
        />
        {isClinic ? null : (
          <UploadField
            label="Cover Image"
            name={data.profile.coverName}
            onChange={async (file) => {
              updateProfile("coverName", file.name);
              updateProfile("coverPreviewUrl", file.previewUrl);

              try {
                const media = await virujBackend.organizationProfile.uploadMedia({
                  file: file.file,
                  kind: "cover",
                  organizationId,
                });
                updateProfile("coverUrl", media.url);
                updateProfile("coverPreviewUrl", media.url);
              } catch {
                updateProfile("coverPreviewUrl", file.previewUrl);
              }
            }}
          />
        )}
        <TextField
          label="Registration Number"
          onChange={(value) => updateProfile("registrationNumber", value)}
          placeholder={isClinic ? "CLINIC-REG-2026-091" : "DL-HOSP-2026-0091"}
          value={data.profile.registrationNumber}
        />
        <TextField
          label="Year Established"
          onChange={(value) => updateProfile("establishedYear", value)}
          placeholder="2008"
          value={data.profile.establishedYear}
        />
        <TextField
          label="GST Number (optional)"
          onChange={(value) => updateProfile("gstNumber", value)}
          placeholder="07AABCV1234F1Z5"
          value={data.profile.gstNumber}
        />
        {isClinic ? (
          <TextField
            label="PAN (optional)"
            onChange={(value) => updateProfile("panNumber", value)}
            placeholder="AABCV1234F"
            value={data.profile.panNumber}
          />
        ) : null}
        {isClinic ? null : (
          <>
            <TextField
              label="Email"
              onChange={(value) => updateProfile("email", value)}
              placeholder="admin@hospital.co"
              type="email"
              value={data.profile.email}
            />
            <TextField
              label="Phone"
              onChange={(value) => updateProfile("phone", value)}
              placeholder="+91 98765 43210"
              value={data.profile.phone}
            />
            <TextField
              label="Website"
              onChange={(value) => updateProfile("website", value)}
              placeholder="https://hospital.co"
              value={data.profile.website}
            />
            <label className="md:col-span-2">
              <FieldLabel>Description</FieldLabel>
              <textarea
                className={fieldClassName("min-h-32 resize-none py-3")}
                onChange={(event) => updateProfile("description", event.target.value)}
                placeholder="Describe your care model, specialties, infrastructure, and patient experience."
                value={data.profile.description}
              />
            </label>
          </>
        )}
      </section>

      <aside className="sticky top-4 h-fit rounded-[28px] border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
        <div className="overflow-hidden rounded-[24px] border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)]">
          <div className="relative h-36 overflow-hidden vh-onboarding-gradient">
            {data.profile.coverPreviewUrl || data.profile.coverUrl ? (
              <img
                alt={`${displayName} cover`}
                className="absolute inset-0 h-full w-full object-cover"
                src={data.profile.coverPreviewUrl || data.profile.coverUrl}
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-black/25" />
            <div className="absolute bottom-4 left-4 flex size-16 items-center justify-center overflow-hidden rounded-2xl bg-[var(--onboarding-panel)] text-[var(--onboarding-accent-deep)] shadow-xl ring-1 ring-black/5">
              {data.profile.logoPreviewUrl || data.profile.logoUrl ? (
                <img
                  alt={`${displayName} logo`}
                  className="h-full w-full object-cover"
                  src={data.profile.logoPreviewUrl || data.profile.logoUrl}
                />
              ) : isClinic ? (
                <Building2 size={28} />
              ) : (
                <Hospital size={28} />
              )}
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-headline text-xl font-semibold text-[var(--onboarding-heading)]">
                  {displayName}
                </h3>
                <p className="mt-1 text-sm font-semibold text-[var(--onboarding-accent)]">
                  {data.profile.hospitalType} - {data.profile.hospitalOwnershipType}
                </p>
              </div>
              <span className="rounded-full bg-[var(--onboarding-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--onboarding-accent)]">
                Preview
              </span>
            </div>
            <p className="mt-4 line-clamp-4 text-sm font-medium text-[var(--onboarding-muted)]">
              {data.profile.description ||
                (isClinic
                  ? "A patient-friendly clinic profile configured for discovery, appointments, services, and doctor availability."
                  : "A trusted healthcare institution configured on Viruj for appointments, care departments, department hours, and patient engagement.")}
            </p>
            <div className="mt-5 grid gap-3 text-sm">
              <PreviewRow icon={<Phone size={15} />} value={data.profile.phone || "Phone pending"} />
              <PreviewRow icon={<Building2 size={15} />} value={data.profile.hospitalOwnershipType || "Ownership pending"} />
              {isClinic ? null : (
                <PreviewRow icon={<BedDouble size={15} />} value={data.profile.numberOfBeds ? `${data.profile.numberOfBeds} beds` : "Beds pending"} />
              )}
              <PreviewRow icon={<Globe2 size={15} />} value={data.profile.website || "Website pending"} />
              <PreviewRow icon={<BadgeCheck size={15} />} value={data.profile.registrationNumber || "Registration pending"} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
