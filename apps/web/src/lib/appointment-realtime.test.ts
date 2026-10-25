import { expect, test } from "bun:test";
import { createQueryClient, resourceKey } from "./query-cache";
import { connectAppointmentEvents } from "./appointment-realtime";

class FakeEventSource {
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  closed = false;
  close() {
    this.closed = true;
  }
}

test("reconnect invalidates every cached query, and events invalidate appointments only", async () => {
  const client = createQueryClient();
  const connections: FakeEventSource[] = [];
  const status: boolean[] = [];
  const appointment = resourceKey("user", "org", "appointments");
  const staff = resourceKey("user", "org", "staff");
  const otherTenant = resourceKey("user", "other-org", "appointments");
  const seed = () => {
    for (const key of [appointment, staff, otherTenant])
      client.setQueryData(key, []);
  };
  seed();
  const events = connectAppointmentEvents({
    client,
    userId: "user",
    orgId: "org",
    url: "http://backend/events?org=org",
    authorize: async () => {},
    onStatus: (open) => status.push(open),
    createEventSource: () => {
      const source = new FakeEventSource();
      connections.push(source);
      return source as unknown as EventSource;
    },
  });
  try {
    await Bun.sleep(0);
    connections[0]!.onopen!();
    for (const query of client.getQueryCache().getAll())
      expect(query.state.isInvalidated).toBe(true);
    seed();
    connections[0]!.onmessage!({ data: '{"resource":"appointments"}' });
    expect(client.getQueryState(appointment)?.isInvalidated).toBe(true);
    expect(client.getQueryState(staff)?.isInvalidated).toBe(false);
    expect(client.getQueryState(otherTenant)?.isInvalidated).toBe(false);
    connections[0]!.onerror!();
    expect(connections[0]!.closed).toBe(true);
    expect(status.at(-1)).toBe(false);
    seed();
    await Bun.sleep(1_100);
    expect(connections).toHaveLength(2);
    connections[1]!.onopen!();
    for (const query of client.getQueryCache().getAll())
      expect(query.state.isInvalidated).toBe(true);
    expect(status.at(-1)).toBe(true);
    seed();
    events.background();
    expect(status.at(-1)).toBe(false);
    events.foreground();
    for (const query of client.getQueryCache().getAll())
      expect(query.state.isInvalidated).toBe(true);
  } finally {
    events.close();
    client.clear();
  }
});

test("cleanup ignores a delayed authorization response after an identity change", async () => {
  const client = createQueryClient();
  let finish!: () => void;
  let connections = 0;
  const events = connectAppointmentEvents({
    client,
    userId: "old-user",
    orgId: "old-org",
    url: "http://backend/events",
    authorize: () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    onStatus: () => {},
    createEventSource: () => {
      connections++;
      return new FakeEventSource() as unknown as EventSource;
    },
  });
  events.close();
  finish();
  await Bun.sleep(0);
  expect(connections).toBe(0);
  client.clear();
});
