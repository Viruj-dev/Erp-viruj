"use client";

import { VirujLogo } from "@/components/brand/viruj-logo";
import { virujBrand } from "@/lib/viruj-brand";
import { workspaceThemes } from "@/features/dashboard/components/shared/layout/role-theme";
import { cn } from "@/lib/utils";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  HeartPulse,
  Info,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  Microscope,
  ScanLine,
  ShieldCheck,
  Stethoscope,
  User,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useId, useState } from "react";
import Link from "next/link";
import {
  acceptInvitation,
  authClient,
  bootstrapOrganization,
  getAuthActionError,
} from "@/lib/auth-client";
import { clearCentralApiToken } from "@/lib/central-api-token";
import type { DashboardOrganizationType } from "@/features/dashboard/lib/routing";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/erp/dialog";

type Step = "login" | "onboarding" | "invitation";
type OrganizationType = DashboardOrganizationType;

type BetterAuthResult = {
  error?: {
    code?: string;
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

const stepMotion = {
  initial: { opacity: 0, y: 16, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.99 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

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
  const [reviewPending, setReviewPending] = useState(false);
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
        if (result.error.code === "ACCESS_REVIEW_PENDING") {
          setReviewPending(true);
          return;
        }
        setErrorMessage(
          result.error.message || "Unable to sign in with those credentials."
        );
        return;
      }

      // A new session must never inherit a central API token minted for the
      // previous user.
      clearCentralApiToken();
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
        clearCentralApiToken();
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
    <main className="relative grid min-h-dvh bg-[#f4f6fb] text-slate-950 lg:grid-cols-[1fr_1.05fr] dark:bg-[#05070a] dark:text-slate-100">
      <Dialog open={reviewPending} onOpenChange={setReviewPending}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your profile is under review</DialogTitle>
            <DialogDescription>
              We’ll email you once your application is reviewed. You can sign in
              after approval.
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button>Got it</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      {/* five-role aurora hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[3px] bg-[linear-gradient(90deg,#3894ff_0%,#8f85ff_28%,#fb7185_52%,#fb923c_76%,#34d399_100%)] opacity-80"
      />
      {/* ---------------------------------------------------------- */}
      {/* Form pane                                                   */}
      {/* ---------------------------------------------------------- */}
      <section className="relative flex flex-col bg-[#f6f8fc] px-6 py-8 sm:px-10 lg:px-14 dark:bg-[#0b1017]">
        {/* aurora echo — soft role-tinted glows + dot texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
        >
          <div className="absolute -top-28 -left-20 size-[360px] rounded-full bg-[radial-gradient(circle,rgba(118,108,255,0.09),transparent_65%)] blur-2xl" />
          <div className="absolute -bottom-36 right-[-12%] size-[420px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.08),transparent_65%)] blur-2xl" />
          <div className="absolute top-1/3 right-[-16%] size-[360px] rounded-full bg-[radial-gradient(circle,rgba(251,113,133,0.07),transparent_65%)] blur-2xl" />
          <div className="absolute inset-x-0 top-0 h-72 [background-image:radial-gradient(rgba(15,23,42,0.06)_1px,transparent_1.5px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)] dark:[background-image:radial-gradient(rgba(226,232,240,0.05)_1px,transparent_1.5px)]" />
        </div>
        <header className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <VirujLogo className="size-11" />
            <div className="leading-tight">
              <span className="block font-headline text-sm font-bold tracking-tight text-slate-950 dark:text-white">
                {virujBrand.product}
              </span>
              <span className="block text-[11px] font-medium text-slate-400 dark:text-slate-500">
                by {virujBrand.name}
              </span>
            </div>
          </div>

          {step === "login" ? (
            <button
              className="h-10 rounded-full border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-px hover:border-slate-300 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100 dark:hover:border-white/30 dark:hover:text-white"
              onClick={() => {
                clearMessages();
                setStep("onboarding");
              }}
              type="button"
            >
              Create account
            </button>
          ) : (
            <button
              className="flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
              onClick={() => {
                clearMessages();
                setStep("login");
              }}
              type="button"
            >
              <ArrowLeft size={15} /> Back to sign in
            </button>
          )}
        </header>

        <div className="relative z-10 flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[440px]">
            <AnimatePresence mode="wait">
              {step === "login" ? (
                <motion.div key="login" {...stepMotion} className="space-y-7">
                  <div>
                    <h1 className="font-headline text-[2rem] font-bold tracking-tight text-slate-950 sm:text-[2.35rem] dark:text-white">
                      Welcome back.
                    </h1>
                    <span
                      aria-hidden="true"
                      className="mt-4 block h-1 w-14 rounded-full bg-[linear-gradient(90deg,#3894ff,#8f85ff,#fb7185)]"
                    />
                    <p className="mt-2.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Sign in to your care workspace and pick up exactly where
                      your team left off.
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
                      autoComplete="email"
                      icon={Mail}
                      label="Email address"
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
                      autoComplete="current-password"
                      icon={LockKeyhole}
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
                    <div className="flex justify-end">
                      <Link
                        className="text-xs font-bold text-[#1b64c0] underline-offset-4 transition hover:underline dark:text-sky-400"
                        href="/forgot-password"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <StatusBlock
                      errorMessage={errorMessage}
                      successMessage={successMessage}
                    />
                    <PrimaryButton
                      aria-label={isPending ? "Signing you in" : undefined}
                      isPending={isPending}
                      label="Sign in"
                      pendingLabel="Signing you in…"
                    />
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200 dark:border-white/10" />
                    </div>
                    <span className="relative flex justify-center">
                      <span className="-translate-y-0 bg-[#f6f8fc] px-3 text-[11px] font-semibold tracking-wide text-slate-400 uppercase dark:bg-[#0b1017] dark:text-slate-500">
                        or
                      </span>
                    </span>
                  </div>

                  <button
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-white/25 dark:hover:bg-white/[0.07]"
                    onClick={() => {
                      clearMessages();
                      setStep("invitation");
                    }}
                    type="button"
                  >
                    <KeyRound
                      size={16}
                      className="text-slate-400 dark:text-slate-500"
                    />
                    Have a team invitation? Join your team
                  </button>
                </motion.div>
              ) : null}

              {step === "onboarding" ? (
                <motion.div
                  key="onboarding"
                  {...stepMotion}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="font-headline text-[1.85rem] font-bold tracking-tight text-slate-950 sm:text-[2.1rem] dark:text-white">
                      Launch your care workspace.
                    </h1>
                    <p className="mt-2.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Choose your workspace, create an owner account, and start
                      onboarding your team.
                    </p>
                  </div>

                  <form
                    className="space-y-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleCreateOrganization();
                    }}
                  >
                    <fieldset className="space-y-2.5">
                      <legend className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                        Workspace type
                      </legend>
                      <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
                        {organizationTypeOptions.map(
                          ({ label, value, icon: Icon }) => {
                            const isSelected =
                              onboardingForm.organizationType === value;

                            return (
                              <label
                                key={value}
                                className="group relative cursor-pointer"
                              >
                                <input
                                  checked={isSelected}
                                  className="peer sr-only"
                                  name="workspace-type"
                                  onChange={() =>
                                    setOnboardingForm((current) => ({
                                      ...current,
                                      organizationType: value,
                                    }))
                                  }
                                  type="radio"
                                  value={value}
                                />
                                <span
                                  className={cn(
                                    "relative flex aspect-square flex-col items-center justify-center gap-2.5 rounded-2xl border p-2 text-center transition peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-current",
                                    isSelected
                                      ? cn(
                                          workspaceThemes[value].avatar,
                                          "shadow-sm ring-1 ring-current"
                                        )
                                      : "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-white/25 dark:hover:bg-white/[0.06]"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "grid size-10 place-items-center rounded-xl transition",
                                      isSelected
                                        ? "bg-white/70 shadow-sm"
                                        : cn(workspaceThemes[value].avatar)
                                    )}
                                  >
                                    <Icon size={19} aria-hidden="true" />
                                  </span>
                                  <span className="text-[11px] leading-tight font-bold">
                                    {label}
                                  </span>
                                </span>
                              </label>
                            );
                          }
                        )}
                      </div>
                    </fieldset>
                    <FormField
                      icon={Building2}
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
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        autoComplete="name"
                        icon={User}
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
                        autoComplete="email"
                        icon={Mail}
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
                      autoComplete="new-password"
                      icon={LockKeyhole}
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
                    <PrimaryButton
                      isPending={isPending}
                      label="Create workspace"
                      pendingLabel="Creating workspace…"
                    />
                  </form>

                  <button
                    className="flex w-full items-center justify-center gap-2 text-xs font-bold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                    onClick={() => {
                      clearMessages();
                      setStep("invitation");
                    }}
                    type="button"
                  >
                    <KeyRound size={14} />
                    Joining an existing team? Accept invitation
                  </button>
                </motion.div>
              ) : null}

              {step === "invitation" ? (
                <motion.div
                  key="invitation"
                  {...stepMotion}
                  className="space-y-6"
                >
                  <div>
                    <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-[10px] font-bold tracking-[0.22em] text-slate-500 uppercase dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                      <KeyRound
                        size={13}
                        className="text-slate-400 dark:text-slate-500"
                      />
                      Staff access
                    </p>
                    <h1 className="font-headline text-[1.85rem] font-bold tracking-tight text-slate-950 sm:text-[2.1rem] dark:text-white">
                      Join your care team.
                    </h1>
                    <p className="mt-2.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Sign in with your existing account or create one — the
                      invitation links you to the right organization.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                    <Info
                      size={15}
                      className="mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      Paste the invitation ID your administrator shared with
                      you. IDs are alphanumeric and unique per person.
                    </span>
                  </div>

                  <form
                    className="space-y-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleAcceptInvitation();
                    }}
                  >
                    <FormField
                      icon={KeyRound}
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
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        autoComplete="email"
                        icon={Mail}
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
                        autoComplete="name"
                        icon={User}
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
                      autoComplete="current-password"
                      icon={LockKeyhole}
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
                    <PrimaryButton
                      isPending={isPending}
                      label="Verify & connect"
                      pendingLabel="Connecting…"
                    />
                  </form>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <p className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-6 text-[11px] font-medium text-slate-400 dark:border-white/[0.06] dark:text-slate-500">
              <ShieldCheck size={14} className="shrink-0" />
              Workspace access is managed by your organization.
            </p>
          </div>
        </div>

        <footer className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          <span>
            © {new Date().getFullYear()} {virujBrand.name}
          </span>
          <Link
            className="transition hover:text-slate-700 hover:underline dark:hover:text-slate-200"
            href="/about"
          >
            About & support
          </Link>
        </footer>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Brand panel                                                 */}
      {/* ---------------------------------------------------------- */}
      <aside
        className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between"
        style={{
          backgroundColor: "#060d19",
          backgroundImage: [
            "radial-gradient(900px 520px at 92% -10%, rgba(15,108,191,0.30), transparent 60%)",
            "radial-gradient(800px 480px at 78% 115%, rgba(16,185,129,0.18), transparent 55%)",
            "radial-gradient(820px 460px at 12% 112%, rgba(118,108,255,0.16), transparent 55%)",
            "radial-gradient(700px 420px at 45% -20%, rgba(234,88,12,0.12), transparent 55%)",
            "radial-gradient(700px 420px at -10% 40%, rgba(225,29,72,0.14), transparent 55%)",
            "linear-gradient(168deg, #060d19 0%, #071a30 48%, #06121f 100%)",
          ].join(", "),
        }}
      >
        {/* blueprint dot field */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-80 [background-image:radial-gradient(rgba(226,232,240,0.14)_1.2px,transparent_1.3px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />

        <div className="relative z-10 px-10 pt-10 xl:px-14">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 12 }}
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-slate-100 backdrop-blur"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
            One secure login. Every specialty.
          </motion.div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-10 py-12 xl:px-14">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-9 flex items-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
          >
            <VirujLogo className="size-36" />
          </motion.div>
          <motion.h2
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl font-headline text-[2.6rem] leading-[1.08] font-semibold tracking-tight text-white xl:text-[3.1rem]"
            initial={{ opacity: 0, y: 16 }}
            transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
          >
            More time for
            <br />
            the people
            <br />
            <span className="bg-gradient-to-r from-sky-200 via-violet-200 to-rose-200 bg-clip-text text-transparent">
              in your care.
            </span>
          </motion.h2>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 max-w-md text-sm leading-7 text-slate-100/70"
            initial={{ opacity: 0, y: 16 }}
            transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
          >
            Appointments, patient records, labs, and your whole care team —
            together in one thoughtful workspace.
          </motion.p>

          {/* ECG trace — in normal flow so it never collides with text */}
          <div
            aria-hidden="true"
            className="pointer-events-none -mx-10 mt-2 h-[110px] xl:-mx-14"
          >
            <svg
              className="h-full w-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 640 130"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="viruj-ecg-aurora"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#4aa6ff" />
                  <stop offset="28%" stopColor="#8f85ff" />
                  <stop offset="52%" stopColor="#fb7185" />
                  <stop offset="76%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
              <path
                d="M0 78 H84 L96 78 L106 40 L117 112 L128 78 H196 L208 54 L219 96 L230 78 H320 L333 32 L345 118 L357 78 H452 L465 56 L475 96 L486 78 H640"
                stroke="rgba(226,232,240,0.15)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                className="viruj-ecg-trace"
                d="M0 78 H84 L96 78 L106 40 L117 112 L128 78 H196 L208 54 L219 96 L230 78 H320 L333 32 L345 118 L357 78 H452 L465 56 L475 96 L486 78 H640"
                stroke="url(#viruj-ecg-aurora)"
                strokeOpacity="0.55"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                style={{
                  filter: "drop-shadow(0 0 8px rgba(148,163,255,0.45))",
                }}
              />
              <path
                className="viruj-ecg-pulse"
                d="M0 78 H84 L96 78 L106 40 L117 112 L128 78 H196 L208 54 L219 96 L230 78 H320 L333 32 L345 118 L357 78 H452 L465 56 L475 96 L486 78 H640"
                stroke="url(#viruj-ecg-aurora)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(196,181,253,0.85))",
                }}
              />
            </svg>
          </div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 space-y-4"
            initial={{ opacity: 0, y: 16 }}
            transition={{ delay: 0.55, duration: 0.7, ease: "easeOut" }}
          >
            <FeatureRow
              body="Permissions managed within your organization — never shared."
              icon={<ShieldCheck size={18} />}
              title="Role-based access"
            />
            <FeatureRow
              body="Records flow both ways with the Viruj patient app."
              icon={<HeartPulse size={18} />}
              title="Connected patient care"
            />
            <FeatureRow
              body="Hospital, clinic, doctor, pathology and radiology suites."
              icon={<Building2 size={18} />}
              title="Every specialty, one suite"
            />
          </motion.div>
        </div>

        <motion.div
          animate={{ opacity: 1 }}
          className="relative z-10 px-10 pb-9 xl:px-14"
          initial={{ opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p className="text-xs font-medium text-slate-100/60">
            {virujBrand.name} · Made for the people behind the care.
          </p>
        </motion.div>
      </aside>
    </main>
  );
}

function FeatureRow({
  body,
  icon,
  title,
}: {
  body: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[0.07] text-slate-200 backdrop-blur">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-slate-100/60">{body}</p>
      </div>
    </div>
  );
}

function PrimaryButton({
  ariaLabel,
  isPending,
  label,
  pendingLabel,
}: {
  ariaLabel?: string;
  isPending: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[linear-gradient(180deg,#1a63c8_0%,#0e4da6_55%,#00478d_100%)] text-sm font-semibold text-white shadow-[0_12px_28px_-8px_rgba(0,71,141,0.6),inset_0_1px_0_rgba(255,255,255,0.22)] transition hover:shadow-[0_16px_32px_-8px_rgba(0,71,141,0.7)] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isPending}
      type="submit"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.25)_45%,transparent_60%)] transition-transform duration-700 group-hover:translate-x-full group-disabled:hidden"
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {pendingLabel}
          </>
        ) : (
          <>
            {label}
            <ArrowRight
              className="transition-transform duration-200 group-hover:translate-x-0.5"
              size={17}
            />
          </>
        )}
      </span>
    </button>
  );
}

function FormField({
  autoComplete,
  icon: Icon,
  label,
  onChange,
  placeholder,
  required = false,
  type,
  value,
}: {
  autoComplete?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
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
    <div className="space-y-1.5">
      <label
        className="block text-[13px] font-semibold text-slate-800 dark:text-slate-200"
        htmlFor={inputId}
      >
        {label}
        {required ? (
          <span className="ml-0.5 text-rose-400" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <div className="relative">
        <input
          autoComplete={autoComplete}
          className={cn(
            "peer h-11.5 w-full rounded-xl border shadow-[inset_0_1px_2px_rgba(16,24,40,0.05)] outline-none transition",
            "border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-500 focus:ring-4 focus:ring-slate-950/10",
            "dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:hover:border-white/20 dark:focus:border-slate-400/60 dark:focus:ring-white/10",
            Icon ? "pl-10.5" : "pl-4",
            isPasswordField ? "pr-12" : "pr-4"
          )}
          id={inputId}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          type={inputType}
          value={value}
        />
        {Icon ? (
          <Icon
            className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-slate-400 peer-focus:text-slate-700 dark:peer-focus:text-slate-300"
            size={17}
            aria-hidden="true"
          />
        ) : null}
        {isPasswordField ? (
          <button
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:hover:bg-white/[0.08] dark:hover:text-white"
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
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm",
        errorMessage
          ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200"
      )}
      role={errorMessage ? "alert" : "status"}
    >
      {errorMessage ? (
        <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      ) : (
        <CheckCircle2
          size={16}
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        />
      )}
      <span>{errorMessage || successMessage}</span>
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
