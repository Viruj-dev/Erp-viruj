"use client";

import { RoleDashboardPage } from "@/features/dashboard/components/shared/role-dashboard-page";

export function ClinicDashboardPage({
  userName,
}: {
  roleLabel: string;
  userName: string;
}) {
  return <RoleDashboardPage tone="clinic" userName={userName} />;
}
