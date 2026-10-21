import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { ErpTenantContext } from "./erp-tenant";
mock.module("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: {
      data: [
        {
          id: "booking-a",
          order: {
            patientName: "Patient A",
            patientPhone: "1234567890",
            patientAge: 30,
            patientSex: "female",
            status: "ordered",
            serviceSnapshot: { name: "CBC" },
          },
          slot: { startsAt: "2026-10-22T10:00:00Z", branch: { name: "Main" } },
        },
        {
          id: "booking-b",
          order: {
            patientName: "Patient B",
            status: "released",
            serviceSnapshot: { name: "Thyroid" },
          },
          slot: { startsAt: "2026-10-22T10:00:00Z", branch: { name: "Main" } },
          reportFile: { filename: "report.pdf", size: 2500000 },
        },
      ],
      hasMore: false,
    },
  }),
  useQueryClient: () => ({}),
  useMutation: () => ({ isPending: false, mutate: () => {} }),
}));
mock.module("@/lib/viruj-backend", () => ({
  virujBackend: { diagnostics: {} },
}));
const { DiagnosticFileReports } =
  await import("../components/shared/modules/diagnostic-file-reports");
test("reports render compact table rows with the ten-megabyte preparation flow", () => {
  const html = renderToStaticMarkup(
    <DiagnosticFileReports
      tenant={{ organizationId: "tenant-a", role: "OWNER" } as ErpTenantContext}
    />
  );
  expect(html).toContain("<table");
  expect(html).not.toContain("<article");
  expect(html).toContain("Patient A");
  expect(html).toContain("Patient B");
  expect(html).toContain("Prepare report");
  expect(html).toContain("Download");
  expect(html).toContain("10 MB");
  expect(html).toContain("3 MB or less");
});
