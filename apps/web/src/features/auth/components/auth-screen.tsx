"use client";

import { ErpDemoLogin } from "@/features/auth/components/login-screen";
import {
  buildDashboardPath,
  getDefaultDashboardPage,
  isDashboardOrganizationType,
} from "@/features/dashboard/lib/routing";
import { authClient, setActiveOrganization } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

export function ErpAuthScreen() {
  const router = useRouter();
  const [isActivatingOnlyOrganization, setIsActivatingOnlyOrganization] =
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

  useEffect(() => {
    const organizations = organizationsState.data ?? [];

    if (
      !sessionState.data?.user ||
      activeOrganizationState.data?.id ||
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
    const activeOrganizationType =
      activeOrganizationState.data?.organizationType;

    if (
      !sessionState.data?.user ||
      activeOrganizationState.isPending ||
      activeMemberState.isPending
    ) {
      return;
    }

    if (
      activeOrganizationType &&
      isDashboardOrganizationType(activeOrganizationType)
    ) {
      router.replace(
        buildDashboardPath(
          activeOrganizationType,
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
    router,
    sessionState.data?.user,
  ]);

  return (
    <ErpDemoLogin
      onAuthenticated={async () => {
        await Promise.all([
          sessionState.refetch(),
          activeOrganizationState.refetch(),
          activeMemberState.refetch(),
        ]);
      }}
    />
  );
}
