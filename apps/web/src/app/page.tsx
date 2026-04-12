"use client";

import { ErpDemoAnalytics } from "@/components/erp-demo/analytics";
import { ErpDemoAppointments } from "@/components/erp-demo/appointments";
import { ErpDemoCommunity } from "@/components/erp-demo/community";
import { ErpDemoDashboard } from "@/components/erp-demo/dashboard";
import { ErpDemoLogin } from "@/components/erp-demo/login";
import { ErpDemoPatients } from "@/components/erp-demo/patients";
import { ErpDemoSettings } from "@/components/erp-demo/settings";
import { ErpDemoSidebar } from "@/components/erp-demo/sidebar";
import { ErpDemoStaff } from "@/components/erp-demo/staff";
import { ErpDemoTopBar } from "@/components/erp-demo/top-bar";
import type { ErpDemoPage } from "@/components/erp-demo/types";
import { authClient, setActiveOrganization } from "@/lib/auth-client";
import { useApp } from "@/store/app-context";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, LogOut } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

const fallbackPage: ErpDemoPage = "dashboard";

export default function Home() {
  const { state, reset, setCurrentPage } = useApp();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const sessionState = authClient.useSession();
  const activeMemberState = authClient.useActiveMember();
  const activeOrganizationState = authClient.useActiveOrganization();
  const organizationsState = authClient.useListOrganizations();

  useEffect(() => {
    const activeOrganizationId = activeOrganizationState.data?.id;
    const organizations = organizationsState.data ?? [];

    if (
      !sessionState.data?.user ||
      activeOrganizationId ||
      organizations.length !== 1
    ) {
      return;
    }

    void setActiveOrganization({
      organizationId: organizations[0].id,
    });
  }, [
    activeOrganizationState.data?.id,
    organizationsState.data,
    sessionState.data?.user,
  ]);

  const currentPage = isErpDemoPage(state.currentPage)
    ? state.currentPage
    : fallbackPage;
  const userName =
    sessionState.data?.user?.name ||
    sessionState.data?.user?.email ||
    "Clinical User";

  const isAuthPending =
    sessionState.isPending ||
    organizationsState.isPending ||
    activeOrganizationState.isPending ||
    activeMemberState.isPending;

  if (!isHydrated || isAuthPending) {
    return <LoadingScreen />;
  }

  if (!sessionState.data?.user) {
    return <ErpDemoLogin onAuthenticated={() => sessionState.refetch()} />;
  }

  if (!activeOrganizationState.data || !activeMemberState.data) {
    return (
      <OrganizationAccessScreen
        isLoading={organizationsState.isPending}
        onRefresh={() => sessionState.refetch()}
        onSelectOrganization={async (organizationId) => {
          await setActiveOrganization({
            organizationId,
          });
          await sessionState.refetch();
          await activeOrganizationState.refetch();
          await activeMemberState.refetch();
        }}
        onSignOut={async () => {
          setIsSigningOut(true);
          try {
            await authClient.signOut();
            reset();
            await sessionState.refetch();
            await activeOrganizationState.refetch();
            await activeMemberState.refetch();
          } finally {
            setIsSigningOut(false);
          }
        }}
        organizations={organizationsState.data ?? []}
        signingOut={isSigningOut}
        userEmail={sessionState.data.user?.email ?? ""}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-surface text-on-surface selection:bg-primary/15 selection:text-primary">
      <ErpDemoSidebar
        currentPage={currentPage}
        isCollapsed={isSidebarCollapsed}
        onLogout={async () => {
          setIsSigningOut(true);
          try {
            await authClient.signOut();
            reset();
            await sessionState.refetch();
            await activeOrganizationState.refetch();
            await activeMemberState.refetch();
          } finally {
            setIsSigningOut(false);
          }
        }}
        onPageChange={(page) => setCurrentPage(page)}
        onToggle={() => setIsSidebarCollapsed((value) => !value)}
      />
      <main
        className={`flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <ErpDemoTopBar currentPage={currentPage} userName={userName} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto w-full max-w-[1600px]"
              exit={{ opacity: 0, y: -12 }}
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
            >
              <PageContent currentPage={currentPage} userName={userName} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_42%),radial-gradient(circle_at_bottom,rgba(34,197,94,0.12),transparent_35%)]" />
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white/70 p-10 text-center shadow-2xl backdrop-blur-xl"
        initial={{ opacity: 0, y: 12 }}
      >
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
          <Building2 size={24} />
        </div>
        <h1 className="font-headline text-3xl font-black text-on-surface">
          Restoring secure session
        </h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          Reconnecting your organization workspace and permission context.
        </p>
        <div className="mt-8 h-2 overflow-hidden rounded-full bg-surface-container-highest">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            className="h-full w-1/2 bg-gradient-to-r from-primary to-secondary"
            transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  );
}

function OrganizationAccessScreen({
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

function PageContent({
  currentPage,
  userName,
}: {
  currentPage: ErpDemoPage;
  userName: string;
}) {
  switch (currentPage) {
    case "appointments":
      return <ErpDemoAppointments />;
    case "patients":
      return <ErpDemoPatients />;
    case "staff":
      return <ErpDemoStaff />;
    case "community":
      return <ErpDemoCommunity />;
    case "analytics":
      return <ErpDemoAnalytics />;
    case "settings":
      return <ErpDemoSettings userName={userName} />;
    case "dashboard":
    default:
      return <ErpDemoDashboard userName={userName} />;
  }
}

function isErpDemoPage(page: string): page is ErpDemoPage {
  return [
    "dashboard",
    "appointments",
    "patients",
    "staff",
    "community",
    "analytics",
    "settings",
  ].includes(page);
}
