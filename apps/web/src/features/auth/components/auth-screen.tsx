"use client";

import { ErpDemoLogin } from "@/features/auth/components/login-screen";
import {
  buildDashboardPath,
  getDefaultDashboardPage,
  isDashboardOrganizationType,
} from "@/features/dashboard/lib/routing";
import { activateOrganization, authClient } from "@/lib/auth-client";
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
  const sessionOrganization = getSessionOrganization(sessionState.data);
  const sessionMember = getSessionMember(sessionState.data);
  const activeOrganization = sessionOrganization ?? activeOrganizationState.data;
  const activeMember = sessionMember ?? activeMemberState.data;

  useEffect(() => {
    const organizations = organizationsState.data ?? [];

    if (
      !sessionState.data?.user ||
      activeOrganization?.id ||
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

  useEffect(() => {
    const activeOrganizationType = activeOrganization?.organizationType;

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
      const shouldStartOnboarding =
        activeOrganizationType === "hospital" &&
        typeof window !== "undefined" &&
        window.localStorage.getItem("viruj:hospital-onboarding:start") === "1";

      if (shouldStartOnboarding) {
        window.localStorage.removeItem("viruj:hospital-onboarding:start");
      }

      router.replace(
        buildDashboardPath(
          activeOrganizationType,
          shouldStartOnboarding
            ? "onboarding"
            : getDefaultDashboardPage(activeMember?.role)
        )
      );
      return;
    }

    router.replace("/dashboard");
  }, [
    activeMember?.role,
    activeMemberState.isPending,
    activeOrganization?.organizationType,
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
