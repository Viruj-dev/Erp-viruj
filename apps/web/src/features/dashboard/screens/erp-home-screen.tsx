"use client";

import { OrganizationAccessScreen } from "@/features/auth/components/organization-access-screen";
import { ErpDemoAnalytics } from "@/features/dashboard/components/analytics";
import { ErpDemoAppointments } from "@/features/dashboard/components/appointments";
import { ErpDemoDashboard } from "@/features/dashboard/components/dashboard";
import { ErpDemoPatients } from "@/features/dashboard/components/patients";
import { ErpDemoSidebar } from "@/features/dashboard/components/sidebar";
import { ErpDemoStaff } from "@/features/dashboard/components/staff";
import { ErpDemoTopBar } from "@/features/dashboard/components/top-bar";
import type { ErpDemoPage } from "@/features/dashboard/components/types";
import {
  buildDashboardPath,
  getAllowedDashboardPages,
  isDashboardOrganizationType,
  isDashboardPage,
  organizationTypeLabels,
  resolveAccessibleDashboardPage,
} from "@/features/dashboard/lib/routing";
import { LoadingScreen } from "@/features/shell/components/loading-screen";
import { authClient, setActiveOrganization } from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

const fallbackPage: ErpDemoPage = "dashboard";

export function ErpHomeScreen({
  currentPage: requestedPage,
  routeOrganizationType,
}: {
  currentPage: string;
  routeOrganizationType: string;
}) {
  const router = useRouter();
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

  const currentPage = isErpDemoPage(requestedPage) ? requestedPage : fallbackPage;
  const userName =
    sessionState.data?.user?.name ||
    sessionState.data?.user?.email ||
    "Clinical User";
  const activeOrganization = activeOrganizationState.data;
  const activeMember = activeMemberState.data;
  const activeOrganizationType = activeOrganization?.organizationType;
  const activeMemberRole = activeMember?.role;
  const allowedPages = getAllowedDashboardPages(activeMemberRole);
  const resolvedPage = resolveAccessibleDashboardPage(
    currentPage,
    activeMemberRole
  );
  const organizationLabel = isDashboardOrganizationType(activeOrganizationType ?? "")
    ? organizationTypeLabels[activeOrganizationType]
    : "Organization";
  const roleLabel = activeMemberRole
    ? activeMemberRole.replace(/_/g, " ")
    : "member";

  const isAuthPending =
    sessionState.isPending ||
    organizationsState.isPending ||
    activeOrganizationState.isPending ||
    activeMemberState.isPending;

  useEffect(() => {
    if (!isHydrated || isAuthPending) {
      return;
    }

    if (!sessionState.data?.user) {
      router.replace("/auth");
    }
  }, [isAuthPending, isHydrated, router, sessionState.data?.user]);

  useEffect(() => {
    if (
      !isHydrated ||
      isAuthPending ||
      !activeOrganization ||
      !activeMember ||
      !isDashboardOrganizationType(activeOrganization.organizationType)
    ) {
      return;
    }

    const expectedPath = buildDashboardPath(
      activeOrganization.organizationType,
      resolvedPage
    );

    const routeMatchesOrganization =
      isDashboardOrganizationType(routeOrganizationType) &&
      routeOrganizationType === activeOrganization.organizationType;

    if (!routeMatchesOrganization || requestedPage !== resolvedPage) {
      router.replace(expectedPath);
    }
  }, [
    activeMember,
    activeOrganization,
    isAuthPending,
    isHydrated,
    requestedPage,
    resolvedPage,
    routeOrganizationType,
    router,
  ]);

  if (!isHydrated || isAuthPending) {
    return <LoadingScreen />;
  }

  if (!sessionState.data?.user) {
    return <LoadingScreen />;
  }

  const hasOrganizationChoices = (organizationsState.data?.length ?? 0) > 0;

  if (
    hasOrganizationChoices &&
    (!activeOrganizationState.data || !activeMemberState.data)
  ) {
    return (
      <OrganizationAccessScreen
        isLoading={organizationsState.isPending}
        onRefresh={() => sessionState.refetch()}
        onSelectOrganization={async (organizationId) => {
          const selectedOrganization = organizationsState.data?.find(
            (organization) => organization.id === organizationId
          );

          await setActiveOrganization({
            organizationId,
          });
          await sessionState.refetch();
          await activeOrganizationState.refetch();
          await activeMemberState.refetch();

          if (
            selectedOrganization?.organizationType &&
            isDashboardOrganizationType(selectedOrganization.organizationType)
          ) {
            router.replace(
              buildDashboardPath(selectedOrganization.organizationType)
            );
          }
        }}
        onSignOut={async () => {
          setIsSigningOut(true);
          try {
            await authClient.signOut();
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
        allowedPages={allowedPages}
        currentPage={currentPage}
        isCollapsed={isSidebarCollapsed}
        onLogout={async () => {
          setIsSigningOut(true);
          try {
            await authClient.signOut();
            await sessionState.refetch();
            await activeOrganizationState.refetch();
            await activeMemberState.refetch();
          } finally {
            setIsSigningOut(false);
          }
        }}
        onPageChange={(page) => {
          if (
            activeOrganizationType &&
            isDashboardOrganizationType(activeOrganizationType)
          ) {
            router.push(buildDashboardPath(activeOrganizationType, page));
          }
        }}
        onToggle={() => setIsSidebarCollapsed((value) => !value)}
        organizationLabel={organizationLabel}
      />
      <main
        className={`flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <ErpDemoTopBar
          currentPage={resolvedPage}
          organizationLabel={organizationLabel}
          roleLabel={roleLabel}
          userName={userName}
        />
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={resolvedPage}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto w-full max-w-[1600px]"
              exit={{ opacity: 0, y: -12 }}
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
            >
              <PageContent currentPage={resolvedPage} userName={userName} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
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
    case "analytics":
      return <ErpDemoAnalytics />;
    case "dashboard":
    default:
      return <ErpDemoDashboard userName={userName} />;
  }
}

function isErpDemoPage(page: string): page is ErpDemoPage {
  return isDashboardPage(page);
}
