"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  RoleDashboardPage,
  type RoleDashboardAnalytics,
} from "@/features/dashboard/components/shared/role-dashboard-page";
import {
  virujBackend,
  type VirujAnalyticsChartWidget,
  type VirujAnalyticsDashboard,
  type VirujAnalyticsSummaryWidget,
} from "@/lib/viruj-backend";

export function ErpDemoDashboard({
  organizationId,
  organizationLabel,
  userName,
}: {
  organizationId?: string;
  organizationLabel: string;
  roleLabel: string;
  userName: string;
}) {
  const tone = organizationLabel.toLowerCase() === "clinic" ? "clinic" : "hospital";
  const analyticsEntityId =
    process.env.NEXT_PUBLIC_VIRUJ_BACKEND_ANALYTICS_ENTITY_ID || organizationId;
  const analyticsQuery = useQuery({
    enabled: tone === "hospital" && Boolean(analyticsEntityId),
    queryFn: () =>
      virujBackend.analytics.dashboard({
        entityId: analyticsEntityId as string,
        role: "hospital",
      }),
    queryKey: virujBackend.analytics.key({
      entityId: analyticsEntityId,
      role: "hospital",
    }),
    retry: 1,
    staleTime: 60_000,
  });
  const appointmentsQuery = useQuery({
    enabled: tone === "hospital",
    queryFn: virujBackend.appointments.list,
    queryKey: virujBackend.appointments.key,
    retry: 1,
    staleTime: 30_000,
  });
  const doctorsQuery = useQuery({
    enabled: tone === "hospital",
    queryFn: virujBackend.doctors.list,
    queryKey: virujBackend.doctors.key,
    retry: 1,
    staleTime: 30_000,
  });
  const facilitiesQuery = useQuery({
    enabled: tone === "hospital",
    queryFn: virujBackend.facilities.list,
    queryKey: virujBackend.facilities.key,
    retry: 1,
    staleTime: 30_000,
  });
  const liveCounts = useMemo(
    () => ({
      activeDoctors: doctorsQuery.data?.filter((doctor) => doctor.published).length,
      activeServices: facilitiesQuery.data?.filter(
        (facility) =>
          facility.status === "active" &&
          facility.isAvailable &&
          facility.visibility === "public"
      ).length,
      appointments: appointmentsQuery.data?.length,
    }),
    [appointmentsQuery.data, doctorsQuery.data, facilitiesQuery.data]
  );
  const analytics = useMemo(
    () => buildHospitalDashboardAnalytics(analyticsQuery.data, liveCounts),
    [analyticsQuery.data, liveCounts]
  );

  return (
    <RoleDashboardPage
      analytics={tone === "hospital" ? analytics : undefined}
      tone={tone}
      userName={userName}
    />
  );
}

function buildHospitalDashboardAnalytics(
  dashboard?: VirujAnalyticsDashboard,
  liveCounts?: LiveDashboardCounts
): RoleDashboardAnalytics | undefined {
  if (!dashboard && !hasLiveCounts(liveCounts)) return undefined;

  const summaries = new Map(dashboard?.summary.map((widget) => [widget.id, widget]) ?? []);
  const appointments = summaries.get("hospital.appointments");
  const activeDoctors = summaries.get("hospital.active-doctors");
  const activeServices = summaries.get("hospital.active-services");
  const newPatients = summaries.get("hospital.new-patients");
  const appointmentSeries = findChart(
    dashboard?.charts,
    "hospital.appointments.volume"
  );
  const appointmentValue = liveOrSummaryValue(liveCounts?.appointments, appointments);
  const activeDoctorValue = liveOrSummaryValue(liveCounts?.activeDoctors, activeDoctors);
  const activeServiceValue = liveOrSummaryValue(liveCounts?.activeServices, activeServices);

  const stats = [
    {
      label: "Profile Views",
      note: newPatients
        ? `${formatSummaryValue(newPatients)} new patients this period`
        : "+18% this month",
      value: formatSummaryValue(newPatients) || "48.2k",
    },
    {
      label: "Appointment Requests",
      note:
        liveCountNote(liveCounts?.appointments, "appointment in ERP", "appointments in ERP") ??
        comparisonNote(appointments) ??
        "Last 30 days",
      value: appointmentValue || "0",
    },
    {
      label: "Active Doctors",
      note:
        liveCountNote(liveCounts?.activeDoctors, "published doctor", "published doctors") ??
        "Current hospital roster",
      value: activeDoctorValue || "0",
    },
    {
      label: "Active Services",
      note:
        liveCountNote(liveCounts?.activeServices, "public active service", "public active services") ??
        "Published hospital services",
      value: activeServiceValue || "0",
    },
    {
      label: "Average Rating",
      note: "Marketplace rating data pending",
      value: "4.8",
    },
    {
      label: "Review Count",
      note: "Marketplace review data pending",
      value: "1,284",
    },
  ];

  return {
    charts: [
      {
        title: "Appointment Request Trend",
        values: chartNumbers(appointmentSeries) ?? [],
      },
    ],
    heroStats: {
      "Profile Views": formatSummaryValue(newPatients) || "48.2k",
      Rating: "4.8",
      Requests: appointmentValue || "0",
      Visibility: "Public",
    },
    listingScore: listingScoreFromStats({
      activeDoctors: metricNumber(liveCounts?.activeDoctors, activeDoctors),
      activeServices: metricNumber(liveCounts?.activeServices, activeServices),
      appointments: metricNumber(liveCounts?.appointments, appointments),
    }),
    stats,
  };
}

type LiveDashboardCounts = {
  activeDoctors?: number;
  activeServices?: number;
  appointments?: number;
};

function hasLiveCounts(liveCounts?: LiveDashboardCounts) {
  return Object.values(liveCounts ?? {}).some((value) => typeof value === "number");
}

function findChart(widgets: VirujAnalyticsChartWidget[] | undefined, id: string) {
  return widgets?.find((widget) => widget.id === id || widget.id.startsWith(`${id}.`));
}

function chartNumbers(widget?: VirujAnalyticsChartWidget) {
  const data = widget?.payload.datasets[0]?.data;
  if (!data?.length) return undefined;
  const values = data
    .map((item) => (typeof item === "number" ? item : item.y))
    .filter((value) => Number.isFinite(value));

  return values.length ? values : undefined;
}

function formatSummaryValue(widget?: VirujAnalyticsSummaryWidget) {
  const value = widget?.payload.formattedValue || formatMetricValue(widget?.payload.value);
  return value || "";
}

function formatMetricValue(value: unknown) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(value);
  }
  if (typeof value === "string") return value;
  return "";
}

function liveOrSummaryValue(liveValue?: number, widget?: VirujAnalyticsSummaryWidget) {
  return typeof liveValue === "number"
    ? formatMetricValue(liveValue)
    : formatSummaryValue(widget);
}

function liveCountNote(value: number | undefined, singular: string, plural: string) {
  if (typeof value !== "number") return undefined;
  return `${formatMetricValue(value)} ${value === 1 ? singular : plural}`;
}

function comparisonNote(widget?: VirujAnalyticsSummaryWidget) {
  const changePercentage = widget?.payload.comparison?.changePercentage;
  if (typeof changePercentage !== "number") return undefined;
  if (changePercentage === 0) return "Flat vs previous period";
  const rounded = Math.round(changePercentage * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded}% vs previous period`;
}

function listingScoreFromStats({
  activeDoctors,
  activeServices,
  appointments,
}: {
  activeDoctors: number;
  activeServices: number;
  appointments: number;
}) {
  const score = 62 + Math.min(activeDoctors, 8) * 2 + Math.min(activeServices, 8) * 2 + (appointments > 0 ? 8 : 0);
  return Math.max(62, Math.min(96, Math.round(score)));
}

function metricNumber(liveValue?: number, widget?: VirujAnalyticsSummaryWidget) {
  if (typeof liveValue === "number") return liveValue;
  return typeof widget?.payload.value === "number" ? widget.payload.value : 0;
}
