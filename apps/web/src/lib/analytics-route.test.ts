import { expect, test } from "bun:test";
import { getAnalyticsPath } from "./analytics-route";

test("analytics routes retain module names and redact record and invitation IDs", () => {
  expect(getAnalyticsPath("/")).toBe("/");
  expect(
    getAnalyticsPath(
      "/clinic/clinic-123/appointments/patient-details/patient-456"
    )
  ).toBe("/clinic/:id/appointments/patient-details/:id");
  expect(getAnalyticsPath("/staff-confirmation/private-invitation-token")).toBe(
    "/staff-confirmation/:id"
  );
  expect(getAnalyticsPath("/hospital/tenant-123/finance/dashboard")).toBe(
    "/hospital/:id/finance/dashboard"
  );
});
