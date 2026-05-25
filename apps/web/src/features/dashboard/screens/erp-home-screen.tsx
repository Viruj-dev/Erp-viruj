"use client";

import { OrganizationAccessScreen } from "@/features/auth/components/organization-access-screen";
import { ErpDemoAnalytics } from "@/features/dashboard/components/analytics";
import { ErpDemoAppointments } from "@/features/dashboard/components/appointments";
import { ErpDemoBilling } from "@/features/dashboard/components/billing";
import { ErpDemoCommunity } from "@/features/dashboard/components/community";
import { ErpDemoDashboard } from "@/features/dashboard/components/dashboard";
import { ErpDemoPatients } from "@/features/dashboard/components/patients";
import { ErpDemoSettings } from "@/features/dashboard/components/settings";
import { ErpDemoSidebar } from "@/features/dashboard/components/sidebar";
import { ErpDemoStaff } from "@/features/dashboard/components/staff";
import { ErpDemoTopBar } from "@/features/dashboard/components/top-bar";
import type { ErpDemoPage } from "@/features/dashboard/components/types";
import {
  buildDashboardPath,
  type DashboardOrganizationType,
  getAllowedDashboardPages,
  isDashboardOrganizationType,
  isDashboardPage,
  organizationTypeLabels,
  resolveAccessibleDashboardPage,
} from "@/features/dashboard/lib/routing";
import { LoadingScreen } from "@/features/shell/components/loading-screen";
import {
  authClient,
  bootstrapOrganization,
  getAuthActionData,
  getAuthActionError,
  setActiveOrganization,
} from "@/lib/auth-client";
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
  const [isActivatingOnlyOrganization, setIsActivatingOnlyOrganization] =
    useState(false);
  const [isProvisioningOrganization, setIsProvisioningOrganization] =
    useState(false);
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
  const isAuthPending =
    sessionState.isPending ||
    organizationsState.isPending ||
    activeOrganizationState.isPending ||
    activeMemberState.isPending;

  useEffect(() => {
    const activeOrganizationId = activeOrganizationState.data?.id;
    const organizations = organizationsState.data ?? [];

    if (
      !sessionState.data?.user ||
      activeOrganizationId ||
      organizations.length !== 1 ||
      isActivatingOnlyOrganization ||
      !setActiveOrganization
    ) {
      return;
    }

    setIsActivatingOnlyOrganization(true);
    void setActiveOrganization({
      organizationId: organizations[0].id,
    })
      .then(() =>
        Promise.all([
          sessionState.refetch(),
          activeOrganizationState.refetch(),
          activeMemberState.refetch(),
        ])
      )
      .finally(() => setIsActivatingOnlyOrganization(false));
  }, [
    activeMemberState,
    activeOrganizationState.data?.id,
    activeOrganizationState,
    isActivatingOnlyOrganization,
    organizationsState.data,
    sessionState.data?.user,
    sessionState,
  ]);

  useEffect(() => {
    const organizations = organizationsState.data ?? [];
    const user = sessionState.data?.user;

    if (
      !isHydrated ||
      isAuthPending ||
      !user ||
      activeOrganizationState.data?.id ||
      organizations.length > 0 ||
      isProvisioningOrganization ||
      !setActiveOrganization
    ) {
      return;
    }

    const activateWorkspace = setActiveOrganization;

    setIsProvisioningOrganization(true);

    void bootstrapOrganization({
      name: buildAutoOrganizationName(user.name || user.email),
      organizationType: "hospital",
      slug: buildAutoOrganizationSlug(user.email || user.id),
    })
      .then(async (organizationResult) => {
        const organizationError = getAuthActionError(organizationResult);

        if (organizationError) {
          throw new Error(organizationError);
        }

        const organization = getAuthActionData<{
          id?: string;
          organizationType?: string;
        }>(organizationResult);
        let organizationId = organization?.id;

        if (!organizationId) {
          throw new Error(
            "Bootstrapped organization did not return an organization ID."
          );
        }

        const activeResult = await activateWorkspace({
          organizationId,
        });
        const activeError = getAuthActionError(activeResult);

        if (activeError) {
          throw new Error(activeError);
        }

        await Promise.all([
          organizationsState.refetch(),
          sessionState.refetch(),
          activeOrganizationState.refetch(),
          activeMemberState.refetch(),
        ]);

        const organizationType: DashboardOrganizationType =
          organization?.organizationType &&
          isDashboardOrganizationType(organization.organizationType)
            ? organization.organizationType
            : "hospital";

        router.replace(buildDashboardPath(organizationType));
      })
      .catch((error) => {
        console.error(
          "[Auth] Failed to provision default organization:",
          error
        );
      })
      .finally(() => setIsProvisioningOrganization(false));
  }, [
    activeMemberState,
    activeOrganizationState,
    activeOrganizationState.data?.id,
    isAuthPending,
    isHydrated,
    isProvisioningOrganization,
    organizationsState,
    organizationsState.data,
    router,
    sessionState,
    sessionState.data?.user,
  ]);

  const currentPage = isErpDemoPage(requestedPage)
    ? requestedPage
    : fallbackPage;
  const userName =
    sessionState.data?.user?.name ||
    sessionState.data?.user?.email ||
    "Clinical User";
  const activeOrganization = activeOrganizationState.data;
  const activeMember = activeMemberState.data;
  const routeDashboardOrganizationType = isDashboardOrganizationType(
    routeOrganizationType
  )
    ? routeOrganizationType
    : null;
  const activeOrganizationType =
    activeOrganization?.organizationType &&
    isDashboardOrganizationType(activeOrganization.organizationType)
      ? activeOrganization.organizationType
      : (routeDashboardOrganizationType ?? "hospital");
  const activeMemberRole = activeMember?.role;
  const allowedPages = getAllowedDashboardPages(activeMemberRole);
  const resolvedPage = resolveAccessibleDashboardPage(
    currentPage,
    activeMemberRole
  );
  const organizationLabel = organizationTypeLabels[activeOrganizationType];
  const roleLabel = activeMemberRole
    ? activeMemberRole.replace(/_/g, " ")
    : "member";

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
      !activeOrganizationType
    ) {
      return;
    }

    const expectedPath = buildDashboardPath(
      activeOrganizationType,
      resolvedPage
    );

    const routeMatchesOrganization =
      routeDashboardOrganizationType === activeOrganizationType;

    if (!routeMatchesOrganization || requestedPage !== resolvedPage) {
      router.replace(expectedPath);
    }
  }, [
    activeMember,
    activeOrganization,
    activeOrganizationType,
    isAuthPending,
    isHydrated,
    requestedPage,
    resolvedPage,
    routeDashboardOrganizationType,
    routeOrganizationType,
    router,
  ]);

  if (!isHydrated || isAuthPending || isProvisioningOrganization) {
    return <LoadingScreen />;
  }

  if (!sessionState.data?.user) {
    return <LoadingScreen />;
  }

  if (!activeOrganizationState.data || !activeMemberState.data) {
    return (
      <OrganizationAccessScreen
        isLoading={organizationsState.isPending}
        onRefresh={async () => {
          await organizationsState.refetch();
          await sessionState.refetch();
          await activeOrganizationState.refetch();
          await activeMemberState.refetch();
        }}
        onSelectOrganization={async (organizationId) => {
          if (!setActiveOrganization) {
            return;
          }

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
          router.push(buildDashboardPath(activeOrganizationType, page));
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
              <PageContent
                currentPage={resolvedPage}
                organizationLabel={organizationLabel}
                roleLabel={roleLabel}
                userName={userName}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function PageContent({
  currentPage,
  organizationLabel,
  roleLabel,
  userName,
}: {
  currentPage: ErpDemoPage;
  organizationLabel: string;
  roleLabel: string;
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
    case "billing":
      return <ErpDemoBilling />;
    case "settings":
      return <ErpDemoSettings section="profile" />;
    case "settings-alert-rules":
      return <ErpDemoSettings section="alerts" />;
    case "settings-audit-logs":
      return <ErpDemoSettings section="audit" />;
    case "settings-storage":
      return <ErpDemoSettings section="storage" />;
    case "settings-data-export":
      return <ErpDemoSettings section="export" />;
    case "analytics":
      return <ErpDemoAnalytics />;
    case "dashboard":
    default:
      return (
        <ErpDemoDashboard
          organizationLabel={organizationLabel}
          roleLabel={roleLabel}
          userName={userName}
        />
      );
  }
}

function isErpDemoPage(page: string): page is ErpDemoPage {
  return isDashboardPage(page);
}

function buildAutoOrganizationName(identifier?: string | null) {
  if (!identifier) {
    return "Viruj Health Workspace";
  }

  const localName = identifier.split("@")[0]?.trim();
  return localName
    ? `${localName}'s Viruj Workspace`
    : "Viruj Health Workspace";
}

function buildAutoOrganizationSlug(identifier?: string | null) {
  const normalized =
    identifier
      ?.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 36) || "viruj-workspace";
  const suffix = Math.random().toString(36).slice(2, 8);

  return `${normalized}-${suffix}`;
}
