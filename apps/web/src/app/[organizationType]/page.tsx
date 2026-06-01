import { DoctorHomeScreen } from "@/features/dashboard/screens/doctor-home-screen";
import { ErpHomeScreen } from "@/features/dashboard/screens/erp-home-screen";

export default async function OrganizationDashboardPage({
  params,
}: {
  params: Promise<{
    organizationType: string;
  }>;
}) {
  const { organizationType } = await params;

  if (organizationType === "doctor") {
    return (
      <DoctorHomeScreen
        currentPage="dashboard"
        routeOrganizationType={organizationType}
        routeSegments={[]}
      />
    );
  }

  return (
    <ErpHomeScreen currentPage="dashboard" routeOrganizationType={organizationType} />
  );
}
