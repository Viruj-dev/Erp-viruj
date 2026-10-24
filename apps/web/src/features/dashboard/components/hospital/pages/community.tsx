"use client";

import { PageSkeleton } from "@/features/dashboard/components/shared/page-skeleton";

import { DashboardPageShell } from "@/features/dashboard/components/shared/dashboard-page-shell";
import { virujBackend } from "@/lib/viruj-backend";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";

export function ErpDemoCommunity() {
  const communityStatusQuery = useQuery({
    queryFn: () => virujBackend.modules.summary("community"),
    queryKey: virujBackend.modules.key("community"),
  });

  if (communityStatusQuery.isLoading) return <PageSkeleton />;

  return (
    <DashboardPageShell
      eyebrow="Community"
      subtitle="Coordinate announcements, clinical discussions, patient Q&A, and shared resources."
      title="Community Hub"
    >
      <div className="rounded-xl border border-dashed border-outline-variant/30 bg-surface-container-lowest p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MessageSquare size={22} />
        </div>
        <h2 className="mt-4 font-headline text-lg font-semi-bold text-on-surface">
          No community activity yet for this workspace.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-medium text-on-surface-variant">
          Announcements, patient Q&A, and shared resources will appear here once
          your team starts using the community module. Posting and moderation
          tooling is not available yet.
        </p>
      </div>
      {communityStatusQuery.data ? (
        <p className="mt-4 text-[11px] font-bold text-secondary">
          Backend module ready for{" "}
          {communityStatusQuery.data.organizationType || "organization"}.
        </p>
      ) : null}
    </DashboardPageShell>
  );
}
