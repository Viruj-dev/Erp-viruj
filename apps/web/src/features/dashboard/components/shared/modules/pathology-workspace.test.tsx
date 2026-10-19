import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import {
  diagnosticSetupKey,
  emptyDiagnosticSetup,
} from "@/features/dashboard/lib/diagnostic-onboarding";
import { virujBackend } from "@/lib/viruj-backend";
import { DiagnosticWorkspace } from "./diagnostic-workspace";
import { PathologyProfile } from "./pathology-profile";

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
  expect(html).toContain("Active services");
  expect(html).toContain("Published branches");
  expect(html).toContain("No upcoming appointments");
  expect(html).not.toContain("Reports");
  expect(client.getQueryCache().getAll()).toHaveLength(3);
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
  client.clear();
});
