import { expect, test } from "bun:test";
import { isCancelledError, QueryObserver } from "@tanstack/react-query";
import { createQueryClient, resourceKey } from "./query-cache";

test("staff reads share requests and stay fresh for one minute", async () => {
  const client = createQueryClient();
  let requests = 0;
  const options = {
    queryKey: resourceKey("user-a", "org-a", "staff", "members"),
    queryFn: async () => ++requests,
  };
  try {
    await Promise.all([client.fetchQuery(options), client.fetchQuery(options)]);
    await client.fetchQuery(options);
    expect(requests).toBe(1);
    const observer = new QueryObserver(client, options);
    const stop = observer.subscribe(() => {});
    stop();
    expect(requests).toBe(1);
    client.setQueryData(options.queryKey, 1, {
      updatedAt: Date.now() - 60_001,
    });
    await client.fetchQuery(options);
    expect(requests).toBe(2);
  } finally {
    client.clear();
  }
});

test("keys isolate users, organizations, resources and parameters", () => {
  const client = createQueryClient();
  const key = resourceKey("user-a", "org-a", "staff", "members");
  try {
    expect(key).toEqual(["user-a", "org-a", "staff", "members"]);
    client.setQueryData(key, ["private member"]);
    for (const other of [
      resourceKey("user-b", "org-a", "staff", "members"),
      resourceKey("user-a", "org-b", "staff", "members"),
      resourceKey("user-a", "org-a", "audit", "recent"),
      resourceKey("user-a", "org-a", "staff", "invitations"),
      resourceKey(undefined, undefined, "staff", "members"),
    ]) {
      expect(client.getQueryData(other)).toBeUndefined();
    }
  } finally {
    client.clear();
  }
});

test("resource invalidation refetches active staff only in its original scope", async () => {
  const client = createQueryClient();
  let requests = 0;
  const staffKey = resourceKey("user-a", "org-a", "staff", "members");
  const observer = new QueryObserver(client, {
    queryKey: staffKey,
    queryFn: async () => ++requests,
  });
  const stop = observer.subscribe(() => {});
  try {
    await observer.refetch();
    const unrelated = [
      resourceKey("user-b", "org-a", "staff", "members"),
      resourceKey("user-a", "org-b", "staff", "members"),
      resourceKey("user-a", "org-a", "appointments"),
    ];
    for (const key of unrelated) client.setQueryData(key, ["unchanged"]);
    await client.invalidateQueries({
      queryKey: resourceKey("user-a", "org-a", "staff"),
    });
    expect(requests).toBe(2);
    for (const key of unrelated) {
      expect(client.getQueryState(key)?.isInvalidated).toBe(false);
    }
  } finally {
    stop();
    client.clear();
  }
});

test("clearing a session discards cached data and late in-flight responses", async () => {
  const client = createQueryClient();
  const oldKey = resourceKey("user-a", "org-a", "staff", "members");
  const newKey = resourceKey("user-b", "org-b", "staff", "members");
  let finish!: (data: string[]) => void;
  const pending = client
    .fetchQuery({
      queryKey: oldKey,
      queryFn: () =>
        new Promise<string[]>((resolve) => {
          finish = resolve;
        }),
    })
    .catch((error: unknown) => error);
  try {
    client.setQueryData(
      resourceKey("user-a", "org-a", "staff", "invitations"),
      ["old invite"]
    );
    client.clear();
    client.setQueryData(newKey, ["new member"]);
    finish(["old member"]);
    expect(isCancelledError(await pending)).toBe(true);
    expect(client.getQueryData(oldKey)).toBeUndefined();
    expect(client.getQueryData<string[]>(newKey)).toEqual(["new member"]);
    expect(client.getQueryCache().getAll()).toHaveLength(1);
  } finally {
    client.clear();
  }
});

test("department and directory catalogue overrides last five minutes", async () => {
  const client = createQueryClient();
  try {
    for (const resource of ["departments", "directory-catalogues"]) {
      let requests = 0;
      const options = {
        queryKey: resourceKey("user-a", "org-a", resource),
        queryFn: async () => ++requests,
      };
      client.setQueryData(options.queryKey, 0, {
        updatedAt: Date.now() - 120_000,
      });
      await client.fetchQuery(options);
      expect(requests).toBe(0);
      client.setQueryData(options.queryKey, 0, {
        updatedAt: Date.now() - 300_001,
      });
      await client.fetchQuery(options);
      expect(requests).toBe(1);
    }
    const departmentKey = [
      "doctor-workspace",
      "org-a",
      "/directory/departments",
    ];
    client.setQueryData(departmentKey, ["Cardiology"], {
      updatedAt: Date.now() - 120_000,
    });
    let requests = 0;
    await client.fetchQuery({
      queryKey: departmentKey,
      queryFn: async () => {
        requests++;
        return [];
      },
    });
    expect(requests).toBe(0);
  } finally {
    client.clear();
  }
});

test("per-screen polling options still take precedence", () => {
  const client = createQueryClient();
  try {
    const observer = new QueryObserver(client, {
      queryKey: resourceKey("user-a", "org-a", "appointments"),
      enabled: false,
      queryFn: async () => [],
      refetchInterval: 5_000,
      refetchOnWindowFocus: "always",
    });
    expect(observer.options.refetchInterval).toBe(5_000);
    expect(observer.options.refetchOnWindowFocus).toBe("always");
  } finally {
    client.clear();
  }
});
