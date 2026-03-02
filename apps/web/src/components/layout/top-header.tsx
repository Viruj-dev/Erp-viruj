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

  return (
    <header className="h-[var(--header-height)] border-b border-[var(--border)] bg-[var(--bg-dark)]/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-[#94a3b8]">
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-white tracking-tight">
          {titles[state.currentPage] || "Dashboard"}
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 w-64 text-[#f1f5f9]"
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
