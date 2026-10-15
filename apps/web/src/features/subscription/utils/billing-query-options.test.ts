import { expect, mock, test } from "bun:test";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import {
  billingQueryOptions,
  needsAnalyticsSubscription,
} from "./billing-query-options";

test("ordinary ERP navigation makes no payment requests", () => {
  const client = new QueryClient();
  const request = mock(async () => []);
  const observer = new QueryObserver(client, {
    ...billingQueryOptions,
    enabled: false,
    queryFn: request,
    queryKey: ["viruj-payment", "plans"],
  });
  const unsubscribe = observer.subscribe(() => {});
  try {
    for (const page of [
      "dashboard",
      "patients",
      "appointments",
      "staff",
      "settings",
      "profile",
      "subscription",
    ]) {
      observer.setOptions({
        ...billingQueryOptions,
        enabled: needsAnalyticsSubscription(page, "hospital", true),
        queryFn: request,
        queryKey: ["viruj-payment", "plans"],
      });
    }
    expect(request).not.toHaveBeenCalled();
    expect(needsAnalyticsSubscription("analytics", "hospital", true)).toBe(
      true
    );
    expect(needsAnalyticsSubscription("analytics", "hospital", false)).toBe(
      false
    );
    expect(needsAnalyticsSubscription("analytics", "clinic", true)).toBe(false);
  } finally {
    unsubscribe();
    client.clear();
  }
});

test("failed billing reads stay quiet on focus, reconnect and remount; explicit refresh works", async () => {
  const client = new QueryClient();
  const request = mock(async () => {
    throw new Error("Payment service unavailable");
  });
  const options = {
    ...billingQueryOptions,
    queryFn: request,
    queryKey: ["viruj-payment", "subscription", "current"],
  };
  await expect(client.fetchQuery(options)).rejects.toThrow(
    "Payment service unavailable"
  );
  const observer = new QueryObserver(client, options);
  const unsubscribe = observer.subscribe(() => {});
  try {
    const query = client.getQueryCache().find({ queryKey: options.queryKey });
    query?.onFocus();
    query?.onOnline();
    await Promise.resolve();
    expect(request).toHaveBeenCalledTimes(1);
    await observer.refetch();
    expect(request).toHaveBeenCalledTimes(2);
  } finally {
    unsubscribe();
    client.clear();
  }
});
