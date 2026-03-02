"use client";

import React from "react";
import { useApp } from "@/store/app-context";
import { motion } from "framer-motion";
import { Save, Upload, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Profile() {
  const { state } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in">
      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-white italic">
              Provider Details
            </h3>
            <p className="text-[#94a3b8] text-sm">
              Manage your professional information
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95">
            <Save className="w-4 h-4" />
            SAVE CHANGES
          </button>
        </div>

        <div className="p-8 space-y-12">
          {/* Basic Info */}
          <section className="space-y-6">
            <h4 className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
              <span className="w-6 h-px bg-primary/30"></span> Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748b] uppercase pl-1">
                  Organization / Provider Name
                </label>
                <input
                  type="text"
                  defaultValue={state.userName}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#f1f5f9] focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748b] uppercase pl-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  defaultValue={state.userEmail}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#f1f5f9] focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748b] uppercase pl-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#f1f5f9] focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748b] uppercase pl-1">
                  Registration / License No
                </label>
                <input
                  type="text"
                  placeholder="REG-XXXXX"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#f1f5f9] focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#64748b] uppercase pl-1">
                Address
              </label>
              <textarea
                placeholder="Full address with city, state, pincode"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#f1f5f9] focus:outline-none focus:border-primary transition-all h-24 resize-none"
              />
            </div>
          </section>

          {/* Logo Upload */}
          <section className="space-y-6">
            <h4 className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
              <span className="w-6 h-px bg-primary/30"></span> Logo / Identity
            </h4>
            <div className="w-full border-2 border-dashed border-white/10 rounded-3xl p-12 hover:border-primary/50 transition-all cursor-pointer group bg-primary/5">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-[#f1f5f9] font-bold">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-[#64748b] mt-1 uppercase tracking-widest">
                    PNG, JPG, WebP · Max 5MB
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Dynamic Provider Fields (Simplified for now) */}
          <section className="space-y-6">
            <h4 className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
              <span className="w-6 h-px bg-primary/30"></span>{" "}
              {state.providerType.toUpperCase()} DETAILS
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748b] uppercase pl-1">
                  Specialization / Type
                </label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#f1f5f9] focus:outline-none focus:border-primary appearance-none">
                  <option className="bg-[#1e293b]">Multi-Specialty</option>
                  <option className="bg-[#1e293b]">
                    Individual Practitioner
                  </option>
                  <option className="bg-[#1e293b]">Outpatient Care</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748b] uppercase pl-1">
                  Experience / Scale
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15 Years or 250 Beds"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#f1f5f9] focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-[#64748b] uppercase pl-1">
                Services Provided
              </label>
              <div className="flex flex-wrap gap-2 p-4 bg-white/5 border border-white/10 rounded-xl min-h-[100px]">
                {["Emergency", "ICU", "OPD", "Surgery", "Pharmacy"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20"
                    >
                      {tag}
                      <X className="w-3 h-3 cursor-pointer hover:text-white" />
                    </span>
                  )
                )}
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-dashed border-white/20">
                  <Plus className="w-3 h-3 text-[#64748b]" />
                  <input
                    type="text"
                    placeholder="Add..."
                    className="bg-transparent border-none outline-none text-xs w-20 text-[#f1f5f9]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#64748b] uppercase pl-1">
                About Organization
              </label>
              <textarea
                placeholder="Describe your achievements, accreditations, and core values..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#f1f5f9] focus:outline-none focus:border-primary transition-all h-32 resize-none"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
