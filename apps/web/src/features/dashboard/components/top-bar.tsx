"use client";

import { Bell, ChevronDown, Grid, Search } from "lucide-react";

const titles: Record<string, string> = {
  dashboard: "Clinical Dashboard",
  appointments: "Appointment Scheduling",
  patients: "Patient Management",
  staff: "Staff Directory",
  analytics: "Performance Analytics",
};

export function ErpDemoTopBar({
  currentPage,
  organizationLabel,
  roleLabel,
  userName,
}: {
  currentPage: string;
  organizationLabel: string;
  roleLabel: string;
  userName: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-5 lg:px-10">
      <div className="flex items-center gap-8">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
          {titles[currentPage] ?? "Viruj Health"}
        </h2>
        <div className="relative hidden lg:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
            size={18}
          />
          <input
            className="w-80 rounded-lg border-none bg-surface-container-low py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20"
            placeholder="Search patients, records, doctors..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200/50"
          type="button"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-slate-50 bg-error" />
        </button>
        <button
          className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200/50"
          type="button"
        >
          <Grid size={20} />
        </button>
        <div className="h-8 w-px bg-slate-200" />
        <div className="flex cursor-pointer items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-slate-200/50">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold text-on-surface">
              {userName || "Dr. Sarah Chen"}
            </p>
            <p className="text-[10px] text-outline">
              {roleLabel} | {organizationLabel}
            </p>
          </div>
          <img
            alt="User profile"
            className="h-9 w-9 rounded-lg object-cover ring-2 ring-primary/10"
            src="https://images.unsplash.com/photo-1559839734-2b71f1536783?w=100&h=100&fit=crop"
          />
          <ChevronDown className="text-slate-400" size={14} />
        </div>
      </div>
    </header>
  );
}
