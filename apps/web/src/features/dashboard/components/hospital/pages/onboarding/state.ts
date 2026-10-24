import { getOnboardingSteps, publicOptions, weekDays } from "./constants";
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

function hasValidCoordinates(branch?: Branch) {
  if (!branch?.latitude.trim() || !branch.longitude.trim()) return false;
  const latitude = Number(branch.latitude);
  const longitude = Number(branch.longitude);
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  );
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const indianPinCodePattern = /^[1-9][0-9]{5}$/;

// Shared phone rule (hospital/clinic profile + contact steps, diagnostic
// onboarding, and doctor onboarding all import these so the client-side rule
// cannot drift from the backend contract): the value may only contain an
// optional leading "+", digits, spaces and "()-", must be 7–20 characters
// long, and must contain at least 7 and at most 15 digits.
const phoneCharacterPattern = /^[+]?[0-9 ()-]{7,20}$/;

export function isValidEmail(value: string) {
  return emailPattern.test(value.trim());
}

export function isValidPhone(value: string) {
  const trimmed = value.trim();
  if (!phoneCharacterPattern.test(trimmed)) return false;
  const digitCount = trimmed.replace(/[^0-9]/g, "").length;
  return digitCount >= 7 && digitCount <= 15;
}

// HTML pattern attributes can only express the character-shape half of the
// rule; the digit-count half is enforced by isValidPhone on submit. Both
// exports are shared by every onboarding flow that renders a phone field.
export const webPhoneHtmlPattern = "[+]?[0-9 ()-]{7,20}";
export const webPhoneInputTitle =
  "Enter a valid phone number (7-20 characters, at least 7 digits)";
// Sentence fragment shared by the custom validation messages.
export const webPhoneRequirement = "(7-20 characters, at least 7 digits)";

export function isValidPostalCode(value: string) {
  return indianPinCodePattern.test(value.trim());
}

export function isValidEstablishedYear(value: string) {
  const year = Number(value.trim());
  return (
    Number.isInteger(year) &&
    year >= 1800 &&
    year <= new Date().getFullYear()
  );
}

export function isValidBedCount(value: string) {
  const bedCount = Number(value.trim());
  return Number.isInteger(bedCount) && bedCount >= 0;
}

export function validateStep(
  stepId: StepId,
  data: OnboardingState,
  kind: OnboardingKind = "hospital"
): string {
  switch (stepId) {
    case "profile":
      if (!data.profile.hospitalName.trim()) {
        return kind === "clinic"
          ? "Add the clinic name."
          : "Add the hospital name.";
      }
      if (kind === "clinic" && !data.profile.legalBusinessName.trim()) {
        return "Add the legal business name.";
      }
      if (kind === "clinic" && !data.profile.hospitalType.trim()) {
        return "Select the clinic type.";
      }
      if (kind === "clinic" && !data.profile.logoUrl) {
        return "Upload the clinic logo.";
      }
      if (!data.profile.registrationNumber.trim()) {
        return "Add the registration number.";
      }
      if (kind === "clinic" && !data.profile.establishedYear.trim()) {
        return "Add the year established.";
      }
      if (
        kind === "clinic" &&
        !isValidEstablishedYear(data.profile.establishedYear)
      ) {
        return "Enter a valid year established (a whole year between 1800 and the current year).";
      }
      if (
        kind === "hospital" &&
        data.profile.establishedYear.trim() &&
        !isValidEstablishedYear(data.profile.establishedYear)
      ) {
        return "Enter a valid year established (a whole year between 1800 and the current year).";
      }
      if (kind === "clinic" && !data.profile.hospitalOwnershipType.trim()) {
        return "Select the ownership type.";
      }
      if (
        data.profile.numberOfBeds.trim() &&
        !isValidBedCount(data.profile.numberOfBeds)
      ) {
        return "Bed count must be a non-negative whole number.";
      }
      if (kind === "hospital" && !data.profile.email.trim())
        return "Add the hospital email.";
      if (kind === "hospital" && !isValidEmail(data.profile.email))
        return "Enter a valid hospital email address.";
      if (kind === "hospital" && !data.profile.phone.trim())
        return "Add the hospital phone number.";
      if (kind === "hospital" && !isValidPhone(data.profile.phone))
        return `Enter a valid hospital phone number ${webPhoneRequirement}.`;
      return "";
    case "contact":
      if (!data.profile.phone.trim()) return "Add the primary mobile number.";
      if (!isValidPhone(data.profile.phone))
        return `Enter a valid primary mobile number ${webPhoneRequirement}.`;
      if (!data.profile.email.trim()) return "Add the clinic email.";
      if (!isValidEmail(data.profile.email))
        return "Enter a valid clinic email address.";
      return "";
    case "locations":
      if (
        data.branches.some(
          (branch) =>
            !branch.address.trim() ||
            !branch.city.trim() ||
            !branch.state.trim() ||
            !branch.postalCode.trim()
        )
      ) {
        return kind === "clinic"
          ? "Add address, city, state, and pincode."
          : "Each branch needs a name, address, and city.";
      }
      if (
        data.branches.some((branch) => !isValidPostalCode(branch.postalCode))
      ) {
        return "Enter a valid 6-digit Indian PIN code for each branch.";
      }
      if (
        data.publicProfile.showHospitalProfile &&
        !hasValidCoordinates(data.branches[0])
      ) {
        return "Add valid coordinates for the primary branch so nearby patients can find it.";
      }
      return "";
    case "review":
      for (const step of getOnboardingSteps(kind)) {
        if (step.id === "review") continue;
        const error = validateStep(step.id, data, kind);
        if (error) return error;
      }
      return "";
    case "clinicProfile":
      if (!data.profile.description.trim())
        return "Add the About Clinic details.";
      if (!data.profile.languagesSpoken.trim()) return "Add languages spoken.";
      return "";
    case "workingHours":
      if (!data.workingHours.some((h) => h.isOpen))
        return "Select at least one open day.";
      if (
        data.workingHours.some(
          (h) => h.isOpen && !validTimeRange(h.openingTime, h.closingTime)
        )
      )
        return "Closing time must be after opening time on each open day.";
      if (
        data.workingHours.some(
          (hours) =>
            hours.isOpen &&
            (!hours.openingTime.trim() || !hours.closingTime.trim())
        )
      ) {
        return "Each open day needs opening and closing time.";
      }
      for (const hours of data.workingHours.filter(
        (h) => h.isOpen && h.lunchBreak
      )) {
        const [start, end] = hours.lunchBreak.split(" - ");
        if (
          !start ||
          !end ||
          !validTimeRange(start, end) ||
          start < hours.openingTime ||
          end > hours.closingTime
        )
          return "Set both break times within opening hours, or remove the break.";
      }
      return "";
    case "departments":
      if (
        (kind === "clinic"
          ? data.departments
          : data.departments.filter(
              (department) =>
                !data.disabledDepartments.includes(department.name)
            )
        ).length === 0
      ) {
        return kind === "clinic"
          ? "Add at least one specialty."
          : "Enable at least one department.";
      }
      if (
        data.departments.some(
          (department) =>
            !department.name.trim() ||
            !department.openTime.trim() ||
            !department.closeTime.trim() ||
            !validTimeRange(department.openTime, department.closeTime)
        )
      ) {
        return "Each department needs a name, opening time, and closing time.";
      }
      return "";
    case "doctors":
      if (kind === "clinic" && data.doctors.length === 0) {
        return "Add at least one doctor to start your clinic.";
      }
      if (
        data.doctors.some(
          (doctor) =>
            !doctor.name.trim() ||
            !doctor.registrationNumber.trim() ||
            !doctor.department.trim() ||
            !doctor.consultationFee.trim() ||
            !doctor.experience.trim() ||
            !doctor.availableFrom ||
            !doctor.availableTo ||
            !doctor.availabilityDays.length
        )
      ) {
        return "Each doctor needs a name, registration number, department, fee, experience, and availability.";
      }
      for (const doctor of data.doctors) {
        if (
          !data.departments.some(
            (d) =>
              d.name === doctor.department &&
              !data.disabledDepartments.includes(d.name)
          )
        )
          return "Assign each doctor to a selected department.";
        if (
          !Number.isFinite(Number(doctor.consultationFee)) ||
          Number(doctor.consultationFee) < 0
        )
          return "Consultation fee must be a non-negative number.";
        if (
          !Number.isInteger(Number(doctor.experience)) ||
          Number(doctor.experience) < 0 ||
          Number(doctor.experience) > 80
        )
          return "Experience must be a whole number from 0 to 80 years.";
        if (!validTimeRange(doctor.availableFrom, doctor.availableTo))
          return "Doctor availability must end after its start time.";
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
    departments: [],
    disabledDepartments: [],
    doctors: [],
    profile: {
      alternateMobile: "",
      certificateName: "",
      certificateUrl: "",
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

export function getPersistableOnboardingState(
  state: OnboardingState
): OnboardingState {
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
    (error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}

export function normalizeDepartments(
  value: unknown,
  _kind: OnboardingKind = "hospital"
): Department[] {
  if (!Array.isArray(value)) return [];

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
          published: department.published,
          closeTime:
            department.closeTime?.trim() ?? defaultDepartmentHours.closeTime,
          description: department.description?.trim() ?? "",
          head: department.head?.trim() ?? "",
          name: department.name?.trim() ?? "",
          openTime:
            department.openTime?.trim() ?? defaultDepartmentHours.openTime,
        };
      }

      return null;
    })
    .filter((department): department is Department =>
      Boolean(department?.name)
    );

  return departments;
}

export function mergeOnboardingState(
  state: Partial<OnboardingState>,
  defaults?: ProfileDefaults,
  kind: OnboardingKind = "hospital"
) {
  const fallback = getDefaultOnboardingState(defaults, kind);
  const persistedProfile = getPersistableOnboardingState({
    ...fallback,
    ...state,
    profile: { ...fallback.profile, ...state.profile },
  }).profile;
  const departments = normalizeDepartments(state.departments, kind);
  return {
    ...fallback,
    ...state,
    branches: normalizeBranches(state.branches, kind),
    departments,
    disabledDepartments:
      kind === "clinic"
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
      email: persistedProfile.email?.trim()
        ? persistedProfile.email
        : fallback.profile.email,
      hospitalName: persistedProfile.hospitalName?.trim()
        ? persistedProfile.hospitalName
        : fallback.profile.hospitalName,
    },
    publicProfile: { ...fallback.publicProfile, ...state.publicProfile },
    services: normalizeServices(state.services),
    workingHours: normalizeWorkingHours(state.workingHours),
  };
}

export function getEmptyBranch(
  main: boolean,
  kind: OnboardingKind = "hospital"
): Branch {
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
  if (!Array.isArray(value) || value.length === 0)
    return [getEmptyBranch(true, kind)];

  return value.map((item, index) => {
    const branch =
      item && typeof item === "object" ? (item as Partial<Branch>) : {};
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
    .map((item): OnboardingDoctor | null => {
      const doctor =
        item && typeof item === "object"
          ? (item as Partial<OnboardingDoctor>)
          : null;
      if (!doctor) return null;
      return {
        imageUrl: doctor.imageUrl ?? "",
        gender: doctor.gender ?? "unspecified",
        availability: doctor.availability?.trim() ?? "",
        registrationNumber: doctor.registrationNumber?.trim() ?? "",
        availabilityDays:
          doctor.availabilityDays?.filter((day) => weekDays.includes(day)) ??
          [],
        availableFrom: doctor.availableFrom ?? "",
        availableTo: doctor.availableTo ?? "",
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
      const service =
        item && typeof item === "object"
          ? (item as Partial<OnboardingService>)
          : null;
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

export function validTimeRange(start: string, end: string) {
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  return time.test(start) && time.test(end) && end > start;
}
