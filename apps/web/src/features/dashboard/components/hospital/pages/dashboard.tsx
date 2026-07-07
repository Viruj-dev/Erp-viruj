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
  const onboardingStatus = useHospitalOnboardingStatus(organizationId);

  return (
    <>
      {onboardingStatus.hasCompleted ? (
        <OrganizationSetupChecklist skippedSteps={onboardingStatus.skippedSteps} />
      ) : null}
      <WelcomeOnboardingModal
        onOpenChange={onboardingStatus.setShowWelcome}
        open={onboardingStatus.showWelcome}
      />
      <RoleDashboardPage
        analytics={tone === "hospital" ? analytics : undefined}
        tone={tone}
        userName={userName}
      />
    </>
  );
}

const onboardingStoragePrefix = "viruj:hospital-onboarding";

function useHospitalOnboardingStatus(organizationId?: string) {
  const storageId = organizationId ?? "workspace";
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [skippedSteps, setSkippedSteps] = useState<string[]>([]);

  useEffect(() => {
    const welcomeKey = `${onboardingStoragePrefix}:welcome:${storageId}`;
    const completeKey = `${onboardingStoragePrefix}:completed:${storageId}`;
    const shouldWelcome = window.sessionStorage.getItem(welcomeKey) === "1";
    const completed = window.localStorage.getItem(completeKey);

    if (shouldWelcome) {
      setShowWelcome(true);
      window.sessionStorage.removeItem(welcomeKey);
    }

    if (!completed) return;

    setHasCompleted(true);
    try {
      const parsed = JSON.parse(completed) as { skippedSteps?: string[] };
      setSkippedSteps(Array.isArray(parsed.skippedSteps) ? parsed.skippedSteps : []);
    } catch {
      setSkippedSteps([]);
    }
  }, [storageId]);

  return { hasCompleted, setShowWelcome, showWelcome, skippedSteps };
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
                Viruj Health ERP is ready for daily operations. Any skipped setup items are waiting on your dashboard checklist.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-5">
            <button
              className="h-11 w-full rounded-full bg-slate-950 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
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

function OrganizationSetupChecklist({ skippedSteps }: { skippedSteps: string[] }) {
  const skipped = new Set(skippedSteps);
  const items = [
    { id: "profile", label: "Hospital Profile", required: true },
    { id: "departments", label: "Departments", required: true },
    { id: "services", label: "Services", required: true },
    { id: "facilities", label: "Facilities", required: true },
    { id: "doctors", label: "Invite More Doctors" },
    { id: "billing", label: "Configure Billing" },
    { id: "insurance", label: "Add Insurance Partners" },
  ];

  return (
    <section className="mx-6 mt-6 rounded-[26px] border border-cyan-100 bg-white/88 p-5 shadow-sm dark:border-cyan-300/15 dark:bg-white/[0.06] lg:mx-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
            Organization Setup Progress
          </p>
          <h2 className="mt-1 font-headline text-xl font-semibold text-slate-950 dark:text-white">
            Launch checklist
          </h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
          Setup saved
        </span>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const complete = item.required || !skipped.has(item.id);
          return (
            <div
              className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 dark:bg-white/[0.055] dark:text-slate-300"
              key={item.id}
            >
              <span className={complete ? "text-emerald-600" : "text-slate-400"}>
                {complete ? "[x]" : "[ ]"}
              </span>
              {item.label}
            </div>
          );
        })}
      </div>
    </section>
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
