"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Cloud,
  Hospital,
  Loader2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { onboardingStepIds, stepDescriptions, steps, storagePrefix } from "./constants";
import { OnboardingSuccessScreen } from "./onboarding-success-screen";
import {
  getDefaultOnboardingState,
  getPersistableOnboardingState,
  isQuotaExceededError,
  mergeOnboardingState,
  validateStep,
} from "./state";
import { DepartmentsStep } from "./steps/departments-step";
import { LocationsStep } from "./steps/locations-step";
import { ProfileStep } from "./steps/profile-step";
import { PublicProfileStep } from "./steps/public-profile-step";
import { ReviewStep } from "./steps/review-step";
import type { OnboardingState, StepId } from "./types";

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
  const dashboardPath = `/hospital/${hospitalId ?? "workspace"}/admin/dashboard`;
  const profileDefaults = useMemo(
    () => ({ email: userEmail, hospitalName: organizationName }),
    [organizationName, userEmail]
  );

  const [data, setData] = useState<OnboardingState>(() =>
    getDefaultOnboardingState(profileDefaults)
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);
  const [customDepartment, setCustomDepartment] = useState("");
  const [customDepartmentDescription, setCustomDepartmentDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const currentStep = steps[currentStepIndex];
  const progressCount = completedSteps.filter((step) => onboardingStepIds.has(step)).length;
  const completionPercentage = Math.round((progressCount / steps.length) * 100);
  const enabledDepartments = data.departments.filter(
    (department) => !data.disabledDepartments.includes(department.name)
  );
  const wideContent = currentStep.id === "departments" || currentStep.id === "public" || currentStep.id === "review";
  const contentWidthClassName = wideContent ? "max-w-[960px]" : "max-w-[660px]";

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) return;

      const parsed = JSON.parse(stored) as {
        data?: OnboardingState;
        currentStepIndex?: number;
        completedSteps?: StepId[];
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
  }, [completedSteps, currentStepIndex, data, storageKey]);

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

  const markComplete = (stepId: StepId) => {
    setCompletedSteps((current) =>
      current.includes(stepId) ? current : [...current, stepId]
    );
  };

  const handleContinue = () => {
    const validationMessage = validateStep(currentStep.id, data);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage("");
    markComplete(currentStep.id);

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((value) => value + 1);
    }
  };

  const handleLaunch = () => {
    const validationMessage = validateStep(currentStep.id, data);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    markComplete("review");
    window.localStorage.setItem(
      completeKey,
      JSON.stringify({
        completedAt: new Date().toISOString(),
        data: getPersistableOnboardingState(data),
        summary,
      })
    );
    window.localStorage.removeItem(storageKey);
    window.sessionStorage.removeItem(
      `${storagePrefix}:welcome:${hospitalId ?? "workspace"}`
    );
    window.sessionStorage.removeItem(
      `${storagePrefix}:entry:${hospitalId ?? "workspace"}`
    );
    setShowCompletionScreen(true);
  };

  if (showCompletionScreen) {
    return (
      <OnboardingSuccessScreen
        completionPercentage={100}
        hospitalName={data.profile.hospitalName || organizationLabel || "Your organization"}
        onContinue={() => router.push(dashboardPath)}
        summary={summary}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#8c8c89] p-2 text-[#171916] md:p-3">
      <div className="relative min-h-[calc(100vh-1rem)] overflow-hidden rounded-[24px] border border-black/5 bg-[#f4f4f0] shadow-[0_28px_110px_rgba(0,0,0,0.22)] md:min-h-[calc(100vh-1.5rem)]">
        <div className="relative flex min-h-[calc(100vh-1rem)] w-full flex-col md:min-h-[calc(100vh-1.5rem)]">
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-dashed border-[#d7d7d0] px-6 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#062d4f] text-[#f7f7f2] shadow-[0_10px_24px_rgba(7,89,133,0.18)]">
                <Hospital size={17} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold tracking-tight text-[#171916]">
                  {organizationLabel || "Viruj Health ERP"}
                </h1>
                <p className="hidden text-[11px] font-medium text-[#77786f] sm:block">
                  Required hospital setup
                </p>
              </div>
            </div>

            <div className="hidden h-8 items-center gap-2 rounded-full border border-[#dcddd6] bg-[#edede8] px-3 text-[11px] font-semibold text-[#707268] sm:inline-flex">
              {saveState === "saving" ? (
                <Loader2 className="animate-spin text-[#0284c7]" size={13} />
              ) : (
                <Cloud className="text-[#0284c7]" size={13} />
              )}
              {saveState === "saving" ? "Auto-saving" : "Saved"}
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
                    className="h-1.5 rounded-full bg-[#0ea5e9]"
                    initial={false}
                    transition={{ duration: 0.35 }}
                  />
                </div>
              </div>

              <nav className="relative space-y-3 before:absolute before:bottom-3 before:left-[7px] before:top-3 before:border-l before:border-[#d2d3cc]">
                {steps.map((step, index) => {
                  const complete = completedSteps.includes(step.id);
                  const active = currentStep.id === step.id;
                  const canVisitStep = index <= currentStepIndex || complete;

                  return (
                    <button
                      aria-current={active ? "step" : undefined}
                      className={cn(
                        "group relative z-10 flex w-full items-start gap-3 rounded-lg px-0 py-1.5 text-left transition disabled:pointer-events-none",
                        active
                          ? "text-[#111411]"
                          : canVisitStep
                            ? "text-[#797a72] hover:text-[#232620]"
                            : "cursor-not-allowed text-[#a8a99f]"
                      )}
                      disabled={!canVisitStep}
                      key={step.id}
                      onClick={() => setCurrentStepIndex(index)}
                      type="button"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border bg-[#f4f4f0] text-[9px] font-bold",
                          complete
                            ? "border-[#0ea5e9] bg-[#0ea5e9] text-white"
                            : active
                              ? "border-[#0ea5e9] bg-[#e0f2fe] ring-4 ring-[#0ea5e9]/10"
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
                          {stepDescriptions[step.id]}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-10 rounded-lg border border-[#d5d6cf] bg-[#eeeeea] p-3 shadow-sm lg:mt-auto">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#38bdf8,#0ea5e9)] text-xs font-bold text-white">
                    {userName?.slice(0, 1)?.toUpperCase() || "A"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs font-semibold text-[#252822]">
                        {userName}
                      </p>
                      <span className="rounded border border-[#bfc7bf] bg-[#dfe8df] px-1.5 py-0.5 text-[10px] font-semibold text-[#075985]">
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
                <div className={cn("mx-auto w-full px-6 pb-6 pt-12 md:px-0", contentWidthClassName)}>
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
                      Required and auto-saved
                    </div>
                  </div>
                </div>

                <div className={cn("mx-auto min-h-0 w-full flex-1 overflow-y-auto px-6 pb-8 md:px-0", contentWidthClassName)}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      initial={{ opacity: 0, y: 12 }}
                      key={currentStep.id}
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
                          customDepartmentDescription={customDepartmentDescription}
                          data={data}
                          setCustomDepartment={setCustomDepartment}
                          setCustomDepartmentDescription={setCustomDepartmentDescription}
                          setData={setData}
                        />
                      ) : null}

                      {currentStep.id === "public" ? (
                        <PublicProfileStep data={data} setData={setData} />
                      ) : null}

                      {currentStep.id === "review" ? (
                        <ReviewStep
                          completionPercentage={completionPercentage}
                          data={data}
                          summary={summary}
                        />
                      ) : null}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <footer className={cn("mx-auto w-full border-t border-dashed border-[#d7d7d0] px-6 py-4 md:px-0", contentWidthClassName)}>
                  {errorMessage ? (
                    <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                      {errorMessage}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d8d8d2] bg-[#eeeeea] px-4 text-sm font-semibold text-[#4f514a] shadow-sm transition hover:bg-white disabled:pointer-events-none disabled:opacity-40"
                      disabled={currentStepIndex === 0}
                      onClick={() => setCurrentStepIndex((value) => Math.max(0, value - 1))}
                      type="button"
                    >
                      <ArrowLeft size={15} />
                      Back
                    </button>

                    {currentStep.id === "review" ? (
                      <button
                        className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#062d4f] px-5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(7,89,133,0.24)] transition hover:-translate-y-0.5 hover:bg-[#075985]"
                        onClick={handleLaunch}
                        type="button"
                      >
                        Launch ERP
                        <Sparkles size={16} />
                      </button>
                    ) : (
                      <button
                        className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#062d4f] px-5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(7,89,133,0.24)] transition hover:-translate-y-0.5 hover:bg-[#075985]"
                        onClick={handleContinue}
                        type="button"
                      >
                        Save & Continue
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </footer>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
