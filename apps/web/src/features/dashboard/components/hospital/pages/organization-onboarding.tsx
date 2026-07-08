"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Cloud,
  Edit3,
  FileSpreadsheet,
  Globe2,
  Hospital,
  ImagePlus,
  Loader2,
  MapPin,
  Moon,
  Phone,
  Plus,
  RotateCw,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  Trash2,
  Upload,
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
  | "services"
  | "doctors"
  | "staff"
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

type InviteDoctor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
};

type StaffInvite = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "Pending" | "Resent";
};

type WorkingDay = {
  day: string;
  open: string;
  close: string;
  holiday: boolean;
};

type OnboardingState = {
  profile: {
    hospitalName: string;
    logoName: string;
    coverName: string;
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
  services: string[];
  facilities: string[];
  doctors: InviteDoctor[];
  staff: StaffInvite[];
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
  { id: "services", label: "Services & Facilities", kicker: "Capability" },
  { id: "doctors", label: "Doctors", kicker: "Clinical team", optional: true },
  { id: "staff", label: "Staff", kicker: "Operations", optional: true },
  { id: "hours", label: "Working Hours", kicker: "Availability" },
  { id: "public", label: "Public Profile", kicker: "Viruj app" },
  { id: "review", label: "Review & Complete", kicker: "Launch" },
];

const stepDescriptions: Record<StepId, string> = {
  profile: "Tell us about your hospital",
  locations: "Add branches and map locations",
  departments: "Choose the care units you operate",
  services: "Configure patient-facing services and facilities",
  doctors: "Invite doctors now or add them later",
  staff: "Invite the team that runs daily operations",
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

const defaultServices = [
  "OPD",
  "IPD",
  "Online Consultation",
  "Surgery",
  "Vaccination",
  "Health Checkups",
  "Home Collection",
  "Dialysis",
  "Physiotherapy",
  "Emergency Care",
];

const defaultFacilities = [
  "Pharmacy",
  "Laboratory",
  "ICU",
  "Blood Bank",
  "Ambulance",
  "Parking",
  "Cafeteria",
  "Waiting Lounge",
  "Wheelchair Access",
  "Emergency Ward",
];

const staffRoles = [
  "Finance Manager",
  "Appointment Manager",
  "Receptionist",
  "Community Manager",
  "HR",
  "Lab Technician",
  "Radiology Staff",
  "Pharmacist",
];

const publicOptions = [
  ["showHospitalProfile", "Show Hospital Profile"],
  ["acceptOnlineAppointments", "Accept Online Appointments"],
  ["displayDoctors", "Display Doctors"],
  ["displayDepartments", "Display Departments"],
  ["displayFacilities", "Display Facilities"],
  ["displayServices", "Display Services"],
  ["allowReviews", "Allow Reviews"],
  ["enableCommunity", "Enable Community"],
  ["enableEmergencyContact", "Enable Emergency Contact"],
] as const;

const storagePrefix = "viruj:hospital-onboarding";

export function OrganizationOnboardingPage({
  hospitalId,
  organizationLabel,
  userName,
}: {
  hospitalId?: string;
  organizationLabel: string;
  userName: string;
}) {
  const router = useRouter();
  const storageKey = `${storagePrefix}:draft:${hospitalId ?? "workspace"}`;
  const completeKey = `${storagePrefix}:completed:${hospitalId ?? "workspace"}`;
  const [data, setData] = useState<OnboardingState>(getDefaultOnboardingState);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);
  const [skippedSteps, setSkippedSteps] = useState<StepId[]>([]);
  const [customDepartment, setCustomDepartment] = useState("");
  const [customService, setCustomService] = useState("");
  const [customFacility, setCustomFacility] = useState("");
  const [inviteDraft, setInviteDraft] = useState(getEmptyDoctorInvite);
  const [staffDraft, setStaffDraft] = useState(getEmptyStaffInvite);
  const [bulkImport, setBulkImport] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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
  const progressCount = new Set([...completedSteps, ...skippedSteps]).size;
  const completionPercentage = Math.round((progressCount / steps.length) * 100);
  const enabledDepartments = data.departments.filter(
    (department) => !data.disabledDepartments.includes(department)
  );
  const activeServices = data.services;
  const activeFacilities = data.facilities;
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

      if (parsed.data) setData(mergeOnboardingState(parsed.data));
      if (typeof parsed.currentStepIndex === "number") {
        setCurrentStepIndex(Math.min(Math.max(parsed.currentStepIndex, 0), 8));
      }
      if (Array.isArray(parsed.completedSteps)) {
        setCompletedSteps(parsed.completedSteps);
      }
      if (Array.isArray(parsed.skippedSteps)) {
        setSkippedSteps(parsed.skippedSteps);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    setSaveState("saving");
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ completedSteps, currentStepIndex, data, skippedSteps })
      );
      setSaveState("saved");
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
      { label: "Facilities", value: activeFacilities.length.toString() },
      { label: "Services", value: activeServices.length.toString() },
      { label: "Doctors Invited", value: data.doctors.length.toString() },
      { label: "Staff Invited", value: data.staff.length.toString() },
      { label: "Branches", value: data.branches.length.toString() },
      {
        label: "Public Profile",
        value: data.publicProfile.showHospitalProfile ? "Enabled" : "Hidden",
      },
    ],
    [
      activeFacilities.length,
      activeServices.length,
      data.branches.length,
      data.doctors.length,
      data.profile.hospitalName,
      data.publicProfile.showHospitalProfile,
      data.staff.length,
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
                    body: "You can enter the ERP now. The dashboard will show a setup checklist for anything skipped.",
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
                        <ProfileStep data={data} updateProfile={updateProfile} />
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

                      {currentStep.id === "services" ? (
                        <ServicesStep
                          customFacility={customFacility}
                          customService={customService}
                          data={data}
                          searchTerm={searchTerm}
                          setCustomFacility={setCustomFacility}
                          setCustomService={setCustomService}
                          setData={setData}
                          setSearchTerm={setSearchTerm}
                        />
                      ) : null}

                      {currentStep.id === "doctors" ? (
                        <DoctorsStep
                          bulkImport={bulkImport}
                          data={data}
                          inviteDraft={inviteDraft}
                          setBulkImport={setBulkImport}
                          setData={setData}
                          setInviteDraft={setInviteDraft}
                        />
                      ) : null}

                      {currentStep.id === "staff" ? (
                        <StaffStep
                          data={data}
                          setData={setData}
                          setStaffDraft={setStaffDraft}
                          staffDraft={staffDraft}
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
  updateProfile,
}: {
  data: OnboardingState;
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
          onChange={(value) => updateProfile("logoName", value)}
        />
        <UploadField
          label="Cover Image"
          name={data.profile.coverName}
          onChange={(value) => updateProfile("coverName", value)}
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
          <div className="relative h-36 bg-[linear-gradient(135deg,#d7f5ff,#b8dfff_45%,#062f28)]">
            <div className="absolute bottom-4 left-4 flex size-16 items-center justify-center rounded-2xl bg-white text-[#062f28] shadow-xl">
              <Hospital size={28} />
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
                "A trusted healthcare institution configured on Viruj for appointments, departments, doctors, services, and patient engagement."}
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
  const updateBranch = (id: string, key: keyof Branch, value: string) => {
    setData((current) => ({
      ...current,
      branches: current.branches.map((branch) =>
        branch.id === id ? { ...branch, [key]: value } : branch
      ),
    }));
  };

  return (
    <div className="space-y-5">
      {data.branches.map((branch, index) => (
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
      ))}

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

function ServicesStep({
  customFacility,
  customService,
  data,
  searchTerm,
  setCustomFacility,
  setCustomService,
  setData,
  setSearchTerm,
}: {
  customFacility: string;
  customService: string;
  data: OnboardingState;
  searchTerm: string;
  setCustomFacility: (value: string) => void;
  setCustomService: (value: string) => void;
  setData: Dispatch<SetStateAction<OnboardingState>>;
  setSearchTerm: (value: string) => void;
}) {
  const visibleServices = defaultServices.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const visibleFacilities = defaultFacilities.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <label className="relative block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input
          className={fieldClassName("pl-11")}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search services or facilities"
          value={searchTerm}
        />
      </label>

      <CatalogSection
        customLabel="Custom Service"
        customValue={customService}
        items={visibleServices}
        selected={data.services}
        setCustomValue={setCustomService}
        title="Services"
        onAddCustom={() => {
          const value = customService.trim();
          if (!value) return;
          setData((current) => ({
            ...current,
            services: current.services.includes(value)
              ? current.services
              : [...current.services, value],
          }));
          setCustomService("");
        }}
        onToggle={(item) =>
          setData((current) => ({
            ...current,
            services: toggleListValue(current.services, item),
          }))
        }
      />

      <CatalogSection
        customLabel="Custom Facility"
        customValue={customFacility}
        items={visibleFacilities}
        selected={data.facilities}
        setCustomValue={setCustomFacility}
        title="Facilities"
        onAddCustom={() => {
          const value = customFacility.trim();
          if (!value) return;
          setData((current) => ({
            ...current,
            facilities: current.facilities.includes(value)
              ? current.facilities
              : [...current.facilities, value],
          }));
          setCustomFacility("");
        }}
        onToggle={(item) =>
          setData((current) => ({
            ...current,
            facilities: toggleListValue(current.facilities, item),
          }))
        }
      />
    </div>
  );
}

function DoctorsStep({
  bulkImport,
  data,
  inviteDraft,
  setBulkImport,
  setData,
  setInviteDraft,
}: {
  bulkImport: string;
  data: OnboardingState;
  inviteDraft: InviteDoctor;
  setBulkImport: (value: string) => void;
  setData: Dispatch<SetStateAction<OnboardingState>>;
  setInviteDraft: Dispatch<SetStateAction<InviteDoctor>>;
}) {
  const addDoctor = (doctor: InviteDoctor) => {
    if (!doctor.name.trim() || !doctor.email.trim()) return;
    setData((current) => ({
      ...current,
      doctors: [...current.doctors, { ...doctor, id: crypto.randomUUID() }],
    }));
    setInviteDraft(getEmptyDoctorInvite());
  };

  return (
    <div className="space-y-5">
      <section className="space-y-5">
        <div className="rounded-[26px] border border-slate-200/80 bg-white/76 p-5 dark:border-white/[0.10] dark:bg-white/[0.055]">
          <h3 className="font-headline text-xl font-semibold">Invite doctors</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <TextField
              label="Name"
              onChange={(value) =>
                setInviteDraft((current) => ({ ...current, name: value }))
              }
              placeholder="Dr. Aditi Rao"
              value={inviteDraft.name}
            />
            <TextField
              label="Email"
              onChange={(value) =>
                setInviteDraft((current) => ({ ...current, email: value }))
              }
              placeholder="aditi@hospital.co"
              type="email"
              value={inviteDraft.email}
            />
            <TextField
              label="Phone"
              onChange={(value) =>
                setInviteDraft((current) => ({ ...current, phone: value }))
              }
              placeholder="+91 90000 00000"
              value={inviteDraft.phone}
            />
            <SelectField
              label="Department"
              onChange={(value) =>
                setInviteDraft((current) => ({ ...current, department: value }))
              }
              options={data.departments}
              value={inviteDraft.department || data.departments[0]}
            />
            <TextField
              label="Specialization"
              onChange={(value) =>
                setInviteDraft((current) => ({
                  ...current,
                  specialization: value,
                }))
              }
              placeholder="Interventional Cardiology"
              value={inviteDraft.specialization}
            />
          </div>
          <button
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
            onClick={() =>
              addDoctor({
                ...inviteDraft,
                department: inviteDraft.department || data.departments[0],
              })
            }
            type="button"
          >
            <Plus size={17} />
            Add invitation
          </button>
        </div>

        <div className="rounded-[26px] border border-slate-200/80 bg-white/76 p-5 dark:border-white/[0.10] dark:bg-white/[0.055]">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="text-[#126c4f]" size={20} />
            <div>
              <h3 className="font-headline text-lg font-semibold">
                Bulk import support
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Paste one doctor per line: Name, Email, Phone, Department, Specialization
              </p>
            </div>
          </div>
          <textarea
            className={fieldClassName("mt-4 min-h-32 resize-none py-3")}
            onChange={(event) => setBulkImport(event.target.value)}
            placeholder="Dr. Karan Mehta, karan@hospital.co, +91..., Orthopedics, Joint replacement"
            value={bulkImport}
          />
          <button
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 text-sm font-bold text-[#126c4f] transition hover:-translate-y-0.5 dark:border-cyan-300/20 dark:bg-cyan-400/10 dark:text-cyan-200"
            onClick={() => {
              const imported = bulkImport
                .split(/\n+/)
                .map((line) => line.split(",").map((item) => item.trim()))
                .filter((parts) => parts[0] && parts[1])
                .map(([name, email, phone = "", department = "", specialization = ""]) => ({
                  department: department || data.departments[0],
                  email,
                  id: crypto.randomUUID(),
                  name,
                  phone,
                  specialization,
                }));
              setData((current) => ({
                ...current,
                doctors: [...current.doctors, ...imported],
              }));
              setBulkImport("");
            }}
            type="button"
          >
            <Upload size={16} />
            Import doctors
          </button>
        </div>
      </section>

      <InvitationList
        emptyCopy="No doctor invitations yet. You can skip this and invite doctors later."
        items={data.doctors.map((doctor) => ({
          id: doctor.id,
          meta: doctor.department,
          name: doctor.name,
          right: doctor.specialization || "Doctor",
        }))}
        title="Pending Doctor Invitations"
        onRemove={(id) =>
          setData((current) => ({
            ...current,
            doctors: current.doctors.filter((doctor) => doctor.id !== id),
          }))
        }
      />
    </div>
  );
}

function StaffStep({
  data,
  setData,
  setStaffDraft,
  staffDraft,
}: {
  data: OnboardingState;
  setData: Dispatch<SetStateAction<OnboardingState>>;
  setStaffDraft: Dispatch<SetStateAction<StaffInvite>>;
  staffDraft: StaffInvite;
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-slate-200/80 bg-white/76 p-5 dark:border-white/[0.10] dark:bg-white/[0.055]">
        <h3 className="font-headline text-xl font-semibold">
          Invite staff members
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextField
            label="Name"
            onChange={(value) =>
              setStaffDraft((current) => ({ ...current, name: value }))
            }
            placeholder="Meera Sharma"
            value={staffDraft.name}
          />
          <TextField
            label="Email"
            onChange={(value) =>
              setStaffDraft((current) => ({ ...current, email: value }))
            }
            placeholder="meera@hospital.co"
            type="email"
            value={staffDraft.email}
          />
          <SelectField
            label="Role"
            onChange={(value) =>
              setStaffDraft((current) => ({ ...current, role: value }))
            }
            options={staffRoles}
            value={staffDraft.role}
          />
          <SelectField
            label="Department"
            onChange={(value) =>
              setStaffDraft((current) => ({ ...current, department: value }))
            }
            options={data.departments}
            value={staffDraft.department || data.departments[0]}
          />
        </div>
        <button
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
          onClick={() => {
            if (!staffDraft.name.trim() || !staffDraft.email.trim()) return;
            setData((current) => ({
              ...current,
              staff: [
                ...current.staff,
                {
                  ...staffDraft,
                  department: staffDraft.department || data.departments[0],
                  id: crypto.randomUUID(),
                  status: "Pending",
                },
              ],
            }));
            setStaffDraft(getEmptyStaffInvite());
          }}
          type="button"
        >
          <Plus size={17} />
          Add staff invite
        </button>
      </section>

      <InvitationList
        emptyCopy="No staff invitations yet. Add operations users now or finish this later from Staff."
        items={data.staff.map((staff) => ({
          id: staff.id,
          meta: staff.role,
          name: staff.name,
          right: staff.status,
        }))}
        resend
        title="Pending Invitations"
        onRemove={(id) =>
          setData((current) => ({
            ...current,
            staff: current.staff.filter((staff) => staff.id !== id),
          }))
        }
        onResend={(id) =>
          setData((current) => ({
            ...current,
            staff: current.staff.map((staff) =>
              staff.id === id ? { ...staff, status: "Resent" } : staff
            ),
          }))
        }
      />
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
                data.publicProfile.displayDoctors &&
                  `${data.doctors.length || 8} doctors`,
                data.publicProfile.displayDepartments &&
                  `${data.departments.length} departments`,
                data.publicProfile.displayFacilities &&
                  `${data.facilities.length} facilities`,
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
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2">
        {summary.map((item) => (
          <div
            className="rounded-[24px] border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-white/[0.10] dark:bg-white/[0.055]"
            key={item.label}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 font-headline text-2xl font-semibold">
                  {item.value}
                </p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                <Check size={18} />
              </span>
            </div>
          </div>
        ))}
      </section>

      <aside className="h-fit rounded-[30px] bg-[#062f28] p-6 text-white shadow-[0_30px_90px_rgba(6,47,40,0.24)]">
        <HealthcareLaunchIllustration />
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-100/75">
          Ready to launch
        </p>
        <h3 className="mt-2 font-headline text-3xl font-semibold">
          {data.profile.hospitalName || "Your organization"} is configured.
        </h3>
        <p className="mt-3 text-sm font-medium text-cyan-50/75">
          {completionPercentage}% setup complete. Skipped items will appear as a
          setup checklist on the dashboard.
        </p>
        {skippedSteps.length ? (
          <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm font-semibold">
            Skipped:{" "}
            {skippedSteps
              .map((id) => steps.find((step) => step.id === id)?.label)
              .filter(Boolean)
              .join(", ")}
          </div>
        ) : null}
      </aside>
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
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border border-[#d5d6cf] bg-[#eeeeea] px-3.5 text-sm font-medium text-[#6d6f66] shadow-sm transition hover:border-[#c6d7cc] hover:bg-white">
        <span className="truncate">{name || "Choose file"}</span>
        <ImagePlus size={17} />
      </div>
      <input
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0]?.name ?? "")}
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
    case "services":
      if (data.services.length === 0 || data.facilities.length === 0) {
        return "Enable at least one service and one facility.";
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

function toggleListValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function getDefaultOnboardingState(): OnboardingState {
  return {
    branches: [getEmptyBranch(true)],
    departments: defaultDepartments,
    disabledDepartments: [],
    doctors: [],
    facilities: defaultFacilities,
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
      description: "",
      email: "",
      establishedYear: "",
      gstNumber: "",
      hospitalName: "",
      hospitalType: "Hospital",
      logoName: "",
      phone: "",
      registrationNumber: "",
      website: "",
    },
    publicProfile: Object.fromEntries(
      publicOptions.map(([key]) => [key, true])
    ) as Record<string, boolean>,
    services: defaultServices,
    staff: [],
  };
}

function mergeOnboardingState(state: OnboardingState) {
  const fallback = getDefaultOnboardingState();
  return {
    ...fallback,
    ...state,
    hours: {
      ...fallback.hours,
      ...state.hours,
      weekly: state.hours?.weekly?.length ? state.hours.weekly : fallback.hours.weekly,
    },
    profile: { ...fallback.profile, ...state.profile },
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

function getEmptyDoctorInvite(): InviteDoctor {
  return {
    department: "General Medicine",
    email: "",
    id: "",
    name: "",
    phone: "",
    specialization: "",
  };
}

function getEmptyStaffInvite(): StaffInvite {
  return {
    department: "General Medicine",
    email: "",
    id: "",
    name: "",
    role: "Receptionist",
    status: "Pending",
  };
}
