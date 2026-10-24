import { expect, test } from "bun:test";
import { hospitalServiceGroups, hospitalSteps } from "./constants";
import {
  getDefaultOnboardingState,
  getPersistableOnboardingState,
  mergeOnboardingState,
  toggleServiceSelection,
  validateStep,
} from "./state";

test("hospital setup replaces public controls with all requested service categories", () => {
  expect(hospitalSteps.map((step) => step.id)).toEqual([
    "profile",
    "locations",
    "departments",
    "services",
    "review",
  ]);
  const names = hospitalServiceGroups.flatMap((group) => [...group.services]);
  expect(hospitalServiceGroups).toHaveLength(9);
  expect(names).toHaveLength(58);
  expect(new Set(names).size).toBe(58);
  expect(names).toContain("24x7 Emergency / Trauma Care");
  expect(names).toContain("Visiting Consultants");
});
test("one click selects a service without inventing fees or online booking", () => {
  const services = toggleServiceSelection([], "MRI", "Diagnostics and imaging");
  expect(services).toHaveLength(1);
  expect(services[0]).toMatchObject({
    name: "MRI",
    category: "Diagnostics and imaging",
    price: "",
    duration: "",
    availableOnline: false,
  });
  expect(
    toggleServiceSelection(services, "MRI", "Diagnostics and imaging")
  ).toEqual([]);
});
test("changing selections preserves other saved service information", () => {
  const existing = {
    ...toggleServiceSelection([], "MRI", "Diagnostics and imaging")[0]!,
    price: "1500",
    description: "Existing details",
  };
  const updated = toggleServiceSelection(
    [existing],
    "Blood Bank",
    "Pharmacy and supplies"
  );
  expect(updated[0]).toBe(existing);
  const data = { ...getDefaultOnboardingState(), services: updated };
  expect(validateStep("services", data, "hospital")).toBe("");
  expect(validateStep("services", data, "clinic")).toContain("price");
  const restored = mergeOnboardingState(
    JSON.parse(JSON.stringify(getPersistableOnboardingState(data))),
    {},
    "hospital"
  );
  expect(restored.services).toEqual(updated);
  expect(validateStep("services", { ...data, services: [] }, "hospital")).toBe(
    "Select at least one service."
  );
});
