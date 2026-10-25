"use client";
import { useWorkspaceApproved } from "@/features/dashboard/lib/workspace-approval";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ErpSelect } from "@/components/ui/erp/select";
import { OnboardingFrame } from "../../hospital/pages/onboarding/onboarding-frame";
import { OnboardingSuccessScreen } from "../../hospital/pages/onboarding/onboarding-success-screen";
import {
  TextField,
  FieldLabel,
  fieldClassName,
} from "../../hospital/pages/onboarding/fields";
import {
  isValidPhone,
  webPhoneHtmlPattern,
  webPhoneInputTitle,
  webPhoneRequirement,
} from "../../hospital/pages/onboarding/state";
import type {
  StepDefinition,
  StepId,
} from "../../hospital/pages/onboarding/types";
import { DoctorProfessionalFields } from "./doctor-professional-fields";
import {
  DoctorRegistrationField,
  type RegistryRecord,
} from "../../shared/workspace/doctor-registration-field";
import {
  useDoctorQuery,
  useDoctorTenant,
  type DoctorProfile,
  type WorkLocation,
  type WorkingHours,
} from "@/features/dashboard/lib/doctor-workspace";
import { DoctorWorkingHoursFields } from "./doctor-working-hours";
import { doctorWorkspaceRequest, virujBackend } from "@/lib/viruj-backend";

const steps: StepDefinition[] = [
  { id: "profile", label: "Personal information", kicker: "Your identity" },
  { id: "doctors", label: "Professional credentials", kicker: "Your practice" },
  { id: "workingHours", label: "Availability & fees", kicker: "Your schedule" },
  { id: "review", label: "Review & submit", kicker: "Ready to begin" },
];
const descriptions: Record<StepId, string> = {
  profile: "Add your name, contact details and personal information",
  doctors: "Add your speciality, registration and license",
  locations: "Add the hospital, clinic or laboratory where you work",
  workingHours: "Set your consultation fees, duration and first availability",
  review: "Review your details before submitting your application",
  contact: "",
  clinicProfile: "",
  departments: "",
  services: "",
  public: "",
};
type Verification = {
  status: string;
  documents: { id: string; name?: string }[];
};
export function DoctorOnboardingGate({
  currentPage,
  organizationName,
  userName,
  userEmail,
  children,
}: {
  currentPage: string;
  organizationName: string;
  userName: string;
  userEmail: string;
  children: ReactNode;
}) {
  const tenant = useDoctorTenant();
  const router = useRouter();
  const completion = useDoctorQuery<{ percentage: number }>(
    "/doctor/profile/completion"
  );
  const approved = useWorkspaceApproved(tenant.organizationId);
  const needsSetup =
    !approved && (completion.data ? completion.data.percentage < 100 : false);
  useEffect(() => {
    if (needsSetup && currentPage !== "onboarding")
      router.replace(tenant.buildRoute("onboarding"));
  }, [needsSetup, currentPage, router, tenant]);
  if (approved) return children;
  if (completion.isPending)
    return (
      <div
        className="vh-onboarding vh-onboarding--doctor min-h-screen bg-[var(--onboarding-page)] p-8 text-[var(--onboarding-text)]"
        role="status"
      >
        Loading your practice…
      </div>
    );
  if (completion.isError)
    return (
      <div className="vh-onboarding vh-onboarding--doctor grid min-h-screen place-items-center bg-[var(--onboarding-page)] p-6">
        <div className="space-y-4 rounded-2xl bg-[var(--onboarding-panel)] p-8 text-[var(--onboarding-text)]">
          <h1 className="text-xl font-semibold">
            Unable to load your doctor workspace
          </h1>
          <p role="alert">{completion.error.message}</p>
          <Button onClick={() => void completion.refetch()}>Retry</Button>
        </div>
      </div>
    );
  if (currentPage === "onboarding" || needsSetup)
    return (
      <DoctorOnboarding
        organizationName={organizationName}
        userName={userName}
        userEmail={userEmail}
      />
    );
  return children;
}
export function DoctorOnboarding({
  organizationName = "Doctor practice",
  userName = "Doctor",
  userEmail = "",
}: {
  organizationName?: string;
  userName?: string;
  userEmail?: string;
}) {
  const profile = useDoctorQuery<DoctorProfile>("/doctor/profile");
  const locations = useDoctorQuery<WorkLocation[]>("/doctor/locations");
  const workingHours = useDoctorQuery<WorkingHours[]>("/doctor/working-hours");
  const verification = useDoctorQuery<Verification>("/doctor/verification");
  const failed = [profile, locations, verification, workingHours].find(
    (q) => q.isError
  );
  if (failed)
    return (
      <div className="vh-onboarding vh-onboarding--doctor min-h-screen bg-[var(--onboarding-shell)] p-8 text-[var(--onboarding-text)]">
        <p role="alert">Unable to load saved doctor setup.</p>
        <Button onClick={() => void failed.refetch()}>Retry</Button>
      </div>
    );
  if (
    !profile.data ||
    !locations.data ||
    !verification.data ||
    !workingHours.data
  )
    return (
      <div
        className="vh-onboarding vh-onboarding--doctor min-h-screen bg-[var(--onboarding-shell)] p-8 text-[var(--onboarding-text)]"
        role="status"
      >
        Loading saved setup…
      </div>
    );
  return (
    <DoctorSetup
      key={profile.data.id}
      initial={profile.data}
      existingLocations={locations.data}
      initialHours={workingHours.data}
      verification={verification.data}
      refreshDocuments={() => verification.refetch()}
      organizationName={organizationName}
      userName={userName}
      userEmail={userEmail}
    />
  );
}
export function doctorRegistryFields(
  record: RegistryRecord
): Partial<DoctorProfile> {
  const degree = record.qualification.replace(/[.\s]/g, "").toUpperCase();
  return {
    fullName: record.name,
    medicalRegistrationNumber: record.registrationNumber,
    medicalCouncil: record.medicalCouncil,
    ...(record.qualification.trim()
      ? {
          qualification: ["MBBS", "MD", "MS"].includes(degree)
            ? degree
            : record.qualification,
        }
      : {}),
  };
}
export function DoctorCredentialsFields({
  profile,
  onChange,
}: {
  profile: DoctorProfile;
  onChange: (patch: Partial<DoctorProfile>) => void;
}) {
  const tenant = useDoctorTenant();
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <DoctorRegistrationField
        value={profile.medicalRegistrationNumber || ""}
        organizationId={tenant.organizationId}
        onChange={(medicalRegistrationNumber) =>
          onChange({ medicalRegistrationNumber })
        }
        onSelect={(record) => onChange(doctorRegistryFields(record))}
      />
      <TextField
        required
        label="Medical council"
        placeholder="Medical council"
        value={profile.medicalCouncil || ""}
        onChange={(medicalCouncil) => onChange({ medicalCouncil })}
      />
      <DoctorProfessionalFields profile={profile} onChange={onChange} />
    </div>
  );
}
function DoctorSetup({
  initial,
  existingLocations,
  initialHours,
  verification,
  refreshDocuments,
  organizationName,
  userName,
  userEmail,
}: {
  initial: DoctorProfile;
  existingLocations: WorkLocation[];
  initialHours: WorkingHours[];
  verification: Verification;
  refreshDocuments: () => Promise<unknown>;
  organizationName: string;
  userName: string;
  userEmail: string;
}) {
  const tenant = useDoctorTenant();
  const router = useRouter();
  const client = useQueryClient();
  const form = useRef<HTMLFormElement>(null);
  const approved = useWorkspaceApproved(tenant.organizationId);
  const [profile, setProfile] = useState<DoctorProfile>({
    ...initial,
    fullName:
      initial.fullName === "Individual Doctor" ? userName : initial.fullName,
    email: initial.email || userEmail,
  });
  const [schedule, setSchedule] = useState<WorkingHours[]>(initialHours);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const birth = profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined;
  const today = new Date();
  const isValidBirth =
    birth instanceof Date &&
    !Number.isNaN(birth.getTime()) &&
    birth.getTime() <= today.getTime();
  const age =
    birth && isValidBirth
      ? today.getFullYear() -
        birth.getFullYear() -
        (today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() &&
          today.getDate() < birth.getDate())
          ? 1
          : 0)
      : undefined;
  const draftKey = `viruj:doctor-onboarding:v2:draft:${tenant.organizationId}`;
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw) as {
          profile?: DoctorProfile;
          schedule?: WorkingHours[];
          step?: number;
        };
        if (draft.profile) setProfile(draft.profile);
        if (Array.isArray(draft.schedule)) setSchedule(draft.schedule);
        if (Number.isInteger(draft.step))
          setStep(Math.min(3, Math.max(0, draft.step || 0)));
      }
    } catch {
      setError(
        "Your local draft could not be restored. Saved server details are still available."
      );
    } finally {
      setDraftReady(true);
    }
  }, [draftKey]);
  useEffect(() => {
    if (!draftReady || complete) return;
    setDraftSaved(false);
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          draftKey,
          JSON.stringify({ profile, schedule, step })
        );
        setDraftSaved(true);
      } catch {
        setError(
          "Unable to save a local draft. Keep this page open until you submit your application."
        );
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [draftReady, complete, draftKey, profile, schedule, step]);
  const update = <K extends keyof DoctorProfile>(
    key: K,
    value: DoctorProfile[K]
  ) => {
    setError("");
    setProfile((p) => ({ ...p, [key]: value }));
  };
  function field(
    key: keyof DoctorProfile,
    label: string,
    type = "text",
    required = true
  ) {
    const value = profile[key];
    return (
      <TextField
        label={label}
        placeholder={label}
        required={required}
        type={type}
        value={
          typeof value === "string" || typeof value === "number"
            ? String(value)
            : ""
        }
        min={
          type === "number"
            ? key === "consultationDurationMinutes"
              ? 5
              : 0
            : undefined
        }
        max={
          key === "consultationDurationMinutes"
            ? 240
            : key === "yearsOfExperience"
              ? 100
              : undefined
        }
        step={key === "consultationFee" ? 0.01 : undefined}
        onChange={(v) =>
          update(
            key,
            type === "number" ? (v === "" ? undefined : Number(v)) : v
          )
        }
      />
    );
  }
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      await virujBackend.doctorDocuments.upload(file, tenant.organizationId);
      await refreshDocuments();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to upload license");
    } finally {
      setBusy(false);
    }
  }
  async function next() {
    setError("");
    if (!form.current?.reportValidity()) return;
    if (step === 0) {
      if (profile.dateOfBirth) {
        const birthDate = new Date(profile.dateOfBirth);
        if (Number.isNaN(birthDate.getTime())) {
          setError("Enter a valid date of birth.");
          return;
        }
        if (birthDate.getTime() > Date.now()) {
          setError("Date of birth cannot be in the future.");
          return;
        }
        if (birthDate.getFullYear() < 1900) {
          setError("Date of birth must be 1900 or later.");
          return;
        }
      }
      if (profile.phone && !isValidPhone(profile.phone)) {
        setError(`Enter a valid phone number ${webPhoneRequirement}.`);
        return;
      }
    }
    setStep((s) => Math.min(3, s + 1));
  }
  async function launch() {
    setBusy(true);
    setError("");
    try {
      await doctorWorkspaceRequest(
        "/doctor/profile",
        tenant.organizationId,
        profile,
        "PATCH"
      );
      await doctorWorkspaceRequest(
        "/doctor/working-hours",
        tenant.organizationId,
        schedule,
        "PATCH"
      );
      await client.invalidateQueries({
        queryKey: ["doctor-workspace", tenant.organizationId],
      });
      localStorage.removeItem(draftKey);
      setComplete(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to complete setup");
    } finally {
      setBusy(false);
    }
  }
  const summary = [
    { label: "Doctor", value: profile.fullName },
    { label: "Speciality", value: profile.specialization || "" },
    {
      label: "Consultation",
      value: `INR ${profile.consultationFee ?? 0} · ${profile.consultationDurationMinutes || 0} min`,
    },
  ];
  if (complete)
    return (
      <OnboardingSuccessScreen
        kind="doctor"
        completionPercentage={100}
        hospitalName={profile.fullName}
        onContinue={() => router.replace(tenant.buildRoute("dashboard"))}
        summary={summary}
      />
    );
  return (
    <OnboardingFrame
      kind="doctor"
      organizationLabel={organizationName}
      entityLabel="doctor"
      userName={userName}
      steps={steps}
      stepDescriptions={descriptions}
      currentStepIndex={step}
      completedSteps={steps.slice(0, step).map((s) => s.id)}
      completionPercentage={Math.round((step / 3) * 100)}
      contentWidthClassName="max-w-[820px] xl:max-w-[900px]"
      saveState={busy ? "saving" : draftSaved ? "saved" : "idle"}
      launching={busy}
      errorMessage={error}
      setCurrentStepIndex={setStep}
      handleContinue={() => void next()}
      handleLaunch={() => void launch()}
    >
      <form
        ref={form}
        className="space-y-6 pb-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 3) void launch();
          else void next();
        }}
      >
        {step === 0 && (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {field("fullName", "Full name")}
              <div>
                <TextField
                  label="Date of birth (optional)"
                  placeholder="Date of birth (optional)"
                  type="date"
                  min="1900-01-01"
                  max={new Date().toISOString().slice(0, 10)}
                  value={profile.dateOfBirth ?? ""}
                  onChange={(dateOfBirth) => update("dateOfBirth", dateOfBirth)}
                />
                {age !== undefined && (
                  <p className="mt-2 text-xs text-[var(--onboarding-muted)]">
                    Age: {age} years
                  </p>
                )}
              </div>
              <label>
                <FieldLabel required>Gender</FieldLabel>
                <ErpSelect
                  required
                  className={fieldClassName()}
                  value={profile.gender || ""}
                  onChange={(e) => update("gender", e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="unspecified">Prefer not to say</option>
                </ErpSelect>
              </label>
              <TextField
                label="Phone number"
                placeholder="Phone number"
                required
                type="tel"
                pattern={webPhoneHtmlPattern}
                title={webPhoneInputTitle}
                value={profile.phone ?? ""}
                onChange={(phone) => update("phone", phone)}
              />
              {field("email", "Email", "email")}
              <TextField
                label="Languages (optional)"
                placeholder="English, Hindi"
                value={profile.languages.join(",")}
                onChange={(v) =>
                  update(
                    "languages",
                    v
                      .split(",")
                      .map((value) => value.trim())
                      .filter(Boolean)
                  )
                }
              />
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <DoctorCredentialsFields
              profile={profile}
              onChange={(patch) => {
                setError("");
                setProfile((p) => ({ ...p, ...patch }));
              }}
            />
            <label className="block">
              <FieldLabel>
                License / registration certificate (optional)
              </FieldLabel>
              <input
                className={fieldClassName("h-auto py-3")}
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                disabled={busy}
                onChange={(e) => void upload(e.target.files?.[0])}
              />
              <p className="mt-2 text-xs text-[var(--onboarding-muted)]">
                PDF, JPG or PNG · up to 5 MB · {verification.documents.length}{" "}
                document(s) uploaded
              </p>
            </label>
            <p className="text-sm text-[var(--onboarding-muted)]">
              Credentials remain pending review until approved. Your uploaded
              license is private.
            </p>
          </>
        )}
        {step === 2 && (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {field("consultationFee", "Consultation fee (INR)", "number")}
              {field(
                "consultationDurationMinutes",
                "Consultation duration (minutes)",
                "number"
              )}
            </div>
            <DoctorWorkingHoursFields
              locations={existingLocations}
              value={schedule}
              onChange={setSchedule}
            />
          </>
        )}
        {step === 3 && (
          <>
            <dl className="divide-y divide-[var(--onboarding-border)] rounded-xl border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] px-5">
              {[
                ...summary,
                {
                  label: "Registration",
                  value: `${profile.medicalRegistrationNumber} · ${profile.medicalCouncil}`,
                },
                {
                  label: "Availability",
                  value: schedule.length
                    ? schedule
                        .map(
                          (s) =>
                            `${existingLocations.find((l) => l.id === s.locationId)?.name || "General availability"}: ${s.days.map((d) => d.slice(0, 3)).join(", ")} ${s.startTime}–${s.endTime} IST`
                        )
                        .join("; ")
                    : "Set working hours after an organisation adds you",
                },
                {
                  label: "Credentials",
                  value: verification.documents.length
                    ? `${verification.documents.length} uploaded · pending review`
                    : "Not uploaded (optional)",
                },
              ].map((row) => (
                <div
                  className="grid gap-2 py-4 text-sm sm:grid-cols-[140px_1fr]"
                  key={row.label}
                >
                  <dt className="text-[var(--onboarding-muted)]">
                    {row.label}
                  </dt>
                  <dd className="font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm text-[var(--onboarding-muted)]">
              {approved ? "Save changes updates" : "Submit for review saves"}{" "}
              your professional profile and availability. Registry errors appear
              here so you can correct the details without losing your draft.
            </p>
          </>
        )}
      </form>
    </OnboardingFrame>
  );
}
