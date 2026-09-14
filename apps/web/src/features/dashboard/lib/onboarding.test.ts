import { expect, test } from "bun:test";
import { shouldStartOrganizationOnboarding } from "./onboarding";

test("onboarding is decided before rendering home for hospital and clinic accounts", () => {
  const now = Date.parse("2026-09-13T12:00:00Z");
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null };
  for (const organizationType of ["hospital", "clinic"]) {
    values.clear();
    const organization = {
      id: "new",
      organizationType,
      createdAt: new Date(now - 1000),
    };
    const prefix = `viruj:${organizationType}-onboarding`;
    // A fresh login may have no signup start flag, but must still go straight to onboarding.
    expect(shouldStartOrganizationOnboarding(organization, storage, now)).toBe(
      true
    );
    expect(
      shouldStartOrganizationOnboarding(
        { ...organization, createdAt: organization.createdAt.toISOString() },
        storage,
        now
      )
    ).toBe(true);
    values.set(`${prefix}:completed:new`, "1");
    expect(shouldStartOrganizationOnboarding(organization, storage, now)).toBe(
      false
    );
    expect(
      shouldStartOrganizationOnboarding(
        { ...organization, id: "another" },
        storage,
        now
      )
    ).toBe(true);
    values.clear();
    const existing = {
      ...organization,
      createdAt: new Date(now - 3 * 60 * 60 * 1000),
    };
    expect(shouldStartOrganizationOnboarding(existing, storage, now)).toBe(
      false
    );
    values.set(`${prefix}:start`, "1");
    expect(shouldStartOrganizationOnboarding(existing, storage, now)).toBe(
      true
    );
  }
  expect(shouldStartOrganizationOnboarding(null, storage, now)).toBe(false);
  expect(
    shouldStartOrganizationOnboarding(
      { id: "doctor", organizationType: "doctor", createdAt: new Date(now) },
      storage,
      now
    )
  ).toBe(false);
  values.clear();
  expect(
    shouldStartOrganizationOnboarding(
      { id: "invalid", organizationType: "hospital", createdAt: "invalid" },
      storage,
      now
    )
  ).toBe(false);
});
