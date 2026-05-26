import {
  isDashboardPage,
  normalizeDashboardModule,
} from "@/features/dashboard/lib/routing";
import { ErpHomeScreen } from "@/features/dashboard/screens/erp-home-screen";

export default async function OrganizationTenantRoutePage({
  params,
}: {
  params: Promise<{
    organizationType: string;
    segments: string[];
  }>;
}) {
  const { organizationType, segments } = await params;

  return (
    <ErpHomeScreen
      currentPage={resolveRoutePage(segments)}
      routeOrganizationType={organizationType}
    />
  );
}

function resolveRoutePage(segments: string[]) {
  const lastSegment = segments.at(-1);
  const appointmentIndex = segments.indexOf("appointments");

  if (appointmentIndex >= 0) {
    const appointmentSection = segments[appointmentIndex + 1] ?? "dashboard";

    switch (appointmentSection) {
      case "dashboard":
        return "appointments-dashboard";
      case "review":
        return "appointments-review";
      case "patients":
      case "patient-details":
        return "appointments-patients";
      case "settings":
        return "appointments-settings";
      default:
        return "appointments-dashboard";
    }
  }

  if (lastSegment === "dashboard") {
    if (segments.length >= 3) {
      return normalizeDashboardModule(segments.at(-2) ?? "dashboard");
    }

    const firstSegment = segments[0] ?? "dashboard";
    return isDashboardPage(firstSegment)
      ? normalizeDashboardModule(firstSegment)
      : "dashboard";
  }

  return normalizeDashboardModule(segments[0] ?? "dashboard");
}
