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
  "clinic-profile",
  "working-hours",
  "offerings",
  "services",
  "facilities",
  "gallery",
  "reviews",
  "community",
  "billing",
  "pricing",
  "subscription",
  "settings",
  "settings-alert-rules",
  "settings-audit-logs",
  "settings-storage",
  "settings-data-export",
  "analytics",
  "activity-logs",
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

export const subscriptionReadPermission = "subscription.read";

export function canAccessSubscriptionPage(
  permissions?: readonly string[] | null
) {
  return permissions?.includes(subscriptionReadPermission) ?? false;
}

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
  CLINIC_ADMIN: "dashboard",
  CLINIC_OWNER: "dashboard",
  CLINIC_STAFF: "dashboard",
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
    "onboarding",
    "finance",
    "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "appointments-settings",
    "patients",
    "staff",
    "gallery",
    "community",
    "billing",
    "pricing",
  "subscription",
    "settings",
    "settings-alert-rules",
    "settings-audit-logs",
    "settings-storage",
    "settings-data-export",
    "analytics",
    "activity-logs",
    "doctors",
    "facilities",
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
    "onboarding",
    "finance",
    "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "appointments-settings",
    "patients",
    "staff",
    "gallery",
    "community",
    "billing",
    "pricing",
  "subscription",
    "settings",
    "settings-alert-rules",
    "settings-audit-logs",
    "settings-storage",
    "settings-data-export",
    "analytics",
    "activity-logs",
    "doctors",
    "facilities",
    "hospital-profile",
    "radiology",
    "pathology",
    "pharmacy",
    "notifications",
    "reports",
    "profile",
  ],
  CLINIC_ADMIN: [
    "dashboard",
  "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "appointments-settings",
    "clinic-profile",
    "locations",
    "working-hours",
    "patients",
    "doctors",
    "offerings",
    "services",
    "facilities",
    "gallery",
    "community",
    "reviews",
    "settings",
    "analytics",
    "activity-logs",
    "profile",
  ],
  CLINIC_OWNER: [
    "dashboard",
  "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "appointments-settings",
    "clinic-profile",
    "locations",
    "working-hours",
    "patients",
    "doctors",
    "offerings",
    "services",
    "facilities",
    "gallery",
    "community",
    "reviews",
    "settings",
    "analytics",
    "activity-logs",
    "profile",
  ],
  CLINIC_STAFF: [
    "dashboard",
  "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "clinic-profile",
    "patients",
    "doctors",
    "offerings",
    "services",
    "facilities",
    "reviews",
    "analytics",
    "activity-logs",
    "profile",
  ],
  MANAGER: [
    "dashboard",
    "onboarding",
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
  "subscription",
    "settings",
    "analytics",
    "activity-logs",
    "doctors",
    "facilities",
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
    "gallery",
    "community",
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
    "onboarding",
    "finance",
    "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "appointments-settings",
    "patients",
    "staff",
    "gallery",
    "community",
    "billing",
    "pricing",
  "subscription",
    "settings",
    "settings-alert-rules",
    "settings-audit-logs",
    "settings-storage",
    "settings-data-export",
    "analytics",
    "activity-logs",
    "doctors",
    "facilities",
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
    "onboarding",
    "finance",
    "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "appointments-settings",
    "patients",
    "staff",
    "gallery",
    "community",
    "billing",
    "pricing",
  "subscription",
    "settings",
    "settings-alert-rules",
    "settings-audit-logs",
    "settings-storage",
    "settings-data-export",
    "analytics",
    "activity-logs",
    "doctors",
    "facilities",
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
  "subscription",
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
    "gallery",
    "community",
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
    "onboarding",
    "finance",
    "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "appointments-settings",
    "patients",
    "staff",
    "gallery",
    "community",
    "billing",
    "pricing",
  "subscription",
    "settings",
    "settings-alert-rules",
    "settings-audit-logs",
    "settings-storage",
    "settings-data-export",
    "analytics",
    "activity-logs",
    "doctors",
    "facilities",
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
    "onboarding",
    "finance",
    "appointments",
    "appointments-dashboard",
    "appointments-review",
    "appointments-patients",
    "appointments-settings",
    "patients",
    "staff",
    "gallery",
    "community",
    "billing",
    "pricing",
  "subscription",
    "settings",
    "settings-alert-rules",
    "settings-audit-logs",
    "settings-storage",
    "settings-data-export",
    "analytics",
    "activity-logs",
    "doctors",
    "facilities",
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
    case "clinic-profile":
    case "clinic":
      return "clinic-profile";
    case "working-hours":
    case "hours":
      return "working-hours";
    case "offerings":
    case "offering":
    case "services-facilities":
    case "services-and-facilities":
      return "offerings";
    case "services":
    case "service":
      return "services";
    case "facilities":
    case "facility":
      return "facilities";
    case "gallery":
    case "photos":
      return "gallery";
    case "reviews":
    case "review":
      return "reviews";
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
    case "subscription":
      return "subscription";
    default:
      return isDashboardPage(value) ? value : "dashboard";
  }
}

export function getAllowedDashboardPages(
  role?: string | null,
  permissions?: readonly string[] | null
): DashboardPage[] {
  const fallbackRole: OrganizationMemberRole = "OWNER";
  const pages =
    allowedDashboardPagesByRole[
      (role as OrganizationMemberRole | undefined) ?? fallbackRole
    ] ?? allowedDashboardPagesByRole[fallbackRole];

  return filterSubscriptionPage(pages, permissions);
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
  role?: string | null,
  permissions?: readonly string[] | null
) {
  const allowedPages = getAllowedDashboardPages(role, permissions);

  return allowedPages.includes(requestedPage)
    ? requestedPage
    : getDefaultDashboardPage(role);
}

function filterSubscriptionPage(
  pages: readonly DashboardPage[],
  permissions?: readonly string[] | null
): DashboardPage[] {
  if (canAccessSubscriptionPage(permissions)) {
    return [...pages];
  }

  return pages.filter((page) => page !== "subscription");
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
