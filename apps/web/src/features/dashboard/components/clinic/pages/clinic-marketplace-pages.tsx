"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ClinicGalleryBento,
  type ClinicGalleryBentoItem,
  extendedClinicGalleryItems,
} from "@/features/dashboard/components/clinic/clinic-gallery-bento";
import {
  Camera,
  Clock,
  ImagePlus,
  MapPin,
  MessageSquareReply,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  type VirujHospitalGalleryInput,
  virujBackend,
} from "@/lib/viruj-backend";
import type { OnboardingState } from "@/features/dashboard/components/hospital/pages/onboarding/types";

const doctors = [
  ["Dr. Aditi Rao", "Dermatology", "Live", "Skin Care, Hair Consults", "18.4k", "428", "4.8"],
  ["Dr. Karan Mehta", "Orthopedics", "Live", "Joint Pain, Sports Injury", "12.2k", "301", "4.7"],
  ["Dr. Nisha Kapoor", "Fertility", "Draft", "Fertility Counselling", "8.9k", "176", "4.9"],
] as const;


const offeringCategories = [
  "Dental",
  "Diagnostics",
  "Wellness",
  "Skin Care",
  "Fertility",
] as const;

type ClinicOffering = {
  name: string;
  description: string;
  category: string;
  doctors: string;
  price: string;
  duration: string;
  booking: string;
  visibility: string;
  featured: boolean;
  views: string;
  requests: string;
};

const offerings: ClinicOffering[] = [
  {
    name: "General Consultation",
    description: "First-line doctor consultation for common health concerns.",
    category: "General Medicine",
    doctors: "Dr. Aditi Rao",
    price: "Rs 499 - Rs 799",
    duration: "20 min",
    booking: "Online booking on",
    visibility: "Public + Search",
    featured: true,
    views: "18.4k",
    requests: "428",
  },
  {
    name: "Dental Cleaning",
    description: "Professional dental scaling and polishing for oral hygiene.",
    category: "Dental",
    doctors: "Dr. Karan Mehta, Dr. Gupta",
    price: "Rs 799",
    duration: "45 min",
    booking: "Online booking on",
    visibility: "Public + Search",
    featured: true,
    views: "12.2k",
    requests: "388",
  },
  {
    name: "ECG",
    description: "Quick heart rhythm screening with public booking support.",
    category: "Diagnostics",
    doctors: "No doctor required",
    price: "Rs 350",
    duration: "15 min",
    booking: "Request only",
    visibility: "Public profile",
    featured: true,
    views: "9.7k",
    requests: "302",
  },
  {
    name: "Fertility Assessment",
    description: "Initial fertility counselling and assessment package.",
    category: "Fertility",
    doctors: "Dr. Nisha Kapoor",
    price: "Rs 999 - Rs 1,499",
    duration: "30 min",
    booking: "Online booking on",
    visibility: "Public + Search",
    featured: false,
    views: "8.9k",
    requests: "176",
  },
];

const patients = [
  ["Riya Sharma", "+91 98765 11223", "Skin Consultation", "Viruj Marketplace", "Request Sent", "Today, 11:20 AM"],
  ["Aman Verma", "+91 99887 44551", "Full Body Checkup", "Direct Listing", "Booked", "Today, 09:45 AM"],
  ["Neha Iyer", "+91 91234 77880", "Dental Cleaning", "Viruj Marketplace", "Follow-up", "Yesterday"],
  ["Kabir Malhotra", "+91 90000 45678", "Fertility Counselling", "Doctor Profile", "Request Sent", "2 days ago"],
] as const;


const activity = [
  ["New review received", "Riya Sharma rated the clinic 5 stars.", "12 min ago"],
  ["Doctor added", "Dr. Nisha Kapoor was attached to this clinic.", "2 hours ago"],
  ["Service published", "Dental Cleaning is now visible on Viruj.", "Yesterday"],
  ["Gallery image uploaded", "Reception area photo added to public gallery.", "Yesterday"],
  ["Clinic profile updated", "Cover image and description were refreshed.", "2 days ago"],
] as const;

export function ClinicProfileManagementPage({
  organizationId,
}: {
  organizationId?: string;
}) {
  const savedProfile = useClinicOnboardingData(organizationId);

  if (!savedProfile) {
    return (
      <ClinicPageShell
        eyebrow="Clinic"
        title="Profile"
        subtitle="Clinic profile details will appear here after onboarding is saved."
      >
        <section className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/60 p-8 text-center dark:border-violet-400/20 dark:bg-violet-400/[0.06]">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-[#6d28d9] shadow-sm dark:bg-white/[0.08] dark:text-violet-200">
            <Stethoscope size={22} />
          </div>
          <h2 className="mt-4 font-headline text-xl font-semibold text-slate-950 dark:text-white">
            No clinic onboarding data saved yet
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
            Complete clinic onboarding to populate identity, contact, location, schedule, specialties, and doctors here.
          </p>
        </section>
      </ClinicPageShell>
    );
  }

  const data = savedProfile.data;
  const profileSource = savedProfile.source;
  const profile = data.profile;
  const primaryLocation = data.branches[0];
  const openDays = data.workingHours.filter((hours) => hours.isOpen);
  const completedFields = getClinicProfileCompleteness(data);
  const logoUrl = profile.logoUrl || profile.logoPreviewUrl;
  const coverUrl = profile.coverUrl || profile.coverPreviewUrl;
  const clinicPhotoNames = Array.isArray(profile.clinicPhotosNames) ? profile.clinicPhotosNames : [];
  const photoUrls = Array.isArray(profile.clinicPhotosPreviewUrls)
    ? profile.clinicPhotosPreviewUrls.filter(hasValue)
    : [];
  const services = Array.isArray(data.services) ? data.services : [];
  const profileSummary = compactList([
    profile.hospitalType,
    profile.hospitalOwnershipType,
    formatLocationTitle(primaryLocation),
  ]);
  const sourceLabel = profileSource === "completed" ? "Completed onboarding" : "Saved draft";
  const identityItems: ProfileDetailItem[] = [
    { label: "Clinic Name", value: profile.hospitalName },
    { label: "Legal Business Name", value: profile.legalBusinessName },
    { label: "Clinic Type", value: profile.hospitalType },
    { label: "Ownership Type", value: profile.hospitalOwnershipType },
    { label: "Registration Number", value: profile.registrationNumber },
    { label: "Year Established", value: profile.establishedYear },
    { label: "GST Number", value: profile.gstNumber },
    { label: "PAN", value: profile.panNumber },
  ];
  const contactItems: ProfileDetailItem[] = [
    { label: "Primary Mobile", value: profile.phone },
    { label: "Alternate Mobile", value: profile.alternateMobile },
    { label: "Emergency Contact", value: profile.emergencyContact },
    { label: "WhatsApp Number", value: profile.whatsappNumber },
    { label: "Email", value: profile.email },
    { label: "Website", value: profile.website },
  ];
  const locationItems: ProfileDetailItem[] = primaryLocation
    ? [
        { label: "Address", value: formatAddress(primaryLocation), wide: true },
        { label: "Landmark", value: primaryLocation.landmark },
        { label: "City", value: primaryLocation.city },
        { label: "State", value: primaryLocation.state },
        { label: "Country", value: primaryLocation.country },
        { label: "Pincode", value: primaryLocation.postalCode },
        { label: "Google Maps Location", value: primaryLocation.mapsLocation },
        { label: "Latitude / Longitude", value: formatCoordinates(primaryLocation.latitude, primaryLocation.longitude) },
      ]
    : [];
  const publicProfileItems: ProfileDetailItem[] = [
    { label: "About Clinic", value: profile.description, wide: true },
    { label: "Mission", value: profile.mission },
    { label: "Vision", value: profile.vision },
    { label: "Languages Spoken", value: profile.languagesSpoken, wide: true },
  ];
  const totalPhotos = Math.max(clinicPhotoNames.length, photoUrls.length);
  const mediaItems = [
    ["Logo", profile.logoName || (profile.logoUrl ? "Uploaded logo" : "")],
    ["Cover image", profile.coverName || (profile.coverUrl ? "Uploaded cover image" : "")],
    ["Clinic photos", clinicPhotoNames.join(", ")],
  ].filter(([, value]) => hasValue(value));

  return (
    <ClinicPageShell
      eyebrow="Clinic"
      title="Profile"
      subtitle={profileSource === "completed" ? "Built from completed onboarding data." : "Built from the latest saved onboarding draft."}
    >
      <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm dark:border-violet-400/[0.14] dark:bg-[#0e0a14]">
        <div className="relative min-h-[250px] bg-[#2e1065]">
          {coverUrl ? (
            <img
              alt={`${profile.hospitalName || "Clinic"} cover`}
              className="absolute inset-0 h-full w-full object-cover"
              src={coverUrl}
            />
          ) : null}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(196,181,253,0.42),transparent_35%),linear-gradient(135deg,rgba(46,16,101,0.95),rgba(109,40,217,0.9)_52%,rgba(24,16,42,0.94))]" />
          <div className="relative flex min-h-[250px] flex-col justify-between p-6 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80 backdrop-blur">
                <ShieldCheck size={14} />
                {sourceLabel}
              </span>
              <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80 backdrop-blur">
                {completedFields}% profile filled
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
              <div className="flex min-w-0 items-end gap-4">
                <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white text-[#6d28d9] shadow-2xl dark:bg-[#171021] dark:text-violet-200">
                  {logoUrl ? (
                    <img
                      alt={`${profile.hospitalName || "Clinic"} logo`}
                      className="h-full w-full object-cover"
                      src={logoUrl}
                    />
                  ) : (
                    <Stethoscope size={34} />
                  )}
                </div>
                <div className="min-w-0 pb-1 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-100/80">
                    {profile.hospitalType || "Clinic"}
                  </p>
                  <h2 className="mt-2 break-words font-headline text-3xl font-semibold tracking-tight md:text-4xl">
                    {profile.hospitalName || "Unnamed clinic"}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-violet-50/80">
                    {profileSummary || "Onboarding details saved without a public summary yet."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/12 bg-white/10 text-white backdrop-blur sm:grid-cols-4 lg:grid-cols-2">
                <ProfileHeroMetric label="Locations" value={data.branches.length.toString()} />
                <ProfileHeroMetric label="Open Days" value={openDays.length.toString()} />
                <ProfileHeroMetric label="Specialties" value={data.departments.length.toString()} />
                <ProfileHeroMetric label="Doctors" value={data.doctors.length.toString()} />
                <ProfileHeroMetric label="Services" value={services.length.toString()} />
                <ProfileHeroMetric label="Photos" value={totalPhotos.toString()} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <ProfileSection icon={<ShieldCheck size={18} />} title="Clinic Identity">
            <ProfileDetailGrid items={identityItems} />
          </ProfileSection>

          <ProfileSection icon={<MessageSquareReply size={18} />} title="Contact & Location">
            <div className="space-y-6">
              <ProfileDetailGrid items={contactItems} />
              {locationItems.length ? <ProfileDetailGrid items={locationItems} /> : <EmptyProfileBlock label="No location added in onboarding." />}
            </div>
          </ProfileSection>

          <ProfileSection icon={<Stethoscope size={18} />} title="Patient-Facing Details">
            <ProfileDetailGrid items={publicProfileItems} />
          </ProfileSection>

          <ProfileSection icon={<MapPin size={18} />} title="Locations">
            {data.branches.length ? (
              <div className="divide-y divide-violet-100 dark:divide-violet-400/[0.10]">
                {data.branches.map((branch, index) => (
                  <div className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_220px]" key={branch.id || `${branch.name}-${index}`}>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-950 dark:text-white">{branch.name || `Location ${index + 1}`}</p>
                      <p className="mt-1 break-words text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                        {formatAddress(branch) || "Address not provided"}
                      </p>
                    </div>
                    <div className="grid gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span>{branch.mapsLocation || "Map link not provided"}</span>
                      <span>{formatCoordinates(branch.latitude, branch.longitude) || "Coordinates not provided"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyProfileBlock label="No locations added in onboarding." />
            )}
          </ProfileSection>

          <ProfileSection icon={<Clock size={18} />} title="Working Hours">
            <div className="overflow-hidden rounded-xl border border-violet-100 dark:border-violet-400/[0.12]">
              {data.workingHours.map((hours) => (
                <div
                  className="grid gap-2 border-b border-violet-100 px-4 py-3 text-sm last:border-b-0 dark:border-violet-400/[0.10] md:grid-cols-[120px_170px_minmax(0,1fr)]"
                  key={hours.id || hours.day}
                >
                  <span className="font-bold text-slate-950 dark:text-white">{hours.day}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {hours.isOpen ? `${displayValue(hours.openingTime)} - ${displayValue(hours.closingTime)}` : "Closed"}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {hours.isOpen ? compactList([hours.lunchBreak && `Lunch: ${hours.lunchBreak}`, hours.emergencyHours && `Emergency: ${hours.emergencyHours}`]) || "No break or emergency hours added" : "Not open for regular hours"}
                  </span>
                </div>
              ))}
            </div>
          </ProfileSection>
        </section>

        <aside className="space-y-5">
          <ProfileSection icon={<Sparkles size={18} />} title="Profile Readiness">
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Saved information</span>
                  <strong className="text-slate-950 dark:text-white">{completedFields}%</strong>
                </div>
                <div className="h-2 rounded-full bg-violet-100 dark:bg-violet-400/[0.12]">
                  <div className="h-2 rounded-full bg-[#6d28d9]" style={{ width: `${completedFields}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ProfileMiniMetric icon={<MapPin size={16} />} label="Locations" value={data.branches.length.toString()} />
                <ProfileMiniMetric icon={<Clock size={16} />} label="Open Days" value={openDays.length.toString()} />
                <ProfileMiniMetric icon={<Stethoscope size={16} />} label="Specialties" value={data.departments.length.toString()} />
                <ProfileMiniMetric icon={<Users size={16} />} label="Doctors" value={data.doctors.length.toString()} />
                <ProfileMiniMetric icon={<Plus size={16} />} label="Services" value={services.length.toString()} />
                <ProfileMiniMetric icon={<Camera size={16} />} label="Photos" value={totalPhotos.toString()} />
              </div>
            </div>
          </ProfileSection>

          <ProfileSection icon={<Stethoscope size={18} />} title="Specialties">
            {data.departments.length ? (
              <div className="divide-y divide-violet-100 dark:divide-violet-400/[0.10]">
                {data.departments.map((department) => (
                  <div className="py-3 first:pt-0 last:pb-0" key={department.name}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-950 dark:text-white">{department.name}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                          {department.description || "No description provided"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-[#6d28d9] dark:bg-violet-400/[0.12] dark:text-violet-200">
                        {displayValue(department.openTime)} - {displayValue(department.closeTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyProfileBlock label="No specialties added in onboarding." />
            )}
          </ProfileSection>

          <ProfileSection icon={<Plus size={18} />} title="Services">
            {services.length ? (
              <div className="divide-y divide-violet-100 dark:divide-violet-400/[0.10]">
                {services.map((service, index) => (
                  <div className="py-3 first:pt-0 last:pb-0" key={service.id || `${service.name}-${index}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-950 dark:text-white">{service.name || "Unnamed service"}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {compactList([service.category, service.duration, service.price && `Price: ${service.price}`]) || "Category, price, and duration not provided"}
                        </p>
                        {service.description ? (
                          <p className="mt-1 text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">{service.description}</p>
                        ) : null}
                      </div>
                      <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-[#6d28d9] dark:bg-violet-400/[0.12] dark:text-violet-200">
                        {service.availableOnline ? "Online" : "Clinic only"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyProfileBlock label="No services added in onboarding." />
            )}
          </ProfileSection>

          <ProfileSection icon={<Users size={18} />} title="Doctors">
            {data.doctors.length ? (
              <div className="divide-y divide-violet-100 dark:divide-violet-400/[0.10]">
                {data.doctors.map((doctor, index) => (
                  <div className="py-3 first:pt-0 last:pb-0" key={doctor.id || `${doctor.name}-${index}`}>
                    <p className="font-bold text-slate-950 dark:text-white">{doctor.name || "Unnamed doctor"}</p>
                    <div className="mt-2 grid gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span>{displayValue(doctor.department)}</span>
                      <span>{compactList([doctor.experience && `${doctor.experience} experience`, doctor.consultationFee && `Fee: ${doctor.consultationFee}`]) || "Experience and fee not provided"}</span>
                      <span>{doctor.availability || "Availability not provided"}</span>
                      {doctor.inviteEmail ? <span>{doctor.inviteEmail}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyProfileBlock label="No doctors added in onboarding." />
            )}
          </ProfileSection>

          <ProfileSection icon={<Camera size={18} />} title="Media">
            {photoUrls.length ? (
              <div className="mb-4 grid grid-cols-3 gap-2">
                {photoUrls.slice(0, 6).map((photoUrl, index) => (
                  <img
                    alt={`Clinic photo ${index + 1}`}
                    className="aspect-square rounded-xl object-cover"
                    key={photoUrl}
                    src={photoUrl}
                  />
                ))}
              </div>
            ) : null}
            {mediaItems.length ? (
              <div className="divide-y divide-violet-100 dark:divide-violet-400/[0.10]">
                {mediaItems.map(([label, value]) => (
                  <ProfileInfoCell key={label} label={label} value={value} />
                ))}
              </div>
            ) : (
              <EmptyProfileBlock label="No media files saved in onboarding." />
            )}
          </ProfileSection>
        </aside>
      </div>
    </ClinicPageShell>
  );
}
function useClinicOnboardingData(organizationId?: string) {
  const [savedProfile, setSavedProfile] = useState<{
    data: OnboardingState;
    source: "completed" | "draft";
  } | null>(null);

  useEffect(() => {
    const storageIds = [organizationId, "workspace"].filter(
      (value): value is string => Boolean(value)
    );

    for (const storageId of storageIds) {
      const completed = readClinicOnboardingStorage(
        `viruj:clinic-onboarding:completed:${storageId}`
      );
      if (completed) {
        setSavedProfile({ data: completed, source: "completed" });
        return;
      }

      const draft = readClinicOnboardingStorage(
        `viruj:clinic-onboarding:draft:${storageId}`
      );
      if (draft) {
        setSavedProfile({ data: draft, source: "draft" });
        return;
      }
    }

    setSavedProfile(null);
  }, [organizationId]);

  return savedProfile;
}

function readClinicOnboardingStorage(key: string): OnboardingState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    const data =
      parsed && typeof parsed === "object" && "data" in parsed
        ? (parsed as { data?: unknown }).data
        : parsed;

    return isOnboardingState(data) ? data : null;
  } catch {
    return null;
  }
}

function writeClinicOnboardingStorage(
  organizationId: string | undefined,
  source: "completed" | "draft",
  data: OnboardingState
) {
  if (typeof window === "undefined") return;

  const storageId = organizationId || "workspace";
  window.localStorage.setItem(
    `viruj:clinic-onboarding:${source}:${storageId}`,
    JSON.stringify(data)
  );
}
function isOnboardingState(value: unknown): value is OnboardingState {
  return Boolean(
    value &&
      typeof value === "object" &&
      "profile" in value &&
      "branches" in value &&
      "departments" in value &&
      "doctors" in value &&
      "workingHours" in value
  );
}

type ProfileDetailItem = {
  label: string;
  value?: string;
  wide?: boolean;
};

function ProfileSection({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm dark:border-violet-400/[0.12] dark:bg-[#111018]">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-violet-50 text-[#6d28d9] dark:bg-violet-400/[0.12] dark:text-violet-200">
          {icon}
        </span>
        <h2 className="font-headline text-base font-semibold text-slate-950 dark:text-slate-100">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ProfileDetailGrid({ items }: { items: ProfileDetailItem[] }) {
  return (
    <div className="grid gap-x-6 gap-y-0 md:grid-cols-2">
      {items.map((item) => (
        <ProfileInfoCell
          className={item.wide ? "md:col-span-2" : undefined}
          key={item.label}
          label={item.label}
          value={item.value}
        />
      ))}
    </div>
  );
}

function ProfileHeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-r border-white/10 px-4 py-3 last:border-r-0 sm:border-b-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function ProfileInfoCell({
  className,
  label,
  value,
}: {
  className?: string;
  label: string;
  value?: string;
}) {
  return (
    <div className={`grid gap-1 border-b border-violet-100 py-3 last:border-b-0 dark:border-violet-400/[0.10] ${className ?? ""}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-500">
        {label}
      </p>
      <p className={`break-words text-sm font-semibold ${hasValue(value) ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}`}>
        {displayValue(value)}
      </p>
    </div>
  );
}

function ProfileMiniMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-3 dark:border-violet-400/[0.10] dark:bg-violet-400/[0.07]">
      <div className="flex items-center gap-2 text-[#6d28d9] dark:text-violet-200">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </span>
      </div>
      <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function EmptyProfileBlock({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/40 px-4 py-5 text-sm font-semibold text-slate-500 dark:border-violet-400/20 dark:bg-violet-400/[0.05] dark:text-slate-400">
      {label}
    </div>
  );
}
function getClinicProfileCompleteness(data: OnboardingState) {
  const profile = data.profile;
  const primaryLocation = data.branches[0];
  const checks = [
    profile.hospitalName,
    profile.legalBusinessName,
    profile.logoName || profile.logoUrl,
    profile.hospitalType,
    profile.hospitalOwnershipType,
    profile.registrationNumber,
    profile.establishedYear,
    profile.phone,
    profile.email,
    primaryLocation?.address,
    primaryLocation?.city,
    primaryLocation?.state,
    primaryLocation?.postalCode,
    data.workingHours.some((hours) => hours.isOpen && hours.openingTime && hours.closingTime) ? "hours" : "",
    data.departments.length ? "departments" : "",
    data.doctors.length ? "doctors" : "",
  ];

  return Math.round((checks.filter(hasValue).length / checks.length) * 100);
}

function displayValue(value?: string) {
  return hasValue(value) ? value.trim() : "Not provided";
}

function hasValue(value?: string): value is string {
  return Boolean(value?.trim());
}

function compactList(values: Array<string | false | undefined>) {
  return values.filter((value): value is string => typeof value === "string" && value.trim().length > 0).join(" | ");
}

function formatLocationTitle(location?: OnboardingState["branches"][number]) {
  if (!location) return "Location not provided";
  return compactList([location.city, location.state, location.country]) || "Location not provided";
}

function formatAddress(location: OnboardingState["branches"][number]) {
  return compactList([
    location.address,
    location.landmark,
    location.city,
    location.state,
    location.country,
    location.postalCode,
  ]);
}

function formatCoordinates(latitude?: string, longitude?: string) {
  return hasValue(latitude) || hasValue(longitude)
    ? compactList([latitude, longitude])
    : "";
}
export function ClinicDepartmentsPage({
  organizationId,
}: {
  organizationId?: string;
}) {
  const savedProfile = useClinicOnboardingData(organizationId);
  const [departments, setDepartments] = useState<OnboardingState["departments"]>([]);
  const [draft, setDraft] = useState({ closeTime: "", description: "", name: "", openTime: "" });

  useEffect(() => {
    setDepartments(savedProfile?.data.departments ?? []);
  }, [savedProfile]);

  const addDepartment = () => {
    const name = draft.name.trim();
    if (!name) return;

    const nextDepartment = {
      closeTime: draft.closeTime.trim(),
      description: draft.description.trim(),
      head: "",
      name,
      openTime: draft.openTime.trim(),
    };
    const nextDepartments = [...departments, nextDepartment];

    setDepartments(nextDepartments);
    setDraft({ closeTime: "", description: "", name: "", openTime: "" });

    if (savedProfile) {
      writeClinicOnboardingStorage(
        organizationId,
        savedProfile.source,
        { ...savedProfile.data, departments: nextDepartments }
      );
    }
  };

  return (
    <ClinicPageShell
      actions={<PrimaryAction icon={<Plus size={16} />} label="Add Department" onClick={addDepartment} />}
      eyebrow="Clinic"
      title="Departments"
      subtitle="Manage clinic departments and specialties from onboarding."
    >
      <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm dark:border-violet-400/[0.12] dark:bg-[#111018]">
        <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)_140px_140px_auto]">
          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Department</span>
            <input
              className="h-11 w-full rounded-xl border border-violet-100 bg-violet-50/60 px-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-violet-200 dark:border-violet-400/[0.12] dark:bg-violet-400/[0.08] dark:text-white"
              onChange={(event) => setDraft((value) => ({ ...value, name: event.target.value }))}
              placeholder="General Medicine"
              value={draft.name}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Description</span>
            <input
              className="h-11 w-full rounded-xl border border-violet-100 bg-violet-50/60 px-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-violet-200 dark:border-violet-400/[0.12] dark:bg-violet-400/[0.08] dark:text-white"
              onChange={(event) => setDraft((value) => ({ ...value, description: event.target.value }))}
              placeholder="Short department note"
              value={draft.description}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Opening</span>
            <input
              className="h-11 w-full rounded-xl border border-violet-100 bg-violet-50/60 px-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-violet-200 dark:border-violet-400/[0.12] dark:bg-violet-400/[0.08] dark:text-white"
              onChange={(event) => setDraft((value) => ({ ...value, openTime: event.target.value }))}
              placeholder="09:00 AM"
              value={draft.openTime}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Closing</span>
            <input
              className="h-11 w-full rounded-xl border border-violet-100 bg-violet-50/60 px-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-violet-200 dark:border-violet-400/[0.12] dark:bg-violet-400/[0.08] dark:text-white"
              onChange={(event) => setDraft((value) => ({ ...value, closeTime: event.target.value }))}
              placeholder="06:00 PM"
              value={draft.closeTime}
            />
          </label>
          <div className="flex items-end">
            <button
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#6d28d9] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5b21b6]"
              onClick={addDepartment}
              type="button"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm dark:border-violet-400/[0.12] dark:bg-[#111018]">
        <div className="grid grid-cols-[minmax(0,1fr)_150px_150px] gap-4 bg-violet-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:bg-violet-400/[0.08]">
          <span>Department</span>
          <span>Opening</span>
          <span>Closing</span>
        </div>
        {departments.length ? (
          <div className="divide-y divide-violet-100 dark:divide-violet-400/[0.10]">
            {departments.map((department, index) => (
              <div
                className="grid grid-cols-[minmax(0,1fr)_150px_150px] gap-4 px-5 py-4 text-sm"
                key={`${department.name}-${index}`}
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-950 dark:text-white">{department.name || "Unnamed department"}</p>
                  <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">
                    {department.description || "No description provided"}
                  </p>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{displayValue(department.openTime)}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{displayValue(department.closeTime)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5">
            <EmptyProfileBlock label="No departments added yet." />
          </div>
        )}
      </section>
    </ClinicPageShell>
  );
}
export function ClinicLocationsPage() {
  return (
    <ClinicPageShell eyebrow="Clinic" title="Locations" subtitle="Manage addresses and map visibility for your clinic listing." actions={<PrimaryAction icon={<Plus size={16} />} label="Add Location" />}>
      <div className="grid gap-5 xl:grid-cols-3">
        {["Bandra West", "Andheri East", "Powai"].map((location, index) => (
          <Panel key={location} title={location} subtitle={index === 0 ? "Primary listing location" : "Branch location"}>
            <div className="space-y-4 text-sm">
              <InfoLine icon={<MapPin size={16} />} label="Address" value={`${index + 12}, Healthcare Avenue, Mumbai`} />
              <InfoLine icon={<Clock size={16} />} label="Hours" value="Mon-Sat, 9:00 AM - 8:00 PM" />
              <StatusPill value={index === 2 ? "Draft" : "Visible"} />
            </div>
          </Panel>
        ))}
      </div>
    </ClinicPageShell>
  );
}

export function ClinicWorkingHoursPage() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return (
    <ClinicPageShell eyebrow="Clinic" title="Working Hours" subtitle="Set the public availability patients see before requesting appointments.">
      <Panel title="Weekly Schedule" subtitle="Marketplace display hours">
        <div className="divide-y divide-slate-200/70 dark:divide-white/[0.07]">
          {days.map((day, index) => (
            <div className="grid gap-3 py-4 text-sm md:grid-cols-[1fr_1fr_auto]" key={day}>
              <strong className="text-slate-950 dark:text-white">{day}</strong>
              <span className="font-medium text-slate-500">{index === 6 ? "Closed" : "9:00 AM - 8:00 PM"}</span>
              <button className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-[#6d28d9] dark:bg-violet-400/[0.12] dark:text-violet-200" type="button">
                Edit
              </button>
            </div>
          ))}
        </div>
      </Panel>
    </ClinicPageShell>
  );
}

export function ClinicPatientsPage() {
  return (
    <ClinicPageShell
      actions={<PrimaryAction icon={<Users size={16} />} label="Import Patient" />}
      eyebrow="Patients"
      title="Patient List"
      subtitle="Manage patients connected to this clinic through Viruj requests and bookings."
    >
      <Toolbar placeholder="Search patients..." tabs={["All", "Booked", "Request Sent", "Follow-up"]} />
      <Panel title="Patients" subtitle="Clinic-linked patient relationships">
        <div className="overflow-hidden rounded-2xl border border-violet-100 dark:border-violet-400/[0.12]">
          <div className="grid min-w-[900px] grid-cols-[240px_160px_190px_170px_130px_150px] gap-4 bg-violet-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:bg-violet-400/[0.08]">
            <span>Patient</span>
            <span>Contact</span>
            <span>Requested Service</span>
            <span>Source</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-violet-100 dark:divide-violet-400/[0.1]">
            {patients.map((patient) => (
              <div
                className="grid min-w-[900px] grid-cols-[240px_160px_190px_170px_130px_150px] items-center gap-4 px-5 py-4 text-sm"
                key={patient[0]}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-[#6d28d9]">
                    {getInitials(patient[0])}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-950 dark:text-white">
                      {patient[0]}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                      Last activity: {patient[5]}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {patient[1]}
                </span>
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  {patient[2]}
                </span>
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  {patient[3]}
                </span>
                <StatusPill value={patient[4]} />
                <div className="flex justify-end gap-2">
                  <SecondaryAction label="View" />
                  <SecondaryAction label="Message" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </ClinicPageShell>
  );
}

export function ClinicDoctorsPresencePage() {
  const [doctorRows, setDoctorRows] = useState(() =>
    doctors.map((doctor) => [...doctor] as string[])
  );

  const addDoctor = () => {
    setDoctorRows((rows) => [
      ...rows,
      [
        `Dr. New Specialist ${rows.length + 1}`,
        "General Medicine",
        "Draft",
        "General Consultation",
        "0",
        "0",
        "New",
      ],
    ]);
  };

  const editDoctor = (doctorName: string) => {
    setDoctorRows((rows) =>
      rows.map((doctor) =>
        doctor[0] === doctorName
          ? [doctor[0], doctor[1], doctor[2] === "Live" ? "Needs Review" : "Live", doctor[3], doctor[4], doctor[5], doctor[6]]
          : doctor
      )
    );
  };

  const deleteDoctor = (doctorName: string) => {
    setDoctorRows((rows) => rows.filter((doctor) => doctor[0] !== doctorName));
  };

  return (
    <ClinicPageShell eyebrow="Doctors" title="Attached Doctors" subtitle="Manage doctors associated with this clinic listing." actions={<PrimaryAction icon={<Plus size={16} />} label="Add Doctor" onClick={addDoctor} />}>
      <Toolbar placeholder="Search doctors..." tabs={["All", "Live", "Draft", "Needs Review"]} />
      <Panel title="Doctor List" subtitle="Listing doctors and assigned services">
        <div className="overflow-hidden rounded-2xl border border-violet-100 dark:border-violet-400/[0.12]">
          <div className="grid min-w-[860px] grid-cols-[280px_180px_110px_minmax(220px,1fr)_190px] gap-4 bg-violet-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:bg-violet-400/[0.08]">
            <span>Doctor</span>
            <span>Specialization</span>
            <span>Status</span>
            <span>Assigned Services</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-violet-100 dark:divide-violet-400/[0.1]">
            {doctorRows.map((doctor) => (
              <div
                className="grid min-w-[860px] grid-cols-[280px_180px_110px_minmax(220px,1fr)_190px] items-center gap-4 px-5 py-4 text-sm"
                key={doctor[0]}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-[#6d28d9]">
                    {doctor[0].split(" ").at(-1)?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-950 dark:text-white">
                      {doctor[0]}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                      {doctor[4]} views - {doctor[5]} requests - {doctor[6]} rating
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {doctor[1]}
                </span>
                <StatusPill value={doctor[2]} />
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  {doctor[3]}
                </span>
                <div className="flex justify-end gap-2">
                  <SecondaryAction label="Edit" onClick={() => editDoctor(doctor[0])} />
                  <SecondaryAction label="Remove" onClick={() => deleteDoctor(doctor[0])} tone="danger" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </ClinicPageShell>
  );
}

export function ClinicOfferingsPage() {
  const [offeringRows, setOfferingRows] = useState<ClinicOffering[]>(() => [
    ...offerings,
  ]);
  const featuredOfferings = offeringRows.filter((offering) => offering.featured);
  const selectedOffering = offeringRows[0] ?? offerings[0];

  const createOffering = () => {
    setOfferingRows((rows) => [
      ...rows,
      {
        name: `New Offering ${rows.length + 1}`,
        description: "Public-facing service description for Viruj patients.",
        category: "Wellness",
        doctors: "No doctor required",
        price: "Rs 499",
        duration: "20 min",
        booking: "Online booking on",
        visibility: "Public + Search",
        featured: false,
        views: "0",
        requests: "0",
      },
    ]);
  };

  const editOffering = (offeringName: string) => {
    setOfferingRows((rows) =>
      rows.map((offering) =>
        offering.name === offeringName
          ? {
              ...offering,
              featured: !offering.featured,
              visibility:
                offering.visibility === "Public + Search"
                  ? "Public profile"
                  : "Public + Search",
            }
          : offering
      )
    );
  };

  const deleteOffering = (offeringName: string) => {
    setOfferingRows((rows) =>
      rows.filter((offering) => offering.name !== offeringName)
    );
  };

  return (
    <ClinicPageShell
      actions={<PrimaryAction icon={<Plus size={16} />} label="Create Offering" onClick={createOffering} />}
      eyebrow="Clinic Offerings"
      title="Services & Facilities Catalog"
      subtitle="Build the public storefront patients see on Viruj clinic pages, search, discovery, doctor profiles, and booking flows."
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <Toolbar
            placeholder="Search offerings..."
            tabs={["All", "Featured", "Online Booking", "Visible", "Draft"]}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total Offerings" value={offeringRows.length.toString()} />
            <KpiCard label="Active Offerings" value={offeringRows.filter((offering) => offering.visibility.includes("Public")).length.toString()} />
            <KpiCard label="Most Viewed Service" value={offeringRows[0]?.name ?? "-"} />
            <KpiCard label="Most Requested Service" value={offeringRows[1]?.name ?? "-"} />
          </div>

          <Panel title="Category Management" subtitle="Categories are clinic-created, not hardcoded">
            <div className="flex flex-wrap gap-2">
              {offeringCategories.map((category) => (
                <span
                  className="rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-[#6d28d9] ring-1 ring-violet-100 dark:bg-violet-400/[0.10] dark:text-violet-200 dark:ring-violet-400/[0.14]"
                  key={category}
                >
                  {category}
                </span>
              ))}
              <button
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-violet-100 dark:bg-white/[0.06] dark:text-slate-200 dark:ring-white/[0.08]"
                type="button"
              >
                <Plus size={14} />
                Add Category
              </button>
            </div>
          </Panel>

          {offeringRows.length === 0 ? (
            <Panel title="No services added yet" subtitle="Create your first public-facing offering">
              <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl bg-violet-50 text-center dark:bg-violet-400/[0.08]">
                <Sparkles className="text-[#6d28d9]" size={42} />
                <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
                  No services added yet
                </h3>
                <p className="mt-2 max-w-sm text-sm font-medium text-slate-500">
                  Add services to power your public clinic page and service discovery.
                </p>
                <div className="mt-5">
                  <PrimaryAction icon={<Plus size={16} />} label="Create First Service" onClick={createOffering} />
                </div>
              </div>
            </Panel>
          ) : null}

          {featuredOfferings.length > 0 ? (
            <Panel title="Featured Services" subtitle="Featured items appear first on the public clinic page">
              <div className="grid gap-4 md:grid-cols-3">
                {featuredOfferings.map((offering) => (
                  <div className="rounded-2xl bg-[linear-gradient(135deg,#f5f3ff,#fae8ff)] p-4 ring-1 ring-violet-100 dark:bg-none dark:bg-violet-400/[0.10] dark:ring-violet-400/[0.14]" key={offering.name}>
                    <Sparkles className="text-[#6d28d9]" size={20} />
                    <p className="mt-3 font-bold text-slate-950 dark:text-white">{offering.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{offering.category}</p>
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}

          <Panel title="Offerings List" subtitle="Manage the public services and facilities catalog">
            <div className="overflow-hidden rounded-2xl border border-violet-100 dark:border-violet-400/[0.12]">
              <div className="grid min-w-[1080px] grid-cols-[240px_150px_190px_130px_120px_150px_130px_160px] gap-4 bg-violet-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:bg-violet-400/[0.08]">
                <span>Offering</span>
                <span>Category</span>
                <span>Assigned Doctors</span>
                <span>Price</span>
                <span>Duration</span>
                <span>Booking</span>
                <span>Visibility</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-violet-100 dark:divide-violet-400/[0.1]">
                {offeringRows.map((offering) => (
                  <div
                    className="grid min-w-[1080px] grid-cols-[240px_150px_190px_130px_120px_150px_130px_160px] items-center gap-4 px-5 py-4 text-sm"
                    key={offering.name}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-bold text-slate-950 dark:text-white">
                          {offering.name}
                        </p>
                        {offering.featured ? <StatusPill value="Featured" /> : null}
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">
                        {offering.description}
                      </p>
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {offering.category}
                    </span>
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      {offering.doctors}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {offering.price}
                    </span>
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      {offering.duration}
                    </span>
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      {offering.booking}
                    </span>
                    <StatusPill value={offering.visibility} />
                    <div className="flex justify-end gap-2">
                      <SecondaryAction label="Edit" onClick={() => editOffering(offering.name)} />
                      <SecondaryAction label="Delete" onClick={() => deleteOffering(offering.name)} tone="danger" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <DrawerPreview
            title="Create Offering Drawer"
            fields={[
              "Service Name",
              "Short Description",
              "Detailed Description",
              "Category",
              "Price",
              "Duration",
              "Assign Doctors",
              "Online Booking Enabled",
              "Featured Toggle",
              "Status",
              "Service Image",
            ]}
          />
        </div>

        <aside className="space-y-5">
          <Panel title="How this service appears to patients" subtitle="Mobile app preview">
            <div className="mx-auto max-w-[300px] rounded-[2rem] border border-slate-200 bg-slate-950 p-3 shadow-2xl dark:border-white/[0.08]">
              <div className="overflow-hidden rounded-[1.45rem] bg-white text-slate-950">
                <div className="h-28 bg-[linear-gradient(135deg,#6d28d9,#d946ef)] p-4 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75">
                    Services Available
                  </p>
                  <h3 className="mt-2 text-xl font-bold">{selectedOffering.name}</h3>
                </div>
                <div className="space-y-4 p-4">
                  <p className="text-sm leading-6 text-slate-600">
                    {selectedOffering.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <PreviewChip label="Price" value={selectedOffering.price} />
                    <PreviewChip label="Duration" value={selectedOffering.duration} />
                  </div>
                  <div className="rounded-2xl bg-violet-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Doctor Assignment
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-950">
                      {selectedOffering.doctors}
                    </p>
                  </div>
                  <button className="h-11 w-full rounded-xl bg-[#6d28d9] text-sm font-bold text-white" type="button">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Public Visibility" subtitle="Controls supported by every offering">
            <div className="space-y-3">
              <ToggleRow label="Visible On Public Profile" value="Enabled" />
              <ToggleRow label="Visible In Search" value="Enabled" />
              <ToggleRow label="Online Booking Enabled" value="Enabled" />
              <ToggleRow label="Featured" value="Enabled" />
            </div>
          </Panel>
        </aside>
      </section>
    </ClinicPageShell>
  );
}


export function ClinicGalleryPage({
  organizationId,
}: {
  organizationId?: string;
}) {
  const backendHospitalId = organizationId;
  const primaryItems = extendedClinicGalleryItems.slice(0, 5);
  const extraItems = extendedClinicGalleryItems.slice(5);
  const queryClient = useQueryClient();
  const queryKey = virujBackend.hospitalGallery.key(backendHospitalId);
  const [localImagesById, setLocalImagesById] = useState<Record<string, string>>({});
  const [previewItem, setPreviewItem] = useState<ClinicGalleryBentoItem | null>(null);
  const [galleryPersistenceError, setGalleryPersistenceError] = useState<string | null>(null);
  const [savingCardId, setSavingCardId] = useState<string | null>(null);

  const galleryQuery = useQuery({
    enabled: Boolean(backendHospitalId),
    queryFn: () =>
      virujBackend.hospitalGallery.list({ organizationId: backendHospitalId }),
    queryKey,
  });

  const galleryItems = galleryQuery.data ?? [];
  const galleryItemByCardId = useMemo(() => {
    const records: Record<string, (typeof galleryItems)[number] | undefined> = {};

    extendedClinicGalleryItems.forEach((item, index) => {
      records[item.id] = galleryItems.find((galleryItem) => galleryItem.sortOrder === index);
    });

    return records;
  }, [galleryItems]);
  const imageUrlsById = useMemo(() => {
    const urls: Record<string, string | undefined> = {};

    extendedClinicGalleryItems.forEach((item) => {
      urls[item.id] = galleryItemByCardId[item.id]?.url;
    });

    return { ...urls, ...localImagesById };
  }, [galleryItemByCardId, localImagesById]);

  const createGalleryMutation = useMutation({
    mutationFn: (gallery: VirujHospitalGalleryInput) =>
      virujBackend.hospitalGallery.create({
        gallery,
        organizationId: backendHospitalId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateGalleryMutation = useMutation({
    mutationFn: (input: {
      gallery: Partial<VirujHospitalGalleryInput>;
      id: string;
    }) =>
      virujBackend.hospitalGallery.update({
        gallery: input.gallery,
        id: input.id,
        organizationId: backendHospitalId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteGalleryMutation = useMutation({
    mutationFn: (id: string) =>
      virujBackend.hospitalGallery.delete({
        id,
        organizationId: backendHospitalId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  function saveCardImage(item: ClinicGalleryBentoItem, file: File) {
    setGalleryPersistenceError(null);

    if (!backendHospitalId) {
      setGalleryPersistenceError("Choose an active organization before uploading gallery images.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== "string") return;

      const url = reader.result;
      const sortOrder = extendedClinicGalleryItems.findIndex(
        (galleryItem) => galleryItem.id === item.id
      );
      const gallery: VirujHospitalGalleryInput = {
        altText: `${item.title} ${item.subtitle}`,
        caption: item.subtitle,
        isPublished: true,
        mediaType: "IMAGE",
        sortOrder: Math.max(sortOrder, 0),
        url,
      };

      const existing = galleryItemByCardId[item.id];

      setSavingCardId(item.id);
      try {
        const saved = existing
          ? await updateGalleryMutation.mutateAsync({ gallery, id: existing.id })
          : await createGalleryMutation.mutateAsync(gallery);

        setLocalImagesById((current) => ({ ...current, [item.id]: saved.url }));
      } catch (error) {
        setGalleryPersistenceError(
          error instanceof Error
            ? error.message
            : "Gallery image could not be saved. Please try again."
        );
      } finally {
        setSavingCardId(null);
      }
    };
    reader.onerror = () => {
      setGalleryPersistenceError("Image could not be read. Please choose another file.");
    };
    reader.readAsDataURL(file);
  }

  async function deleteCardImage(item: ClinicGalleryBentoItem) {
    setGalleryPersistenceError(null);

    const existing = galleryItemByCardId[item.id];
    if (existing && backendHospitalId) {
      try {
        await deleteGalleryMutation.mutateAsync(existing.id);
      } catch (error) {
        setGalleryPersistenceError(
          error instanceof Error
            ? error.message
            : "Gallery image could not be deleted. Please try again."
        );
        return;
      }
    }

    setLocalImagesById((current) => {
      const next = { ...current };
      delete next[item.id];
      return next;
    });

    if (previewItem?.id === item.id) {
      setPreviewItem(null);
    }
  }

  function previewCardImage(item: ClinicGalleryBentoItem) {
    if (!imageUrlsById[item.id]) return;
    setPreviewItem(item);
  }

  const previewUrl = previewItem ? imageUrlsById[previewItem.id] : undefined;

  return (
    <ClinicPageShell eyebrow="Gallery" title="Media Manager" subtitle="Upload, reorder, delete, preview, and choose the cover image." >
      {galleryPersistenceError ? (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
          {galleryPersistenceError}
        </div>
      ) : null}
      {savingCardId ? (
        <div className="mb-4 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-semibold text-[#6d28d9] dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200">
          Saving gallery image...
        </div>
      ) : null}

      <ClinicGalleryBento
        actionsForItem={(item) =>
          imageUrlsById[item.id] ? (
            <>
              <SecondaryAction label="Preview" onClick={() => previewCardImage(item)} />
              <SecondaryAction label="Delete" onClick={() => deleteCardImage(item)} tone="danger" />
            </>
          ) : null
        }
        extraItems={extraItems}
        imageUrlsById={imageUrlsById}
        items={primaryItems}
        onImageSelected={saveCardImage}
      />

      {previewItem && previewUrl && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[99] flex items-center justify-center bg-slate-950/35 p-6 backdrop-blur-2xl backdrop-saturate-50">
              <div className="max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-900 bg-[#ececec] shadow-[6px_6px_0_0_#0f172a] dark:border-slate-200 dark:bg-[#1a1d22] dark:shadow-[6px_6px_0_0_#e2e8f0]">
                <div className="flex items-center justify-between gap-3 border-b border-slate-900 px-4 py-3 dark:border-slate-200">
                  <div>
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900 dark:text-slate-100">
                      {previewItem.title}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {previewItem.subtitle}
                    </p>
                  </div>
                  <button
                    className="rounded-sm border border-slate-900 bg-white px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-slate-900 transition hover:bg-slate-100 dark:border-slate-200 dark:bg-slate-900 dark:text-slate-100"
                    onClick={() => setPreviewItem(null)}
                    type="button"
                  >
                    Close
                  </button>
                </div>
                <div className="max-h-[76vh] overflow-auto p-4">
                  <img
                    alt={`${previewItem.title} ${previewItem.subtitle}`}
                    className="mx-auto max-h-[70vh] w-auto max-w-full border border-slate-900 object-contain dark:border-slate-200"
                    src={previewUrl}
                  />
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </ClinicPageShell>
  );
}
export function ClinicReviewsPage() {
  const reviews = [
    ["Riya Sharma", "5.0", "Clean clinic, easy booking, and helpful doctor.", "Today"],
    ["Aman Verma", "4.0", "Good experience. Waiting area was comfortable.", "Yesterday"],
    ["Neha Iyer", "5.0", "The service list made it easy to choose a specialist.", "2 days ago"],
  ] as const;

  return (
    <ClinicPageShell eyebrow="Reviews" title="Review Management" subtitle="Track rating health and reply to patient feedback.">
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Average Rating" value="4.8" />
        <KpiCard label="Total Reviews" value="1,284" />
        <KpiCard label="Recent Reviews" value="42" />
        <KpiCard label="5-Star Share" value="86%" />
      </div>
      <Panel title="Rating Distribution" subtitle="Last 90 days">
        <div className="space-y-3">
          {["5 stars", "4 stars", "3 stars", "2 stars", "1 star"].map((label, index) => (
            <Progress key={label} label={label} value={`${[86, 9, 3, 1, 1][index]}%`} width={`${[86, 9, 3, 1, 1][index]}%`} />
          ))}
        </div>
      </Panel>
      <Panel title="Review List" subtitle="Patient-visible feedback">
        <div className="space-y-3">
          {reviews.map((review) => (
            <div className="rounded-2xl bg-violet-50/70 p-4 dark:bg-violet-400/[0.08]" key={review[0]}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-950 dark:text-white">{review[0]}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{review[2]}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{review[1]} ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¹ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{review[3]}</span>
                <SecondaryAction icon={<MessageSquareReply size={14} />} label="Reply" />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </ClinicPageShell>
  );
}

export function ClinicSettingsPage() {
  const tabs = ["General", "Visibility", "Booking Preferences", "Notifications", "Integrations"];
  return (
    <ClinicPageShell eyebrow="Settings" title="Marketplace Settings" subtitle="Configure how your clinic appears and receives requests on Viruj.">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab, index) => (
          <button className={index === 0 ? "h-10 rounded-xl bg-[#6d28d9] px-4 text-sm font-semibold text-white" : "h-10 rounded-xl bg-violet-50 px-4 text-sm font-semibold text-slate-600 dark:bg-violet-400/[0.10] dark:text-slate-300"} key={tab} type="button">
            {tab}
          </button>
        ))}
      </div>
      <Panel title="General" subtitle="Default marketplace controls">
        <div className="grid gap-4 md:grid-cols-2">
          <ToggleRow label="Public Visibility" value="Enabled" />
          <ToggleRow label="Online Appointment Requests" value="Enabled" />
          <ToggleRow label="Review Replies" value="Enabled" />
          <ToggleRow label="WhatsApp Notifications" value="Disabled" />
        </div>
      </Panel>
    </ClinicPageShell>
  );
}

export function ClinicPageShell({
  actions,
  children,
  eyebrow,
  subtitle,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  eyebrow: string;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="space-y-6 p-6 lg:p-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-500">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-headline text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-500">
            {subtitle}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

function Panel({ children, subtitle, title }: { children: ReactNode; subtitle?: string; title: string }) {
  return (
    <section className="rounded-2xl border border-violet-100/80 bg-white/88 p-5 shadow-sm dark:border-violet-400/[0.12] dark:bg-[#14171b]">
      <h2 className="font-headline text-base font-semibold text-slate-950 dark:text-slate-100">{title}</h2>
      {subtitle ? <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <input className="h-11 w-full rounded-xl border border-violet-100 bg-violet-50/70 px-4 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-violet-200 dark:border-violet-400/[0.12] dark:bg-violet-400/[0.08] dark:text-slate-100" readOnly value={value} />
    </label>
  );
}

function PrimaryAction({
  icon,
  label,
  onClick,
}: {
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#6d28d9] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5b21b6]" onClick={onClick} type="button">{icon}{label}</button>;
}

function SecondaryAction({
  icon,
  label,
  onClick,
  tone,
}: {
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
  tone?: "danger";
}) {
  return <button className={tone === "danger" ? "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-rose-50 px-3 text-xs font-semibold text-rose-600 dark:bg-rose-400/[0.12]" : "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-violet-100 dark:bg-white/[0.06] dark:text-slate-200 dark:ring-white/[0.08]"} onClick={onClick} type="button">{icon}{label}</button>;
}

function Toolbar({ placeholder, tabs }: { placeholder: string; tabs: string[] }) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-100/80 bg-white/80 p-4 shadow-sm dark:border-violet-400/[0.12] dark:bg-[#14171b]">
      <div className="relative min-w-64 flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input className="h-11 w-full rounded-xl border-none bg-violet-50 pl-11 pr-4 text-sm font-semibold outline-none dark:bg-violet-400/[0.08]" placeholder={placeholder} />
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab, index) => (
          <button className={index === 0 ? "h-9 rounded-lg bg-[#6d28d9] px-3 text-xs font-semibold text-white" : "h-9 rounded-lg bg-violet-50 px-3 text-xs font-semibold text-slate-600 dark:bg-violet-400/[0.08] dark:text-slate-300"} key={tab} type="button">{tab}</button>
        ))}
      </div>
    </section>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <section className="rounded-2xl border border-violet-100 bg-white/88 p-5 shadow-sm dark:border-violet-400/[0.12] dark:bg-[#14171b]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-3 font-headline text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-violet-50 p-3 dark:bg-violet-400/[0.08]"><p className="text-[10px] font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-950 dark:text-white">{value}</p></div>;
}

function StatusPill({ value }: { value: string }) {
  return <span className="w-fit rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-[#6d28d9] dark:bg-violet-400/[0.14] dark:text-violet-200">{value}</span>;
}

function InfoLine({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex items-start gap-3"><span className="mt-0.5 text-[#6d28d9]">{icon}</span><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{value}</p></div></div>;
}

function UploadTile({ label, wide }: { label: string; wide?: boolean }) {
  return <div className={wide ? "md:col-span-2 rounded-2xl border border-dashed border-violet-200 bg-violet-50/70 p-5 dark:border-violet-400/[0.2] dark:bg-violet-400/[0.08]" : "rounded-2xl border border-dashed border-violet-200 bg-violet-50/70 p-5 dark:border-violet-400/[0.2] dark:bg-violet-400/[0.08]"}><ImagePlus className="text-[#6d28d9]" size={22} /><p className="mt-3 font-semibold text-slate-900 dark:text-white">{label}</p><p className="mt-1 text-xs text-slate-500">Upload or replace</p></div>;
}

function StatusTile({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-violet-50/70 p-5 dark:bg-violet-400/[0.08]"><ShieldCheck className="text-[#6d28d9]" size={22} /><p className="mt-3 text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-950 dark:text-white">{value}</p></div>;
}

function Progress({ label, value, width }: { label: string; value: string; width: string }) {
  return <div><div className="mb-2 flex justify-between text-sm"><span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span><strong>{value}</strong></div><div className="h-2 rounded-full bg-violet-100 dark:bg-violet-400/[0.12]"><div className="h-2 rounded-full bg-[#6d28d9]" style={{ width }} /></div></div>;
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return <div className="overflow-hidden rounded-2xl border border-violet-100 dark:border-violet-400/[0.12]"><div className="grid min-w-[760px] grid-cols-6 gap-4 bg-violet-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:bg-violet-400/[0.08]">{headers.map((header) => <span key={header}>{header}</span>)}</div><div className="divide-y divide-violet-100 dark:divide-violet-400/[0.1]">{rows.map((row) => <div className="grid min-w-[760px] grid-cols-6 gap-4 px-5 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200" key={row[0]}>{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}</div></div>;
}

function DrawerPreview({ fields, title }: { fields: string[]; title: string }) {
  return <Panel title={title} subtitle="Drawer-based form structure"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{fields.map((field) => <div className="rounded-xl bg-violet-50 p-4 text-sm font-semibold text-slate-700 dark:bg-violet-400/[0.08] dark:text-slate-200" key={field}>{field}</div>)}</div></Panel>;
}

function ChartPanel({ title }: { title: string }) {
  return <Panel title={title} subtitle="Last 30 days"><div className="flex h-52 items-end gap-3">{[42, 68, 54, 82, 72, 96, 88, 110, 104, 128].map((height, index) => <div className="flex flex-1 items-end" key={index}><div className="w-full rounded-t-xl bg-[linear-gradient(180deg,#d946ef,#6d28d9)]" style={{ height }} /></div>)}</div></Panel>;
}

function RankedList({ items }: { items: readonly (readonly [string, string])[] }) {
  return <div className="space-y-3">{items.map((item, index) => <div className="flex items-center justify-between rounded-xl bg-violet-50 p-3 text-sm dark:bg-violet-400/[0.08]" key={item[0]}><span className="font-semibold text-slate-800 dark:text-slate-100">{index + 1}. {item[0]}</span><strong>{item[1]}</strong></div>)}</div>;
}

function OfferingCard({
  index,
  offering,
}: {
  index: number;
  offering: ClinicOffering;
}) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-violet-100 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(109,40,217,0.14)] dark:border-violet-400/[0.12] dark:bg-[#14171b]">
      <div className="relative h-32 bg-[linear-gradient(135deg,#fae8ff,#fae8ff)] p-5 dark:bg-none dark:bg-violet-400/[0.10]">
        <div className="flex items-start justify-between">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#6d28d9] shadow-sm dark:bg-white/[0.10] dark:text-violet-200">
            {index % 2 === 0 ? <Sparkles size={22} /> : <Stethoscope size={22} />}
          </span>
          <div className="flex gap-2">
            {offering.featured ? <StatusPill value="Featured" /> : null}
            <button className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm dark:bg-white/[0.10] dark:text-slate-200" type="button">
              Actions
            </button>
          </div>
        </div>
        <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs font-bold text-[#6d28d9]">
          <span>{offering.category}</span>
          <span>{offering.visibility}</span>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h3 className="font-headline text-xl font-semibold text-slate-950 dark:text-white">
            {offering.name}
          </h3>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
            {offering.description}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <MiniStat label="Assigned Doctors" value={offering.doctors} />
          <MiniStat label="Price Range" value={offering.price} />
          <MiniStat label="Duration" value={offering.duration} />
          <MiniStat label="Booking Status" value={offering.booking} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-violet-100 pt-4 dark:border-violet-400/[0.10]">
          <div className="flex gap-2">
            <StatusPill value="Public Profile" />
            <StatusPill value="Search" />
          </div>
          <p className="text-xs font-bold text-slate-500">
            {offering.views} views - {offering.requests} requests
          </p>
        </div>
      </div>
    </article>
  );
}

function PreviewChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function ToggleRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-2xl bg-violet-50 p-4 dark:bg-violet-400/[0.08]"><span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#6d28d9] shadow-sm dark:bg-white/[0.08]">{value}</span></div>;
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "PT";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
