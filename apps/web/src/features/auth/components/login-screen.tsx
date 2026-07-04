"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Info,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import {
  acceptInvitation,
  authClient,
  bootstrapOrganization,
  getAuthActionError,
} from "@/lib/auth-client";
import type { DashboardOrganizationType } from "@/features/dashboard/lib/routing";

type Step = "login" | "onboarding" | "invitation";
type OrganizationType = DashboardOrganizationType;

type BetterAuthResult = {
  error?: {
    message?: string;
  } | null;
};

const organizationTypeOptions: Array<{
  label: string;
  value: OrganizationType;
}> = [
  { label: "Multi-specialty Hospital", value: "hospital" },
  { label: "Private Clinic", value: "clinic" },
  { label: "Individual Doctor", value: "doctor" },
  { label: "Pathology Lab", value: "pathology" },
  { label: "Radiology Center", value: "radiology" },
];

export function ErpDemoLogin({
  onAuthenticated,
}: {
  onAuthenticated: () => Promise<void> | void;
}) {
  const [step, setStep] = useState<Step>("login");
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [onboardingForm, setOnboardingForm] = useState({
    email: "",
    name: "",
    organizationName: "",
    organizationType: "hospital" as OrganizationType,
    password: "",
  });
  const [invitationForm, setInvitationForm] = useState({
    email: "",
    invitationId: "",
    name: "",
    password: "",
  });

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleLogin = async () => {
    clearMessages();
    setIsPending(true);

    try {
      const result = await authClient.signIn.email({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (hasError(result)) {
        setErrorMessage(
          result.error.message || "Unable to sign in with those credentials."
        );
        return;
      }

      setSuccessMessage("Secure session authorized.");
      await onAuthenticated();
    } finally {
      setIsPending(false);
    }
  };

  const handleCreateOrganization = async () => {
    clearMessages();
    setIsPending(true);

    try {
      const signUpResult = await authClient.signUp.email({
        email: onboardingForm.email,
        name: onboardingForm.name,
        password: onboardingForm.password,
      });

      if (hasError(signUpResult)) {
        const signInResult = await authClient.signIn.email({
          email: onboardingForm.email,
          password: onboardingForm.password,
        });

        if (hasError(signInResult)) {
          setErrorMessage(
            signUpResult.error.message ||
              signInResult.error.message ||
              "Unable to create your user account. If this email already exists, use the login form."
          );
          return;
        }
      }

      const bootstrapResult = await bootstrapOrganization({
        name: buildBootstrapOrganizationName(
          onboardingForm.organizationName,
          onboardingForm.name,
          onboardingForm.email,
          onboardingForm.organizationType
        ),
        organizationType: onboardingForm.organizationType,
        slug: buildOrganizationSlug(
          onboardingForm.organizationName ||
            onboardingForm.name ||
            onboardingForm.email,
          onboardingForm.organizationType
        ),
      });
      const bootstrapError = getAuthActionError(bootstrapResult);

      if (bootstrapError) {
        setErrorMessage(bootstrapError);
        return;
      }

      setSuccessMessage(
        onboardingForm.organizationType === "clinic"
          ? "Clinic workspace ready. Redirecting to the clinic dashboard."
          : "Organization ready and OWNER session activated."
      );
      await onAuthenticated();
    } finally {
      setIsPending(false);
    }
  };

  const handleAcceptInvitation = async () => {
    clearMessages();
    setIsPending(true);

    try {
      const signInResult = await authClient.signIn.email({
        email: invitationForm.email,
        password: invitationForm.password,
      });

      if (hasError(signInResult)) {
        const signUpResult = await authClient.signUp.email({
          email: invitationForm.email,
          name: invitationForm.name,
          password: invitationForm.password,
        });

        if (hasError(signUpResult)) {
          setErrorMessage(
            signUpResult.error.message ||
              "Could not authenticate the invited user."
          );
          return;
        }
      }

      if (!acceptInvitation) {
        setErrorMessage("Invitation auth actions are unavailable.");
        return;
      }

      const invitationResult = await acceptInvitation({
        invitationId: invitationForm.invitationId,
      });

      const invitationError = getAuthActionError(invitationResult);

      if (invitationError) {
        setErrorMessage(
          invitationError ||
            "Invitation could not be accepted. Verify the invitation ID."
        );
        return;
      }

      setSuccessMessage(
        "Invitation accepted. Preparing your organization access."
      );
      await onAuthenticated();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] p-3 text-slate-950 md:p-5">
      <div className="grid min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[1.75rem] bg-[#f3f4f1] shadow-[0_28px_100px_rgba(0,0,0,0.35)] lg:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[0.42fr_0.58fr]">
        <section className="relative flex min-h-[760px] flex-col bg-[#f7f7f3] px-6 py-6 md:px-10">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
                <ShieldCheck size={19} />
              </span>
              <span className="font-headline text-sm font-bold tracking-tight text-slate-950">
                Viruj ERP
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="hidden sm:inline">
                {step === "login" ? "Don't have an account?" : "Already enrolled?"}
              </span>
              <button
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                onClick={() => {
                  clearMessages();
                  setStep(step === "login" ? "onboarding" : "login");
                }}
                type="button"
              >
                {step === "login" ? "Register" : "Login"}
              </button>
            </div>
          </header>

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-[420px]">
              <AnimatePresence mode="wait">
                {step === "login" ? (
                  <motion.div
                    key="login"
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                    exit={{ opacity: 0, y: -12 }}
                    initial={{ opacity: 0, y: 14 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                  >
                    <div className="text-center">
                      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
                        <ShieldCheck size={30} className="text-slate-900" />
                      </div>
                      <h1 className="mt-7 font-headline text-2xl font-bold tracking-tight text-slate-950">
                        Login to your ERP account
                      </h1>
                      <p className="mt-2 text-sm font-medium text-slate-500">
                        Enter your healthcare workspace details to continue.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {["SSO", "Google", "LinkedIn"].map((label) => (
                        <button
                          className="h-11 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                          key={label}
                          type="button"
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="relative py-1">
                      <div className="absolute inset-0 flex items-center">
                        <div className="h-px w-full bg-slate-200" />
                      </div>
                      <span className="relative mx-auto block w-fit bg-[#f7f7f3] px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        or
                      </span>
                    </div>

                    <form
                      className="space-y-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void handleLogin();
                      }}
                    >
                      <FormField
                        label="Email Address"
                        onChange={(value) =>
                          setLoginForm((current) => ({ ...current, email: value }))
                        }
                        placeholder="admin@yashodahospital.co"
                        required
                        type="email"
                        value={loginForm.email}
                      />
                      <FormField
                        label="Password"
                        onChange={(value) =>
                          setLoginForm((current) => ({
                            ...current,
                            password: value,
                          }))
                        }
                        placeholder="Enter your secure password"
                        required
                        type="password"
                        value={loginForm.password}
                      />
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                        <label className="inline-flex items-center gap-2">
                          <input className="size-4 rounded border-slate-300" type="checkbox" />
                          Keep me logged in
                        </label>
                        <button className="underline underline-offset-4" type="button">
                          Forgot password?
                        </button>
                      </div>
                      <StatusBlock
                        errorMessage={errorMessage}
                        successMessage={successMessage}
                      />
                      <button
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-bold text-white shadow-[0_18px_40px_rgba(15,23,42,0.24)] transition hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isPending}
                        type="submit"
                      >
                        {isPending ? "Authorizing..." : "Login"}
                        <ArrowRight size={17} />
                      </button>
                    </form>

                    <button
                      className="w-full text-center text-xs font-bold text-slate-500 transition hover:text-slate-950"
                      onClick={() => {
                        clearMessages();
                        setStep("invitation");
                      }}
                      type="button"
                    >
                      Accept a staff invitation instead
                    </button>
                  </motion.div>
                ) : null}

                {step === "onboarding" ? (
                  <motion.div
                    key="onboarding"
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                    exit={{ opacity: 0, y: -12 }}
                    initial={{ opacity: 0, y: 14 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                  >
                    <header className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-teal-700">
                          Healthcare ERP signup
                        </p>
                        <h1 className="mt-2 font-headline text-2xl font-bold tracking-tight text-slate-950">
                          Register your care workspace
                        </h1>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                          Create the owner account and provision your hospital, clinic, lab, or doctor workspace.
                        </p>
                      </div>
                      <button
                        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
                        onClick={() => {
                          clearMessages();
                          setStep("login");
                        }}
                        type="button"
                      >
                        <X size={18} />
                      </button>
                    </header>

                    <div className="flex gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                      <Info className="mt-0.5 shrink-0 text-teal-700" size={18} />
                      <p className="text-xs font-medium leading-5 text-teal-900">
                        This creates an ERP owner account, provisions the organization, and activates your clinical operations dashboard.
                      </p>
                    </div>

                    <form
                      className="space-y-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void handleCreateOrganization();
                      }}
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormField
                          label="Organization"
                          onChange={(value) =>
                            setOnboardingForm((current) => ({
                              ...current,
                              organizationName: value,
                            }))
                          }
                          placeholder={
                            onboardingForm.organizationType === "doctor"
                              ? "Optional practice name"
                              : "Yashoda Hospital"
                          }
                          required={onboardingForm.organizationType !== "doctor"}
                          type="text"
                          value={onboardingForm.organizationName}
                        />
                        <SelectField
                          label="Workspace Type"
                          onChange={(value) =>
                            setOnboardingForm((current) => ({
                              ...current,
                              organizationType: value as OrganizationType,
                            }))
                          }
                          options={organizationTypeOptions}
                          value={onboardingForm.organizationType}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormField
                          label="Owner Name"
                          onChange={(value) =>
                            setOnboardingForm((current) => ({
                              ...current,
                              name: value,
                            }))
                          }
                          placeholder="Dr. Dhruv Negi"
                          required
                          type="text"
                          value={onboardingForm.name}
                        />
                        <FormField
                          label="Owner Email"
                          onChange={(value) =>
                            setOnboardingForm((current) => ({
                              ...current,
                              email: value,
                            }))
                          }
                          placeholder="owner@hospital.co"
                          required
                          type="email"
                          value={onboardingForm.email}
                        />
                      </div>
                      <FormField
                        label="Password"
                        onChange={(value) =>
                          setOnboardingForm((current) => ({
                            ...current,
                            password: value,
                          }))
                        }
                        placeholder="Create a secure password"
                        required
                        type="password"
                        value={onboardingForm.password}
                      />
                      <StatusBlock
                        errorMessage={errorMessage}
                        successMessage={successMessage}
                      />
                      <button
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-bold text-white shadow-[0_18px_40px_rgba(15,23,42,0.24)] transition hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isPending}
                        type="submit"
                      >
                        {isPending ? "Creating workspace..." : "Create healthcare ERP"}
                        <ArrowRight size={17} />
                      </button>
                    </form>

                    <button
                      className="w-full text-center text-xs font-bold text-slate-500 transition hover:text-slate-950"
                      onClick={() => {
                        clearMessages();
                        setStep("invitation");
                      }}
                      type="button"
                    >
                      Joining an existing team? Accept invitation
                    </button>
                  </motion.div>
                ) : null}

                {step === "invitation" ? (
                  <motion.div
                    key="invitation"
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                    exit={{ opacity: 0, y: -12 }}
                    initial={{ opacity: 0, y: 14 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                  >
                    <header>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-teal-700">
                        Staff access
                      </p>
                      <h1 className="mt-2 font-headline text-2xl font-bold tracking-tight text-slate-950">
                        Accept your invitation
                      </h1>
                      <p className="mt-2 text-sm font-medium text-slate-500">
                        Join an existing healthcare organization with the invitation ID from the Staff page.
                      </p>
                    </header>

                    <form
                      className="space-y-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void handleAcceptInvitation();
                      }}
                    >
                      <FormField
                        label="Invitation ID"
                        onChange={(value) =>
                          setInvitationForm((current) => ({
                            ...current,
                            invitationId: value,
                          }))
                        }
                        placeholder="Paste invitation ID"
                        required
                        type="text"
                        value={invitationForm.invitationId}
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormField
                          label="Email"
                          onChange={(value) =>
                            setInvitationForm((current) => ({
                              ...current,
                              email: value,
                            }))
                          }
                          placeholder="staff@hospital.co"
                          required
                          type="email"
                          value={invitationForm.email}
                        />
                        <FormField
                          label="Name"
                          onChange={(value) =>
                            setInvitationForm((current) => ({
                              ...current,
                              name: value,
                            }))
                          }
                          placeholder="Dr. Meera Rao"
                          type="text"
                          value={invitationForm.name}
                        />
                      </div>
                      <FormField
                        label="Password"
                        onChange={(value) =>
                          setInvitationForm((current) => ({
                            ...current,
                            password: value,
                          }))
                        }
                        placeholder="Use existing password or set one"
                        required
                        type="password"
                        value={invitationForm.password}
                      />
                      <StatusBlock
                        errorMessage={errorMessage}
                        successMessage={successMessage}
                      />
                      <button
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-bold text-white shadow-[0_18px_40px_rgba(15,23,42,0.24)] transition hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isPending}
                        type="submit"
                      >
                        {isPending ? "Connecting..." : "Verify & connect"}
                        <ArrowRight size={17} />
                      </button>
                    </form>

                    <button
                      className="w-full text-center text-xs font-bold text-slate-500 transition hover:text-slate-950"
                      onClick={() => {
                        clearMessages();
                        setStep("login");
                      }}
                      type="button"
                    >
                      Back to login
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <footer className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>(c) 2026 Viruj Health ERP</span>
            <span>ENG</span>
          </footer>
        </section>

        <aside className="relative hidden overflow-hidden bg-[#e9ebe6] lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(#cfd6cc_1px,transparent_1px),linear-gradient(90deg,#cfd6cc_1px,transparent_1px)] bg-[size:48px_48px] opacity-55" />
          <div className="absolute left-[14%] top-[18%] h-28 w-28 rounded-full border border-slate-300/70" />
          <div className="absolute bottom-[22%] right-[18%] h-48 w-48 rounded-full border border-teal-900/10" />
          <div className="relative flex min-h-full flex-col justify-center px-16 py-14">
            <div className="mb-10 flex size-14 items-center justify-center rounded-full bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
              <ShieldCheck className="text-teal-800" size={25} />
            </div>
            <blockquote className="max-w-2xl font-headline text-4xl font-bold leading-tight tracking-tight text-slate-950 xl:text-5xl">
              The healthcare ERP system has unified our doctors, staff, appointments, and patient operations into one calm workspace.
            </blockquote>
            <div className="mt-8">
              <p className="text-sm font-bold text-slate-950">Dr. Asha Mehta</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Medical Director / Hospital Network</p>
            </div>
            <div className="mt-10 flex gap-1.5">
              <span className="h-1.5 w-7 rounded-full bg-slate-950" />
              <span className="size-1.5 rounded-full bg-teal-700" />
              <span className="size-1.5 rounded-full bg-slate-300" />
            </div>
            <div className="mt-14 grid max-w-xl grid-cols-2 gap-4">
              <FeaturePill
                icon={<ShieldCheck className="text-teal-700" size={22} />}
                subtitle="Organization scoped access"
                title="Secure roles"
              />
              <FeaturePill
                icon={<Zap className="text-teal-700" size={22} />}
                subtitle="Fast clinical workflows"
                title="Smooth ops"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FeaturePill({
  icon,
  subtitle,
  title,
}: {
  icon: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur"
      initial={{ opacity: 0, scale: 0.9 }}
    >
      {icon}
      <div>
        <p className="text-sm font-bold text-slate-950">{title}</p>
        <p className="text-xs font-semibold text-slate-500">{subtitle}</p>
      </div>
    </motion.div>
  );
}

function FormField({
  label,
  onChange,
  placeholder,
  required = false,
  type,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type: string;
  value: string;
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField && isPasswordVisible ? "text" : type;

  return (
    <div className="space-y-1">
      <label className="px-1 text-xs font-bold text-slate-800">
        {label}
      </label>
      <div className="relative">
        <input
          className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200 ${
            isPasswordField ? "pr-12" : ""
          }`}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          type={inputType}
          value={value}
        />
        {isPasswordField ? (
          <button
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            type="button"
          >
            {isPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        ) : null}
      </div>
    </div>
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
  options: Array<{
    label: string;
    value: string;
  }>;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <label className="px-1 text-xs font-bold text-slate-800">
        {label}
      </label>
      <select
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusBlock({
  errorMessage,
  successMessage,
}: {
  errorMessage: string | null;
  successMessage: string | null;
}) {
  if (!errorMessage && !successMessage) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        errorMessage
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {errorMessage || successMessage}
    </div>
  );
}

function buildBootstrapOrganizationName(
  organizationName: string,
  ownerName: string,
  email: string,
  organizationType: OrganizationType
) {
  const trimmedOrganizationName = organizationName.trim();

  if (trimmedOrganizationName) {
    return trimmedOrganizationName;
  }

  if (organizationType === "doctor") {
    const owner = ownerName.trim() || email.split("@")[0]?.trim();
    return owner ? `${owner}'s Doctor Practice` : "Independent Doctor Workspace";
  }

  return "Viruj Health Workspace";
}

function buildOrganizationSlug(name: string, organizationType: OrganizationType) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);

  const suffix = Math.random().toString(36).slice(2, 7);
  const fallbackPrefix =
    organizationType === "doctor"
      ? "doctor-workspace"
      : organizationType === "clinic"
        ? "clinic-workspace"
        : "viruj-org";
  return normalized ? `${normalized}-${suffix}` : `${fallbackPrefix}-${suffix}`;
}

function hasError(result: unknown): result is BetterAuthResult & {
  error: {
    message?: string;
  };
} {
  return Boolean(
    result &&
    typeof result === "object" &&
    "error" in result &&
    (result as BetterAuthResult).error
  );
}
