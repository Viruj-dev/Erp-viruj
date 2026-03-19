"use client";

import React from "react";
import { useApp } from "@/store/app-context";
import { Menu, Search, Bell, Settings } from "lucide-react";

export function TopHeader() {
  const { state } = useApp();

  const titles: Record<string, string> = {
    dashboard: "Dashboard",
    appointments: "Appointments",
    profile: "My Profile",
    manage: "Manage Services",
    community: "Community",
    subscription: "Subscription",
  };

  const accents: Record<string, string> = {
    dashboard: "from-cyan-400/20 via-transparent to-emerald-400/12",
    appointments: "from-amber-400/20 via-transparent to-cyan-400/12",
    profile: "from-sky-400/18 via-transparent to-violet-400/14",
    manage: "from-emerald-400/20 via-transparent to-cyan-400/10",
    community: "from-violet-400/20 via-transparent to-rose-400/12",
    subscription: "from-fuchsia-400/18 via-transparent to-emerald-400/12",
  };

  return (
    <header className="sticky top-0 z-40 flex h-[var(--header-height)] items-center justify-between border-b border-[var(--border)] bg-[var(--bg-dark)]/75 px-4 backdrop-blur-md md:px-8">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-r ${
          accents[state.currentPage] ?? accents.dashboard
        }`}
      />
      <div className="relative flex items-center gap-4">
        <button className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-[#94a3b8]">
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
            Workspace
          </p>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {titles[state.currentPage] || "Dashboard"}
          </h2>
        </div>
      </div>

      <div className="relative flex items-center gap-2 md:gap-4">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search..."
            className="w-52 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] py-2 pl-10 pr-4 text-sm text-[#f1f5f9] focus:border-primary/50 focus:outline-none lg:w-64"
          />
        </div>

        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[#94a3b8] hover:text-white hover:border-primary/50 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger rounded-full border-2 border-[var(--bg-dark)]"></span>
        </button>

        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[#94a3b8] hover:text-white hover:border-primary/50">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
