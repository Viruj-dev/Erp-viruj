"use client";

import { ProfileDropdown } from "@/features/dashboard/components/profile-dropdown";
import { authClient } from "@/lib/auth-client";
import { useTheme } from "@/lib/theme-provider";
import { Bell, ChevronDown, Grid, Moon, Search, Sun } from "lucide-react";
import { useState } from "react";

const titles: Record<string, string> = {
  dashboard: "{} Dashboard",
  finance: "Finance Command Center",
  appointments: "Appointment Scheduling",
  "appointments-dashboard": "Appointment Operations",
  "appointments-review": "Appointment Review",
  "appointments-patients": "Appointment Patient History",
  "appointments-settings": "Appointment Settings",
  patients: "Patient Directory",
  staff: "Staff Directory",
  community: "Community",
  billing: "Billing & Invoices",
  pricing: "Pricing & Plans",
  settings: "Organization Settings",
  "settings-alert-rules": "Alert Rules",
  "settings-audit-logs": "Clinical Audit Logs",
  "settings-storage": "Storage Usage",
  "settings-data-export": "Data Export",
  analytics: "Performance Analytics",
  doctors: "Doctor Directory",
  "hospital-profile": "Hospital Profile",
  radiology: "Radiology Operations",
  pathology: "Pathology Lab",
  pharmacy: "Pharmacy Management",
  notifications: "Notifications Center",
  reports: "Reports & Exports",
  profile: "My Profile",
};

export function ErpDemoTopBar({
  currentPage,
  organizationLabel,
  roleLabel,
  userName,
  onNavigateToProfile,
  onLogout,
}: {
  currentPage: string;
  organizationLabel: string;
  roleLabel: string;
  userName: string;
  onNavigateToProfile: () => void;
  onLogout: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const sessionState = authClient.useSession();
  const userImage = sessionState.data?.user?.image;

  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-slate-200 px-6 py-5 transition-colors dark:border-white/[0.08]  lg:px-10">
      <div className="flex items-center gap-8">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface dark:text-slate-100">
          {titles[currentPage]?.replace("{}", `${organizationLabel}'s`) ??
            `${organizationLabel}'s Dashboard`}
        </h2>
        <div className="relative hidden lg:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
            size={18}
          />
          <input
            className="w-80 rounded-lg border-none bg-surface-container-low py-2 pl-10 pr-4 text-sm text-slate-800 transition-colors placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 dark:bg-white/[0.07] dark:text-slate-100 dark:placeholder:text-slate-500"
            placeholder="Search patients, records, doctors..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          aria-label={
            theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
          }
          className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
          onClick={toggleTheme}
          type="button"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
          type="button"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-slate-50 bg-error dark:border-[#101214]" />
        </button>
        <button
          className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
          type="button"
        >
          <Grid size={20} />
        </button>
        <div className="h-8 w-px bg-slate-200 dark:bg-white/[0.08]" />

        {/* Profile button – opens dropdown */}
        <div className="relative">
          <button
            id="top-bar-profile-button"
            type="button"
            onClick={() => setIsProfileOpen((v) => !v)}
            className="flex cursor-pointer items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-slate-200/50 dark:hover:bg-white/[0.08]"
          >
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-on-surface dark:text-slate-100">
                {userName || "Dr. Sarah Chen"}
              </p>
              <p className="text-[10px] text-outline dark:text-slate-500">
                {formatRole(roleLabel)} | {organizationLabel}
              </p>
            </div>
            {userImage ? (
              <img
                alt="User profile"
                className="h-9 w-9 rounded-lg object-cover ring-2 ring-primary/10"
                src={userImage}
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d7e3ff] text-xs font-bold text-[#09203c] ring-2 ring-primary/10 dark:bg-blue-500/20 dark:text-blue-300">
                {getInitials(userName || "Viruj User")}
              </div>
            )}
            <ChevronDown
              className={`text-slate-400 transition-transform dark:text-slate-500 ${isProfileOpen ? "rotate-180" : ""}`}
              size={14}
            />
          </button>

          {isProfileOpen && (
            <ProfileDropdown
              onClose={() => setIsProfileOpen(false)}
              onNavigateToProfile={onNavigateToProfile}
              onLogout={onLogout}
            />
          )}
        </div>
      </div>
    </header>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "VH";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatRole(role: string) {
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
