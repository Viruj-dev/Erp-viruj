"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/erp/checkbox";
import { ErpSelect } from "@/components/ui/erp/select";
import { OnboardingFrame } from "../../hospital/pages/onboarding/onboarding-frame";
import { OnboardingSuccessScreen } from "../../hospital/pages/onboarding/onboarding-success-screen";
import {
  TextField,
  FieldLabel,
  fieldClassName,
} from "../../hospital/pages/onboarding/fields";
import { TimePicker } from "../../hospital/pages/onboarding/time-picker";
import type {
  StepDefinition,
  StepId,
} from "../../hospital/pages/onboarding/types";
import {
  DoctorProfessionalFields,
  DoctorDepartmentSelect,
} from "./doctor-professional-fields";
import {
  DoctorRegistrationField,
  type RegistryRecord,
} from "../../shared/workspace/doctor-registration-field";
import {
  useDoctorQuery,
  useDoctorTenant,
  type DoctorProfile,
  type WorkLocation,
  type CalendarEvent,
} from "@/features/dashboard/lib/doctor-workspace";
import { doctorWorkspaceRequest, virujBackend } from "@/lib/viruj-backend";

const steps: StepDefinition[] = [
  { id: "profile", label: "Personal information", kicker: "Your identity" },
  { id: "doctors", label: "Professional credentials", kicker: "Your practice" },
  { id: "locations", label: "Work locations", kicker: "Where you work" },
  { id: "workingHours", label: "Availability & fees", kicker: "Your schedule" },
  { id: "review", label: "Review & launch", kicker: "Ready to begin" },
];
const descriptions: Record<StepId, string> = {
  profile: "Add your name, contact details and personal information",
  doctors: "Add your speciality, registration and license",
  locations: "Add the hospital, clinic or laboratory where you work",
  workingHours: "Set your consultation fees, duration and first availability",
  review: "Review your details before opening your ERP",
  contact: "",
  clinicProfile: "",
  departments: "",
  services: "",
  public: "",
};
const days = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];
type Verification = {
  status: string;
  documents: { id: string; name?: string }[];
};
type Schedule = { days: string[]; startTime: string; endTime: string };
const emptyLocation: WorkLocation = {
  id: "",
  name: "",
  type: "HOSPITAL",
  post: "",
  position: "",
  department: "",
  currentlyWorking: true,
  addressLine1: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
};
export function doctorSessionDate(day: string, now = new Date()) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const date = new Date(`${today}T00:00:00Z`);
  const offset = (((days.indexOf(day) + 1) % 7) - date.getUTCDay() + 7) % 7;
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}
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
  const needsSetup = completion.data ? completion.data.percentage < 100 : false;
  useEffect(() => {
    if (needsSetup && currentPage !== "onboarding")
      router.replace(tenant.buildRoute("onboarding"));
  }, [needsSetup, currentPage, router, tenant]);
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
  const verification = useDoctorQuery<Verification>("/doctor/verification");
  const failed = [profile, locations, verification].find((q) => q.isError);
  if (failed)
    return (
      <div className="vh-onboarding vh-onboarding--doctor min-h-screen bg-[var(--onboarding-shell)] p-8 text-[var(--onboarding-text)]">
        <p role="alert">Unable to load saved doctor setup.</p>
        <Button onClick={() => void failed.refetch()}>Retry</Button>
      </div>
    );
  if (!profile.data || !locations.data || !verification.data)
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
  verification,
  refreshDocuments,
  organizationName,
  userName,
  userEmail,
}: {
  initial: DoctorProfile;
  existingLocations: WorkLocation[];
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
  const [profile, setProfile] = useState<DoctorProfile>({
    ...initial,
    fullName:
      initial.fullName === "Individual Doctor" ? userName : initial.fullName,
    email: initial.email || userEmail,
  });
  const [location, setLocation] = useState<WorkLocation>(
    existingLocations[0] || { ...emptyLocation }
  );
  const [schedule, setSchedule] = useState<Schedule>({
    days: ["MONDAY"],
    startTime: "09:00",
    endTime: "13:00",
  });
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const birth = profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined;
  const today = new Date();
  const age = birth
    ? today.getFullYear() -
      birth.getFullYear() -
      (today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() < birth.getDate())
        ? 1
        : 0)
    : undefined;
  const draftKey = `viruj:doctor-onboarding:draft:${tenant.organizationId}`;
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw) as {
          profile?: DoctorProfile;
          location?: WorkLocation;
          schedule?: Schedule;
          step?: number;
        };
        if (draft.profile) setProfile(draft.profile);
        if (draft.location) setLocation(draft.location);
        if (draft.schedule) setSchedule(draft.schedule);
        if (Number.isInteger(draft.step))
          setStep(Math.min(4, Math.max(0, draft.step || 0)));
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
          JSON.stringify({ profile, location, schedule, step })
        );
        setDraftSaved(true);
      } catch {
        setError(
          "Unable to save a local draft. Keep this page open until you launch your ERP."
        );
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [draftReady, complete, draftKey, profile, location, schedule, step]);
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
  const locationField = (key: keyof WorkLocation, label: string) => (
    <TextField
      required
      label={label}
      placeholder={label}
      value={String(location[key] ?? "")}
      onChange={(v) => setLocation((l) => ({ ...l, [key]: v }))}
    />
  );
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
    if (
      step === 3 &&
      (!schedule.days.length || schedule.endTime <= schedule.startTime)
    ) {
      setError("Choose at least one day and an end time after the start time.");
      return;
    }
    setBusy(true);
    try {
      if (step === 2) {
        const saved = await doctorWorkspaceRequest<WorkLocation>(
          `/doctor/locations${location.id ? `/${location.id}` : ""}`,
          tenant.organizationId,
          location,
          location.id ? "PATCH" : "POST"
        );
        setLocation(saved);
      }
      setStep((s) => Math.min(4, s + 1));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save this step");
    } finally {
      setBusy(false);
    }
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
      if (location.type === "PERSONAL_PRACTICE") {
        const saved = await doctorWorkspaceRequest<
          {
            locationId: string;
            dayOfWeek: string;
            startTime: string;
            endTime: string;
          }[]
        >("/doctor/availability", tenant.organizationId);
        for (const day of schedule.days)
          if (
            !saved.some(
              (s) =>
                s.locationId === location.id &&
                s.dayOfWeek === day &&
                s.startTime === schedule.startTime &&
                s.endTime === schedule.endTime
            )
          )
            await doctorWorkspaceRequest(
              "/doctor/availability",
              tenant.organizationId,
              {
                locationId: location.id,
                dayOfWeek: day,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                slotDurationMinutes: profile.consultationDurationMinutes,
                isActive: true,
              },
              "POST"
            );
      } else {
        const saved = await doctorWorkspaceRequest<CalendarEvent[]>(
          "/doctor/calendar",
          tenant.organizationId
        );
        for (const day of schedule.days) {
          const date = doctorSessionDate(day);
          const startsAt = new Date(
            `${date}T${schedule.startTime}:00+05:30`
          ).toISOString();
          const endsAt = new Date(
            `${date}T${schedule.endTime}:00+05:30`
          ).toISOString();
          if (
            !saved.some(
              (s) =>
                s.locationId === location.id &&
                s.startsAt === startsAt &&
                s.endsAt === endsAt
            )
          )
            await doctorWorkspaceRequest(
              "/doctor/calendar",
              tenant.organizationId,
              {
                title: `Consultations at ${location.name}`,
                locationId: location.id,
                startsAt,
                endsAt,
                notes: "",
                pinned: false,
                highlight: "green",
                reminderMinutes: 15,
                patientsAttended: 0,
              },
              "POST"
            );
        }
      }
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
    { label: "Workplace", value: location.name },
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
      completionPercentage={step * 25}
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
          if (step === 4) void launch();
          else void next();
        }}
      >
        {step === 0 && (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {field("fullName", "Full name")}
              <div>
                {field(
                  "dateOfBirth",
                  "Date of birth (optional)",
                  "date",
                  false
                )}
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
              {field("phone", "Phone number", "tel")}
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
              <label>
                <FieldLabel required>Organisation type</FieldLabel>
                <ErpSelect
                  className={fieldClassName()}
                  value={location.type}
                  disabled={!!location.id}
                  onChange={(e) =>
                    setLocation((l) => ({ ...l, type: e.target.value }))
                  }
                >
                  <option value="HOSPITAL">Hospital</option>
                  <option value="CLINIC">Clinic</option>
                  <option value="LAB">Laboratory</option>
                  <option value="PERSONAL_PRACTICE">Personal practice</option>
                </ErpSelect>
              </label>
              {locationField("name", "Organisation name")}
              {locationField("post", "Post")}
              {locationField("position", "Position")}
              <DoctorDepartmentSelect
                value={location.department || ""}
                onChange={(department) =>
                  setLocation((l) => ({ ...l, department }))
                }
              />
              {locationField("addressLine1", "Street address")}
              {locationField("city", "City")}
              {locationField("state", "State")}
              {locationField("postalCode", "Postal code")}
              {locationField("country", "Country")}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={location.currentlyWorking !== false}
                onCheckedChange={(checked) =>
                  setLocation((l) => ({
                    ...l,
                    currentlyWorking: checked === true,
                  }))
                }
              />
              Currently working here
            </label>
          </>
        )}
        {step === 3 && (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {field("consultationFee", "Consultation fee (INR)", "number")}
              {field(
                "consultationDurationMinutes",
                "Consultation duration (minutes)",
                "number"
              )}
            </div>
            <div>
              <FieldLabel required>Available days</FieldLabel>
              <div className="flex flex-wrap gap-3">
                {days.map((day) => (
                  <label
                    className="flex items-center gap-2 rounded-lg border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] px-3 py-2 text-sm"
                    key={day}
                  >
                    <Checkbox
                      checked={schedule.days.includes(day)}
                      onCheckedChange={(checked) =>
                        setSchedule((s) => ({
                          ...s,
                          days: checked
                            ? [...s.days, day]
                            : s.days.filter((d) => d !== day),
                        }))
                      }
                    />
                    {day.slice(0, 3)}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <TimePicker
                label="Available from"
                value={schedule.startTime}
                onChange={(v) => setSchedule((s) => ({ ...s, startTime: v }))}
                themeClassName="vh-onboarding--doctor"
              />
              <TimePicker
                label="Available until"
                value={schedule.endTime}
                onChange={(v) => setSchedule((s) => ({ ...s, endTime: v }))}
                themeClassName="vh-onboarding--doctor"
              />
            </div>
            <p className="text-sm text-[var(--onboarding-muted)]">
              Times are in Indian Standard Time.{" "}
              {location.type === "PERSONAL_PRACTICE"
                ? "These hours repeat weekly for your personal-practice bookings."
                : "Your selected sessions are added to the calendar for the coming 7 days. The organisation manages its patient booking hours."}{" "}
              You can manage more locations and dates in Availability after
              setup.
            </p>
          </>
        )}
        {step === 4 && (
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
                  value: `${schedule.days.map((d) => d.slice(0, 3)).join(", ")} · ${schedule.startTime}–${schedule.endTime} IST`,
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
              Launch ERP saves your professional profile and availability.
              Registry errors appear here so you can correct the details without
              losing your draft.
            </p>
          </>
        )}
      </form>
    </OnboardingFrame>
  );
}
