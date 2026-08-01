"use client";

import type { ErpDemoPage } from "@/features/dashboard/components/shared/types";
import type { WorkspaceTheme } from "@/features/dashboard/components/shared/layout/role-theme";
import { getWorkspaceTheme } from "@/features/dashboard/components/shared/layout/role-theme";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BadgeCheck,
  BadgeIndianRupee,
  Bot,
  BriefcaseMedical,
  Building2,
  ChevronDown,
  ChevronLeft,
  ClipboardCheck,
  Database,
  FileBadge,
  FileText,
  HeartPulse,
  History,
  Image,
  Keyboard,
  LayoutDashboard,
  Lock,
  LogOut,
  MapPin,
  MessagesSquare,
  MapPinned,
  PackageCheck,
  Search,
  Settings,
  Sparkles,
  Star,
  Stethoscope,
  Timer,
  UserRound,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import { useState } from "react";

const mainNavItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "patients", label: "Patients", icon: Users },
  { id: "staff", label: "Staff", icon: BadgeCheck },
  { id: "doctors", label: "Doctors", icon: Stethoscope },
  { id: "facilities", label: "Facilities & Services", icon: HeartPulse },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "community", label: "Community", icon: MessagesSquare, badge: "2" },
  { id: "analytics", label: "Analytics", icon: BarChart3,},
  { id: "activity-logs", label: "Activity Logs", icon: History },
] as const;

const clinicNavItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "appointments", label: "Appointments", icon: ClipboardCheck },
  { id: "doctors", label: "Doctors", icon: Stethoscope },
  { id: "services", label: "Services", icon: HeartPulse },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "community", label: "Community", icon: MessagesSquare },
  { id: "analytics", label: "Analytics", icon: BarChart3,},
] as const;

const doctorNavItems = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "locations", label: "Locations", icon: MapPinned },
  { id: "availability", label: "Availability", icon: Timer },
  { id: "patients", label: "Patients", icon: Users },
  { id: "consultations", label: "Consultations", icon: BriefcaseMedical },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "community", label: "Community", icon: MessagesSquare },
  { id: "profile", label: "Profile", icon: Stethoscope },
  { id: "doctor-settings", label: "Settings", icon: Settings },
] as const;

const doctorProfileOptions = [
  { id: "profile", label: "Profile Details", icon: Stethoscope },
  { id: "verification", label: "Verification", icon: FileBadge },
  { id: "documents", label: "Documents", icon: FileText },
] as const;

const clinicProfileOptions = [
  { id: "clinic-profile", label: "Profile", icon: Building2 },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "working-hours", label: "Working Hours", icon: Timer },
  { id: "facilities", label: "Facilities", icon: Sparkles },
  { id: "reviews", label: "Reviews", icon: Star },
] as const;

const operationsItems = [
  { id: "subscription", label: "Plans & Subscription", icon: BadgeIndianRupee },
] as const;

const appointmentOptions = [
  { id: "appointments-review", label: "Review", icon: ClipboardCheck },
  { id: "appointments-patients", label: "Patient Details", icon: FileText },
  { id: "appointments-settings", label: "Settings", icon: Settings },
] as const;

const utilityItems = [
  { label: "Search", icon: Search, shortcut: "K" },
  { label: "Ask AI", icon: Bot, shortcut: "D" },
] as const;

const comingSoonNavItems = new Set<ErpDemoPage>([
  "gallery",
  "community",
  "analytics",
  "activity-logs",
]);

export function ErpDemoSidebar({
  allowedPages,
  currentPage,
  isCollapsed,
  lockedPages = [],
  onLogout,
  onPageChange,
  onToggle,
  organizationLabel,
}: {
  allowedPages: ErpDemoPage[];
  currentPage: string;
  isCollapsed: boolean;
  lockedPages?: ErpDemoPage[];
  onLogout: () => void;
  onPageChange: (page: ErpDemoPage) => void;
  onToggle: () => void;
  organizationLabel: string;
}) {
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(
    currentPage.startsWith("appointments")
  );
  const [isDoctorProfileOpen, setIsDoctorProfileOpen] = useState(
    currentPage === "profile" ||
      currentPage === "clinic-profile" ||
      currentPage === "locations" ||
      currentPage === "working-hours" ||
      currentPage === "facilities" ||
      currentPage === "reviews" ||
      currentPage === "onboarding" ||
      currentPage === "verification" ||
      currentPage === "documents"
  );

  const activeMemberState = authClient.useActiveMember();
  const sessionState = authClient.useSession();
  const activeMemberRole = activeMemberState.data?.role;
  const isOwnerOrAdmin =
    activeMemberRole === "OWNER" ||
    activeMemberRole === "CLINIC_OWNER" ||
    activeMemberRole === "ADMIN" ||
    activeMemberRole === "CLINIC_ADMIN" ||
    activeMemberRole === "ORG_ADMIN" ||
    activeMemberRole === "owner" ||
    activeMemberRole === "admin";
  const workspaceTheme = getWorkspaceTheme(organizationLabel);
  const isDoctorWorkspace = organizationLabel.toLowerCase() === "doctor";
  const isClinicWorkspace = organizationLabel.toLowerCase() === "clinic";
  const navItems = isDoctorWorkspace
    ? doctorNavItems
    : isClinicWorkspace
      ? clinicNavItems
      : mainNavItems;
  const nestedProfileOptions = isClinicWorkspace
    ? clinicProfileOptions
    : doctorProfileOptions;
  const systemItems = [
    {
      id:
        isDoctorWorkspace || isClinicWorkspace ? "profile" : "hospital-profile",
      label: "Profile",
      icon: UserRound,
    },
    {
      id: isDoctorWorkspace ? "doctor-settings" : "settings",
      label: "Settings",
      icon: Settings,
    },
    { id: "settings-data-export", label: "Data", icon: Database },
  ] satisfies readonly NavItem[];
  const userName =
    sessionState.data?.user?.name ||
    sessionState.data?.user?.email?.split("@")[0] ||
    "Viruj User";
  const userEmail = sessionState.data?.user?.email ?? organizationLabel;

  return (
    <aside
      className={cn(
        "fixed bottom-4 left-4 top-4 z-40 flex flex-col rounded-[22px] border border-slate-200/80 bg-[#f3f4f4] text-slate-700 shadow-[0_24px_80px_rgba(30,41,59,0.14)] transition-all duration-300 ease-in-out dark:border-white/[0.10] dark:bg-[#141618] dark:text-slate-200 dark:shadow-[0_24px_80px_rgba(0,0,0,0.32)]",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-white/[0.42] dark:before:bg-white/[0.03]",
        isCollapsed ? "w-20 overflow-visible" : "w-60 overflow-hidden"
      )}
    >
      <div className="relative z-10 flex min-h-0 flex-1 flex-col p-4">
        <div
          className={cn(
            "mb-4 flex items-center gap-3",
            isCollapsed && "justify-center items-center"
          )}
        >
          <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80 dark:bg-[#181b1f] dark:ring-white/[0.10]">
            <span
              className={cn(
                "absolute inset-1 rounded-full blur-[1px]",
                workspaceTheme.logoAura
              )}
            />
            <Stethoscope
              className="relative text-slate-950 dark:text-white"
              size={18}
            />
          </div>

          {!isCollapsed ? (
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-headline text-base font-semi-bold leading-tight text-slate-950 dark:text-white">
                Viruj ERP
              </h1>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {organizationLabel} Workspace
              </p>
            </div>
          ) : null}

          <button
            aria-label="Toggle sidebar"
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-950 dark:text-slate-500 dark:hover:bg-white/[0.08] dark:hover:text-white",
              isCollapsed &&
                "absolute -right-3 top-2 rotate-180 bg-white ring-1 ring-slate-200/80 dark:bg-[#17191b] dark:ring-white/[0.10]"
            )}
            onClick={onToggle}
            type="button"
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        <div
          className={cn(
            "space-y-1 border-b border-slate-200/80 pb-3 dark:border-white/[0.07]",
            isCollapsed && "hidden"
          )}
        >
          {utilityItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                className="flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-left text-[13px] font-medium text-slate-600 transition hover:bg-white hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-slate-100"
                key={item.label}
                type="button"
              >
                <Icon size={16} />
                <span className="flex-1">{item.label}</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 dark:text-slate-600">
                  <Keyboard size={11} />
                  {item.shortcut}
                </span>
              </button>
            );
          })}
        </div>

        <nav className="no-scrollbar mt-4 min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
          <SidebarSection
            allowedPages={allowedPages}
            currentPage={currentPage}
            isCollapsed={isCollapsed}
            items={navItems}
            lockedPages={lockedPages}
            label="Main Menu"
            onAppointmentToggle={() => {
              if (isCollapsed) {
                onPageChange("appointments-review");
                return;
              }

              setIsAppointmentsOpen((value) => !value);
            }}
            onDoctorProfileToggle={() => {
              if (isCollapsed) {
                onPageChange("profile");
                return;
              }

              setIsDoctorProfileOpen((value) => !value);
            }}
            onPageChange={onPageChange}
            profileOptions={nestedProfileOptions}
            isDoctorProfileOpen={isDoctorProfileOpen}
            showDoctorProfileDropdown={isDoctorWorkspace}
            showAppointmentDropdown={!isOwnerOrAdmin && !isClinicWorkspace}
            theme={workspaceTheme}
          />

          {!isClinicWorkspace && !isOwnerOrAdmin && !isCollapsed && isAppointmentsOpen ? (
            <div className="-mt-4 ml-5 space-y-1 border-l border-slate-200/80 pl-3 dark:border-white/[0.08]">
              {appointmentOptions.map((option) => {
                const OptionIcon = option.icon;

                return (
                  <button
                    className={cn(
                      "flex h-8 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[12px] font-semibold transition",
                      currentPage === option.id
                        ? workspaceTheme.activeNav
                        : "text-slate-500 hover:bg-white hover:text-slate-900 dark:hover:bg-white/[0.06] dark:hover:text-slate-200"
                    )}
                    key={option.id}
                    onClick={() => onPageChange(option.id)}
                    type="button"
                  >
                    <OptionIcon size={14} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          <SidebarSection
            allowedPages={allowedPages}
            currentPage={currentPage}
            isCollapsed={isCollapsed}
            items={operationsItems}
            lockedPages={lockedPages}
            label="Payments"
            onPageChange={onPageChange}
            theme={workspaceTheme}
          />

          <SidebarSection
            allowedPages={allowedPages}
            currentPage={currentPage}
            isCollapsed={isCollapsed}
            items={systemItems}
            lockedPages={lockedPages}
            label="System"
            onPageChange={onPageChange}
            theme={workspaceTheme}
          />
        </nav>

        <div className="relative mt-4 space-y-2 border-t border-slate-200/80 pt-4 dark:border-white/[0.08]">
          <div
            className={cn(
              "flex items-center rounded-xl bg-white/80 ring-1 ring-slate-200/90 dark:bg-white/[0.055] dark:ring-white/[0.07] cursor-pointer transition hover:bg-white hover:ring-slate-300 dark:hover:bg-white/[0.08] dark:hover:ring-white/[0.12]",
              isCollapsed ? "justify-center p-2" : "gap-3 p-2"
            )}
            onClick={() => onPageChange("profile")}
            title="View profile"
            role="button"
          >
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semi-bold",
                workspaceTheme.avatar
              )}
            >
              {getInitials(userName)}
            </div>
            {!isCollapsed ? (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-slate-900 dark:text-white">
                    {userName}
                  </p>
                  <p className="truncate text-[10px] text-slate-500">
                    {userEmail}
                  </p>
                </div>
                <button
                  aria-label="Logout"
                  className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/[0.12] dark:hover:text-red-300"
                  onClick={onLogout}
                  type="button"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : null}
          </div>

          {isCollapsed ? (
            <button
              aria-label="Logout"
              className="flex h-9 w-full items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/[0.12] dark:hover:text-red-300"
              onClick={onLogout}
              type="button"
            >
              <LogOut size={17} />
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

type NavItem = {
  id: ErpDemoPage;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  pulse?: boolean;
};

function SidebarSection({
  allowedPages,
  currentPage,
  isCollapsed,
  items,
  label,
  lockedPages = [],
  onAppointmentToggle,
  onDoctorProfileToggle,
  onPageChange,
  profileOptions = [],
  isDoctorProfileOpen = false,
  showDoctorProfileDropdown = false,
  showAppointmentDropdown = false,
  theme,
}: {
  allowedPages: ErpDemoPage[];
  currentPage: string;
  isCollapsed: boolean;
  items: readonly NavItem[];
  label: string;
  lockedPages?: ErpDemoPage[];
  onAppointmentToggle?: () => void;
  onDoctorProfileToggle?: () => void;
  onPageChange: (page: ErpDemoPage) => void;
  profileOptions?: readonly NavItem[];
  isDoctorProfileOpen?: boolean;
  showDoctorProfileDropdown?: boolean;
  showAppointmentDropdown?: boolean;
  theme: WorkspaceTheme;
}) {
  const visibleItems = items.filter((item) => allowedPages.includes(item.id));
  const lockedPageSet = new Set(lockedPages);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div>
      <p
        className={cn(
          "mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-600",
          isCollapsed && "sr-only"
        )}
      >
        {label}
      </p>
      <div className="space-y-1">
        {visibleItems.map((item) => {
          const isAppointmentItem = item.id === "appointments";
          const isComingSoon = comingSoonNavItems.has(item.id);
          const isLocked = isComingSoon || lockedPageSet.has(item.id);
          const isDoctorProfileItem =
            showDoctorProfileDropdown &&
            profileOptions.some((option) => option.id === item.id);
          const profileOptionIds = profileOptions.map((option) => option.id);
          const isActive = isAppointmentItem
            ? currentPage.startsWith("appointments")
            : isDoctorProfileItem && showDoctorProfileDropdown
              ? profileOptionIds.includes(currentPage as ErpDemoPage)
              : currentPage === item.id;

          return (
            <div key={item.id}>
              <NavButton
                active={isActive}
                badge={isLocked ? undefined : item.badge}
                icon={item.icon}
                isCollapsed={isCollapsed}
                isComingSoon={isLocked}
                label={item.label}
                onClick={() => {
                  if (isLocked) {
                    return;
                  }

                  if (isAppointmentItem && showAppointmentDropdown) {
                    onAppointmentToggle?.();
                    return;
                  }

                  if (isDoctorProfileItem && showDoctorProfileDropdown) {
                    onDoctorProfileToggle?.();
                    return;
                  }

                  onPageChange(item.id);
                }}
                pulse={item.pulse}
                isOpen={
                  isAppointmentItem
                    ? currentPage.startsWith("appointments")
                    : isDoctorProfileItem && showDoctorProfileDropdown
                      ? profileOptionIds.includes(currentPage as ErpDemoPage)
                      : undefined
                }
                showChevron={
                  ((isAppointmentItem && showAppointmentDropdown) ||
                    (isDoctorProfileItem && showDoctorProfileDropdown)) &&
                  !isCollapsed
                }
                theme={theme}
              />

              {isDoctorProfileItem &&
              showDoctorProfileDropdown &&
              isDoctorProfileOpen &&
              !isCollapsed ? (
                <div className="ml-5 mt-1 space-y-1 border-l border-slate-200/80 pl-3 dark:border-white/[0.08]">
                  {profileOptions.map((option) => {
                    const OptionIcon = option.icon;

                    return (
                      <button
                        className={cn(
                          "flex h-8 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[12px] font-semibold transition",
                          currentPage === option.id
                            ? theme.activeNav
                            : "text-slate-500 hover:bg-white hover:text-slate-900 dark:hover:bg-white/[0.06] dark:hover:text-slate-200"
                        )}
                        key={option.id}
                        onClick={() => onPageChange(option.id)}
                        type="button"
                      >
                        <OptionIcon size={14} />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NavButton({
  active,
  badge,
  icon: Icon,
  isCollapsed,
  isComingSoon = false,
  isOpen,
  label,
  onClick,
  pulse,
  showChevron,
  theme,
}: {
  active: boolean;
  badge?: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  isCollapsed: boolean;
  isComingSoon?: boolean;
  isOpen?: boolean;
  label: string;
  onClick: () => void;
  pulse?: boolean;
  showChevron?: boolean;
  theme: WorkspaceTheme;
}) {
  return (
    <button
      className={cn(
        "group relative flex h-9 w-full items-center rounded-lg text-[13px] font-semibold transition-all duration-200",
        isCollapsed ? "justify-center px-0" : "gap-3 px-2.5",
        isComingSoon && "cursor-not-allowed",
        active
          ? theme.activeNav
          : isComingSoon
            ? "text-slate-400 hover:bg-white/70 dark:text-slate-600 dark:hover:bg-white/[0.035]"
            : "text-slate-600 hover:bg-white hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.055] dark:hover:text-slate-100"
      )}
      aria-disabled={isComingSoon}
      onClick={onClick}
      title={
        isComingSoon
          ? `${label} is locked`
          : isCollapsed
            ? label
            : undefined
      }
      type="button"
    >
      <Icon
        className={cn(
          "shrink-0 transition",
          active
            ? theme.activeIcon
            : isComingSoon
              ? "text-slate-400 dark:text-slate-600"
              : "text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300"
        )}
        size={16}
      />
      {!isCollapsed ? (
        <>
          <span className="min-w-0 flex-1 inline truncate text-left">{label}</span>
          {badge ? (
            <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] leading-none text-slate-500 dark:border-white/[0.10] dark:bg-transparent">
              {badge}
            </span>
          ) : null}
          {isComingSoon ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] leading-none text-slate-500 dark:border-white/[0.10] dark:bg-transparent dark:text-slate-500">
              <Lock size={10} />
            </span>
          ) : null}
          {pulse ? (
            <span className={cn("size-1.5 rounded-full", theme.activeDot)} />
          ) : null}
          {showChevron ? (
            <ChevronDown
              className={cn(
                "text-slate-400 transition dark:text-slate-600",
                isOpen && "rotate-180"
              )}
              size={14}
            />
          ) : null}
        </>
      ) : null}
      {active && isCollapsed ? (
        <span
          className={cn(
            "absolute right-2 size-1.5 rounded-full",
            theme.activeDot
          )}
        />
      ) : null}
      {isComingSoon && isCollapsed ? (
        <Lock
          className="absolute right-2 text-slate-400 dark:text-slate-600"
          size={11}
        />
      ) : null}
    </button>
  );
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "VH";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
