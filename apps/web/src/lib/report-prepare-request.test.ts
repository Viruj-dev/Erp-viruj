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
