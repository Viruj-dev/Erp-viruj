import { CalendarDays, Check, Clock, Stethoscope, TrendingUp, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AppointmentRecord } from "../types";

export function AppointmentDashboard({
  approvalRate,
  appointments,
  completedCount,
  confirmedCount,
  pendingCount,
  rejectedCount,
}: {
  approvalRate: number;
  appointments: AppointmentRecord[];
  completedCount: number;
  confirmedCount: number;
  pendingCount: number;
  rejectedCount: number;
}) {
  const total = appointments.length || 1;
  const departmentVolume = Object.entries(
    appointments.reduce<Record<string, number>>((acc, appointment) => {
      const department = appointment.departmentName || "General";
      acc[department] = (acc[department] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const trend = [
    confirmedCount,
    pendingCount,
    completedCount,
    rejectedCount,
    Math.max(appointments.length - confirmedCount - pendingCount, 0),
  ];
  const maxTrend = Math.max(...trend, 1);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={CalendarDays}
          label="Total Requests"
          subtext="Live backend records"
          value={appointments.length.toLocaleString()}
        />
        <KpiCard
          icon={Clock}
          label="Pending Review"
          subtext="Need handler decision"
          tone="warning"
          value={pendingCount.toLocaleString()}
        />
        <KpiCard
          icon={Check}
          label="Confirmed"
          subtext={`${approvalRate}% approval rate`}
          tone="success"
          value={confirmedCount.toLocaleString()}
        />
        <KpiCard
          icon={X}
          label="Rejected"
          subtext="Declined or unsafe slots"
          tone="danger"
          value={rejectedCount.toLocaleString()}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                Appointment Analytics
              </p>
              <h2 className="font-headline text-xl font-black text-on-surface">
                Request movement by outcome
              </h2>
            </div>
            <TrendingUp className="text-primary" size={22} />
          </div>
          <div className="mt-8 flex h-64 items-end gap-4 rounded-2xl bg-surface-container-low p-5">
            {trend.map((value, index) => (
              <div className="flex flex-1 flex-col items-center gap-3" key={index}>
                <div
                  className="w-full rounded-t-xl bg-primary shadow-[0_12px_30px_rgba(0,71,141,0.22)]"
                  style={{
                    height: `${Math.max((value / maxTrend) * 100, 8)}%`,
                    opacity: 0.55 + index * 0.08,
                  }}
                />
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-on-surface-variant">
                  {["Ok", "Review", "Done", "Reject", "Other"][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
            Department Load
          </p>
          <h2 className="font-headline text-xl font-black text-on-surface">
            Booking pressure
          </h2>
          <div className="mt-6 space-y-5">
            {departmentVolume.length ? (
              departmentVolume.map(([department, value]) => (
                <div key={department}>
                  <div className="mb-2 flex items-center justify-between text-xs font-black">
                    <span>{department}</span>
                    <span className="text-on-surface-variant">{value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-high">
                    <div
                      className="h-2 rounded-full bg-secondary"
                      style={{ width: `${Math.max((value / total) * 100, 8)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm font-bold text-on-surface-variant">
                No department volume yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <InsightCard title="Queue SLA" value={`${pendingCount} awaiting action`} />
        <InsightCard title="Completion Flow" value={`${completedCount} visits closed`} />
        <InsightCard title="Handler Focus" value="Review pending requests first" />
      </section>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  subtext,
  tone = "default",
  value,
}: {
  icon: LucideIcon;
  label: string;
  subtext: string;
  tone?: "default" | "success" | "warning" | "danger";
  value: string;
}) {
  const toneClass =
    tone === "success"
      ? "bg-secondary/10 text-secondary"
      : tone === "warning"
        ? "bg-primary/10 text-primary"
        : tone === "danger"
          ? "bg-error-container/50 text-error"
          : "bg-surface-container-high text-primary";

  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon size={18} />
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
          Live
        </span>
      </div>
      <p className="mt-5 text-[11px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 font-headline text-4xl font-black text-on-surface">
        {value}
      </p>
      <p className="mt-1 text-sm font-semibold text-on-surface-variant">
        {subtext}
      </p>
    </div>
  );
}

function InsightCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
      <Stethoscope className="text-primary" size={20} />
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
        {title}
      </p>
      <p className="mt-1 text-lg font-black text-on-surface">{value}</p>
    </div>
  );
}
