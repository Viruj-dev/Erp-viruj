"use client";

import { OrganizationAccessScreen } from "@/features/auth/components/organization-access-screen";
import { ErpDemoAppointments, ErpEnterpriseModule } from "@/features/dashboard/components/shared/modules";
import {
  DoctorAvailabilityPage,
  DoctorAppointmentDetailPage,
  DoctorAppointmentsPage,
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
import { ErpDemoSidebar, ErpDemoTopBar } from "@/features/dashboard/components/shared/layout";
import type { ErpDemoPage } from "@/features/dashboard/components/shared/types";
import {
  buildDashboardPath,
  buildTenantDashboardPath,
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
import { useEffect, useState, useSyncExternalStore } from "react";

const doctorAllowedPages: ErpDemoPage[] = [
  "dashboard",
  "appointments",
  "appointments-dashboard",
  "appointments-review",
  "patients",
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

  const currentPage = requestedPage === "settings"
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
  const resolvedPage = resolveDoctorPage(
    currentPage
  );
  const detailId = getDoctorDetailId(resolvedPage, routeSegments);
  const userName =
    sessionState.data?.user?.name ||
    sessionState.data?.user?.email ||
    "Doctor";
  const roleLabel = activeMember?.role
    ? activeMember.role.replace(/_/g, " ")
    : "doctor";
  const organizationLabel = organizationTypeLabels.doctor;

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
    return <LoadingScreen />;
  }

  if (!sessionState.data?.user) {
    return <LoadingScreen />;
  }

  if (activeOrganizationType && activeOrganizationType !== "doctor") {
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
    <div className="flex h-screen min-h-screen bg-surface text-on-surface selection:bg-primary/15 selection:text-primary transition-colors dark:bg-[#0b0d10] dark:text-slate-100">
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
              ? buildTenantDashboardPath("doctor", activeOrganizationSlug, doctorPage)
              : buildDashboardPath("doctor", doctorPage)
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
                ? buildTenantDashboardPath("doctor", activeOrganizationSlug, "profile")
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
                <DoctorPageContent
                  currentPage={resolvedPage}
                  detailId={detailId}
                  roleLabel={roleLabel}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function DoctorPageContent({
  currentPage,
  detailId,
  roleLabel,
}: {
  currentPage: ErpDemoPage;
  detailId?: string;
  roleLabel: string;
}) {
  switch (currentPage) {
    case "appointments":
    case "appointments-dashboard":
      return detailId ? <DoctorAppointmentDetailPage id={detailId} /> : <DoctorAppointmentsPage />;
    case "appointments-review":
      return <ErpDemoAppointments section="review" />;
    case "patients":
      return detailId ? <DoctorPatientDetailPage id={detailId} /> : <DoctorPatientDirectoryPage />;
    case "onboarding":
      return <DoctorOnboardingCenterPage />;
    case "availability":
      return <DoctorAvailabilityPage />;
    case "documents":
      return <DoctorDocumentsPage />;
    case "leaves":
      return <DoctorLeavesPage />;
    case "consultations":
      return detailId ? <DoctorConsultationDetailPage id={detailId} /> : <DoctorConsultationsPage />;
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
  const moduleIndex = segments.findIndex((segment) => segment === page || (page === "appointments-dashboard" && segment === "appointments"));
  const candidate = moduleIndex >= 0 ? segments[moduleIndex + 1] : undefined;

  if (!candidate || candidate === "dashboard" || candidate === "review" || candidate === "patients") {
    return undefined;
  }

  return candidate;
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
