"use client";

import { authClient } from "@/lib/auth-client";
import { useTheme } from "@/lib/theme-provider";
import { Building2, LogOut, Moon, Sun, User } from "lucide-react";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/erp/dropdown-menu";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "VH";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

interface ProfileDropdownProps {
  onNavigateToProfile: () => void;
  onLogout: () => void;
}

export function ProfileDropdown({
  onNavigateToProfile,
  onLogout,
}: ProfileDropdownProps) {
  const { theme, toggleTheme } = useTheme();
  const sessionState = authClient.useSession();

  const userName =
    sessionState.data?.user?.name ||
    sessionState.data?.user?.email?.split("@")[0] ||
    "Viruj User";
  const userEmail = sessionState.data?.user?.email ?? "";
  const userImage = sessionState.data?.user?.image;

  return (
    <DropdownMenuContent
      align="end"
      sideOffset={8}
      className="w-72"
      aria-label="Account"
    >
      <DropdownMenuGroup>
        {/* User header */}
        <DropdownMenuLabel className="flex items-center gap-3 p-3">
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
        </DropdownMenuLabel>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem id="profile-menu-profile" onClick={onNavigateToProfile}>
        <User />
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem id="profile-menu-workspaces" onClick={() => window.location.assign("/workspaces")}>
        <Building2 />
        Provider roles & workspaces
      </DropdownMenuItem>
      <DropdownMenuCheckboxItem
        id="profile-menu-appearance-toggle"
        checked={theme === "dark"}
        onCheckedChange={toggleTheme}
        closeOnClick={false}
      >
        {theme === "dark" ? <Moon /> : <Sun />}Dark mode
      </DropdownMenuCheckboxItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        id="profile-menu-logout"
        variant="destructive"
        onClick={onLogout}
      >
        <LogOut />
        Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
