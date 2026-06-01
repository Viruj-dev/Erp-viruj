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
  "onboarding",
  "availability",
  "documents",
  "leaves",
  "consultations",
  "locations",
  "verification",
  "doctor-settings",
  "staff",
  "community",
  "billing",
  "pricing",
  "settings",
  "settings-alert-rules",
  "settings-audit-logs",
  "settings-storage",
  "settings-data-export",
  "analytics",
  "doctors",
  "hospital-profile",
  "radiology",
  "pathology",
  "pharmacy",
  "notifications",
  "reports",
  "profile",
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
  ADMIN: "dashboard",
  APPOINTMENT_HANDLER: "appointments-dashboard",
  COMMUNITY_MANAGER: "community",
  DOCTOR: "dashboard",
  MANAGER: "dashboard",
  ORG_ADMIN: "dashboard",
  OWNER: "dashboard",
  RECEPTIONIST: "appointments-dashboard",
  STAFF: "dashboard",
  TECHNICIAN: "pathology",
  admin: "dashboard",
  billing: "finance",
  doctor: "dashboard",
  lab_tech: "pathology",
  manager: "staff",
  owner: "dashboard",
  receptionist: "appointments-dashboard",
};

export const allowedDashboardPagesByRole: Record<
  OrganizationMemberRole,
  DashboardPage[]
> = {
  OWNER: [
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
    "pricing",
    "settings",
    "settings-alert-rules",
    "settings-audit-logs",
    "settings-storage",
    "settings-data-export",
    "analytics",
    "doctors",
    "hospital-profile",
    "radiology",
    "pathology",
    "pharmacy",
    "notifications",
    "reports",
    "profile",
  ],
  ADMIN: [
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
    "pricing",
    "settings",
    "settings-alert-rules",
    "settings-audit-logs",
    "settings-storage",
    "settings-data-export",
    "analytics",
    "doctors",
    "hospital-profile",
    "radiology",
    "pathology",
    "pharmacy",
    "notifications",
    "reports",
    "profile",
  ],
  MANAGER: [
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
    "pricing",
    "settings",
    "analytics",
    "doctors",
    "hospital-profile",
    "radiology",
    "pathology",
    "reports",
    "profile",
  ],
  DOCTOR: [
    "dashboard",
    "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "patients",
    "onboarding",
    "availability",
    "documents",
    "leaves",
    "consultations",
    "locations",
    "verification",
    "doctor-settings",
    "reports",
    "profile",
  ],
  STAFF: ["dashboard", "appointments", "patients", "reports", "profile"],
  RECEPTIONIST: [
    "dashboard",
    "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "patients",
    "notifications",
    "profile",
  ],
  TECHNICIAN: ["dashboard", "pathology", "radiology", "patients", "reports", "profile"],
  APPOINTMENT_HANDLER: [
    "dashboard",
    "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "appointments-settings",
    "patients",
    "profile",
  ],
  COMMUNITY_MANAGER: ["dashboard", "community", "profile"],
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
    "pricing",
    "settings",
    "settings-alert-rules",
    "settings-audit-logs",
    "settings-storage",
    "settings-data-export",
    "analytics",
    "doctors",
    "hospital-profile",
    "radiology",
    "pathology",
    "pharmacy",
    "notifications",
    "reports",
    "profile",
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
    "pricing",
    "settings",
    "settings-alert-rules",
    "settings-audit-logs",
    "settings-storage",
    "settings-data-export",
    "analytics",
    "doctors",
    "hospital-profile",
    "radiology",
    "pathology",
    "pharmacy",
    "notifications",
    "reports",
    "profile",
  ],
  billing: [
    "dashboard",
    "finance",
    "billing",
    "pricing",
    "reports",
    "settings",
    "profile",
  ],
  doctor: [
    "dashboard",
    "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "appointments-settings",
    "patients",
    "onboarding",
    "availability",
    "documents",
    "leaves",
    "consultations",
    "locations",
    "verification",
    "doctor-settings",
    "reports",
    "profile",
  ],
  lab_tech: ["dashboard", "pathology", "patients", "reports", "profile"],
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
    "pricing",
    "settings",
    "settings-alert-rules",
    "settings-audit-logs",
    "settings-storage",
    "settings-data-export",
    "analytics",
    "doctors",
    "hospital-profile",
    "radiology",
    "pathology",
    "pharmacy",
    "notifications",
    "reports",
    "profile",
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
    "pricing",
    "settings",
    "settings-alert-rules",
    "settings-audit-logs",
    "settings-storage",
    "settings-data-export",
    "analytics",
    "doctors",
    "hospital-profile",
    "radiology",
    "pathology",
    "pharmacy",
    "notifications",
    "reports",
    "profile",
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
    "profile",
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
    case "hospital-profile":
    case "hospital":
      return "hospital-profile";
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
    case "onboarding":
      return "onboarding";
    case "availability":
    case "schedule":
      return "availability";
    case "documents":
    case "files":
      return "documents";
    case "leaves":
    case "leave-management":
      return "leaves";
    case "consultations":
    case "consultation":
      return "consultations";
    case "locations":
    case "practice-locations":
      return "locations";
    case "verification":
    case "credentials":
      return "verification";
    case "doctor-settings":
      return "doctor-settings";
    case "staff":
      return "staff";
    case "billing":
      return "billing";
    case "pricing":
      return "pricing";
    default:
      return isDashboardPage(value) ? value : "dashboard";
  }
}

export function getAllowedDashboardPages(
  role?: string | null
): DashboardPage[] {
  const fallbackRole: OrganizationMemberRole = "OWNER";

  return (
    allowedDashboardPagesByRole[
      (role as OrganizationMemberRole | undefined) ?? fallbackRole
    ] ?? allowedDashboardPagesByRole[fallbackRole]
  );
}

export function getDefaultDashboardPage(role?: string | null): DashboardPage {
  const fallbackRole: OrganizationMemberRole = "OWNER";

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
