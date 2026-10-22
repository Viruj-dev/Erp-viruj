"use client";

import { DoctorOnboardingGate } from "@/features/dashboard/components/doctor/pages/doctor-onboarding-flow";
import { DoctorWorkspaceContext } from "@/features/dashboard/lib/doctor-workspace";
import { DoctorReminders } from "@/features/dashboard/components/doctor/pages/doctor-calendar";
import { OrganizationAccessScreen } from "@/features/auth/components/organization-access-screen";
import { ErpEnterpriseModule } from "@/features/dashboard/components/shared/modules";
import { ClinicGalleryPage } from "@/features/dashboard/components/clinic/pages";
import {
  DoctorAvailabilityPage,
  DoctorConsultationDetailPage,
  DoctorConsultationsPage,
  DoctorDashboardPage,
  DoctorDocumentsPage,
  DoctorLeavesPage,
  DoctorOnboardingCenterPage,
  DoctorPatientDirectoryPage,
  DoctorPatientDetailPage,
  DoctorPracticeLocationsPage,
  DoctorProfileManagementPage,
  DoctorSettingsPage,
  DoctorVerificationVaultPage,
} from "@/features/dashboard/components/doctor/pages";
import { ErpDemoCommunity } from "@/features/dashboard/components/hospital/pages";
import {
  ErpDemoSidebar,
  ErpDemoTopBar,
} from "@/features/dashboard/components/shared/layout";
import { getWorkspaceTheme } from "@/features/dashboard/components/shared/layout/role-theme";
import {
  createErpTenantContext,
  type ErpTenantContext,
} from "@/features/dashboard/lib/erp-tenant";
import { getBillingPermissionsFromMember } from "@/features/subscription/utils/subscription-access";
import type { ErpDemoPage } from "@/features/dashboard/components/shared/types";
import {
  buildDashboardPath,
  buildTenantDashboardPath,
  isDashboardOrganizationType,
  isDashboardPage,
  organizationTypeLabels,
} from "@/features/dashboard/lib/routing";
import { WorkspaceSkeleton } from "@/features/dashboard/components/shared/page-skeleton";
import { activateOrganization, authClient } from "@/lib/auth-client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

const doctorAllowedPages: ErpDemoPage[] = [
  "dashboard",
  "appointments",
  "appointments-dashboard",
  "appointments-review",
  "appointments-patients",
  "patients",
  "gallery",
  "community",
  "onboarding",
  "availability",
  "documents",
  "leaves",
  "consultations",
  "locations",
  "verification",
  "doctor-settings",
  "reports",
  "profile",
];

export function DoctorHomeScreen({
  currentPage: requestedPage,
  routeSegments = [],
}: {
  currentPage: string;
  routeOrganizationType?: string;
  routeSegments?: string[];
}) {
  const router = useRouter();
  const [isActivatingOnlyOrganization, setIsActivatingOnlyOrganization] =
    useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const reduceMotion = useReducedMotion();
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

  const currentPage =
    requestedPage === "settings"
      ? "doctor-settings"
      : isErpDemoPage(requestedPage)
        ? requestedPage
        : "dashboard";
  const activeOrganizationType =
    activeOrganization?.organizationType &&
    isDashboardOrganizationType(activeOrganization.organizationType)
      ? activeOrganization.organizationType
      : null;
  const activeOrganizationSlug = getOrganizationSlug(activeOrganization);
  const resolvedPage = resolveDoctorPage(currentPage);
  const detailId = getDoctorDetailId(resolvedPage, routeSegments);
  const userName =
    sessionState.data?.user?.name || sessionState.data?.user?.email || "Doctor";
  const roleLabel = activeMember?.role
    ? activeMember.role.replace(/_/g, " ")
    : "doctor";
  const organizationLabel = organizationTypeLabels.doctor;
  const organizationName = getOrganizationDisplayName(
    activeOrganization,
    organizationLabel
  );
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

    if (activeOrganizationType && activeOrganizationType !== "doctor") {
      router.replace(buildDashboardPath(activeOrganizationType));
      return;
    }

    const expectedPath = activeOrganizationSlug
      ? buildTenantDashboardPath("doctor", activeOrganizationSlug, resolvedPage)
      : buildDashboardPath("doctor", resolvedPage);

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
    return <WorkspaceSkeleton />;
  }

  if (!sessionState.data?.user) {
    return <WorkspaceSkeleton />;
  }

  if (activeOrganizationType && activeOrganizationType !== "doctor") {
    return <WorkspaceSkeleton />;
  }

  if (!activeOrganization?.id || !activeMember) {
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

  const doctorTenant =
    createErpTenantContext({
      organizationId: activeOrganization.id,
      organizationSlug: activeOrganizationSlug,
      providerType: "doctor",
      role: activeMember.role,
      permissions: getBillingPermissionsFromMember(activeMember),
    }) ?? undefined;
  return (
    <DoctorWorkspaceContext.Provider value={doctorTenant}>
      <DoctorOnboardingGate
        currentPage={resolvedPage}
        organizationName={organizationName}
        userName={userName}
        userEmail={sessionState.data.user.email || ""}
      >
        <div
          className={`erp-workspace flex h-dvh min-h-dvh bg-surface text-on-surface transition-colors dark:bg-[#0b0d10] dark:text-slate-100 ${workspaceTheme.selection}`}
        >
          <ErpDemoSidebar
            allowedPages={doctorAllowedPages}
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
              const doctorPage = resolveDoctorPage(page);
              router.push(
                activeOrganizationSlug
                  ? buildTenantDashboardPath(
                      "doctor",
                      activeOrganizationSlug,
                      doctorPage
                    )
                  : buildDashboardPath("doctor", doctorPage)
              );
            }}
            onToggle={() => setIsSidebarCollapsed((value) => !value)}
            organizationLabel={organizationLabel}
          />
          <main
            className={`erp-main flex h-dvh min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-300 motion-reduce:transition-none ${
              isSidebarCollapsed
                ? "ml-[76px] lg:ml-[88px]"
                : "ml-[76px] lg:ml-[264px]"
            }`}
          >
            <div className="erp-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
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
                          "doctor",
                          activeOrganizationSlug,
                          "profile"
                        )
                      : buildDashboardPath("doctor", "profile")
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
              <AnimatePresence mode="wait">
                <motion.div
                  key={resolvedPage}
                  animate={{ opacity: 1, y: 0 }}
                  className="erp-page mx-auto flex min-h-full w-full max-w-[1800px] p-3 sm:p-5 lg:p-7"
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.22,
                    ease: "easeOut",
                  }}
                >
                  <div
                    className={`erp-page-content flex min-h-full w-full flex-col`}
                  >
                    <DoctorPageContent
                      currentPage={resolvedPage}
                      detailId={detailId}
                      organizationId={activeOrganization.id}
                      roleLabel={roleLabel}
                      tenant={
                        activeOrganization.id
                          ? (createErpTenantContext({
                              organizationId: activeOrganization.id,
                              organizationSlug: activeOrganizationSlug,
                              providerType: "doctor",
                              role: activeMember?.role,
                              permissions:
                                getBillingPermissionsFromMember(activeMember),
                            }) ?? undefined)
                          : undefined
                      }
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </DoctorOnboardingGate>
    </DoctorWorkspaceContext.Provider>
  );
}

function DoctorPageContent({
  currentPage,
  detailId,
  organizationId,
  roleLabel,
  tenant,
}: {
  currentPage: ErpDemoPage;
  detailId?: string;
  organizationId?: string;
  roleLabel: string;
  tenant?: ErpTenantContext;
}) {
  return (
    <DoctorWorkspaceContext.Provider value={tenant}>
      <DoctorReminders />
      <DoctorPageBody
        currentPage={currentPage}
        detailId={detailId}
        organizationId={organizationId}
        roleLabel={roleLabel}
        tenant={tenant}
      />
    </DoctorWorkspaceContext.Provider>
  );
}
function DoctorPageBody({
  currentPage,
  detailId,
  organizationId,
  roleLabel,
  tenant,
}: {
  currentPage: ErpDemoPage;
  detailId?: string;
  organizationId?: string;
  roleLabel: string;
  tenant?: ErpTenantContext;
}) {
  switch (currentPage) {
    case "appointments":
    case "appointments-dashboard":
    case "appointments-review":
      return <DoctorConsultationsPage />;
    case "appointments-patients":
      return <DoctorPatientDirectoryPage />;
    case "patients":
      return detailId ? (
        <DoctorPatientDetailPage id={detailId} />
      ) : (
        <DoctorPatientDirectoryPage />
      );
    case "gallery":
      return (
        <ClinicGalleryPage
          key={organizationId ?? "doctor-workspace"}
          organizationId={organizationId}
        />
      );
    case "community":
      return <ErpDemoCommunity />;
    case "onboarding":
      return <DoctorOnboardingCenterPage />;
    case "availability":
      return <DoctorAvailabilityPage />;
    case "documents":
      return <DoctorDocumentsPage />;
    case "leaves":
      return <DoctorLeavesPage />;
    case "consultations":
      return detailId ? (
        <DoctorConsultationDetailPage id={detailId} />
      ) : (
        <DoctorConsultationsPage />
      );
    case "locations":
      return <DoctorPracticeLocationsPage />;
    case "verification":
      return <DoctorVerificationVaultPage />;
    case "doctor-settings":
      return <DoctorSettingsPage />;
    case "reports":
      return <ErpEnterpriseModule module="reports" roleLabel={roleLabel} />;
    case "profile":
      return <DoctorProfileManagementPage />;
    case "dashboard":
    default:
      return <DoctorDashboardPage />;
  }
}

function resolveDoctorPage(page: ErpDemoPage): ErpDemoPage {
  if (doctorAllowedPages.includes(page)) {
    return page;
  }

  return "dashboard";
}

function getDoctorDetailId(page: ErpDemoPage, segments: string[]) {
  const moduleIndex = segments.findIndex(
    (segment) =>
      segment === page ||
      (page === "appointments-dashboard" && segment === "appointments")
  );
  const candidate = moduleIndex >= 0 ? segments[moduleIndex + 1] : undefined;

  if (
    !candidate ||
    candidate === "dashboard" ||
    candidate === "review" ||
    candidate === "patients"
  ) {
    return undefined;
  }

  return candidate;
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
      name?: string;
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
