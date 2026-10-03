import {
  dashboardPageOptions,
  organizationTypeOptions,
} from "@/features/dashboard/lib/routing";

const publicSegments = new Set<string>([
  ...dashboardPageOptions,
  ...organizationTypeOptions,
  "auth",
  "staff-confirmation",
  "review",
  "patient-details",
]);

export function getAnalyticsPath(pathname: string): string {
  return pathname
    .split("/")
    .map((segment) =>
      !segment || publicSegments.has(segment) ? segment : ":id"
    )
    .join("/");
}
