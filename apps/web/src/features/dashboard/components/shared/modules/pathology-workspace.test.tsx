import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import {
  diagnosticSetupKey,
  emptyDiagnosticSetup,
} from "@/features/dashboard/lib/diagnostic-onboarding";
import { virujBackend } from "@/lib/viruj-backend";
import { PathologyProfile } from "./pathology-profile";
import { DiagnosticPublication } from "./diagnostic-publication";
mock.module("next/navigation", () => ({
  useRouter: () => ({ push() {}, replace() {} }),
  usePathname: () => "/pathology/lab-a/dashboard",
}));
const { DiagnosticWorkspace } = await import("./diagnostic-workspace");

const tenant = createErpTenantContext({
  organizationId: "lab-a",
  providerType: "pathology",
  role: "OWNER",
})!;

test("pathology dashboard counts services and branches without loading laboratory orders", () => {
  const client = new QueryClient();
  client.setQueryData(["diagnostic-bookings", "lab-a"], []);
  client.setQueryData(virujBackend.diagnostics.key("lab-a", "services"), []);
  client.setQueryData(["diagnostic-availability", "lab-a", "branches"], []);
  const html = renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <DiagnosticWorkspace tenant={tenant} userName="Owner" />
    </QueryClientProvider>
  );
  expect(html).toContain("Live services");
  expect(html).toContain("Published branches");
  expect(html).toContain("No appointment requests yet");
  expect(html).toContain("erp-overview");
  expect(html).toContain("Your branches");
  expect(html).not.toContain("Reports");
  expect(client.getQueryCache().getAll()).toHaveLength(3);
  client.clear();
});

test("publication controls reflect branch visibility and restrict publishing to managers with active tests", () => {
  const client = new QueryClient();
  const branchKey = ["diagnostic-availability", "lab-a", "branches"];
  const serviceKey = virujBackend.diagnostics.key("lab-a", "services");
  client.setQueryData(branchKey, [
    {
      id: "private",
      tenantId: "lab-a",
      name: "Main branch",
      address: "Delhi",
      phone: "",
      published: false,
      homeCollection: false,
    },
    {
      id: "public",
      tenantId: "lab-a",
      name: "City branch",
      address: "Delhi",
      phone: "",
      published: true,
      homeCollection: true,
    },
  ]);
  const render = (role = "OWNER") =>
    renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <DiagnosticPublication tenant={{ ...tenant, role }} />
      </QueryClientProvider>
    );
  client.setQueryData(serviceKey, [{ id: "cbc", active: true }]);
  const published = render();
  expect(published).toContain("Publish to mobile app");
  expect(published).toContain("Unpublish");
  expect(published).toContain("Private · ERP only");
  expect(published).toContain("Published to mobile app");
  expect(published).not.toMatch(/<button[^>]*\sdisabled=/);
  const staff = render("TECHNICIAN");
  expect(staff).not.toContain("<button");
  expect(staff).toContain("Published to mobile app");
  client.setQueryData(serviceKey, [{ id: "cbc", active: false }]);
  const noTests = render();
  expect(noTests).toMatch(
    /<button[^>]*aria-label="Publish Main branch to mobile app"[^>]*disabled/
  );
  expect(noTests).not.toMatch(
    /<button[^>]*aria-label="Unpublish City branch from mobile app"[^>]*disabled/
  );
  client.setQueryData(branchKey, []);
  expect(render()).toContain("add a branch before publishing");
  client.clear();
});

test("pathology profile displays saved identity and contact details for its tenant", () => {
  const client = new QueryClient();
  client.setQueryData(diagnosticSetupKey("lab-a"), {
    data: {
      ...emptyDiagnosticSetup("Sunrise Diagnostics", "lab@example.com"),
      registrationNumber: "REG-001",
      establishedYear: "2005",
      website: "https://example.com",
      city: "Delhi",
    },
    completedAt: "2026-01-01",
    version: 1,
  });
  client.setQueryData(diagnosticSetupKey("lab-b"), {
    data: emptyDiagnosticSetup("Other tenant"),
    version: 1,
  });
  const html = renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <PathologyProfile tenant={tenant} />
    </QueryClientProvider>
  );
  for (const value of [
    "Sunrise Diagnostics",
    "REG-001",
    "2005",
    "lab@example.com",
    "https://example.com",
  ])
    expect(html).toContain(value);
  expect(html).not.toContain("Other tenant");
  expect(html).toContain("Mobile app publishing");
  client.clear();
});
