import { describe, expect, test } from "bun:test";
import { fallbackSubscriptionPlans } from "./subscription.api";

describe("fallback subscription plans", () => {
  test("keeps the three seeded hospital plans visible when payment plans cannot load", () => {
    expect(fallbackSubscriptionPlans.map((plan) => plan.code)).toEqual([
      "HOSPITAL_BASIC",
      "HOSPITAL_COMPLETE",
      "HOSPITAL_ENTERPRISE",
    ]);
    expect(fallbackSubscriptionPlans.map((plan) => plan.publicName)).toEqual([
      "Hospital Basic",
      "Hospital Complete",
      "Hospital Enterprise",
    ]);
    expect(fallbackSubscriptionPlans).toHaveLength(3);
  });
});