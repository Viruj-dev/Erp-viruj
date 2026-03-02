"use client";

import React from "react";
import { useApp } from "@/store/app-context";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  User,
  Package,
  MessageSquare,
  Gem,
  LogOut,
  Hospital,
  Stethoscope,
  Building2,
  Microscope,
  RadioTower,
} from "lucide-react";

const icons: Record<string, React.ReactNode> = {
  dashboard: <BarChart3 className="w-5 h-5" />,
  appointments: <Calendar className="w-5 h-5" />,
  profile: <User className="w-5 h-5" />,
  manage: <Package className="w-5 h-5" />,
  community: <MessageSquare className="w-5 h-5" />,
  subscription: <Gem className="w-5 h-5" />,
};

const providerIcons: Record<string, React.ReactNode> = {
  hospital: <Hospital className="w-5 h-5 text-sky-400" />,
  doctor: <Stethoscope className="w-5 h-5 text-emerald-400" />,
  clinic: <Building2 className="w-5 h-5 text-violet-400" />,
  pathology: <Microscope className="w-5 h-5 text-amber-400" />,
  radiology: <RadioTower className="w-5 h-5 text-rose-400" />,
};

export function Sidebar() {
  const { state, setCurrentPage, logout } = useApp();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: icons.dashboard,
      section: "Main",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: icons.appointments,
      section: "Main",
      badge: 5,
    },
    {
      id: "profile",
      label: "My Profile",
      icon: providerIcons[state.providerType] || icons.profile,
      section: "Main",
    },
    {
      id: "manage",
      label: "Manage Services",
      icon: icons.manage,
      section: "Main",
    },
    {
      id: "community",
      label: "Community",
      icon: icons.community,
      section: "Engagement",
      badge: 3,
    },
    {
      id: "subscription",
      label: "Subscription",
      icon: icons.subscription,
      section: "Account",
    },
  ];

  const sections = ["Main", "Engagement", "Account"];

  return (
    <aside className="w-[var(--sidebar-width)] bg-[var(--bg-dark)] border-r border-[var(--border)] hidden lg:flex flex-col fixed inset-y-0 left-0 z-50">
      <div className="p-5 flex items-center gap-3 border-b border-[var(--border)]">
        <div className="w-9 h-9 bg-primary flex items-center justify-center rounded-lg text-white font-bold text-xl">
          🏥
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent">
          MedConnect
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {sections.map((section) => (
          <div key={section} className="py-2">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">
              {section}
            </div>
            {navItems
              .filter((item) => item.section === section)
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
                    state.currentPage === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-[#94a3b8] hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span
                    className={cn(
                      "transition-colors",
                      state.currentPage === item.id
                        ? "text-primary"
                        : "text-[#64748b] group-hover:text-white"
                    )}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
          </div>
        ))}

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-[#94a3b8] hover:bg-danger/10 hover:text-danger mt-4 text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
            {state.userName.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate text-[#f1f5f9]">
              {state.userName}
            </div>
            <div className="text-xs text-[#94a3b8] truncate capitalize">
              {state.providerType}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
