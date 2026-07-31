"use client";

import { ActivityLogsPage } from "@/features/dashboard/components/shared/activity";
import { OrganizationAccessScreen } from "@/features/auth/components/organization-access-screen";
import { ErpDemoSidebar, ErpDemoTopBar } from "@/features/dashboard/components/shared/layout";
import { getWorkspaceTheme } from "@/features/dashboard/components/shared/layout/role-theme";
import { createErpTenantContext, type ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
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
  OrganizationOnboardingPage,
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
import { subscriptionBillingApi } from "@/features/subscription/api/subscription.api";
import { getBillingPermissionsFromMember, hasBillingPermission, hasFeature } from "@/features/subscription/utils/subscription-access";
import {
  activateOrganization,
  authClient,
} from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
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
  const [canRenderSignupOnboarding, setCanRenderSignupOnboarding] =
    useState(false);
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
  const activeMemberPermissions = getBillingPermissionsFromMember(activeMember);
  const canReadSubscription = hasBillingPermission(activeMemberPermissions, "subscription.read");
  const subscriptionQuery = useQuery({ enabled: canReadSubscription && activeOrganizationType === "hospital", queryFn: subscriptionBillingApi.current, queryKey: subscriptionBillingApi.currentKey, retry: false, staleTime: 30_000 });
  const plansQuery = useQuery({ enabled: canReadSubscription && activeOrganizationType === "hospital", queryFn: subscriptionBillingApi.plans, queryKey: subscriptionBillingApi.plansKey, retry: false, staleTime: 60_000 });
  const allowedPages = getAllowedDashboardPages(
    activeMemberRole,
    activeMemberPermissions
  );
  const lockedPages = activeOrganizationType === "hospital"
    ? getLockedPages(subscriptionQuery.data, plansQuery.data)
    : [];
  const routablePages = allowedPages.filter((page) => !lockedPages.includes(page));
  const resolvedPage = routablePages.includes(currentPage)
    ? currentPage
    : resolveAccessibleDashboardPage("dashboard", activeMemberRole, activeMemberPermissions);
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
  const appointmentTenant = activeOrganization?.id && activeOrganizationType
    ? createErpTenantContext({
        organizationId: activeOrganization.id,
        organizationSlug: activeOrganizationSlug,
        permissions: activeMemberPermissions,
        providerType: activeOrganizationType,
        role: activeMemberRole,
      })
    : null;
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
      requestedPage !== "dashboard" ||
      activeOrganizationType !== "hospital" ||
      !activeOrganization?.id
    ) {
      return;
    }

    const completeKey = `viruj:hospital-onboarding:completed:${activeOrganization.id}`;

    if (
      window.localStorage.getItem(completeKey) ||
      !isRecentlyCreatedOrganization(activeOrganization)
    ) {
      return;
    }

    window.sessionStorage.setItem(
      `viruj:hospital-onboarding:entry:${activeOrganization.id}`,
      "1"
    );
    router.replace(
      activeOrganizationSlug
        ? buildTenantDashboardPath(
            activeOrganizationType,
            activeOrganizationSlug,
            "onboarding"
          )
        : buildDashboardPath(activeOrganizationType, "onboarding")
    );
  }, [
    activeOrganization,
    activeOrganization?.id,
    activeOrganizationSlug,
    activeOrganizationType,
    isAuthPending,
    isHydrated,
    requestedPage,
    router,
  ]);
  useEffect(() => {
    if (
      !isHydrated ||
      isAuthPending ||
      requestedPage !== "onboarding" ||
      !activeOrganization?.id ||
      !activeOrganizationType
    ) {
      return;
    }

    const entryKey = `viruj:hospital-onboarding:entry:${activeOrganization.id}`;
    const workspaceEntryKey = "viruj:hospital-onboarding:entry:workspace";
    const draftKey = `viruj:hospital-onboarding:draft:${activeOrganization.id}`;
    const startKey = "viruj:hospital-onboarding:start";
    const canEnter =
      window.localStorage.getItem(startKey) === "1" ||
      window.sessionStorage.getItem(entryKey) === "1" ||
      window.sessionStorage.getItem(workspaceEntryKey) === "1" ||
      Boolean(window.localStorage.getItem(draftKey));

    if (canEnter) {
      window.localStorage.removeItem(startKey);
      window.sessionStorage.setItem(entryKey, "1");
      window.sessionStorage.removeItem(workspaceEntryKey);
    }

    setCanRenderSignupOnboarding(canEnter);

    if (!canEnter) {
      router.replace(
        activeOrganizationSlug
          ? buildTenantDashboardPath(activeOrganizationType, activeOrganizationSlug)
          : buildDashboardPath(activeOrganizationType)
      );
    }
  }, [
    activeOrganization?.id,
    activeOrganizationSlug,
    activeOrganizationType,
    isAuthPending,
    isHydrated,
    requestedPage,
    router,
  ]);
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

  if (resolvedPage === "onboarding") {
    if (!canRenderSignupOnboarding) {
      return <LoadingScreen />;
    }

    return (
      <OrganizationOnboardingPage
        hospitalId={activeOrganization.id}
        organizationLabel={organizationLabel}
        organizationName={organizationName}
        userEmail={sessionState.data.user.email}
        userName={userName}
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
        lockedPages={lockedPages}
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
                  organizationName={organizationName}
                  appointmentTenant={appointmentTenant}
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
  organizationName,
  routeBasePath,
  routeSegments,
  appointmentTenant,
}: {
  currentPage: ErpDemoPage;
  organizationLabel: string;
  roleLabel: string;
  userName: string;
  organizationId?: string;
  organizationName?: string;
  routeBasePath: string;
  routeSegments: string[];
  appointmentTenant: ErpTenantContext | null;
}) {
  switch (currentPage) {
    case "onboarding":
      return (
        <OrganizationOnboardingPage
          hospitalId={organizationId}
          organizationLabel={organizationLabel}
          userName={userName}
        />
      );
    case "finance":
      return <ErpDemoBilling />;
    case "appointments":
    case "appointments-review":
      return appointmentTenant ? <ErpDemoAppointments section="review" tenant={appointmentTenant} /> : <ErpEnterpriseModule module="appointments" roleLabel={roleLabel} />;
    case "appointments-dashboard":
      return appointmentTenant ? <ErpDemoAppointments section="dashboard" tenant={appointmentTenant} /> : <ErpEnterpriseModule module="appointments" roleLabel={roleLabel} />;
    case "appointments-patients":
      return appointmentTenant ? <ErpDemoAppointments section="patients" tenant={appointmentTenant} /> : <ErpEnterpriseModule module="appointments" roleLabel={roleLabel} />;
    case "appointments-settings":
      return appointmentTenant ? <ErpDemoAppointments section="settings" tenant={appointmentTenant} /> : <ErpEnterpriseModule module="appointments" roleLabel={roleLabel} />;
    case "patients":
      return <ErpDemoPatients organizationId={organizationId} />;
    case "staff":
      return <ErpDemoStaff organizationLabel={organizationLabel} />;
    case "community":
      return <ErpDemoCommunity />;
    case "gallery":
      return (
        <ClinicGalleryPage
          key={organizationId ?? "workspace"}
          organizationId={organizationId}
        />
      );
    case "billing":
      return <ErpDemoBilling />;
    case "pricing":
    case "subscription":
      return <PricingPage organizationId={organizationId} organizationName={organizationName} />;
    case "settings":
      return <ErpDemoSettings key="settings-operational" organizationId={organizationId} section="operational" />;
    case "settings-alert-rules":
      return <ErpDemoSettings key="settings-notifications" organizationId={organizationId} section="notifications" />;
    case "settings-audit-logs":
      return <ErpDemoSettings key="settings-security" organizationId={organizationId} section="security" />;
    case "settings-storage":
    case "settings-data-export":
      return <ErpDemoSettings key="settings-operational" organizationId={organizationId} section="operational" />;
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
          tenant={appointmentTenant}
        />
      );
    case "hospital-profile":
      return (
        <HospitalProfilePage
          organizationId={organizationId}
          organizationLabel={organizationLabel}
          organizationName={organizationName}
        />
      );
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

function getLockedPages(subscription: Awaited<ReturnType<typeof subscriptionBillingApi.current>> | undefined, plans: Awaited<ReturnType<typeof subscriptionBillingApi.plans>> | undefined): ErpDemoPage[] {
  const plan = plans?.find((item) => item.id === subscription?.planId);
  const featureCodes = plan?.activeVersion.features.filter((feature) => feature.enabled).map((feature) => feature.code) ?? [];
  return hasFeature(featureCodes, "advanced_analytics") ? [] : ["analytics"];
}

function isRecentlyCreatedOrganization(organization: unknown) {
  if (
    !organization ||
    typeof organization !== "object" ||
    !("createdAt" in organization)
  ) {
    return false;
  }

  const createdAt = organization.createdAt;
  const createdTime =
    createdAt instanceof Date
      ? createdAt.getTime()
      : typeof createdAt === "string"
        ? new Date(createdAt).getTime()
        : 0;

  if (!Number.isFinite(createdTime) || createdTime <= 0) {
    return false;
  }

  return Date.now() - createdTime < 2 * 60 * 60 * 1000;
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
      createdAt?: string | Date;
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
      permissions?: string[];
      role?: string;
    };
  }

  return null;
}
