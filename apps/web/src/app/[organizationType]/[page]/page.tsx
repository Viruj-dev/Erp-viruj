import { ErpHomeScreen } from "@/features/dashboard/screens/erp-home-screen";

export default async function OrganizationDashboardDetailPage({
  params,
}: {
  params: Promise<{
    organizationType: string;
    page: string;
  }>;
}) {
  const { organizationType, page } = await params;

  return (
    <ErpHomeScreen
      currentPage={page}
      routeOrganizationType={organizationType}
    />
  );
}
