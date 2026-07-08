"use client";

import { cn } from "@/lib/utils";
import { virujBackend } from "@/lib/viruj-backend";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Cloud,
  Edit3,
  Globe2,
  Hospital,
  ImagePlus,
  Loader2,
  MapPin,
  Moon,
  Phone,
  Plus,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";

type StepId =
  | "profile"
  | "locations"
  | "departments"
  | "hours"
  | "public"
  | "review";

type Branch = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  mapsLocation: string;
  latitude: string;
  longitude: string;
};

type WorkingDay = {
  day: string;
  open: string;
  close: string;
  holiday: boolean;
};

type ProfileDefaults = {
  email?: string;
  hospitalName?: string;
};

type OnboardingState = {
  profile: {
    hospitalName: string;
    logoName: string;
    logoPreviewUrl: string;
    logoUrl: string;
    coverName: string;
    coverPreviewUrl: string;
    coverUrl: string;
    hospitalType: string;
    registrationNumber: string;
    gstNumber: string;
    email: string;
    phone: string;
    website: string;
    description: string;
    establishedYear: string;
  };
  branches: Branch[];
  departments: string[];
  disabledDepartments: string[];
  hours: {
    weekly: WorkingDay[];
    emergencyHours: string;
    consultationHours: string;
  };
  publicProfile: Record<string, boolean>;
};

const steps: Array<{
  id: StepId;
  label: string;
  kicker: string;
  optional?: boolean;
}> = [
  { id: "profile", label: "Organization Profile", kicker: "Identity" },
  { id: "locations", label: "Locations & Branches", kicker: "Network" },
  { id: "departments", label: "Departments", kicker: "Care units" },
  { id: "hours", label: "Working Hours", kicker: "Availability" },
  { id: "public", label: "Public Profile", kicker: "Viruj app" },
  { id: "review", label: "Review & Complete", kicker: "Launch" },
];

const onboardingStepIds = new Set(steps.map((step) => step.id));

const stepDescriptions: Record<StepId, string> = {
  profile: "Tell us about your hospital",
  locations: "Add branches and map locations",
  departments: "Choose the care units you operate",
  hours: "Set consultation and emergency availability",
  public: "Control what appears on the Viruj patient app",
  review: "Confirm and launch your hospital workspace",
};

const hospitalTypes = [
  "Hospital",
  "Clinic",
  "Diagnostic Center",
  "Nursing Home",
  "Specialty Center",
];

const defaultDepartments = [
  "General Medicine",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Gynecology",
  "Dermatology",
  "ENT",
  "Oncology",
  "Nephrology",
  "Emergency",
  "ICU",
  "Radiology",
  "Pathology",
  "Physiotherapy",
];

const publicOptions = [
  ["showHospitalProfile", "Show Hospital Profile"],
  ["acceptOnlineAppointments", "Accept Online Appointments"],
  ["displayDepartments", "Display Departments"],
  ["allowReviews", "Allow Reviews"],
  ["enableCommunity", "Enable Community"],
  ["enableEmergencyContact", "Enable Emergency Contact"],
] as const;

const storagePrefix = "viruj:hospital-onboarding";

export function OrganizationOnboardingPage({
  hospitalId,
  organizationLabel,
  organizationName,
  userEmail,
  userName,
}: {
  hospitalId?: string;
  organizationLabel: string;
  organizationName?: string;
  userEmail?: string;
  userName: string;
}) {
  const router = useRouter();
  const storageKey = `${storagePrefix}:draft:${hospitalId ?? "workspace"}`;
  const completeKey = `${storagePrefix}:completed:${hospitalId ?? "workspace"}`;
  const profileDefaults = useMemo(
    () => ({ email: userEmail, hospitalName: organizationName }),
    [organizationName, userEmail]
  );
  const [data, setData] = useState<OnboardingState>(() =>
    getDefaultOnboardingState(profileDefaults)
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);
  const [skippedSteps, setSkippedSteps] = useState<StepId[]>([]);
  const [customDepartment, setCustomDepartment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [confirmAction, setConfirmAction] = useState<null | {
    title: string;
    body: string;
    action: () => void;
  }>(null);

  const currentStep = steps[currentStepIndex];
  const progressCount = new Set(
    [...completedSteps, ...skippedSteps].filter((step) => onboardingStepIds.has(step))
  ).size;
  const completionPercentage = Math.round((progressCount / steps.length) * 100);
  const enabledDepartments = data.departments.filter(
    (department) => !data.disabledDepartments.includes(department)
  );
  const dashboardPath = `/hospital/${hospitalId ?? "workspace"}/admin/dashboard`;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) return;

      const parsed = JSON.parse(stored) as {
        data?: OnboardingState;
        currentStepIndex?: number;
        completedSteps?: StepId[];
        skippedSteps?: StepId[];
      };

      if (parsed.data) {
        setData(mergeOnboardingState(parsed.data, profileDefaults));
      }
      if (typeof parsed.currentStepIndex === "number") {
        setCurrentStepIndex(
          Math.min(Math.max(parsed.currentStepIndex, 0), steps.length - 1)
        );
      }
      if (Array.isArray(parsed.completedSteps)) {
        setCompletedSteps(
          parsed.completedSteps.filter((step) => onboardingStepIds.has(step))
        );
      }
      if (Array.isArray(parsed.skippedSteps)) {
        setSkippedSteps(
          parsed.skippedSteps.filter((step) => onboardingStepIds.has(step))
        );
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [profileDefaults, storageKey]);

  useEffect(() => {
    setSaveState("saving");
    const timeout = window.setTimeout(() => {
      const draft = JSON.stringify({
        completedSteps,
        currentStepIndex,
        data: getPersistableOnboardingState(data),
        skippedSteps,
      });

      try {
        window.localStorage.setItem(storageKey, draft);
        setSaveState("saved");
      } catch (error) {
        if (isQuotaExceededError(error)) {
          window.localStorage.removeItem(storageKey);
          window.localStorage.setItem(storageKey, draft);
          setSaveState("saved");
          return;
        }

        setSaveState("idle");
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [completedSteps, currentStepIndex, data, skippedSteps, storageKey]);

  const summary = useMemo(
    () => [
      {
        label: organizationLabel,
        value: data.profile.hospitalName || "Hospital name pending",
      },
      { label: "Departments", value: enabledDepartments.length.toString() },
      { label: "Branches", value: data.branches.length.toString() },
      {
        label: "Public Profile",
        value: data.publicProfile.showHospitalProfile ? "Enabled" : "Hidden",
      },
    ],
    [
      data.branches.length,
      data.profile.hospitalName,
      data.publicProfile.showHospitalProfile,
      enabledDepartments.length,
      organizationLabel,
    ]
  );

  const updateProfile = (
    key: keyof OnboardingState["profile"],
    value: string
  ) => {
    setData((current) => ({
      ...current,
      profile: { ...current.profile, [key]: value },
    }));
  };

  const handleContinue = () => {
    const validationMessage = validateStep(currentStep.id, data);
    if (validationMessage && !currentStep.optional) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage("");
    markComplete(currentStep.id);

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((value) => value + 1);
    }
  };

  const handleSkip = () => {
    setErrorMessage("");
    setSkippedSteps((current) =>
      current.includes(currentStep.id) ? current : [...current, currentStep.id]
    );
    setCompletedSteps((current) =>
      current.filter((step) => step !== currentStep.id)
    );
    setCurrentStepIndex((value) => Math.min(value + 1, steps.length - 1));
  };

  const handleLaunch = () => {
    markComplete("review");
    window.localStorage.setItem(
      completeKey,
      JSON.stringify({
        completedAt: new Date().toISOString(),
        skippedSteps,
        summary,
      })
    );
    window.sessionStorage.setItem(
      `${storagePrefix}:welcome:${hospitalId ?? "workspace"}`,
      "1"
    );
    window.localStorage.removeItem(storageKey);
    window.sessionStorage.removeItem(
      `${storagePrefix}:entry:${hospitalId ?? "workspace"}`
    );
    router.push(dashboardPath);
  };

  const skipOnboarding = () => {
    window.localStorage.setItem(
      completeKey,
      JSON.stringify({
        completedAt: new Date().toISOString(),
        skippedSteps: steps.map((step) => step.id),
        summary,
      })
    );
    window.localStorage.removeItem(storageKey);
    window.sessionStorage.removeItem(
      `${storagePrefix}:entry:${hospitalId ?? "workspace"}`
    );
    router.push(dashboardPath);
  };

  const markComplete = (stepId: StepId) => {
    setCompletedSteps((current) =>
      current.includes(stepId) ? current : [...current, stepId]
    );
    setSkippedSteps((current) => current.filter((step) => step !== stepId));
  };

  return (
    <div className="min-h-screen bg-[#8c8c89] p-2 text-[#171916] md:p-3">
      <div className="relative min-h-[calc(100vh-1rem)] overflow-hidden rounded-[24px] border border-black/5 bg-[#f4f4f0] shadow-[0_28px_110px_rgba(0,0,0,0.22)] md:min-h-[calc(100vh-1.5rem)]">
        <div className="relative flex min-h-[calc(100vh-1rem)] w-full flex-col md:min-h-[calc(100vh-1.5rem)]">
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-dashed border-[#d7d7d0] px-6 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#062f28] text-[#f7f7f2] shadow-[0_10px_24px_rgba(6,47,40,0.18)]">
                <Hospital size={17} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold tracking-tight text-[#171916]">
                  {organizationLabel || "Viruj Health ERP"}
                </h1>
                <p className="hidden text-[11px] font-medium text-[#77786f] sm:block">
                  Optional hospital setup
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden h-8 items-center gap-2 rounded-full border border-[#dcddd6] bg-[#edede8] px-3 text-[11px] font-semibold text-[#707268] sm:inline-flex">
                {saveState === "saving" ? (
                  <Loader2 className="animate-spin text-[#126c4f]" size={13} />
                ) : (
                  <Cloud className="text-[#126c4f]" size={13} />
                )}
                {saveState === "saving" ? "Auto-saving" : "Saved"}
              </div>
              <button
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#d8d8d2] bg-[#eeeeea] px-3 text-xs font-semibold text-[#252822] shadow-sm transition hover:bg-white"
                onClick={() =>
                  setConfirmAction({
                    action: skipOnboarding,
                    body: "You can enter the ERP now. Settings will show a setup checklist for anything skipped.",
                    title: "Skip setup for now?",
                  })
                }
                type="button"
              >
                <ArrowLeft size={14} />
                Back to dashboard
                <span className="hidden rounded border border-[#d3d3cd] bg-[#f7f7f3] px-1.5 py-0.5 text-[10px] font-semibold text-[#85867d] sm:inline-flex">
                  esc
                </span>
              </button>
            </div>
          </header>

          <div className="grid flex-1 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="flex min-h-full flex-col border-b border-dashed border-[#d7d7d0] px-7 py-9 lg:border-b-0 lg:border-r">
              <div className="mb-8">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#171916]">
                  <Users size={15} />
                  Set up your account
                </div>
                <div className="mt-5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b7c73]">
                  <span>Step {currentStepIndex + 1} of {steps.length}</span>
                  <span>{completionPercentage}%</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-[#dedfd8]">
                  <motion.div
                    animate={{ width: `${completionPercentage}%` }}
                    className="h-1.5 rounded-full bg-[#19865f]"
                    initial={false}
                    transition={{ duration: 0.35 }}
                  />
                </div>
              </div>

              <nav className="relative space-y-3 before:absolute before:bottom-3 before:left-[7px] before:top-3 before:border-l before:border-[#d2d3cc]">
                {steps.map((step, index) => {
                  const complete = completedSteps.includes(step.id);
                  const skipped = skippedSteps.includes(step.id);
                  const active = currentStep.id === step.id;

                  return (
                    <button
                      aria-current={active ? "step" : undefined}
                      className={cn(
                        "group relative z-10 flex w-full items-start gap-3 rounded-lg px-0 py-1.5 text-left transition",
                        active ? "text-[#111411]" : "text-[#797a72] hover:text-[#232620]"
                      )}
                      key={step.id}
                      onClick={() => setCurrentStepIndex(index)}
                      type="button"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border bg-[#f4f4f0] text-[9px] font-bold",
                          complete
                            ? "border-[#19865f] bg-[#19865f] text-white"
                            : skipped
                              ? "border-[#c58a35] bg-[#f3eadc] text-[#9a6724]"
                              : active
                                ? "border-[#19865f] bg-[#ddefe7] ring-4 ring-[#19865f]/10"
                                : "border-[#c8c9c2]"
                        )}
                      >
                        {complete ? <Check size={10} /> : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {step.label}
                        </span>
                        <span className="mt-0.5 block truncate text-xs font-medium text-[#8a8b82]">
                          {skipped ? "Skipped" : stepDescriptions[step.id]}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-10 rounded-lg border border-[#d5d6cf] bg-[#eeeeea] p-3 shadow-sm lg:mt-auto">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#9ab54d,#5d8d39)] text-xs font-bold text-white">
                    {userName?.slice(0, 1)?.toUpperCase() || "A"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs font-semibold text-[#252822]">
                        {userName}
                      </p>
                      <span className="rounded border border-[#bfc7bf] bg-[#dfe8df] px-1.5 py-0.5 text-[10px] font-semibold text-[#2f5f44]">
                        Admin
                      </span>
                    </div>
                    <p className="truncate text-[11px] font-medium text-[#7d7f75]">
                      Hospital workspace setup
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            <main className="min-w-0 bg-[#f4f4f0]">
              <div className="flex min-h-full flex-col">
                <div className="mx-auto w-full max-w-[660px] px-6 pb-6 pt-12 md:px-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#77786f]">
                    {currentStep.kicker}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-[#111411] md:text-[28px]">
                        {currentStep.label}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-[#76786f]">
                        {stepDescriptions[currentStep.id]}
                      </p>
                    </div>
                    <div className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#d7d8d1] bg-[#eeeeea] px-3 text-[11px] font-semibold text-[#696b62]">
                      <ShieldCheck size={13} />
                      Optional and auto-saved
                    </div>
                  </div>
                </div>

                <div className="mx-auto min-h-0 w-full max-w-[660px] flex-1 overflow-y-auto px-6 pb-8 md:px-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep.id}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      initial={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                      {currentStep.id === "profile" ? (
                        <ProfileStep
                          data={data}
                          hospitalId={hospitalId}
                          updateProfile={updateProfile}
                        />
                      ) : null}

                      {currentStep.id === "locations" ? (
                        <LocationsStep data={data} setData={setData} />
                      ) : null}

                      {currentStep.id === "departments" ? (
                        <DepartmentsStep
                          customDepartment={customDepartment}
                          data={data}
                          setCustomDepartment={setCustomDepartment}
                          setData={setData}
                        />
                      ) : null}

                      {currentStep.id === "hours" ? (
                        <HoursStep data={data} setData={setData} />
                      ) : null}

                      {currentStep.id === "public" ? (
                        <PublicProfileStep data={data} setData={setData} />
                      ) : null}

                      {currentStep.id === "review" ? (
                        <ReviewStep
                          completionPercentage={completionPercentage}
                          data={data}
                          skippedSteps={skippedSteps}
                          summary={summary}
                        />
                      ) : null}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <footer className="mx-auto w-full max-w-[660px] border-t border-dashed border-[#d7d7d0] px-6 py-4 md:px-0">
                  {errorMessage ? (
                    <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                      {errorMessage}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d8d8d2] bg-[#eeeeea] px-4 text-sm font-semibold text-[#4f514a] shadow-sm transition hover:bg-white disabled:pointer-events-none disabled:opacity-40"
                      disabled={currentStepIndex === 0}
                      onClick={() =>
                        setCurrentStepIndex((value) => Math.max(0, value - 1))
                      }
                      type="button"
                    >
                      <ArrowLeft size={15} />
                      Back
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      {currentStep.optional ? (
                        <button
                          className="h-10 rounded-lg px-4 text-sm font-semibold text-[#74766d] transition hover:bg-[#edede8] hover:text-[#252822]"
                          onClick={handleSkip}
                          type="button"
                        >
                          Skip for now
                        </button>
                      ) : null}
                      {currentStep.id === "review" ? (
                        <button
                          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#062f28] px-5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(6,47,40,0.22)] transition hover:-translate-y-0.5 hover:bg-[#09271f]"
                          onClick={handleLaunch}
                          type="button"
                        >
                          Launch ERP
                          <Sparkles size={16} />
                        </button>
                      ) : (
                        <button
                          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#062f28] px-5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(6,47,40,0.22)] transition hover:-translate-y-0.5 hover:bg-[#09271f]"
                          onClick={handleContinue}
                          type="button"
                        >
                          Save & Continue
                          <ArrowRight size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </footer>
              </div>
            </main>
          </div>
        </div>

        {confirmAction ? (
          <ConfirmationModal
            body={confirmAction.body}
            onCancel={() => setConfirmAction(null)}
            onConfirm={() => {
              const action = confirmAction.action;
              setConfirmAction(null);
              action();
            }}
            title={confirmAction.title}
          />
        ) : null}
      </div>
    </div>
  );
}

function ProfileStep({
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
          label="Hospital Type"
          onChange={(value) => updateProfile("hospitalType", value)}
          options={hospitalTypes}
          value={data.profile.hospitalType}
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
          <div className="relative h-36 overflow-hidden bg-[linear-gradient(135deg,#d7f5ff,#b8dfff_45%,#062f28)]">
            {data.profile.coverPreviewUrl || data.profile.coverUrl ? (
              <img
                alt={`${data.profile.hospitalName || "Hospital"} cover`}
                className="absolute inset-0 h-full w-full object-cover"
                src={data.profile.coverPreviewUrl || data.profile.coverUrl}
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-r from-[#062f28]/10 to-[#062f28]/35" />
            <div className="absolute bottom-4 left-4 flex size-16 items-center justify-center overflow-hidden rounded-2xl bg-white text-[#062f28] shadow-xl ring-1 ring-black/5">
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
                <p className="mt-1 text-sm font-semibold text-[#126c4f]">
                  {data.profile.hospitalType}
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                Preview
              </span>
            </div>
            <p className="mt-4 line-clamp-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              {data.profile.description ||
                "A trusted healthcare institution configured on Viruj for appointments, departments, working hours, and patient engagement."}
            </p>
            <div className="mt-5 grid gap-3 text-sm">
              <PreviewRow icon={<Phone size={15} />} value={data.profile.phone || "Phone pending"} />
              <PreviewRow icon={<Globe2 size={15} />} value={data.profile.website || "Website pending"} />
              <PreviewRow icon={<BadgeCheck size={15} />} value={data.profile.registrationNumber || "Registration pending"} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function LocationsStep({
  data,
  setData,
}: {
  data: OnboardingState;
  setData: Dispatch<SetStateAction<OnboardingState>>;
}) {
  const [locatingBranchId, setLocatingBranchId] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<Record<string, string>>({});

  const updateBranch = (id: string, key: keyof Branch, value: string) => {
    setData((current) => ({
      ...current,
      branches: current.branches.map((branch) =>
        branch.id === id ? { ...branch, [key]: value } : branch
      ),
    }));
  };

  const updateBranchDetails = (id: string, details: Partial<Branch>) => {
    setData((current) => ({
      ...current,
      branches: current.branches.map((branch) =>
        branch.id === id ? { ...branch, ...details } : branch
      ),
    }));
  };

  const handleUseCurrentLocation = async (branch: Branch) => {
    if (!navigator.geolocation) {
      setLocationStatus((current) => ({
        ...current,
        [branch.id]: "Location access is not supported in this browser.",
      }));
      return;
    }

    setLocatingBranchId(branch.id);
    setLocationStatus((current) => ({
      ...current,
      [branch.id]: "Requesting browser location permission...",
    }));

    try {
      const position = await getCurrentPosition();
      const latitude = position.coords.latitude.toFixed(6);
      const longitude = position.coords.longitude.toFixed(6);
      const mapsLocation = `https://www.google.com/maps?q=${latitude},${longitude}`;

      updateBranchDetails(branch.id, {
        latitude,
        longitude,
        mapsLocation,
      });
      setLocationStatus((current) => ({
        ...current,
        [branch.id]: "Coordinates found. Looking up address...",
      }));

      const address = await reverseGeocodeLocation(latitude, longitude);
      updateBranchDetails(branch.id, {
        address: address.address || branch.address,
        city: address.city || branch.city,
        country: address.country || branch.country,
        latitude,
        longitude,
        mapsLocation,
        postalCode: address.postalCode || branch.postalCode,
        state: address.state || branch.state,
      });
      setLocationStatus((current) => ({
        ...current,
        [branch.id]: address.address
          ? "Location filled from your current position."
          : "Coordinates filled. Add address details manually if needed.",
      }));
    } catch (error) {
      setLocationStatus((current) => ({
        ...current,
        [branch.id]: locationErrorMessage(error),
      }));
    } finally {
      setLocatingBranchId(null);
    }
  };

  return (
    <div className="space-y-5">
      {data.branches.map((branch, index) => {
        const isLocating = locatingBranchId === branch.id;
        const status = locationStatus[branch.id];

        return (
          <section
            className="rounded-[26px] border border-slate-200/80 bg-white/78 p-5 shadow-sm dark:border-white/[0.10] dark:bg-white/[0.055]"
            key={branch.id}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#126c4f]">
                  {index === 0 ? "Main Branch" : `Branch ${index + 1}`}
                </p>
                <h3 className="font-headline text-xl font-semibold">
                  {branch.name || "Branch details"}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-[#c8d8cd] bg-[#eef4ef] px-3 text-xs font-bold text-[#126c4f] transition hover:bg-[#f8fbf7] disabled:pointer-events-none disabled:opacity-60 dark:border-cyan-300/25 dark:bg-cyan-400/[0.08] dark:text-cyan-200"
                  disabled={isLocating}
                  onClick={() => void handleUseCurrentLocation(branch)}
                  type="button"
                >
                  {isLocating ? <Loader2 className="animate-spin" size={14} /> : <MapPin size={14} />}
                  {isLocating ? "Finding location" : "Use current location"}
                </button>
                {index > 0 ? (
                  <button
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-300"
                    onClick={() =>
                      setData((current) => ({
                        ...current,
                        branches: current.branches.filter(
                          (item) => item.id !== branch.id
                        ),
                      }))
                    }
                    type="button"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                ) : null}
              </div>
            </div>

            {status ? (
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-[#d8e5dc] bg-[#f4f8f5] px-3 py-2 text-xs font-semibold text-[#4f665a] dark:border-cyan-300/15 dark:bg-cyan-400/[0.06] dark:text-cyan-100/80">
                {isLocating ? <Loader2 className="animate-spin" size={14} /> : <MapPin size={14} />}
                {status}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <TextField
                label="Branch Name"
                onChange={(value) => updateBranch(branch.id, "name", value)}
                placeholder="Main Campus"
                value={branch.name}
              />
              <TextField
                label="Address"
                onChange={(value) => updateBranch(branch.id, "address", value)}
                placeholder="Block A, Ring Road"
                value={branch.address}
              />
              <TextField
                label="City"
                onChange={(value) => updateBranch(branch.id, "city", value)}
                placeholder="Delhi"
                value={branch.city}
              />
              <TextField
                label="State"
                onChange={(value) => updateBranch(branch.id, "state", value)}
                placeholder="Delhi"
                value={branch.state}
              />
              <TextField
                label="Country"
                onChange={(value) => updateBranch(branch.id, "country", value)}
                placeholder="India"
                value={branch.country}
              />
              <TextField
                label="Postal Code"
                onChange={(value) => updateBranch(branch.id, "postalCode", value)}
                placeholder="110001"
                value={branch.postalCode}
              />
              <TextField
                label="Google Maps Location"
                onChange={(value) =>
                  updateBranch(branch.id, "mapsLocation", value)
                }
                placeholder="https://maps.google.com/..."
                value={branch.mapsLocation}
              />
              <TextField
                label="Latitude"
                onChange={(value) => updateBranch(branch.id, "latitude", value)}
                placeholder="28.6139"
                value={branch.latitude}
              />
              <TextField
                label="Longitude"
                onChange={(value) => updateBranch(branch.id, "longitude", value)}
                placeholder="77.2090"
                value={branch.longitude}
              />
            </div>
          </section>
        );
      })}

      <button
        className="flex h-14 w-full items-center justify-center gap-2 rounded-[22px] border border-dashed border-[#c8d8cd] bg-[#eef4ef] text-sm font-bold text-[#126c4f] transition hover:-translate-y-0.5 hover:bg-[#f5f8f4] dark:border-cyan-300/25 dark:bg-cyan-400/[0.08] dark:text-cyan-200"
        onClick={() =>
          setData((current) => ({
            ...current,
            branches: [...current.branches, getEmptyBranch(false)],
          }))
        }
        type="button"
      >
        <Plus size={18} />
        Add another branch
      </button>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.branches.map((branch) => (
          <div
            className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-white/[0.10] dark:bg-white/[0.055]"
            key={`${branch.id}-card`}
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#eaf3ec] text-[#126c4f] dark:bg-cyan-400/10 dark:text-cyan-300">
                <MapPin size={18} />
              </span>
              <div>
                <p className="font-bold">{branch.name || "Unnamed branch"}</p>
                <p className="text-xs font-semibold text-slate-500">
                  {[branch.city, branch.state].filter(Boolean).join(", ") ||
                    "Location pending"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type ReverseGeocodeResult = {
  address: string;
  city: string;
  country: string;
  postalCode: string;
  state: string;
};

function getCurrentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 60_000,
      timeout: 12_000,
    });
  });
}

async function reverseGeocodeLocation(
  latitude: string,
  longitude: string,
): Promise<ReverseGeocodeResult> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&addressdetails=1`,
    );

    if (!response.ok) return emptyReverseGeocodeResult();

    const payload = (await response.json()) as {
      address?: Record<string, string | undefined>;
      display_name?: string;
    };
    const address = payload.address ?? {};
    const roadAddress = [
      address.house_number,
      address.road,
      address.neighbourhood,
      address.suburb,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      address: roadAddress || payload.display_name || "",
      city:
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        "",
      country: address.country || "",
      postalCode: address.postcode || "",
      state: address.state || address.state_district || "",
    };
  } catch {
    return emptyReverseGeocodeResult();
  }
}

function emptyReverseGeocodeResult(): ReverseGeocodeResult {
  return {
    address: "",
    city: "",
    country: "",
    postalCode: "",
    state: "",
  };
}

function locationErrorMessage(error: unknown) {
  if (error instanceof GeolocationPositionError) {
    if (error.code === error.PERMISSION_DENIED) {
      return "Location permission was denied. Allow location access and try again.";
    }
    if (error.code === error.POSITION_UNAVAILABLE) {
      return "Current location is unavailable. Enter the address manually.";
    }
    if (error.code === error.TIMEOUT) {
      return "Location lookup timed out. Try again or enter the address manually.";
    }
  }

  return "Unable to fetch current location. Enter the address manually.";
}
function DepartmentsStep({
  customDepartment,
  data,
  setCustomDepartment,
  setData,
}: {
  customDepartment: string;
  data: OnboardingState;
  setCustomDepartment: (value: string) => void;
  setData: Dispatch<SetStateAction<OnboardingState>>;
}) {
  const toggleDepartment = (department: string) => {
    setData((current) => {
      const disabled = current.disabledDepartments.includes(department)
        ? current.disabledDepartments.filter((item) => item !== department)
        : [...current.disabledDepartments, department];
      return { ...current, disabledDepartments: disabled };
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3 rounded-[24px] border border-slate-200/80 bg-white/70 p-4 dark:border-white/[0.10] dark:bg-white/[0.055]">
        <div className="min-w-64 flex-1">
          <TextField
            label="Custom Department"
            onChange={setCustomDepartment}
            placeholder="Pain Management"
            value={customDepartment}
          />
        </div>
        <button
          className="inline-flex h-12 items-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
          onClick={() => {
            const value = customDepartment.trim();
            if (!value) return;
            setData((current) => ({
              ...current,
              departments: current.departments.includes(value)
                ? current.departments
                : [...current.departments, value],
            }));
            setCustomDepartment("");
          }}
          type="button"
        >
          <Plus size={17} />
          Add Department
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {data.departments.map((department) => {
          const enabled = !data.disabledDepartments.includes(department);
          return (
            <div
              className={cn(
                "rounded-[24px] border p-4 shadow-sm transition",
                enabled
                  ? "border-[#d8ddd5] bg-white/86 dark:border-cyan-300/20 dark:bg-cyan-400/[0.08]"
                  : "border-slate-200 bg-white/54 opacity-70 dark:border-white/[0.08] dark:bg-white/[0.04]"
              )}
              key={department}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#eaf3ec] text-[#126c4f] dark:bg-cyan-400/10 dark:text-cyan-300">
                    <Stethoscope size={19} />
                  </span>
                  <div>
                    <h3 className="font-headline text-lg font-semibold">
                      {department}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      {enabled ? "Enabled for ERP and public listing" : "Disabled"}
                    </p>
                  </div>
                </div>
                {enabled ? (
                  <span className="flex size-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                    <Check size={15} />
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/[0.10] dark:bg-white/[0.08] dark:text-slate-200"
                  onClick={() => toggleDepartment(department)}
                  type="button"
                >
                  <CheckCircle2 size={14} />
                  {enabled ? "Disable" : "Enable"}
                </button>
                <button
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/[0.10] dark:bg-white/[0.08] dark:text-slate-200"
                  onClick={() => {
                    const nextName = window.prompt("Edit department", department);
                    if (!nextName?.trim()) return;
                    setData((current) => ({
                      ...current,
                      departments: current.departments.map((item) =>
                        item === department ? nextName.trim() : item
                      ),
                      disabledDepartments: current.disabledDepartments.map((item) =>
                        item === department ? nextName.trim() : item
                      ),
                    }));
                  }}
                  type="button"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
                <button
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-300"
                  onClick={() =>
                    setData((current) => ({
                      ...current,
                      departments: current.departments.filter(
                        (item) => item !== department
                      ),
                      disabledDepartments: current.disabledDepartments.filter(
                        (item) => item !== department
                      ),
                    }))
                  }
                  type="button"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HoursStep({
  data,
  setData,
}: {
  data: OnboardingState;
  setData: Dispatch<SetStateAction<OnboardingState>>;
}) {
  const updateDay = (day: string, patch: Partial<WorkingDay>) => {
    setData((current) => ({
      ...current,
      hours: {
        ...current.hours,
        weekly: current.hours.weekly.map((item) =>
          item.day === day ? { ...item, ...patch } : item
        ),
      },
    }));
  };

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        {data.hours.weekly.map((day) => (
          <div
            className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white/78 p-4 dark:border-white/[0.10] dark:bg-white/[0.055] md:grid-cols-[150px_1fr_1fr_150px]"
            key={day.day}
          >
            <div className="flex items-center gap-3">
              <CalendarDays className="text-[#126c4f]" size={18} />
              <span className="font-bold">{day.day}</span>
            </div>
            <input
              className={fieldClassName()}
              disabled={day.holiday}
              onChange={(event) => updateDay(day.day, { open: event.target.value })}
              type="time"
              value={day.open}
            />
            <input
              className={fieldClassName()}
              disabled={day.holiday}
              onChange={(event) => updateDay(day.day, { close: event.target.value })}
              type="time"
              value={day.close}
            />
            <button
              className={cn(
                "h-11 rounded-xl text-sm font-bold transition",
                day.holiday
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
              )}
              onClick={() => updateDay(day.day, { holiday: !day.holiday })}
              type="button"
            >
              {day.holiday ? "Holiday" : "Open"}
            </button>
          </div>
        ))}
      </section>

      <aside className="h-fit space-y-4 rounded-[26px] border border-slate-200/80 bg-white/78 p-5 dark:border-white/[0.10] dark:bg-white/[0.055]">
        <div className="flex items-center gap-3">
          <Clock3 className="text-[#126c4f]" size={20} />
          <h3 className="font-headline text-xl font-semibold">
            Calendar style availability
          </h3>
        </div>
        <TextField
          label="Emergency Hours"
          onChange={(value) =>
            setData((current) => ({
              ...current,
              hours: { ...current.hours, emergencyHours: value },
            }))
          }
          placeholder="24/7 emergency"
          value={data.hours.emergencyHours}
        />
        <TextField
          label="Consultation Hours"
          onChange={(value) =>
            setData((current) => ({
              ...current,
              hours: { ...current.hours, consultationHours: value },
            }))
          }
          placeholder="10:00 AM - 5:00 PM"
          value={data.hours.consultationHours}
        />
        <div className="grid grid-cols-7 gap-1">
          {data.hours.weekly.map((day) => (
            <div
              className={cn(
                "flex aspect-square items-center justify-center rounded-xl text-xs font-bold",
                day.holiday
                  ? "bg-slate-100 text-slate-400 dark:bg-white/[0.06]"
                  : "bg-[#eaf3ec] text-[#126c4f] dark:bg-cyan-400/10 dark:text-cyan-300"
              )}
              key={`${day.day}-mini`}
            >
              {day.day.slice(0, 1)}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function PublicProfileStep({
  data,
  setData,
}: {
  data: OnboardingState;
  setData: Dispatch<SetStateAction<OnboardingState>>;
}) {
  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-2">
        {publicOptions.map(([key, label]) => (
          <button
            className={cn(
              "flex items-center justify-between gap-4 rounded-2xl border p-4 text-left transition",
              data.publicProfile[key]
                ? "border-cyan-100 bg-cyan-50/80 text-cyan-950 dark:border-cyan-300/20 dark:bg-cyan-400/10 dark:text-cyan-100"
                : "border-slate-200 bg-white/76 text-slate-600 dark:border-white/[0.10] dark:bg-white/[0.055] dark:text-slate-400"
            )}
            key={key}
            onClick={() =>
              setData((current) => ({
                ...current,
                publicProfile: {
                  ...current.publicProfile,
                  [key]: !current.publicProfile[key],
                },
              }))
            }
            type="button"
          >
            <span className="font-bold">{label}</span>
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full",
                data.publicProfile[key]
                  ? "bg-[#126c4f] text-white"
                  : "bg-slate-100 text-slate-400 dark:bg-white/[0.08]"
              )}
            >
              {data.publicProfile[key] ? <Check size={15} /> : <X size={15} />}
            </span>
          </button>
        ))}
      </section>

      <aside className="mx-auto w-full max-w-[330px] rounded-[34px] border border-slate-200 bg-slate-950 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
        <div className="overflow-hidden rounded-[26px] bg-[#f6fbfc] text-slate-950">
          <div className="h-32 bg-[linear-gradient(135deg,#b9eef8,#d7e9ff_55%,#062f28)]" />
          <div className="-mt-8 px-4 pb-5">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-white text-[#062f28] shadow-xl">
              <Hospital size={27} />
            </div>
            <h3 className="mt-4 font-headline text-xl font-semibold">
              {data.profile.hospitalName || "Hospital Preview"}
            </h3>
            <p className="text-xs font-bold text-cyan-700">
              {data.profile.hospitalType}
            </p>
            <div className="mt-4 grid gap-2">
              {[
                data.publicProfile.acceptOnlineAppointments &&
                  "Online appointments",
                data.publicProfile.displayDepartments &&
                  `${data.departments.length} departments`,
                data.publicProfile.enableEmergencyContact &&
                  "Emergency contact",
              ]
                .filter(Boolean)
                .map((item) => (
                  <div
                    className="rounded-xl bg-white px-3 py-2 text-xs font-bold shadow-sm"
                    key={String(item)}
                  >
                    {item}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function ReviewStep({
  completionPercentage,
  data,
  skippedSteps,
  summary,
}: {
  completionPercentage: number;
  data: OnboardingState;
  skippedSteps: StepId[];
  summary: Array<{ label: string; value: string }>;
}) {
  const hospitalName = data.profile.hospitalName || "Your hospital";
  const primaryBranch = data.branches[0];
  const enabledDepartments = data.departments.filter(
    (department) => !data.disabledDepartments.includes(department)
  );
  const skippedLabels = skippedSteps
    .map((id) => steps.find((step) => step.id === id)?.label)
    .filter(Boolean);
  const launchChecks = [
    {
      label: "Organization identity",
      meta: data.profile.email || "Profile details saved",
      ready: Boolean(data.profile.hospitalName && data.profile.email),
    },
    {
      label: "Primary branch",
      meta: primaryBranch?.city || primaryBranch?.name || "Branch configured",
      ready: Boolean(primaryBranch?.name && primaryBranch?.address),
    },
    {
      label: "Care departments",
      meta: `${enabledDepartments.length} enabled`,
      ready: enabledDepartments.length > 0,
    },
    {
      label: "Patient app profile",
      meta: data.publicProfile.showHospitalProfile ? "Visible on Viruj" : "Hidden from Viruj",
      ready: data.publicProfile.showHospitalProfile,
    },
  ];
  const visiblePatientFeatures = publicOptions
    .filter(([key]) => data.publicProfile[key])
    .map(([, label]) => label.replace("Show ", "").replace("Display ", ""));

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[28px] bg-[#062f28] p-5 text-white shadow-[0_24px_70px_rgba(6,47,40,0.22)] md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(132,186,154,0.24),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%)]" />
        <div className="relative grid gap-5 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d9eee2]">
              <Sparkles size={13} />
              Launch readiness
            </div>
            <h3 className="mt-5 text-[30px] font-semibold leading-tight tracking-tight md:text-[36px]">
              {hospitalName} is ready for day one.
            </h3>
            <p className="mt-3 max-w-lg text-sm font-medium leading-6 text-[#c6d8cf]">
              We saved the core hospital setup. Launch ERP now and continue any optional configuration from Settings under Organization Setup.
            </p>
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-[#b9d0c6]">
                <span>Setup completion</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/12">
                <motion.div
                  animate={{ width: `${completionPercentage}%` }}
                  className="h-2 rounded-full bg-[#7fc79d]"
                  initial={false}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <HealthcareLaunchIllustration />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
        <div className="rounded-[22px] border border-[#d8d8d2] bg-[#eeeeea] p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#77786f]">
                Configuration summary
              </p>
              <h4 className="mt-1 text-lg font-semibold text-[#171916]">
                Core workspace
              </h4>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-[#dfece3] text-[#126c4f]">
              <ShieldCheck size={17} />
            </span>
          </div>

          <div className="grid gap-2">
            {summary.map((item) => (
              <div
                className="flex items-center justify-between gap-4 rounded-xl border border-[#d9dad3] bg-[#f7f7f3] px-3.5 py-3"
                key={item.label}
              >
                <span className="text-sm font-medium text-[#6d6f66]">
                  {item.label}
                </span>
                <span className="max-w-[220px] truncate text-right text-sm font-semibold text-[#171916]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[22px] border border-[#d8d8d2] bg-[#f7f7f3] p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#77786f]">
            Patient app
          </p>
          <h4 className="mt-1 text-lg font-semibold text-[#171916]">
            Public visibility
          </h4>
          <div className="mt-4 flex flex-wrap gap-2">
            {visiblePatientFeatures.length ? (
              visiblePatientFeatures.map((feature) => (
                <span
                  className="rounded-full border border-[#cfd8cf] bg-[#edf4ee] px-3 py-1.5 text-xs font-semibold text-[#126c4f]"
                  key={feature}
                >
                  {feature}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-[#ddd8cc] bg-[#f4eee3] px-3 py-1.5 text-xs font-semibold text-[#8a652d]">
                Profile hidden
              </span>
            )}
          </div>
          <div className="mt-5 rounded-2xl bg-[#062f28] p-4 text-white">
            <Globe2 size={20} />
            <p className="mt-3 text-sm font-semibold">
              {data.publicProfile.showHospitalProfile ? "Ready to publish" : "Private workspace"}
            </p>
            <p className="mt-1 text-xs font-medium leading-5 text-[#c2d8cc]">
              {data.publicProfile.showHospitalProfile
                ? "Patients will see the enabled profile sections in Viruj."
                : "You can publish the hospital profile later from settings."}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[22px] border border-[#d8d8d2] bg-[#f7f7f3] p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#77786f]">
              Final checks
            </p>
            <h4 className="mt-1 text-lg font-semibold text-[#171916]">
              Launch checklist
            </h4>
          </div>
          <span className="text-xs font-semibold text-[#77786f]">
            {launchChecks.filter((check) => check.ready).length}/{launchChecks.length} ready
          </span>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {launchChecks.map((check) => (
            <div
              className="flex items-start gap-3 rounded-xl border border-[#d9dad3] bg-[#eeeeea] p-3"
              key={check.label}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                  check.ready ? "bg-[#dfece3] text-[#126c4f]" : "bg-[#f1e7d8] text-[#8a652d]"
                )}
              >
                {check.ready ? <Check size={15} /> : <Clock3 size={14} />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[#171916]">
                  {check.label}
                </span>
                <span className="mt-0.5 block truncate text-xs font-medium text-[#77786f]">
                  {check.meta}
                </span>
              </span>
            </div>
          ))}
        </div>
        {skippedLabels.length ? (
          <div className="mt-4 rounded-xl border border-[#ddd8cc] bg-[#f4eee3] px-3.5 py-3 text-sm font-medium text-[#73562b]">
            Skipped for later: {skippedLabels.join(", ")}. These will appear in Settings under Organization Setup.
          </div>
        ) : null}
      </section>
    </div>
  );
}
function CatalogSection({
  customLabel,
  customValue,
  items,
  onAddCustom,
  onToggle,
  selected,
  setCustomValue,
  title,
}: {
  customLabel: string;
  customValue: string;
  items: string[];
  onAddCustom: () => void;
  onToggle: (item: string) => void;
  selected: string[];
  setCustomValue: (value: string) => void;
  title: string;
}) {
  const allItems = Array.from(new Set([...items, ...selected]));

  return (
    <section className="rounded-[26px] border border-slate-200/80 bg-white/72 p-5 dark:border-white/[0.10] dark:bg-white/[0.055]">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#126c4f]">
            {title}
          </p>
          <h3 className="font-headline text-xl font-semibold">
            {selected.length} enabled
          </h3>
        </div>
        <div className="flex min-w-72 flex-1 gap-2 md:max-w-md">
          <input
            className={fieldClassName()}
            onChange={(event) => setCustomValue(event.target.value)}
            placeholder={customLabel}
            value={customValue}
          />
          <button
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
            onClick={onAddCustom}
            type="button"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {allItems.map((item) => {
          const enabled = selected.includes(item);
          return (
            <button
              className={cn(
                "flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition",
                enabled
                  ? "border-cyan-100 bg-cyan-50 text-cyan-950 dark:border-cyan-300/20 dark:bg-cyan-400/10 dark:text-cyan-100"
                  : "border-slate-200 bg-white/78 text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400"
              )}
              key={item}
              onClick={() => onToggle(item)}
              type="button"
            >
              <span className="font-bold">{item}</span>
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full",
                  enabled
                    ? "bg-[#126c4f] text-white"
                    : "bg-slate-100 text-slate-400 dark:bg-white/[0.08]"
                )}
              >
                {enabled ? <Check size={15} /> : <Plus size={15} />}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function InvitationList({
  emptyCopy,
  items,
  onRemove,
  onResend,
  resend = false,
  title,
}: {
  emptyCopy: string;
  items: Array<{ id: string; meta: string; name: string; right: string }>;
  onRemove: (id: string) => void;
  onResend?: (id: string) => void;
  resend?: boolean;
  title: string;
}) {
  return (
    <aside className="h-fit rounded-[26px] border border-slate-200/80 bg-white/76 p-5 dark:border-white/[0.10] dark:bg-white/[0.055]">
      <h3 className="font-headline text-xl font-semibold">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center dark:border-white/[0.10]">
            <Users className="mx-auto text-slate-400" size={28} />
            <p className="mt-3 text-sm font-semibold text-slate-500">
              {emptyCopy}
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.10] dark:bg-white/[0.06]"
              key={item.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-xs font-semibold text-slate-500">
                    {item.meta}
                  </p>
                </div>
                <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                  {item.right}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                {resend ? (
                  <button
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-slate-200 px-2.5 text-xs font-bold text-slate-600 dark:border-white/[0.10] dark:text-slate-300"
                    onClick={() => onResend?.(item.id)}
                    type="button"
                  >
                    <RotateCw size={13} />
                    Resend
                  </button>
                ) : null}
                <button
                  className="inline-flex h-8 items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 text-xs font-bold text-rose-700 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-300"
                  onClick={() => onRemove(item.id)}
                  type="button"
                >
                  <Trash2 size={13} />
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

function HealthcareLaunchIllustration() {
  return (
    <div className="relative mx-auto h-48 max-w-[280px]">
      <div className="absolute inset-x-8 bottom-0 h-24 rounded-[28px] bg-white/12" />
      <div className="absolute bottom-8 left-1/2 h-28 w-32 -translate-x-1/2 rounded-[26px] bg-white text-[#062f28] shadow-2xl">
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <Hospital size={42} />
          <span className="h-2 w-16 rounded-full bg-cyan-200" />
          <span className="h-2 w-10 rounded-full bg-cyan-100/70" />
        </div>
      </div>
      <div className="absolute left-2 top-8 flex size-14 items-center justify-center rounded-2xl bg-cyan-200 text-[#062f28] shadow-xl">
        <Sun size={24} />
      </div>
      <div className="absolute right-5 top-2 flex size-14 items-center justify-center rounded-2xl bg-white/14 text-cyan-100 shadow-xl">
        <Moon size={24} />
      </div>
      <div className="absolute bottom-10 right-0 flex size-12 items-center justify-center rounded-2xl bg-emerald-300 text-emerald-950 shadow-xl">
        <Check size={23} />
      </div>
    </div>
  );
}

function ConfirmationModal({
  body,
  onCancel,
  onConfirm,
  title,
}: {
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-md">
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-6 text-slate-950 shadow-[0_30px_120px_rgba(15,23,42,0.24)] dark:border-white/[0.10] dark:bg-[#10191c] dark:text-white"
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
      >
        <h3 className="font-headline text-2xl font-semibold">{title}</h3>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          {body}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            className="h-10 rounded-full px-4 text-sm font-bold text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.08]"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-10 rounded-full bg-slate-950 px-4 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
            onClick={onConfirm}
            type="button"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function PreviewRow({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
      {icon}
      {value}
    </div>
  );
}

function TextField({
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
}) {
  return (
    <label>
      <FieldLabel>{label}</FieldLabel>
      <input
        className={fieldClassName()}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label>
      <FieldLabel>{label}</FieldLabel>
      <select
        className={fieldClassName("appearance-none")}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function UploadField({
  label,
  name,
  onChange,
}: {
  label: string;
  name: string;
  onChange: (file: { file: File; name: string; previewUrl: string }) => Promise<void> | void;
}) {
  const handleFileChange = (file?: File) => {
    if (!file) return;

    onChange({
      file,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
    });
  };

  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border border-[#d5d6cf] bg-[#eeeeea] px-3.5 text-sm font-medium text-[#6d6f66] shadow-sm transition hover:border-[#c6d7cc] hover:bg-white">
        <span className="truncate">{name || "Choose image"}</span>
        <ImagePlus size={17} />
      </div>
      <input
        accept="image/*"
        className="sr-only"
        onChange={(event) => handleFileChange(event.target.files?.[0])}
        type="file"
      />
    </label>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1.5 block px-0.5 text-xs font-semibold text-[#343731]">
      {children}
    </span>
  );
}

function fieldClassName(extra?: string) {
  return cn(
    "h-11 w-full rounded-lg border border-[#d5d6cf] bg-[#eeeeea] px-3.5 text-sm font-medium text-[#171916] shadow-sm outline-none transition placeholder:text-[#9a9b92] focus:border-[#aabeb0] focus:bg-white focus:ring-4 focus:ring-[#e1ebe4] disabled:cursor-not-allowed disabled:opacity-50",
    extra
  );
}

function validateStep(stepId: StepId, data: OnboardingState) {
  switch (stepId) {
    case "profile":
      if (!data.profile.hospitalName.trim()) return "Add the hospital name.";
      if (!data.profile.email.trim()) return "Add the hospital email.";
      if (!data.profile.phone.trim()) return "Add the hospital phone number.";
      return "";
    case "locations":
      if (
        data.branches.some(
          (branch) =>
            !branch.name.trim() || !branch.address.trim() || !branch.city.trim()
        )
      ) {
        return "Each branch needs a name, address, and city.";
      }
      return "";
    case "departments":
      if (
        data.departments.filter(
          (department) => !data.disabledDepartments.includes(department)
        ).length === 0
      ) {
        return "Enable at least one department.";
      }
      return "";
    case "hours":
      if (data.hours.weekly.every((day) => day.holiday)) {
        return "Keep at least one working day open.";
      }
      return "";
    default:
      return "";
  }
}

function getDefaultOnboardingState(defaults?: ProfileDefaults): OnboardingState {
  return {
    branches: [getEmptyBranch(true)],
    departments: defaultDepartments,
    disabledDepartments: [],
    hours: {
      consultationHours: "10:00 AM - 5:00 PM",
      emergencyHours: "24/7 emergency",
      weekly: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ].map((day) => ({
        close: day === "Sunday" ? "14:00" : "18:00",
        day,
        holiday: false,
        open: "09:00",
      })),
    },
    profile: {
      coverName: "",
      coverPreviewUrl: "",
      coverUrl: "",
      description: "",
      email: defaults?.email?.trim() ?? "",
      establishedYear: "",
      gstNumber: "",
      hospitalName: defaults?.hospitalName?.trim() ?? "",
      hospitalType: "Hospital",
      logoName: "",
      logoPreviewUrl: "",
      logoUrl: "",
      phone: "",
      registrationNumber: "",
      website: "",
    },
    publicProfile: Object.fromEntries(
      publicOptions.map(([key]) => [key, true])
    ) as Record<string, boolean>,
  };
}

function getPersistableOnboardingState(state: OnboardingState): OnboardingState {
  return {
    ...state,
    profile: {
      ...state.profile,
      coverPreviewUrl: "",
      logoPreviewUrl: "",
    },
  };
}

function isQuotaExceededError(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}

function mergeOnboardingState(state: OnboardingState, defaults?: ProfileDefaults) {
  const fallback = getDefaultOnboardingState(defaults);
  const persistedProfile = getPersistableOnboardingState(state).profile;
  return {
    ...fallback,
    ...state,
    hours: {
      ...fallback.hours,
      ...state.hours,
      weekly: state.hours?.weekly?.length ? state.hours.weekly : fallback.hours.weekly,
    },
    profile: {
      ...fallback.profile,
      ...persistedProfile,
      email: persistedProfile.email?.trim() ? persistedProfile.email : fallback.profile.email,
      hospitalName: persistedProfile.hospitalName?.trim()
        ? persistedProfile.hospitalName
        : fallback.profile.hospitalName,
    },
    publicProfile: { ...fallback.publicProfile, ...state.publicProfile },
  };
}

function getEmptyBranch(main: boolean): Branch {
  return {
    address: "",
    city: "",
    country: "India",
    id: crypto.randomUUID(),
    latitude: "",
    longitude: "",
    mapsLocation: "",
    name: main ? "Main Branch" : "",
    postalCode: "",
    state: "",
  };
}
