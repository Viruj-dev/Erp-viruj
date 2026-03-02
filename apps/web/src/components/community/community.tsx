"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Megaphone,
  FileText,
  MapPin,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/store/app-context";

export function Community() {
  const { state } = useApp();
  const initials = state.userName.slice(0, 1).toUpperCase();

  const posts = [
    {
      id: 1,
      author: "Apollo Hospitals",
      type: "Announcement",
      icon: "📢",
      meta: "Hospital · 2 hours ago",
      title: "Free Health Checkup Camp",
      body: "Join us for a free comprehensive health checkup camp on Feb 15, 2026. Open to all — bring your family!",
      details: "📍 Apollo Main Campus · 🕐 9:00 AM – 5:00 PM",
      likes: 42,
      comments: 18,
      liked: false,
    },
    {
      id: 2,
      author: "Dr. Mehra",
      type: "Post",
      icon: "📝",
      meta: "Doctor · 5 hours ago",
      body: "5 Simple Tips to Keep Your Heart Healthy ❤️\n1. Walk at least 30 minutes daily 🚶\n2. Include fruits and vegetables in every meal 🥗",
      likes: 128,
      comments: 34,
      liked: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in">
      <div className="xl:col-span-8 space-y-6">
        {/* Stories Bar */}
        <div className="glass-card rounded-[2.5rem] p-6 overflow-hidden">
          <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-[#f1f5f9] uppercase tracking-widest">
                Your Story
              </span>
            </div>
            {[
              "City Hospital",
              "Dr. Mehra",
              "PathCare Lab",
              "WellCare",
              "DiagnoScan",
            ].map((name, i) => (
              <div
                key={i}
                className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-2xl p-1 bg-gradient-to-tr from-primary to-teal-400 group-hover:rotate-6 transition-transform">
                  <div className="w-full h-full bg-[var(--bg-dark)] rounded-xl flex items-center justify-center text-2xl">
                    {["🏥", "👨‍⚕️", "🔬", "🏪", "📡"][i]}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Create Post */}
        <div className="glass-card rounded-[2rem] p-6 flex gap-4 items-center group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 bg-white/5 border border-white/5 rounded-xl px-6 py-3 text-[#64748b] text-sm font-medium hover:bg-white/10 transition-all cursor-pointer">
            Share an update, announcement, or health tip...
          </div>
          <button className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95">
            POST
          </button>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          <AnimatePresence>
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-[2.5rem] p-8 space-y-6 group hover:border-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xl font-bold text-white italic">
                      {post.author.slice(0, 1)}
                    </div>
                    <div>
                      <div className="font-bold text-[#f1f5f9] group-hover:text-primary transition-colors">
                        {post.author}
                      </div>
                      <div className="text-xs text-[#64748b]">{post.meta}</div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      post.type === "Announcement"
                        ? "bg-amber-400/10 text-amber-400"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {post.icon} {post.type}
                  </span>
                </div>

                {post.type === "Announcement" ? (
                  <div className="bg-amber-400/5 border border-amber-400/10 rounded-3xl p-6 space-y-3">
                    <h4 className="text-lg font-bold text-white">
                      {post.title}
                    </h4>
                    <p className="text-sm text-[#94a3b8] leading-relaxed">
                      {post.body}
                    </p>
                    <div className="pt-2 text-xs font-bold text-teal-400 uppercase tracking-widest opacity-80">
                      {post.details}
                    </div>
                  </div>
                ) : (
                  <p className="text-[#f1f5f9] leading-relaxed whitespace-pre-wrap">
                    {post.body}
                  </p>
                )}

                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                  <button
                    className={cn(
                      "flex items-center gap-2 font-bold text-xs transition-colors",
                      post.liked
                        ? "text-rose-500"
                        : "text-[#64748b] hover:text-rose-500"
                    )}
                  >
                    <Heart
                      className={cn("w-5 h-5", post.liked && "fill-current")}
                    />{" "}
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-2 font-bold text-xs text-[#64748b] hover:text-primary transition-colors">
                    <MessageCircle className="w-5 h-5" /> {post.comments}
                  </button>
                  <button className="flex items-center gap-2 font-bold text-xs text-[#64748b] hover:text-white transition-colors ml-auto">
                    <Share2 className="w-5 h-5" /> SHARE
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="xl:col-span-4 space-y-8">
        <section className="glass-card rounded-[2.5rem] p-8 space-y-6">
          <h3 className="text-lg font-black text-white italic flex items-center gap-3">
            <span className="w-2 h-8 bg-primary rounded-full" />
            Trending Topics
          </h3>
          <div className="space-y-4">
            {[
              {
                tag: "#HealthCheckup2026",
                count: "2.4K discussions",
                color: "text-sky-400",
              },
              {
                tag: "#HeartHealth",
                count: "1.8K discussions",
                color: "text-rose-400",
              },
              {
                tag: "#DiabetesAwareness",
                count: "1.2K discussions",
                color: "text-emerald-400",
              },
              {
                tag: "#MentalWellness",
                count: "956 discussions",
                color: "text-violet-400",
              },
            ].map((topic, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
              >
                <span className="text-xl font-black text-[#1e293b] group-hover:text-primary transition-colors">
                  {i + 1}
                </span>
                <div>
                  <div className={cn("text-sm font-bold", topic.color)}>
                    {topic.tag}
                  </div>
                  <div className="text-[10px] text-[#64748b] uppercase tracking-widest font-bold">
                    {topic.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card rounded-[2.5rem] p-8 space-y-6">
          <h3 className="text-lg font-black text-white italic flex items-center gap-3">
            <span className="w-2 h-8 bg-teal-400 rounded-full" />
            Suggested Connections
          </h3>
          <div className="space-y-4">
            {[
              {
                name: "Max Healthcare",
                role: "Hospital · Delhi",
                color: "bg-sky-400/10 text-sky-400",
              },
              {
                name: "Dr. Anjali Rao",
                role: "Cardiologist · Mumbai",
                color: "bg-rose-400/10 text-rose-400",
              },
            ].map((conn, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-110 transition-transform",
                    conn.color
                  )}
                >
                  {conn.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:block flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#f1f5f9] truncate">
                    {conn.name}
                  </div>
                  <div className="text-[10px] text-[#64748b] font-bold truncate uppercase">
                    {conn.role}
                  </div>
                </div>
                <button className="px-3 py-1.5 border border-primary/30 text-primary text-[10px] font-black rounded-lg hover:bg-primary hover:text-white transition-all uppercase tracking-widest">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
