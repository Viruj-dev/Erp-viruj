"use client";

import {
  AlertTriangle,
  CalendarDays,
  Download,
  Sparkles,
  Stethoscope,
  TrendingDown,
} from "lucide-react";

const signalCards = [
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
] as const;

const metricPanels = [
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
] as const;

export function ErpDemoAnalytics() {
  return (
    <div className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-5 px-7 pt-7 lg:px-10 lg:pt-9">
        <div>
          <h1 className="font-headline text-3xl font-semi-bold tracking-tight text-slate-950 dark:text-slate-100">
            Viruj Operations Intelligence
          </h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Live hospital signals across appointments, doctors, billing, labs,
            departments, and patient movement.
          </p>
        </div>
        <div className="flex items-center gap-3">
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
        </div>
      </div>

      <div className="relative mt-7 overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-white to-transparent dark:from-[#111418]" />
        <div className="flex gap-5 overflow-hidden px-7 lg:px-10">
          {signalCards.map((card, index) => (
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
        {metricPanels.map((panel) => (
          <MetricPanel key={panel.label} panel={panel} />
        ))}
      </div>
    </div>
  );
}

function SignalCard({
  card,
  index,
}: {
  card: (typeof signalCards)[number];
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

function MetricPanel({ panel }: { panel: (typeof metricPanels)[number] }) {
  return (
    <article className="min-h-[270px] border-b border-r border-slate-200 p-7 last:border-r-0 dark:border-white/[0.08]">
      <p className="font-headline text-3xl font-semi-bold text-slate-950 dark:text-slate-100">
        {panel.value}
      </p>
      <p className="mt-2 text-[11px] font-semi-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
        {panel.label}
      </p>
      {panel.delta ? (
        <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-semi-bold text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">
          <TrendingDown size={12} />
          {panel.delta}
        </p>
      ) : null}
      <div className="mt-8 h-32">
        <Chart type={panel.chart} />
      </div>
      <div className="mt-3 flex justify-between text-xs text-slate-400 dark:text-slate-600">
        <span>4 Nov</span>
        <span>4 Dec</span>
      </div>
    </article>
  );
}

function Chart({ type }: { type: (typeof metricPanels)[number]["chart"] }) {
  switch (type) {
    case "line":
      return <LineSketch />;
    case "flow":
      return <FlowSketch />;
    case "stacked":
      return <StackedBars />;
    case "bars-horizontal":
      return <HorizontalBars />;
    case "bars":
      return <PurpleBars />;
    case "heatmap":
      return <HeatMap />;
  }
}

function LineSketch() {
  return (
    <svg className="h-full w-full overflow-visible" viewBox="0 0 280 120">
      <defs>
        <linearGradient id="lineFade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 43 L28 69 L58 82 L96 54 L124 38 L150 56 L176 48 L204 92 L232 105 L258 96 L280 118 L280 120 L0 120 Z"
        fill="url(#lineFade)"
      />
      <path
        d="M0 43 L28 69 L58 82 L96 54 L124 38 L150 56 L176 48 L204 92 L232 105 L258 96 L280 118"
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

function StackedBars() {
  const bars = [
    30, 55, 48, 70, 62, 78, 88, 44, 66, 92, 72, 57, 84, 38, 60, 75, 50, 68, 46,
    36, 57, 42,
  ];
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

function HorizontalBars() {
  const bars = [72, 18, 94, 54, 86, 35];
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

function PurpleBars() {
  const bars = [
    30, 52, 40, 68, 78, 86, 91, 72, 82, 45, 70, 90, 52, 84, 48, 46, 61, 35,
  ];
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

function HeatMap() {
  const cells = [
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
