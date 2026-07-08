import { cn } from "@/lib/utils";
import {
  BellRing,
  Building2,
  CalendarCheck2,
  Check,
  Eye,
  Hospital,
  MessageCircle,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { publicOptions } from "../constants";
import type { OnboardingState } from "../types";

const publicProfileSections = [
  {
    description: "Decide whether the hospital can be discovered by patients.",
    items: [
      ["showHospitalProfile", "Show Hospital Profile", Eye],
      ["displayDepartments", "Display Departments", Stethoscope],
    ],
    title: "Marketplace visibility",
  },
  {
    description: "Enable actions patients can take from the Viruj app.",
    items: [
      ["acceptOnlineAppointments", "Accept Online Appointments", CalendarCheck2],
      ["enableEmergencyContact", "Enable Emergency Contact", BellRing],
    ],
    title: "Patient actions",
  },
  {
    description: "Community and trust features for the public listing.",
    items: [
      ["allowReviews", "Allow Reviews", MessageCircle],
      ["enableCommunity", "Enable Community", Users],
    ],
    title: "Trust & community",
  },
] as const;

export function PublicProfileStep({
  data,
  setData,
}: {
  data: OnboardingState;
  setData: Dispatch<SetStateAction<OnboardingState>>;
}) {
  const enabledDepartments = data.departments.filter(
    (department) => !data.disabledDepartments.includes(department.name)
  );
  const enabledCount = publicOptions.filter(([key]) => data.publicProfile[key]).length;
  const previewFeatures = [
    data.publicProfile.acceptOnlineAppointments && "Book appointment",
    data.publicProfile.displayDepartments && `${enabledDepartments.length} departments`,
    data.publicProfile.allowReviews && "Patient reviews",
    data.publicProfile.enableCommunity && "Community updates",
    data.publicProfile.enableEmergencyContact && "Emergency contact",
  ].filter(Boolean);

  const toggleOption = (key: keyof OnboardingState["publicProfile"]) => {
    setData((current) => ({
      ...current,
      publicProfile: {
        ...current.publicProfile,
        [key]: !current.publicProfile[key],
      },
    }));
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px] xl:items-start">
      <section className="overflow-hidden rounded-[28px] border border-[#d7ddd4] bg-[#f7f7f3] shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="border-b border-dashed border-[#d9dad3] bg-[linear-gradient(135deg,#ffffff,#eef5ef)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0284c7]">
                Patient platform
              </p>
              <h3 className="mt-1 text-xl font-semibold text-[#171916]">
                Publish controls
              </h3>
              <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-[#6f746c]">
                Choose exactly what patients can see and do from the Viruj mobile app. These settings can be changed later from hospital settings.
              </p>
            </div>
            <div className="rounded-2xl border border-[#d7dfd6] bg-white px-4 py-3 text-right shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7b7c73]">
                Enabled
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#062d4f]">
                {enabledCount}/{publicOptions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-4">
          {publicProfileSections.map((section) => (
            <div
              className="rounded-[22px] border border-[#dedfd8] bg-white/80 p-3 shadow-sm"
              key={section.title}
            >
              <div className="mb-3 flex items-start justify-between gap-3 px-1">
                <div>
                  <h4 className="text-sm font-bold text-[#171916]">
                    {section.title}
                  </h4>
                  <p className="mt-1 text-xs font-medium leading-5 text-[#77786f]">
                    {section.description}
                  </p>
                </div>
                <ShieldCheck className="mt-0.5 text-[#0284c7]" size={17} />
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {section.items.map(([key, label, Icon]) => {
                  const enabled = data.publicProfile[key];
                  return (
                    <button
                      className={cn(
                        "group flex min-h-16 items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-left transition",
                        enabled
                          ? "border-[#bae6fd] bg-[#e0f2fe] text-[#062d4f] shadow-[inset_3px_0_0_#0284c7]"
                          : "border-[#e0e1da] bg-[#f6f6f1] text-[#65675f] hover:border-[#bae6fd] hover:bg-white"
                      )}
                      key={key}
                      onClick={() => toggleOption(key)}
                      type="button"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-xl transition",
                            enabled
                              ? "bg-[#0284c7] text-white"
                              : "bg-[#e9ebe4] text-[#7b7c73] group-hover:bg-[#e0f2fe] group-hover:text-[#0284c7]"
                          )}
                        >
                          <Icon size={17} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold">
                            {label}
                          </span>
                          <span className="mt-0.5 block text-[11px] font-semibold text-[#7b7c73]">
                            {enabled ? "Visible in patient app" : "Hidden for now"}
                          </span>
                        </span>
                      </span>
                      <span
                        className={cn(
                          "relative h-6 w-11 shrink-0 rounded-full transition",
                          enabled ? "bg-[#0284c7]" : "bg-[#d9dad3]"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 flex size-4 items-center justify-center rounded-full bg-white text-[9px] transition",
                            enabled ? "left-6 text-[#0284c7]" : "left-1 text-[#8a8b82]"
                          )}
                        >
                          {enabled ? <Check size={11} /> : <X size={10} />}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="xl:sticky xl:top-5">
        <div className="h-[560px] rounded-[34px] border border-[#0f2a3d] bg-[#071827] p-3 shadow-[0_30px_90px_rgba(7,89,133,0.25)]">
          <div className="flex h-full flex-col overflow-hidden rounded-[27px] bg-[#f7f8f3] text-[#101411]">
            <div className="flex items-center justify-between border-b border-[#e3e4dc] px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0284c7]">
                Live preview
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-bold",
                  data.publicProfile.showHospitalProfile
                    ? "bg-[#e0f2fe] text-[#0284c7]"
                    : "bg-[#f2e8dc] text-[#875d2a]"
                )}
              >
                {data.publicProfile.showHospitalProfile ? "Public" : "Private"}
              </span>
            </div>

            <div className="relative h-32 shrink-0 overflow-hidden bg-[linear-gradient(135deg,#dbeafe,#93c5fd_48%,#062d4f)]">
              {data.profile.coverPreviewUrl || data.profile.coverUrl ? (
                <img
                  alt={`${data.profile.hospitalName || "Hospital"} cover`}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={data.profile.coverPreviewUrl || data.profile.coverUrl}
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-[#062d4f]/45 to-transparent" />
              <div className="absolute bottom-4 left-4 flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-white text-[#062d4f] shadow-xl ring-1 ring-black/5">
                {data.profile.logoPreviewUrl || data.profile.logoUrl ? (
                  <img
                    alt={`${data.profile.hospitalName || "Hospital"} logo`}
                    className="h-full w-full object-cover"
                    src={data.profile.logoPreviewUrl || data.profile.logoUrl}
                  />
                ) : (
                  <Hospital size={25} />
                )}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-2xl font-semibold tracking-tight">
                    {data.publicProfile.showHospitalProfile
                      ? data.profile.hospitalName || "Hospital Preview"
                      : "Profile hidden"}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-[#0284c7]">
                    {data.profile.hospitalType}
                  </p>
                </div>
                <Building2 className="shrink-0 text-[#0284c7]" size={21} />
              </div>

              <p className="mt-3 line-clamp-3 text-xs font-medium leading-5 text-[#6f746c]">
                {data.publicProfile.showHospitalProfile
                  ? data.profile.description || "Patients will see your hospital profile, enabled services, care units, and contact options here."
                  : "Turn on hospital profile visibility when you are ready to publish this listing."}
              </p>

              <div className="mt-4 grid max-h-[150px] gap-2 overflow-y-auto pr-1">
                {previewFeatures.length ? (
                  previewFeatures.map((item) => (
                    <div
                      className="flex items-center justify-between rounded-2xl border border-[#e0e1da] bg-white px-3 py-2 text-xs font-bold shadow-sm"
                      key={String(item)}
                    >
                      <span>{item}</span>
                      <Check className="text-[#0284c7]" size={13} />
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#d8d9d2] bg-[#f1f1eb] px-3 py-5 text-center text-xs font-bold text-[#77786f]">
                    Enable public options to preview patient-facing features.
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 border-t border-[#e3e4dc] p-4">
              <button
                className={cn(
                  "h-11 w-full rounded-2xl text-sm font-bold shadow-[0_16px_34px_rgba(7,89,133,0.16)] transition",
                  data.publicProfile.acceptOnlineAppointments
                    ? "bg-[#062d4f] text-white"
                    : "bg-[#e8e9e1] text-[#7b7c73]"
                )}
                type="button"
              >
                {data.publicProfile.acceptOnlineAppointments ? "Book appointment" : "Appointments hidden"}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}