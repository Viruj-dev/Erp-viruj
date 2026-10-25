import { afterEach, expect, mock, spyOn, test } from "bun:test";
import { notificationEvents } from "@/features/notifications/lib/notification-events";
import { runBulkRequests } from "@/features/notifications/lib/bulk-feedback";
import type { ToastInput } from "@/features/notifications/lib/notification-types";
mock.module("./central-api-token", () => ({
  getCentralApiToken: async () => "test-token",
  signOutAfterCentralApiUnauthorized: async () => {},
}));
const { virujBackend } = await import("./viruj-backend");
import type { VirujFacilityInput } from "./viruj-backend";
afterEach(() => mock.restore());

test("bulk API calls suppress per-item success and error popups but retain one accurate summary", async () => {
  let status = 200;
  spyOn(globalThis, "fetch").mockImplementation((async () =>
    Response.json({ error: "Failed" }, { status })) as unknown as typeof fetch);
  let individual = 0;
  const feedback: ToastInput[] = [];
  const stopSuccess = notificationEvents.on("api.success", () => {
    individual++;
  });
  const stopError = notificationEvents.on("api.error", () => {
    individual++;
  });
  const stopToast = notificationEvents.on("toast.show", (toast) =>
    feedback.push(toast)
  );
  const update = {
    id: "item",
    organizationId: "workspace",
    facility: {} as VirujFacilityInput,
  };
  try {
    await runBulkRequests<unknown>(
      [
        () => virujBackend.facilities.update(update, { suppressToast: true }),
        () => virujBackend.services.update(update, { suppressToast: true }),
        () => virujBackend.doctors.delete(update, { suppressToast: true }),
        () => virujBackend.appointments.delete(update, { suppressToast: true }),
      ],
      "requests completed"
    );
    expect(individual).toBe(0);
    expect(feedback).toHaveLength(1);
    expect(feedback[0]?.title).toBe("4 requests completed");
    status = 500;
    await runBulkRequests(
      [() => virujBackend.facilities.update(update, { suppressToast: true })],
      "requests completed"
    );
    expect(individual).toBe(0);
    expect(feedback).toHaveLength(2);
    expect(feedback[1]?.tone).toBe("error");
    status = 200;
    await virujBackend.facilities.update(update);
    expect(individual).toBe(1);
  } finally {
    stopSuccess();
    stopError();
    stopToast();
  }
});
