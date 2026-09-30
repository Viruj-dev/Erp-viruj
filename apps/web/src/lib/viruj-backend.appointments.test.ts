import { afterEach, expect, mock, test } from "bun:test";
const claims = {
  tenant_id: "hospital-x",
  permissions: ["appointment.approve", "appointment.complete"],
};
const token = `header.${btoa(JSON.stringify(claims))}.synthetic-signature`;
mock.module("./central-api-token", () => ({
  getCentralApiToken: async () => token,
  signOutAfterCentralApiUnauthorized: async () => {},
}));
const { virujBackend } = await import("./viruj-backend");
const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("staff appointment requests preserve tenant, optimistic version and zero-prefixed OTP", async () => {
  const requests: { url: string; options?: RequestInit }[] = [];
  globalThis.fetch = mock(
    async (url: string | URL | Request, options?: RequestInit) => {
      requests.push({ url: String(url), options });
      return new Response(
        JSON.stringify({
          expiresAt: "2026-10-01T12:00:00Z",
          patientDetails: { complaintPhoto: "data:image/png;base64,aGVsbG8=" },
        }),
        { status: 200 }
      );
    }
  ) as unknown as typeof fetch;
  const input = {
    id: "appointment-x",
    organizationId: "hospital-x",
    expectedVersion: 3,
  };
  await virujBackend.appointments.list(input);
  await virujBackend.appointments.updateStatus({
    ...input,
    status: "approved",
  });
  await virujBackend.appointments.generateArrivalOtp(input);
  await virujBackend.appointments.verifyArrival({ ...input, otp: "0042" });
  const detail = await virujBackend.appointments.detail(input);
  expect(detail.patientDetails?.complaintPhoto).toBe(
    "data:image/png;base64,aGVsbG8="
  );
  expect(requests).toHaveLength(5);
  for (const request of requests) {
    expect(
      new Headers(request.options?.headers).get("X-Erp-Organization-Id")
    ).toBe("hospital-x");
    expect(new Headers(request.options?.headers).get("Authorization")).toBe(
      `Bearer ${token}`
    );
  }
  expect(
    requests[2]?.url.endsWith("/appointments/appointment-x/arrival-otp")
  ).toBe(true);
  expect(JSON.parse(String(requests[3]?.options?.body))).toEqual({
    otp: "0042",
    expectedVersion: 3,
  });
  expect(JSON.parse(String(requests[1]?.options?.body)).expectedVersion).toBe(
    3
  );
  expect(await virujBackend.appointments.permissions("hospital-x")).toEqual(
    claims.permissions
  );
  await expect(
    virujBackend.appointments.permissions("hospital-y")
  ).rejects.toThrow("Refresh your active workspace");
});
