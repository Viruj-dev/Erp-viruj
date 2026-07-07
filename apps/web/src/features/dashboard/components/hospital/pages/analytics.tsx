"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronDown,
  Download,
} from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardPageShell } from "@/features/dashboard/components/shared/dashboard-page-shell";
import {
  virujBackend,
  type VirujAnalyticsChartWidget,
  type VirujAnalyticsDashboard,
  type VirujAnalyticsMetricValue,
  type VirujAnalyticsSummaryWidget,
} from "@/lib/viruj-backend";

type DashboardChartPoint = {
  label: string;
  primary: number;
  secondary: number;
  primaryLabel: string;
  secondaryLabel: string;
};

type KpiCard = {
  label: string;
  value: string;
  change?: string | null;
  direction?: "DOWN" | "FLAT" | "UP";
  note: string;
};

type OverviewSegment = {
  color: string;
  label: string;
  note: string;
  value: string;
  width: number;
};

type BreakdownItem = {
  color: string;
  label: string;
  value: number;
};

type AnalyticsViewModel = {
  breakdown: BreakdownItem[];
  heroData: DashboardChartPoint[];
  insightSeries: Array<{ label: string; primary: number; secondary: number }>;
  kpis: KpiCard[];
  overview: OverviewSegment[];
  periodLabel: string;
};

const fallbackHeroData: DashboardChartPoint[] = [
  { label: "Jan", primary: 820, primaryLabel: "Profile reach", secondary: -245, secondaryLabel: "Promo clicks" },
  { label: "Feb", primary: 960, primaryLabel: "Profile reach", secondary: -260, secondaryLabel: "Promo clicks" },
  { label: "Mar", primary: 1850, primaryLabel: "Profile reach", secondary: -155, secondaryLabel: "Promo clicks" },
  { label: "Apr", primary: 3020, primaryLabel: "Profile reach", secondary: -338, secondaryLabel: "Promo clicks" },
  { label: "May", primary: 2450, primaryLabel: "Profile reach", secondary: -278, secondaryLabel: "Promo clicks" },
  { label: "Jun", primary: 2180, primaryLabel: "Profile reach", secondary: -292, secondaryLabel: "Promo clicks" },
  { label: "Jul", primary: 2110, primaryLabel: "Profile reach", secondary: -365, secondaryLabel: "Promo clicks" },
  { label: "Aug", primary: 1120, primaryLabel: "Profile reach", secondary: -185, secondaryLabel: "Promo clicks" },
  { label: "Sep", primary: 1920, primaryLabel: "Profile reach", secondary: -282, secondaryLabel: "Promo clicks" },
  { label: "Oct", primary: 1580, primaryLabel: "Profile reach", secondary: -162, secondaryLabel: "Promo clicks" },
  { label: "Nov", primary: 2100, primaryLabel: "Profile reach", secondary: -366, secondaryLabel: "Promo clicks" },
  { label: "Dec", primary: 1210, primaryLabel: "Profile reach", secondary: -372, secondaryLabel: "Promo clicks" },
];

const fallbackBreakdown: BreakdownItem[] = [
  { color: "#2f48d7", label: "Completed", value: 37 },
  { color: "#b87218", label: "Confirmed", value: 24 },
  { color: "#0f8a9a", label: "Requested", value: 21 },
  { color: "#a8a29e", label: "Other", value: 18 },
];

export function ErpDemoAnalytics({
  organizationId,
  providerRole = "hospital",
}: {
  organizationId?: string;
  providerRole?: "clinic" | "doctor" | "hospital";
}) {
  const analyticsEntityId =
    process.env.NEXT_PUBLIC_VIRUJ_BACKEND_ANALYTICS_ENTITY_ID || organizationId;
  const analyticsQuery = useQuery({
    enabled: Boolean(analyticsEntityId),
    queryFn: () =>
      virujBackend.analytics.dashboard({
        entityId: analyticsEntityId as string,
        role: providerRole,
      }),
    queryKey: virujBackend.analytics.key({
      entityId: analyticsEntityId,
      role: providerRole,
    }),
    retry: 1,
    staleTime: 60_000,
  });
  const model = useMemo(
    () => buildAnalyticsViewModel(analyticsQuery.data),
    [analyticsQuery.data]
  );

  return (
    <DashboardPageShell
      actions={
        <>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-slate-200"
            type="button"
          >
            <CalendarDays size={16} />
            {model.periodLabel}
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(15,23,42,0.26)] transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950"
            type="button"
          >
            <Download size={16} />
            Export report
          </button>
        </>
      }
      className="overflow-hidden"
      eyebrow="Analytics"
      subtitle="Track profile reach, promotional visibility, campaign clicks, patient interest, and appointment demand."
      title="Profile & Promotion Analytics"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[#f4f0e8] p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#111418]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(47,72,215,0.12),transparent_28%),radial-gradient(circle_at_78%_12%,rgba(184,114,24,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.66),transparent)] dark:bg-[radial-gradient(circle_at_18%_10%,rgba(75,101,255,0.2),transparent_28%),radial-gradient(circle_at_78%_12%,rgba(245,158,11,0.16),transparent_30%)]" />
        <div className="relative grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-[1.5rem] border border-white/70 bg-white/64 p-4 shadow-inner backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.04]">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-headline text-2xl font-semibold text-slate-950 dark:text-white">
                  Profile Reach Analytics
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Track profile visits, promotional reach, campaign clicks, and appointment interest in one view.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {["Summary", "Profile Reach", "Promotions", "Clicks", "Appointments"].map((tab, index) => (
                  <span
                    className={
                      index === 0
                        ? "rounded-full bg-white px-4 py-2 text-slate-950 shadow-sm dark:bg-white dark:text-slate-950"
                        : "rounded-full px-4 py-2 hover:bg-white/60 dark:hover:bg-white/[0.08]"
                    }
                    key={tab}
                  >
                    {tab}
                  </span>
                ))}
              </div>
            </div>
            <HeroBarChart data={model.heroData} />
          </div>

          <aside className="grid gap-3">
            <div className="flex justify-end gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <button className="rounded-2xl bg-white/70 px-3 py-2 shadow-sm dark:bg-white/[0.06]" type="button">
                Provider <span className="text-slate-400">All</span> <ChevronDown className="inline" size={12} />
              </button>
              <button className="rounded-2xl bg-white px-3 py-2 shadow-sm dark:bg-white/[0.1]" type="button">
                Year
              </button>
            </div>
            {model.kpis.map((kpi) => (
              <KpiTile key={kpi.label} kpi={kpi} />
            ))}
          </aside>
        </div>

        <div className="relative mt-4 grid gap-4 lg:grid-cols-[1.25fr_0.8fr_0.75fr]">
          <PerformanceOverview segments={model.overview} />
          <BreakdownDonut items={model.breakdown} />
          <InsightPanel series={model.insightSeries} />
        </div>
      </section>
    </DashboardPageShell>
  );
}

function HeroBarChart({ data }: { data: DashboardChartPoint[] }) {
  return (
    <div className="h-[330px] w-full">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} margin={{ bottom: 8, left: -20, right: 8, top: 16 }}>
          <defs>
            <linearGradient id="analyticsPrimary" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3048d7" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#3048d7" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="analyticsSecondary" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#b87218" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#b87218" stopOpacity="0.98" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#d8d1c3" strokeDasharray="0" vertical={false} />
          <XAxis axisLine={false} dataKey="label" tick={{ fill: "#8a8174", fontSize: 12 }} tickLine={false} />
          <YAxis axisLine={false} tick={{ fill: "#b0a79a", fontSize: 12 }} tickFormatter={(value) => compactNumber(Math.abs(Number(value)))} tickLine={false} />
          <ReferenceLine stroke="#bcb3a6" y={0} />
          <Tooltip content={<HeroTooltip />} cursor={{ fill: "rgba(255,255,255,0.38)" }} />
          <Bar dataKey="primary" fill="url(#analyticsPrimary)" radius={[9, 9, 0, 0]} />
          <Bar dataKey="secondary" fill="url(#analyticsSecondary)" radius={[0, 0, 9, 9]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function HeroTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number; payload?: DashboardChartPoint; dataKey?: string }>; label?: string }) {
  if (!(active && payload?.length)) return null;
  const point = payload[0]?.payload;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-xs shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur dark:border-white/[0.08] dark:bg-slate-950/90">
      <p className="mb-3 font-semibold text-slate-950 dark:text-white">{label}</p>
      <p className="flex items-center justify-between gap-8 text-slate-600 dark:text-slate-300">
        <span><i className="mr-2 inline-block size-2 rounded-full bg-[#3048d7]" />{point?.primaryLabel ?? "Primary"}</span>
        <strong>{compactNumber(point?.primary ?? 0)}</strong>
      </p>
      <p className="mt-2 flex items-center justify-between gap-8 text-slate-600 dark:text-slate-300">
        <span><i className="mr-2 inline-block size-2 rounded-full bg-[#b87218]" />{point?.secondaryLabel ?? "Secondary"}</span>
        <strong>{compactNumber(Math.abs(point?.secondary ?? 0))}</strong>
      </p>
    </div>
  );
}

function KpiTile({ kpi }: { kpi: KpiCard }) {
  const positive = kpi.direction !== "DOWN";
  return (
    <article className="rounded-[1.35rem] border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.04]">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{kpi.label}</p>
      <div className="mt-7 flex items-end justify-between gap-3">
        <strong className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{kpi.value}</strong>
        {kpi.change ? (
          <span className={positive ? "rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-700" : "rounded-full bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-700"}>
            {kpi.change}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[11px] text-slate-400">{kpi.note}</p>
    </article>
  );
}

function PerformanceOverview({ segments }: { segments: OverviewSegment[] }) {
  return (
    <article className="rounded-[1.5rem] border border-white/70 bg-white/62 p-5 shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.04]">
      <p className="text-sm font-semibold text-slate-950 dark:text-white">Promotion overview</p>
      <div className="mt-8 flex items-center gap-3">
        <strong className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{segments[0]?.value ?? "--"}</strong>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">+8.7%</span>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {segments.map((segment) => (
          <div key={segment.label}>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-white/[0.08]">
              <div className="h-full rounded-full" style={{ backgroundColor: segment.color, width: `${segment.width}%` }} />
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{segment.label}</p>
            <strong className="mt-1 block text-lg font-semibold text-slate-950 dark:text-white">{segment.value}</strong>
            <span className="text-xs text-slate-400">{segment.note}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function BreakdownDonut({ items }: { items: BreakdownItem[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return (
    <article className="rounded-[1.5rem] border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">Appointment Status Mix</p>
        <button className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm dark:bg-white/[0.06] dark:text-slate-300" type="button">
          Statuses <ChevronDown size={12} />
        </button>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-[156px_minmax(0,1fr)] sm:items-center">
        <div className="relative mx-auto size-40 overflow-visible">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart margin={{ bottom: 4, left: 4, right: 4, top: 4 }}>
              <Pie
                cx="50%"
                cy="50%"
                data={items}
                dataKey="value"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={4}
                stroke="none"
              >
                {items.map((item) => <Cell fill={item.color} key={item.label} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center text-center leading-none">
            <strong className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{total}</strong>
            <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">records</span>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          {items.map((item) => (
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4" key={item.label}>
              <span className="flex min-w-0 items-center gap-2 text-slate-600 dark:text-slate-300">
                <i className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.label}</span>
              </span>
              <strong className="tabular-nums text-slate-950 dark:text-white">{Math.round((item.value / Math.max(total, 1)) * 100)}%</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function InsightPanel({ series }: { series: Array<{ label: string; primary: number; secondary: number }> }) {
  return (
    <article className="relative overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#b47a21,#0f4c9a)] p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_0%,rgba(255,255,255,0.34),transparent_34%)]" />
      <div className="relative">
        <p className="text-sm text-white/65">Utilization Signal</p>
        <strong className="mt-2 block text-4xl font-semibold">62%</strong>
        <div className="mt-7 h-28">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={series} margin={{ bottom: 4, left: 0, right: 0, top: 8 }}>
              <Line dataKey="primary" dot={{ r: 3 }} stroke="#3346d3" strokeWidth={2} type="monotone" />
              <Line dataKey="secondary" dot={{ r: 3 }} stroke="rgba(255,255,255,0.45)" strokeWidth={2} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-4 text-xs leading-5 text-white/66">
          Profile reach is improving while promotional clicks and appointment interest remain stable across the selected period.
        </p>
      </div>
    </article>
  );
}

function buildAnalyticsViewModel(dashboard?: VirujAnalyticsDashboard): AnalyticsViewModel {
  const summary = dashboard?.summary ?? [];
  const charts = dashboard?.charts ?? [];
  const summaries = summaryMap(summary);
  const profileReachSummary = findSummaryByHints(summaries, ["profile", "views", "reach"]);
  const appointmentSummary = findSummaryByHints(summaries, ["appointments", "consultations"]);
  const patientSummary = findSummaryByHints(summaries, ["patients", "new-patients"]);
  const doctorSummary = findSummaryByHints(summaries, ["doctors", "active-doctors"]);
  const volumeChart = findChartByHints(charts, ["appointments.volume", "consultations.volume"]);
  const profileReachChart = findChartByHints(charts, ["profile", "views", "reach", "promotion", "promo"]);
  const statusChart = findChartByHints(charts, ["appointments.status", "consultations.status", "reviews.rating"]);

  const heroData = buildHeroData(profileReachChart, volumeChart);
  const kpis: KpiCard[] = [
    toKpi("Profile Reach", profileReachSummary, "384.5K", "views this period"),
    toKpi("Promo Clicks", undefined, "18,045", "campaign engagement"),
    toKpi(patientSummary ? "Patient Leads" : "Appointment Interest", patientSummary ?? appointmentSummary ?? doctorSummary, "143", "from profile traffic"),
  ];
  const overview = buildOverview(summary, profileReachSummary, appointmentSummary, patientSummary);
  const breakdown = buildBreakdown(statusChart);
  return {
    breakdown,
    heroData,
    insightSeries: heroData.slice(-7).map((item) => ({
      label: item.label,
      primary: item.primary,
      secondary: Math.abs(item.secondary),
    })),
    kpis,
    overview,
    periodLabel: profileReachChart?.payload.period ?? volumeChart?.payload.period ?? "Past 30 days",
  };
}

function buildHeroData(profileReachChart?: VirujAnalyticsChartWidget, volumeChart?: VirujAnalyticsChartWidget): DashboardChartPoint[] {
  const labels = profileReachChart?.payload.labels?.length ? profileReachChart.payload.labels : volumeChart?.payload.labels;
  const primary = chartNumbers(profileReachChart) ?? [];
  const secondarySource = chartNumbers(volumeChart) ?? [];
  if (!labels?.length || (!primary.length && !secondarySource.length)) return fallbackHeroData;

  const primaryValues = labels.map((_label, index) => primary[index] ?? 0);
  const secondaryValues = labels.map((_label, index) => secondarySource[index] ?? 0);
  const maxPrimary = Math.max(...primaryValues, 1);
  const maxSecondary = Math.max(...secondaryValues, 1);
  const scale = maxPrimary / maxSecondary;
  return labels.map((label, index) => ({
    label: formatCompactAxisLabel(label),
    primary: primaryValues[index] || secondaryValues[index] * scale,
    primaryLabel: profileReachChart?.payload.datasets[0]?.label ?? "Profile reach",
    secondary: -(secondaryValues[index] * scale * 0.72),
    secondaryLabel: volumeChart?.payload.datasets[0]?.label ?? "Promo clicks",
  }));
}

function buildOverview(summary: VirujAnalyticsSummaryWidget[], profileReach?: VirujAnalyticsSummaryWidget, appointments?: VirujAnalyticsSummaryWidget, patients?: VirujAnalyticsSummaryWidget): OverviewSegment[] {
  const values = [
    { color: "#3048d7", label: profileReach?.title ?? "Profile Reach", widget: profileReach },
    { color: "#b87218", label: "Promotional Clicks", widget: undefined },
    { color: "#0f8a9a", label: patients?.title ?? "Patient Leads", widget: patients ?? appointments ?? summary[0] },
  ];
  return values.map((item, index) => ({
    color: item.color,
    label: item.label,
    note: index === 0 ? "54%" : index === 1 ? "25%" : "21%",
    value: item.widget ? formatSummaryValue(item.widget) : ["384.5K", "18,045", "12,890"][index],
    width: [100, 72, 42][index],
  }));
}

function buildBreakdown(chart?: VirujAnalyticsChartWidget): BreakdownItem[] {
  const values = chartNumbers(chart);
  const labels = chart?.payload.labels ?? [];
  if (!values?.length || !labels.length) return fallbackBreakdown;
  const colors = ["#3048d7", "#b87218", "#0f8a9a", "#a8a29e", "#ef4444", "#8b5cf6"];
  return labels.slice(0, 6).map((label, index) => ({
    color: colors[index] ?? "#a8a29e",
    label,
    value: Math.max(0, Math.round(values[index] ?? 0)),
  }));
}

function toKpi(label: string, widget: VirujAnalyticsSummaryWidget | undefined, fallback: string, note: string): KpiCard {
  return {
    label,
    value: widget ? formatSummaryValue(widget) : fallback,
    change: formatDelta(widget?.payload.comparison),
    direction: widget?.payload.comparison?.direction,
    note,
  };
}

function summaryMap(widgets: VirujAnalyticsSummaryWidget[]) {
  return new Map(widgets.map((widget) => [widget.id, widget]));
}


function findSummaryByHints(widgets: Map<string, VirujAnalyticsSummaryWidget>, hints: string[]) {
  return [...widgets.entries()].find(([id]) => hints.some((hint) => id.includes(hint)))?.[1];
}

function findChartByHints(widgets: VirujAnalyticsChartWidget[], hints: string[]) {
  return widgets.find((widget) => hints.some((hint) => widget.id.includes(hint)));
}

function formatSummaryValue(widget: VirujAnalyticsSummaryWidget) {
  return widget.payload.formattedValue || formatMetricValue(widget.payload.value) || "0";
}

function formatMetricValue(value: VirujAnalyticsMetricValue | undefined) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(value);
  }
  if (typeof value === "string") return value;
  return "";
}

function formatDelta(comparison?: { changePercentage?: number }) {
  if (typeof comparison?.changePercentage !== "number") return null;
  const value = Math.round(comparison.changePercentage * 10) / 10;
  return `${value > 0 ? "+" : ""}${value}%`;
}

function chartNumbers(widget?: VirujAnalyticsChartWidget) {
  const data = widget?.payload.datasets[0]?.data;
  if (!data?.length) return undefined;
  const values = data
    .map((item) => (typeof item === "number" ? item : item.y))
    .filter((value) => Number.isFinite(value));
  return values.length ? values : undefined;
}

function formatCompactAxisLabel(label: string) {
  const date = new Date(label);
  if (Number.isNaN(date.getTime())) return label;
  return new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date);
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: value >= 1000 ? 1 : 0,
    notation: Math.abs(value) >= 10_000 ? "compact" : "standard",
  }).format(value);
}
