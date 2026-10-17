"use client";
import { virujBackend } from "@/lib/viruj-backend";
import {
  UploadField,
  SelectField,
} from "../../hospital/pages/onboarding/fields";
import { DoctorAvatar } from "./doctor-avatar";
export function DoctorPhotoField({
  name,
  imageUrl,
  gender,
  organizationId,
  tone = "clinic",
  onChange,
}: {
  name: string;
  imageUrl?: string;
  gender?: string;
  organizationId?: string;
  tone?: string;
  onChange: (patch: { imageUrl?: string; gender?: string }) => void;
}) {
  return (
    <div
      className={`vh-onboarding ${tone === "clinic" ? "vh-onboarding--clinic" : ""} col-span-full grid items-center gap-4 rounded-2xl border border-[var(--onboarding-border)] bg-[var(--onboarding-panel-soft)] p-4 sm:grid-cols-[80px_1fr_1fr]`}
    >
      <DoctorAvatar
        name={name || "Doctor"}
        imageUrl={imageUrl}
        gender={gender}
        tone={tone}
        className="size-20"
      />
      <div>
        <UploadField
          label="Doctor photo"
          name={imageUrl ? "Photo uploaded" : ""}
          onChange={async ({ file, previewUrl }) => {
            try {
              const result = await virujBackend.organizationProfile.uploadMedia(
                { file, kind: "doctor", organizationId }
              );
              onChange({ imageUrl: result.url });
            } finally {
              URL.revokeObjectURL(previewUrl);
            }
          }}
        />
        {imageUrl && (
          <button
            type="button"
            className="mt-2 text-xs text-[var(--onboarding-accent)] underline"
            onClick={() => onChange({ imageUrl: "" })}
          >
            Remove photo
          </button>
        )}
      </div>
      <SelectField
        label="Gender"
        value={
          gender === "male"
            ? "Male"
            : gender === "female"
              ? "Female"
              : gender === "other"
                ? "Other"
                : "Not specified"
        }
        options={["Not specified", "Male", "Female", "Other"]}
        onChange={(value) =>
          onChange({
            gender:
              value === "Not specified" ? "unspecified" : value.toLowerCase(),
          })
        }
      />
      <p className="text-xs text-[var(--onboarding-muted)] sm:col-span-3">
        Photo is optional. A matching doctor avatar appears when no photo is
        provided; unspecified gender uses a neutral avatar.
      </p>
    </div>
  );
}
