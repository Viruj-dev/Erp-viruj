import { describe, expect, test } from "bun:test";
import { fallbackSubscriptionPlans } from "./subscription.api";

describe("fallback subscription plans", () => {
  test("keeps seeded hospital plans visible when payment plans cannot load", () => {
    expect(fallbackSubscriptionPlans.map((plan) => plan.code)).toEqual([
      "HOSPITAL_FREE_TRIAL",
      "HOSPITAL_BASIC",
      "HOSPITAL_COMPLETE",
    ]);
    expect(fallbackSubscriptionPlans.map((plan) => plan.publicName)).toEqual([
      "Hospital Free Trial",
      "Hospital Basic",
      "Hospital Complete",
    ]);
    expect(fallbackSubscriptionPlans[0].activeVersion.trialDurationDays).toBe(30);
    expect(fallbackSubscriptionPlans[0].activeVersion.features).not.toContainEqual({ code: "advanced_analytics", enabled: true });
    expect(fallbackSubscriptionPlans).toHaveLength(3);
  });
});