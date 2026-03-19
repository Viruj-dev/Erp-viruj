"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  CalendarClock,
  CreditCard,
  Gem,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "INR 2,499",
    note: "For smaller provider teams",
    features: ["Appointments", "Basic profile", "Community posting"],
    tone: "border-white/10 bg-white/[0.03]",
  },
  {
    name: "Growth",
    price: "INR 5,999",
    note: "Best fit for active clinics and hospitals",
    features: [
      "Everything in Starter",
      "Advanced queue board",
      "Priority support",
    ],
    tone: "border-cyan-400/25 bg-cyan-400/10",
  },
  {
    name: "Scale",
    price: "Custom",
    note: "For larger multi-location providers",
    features: ["Custom roles", "Account management", "Workflow tailoring"],
    tone: "border-emerald-400/20 bg-emerald-400/10",
  },
];

export function Subscription() {
  return (
    <div className="space-y-6 animate-in">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="surface-panel relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,rgba(107,33,168,0.48),rgba(15,23,42,0.92)_42%,rgba(6,78,59,0.34))] p-6 md:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.16),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_28%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-violet-200">
              <Sparkles className="h-3.5 w-3.5" />
              Subscription workspace
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
              See what plan you are on and what unlocks when your team grows.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              Billing, plan value, renewals, and product access should live in
              one clear place instead of hidden behind settings fragments.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:w-[420px]">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Current plan
              </p>
              <p className="mt-2 text-3xl font-black text-white">Growth</p>
              <p className="text-xs text-slate-400">Active across the ERP</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Renewal
              </p>
              <p className="mt-2 text-3xl font-black text-white">24 Apr</p>
              <p className="text-xs text-slate-400">Auto-renew is on</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Saved time
              </p>
              <p className="mt-2 text-3xl font-black text-white">18h</p>
              <p className="text-xs text-slate-400">Estimated per month</p>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="surface-panel rounded-[2rem] bg-[linear-gradient(180deg,rgba(76,29,149,0.24),rgba(15,23,42,0.72))] p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">
                Billing summary
              </h2>
              <p className="text-sm text-slate-400">
                Snapshot of your active subscription
              </p>
            </div>
            <div className="rounded-2xl bg-violet-400/10 p-3 text-violet-200">
              <Gem className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {[
              { label: "Plan status", value: "Active", icon: BadgeCheck },
              {
                label: "Payment method",
                value: "Corporate Visa ending 2042",
                icon: CreditCard,
              },
              {
                label: "Renewal date",
                value: "24 April 2026",
                icon: CalendarClock,
              },
              {
                label: "Support tier",
                value: "Priority support",
                icon: ShieldCheck,
              },
            ].map((row) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/40 text-cyan-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-slate-300">{row.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white">
                    {row.value}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className={cn("surface-panel rounded-[1.75rem] p-5", plan.tone)}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                {plan.name}
              </p>
              <p className="mt-3 text-3xl font-black text-white">
                {plan.price}
              </p>
              <p className="mt-2 text-sm text-slate-300">{plan.note}</p>
              <div className="mt-5 space-y-2">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-[1.1rem] bg-slate-950/30 px-3 py-2 text-sm text-slate-200"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </section>
      </div>
    </div>
  );
}
