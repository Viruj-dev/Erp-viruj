"use client";

import { ArrowRight, LogOut } from "lucide-react";

export function OrganizationAccessScreen({
  isLoading,
  onRefresh,
  onSelectOrganization,
  onSignOut,
  organizations,
  signingOut,
  userEmail,
}: {
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onSelectOrganization: (organizationId: string) => Promise<void>;
  onSignOut: () => Promise<void>;
  organizations: Array<{
    id: string;
    name: string;
    organizationType?: string;
    slug: string;
  }>;
  signingOut: boolean;
  userEmail: string;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6 py-12">
      <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(15,23,42,0.08),transparent_40%),radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.22),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.14),transparent_32%)]" />
      <div className="relative w-full max-w-3xl rounded-[2.5rem] border border-white/10 bg-white/80 p-8 shadow-2xl backdrop-blur-xl md:p-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-primary">
              Organization Access
            </p>
            <h1 className="mt-4 font-headline text-4xl font-black text-on-surface">
              Choose the workspace you want to run.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-on-surface-variant">
              Signed in as {userEmail}. Your account is authenticated, but an
              active organization is required before the ERP dashboard can load.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 self-start rounded-full border border-outline-variant/40 px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
            disabled={signingOut}
            onClick={() => void onSignOut()}
            type="button"
          >
            <LogOut size={16} />
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>

        <div className="mt-10 grid gap-4">
          {organizations.map((organization) => (
            <button
              className="group flex items-center justify-between rounded-[1.75rem] border border-outline-variant/25 bg-surface px-6 py-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-xl"
              key={organization.id}
              onClick={() => void onSelectOrganization(organization.id)}
              type="button"
            >
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">
                  {organization.organizationType ?? "organization"}
                </p>
                <h2 className="mt-2 font-headline text-2xl font-bold text-on-surface">
                  {organization.name}
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  @{organization.slug}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <ArrowRight size={20} />
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
              Create a new organization from the onboarding flow or ask an
              owner/admin to send you a Better Auth invitation ID.
            </p>
            <button
              className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90"
              onClick={() => void onRefresh()}
              type="button"
            >
              Refresh access state
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
