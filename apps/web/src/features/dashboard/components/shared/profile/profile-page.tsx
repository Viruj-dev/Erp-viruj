"use client";

import { authClient } from "@/lib/auth-client";
import {
  AtSign,
  BadgeCheck,
  Building2,
  CalendarDays,
  Fingerprint,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "--";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatLabel(value?: string | null) {
  if (!value?.trim()) return "Not provided";

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: unknown) {
  const date = value instanceof Date ? value : typeof value === "string" ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Not provided";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function displayValue(value?: string | null) {
  return value?.trim() ? value : "Not provided";
}

function getSessionMember(session: unknown) {
  if (
    session &&
    typeof session === "object" &&
    "activeMember" in session &&
    session.activeMember &&
    typeof session.activeMember === "object"
  ) {
    return session.activeMember as {
      createdAt?: string | Date | null;
      id?: string;
      organizationId?: string;
      role?: string;
      userId?: string;
    };
  }

  return null;
}

function getSessionOrganization(session: unknown) {
  if (
    session &&
    typeof session === "object" &&
    "activeOrganization" in session &&
    session.activeOrganization &&
    typeof session.activeOrganization === "object"
  ) {
    return session.activeOrganization as {
      createdAt?: string | Date | null;
      id?: string;
      logo?: string | null;
      name?: string;
      organizationType?: string;
      slug?: string;
    };
  }

  return null;
}

function getUserMeta(user: unknown) {
  if (!user || typeof user !== "object") {
    return { createdAt: null, emailVerified: null, id: "", updatedAt: null };
  }

  const record = user as {
    createdAt?: string | Date | null;
    emailVerified?: boolean | null;
    id?: string;
    updatedAt?: string | Date | null;
  };

  return {
    createdAt: record.createdAt ?? null,
    emailVerified: record.emailVerified ?? null,
    id: record.id ?? "",
    updatedAt: record.updatedAt ?? null,
  };
}

function Pill({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return (
    <span className="inline-flex min-h-8 items-center gap-2 rounded-md border border-violet-100 bg-violet-50 px-2.5 text-xs font-bold text-[#5b21b6] dark:border-violet-400/[0.14] dark:bg-violet-400/[0.08] dark:text-violet-200">
      {icon}
      {children}
    </span>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-t border-violet-100 py-4 dark:border-violet-400/[0.10] md:border-l md:border-t-0 md:px-5 md:first:border-l-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-950 dark:text-slate-100">{value}</p>
    </div>
  );
}

function Section({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) {
  return (
    <section className="grid gap-4 border-t border-violet-100 px-5 py-6 dark:border-violet-400/[0.10] lg:grid-cols-[210px_minmax(0,1fr)]">
      <div className="flex items-center gap-3 lg:items-start">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-50 text-[#6d28d9] dark:bg-violet-400/[0.10] dark:text-violet-200">
          {icon}
        </span>
        <h2 className="font-headline text-sm font-semibold text-slate-950 dark:text-slate-100">{title}</h2>
      </div>
      <div className="grid gap-x-8 gap-y-0 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  const real = Boolean(value?.trim());

  return (
    <div className="border-b border-violet-100 py-3.5 dark:border-violet-400/[0.10]">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-500">{label}</p>
      <p className={`mt-1 break-words text-sm font-semibold ${real ? "text-slate-950 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}`}>
        {displayValue(value)}
      </p>
    </div>
  );
}

export function ErpUserProfilePage() {
  const sessionState = authClient.useSession();
  const activeMemberState = authClient.useActiveMember();
  const activeOrganizationState = authClient.useActiveOrganization();

  const sessionMember = getSessionMember(sessionState.data);
  const sessionOrganization = getSessionOrganization(sessionState.data);
  const activeMember = sessionMember ?? activeMemberState.data;
  const activeOrganization = sessionOrganization ?? activeOrganizationState.data;
  const userMeta = getUserMeta(sessionState.data?.user);

  const userName =
    sessionState.data?.user?.name ||
    sessionState.data?.user?.email?.split("@")[0] ||
    "Not provided";
  const userEmail = sessionState.data?.user?.email ?? "";
  const userImage = sessionState.data?.user?.image;
  const roleLabel = formatLabel(activeMember?.role ?? "member");
  const organizationName = activeOrganization?.name ?? "";
  const organizationType = formatLabel(activeOrganization?.organizationType);
  const emailStatus = userMeta.emailVerified === true ? "Verified" : userMeta.emailVerified === false ? "Not verified" : "Not provided";
  const initials = getInitials(userName);

  return (
    <div className="p-4 lg:p-7">
      <article className="mx-auto max-w-6xl overflow-hidden rounded-lg border border-violet-100 bg-white shadow-sm dark:border-violet-400/[0.14] dark:bg-[#111018]">
        <header className="relative border-b border-violet-100 bg-white px-5 py-6 dark:border-violet-400/[0.10] dark:bg-[#111018] md:px-7 md:py-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-[#7c3aed]" />
          <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)] md:items-end">
            <div className="flex size-24 items-center justify-center overflow-hidden rounded-lg border border-violet-100 bg-violet-50 text-3xl font-bold text-[#6d28d9] shadow-sm dark:border-violet-400/[0.16] dark:bg-violet-400/[0.10] dark:text-violet-200">
              {userImage ? <img alt={userName} className="h-full w-full object-cover" src={userImage} /> : initials}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Pill icon={<ShieldCheck size={14} />}>{roleLabel}</Pill>
                <Pill icon={<BadgeCheck size={14} />}>{emailStatus}</Pill>
              </div>
              <h1 className="mt-4 break-words font-headline text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">
                {displayValue(userName)}
              </h1>
              <p className="mt-2 break-all text-sm font-semibold text-slate-500 dark:text-slate-400">
                {userEmail || "Email not provided"}
              </p>
            </div>
          </div>
        </header>

        <div className="grid px-5 md:grid-cols-3 md:px-7">
          <SummaryItem label="Workspace" value={displayValue(organizationName)} />
          <SummaryItem label="Workspace Type" value={organizationType} />
          <SummaryItem label="Member Since" value={formatDate(activeMember?.createdAt)} />
        </div>

        <Section icon={<UserRound size={16} />} title="Account">
          <Field label="Full Name" value={userName} />
          <Field label="Email Address" value={userEmail} />
          <Field label="Email Status" value={emailStatus} />
          <Field label="User ID" value={userMeta.id} />
          <Field label="Account Created" value={formatDate(userMeta.createdAt)} />
          <Field label="Last Updated" value={formatDate(userMeta.updatedAt)} />
        </Section>

        <Section icon={<Building2 size={16} />} title="Workspace">
          <Field label="Organization" value={organizationName} />
          <Field label="Organization Type" value={organizationType} />
          <Field label="Slug" value={activeOrganization?.slug} />
          <Field label="Organization ID" value={activeOrganization?.id} />
          <Field label="Organization Logo" value={activeOrganization?.logo ? "Uploaded" : "Not provided"} />
        </Section>

        <Section icon={<Fingerprint size={16} />} title="Access">
          <Field label="Role" value={roleLabel} />
          <Field label="Member ID" value={activeMember?.id} />
          <Field label="Member User ID" value={activeMember?.userId} />
          <Field label="Member Organization ID" value={activeMember?.organizationId} />
        </Section>

        <Section icon={<AtSign size={16} />} title="Visible Identity">
          <Field label="Display Name" value={userName} />
          <Field label="Email" value={userEmail} />
          <Field label="Avatar" value={userImage ? "Uploaded" : "Initials"} />
          <Field label="Workspace" value={organizationName} />
        </Section>
      </article>
    </div>
  );
}
