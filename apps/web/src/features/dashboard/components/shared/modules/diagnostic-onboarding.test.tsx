import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { diagnosticSetupKey } from "@/features/dashboard/lib/diagnostic-onboarding";
mock.module("next/navigation", () => ({
  useRouter: () => ({ push() {}, replace() {} }),
  usePathname: () => "/pathology/lab-a/dashboard"
}));
const { DiagnosticOnboarding } = await import("./diagnostic-onboarding");
test("pathology setup uses orange and radiology setup uses rose", () => {
  for (const kind of ["pathology", "radiology"] as const) {
    const client = new QueryClient();
    client.setQueryData(diagnosticSetupKey("", "tenant-a"), {
      data: null,
      completedAt: null,
      version: 0
    });
    const tenant = createErpTenantContext({
      organizationId: "tenant-a",
      providerType: kind,
      role: "OWNER"
    })!;
    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <DiagnosticOnboarding
          tenant={tenant}
          organizationName="ABC Diagnostics"
        />
      </QueryClientProvider>
    );
    expect(html).toContain(`vh-onboarding--${kind}`);
    expect(html).toContain("ABC Diagnostics");
    expect(html).toContain(
      kind === "pathology" ? "Organization name" : "Legal business name"
    );
    expect(html).toContain("Year of establishment");
    expect(html).toContain("License / certificate");
    expect(html).toContain("Contact &amp; hours");
    if (kind === "radiology") expect(html).toContain("Imaging setup");
    if (kind === "pathology") {
      expect(html).not.toContain("Reporting team");
      expect(html).not.toContain("Laboratory setup");
    }
    expect(html).toContain("Save &amp; Continue");
    client.clear();
  }
});
test("technicians see the administrator message instead of editable business fields", () => {
  const client = new QueryClient();
  const tenant = createErpTenantContext({
    organizationId: "tenant-a",
    providerType: "pathology",
    role: "TECHNICIAN"
  })!;
  const html = renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <DiagnosticOnboarding tenant={tenant} />
    </QueryClientProvider>
  );
  expect(html).toContain("managed by your administrator");
  expect(html).not.toContain("Legal business name");
  client.clear();
});
