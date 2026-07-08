import { legacyDepartmentNames, publicOptions } from "./constants";
import type { Branch, Department, OnboardingState, ProfileDefaults, StepId } from "./types";

const defaultDepartmentHours = {
  closeTime: "18:00",
  openTime: "09:00",
};

export function validateStep(stepId: StepId, data: OnboardingState) {
  switch (stepId) {
    case "profile":
      if (!data.profile.hospitalName.trim()) return "Add the hospital name.";
      if (!data.profile.email.trim()) return "Add the hospital email.";
      if (!data.profile.phone.trim()) return "Add the hospital phone number.";
      return "";
    case "locations":
      if (
        data.branches.some(
          (branch) =>
            !branch.name.trim() || !branch.address.trim() || !branch.city.trim()
        )
      ) {
        return "Each branch needs a name, address, and city.";
      }
      return "";
    case "departments":
      if (
        data.departments.filter(
          (department) => !data.disabledDepartments.includes(department.name)
        ).length === 0
      ) {
        return "Enable at least one department.";
      }
      if (
        data.departments.some(
          (department) =>
            !department.openTime.trim() || !department.closeTime.trim()
        )
      ) {
        return "Each department needs opening and closing hours.";
      }
      return "";
    default:
      return "";
  }
}

export function getDefaultOnboardingState(defaults?: ProfileDefaults): OnboardingState {
  return {
    branches: [getEmptyBranch(true)],
    departments: [],
    disabledDepartments: [],
    profile: {
      coverName: "",
      coverPreviewUrl: "",
      coverUrl: "",
      description: "",
      email: defaults?.email?.trim() ?? "",
      establishedYear: "",
      gstNumber: "",
      hospitalName: defaults?.hospitalName?.trim() ?? "",
      hospitalOwnershipType: "Private",
      hospitalType: "Hospital",
      logoName: "",
      numberOfBeds: "",
      logoPreviewUrl: "",
      logoUrl: "",
      phone: "",
      registrationNumber: "",
      website: "",
    },
    publicProfile: Object.fromEntries(
      publicOptions.map(([key]) => [key, true])
    ) as Record<string, boolean>,
  };
}

export function getPersistableOnboardingState(state: OnboardingState): OnboardingState {
  return {
    ...state,
    profile: {
      ...state.profile,
      coverPreviewUrl: "",
      logoPreviewUrl: "",
    },
  };
}

export function isQuotaExceededError(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}

export function normalizeDepartments(value: unknown): Department[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") {
        return {
          description: "",
          name: item.trim(),
          ...defaultDepartmentHours,
        };
      }

      if (item && typeof item === "object" && "name" in item) {
        const department = item as Partial<Department>;
        return {
          closeTime: department.closeTime?.trim() ?? defaultDepartmentHours.closeTime,
          description: department.description?.trim() ?? "",
          name: department.name?.trim() ?? "",
          openTime: department.openTime?.trim() ?? defaultDepartmentHours.openTime,
        };
      }

      return null;
    })
    .filter((department): department is Department => Boolean(department?.name))
    .filter(
      (department) =>
        !legacyDepartmentNames.some(
          (legacyDepartment) => legacyDepartment.toLowerCase() === department.name.toLowerCase()
        )
    );
}

export function mergeOnboardingState(state: OnboardingState, defaults?: ProfileDefaults) {
  const fallback = getDefaultOnboardingState(defaults);
  const persistedProfile = getPersistableOnboardingState(state).profile;
  const departments = normalizeDepartments(state.departments);
  return {
    ...fallback,
    ...state,
    departments,
    disabledDepartments: Array.isArray(state.disabledDepartments)
      ? state.disabledDepartments.filter((department) =>
          departments.some((item) => item.name === department)
        )
      : [],
    profile: {
      ...fallback.profile,
      ...persistedProfile,
      email: persistedProfile.email?.trim() ? persistedProfile.email : fallback.profile.email,
      hospitalName: persistedProfile.hospitalName?.trim()
        ? persistedProfile.hospitalName
        : fallback.profile.hospitalName,
    },
    publicProfile: { ...fallback.publicProfile, ...state.publicProfile },
  };
}

export function getEmptyBranch(main: boolean): Branch {
  return {
    address: "",
    city: "",
    country: "India",
    id: crypto.randomUUID(),
    latitude: "",
    longitude: "",
    mapsLocation: "",
    name: main ? "Main Branch" : "",
    postalCode: "",
    state: "",
  };
}