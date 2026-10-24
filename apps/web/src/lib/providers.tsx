"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQueryClient
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { setCentralApiTokenIdentity } from "./central-api-token";
import { authClient } from "./auth-client";
import { NotificationProvider } from "@/features/notifications";
import { ThemeProvider } from "./theme-provider";
import { PostHogAnalytics } from "./posthog-analytics";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider>
      <PostHogAnalytics />
      <NotificationProvider>
        <QueryClientProvider client={queryClient}>
          <SessionScopedQueryReset />
          {children}
        </QueryClientProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

/**
 * Key the shared react-query cache and the central API token cache to the
 * signed-in user + active workspace. When either changes, drop the user-scoped
 * react-query state so data fetched under one account/org is never reused in
 * the session (or workspace) that follows. The effect is keyed on the resolved
 * identity, so it runs on actual changes only — never on first mount or while
 * the session is still loading.
 */
function SessionScopedQueryReset() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const activeOrganizationState = authClient.useActiveOrganization();
  const previousIdentityRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const sessionOrganization = getSessionOrganization(session);
    const userId = session?.user?.id ?? null;
    const organizationId =
      sessionOrganization?.id ?? activeOrganizationState.data?.id;
    // Same identity shape as the home screens: user id + active org id.
    const identity =
      userId && organizationId ? `${userId}:${organizationId}` : null;

    // The first resolved identity only establishes the binding without
    // clearing anything, so refresh/hydration of a stable session stays free
    // of cache churn.
    if (!initializedRef.current) {
      initializedRef.current = true;
      previousIdentityRef.current = identity;
    } else if (previousIdentityRef.current !== identity) {
      previousIdentityRef.current = identity;
      queryClient.clear();
    }

    setCentralApiTokenIdentity(identity);
  }, [
    activeOrganizationState.data,
    queryClient,
    session
  ]);

  return null;
}

type SessionOrganization = { id?: string | null } | null | undefined;

function getSessionOrganization(session: unknown): SessionOrganization {
  if (
    session &&
    typeof session === "object" &&
    "activeOrganization" in session &&
    session.activeOrganization &&
    typeof session.activeOrganization === "object"
  ) {
    return session.activeOrganization as SessionOrganization;
  }

  return null;
}
