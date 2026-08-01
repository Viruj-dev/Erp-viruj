"use client";

import { OrganizationAccessScreen } from "@/features/auth/components/organization-access-screen";
import {
  ClinicDepartmentsPage,
  ClinicGalleryPage,
  ClinicLocationsPage,
  ClinicOfferingsPage,
  ClinicPatientsPage,
  ClinicProfileManagementPage,
  ClinicReviewsPage,
  ClinicSettingsPage,
  ClinicWorkingHoursPage,
} from "@/features/dashboard/components/clinic/pages";
import {
  DoctorsManagementPage,
  ErpDemoAnalytics,
  ErpDemoCommunity,
  ErpDemoDashboard,
  ErpDemoPatients,
  FacilitiesPage,
  OrganizationOnboardingPage,
} from "@/features/dashboard/components/hospital/pages";
import { ErpDemoSidebar, ErpDemoTopBar } from "@/features/dashboard/components/shared/layout";
import { getWorkspaceTheme } from "@/features/dashboard/components/shared/layout/role-theme";
import type { ErpDemoPage } from "@/features/dashboard/components/shared/types";
import { createErpTenantContext, type ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import {
  buildDashboardPath,
  buildTenantDashboardPath,
  getAllowedDashboardPages,
  isDashboardOrganizationType,
  isDashboardPage,
  organizationTypeLabels,
} from "@/features/dashboard/lib/routing";
import { LoadingScreen } from "@/features/shell/components/loading-screen";
import { activateOrganization, authClient } from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

const clinicSupportedPages: ErpDemoPage[] = [
  "dashboard",
  "onboarding",
  "appointments",
  "appointments-dashboard",
  "appointments-review",
  "appointments-patients",
  "appointments-settings",
  "clinic-profile",
  "locations",
  "working-hours",
  "patients",
  "doctors",
  "departments",
  "offerings",
  "services",
  "facilities",
  "gallery",
  "community",
  "reviews",
  "settings",
  "analytics",
  "profile",
];

const clinicOnboardingStoragePrefix = "viruj:clinic-onboarding";

export function ClinicHomeScreen({
  currentPage: requestedPage,
  routeSegments,
}: {
  currentPage: string;
  routeOrganizationType?: string;
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
  const isAuthPending = sessionState.isPending || organizationsState.isPending;

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
    void activateOrganization({ organizationId: organizations[0].id })
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

  const currentPage = isErpDemoPage(requestedPage) ? requestedPage : "dashboard";
  const activeOrganizationType =
    activeOrganization?.organizationType &&
    isDashboardOrganizationType(activeOrganization.organizationType)
      ? activeOrganization.organizationType
      : null;
  const activeOrganizationSlug = getOrganizationSlug(activeOrganization);
  const activeMemberRole = activeMember?.role;
  const activeMemberPermissions = getMemberPermissions(activeMember);
  const allowedPages = useMemo(
    () => getClinicAllowedPages(activeMemberRole),
    [activeMemberRole]
  );
  const resolvedPage = resolveClinicPage(currentPage, allowedPages);
  const userName =
    sessionState.data?.user?.name ||
    sessionState.data?.user?.email ||
    "Clinic User";
  const roleLabel = activeMemberRole
    ? activeMemberRole.replace(/_/g, " ")
    : "clinic member";
  const appointmentTenant = activeOrganization?.id
    ? createErpTenantContext({
        organizationId: activeOrganization.id,
        organizationSlug: activeOrganizationSlug,
        permissions: activeMemberPermissions,
        providerType: "clinic",
        role: activeMemberRole,
      })
    : null;
  const organizationLabel = organizationTypeLabels.clinic;
  const organizationName = getOrganizationDisplayName(
    activeOrganization,
    organizationLabel
  );
  const workspaceTheme = getWorkspaceTheme(organizationLabel);
  const clinicDashboardPath = activeOrganizationSlug
    ? buildTenantDashboardPath("clinic", activeOrganizationSlug)
    : buildDashboardPath("clinic");
  const clinicOnboardingPath = activeOrganizationSlug
    ? buildTenantDashboardPath("clinic", activeOrganizationSlug, "onboarding")
    : buildDashboardPath("clinic", "onboarding");

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
      activeOrganizationType !== "clinic" ||
      !activeOrganization?.id
    ) {
      return;
    }

    const completeKey = `${clinicOnboardingStoragePrefix}:completed:${activeOrganization.id}`;

    if (
      window.localStorage.getItem(completeKey) ||
      !isRecentlyCreatedOrganization(activeOrganization)
    ) {
      return;
    }

    window.sessionStorage.setItem(
      `${clinicOnboardingStoragePrefix}:entry:${activeOrganization.id}`,
      "1"
    );
    router.replace(clinicOnboardingPath);
  }, [
    activeOrganization,
    activeOrganization?.id,
    activeOrganizationType,
    clinicOnboardingPath,
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
      activeOrganizationType !== "clinic"
    ) {
      return;
    }

    const entryKey = `${clinicOnboardingStoragePrefix}:entry:${activeOrganization.id}`;
    const workspaceEntryKey = `${clinicOnboardingStoragePrefix}:entry:workspace`;
    const draftKey = `${clinicOnboardingStoragePrefix}:draft:${activeOrganization.id}`;
    const startKey = `${clinicOnboardingStoragePrefix}:start`;
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
      router.replace(clinicDashboardPath);
    }
  }, [
    activeOrganization?.id,
    activeOrganizationType,
    clinicDashboardPath,
    isAuthPending,
    isHydrated,
    requestedPage,
    router,
  ]);

  useEffect(() => {
    if (!isHydrated || isAuthPending || !activeOrganization || !activeMember) {
      return;
    }

    if (activeOrganizationType && activeOrganizationType !== "clinic") {
      router.replace(buildDashboardPath(activeOrganizationType));
      return;
    }

    const expectedPath = activeOrganizationSlug
      ? buildTenantDashboardPath("clinic", activeOrganizationSlug, resolvedPage)
      : buildDashboardPath("clinic", resolvedPage);

    if (requestedPage !== resolvedPage) {
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
    router,
  ]);

  if (!isHydrated || isAuthPending) {
    return <LoadingScreen />;
  }

  if (!sessionState.data?.user) {
    return <LoadingScreen />;
  }

  if (activeOrganizationType && activeOrganizationType !== "clinic") {
    return <LoadingScreen />;
  }

  if (!activeOrganization || !activeMember) {
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

          await activateOrganization({ organizationId });
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
        dashboardPath={clinicDashboardPath}
        organizationId={activeOrganization.id}
        organizationLabel={organizationLabel}
        organizationName={organizationName}
        organizationType="clinic"
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
        currentPage={resolvedPage}
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
          const clinicPage = resolveClinicPage(page, allowedPages);
          router.push(
            activeOrganizationSlug
              ? buildTenantDashboardPath("clinic", activeOrganizationSlug, clinicPage)
              : buildDashboardPath("clinic", clinicPage)
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
                ? buildTenantDashboardPath("clinic", activeOrganizationSlug, "clinic-profile")
                : buildDashboardPath("clinic", "clinic-profile")
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
                className={`flex min-h-full w-full flex-col overflow-hidden rounded-[2rem] border shadow-sm ring-1 backdrop-blur ${workspaceTheme.contentFrame}`}
              >
                <ClinicPageContent
                  appointmentTenant={appointmentTenant}
                  currentPage={resolvedPage}
                  organizationId={activeOrganization.id}
                  roleLabel={roleLabel}
                  routeBasePath={
                    activeOrganizationSlug
                      ? `/clinic/${activeOrganizationSlug}`
                      : "/clinic"
                  }
                  routeSegments={routeSegments ?? [resolvedPage]}
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

function ClinicPageContent({
  appointmentTenant,
  currentPage,
  organizationId,
  roleLabel,
  routeBasePath,
  routeSegments,
  userName,
}: {
  appointmentTenant: ErpTenantContext | null;
  currentPage: ErpDemoPage;
  organizationId?: string;
  roleLabel: string;
  routeBasePath: string;
  routeSegments: string[];
  userName: string;
}) {
  switch (currentPage) {
    case "onboarding":
      return null;
    case "appointments":
    case "appointments-review":
    case "appointments-dashboard":
    case "appointments-patients":
      return <ErpDemoPatients organizationId={organizationId} tone="violet" />;
    case "appointments-settings":
      return <ErpDemoPatients organizationId={organizationId} tone="violet" />;
    case "clinic-profile":
    case "profile":
      return <ClinicProfileManagementPage organizationId={organizationId} />;
    case "locations":
      return <ClinicLocationsPage />;
    case "working-hours":
      return <ClinicWorkingHoursPage />;
    case "patients":
      return <ClinicPatientsPage />;
    case "doctors":
      return (
        <DoctorsManagementPage
          organizationId={organizationId}
          organizationLabel="Clinic"
        />
      );
    case "departments":
      return <ClinicDepartmentsPage organizationId={organizationId} />;
    case "offerings":
      return <ClinicOfferingsPage />;
    case "services":
      return appointmentTenant ? (
        <FacilitiesPage
          catalogKind="services"
          routeBasePath={routeBasePath}
          routeSegments={routeSegments}
          tenant={appointmentTenant}
        />
      ) : null;
    case "facilities":
      return appointmentTenant ? (
        <FacilitiesPage
          catalogKind="facilities"
          routeBasePath={routeBasePath}
          routeSegments={routeSegments}
          tenant={appointmentTenant}
        />
      ) : null;
    case "gallery":
      return (
        <ClinicGalleryPage
          key={organizationId ?? "clinic-workspace"}
          organizationId={organizationId}
        />
      );
    case "community":
      return <ErpDemoCommunity />;
    case "reviews":
      return <ClinicReviewsPage />;
    case "analytics":
      return <ErpDemoAnalytics />;
    case "settings":
      return <ClinicSettingsPage />;
    case "dashboard":
    default:
      return (
        <ErpDemoDashboard
          organizationId={organizationId}
          organizationLabel="Clinic"
          roleLabel={roleLabel}
          userName={userName}
        />
      );
  }
}

function resolveClinicPage(page: ErpDemoPage, allowedPages: ErpDemoPage[]) {
  if (allowedPages.includes(page)) {
    return page;
  }

  return allowedPages.includes("dashboard") ? "dashboard" : allowedPages[0] ?? "dashboard";
}

function getClinicAllowedPages(role?: string | null): ErpDemoPage[] {
  const clinicAdminRoles = new Set([
    "ADMIN",
    "CLINIC_ADMIN",
    "CLINIC_OWNER",
    "ORG_ADMIN",
    "OWNER",
    "admin",
    "owner",
  ]);

  if (!role || clinicAdminRoles.has(role)) {
    return clinicSupportedPages;
  }

  const rolePages = getAllowedDashboardPages(role).filter((page) =>
    clinicSupportedPages.includes(page)
  );

  return rolePages.includes("offerings")
    ? rolePages
    : [...rolePages, "offerings"];
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
      createdAt?: string | Date;
      id?: string;
      organizationType?: string;
      slug?: string;
    };
  }

  return null;
}

function getMemberPermissions(member: unknown) {
  if (
    member &&
    typeof member === "object" &&
    "permissions" in member &&
    Array.isArray(member.permissions)
  ) {
    return member.permissions.filter(
      (permission): permission is string => typeof permission === "string"
    );
  }

  return [];
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
