"use client";

import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseMedical,
  Building2,
  CheckCircle2,
  Microscope,
  RadioTower,
  Stethoscope,
} from "lucide-react";
import type { ComponentType } from "react";

import type { ProviderOption } from "./auth-types";

const providerIcons: Record<
  ProviderOption["iconName"],
  ComponentType<{ className?: string }>
> = {
  briefcase: BriefcaseMedical,
  building: Building2,
  microscope: Microscope,
  radio: RadioTower,
  stethoscope: Stethoscope,
};

type SignInScreenProps = {
  email: string;
  onEmailChange: (value: string) => void;
  onForgot: () => void;
  onPasswordChange: (value: string) => void;
  password: string;
};

export function SignInScreen({
  email,
  onEmailChange,
  onForgot,
  onPasswordChange,
  password,
}: SignInScreenProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
      <div className="space-y-5">
        <Field
          label="Email address"
          type="email"
          value={email}
          onChange={onEmailChange}
          placeholder="provider@virujhealth.com"
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={onPasswordChange}
          placeholder="Enter your password"
        />
        <button
          type="button"
          onClick={onForgot}
          className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          Forgot password?
        </button>
        <PrimaryButton label="Continue to workspace" />
      </div>

      <aside className="rounded-[1.3rem] border border-white/8 bg-slate-950/35 px-4 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Login Notes
        </p>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <p>Use the same provider account each time to keep workspace data aligned.</p>
          <p className="text-slate-400">
            This layout keeps secondary help nearby without competing with the main form.
          </p>
        </div>
      </aside>
    </div>
  );
}

type SignUpScreenProps = {
  email: string;
  name: string;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onProviderChange: (providerId: ProviderOption["id"]) => void;
  password: string;
  providers: ProviderOption[];
  selectedProvider: ProviderOption["id"] | "";
};

export function SignUpScreen({
  email,
  name,
  onEmailChange,
  onNameChange,
  onPasswordChange,
  onProviderChange,
  password,
  providers,
  selectedProvider,
}: SignUpScreenProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.3rem] border border-white/8 bg-slate-950/35 px-4 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
          Provider type
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {providers.map((provider) => {
            const Icon = providerIcons[provider.iconName];
            const isActive = selectedProvider === provider.id;

            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => onProviderChange(provider.id)}
                className={cn(
                  "rounded-[1.3rem] border px-4 py-4 text-left transition-all",
                  isActive
                    ? "border-cyan-400/30 bg-cyan-400/10 shadow-[0_14px_34px_rgba(34,211,238,0.12)]"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/45 text-cyan-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{provider.label}</p>
                    <p className="text-xs text-slate-400">{provider.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Organization or provider"
          value={name}
          onChange={onNameChange}
          placeholder="Viruj Health"
        />
        <Field
          label="Email address"
          type="email"
          value={email}
          onChange={onEmailChange}
          placeholder="provider@virujhealth.com"
        />
      </div>

      <Field
        label="Password"
        type="password"
        value={password}
        onChange={onPasswordChange}
        placeholder="Create a secure password"
      />

      <div className="rounded-[1.3rem] border border-cyan-400/12 bg-cyan-400/8 px-4 py-4 text-sm text-slate-200">
        Your workspace will use the selected provider role to shape profile,
        appointment, and service workflows.
      </div>

      <PrimaryButton label="Create provider account" />
    </div>
  );
}

type ForgotPasswordScreenProps = {
  email: string;
  onBack: () => void;
  onEmailChange: (value: string) => void;
};

export function ForgotPasswordScreen({
  email,
  onBack,
  onEmailChange,
}: ForgotPasswordScreenProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.3rem] border border-white/8 bg-slate-950/35 px-4 py-4 text-sm text-slate-400">
        We will send a recovery code to the email on file. Use that code on the
        next screen to regain access.
      </div>
      <Field
        label="Work email"
        type="email"
        value={email}
        onChange={onEmailChange}
        placeholder="provider@virujhealth.com"
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-bold text-slate-200 transition hover:bg-white/[0.06]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <PrimaryButton className="sm:flex-1" label="Send recovery code" />
      </div>
    </div>
  );
}

type VerifyCodeScreenProps = {
  code: string[];
  email: string;
  onBack: () => void;
  onCodeChange: (index: number, value: string) => void;
};

export function VerifyCodeScreen({
  code,
  email,
  onBack,
  onCodeChange,
}: VerifyCodeScreenProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.3rem] border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100">
        Recovery code sent to {email || "provider@virujhealth.com"}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {code.map((digit, index) => (
          <input
            key={index}
            value={digit}
            onChange={(event) => onCodeChange(index, event.target.value.slice(0, 1))}
            className="h-[4.5rem] rounded-[1.2rem] border border-white/10 bg-slate-950/50 text-center text-xl font-black text-slate-100 outline-none transition focus:border-cyan-400/40"
            inputMode="numeric"
          />
        ))}
      </div>

      <div className="rounded-[1.3rem] border border-white/8 bg-slate-950/35 px-4 py-4 text-sm text-slate-400">
        Enter the 4-digit code exactly as received. This screen stays minimal so
        the primary action is obvious.
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-bold text-slate-200 transition hover:bg-white/[0.06]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <PrimaryButton className="sm:flex-1" label="Verify and continue" />
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Recovery flow active
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
};

function Field({
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[1.2rem] border border-white/10 bg-slate-950/45 px-4 py-3.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40"
        required
      />
    </label>
  );
}

type PrimaryButtonProps = {
  className?: string;
  label: string;
};

function PrimaryButton({ className, label }: PrimaryButtonProps) {
  return (
    <button
      type="submit"
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-cyan-500 px-5 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 hover:shadow-[0_12px_30px_rgba(34,211,238,0.2)]",
        className
      )}
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}
