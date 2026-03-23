"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { viewCopy } from "./auth-data";
import type { AuthView } from "./auth-types";

type AuthShellProps = {
  children: ReactNode;
  footer: ReactNode;
  sidePanel: ReactNode;
  view: AuthView;
};

const screenOrder: AuthView[] = ["signin", "signup", "forgot", "verify"];

export function AuthShell({
  children,
  footer,
  sidePanel,
  view,
}: AuthShellProps) {
  const currentScreen = screenOrder.indexOf(view);
  const meta = viewCopy[view];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_24%),linear-gradient(180deg,#08111f_0%,#0f172a_52%,#111827_100%)] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex flex-col gap-6 border-b border-white/8 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-bold text-slate-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/12 text-cyan-200">
                <ShieldCheck className="h-4 w-4" />
              </div>
              Viruj ERP Access
            </div>

            <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-white md:text-5xl">
              {meta.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-400 md:text-base">
              {meta.description}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-4">
            {screenOrder.map((step, index) => (
              <div
                key={step}
                className={`rounded-[1rem] border px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] ${
                  index === currentScreen
                    ? "border-cyan-300/25 bg-cyan-400/12 text-cyan-100"
                    : index < currentScreen
                      ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
                      : "border-white/8 bg-white/[0.03] text-slate-500"
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-center py-8">
          <div className="mx-auto grid w-full max-w-5xl gap-8 xl:grid-cols-[1fr_360px]">
            <main className="order-2 xl:order-1">
              <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-5 shadow-[0_24px_70px_rgba(2,6,23,0.28)] md:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.18 }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 border-t border-white/8 pt-5">{footer}</div>
              </div>
            </main>

            <aside className="order-1 xl:order-2">{sidePanel}</aside>
          </div>
        </div>
      </div>
    </div>
  );
}
