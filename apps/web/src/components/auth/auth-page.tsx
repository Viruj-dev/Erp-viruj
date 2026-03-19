"use client";

import { cn } from "@/lib/utils";
import { useApp } from "@/store/app-context";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseMedical,
  Building2,
  CheckCircle2,
  KeyRound,
  MailCheck,
  Microscope,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useState } from "react";

type AuthView = "signin" | "signup" | "forgot" | "verify";

const providers = [
  {
    id: "hospital",
    label: "Hospital",
    desc: "Multi-specialty facility operations",
    icon: BriefcaseMedical,
  },
  {
    id: "doctor",
    label: "Doctor",
    desc: "Independent practitioner workflow",
    icon: Stethoscope,
  },
  {
    id: "clinic",
    label: "Clinic",
    desc: "Local care center and front desk team",
    icon: Building2,
  },
  {
    id: "pathology",
    label: "Pathology",
    desc: "Diagnostics and report operations",
    icon: Microscope,
  },
  {
    id: "radiology",
    label: "Radiology",
    desc: "Imaging and slot scheduling",
    icon: RadioTower,
  },
] as const;

const trustLines = [
  "Appointments, profile, and community in one portal",
  "Built for hospitals, doctors, clinics, and diagnostics",
  "Fast provider onboarding with a cleaner ERP shell",
];

const viewMeta: Record<
  AuthView,
  { title: string; description: string; badge: string; icon: typeof Sparkles }
> = {
  signin: {
    title: "Sign in to your workspace",
    description: "Use your provider account to open the ERP dashboard.",
    badge: "Access portal",
    icon: Sparkles,
  },
  signup: {
    title: "Create your provider account",
    description: "Set up your workspace for appointments, profile, and growth.",
    badge: "New onboarding",
    icon: ShieldCheck,
  },
  forgot: {
    title: "Reset your password",
    description: "We will send a secure recovery code to your email address.",
    badge: "Account recovery",
    icon: KeyRound,
  },
  verify: {
    title: "Verify your access code",
    description: "Enter the code sent to your email to continue securely.",
    badge: "Verification",
    icon: MailCheck,
  },
};

export function AuthPage() {
  const { state, setProviderType, setLoggedIn, setUserEmail, setUserName } =
    useApp();
  const [view, setView] = useState<AuthView>(state.isSignUp ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);

  const meta = viewMeta[view];
  const MetaIcon = meta.icon;

  const enterWorkspace = () => {
    setUserName(name || email.split("@")[0] || "Viruj Provider");
    setUserEmail(email);
    setLoggedIn(true);
  };

  const handlePrimarySubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!state.providerType) {
      alert("Select provider type");
      return;
    }

    if (view === "signin" || view === "signup") {
      enterWorkspace();
      return;
    }

    if (view === "forgot") {
      setView("verify");
      return;
    }

    if (view === "verify") {
      enterWorkspace();
    }
  };

  const footerAction =
    view === "signin"
      ? { label: "Create account", onClick: () => setView("signup") }
      : view === "signup"
        ? { label: "Switch to sign in", onClick: () => setView("signin") }
        : view === "forgot"
          ? { label: "Back to sign in", onClick: () => setView("signin") }
          : { label: "Resend code", onClick: () => setCode(["", "", "", ""]) };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_28%),#0f172a] px-6 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="glass-card relative overflow-hidden rounded-[2rem] p-6 md:p-8"
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),transparent_40%,rgba(16,185,129,0.06))]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/15">
                  <Sparkles className="h-4 w-4" />
                </div>
                Viruj ERP
              </div>

              <h1 className="mt-8 max-w-2xl text-4xl font-black tracking-tight text-white md:text-6xl">
                A sharper operating system for provider teams.
              </h1>
              <p className="mt-4 max-w-xl text-base text-slate-300">
                Sign in to manage appointments, staff-facing operations, public
                profile quality, and growth from one consistent interface.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Providers live", value: "240+" },
                  { label: "Avg response", value: "< 10m" },
                  { label: "Bookings synced", value: "99.2%" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-3xl font-black text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/12 text-emerald-200">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Why teams choose this shell</h2>
                  <p className="text-sm text-slate-400">
                    Clear actions, cleaner hierarchy, less page drift
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {trustLines.map((line) => (
                  <div
                    key={line}
                    className="rounded-[1.2rem] bg-slate-950/40 px-4 py-3 text-sm text-slate-300"
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.06 }}
          className="glass-card rounded-[2rem] p-6 md:p-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <MetaIcon className="h-3.5 w-3.5" />
                {meta.badge}
              </div>
              <h2 className="mt-3 text-3xl font-black text-white">{meta.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{meta.description}</p>
            </div>
            {(view === "forgot" || view === "verify") && (
              <button
                onClick={() => setView("signin")}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-300 transition hover:bg-white/[0.08]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Sign in
              </button>
            )}
          </div>

          {(view === "signin" || view === "signup") && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-200">Choose provider type</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {providers.map((provider) => {
                  const Icon = provider.icon;
                  return (
                    <button
                      key={provider.id}
                      onClick={() => setProviderType(provider.id)}
                      className={cn(
                        "rounded-[1.4rem] border p-4 text-left transition-all",
                        state.providerType === provider.id
                          ? "border-cyan-400/30 bg-cyan-400/10 shadow-[0_18px_40px_rgba(34,211,238,0.12)]"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      )}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/45 text-cyan-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-sm font-bold text-white">{provider.label}</h3>
                      <p className="mt-1 text-xs text-slate-400">{provider.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <form onSubmit={handlePrimarySubmit} className="mt-8 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {view === "signup" && (
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      Organization or provider name
                    </span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Viruj Health"
                      className="w-full rounded-[1.2rem] border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40"
                      required
                    />
                  </label>
                )}

                {(view === "signin" || view === "signup" || view === "forgot") && (
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      Email address
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="provider@virujhealth.com"
                      className="w-full rounded-[1.2rem] border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40"
                      required
                    />
                  </label>
                )}

                {(view === "signin" || view === "signup") && (
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      Password
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-[1.2rem] border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40"
                      required
                    />
                  </label>
                )}

                {view === "verify" && (
                  <div className="space-y-4">
                    <div className="rounded-[1.3rem] border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                      Recovery code sent to {email || "provider@virujhealth.com"}
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          value={digit}
                          onChange={(event) => {
                            const next = [...code];
                            next[index] = event.target.value.slice(0, 1);
                            setCode(next);
                          }}
                          className="h-14 rounded-[1.1rem] border border-white/10 bg-slate-950/35 text-center text-xl font-black text-slate-100 outline-none transition focus:border-cyan-400/40"
                        />
                      ))}
                    </div>
                    <div className="rounded-[1.2rem] bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
                      Use the 4-digit code from your email to continue.
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {(view === "signin" || view === "signup") && (
              <button
                type="button"
                onClick={() => setView("forgot")}
                className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                Forgot password?
              </button>
            )}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-cyan-500 px-5 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              {view === "signin" && "Secure sign in"}
              {view === "signup" && "Create account"}
              {view === "forgot" && "Send recovery code"}
              {view === "verify" && "Verify and continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between rounded-[1.3rem] border border-white/8 bg-white/[0.03] px-4 py-3">
            <button
              onClick={footerAction.onClick}
              className="text-sm font-semibold text-slate-200 transition hover:text-white"
            >
              {footerAction.label}
            </button>
            {view === "verify" && (
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Recovery flow active
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
