import { virujBackend } from "@/lib/viruj-backend";
import { BadgeCheck, BedDouble, Building2, Globe2, Hospital, Phone } from "lucide-react";
import { hospitalOwnershipTypes, hospitalTypes } from "../constants";
import { FieldLabel, PreviewRow, SelectField, TextField, UploadField, fieldClassName } from "../fields";
import type { OnboardingState } from "../types";

export function ProfileStep({
  data,
  hospitalId,
  updateProfile,
}: {
  data: OnboardingState;
  hospitalId?: string;
  updateProfile: (key: keyof OnboardingState["profile"], value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Hospital Name"
          onChange={(value) => updateProfile("hospitalName", value)}
          placeholder="Apollo Delhi"
          value={data.profile.hospitalName}
        />
        <SelectField
          label="Organization Category"
          onChange={(value) => updateProfile("hospitalType", value)}
          options={hospitalTypes}
          value={data.profile.hospitalType}
        />
        <SelectField
          label="Hospital Type"
          onChange={(value) => updateProfile("hospitalOwnershipType", value)}
          options={hospitalOwnershipTypes}
          value={data.profile.hospitalOwnershipType}
        />
        <TextField
          label="Number of Beds"
          onChange={(value) => updateProfile("numberOfBeds", value)}
          placeholder="250"
          type="number"
          value={data.profile.numberOfBeds}
        />
        <UploadField
          label="Logo Upload"
          name={data.profile.logoName}
          onChange={async (file) => {
            updateProfile("logoName", file.name);
            updateProfile("logoPreviewUrl", file.previewUrl);

            try {
              const media = await virujBackend.organizationProfile.uploadMedia({
                file: file.file,
                kind: "logo",
                organizationId: hospitalId,
              });
              updateProfile("logoUrl", media.url);
              updateProfile("logoPreviewUrl", media.url);
            } catch (error) {
              console.error("[Onboarding] Logo upload failed", error);
            }
          }}
        />
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
                organizationId: hospitalId,
              });
              updateProfile("coverUrl", media.url);
              updateProfile("coverPreviewUrl", media.url);
            } catch (error) {
              console.error("[Onboarding] Cover upload failed", error);
            }
          }}
        />
        <TextField
          label="Registration Number"
          onChange={(value) => updateProfile("registrationNumber", value)}
          placeholder="DL-HOSP-2026-0091"
          value={data.profile.registrationNumber}
        />
        <TextField
          label="GST Number"
          onChange={(value) => updateProfile("gstNumber", value)}
          placeholder="07AABCV1234F1Z5"
          value={data.profile.gstNumber}
        />
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
        <TextField
          label="Established Year"
          onChange={(value) => updateProfile("establishedYear", value)}
          placeholder="2008"
          value={data.profile.establishedYear}
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
      </section>

      <aside className="sticky top-4 h-fit rounded-[28px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.10)] dark:border-white/[0.10] dark:bg-white/[0.06]">
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white dark:border-white/[0.10] dark:bg-[#10191c]">
          <div className="relative h-36 overflow-hidden bg-[linear-gradient(135deg,#dbeafe,#93c5fd_45%,#062d4f)]">
            {data.profile.coverPreviewUrl || data.profile.coverUrl ? (
              <img
                alt={`${data.profile.hospitalName || "Hospital"} cover`}
                className="absolute inset-0 h-full w-full object-cover"
                src={data.profile.coverPreviewUrl || data.profile.coverUrl}
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-r from-[#062d4f]/10 to-[#062d4f]/35" />
            <div className="absolute bottom-4 left-4 flex size-16 items-center justify-center overflow-hidden rounded-2xl bg-white text-[#062d4f] shadow-xl ring-1 ring-black/5">
              {data.profile.logoPreviewUrl || data.profile.logoUrl ? (
                <img
                  alt={`${data.profile.hospitalName || "Hospital"} logo`}
                  className="h-full w-full object-cover"
                  src={data.profile.logoPreviewUrl || data.profile.logoUrl}
                />
              ) : (
                <Hospital size={28} />
              )}
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-headline text-xl font-semibold">
                  {data.profile.hospitalName || "Your Hospital"}
                </h3>
                <p className="mt-1 text-sm font-semibold text-[#0284c7]">
                  {data.profile.hospitalType} - {data.profile.hospitalOwnershipType}
                </p>
              </div>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
                Preview
              </span>
            </div>
            <p className="mt-4 line-clamp-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              {data.profile.description ||
                "A trusted healthcare institution configured on Viruj for appointments, care departments, department hours, and patient engagement."}
            </p>
            <div className="mt-5 grid gap-3 text-sm">
              <PreviewRow icon={<Phone size={15} />} value={data.profile.phone || "Phone pending"} />
              <PreviewRow icon={<Building2 size={15} />} value={data.profile.hospitalOwnershipType || "Hospital type pending"} />
              <PreviewRow icon={<BedDouble size={15} />} value={data.profile.numberOfBeds ? `${data.profile.numberOfBeds} beds` : "Beds pending"} />
              <PreviewRow icon={<Globe2 size={15} />} value={data.profile.website || "Website pending"} />
              <PreviewRow icon={<BadgeCheck size={15} />} value={data.profile.registrationNumber || "Registration pending"} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

