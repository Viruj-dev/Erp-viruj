import { virujBackend } from "@/lib/viruj-backend";
import { ImagePlus, Languages } from "lucide-react";
import { FieldLabel, TextField, UploadField, fieldClassName } from "../fields";
import type { OnboardingState } from "../types";

export function ClinicProfileStep({
  data,
  organizationId,
  updateProfile,
}: {
  data: OnboardingState;
  organizationId?: string;
  updateProfile: (key: keyof OnboardingState["profile"], value: string | string[]) => void;
}) {
  const handlePhotos = (files: FileList | null) => {
    if (!files?.length) return;

    const selectedFiles = Array.from(files).slice(0, 8);
    updateProfile(
      "clinicPhotosNames",
      selectedFiles.map((file) => file.name)
    );
    updateProfile(
      "clinicPhotosPreviewUrls",
      selectedFiles.map((file) => URL.createObjectURL(file))
    );
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <FieldLabel>About Clinic</FieldLabel>
          <textarea
            className={fieldClassName("min-h-32 resize-none py-3")}
            onChange={(event) => updateProfile("description", event.target.value)}
            placeholder="Describe the clinic, specialties, care approach, and patient experience."
            value={data.profile.description}
          />
        </label>
        <TextField
          label="Mission (optional)"
          onChange={(value) => updateProfile("mission", value)}
          placeholder="Accessible, evidence-led care for every family."
          value={data.profile.mission}
        />
        <TextField
          label="Vision (optional)"
          onChange={(value) => updateProfile("vision", value)}
          placeholder="Become the most trusted neighborhood clinic."
          value={data.profile.vision}
        />
        <TextField
          label="Languages Spoken"
          onChange={(value) => updateProfile("languagesSpoken", value)}
          placeholder="English, Hindi, Punjabi"
          value={data.profile.languagesSpoken}
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
                organizationId,
              });
              updateProfile("coverUrl", media.url);
              updateProfile("coverPreviewUrl", media.url);
            } catch {
              updateProfile("coverPreviewUrl", file.previewUrl);
            }
          }}
        />
        <label className="block md:col-span-2">
          <FieldLabel>Clinic Photos</FieldLabel>
          <div className="flex h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border border-[var(--onboarding-border-strong)] bg-[var(--onboarding-panel-muted)] px-3.5 text-sm font-medium text-[var(--onboarding-muted)] shadow-sm transition hover:border-[#c6d7cc] hover:bg-white">
            <span className="truncate">
              {data.profile.clinicPhotosNames.length
                ? `${data.profile.clinicPhotosNames.length} photo${data.profile.clinicPhotosNames.length === 1 ? "" : "s"} selected`
                : "Choose photos"}
            </span>
            <ImagePlus size={17} />
          </div>
          <input
            accept="image/*"
            className="sr-only"
            multiple
            onChange={(event) => handlePhotos(event.target.files)}
            type="file"
          />
        </label>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-white/[0.10] dark:bg-white/[0.055]">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[var(--onboarding-accent-soft)] text-[var(--onboarding-accent)]">
            <Languages size={18} />
          </span>
          <div>
            <h3 className="font-headline text-lg font-semibold text-slate-950 dark:text-white">
              {data.profile.hospitalName || "Clinic profile preview"}
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-300">
              {data.profile.languagesSpoken || "Languages pending"}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
          {data.profile.description || "About Clinic will appear here for patients."}
        </p>
        {data.profile.clinicPhotosPreviewUrls.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {data.profile.clinicPhotosPreviewUrls.map((photoUrl, index) => (
              <img
                alt={`Clinic preview ${index + 1}`}
                className="aspect-[4/3] rounded-2xl object-cover"
                key={photoUrl}
                src={photoUrl}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
