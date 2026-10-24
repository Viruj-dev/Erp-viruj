"use client";

import { VirujLogo } from "@/components/brand/viruj-logo";
import { virujBrand } from "@/lib/viruj-brand";

import { authClient } from "@/lib/auth-client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";

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
    <main className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-4 text-slate-950 dark:bg-[#05070a] dark:text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-[#10151b] dark:shadow-[0_28px_100px_rgba(0,0,0,0.55)] dark:ring-1 dark:ring-white/10 sm:p-9">
        <div className="mb-8 flex items-center gap-2">
          <VirujLogo />
          <span className="font-headline text-sm font-bold">
            {virujBrand.product}
          </span>
        </div>

        <h1 className="font-headline text-2xl font-bold">
          {isReset ? "Set a new password" : "Forgot your password?"}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {isReset
            ? "Choose a new password for your care workspace."
            : "Enter your registered email address and we will send a password reset link."}
        </p>

        {isComplete ? (
          <div
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200"
            role="status"
          >
            {isReset
              ? "Your password has been updated. You can now sign in."
              : "If an account exists for that email, a reset link is on its way. Check your inbox and spam folder."}
          </div>
        ) : canReset || !isReset ? (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {isReset ? (
              <>
                <label
                  className="block space-y-1 text-sm font-semibold"
                  htmlFor="new-password"
                >
                  <span>New password</span>
                  <input
                    autoComplete="new-password"
                    className={inputClassName}
                    id="new-password"
                    maxLength={128}
                    minLength={8}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    type="password"
                    value={password}
                  />
                </label>
                <label
                  className="block space-y-1 text-sm font-semibold"
                  htmlFor="confirm-password"
                >
                  <span>Confirm new password</span>
                  <input
                    autoComplete="new-password"
                    className={inputClassName}
                    id="confirm-password"
                    onChange={(event) => setConfirmation(event.target.value)}
                    required
                    type="password"
                    value={confirmation}
                  />
                </label>
              </>
            ) : (
              <label
                className="block space-y-1 text-sm font-semibold"
                htmlFor="reset-email"
              >
                <span>Email address</span>
                <input
                  autoComplete="email"
                  className={inputClassName}
                  id="reset-email"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </label>
            )}

            {errorMessage ? (
              <p
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}

            <button
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-800 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-50"
              disabled={isPending}
              type="submit"
            >
              {isPending
                ? "Please wait..."
                : isReset
                  ? "Update password"
                  : "Send reset link"}
              <ArrowRight size={17} />
            </button>
          </form>
        ) : (
          <p
            className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200"
            role="alert"
          >
            This reset link is invalid or has expired. Please request a new one.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          <Link className="underline underline-offset-4" href="/auth">
            Back to sign in
          </Link>
          {isReset && !isComplete ? (
            <Link
              className="underline underline-offset-4"
              href="/forgot-password"
            >
              Request a new link
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}

const inputClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-[#161c24] dark:text-white dark:focus:border-cyan-400/40 dark:focus:ring-cyan-400/15";
