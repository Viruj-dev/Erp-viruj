"use client";

import { ErpHomeScreen } from "@/features/dashboard/screens/erp-home-screen";
import { authClient } from "@/lib/auth-client";
import { LoadingScreen } from "@/features/shell/components/loading-screen";
import {
  buildDashboardPath,
  getDefaultDashboardPage,
  isDashboardOrganizationType,
} from "@/features/dashboard/lib/routing";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const sessionState = authClient.useSession();
  const activeOrganizationState = authClient.useActiveOrganization();
  const activeMemberState = authClient.useActiveMember();

  useEffect(() => {
    if (
      sessionState.isPending ||
      activeOrganizationState.isPending ||
      activeMemberState.isPending
    ) {
      return;
    }

    if (!sessionState.data?.user) {
      router.replace("/auth");
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
    }
  }, [
    activeMemberState.data?.role,
    activeMemberState.isPending,
    activeOrganizationState.data?.organizationType,
    activeOrganizationState.isPending,
    router,
    sessionState.data?.user,
    sessionState.isPending,
  ]);

  return <LoadingScreen />;
}
