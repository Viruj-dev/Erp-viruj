import { expect, test } from "bun:test";
import {
  canManageDiagnosticSetup,
  needsDiagnosticProfileCompletion,
  type DiagnosticOnboardingState,
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

function completedSetup(): DiagnosticOnboardingState {
  return {
    completedAt: "2026-10-20T00:00:00Z",
    version: 1,
    data: {
      ...emptyDiagnosticSetup("Test lab", "lab@example.com"),
      registrationNumber: "LAB-123",
      phone: "9876543210",
      address: "Main Road",
      city: "Delhi",
      state: "Delhi",
      postalCode: "110001",
    },
  };
}

test("prompts for absent setup and unfinished drafts", () => {
  expect(
    needsDiagnosticProfileCompletion(
      { data: null, completedAt: null, version: 0 },
      "pathology"
    )
  ).toBe(true);
  expect(
    needsDiagnosticProfileCompletion(
      { ...completedSetup(), completedAt: null },
      "pathology"
    )
  ).toBe(true);
});

test("detects missing required fields even when setup was marked complete", () => {
  const setup = completedSetup();
  setup.data!.registrationNumber = "  ";
  expect(needsDiagnosticProfileCompletion(setup, "pathology")).toBe(true);
});

test("hides the prompt for complete pathology and checks radiology-specific fields", () => {
  const setup = completedSetup();
  expect(needsDiagnosticProfileCompletion(setup, "pathology")).toBe(false);
  expect(needsDiagnosticProfileCompletion(setup, "radiology")).toBe(true);
  Object.assign(setup.data!, {
    legalName: "Test Imaging",
    registrationAuthority: "Authority",
    reportingName: "Doctor",
    reportingRegistration: "REG-123",
    reportingEmail: "doctor@example.com",
    equipment: "MRI",
    referralPolicy: "Referral",
    screeningProcess: "Screening",
    imageWorkflow: "PACS",
    modalities: ["MRI"],
  });
  expect(needsDiagnosticProfileCompletion(setup, "radiology")).toBe(false);
  setup.data!.workingDays = [];
  expect(needsDiagnosticProfileCompletion(setup, "radiology")).toBe(true);
});
