import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { radiologyServicePresets } from "@/features/dashboard/lib/radiology-services";
import type { DiagnosticService } from "@/features/dashboard/lib/diagnostics";
import { DiagnosticServiceForm } from "./diagnostic-catalogue";

function render(
  kind: "radiology" | "pathology",
  preset?: Omit<(typeof radiologyServicePresets)[number], "contrast"> & {
    contrast?: boolean;
    availability?: DiagnosticService["availability"];
  }
) {
  const client = new QueryClient();
  const tenant = createErpTenantContext({
    organizationId: `${kind}-a`,
    providerType: kind,
    role: "OWNER"
  })!;
  const service: DiagnosticService | undefined = preset
    ? {
        ...preset,
        id: "service-a",
        kind: "radiology",
        specimen: null,
        pricePaise: 10000,
        turnaroundHours: 24,
        preparation: "",
        parameters: [],
        active: true
      }
    : undefined;
  const html = renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <DiagnosticServiceForm
        tenant={tenant}
        service={service}
        onSaved={() => {}}
      />
    </QueryClientProvider>
  );
  client.clear();
  return html;
}

test("radiology offers its own service picker and preserves saved service fields", () => {
  const preset = radiologyServicePresets.find(
    (item) => item.name === "MRI Brain"
  )!;
  const html = render("radiology", preset);
  expect(html).toContain("Choose a test or service");
  expect(html).toContain(`value="${preset.code}"`);
  expect(html).toContain('value="MRI Brain"');
  expect(html).toContain('value="MRI"');
  expect(html).toContain('type="hidden" name="code"');
  expect(html).not.toContain("Service code");
  expect(html).toContain("Imaging details");
  expect(render("pathology")).toContain("Choose a test or service");
});

test("support services do not require a body part and duplicate names keep their saved category", () => {
  const support = radiologyServicePresets.find(
    (item) => item.name === "Radiologist Consultation"
  )!;
  expect(render("radiology", support)).not.toMatch(
    /<input(?=[^>]*name="bodyPart")(?=[^>]*required)[^>]*>/
  );
  const breast = radiologyServicePresets.find(
    (item) =>
      item.name === "Breast Ultrasound" &&
      item.category === "Mammography and Breast Imaging"
  )!;
  const html = render("radiology", breast);
  expect(html).toContain(`value="${breast.code}"`);
  expect(html).toContain("Imaging details");
});

test("existing custom radiology services retain their name, code and modality", () => {
  const html = render("radiology", {
    name: "Custom scan",
    code: "CUSTOM-1",
    modality: "CT",
    category: "Custom"
  });
  for (const value of ["Custom scan", "CUSTOM-1", "CT"])
    expect(html).toContain(`value="${value}"`);
});

test("both service cards start with a picker and lock details until selection", () => {
  for (const kind of ["pathology", "radiology"] as const) {
    const html = render(kind);
    expect(html).not.toContain("Service code");
    expect(html).toContain("Mobile booking hours");
    expect(html).toContain(
      "Offer recurring appointment times for this service"
    );
    expect(html).toMatch(
      /<textarea(?=[^>]*name="description")(?=[^>]*disabled)[^>]*>/
    );
    expect(html).toMatch(/<input(?=[^>]*name="name")(?=[^>]*readOnly)[^>]*>/i);
    expect(html).toMatch(
      /<button(?=[^>]*type="submit")(?=[^>]*disabled)[^>]*>/
    );
  }
});

test("saved radiology availability shows selected days and the original India-time window", () => {
  const preset = radiologyServicePresets.find(
    (item) => item.name === "MRI Brain"
  )!;
  const html = render("radiology", {
    ...preset,
    availability: { days: [1, 3], startsAt: "10:00", endsAt: "14:00" }
  });
  expect(html).toContain("Service working days");
  expect(html).toContain("From (IST): 10:00 AM");
  expect(html).toContain("Until (IST): 2:00 PM");
  expect(html).toContain('aria-pressed="true"');
  expect(html).toContain("border-teal-700");
});
