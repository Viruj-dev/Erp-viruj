// Billing refreshes follow explicit navigation and billing actions, not browser events.
export const billingQueryOptions = {
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  retry: false,
  retryOnMount: false,
  staleTime: 60_000,
} as const;

export function needsAnalyticsSubscription(
  page: string,
  organizationType: string | null,
  canRead: boolean
) {
  return page === "analytics" && organizationType === "hospital" && canRead;
}
