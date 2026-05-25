"use client";

import type { OrganizationMemberRole } from "@erp_virujhealth/auth/roles";

export const organizationTypeOptions = [
  "hospital",
  "clinic",
  "doctor",
  "pathology",
  "radiology",
] as const;

export type DashboardOrganizationType =
  (typeof organizationTypeOptions)[number];

export const dashboardPageOptions = [
  "dashboard",
  "appointments",
  "patients",
  "staff",
  "community",
  "analytics",
] as const;

export type DashboardPage = (typeof dashboardPageOptions)[number];

export const organizationTypeLabels: Record<DashboardOrganizationType, string> =
  {
    clinic: "Clinic",
    doctor: "Doctor",
    hospital: "Hospital",
    pathology: "Pathology",
    radiology: "Radiology",
  };

export const defaultDashboardPageByRole: Record<
  OrganizationMemberRole,
  DashboardPage
> = {
  APPOINTMENT_HANDLER: "appointments",
  COMMUNITY_MANAGER: "community",
  FINANCE_MANAGER: "analytics",
  ORG_ADMIN: "dashboard",
  admin: "dashboard",
  billing: "analytics",
  doctor: "appointments",
  lab_tech: "analytics",
  manager: "staff",
  owner: "dashboard",
  receptionist: "patients",
};

export const allowedDashboardPagesByRole: Record<
  OrganizationMemberRole,
  DashboardPage[]
> = {
  APPOINTMENT_HANDLER: ["dashboard", "appointments", "patients"],
  COMMUNITY_MANAGER: ["dashboard", "community"],
  FINANCE_MANAGER: ["dashboard", "patients", "analytics"],
  ORG_ADMIN: [
    "dashboard",
    "appointments",
    "patients",
    "staff",
    "community",
    "analytics",
  ],
  admin: [
    "dashboard",
    "appointments",
    "patients",
    "staff",
    "community",
    "analytics",
  ],
  billing: ["dashboard", "patients", "analytics"],
  doctor: ["dashboard", "appointments", "patients", "community", "analytics"],
  lab_tech: ["dashboard", "patients", "staff", "community", "analytics"],
  manager: [
    "dashboard",
    "appointments",
    "patients",
    "staff",
    "community",
    "analytics",
  ],
  owner: [
    "dashboard",
    "appointments",
    "patients",
    "staff",
    "community",
    "analytics",
  ],
  receptionist: ["dashboard", "appointments", "patients", "staff", "community"],
};

export function isDashboardOrganizationType(
  value: string
): value is DashboardOrganizationType {
  return organizationTypeOptions.includes(value as DashboardOrganizationType);
}

export function isDashboardPage(value: string): value is DashboardPage {
  return dashboardPageOptions.includes(value as DashboardPage);
}

export function getAllowedDashboardPages(
  role?: string | null
): DashboardPage[] {
  const fallbackRole: OrganizationMemberRole = "ORG_ADMIN";

  return (
    allowedDashboardPagesByRole[
      (role as OrganizationMemberRole | undefined) ?? fallbackRole
    ] ?? allowedDashboardPagesByRole[fallbackRole]
  );
}

export function getDefaultDashboardPage(role?: string | null): DashboardPage {
  const fallbackRole: OrganizationMemberRole = "ORG_ADMIN";

  return (
    defaultDashboardPageByRole[
      (role as OrganizationMemberRole | undefined) ?? fallbackRole
    ] ?? defaultDashboardPageByRole[fallbackRole]
  );
}

export function buildDashboardPath(
  organizationType: DashboardOrganizationType,
  page: DashboardPage = "dashboard"
) {
  return page === "dashboard"
    ? `/${organizationType}`
    : `/${organizationType}/${page}`;
}

export function resolveAccessibleDashboardPage(
  requestedPage: DashboardPage,
  role?: string | null
) {
  const allowedPages = getAllowedDashboardPages(role);

  return allowedPages.includes(requestedPage)
    ? requestedPage
    : getDefaultDashboardPage(role);
}
