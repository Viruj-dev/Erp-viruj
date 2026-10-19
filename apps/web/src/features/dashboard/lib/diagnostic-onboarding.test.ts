import { expect, test } from "bun:test";
import {
  canManageDiagnosticSetup,
  diagnosticSetupKey,
  emptyDiagnosticSetup,
} from "./diagnostic-onboarding";
import { getAllowedDashboardPages } from "./routing";
test("centre setup is available to diagnostic administrators, not clinical staff", () => {
  for (const role of [
    "OWNER",
    "ADMIN",
    "MANAGER",
    "owner",
    "admin",
    "manager",
  ]) {
    expect(canManageDiagnosticSetup(role)).toBe(true);
    expect(getAllowedDashboardPages(role, [], "pathology")).toContain(
      "onboarding"
    );
    expect(getAllowedDashboardPages(role, [], "radiology")).toContain(
      "onboarding"
    );
  }
  for (const role of ["TECHNICIAN", "RECEPTIONIST", "STAFF", "DOCTOR"])
    expect(canManageDiagnosticSetup(role)).toBe(false);
});
test("draft cache and initial setup do not leak between tenants", () => {
  expect(diagnosticSetupKey("lab-a")).not.toEqual(diagnosticSetupKey("lab-b"));
  const a = emptyDiagnosticSetup("Lab A", "a@example.com"),
    b = emptyDiagnosticSetup("Lab B");
  a.specimens.push("Blood");
  expect(b.specimens).toEqual([]);
  expect(a.centreName).toBe("Lab A");
  expect(b.centreName).toBe("Lab B");
  expect(b.homeCollection).toBe(false);
});

test("all organization types include shared sidebar destinations with billing permissions", () => {
  for (const kind of [
    "hospital",
    "clinic",
    "doctor",
    "pathology",
    "radiology",
  ] as const) {
    const pages = getAllowedDashboardPages(
      "OWNER",
      ["subscription.read"],
      kind
    );
    for (const page of [
      "community",
      "gallery",
      "activity-logs",
      "subscription",
    ] as const)
      expect(pages).toContain(page);
    expect(getAllowedDashboardPages("STAFF", [], kind)).not.toContain(
      "subscription"
    );
  }
});
