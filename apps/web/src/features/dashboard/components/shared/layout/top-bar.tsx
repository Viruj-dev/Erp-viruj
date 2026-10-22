"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/erp/dropdown-menu";
import { ProfileDropdown } from "@/features/dashboard/components/shared/profile/profile-dropdown";
import { NotificationCenter } from "@/features/notifications";
import { getWorkspaceTheme } from "@/features/dashboard/components/shared/layout/role-theme";
import { diagnosticSetupKey } from "@/features/dashboard/lib/diagnostic-onboarding";
import { authClient } from "@/lib/auth-client";
import { virujBackend } from "@/lib/viruj-backend";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";
import { useQuery } from "@tanstack/react-query";
import { Building2, ChevronDown, Moon, Sun } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
  const [isCompact, setIsCompact] = useState(false);
  const [failedLogoUrl, setFailedLogoUrl] = useState("");
  const headerRef = useRef<HTMLElement>(null);
  const kind = organizationLabel.toLowerCase();
  const diagnostic = kind === "pathology" || kind === "radiology";
  const setup = useQuery({
    queryKey: diagnosticSetupKey(organizationId ?? "none"),
    queryFn: () => virujBackend.diagnostics.onboarding(organizationId!),
    enabled: Boolean(organizationId) && diagnostic,
    retry: false,
  });
  const workspace = useQuery({
    queryKey: ["viruj-backend", "workspace-profile", organizationId],
    queryFn: () => virujBackend.directory.workspace(organizationId),
    enabled: Boolean(organizationId) && (kind === "hospital" || kind === "clinic"),
    retry: false,
  });
  const logoUrl = diagnostic
    ? setup.data?.data?.logoUrl
    : workspace.data?.data.profile?.logoUrl;

  useEffect(() => {
    const scroller = headerRef.current?.closest(".erp-scroll");
    if (!scroller) return;

    const update = () => {
      // Separate thresholds prevent resizing the header from toggling it repeatedly.
      setIsCompact((compact) => scroller.scrollTop > (compact ? 32 : 112));
    };
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    return () => scroller.removeEventListener("scroll", update);
  }, []);
  const sessionState = authClient.useSession();
  const userImage = sessionState.data?.user?.image;
  const workspaceTheme = getWorkspaceTheme(organizationLabel);
  const title = organizationName?.trim() || organizationLabel;

  return (
    <header
      ref={headerRef}
      data-compact={isCompact}
      className="erp-topbar mx-auto relative z-30 flex shrink-0 items-center justify-between gap-3 border border-white/80 bg-white px-4 py-3 transition-colors dark:border-white/[0.06] dark:bg-[#17191e]"
    >
      <div className="erp-topbar-workspace flex min-w-0 flex-1 items-center gap-3">
        <div
          title={`${title} · ${organizationLabel} workspace`}
          role="img"
          aria-label={`${title} workspace`}
          className={cn(
            "erp-topbar-workspace-icon hidden size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:flex",
            workspaceTheme.avatar
          )}
        >
          {logoUrl && failedLogoUrl !== logoUrl ? (
            <Image
              src={logoUrl}
              alt=""
              width={40}
              height={40}
              unoptimized
              className="size-full object-contain"
              onError={() => setFailedLogoUrl(logoUrl)}
            />
          ) : (
            <Building2 size={19} strokeWidth={1.6} aria-hidden="true" />
          )}
        </div>
        <div
          className="erp-topbar-workspace-label min-w-0"
          aria-hidden={isCompact}
        >
          <h2 className="truncate text-sm font-semibold tracking-tight text-on-surface dark:text-slate-100">
            {title}
          </h2>
          <p className="mt-0.5 truncate text-[11px] text-slate-400">
            {organizationLabel} workspace
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          aria-label={
            theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
          }
          className="flex size-10 items-center justify-center rounded-full border border-slate-200/60 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
          onClick={toggleTheme}
          type="button"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <NotificationCenter organizationId={organizationId} />
        <div className="mx-1 h-8 w-px bg-slate-200 dark:bg-white/[0.08]" />

        {/* Account controls stay grouped in one compact menu. */}
        <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DropdownMenuTrigger
            id="top-bar-profile-button"
            aria-label="Open account menu"
            aria-expanded={isProfileOpen}
            type="button"
            className="flex cursor-pointer items-center gap-2.5 rounded-full p-1.5 transition-colors hover:bg-slate-200/50 dark:hover:bg-white/[0.08]"
          >
            <div
              className="erp-topbar-account-label hidden max-w-40 text-right md:block"
              aria-hidden={isCompact}
            >
              <p className="truncate text-xs font-semibold text-on-surface dark:text-slate-100">
                {userName || "Viruj User"}
              </p>
              <p className="text-[10px] text-outline dark:text-slate-500">
                {formatRole(roleLabel)}
              </p>
            </div>
            {userImage ? (
              <img
                alt="User profile"
                className={cn(
                  "h-9 w-9 rounded-full object-cover ring-2",
                  workspaceTheme.profileRing
                )}
                src={userImage}
              />
            ) : (
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ring-2",
                  workspaceTheme.avatar,
                  workspaceTheme.profileRing
                )}
              >
                {getInitials(userName || "Viruj User")}
              </div>
            )}
            <ChevronDown
              className={`erp-topbar-chevron text-slate-400 transition-transform dark:text-slate-500 ${isProfileOpen ? "rotate-180" : ""}`}
              size={14}
            />
          </DropdownMenuTrigger>

          <ProfileDropdown
            onNavigateToProfile={onNavigateToProfile}
            onLogout={onLogout}
          />
        </DropdownMenu>
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
