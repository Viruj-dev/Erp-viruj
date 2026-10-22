"use client";

import { PageSkeleton } from "@/features/dashboard/components/shared/page-skeleton";
import {
  UploadField,
  TextField,
  FieldLabel,
  fieldClassName
} from "@/features/dashboard/components/hospital/pages/onboarding/fields";
import { TimePicker } from "@/features/dashboard/components/hospital/pages/onboarding/time-picker";
import {
  getCurrentPosition,
  reverseGeocodeLocation
} from "@/features/dashboard/components/hospital/pages/onboarding/steps/locations-step";
import { OnboardingFrame } from "@/features/dashboard/components/hospital/pages/onboarding/onboarding-frame";
import { OnboardingSuccessScreen } from "@/features/dashboard/components/hospital/pages/onboarding/onboarding-success-screen";
import type {
  StepDefinition,
  StepId
} from "@/features/dashboard/components/hospital/pages/onboarding/types";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Clock3, Building2 } from "lucide-react";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import {
  canManageDiagnosticSetup,
  diagnosticSetupFields,
  diagnosticSetupKey,
  emptyDiagnosticSetup,
  type DiagnosticSetup,
  type DiagnosticOnboardingState
} from "@/features/dashboard/lib/diagnostic-onboarding";
import { virujBackend } from "@/lib/viruj-backend";

export function DiagnosticOnboarding({
  tenant,
  organizationName,
  userEmail = ""
}: {
  tenant: ErpTenantContext;
  organizationName?: string;
  userEmail?: string;
}) {
  const query = useQuery({
    queryKey: diagnosticSetupKey(tenant.organizationId),
    queryFn: () => virujBackend.diagnostics.onboarding(tenant.organizationId),
    enabled: canManageDiagnosticSetup(tenant.role),
    retry: false
  });
  if (!canManageDiagnosticSetup(tenant.role))
    return (
      <div className="m-auto max-w-lg rounded-2xl border p-8">
        <h1 className="text-xl font-semibold">
          Centre setup is managed by your administrator
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Contact an owner, admin or manager to update the business and clinical
          setup.
        </p>
      </div>
    );
  if (query.isPending) return <PageSkeleton />;
  if (query.isError)
    return (
      <div role="alert" className="m-auto space-y-4 rounded-2xl border p-8">
        <p>Unable to load saved setup: {query.error.message}</p>
        <Button onClick={() => void query.refetch()}>Try again</Button>
      </div>
    );
  return (
    <SetupForm
      key={tenant.organizationId}
      tenant={tenant}
      initial={query.data}
      organizationName={organizationName}
      userEmail={userEmail}
    />
  );
}

function SetupForm({
  tenant,
  initial,
  organizationName,
  userEmail
}: {
  tenant: ErpTenantContext;
  initial: DiagnosticOnboardingState;
  organizationName?: string;
  userEmail: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [complete, setComplete] = useState(false);
  const router = useRouter(),
    client = useQueryClient();
  const [data, setData] = useState<DiagnosticSetup>(() => ({
    ...emptyDiagnosticSetup(organizationName, userEmail),
    ...initial.data
  }));
  const [version, setVersion] = useState(initial.version),
    [step, setStep] = useState(0),
    [draftLoaded, setDraftLoaded] = useState(false),
    [draftSaving, setDraftSaving] = useState(false),
    [draftSaved, setDraftSaved] = useState(true),
    [validationError, setValidationError] = useState("");
  const pathology = tenant.providerType === "pathology";
  const draftKey = `viruj:diagnostic-onboarding:draft:${tenant.organizationId}`;
  const [locationStatus, setLocationStatus] = useState("");
  const [locating, setLocating] = useState(false);
  const steps = pathology
    ? ["Identity", "Branch", "Contact & hours", "Review"]
    : [
        "Centre identity",
        "Branch",
        "Contact & hours",
        "Reporting team",
        pathology ? "Laboratory setup" : "Imaging setup",
        "Review"
      ];
  const save = useMutation({
    mutationFn: (complete: boolean) =>
      virujBackend.diagnostics.saveOnboarding(
        tenant.organizationId,
        data,
        version,
        complete
      ),
    onSuccess: (result, complete) => {
      setVersion(result.version);
      setDraftSaved(true);
      client.setQueryData(diagnosticSetupKey(tenant.organizationId), result);
      if (complete) {
        window.localStorage.removeItem(draftKey);
        void client.invalidateQueries({
          queryKey: ["diagnostic-availability", tenant.organizationId]
        });
        setComplete(true);
      }
    }
  });
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(draftKey);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          data?: Partial<DiagnosticSetup>;
          step?: number;
        };
        if (parsed.data) setData((current) => ({ ...current, ...parsed.data }));
        if (Number.isInteger(parsed.step)) {
          setStep(Math.min(Math.max(parsed.step ?? 0, 0), steps.length - 1));
        }
      }
    } catch {
      window.localStorage.removeItem(draftKey);
    } finally {
      setDraftLoaded(true);
    }
  }, [draftKey, steps.length]);
  useEffect(() => {
    if (!draftLoaded || complete) return;
    setDraftSaving(true);
    const timeout = window.setTimeout(() => {
      try {
        window.localStorage.setItem(draftKey, JSON.stringify({ data, step }));
        setDraftSaved(true);
      } catch {
        setDraftSaved(false);
      } finally {
        setDraftSaving(false);
      }
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [complete, data, draftKey, draftLoaded, step]);
  const update = <K extends keyof DiagnosticSetup>(
    key: K,
    value: DiagnosticSetup[K]
  ) => {
    if (!save.isPending) save.reset();
    setDraftSaved(false);
    setValidationError("");
    setData((old) => ({ ...old, [key]: value }));
  };
  const field = (
    key: (typeof diagnosticSetupFields)[number],
    label: string,
    options: {
      required?: boolean;
      type?: string;
      multiline?: boolean;
      hint?: string;
    } = {}
  ) =>
    options.type === "time" ? (
      <TimePicker
        label={label}
        value={data[key]}
        required={options.required}
        onChange={(value) => update(key, value)}
        themeClassName={
          pathology ? "vh-onboarding--pathology" : "vh-onboarding--radiology"
        }
      />
    ) : (
      <div>
        {options.multiline ? (
          <label>
            <FieldLabel required={options.required}>{label}</FieldLabel>
            <textarea
              className={fieldClassName("min-h-24 py-3")}
              value={data[key]}
              required={options.required}
              maxLength={2000}
              onChange={(e) => update(key, e.target.value)}
            />
          </label>
        ) : (
          <TextField
            label={label}
            value={data[key]}
            onChange={(value) => update(key, value)}
            placeholder={label}
            type={options.type}
            required={options.required}
            min={key === "establishedYear" ? 1800 : undefined}
            max={
              key === "establishedYear" ? new Date().getFullYear() : undefined
            }
          />
        )}
        {options.hint && (
          <p className="mt-2 text-xs leading-5 text-[var(--onboarding-muted)]">
            {options.hint}
          </p>
        )}
      </div>
    );
  function choices(
    key: "sections" | "specimens" | "modalities" | "workingDays",
    labels: readonly string[]
  ) {
    return (
      <div className="flex flex-wrap gap-2">
        {labels.map((label) => (
          <label
            key={label}
            className="flex items-center gap-2 rounded-lg border border-[var(--onboarding-border)] bg-[var(--onboarding-panel-muted)] px-3 py-2 text-sm"
          >
            <input
              type="checkbox"
              className="accent-[var(--onboarding-accent)]"
              checked={data[key].includes(label)}
              onChange={(e) =>
                update(
                  key,
                  e.target.checked
                    ? [...data[key], label]
                    : data[key].filter((value) => value !== label)
                )
              }
            />
            {label}
          </label>
        ))}
      </div>
    );
  }
  const ids: StepId[] = pathology
    ? ["profile", "locations", "contact", "review"]
    : ["profile", "locations", "contact", "doctors", "departments", "review"];
  const kickers = pathology
    ? ["Identity", "Location", "Contact", "Launch"]
    : [
        "Identity",
        "Location",
        "Contact",
        "Clinical team",
        "Operations",
        "Launch"
      ];
  const definitions: StepDefinition[] = steps.map((label, index) => ({
    id: ids[index]!,
    label,
    kicker: kickers[index]!
  }));
  const descriptions = Object.fromEntries([
    ["profile", "Register the centre and facility credentials"],
    ["locations", "Locate your primary branch and confirm its address"],
    [
      "contact",
      pathology
        ? "Add contact details and choose your opening hours"
        : "Add the main branch, contact details and opening hours"
    ],
    ["doctors", "Add the professional responsible for approved reports"],
    [
      "departments",
      pathology
        ? "Choose lab sections, accepted samples and collection procedures"
        : "Choose imaging services, equipment and patient preparation"
    ],
    ["review", "Review the centre details before completing setup"]
  ]) as Record<StepId, string>;
  const themeClassName = pathology
    ? "vh-onboarding--pathology"
    : "vh-onboarding--radiology";
  const summary = [
    { label: "Centre", value: data.centreName || "Not provided" },
    { label: "Branch", value: data.branchName || "Not provided" },
    {
      label: pathology ? "Contact" : "Reporting professional",
      value: (pathology ? data.email : data.reportingName) || "Not provided"
    }
  ];
  const validateCurrentStep = () => {
    setValidationError("");
    if (!formRef.current?.reportValidity()) return false;
    if (step === 2) {
      if (data.workingDays.length === 0) {
        setValidationError("Select at least one working day to continue.");
        return false;
      }
      if (!data.openingTime || !data.closingTime) {
        setValidationError("Choose both opening and closing times.");
        return false;
      }
    }
    if (step === 4 && !pathology && data.modalities.length === 0) {
      setValidationError("Select at least one imaging modality.");
      return false;
    }
    return true;
  };
  const handleContinue = () => {
    if (!validateCurrentStep()) return;
    save.mutate(false, {
      onSuccess: () =>
        setStep((current) => Math.min(current + 1, steps.length - 1))
    });
  };
  const handleLaunch = () => {
    if (validateCurrentStep()) save.mutate(true);
  };

  async function locateBranch() {
    setLocating(true);
    setLocationStatus("Finding your branch location�");
    try {
      const position = await getCurrentPosition();
      const latitude = position.coords.latitude.toFixed(6);
      const longitude = position.coords.longitude.toFixed(6);
      update("latitude", latitude);
      update("longitude", longitude);
      update(
        "mapsLocation",
        `https://www.google.com/maps?q=${latitude},${longitude}`
      );
      const address = await reverseGeocodeLocation(latitude, longitude);
      setData((current) => ({
        ...current,
        address: address.address || current.address,
        city: address.city || current.city,
        state: address.state || current.state,
        postalCode: address.postalCode || current.postalCode
      }));
      setLocationStatus("Location found. Check the address before continuing.");
    } catch {
      setLocationStatus(
        "Unable to fetch location. Allow browser location access or enter your address manually."
      );
    } finally {
      setLocating(false);
    }
  }
  const upload = (kind: "logo" | "certificate") => (
    <UploadField
      label={kind === "logo" ? "Organization logo" : "License / certificate"}
      name={kind === "logo" ? data.logoName : data.certificateName}
      onChange={async ({ file, name, previewUrl }) => {
        try {
          const media = await virujBackend.organizationProfile.uploadMedia({
            file,
            kind,
            organizationId: tenant.organizationId
          });
          update(kind === "logo" ? "logoUrl" : "certificateUrl", media.url);
          update(kind === "logo" ? "logoName" : "certificateName", name);
        } finally {
          URL.revokeObjectURL(previewUrl);
        }
      }}
    />
  );
  if (complete) {
    return (
      <OnboardingSuccessScreen
        kind="hospital"
        themeClassName={themeClassName}
        completionPercentage={100}
        hospitalName={data.centreName}
        summary={summary}
        onContinue={() => router.push(tenant.buildRoute())}
      />
    );
  }

  return (
    <OnboardingFrame
      kind="hospital"
      themeClassName={themeClassName}
      organizationLabel={pathology ? "Pathology" : "Radiology"}
      entityLabel={pathology ? "organization" : "imaging centre"}
      userName={data.centreName || organizationName || "Administrator"}
      steps={definitions}
      stepDescriptions={descriptions}
      currentStepIndex={step}
      setCurrentStepIndex={(action) => {
        const next = typeof action === "function" ? action(step) : action;
        if (next <= step) setStep(next);
      }}
      completedSteps={ids.slice(0, step)}
      completionPercentage={Math.round((step / steps.length) * 100)}
      contentWidthClassName="max-w-[960px]"
      saveState={
        save.isPending || draftSaving ? "saving" : draftSaved ? "saved" : "idle"
      }
      launching={save.isPending}
      errorMessage={validationError || (save.isError ? save.error.message : "")}
      handleContinue={handleContinue}
      handleLaunch={handleLaunch}
    >
      <form
        ref={formRef}
        onSubmit={(event) => event.preventDefault()}
        className="space-y-6 pb-4"
      >
        {step === 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {field(
                "centreName",
                pathology ? "Organization name" : "Centre display name",
                { required: true }
              )}
              {!pathology &&
                field("legalName", "Legal business name", { required: true })}
              {field(
                "registrationNumber",
                "Facility registration / licence number",
                { required: true }
              )}
              {!pathology &&
                field("registrationAuthority", "Issuing authority", {
                  required: true
                })}
              {
                <>
                  {upload("logo")}
                  {upload("certificate")}
                  {field("establishedYear", "Year of establishment", {
                    type: "number"
                  })}
                  {field("website", "Website", { type: "url" })}
                </>
              }
              <div className="sm:col-span-2">
                {field(
                  "additionalCertificates",
                  "Additional certificates / accreditation identifiers",
                  {
                    hint: "Optional. Enter identifiers and issuing bodies where applicable. This does not verify or approve them."
                  }
                )}
              </div>
            </div>
            <section className="mt-5 flex items-center gap-4 rounded-[26px] border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-5 shadow-sm">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[var(--onboarding-accent-soft)] text-[var(--onboarding-accent)]">
                <Building2 size={24} />
              </span>
              <div>
                <h3 className="font-semibold">
                  {data.centreName || "Your organization"}
                </h3>
                <p className="mt-1 text-xs text-[var(--onboarding-muted)]">
                  {data.registrationNumber || "Registration pending"}
                  {data.establishedYear
                    ? ` � Established ${data.establishedYear}`
                    : ""}
                </p>
              </div>
            </section>
          </>
        )}
        {step === 1 && (
          <div className="space-y-5 rounded-[26px] border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-5 shadow-sm">
            {
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--onboarding-border)] pb-4">
                <h3 className="flex items-center gap-2 font-semibold">
                  <MapPin
                    size={18}
                    className="text-[var(--onboarding-accent)]"
                  />
                  Primary branch
                </h3>

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-[var(--onboarding-border-strong)] bg-[var(--onboarding-accent-soft)] text-[var(--onboarding-accent)]"
                  disabled={locating}
                  onClick={() => void locateBranch()}
                >
                  {locating ? "Finding location�" : "Use current location"}
                </Button>
                <p role="status" className="text-sm">
                  {locationStatus}
                </p>
                {data.mapsLocation && (
                  <a
                    className="text-sm underline"
                    href={data.mapsLocation}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View branch on map
                  </a>
                )}
              </div>
            }
            <div className="grid gap-4 md:grid-cols-2">
              {field("branchName", "Primary branch name", { required: true })}
              {field("address", "Street address", { required: true })}
              {field("city", "City", { required: true })}
              {field("state", "State", { required: true })}
              {field("postalCode", "PIN code", { required: true })}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-5">
            <section className="grid gap-4 rounded-[26px] border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-5 shadow-sm md:grid-cols-2">
              {field("phone", "Contact phone", { required: true, type: "tel" })}
              {field("email", "Contact email", {
                required: true,
                type: "email"
              })}
            </section>
            <section className="space-y-4 rounded-2xl border border-[var(--onboarding-border)] bg-[var(--onboarding-panel)] p-4">
              <div className="rounded-2xl bg-[var(--onboarding-accent-soft)] p-4">
                <p className="flex items-center gap-2 font-semibold text-[var(--onboarding-accent)]">
                  <Clock3 size={18} />
                  Opening hours
                </p>
                <p className="mt-1 text-xs text-[var(--onboarding-muted-strong)]">
                  12-hour time � Indian Standard Time (IST, UTC+05:30)
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {field("openingTime", "Opening time", {
                  required: true,
                  type: "time"
                })}
                {field("closingTime", "Closing time", {
                  required: true,
                  type: "time"
                })}
              </div>
              <fieldset>
                <legend className="mb-3 text-sm font-medium">
                  Working days � Asia/Kolkata
                </legend>
                {choices("workingDays", [
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                  "Sun"
                ])}
              </fieldset>
            </section>
            {pathology && (
              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-[var(--onboarding-accent)]"
                  checked={data.homeCollection}
                  onChange={(e) => update("homeCollection", e.target.checked)}
                />
                Offer home collection
              </label>
            )}
            <label className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={data.walkIns}
                onChange={(e) => update("walkIns", e.target.checked)}
              />
              Accept walk-in appointments
            </label>
          </div>
        )}
        {!pathology && step === 3 && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Enter the professional responsible for{" "}
              {pathology
                ? "laboratory result review"
                : "imaging interpretation"}
              . Add their account and Doctor role through Team before they
              release reports.
            </p>
            {field(
              "reportingName",
              pathology
                ? "Reporting pathologist / clinical lead name"
                : "Reporting radiologist name",
              { required: true }
            )}
            {field(
              "reportingRegistration",
              "Professional registration number",
              { required: true }
            )}
            {field("reportingEmail", "Reporting professional email", {
              required: true,
              type: "email"
            })}
            <p className="rounded-xl bg-muted p-4 text-xs leading-6 text-muted-foreground">
              Saving these details does not invite staff, grant permissions or
              verify professional credentials. Report release remains restricted
              by backend role checks.
            </p>
          </div>
        )}
        {!pathology && step === 4 && (
          <div className="space-y-5">
            <fieldset>
              <legend className="mb-3 text-sm font-medium">
                Imaging modalities offered *
              </legend>
              {choices("modalities", [
                "X-ray",
                "Ultrasound",
                "CT",
                "MRI",
                "Mammography",
                "Doppler",
                "DEXA",
                "Fluoroscopy",
                "Echocardiography",
                "PET-CT",
                "SPECT",
                "Nuclear medicine",
                "Interventional radiology",
                "Teleradiology",
                "Other"
              ])}
            </fieldset>
            {field(
              "equipment",
              "Machines, rooms, capacity and available modalities",
              {
                required: true,
                multiline: true,
                hint: "List capacity and maintenance arrangements. Use the same machine identifiers for appointment slots and maintenance blocks."
              }
            )}
            {field("referralPolicy", "Referral / prescription requirements", {
              required: true,
              multiline: true
            })}
            {field(
              "screeningProcess",
              "Patient preparation, contrast screening, consent and radiation safety",
              { required: true, multiline: true }
            )}
            {field(
              "imageWorkflow",
              "Secure image storage / PACS and reporting workflow",
              {
                required: true,
                multiline: true,
                hint: "Describe your workflow. Do not enter passwords, access tokens or patient records."
              }
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-[var(--onboarding-accent)]"
                checked={data.walkIns}
                onChange={(e) => update("walkIns", e.target.checked)}
              />
              Accept walk-in patients
            </label>
          </div>
        )}
        {step === steps.length - 1 && (
          <div className="space-y-5">
            <dl className="grid gap-5 text-sm sm:grid-cols-2">
              {[
                ["Centre", data.centreName],
                ...(!pathology ? [["Legal business", data.legalName]] : []),
                ...[
                  ["Established", data.establishedYear],
                  ["Website", data.website],
                  ["Logo", data.logoName],
                  ["License / certificate", data.certificateName]
                ],
                [
                  "Registration",
                  [data.registrationNumber, data.registrationAuthority]
                    .filter(Boolean)
                    .join(" � ")
                ],
                ["Contact", `${data.phone} � ${data.email}`],
                [
                  "Branch",
                  `${data.branchName}, ${data.address}, ${data.city}, ${data.state} ${data.postalCode}`
                ],
                [
                  "Hours",
                  `${data.workingDays.join(", ")} � ${data.openingTime}�${data.closingTime}`
                ],
                ...(!pathology
                  ? [
                      [
                        "Reporting professional",
                        `${data.reportingName} � ${data.reportingRegistration}`
                      ],
                      [
                        pathology ? "Laboratory sections" : "Modalities",
                        (pathology ? data.sections : data.modalities).join(", ")
                      ]
                    ]
                  : [])
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="mt-1 whitespace-pre-wrap font-medium">
                    {value || "Not provided"}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="rounded-xl border border-dashed p-5 text-sm leading-7 text-muted-foreground">
              Completing setup saves your primary branch as private. Next, add
              your services and prices, configure appointment slots, and publish
              your branch in Facilities to accept app bookings. Add your team
              from Staff.
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input
                required
                type="checkbox"
                className="mt-1 accent-[var(--onboarding-accent)]"
              />
              I confirm these business and professional details are accurate and
              I am authorised to configure this centre.
            </label>
          </div>
        )}
      </form>
    </OnboardingFrame>
  );
}
