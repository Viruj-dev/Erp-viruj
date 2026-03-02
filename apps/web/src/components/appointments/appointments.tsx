"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  MoreHorizontal,
  Check,
  X,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "today" | "upcoming" | "past";

export function Appointments() {
  const [activeTab, setActiveTab] = useState<Tab>("today");

  const data = {
    today: [
      {
        id: 1,
        patient: "Rahul Sharma",
        detail: "Consultation · Cardiology",
        time: "10:00 AM",
        date: "Today",
        status: "Pending",
        sColor: "amber",
      },
      {
        id: 2,
        patient: "Priya Patel",
        detail: "Follow-up · General Medicine",
        time: "11:30 AM",
        date: "Today",
        status: "Confirmed",
        sColor: "emerald",
      },
      {
        id: 3,
        patient: "Arun Kumar",
        detail: "Lab Test · Blood Panel",
        time: "02:00 PM",
        date: "Today",
        status: "Scheduled",
        sColor: "sky",
      },
    ],
    upcoming: [
      {
        id: 4,
        patient: "Neha Kapoor",
        detail: "Consultation · ENT",
        time: "09:00 AM",
        date: "Feb 12, 2026",
        status: "Scheduled",
        sColor: "sky",
      },
      {
        id: 5,
        patient: "Raj Malhotra",
        detail: "Follow-up · Orthopedics",
        time: "11:00 AM",
        date: "Feb 13, 2026",
        status: "Pending",
        sColor: "amber",
      },
    ],
    past: [
      {
        id: 6,
        patient: "Kavita Singh",
        detail: "Consultation · Gynecology",
        time: "10:00 AM",
        date: "Feb 9, 2026",
        status: "Completed",
        sColor: "emerald",
      },
      {
        id: 7,
        patient: "Amit Saxena",
        detail: "Imaging · MRI Brain",
        time: "03:00 PM",
        date: "Feb 8, 2026",
        status: "Cancelled",
        sColor: "rose",
      },
    ],
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "upcoming", label: "Upcoming" },
    { id: "past", label: "Past" },
  ];

  return (
    <div className="space-y-6 animate-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Today",
            value: "24",
            icon: <CalendarIcon className="w-5 h-5" />,
            color: "text-sky-400 bg-sky-400/10",
          },
          {
            label: "Pending",
            value: "8",
            icon: <Clock className="w-5 h-5" />,
            color: "text-amber-400 bg-amber-400/10",
          },
          {
            label: "Confirmed",
            value: "16",
            icon: <Check className="w-5 h-5" />,
            color: "text-emerald-400 bg-emerald-400/10",
          },
          {
            label: "Cancelled",
            value: "2",
            icon: <X className="w-5 h-5" />,
            color: "text-rose-400 bg-rose-400/10",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-card p-4 h-28 rounded-2xl flex flex-col justify-between"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                stat.color
              )}
            >
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-black text-f1f5f9">
                {stat.value}
              </div>
              <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-white/5 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300",
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-[#64748b] hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-[#f1f5f9] focus:outline-none focus:border-primary">
            <option>All Types</option>
            <option>Consultation</option>
            <option>Follow-up</option>
            <option>Lab Test</option>
          </select>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              {data[activeTab].map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/[0.07] transition-all group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                      {item.patient
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#f1f5f9] truncate group-hover:text-primary transition-colors">
                        {item.patient}
                      </h4>
                      <p className="text-xs text-[#64748b]">{item.detail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 md:px-8 border-l border-white/5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#f1f5f9]">
                        {item.time}
                      </span>
                      <span className="text-[10px] text-[#64748b]">
                        {item.date}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        item.sColor === "amber" &&
                          "bg-amber-400/10 text-amber-400",
                        item.sColor === "emerald" &&
                          "bg-emerald-400/10 text-emerald-400",
                        item.sColor === "sky" && "bg-sky-400/10 text-sky-400",
                        item.sColor === "rose" && "bg-rose-400/10 text-rose-400"
                      )}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pl-4 border-l border-white/5">
                    {item.status === "Pending" ? (
                      <>
                        <button className="h-9 px-4 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                          <Check className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button className="h-9 px-4 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    ) : (
                      <button className="h-9 flex items-center gap-2 px-4 bg-white/5 text-[#94a3b8] hover:text-white rounded-lg text-xs font-bold transition-all">
                        <FileText className="w-3.5 h-3.5" /> Details
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
