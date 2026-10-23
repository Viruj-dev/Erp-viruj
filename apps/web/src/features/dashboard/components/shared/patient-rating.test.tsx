import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
mock.module("next/navigation", () => ({
  usePathname: () => "/hospital/c-hospital/dashboard",
}));
const { RoleDashboardPage } = await import("./role-dashboard-page");
test("hospital ERP displays the app's average and rating count", () => {
  const html = renderToStaticMarkup(
    <RoleDashboardPage
      tone="hospital"
      userName="Owner"
      analytics={{ ratingSummary: { averageRating: 4.4, ratingCount: 17 } }}
    />
  );
  expect(html).toContain("Patient rating");
  expect(html).toContain("4.4 / 5");
  expect(html).toContain("17 patient ratings");
});
test("an unrated hospital has no fabricated zero-star average", () => {
  const html = renderToStaticMarkup(
    <RoleDashboardPage
      tone="hospital"
      userName="Owner"
      analytics={{ ratingSummary: { averageRating: null, ratingCount: 0 } }}
    />
  );
  expect(html).toContain("No ratings yet");
  expect(html).not.toContain("0.0 / 5");
});
