"use client";

import React from "react";
import { useApp } from "@/store/app-context";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Users,
  Activity,
  Microscope as MicroscopeIcon,
  RadioTower,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ManageServices() {
  const { state } = useApp();
  const type = state.providerType as string;

  const configs: Record<
    string,
    { title: string; sub: string; icon: React.ReactNode; btn: string }
  > = {
    hospital: {
      title: "Manage Doctors",
      sub: "Add, update, and track doctors",
      icon: <Stethoscope />,
      btn: "Add Doctor",
    },
    pathology: {
      title: "Manage Tests",
      sub: "Diagnostic tests and pricing",
      icon: <MicroscopeIcon />,
      btn: "Add Test",
    },
    radiology: {
      title: "Manage Imaging",
      sub: "Imaging services and pricing",
      icon: <RadioTower />,
      btn: "Add Service",
    },
    clinic: {
      title: "Manage Facilities",
      sub: "Services and facilities",
      icon: <Activity />,
      btn: "Add Service",
    },
    doctor: {
      title: "My Services",
      sub: "Consultation types and pricing",
      icon: <Stethoscope />,
      btn: "Add Service",
    },
  };

  const config = configs[type] || {
    title: "Manage Services",
    sub: "Manage your portfolio",
    icon: <Activity />,
    btn: "Add Item",
  };

  return (
    <div className="space-y-8 animate-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-card p-8 rounded-[2.5rem]">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl">
            {config.icon}
          </div>
          <div>
            <h3 className="text-2xl font-black text-white italic tracking-tight">
              {config.title}
            </h3>
            <p className="text-[#94a3b8] text-sm font-medium">{config.sub}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-[#f1f5f9] focus:outline-none focus:border-primary w-full md:w-48"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all whitespace-nowrap">
            <Plus className="w-4 h-4" />
            {config.btn.toUpperCase()}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-6 rounded-[2rem] group hover:border-primary/30 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-xl">
                  {type === "hospital" ? "👨‍⚕️" : "🔬"}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-primary/20 rounded-lg text-primary transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-danger/20 rounded-lg text-danger transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-[#f1f5f9] group-hover:text-primary transition-all underline decoration-transparent group-hover:decoration-primary/30">
                  {type === "hospital"
                    ? `Dr. Anita Verma`
                    : `Complete Blood Count`}
                </h4>
                <p className="text-xs text-[#64748b] mt-1 pr-4 line-clamp-2">
                  {type === "hospital"
                    ? "Cardiologist · MBBS, MD, DM"
                    : "Hematology · Blood Sample · 6 hrs TAT"}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
                    Pricing
                  </span>
                  <span className="text-sm font-black text-white">
                    ₹{type === "hospital" ? "1200" : "350"}
                  </span>
                </div>
                {type === "hospital" && (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
                      Appts
                    </span>
                    <span className="text-sm font-black text-emerald-400">
                      18/25
                    </span>
                  </div>
                )}
              </div>
            </div>

            <span className="mt-6 flex items-center justify-center gap-2 py-2.5 bg-emerald-400/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-400/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
