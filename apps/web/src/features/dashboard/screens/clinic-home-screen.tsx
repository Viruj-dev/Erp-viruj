"use client";

import { OrganizationAccessScreen } from "@/features/auth/components/organization-access-screen";
import {
  ClinicDashboardPage,
  ClinicDoctorsPresencePage,
  ClinicFacilitiesPage,
  ClinicGalleryPage,
  ClinicLocationsPage,
  ClinicOfferingsPage,
  ClinicPatientsPage,
  ClinicProfileManagementPage,
  ClinicReviewsPage,
  ClinicServicesPage,
  ClinicSettingsPage,
  ClinicWorkingHoursPage,
} from "@/features/dashboard/components/clinic/pages";
import {
  ErpDemoAnalytics,
  ErpDemoCommunity,
} from "@/features/dashboard/components/hospital/pages";
import { ErpDemoSidebar, ErpDemoTopBar } from "@/features/dashboard/components/shared/layout";
import { getWorkspaceTheme } from "@/features/dashboard/components/shared/layout/role-theme";
import { ErpUserProfilePage } from "@/features/dashboard/components/shared/profile";
import type { ErpDemoPage } from "@/features/dashboard/components/shared/types";
import {
  buildDashboardPath,
  buildTenantDashboardPath,
  getAllowedDashboardPages,
  isDashboardOrganizationType,
  isDashboardPage,
  organizationTypeLabels,
} from "@/features/dashboard/lib/routing";
import { LoadingScreen } from "@/features/shell/components/loading-screen";
import {
  activateOrganization,
  authClient,
} from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

const clinicSupportedPages: ErpDemoPage[] = [
  "dashboard",
  "clinic-profile",
  "locations",
  "working-hours",
  "patients",
  "doctors",
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

export function ClinicHomeScreen({
  currentPage: requestedPage,
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
    : "dashboard";
  const activeOrganizationType =
    activeOrganization?.organizationType &&
    isDashboardOrganizationType(activeOrganization.organizationType)
      ? activeOrganization.organizationType
      : null;
  const activeOrganizationSlug = getOrganizationSlug(activeOrganization);
  const activeMemberRole = activeMember?.role;
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
  const organizationLabel = organizationTypeLabels.clinic;
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
          currentPage={resolvedPage}
          organizationLabel={organizationLabel}
          roleLabel={roleLabel}
          userName={userName}
          onNavigateToProfile={() => {
            router.push(
              activeOrganizationSlug
                ? buildTenantDashboardPath("clinic", activeOrganizationSlug, "profile")
                : buildDashboardPath("clinic", "profile")
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
                  currentPage={resolvedPage}
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

function ClinicPageContent({
  currentPage,
  roleLabel,
  userName,
}: {
  currentPage: ErpDemoPage;
  roleLabel: string;
  userName: string;
}) {
  switch (currentPage) {
    case "clinic-profile":
      return <ClinicProfileManagementPage />;
    case "locations":
      return <ClinicLocationsPage />;
    case "working-hours":
      return <ClinicWorkingHoursPage />;
    case "patients":
      return <ClinicPatientsPage />;
    case "doctors":
      return <ClinicDoctorsPresencePage />;
    case "offerings":
      return <ClinicOfferingsPage />;
    case "services":
      return <ClinicServicesPage />;
    case "facilities":
      return <ClinicFacilitiesPage />;
    case "gallery":
      return <ClinicGalleryPage />;
    case "community":
      return <ErpDemoCommunity />;
    case "reviews":
      return <ClinicReviewsPage />;
    case "analytics":
      return <ErpDemoAnalytics />;
    case "settings":
      return <ClinicSettingsPage />;
    case "profile":
      return <ErpUserProfilePage />;
    case "dashboard":
    default:
      return <ClinicDashboardPage roleLabel={roleLabel} userName={userName} />;
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
