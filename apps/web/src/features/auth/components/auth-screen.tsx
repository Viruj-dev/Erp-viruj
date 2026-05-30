"use client";

import { ErpDemoLogin } from "@/features/auth/components/login-screen";
import {
  readPreferredProviderType,
  writePreferredProviderType,
} from "@/features/auth/lib/provider-type-preference";
import {
  buildDashboardPath,
  getDefaultDashboardPage,
  type DashboardOrganizationType,
  isDashboardOrganizationType,
} from "@/features/dashboard/lib/routing";
import {
  authClient,
  bootstrapOrganization,
  getAuthActionData,
  getAuthActionError,
  listOrganizations,
  setActiveOrganization,
} from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

export function ErpAuthScreen() {
  const router = useRouter();
  const [isActivatingOnlyOrganization, setIsActivatingOnlyOrganization] =
    useState(false);
  const [
    isResolvingPreferredOrganization,
    setIsResolvingPreferredOrganization,
  ] = useState(false);
  const [pendingProviderType, setPendingProviderType] =
    useState<DashboardOrganizationType | null>(null);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const sessionState = authClient.useSession();
  const activeMemberState = authClient.useActiveMember();
  const activeOrganizationState = authClient.useActiveOrganization();
  const organizationsState = authClient.useListOrganizations();

  const activatePreferredOrganization = async (
    preferredOrganizationType: DashboardOrganizationType
  ) => {
    if (!setActiveOrganization) {
      return;
    }

    const organizationsResult = listOrganizations
      ? await listOrganizations()
      : organizationsState.data;
    const organizations =
      getAuthActionData<
        Array<{
          id: string;
          organizationType?: string;
        }>
      >(organizationsResult) ??
      (Array.isArray(organizationsResult) ? organizationsResult : []);
    const matchingOrganization = organizations.find(
      (organization) =>
        organization.organizationType === preferredOrganizationType
    );

    const organizationId =
      matchingOrganization?.id ??
      (await createPreferredWorkspace(preferredOrganizationType));

    if (organizationId) {
      await setActiveOrganization({
        organizationId,
      });
    }
  };

  useEffect(() => {
    const organizations = organizationsState.data ?? [];
    const preferredOrganizationType = readPreferredProviderType();

    if (
      !sessionState.data?.user ||
      activeOrganizationState.data?.id ||
      organizations.length !== 1 ||
      isActivatingOnlyOrganization ||
      !setActiveOrganization ||
      organizations[0].organizationType !== preferredOrganizationType
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
    const preferredOrganizationType =
      pendingProviderType ??
      getRolePreferredOrganizationType(activeMemberState.data?.role);
    const activeOrganizationType =
      activeOrganizationState.data?.organizationType;

    if (
      !preferredOrganizationType ||
      !sessionState.data?.user ||
      activeOrganizationState.isPending ||
      activeMemberState.isPending ||
      isResolvingPreferredOrganization ||
      !setActiveOrganization ||
      activeOrganizationType === preferredOrganizationType
    ) {
      return;
    }

    setIsResolvingPreferredOrganization(true);
    void activatePreferredOrganization(preferredOrganizationType)
      .then(() =>
        Promise.all([
          sessionState.refetch(),
          activeOrganizationState.refetch(),
          activeMemberState.refetch(),
          organizationsState.refetch(),
        ])
      )
      .catch((error) => {
        console.error("[Auth] Failed to activate preferred workspace:", error);
      })
      .finally(() => {
        setPendingProviderType(null);
        setIsResolvingPreferredOrganization(false);
      });
  }, [
    activeMemberState,
    activeMemberState.data?.role,
    activeMemberState.isPending,
    activeOrganizationState,
    activeOrganizationState.data?.organizationType,
    activeOrganizationState.isPending,
    isResolvingPreferredOrganization,
    organizationsState,
    pendingProviderType,
    sessionState,
    sessionState.data?.user,
  ]);

  useEffect(() => {
    const preferredOrganizationType =
      pendingProviderType ??
      getRolePreferredOrganizationType(activeMemberState.data?.role);
    const activeOrganizationType =
      activeOrganizationState.data?.organizationType;

    if (
      !sessionState.data?.user ||
      activeOrganizationState.isPending ||
      activeMemberState.isPending ||
      isResolvingPreferredOrganization ||
      (preferredOrganizationType &&
        activeOrganizationType !== preferredOrganizationType)
    ) {
      return;
    }

    if (
      activeOrganizationType &&
      isDashboardOrganizationType(activeOrganizationType)
    ) {
      router.replace(
        buildDashboardPath(
          preferredOrganizationType ?? activeOrganizationType,
          getDefaultDashboardPage(activeMemberState.data?.role)
        )
      );
      return;
    }

    router.replace("/dashboard");
  }, [
    activeMemberState.data?.role,
    activeMemberState.isPending,
    activeOrganizationState.data?.organizationType,
    activeOrganizationState.isPending,
    isResolvingPreferredOrganization,
    pendingProviderType,
    router,
    sessionState.data?.user,
  ]);

  return (
    <ErpDemoLogin
      onAuthenticated={async (preferredOrganizationType) => {
        writePreferredProviderType(preferredOrganizationType);
        setPendingProviderType(preferredOrganizationType);
        await activatePreferredOrganization(preferredOrganizationType);
        await Promise.all([
          sessionState.refetch(),
          activeOrganizationState.refetch(),
          activeMemberState.refetch(),
        ]);
      }}
    />
  );
}

function getRolePreferredOrganizationType(
  role?: string | null
): DashboardOrganizationType | null {
  return role === "doctor" ? "doctor" : null;
}

async function createPreferredWorkspace(
  organizationType: DashboardOrganizationType
) {
  const result = await bootstrapOrganization({
    name:
      organizationType === "doctor"
        ? "Independent Doctor Workspace"
        : `Viruj ${organizationType} Workspace`,
    organizationType,
    slug: buildWorkspaceSlug(organizationType),
  });
  const error = getAuthActionError(result);

  if (error) {
    throw new Error(error);
  }

  const organization = getAuthActionData<{
    id?: string;
  }>(result);

  return organization?.id ?? null;
}

function buildWorkspaceSlug(organizationType: DashboardOrganizationType) {
  const suffix = Math.random().toString(36).slice(2, 8);
  return organizationType === "doctor"
    ? `doctor-workspace-${suffix}`
    : `viruj-${organizationType}-${suffix}`;
}
