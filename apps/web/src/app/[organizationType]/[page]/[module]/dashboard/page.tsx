import { normalizeDashboardModule } from "@/features/dashboard/lib/routing";
import { ErpHomeScreen } from "@/features/dashboard/screens/erp-home-screen";

export default async function TenantModuleDashboardPage({
  params,
}: {
  params: Promise<{
    module: string;
    organizationType: string;
    page: string;
  }>;
}) {
  const { module, organizationType } = await params;

  return (
    <ErpHomeScreen
      currentPage={normalizeDashboardModule(module)}
      routeOrganizationType={organizationType}
    />
  );
}
