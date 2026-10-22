import { afterAll, expect, mock, test } from "bun:test";
const previous = process.env.NEXT_PUBLIC_API_URL;
process.env.NEXT_PUBLIC_API_URL = "https://api.example.test";
const originalFetch = globalThis.fetch;
afterAll(() => {
  globalThis.fetch = originalFetch;
  if (previous === undefined) delete process.env.NEXT_PUBLIC_API_URL;
  else process.env.NEXT_PUBLIC_API_URL = previous;
});
mock.module("./central-api-token", () => ({
  getCentralApiToken: async () => "fixture-token",
  signOutAfterCentralApiUnauthorized: async () => {},
}));
const { virujBackend } = await import("./viruj-backend");
test("large originals go directly to the authenticated API and return binary prepared reports", async () => {
  globalThis.fetch = mock(async (url: string, options: RequestInit) => {
    expect(url).toBe(
      "https://api.example.test/api/erp/diagnostics/reports/prepare"
    );
    expect(new Headers(options.headers).get("Authorization")).toBe(
      "Bearer fixture-token"
    );
    expect(new Headers(options.headers).get("X-Erp-Organization-Id")).toBe(
      "tenant-a"
    );
    expect(options.body).toBeInstanceOf(FormData);
    return new Response("%PDF-1.7 prepared", {
      headers: { "Content-Type": "application/pdf" },
    });
  }) as unknown as typeof fetch;
  const result = await virujBackend.diagnostics.prepareReport(
    "tenant-a",
    new File(["source"], "lab.pdf")
  );
  expect(result.type).toBe("application/pdf");
  expect(await result.text()).toBe("%PDF-1.7 prepared");
});

test("sending uploads the original once directly to the API for compression and delivery", async () => {
  const data = new Uint8Array(10_000_000);
  const original = new File([data], "lab.pdf");
  let requests = 0;
  globalThis.fetch = mock(async (url: string, options: RequestInit) => {
    requests++;
    expect(url).toBe("https://api.example.test/api/erp/diagnostics/bookings/booking-a/report-file");
    expect(new Headers(options.headers).get("Authorization")).toBe("Bearer fixture-token");
    expect(new Headers(options.headers).get("X-Erp-Organization-Id")).toBe("tenant-a");
    expect(((options.body as FormData).get("file") as File).size).toBe(10_000_000);
    return Response.json({ filename: "report.pdf", size: 2_900_000 });
  }) as unknown as typeof fetch;
  await virujBackend.diagnostics.sendReport("tenant-a", "booking-a", original);
  expect(requests).toBe(1);
});
