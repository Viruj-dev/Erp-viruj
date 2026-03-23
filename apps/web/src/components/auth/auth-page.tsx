"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";

import { useApp } from "@/store/app-context";

import { providers } from "./auth-data";
import { AuthShell } from "./auth-shell";
import {
  ForgotPasswordScreen,
  SignInScreen,
  SignUpScreen,
  VerifyCodeScreen,
} from "./auth-screens";
import type { AuthView } from "./auth-types";

export function AuthPage() {
  const { state, setProviderType, setLoggedIn, setUserEmail, setUserName } =
    useApp();
  const [view, setView] = useState<AuthView>(state.isSignUp ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);

  const enterWorkspace = () => {
    setUserName(name || email.split("@")[0] || "Viruj Provider");
    setUserEmail(email);
    setLoggedIn(true);
  };

  const handlePrimarySubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (view !== "forgot" && view !== "verify" && !state.providerType) {
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
    <AuthShell
      view={view}
      sidePanel={
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.04 }}
            className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] px-5 py-5"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/35 px-4 py-2 text-sm font-bold text-slate-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/12 text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              Different Layout
            </div>

            <h2 className="mt-5 text-2xl font-black tracking-tight text-white">
              A centered auth stage with less chrome.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              The form now carries most of the weight, while support content stays
              secondary and compact on the side.
            </p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {[
              {
                label: "Visual mode",
                value: "Centered panel",
                tone: "border-cyan-300/15 bg-cyan-400/8",
              },
              {
                label: "Priority",
                value: "One action at a time",
                tone: "border-white/8 bg-white/[0.03]",
              },
              {
                label: "Fit",
                value: "Closer to the ERP shell",
                tone: "border-emerald-300/15 bg-emerald-400/8",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-[1.25rem] border px-4 py-4 ${item.tone}`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[1.4rem] border border-white/8 bg-slate-950/35 px-5 py-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Minimal but structured</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  The screens are separate, but the container is calmer and more
                  direct than the previous concepts.
                </p>
              </div>
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between rounded-[1.2rem] border border-white/8 bg-slate-950/35 px-4 py-3">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
            {view === "signin" || view === "signup"
              ? "Provider access"
              : "Recovery flow"}
          </div>
          <button
            onClick={footerAction.onClick}
            className="text-sm font-semibold text-slate-200 transition hover:text-white"
          >
            {footerAction.label}
          </button>
        </div>
      }
    >
      <form onSubmit={handlePrimarySubmit}>
        {view === "signin" ? (
          <SignInScreen
            email={email}
            onEmailChange={setEmail}
            onForgot={() => setView("forgot")}
            onPasswordChange={setPassword}
            password={password}
          />
        ) : null}

        {view === "signup" ? (
          <SignUpScreen
            email={email}
            name={name}
            onEmailChange={setEmail}
            onNameChange={setName}
            onPasswordChange={setPassword}
            onProviderChange={setProviderType}
            password={password}
            providers={providers}
            selectedProvider={state.providerType}
          />
        ) : null}

        {view === "forgot" ? (
          <ForgotPasswordScreen
            email={email}
            onBack={() => setView("signin")}
            onEmailChange={setEmail}
          />
        ) : null}

        {view === "verify" ? (
          <VerifyCodeScreen
            code={code}
            email={email}
            onBack={() => setView("forgot")}
            onCodeChange={(index, value) => {
              const next = [...code];
              next[index] = value;
              setCode(next);
            }}
          />
        ) : null}
      </form>
    </AuthShell>
  );
}
