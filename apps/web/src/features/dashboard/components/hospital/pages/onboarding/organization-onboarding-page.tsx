"use client";
import { OnboardingFrame } from "./onboarding-frame";

import { cn } from "@/lib/utils";
import { setCentralApiTokenIdentity } from "@/lib/central-api-token";
import { authClient } from "@/lib/auth-client";
import { virujBackend } from "@/lib/viruj-backend";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getOnboardingSteps,
  getStepDescriptions,
  getStoragePrefix,
} from "./constants";
import { OnboardingSuccessScreen } from "./onboarding-success-screen";
import {
  getDefaultOnboardingState,
  getPersistableOnboardingState,
  isQuotaExceededError,
  mergeOnboardingState,
  validateStep,
} from "./state";
import { ContactStep } from "./steps/contact-step";
import { DepartmentsStep } from "./steps/departments-step";
import { DoctorsStep } from "./steps/doctors-step";
import { LocationsStep } from "./steps/locations-step";
import { ProfileStep } from "./steps/profile-step";
import { PublicProfileStep } from "./steps/public-profile-step";
import { ReviewStep } from "./steps/review-step";
import { WorkingHoursStep } from "./steps/working-hours-step";
import type { OnboardingKind, OnboardingState, StepId } from "./types";

export function OrganizationOnboardingPage({
  dashboardPath,
  hospitalId,
  organizationId,
  organizationLabel,
  organizationName,
  organizationType = "hospital",
  userEmail,
  userName,
}: {
  dashboardPath?: string;
  hospitalId?: string;
  organizationId?: string;
  organizationLabel: string;
  organizationName?: string;
  organizationType?: OnboardingKind;
  userEmail?: string;
  userName: string;
}) {
  const router = useRouter();
  const kind = organizationType;
  const sessionState = authClient.useSession();
  const activeOrganizationState = authClient.useActiveOrganization();
  const storagePrefix = getStoragePrefix(kind);
  const storageId = organizationId ?? hospitalId ?? "workspace";
  const storageKey = `${storagePrefix}:draft:${storageId}`;
  const completeKey = `${storagePrefix}:completed:${storageId}`;
  const launchDashboardPath = dashboardPath ?? `/${kind}`;
  const steps = useMemo(() => getOnboardingSteps(kind), [kind]);
  const stepDescriptions = useMemo(() => getStepDescriptions(kind), [kind]);
  const onboardingStepIds = useMemo(
    () => new Set(steps.map((step) => step.id)),
    [steps]
  );
  const profileDefaults = useMemo(
    () => ({ email: userEmail, hospitalName: organizationName }),
    [organizationName, userEmail]
  );

  const [data, setData] = useState<OnboardingState>(() =>
    getDefaultOnboardingState(profileDefaults, kind)
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [launching, setLaunching] = useState(false);
  const [invitationPending, setInvitationPending] = useState(false);
  // The step fields live inside this form so the Continue/Launch buttons can
  // surface native constraint messages (for example a -1 establishment year)
  // directly at the field before the custom per-step validation runs.
  const stepFormRef = useRef<HTMLFormElement>(null);

  // The identity step saves central-API data (media uploads, onboarding
  // save), so bind the central API token cache to this session's user +
  // active organization, same as the home screens.
  useEffect(() => {
    const userId = sessionState.data?.user?.id ?? null;
    const onboardingOrganizationId =
      organizationId ??
      hospitalId ??
      activeOrganizationState.data?.id ??
      null;

    setCentralApiTokenIdentity(
      userId && onboardingOrganizationId
        ? `${userId}:${onboardingOrganizationId}`
        : null
    );
  }, [
    activeOrganizationState.data?.id,
    hospitalId,
    organizationId,
    sessionState.data?.user?.id
  ]);

  const currentStep = steps[currentStepIndex] ?? steps[0];
  const progressCount = completedSteps.filter((step) =>
    onboardingStepIds.has(step)
  ).length;
  const completionPercentage = Math.round((progressCount / steps.length) * 100);
  const enabledDepartments =
    kind === "clinic"
      ? data.departments
      : data.departments.filter(
          (department) => !data.disabledDepartments.includes(department.name)
        );
  const wideContent = [
    "departments",
    "public",
    "review",
    "workingHours",
    "doctors",
  ].includes(currentStep.id);
  const contentWidthClassName = wideContent ? "max-w-[960px]" : "max-w-[660px]";
  const entityLabel = kind === "clinic" ? "clinic" : "hospital";

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
        setData(mergeOnboardingState(parsed.data, profileDefaults, kind));
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
  }, [kind, onboardingStepIds, profileDefaults, steps.length, storageKey]);

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

  const summary = useMemo(() => {
    if (kind === "clinic") {
      return [
        {
          label: "Clinic",
          value: data.profile.hospitalName || "Clinic name pending",
        },
        { label: "Specialties", value: enabledDepartments.length.toString() },
        { label: "Doctors", value: data.doctors.length.toString() },
        {
          label: "Location",
          value:
            data.branches[0]?.city || data.branches[0]?.address || "Pending",
        },
      ];
    }

    return [
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
    ];
  }, [data, enabledDepartments.length, kind, organizationLabel]);

  const updateProfile = (
    key: keyof OnboardingState["profile"],
    value: string | string[]
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
    if (!stepFormRef.current?.reportValidity()) {
      // Native validation surfaced field-level messages already.
      return;
    }
    const validationMessage = validateStep(currentStep.id, data, kind);
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

  const handleLaunch = async () => {
    if (!stepFormRef.current?.reportValidity()) {
      return;
    }
    const validationMessage = validateStep(currentStep.id, data, kind);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    if (launching) return;
    setLaunching(true);
    try {
      const result = await virujBackend.directory.saveOnboarding({
        organizationId: organizationId ?? hospitalId,
        data: getPersistableOnboardingState(data),
      });
      setInvitationPending((result.doctorInvitationsPending ?? 0) > 0);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not save onboarding details"
      );
      setLaunching(false);
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
    window.sessionStorage.removeItem(`${storagePrefix}:welcome:${storageId}`);
    window.sessionStorage.removeItem(`${storagePrefix}:entry:${storageId}`);
    setShowCompletionScreen(true);
  };

  if (showCompletionScreen) {
    return (
      <OnboardingSuccessScreen
        notice={
          invitationPending
            ? "Your workspace is ready. Doctor invitation email delivery is pending."
            : undefined
        }
        completionPercentage={100}
        hospitalName={
          data.profile.hospitalName || organizationLabel || "Your organization"
        }
        kind={kind}
        onContinue={() => router.push(launchDashboardPath)}
        summary={summary}
      />
    );
  }

  return (
    <OnboardingFrame
      kind={kind}
      organizationLabel={organizationLabel}
      entityLabel={entityLabel}
      userName={userName}
      steps={steps}
      stepDescriptions={stepDescriptions}
      currentStepIndex={currentStepIndex}
      completedSteps={completedSteps}
      completionPercentage={completionPercentage}
      contentWidthClassName={contentWidthClassName}
      saveState={saveState}
      launching={launching}
      errorMessage={errorMessage}
      setCurrentStepIndex={setCurrentStepIndex}
      handleContinue={handleContinue}
      handleLaunch={() => void handleLaunch()}
    >
      <form
        ref={stepFormRef}
        onSubmit={(event) => event.preventDefault()}
        className="flex min-h-0 flex-col"
      >
      {currentStep.id === "profile" ? (
        <ProfileStep
          data={data}
          kind={kind}
          organizationId={storageId}
          updateProfile={updateProfile}
        />
      ) : null}

      {currentStep.id === "contact" ? (
        <ContactStep data={data} updateProfile={updateProfile} />
      ) : null}

      {currentStep.id === "locations" ? (
        <LocationsStep data={data} kind={kind} setData={setData} />
      ) : null}

      {currentStep.id === "workingHours" ? (
        <WorkingHoursStep data={data} setData={setData} />
      ) : null}

      {currentStep.id === "departments" ? (
        <DepartmentsStep
          data={data}
          kind={kind}
          organizationId={storageId}
          setData={setData}
        />
      ) : null}

      {currentStep.id === "doctors" ? (
        <DoctorsStep data={data} setData={setData} organizationId={storageId} />
      ) : null}

      {currentStep.id === "public" ? (
        <PublicProfileStep data={data} setData={setData} />
      ) : null}

      {currentStep.id === "review" ? (
        <ReviewStep
          completionPercentage={completionPercentage}
          data={data}
          kind={kind}
          summary={summary}
        />
      ) : null}
      </form>
    </OnboardingFrame>
  );
}
