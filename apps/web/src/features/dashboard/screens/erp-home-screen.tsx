"use client";

import { ActivityLogsPage } from "@/features/dashboard/components/shared/activity";
import { OrganizationAccessScreen } from "@/features/auth/components/organization-access-screen";
import { ErpDemoSidebar, ErpDemoTopBar } from "@/features/dashboard/components/shared/layout";
import { getWorkspaceTheme } from "@/features/dashboard/components/shared/layout/role-theme";
import { ClinicGalleryPage } from "@/features/dashboard/components/clinic/pages";
import { ErpDemoAppointments, ErpEnterpriseModule } from "@/features/dashboard/components/shared/modules";
import {
  ErpDemoAnalytics,
  ErpDemoBilling,
  ErpDemoCommunity,
  ErpDemoDashboard,
  DoctorsManagementPage,
  ErpDemoPatients,
  FacilitiesPage,
  ErpDemoSettings,
  ErpDemoStaff,
  HospitalProfilePage,
  PricingPage,
} from "@/features/dashboard/components/hospital/pages";
import { ErpUserProfilePage } from "@/features/dashboard/components/shared/profile";
import type { ErpDemoPage } from "@/features/dashboard/components/shared/types";
import {
  buildDashboardPath,
  buildTenantDashboardPath,
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
  routeSegments = [],
}: {
  currentPage: string;
  routeOrganizationType: string;
  routeSegments?: string[];
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
  const organizationName = getOrganizationDisplayName(
    activeOrganization,
    organizationLabel
  );
  const activeOrganizationSlug = getOrganizationSlug(activeOrganization);
  const roleLabel = activeMemberRole
    ? activeMemberRole.replace(/_/g, " ")
    : "member";
  const workspaceTheme = getWorkspaceTheme(organizationLabel);

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
    <div
      className={`flex h-screen min-h-screen bg-surface text-on-surface transition-colors dark:bg-[#0b0d10] dark:text-slate-100 ${workspaceTheme.selection}`}
    >
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
          organizationId={activeOrganization.id}
          organizationLabel={organizationLabel}
          organizationName={organizationName}
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
              <div
                className={
                  resolvedPage === "doctors"
                    ? "flex min-h-full w-full flex-col"
                    : `flex min-h-full w-full flex-col overflow-hidden rounded-[2rem] border shadow-sm ring-1 backdrop-blur ${workspaceTheme.contentFrame}`
                }
              >
                <PageContent
                  currentPage={resolvedPage}
                  organizationLabel={organizationLabel}
                  roleLabel={roleLabel}
                  userName={userName}
                  organizationId={activeOrganization.id}
                  routeBasePath={
                    activeOrganizationSlug
                      ? `/${activeOrganizationType}/${activeOrganizationSlug}`
                      : `/${activeOrganizationType}`
                  }
                  routeSegments={routeSegments}
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
  organizationId,
  routeBasePath,
  routeSegments,
}: {
  currentPage: ErpDemoPage;
  organizationLabel: string;
  roleLabel: string;
  userName: string;
  organizationId?: string;
  routeBasePath: string;
  routeSegments: string[];
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
      return <ErpDemoStaff organizationLabel={organizationLabel} />;
    case "community":
      return <ErpDemoCommunity />;
    case "gallery":
      return <ClinicGalleryPage organizationId={organizationId} />;
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
    case "activity-logs":
      return <ActivityLogsPage organizationId={organizationId} />;
    case "analytics":
      return <ErpDemoAnalytics organizationId={organizationId} />;
    case "doctors":
      return <DoctorsManagementPage organizationLabel={organizationLabel} />;
    case "facilities":
      return (
        <FacilitiesPage
          routeBasePath={routeBasePath}
          routeSegments={routeSegments}
        />
      );
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
          organizationId={organizationId}
        />
      );
  }
}

function isErpDemoPage(page: string): page is ErpDemoPage {
  return isDashboardPage(page);
}

function getOrganizationDisplayName(organization: unknown, fallback: string) {
  if (
    organization &&
    typeof organization === "object" &&
    "name" in organization &&
    typeof organization.name === "string" &&
    organization.name.trim()
  ) {
    return organization.name.trim();
  }

  return fallback;
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
