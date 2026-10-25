"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "./auth-client";
import { getCentralApiToken } from "./central-api-token";
import { connectAppointmentEvents } from "./appointment-realtime";

const RealtimeContext = createContext({ userId: "", orgId: "", open: false, visible: true });
const subscribeVisibility = (listener: () => void) => {
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
};

export function useRealtimeInvalidation(userId: string, orgId: string) {
  const client = useQueryClient();
  const [connection, setConnection] = useState({
    userId: "",
    orgId: "",
    open: false,
  });
  useEffect(() => {
    if (!userId || !orgId) return;
    const origin = window.location.origin;
    const url = `${origin.replace(/\/$/, "")}/events?org=${encodeURIComponent(orgId)}`;
    const events = connectAppointmentEvents({
      client,
      userId,
      orgId,
      url,
      onStatus: (open) => setConnection({ userId, orgId, open }),
      authorize: async (signal) => {
        const token = await getCentralApiToken(true);
        if (signal.aborted) return;
        const response = await fetch(
          `${origin.replace(/\/$/, "")}/events/session?org=${encodeURIComponent(orgId)}`,
          {
            method: "POST",
            credentials: "include",
            signal,
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok)
          throw new Error("Appointment events authentication failed");
      },
    });
    if (document.hidden) events.background();
    const visibility = () => {
      if (document.hidden) events.background();
      else events.foreground();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      events.close();
    };
  }, [client, userId, orgId]);
  return (
    connection.userId === userId &&
    connection.orgId === orgId &&
    connection.open
  );
}

export function AppointmentRealtimeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session } = authClient.useSession();
  const organization = authClient.useActiveOrganization();
  const userId = session?.user?.id ?? "";
  const active = (session as { activeOrganization?: { id?: string } } | null)
    ?.activeOrganization;
  const orgId = active?.id ?? organization.data?.id ?? "";
  const open = useRealtimeInvalidation(userId, orgId);
  const visible = useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => false);
  return (
    <RealtimeContext.Provider value={{ userId, orgId, open, visible }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useAppointmentPollingInterval(
  orgId: string | undefined,
  fallback = 15_000
) {
  const connection = useContext(RealtimeContext);
  if (!connection.visible) return false;
  return connection.open && connection.orgId === orgId ? 60_000 : fallback;
}

export const useRealtimePollingInterval = useAppointmentPollingInterval;

export function useQueryUserId() {
  return authClient.useSession().data?.user?.id ?? "";
}
