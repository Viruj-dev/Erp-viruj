"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  HeartPulse,
  LayoutGrid,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const overviewStats = [
  {
    label: "Today's appointments",
    value: "42",
    note: "8 are already checked in",
    icon: CalendarDays,
    tone: "text-cyan-300 bg-cyan-400/12",
  },
  {
    label: "Completion rate",
    value: "94%",
    note: "Higher than last week",
    icon: CheckCircle2,
    tone: "text-emerald-300 bg-emerald-400/12",
  },
  {
    label: "Response time",
    value: "7m",
    note: "Average patient callback",
    icon: Clock3,
    tone: "text-amber-300 bg-amber-400/12",
  },
  {
    label: "Community reach",
    value: "1.8k",
    note: "Across posts and campaigns",
    icon: Users,
    tone: "text-violet-300 bg-violet-400/12",
  },
];

const queueRows = [
  {
    patient: "Aarav Khanna",
    slot: "09:30",
    service: "Cardiac review",
    doctor: "Dr. Meera Sethi",
    status: "Checked in",
    statusClass: "text-cyan-300 bg-cyan-400/12 border-cyan-400/20",
  },
  {
    patient: "Nisha Arora",
    slot: "11:10",
    service: "Post-op follow-up",
    doctor: "Dr. Rohan Gupta",
    status: "Confirmed",
    statusClass: "text-emerald-300 bg-emerald-400/12 border-emerald-400/20",
  },
  {
    patient: "Kabir Jain",
    slot: "13:45",
    service: "Dermatology consult",
    doctor: "Dr. Aditi Rana",
    status: "Pending",
    statusClass: "text-amber-300 bg-amber-400/12 border-amber-400/20",
  },
];

const alerts = [
  {
    title: "Two MRI reports still need approval",
    detail: "Radiology queue is blocked until review is completed.",
    icon: CircleAlert,
    tone: "text-rose-300 bg-rose-400/12",
  },
  {
    title: "Health camp campaign is trending",
    detail: "Community engagement is up 24 percent this week.",
    icon: Sparkles,
    tone: "text-cyan-300 bg-cyan-400/12",
  },
  {
    title: "Insurance desk cleared morning backlog",
    detail: "Front office wait time dropped by 2 minutes.",
    icon: ShieldCheck,
    tone: "text-emerald-300 bg-emerald-400/12",
  },
];

const segments = [
  { label: "OPD", value: "61%", color: "bg-cyan-400" },
  { label: "Diagnostics", value: "23%", color: "bg-emerald-400" },
  { label: "Follow-up", value: "16%", color: "bg-amber-400" },
];

export function Dashboard() {
  return (
    <div className="space-y-6 animate-in">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="surface-panel relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,rgba(7,89,133,0.34),rgba(15,23,42,0.86)_55%,rgba(6,78,59,0.42))] p-6 md:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_30%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">
              <LayoutGrid className="h-3.5 w-3.5" />
              Provider operations
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
              Run the provider floor from one dashboard instead of five separate
              tools.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              Appointments, care throughput, community performance, and urgent
              operational blockers stay visible here so staff can act faster.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:w-[430px]">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Live occupancy
              </p>
              <p className="mt-2 text-3xl font-black text-white">78%</p>
              <p className="text-xs text-slate-400">Across active care zones</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Escalations
              </p>
              <p className="mt-2 text-3xl font-black text-white">04</p>
              <p className="text-xs text-slate-400">
                Need attention this shift
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Growth
              </p>
              <p className="mt-2 flex items-center gap-2 text-3xl font-black text-white">
                12%
                <TrendingUp className="h-5 w-5 text-emerald-300" />
              </p>
              <p className="text-xs text-slate-400">Compared with last month</p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.article
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="surface-panel rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(15,23,42,0.78),rgba(15,23,42,0.58))] p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-4xl font-black text-white">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl",
                    stat.tone
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-300">{stat.note}</p>
            </motion.article>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <section className="surface-panel overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(15,23,42,0.8),rgba(15,23,42,0.6))]">
          <div className="flex items-center justify-between border-b border-white/5 p-5 md:p-6">
            <div>
              <h2 className="text-xl font-black text-white">
                Front desk queue
              </h2>
              <p className="text-sm text-slate-400">
                Current appointment flow and waiting room signal
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-300 transition hover:bg-white/[0.08]">
              View appointments
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-4 p-5 md:p-6">
            {queueRows.map((row, index) => (
              <motion.article
                key={row.patient}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className="grid gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4 md:grid-cols-[100px_1fr_auto]"
              >
                <div className="rounded-[1.25rem] bg-slate-950/45 p-4 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Slot
                  </p>
                  <p className="mt-2 text-2xl font-black text-white">
                    {row.slot}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {row.patient}
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">{row.service}</p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                    <HeartPulse className="h-3.5 w-3.5 text-cyan-300" />
                    {row.doctor}
                  </div>
                </div>
                <div className="flex items-center md:justify-end">
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                      row.statusClass
                    )}
                  >
                    {row.status}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="surface-panel rounded-[2rem] bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.62))] p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Service mix</h2>
                <p className="text-sm text-slate-400">
                  Distribution of active appointments today
                </p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-3">
                <Activity className="h-5 w-5 text-cyan-300" />
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-full bg-slate-950/45">
              <div className="flex h-4">
                {segments.map((segment) => (
                  <div
                    key={segment.label}
                    className={segment.color}
                    style={{ width: segment.value }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {segments.map((segment) => (
                <div
                  key={segment.label}
                  className="flex items-center justify-between rounded-[1.2rem] bg-white/[0.03] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn("h-3 w-3 rounded-full", segment.color)}
                    />
                    <span className="text-sm font-semibold text-slate-200">
                      {segment.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-white">
                    {segment.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-panel rounded-[2rem] bg-[linear-gradient(180deg,rgba(30,41,59,0.76),rgba(15,23,42,0.6))] p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Highlights</h2>
                <p className="text-sm text-slate-400">
                  What needs visibility this shift
                </p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-3">
                <MessageSquareText className="h-5 w-5 text-violet-300" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {alerts.map((alert, index) => {
                const Icon = alert.icon;
                return (
                  <motion.article
                    key={alert.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-2xl",
                          alert.tone
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {alert.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                          {alert.detail}
                        </p>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
