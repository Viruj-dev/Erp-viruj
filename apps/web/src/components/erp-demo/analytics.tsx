"use client";

import {
  Activity,
  CalendarDays,
  DollarSign,
  Download,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  departmentSplit,
  patientDemographics,
  revenueTrend,
} from "@/components/erp-demo/data";
import {
  DonutStat,
  LineCompare,
  MiniBarChart,
} from "@/components/erp-demo/chart-primitives";

export function ErpDemoAnalytics() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-headline text-4xl font-black text-on-surface">
            Clinical analytics
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Real-time performance metrics and patient trend snapshots.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Chip icon={<CalendarDays size={16} />} label="Last 6 Months" />
          <button className="flex items-center gap-2 rounded-xl bg-on-surface px-4 py-3 text-sm font-black text-surface shadow-md" type="button">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={<DollarSign size={18} />} label="Total revenue" trend="+12.5%" value="$452,300" />
        <KpiCard icon={<Users size={18} />} label="Patient volume" tone="secondary" trend="+8.2%" value="3,420" />
        <KpiCard icon={<Activity size={18} />} label="Avg. consultation" tone="tertiary" trend="-2.1%" value="24m" />
        <KpiCard icon={<Target size={18} />} label="Success rate" tone="error" trend="+0.5%" value="94.8%" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="lg:col-span-8" description="Revenue and expense movement ported from the demo dataset." eyebrow="Financial performance" title="Operational economics">
          <LineCompare data={revenueTrend} />
        </Panel>

        <Panel className="lg:col-span-4" description="Distribution of activity across specialties." eyebrow="Department distribution" title="Clinical mix">
          <div className="flex justify-center">
            <DonutStat color="#0061A4" label="cardiology" total={100} value={35} />
          </div>
          <div className="mt-6 space-y-3">
            {departmentSplit.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-on-surface">{item.name}</span>
                </div>
                <span className="font-black text-on-surface-variant">{item.value}%</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="lg:col-span-6" description="Age-band counts from the ERP-demo mock data." eyebrow="Patient demographics" title="Population profile">
          <MiniBarChart data={patientDemographics.map((item) => ({ name: item.age, value: item.count }))} />
        </Panel>

        <Panel className="lg:col-span-6" description="Operational recommendations preserved from the demo UI." eyebrow="AI-driven insights" title="Priority opportunities">
          <div className="space-y-4">
            <InsightCard body="Cardiology billing cycles are 15% slower than average. Automated coding could recover roughly $12k monthly." title="Revenue growth opportunity" />
            <InsightCard body="Patient follow-up rate dropped 4% in Pediatrics. Trigger reminder outreach before next week." title="Patient retention alert" />
            <InsightCard body="Lab utilization peaks between 10 AM and 12 PM. Shift non-urgent appointments to afternoon slots." title="Resource optimization" />
          </div>
          <button className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-black text-white shadow-md" type="button">
            Generate Full Audit
          </button>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ children, className = "", description, eyebrow, title }: { children: React.ReactNode; className?: string; description: string; eyebrow: string; title: string }) {
  return (
    <div className={`rounded-[2rem] border border-outline-variant/20 bg-surface-container-low p-6 ${className}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-on-surface-variant">{eyebrow}</p>
      <h3 className="mt-3 font-headline text-2xl font-black text-on-surface">{title}</h3>
      <p className="mt-2 text-sm text-on-surface-variant">{description}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm font-black text-on-surface">
      {icon}
      {label}
    </div>
  );
}

function KpiCard({ icon, label, tone = "primary", trend, value }: { icon: React.ReactNode; label: string; tone?: "primary" | "secondary" | "tertiary" | "error"; trend: string; value: string }) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    tertiary: "bg-tertiary/10 text-tertiary",
    error: "bg-error/10 text-error",
  }[tone];

  const trendPositive = trend.startsWith("+");

  return (
    <div className="rounded-[1.5rem] border border-outline-variant/20 bg-surface-container-low p-5">
      <div className="flex items-start justify-between">
        <span className={`rounded-2xl p-3 ${toneClass}`}>{icon}</span>
        <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-black ${
          trendPositive ? "bg-secondary-container/45 text-secondary" : "bg-error-container text-error"
        }`}>
          {trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend}
        </span>
      </div>
      <p className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-on-surface-variant">{label}</p>
      <p className="mt-2 font-headline text-4xl font-black text-on-surface">{value}</p>
    </div>
  );
}

function InsightCard({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-[1.4rem] border border-outline-variant/15 bg-surface-container-lowest p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-semibold text-on-surface">{title}</h4>
        <Zap className="shrink-0 text-primary" size={16} />
      </div>
      <p className="mt-2 text-sm leading-7 text-on-surface-variant">{body}</p>
    </div>
  );
}
