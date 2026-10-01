"use client";

import { ProfileDropdown } from "@/features/dashboard/components/shared/profile/profile-dropdown";
import { NotificationCenter } from "@/features/notifications";
import { getWorkspaceTheme } from "@/features/dashboard/components/shared/layout/role-theme";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";
import { ChevronDown, Moon, Sun } from "lucide-react";
import { useState } from "react";

export function ErpDemoTopBar({
  organizationLabel,
  organizationName,
  roleLabel,
  userName,
  onNavigateToProfile,
  onLogout,
  organizationId,
}: {
  organizationLabel: string;
  organizationName?: string;
  organizationId?: string;
  roleLabel: string;
  userName: string;
  onNavigateToProfile: () => void;
  onLogout: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const sessionState = authClient.useSession();
  const userImage = sessionState.data?.user?.image;
  const workspaceTheme = getWorkspaceTheme(organizationLabel);
  const title = organizationName?.trim() || organizationLabel;

  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-xl transition-colors dark:border-white/[0.08] dark:bg-[#111418]/90 sm:px-6 lg:px-10">
      <div className="min-w-0">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Viruj · {organizationLabel} workspace</p>
        <h2 className="truncate font-headline text-xl font-bold tracking-tight text-on-surface dark:text-slate-100 sm:text-2xl">
          {title}
        </h2>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          aria-label={
            theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
          }
          className="flex size-10 items-center justify-center rounded-xl border border-slate-200/80 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
          onClick={toggleTheme}
          type="button"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <NotificationCenter organizationId={organizationId} />
        <div className="mx-1 h-8 w-px bg-slate-200 dark:bg-white/[0.08]" />

        {/* Profile button ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ opens dropdown */}
        <div className="relative">
          <button
            id="top-bar-profile-button"
            aria-label="Open account menu"
            aria-expanded={isProfileOpen}
            type="button"
            onClick={() => setIsProfileOpen((v) => !v)}
            className="flex cursor-pointer items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-slate-200/50 dark:hover:bg-white/[0.08]"
          >
              <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-on-surface dark:text-slate-100">
                {userName || "Viruj User"}
              </p>
              <p className="text-[10px] text-outline dark:text-slate-500">
                {formatRole(roleLabel)} | {organizationLabel}
              </p>
            </div>
            {userImage ? (
              <img
                alt="User profile"
                className={cn(
                  "h-9 w-9 rounded-lg object-cover ring-2",
                  workspaceTheme.profileRing
                )}
                src={userImage}
              />
            ) : (
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ring-2",
                  workspaceTheme.avatar,
                  workspaceTheme.profileRing
                )}
              >
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
