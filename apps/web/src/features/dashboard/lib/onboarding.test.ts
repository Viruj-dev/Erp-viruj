import { expect, test } from "bun:test";
import {
  resolveOrganizationOnboardingGate,
  shouldRedirectDiagnosticOnboarding,
} from "./onboarding";

test("the backend decides setup completion on every visit", async () => {
  let requests = 0;
  for (const organizationType of ["hospital", "clinic"]) {
    for (const completed of [true, false, false, true]) {
      const start = await resolveOrganizationOnboardingGate(
        { id: "tenant", organizationType },
        async () => {
          requests += 1;
          return {
            organizationId: "tenant",
            providerType: organizationType,
            onboardingCompleted: completed,
          };
        }
      );
      expect(start).toBe(!completed);
    }
  }
  expect(requests).toBe(8);
});

test("unknown or mismatched setup status cannot unlock the workspace", async () => {
  for (const status of [
    null,
    {},
    { organizationId: "other", onboardingCompleted: true },
    {
      organizationId: "tenant",
      providerType: "clinic",
      onboardingCompleted: true,
    },
  ]) {
    await expect(
      resolveOrganizationOnboardingGate(
        { id: "tenant", organizationType: "hospital" },
        async () => status
      )
    ).rejects.toThrow("verify");
  }
  await expect(
    resolveOrganizationOnboardingGate(
      { id: "tenant", organizationType: "hospital" },
      async () => {
        throw new Error("offline");
      }
    )
  ).rejects.toThrow("offline");
});

test("other provider types do not use the hospital/clinic gate", async () => {
  for (const organization of [
    null,
    { id: "doctor", organizationType: "doctor" },
    { id: "lab", organizationType: "pathology" },
  ]) {
    expect(
      await resolveOrganizationOnboardingGate(organization, async () => {
        throw new Error("must not fetch");
      })
    ).toBe(false);
  }
});

test("incomplete diagnostics can open setup while operational pages stay gated", () => {
  expect(shouldRedirectDiagnosticOnboarding("onboarding", null)).toBe(false);
  for (const page of [
    "dashboard",
    "reports",
    "services",
    "facilities",
    "appointments",
  ])
    expect(shouldRedirectDiagnosticOnboarding(page, null)).toBe(true);
  expect(
    shouldRedirectDiagnosticOnboarding("dashboard", "2026-10-24T00:00:00Z")
  ).toBe(false);
});
