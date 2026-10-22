import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DiagnosticReport } from "../components/shared/modules/diagnostic-report";
import {
  diagnosticPermissions,
  diagnosticMoney,
  type DiagnosticOrder
} from "./diagnostics";
import { virujBackend } from "@/lib/viruj-backend";
import { getAllowedDashboardPages } from "./routing";

const order: DiagnosticOrder = {
  id: "order-a",
  kind: "pathology",
  serviceId: "test-a",
  patientName: "<script>alert(1)</script>",
  patientPhone: "",
  patientAge: 30,
  patientSex: "Female",
  referringDoctor: "Dr Test",
  branch: "Main",
  priority: "routine",
  status: "released",
  barcode: "sample-a",
  sampleNote: "",
  results: [
    {
      name: "Haemoglobin",
      unit: "g/dL",
      reference: "Configured range",
      value: "12"
    }
  ],
  findings: "",
  impression: "",
  reportNote: "",
  version: 8,
  scheduledAt: null,
  releasedAt: "2026-10-19T08:00:00Z",
  releasedBy: "doctor-a",
  createdAt: "2026-10-19T06:00:00Z",
  serviceSnapshot: {
    name: "CBC",
    code: "CBC",
    specimen: "Blood",
    modality: null,
    preparation: "",
    pricePaise: 50000,
    turnaroundHours: 24,
    parameters: [
      { name: "Haemoglobin", unit: "g/dL", reference: "Configured range" }
    ]
  }
};
describe("diagnostic UI boundaries", () => {
  test("clinical and reception teams can reach their diagnostic workspace", () => {
    for (const role of [
      "DOCTOR",
      "TECHNICIAN",
      "RECEPTIONIST",
      "STAFF",
      "doctor",
      "receptionist",
      "lab_tech"
    ]) {
      expect(getAllowedDashboardPages(role, [], "pathology")).toContain(
        "services"
      );
      expect(getAllowedDashboardPages(role, [], "pathology")).toContain(
        "reports"
      );
      expect(getAllowedDashboardPages(role, [], "pathology")).toContain(
        "staff"
      );
      expect(getAllowedDashboardPages(role, [], "radiology")).toContain(
        "radiology"
      );
    }
    expect(
      getAllowedDashboardPages("RECEPTIONIST", [], "hospital")
    ).not.toContain("pathology");
  });
  test("a draft cannot render a printable authorised report", () => {
    const html = renderToStaticMarkup(
      <DiagnosticReport
        order={{ ...order, status: "review", releasedAt: null }}
      />
    );
    expect(html).not.toContain('id="diagnostic-report"');
    expect(html).not.toContain("Print / save as PDF");
  });
  test("released pathology reports render structured results and escape patient text", () => {
    const html = renderToStaticMarkup(
      <DiagnosticReport order={order} organizationName="Test Lab" />
    );
    expect(html).toContain("Test Lab");
    expect(html).toContain("Haemoglobin");
    expect(html).toContain("g/dL");
    expect(html).toContain("Configured range");
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("doctor-a");
  });
  test("released imaging reports include findings and impression", () => {
    const html = renderToStaticMarkup(
      <DiagnosticReport
        order={{
          ...order,
          kind: "radiology",
          imageUrl: "https://pacs.example.com/study/123",
          findings: "Test findings",
          impression: "Test impression"
        }}
      />
    );
    expect(html).toContain("Study ID");
    expect(html).toContain("https://pacs.example.com/study/123");
    expect(html).toContain("Test findings");
    expect(html).toContain("Test impression");
  });
  test("authorisation controls and data caches remain scoped", () => {
    expect(diagnosticPermissions("OWNER").release).toBe(false);
    expect(diagnosticPermissions("TECHNICIAN").release).toBe(false);
    expect(diagnosticPermissions("DOCTOR").release).toBe(true);
    expect(diagnosticPermissions("RECEPTIONIST").results).toBe(false);
    expect(virujBackend.diagnostics.key("tenant-a", "orders")).not.toEqual(
      virujBackend.diagnostics.key("tenant-b", "orders")
    );
    expect(diagnosticMoney(12345)).toContain("123.45");
  });
});
