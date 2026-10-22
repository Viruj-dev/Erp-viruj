import { expect, test } from "bun:test";
import { radiologyServicePresets } from "./radiology-services";
import { pathologyServicePresets } from "./pathology-services";

test("all 125 radiology entries retain their ten groups and unique service codes", () => {
  const categories = [
    ...new Set(radiologyServicePresets.map((preset) => preset.category))
  ];
  expect(
    categories.map(
      (category) =>
        radiologyServicePresets.filter((preset) => preset.category === category)
          .length
    )
  ).toEqual([17, 19, 11, 18, 20, 6, 11, 6, 7, 10]);
  expect(radiologyServicePresets).toHaveLength(125);
  expect(
    new Set(radiologyServicePresets.map((preset) => preset.code)).size
  ).toBe(125);
  for (const preset of radiologyServicePresets) {
    expect(preset.code).toMatch(/^RAD-[A-J]-[A-Z0-9-]+$/);
    expect(preset.code.length).toBeLessThanOrEqual(40);
    expect(preset.modality).not.toBe("");
    expect(
      pathologyServicePresets.some((test) => test.code === preset.code)
    ).toBe(false);
  }
  expect(
    radiologyServicePresets
      .filter((preset) => preset.name === "Breast Ultrasound")
      .map((preset) => preset.category)
  ).toEqual(["Ultrasound and Sonography", "Mammography and Breast Imaging"]);
  expect(
    radiologyServicePresets.some(
      (preset) => preset.name === "Contrast Administration, where available"
    )
  ).toBe(true);
  expect(
    radiologyServicePresets.some(
      (preset) => preset.name === "Image-Guided Breast Biopsy, where available"
    )
  ).toBe(true);
});

test("explicit contrast variants have matching defaults", () => {
  for (const name of ["CT Scan with Contrast", "MRI Brain with Contrast"])
    expect(
      radiologyServicePresets.find((preset) => preset.name === name)?.contrast
    ).toBe(true);
  for (const name of ["CT Scan without Contrast", "MRI Brain without Contrast"])
    expect(
      radiologyServicePresets.find((preset) => preset.name === name)?.contrast
    ).toBe(false);
});
