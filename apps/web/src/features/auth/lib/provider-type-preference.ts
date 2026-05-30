import {
  isDashboardOrganizationType,
  type DashboardOrganizationType,
} from "@/features/dashboard/lib/routing";

export const providerTypePreferenceKey = "viruj_preferred_provider_type";

export function readPreferredProviderType(): DashboardOrganizationType {
  if (typeof window === "undefined") {
    return "hospital";
  }

  const stored = window.localStorage.getItem(providerTypePreferenceKey);
  return stored && isDashboardOrganizationType(stored) ? stored : "hospital";
}

export function writePreferredProviderType(type: DashboardOrganizationType) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(providerTypePreferenceKey, type);
}
