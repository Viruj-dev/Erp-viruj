import type { StepDefinition, StepId } from "./types";

export const steps: StepDefinition[] = [
  { id: "profile", label: "Organization Profile", kicker: "Identity" },
  { id: "locations", label: "Locations & Branches", kicker: "Network" },
  { id: "departments", label: "Departments", kicker: "Care units" },
  { id: "public", label: "Public Profile", kicker: "Viruj app" },
  { id: "review", label: "Review & Complete", kicker: "Launch" },
];

export const onboardingStepIds = new Set(steps.map((step) => step.id));

export const stepDescriptions: Record<StepId, string> = {
  profile: "Tell us about your hospital",
  locations: "Add branches and map locations",
  departments: "Choose care units and department-wise hours",
  public: "Control what appears on the Viruj patient app",
  review: "Confirm and launch your hospital workspace",
};

export const hospitalTypes = [
  "Hospital",
  "Clinic",
  "Diagnostic Center",
  "Nursing Home",
  "Specialty Center",
];

export const hospitalOwnershipTypes = ["Private", "Government", "Trust"];

export const legacyDepartmentNames = [
  "General Medicine",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Gynecology",
  "Dermatology",
  "ENT",
  "Oncology",
  "Nephrology",
  "Emergency",
  "ICU",
  "Radiology",
  "Pathology",
  "Physiotherapy",
];

export const publicOptions = [
  ["showHospitalProfile", "Show Hospital Profile"],
  ["acceptOnlineAppointments", "Accept Online Appointments"],
  ["displayDepartments", "Display Departments"],
  ["allowReviews", "Allow Reviews"],
  ["enableCommunity", "Enable Community"],
  ["enableEmergencyContact", "Enable Emergency Contact"],
] as const;

export const storagePrefix = "viruj:hospital-onboarding";