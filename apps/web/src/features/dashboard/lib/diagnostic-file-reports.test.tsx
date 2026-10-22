import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { ErpTenantContext } from "./erp-tenant";
mock.module("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: {
      data: [
        {
          id: "booking-a",
          status: "accepted",
          collectionMode: "centre",
          order: {
            patientName: "Patient A",
            patientPhone: "1234567890",
            patientAge: 30,
            patientSex: "female",
            status: "ordered",
            serviceSnapshot: { name: "CBC" }
          },
          slot: { startsAt: "2026-10-22T10:00:00Z", branch: { name: "Main" } }
        },
        {
          id: "booking-b",
          status: "accepted",
          collectionMode: "centre",
          order: {
            patientName: "Patient B",
            status: "released",
            serviceSnapshot: { name: "Thyroid" }
          },
          slot: { startsAt: "2026-10-22T10:00:00Z", branch: { name: "Main" } },
          reportFile: { filename: "report.pdf", size: 2500000 }
        }
      ],
      hasMore: false
    }
  }),
  useQueryClient: () => ({}),
  useMutation: () => ({ isPending: false, mutate: () => {} })
}));
mock.module("@/lib/viruj-backend", () => ({
  virujBackend: { diagnostics: {} }
}));
const { DiagnosticFileReports } =
  await import("../components/shared/modules/diagnostic-file-reports");
test("reports render compact table rows with upload and send actions", () => {
  const html = renderToStaticMarkup(
    <DiagnosticFileReports
      tenant={
        {
          organizationId: "tenant-a",
          providerType: "radiology",
          role: "OWNER"
        } as ErpTenantContext
      }
    />
  );
  expect(html).toContain("<table");
  expect(html).not.toContain("<article");
  expect(html).toContain("Patient A");
  expect(html).toContain("Patient B");
  expect(html).toContain('type="file"');
  expect(html).toContain("Send to patient");
  expect(html).not.toContain("Prepare report");
  expect(html).not.toContain("Preview");
  expect(html).toContain("Download");
});

test("both diagnostic workspaces allow owners, managers and clinical staff to upload completed reports", () => {
  for (const providerType of ["pathology", "radiology"]) {
    for (const role of [
      "OWNER",
      "ADMIN",
      "ORG_ADMIN",
      "MANAGER",
      "DOCTOR",
      "TECHNICIAN",
      "owner",
      "admin",
      "manager",
      "doctor",
      "lab_tech"
    ]) {
      const html = renderToStaticMarkup(
        <DiagnosticFileReports
          tenant={
            {
              organizationId: "tenant-a",
              providerType,
              role
            } as ErpTenantContext
          }
        />
      );
      expect(html).toContain('type="file"');
      expect(html).toContain("Send to patient");
      expect(html).toContain("Download");
    }
    for (const role of ["RECEPTIONIST", "STAFF", "PATIENT", "unknown"]) {
      const html = renderToStaticMarkup(
        <DiagnosticFileReports
          tenant={
            {
              organizationId: "tenant-a",
              providerType,
              role
            } as ErpTenantContext
          }
        />
      );
      expect(html).not.toContain('type="file"');
      expect(html).toContain("A manager or clinical team member can upload.");
      expect(html).toContain("Download");
    }
  }
});
