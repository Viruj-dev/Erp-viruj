import { ErpHomeScreen } from "@/features/dashboard/screens/erp-home-screen";

export default async function OrganizationDashboardPage({
  params,
}: {
  params: Promise<{
    organizationType: string;
  }>;
}) {
  const { organizationType } = await params;

  return (
    <ErpHomeScreen currentPage="dashboard" routeOrganizationType={organizationType} />
  );
}
