"use client";

import { authClient } from "@/lib/auth-client";
import {
  AtSign,
  Bell,
  Building2,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Key,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  Smartphone,
  Star,
  User,
  Zap,
} from "lucide-react";
import { useState } from "react";

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
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function AvatarSection({
  initials,
  imageUrl,
  name,
  role,
  email,
}: {
  initials: string;
  imageUrl?: string | null;
  name: string;
  role: string;
  email: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1f3a] via-[#1e2847] to-[#0f1625] p-8 text-white dark:from-[#0f1219] dark:via-[#111827] dark:to-[#0a0d14]">
      {/* Background decorations */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-end">
        {/* Avatar */}
        <div className="group relative shrink-0">
          {imageUrl ? (
            <img
              alt={name}
              src={imageUrl}
              className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white/10"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-3xl font-bold text-white ring-4 ring-white/10">
              {initials}
            </div>
          )}
          <button
            id="profile-page-change-avatar"
            type="button"
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Camera size={20} className="text-white" />
          </button>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-headline text-3xl font-bold text-white">
              {name}
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
              <CheckCircle2 size={11} />
              Verified
            </span>
          </div>
          <p className="mt-1 text-sm text-white/60">{email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-lg bg-white/10 px-3 py-1 text-[12px] font-semibold text-white/80">
              {formatRole(role)}
            </span>
            <span className="flex items-center gap-1 rounded-lg bg-amber-500/20 px-3 py-1 text-[12px] font-semibold text-amber-400">
              <Star size={11} />
              Basic Plan
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/[0.07] dark:bg-[#1a1d21]">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}18` }}
      >
        <span style={{ color }}>
          <Icon size={18} />
        </span>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-white/[0.07] dark:bg-[#1a1d21]">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/[0.07]">
        <h2 className="flex items-center gap-2.5 text-[14px] font-bold text-slate-900 dark:text-white">
          <Icon size={16} className="text-slate-500 dark:text-slate-400" />
          {title}
        </h2>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  editable,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  editable?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(value);

  return (
    <div className="flex items-start gap-4 py-4 [&+&]:border-t [&+&]:border-slate-50 dark:[&+&]:border-white/[0.05]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-white/[0.05]">
        <Icon size={15} className="text-slate-400 dark:text-slate-500" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
          {label}
        </span>
        {isEditing ? (
          <div className="mt-1 flex items-center gap-2">
            <input
              autoFocus
              className="flex-1 rounded-lg border border-blue-300 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-blue-500/30 dark:bg-white/[0.07] dark:text-white"
              value={val}
              onChange={(e) => setVal(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        ) : (
          <span className="mt-0.5 text-[13px] font-semibold text-slate-900 dark:text-slate-100">
            {val}
          </span>
        )}
      </div>
      {editable && !isEditing && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="shrink-0 text-[11px] font-semibold text-blue-600 transition hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Edit
        </button>
      )}
    </div>
  );
}

function SecurityItem({
  icon: Icon,
  title,
  description,
  status,
  statusColor,
  actionLabel,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  status: string;
  statusColor: "green" | "amber" | "red";
  actionLabel: string;
}) {
  const colors = {
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    red: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  };

  return (
    <div className="flex items-center gap-4 py-4 [&+&]:border-t [&+&]:border-slate-50 dark:[&+&]:border-white/[0.05]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-white/[0.05]">
        <Icon size={15} className="text-slate-400 dark:text-slate-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-slate-900 dark:text-white">
          {title}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${colors[statusColor]}`}
        >
          {status}
        </span>
        <button
          type="button"
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          {actionLabel}
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked ?? false);

  return (
    <div className="flex items-center justify-between gap-4 py-4 [&+&]:border-t [&+&]:border-slate-50 dark:[&+&]:border-white/[0.05]">
      <div>
        <p className="text-[13px] font-semibold text-slate-900 dark:text-white">
          {label}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => setChecked((c) => !c)}
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
          checked ? "bg-blue-600" : "bg-slate-200 dark:bg-white/[0.12]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function UsageBar({
  label,
  used,
  total,
  color,
  unit = "",
}: {
  label: string;
  used: number;
  total: number;
  color: string;
  unit?: string;
}) {
  const pct = (used / total) * 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </span>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          {used}/{total}{unit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.08]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function ErpUserProfilePage() {
  const sessionState = authClient.useSession();
  const activeMemberState = authClient.useActiveMember();

  const userName =
    sessionState.data?.user?.name ||
    sessionState.data?.user?.email?.split("@")[0] ||
    "Viruj User";
  const userEmail = sessionState.data?.user?.email ?? "user@virujhealth.com";
  const userImage = sessionState.data?.user?.image;
  const role = activeMemberState.data?.role ?? "member";

  const initials = getInitials(userName);
  const memberSince = "January 2024";

  return (
    <div className="space-y-6 p-5 lg:p-8">
      {/* Hero / Avatar section */}
      <AvatarSection
        initials={initials}
        imageUrl={userImage}
        name={userName}
        role={role}
        email={userEmail}
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={User} label="Role" value={formatRole(role)} color="#3b82f6" />
        <StatCard icon={Clock} label="Member Since" value={memberSince} color="#8b5cf6" />
        <StatCard icon={CheckCircle2} label="Appointments" value="142" color="#10b981" />
        <StatCard icon={Star} label="Plan" value="Basic" color="#f59e0b" />
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Personal Info */}
          <SectionCard
            title="Personal Information"
            icon={User}
            action={
              <button
                id="profile-page-update-info"
                type="button"
                className="rounded-lg bg-blue-50 px-4 py-2 text-[12px] font-bold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
              >
                Update
              </button>
            }
          >
            <InfoRow icon={User} label="Full Name" value={userName} editable />
            <InfoRow icon={AtSign} label="Username" value={`@${(userName.split(" ")[0] ?? "user").toLowerCase()}`} editable />
            <InfoRow icon={Mail} label="Email Address" value={userEmail} editable />
            <InfoRow icon={Phone} label="Phone Number" value="+1 (555) 000-1234" editable />
            <InfoRow icon={MapPin} label="Location" value="Mumbai, India" editable />
            <InfoRow icon={Building2} label="Department" value="Clinical Operations" editable />
          </SectionCard>

          {/* Security */}
          <SectionCard title="Security & Access" icon={Shield}>
            <SecurityItem
              icon={Key}
              title="Password"
              description="Last changed 3 months ago"
              status="Active"
              statusColor="green"
              actionLabel="Change"
            />
            <SecurityItem
              icon={Smartphone}
              title="Two-Factor Authentication"
              description="Add an extra layer of security"
              status="Disabled"
              statusColor="amber"
              actionLabel="Enable"
            />
            <SecurityItem
              icon={Lock}
              title="Active Sessions"
              description="2 devices currently logged in"
              status="2 active"
              statusColor="green"
              actionLabel="Manage"
            />
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Plan & Usage */}
          <SectionCard
            title="Plan & Usage"
            icon={Zap}
            action={
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                Basic
              </span>
            }
          >
            <div className="space-y-4">
              <UsageBar label="Patients this month" used={14} total={25} color="#7c6fff" />
              <UsageBar label="Appointments today" used={24} total={30} color="#10b981" />
              <UsageBar label="Records this month" used={26} total={150} color="#f59e0b" />
              <UsageBar label="Storage used" used={8.2} total={20} color="#3b82f6" unit=" GB" />
            </div>

            <div className="mt-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white dark:from-[#0d1117] dark:to-[#161b22]">
              <p className="text-[12px] font-semibold text-white/60">
                Upgrade to Pro
              </p>
              <p className="mt-1 text-[22px] font-bold">
                $49{" "}
                <span className="text-[13px] font-medium text-white/50">
                  /month
                </span>
              </p>
              <p className="mt-2 text-[11px] text-white/50">
                Unlimited patients, appointments & 100 GB storage
              </p>
              <button
                id="profile-page-upgrade-plan"
                type="button"
                className="mt-4 w-full rounded-xl bg-white py-2.5 text-[13px] font-bold text-slate-900 transition hover:bg-slate-100"
              >
                Upgrade Plan
              </button>
            </div>
          </SectionCard>

          {/* Notifications */}
          <SectionCard title="Notifications" icon={Bell}>
            <NotificationToggle
              label="Email Notifications"
              description="Receive updates via email"
              defaultChecked
            />
            <NotificationToggle
              label="Push Notifications"
              description="In-app alerts for appointments"
              defaultChecked
            />
            <NotificationToggle
              label="SMS Alerts"
              description="Critical alerts via SMS"
            />
            <NotificationToggle
              label="Weekly Reports"
              description="Summary digest every Monday"
              defaultChecked
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
