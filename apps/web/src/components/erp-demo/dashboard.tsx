"use client";

import {
  Activity,
  CalendarDays,
  FileText,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Zap,
} from "lucide-react";
import {
  departmentSplit,
  revenueTrend,
  weeklyBookings,
} from "@/components/erp-demo/data";
import {
  DonutStat,
  LineCompare,
  MiniBarChart,
} from "@/components/erp-demo/chart-primitives";

export function ErpDemoDashboard({ userName }: { userName: string }) {
  return (
    <div className="space-y-8 p-6 lg:p-10">
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-primary-container p-8 text-white shadow-[0_24px_80px_rgba(0,71,141,0.28)]">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-white/70">
            Clinical command center
          </p>
          <h1 className="mt-4 max-w-xl font-headline text-4xl font-black leading-tight lg:text-5xl">
            {userName || "Dr. Sarah Chen"}, your floor is moving cleanly today.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78">
            Throughput is stable, approvals are under control, and emergency load is
            below forecast. The dashboard below is the ERP-demo shell now driving
            the web app.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <MetricChip label="Consults today" value="86" />
            <MetricChip label="Lab turnaround" value="41m" />
            <MetricChip label="Open escalations" value="04" />
          </div>
        </div>

        <div className="rounded-[2rem] border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-on-surface-variant">
                Acceptance rate
              </p>
              <h2 className="mt-2 font-headline text-2xl font-black text-on-surface">
                Request efficiency
              </h2>
            </div>
            <ShieldCheck className="text-secondary" size={22} />
          </div>
          <div className="mt-8 flex justify-center">
            <DonutStat color="#00478d" label="optimal" total={1284} value={1130} />
          </div>
          <div className="mt-8 space-y-3 text-sm">
            <LegendRow color="#00478d" label="Accepted" value="1,130" />
            <LegendRow color="#d8dde7" label="Rejected" value="154" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard accent="bg-primary/10 text-primary" icon={<CalendarDays size={18} />} label="Total appointments" note="+12.5% over last 30 days" value="1,284" />
        <StatCard accent="bg-secondary/10 text-secondary" icon={<Activity size={18} />} label="Today's progress" note="42 of 60 visits completed" value="70%" />
        <StatCard accent="bg-error/10 text-error" icon={<FileText size={18} />} label="Pending approvals" note="4 urgent files need review" value="18" />
        <StatCard accent="bg-tertiary/10 text-tertiary" icon={<TrendingUp size={18} />} label="Revenue this week" note="Steady climb from OPD and imaging" value="$72k" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Panel eyebrow="Weekly booking trends" title="Patient flow by day" description="The demo dashboard's primary chart translated to the Next app.">
          <MiniBarChart data={weeklyBookings} />
        </Panel>
        <Panel eyebrow="Revenue comparison" title="Income versus operating spend" description="Sample finance series carried over from ERP-demo.">
          <LineCompare data={revenueTrend} />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel eyebrow="Real-time activity" title="Current floor events" description="Recent patient and staff activity snapshots.">
            <div className="space-y-4">
              <ActivityRow badge="ARRIVED" detail="Today, 09:42 AM | Dr. Robertson" title="Sarah Jenkins checked in for Cardiology" />
              <ActivityRow badge="REVIEW" detail="Today, 09:15 AM | General wellness" title="New appointment request submitted by Mark Vance" />
              <ActivityRow badge="LAB" detail="Today, 08:48 AM | Main diagnostics" title="CBC and lipid panel released for Eleanor Harris" />
            </div>
          </Panel>
          <Panel eyebrow="Department split" title="Clinical mix" description="The main service distribution from the demo dataset.">
            <div className="space-y-4">
              {departmentSplit.map((item) => (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-on-surface">{item.name}</span>
                    <span className="font-bold text-on-surface-variant">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-high">
                    <div className="h-2 rounded-full" style={{ backgroundColor: item.color, width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel eyebrow="Quick actions" title="Fast operations" description="Operational shortcuts from the demo shell.">
            <div className="grid grid-cols-2 gap-3">
              <QuickAction icon={<UserPlus size={18} />} label="Add Patient" />
              <QuickAction icon={<FileText size={18} />} label="Generate Report" />
              <QuickAction icon={<CalendarDays size={18} />} label="Staff Rota" />
              <QuickAction icon={<Activity size={18} />} label="Lab Order" />
            </div>
          </Panel>

          <div className="relative overflow-hidden rounded-[2rem] bg-secondary p-6 text-white shadow-[0_18px_50px_rgba(0,106,106,0.28)]">
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-white/65">
                Maintenance notice
              </p>
              <h3 className="mt-3 font-headline text-2xl font-black">
                Scheduled database window at 02:00 AM
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/80">
                Backups will run overnight. Analytics exports and background syncs may
                respond more slowly during that period.
              </p>
            </div>
            <Zap className="absolute -bottom-6 -right-4 text-white/14" size={120} />
          </div>
        </div>
      </section>
    </div>
  );
}

function Panel({ children, description, eyebrow, title }: { children: React.ReactNode; description: string; eyebrow: string; title: string }) {
  return (
    <div className="rounded-[2rem] border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.26em] text-on-surface-variant">{eyebrow}</p>
      <h3 className="mt-3 font-headline text-2xl font-black text-on-surface">{title}</h3>
      <p className="mt-2 text-sm text-on-surface-variant">{description}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function StatCard({ accent, icon, label, note, value }: { accent: string; icon: React.ReactNode; label: string; note: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-outline-variant/25 bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`rounded-2xl p-3 ${accent}`}>{icon}</div>
      </div>
      <p className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-on-surface-variant">{label}</p>
      <p className="mt-2 font-headline text-4xl font-black text-on-surface">{value}</p>
      <p className="mt-2 text-sm text-on-surface-variant">{note}</p>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/65">{label}</p>
      <p className="mt-2 font-headline text-2xl font-black">{value}</p>
    </div>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-medium text-on-surface">{label}</span>
      </div>
      <span className="font-black text-on-surface">{value}</span>
    </div>
  );
}

function ActivityRow({ badge, detail, title }: { badge: string; detail: string; title: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[1.25rem] bg-surface-container-low p-4">
      <div>
        <p className="font-semibold text-on-surface">{title}</p>
        <p className="mt-1 text-sm text-on-surface-variant">{detail}</p>
      </div>
      <span className="rounded-full bg-secondary-container/45 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-secondary">{badge}</span>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-col items-center justify-center gap-3 rounded-[1.25rem] bg-surface-container-low px-4 py-5 text-sm font-bold text-on-surface transition-transform hover:-translate-y-0.5 hover:bg-surface-container-high" type="button">
      <span className="rounded-2xl bg-white p-3 text-primary shadow-sm">{icon}</span>
      {label}
    </button>
  );
}
