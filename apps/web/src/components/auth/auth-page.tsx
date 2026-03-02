"use client";

import React, { useState } from "react";
import { useApp } from "@/store/app-context";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const providers = [
  {
    id: "hospital",
    label: "Hospital",
    icon: "🏥",
    desc: "Multi-specialty facility",
  },
  {
    id: "doctor",
    label: "Doctor",
    icon: "👨‍⚕️",
    desc: "Individual practitioner",
  },
  { id: "clinic", label: "Clinic", icon: "🏪", desc: "Outpatient care center" },
  {
    id: "pathology",
    label: "Pathology",
    icon: "🔬",
    desc: "Diagnostic laboratory",
  },
  {
    id: "radiology",
    label: "Radiology",
    icon: "📡",
    desc: "Imaging & diagnostics",
  },
];

export function AuthPage() {
  const {
    state,
    setProviderType,
    setLoggedIn,
    setUserName,
    setUserEmail,
    setIsSignUp,
  } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.providerType) return alert("Select provider type");

    // Simulate auth
    setUserName(name || email.split("@")[0]);
    setUserEmail(email);
    setLoggedIn(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-body)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-sky-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl w-full space-y-12 relative z-10">
        <header className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-primary/20">
              🏥
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent italic">
              MedConnect
            </h1>
          </div>
          <p className="text-[#94a3b8] text-xl font-medium">
            Healthcare Provider Portal
          </p>
        </header>

        <section className="space-y-6">
          <h2 className="text-center text-[#f1f5f9] font-bold text-lg">
            Select Your Provider Type
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => setProviderType(p.id as any)}
                className={cn(
                  "p-6 rounded-2xl border transition-all duration-300 group relative overflow-hidden bg-white/5",
                  state.providerType === p.id
                    ? "border-primary shadow-lg shadow-primary/20 bg-primary/10"
                    : "border-white/5 hover:border-white/20 hover:-translate-y-1"
                )}
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {p.icon}
                </div>
                <h3 className="font-bold text-sm text-[#f1f5f9]">{p.label}</h3>
                <p className="text-[10px] text-[#64748b] mt-1">{p.desc}</p>
                {state.providerType === p.id && (
                  <motion.div
                    layoutId="active-provider"
                    className="absolute inset-0 bg-primary/5 pointer-events-none"
                  />
                )}
              </button>
            ))}
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto w-full"
        >
          <div className="glass-card p-10 rounded-[2.5rem] space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-white">
                {state.isSignUp ? "Join MedConnect" : "Welcome Back"}
              </h2>
              <p className="text-[#94a3b8] mt-2 text-sm leading-relaxed">
                {state.isSignUp
                  ? "Create your professional provider account today."
                  : "Please enter your credentials to access your dashboard."}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <AnimatePresence mode="wait">
                {state.isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-xs font-bold text-[#64748b] uppercase tracking-widest pl-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Apollo Hospitals"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-[#f1f5f9] focus:outline-none focus:border-primary transition-all placeholder:text-[#334155]"
                      required={state.isSignUp}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-widest pl-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="provider@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-[#f1f5f9] focus:outline-none focus:border-primary transition-all placeholder:text-[#334155]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-widest pl-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-[#f1f5f9] focus:outline-none focus:border-primary transition-all placeholder:text-[#334155]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-5 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] mt-4"
              >
                {state.isSignUp ? "CREATE ACCOUNT" : "SECURE SIGN IN"}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                onClick={() => setIsSignUp(!state.isSignUp)}
                className="text-sm font-medium text-primary hover:text-white transition-colors"
              >
                {state.isSignUp
                  ? "ALREADY HAVE AN ACCOUNT? SIGN IN"
                  : "DON'T HAVE AN ACCOUNT? SIGN UP"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
