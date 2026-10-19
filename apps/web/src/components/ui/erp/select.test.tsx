import { expect, test } from "bun:test";
import { Fragment } from "react";
import { selectOptions } from "./select";

test("preserves numeric values, display labels, disabled options, and fragments", () => {
  expect(
    selectOptions(
      <>
        <option value="">Select department</option>
        <Fragment>
          <option value={0}>00</option>
          <option value={59} disabled>
            59
          </option>
        </Fragment>
        {false}
        {null}
      </>
    )
  ).toEqual([
    { value: "", label: "Select department", disabled: undefined },
    { value: "0", label: "00", disabled: undefined },
    { value: "59", label: "59", disabled: true },
  ]);
});

test("keeps dynamically rendered option values", () => {
  expect(
    selectOptions(
      ["Clinic", "Hospital"].map((label) => (
        <option key={label} value={label}>
          {label}
        </option>
      ))
    ).map((option) => option.value)
  ).toEqual(["Clinic", "Hospital"]);
});
