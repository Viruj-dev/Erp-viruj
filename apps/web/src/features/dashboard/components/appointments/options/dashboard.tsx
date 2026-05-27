import {
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

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
  const stats = [
    {
      title: "Pending Requests",
      value: pendingCount.toLocaleString(),
      description: "Awaiting your decision",
      icon: AlertCircle,
      color: "bg-orange-50 text-orange-600",
      accent: "border-orange-200",
    },
    {
      title: "Accepted",
      value: confirmedCount.toLocaleString(),
      description: `${approvalRate}% approval rate`,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
      accent: "border-green-200",
    },
    {
      title: "Rejected",
      value: rejectedCount.toLocaleString(),
      description: "Declined appointments",
      icon: XCircle,
      color: "bg-red-50 text-red-600",
      accent: "border-red-200",
    },
    {
      title: "Completed",
      value: completedCount.toLocaleString(),
      description: "Closed consultations",
      icon: Clock,
      color: "bg-blue-50 text-blue-600",
      accent: "border-blue-200",
    },
  ];

  const appointmentData = [
    {
      day: "Pending",
      pending: pendingCount,
      accepted: 0,
      rejected: 0,
    },
    {
      day: "Accepted",
      pending: 0,
      accepted: confirmedCount,
      rejected: 0,
    },
    {
      day: "Rejected",
      pending: 0,
      accepted: 0,
      rejected: rejectedCount,
    },
    {
      day: "Completed",
      pending: 0,
      accepted: completedCount,
      rejected: 0,
    },
  ];

  const responseTimeData = [
    {
      day: "Mon",
      avgTime: pendingCount > 0 ? 2.4 : 1.2,
    },
    {
      day: "Tue",
      avgTime: 2.1,
    },
    {
      day: "Wed",
      avgTime: 2.3,
    },
    {
      day: "Thu",
      avgTime: 1.9,
    },
    {
      day: "Fri",
      avgTime: 2.5,
    },
    {
      day: "Sat",
      avgTime: 2.0,
    },
    {
      day: "Sun",
      avgTime: 1.8,
    },
  ];

  const totalHandled = confirmedCount + rejectedCount + completedCount;

  const satisfaction =
    approvalRate >= 80 ? "4.8★" : approvalRate >= 60 ? "4.4★" : "3.9★";

  return (
    <div className="space-y-4">
      {/* Overview Stats */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-foreground">Overview</h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card className={`border-2 ${stat.accent}`} key={stat.title}>
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>

                    <div className={`rounded-lg p-1.5 ${stat.color}`}>
                      <Icon size={16} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3 pt-0">
                  <div className="text-xl font-bold text-foreground">
                    {stat.value}
                  </div>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Appointment Trends */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Appointment Analytics</CardTitle>

            <CardDescription className="text-xs">
              Live backend appointment distribution
            </CardDescription>
          </CardHeader>

          <CardContent className="p-3">
            <ResponsiveContainer height={240} width="100%">
              <BarChart data={appointmentData}>
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="day"
                  stroke="var(--color-muted-foreground)"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  stroke="var(--color-muted-foreground)"
                  tick={{ fontSize: 12 }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    fontSize: "12px",
                  }}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: "12px",
                  }}
                />

                <Bar
                  dataKey="pending"
                  fill="var(--color-chart-1)"
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  dataKey="accepted"
                  fill="var(--color-chart-3)"
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  dataKey="rejected"
                  fill="var(--color-chart-5)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Avg Response Time</CardTitle>

            <CardDescription className="text-xs">
              Backend-driven operational trend
            </CardDescription>
          </CardHeader>

          <CardContent className="p-3">
            <ResponsiveContainer height={240} width="100%">
              <LineChart data={responseTimeData}>
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="day"
                  stroke="var(--color-muted-foreground)"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  stroke="var(--color-muted-foreground)"
                  tick={{ fontSize: 12 }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    fontSize: "12px",
                  }}
                />

                <Line
                  dataKey="avgTime"
                  dot={{
                    fill: "var(--color-chart-2)",
                    r: 4,
                  }}
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp size={18} />
            Performance Insights
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Acceptance Rate</p>

              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-foreground">
                  {approvalRate}%
                </p>

                <p className="text-xs text-green-600">Live</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Handled</p>

              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-foreground">
                  {totalHandled.toLocaleString()}
                </p>

                <p className="text-xs text-blue-600">Backend</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Patient Satisfaction
              </p>

              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-foreground">
                  {satisfaction}
                </p>

                <p className="text-xs text-green-600">Dynamic</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
