"use client";
import { useState, type FormEvent, type CSSProperties } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FlaskConical, ScanLine, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/erp/input";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import {
  canManageDiagnosticSetup,
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
  const router = useRouter(),
    client = useQueryClient();
  const [data, setData] = useState<DiagnosticSetup>(() => ({
    ...emptyDiagnosticSetup(organizationName, userEmail),
    ...initial.data,
  }));
  const [version, setVersion] = useState(initial.version),
    [step, setStep] = useState(0),
    [saved, setSaved] = useState(false);
  const pathology = tenant.providerType === "pathology",
    Icon = pathology ? FlaskConical : ScanLine;
  const accent = pathology
    ? "bg-orange-700 text-white hover:bg-orange-800"
    : "bg-zinc-700 text-white hover:bg-zinc-800";
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
      setSaved(true);
      client.setQueryData(diagnosticSetupKey(tenant.organizationId), result);
      if (complete) {
        void client.invalidateQueries({
          queryKey: ["diagnostic-availability", tenant.organizationId],
        });
        router.replace(tenant.buildRoute());
      }
    },
  });
  const update = <K extends keyof DiagnosticSetup>(
    key: K,
    value: DiagnosticSetup[K]
  ) => {
    setSaved(false);
    setData((old) => ({ ...old, [key]: value }));
  };
  const field = (
    key: keyof Pick<
      DiagnosticSetup,
      (typeof import("@/features/dashboard/lib/diagnostic-onboarding").diagnosticSetupFields)[number]
    >,
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
          className="min-h-24 w-full rounded-xl border bg-background p-3"
          value={data[key]}
          required={options.required}
          maxLength={2000}
          onChange={(e) => update(key, e.target.value)}
        />
      ) : (
        <Input
          type={options.type ?? "text"}
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
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
          >
            <input
              type="checkbox"
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
  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < steps.length - 1) setStep((s) => s + 1);
    else save.mutate(true);
  }
  return (
    <main
      style={
        {
          "--ring": pathology ? "#ea580c" : "#71717a",
          accentColor: pathology ? "#c2410c" : "#52525b",
        } as CSSProperties
      }
      className="min-h-dvh w-full bg-surface px-4 py-8 text-foreground sm:px-8"
    >
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`rounded-2xl p-3 ${pathology ? "bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-200" : "bg-zinc-200 text-zinc-800 dark:bg-zinc-500/10 dark:text-zinc-200"}`}
            >
              <Icon size={26} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {pathology ? "Pathology laboratory" : "Radiology centre"}
              </p>
              <h1 className="mt-1 text-2xl font-semibold">
                Set up your diagnostic centre
              </h1>
            </div>
          </div>
          <Button
            variant="outline"
            type="button"
            onClick={() =>
              router.push(
                tenant.buildRoute(
                  tenant.providerType === "pathology"
                    ? "pathology"
                    : "radiology"
                )
              )
            }
          >
            Back to workspace
          </Button>
        </header>
        <nav
          aria-label="Onboarding progress"
          className="mb-7 grid grid-cols-5 gap-2"
        >
          {steps.map((label, index) => (
            <div
              key={label}
              aria-current={step === index ? "step" : undefined}
              className={`rounded-xl border p-3 text-xs ${index === step ? (pathology ? "border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-500/10 dark:text-orange-100" : "border-zinc-500 bg-zinc-200 text-zinc-900 dark:bg-zinc-500/10 dark:text-zinc-100") : "text-muted-foreground"}`}
            >
              <span className="mb-2 block font-semibold">
                {index < step ? (
                  <Check size={15} aria-label="Completed step" />
                ) : (
                  `0${index + 1}`
                )}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          ))}
        </nav>
        <form
          onSubmit={next}
          className="space-y-6 rounded-3xl border bg-card p-5 shadow-sm sm:p-8"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Step {step + 1} of {steps.length}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{steps[step]}</h2>
          </div>
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
                <input required type="checkbox" className="mt-1" />I confirm
                these business and professional details are accurate and I am
                authorised to configure this centre.
              </label>
            </div>
          )}
          {save.isError && (
            <p role="alert" className="text-sm text-destructive">
              {save.error.message}
            </p>
          )}
          {saved && (
            <p role="status" className="text-sm text-muted-foreground">
              Draft saved to your organisation.
            </p>
          )}
          <footer className="flex flex-wrap justify-between gap-3 border-t pt-5">
            <Button
              variant="outline"
              type="button"
              disabled={step === 0 || save.isPending}
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft size={15} />
              Back
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                type="button"
                disabled={save.isPending}
                onClick={() => save.mutate(false)}
              >
                Save draft
              </Button>
              <Button
                className={accent}
                type="submit"
                disabled={save.isPending}
              >
                {save.isPending
                  ? "Saving…"
                  : step === 4
                    ? "Complete setup"
                    : "Continue"}
              </Button>
            </div>
          </footer>
        </form>
      </div>
    </main>
  );
}
