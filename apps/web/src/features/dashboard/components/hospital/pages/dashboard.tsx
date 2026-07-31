"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RoleDashboardPage,
  type RoleDashboardAnalytics,
} from "@/features/dashboard/components/shared/role-dashboard-page";
import {
  virujBackend,
  type VirujAnalyticsChartWidget,
  type VirujActivity,
  type VirujAnalyticsDashboard,
  type VirujAnalyticsSummaryWidget,
  type VirujAppointment,
  type VirujDoctor,
  type VirujFacility,
  type VirujHospitalGalleryItem,
} from "@/lib/viruj-backend";
import { storagePrefix } from "./onboarding/constants";
import { getDefaultOnboardingState, getPersistableOnboardingState, mergeOnboardingState } from "./onboarding/state";
import type { OnboardingState } from "./onboarding/types";

export function ErpDemoDashboard({
  organizationId,
  organizationLabel,
  organizationName,
  userName,
}: {
  organizationId?: string;
  organizationLabel: string;
  organizationName?: string;
  roleLabel: string;
  userName: string;
}) {
  const tone = organizationLabel.toLowerCase() === "clinic" ? "clinic" : "hospital";
  const analyticsEntityId = organizationId;
  const analyticsQuery = useQuery({
    enabled: Boolean(analyticsEntityId),
    queryFn: () =>
      virujBackend.analytics.dashboard({
        entityId: analyticsEntityId as string,
        role: tone,
      }),
    queryKey: virujBackend.analytics.key({
      entityId: analyticsEntityId,
      role: tone,
    }),
    retry: 1,
    staleTime: 60_000,
  });
  const appointmentsQuery = useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => virujBackend.appointments.list({ organizationId }),
    queryKey: virujBackend.appointments.key({ organizationId }),
    retry: 1,
    staleTime: 30_000,
  });
  const doctorsQuery = useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => virujBackend.doctors.list({ organizationId }),
    queryKey: virujBackend.doctors.key(organizationId),
    retry: 1,
    staleTime: 30_000,
  });
  const servicesQuery = useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => virujBackend.services.list({ organizationId }),
    queryKey: virujBackend.services.key({ organizationId }),
    retry: 1,
    staleTime: 30_000,
  });
  const galleryQuery = useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => virujBackend.hospitalGallery.list({ organizationId }),
    queryKey: virujBackend.hospitalGallery.key(organizationId),
    retry: 1,
    staleTime: 30_000,
  });
  const activityFilters = useMemo(
    () => ({ limit: 5, organizationId }),
    [organizationId]
  );
  const activityQuery = useQuery({
    enabled: Boolean(organizationId),
    queryFn: () => virujBackend.activity.list(activityFilters),
    queryKey: virujBackend.activity.key(activityFilters),
    retry: 1,
    staleTime: 30_000,
  });
  const analytics = useMemo(
    () => buildMarketplaceDashboardAnalytics({
      activities: activityQuery.data?.data ?? [],
      appointments: appointmentsQuery.data ?? [],
      dashboard: analyticsQuery.data,
      doctors: doctorsQuery.data ?? [],
      facilities: servicesQuery.data ?? [],
      gallery: galleryQuery.data ?? [],
    }),
    [
      activityQuery.data,
      analyticsQuery.data,
      appointmentsQuery.data,
      doctorsQuery.data,
      servicesQuery.data,
      galleryQuery.data,
    ]
  );
  const onboardingStatus = useHospitalOnboardingStatus(organizationId);
  const profileVisibility = useHospitalProfileVisibility(organizationId, organizationName || organizationLabel);

  return (
    <>
      <WelcomeOnboardingModal
        onOpenChange={onboardingStatus.setShowWelcome}
        open={onboardingStatus.showWelcome}
      />
      <RoleDashboardPage
        analytics={analytics}
        tone={tone}
        userName={userName}
        visibility={profileVisibility}
      />
    </>
  );
}

const onboardingStoragePrefix = "viruj:hospital-onboarding";

function useHospitalOnboardingStatus(organizationId?: string) {
  const storageId = organizationId ?? "workspace";
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const welcomeKey = `${onboardingStoragePrefix}:welcome:${storageId}`;
    const shouldWelcome = window.sessionStorage.getItem(welcomeKey) === "1";

    if (shouldWelcome) {
      setShowWelcome(true);
      window.sessionStorage.removeItem(welcomeKey);
    }
  }, [storageId]);

  return { setShowWelcome, showWelcome };
}


type StoredOnboardingPayload = {
  completedAt?: string;
  completedSteps?: string[];
  currentStepIndex?: number;
  data?: OnboardingState;
  summary?: Array<{ label: string; value: string }>;
};

function useHospitalProfileVisibility(organizationId: string | undefined, hospitalName: string) {
  const storageId = organizationId ?? "workspace";
  const defaults = useMemo(() => ({ hospitalName }), [hospitalName]);
  const [isPublic, setIsPublic] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsPublic(readHospitalProfileVisibility(storageId, defaults));
  }, [defaults, storageId]);

  const onToggle = () => {
    const next = !isPublic;
    setIsUpdating(true);
    setIsPublic(next);
    window.setTimeout(() => {
      writeHospitalProfileVisibility(storageId, defaults, next);
      setIsUpdating(false);
    }, 120);
  };

  return { isPublic, isUpdating, onToggle };
}

function onboardingKeys(storageId: string) {
  return [
    `${storagePrefix}:draft:${storageId}`,
    `${storagePrefix}:completed:${storageId}`,
    `${storagePrefix}:draft:workspace`,
    `${storagePrefix}:completed:workspace`,
  ];
}

function readHospitalProfileVisibility(storageId: string, defaults: { hospitalName: string }) {
  if (typeof window === "undefined") return true;

  for (const key of onboardingKeys(storageId)) {
    const payload = readOnboardingPayload(key, defaults);
    if (payload?.data) return Boolean(payload.data.publicProfile.showHospitalProfile);
  }

  return true;
}

function writeHospitalProfileVisibility(storageId: string, defaults: { hospitalName: string }, isPublic: boolean) {
  if (typeof window === "undefined") return;

  const keys = onboardingKeys(storageId);
  let wroteExisting = false;

  for (const key of keys) {
    const payload = readOnboardingPayload(key, defaults);
    if (!payload?.data) continue;
    window.localStorage.setItem(key, JSON.stringify(patchVisibility(payload, defaults, isPublic)));
    wroteExisting = true;
  }

  if (!wroteExisting) {
    const data = getDefaultOnboardingState(defaults);
    data.publicProfile.showHospitalProfile = isPublic;
    window.localStorage.setItem(
      `${storagePrefix}:draft:${storageId}`,
      JSON.stringify({ currentStepIndex: 0, data: getPersistableOnboardingState(data) })
    );
  }
}

function readOnboardingPayload(key: string, defaults: { hospitalName: string }) {
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  try {
    const payload = JSON.parse(raw) as StoredOnboardingPayload;
    if (!payload.data) return payload;
    return { ...payload, data: mergeOnboardingState(payload.data, defaults) };
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function patchVisibility(payload: StoredOnboardingPayload, defaults: { hospitalName: string }, isPublic: boolean) {
  const data = mergeOnboardingState(payload.data ?? getDefaultOnboardingState(defaults), defaults);
  data.publicProfile.showHospitalProfile = isPublic;
  const summary = payload.summary?.map((item) =>
    item.label === "Public Profile" ? { ...item, value: isPublic ? "Enabled" : "Hidden" } : item
  );
  return {
    ...payload,
    data: getPersistableOnboardingState(data),
    ...(summary ? { summary } : {}),
  };
}
function WelcomeOnboardingModal({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-lg rounded-[28px] border-white/70 bg-white p-0 shadow-[0_30px_120px_rgba(15,23,42,0.25)] dark:border-white/[0.10] dark:bg-[#101418]">
        <div className="overflow-hidden rounded-[28px]">
          <div className="bg-[linear-gradient(135deg,#062d4f,#075985_58%,#22d3ee)] p-6 text-white">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/14 text-2xl shadow-xl">
              {"\u{1F389}"}
            </div>
            <DialogHeader className="mt-5">
              <DialogTitle className="font-headline text-2xl font-semibold text-white">
                <span className="mr-2">{"\u{1F389}"}</span>Your organization has been successfully configured.
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-cyan-50/80">
                Viruj Health ERP is ready for daily operations. Continue to the dashboard to manage your hospital workspace.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-5">
            <button
              className="h-11 w-full rounded-full bg-[linear-gradient(135deg,#062d4f,#075985_58%,#22d3ee)] text-sm font-bold text-white shadow-[0_16px_34px_rgba(7,89,133,0.24)] transition hover:-translate-y-0.5"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Continue to dashboard
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function buildMarketplaceDashboardAnalytics({
  activities,
  appointments,
  dashboard,
  doctors,
  facilities,
  gallery,
}: {
  activities: VirujActivity[];
  appointments: VirujAppointment[];
  dashboard?: VirujAnalyticsDashboard;
  doctors: VirujDoctor[];
  facilities: VirujFacility[];
  gallery: VirujHospitalGalleryItem[];
}): RoleDashboardAnalytics {
  const activeDoctors = doctors.filter((doctor) => doctor.published).length;
  const pendingDoctors = doctors.length - activeDoctors;
  const activeServices = facilities.filter(isPublicActiveFacility).length;
  const draftServices = facilities.filter((facility) => facility.status === "draft").length;
  const pendingAppointments = appointments.filter((appointment) => appointment.status === "pending_approval").length;
  const completedAppointments = appointments.filter((appointment) => appointment.status === "completed").length;
  const publishedGallery = gallery.filter((item) => item.isPublished);
  const uniquePatients = new Set(appointments.map((appointment) => appointment.patientPhone || appointment.patientEmail || appointment.patientName)).size;
  const appointmentSummary = summaryBySuffix(dashboard, ".appointments");
  const ratingSummary = summaryBySuffix(dashboard, ".average-rating");
  const appointmentValue = appointments.length || summaryNumber(appointmentSummary);
  const ratingValue = summaryFormatted(ratingSummary) || "0.0";
  const galleryCompleteness = Math.min(100, Math.round((publishedGallery.length / 8) * 100));

  return {
    activity: activityRows(activities, appointments, doctors, facilities),
    charts: [
      {
        title: "Appointment Request Trend",
        values: chartNumbers(chartBySuffix(dashboard, ".appointments.volume")) ?? trendByDate(appointments, (item) => item.createdAt),
      },
      {
        title: "Doctor Publish Trend",
        values: trendByDate(doctors.filter((doctor) => doctor.published), (item) => item.publishedAt ?? item.createdAt),
      },
      {
        title: "Service Publish Trend",
        values: trendByDate(facilities.filter(isPublicActiveFacility), (item) => item.updatedAt ?? item.createdAt),
      },
    ],
    doctors: doctors.slice(0, 5).map((doctor) => ({
      badge: doctor.published ? "Shown in app" : "Draft",
      meta: [doctor.availability, doctor.fee].filter(Boolean).join(" | "),
      subtitle: [doctor.department, doctor.specialty].filter(Boolean).join(" | ") || "Doctor profile",
      title: doctor.name,
    })),
    gallery: {
      completeness: galleryCompleteness,
      imageUrlsById: Object.fromEntries(publishedGallery.map((item) => [item.id, item.url])),
      items: publishedGallery.slice(0, 5).map((item, index) => ({
        featured: index === 0,
        id: item.id,
        subtitle: item.caption || item.mediaType.toLowerCase(),
        title: item.altText || item.caption || `Gallery ${index + 1}`,
      })),
      liveCount: publishedGallery.length,
    },
    heroStats: {
      "Profile Views": formatMetricValue(uniquePatients),
      Rating: ratingValue,
      Requests: formatMetricValue(appointmentValue),
      Visibility: "Public",
    },
    listingScore: listingScoreFromStats({
      activeDoctors,
      activeServices,
      appointments: appointmentValue,
      galleryItems: publishedGallery.length,
    }),
    services: facilities.slice(0, 5).map((facility) => ({
      badge: facility.visibility === "public" ? "Public" : facility.status,
      meta: facility.priceText || (typeof facility.startingPrice === "number" ? `${facility.currency} ${facility.startingPrice}` : undefined),
      subtitle: [facility.category, facility.shortDescription].filter(Boolean).join(" | ") || "Service profile",
      title: facility.name,
    })),
    stats: [
      {
        label: "Patients",
        note: `${formatMetricValue(uniquePatients)} unique appointment requester${uniquePatients === 1 ? "" : "s"}`,
        value: formatMetricValue(uniquePatients),
      },
      {
        label: "Appointment Requests",
        note: `${formatMetricValue(pendingAppointments)} pending, ${formatMetricValue(completedAppointments)} completed`,
        value: formatMetricValue(appointmentValue),
      },
      {
        label: "Active Doctors",
        note: `${formatMetricValue(pendingDoctors)} waiting to publish`,
        value: formatMetricValue(activeDoctors),
      },
      {
        label: "Active Services",
        note: `${formatMetricValue(draftServices)} draft services`,
        value: formatMetricValue(activeServices),
      },
      {
        label: "Average Rating",
        note: ratingSummary ? "From analytics backend" : "Review backend has no rating yet",
        value: ratingValue,
      },
      {
        label: "Gallery Photos",
        note: `${galleryCompleteness}% gallery completeness`,
        value: formatMetricValue(publishedGallery.length),
      },
    ],
  };
}

function isPublicActiveFacility(facility: VirujFacility) {
  return facility.status === "active" && facility.isAvailable && facility.visibility === "public";
}

function summaryBySuffix(dashboard: VirujAnalyticsDashboard | undefined, suffix: string) {
  return dashboard?.summary.find((widget) => widget.id.endsWith(suffix));
}

function chartBySuffix(dashboard: VirujAnalyticsDashboard | undefined, suffix: string) {
  return dashboard?.charts.find((widget) => widget.id.endsWith(suffix));
}

function chartNumbers(widget?: VirujAnalyticsChartWidget) {
  const data = widget?.payload.datasets[0]?.data;
  if (!data?.length) return undefined;
  const values = data
    .map((item) => (typeof item === "number" ? item : item.y))
    .filter((value) => Number.isFinite(value));

  return values.length ? values : undefined;
}

function summaryNumber(widget?: VirujAnalyticsSummaryWidget) {
  const value = widget?.payload.value;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

function summaryFormatted(widget?: VirujAnalyticsSummaryWidget) {
  return widget?.payload.formattedValue || formatMetricValue(widget?.payload.value);
}

function trendByDate<T>(items: T[], dateFor: (item: T) => string | Date | null | undefined) {
  const days = Array.from({ length: 10 }, (_, index) => startOfDay(addDays(new Date(), index - 9)));
  const counts = new Map(days.map((date) => [date.toISOString().slice(0, 10), 0]));

  for (const item of items) {
    const dateValue = dateFor(item);
    if (!dateValue) continue;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) continue;
    const key = startOfDay(date).toISOString().slice(0, 10);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.values()];
}

function activityRows(
  activities: VirujActivity[],
  appointments: VirujAppointment[],
  doctors: VirujDoctor[],
  facilities: VirujFacility[]
) {
  if (activities.length) {
    return activities.slice(0, 5).map((activity) => ({
      id: activity.id,
      subtitle: activity.description || activity.display?.summary || activity.module,
      title: activity.title,
    }));
  }

  return [
    ...appointments.map((appointment) => ({
      date: appointment.createdAt,
      id: `appointment-${appointment.id}`,
      subtitle: `${appointment.patientName} requested ${appointment.appointmentDate} at ${appointment.appointmentTime}`,
      title: "Appointment requested",
    })),
    ...doctors.map((doctor) => ({
      date: doctor.createdAt,
      id: `doctor-${doctor.id}`,
      subtitle: `${doctor.name} ${doctor.published ? "is shown in app" : "is saved as draft"}`,
      title: "Doctor profile added",
    })),
    ...facilities.map((facility) => ({
      date: facility.createdAt,
      id: `facility-${facility.id}`,
      subtitle: `${facility.name} is ${facility.visibility === "public" ? "public" : facility.status}`,
      title: "Service profile added",
    })),
  ]
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
    .slice(0, 5)
    .map(({ id, subtitle, title }) => ({ id, subtitle, title }));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatMetricValue(value: unknown) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(value);
  }
  if (typeof value === "string") return value;
  return "0";
}

function listingScoreFromStats({
  activeDoctors,
  activeServices,
  appointments,
  galleryItems,
}: {
  activeDoctors: number;
  activeServices: number;
  appointments: number;
  galleryItems: number;
}) {
  const score = Math.min(activeDoctors, 8) * 3 + Math.min(activeServices, 8) * 3 + Math.min(galleryItems, 8) * 2 + (appointments > 0 ? 12 : 0);
  return Math.max(0, Math.min(100, Math.round(score)));
}
