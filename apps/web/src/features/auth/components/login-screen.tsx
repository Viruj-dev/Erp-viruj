"use client";

import { VirujLogo } from "@/components/brand/viruj-logo";
import { virujBrand } from "@/lib/viruj-brand";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Check,
  HeartPulse,
  Microscope,
  ScanLine,
  Stethoscope,
  ShieldCheck,
  X,
} from "lucide-react";
import { useId, useState } from "react";
import Link from "next/link";
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

const organizationTypeOptions = [
  { label: "Hospital", value: "hospital", icon: Building2 },
  { label: "Clinic", value: "clinic", icon: HeartPulse },
  { label: "Doctor", value: "doctor", icon: Stethoscope },
  { label: "Pathology", value: "pathology", icon: Microscope },
  { label: "Radiology", value: "radiology", icon: ScanLine },
] as const;

export function ErpDemoLogin({
  onAuthenticated,
  onPendingChange,
}: {
  onAuthenticated: () => Promise<void> | void;
  onPendingChange: (pending: boolean) => void;
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
    onPendingChange(true);

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
      onPendingChange(false);
    }
  };

  const handleCreateOrganization = async () => {
    clearMessages();
    setIsPending(true);
    onPendingChange(true);

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

      if (window.sessionStorage.getItem("viruj:pending-invitation")) {
        await onAuthenticated();
        return;
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

      if (
        onboardingForm.organizationType === "hospital" ||
        onboardingForm.organizationType === "clinic"
      ) {
        window.localStorage.setItem(
          `${getOnboardingStoragePrefix(onboardingForm.organizationType)}:start`,
          "1"
        );
      }

      setSuccessMessage(
        onboardingForm.organizationType === "clinic"
          ? "Clinic workspace ready. Redirecting to onboarding."
          : "Organization ready and OWNER session activated."
      );
      await onAuthenticated();
    } finally {
      setIsPending(false);
      onPendingChange(false);
    }
  };

  const handleAcceptInvitation = async () => {
    clearMessages();
    setIsPending(true);
    onPendingChange(true);

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
      onPendingChange(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8faf9] text-slate-950 dark:bg-[#05070a] dark:text-slate-100 md:p-6">
      <div className="mx-auto grid min-h-screen max-w-[1440px] overflow-hidden bg-white dark:bg-[#10151b] md:min-h-[calc(100svh-3rem)] md:rounded-2xl md:border md:border-slate-200 dark:md:border-white/10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative flex flex-col px-6 py-6 dark:bg-[#0f141a] sm:px-10 lg:px-14">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <VirujLogo />
              <span className="font-headline text-sm font-bold tracking-tight text-slate-950 dark:text-white">
                {virujBrand.product}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="hidden sm:inline">
                {step === "login"
                  ? "Don't have an account?"
                  : "Have an account?"}
              </span>
              <button
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100 dark:hover:bg-white/[0.10]"
                onClick={() => {
                  clearMessages();
                  setStep(step === "login" ? "onboarding" : "login");
                }}
                type="button"
              >
                {step === "login" ? "Create account" : "Sign in"}
              </button>
            </div>
          </header>

          <div className="flex flex-1 items-center justify-center py-12 lg:py-16">
            <div className="w-full max-w-[440px]">
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
                    <div>
                      <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-teal-800 dark:text-teal-300">
                        <ShieldCheck size={16} /> Your care workspace
                      </p>
                      <h1 className="font-headline text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                        Welcome back.
                      </h1>
                      <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Sign in to continue caring for your patients.
                      </p>
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
                          setLoginForm((current) => ({
                            ...current,
                            email: value,
                          }))
                        }
                        placeholder="you@work.com"
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
                        placeholder="Enter your password"
                        required
                        type="password"
                        value={loginForm.password}
                      />
                      <div className="flex items-center justify-end text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Link
                          className="underline underline-offset-4"
                          href="/forgot-password"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <StatusBlock
                        errorMessage={errorMessage}
                        successMessage={successMessage}
                      />
                      <button
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-800 text-sm font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-teal-300 dark:text-slate-950 dark:hover:bg-teal-200"
                        disabled={isPending}
                        type="submit"
                      >
                        {isPending ? "Signing in..." : "Sign in"}
                        <ArrowRight size={17} />
                      </button>
                    </form>

                    <button
                      className="w-full text-center text-xs font-bold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                      onClick={() => {
                        clearMessages();
                        setStep("invitation");
                      }}
                      type="button"
                    >
                      Have a team invitation? Join your team
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
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-teal-700 dark:text-cyan-300">
                          Get started
                        </p>
                        <h1 className="mt-2 font-headline text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                          A home for your care team.
                        </h1>
                        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                          Choose your workspace and create your account.
                        </p>
                      </div>
                      <button
                        aria-label="Back to sign in"
                        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:bg-white/[0.10] dark:hover:text-white"
                        onClick={() => {
                          clearMessages();
                          setStep("login");
                        }}
                        type="button"
                      >
                        <X size={18} />
                      </button>
                    </header>

                    <form
                      className="space-y-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void handleCreateOrganization();
                      }}
                    >
                      <fieldset>
                        <legend className="mb-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          Your workspace
                        </legend>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {organizationTypeOptions.map(
                            ({ label, value, icon: Icon }) => (
                              <label
                                key={value}
                                className="relative cursor-pointer"
                              >
                                <input
                                  className="peer sr-only"
                                  type="radio"
                                  name="workspace-type"
                                  value={value}
                                  checked={
                                    onboardingForm.organizationType === value
                                  }
                                  onChange={() =>
                                    setOnboardingForm((current) => ({
                                      ...current,
                                      organizationType: value,
                                    }))
                                  }
                                />
                                <span className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3.5 text-xs font-semibold text-slate-600 transition hover:border-teal-500 peer-checked:border-teal-700 peer-checked:bg-teal-50 peer-checked:text-teal-900 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-600 peer-focus-visible:ring-offset-2 dark:border-white/15 dark:text-slate-300 dark:peer-checked:border-teal-400 dark:peer-checked:bg-teal-400/10 dark:peer-checked:text-teal-200">
                                  <Icon size={17} aria-hidden="true" />
                                  {label}
                                  {onboardingForm.organizationType === value ? (
                                    <Check
                                      className="ml-auto shrink-0"
                                      size={13}
                                      aria-hidden="true"
                                    />
                                  ) : null}
                                </span>
                              </label>
                            )
                          )}
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          Joining a team? Use your invitation instead.
                        </p>
                      </fieldset>
                      <FormField
                        label="Workspace name"
                        onChange={(value) =>
                          setOnboardingForm((current) => ({
                            ...current,
                            organizationName: value,
                          }))
                        }
                        placeholder={
                          onboardingForm.organizationType === "doctor"
                            ? "Optional practice name"
                            : "Your organization name"
                        }
                        required={onboardingForm.organizationType !== "doctor"}
                        type="text"
                        value={onboardingForm.organizationName}
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormField
                          label="Your name"
                          onChange={(value) =>
                            setOnboardingForm((current) => ({
                              ...current,
                              name: value,
                            }))
                          }
                          placeholder="Your full name"
                          required
                          type="text"
                          value={onboardingForm.name}
                        />
                        <FormField
                          label="Work email"
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
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-800 text-sm font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-teal-300 dark:text-slate-950 dark:hover:bg-teal-200"
                        disabled={isPending}
                        type="submit"
                      >
                        {isPending
                          ? "Creating workspace..."
                          : "Create workspace"}
                        <ArrowRight size={17} />
                      </button>
                    </form>

                    <button
                      className="w-full text-center text-xs font-bold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
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
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-teal-700 dark:text-cyan-300">
                        Staff access
                      </p>
                      <h1 className="mt-2 font-headline text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                        Accept your invitation
                      </h1>
                      <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Enter the invitation ID shared by your team
                        administrator. Use your existing account or create one
                        to join.
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
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-800 text-sm font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-teal-300 dark:text-slate-950 dark:hover:bg-teal-200"
                        disabled={isPending}
                        type="submit"
                      >
                        {isPending ? "Connecting..." : "Verify & connect"}
                        <ArrowRight size={17} />
                      </button>
                    </form>

                    <button
                      className="w-full text-center text-xs font-bold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                      onClick={() => {
                        clearMessages();
                        setStep("login");
                      }}
                      type="button"
                    >
                      Back to sign in
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <p className="mt-7 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
                <ShieldCheck
                  size={15}
                  className="shrink-0 text-teal-700 dark:text-teal-300"
                />{" "}
                Workspace access is managed by your organization.
              </p>
            </div>
          </div>

          <footer className="flex items-center justify-end text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>
              © {new Date().getFullYear()} {virujBrand.name}
            </span>
            <Link href="/about" className="hover:underline">
              About & support
            </Link>
          </footer>
        </section>

        <aside className="relative hidden flex-col justify-between bg-[#123e35] p-12 text-white lg:flex xl:p-16">
          <div className="flex items-center gap-2 text-xs font-medium text-teal-100/80">
            <span className="size-1.5 rounded-full bg-teal-300" /> Built around
            better care
          </div>
          <div className="py-16">
            <span className="mb-7 flex size-12 items-center justify-center rounded-2xl border border-white/20 text-teal-200">
              <HeartPulse size={25} strokeWidth={1.5} />
            </span>
            <h2 className="max-w-sm font-headline text-4xl font-semibold leading-[1.2] tracking-tight xl:text-5xl">
              More time for
              <br />
              the people
              <br />
              <span className="text-teal-200">in your care.</span>
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-7 text-teal-50/75">
              Your appointments, patient records, and care team. Together in one
              thoughtful workspace.
            </p>
            <div className="mt-10 space-y-5 border-t border-white/15 pt-7">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-teal-200"
                />
                <div>
                  <p className="text-sm font-medium">
                    The right access for every role
                  </p>
                  <p className="mt-1 text-xs leading-5 text-teal-50/65">
                    Permissions managed within your organization.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <HeartPulse
                  size={19}
                  className="mt-0.5 shrink-0 text-teal-200"
                />
                <div>
                  <p className="text-sm font-medium">
                    Care that stays connected
                  </p>
                  <p className="mt-1 text-xs leading-5 text-teal-50/65">
                    Connected to the Viruj patient app.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-teal-100/60">
            Viruj Health · Made for the people behind the care.
          </p>
        </aside>
      </div>
    </main>
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
  const inputId = useId();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField && isPasswordVisible ? "text" : type;

  return (
    <div className="space-y-1">
      <label
        htmlFor={inputId}
        className="text-xs font-semibold text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15 dark:border-white/10 dark:bg-[#161c24] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400/40 dark:focus:ring-cyan-400/15 ${
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
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.08] dark:hover:text-white"
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
      role={errorMessage ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm ${
        errorMessage
          ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200"
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
    return owner
      ? `${owner}'s Doctor Practice`
      : "Independent Doctor Workspace";
  }

  return "Viruj Health Workspace";
}

function buildOrganizationSlug(
  name: string,
  organizationType: OrganizationType
) {
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
function getOnboardingStoragePrefix(organizationType: OrganizationType) {
  return organizationType === "clinic"
    ? "viruj:clinic-onboarding"
    : "viruj:hospital-onboarding";
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
