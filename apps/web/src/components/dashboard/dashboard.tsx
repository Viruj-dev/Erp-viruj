"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Users,
  Diamond,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Today's Appointments",
    value: "24",
    icon: <Calendar className="w-6 h-6" />,
    trend: "↑ 12%",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  {
    label: "This Week Completed",
    value: "156",
    icon: <CheckCircle2 className="w-6 h-6" />,
    trend: "↑ 8%",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    label: "Community Reach",
    value: "1.2K",
    icon: <Users className="w-6 h-6" />,
    trend: "↑ 24%",
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
  },
  {
    label: "Current Subscription",
    value: "Pro Plan",
    icon: <Diamond className="w-6 h-6" />,
    trend: null,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
];

export function Dashboard() {
  return (
    <div className="space-y-8 animate-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-2xl group hover:border-white/20 transition-all cursor-default"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                  stat.bg,
                  stat.color
                )}
              >
                {stat.icon}
              </div>
              {stat.trend && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  {stat.trend}
                </span>
              )}
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {stat.value}
            </div>
            <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="glass-card rounded-[2rem] overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Appointments
            </h3>
            <button className="text-xs font-bold text-primary hover:underline">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-widest">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-widest">
                    Type
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-widest">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  {
                    name: "Rahul Sharma",
                    date: "Feb 11, 2026",
                    time: "10:00 AM",
                    type: "Consultation",
                    status: "Pending",
                    sColor: "text-amber-400 bg-amber-400/10",
                  },
                  {
                    name: "Priya Patel",
                    date: "Feb 11, 2026",
                    time: "11:30 AM",
                    type: "Follow-up",
                    status: "Confirmed",
                    sColor: "text-emerald-400 bg-emerald-400/10",
                  },
                  {
                    name: "Arun Kumar",
                    date: "Feb 11, 2026",
                    time: "02:00 PM",
                    type: "Lab Test",
                    status: "Scheduled",
                    sColor: "text-sky-400 bg-sky-400/10",
                  },
                ].map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#f1f5f9] group-hover:text-white">
                        {row.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#94a3b8]">{row.date}</div>
                      <div className="text-[10px] text-[#64748b]">
                        {row.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#94a3b8]">
                      {row.type}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          row.sColor
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-card rounded-[2rem] overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Recent Community Activity
            </h3>
            <button className="text-xs font-bold text-indigo-400 hover:underline">
              View All
            </button>
          </div>
          <div className="p-6 space-y-4">
            {[
              {
                title: "Free Health Checkup Camp",
                detail: "Your announcement got 245 views",
                icon: "📢",
                badge: "Live",
                bColor: "bg-emerald-400/20 text-emerald-400",
              },
              {
                title: "12 new comments on your post",
                detail: '"Tips for managing diabetes..."',
                icon: "💬",
                badge: "New",
                bColor: "bg-sky-400/20 text-sky-400",
              },
            ].map((activity, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#f1f5f9]">
                    {activity.title}
                  </div>
                  <div className="text-xs text-[#64748b]">
                    {activity.detail}
                  </div>
                </div>
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    activity.bColor
                  )}
                >
                  {activity.badge}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
