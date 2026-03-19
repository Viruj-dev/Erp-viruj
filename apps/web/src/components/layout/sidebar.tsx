"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/store/app-context";
import {
  BarChart3,
  BellRing,
  Building2,
  Calendar,
  Gem,
  Hospital,
  LogOut,
  MessageSquare,
  Microscope,
  Package,
  RadioTower,
  ShieldCheck,
  Stethoscope,
  User,
} from "lucide-react";

const icons: Record<string, React.ReactNode> = {
  dashboard: <BarChart3 className="h-5 w-5" />,
  appointments: <Calendar className="h-5 w-5" />,
  profile: <User className="h-5 w-5" />,
  manage: <Package className="h-5 w-5" />,
  community: <MessageSquare className="h-5 w-5" />,
  subscription: <Gem className="h-5 w-5" />,
};

const providerIcons: Record<string, React.ReactNode> = {
  hospital: <Hospital className="h-5 w-5 text-sky-300" />,
  doctor: <Stethoscope className="h-5 w-5 text-emerald-300" />,
  clinic: <Building2 className="h-5 w-5 text-violet-300" />,
  pathology: <Microscope className="h-5 w-5 text-amber-300" />,
  radiology: <RadioTower className="h-5 w-5 text-rose-300" />,
};

const pageAccent: Record<string, string> = {
  dashboard: "from-cyan-400/30 via-sky-400/12 to-transparent",
  appointments: "from-amber-400/28 via-cyan-400/10 to-transparent",
  profile: "from-sky-400/25 via-violet-400/10 to-transparent",
  manage: "from-emerald-400/28 via-cyan-400/10 to-transparent",
  community: "from-violet-400/28 via-pink-400/10 to-transparent",
  subscription: "from-fuchsia-400/28 via-emerald-400/10 to-transparent",
};

const pageBadgeTone: Record<string, string> = {
  dashboard: "border-cyan-400/20 bg-cyan-400/12 text-cyan-200",
  appointments: "border-amber-400/20 bg-amber-400/12 text-amber-200",
  profile: "border-sky-400/20 bg-sky-400/12 text-sky-200",
  manage: "border-emerald-400/20 bg-emerald-400/12 text-emerald-200",
  community: "border-violet-400/20 bg-violet-400/12 text-violet-200",
  subscription: "border-fuchsia-400/20 bg-fuchsia-400/12 text-fuchsia-200",
};

const sections = ["Main", "Engagement", "Account"];

export function Sidebar() {
  const { state, setCurrentPage, logout } = useApp();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: icons.dashboard,
      section: "Main",
      hint: "Live floor pulse",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: icons.appointments,
      section: "Main",
      badge: 5,
      hint: "Queue and schedules",
    },
    {
      id: "profile",
      label: "My Profile",
      icon: providerIcons[state.providerType] || icons.profile,
      section: "Main",
      hint: "Trust and identity",
    },
    {
      id: "manage",
      label: "Manage Services",
      icon: icons.manage,
      section: "Main",
      hint: "Catalog and pricing",
    },
    {
      id: "community",
      label: "Community",
      icon: icons.community,
      section: "Engagement",
      badge: 3,
      hint: "Posts and reach",
    },
    {
      id: "subscription",
      label: "Subscription",
      icon: icons.subscription,
      section: "Account",
      hint: "Plan and billing",
    },
  ];

  const currentAccent = pageAccent[state.currentPage] ?? pageAccent.dashboard;
  const currentBadgeTone =
    pageBadgeTone[state.currentPage] ?? pageBadgeTone.dashboard;
  const initials = state.userName.slice(0, 2).toUpperCase() || "VH";
  const providerLabel = state.providerType || "provider";

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[var(--sidebar-width)] overflow-hidden border-r border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.98))] lg:flex lg:flex-col">
      <div className="pointer-events-none absolute inset-0">
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-64 bg-gradient-to-b",
            currentAccent
          )}
        />
        <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
      </div>

      <div className="relative border-b border-white/10 px-5 pb-5 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[1.25rem] border border-white/10 bg-white/[0.05] shadow-[0_12px_30px_rgba(6,182,212,0.12)]">
            <ShieldCheck className="h-5 w-5 text-cyan-200" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
              Viruj ERP
            </p>
            <h1 className="truncate text-lg font-black text-white">
              Provider Desk
            </h1>
          </div>
        </div>

        <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Current focus
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                {navItems.find((item) => item.id === state.currentPage)
                  ?.label ?? "Dashboard"}
              </p>
            </div>
            <div
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                currentBadgeTone
              )}
            >
              Live
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-[1.1rem] bg-slate-950/40 px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <BellRing className="h-4 w-4 text-cyan-300" />
              Pending alerts
            </div>
            <span className="text-sm font-black text-white">08</span>
          </div>
        </div>
      </div>

      <nav className="relative flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-5">
          {sections.map((section) => (
            <section
              key={section}
              className="rounded-[1.5rem] border border-white/8 bg-white/[0.025] p-2.5"
            >
              <div className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                {section}
              </div>

              <div className="space-y-1.5">
                {navItems
                  .filter((item) => item.section === section)
                  .map((item) => {
                    const isActive = state.currentPage === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentPage(item.id)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-[1.2rem] px-3 py-3 text-left transition-all duration-200",
                          isActive
                            ? "bg-white/[0.08] shadow-[0_14px_30px_rgba(15,23,42,0.28)]"
                            : "hover:bg-white/[0.05]"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border transition-all",
                            isActive
                              ? "border-white/10 bg-white/[0.08] text-white"
                              : "border-white/8 bg-slate-950/35 text-slate-400 group-hover:text-white"
                          )}
                        >
                          {item.icon}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block truncate text-sm font-bold",
                              isActive ? "text-white" : "text-slate-200"
                            )}
                          >
                            {item.label}
                          </span>
                          <span className="block truncate text-xs text-slate-500">
                            {item.hint}
                          </span>
                        </span>

                        {item.badge ? (
                          <span
                            className={cn(
                              "rounded-full border px-2 py-1 text-[10px] font-bold",
                              isActive
                                ? currentBadgeTone
                                : "border-white/10 bg-white/[0.04] text-slate-300"
                            )}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      </nav>

      <div className="relative border-t border-white/10 p-4">
        <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_16px_40px_rgba(2,6,23,0.28)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-black text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {state.userName || "Viruj Provider"}
              </p>
              <p className="truncate text-xs uppercase tracking-[0.18em] text-slate-500">
                {providerLabel}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-4 flex w-full items-center justify-between rounded-[1.1rem] border border-rose-400/15 bg-rose-400/8 px-4 py-3 text-sm font-bold text-rose-100 transition hover:bg-rose-400/12"
          >
            <span className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-rose-200/70">
              Exit
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
