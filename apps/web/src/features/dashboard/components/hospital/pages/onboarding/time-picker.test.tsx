import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { formatTime, TimePicker } from "./time-picker";

test("clock labels handle midnight, noon and exact minutes", () => {
  expect(formatTime("00:00")).toBe("12:00 AM");
  expect(formatTime("12:00")).toBe("12:00 PM");
  expect(formatTime("18:07")).toBe("6:07 PM");
  expect(formatTime("")).toBe("Set time");
});

test("onboarding times open a clock dialog instead of a native time input", () => {
  const html = renderToStaticMarkup(
    <TimePicker
      label="Opening time"
      value="09:00"
      onChange={() => {}}
      themeClassName="vh-onboarding--pathology"
    />
  );
  expect(html).toContain('aria-haspopup="dialog"');
  expect(html).toContain("Opening time: 9:00 AM");
  expect(html).not.toContain('type="time"');
});
