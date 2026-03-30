"use client";

import {
  Award,
  Bookmark,
  CheckCircle2,
  FileText,
  Globe,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Share2,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";

const posts = [
  {
    id: "P-001",
    author: "Dr. Sarah Mitchell",
    role: "Senior Cardiologist",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71f1536780?w=100&h=100&fit=crop",
    time: "2 hours ago",
    title: "New protocol for post-op cardiac care",
    content:
      "We have fully rolled out the HeartSync protocol. Early indicators show a 12% reduction in average recovery time.",
    tags: ["Cardiology", "Protocol", "Research"],
    likes: 42,
    comments: 12,
    verified: true,
    bookmarked: true,
  },
  {
    id: "P-002",
    author: "Dr. James Wilson",
    role: "Neurologist",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop",
    time: "5 hours ago",
    title: "AI in early epilepsy detection",
    content:
      "Our EEG analysis study is now live and we are looking for collaborators for a broader validation round.",
    tags: ["Neurology", "AI", "Collaboration"],
    likes: 28,
    comments: 8,
    verified: true,
    bookmarked: false,
  },
];

const topics = [
  { name: "#Telehealth2024", posts: 1240 },
  { name: "#PrecisionMedicine", posts: 850 },
  { name: "#ClinicalAI", posts: 620 },
  { name: "#MentalHealthAwareness", posts: 450 },
];

export function ErpDemoCommunity() {
  return (
    <div className="grid gap-6 p-6 lg:grid-cols-12 lg:p-8">
      <aside className="space-y-6 lg:col-span-3">
        <div className="rounded-[1.8rem] border border-outline-variant/20 bg-surface-container-low p-4">
          <div className="space-y-1">
            {[
              ["Feed", <Globe key="feed" size={18} />],
              ["Knowledge Base", <FileText key="kb" size={18} />],
              ["Groups", <Users key="groups" size={18} />],
              ["Saved", <Bookmark key="saved" size={18} />],
            ].map(([label, icon], index) => (
              <button
                key={label}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-black transition-colors ${
                  index === 0
                    ? "bg-primary text-white shadow-md"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
                type="button"
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-outline-variant/20 bg-surface-container-low p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-on-surface-variant">
            Trending topics
          </p>
          <div className="mt-5 space-y-4">
            {topics.map((topic) => (
              <div key={topic.name} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-on-surface">{topic.name}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{topic.posts} posts</p>
                </div>
                <TrendingUp className="text-outline" size={16} />
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="space-y-6 lg:col-span-6">
        <div className="rounded-[1.8rem] border border-outline-variant/20 bg-surface-container-low p-5">
          <div className="flex gap-4">
            <img
              alt="Current user"
              className="h-10 w-10 rounded-xl object-cover"
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop"
            />
            <div className="flex-1 space-y-3">
              <textarea
                className="w-full resize-none rounded-xl border border-outline-variant/12 bg-surface-container-lowest p-3 text-sm focus:ring-2 focus:ring-primary/20"
                placeholder="Share a clinical insight or update..."
                rows={2}
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <IconButton icon={<FileText size={18} />} />
                  <IconButton icon={<Globe size={18} />} />
                  <IconButton icon={<Lock size={18} />} />
                </div>
                <button className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-sm font-black text-white shadow-md" type="button">
                  <Plus size={16} />
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="rounded-[1.8rem] border border-outline-variant/20 bg-surface-container-low p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img alt={post.author} className="h-10 w-10 rounded-xl object-cover" src={post.avatar} />
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-on-surface">{post.author}</p>
                      {post.verified ? <CheckCircle2 className="text-primary" size={14} /> : null}
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
                      {post.role} | {post.time}
                    </p>
                  </div>
                </div>
                <IconButton icon={<MoreHorizontal size={18} />} />
              </div>

              <h3 className="mt-5 font-headline text-2xl font-black text-on-surface">{post.title}</h3>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">{post.content}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-surface-container-high px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-outline-variant/20 pt-4">
                <div className="flex items-center gap-5">
                  <ActionText icon={<ThumbsUp size={16} />} text={`${post.likes}`} />
                  <ActionText icon={<MessageSquare size={16} />} text={`${post.comments}`} />
                  <ActionText icon={<Share2 size={16} />} text="Share" />
                </div>
                <button className={`rounded-lg p-2 ${
                  post.bookmarked ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-high"
                }`} type="button">
                  <Bookmark fill={post.bookmarked ? "currentColor" : "none"} size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      <aside className="space-y-6 lg:col-span-3">
        <div className="rounded-[1.8rem] border border-outline-variant/20 bg-surface-container-low p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-on-surface-variant">
            Suggested experts
          </p>
          <div className="mt-5 space-y-4">
            {[
              ["Dr. Michael Chen", "Pediatrician", "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop"],
              ["Dr. Anna Smith", "Radiologist", "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop"],
            ].map(([name, role, image]) => (
              <div key={name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img alt={name} className="h-8 w-8 rounded-lg object-cover" src={image} />
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{name}</p>
                    <p className="text-xs text-on-surface-variant">{role}</p>
                  </div>
                </div>
                <button className="rounded-lg bg-primary/10 p-2 text-primary" type="button">
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.8rem] bg-gradient-to-br from-primary to-primary-container p-5 text-white">
          <span className="inline-flex rounded-xl bg-white/18 p-3">
            <Award size={22} />
          </span>
          <h3 className="mt-5 font-headline text-2xl font-black">Clinical excellence</h3>
          <p className="mt-3 text-sm leading-7 text-white/82">
            You are in the top 5% of contributors this month. Keep sharing relevant
            operational insight with the network.
          </p>
        </div>
      </aside>
    </div>
  );
}

function IconButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high" type="button">
      {icon}
    </button>
  );
}

function ActionText({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <button className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary" type="button">
      {icon}
      {text}
    </button>
  );
}
