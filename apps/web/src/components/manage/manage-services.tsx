"use client";

import { useApp } from "@/store/app-context";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Clock3,
  Filter,
  IndianRupee,
  Microscope,
  Plus,
  Search,
  Stethoscope,
  Users2,
  Waves,
} from "lucide-react";

const providerConfig = {
  hospital: {
    title: "Clinical roster",
    subtitle: "Manage doctors, consultation slots, and care capacity",
    itemLabel: "Doctor",
    icon: Stethoscope,
  },
  doctor: {
    title: "Service catalog",
    subtitle: "Shape consult types, pricing, and visit formats",
    itemLabel: "Consultation",
    icon: Stethoscope,
  },
  clinic: {
    title: "Clinic services",
    subtitle: "Keep treatments, schedules, and front desk offers aligned",
    itemLabel: "Service",
    icon: Activity,
  },
  pathology: {
    title: "Diagnostics menu",
    subtitle: "Track tests, turnaround time, and booking readiness",
    itemLabel: "Test",
    icon: Microscope,
  },
  radiology: {
    title: "Imaging operations",
    subtitle: "Control scans, equipment slots, and report throughput",
    itemLabel: "Imaging service",
    icon: Waves,
  },
} as const;

const items = [
  {
    title: "Dr. Anita Verma",
    detail: "Cardiology | Mon-Sat | OPD and teleconsult",
    price: "1200",
    metric: "18 bookings today",
    state: "High demand",
  },
  {
    title: "Dr. Rohan Gupta",
    detail: "Orthopedics | Follow-up-heavy schedule",
    price: "950",
    metric: "12 bookings today",
    state: "Balanced",
  },
  {
    title: "Dr. Aditi Rana",
    detail: "Dermatology | Hybrid consult slot",
    price: "1100",
    metric: "9 bookings today",
    state: "Growing",
  },
];

const insights = [
  {
    label: "Active listings",
    value: "26",
    icon: Activity,
    tone: "text-cyan-300 bg-cyan-400/12",
  },
  {
    label: "Avg price band",
    value: "INR 980",
    icon: IndianRupee,
    tone: "text-emerald-300 bg-emerald-400/12",
  },
  {
    label: "Utilization",
    value: "82%",
    icon: Clock3,
    tone: "text-amber-300 bg-amber-400/12",
  },
];

export function ManageServices() {
  const { state } = useApp();
  const key =
    state.providerType === ""
      ? "hospital"
      : (state.providerType as keyof typeof providerConfig);
  const config = providerConfig[key];
  const Icon = config.icon;

  return (
    <div className="space-y-6 animate-in">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="surface-panel relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,rgba(5,150,105,0.34),rgba(15,23,42,0.88)_48%,rgba(8,145,178,0.34))] p-6 md:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),_transparent_28%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-200">
              <Icon className="h-3.5 w-3.5" />
              {config.title}
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
              Structure what patients can book so your demand stays manageable.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              Build a clean catalog of bookable services, assign pricing,
              monitor utilization, and quickly adjust the items that are under
              or over-performing.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:w-[420px]">
            {insights.map((insight) => {
              const InsightIcon = insight.icon;
              return (
                <div
                  key={insight.label}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      {insight.label}
                    </p>
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-2xl",
                        insight.tone
                      )}
                    >
                      <InsightIcon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-3 text-3xl font-black text-white">
                    {insight.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <section className="surface-panel rounded-[2rem] bg-[linear-gradient(180deg,rgba(6,78,59,0.18),rgba(15,23,42,0.76))] p-5 md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">
              {config.subtitle}
            </h2>
            <p className="text-sm text-slate-400">
              Search, filter, and revise live offerings without leaving the ERP
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                placeholder={`Search ${config.itemLabel.toLowerCase()}s`}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/35 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40 sm:w-64"
              />
            </label>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400">
              <Plus className="h-4 w-4" />
              Add {config.itemLabel}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {items.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="surface-panel rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(15,23,42,0.8),rgba(5,46,22,0.56))] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <Icon className="h-5 w-5" />
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                {item.state}
              </span>
            </div>

            <h3 className="mt-5 text-xl font-black text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{item.detail}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.2rem] bg-white/[0.03] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Price
                </p>
                <p className="mt-2 text-lg font-black text-white">
                  INR {item.price}
                </p>
              </div>
              <div className="rounded-[1.2rem] bg-white/[0.03] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Demand
                </p>
                <p className="mt-2 text-lg font-black text-white">
                  {item.metric}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-[1.2rem] border border-white/8 bg-slate-950/35 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Users2 className="h-4 w-4 text-emerald-300" />
                Capacity synced
              </div>
              <button className="inline-flex items-center gap-2 text-sm font-bold text-cyan-300 transition hover:text-cyan-200">
                Open
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </motion.article>
        ))}
      </section>
    </div>
  );
}
