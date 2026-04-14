"use client";

import { ErpDemoLogin } from "@/features/auth/components/login-screen";
import { LoadingScreen } from "@/features/shell/components/loading-screen";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

export function ErpAuthScreen() {
  const router = useRouter();
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const sessionState = authClient.useSession();

  useEffect(() => {
    if (sessionState.data?.user) {
      router.replace("/dashboard");
    }
  }, [router, sessionState.data?.user]);

  if (!isHydrated || sessionState.isPending) {
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
