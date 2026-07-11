"use client";

import { cn } from "@/lib/utils";
import { DashboardPageShell } from "@/features/dashboard/components/shared/dashboard-page-shell";
import {
  BadgeCheck,
  BedDouble,
  Building2,
  Check,
  Clock3,
  Eye,
  Globe2,
  Hospital,
  ImageIcon,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { publicOptions, storagePrefix } from "./onboarding/constants";
import { getDefaultOnboardingState, mergeOnboardingState } from "./onboarding/state";
import type { Branch, Department, OnboardingState, ProfileDefaults } from "./onboarding/types";

type StoredOnboardingPayload = {
  completedAt?: string;
  data?: OnboardingState;
  summary?: Array<{ label: string; value: string }>;
};

const fallbackFacilities = [
  "Emergency desk",
  "OPD scheduling",
  "Insurance desk",
  "Patient records",
  "Care coordination",
  "Digital booking",
] as const;

const publicFeatureLabels: Record<string, string> = {
  acceptOnlineAppointments: "Online appointments",
  allowReviews: "Patient reviews",
  displayDepartments: "Departments visible",
  enableCommunity: "Community updates",
  enableEmergencyContact: "Emergency contact",
  showHospitalProfile: "Public profile",
};

export function HospitalProfilePage({
  organizationId,
  organizationLabel,
  organizationName,
}: {
  organizationId?: string;
  organizationLabel: string;
  organizationName?: string;
}) {
  const defaults = useMemo<ProfileDefaults>(
    () => ({ hospitalName: organizationName || organizationLabel }),
    [organizationLabel, organizationName]
  );
  const [data, setData] = useState<OnboardingState>(() =>
    getDefaultOnboardingState(defaults)
  );
  const [completedAt, setCompletedAt] = useState<string | undefined>();
  const [hasOnboardingData, setHasOnboardingData] = useState(false);

  useEffect(() => {
    const stored = readStoredOnboardingState(organizationId);

    if (!stored?.data) {
      setData(getDefaultOnboardingState(defaults));
      setCompletedAt(stored?.completedAt);
      setHasOnboardingData(false);
      return;
    }

    setData(mergeOnboardingState(stored.data, defaults));
    setCompletedAt(stored.completedAt);
    setHasOnboardingData(true);
  }, [defaults, organizationId]);

  const profile = data.profile;
  const enabledDepartments = data.departments.filter(
    (department) => !data.disabledDepartments.includes(department.name)
  );
  const activeBranches = data.branches.filter(
    (branch) => branch.name.trim() || branch.address.trim() || branch.city.trim()
  );
  const mainBranch = activeBranches[0];
  const coverImage = profile.coverPreviewUrl || profile.coverUrl;
  const logoImage = profile.logoPreviewUrl || profile.logoUrl;
  const displayName = profile.hospitalName || organizationName || `${organizationLabel} Partner`;
  const isPublic = Boolean(data.publicProfile.showHospitalProfile);
  const enabledFeatures = publicOptions
    .filter(([key]) => data.publicProfile[key])
    .map(([key]) => publicFeatureLabels[key] ?? key);
  const completeness = calculateCompleteness(data);

  return (
    <DashboardPageShell
      actions={
        <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-[#00478d] dark:border-blue-400/15 dark:bg-blue-400/10 dark:text-blue-200">
          <ShieldCheck size={14} />
          {hasOnboardingData ? "Onboarding synced" : "Profile draft"}
        </div>
      }
      eyebrow="Hospital Profile"
      subtitle="The patient-facing hospital identity assembled from onboarding details, branches, departments, contact information, and visibility controls."
      title={displayName}
      tone="blue"
    >
      <section className="overflow-hidden rounded-[2rem] border border-[#dbe4e0] bg-[#f7f8f3] shadow-sm dark:border-white/[0.08] dark:bg-[#12161a]">
        <div className="relative h-72 overflow-hidden bg-[linear-gradient(135deg,#e8f4ef_0%,#d7edf8_48%,#0b3c68_100%)]">
          {coverImage ? (
            <img
              alt={`${displayName} cover`}
              className="absolute inset-0 h-full w-full object-cover"
              src={coverImage}
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,23,38,0.72),rgba(4,23,38,0.20)_54%,rgba(4,23,38,0.50))]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f7f8f3] via-[#f7f8f3]/74 to-transparent dark:from-[#12161a] dark:via-[#12161a]/72" />

          <div className="absolute left-6 top-6 flex flex-wrap gap-2">
            <ProfileBadge icon={<Eye size={14} />} label={isPublic ? "Public" : "Private"} />
            <ProfileBadge icon={<BadgeCheck size={14} />} label={completedAt ? "Completed" : "Draft"} />
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex min-w-0 items-end gap-4">
              <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-[26px] border border-white/70 bg-white text-[#00478d] shadow-[0_24px_60px_rgba(4,23,38,0.24)] ring-1 ring-black/5 dark:border-white/15 dark:bg-[#f8fafc]">
                {logoImage ? (
                  <img
                    alt={`${displayName} logo`}
                    className="h-full w-full object-cover"
                    src={logoImage}
                  />
                ) : (
                  <Hospital size={42} />
                )}
              </div>
              <div className="min-w-0 pb-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/78">
                  {profile.hospitalType || organizationLabel}
                </p>
                <h1 className="mt-2 max-w-3xl truncate font-headline text-3xl font-semibold tracking-tight text-white md:text-5xl">
                  {displayName}
                </h1>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-white/78">
                  <span>{profile.hospitalOwnershipType || "Ownership pending"}</span>
                  <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:inline-block" />
                  <span>{formatBranchLine(mainBranch) || "Primary branch pending"}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:w-[460px]">
              <HeroMetric label="Beds" value={profile.numberOfBeds || "--"} />
              <HeroMetric label="Branches" value={String(Math.max(activeBranches.length, 0))} />
              <HeroMetric label="Departments" value={String(enabledDepartments.length)} />
              <HeroMetric label="Ready" value={`${completeness}%`} />
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1.35fr)_360px]">
          <div className="space-y-5">
            <Panel
              eyebrow="Profile Story"
              icon={<Sparkles size={17} />}
              title="Patient app introduction"
            >
              <p className="text-sm font-medium leading-7 text-slate-600 dark:text-slate-400">
                {profile.description ||
                  "Add a hospital description in onboarding so patients can understand your specialties, infrastructure, and care experience."}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <DetailTile icon={<Building2 size={17} />} label="Category" value={profile.hospitalType || "Pending"} />
                <DetailTile icon={<Users size={17} />} label="Ownership" value={profile.hospitalOwnershipType || "Pending"} />
                <DetailTile icon={<BedDouble size={17} />} label="Capacity" value={profile.numberOfBeds ? `${profile.numberOfBeds} beds` : "Pending"} />
                <DetailTile icon={<Clock3 size={17} />} label="Established" value={profile.establishedYear || "Pending"} />
              </div>
            </Panel>

            <Panel eyebrow="Care Network" icon={<Stethoscope size={17} />} title="Departments">
              {enabledDepartments.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {enabledDepartments.map((department) => (
                    <DepartmentRow department={department} key={department.name} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Stethoscope size={22} />}
                  text="Departments added in onboarding will appear here with their patient-facing hours."
                />
              )}
            </Panel>

            <Panel eyebrow="Locations" icon={<MapPin size={17} />} title="Branches">
              {activeBranches.length ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  {activeBranches.map((branch, index) => (
                    <BranchCard branch={branch} index={index} key={branch.id || `${branch.name}-${index}`} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<MapPin size={22} />}
                  text="Branch address details from onboarding will populate this section."
                />
              )}
            </Panel>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <Panel eyebrow="Visibility" icon={<ShieldCheck size={17} />} title="Publishing status">
              <div className="rounded-2xl border border-[#d7e3df] bg-[#eef6f2] p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-950 dark:text-white">
                      {isPublic ? "Visible on Viruj" : "Hidden from patients"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-500">
                      {enabledFeatures.length}/{publicOptions.length} profile switches enabled
                    </p>
                  </div>
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                      isPublic
                        ? "bg-[#00478d] text-white"
                        : "bg-slate-200 text-slate-500 dark:bg-white/10"
                    )}
                  >
                    {isPublic ? <Check size={19} /> : <Eye size={19} />}
                  </span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white dark:bg-white/10">
                  <div
                    className="h-2 rounded-full bg-[#00478d] transition-all"
                    style={{ width: `${Math.max(12, completeness)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {publicOptions.map(([key, label]) => {
                  const enabled = data.publicProfile[key];
                  return (
                    <div
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/[0.04]"
                      key={key}
                    >
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {label}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                          enabled
                            ? "bg-blue-50 text-[#00478d] dark:bg-blue-400/10 dark:text-blue-200"
                            : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                        )}
                      >
                        {enabled ? "On" : "Off"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel eyebrow="Contact" icon={<Phone size={17} />} title="Patient contact">
              <div className="space-y-3">
                <ContactRow icon={<Phone size={16} />} label="Phone" value={profile.phone || "Pending"} />
                <ContactRow icon={<Mail size={16} />} label="Email" value={profile.email || "Pending"} />
                <ContactRow icon={<Globe2 size={16} />} label="Website" value={formatWebsite(profile.website) || "Pending"} />
                <ContactRow icon={<BadgeCheck size={16} />} label="Registration" value={profile.registrationNumber || "Pending"} />
                <ContactRow icon={<ShieldCheck size={16} />} label="GST" value={profile.gstNumber || "Pending"} />
              </div>
            </Panel>

            <Panel eyebrow="Media" icon={<ImageIcon size={17} />} title="Brand assets">
              <div className="grid grid-cols-2 gap-3">
                <MediaCheck label="Logo" ready={Boolean(logoImage)} />
                <MediaCheck label="Cover" ready={Boolean(coverImage)} />
              </div>
              <div className="mt-4 grid gap-2">
                {fallbackFacilities.map((facility) => (
                  <div
                    className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-white/[0.05] dark:text-slate-300"
                    key={facility}
                  >
                    <Check size={13} className="text-[#00478d] dark:text-blue-300" />
                    {facility}
                  </div>
                ))}
              </div>
            </Panel>
          </aside>
        </div>
      </section>
    </DashboardPageShell>
  );
}

function readStoredOnboardingState(organizationId?: string): StoredOnboardingPayload | null {
  if (typeof window === "undefined") return null;

  const keys = [
    `${storagePrefix}:draft:${organizationId ?? "workspace"}`,
    `${storagePrefix}:completed:${organizationId ?? "workspace"}`,
    `${storagePrefix}:draft:workspace`,
    `${storagePrefix}:completed:workspace`,
  ];

  for (const key of keys) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw) as StoredOnboardingPayload;
      if (parsed.data) return parsed;
    } catch {
      window.localStorage.removeItem(key);
    }
  }

  return null;
}

function calculateCompleteness(data: OnboardingState) {
  const checks = [
    data.profile.hospitalName,
    data.profile.phone,
    data.profile.email,
    data.profile.description,
    data.profile.logoUrl || data.profile.logoPreviewUrl,
    data.profile.coverUrl || data.profile.coverPreviewUrl,
    data.branches.some((branch) => branch.address.trim() && branch.city.trim()),
    data.departments.some((department) => !data.disabledDepartments.includes(department.name)),
    data.publicProfile.showHospitalProfile,
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function formatBranchLine(branch?: Branch) {
  if (!branch) return "";
  return [branch.city, branch.state, branch.country].filter(Boolean).join(", ");
}

function formatBranchAddress(branch: Branch) {
  return [branch.address, branch.city, branch.state, branch.postalCode, branch.country]
    .filter(Boolean)
    .join(", ");
}

function formatWebsite(value: string) {
  return value.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function formatTime(value: string) {
  if (!value) return "--";
  const [hour, minute] = value.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function ProfileBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex h-8 items-center gap-2 rounded-full border border-white/20 bg-white/14 px-3 text-xs font-bold text-white shadow-sm backdrop-blur">
      {icon}
      {label}
    </span>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/18 bg-white/14 p-3 text-white shadow-sm backdrop-blur">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/62">
        {label}
      </p>
      <p className="mt-1 font-headline text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Panel({
  children,
  eyebrow,
  icon,
  title,
}: {
  children: React.ReactNode;
  eyebrow: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[1.5rem] border border-[#dfe7e3] bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#171b20]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#00478d] dark:text-blue-300">
            {eyebrow}
          </p>
          <h2 className="mt-1 font-headline text-xl font-semibold text-slate-950 dark:text-slate-100">
            {title}
          </h2>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#00478d] dark:bg-blue-400/10 dark:text-blue-200">
          {icon}
        </span>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function DetailTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <span className="flex size-9 items-center justify-center rounded-xl bg-white text-[#00478d] shadow-sm dark:bg-white/10 dark:text-blue-200">
        {icon}
      </span>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}

function DepartmentRow({ department }: { department: Department }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold text-slate-950 dark:text-white">
            {department.name}
          </p>
          <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">
            {department.description || "Department description pending"}
          </p>
        </div>
        <Stethoscope className="shrink-0 text-[#00478d] dark:text-blue-300" size={18} />
      </div>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm dark:bg-white/10 dark:text-slate-300">
        <Clock3 size={13} />
        {formatTime(department.openTime)} - {formatTime(department.closeTime)}
      </div>
    </div>
  );
}

function BranchCard({ branch, index }: { branch: Branch; index: number }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-bold text-[#00478d] shadow-sm dark:bg-white/10 dark:text-blue-200">
          {index + 1}
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold text-slate-950 dark:text-white">
            {branch.name || `Branch ${index + 1}`}
          </p>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
            {formatBranchAddress(branch) || "Address pending"}
          </p>
          {branch.mapsLocation ? (
            <p className="mt-2 truncate text-xs font-bold text-[#00478d] dark:text-blue-300">
              {branch.mapsLocation}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#00478d] shadow-sm dark:bg-white/10 dark:text-blue-200">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-slate-100">
          {value}
        </p>
      </div>
    </div>
  );
}

function MediaCheck({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center dark:border-white/10 dark:bg-white/[0.04]">
      <span
        className={cn(
          "mx-auto flex size-10 items-center justify-center rounded-2xl",
          ready
            ? "bg-blue-50 text-[#00478d] dark:bg-blue-400/10 dark:text-blue-200"
            : "bg-slate-200 text-slate-500 dark:bg-white/10"
        )}
      >
        {ready ? <Check size={18} /> : <ImageIcon size={18} />}
      </span>
      <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-slate-500">
        {ready ? "Ready" : "Pending"}
      </p>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center dark:border-white/10 dark:bg-white/[0.035]">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#00478d] shadow-sm dark:bg-white/10 dark:text-blue-200">
        {icon}
      </span>
      <p className="mt-3 max-w-md text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
        {text}
      </p>
    </div>
  );
}
