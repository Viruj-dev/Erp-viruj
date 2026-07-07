import {
  isDashboardPage,
  normalizeDashboardModule,
} from "@/features/dashboard/lib/routing";
import { ClinicHomeScreen } from "@/features/dashboard/screens/clinic-home-screen";
import { DoctorHomeScreen } from "@/features/dashboard/screens/doctor-home-screen";
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
  const currentPage = resolveRoutePage(segments);

  if (organizationType === "doctor") {
    return (
      <DoctorHomeScreen
        currentPage={currentPage}
        routeOrganizationType={organizationType}
        routeSegments={segments}
      />
    );
  }

  if (organizationType === "clinic") {
    return (
      <ClinicHomeScreen
        currentPage={currentPage}
        routeOrganizationType={organizationType}
        routeSegments={segments}
      />
    );
  }

  return (
    <ErpHomeScreen
      currentPage={currentPage}
      routeOrganizationType={organizationType}
      routeSegments={segments}
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

  const directPageSegment = segments.find((segment) =>
    segment === "dashboard" || normalizeDashboardModule(segment) !== "dashboard"
  );

  return normalizeDashboardModule(directPageSegment ?? segments[0] ?? "dashboard");
}
