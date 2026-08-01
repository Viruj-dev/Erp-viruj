import {
  clinicDepartmentNames,
  legacyDepartmentNames,
  publicOptions,
  weekDays,
} from "./constants";
import type {
  Branch,
  Department,
  OnboardingDoctor,
  OnboardingKind,
  OnboardingService,
  OnboardingState,
  ProfileDefaults,
  StepId,
  WorkingHour,
} from "./types";

const defaultDepartmentHours = {
  closeTime: "18:00",
  openTime: "09:00",
};

export function validateStep(
  stepId: StepId,
  data: OnboardingState,
  kind: OnboardingKind = "hospital"
) {
  switch (stepId) {
    case "profile":
      if (!data.profile.hospitalName.trim()) {
        return kind === "clinic" ? "Add the clinic name." : "Add the hospital name.";
      }
      if (kind === "clinic" && !data.profile.legalBusinessName.trim()) {
        return "Add the legal business name.";
      }
      if (kind === "clinic" && !data.profile.hospitalType.trim()) {
        return "Select the clinic type.";
      }
      if (kind === "clinic" && !(data.profile.logoName || data.profile.logoUrl)) {
        return "Upload the clinic logo.";
      }
      if (kind === "clinic" && !data.profile.registrationNumber.trim()) {
        return "Add the registration number.";
      }
      if (kind === "clinic" && !data.profile.establishedYear.trim()) {
        return "Add the year established.";
      }
      if (kind === "clinic" && !data.profile.hospitalOwnershipType.trim()) {
        return "Select the ownership type.";
      }
      if (kind === "hospital" && !data.profile.email.trim()) return "Add the hospital email.";
      if (kind === "hospital" && !data.profile.phone.trim()) return "Add the hospital phone number.";
      return "";
    case "contact":
      if (!data.profile.phone.trim()) return "Add the primary mobile number.";
      if (!data.profile.email.trim()) return "Add the clinic email.";
      return "";
    case "locations":
      if (
        data.branches.some(
          (branch) =>
            !branch.address.trim() || !branch.city.trim() || !branch.state.trim() || !branch.postalCode.trim()
        )
      ) {
        return kind === "clinic"
          ? "Add address, city, state, and pincode."
          : "Each branch needs a name, address, and city.";
      }
      return "";
    case "clinicProfile":
      if (!data.profile.description.trim()) return "Add the About Clinic details.";
      if (!data.profile.languagesSpoken.trim()) return "Add languages spoken.";
      return "";
    case "workingHours":
      if (
        data.workingHours.some(
          (hours) => hours.isOpen && (!hours.openingTime.trim() || !hours.closingTime.trim())
        )
      ) {
        return "Each open day needs opening and closing time.";
      }
      return "";
    case "departments":
      if (
        (kind === "clinic" ? data.departments : data.departments.filter((department) => !data.disabledDepartments.includes(department.name))).length === 0
      ) {
        return kind === "clinic" ? "Add at least one specialty." : "Enable at least one department.";
      }
      if (
        data.departments.some(
          (department) =>
            !department.name.trim() || !department.openTime.trim() || !department.closeTime.trim()
        )
      ) {
        return "Each department needs a name, opening time, and closing time.";
      }
      return "";
    case "doctors":
      if (kind === "clinic" && data.doctors.length === 0) {
        return "Add at least one doctor or invite a doctor.";
      }
      if (
        data.doctors.some(
          (doctor) =>
            !doctor.name.trim() ||
            !doctor.department.trim() ||
            !doctor.consultationFee.trim() ||
            !doctor.experience.trim() ||
            !doctor.availability.trim()
        )
      ) {
        return "Each doctor needs name, department, fee, experience, and availability.";
      }
      return "";
    case "services":
      if (kind === "clinic" && data.services.length === 0) {
        return "Add at least one clinic service.";
      }
      if (
        data.services.some(
          (service) =>
            !service.name.trim() ||
            !service.category.trim() ||
            !service.price.trim() ||
            !service.duration.trim()
        )
      ) {
        return "Each service needs name, category, price, and duration.";
      }
      return "";
    default:
      return "";
  }
}

export function getDefaultOnboardingState(
  defaults?: ProfileDefaults,
  kind: OnboardingKind = "hospital"
): OnboardingState {
  return {
    branches: [getEmptyBranch(true, kind)],
    departments: kind === "clinic" ? defaultClinicDepartments() : [],
    disabledDepartments: [],
    doctors: [],
    profile: {
      alternateMobile: "",
      clinicPhotosNames: [],
      clinicPhotosPreviewUrls: [],
      coverName: "",
      coverPreviewUrl: "",
      coverUrl: "",
      description: "",
      email: defaults?.email?.trim() ?? "",
      emergencyContact: "",
      establishedYear: "",
      gstNumber: "",
      hospitalName: defaults?.hospitalName?.trim() ?? "",
      hospitalOwnershipType: kind === "clinic" ? "Individual" : "Private",
      hospitalType: kind === "clinic" ? "General Clinic" : "Hospital",
      languagesSpoken: "",
      legalBusinessName: "",
      logoName: "",
      logoPreviewUrl: "",
      logoUrl: "",
      mission: "",
      numberOfBeds: "",
      panNumber: "",
      phone: "",
      registrationNumber: "",
      vision: "",
      website: "",
      whatsappNumber: "",
    },
    publicProfile: Object.fromEntries(
      publicOptions.map(([key]) => [key, true])
    ) as Record<string, boolean>,
    services: [],
    workingHours: getDefaultWorkingHours(),
  };
}

export function getPersistableOnboardingState(state: OnboardingState): OnboardingState {
  return {
    ...state,
    profile: {
      ...state.profile,
      clinicPhotosPreviewUrls: [],
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

export function normalizeDepartments(
  value: unknown,
  kind: OnboardingKind = "hospital"
): Department[] {
  if (!Array.isArray(value)) return kind === "clinic" ? defaultClinicDepartments() : [];

  const departments = value
    .map((item) => {
      if (typeof item === "string") {
        return {
          description: "",
          head: "",
          name: item.trim(),
          ...defaultDepartmentHours,
        };
      }

      if (item && typeof item === "object" && "name" in item) {
        const department = item as Partial<Department>;
        return {
          closeTime: department.closeTime?.trim() ?? defaultDepartmentHours.closeTime,
          description: department.description?.trim() ?? "",
          head: department.head?.trim() ?? "",
          name: department.name?.trim() ?? "",
          openTime: department.openTime?.trim() ?? defaultDepartmentHours.openTime,
        };
      }

      return null;
    })
    .filter((department): department is Department => Boolean(department?.name));

  if (kind === "hospital") {
    return departments.filter(
      (department) =>
        !legacyDepartmentNames.some(
          (legacyDepartment) => legacyDepartment.toLowerCase() === department.name.toLowerCase()
        )
    );
  }

  return departments.length ? departments : defaultClinicDepartments();
}

export function mergeOnboardingState(
  state: Partial<OnboardingState>,
  defaults?: ProfileDefaults,
  kind: OnboardingKind = "hospital"
) {
  const fallback = getDefaultOnboardingState(defaults, kind);
  const persistedProfile = getPersistableOnboardingState({ ...fallback, ...state, profile: { ...fallback.profile, ...state.profile } }).profile;
  const departments = normalizeDepartments(state.departments, kind);
  return {
    ...fallback,
    ...state,
    branches: normalizeBranches(state.branches, kind),
    departments,
    disabledDepartments: kind === "clinic"
      ? []
      : Array.isArray(state.disabledDepartments)
        ? state.disabledDepartments.filter((department) =>
            departments.some((item) => item.name === department)
          )
        : [],
    doctors: normalizeDoctors(state.doctors),
    profile: {
      ...fallback.profile,
      ...persistedProfile,
      email: persistedProfile.email?.trim() ? persistedProfile.email : fallback.profile.email,
      hospitalName: persistedProfile.hospitalName?.trim()
        ? persistedProfile.hospitalName
        : fallback.profile.hospitalName,
    },
    publicProfile: { ...fallback.publicProfile, ...state.publicProfile },
    services: normalizeServices(state.services),
    workingHours: normalizeWorkingHours(state.workingHours),
  };
}

export function getEmptyBranch(main: boolean, kind: OnboardingKind = "hospital"): Branch {
  return {
    address: "",
    city: "",
    country: "India",
    id: crypto.randomUUID(),
    landmark: "",
    latitude: "",
    longitude: "",
    mapsLocation: "",
    name: main ? (kind === "clinic" ? "Main Clinic" : "Main Branch") : "",
    postalCode: "",
    state: "",
  };
}

function defaultClinicDepartments(): Department[] {
  return clinicDepartmentNames.map((name) => ({
    closeTime: defaultDepartmentHours.closeTime,
    description: "",
    head: "",
    name,
    openTime: defaultDepartmentHours.openTime,
  }));
}

function getDefaultWorkingHours(): WorkingHour[] {
  return weekDays.map((day) => ({
    closingTime: day === "Sunday" ? "" : "18:00",
    day,
    emergencyHours: "",
    id: day.toLowerCase(),
    isOpen: day !== "Sunday",
    lunchBreak: day === "Sunday" ? "" : "13:00 - 14:00",
    openingTime: day === "Sunday" ? "" : "09:00",
  }));
}

function normalizeBranches(value: unknown, kind: OnboardingKind): Branch[] {
  if (!Array.isArray(value) || value.length === 0) return [getEmptyBranch(true, kind)];

  return value.map((item, index) => {
    const branch = item && typeof item === "object" ? (item as Partial<Branch>) : {};
    return {
      ...getEmptyBranch(index === 0, kind),
      ...branch,
      id: branch.id || crypto.randomUUID(),
      landmark: branch.landmark ?? "",
    };
  });
}

function normalizeWorkingHours(value: unknown): WorkingHour[] {
  const fallback = getDefaultWorkingHours();
  if (!Array.isArray(value)) return fallback;

  return fallback.map((defaultHours) => {
    const stored = value.find(
      (item): item is Partial<WorkingHour> =>
        Boolean(item) &&
        typeof item === "object" &&
        "day" in item &&
        item.day === defaultHours.day
    );

    return { ...defaultHours, ...stored, id: stored?.id || defaultHours.id };
  });
}

function normalizeDoctors(value: unknown): OnboardingDoctor[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const doctor = item && typeof item === "object" ? (item as Partial<OnboardingDoctor>) : null;
      if (!doctor) return null;
      return {
        availability: doctor.availability?.trim() ?? "",
        consultationFee: doctor.consultationFee?.trim() ?? "",
        department: doctor.department?.trim() ?? "",
        experience: doctor.experience?.trim() ?? "",
        id: doctor.id || crypto.randomUUID(),
        inviteEmail: doctor.inviteEmail?.trim() ?? "",
        name: doctor.name?.trim() ?? "",
      };
    })
    .filter((doctor): doctor is OnboardingDoctor => Boolean(doctor));
}

function normalizeServices(value: unknown): OnboardingService[] {
  if (!Array.isArray(value)) return [];

  const services = value
    .map((item) => {
      const service = item && typeof item === "object" ? (item as Partial<OnboardingService>) : null;
      if (!service) return null;
      return {
        availableOnline: Boolean(service.availableOnline),
        category: service.category?.trim() ?? "",
        description: service.description?.trim() ?? "",
        duration: service.duration?.trim() ?? "",
        id: service.id || crypto.randomUUID(),
        name: service.name?.trim() ?? "",
        price: service.price?.trim() ?? "",
      };
    })
    .filter((service): service is OnboardingService => Boolean(service?.name));

  return services;
}
