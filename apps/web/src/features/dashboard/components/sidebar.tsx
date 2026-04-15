"use client";

import type { ErpDemoPage } from "@/features/dashboard/components/types";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BadgeCheck,
  Calendar,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Stethoscope,
  Users,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "patients", label: "Patients", icon: Users },
  { id: "staff", label: "Staff", icon: BadgeCheck },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function ErpDemoSidebar({
  allowedPages,
  currentPage,
  isCollapsed,
  onLogout,
  onPageChange,
  onToggle,
  organizationLabel,
}: {
  allowedPages: ErpDemoPage[];
  currentPage: string;
  isCollapsed: boolean;
  onLogout: () => void;
  onPageChange: (page: ErpDemoPage) => void;
  onToggle: () => void;
  organizationLabel: string;
}) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col space-y-2 border-r border-slate-200 bg-slate-100 p-4 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div
        className={cn(
          "relative mb-8 flex items-center gap-3",
          isCollapsed ? "justify-center px-0" : "px-4"
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-lg">
          <Stethoscope size={24} />
        </div>
        {!isCollapsed ? (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="font-headline text-lg font-black leading-tight text-blue-900">
              Viruj Health
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {organizationLabel} ERP
            </p>
          </div>
        ) : null}
        <button
          className={cn(
            "absolute -right-7 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:text-primary",
            isCollapsed && "rotate-180"
          )}
          onClick={onToggle}
          type="button"
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems
          .filter((item) => allowedPages.includes(item.id))
          .map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              className={cn(
                "flex w-full items-center rounded-lg transition-all duration-200",
                isCollapsed ? "justify-center p-2" : "gap-3 px-4 py-2",
                isActive
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-200 hover:translate-x-1"
              )}
              onClick={() => onPageChange(item.id)}
              title={isCollapsed ? item.label : undefined}
              type="button"
            >
              <Icon size={18} />
              {!isCollapsed ? (
                <span className="whitespace-nowrap text-[13px] font-medium">
                  {item.label}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-200 pt-4">
        <button
          className={cn(
            "mb-4 flex w-full items-center rounded-lg bg-gradient-to-r from-primary to-primary-container text-sm font-semibold text-white shadow-md transition-transform hover:scale-[0.98]",
            isCollapsed ? "justify-center p-2" : "gap-3 px-4 py-3"
          )}
          type="button"
        >
          <PlusCircle size={18} />
          {!isCollapsed ? <span>New Appointment</span> : null}
        </button>
        <button
          className={cn(
            "flex w-full items-center rounded-lg text-error transition-all hover:bg-error-container/20",
            isCollapsed ? "justify-center p-2" : "gap-3 px-4 py-2"
          )}
          onClick={onLogout}
          type="button"
        >
          <LogOut size={18} />
          {!isCollapsed ? (
            <span className="whitespace-nowrap text-[13px] font-medium">
              Logout
            </span>
          ) : null}
        </button>
      </div>
    </aside>
  );
}
