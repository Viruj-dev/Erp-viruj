"use client";

import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { getAnalyticsPath } from "@/lib/analytics-route";

export function PostHogAnalytics() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user.id;
  const previousUserId = useRef<string | undefined>(undefined);
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || isPending) {
      return;
    }

    const storedUserId = posthog.get_property("$user_id");
    if (storedUserId && storedUserId !== userId) {
      posthog.reset();
    }
    if (userId && previousUserId.current !== userId) {
      posthog.identify(userId);
    }
    previousUserId.current = userId;

    if (pathname && previousPathname.current !== pathname) {
      posthog.capture("$pageview", {
        $pathname: getAnalyticsPath(pathname),
      });
      previousPathname.current = pathname;
    }
  }, [isPending, pathname, userId]);

  return null;
}
