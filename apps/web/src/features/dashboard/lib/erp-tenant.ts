import type { DashboardOrganizationType, DashboardPage } from "./routing";
import { buildDashboardPath, buildTenantDashboardPath } from "./routing";

export type ErpProviderType = "clinic" | "hospital";

export type ProviderCapabilities = {
  appointments: {
    enabled: boolean;
    supportsBeds: boolean;
    supportsDepartments: boolean;
    supportsDoctorAssignment: boolean;
    supportsMultipleLocations: boolean;
    supportsWalkIns: boolean;
  };
  facilities: {
    enabled: boolean;
    supportsBeds: boolean;
    supportsEmergencyInfrastructure: boolean;
    supportsMultipleLocations: boolean;
    supportsOperatingTheatres: boolean;
    supportsWards: boolean;
  };
  services: {
    enabled: boolean;
    supportsConsultationModes: boolean;
    supportsDepartmentAssignment: boolean;
    supportsMultipleLocations: boolean;
    supportsOfferings: boolean;
    supportsPractitionerAssignment: boolean;
  };
};

export type ProviderTerminology = {
  departmentLabel: string;
  locationLabel: string;
  organizationLabel: string;
  practitionerLabel: string;
};

export type ErpTenantContext = {
  buildRoute: (page?: DashboardPage) => string;
  capabilities: ProviderCapabilities;
  organizationId: string;
  organizationSlug?: string | null;
  permissions: string[];
  providerType: ErpProviderType;
  role?: string | null;
  terminology: ProviderTerminology;
};

const providerCapabilities: Record<ErpProviderType, ProviderCapabilities> = {
  clinic: {
    appointments: {
      enabled: true,
      supportsBeds: false,
      supportsDepartments: false,
      supportsDoctorAssignment: true,
      supportsMultipleLocations: true,
      supportsWalkIns: true,
    },
    facilities: {
      enabled: true,
      supportsBeds: false,
      supportsEmergencyInfrastructure: false,
      supportsMultipleLocations: true,
      supportsOperatingTheatres: false,
      supportsWards: false,
    },
    services: {
      enabled: true,
      supportsConsultationModes: true,
      supportsDepartmentAssignment: false,
      supportsMultipleLocations: true,
      supportsOfferings: true,
      supportsPractitionerAssignment: true,
    },
  },
  hospital: {
    appointments: {
      enabled: true,
      supportsBeds: true,
      supportsDepartments: true,
      supportsDoctorAssignment: true,
      supportsMultipleLocations: true,
      supportsWalkIns: true,
    },
    facilities: {
      enabled: true,
      supportsBeds: true,
      supportsEmergencyInfrastructure: true,
      supportsMultipleLocations: true,
      supportsOperatingTheatres: true,
      supportsWards: true,
    },
    services: {
      enabled: true,
      supportsConsultationModes: true,
      supportsDepartmentAssignment: true,
      supportsMultipleLocations: true,
      supportsOfferings: true,
      supportsPractitionerAssignment: true,
    },
  },
};

const providerTerminology: Record<ErpProviderType, ProviderTerminology> = {
  clinic: {
    departmentLabel: "Specialty",
    locationLabel: "Clinic location",
    organizationLabel: "Clinic",
    practitionerLabel: "Doctor",
  },
  hospital: {
    departmentLabel: "Department",
    locationLabel: "Hospital location",
    organizationLabel: "Hospital",
    practitionerLabel: "Consultant",
  },
};

export function isReusableErpProvider(
  value?: string | null
): value is ErpProviderType {
  return value === "clinic" || value === "hospital";
}

export function getProviderCapabilities(providerType: ErpProviderType) {
  return providerCapabilities[providerType];
}

export function getProviderTerminology(providerType: ErpProviderType) {
  return providerTerminology[providerType];
}

export function buildErpRoute({
  organizationSlug,
  page = "dashboard",
  providerType,
}: {
  organizationSlug?: string | null;
  page?: DashboardPage;
  providerType: ErpProviderType;
}) {
  return organizationSlug
    ? buildTenantDashboardPath(providerType, organizationSlug, page)
    : buildDashboardPath(providerType, page);
}

export function createErpTenantContext({
  organizationId,
  organizationSlug,
  permissions = [],
  providerType,
  role,
}: {
  organizationId: string;
  organizationSlug?: string | null;
  permissions?: string[];
  providerType: DashboardOrganizationType;
  role?: string | null;
}): ErpTenantContext | null {
  if (!isReusableErpProvider(providerType)) {
    return null;
  }

  return {
    buildRoute: (page) =>
      buildErpRoute({ organizationSlug, page, providerType }),
    capabilities: getProviderCapabilities(providerType),
    organizationId,
    organizationSlug,
    permissions,
    providerType,
    role,
    terminology: getProviderTerminology(providerType),
  };
}