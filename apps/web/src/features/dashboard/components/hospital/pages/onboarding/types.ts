export type StepId =
  | "profile"
  | "contact"
  | "locations"
  | "clinicProfile"
  | "workingHours"
  | "departments"
  | "doctors"
  | "services"
  | "public"
  | "review";

export type OnboardingKind = "hospital" | "clinic";

export type Branch = {
  id: string;
  name: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  mapsLocation: string;
  latitude: string;
  longitude: string;
};

export type Department = {
  name: string;
  description: string;
  openTime: string;
  closeTime: string;
  head: string;
};

export type WorkingHour = {
  id: string;
  day: string;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
  lunchBreak: string;
  emergencyHours: string;
};

export type OnboardingDoctor = {
  id: string;
  name: string;
  inviteEmail: string;
  department: string;
  consultationFee: string;
  experience: string;
  availability: string;
};

export type OnboardingService = {
  id: string;
  name: string;
  category: string;
  price: string;
  duration: string;
  description: string;
  availableOnline: boolean;
};

export type ProfileDefaults = {
  email?: string;
  hospitalName?: string;
};

export type OnboardingState = {
  profile: {
    hospitalName: string;
    legalBusinessName: string;
    logoName: string;
    logoPreviewUrl: string;
    logoUrl: string;
    coverName: string;
    coverPreviewUrl: string;
    coverUrl: string;
    clinicPhotosNames: string[];
    clinicPhotosPreviewUrls: string[];
    hospitalType: string;
    hospitalOwnershipType: string;
    numberOfBeds: string;
    registrationNumber: string;
    gstNumber: string;
    panNumber: string;
    email: string;
    phone: string;
    alternateMobile: string;
    emergencyContact: string;
    whatsappNumber: string;
    website: string;
    description: string;
    mission: string;
    vision: string;
    languagesSpoken: string;
    establishedYear: string;
  };
  branches: Branch[];
  departments: Department[];
  disabledDepartments: string[];
  doctors: OnboardingDoctor[];
  publicProfile: Record<string, boolean>;
  services: OnboardingService[];
  workingHours: WorkingHour[];
};

type StepDefinition = {
  id: StepId;
  label: string;
  kicker: string;
};

export type { StepDefinition };
