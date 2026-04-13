"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Info,
  Microscope,
  ShieldCheck,
  Stethoscope,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import {
  acceptInvitation,
  authClient,
  createOrganization,
  setActiveOrganization,
} from "@/lib/auth-client";

type Step = "login" | "onboarding" | "invitation";
type OrganizationType = "clinic" | "hospital" | "pathology" | "radiology";

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
        setErrorMessage(
          signUpResult.error.message || "Unable to create your user account."
        );
        return;
      }

      const organizationResult = await createOrganization({
        name: onboardingForm.organizationName,
        organizationType: onboardingForm.organizationType,
        slug: buildOrganizationSlug(onboardingForm.organizationName),
      });

      if (hasError(organizationResult)) {
        setErrorMessage(
          organizationResult.error.message ||
            "Account created, but organization setup failed."
        );
        return;
      }

      if (organizationResult?.id) {
        const setActiveOrganizationResult = await setActiveOrganization({
          organizationId: organizationResult.id,
        });

        if (hasError(setActiveOrganizationResult)) {
          setErrorMessage(
            setActiveOrganizationResult.error.message ||
              "Organization was created, but the owner workspace could not be activated."
          );
          return;
        }
      }

      setSuccessMessage("Organization created and owner session activated.");
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

      const invitationResult = await acceptInvitation({
        invitationId: invitationForm.invitationId,
      });

      if (hasError(invitationResult)) {
        setErrorMessage(
          invitationResult.error.message ||
            "Invitation could not be accepted. Verify the invitation ID."
        );
        return;
      }

      setSuccessMessage("Invitation accepted. Preparing your organization access.");
      await onAuthenticated();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface md:flex-row">
      <div className="relative hidden items-center justify-center overflow-hidden bg-primary p-12 md:flex md:w-1/2 lg:w-3/5">
        <div className="absolute inset-0 opacity-20">
          <img
            alt="Modern hospital corridor"
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=800&fit=crop"
          />
        </div>
        <div className="relative z-10 max-w-lg">
          <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: -20 }}>
            <span className="font-headline text-3xl font-black tracking-tight text-white">
              Viruj Health
            </span>
            <div className="mt-2 h-1 w-12 bg-secondary" />
          </motion.div>
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 font-headline text-5xl font-extrabold leading-tight text-white"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
          >
            Precision health records for the modern clinic.
          </motion.h1>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-lg font-medium leading-relaxed text-primary-container"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.35 }}
          >
            Secure Better Auth sessions, organization-scoped roles, and Neon-backed
            clinical operations in one ERP workspace.
          </motion.p>
          <div className="mt-12 flex gap-4">
            <FeaturePill
              icon={<ShieldCheck className="text-secondary-container" size={24} />}
              subtitle="Org-scoped sessions"
              title="Role Controlled"
            />
            <FeaturePill
              icon={<Zap className="text-secondary-container" size={24} />}
              subtitle="Neon + Drizzle"
              title="Serverless Ready"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 md:p-12 lg:p-24">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === "login" ? (
              <motion.div
                key="login"
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
                exit={{ opacity: 0, x: -20 }}
                initial={{ opacity: 0, x: 20 }}
              >
                <header>
                  <h2 className="font-headline text-3xl font-bold text-on-surface">
                    Welcome back
                  </h2>
                  <p className="mt-2 text-on-surface-variant">
                    Access your clinical ecosystem
                  </p>
                </header>

                <div className="grid grid-cols-3 gap-2 rounded-lg bg-surface-container-low p-1">
                  <RoleCard active icon={<Building2 size={20} />} label="Hospital" />
                  <RoleCard icon={<Stethoscope size={20} />} label="Doctor" />
                  <RoleCard icon={<Microscope size={20} />} label="Lab" />
                </div>

                <form
                  className="space-y-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleLogin();
                  }}
                >
                  <FormField
                    label="Institutional Email"
                    onChange={(value) =>
                      setLoginForm((current) => ({ ...current, email: value }))
                    }
                    placeholder="admin@hospital-group.com"
                    required
                    type="email"
                    value={loginForm.email}
                  />
                  <FormField
                    label="Password"
                    onChange={(value) =>
                      setLoginForm((current) => ({ ...current, password: value }))
                    }
                    placeholder="Enter your secure password"
                    required
                    type="password"
                    value={loginForm.password}
                  />
                  <StatusBlock
                    errorMessage={errorMessage}
                    successMessage={successMessage}
                  />
                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-container py-3 font-bold text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isPending}
                    type="submit"
                  >
                    {isPending ? "Authorizing..." : "Authorize Session"}
                    <ArrowRight size={18} />
                  </button>
                </form>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/30" />
                  </div>
                  <div className="relative mx-auto w-fit bg-surface px-4 text-xs font-bold uppercase text-on-surface-variant">
                    New Facility?
                  </div>
                </div>

                <div className="grid gap-3">
                  <button
                    className="w-full rounded-lg border border-outline-variant/30 py-3 font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
                    onClick={() => {
                      clearMessages();
                      setStep("onboarding");
                    }}
                    type="button"
                  >
                    Initialize New Organization
                  </button>
                  <button
                    className="w-full rounded-lg border border-outline-variant/20 py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low"
                    onClick={() => {
                      clearMessages();
                      setStep("invitation");
                    }}
                    type="button"
                  >
                    Join Existing Organization
                  </button>
                </div>
              </motion.div>
            ) : null}

            {step === "onboarding" ? (
              <motion.div
                key="onboarding"
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
                exit={{ opacity: 0, x: -20 }}
                initial={{ opacity: 0, x: 20 }}
              >
                <header className="flex items-center justify-between">
                  <div>
                    <h2 className="font-headline text-3xl font-bold text-on-surface">
                      Organization Setup
                    </h2>
                    <p className="mt-2 italic text-on-surface-variant">
                      Better Auth owner onboarding
                    </p>
                  </div>
                  <button
                    className="rounded-full p-2 transition-colors hover:bg-surface-container-low"
                    onClick={() => {
                      clearMessages();
                      setStep("login");
                    }}
                    type="button"
                  >
                    <X size={20} />
                  </button>
                </header>

                <div className="flex gap-4 rounded-xl border border-primary-fixed bg-primary-fixed/30 p-4">
                  <Info className="mt-1 text-primary" size={18} />
                  <p className="text-xs leading-relaxed text-on-primary-fixed">
                    This flow creates the owner account first, then provisions the
                    organization and activates it in the current session.
                  </p>
                </div>

                <form
                  className="space-y-6"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleCreateOrganization();
                  }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Org Name"
                      onChange={(value) =>
                        setOnboardingForm((current) => ({
                          ...current,
                          organizationName: value,
                        }))
                      }
                      placeholder="St. Mary's General"
                      required
                      type="text"
                      value={onboardingForm.organizationName}
                    />
                    <SelectField
                      label="Type"
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
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      label="Owner Name"
                      onChange={(value) =>
                        setOnboardingForm((current) => ({ ...current, name: value }))
                      }
                      placeholder="Dr. Sarah Mitchell"
                      required
                      type="text"
                      value={onboardingForm.name}
                    />
                    <FormField
                      label="Owner Email"
                      onChange={(value) =>
                        setOnboardingForm((current) => ({ ...current, email: value }))
                      }
                      placeholder="chief.admin@viruj.health"
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
                    placeholder="Minimum secure owner password"
                    required
                    type="password"
                    value={onboardingForm.password}
                  />
                  <StatusBlock
                    errorMessage={errorMessage}
                    successMessage={successMessage}
                  />
                  <div className="flex gap-4 pt-4">
                    <button
                      className="flex-1 rounded-lg py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
                      onClick={() => {
                        clearMessages();
                        setStep("invitation");
                      }}
                      type="button"
                    >
                      I have an invitation
                    </button>
                    <button
                      className="flex-1 rounded-lg bg-primary py-3 font-bold text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isPending}
                      type="submit"
                    >
                      {isPending ? "Creating..." : "Create Organization"}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : null}

            {step === "invitation" ? (
              <motion.div
                key="invitation"
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
                exit={{ opacity: 0, x: -20 }}
                initial={{ opacity: 0, x: 20 }}
              >
                <header>
                  <h2 className="font-headline text-3xl font-bold text-on-surface">
                    Accept Invitation
                  </h2>
                  <p className="mt-2 text-on-surface-variant">
                    Join an existing clinical institution with a Better Auth invitation ID
                  </p>
                </header>

                <form
                  className="space-y-5"
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
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      label="Email"
                      onChange={(value) =>
                        setInvitationForm((current) => ({ ...current, email: value }))
                      }
                      placeholder="doctor@hospital.org"
                      required
                      type="email"
                      value={invitationForm.email}
                    />
                    <FormField
                      label="Name"
                      onChange={(value) =>
                        setInvitationForm((current) => ({ ...current, name: value }))
                      }
                      placeholder="Dr. Michael Chen"
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
                    placeholder="Use your existing password or set a new one"
                    required
                    type="password"
                    value={invitationForm.password}
                  />
                  <StatusBlock
                    errorMessage={errorMessage}
                    successMessage={successMessage}
                  />
                  <button
                    className="w-full rounded-lg bg-primary py-3 font-bold text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isPending}
                    type="submit"
                  >
                    {isPending ? "Connecting..." : "Verify & Connect"}
                  </button>
                </form>

                <button
                  className="w-full py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
                  onClick={() => {
                    clearMessages();
                    setStep("onboarding");
                  }}
                  type="button"
                >
                  Back to Organization Creation
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
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
      className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-md"
      initial={{ opacity: 0, scale: 0.9 }}
    >
      {icon}
      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-xs text-primary-container">{subtitle}</p>
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
  return (
    <div className="space-y-1">
      <label className="px-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </label>
      <input
        className="w-full rounded-lg border-none bg-surface-container-highest px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-primary/20"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </div>
  );
}

function RoleCard({
  active = false,
  icon,
  label,
}: {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      className={
        active
          ? "flex flex-col items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-lowest py-3 shadow-sm"
          : "flex flex-col items-center justify-center rounded-lg py-3 text-on-surface-variant transition-colors hover:bg-surface-container-high"
      }
      type="button"
    >
      <span className={active ? "mb-1 text-primary" : "mb-1"}>{icon}</span>
      <span
        className={
          active
            ? "text-[11px] font-bold uppercase tracking-wider text-primary"
            : "text-[11px] font-bold uppercase tracking-wider"
        }
      >
        {label}
      </span>
    </button>
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
      <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </label>
      <select
        className="w-full appearance-none rounded-lg border-none bg-surface-container-highest px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
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

function buildOrganizationSlug(name: string) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);

  const suffix = Math.random().toString(36).slice(2, 7);
  return normalized ? `${normalized}-${suffix}` : `viruj-org-${suffix}`;
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
