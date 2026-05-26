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
  "finance",
  "appointments",
  "appointments-dashboard",
  "appointments-review",
  "appointments-patients",
  "appointments-settings",
  "patients",
  "staff",
  "community",
  "billing",
  "settings",
  "settings-alert-rules",
  "settings-audit-logs",
  "settings-storage",
  "settings-data-export",
  "analytics",
  "doctors",
  "radiology",
  "pathology",
  "pharmacy",
  "notifications",
  "reports",
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
  APPOINTMENT_HANDLER: "appointments-dashboard",
  COMMUNITY_MANAGER: "community",
  FINANCE_MANAGER: "finance",
  ORG_ADMIN: "dashboard",
  admin: "dashboard",
  billing: "finance",
  doctor: "doctors",
  lab_tech: "pathology",
  manager: "staff",
  owner: "dashboard",
  receptionist: "appointments-dashboard",
};

export const allowedDashboardPagesByRole: Record<
  OrganizationMemberRole,
  DashboardPage[]
> = {
  APPOINTMENT_HANDLER: [
    "dashboard",
    "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "appointments-settings",
    "patients",
  ],
  COMMUNITY_MANAGER: ["dashboard", "community"],
  FINANCE_MANAGER: ["dashboard", "finance", "billing", "reports", "settings"],
  ORG_ADMIN: [
    "dashboard",
    "finance",
    "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "appointments-settings",
    "patients",
    "staff",
    "community",
    "billing",
    "settings",
    "settings-alert-rules",
    "settings-audit-logs",
    "settings-storage",
    "settings-data-export",
    "analytics",
    "doctors",
    "radiology",
    "pathology",
    "pharmacy",
    "notifications",
    "reports",
  ],
  admin: [
    "dashboard",
    "finance",
    "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "appointments-settings",
    "patients",
    "staff",
    "community",
    "billing",
    "settings",
    "settings-alert-rules",
    "settings-audit-logs",
    "settings-storage",
    "settings-data-export",
    "analytics",
    "doctors",
    "radiology",
    "pathology",
    "pharmacy",
    "notifications",
    "reports",
  ],
  billing: ["dashboard", "finance", "billing", "reports", "settings"],
  doctor: [
    "dashboard",
    "doctors",
    "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "appointments-settings",
    "patients",
    "reports",
  ],
  lab_tech: ["dashboard", "pathology", "patients", "reports"],
  manager: [
    "dashboard",
    "finance",
    "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "appointments-settings",
    "patients",
    "staff",
    "community",
    "billing",
    "settings",
    "settings-alert-rules",
    "settings-audit-logs",
    "settings-storage",
    "settings-data-export",
    "analytics",
    "doctors",
    "radiology",
    "pathology",
    "pharmacy",
    "notifications",
    "reports",
  ],
  owner: [
    "dashboard",
    "finance",
    "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "appointments-settings",
    "patients",
    "staff",
    "community",
    "billing",
    "settings",
    "settings-alert-rules",
    "settings-audit-logs",
    "settings-storage",
    "settings-data-export",
    "analytics",
    "doctors",
    "radiology",
    "pathology",
    "pharmacy",
    "notifications",
    "reports",
  ],
  receptionist: [
    "dashboard",
    "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "appointments-settings",
    "patients",
    "notifications",
  ],
};

export function isDashboardOrganizationType(
  value: string
): value is DashboardOrganizationType {
  return organizationTypeOptions.includes(value as DashboardOrganizationType);
}

export function isDashboardPage(value: string): value is DashboardPage {
  return dashboardPageOptions.includes(value as DashboardPage);
}

export function normalizeDashboardModule(value: string): DashboardPage {
  switch (value) {
    case "admin":
      return "dashboard";
    case "finance":
      return "finance";
    case "appointments":
    case "appointment":
      return "appointments-dashboard";
    case "appointments-dashboard":
    case "appointment-dashboard":
      return "appointments-dashboard";
    case "appointments-review":
    case "appointment-review":
      return "appointments-review";
    case "appointments-patients":
    case "appointment-patients":
      return "appointments-patients";
    case "appointments-settings":
    case "appointment-settings":
      return "appointments-settings";
    case "community":
      return "community";
    case "analytics":
      return "analytics";
    case "doctors":
    case "doctor":
      return "doctors";
    case "radiology":
      return "radiology";
    case "pathology":
      return "pathology";
    case "pharmacy":
      return "pharmacy";
    case "notifications":
      return "notifications";
    case "reports":
      return "reports";
    case "patients":
      return "patients";
    case "staff":
      return "staff";
    case "billing":
      return "billing";
    default:
      return isDashboardPage(value) ? value : "dashboard";
  }
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
  const appointmentRoute = getAppointmentRouteSegment(page);

  if (appointmentRoute) {
    return `/${organizationType}/appointments/${appointmentRoute}`;
  }

  return page === "dashboard"
    ? `/${organizationType}`
    : `/${organizationType}/${page}`;
}

export function buildTenantDashboardPath(
  organizationType: DashboardOrganizationType,
  organizationSlug: string,
  page: DashboardPage = "dashboard"
) {
  const slug = organizationSlug.trim() || "workspace";
  const appointmentRoute = getAppointmentRouteSegment(page);

  if (appointmentRoute) {
    return `/${organizationType}/${slug}/appointments/${appointmentRoute}`;
  }

  return page === "dashboard"
    ? `/${organizationType}/${slug}/dashboard`
    : `/${organizationType}/${slug}/${page}/dashboard`;
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

function getAppointmentRouteSegment(page: DashboardPage) {
  switch (page) {
    case "appointments":
    case "appointments-dashboard":
      return "dashboard";
    case "appointments-review":
      return "review";
    case "appointments-patients":
      return "patients";
    case "appointments-settings":
      return "settings";
    default:
      return null;
  }
}
