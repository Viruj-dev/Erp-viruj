import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/navigation", () => ({
  usePathname: () => "/hospital/my-hospital/dashboard",
  useRouter: () => ({ push() {}, replace() {} }),
}));

const { RoleDashboardPage } = await import("./role-dashboard-page");

test("metric charts use available analytics and hide empty or unavailable trends", () => {
  const analytics = {
    stats: [
      { label: "Appointment Requests", value: "142", note: "Loaded requests" },
      { label: "Active Doctors", value: "734", note: "Published doctors" },
    ],
    charts: [
      { title: "Appointments", values: [3, 5] },
      { title: "Doctors", values: [2, 4] },
      { title: "Services", values: [0, 0] },
    ],
  };
  const render = (unavailable: string[] = []) =>
    renderToStaticMarkup(
      <RoleDashboardPage
        tone="hospital"
        userName="Test"
        analytics={analytics}
        unavailable={unavailable}
      />
    );
  const loaded = render();
  expect(loaded.match(/class="erp-metric-trend"/g)).toHaveLength(2);
  expect(loaded).toContain("142");
  expect(loaded).toContain("734");
  const missingDoctors = render(["doctors"]);
  expect(missingDoctors.match(/class="erp-metric-trend"/g)).toHaveLength(1);
  expect(missingDoctors).not.toContain("734");
  expect(render(["analytics"])).not.toContain('class="erp-metric-trend"');
  expect(loaded.indexOf("Appointment inbox")).toBeLessThan(
    loaded.indexOf("Activity overview")
  );
});
