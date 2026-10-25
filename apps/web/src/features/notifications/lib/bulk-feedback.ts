import { showManagedToast } from "./notification-events";

export async function runBulkRequests<T>(
  requests: Array<() => Promise<T>>,
  completionLabel: string
) {
  const results = await Promise.allSettled(
    requests.map(async (request) => request())
  );
  const completed = results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : []
  );
  const failed = results.length - completed.length;
  if (results.length)
    showManagedToast({
      title: failed
        ? `${completed.length} of ${results.length} ${completionLabel}`
        : `${completed.length} ${completionLabel}`,
      description: failed
        ? `${failed} failed. Refresh and retry the remaining items.`
        : undefined,
      tone: failed ? (completed.length ? "warning" : "error") : "success",
    });
  return { completed, failed };
}
