import type { QueryClient } from "@tanstack/react-query";
import { isPrivateResource } from "./realtime-resources";

export function connectAppointmentEvents({
  client,
  userId,
  orgId,
  url,
  authorize,
  onStatus,
  random = Math.random,
  createEventSource = (address: string) =>
    new EventSource(address, { withCredentials: true }),
}: {
  client: QueryClient;
  userId: string;
  orgId: string;
  url: string;
  authorize: (signal: AbortSignal) => Promise<void>;
  onStatus: (open: boolean) => void;
  random?: () => number;
  createEventSource?: (url: string) => EventSource;
}) {
  let source: EventSource | undefined;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  let attempt = 0;
  let generation = 0;
  let request: AbortController | undefined;

  function disconnect() {
    generation++;
    request?.abort();
    source?.close();
    source = undefined;
    clearTimeout(retry);
    onStatus(false);
  }

  function recover() {
    // Changes may have been missed while disconnected or in another tab/app.
    void client.invalidateQueries({ queryKey: [userId, orgId] }, { cancelRefetch: false });
  }

  async function connect() {
    if (stopped) return;
    const version = ++generation;
    request = new AbortController();
    try {
      await authorize(request.signal);
      if (stopped || version !== generation) return;
      const connection = createEventSource(url);
      source = connection;
      connection.onopen = () => {
        if (version !== generation || stopped) return;
        attempt = 0;
        onStatus(true);
        recover();
      };
      connection.onmessage = (event) => {
        if (version !== generation || stopped) return;
        try {
          const payload: unknown = JSON.parse(event.data);
          if (
            payload &&
            typeof payload === "object" &&
            "resource" in payload &&
            isPrivateResource(payload.resource)
          ) {
            void client.invalidateQueries({
              queryKey: [userId, orgId, payload.resource],
            }, { cancelRefetch: false });
          }
        } catch {
          /* Ignore malformed events; polling remains available. */
        }
      };
      connection.onerror = () => {
        if (version !== generation || stopped) return;
        disconnect();
        retry = setTimeout(
          () => void connect(),
          Math.min(30_000, 1_000 * 2 ** Math.min(attempt++, 5)) * (0.5 + random() * 0.5)
        );
      };
    } catch {
      if (stopped || version !== generation) return;
      disconnect();
      retry = setTimeout(
        () => void connect(),
        Math.min(30_000, 1_000 * 2 ** Math.min(attempt++, 5)) * (0.5 + random() * 0.5)
      );
    }
  }

  void connect();
  return {
    foreground() {
      if (!stopped) {
        recover();
        disconnect();
        void connect();
      }
    },
    background: disconnect,
    close() {
      stopped = true;
      disconnect();
    },
  };
}
