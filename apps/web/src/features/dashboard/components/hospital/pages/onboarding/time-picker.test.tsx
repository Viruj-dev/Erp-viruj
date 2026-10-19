import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DateTimePicker } from "./date-time-picker";
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

test("appointment date and time use calendar and clock dialogs", () => {
  const html = renderToStaticMarkup(
    <DateTimePicker
      label="Appointment start"
      value="2026-10-20T09:00"
      onChange={() => {}}
      themeClassName="vh-onboarding--pathology"
    />
  );
  expect(html).toContain("Appointment start date: 2026-10-20");
  expect(html).toContain('aria-haspopup="dialog"');
  expect(html).not.toContain('type="date"');
  expect(html).not.toContain('type="time"');
  expect(html).not.toContain('type="datetime-local"');
});
