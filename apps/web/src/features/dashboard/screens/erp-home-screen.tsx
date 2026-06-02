"use client";

import { OrganizationAccessScreen } from "@/features/auth/components/organization-access-screen";
import { ErpDemoSidebar, ErpDemoTopBar } from "@/features/dashboard/components/layout";
import { ErpDemoAppointments, ErpEnterpriseModule } from "@/features/dashboard/components/modules";
import {
  ErpDemoAnalytics,
  ErpDemoBilling,
  ErpDemoCommunity,
  ErpDemoDashboard,
  DoctorsManagementPage,
  ErpDemoPatients,
  ErpDemoSettings,
  ErpDemoStaff,
  HospitalProfilePage,
  PricingPage,
} from "@/features/dashboard/components/pages";
import { ErpUserProfilePage } from "@/features/dashboard/components/profile";
import type { ErpDemoPage } from "@/features/dashboard/components/shared";
import {
  buildDashboardPath,
  buildTenantDashboardPath,
  type DashboardOrganizationType,
  getAllowedDashboardPages,
  isDashboardOrganizationType,
  isDashboardPage,
  organizationTypeLabels,
  resolveAccessibleDashboardPage,
} from "@/features/dashboard/lib/routing";
import { LoadingScreen } from "@/features/shell/components/loading-screen";
import {
  activateOrganization,
  authClient,
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
  const sessionOrganization = getSessionOrganization(sessionState.data);
  const sessionMember = getSessionMember(sessionState.data);
  const activeOrganization =
    sessionOrganization ?? activeOrganizationState.data;
  const activeMember = sessionMember ?? activeMemberState.data;
  const isAuthPending =
    sessionState.isPending ||
    organizationsState.isPending;

  useEffect(() => {
    const activeOrganizationId = activeOrganization?.id;
    const organizations = organizationsState.data ?? [];

    if (
      !sessionState.data?.user ||
      activeOrganizationId ||
      organizations.length !== 1 ||
      isActivatingOnlyOrganization
    ) {
      return;
    }

    setIsActivatingOnlyOrganization(true);
    void activateOrganization({
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
    activeOrganization?.id,
    activeOrganizationState,
    isActivatingOnlyOrganization,
    organizationsState.data,
    sessionState.data?.user,
    sessionState,
  ]);

  const currentPage = isErpDemoPage(requestedPage)
    ? requestedPage
    : fallbackPage;
  const userName =
    sessionState.data?.user?.name ||
    sessionState.data?.user?.email ||
    "Clinical User";
  const routeDashboardOrganizationType = isDashboardOrganizationType(
    routeOrganizationType
  )
    ? routeOrganizationType
    : null;
  const activeOrganizationType =
    activeOrganization?.organizationType &&
    isDashboardOrganizationType(activeOrganization.organizationType)
      ? activeOrganization.organizationType
      : null;
  const activeMemberRole = activeMember?.role;
  const allowedPages = getAllowedDashboardPages(activeMemberRole);
  const resolvedPage = resolveAccessibleDashboardPage(
    currentPage,
    activeMemberRole
  );
  const organizationLabel = activeOrganizationType
    ? organizationTypeLabels[activeOrganizationType]
    : "Organization";
  const activeOrganizationSlug = getOrganizationSlug(activeOrganization);
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

    const expectedPath = activeOrganizationSlug
      ? buildTenantDashboardPath(
          activeOrganizationType,
          activeOrganizationSlug,
          resolvedPage
        )
      : buildDashboardPath(activeOrganizationType, resolvedPage);

    const routeMatchesOrganization =
      routeDashboardOrganizationType === activeOrganizationType;

    if (!routeMatchesOrganization || requestedPage !== resolvedPage) {
      router.replace(expectedPath);
    }
  }, [
    activeMember,
    activeOrganization,
    activeOrganizationSlug,
    activeOrganizationType,
    isAuthPending,
    isHydrated,
    requestedPage,
    resolvedPage,
    routeDashboardOrganizationType,
    routeOrganizationType,
    router,
  ]);

  if (!isHydrated || isAuthPending) {
    return <LoadingScreen />;
  }

  if (!sessionState.data?.user) {
    return <LoadingScreen />;
  }

  if (!activeOrganization || !activeMember || !activeOrganizationType) {
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
          const selectedOrganization = organizationsState.data?.find(
            (organization) => organization.id === organizationId
          );

          await activateOrganization({
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
    <div className="flex h-screen min-h-screen bg-surface text-on-surface selection:bg-primary/15 selection:text-primary transition-colors dark:bg-[#0b0d10] dark:text-slate-100 dark:selection:bg-blue-400/20 dark:selection:text-blue-100">
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
          router.push(
            activeOrganizationSlug
              ? buildTenantDashboardPath(
                  activeOrganizationType,
                  activeOrganizationSlug,
                  page
                )
              : buildDashboardPath(activeOrganizationType, page)
          );
        }}
        onToggle={() => setIsSidebarCollapsed((value) => !value)}
        organizationLabel={organizationLabel}
      />
      <main
        className={`flex h-screen min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-28" : "lg:ml-80"
        }`}
      >
        <ErpDemoTopBar
          currentPage={resolvedPage}
          organizationLabel={organizationLabel}
          roleLabel={roleLabel}
          userName={userName}
          onNavigateToProfile={() => {
            router.push(
              activeOrganizationSlug
                ? buildTenantDashboardPath(
                    activeOrganizationType,
                    activeOrganizationSlug,
                    "profile"
                  )
                : buildDashboardPath(activeOrganizationType, "profile")
            );
          }}
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
        />
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={resolvedPage}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto flex min-h-full w-full max-w-full p-5 lg:p-8"
              exit={{ opacity: 0, y: -12 }}
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex min-h-full w-full flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/88 shadow-sm ring-1 ring-white/60 backdrop-blur dark:border-white/[0.08] dark:bg-[#111418] dark:ring-white/[0.03]">
                <PageContent
                  currentPage={resolvedPage}
                  organizationLabel={organizationLabel}
                  roleLabel={roleLabel}
                  userName={userName}
                />
              </div>
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
    case "finance":
      return <ErpDemoBilling />;
    case "appointments":
    case "appointments-dashboard":
      return <ErpDemoAppointments section="dashboard" />;
    case "appointments-review":
      return <ErpDemoAppointments section="review" />;
    case "appointments-patients":
      return <ErpDemoAppointments section="patients" />;
    case "appointments-settings":
      return <ErpDemoAppointments section="settings" />;
    case "patients":
      return <ErpDemoPatients />;
    case "staff":
      return <ErpDemoStaff />;
    case "community":
      return <ErpDemoCommunity />;
    case "billing":
      return <ErpDemoBilling />;
    case "pricing":
      return <PricingPage />;
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
    case "doctors":
      return <DoctorsManagementPage organizationLabel={organizationLabel} />;
    case "hospital-profile":
      return <HospitalProfilePage organizationLabel={organizationLabel} />;
    case "radiology":
      return <ErpEnterpriseModule module="radiology" roleLabel={roleLabel} />;
    case "pathology":
      return <ErpEnterpriseModule module="pathology" roleLabel={roleLabel} />;
    case "pharmacy":
      return <ErpEnterpriseModule module="pharmacy" roleLabel={roleLabel} />;
    case "notifications":
      return (
        <ErpEnterpriseModule module="notifications" roleLabel={roleLabel} />
      );
    case "reports":
      return <ErpEnterpriseModule module="reports" roleLabel={roleLabel} />;
    case "profile":
      return <ErpUserProfilePage />;
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

function getOrganizationSlug(organization: unknown) {
  if (
    organization &&
    typeof organization === "object" &&
    "slug" in organization &&
    typeof organization.slug === "string"
  ) {
    return organization.slug;
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
      id?: string;
      organizationType?: string;
      slug?: string;
    };
  }

  return null;
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
      role?: string;
    };
  }

  return null;
}
