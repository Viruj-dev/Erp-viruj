import { expect, test } from "bun:test";
import { clinicServices } from "./clinic-services";
import { facilityCategories } from "./constants";
import { slugify } from "./utils";

test("clinic catalog has unique service names, supported categories and unique generated slugs", () => {
  expect(clinicServices).toHaveLength(80);
  expect(new Set(clinicServices.map(service => service.name)).size).toBe(80);
  expect(new Set(clinicServices.map(service => slugify(service.name))).size).toBe(80);
  for (const service of clinicServices) expect(facilityCategories).toContain(service.category);
});
