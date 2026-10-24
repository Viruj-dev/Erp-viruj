"use client";

import { VirujLogo } from "@/components/brand/viruj-logo";
import { virujBrand } from "@/lib/viruj-brand";

import { authClient } from "@/lib/auth-client";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useId, useState, type ComponentType, type FormEvent, type ReactNode } from "react";

type PasswordRecoveryProps =
  | { mode: "request" }
  | { mode: "reset"; token: string | null; invalidToken: boolean };

export function PasswordRecoveryScreen(props: PasswordRecoveryProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isReset = props.mode === "reset";
  const canReset = isReset && Boolean(props.token) && !props.invalidToken;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (isReset) {
      if (!canReset || !props.token) {
        return;
      }
      if (password.length < 8 || password.length > 128) {
        setErrorMessage("Use a password between 8 and 128 characters.");
        return;
      }
      if (password !== confirmation) {
        setErrorMessage("Passwords do not match.");
        return;
      }
    }

    setIsPending(true);
    try {
      if (isReset && props.token) {
        const result = await authClient.resetPassword({
          newPassword: password,
          token: props.token,
        });
        if (result.error) {
          setErrorMessage(
            "This reset link is invalid or has expired. Request a new one."
          );
          return;
        }
        setPassword("");
        setConfirmation("");
        window.history.replaceState(null, "", "/reset-password");
      } else if (!isReset) {
        const result = await authClient.requestPasswordReset({
          email: email.trim(),
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (result.error) {
          setErrorMessage(
            "We could not process the request. Please try again later."
          );
          return;
        }
      }
      setIsComplete(true);
    } catch {
      setErrorMessage(
        "We could not process the request. Please try again later."
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f4f6fb] p-4 text-slate-950 dark:bg-[#05070a] dark:text-slate-100">
      <section className="w-full max-w-[440px] rounded-3xl border border-white/70 bg-white p-7 shadow-[0_28px_80px_-24px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-[#0b1017] dark:shadow-[0_28px_100px_rgba(0,0,0,0.55)] sm:p-10">
        <header className="mb-8 flex items-center justify-between gap-4">
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
          <Link
            className="flex size-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b64c0] dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
            href="/auth"
          >
            <ArrowLeft size={16} />
            <span className="sr-only">Back to sign in</span>
          </Link>
        </header>

        <h1 className="font-headline text-[1.85rem] font-bold tracking-tight text-slate-950 dark:text-white">
          {isReset ? "Set a new password" : "Reset your password"}
        </h1>
        <p className="mt-2.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {isReset
            ? "Choose a new password for your care workspace."
            : "Enter your registered email address and we will send you a secure reset link."}
        </p>

        {isComplete ? (
          <div
            className="mt-6 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200"
            role="status"
          >
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <span>
              {isReset
                ? "Your password has been updated. You can now sign in."
                : "If an account exists for that email, a reset link is on its way. Check your inbox and spam folder."}
            </span>
          </div>
        ) : canReset || !isReset ? (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {isReset ? (
              <>
                <PasswordField
                  label="New password"
                  onChange={setPassword}
                  placeholder="8–128 characters"
                  required
                  value={password}
                />
                <PasswordField
                  label="Confirm new password"
                  onChange={setConfirmation}
                  placeholder="Repeat your new password"
                  required
                  value={confirmation}
                />
              </>
            ) : (
              <EmailField onChange={setEmail} value={email} />
            )}

            {errorMessage ? (
              <p
                className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200"
                role="alert"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {errorMessage}
              </p>
            ) : null}

            <button
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(180deg,#1a63c8_0%,#0e4da6_55%,#00478d_100%)] text-sm font-semibold text-white shadow-[0_12px_28px_-8px_rgba(0,71,141,0.6),inset_0_1px_0_rgba(255,255,255,0.22)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b64c0] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Please wait…
                </>
              ) : (
                <>
                  {isReset ? "Update password" : "Send reset link"}
                  <ArrowRight
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                    size={17}
                  />
                </>
              )}
            </button>
          </form>
        ) : (
          <p
            className="mt-6 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200"
            role="alert"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            This reset link is invalid or has expired. Please request a new one.
          </p>
        )}

        <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-5 text-sm font-semibold text-[#1b64c0] dark:border-white/[0.06] dark:text-sky-400">
          <Link className="underline-offset-4 hover:underline" href="/auth">
            Back to sign in
          </Link>
          {isReset && !isComplete ? (
            <Link className="underline-offset-4 hover:underline" href="/forgot-password">
              Request a new link
            </Link>
          ) : null}
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400 dark:text-slate-500">
          <LockKeyhole size={13} className="shrink-0" />
          Workspace access is managed by your organization.
        </p>
      </section>
    </main>
  );
}

function FieldShell({
  children,
  icon: Icon,
  inputId,
  label,
  required = false,
}: {
  children: ReactNode;
  icon: ComponentType<{ size?: number; className?: string }>;
  inputId: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5 text-[13px] font-semibold text-slate-800 dark:text-slate-200">
      <span>
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-rose-400">
            *
          </span>
        ) : null}
      </span>
      <div className="relative">
        {children}
        {Icon ? (
          <Icon
            className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-slate-400 peer-focus:text-[#1b64c0]"
            size={17}
          />
        ) : null}
      </div>
    </label>
  );
}

const inputClassName =
  "peer h-11.5 w-full rounded-xl border border-slate-200 bg-white pl-10.5 pr-4 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(16,24,40,0.05)] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1b64c0] focus:ring-4 focus:ring-[#1b64c0]/12 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:hover:border-white/20 dark:focus:border-sky-400/60 dark:focus:ring-sky-400/15";

function EmailField({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  const inputId = useId();

  return (
    <FieldShell icon={Mail} inputId={inputId} label="Email address" required>
      <input
        autoComplete="email"
        className={inputClassName}
        id={inputId}
        onChange={(event) => onChange(event.target.value)}
        placeholder="you@work.com"
        required
        type="email"
        value={value}
      />
    </FieldShell>
  );
}

function PasswordField({
  label,
  onChange,
  placeholder,
  required = false,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  value: string;
}) {
  const inputId = useId();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <FieldShell
      icon={LockKeyhole}
      inputId={inputId}
      label={label}
      required={required}
    >
      <input
        autoComplete="new-password"
        className={inputClassName + " pr-12"}
        id={inputId}
        maxLength={128}
        minLength={8}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={isPasswordVisible ? "text" : "password"}
        value={value}
      />
      <button
        aria-label={isPasswordVisible ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b64c0]"
        onClick={() => setIsPasswordVisible((visible) => !visible)}
        type="button"
      >
        {isPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </FieldShell>
  );
}
