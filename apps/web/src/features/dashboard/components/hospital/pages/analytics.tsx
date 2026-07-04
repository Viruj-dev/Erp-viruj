"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarDays,
  Download,
  Sparkles,
  Stethoscope,
  TrendingDown,
} from "lucide-react";
import { useMemo } from "react";
import { DashboardPageShell } from "@/features/dashboard/components/shared/dashboard-page-shell";
import {
  virujBackend,
  type VirujAnalyticsChartWidget,
  type VirujAnalyticsDashboard,
  type VirujAnalyticsSummaryWidget,
} from "@/lib/viruj-backend";

type SignalTone = "amber" | "emerald" | "indigo" | "rose";
type ChartSketchType =
  | "bars"
  | "bars-horizontal"
  | "flow"
  | "heatmap"
  | "line"
  | "stacked";

type SignalCardModel = {
  action: string;
  label: string;
  level: string;
  text: string;
  tone: SignalTone;
  value: string;
};

type MetricPanelModel = {
  axis?: [string, string];
  chart: ChartSketchType;
  data?: number[];
  delta?: string | null;
  label: string;
  value: string;
};

const signalCards: SignalCardModel[] = [
  {
    action: "Review queue",
    label: "Appointment pressure",
    level: "Medium",
    text: "OPD demand is rising in Cardiology and General Medicine during morning slots.",
    tone: "rose",
    value: "68 queued",
  },
  {
    action: "Open approvals",
    label: "Pending approvals",
    level: "High",
    text: "Appointment requests need staff approval before patient reminders can be sent.",
    tone: "amber",
    value: "12 urgent",
  },
  {
    action: "View reports",
    label: "Lab turnaround",
    level: "Low",
    text: "Pathology reports are clearing faster than last week with median TAT down 18%.",
    tone: "emerald",
    value: "41m median",
  },
  {
    action: "Inspect roster",
    label: "Doctor utilization",
    level: "Watch",
    text: "Five doctors are near full OPD capacity while two departments remain underbooked.",
    tone: "indigo",
    value: "87% load",
  },
];

const metricPanels: MetricPanelModel[] = [
  {
    chart: "line",
    delta: "-40%",
    label: "Appointments waiting",
    value: "24",
  },
  {
    chart: "flow",
    label: "Doctor utilization rate",
    value: "72%",
  },
  {
    chart: "stacked",
    delta: "-40%",
    label: "Patient no-show risk",
    value: "18",
  },
  {
    chart: "bars-horizontal",
    delta: "-40%",
    label: "Department load index",
    value: "15",
  },
  {
    chart: "bars",
    label: "Daily patient flow",
    value: "20",
  },
  {
    chart: "heatmap",
    delta: "-40%",
    label: "Revenue concentration",
    value: "18",
  },
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
  const liveSignalCards = useMemo(
    () => buildSignalCards(analyticsQuery.data),
    [analyticsQuery.data]
  );
  const liveMetricPanels = useMemo(
    () => buildMetricPanels(analyticsQuery.data),
    [analyticsQuery.data]
  );

  return (
    <DashboardPageShell
      actions={
        <>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semi-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-slate-200 dark:hover:bg-white/[0.1]"
            type="button"
          >
            <CalendarDays size={16} />
            Past 30 days
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semi-bold text-white shadow-[0_12px_26px_rgba(15,23,42,0.22)] transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            type="button"
          >
            <Download size={16} />
            Export report
          </button>
        </>
      }
      className="overflow-hidden"
      eyebrow="Analytics"
      subtitle="Live hospital signals across appointments, doctors, billing, labs, departments, and patient movement."
      title="Viruj Operations Intelligence"
    >
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-white to-transparent dark:from-[#111418]" />
        <div className="flex gap-5 overflow-hidden">
          {liveSignalCards.map((card, index) => (
            <SignalCard card={card} index={index} key={card.label} />
          ))}
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {[0, 1, 2, 3].map((dot) => (
            <span
              className={
                dot === 0
                  ? "size-2 rounded-full bg-slate-950 dark:bg-white"
                  : "size-2 rounded-full bg-slate-200 dark:bg-white/[0.16]"
              }
              key={dot}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 grid border-t border-slate-200 dark:border-white/[0.08] lg:grid-cols-3">
        {liveMetricPanels.map((panel) => (
          <MetricPanel key={panel.label} panel={panel} />
        ))}
      </div>
    </DashboardPageShell>
  );
}

function SignalCard({
  card,
  index,
}: {
  card: SignalCardModel;
  index: number;
}) {
  const toneClass = {
    amber:
      "from-amber-50 to-white border-amber-200/80 text-amber-700 dark:from-amber-400/12 dark:to-white/[0.02] dark:border-amber-300/15 dark:text-amber-200",
    emerald:
      "from-emerald-50 to-white border-emerald-200/80 text-emerald-700 dark:from-emerald-400/12 dark:to-white/[0.02] dark:border-emerald-300/15 dark:text-emerald-200",
    indigo:
      "from-indigo-50 to-white border-indigo-200/80 text-indigo-700 dark:from-indigo-400/12 dark:to-white/[0.02] dark:border-indigo-300/15 dark:text-indigo-200",
    rose: "from-rose-50 to-white border-rose-200/80 text-rose-700 dark:from-rose-400/12 dark:to-white/[0.02] dark:border-rose-300/15 dark:text-rose-200",
  }[card.tone];

  const Icon =
    card.tone === "rose"
      ? CalendarDays
      : card.tone === "amber"
        ? AlertTriangle
        : card.tone === "emerald"
          ? Sparkles
          : Stethoscope;

  return (
    <article
      className={`min-w-[330px] rounded-2xl border bg-gradient-to-b p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 ${toneClass}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between border-b border-current/10 pb-3">
        <p className="flex items-center gap-2 text-[11px] font-semi-bold uppercase tracking-[0.18em]">
          <Icon size={14} />
          {card.label}
        </p>
        <span className="h-px w-5 bg-current/20" />
      </div>
      <div className="pt-5">
        <p className="font-headline text-xl font-semi-bold text-slate-950 dark:text-slate-100">
          {card.value}
        </p>
        <p className="mt-3 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {card.text}
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semi-bold text-slate-800 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-slate-200">
          {card.action} →
        </button>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm dark:bg-white/[0.06] dark:text-slate-300">
          {card.level}
        </span>
      </div>
    </article>
  );
}

function MetricPanel({ panel }: { panel: MetricPanelModel }) {
  const delta = panel.delta ?? null;
  const axis = panel.axis ?? ["4 Nov", "4 Dec"];

  return (
    <article className="min-h-[270px] border-b border-r border-slate-200 p-7 last:border-r-0 dark:border-white/[0.08]">
      <p className="font-headline text-3xl font-semi-bold text-slate-950 dark:text-slate-100">
        {panel.value}
      </p>
      <p className="mt-2 text-[11px] font-semi-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
        {panel.label}
      </p>
      {delta ? (
        <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-semi-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">
          <TrendingDown size={12} />
          {delta}
        </p>
      ) : null}
      <div className="mt-8 h-32">
        <Chart data={panel.data} type={panel.chart} />
      </div>
      <div className="mt-3 flex justify-between text-xs text-slate-400 dark:text-slate-600">
        <span>{axis[0]}</span>
        <span>{axis[1]}</span>
      </div>
    </article>
  );
}

function Chart({ data, type }: { data?: number[]; type: ChartSketchType }) {
  switch (type) {
    case "line":
      return <LineSketch data={data} />;
    case "flow":
      return <FlowSketch />;
    case "stacked":
      return <StackedBars data={data} />;
    case "bars-horizontal":
      return <HorizontalBars data={data} />;
    case "bars":
      return <PurpleBars data={data} />;
    case "heatmap":
      return <HeatMap data={data} />;
  }
}

function LineSketch({ data }: { data?: number[] }) {
  const line = linePath(data);

  return (
    <svg className="h-full w-full overflow-visible" viewBox="0 0 280 120">
      <defs>
        <linearGradient id="lineFade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={line.area} fill="url(#lineFade)" />
      <path
        d={line.stroke}
        fill="none"
        stroke="#6d54d8"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function FlowSketch() {
  return (
    <svg className="h-full w-full" viewBox="0 0 280 120">
      {[0, 1, 2].map((layer) => (
        <path
          d="M12 34 C58 32 70 62 112 62 C153 62 157 73 205 72 C237 72 252 76 268 78"
          fill="none"
          key={layer}
          opacity={0.18 + layer * 0.16}
          stroke={layer === 2 ? "#ea580c" : "#fb923c"}
          strokeLinecap="round"
          strokeWidth={32 - layer * 10}
        />
      ))}
      <path d="M12 34 H58 V95 H12 Z" fill="#fed7aa" opacity="0.58" />
      <text fill="#a8a29e" fontSize="12" x="0" y="118">
        High
      </text>
      <text fill="#a8a29e" fontSize="12" x="246" y="118">
        Low
      </text>
    </svg>
  );
}

function StackedBars({ data }: { data?: number[] }) {
  const bars = normalizedHeights(
    data,
    [30, 55, 48, 70, 62, 78, 88, 44, 66, 92, 72, 57, 84, 38, 60, 75, 50, 68, 46,
      36, 57, 42]
  );
  return (
    <div className="flex h-full items-end gap-2">
      {bars.map((height, index) => (
        <div className="flex flex-1 flex-col items-stretch gap-1" key={index}>
          <span
            className="rounded-t bg-amber-300"
            style={{ height: `${height * 0.35}%` }}
          />
          <span
            className="bg-orange-400"
            style={{ height: `${height * 0.25}%` }}
          />
          <span
            className="rounded-b bg-teal-300"
            style={{ height: `${height * 0.4}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function HorizontalBars({ data }: { data?: number[] }) {
  const bars = normalizedHeights(data, [72, 18, 94, 54, 86, 35]);
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      {bars.map((width, index) => (
        <span
          className="h-3 rounded-full bg-sky-400"
          key={index}
          style={{ width: `${width}%` }}
        />
      ))}
    </div>
  );
}

function PurpleBars({ data }: { data?: number[] }) {
  const bars = normalizedHeights(
    data,
    [30, 52, 40, 68, 78, 86, 91, 72, 82, 45, 70, 90, 52, 84, 48, 46, 61, 35]
  );
  return (
    <div className="flex h-full items-end justify-center gap-2">
      {bars.map((height, index) => (
        <span
          className="w-2 rounded-t bg-violet-500"
          key={index}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

function HeatMap({ data }: { data?: number[] }) {
  const values = normalizedHeights(data, []);
  const cells = values.length
    ? values.slice(0, 8).map((value) =>
        value > 75
          ? "bg-violet-500"
          : value > 45
            ? "bg-amber-300"
            : "bg-slate-200"
      )
    : [
        "bg-slate-200",
        "bg-slate-200",
        "bg-violet-500",
        "bg-amber-300",
        "bg-violet-500",
        "bg-violet-500",
        "bg-amber-300",
        "bg-amber-300",
      ];

  return (
    <div className="grid h-full grid-cols-6 grid-rows-4 gap-1">
      {cells.map((cell, index) => (
        <span
          className={`rounded-lg ${cell}`}
          key={index}
          style={{
            gridColumn: index === 2 ? "span 3" : "span 1",
            gridRow: index === 2 ? "span 2" : "span 1",
          }}
        />
      ))}
    </div>
  );
}

function buildSignalCards(dashboard?: VirujAnalyticsDashboard): SignalCardModel[] {
  const backendSignals = dashboard?.signals ?? [];
  if (backendSignals.length > 0) {
    return signalCards.map((card, index) => {
      const signal = backendSignals[index];
      if (!signal) return card;
      return {
        ...card,
        action: signal.payload.action?.label ?? card.action,
        label: signal.title || card.label,
        level: signal.payload.severity.toLowerCase(),
        text: signal.payload.description || card.text,
        value: formatMetricValue(signal.payload.value) || card.value,
      };
    });
  }

  const summaries = summaryMap(dashboard?.summary ?? []);
  return signalCards.map((card, index) => {
    const widget = [
      summaries.get("hospital.appointments"),
      summaries.get("hospital.new-patients"),
      firstRevenueSummary(dashboard?.summary ?? []),
      summaries.get("hospital.active-doctors"),
    ][index];

    if (!widget) return card;
    return {
      ...card,
      value: formatSummaryValue(widget),
    };
  });
}

function buildMetricPanels(dashboard?: VirujAnalyticsDashboard): MetricPanelModel[] {
  const summaries = summaryMap(dashboard?.summary ?? []);
  const summaryWidgets = [
    summaries.get("hospital.appointments"),
    summaries.get("hospital.active-doctors"),
    summaries.get("hospital.new-patients"),
    summaries.get("hospital.active-departments"),
    summaries.get("hospital.active-services"),
    firstRevenueSummary(dashboard?.summary ?? []),
  ];
  const chartWidgets = [
    findChart(dashboard?.charts, "hospital.appointments.volume"),
    undefined,
    findChart(dashboard?.charts, "hospital.appointments.status"),
    undefined,
    findChart(dashboard?.charts, "hospital.appointments.volume"),
    findChart(dashboard?.charts, "hospital.revenue.trend"),
  ];

  return metricPanels.map((panel, index) => {
    const summary = summaryWidgets[index];
    const chart = chartWidgets[index];
    const comparison = summary?.payload.comparison ?? chart?.payload.comparison;
    const hasLiveWidget = Boolean(summary || chart);

    return {
      ...panel,
      axis: chartAxis(chart) ?? panel.axis,
      data: chartNumbers(chart) ?? panel.data,
      delta: hasLiveWidget ? formatDelta(comparison) : panel.delta,
      value: summary ? formatSummaryValue(summary) : panel.value,
    };
  });
}

function summaryMap(widgets: VirujAnalyticsSummaryWidget[]) {
  return new Map(widgets.map((widget) => [widget.id, widget]));
}

function firstRevenueSummary(widgets: VirujAnalyticsSummaryWidget[]) {
  return widgets.find((widget) => widget.id.startsWith("hospital.revenue."));
}

function findChart(widgets: VirujAnalyticsChartWidget[] | undefined, id: string) {
  return widgets?.find((widget) => widget.id === id || widget.id.startsWith(`${id}.`));
}

function formatSummaryValue(widget: VirujAnalyticsSummaryWidget) {
  return widget.payload.formattedValue || formatMetricValue(widget.payload.value) || "0";
}

function formatMetricValue(value: unknown) {
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

function chartAxis(widget?: VirujAnalyticsChartWidget): [string, string] | undefined {
  const labels = widget?.payload.labels;
  if (!labels?.length) return undefined;
  return [formatAxisLabel(labels[0]), formatAxisLabel(labels[labels.length - 1])];
}

function formatAxisLabel(label: string) {
  const date = new Date(label);
  if (Number.isNaN(date.getTime())) return label;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function normalizedHeights(data: number[] | undefined, fallback: number[]) {
  const values = data?.filter((value) => Number.isFinite(value)).slice(-24) ?? [];
  if (values.length === 0) return fallback;
  const max = Math.max(...values, 1);
  return values.map((value) => Math.max(8, Math.min(96, (value / max) * 96)));
}

function linePath(data: number[] | undefined) {
  const values = data?.filter((value) => Number.isFinite(value)).slice(-18) ?? [];
  if (values.length < 2) {
    return {
      area: "M0 43 L28 69 L58 82 L96 54 L124 38 L150 56 L176 48 L204 92 L232 105 L258 96 L280 118 L280 120 L0 120 Z",
      stroke: "M0 43 L28 69 L58 82 L96 54 L124 38 L150 56 L176 48 L204 92 L232 105 L258 96 L280 118",
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 280;
    const y = 108 - ((value - min) / range) * 76;
    return `${roundPathNumber(x)} ${roundPathNumber(y)}`;
  });
  const stroke = `M${points.join(" L")}`;
  return {
    area: `${stroke} L280 120 L0 120 Z`,
    stroke,
  };
}

function roundPathNumber(value: number) {
  return Math.round(value * 10) / 10;
}
