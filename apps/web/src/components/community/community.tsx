"use client";

import { cn } from "@/lib/utils";
import { useApp } from "@/store/app-context";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgePlus,
  CalendarRange,
  Flame,
  Heart,
  Megaphone,
  MessageCircle,
  Plus,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const stories = ["Apollo", "Cardio Care", "Pathlab", "Wellness", "Scan Hub"];

const posts = [
  {
    id: 1,
    author: "Viruj Health",
    meta: "Campaign | 2 hours ago",
    title: "Free preventive screening week announced for working professionals",
    body: "Registrations crossed 340 in the first half of the day. Front desk teams should prepare a dedicated express lane for pre-booked attendees.",
    metrics: { likes: 84, comments: 21, shares: 13 },
    tone: "bg-cyan-400/12 text-cyan-200 border-cyan-400/20",
    label: "Announcement",
  },
  {
    id: 2,
    author: "Dr. Meera Sethi",
    meta: "Clinical tip | 5 hours ago",
    title: "Three quick ways to reduce no-shows in follow-up cardiac care",
    body: "Patients responded best when reminders were tied to symptom check-ins, not generic SMS templates. Combining reminders with a visible reschedule link reduced no-shows in our clinic cohort.",
    metrics: { likes: 128, comments: 34, shares: 18 },
    tone: "bg-emerald-400/12 text-emerald-200 border-emerald-400/20",
    label: "Knowledge share",
  },
];

const trends = [
  { tag: "#healthcamp2026", count: "2.4k discussions" },
  { tag: "#hearthealth", count: "1.8k discussions" },
  { tag: "#preventivescreening", count: "1.2k discussions" },
  { tag: "#teleconsult", count: "956 discussions" },
];

export function Community() {
  const { state } = useApp();
  const initials = state.userName.slice(0, 2).toUpperCase() || "VH";

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] animate-in">
      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="surface-panel relative overflow-hidden rounded-[2rem] bg-[linear-gradient(140deg,rgba(88,28,135,0.52),rgba(15,23,42,0.9)_44%,rgba(190,24,93,0.32))] p-6 md:p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),_transparent_28%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-violet-200">
                <Sparkles className="h-3.5 w-3.5" />
                Community room
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
                Turn announcements, expertise, and outreach into visible
                provider growth.
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
                This space combines campaigns, clinical knowledge sharing, and
                partner visibility so your organization feels active, trusted,
                and discoverable.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:w-[420px]">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Reach today
                </p>
                <p className="mt-2 text-3xl font-black text-white">5.2k</p>
                <p className="text-xs text-slate-400">
                  Across posts and stories
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  New followers
                </p>
                <p className="mt-2 text-3xl font-black text-white">+84</p>
                <p className="text-xs text-slate-400">
                  Since yesterday morning
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Campaign CTR
                </p>
                <p className="mt-2 flex items-center gap-2 text-3xl font-black text-white">
                  14%
                  <TrendingUp className="h-5 w-5 text-emerald-300" />
                </p>
                <p className="text-xs text-slate-400">Strong local response</p>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="surface-panel rounded-[2rem] bg-[linear-gradient(180deg,rgba(59,7,100,0.26),rgba(15,23,42,0.72))] p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">
                Stories and updates
              </h2>
              <p className="text-sm text-slate-400">
                Quick-touch visibility items from your network
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-300 transition hover:bg-white/[0.08]">
              <Plus className="h-3.5 w-3.5" />
              Add story
            </button>
          </div>
          <div className="mt-5 flex gap-4 overflow-x-auto pb-1">
            <div className="flex min-w-[88px] flex-col items-center gap-2">
              <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.25rem] border border-dashed border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Your story
              </span>
            </div>
            {stories.map((story, index) => (
              <div
                key={story}
                className="flex min-w-[88px] flex-col items-center gap-2"
              >
                <div className="rounded-[1.35rem] bg-gradient-to-br from-cyan-400 to-violet-400 p-[2px]">
                  <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.25rem] bg-slate-950/95 text-sm font-black text-white">
                    {index + 1}
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {story}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-panel rounded-[2rem] bg-[linear-gradient(180deg,rgba(91,33,182,0.16),rgba(15,23,42,0.72))] p-5 md:p-6">
          <div className="flex items-center gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-black text-white">
              {initials}
            </div>
            <div className="flex-1 rounded-[1.25rem] border border-white/8 bg-slate-950/35 px-4 py-3 text-sm text-slate-400">
              Share an announcement, care tip, or local campaign update
            </div>
            <button className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400">
              Post
            </button>
          </div>
        </section>

        <div className="space-y-4">
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="surface-panel rounded-[2rem] bg-[linear-gradient(180deg,rgba(30,27,75,0.68),rgba(15,23,42,0.62))] p-5 md:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white">
                      {post.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {post.author} | {post.meta}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                      post.tone
                    )}
                  >
                    {post.label}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {post.body}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button className="inline-flex items-center gap-2 rounded-full bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08]">
                    <Heart className="h-4 w-4 text-rose-300" />
                    {post.metrics.likes}
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-full bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08]">
                    <MessageCircle className="h-4 w-4 text-cyan-300" />
                    {post.metrics.comments}
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-full bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08]">
                    <Share2 className="h-4 w-4 text-emerald-300" />
                    {post.metrics.shares}
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-6">
        <section className="surface-panel rounded-[2rem] bg-[linear-gradient(180deg,rgba(30,27,75,0.72),rgba(15,23,42,0.64))] p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Trending topics</h2>
              <p className="text-sm text-slate-400">
                Where the current attention is
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] p-3">
              <Flame className="h-5 w-5 text-amber-300" />
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {trends.map((trend, index) => (
              <div
                key={trend.tag}
                className="flex items-center gap-4 rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                <div className="text-2xl font-black text-slate-600">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{trend.tag}</p>
                  <p className="text-xs text-slate-400">{trend.count}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-panel rounded-[2rem] bg-[linear-gradient(180deg,rgba(76,29,149,0.22),rgba(15,23,42,0.68))] p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">
                Suggested partners
              </h2>
              <p className="text-sm text-slate-400">
                Accounts aligned with your provider type
              </p>
            </div>
            <Users className="h-5 w-5 text-violet-300" />
          </div>
          <div className="mt-5 space-y-3">
            {["Max Healthcare", "Dr. Anjali Rao", "CarePath Diagnostics"].map(
              (partner) => (
                <div
                  key={partner}
                  className="flex items-center justify-between rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-400/12 text-sm font-black text-violet-200">
                      {partner.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{partner}</p>
                      <p className="text-xs text-slate-400">
                        Recommended connection
                      </p>
                    </div>
                  </div>
                  <button className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200 transition hover:bg-cyan-400/15">
                    Follow
                  </button>
                </div>
              )
            )}
          </div>
        </section>

        <section className="surface-panel rounded-[2rem] bg-[linear-gradient(180deg,rgba(67,56,202,0.18),rgba(15,23,42,0.68))] p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Quick actions</h2>
              <p className="text-sm text-slate-400">
                High-frequency community moves
              </p>
            </div>
            <BadgePlus className="h-5 w-5 text-emerald-300" />
          </div>
          <div className="mt-5 space-y-3">
            {[
              { label: "Publish health camp", icon: Megaphone },
              { label: "Launch awareness series", icon: CalendarRange },
              { label: "Create doctor spotlight", icon: Users },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className="flex w-full items-center justify-between rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-left transition hover:bg-white/[0.07]"
                >
                  <span className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                    <Icon className="h-4 w-4 text-cyan-300" />
                    {action.label}
                  </span>
                  <Plus className="h-4 w-4 text-slate-500" />
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
