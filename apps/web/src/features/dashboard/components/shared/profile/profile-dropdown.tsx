"use client";

import { authClient } from "@/lib/auth-client";
import { useTheme } from "@/lib/theme-provider";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { useEffect, useRef } from "react";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "VH";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
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

  const userName =
    sessionState.data?.user?.name ||
    sessionState.data?.user?.email?.split("@")[0] ||
    "Viruj User";
  const userEmail = sessionState.data?.user?.email ?? "";
  const userImage = sessionState.data?.user?.image;

  useEffect(() => {
    dropdownRef.current?.querySelector<HTMLButtonElement>("button")?.focus();

    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !(e.target instanceof Element && e.target.closest("#top-bar-profile-button"))
      ) {
        onClose();
      }
    }

    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        document.getElementById("top-bar-profile-button")?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      id="account-menu"
      role="region"
      aria-label="Account"
      className="absolute right-0 top-full z-50 mt-2 w-[300px] max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-6rem)] overflow-y-auto animate-in fade-in slide-in-from-top-2 rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.14)] duration-150 dark:border-white/[0.10] dark:bg-[#1a1d21]"
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
        <button
          id="profile-menu-profile"
          type="button"
          onClick={() => {
            onNavigateToProfile();
            onClose();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
        >
          <User size={15} className="shrink-0" />
          <span>Profile</span>
        </button>

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
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            aria-pressed={theme === "dark"}
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

    </div>
  );
}
