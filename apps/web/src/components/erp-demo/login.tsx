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

type Step = "login" | "onboarding" | "invitation";

export function ErpDemoLogin({ onLogin }: { onLogin: () => void }) {
  const [step, setStep] = useState<Step>("login");

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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
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
            Reducing cognitive load for clinicians through intentional design and
            structural clarity. Built for hospitals, doctors, and labs.
          </motion.p>
          <div className="mt-12 flex gap-4">
            <FeaturePill
              icon={<ShieldCheck className="text-secondary-container" size={24} />}
              subtitle="Standard encryption"
              title="HIPAA Compliant"
            />
            <FeaturePill
              icon={<Zap className="text-secondary-container" size={24} />}
              subtitle="Real-time updates"
              title="0.4s Latency"
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
                    onLogin();
                  }}
                >
                  <FormField label="Institutional ID / Email" placeholder="admin@hospital-group.com" type="text" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="px-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                        Password
                      </label>
                      <button className="text-xs font-semibold text-primary" type="button">
                        Forgot Access?
                      </button>
                    </div>
                    <input
                      className="w-full rounded-lg border-none bg-surface-container-highest px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-primary/20"
                      placeholder="••••••••"
                      required
                      type="password"
                    />
                  </div>
                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-container py-3 font-bold text-white shadow-md transition-opacity hover:opacity-90"
                    type="submit"
                  >
                    Authorize Session
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

                <button
                  className="w-full rounded-lg border border-outline-variant/30 py-3 font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
                  onClick={() => setStep("onboarding")}
                  type="button"
                >
                  Initialize New Organization
                </button>
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
                      Step 1 of 3: Identity
                    </p>
                  </div>
                  <button
                    className="rounded-full p-2 transition-colors hover:bg-surface-container-low"
                    onClick={() => setStep("login")}
                    type="button"
                  >
                    <X size={20} />
                  </button>
                </header>

                <div className="flex gap-4 rounded-xl border border-primary-fixed bg-primary-fixed/30 p-4">
                  <Info className="mt-1 text-primary" size={18} />
                  <p className="text-xs leading-relaxed text-on-primary-fixed">
                    Creating a new organization requires institutional verification.
                    If you were invited, use the invitation code instead.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Org Name" placeholder="St. Mary's General" type="text" />
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                        Type
                      </label>
                      <select className="w-full appearance-none rounded-lg border-none bg-surface-container-highest px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20">
                        <option>Multi-specialty Hospital</option>
                        <option>Diagnostic Center</option>
                        <option>Private Clinic</option>
                      </select>
                    </div>
                  </div>
                  <FormField label="Contact Head" placeholder="chief.admin@viruj.health" type="email" />
                  <div className="flex gap-4 pt-4">
                    <button
                      className="flex-1 rounded-lg py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
                      onClick={() => setStep("invitation")}
                      type="button"
                    >
                      I have a code
                    </button>
                    <button
                      className="flex-1 rounded-lg bg-primary py-3 font-bold text-white shadow-md transition-opacity hover:opacity-90"
                      onClick={onLogin}
                      type="button"
                    >
                      Create Organization
                    </button>
                  </div>
                </div>
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
                    Enter Code
                  </h2>
                  <p className="mt-2 text-on-surface-variant">
                    Join an existing clinical institution
                  </p>
                </header>
                <div className="flex justify-between gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={`invitation-${index}`}
                      className="h-16 w-14 rounded-xl border-none bg-surface-container-highest text-center text-2xl font-bold focus:ring-2 focus:ring-secondary"
                      maxLength={1}
                      type="text"
                    />
                  ))}
                </div>
                <button
                  className="w-full rounded-lg bg-primary py-3 font-bold text-white shadow-md transition-opacity hover:opacity-90"
                  onClick={onLogin}
                  type="button"
                >
                  Verify & Connect
                </button>
                <button
                  className="w-full py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
                  onClick={() => setStep("onboarding")}
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
  placeholder,
  type,
}: {
  label: string;
  placeholder: string;
  type: string;
}) {
  return (
    <div className="space-y-1">
      <label className="px-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </label>
      <input
        className="w-full rounded-lg border-none bg-surface-container-highest px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-primary/20"
        placeholder={placeholder}
        type={type}
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
      <span className={active ? "text-[11px] font-bold uppercase tracking-wider text-primary" : "text-[11px] font-bold uppercase tracking-wider"}>
        {label}
      </span>
    </button>
  );
}
