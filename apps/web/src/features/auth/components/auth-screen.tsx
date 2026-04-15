"use client";

import { ErpDemoLogin } from "@/features/auth/components/login-screen";
import {
  buildDashboardPath,
  getDefaultDashboardPage,
  isDashboardOrganizationType,
} from "@/features/dashboard/lib/routing";
import { LoadingScreen } from "@/features/shell/components/loading-screen";
import { authClient, setActiveOrganization } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

export function ErpAuthScreen() {
  const router = useRouter();
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
      organizations.length !== 1
    ) {
      return;
    }

    void setActiveOrganization({
      organizationId: organizations[0].id,
    });
  }, [
    activeOrganizationState.data?.id,
    organizationsState.data,
    sessionState.data?.user,
  ]);

  useEffect(() => {
    if (
      !sessionState.data?.user ||
      activeOrganizationState.isPending ||
      activeMemberState.isPending
    ) {
      return;
    }

    if (
      activeOrganizationState.data?.organizationType &&
      isDashboardOrganizationType(activeOrganizationState.data.organizationType)
    ) {
      router.replace(
        buildDashboardPath(
          activeOrganizationState.data.organizationType,
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

  if (
    !isHydrated ||
    sessionState.isPending ||
    activeOrganizationState.isPending ||
    activeMemberState.isPending
  ) {
    return <LoadingScreen />;
  }

  if (sessionState.data?.user) {
    return <LoadingScreen />;
  }

  return (
    <ErpDemoLogin
      onAuthenticated={async () => {
        await sessionState.refetch();
        router.replace("/dashboard");
      }}
    />
  );
}
