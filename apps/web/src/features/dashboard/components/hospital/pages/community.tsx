"use client";

import { DashboardPageShell } from "@/features/dashboard/components/shared/dashboard-page-shell";
import { virujBackend } from "@/lib/viruj-backend";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  FileQuestion,
  HeartPulse,
  ImageIcon,
  Link,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Send,
  Share2,
  ShieldCheck,
  ThumbsUp,
} from "lucide-react";
import { useMemo, useState } from "react";

type CommunityTab = "global" | "announcements" | "qa" | "resources";

type CommunityPost = {
  id: string;
  author: {
    avatar: string;
    name: string;
    role: string;
    verified: boolean;
  };
  category: CommunityTab;
  comments: number;
  content: string;
  image?: string;
  likes: number;
  postedAt: string;
};

type CommunityQuestion = {
  answer: {
    author: string;
    content: string;
    role: string;
  };
  askedBy: string;
  id: string;
  question: string;
  reference: string;
};

type CommunityContributor = {
  avatar: string;
  name: string;
  role: string;
};

type CommunityTrend = {
  label: string;
  meta: string;
  type: string;
};

type CommunityFeed = {
  announcement: {
    body: string;
    cta: string;
    title: string;
  };
  contributors: CommunityContributor[];
  metrics: {
    engagementLabel: string;
    newPosts: number;
    unansweredQa: number;
  };
  posts: CommunityPost[];
  question: CommunityQuestion;
  trends: CommunityTrend[];
};

const communityFeed: CommunityFeed = {
  announcement: {
    body: "Phase 3 of the pediatric wellness initiative starts Monday. Ensure all patient records for the 5-12 age group are reconciled by Friday evening.",
    cta: "Review Guidelines",
    title: "National Vaccination Drive Update - Spring 2024",
  },
  contributors: [
    {
      avatar:
        "https://images.unsplash.com/photo-1559839734-2b71f1536780?w=100&h=100&fit=crop",
      name: "Dr. Aria Verma",
      role: "Radiology Lead",
    },
    {
      avatar:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop",
      name: "James Miller, MD",
      role: "Critical Care",
    },
    {
      avatar:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop",
      name: "Dr. Elena Rocha",
      role: "Pediatrics",
    },
  ],
  metrics: {
    engagementLabel: "Last 24 hours activity",
    newPosts: 24,
    unansweredQa: 8,
  },
  posts: [
    {
      id: "COMM-001",
      author: {
        avatar:
          "https://images.unsplash.com/photo-1559839734-2b71f1536780?w=100&h=100&fit=crop",
        name: "Dr. Sarah Thompson",
        role: "Cardiology Specialist",
        verified: true,
      },
      category: "global",
      comments: 12,
      content:
        "Latest findings in hypertension management show a significant correlation between wearable HRV data and preventative outcomes. We have updated the Hypertension Protocol in the resource center.",
      image:
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=560&fit=crop",
      likes: 42,
      postedAt: "2h ago",
    },
    {
      id: "COMM-002",
      author: {
        avatar:
          "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop",
        name: "Care Coordination Desk",
        role: "Public Announcements",
        verified: true,
      },
      category: "announcements",
      comments: 6,
      content:
        "Radiology slots have been extended until 8 PM for this week. Appointment handlers can begin assigning overflow cases to the evening roster.",
      likes: 31,
      postedAt: "4h ago",
    },
  ],
  question: {
    answer: {
      author: "Dr. Michael Chen",
      content:
        "Great question. For this specific trial, we recommend avoiding grapefruit juice as it can interfere with metabolism of the active agent. Detailed list sent to your patient portal.",
      role: "Principal Investigator",
    },
    askedBy: "Patient #A920",
    id: "QA-204",
    question:
      "Are there specific dietary restrictions for the new trial medication?",
    reference:
      "I started the Phase II study yesterday. Should I be avoiding any specific foods like grapefruit or high-iron vegetables?",
  },
  trends: [
    {
      label: "Post-Op Recovery AI",
      meta: "12 posts + 4 announcements",
      type: "Clinical Protocol",
    },
    {
      label: "2024 Insurance Compliance",
      meta: "3 posts + 2 active Q&As",
      type: "Policy Update",
    },
    {
      label: "Precision Oncology 2.0",
      meta: "18 posts + Trending globally",
      type: "New Research",
    },
  ],
};

const tabs: Array<{ id: CommunityTab; label: string }> = [
  { id: "global", label: "Global Feed" },
  { id: "announcements", label: "Public Announcements" },
  { id: "qa", label: "Patient Q&A" },
  { id: "resources", label: "Resources" },
];

export function ErpDemoCommunity() {
  const [activeTab, setActiveTab] = useState<CommunityTab>("global");
  const [composerText, setComposerText] = useState("");
  const communityStatusQuery = useQuery({
    queryFn: () => virujBackend.modules.summary("community"),
    queryKey: virujBackend.modules.key("community"),
  });
  const visiblePosts = useMemo(
    () =>
      activeTab === "global"
        ? communityFeed.posts
        : communityFeed.posts.filter((post) => post.category === activeTab),
    [activeTab]
  );

  return (
    <DashboardPageShell
      eyebrow="Community"
      subtitle="Coordinate announcements, clinical discussions, patient Q&A, and shared resources."
      title="Community Hub"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <main className="space-y-6">
        <section className="relative overflow-hidden rounded-xl bg-[#003463] p-7 text-white shadow-sm">
          <div className="absolute right-8 top-10 h-36 w-36 rounded-full border-[28px] border-white/5" />
          <div className="absolute bottom-8 right-16 text-white/8">
            <HeartPulse size={112} strokeWidth={1.6} />
          </div>
          <p className="flex items-center gap-2 text-[10px] font-semi-bold uppercase tracking-[0.22em] text-white/55">
            <BadgeCheck size={13} />
            New Announcement
          </p>
          <h1 className="mt-5 max-w-2xl font-headline text-4xl font-semi-bold leading-tight">
            {communityFeed.announcement.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-white/70">
            {communityFeed.announcement.body}
          </p>
          <button
            className="mt-6 rounded-lg bg-white px-5 py-3 text-xs font-semi-bold text-primary shadow-sm transition hover:bg-primary-fixed"
            type="button"
          >
            {communityFeed.announcement.cta}
          </button>
        </section>

        <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-sm">
          <div className="flex gap-3">
            <Avatar
              alt="Current contributor"
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop"
            />
            <div className="min-w-0 flex-1">
              <textarea
                className="h-12 w-full resize-none rounded-lg border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none transition focus:border-primary"
                onChange={(event) => setComposerText(event.target.value)}
                placeholder="Share a clinical update or clinical insight..."
                value={composerText}
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <IconButton icon={<ImageIcon size={16} />} label="Image" />
                  <IconButton icon={<Paperclip size={16} />} label="Attach" />
                  <IconButton icon={<Link size={16} />} label="Reference" />
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-semi-bold text-white shadow-sm disabled:opacity-50"
                  disabled={!composerText.trim()}
                  type="button"
                >
                  <Send size={14} />
                  Post
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap gap-4 border-b border-outline-variant/20">
          {tabs.map((tab) => (
            <button
              className={`border-b-2 px-1 pb-3 text-xs font-semi-bold transition ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-primary"
              }`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </section>

        <section className="space-y-5">
          {visiblePosts.length === 0 && activeTab !== "qa" ? (
            <EmptyState text="No posts in this channel yet." />
          ) : null}

          {visiblePosts.map((post) => (
            <CommunityPostCard key={post.id} post={post} />
          ))}

          {(activeTab === "global" || activeTab === "qa") && (
            <QuestionCard question={communityFeed.question} />
          )}
        </section>
      </main>

      <aside className="space-y-6">
        <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
          <h2 className="font-headline text-lg font-semi-bold text-on-surface">
            Engagement Overview
          </h2>
          <p className="mt-1 text-xs font-semibold text-on-surface-variant">
            {communityFeed.metrics.engagementLabel}
          </p>
          <MetricBar
            label="New Posts"
            value={communityFeed.metrics.newPosts}
            width="88%"
          />
          <MetricBar
            label="Unanswered Q&A"
            value={communityFeed.metrics.unansweredQa}
            width="52%"
          />
          <button
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-surface-container-low px-4 py-3 text-xs font-semi-bold text-primary transition hover:bg-primary/10"
            type="button"
          >
            <BarChart3 size={14} />
            View Analytics Report
          </button>
          {communityStatusQuery.data ? (
            <p className="mt-3 text-[11px] font-bold text-secondary">
              Backend module ready for{" "}
              {communityStatusQuery.data.organizationType || "organization"}.
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-headline text-lg font-semi-bold text-on-surface">
            <ShieldCheck className="text-secondary" size={18} />
            Verified Contributors
          </h2>
          <div className="mt-4 space-y-4">
            {communityFeed.contributors.map((contributor) => (
              <div
                className="flex items-center justify-between gap-3"
                key={contributor.name}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar alt={contributor.name} src={contributor.avatar} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semi-bold text-on-surface">
                      {contributor.name}
                    </p>
                    <p className="truncate text-xs font-medium text-on-surface-variant">
                      {contributor.role}
                    </p>
                  </div>
                </div>
                <button
                  className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-semi-bold text-primary"
                  type="button"
                >
                  Profile
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
          <h2 className="font-headline text-lg font-semi-bold text-on-surface">
            Trending in Health
          </h2>
          <div className="mt-4 space-y-4">
            {communityFeed.trends.map((trend) => (
              <div key={trend.label}>
                <p className="text-[10px] font-semi-bold uppercase tracking-[0.18em] text-primary">
                  {trend.type}
                </p>
                <p className="mt-1 text-sm font-semi-bold text-on-surface">
                  {trend.label}
                </p>
                <p className="mt-1 text-xs font-medium text-on-surface-variant">
                  {trend.meta}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl bg-[#006a5e] p-5 text-white shadow-sm">
          <Award size={24} />
          <h2 className="mt-4 font-headline text-lg font-semi-bold">
            Get Verified
          </h2>
          <p className="mt-2 text-sm font-medium leading-6 text-white/72">
            Become a trusted voice. Verified badges help patients identify
            authorized healthcare providers.
          </p>
          <button
            className="mt-5 w-full rounded-lg bg-white/75 px-4 py-3 text-xs font-semi-bold text-[#004c45] transition hover:bg-white"
            type="button"
          >
            Submit Credentials
          </button>
        </section>
      </aside>
    </div>
    </DashboardPageShell>
  );
}

function CommunityPostCard({ post }: { post: CommunityPost }) {
  return (
    <article className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar alt={post.author.name} src={post.author.avatar} />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="truncate text-sm font-semi-bold text-on-surface">
                {post.author.name}
              </p>
              {post.author.verified ? (
                <CheckCircle2 className="shrink-0 text-primary" size={14} />
              ) : null}
            </div>
            <p className="truncate text-xs font-medium text-on-surface-variant">
              {post.author.role} | {post.postedAt}
            </p>
          </div>
        </div>
        <IconButton icon={<MoreHorizontal size={16} />} label="More" />
      </div>

      <p className="mt-5 text-sm font-medium leading-7 text-on-surface">
        {post.content}
      </p>

      {post.image ? (
        <img
          alt=""
          className="mt-5 aspect-[16/7] w-full rounded-lg object-cover"
          src={post.image}
        />
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-outline-variant/15 pt-4">
        <ActionText icon={<ThumbsUp size={15} />} text={`${post.likes}`} />
        <ActionText
          icon={<MessageSquare size={15} />}
          text={`${post.comments}`}
        />
        <ActionText icon={<Share2 size={15} />} text="Share" />
      </div>
    </article>
  );
}

function QuestionCard({ question }: { question: CommunityQuestion }) {
  return (
    <article className="rounded-xl border border-secondary/35 bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-secondary/10 px-2 py-1 text-[10px] font-semi-bold uppercase tracking-[0.16em] text-secondary">
          Patient Q&A
        </span>
        <span className="text-xs font-semi-bold text-on-surface-variant">
          Question from {question.askedBy}
        </span>
      </div>
      <h3 className="mt-4 font-headline text-xl font-semi-bold text-on-surface">
        {question.question}
      </h3>
      <p className="mt-2 text-sm font-medium leading-6 text-on-surface-variant">
        {question.reference}
      </p>
      <div className="mt-5 rounded-lg bg-surface-container-low p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileQuestion size={16} />
          </div>
          <div>
            <p className="text-sm font-semi-bold text-on-surface">
              {question.answer.author}
            </p>
            <p className="text-xs font-medium text-on-surface-variant">
              {question.answer.role}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm font-medium italic leading-6 text-on-surface-variant">
          {question.answer.content}
        </p>
      </div>
    </article>
  );
}

function MetricBar({
  label,
  value,
  width,
}: {
  label: string;
  value: number;
  width: string;
}) {
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between text-xs font-semi-bold">
        <span className="text-on-surface">{label}</span>
        <span className="text-primary">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container-high">
        <div className="h-full rounded-full bg-primary" style={{ width }} />
      </div>
    </div>
  );
}

function Avatar({ alt, src }: { alt: string; src: string }) {
  return (
    <img
      alt={alt}
      className="h-10 w-10 shrink-0 rounded-full object-cover"
      src={src}
    />
  );
}

function IconButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      aria-label={label}
      className="rounded-lg p-2 text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
      type="button"
    >
      {icon}
    </button>
  );
}

function ActionText({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <button
      className="inline-flex items-center gap-2 text-xs font-semi-bold text-on-surface-variant transition hover:text-primary"
      type="button"
    >
      {icon}
      {text}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-outline-variant/30 bg-surface-container-lowest p-6 text-sm font-bold text-on-surface-variant">
      {text}
    </div>
  );
}


 
