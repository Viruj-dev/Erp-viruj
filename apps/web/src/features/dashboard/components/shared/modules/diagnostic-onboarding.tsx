"use client";
import { OnboardingFrame } from "@/features/dashboard/components/hospital/pages/onboarding/onboarding-frame";
import { OnboardingSuccessScreen } from "@/features/dashboard/components/hospital/pages/onboarding/onboarding-success-screen";
import type {
  StepDefinition,
  StepId,
} from "@/features/dashboard/components/hospital/pages/onboarding/types";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/erp/input";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import {
  canManageDiagnosticSetup,
  diagnosticSetupFields,
  diagnosticSetupKey,
  emptyDiagnosticSetup,
  type DiagnosticSetup,
  type DiagnosticOnboardingState,
} from "@/features/dashboard/lib/diagnostic-onboarding";
import { virujBackend } from "@/lib/viruj-backend";

export function DiagnosticOnboarding({
  tenant,
  organizationName,
  userEmail = "",
}: {
  tenant: ErpTenantContext;
  organizationName?: string;
  userEmail?: string;
}) {
  const query = useQuery({
    queryKey: diagnosticSetupKey(tenant.organizationId),
    queryFn: () => virujBackend.diagnostics.onboarding(tenant.organizationId),
    enabled: canManageDiagnosticSetup(tenant.role),
    retry: false,
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
  if (query.isPending)
    return (
      <p role="status" className="m-auto p-8">
        Loading centre setup…
      </p>
    );
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
  userEmail,
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
    ...initial.data,
  }));
  const [version, setVersion] = useState(initial.version),
    [step, setStep] = useState(0),
    [draftLoaded, setDraftLoaded] = useState(false),
    [draftSaving, setDraftSaving] = useState(false),
    [draftSaved, setDraftSaved] = useState(true),
    [validationError, setValidationError] = useState("");
  const pathology = tenant.providerType === "pathology";
  const draftKey = `viruj:diagnostic-onboarding:draft:${tenant.organizationId}`;
  const steps = [
    "Centre identity",
    "Branch & contact",
    "Reporting team",
    pathology ? "Laboratory setup" : "Imaging setup",
    "Review",
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
          queryKey: ["diagnostic-availability", tenant.organizationId],
        });
        setComplete(true);
      }
    },
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
  ) => (
    <label className="block space-y-2 text-sm">
      <span className="font-medium">
        {label}
        {options.required ? " *" : ""}
      </span>
      {options.multiline ? (
        <textarea
          className="min-h-24 w-full rounded-xl border border-[var(--onboarding-border-strong)] bg-[var(--onboarding-panel)] p-3 text-[var(--onboarding-text)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--onboarding-accent)]"
          value={data[key]}
          required={options.required}
          maxLength={2000}
          onChange={(e) => update(key, e.target.value)}
        />
      ) : (
        <Input
          type={options.type ?? "text"}
          className="border-[var(--onboarding-border-strong)] bg-[var(--onboarding-panel)] text-[var(--onboarding-text)] focus-visible:ring-[var(--onboarding-accent)]"
          value={data[key]}
          required={options.required}
          maxLength={500}
          onChange={(e) => update(key, e.target.value)}
        />
      )}
      {options.hint && (
        <span className="block text-xs leading-5 text-muted-foreground">
          {options.hint}
        </span>
      )}
    </label>
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
  const ids: StepId[] = ["profile", "contact", "doctors", "departments", "review"];
  const kickers = ["Identity", "Branch", "Clinical team", "Operations", "Launch"];
  const definitions: StepDefinition[] = steps.map((label, index) => ({
    id: ids[index]!,
    label,
    kicker: kickers[index]!,
  }));
  const descriptions = Object.fromEntries([
    ["profile", "Register the centre and facility credentials"],
    ["contact", "Add the main branch, contact details and opening hours"],
    ["doctors", "Add the professional responsible for approved reports"],
    [
      "departments",
      pathology
        ? "Choose lab sections, accepted samples and collection procedures"
        : "Choose imaging services, equipment and patient preparation",
    ],
    ["review", "Review the centre details before completing setup"],
  ]) as Record<StepId, string>;
  const themeClassName = pathology
    ? "vh-onboarding--pathology"
    : "vh-onboarding--radiology";
  const summary = [
    { label: "Centre", value: data.centreName || "Not provided" },
    { label: "Branch", value: data.branchName || "Not provided" },
    {
      label: "Reporting professional",
      value: data.reportingName || "Not provided",
    },
  ];
  const validateCurrentStep = () => {
    setValidationError("");
    if (!formRef.current?.reportValidity()) return false;
    if (step === 1 && data.workingDays.length === 0) {
      setValidationError("Select at least one working day to continue.");
      return false;
    }
    if (step === 3 && pathology && data.sections.length === 0) {
      setValidationError("Select at least one laboratory section.");
      return false;
    }
    if (step === 3 && pathology && data.specimens.length === 0) {
      setValidationError("Select at least one accepted specimen type.");
      return false;
    }
    if (step === 3 && !pathology && data.modalities.length === 0) {
      setValidationError("Select at least one imaging modality.");
      return false;
    }
    return true;
  };
  const handleContinue = () => {
    if (!validateCurrentStep()) return;
    save.mutate(false, {
      onSuccess: () => setStep((current) => Math.min(current + 1, 4)),
    });
  };
  const handleLaunch = () => {
    if (validateCurrentStep()) save.mutate(true);
  };

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
      entityLabel={pathology ? "laboratory" : "imaging centre"}
      userName={data.centreName || organizationName || "Administrator"}
      steps={definitions}
      stepDescriptions={descriptions}
      currentStepIndex={step}
      setCurrentStepIndex={setStep}
      completedSteps={ids.slice(0, step)}
      completionPercentage={Math.round((step / steps.length) * 100)}
      contentWidthClassName="max-w-[960px]"
      saveState={
        save.isPending || draftSaving
          ? "saving"
          : draftSaved
            ? "saved"
            : "idle"
      }
      launching={save.isPending}
      errorMessage={
        validationError || (save.isError ? save.error.message : "")
      }
      handleContinue={handleContinue}
      handleLaunch={handleLaunch}
    >
      <form
        ref={formRef}
        onSubmit={(event) => event.preventDefault()}
        className="space-y-6 pb-4"
      >
          {step === 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              {field("centreName", "Centre display name", { required: true })}
              {field("legalName", "Legal business name", { required: true })}
              {field(
                "registrationNumber",
                "Facility registration / licence number",
                { required: true }
              )}
              {field("registrationAuthority", "Issuing authority", {
                required: true,
              })}
              <div className="sm:col-span-2">
                {field(
                  "additionalCertificates",
                  "Additional certificates / accreditation identifiers",
                  {
                    hint: "Optional. Enter identifiers and issuing bodies where applicable. This does not verify or approve them.",
                  }
                )}
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {field("phone", "Centre phone", {
                  required: true,
                  type: "tel",
                })}
                {field("email", "Centre email", {
                  required: true,
                  type: "email",
                })}
                {field("branchName", "Primary branch name", { required: true })}
                {field("address", "Street address", { required: true })}
                {field("city", "City", { required: true })}
                {field("state", "State", { required: true })}
                {field("postalCode", "PIN code", { required: true })}
                {field("openingTime", "Opening time", {
                  required: true,
                  type: "time",
                })}
                {field("closingTime", "Closing time", {
                  required: true,
                  type: "time",
                })}
              </div>
              <fieldset className="space-y-3">
                <legend className="mb-3 text-sm font-medium">
                  Working days · Asia/Kolkata
                </legend>
                {choices("workingDays", [
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                  "Sun",
                ])}
              </fieldset>
            </div>
          )}
          {step === 2 && (
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
                type: "email",
              })}
              <p className="rounded-xl bg-muted p-4 text-xs leading-6 text-muted-foreground">
                Saving these details does not invite staff, grant permissions or
                verify professional credentials. Report release remains
                restricted by backend role checks.
              </p>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-5">
              {pathology ? (
                <>
                  <fieldset>
                    <legend className="mb-3 text-sm font-medium">
                      Laboratory sections offered *
                    </legend>
                    {choices("sections", [
                      "Haematology",
                      "Biochemistry",
                      "Microbiology",
                      "Immunology",
                      "Histopathology",
                      "Molecular testing",
                    ])}
                  </fieldset>
                  <fieldset>
                    <legend className="mb-3 text-sm font-medium">
                      Specimens accepted *
                    </legend>
                    {choices("specimens", [
                      "Blood",
                      "Urine",
                      "Stool",
                      "Swab",
                      "Tissue",
                      "Other",
                    ])}
                  </fieldset>
                  {field(
                    "sampleHandling",
                    "Sample handling, containers and rejection process",
                    { required: true, multiline: true }
                  )}
                  {field(
                    "collectionInstructions",
                    "Patient preparation and collection instructions",
                    { required: true, multiline: true }
                  )}
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="accent-[var(--onboarding-accent)]"
                      checked={data.homeCollection}
                      onChange={(e) =>
                        update("homeCollection", e.target.checked)
                      }
                    />
                    Offer home sample collection
                  </label>
                </>
              ) : (
                <>
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
                      "Other",
                    ])}
                  </fieldset>
                  {field(
                    "equipment",
                    "Machines / room identifiers and available modalities",
                    {
                      required: true,
                      multiline: true,
                      hint: "Use the same machine identifiers when creating appointment slots.",
                    }
                  )}
                  {field(
                    "referralPolicy",
                    "Referral / prescription requirements",
                    { required: true, multiline: true }
                  )}
                  {field(
                    "screeningProcess",
                    "Patient preparation, screening and consent process",
                    { required: true, multiline: true }
                  )}
                  {field(
                    "imageWorkflow",
                    "Secure image storage / PACS and reporting workflow",
                    {
                      required: true,
                      multiline: true,
                      hint: "Describe your workflow. Do not enter passwords, access tokens or patient records.",
                    }
                  )}
                </>
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
          {step === 4 && (
            <div className="space-y-5">
              <dl className="grid gap-5 text-sm sm:grid-cols-2">
                {[
                  ["Centre", data.centreName],
                  ["Legal business", data.legalName],
                  [
                    "Registration",
                    `${data.registrationNumber} · ${data.registrationAuthority}`,
                  ],
                  ["Contact", `${data.phone} · ${data.email}`],
                  [
                    "Branch",
                    `${data.branchName}, ${data.address}, ${data.city}, ${data.state} ${data.postalCode}`,
                  ],
                  [
                    "Hours",
                    `${data.workingDays.join(", ")} · ${data.openingTime}–${data.closingTime}`,
                  ],
                  [
                    "Reporting professional",
                    `${data.reportingName} · ${data.reportingRegistration}`,
                  ],
                  [
                    pathology ? "Laboratory sections" : "Modalities",
                    (pathology ? data.sections : data.modalities).join(", "),
                  ],
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
                Completing setup creates or updates your primary branch as
                private. Next, add your tests/scans and prices in Catalogue,
                configure slots, and explicitly publish the branch in
                Availability to accept app bookings.
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input
                  required
                  type="checkbox"
                  className="mt-1 accent-[var(--onboarding-accent)]"
                />
                I confirm
                these business and professional details are accurate and I am
                authorised to configure this centre.
              </label>
            </div>
          )}
      </form>
    </OnboardingFrame>
  );
}
