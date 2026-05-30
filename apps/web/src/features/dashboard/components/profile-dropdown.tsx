"use client";

import { authClient } from "@/lib/auth-client";
import { useTheme } from "@/lib/theme-provider";
import {
  Bell,
  ChevronRight,
  Code2,
  CreditCard,
  LogOut,
  Moon,
  Sun,
  User,
  Settings,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "VH";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function SegmentedBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const totalSegments = 20;
  const filledCount = Math.round((value / max) * totalSegments);

  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: totalSegments }).map((_, i) => (
        <div
          key={i}
          className="h-[6px] flex-1 rounded-full transition-colors"
          style={{
            backgroundColor:
              i < filledCount ? color : "currentColor",
            opacity: i < filledCount ? 1 : 0.15,
          }}
        />
      ))}
    </div>
  );
}

interface ProfileDropdownProps {
  onClose: () => void;
  onNavigateToProfile: () => void;
  onLogout: () => void;
}

export function ProfileDropdown({
  onClose,
  onNavigateToProfile,
  onLogout,
}: ProfileDropdownProps) {
  const { theme, toggleTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sessionState = authClient.useSession();
  const activeMemberState = authClient.useActiveMember();

  const userName =
    sessionState.data?.user?.name ||
    sessionState.data?.user?.email?.split("@")[0] ||
    "Viruj User";
  const userEmail = sessionState.data?.user?.email ?? "";
  const userImage = sessionState.data?.user?.image;
  const role = activeMemberState.data?.role ?? "member";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }

    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const menuItems = [
    {
      id: "profile",
      icon: User,
      label: "Profile",
      onClick: () => {
        onNavigateToProfile();
        onClose();
      },
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      onClick: onClose,
    },
    {
      id: "subscriptions",
      icon: CreditCard,
      label: "Subscriptions",
      onClick: onClose,
    },
    {
      id: "developers",
      icon: Code2,
      label: "Developers",
      onClick: onClose,
    },
  ];

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full z-50 mt-2 w-[300px] animate-in fade-in slide-in-from-top-2 rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.14)] duration-150 dark:border-white/[0.10] dark:bg-[#1a1d21]"
    >
      {/* User header */}
      <div className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-white/[0.07]">
        {userImage ? (
          <img
            alt={userName}
            className="h-11 w-11 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-white/10"
            src={userImage}
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d7e3ff] text-sm font-bold text-[#09203c] dark:bg-blue-500/20 dark:text-blue-300">
            {getInitials(userName)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-slate-900 dark:text-white">
            {userName}
          </p>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
            {userEmail}
          </p>
        </div>
      </div>

      {/* Menu items */}
      <div className="p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === "profile";
          return (
            <button
              key={item.id}
              id={`profile-menu-${item.id}`}
              type="button"
              onClick={item.onClick}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                isActive
                  ? "bg-slate-100 text-slate-900 dark:bg-white/[0.08] dark:text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-slate-100"
              }`}
            >
              <Icon size={15} className="shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}

        {/* Appearance with toggle */}
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <Sun size={15} className="shrink-0 text-slate-500 dark:text-slate-400" />
          <span className="flex-1 text-[13px] font-medium text-slate-600 dark:text-slate-400">
            Appearance
          </span>
          <button
            id="profile-menu-appearance-toggle"
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-white/[0.10] dark:bg-white/[0.05]"
            aria-label="Toggle appearance"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                theme === "light"
                  ? "bg-white shadow-sm text-slate-800"
                  : "text-slate-400"
              }`}
            >
              <Sun size={13} />
            </span>
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                theme === "dark"
                  ? "bg-white/10 text-white"
                  : "text-slate-400"
              }`}
            >
              <Moon size={13} />
            </span>
          </button>
        </div>

        {/* Logout */}
        <button
          id="profile-menu-logout"
          type="button"
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/[0.10]"
        >
          <LogOut size={15} className="shrink-0" />
          <span>Logout</span>
        </button>
      </div>

      {/* Plan section */}
      <div className="border-t border-slate-100 p-4 dark:border-white/[0.07]">
        <div className="mb-3 flex items-center gap-2">
          <Zap size={13} className="text-slate-500 dark:text-slate-400" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Basic Plan
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              14/25 patients this month
            </p>
            <SegmentedBar value={14} max={25} color="#7c6fff" />
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              24/30 appointments today
            </p>
            <SegmentedBar value={24} max={30} color="#00c896" />
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              26/150 records this month
            </p>
            <SegmentedBar value={26} max={150} color="#f5a623" />
          </div>
        </div>

        <button
          id="profile-menu-upgrade"
          type="button"
          className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-[13px] font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          Upgrade
        </button>
      </div>
    </div>
  );
}
