"use client";

import { RoleDashboardPage } from "@/features/dashboard/components/shared/role-dashboard-page";

export function ErpDemoDashboard({
  organizationLabel,
  userName,
}: {
  organizationLabel: string;
  roleLabel: string;
  userName: string;
}) {
  return (
    <RoleDashboardPage
      tone={organizationLabel.toLowerCase() === "clinic" ? "clinic" : "hospital"}
      userName={userName}
    />
  );
}
