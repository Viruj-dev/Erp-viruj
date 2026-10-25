import { expect, test } from "bun:test";
import { createQueryClient, resourceKey } from "./query-cache";
import { connectAppointmentEvents } from "./appointment-realtime";
import { privateResources } from "./realtime-resources";

test("every allowed resource invalidates only its scoped cache", async () => {
  const client = createQueryClient();
  const source = new FakeEventSource();
  const events = connectAppointmentEvents({ client, userId: "u", orgId: "a", url: "/events", authorize: async () => {}, onStatus() {}, createEventSource: () => source as unknown as EventSource });
  try {
    await Bun.sleep(0);
    for (const resource of privateResources) {
      for (const org of ["a", "b"]) for (const name of privateResources) client.setQueryData(["u", org, name], []);
      source.onmessage!({ data: JSON.stringify({ resource }) });
      for (const query of client.getQueryCache().getAll()) expect(query.state.isInvalidated).toBe(query.queryKey[1] === "a" && query.queryKey[2] === resource);
    }
    client.setQueryData(["u", "a", "staff"], []);
    source.onmessage!({ data: '{"resource":"unknown"}' });
    expect(client.getQueryState(["u", "a", "staff"])?.isInvalidated).toBe(false);
  } finally { events.close(); client.clear(); }
});

class FakeEventSource {
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  closed = false;
  close() {
    this.closed = true;
  }
}

test("reconnect and foreground invalidate this identity only; events invalidate appointments only", async () => {
  const client = createQueryClient();
  const connections: FakeEventSource[] = [];
  const status: boolean[] = [];
  let authorizations = 0;
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
    authorize: async () => {
      authorizations++;
    },
    onStatus: (open) => status.push(open),
    createEventSource: () => {
      const source = new FakeEventSource();
      connections.push(source);
      return source as unknown as EventSource;
    },
  });
  try {
    await Bun.sleep(0);
    expect(authorizations).toBe(1);
    connections[0]!.onopen!();
    for (const query of client.getQueryCache().getAll())
      expect(query.state.isInvalidated).toBe(query.queryKey[1] === "org");
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
    expect(authorizations).toBe(2);
    connections[1]!.onopen!();
    for (const query of client.getQueryCache().getAll())
      expect(query.state.isInvalidated).toBe(query.queryKey[1] === "org");
    expect(status.at(-1)).toBe(true);
    seed();
    events.background();
    expect(status.at(-1)).toBe(false);
    events.foreground();
    for (const query of client.getQueryCache().getAll())
      expect(query.state.isInvalidated).toBe(query.queryKey[1] === "org");
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
