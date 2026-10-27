"use client";

import { VirujLogo } from "@/components/brand/viruj-logo";

import { ArrowRight, LogOut } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function OrganizationAccessScreen({
  isLoading,
  onRefresh,
  onSelectOrganization,
  onSignOut,
  organizations,
  signingOut,
  userEmail,
  children,
}: {
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onSelectOrganization: (organizationId: string) => Promise<void>;
  onSignOut: () => Promise<void>;
  organizations: Array<{
    id: string;
    name: string;
    organizationType?: string;
    membershipRole?: string;
    slug: string;
  }>;
  signingOut: boolean;
  userEmail: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6 py-12">
      <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(15,23,42,0.08),transparent_40%),radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.22),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.14),transparent_32%)] dark:opacity-40" />
      <div className="relative w-full max-w-3xl rounded-[2.5rem] border border-outline-variant/60 bg-surface-container-lowest p-8 text-on-surface shadow-2xl md:p-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <VirujLogo className="mb-4 size-14" />
            <p className="text-xs font-semi-bold uppercase tracking-[0.35em] text-primary">
              Organization Access
            </p>
            <h1 className="mt-4 font-headline text-4xl font-semi-bold text-on-surface">
              Choose the workspace you want to run.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-on-surface-variant">
              Signed in as {userEmail}. All your provider roles stay linked to
              this email. Each workspace has its own details and admin approval.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 self-start rounded-full border border-outline-variant/40 px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
            disabled={isLoading || signingOut}
            onClick={() => void onSignOut()}
            type="button"
          >
            <LogOut size={16} />
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>

        <div className="mt-8 grid gap-2.5">
          {organizations.map((organization) => (
            <button
              className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-outline-variant/60 bg-surface-container-low px-5 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-surface-container-high hover:shadow-md"
              key={organization.id}
              disabled={isLoading || signingOut}
              onClick={() => void onSelectOrganization(organization.id)}
              type="button"
            >
              <div>
                <p className="text-[10px] font-semi-bold uppercase tracking-[0.2em] text-primary">
                  {organization.organizationType
                    ? `${organization.organizationType} ERP`
                    : "Provider type unavailable"}
                </p>
                <h2 className="mt-1 font-headline text-lg font-bold leading-tight text-on-surface">
                  {organization.name}
                </h2>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  @{organization.slug}
                </p>
                {organization.membershipRole && (
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Your role:{" "}
                    <span className="capitalize">
                      {organization.membershipRole
                        .replace(/_/g, " ")
                        .toLowerCase()}
                    </span>
                  </p>
                )}
              </div>
              <div className="shrink-0 rounded-full bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowRight size={18} />
              </div>
            </button>
          ))}
        </div>

        {!isLoading && organizations.length === 0 ? (
          <div className="mt-10 rounded-[1.75rem] border border-dashed border-outline-variant/40 bg-surface-container-low p-8">
            <h2 className="font-headline text-2xl font-bold text-on-surface">
              No organization membership found
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-on-surface-variant">
              Create a new organization from the onboarding flow or ask an OWNER
              or ADMIN to send you an invitation ID from the Staff page.
            </p>
            <button
              className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
              onClick={() => void onRefresh()}
              type="button"
            >
              Refresh access state
            </button>
          </div>
        ) : null}
        {children ?? (
          <Link
            className="mt-6 inline-block text-sm font-semibold text-primary underline underline-offset-4"
            href="/workspaces"
          >
            Add or switch provider roles
          </Link>
        )}
      </div>
    </div>
  );
}
