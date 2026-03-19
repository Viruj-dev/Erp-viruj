"use client";

import { useApp } from "@/store/app-context";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Camera,
  Globe2,
  Hospital,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  Sparkles,
  Stethoscope,
} from "lucide-react";

const providerMeta = {
  hospital: {
    label: "Hospital profile",
    descriptor: "Facility operations and trust layer",
    icon: Hospital,
  },
  doctor: {
    label: "Doctor profile",
    descriptor: "Clinical credibility and patient-facing identity",
    icon: Stethoscope,
  },
  clinic: {
    label: "Clinic profile",
    descriptor: "Location, specialties, and service confidence",
    icon: Hospital,
  },
  pathology: {
    label: "Lab profile",
    descriptor: "Diagnostics, reporting, and quality standards",
    icon: Shield,
  },
  radiology: {
    label: "Radiology profile",
    descriptor: "Imaging capabilities and turnaround trust",
    icon: Shield,
  },
} as const;

const serviceTags = [
  "Cardiology",
  "Emergency care",
  "Diagnostics",
  "Same-day consults",
  "Insurance desk",
  "Teleconsultation",
];

const trustBlocks = [
  { label: "Profile strength", value: "88%", note: "3 fields missing" },
  { label: "Avg rating", value: "4.8", note: "Across 126 reviews" },
  { label: "Response SLA", value: "< 10m", note: "For inbound queries" },
];

export function Profile() {
  const { state } = useApp();
  const key =
    state.providerType === ""
      ? "hospital"
      : (state.providerType as keyof typeof providerMeta);
  const meta = providerMeta[key];
  const Icon = meta.icon;

  return (
    <div className="space-y-6 animate-in">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="surface-panel relative overflow-hidden rounded-[2rem] bg-[linear-gradient(140deg,rgba(14,116,144,0.4),rgba(15,23,42,0.9)_42%,rgba(76,29,149,0.4))] p-6 md:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.12),_transparent_30%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              {meta.label}
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
              Present a profile that patients, partners, and your own staff can
              trust quickly.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              This page controls the public identity of your provider brand:
              contact details, specialties, credentials, and operational
              confidence signals.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:w-[420px]">
            {trustBlocks.map((block) => (
              <div
                key={block.label}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  {block.label}
                </p>
                <p className="mt-2 text-3xl font-black text-white">
                  {block.value}
                </p>
                <p className="text-xs text-slate-400">{block.note}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="surface-panel rounded-[2rem] bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(30,41,59,0.64))] p-6">
          <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(15,23,42,0.42))] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.5rem] bg-slate-950/45 text-cyan-300">
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">
                    {state.userName || "Viruj Provider"}
                  </h2>
                  <p className="text-sm text-slate-300">{meta.descriptor}</p>
                </div>
              </div>
              <button className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-slate-300 transition hover:bg-white/[0.08]">
                <Camera className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.3rem] bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-cyan-300" />
                  {state.userEmail || "provider@virujhealth.com"}
                </div>
              </div>
              <div className="rounded-[1.3rem] bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-300" />
                  +91 98765 43210
                </div>
              </div>
              <div className="rounded-[1.3rem] bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-300" />
                  Noida Sector 62, Uttar Pradesh
                </div>
              </div>
              <div className="rounded-[1.3rem] bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-violet-300" />
                  virujhealth.com/provider
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">
                  Verification stack
                </h3>
                <p className="text-sm text-slate-400">
                  The trust indicators surfaced to patients
                </p>
              </div>
              <BadgeCheck className="h-5 w-5 text-emerald-300" />
            </div>
            <div className="mt-4 space-y-3">
              {[
                "Registration number verified",
                "Consultation hours synced",
                "Insurance support badge enabled",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.2rem] bg-slate-950/40 px-4 py-3 text-sm text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-panel rounded-[2rem] bg-[linear-gradient(180deg,rgba(30,41,59,0.78),rgba(15,23,42,0.68))] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">
                Provider information
              </h2>
              <p className="text-sm text-slate-400">
                Refine the data shown to patients and partner teams
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400">
              <Save className="h-4 w-4" />
              Save changes
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              {
                label: "Provider name",
                value: state.userName || "Viruj Provider",
              },
              {
                label: "Primary email",
                value: state.userEmail || "provider@virujhealth.com",
              },
              {
                label: "Phone number",
                value: "+91 98765 43210",
              },
              {
                label: "Registration ID",
                value: "VRJ-UP-24019",
              },
            ].map((field) => (
              <label key={field.label} className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  {field.label}
                </span>
                <input
                  defaultValue={field.value}
                  className="w-full rounded-[1.2rem] border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40"
                />
              </label>
            ))}
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Address
            </span>
            <textarea
              defaultValue="Tower A, Sector 62, Noida, Uttar Pradesh 201309"
              className="h-24 w-full resize-none rounded-[1.2rem] border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40"
            />
          </label>

          <div className="mt-4">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Key services
            </span>
            <div className="flex flex-wrap gap-2 rounded-[1.2rem] border border-white/10 bg-slate-950/35 p-4">
              {serviceTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              About provider
            </span>
            <textarea
              defaultValue="Viruj Health delivers coordinated outpatient care, diagnostics, and specialist access with a strong emphasis on queue management and patient responsiveness."
              className="h-32 w-full resize-none rounded-[1.2rem] border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40"
            />
          </label>
        </section>
      </div>
    </div>
  );
}
