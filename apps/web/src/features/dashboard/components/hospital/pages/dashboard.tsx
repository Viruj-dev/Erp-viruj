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
  const analytics = useMemo(
    () => buildHospitalDashboardAnalytics(analyticsQuery.data),
    [analyticsQuery.data]
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
  dashboard?: VirujAnalyticsDashboard
): RoleDashboardAnalytics | undefined {
  if (!dashboard) return undefined;

  const summaries = new Map(dashboard.summary.map((widget) => [widget.id, widget]));
  const appointments = summaries.get("hospital.appointments");
  const activeDoctors = summaries.get("hospital.active-doctors");
  const activeServices = summaries.get("hospital.active-services");
  const newPatients = summaries.get("hospital.new-patients");
  const departments = summaries.get("hospital.active-departments");
  const appointmentSeries = findChart(
    dashboard.charts,
    "hospital.appointments.volume"
  );

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
      note: comparisonNote(appointments) ?? "Last 30 days",
      value: formatSummaryValue(appointments) || "0",
    },
    {
      label: "Active Doctors",
      note: departments
        ? `${formatSummaryValue(departments)} active departments`
        : "Current hospital roster",
      value: formatSummaryValue(activeDoctors) || "0",
    },
    {
      label: "Active Services",
      note: "Published hospital services",
      value: formatSummaryValue(activeServices) || "0",
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
      Requests: formatSummaryValue(appointments) || "0",
      Visibility: "Public",
    },
    listingScore: listingScoreFromStats({ activeDoctors, activeServices, appointments }),
    stats,
  };
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
  activeDoctors?: VirujAnalyticsSummaryWidget;
  activeServices?: VirujAnalyticsSummaryWidget;
  appointments?: VirujAnalyticsSummaryWidget;
}) {
  const doctors = numericValue(activeDoctors);
  const services = numericValue(activeServices);
  const appointmentCount = numericValue(appointments);
  const score = 62 + Math.min(doctors, 8) * 2 + Math.min(services, 8) * 2 + (appointmentCount > 0 ? 8 : 0);
  return Math.max(62, Math.min(96, Math.round(score)));
}

function numericValue(widget?: VirujAnalyticsSummaryWidget) {
  return typeof widget?.payload.value === "number" ? widget.payload.value : 0;
}