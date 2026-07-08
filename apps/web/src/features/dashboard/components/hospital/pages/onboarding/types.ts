export type StepId =
  | "profile"
  | "locations"
  | "departments"
  | "public"
  | "review";

export type Branch = {
  id: string;
  name: string;
  address: string;
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
};

export type ProfileDefaults = {
  email?: string;
  hospitalName?: string;
};

export type OnboardingState = {
  profile: {
    hospitalName: string;
    logoName: string;
    logoPreviewUrl: string;
    logoUrl: string;
    coverName: string;
    coverPreviewUrl: string;
    coverUrl: string;
    hospitalType: string;
    hospitalOwnershipType: string;
    numberOfBeds: string;
    registrationNumber: string;
    gstNumber: string;
    email: string;
    phone: string;
    website: string;
    description: string;
    establishedYear: string;
  };
  branches: Branch[];
  departments: Department[];
  disabledDepartments: string[];
  publicProfile: Record<string, boolean>;
};

type StepDefinition = {
  id: StepId;
  label: string;
  kicker: string;
};

export type { StepDefinition };