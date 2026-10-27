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
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authenticatedHere, setAuthenticatedHere] = useState(false);
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
  const activeOrganization =
    sessionOrganization ?? activeOrganizationState.data;
  const activeMember = sessionMember ?? activeMemberState.data;

  useEffect(() => {
    const organizations = organizationsState.data ?? [];

    if (
      !authenticatedHere ||
      isAuthenticating ||
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
    authenticatedHere,
    activeMemberState,
    activeOrganization?.id,
    activeOrganizationState,
    isActivatingOnlyOrganization,
    isAuthenticating,
    organizationsState.data,
    sessionState.data?.user,
    sessionState,
  ]);

  useEffect(() => {
    const activeOrganizationType = activeOrganization?.organizationType;

    if (
      !authenticatedHere ||
      !isHydrated ||
      isAuthenticating ||
      isActivatingOnlyOrganization ||
      sessionState.isPending ||
      organizationsState.isPending ||
      !sessionState.data?.user ||
      activeOrganizationState.isPending ||
      activeMemberState.isPending
    ) {
      return;
    }

    const pendingInvitation = window.sessionStorage.getItem(
      "viruj:pending-invitation"
    );
    if (pendingInvitation && /^[a-zA-Z0-9-]+$/.test(pendingInvitation)) {
      router.replace(`/staff-confirmation/${pendingInvitation}`);
      return;
    }
    const doctorWorkspace = new URLSearchParams(window.location.search).get(
      "doctorWorkspace"
    );
    if (doctorWorkspace && /^[a-zA-Z0-9-]+$/.test(doctorWorkspace)) {
      router.replace(`/doctor/${doctorWorkspace}/dashboard`);
      return;
    }
    if ((organizationsState.data?.length ?? 0) !== 1) {
      router.replace("/workspaces");
      return;
    }
    if (
      activeOrganizationType &&
      isDashboardOrganizationType(activeOrganizationType)
    ) {
      router.replace(
        buildDashboardPath(
          activeOrganizationType,
          getDefaultDashboardPage(activeMember?.role)
        )
      );
      return;
    }

    router.replace("/dashboard");
  }, [
    authenticatedHere,
    activeMember?.role,
    activeMemberState.isPending,
    activeOrganization?.id,
    activeOrganization?.organizationType,
    activeOrganization?.createdAt,
    activeOrganizationState.isPending,
    isAuthenticating,
    isActivatingOnlyOrganization,
    isHydrated,
    sessionState.isPending,
    organizationsState.isPending,
    organizationsState.data,
    router,
    sessionState.data?.user,
  ]);

  return (
    <ErpDemoLogin
      onPendingChange={setIsAuthenticating}
      onAuthenticated={async () => {
        await Promise.all([
          sessionState.refetch(),
          organizationsState.refetch(),
          activeOrganizationState.refetch(),
          activeMemberState.refetch(),
        ]);
        setAuthenticatedHere(true);
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
      createdAt?: string | Date;
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
