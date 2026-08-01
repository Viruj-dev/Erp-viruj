import type { OnboardingKind, StepDefinition, StepId } from "./types";

export const hospitalSteps: StepDefinition[] = [
  { id: "profile", label: "Organization Profile", kicker: "Identity" },
  { id: "locations", label: "Locations & Branches", kicker: "Network" },
  { id: "departments", label: "Departments", kicker: "Care units" },
  { id: "public", label: "Public Profile", kicker: "Viruj app" },
  { id: "review", label: "Review & Complete", kicker: "Launch" },
];

export const clinicSteps: StepDefinition[] = [
  { id: "profile", label: "Basic Clinic Information", kicker: "Identity" },
  { id: "contact", label: "Contact Information", kicker: "Reachability" },
  { id: "locations", label: "Location", kicker: "Address" },
  { id: "clinicProfile", label: "Clinic Profile", kicker: "Patient-facing" },
  { id: "workingHours", label: "Working Hours", kicker: "Schedule" },
  { id: "departments", label: "Departments / Specialties", kicker: "Care units" },
  { id: "doctors", label: "Doctors", kicker: "Clinical team" },
  { id: "services", label: "Services", kicker: "Offerings" },
  { id: "review", label: "Review & Complete", kicker: "Launch" },
];

export const steps = hospitalSteps;
export const onboardingStepIds = new Set(steps.map((step) => step.id));

export const hospitalStepDescriptions: Record<StepId, string> = {
  clinicProfile: "Add patient-facing clinic details",
  contact: "Add clinic contact channels",
  departments: "Choose care units and department-wise hours",
  doctors: "Add basic doctor availability",
  locations: "Add branches and map locations",
  profile: "Tell us about your hospital",
  public: "Control what appears on the Viruj patient app",
  review: "Confirm and launch your hospital workspace",
  services: "Add billable services and online availability",
  workingHours: "Set daily opening hours",
};

export const clinicStepDescriptions: Record<StepId, string> = {
  clinicProfile: "Add about, languages, photos, and cover image",
  contact: "Add mobile, email, WhatsApp, and emergency contact",
  departments: "Add specialties with descriptions and optional heads",
  doctors: "Add existing doctors or invite new doctors",
  locations: "Add address, map link, and coordinates",
  profile: "Add clinic identity and registration details",
  public: "Control what appears on the Viruj patient app",
  review: "Confirm and launch your clinic workspace",
  services: "Add services, pricing, duration, and online availability",
  workingHours: "Set opening, lunch, closed, and emergency hours",
};

export const stepDescriptions = hospitalStepDescriptions;

export function getOnboardingSteps(kind: OnboardingKind) {
  return kind === "clinic" ? clinicSteps : hospitalSteps;
}

export function getStepDescriptions(kind: OnboardingKind) {
  return kind === "clinic" ? clinicStepDescriptions : hospitalStepDescriptions;
}

export function getStoragePrefix(kind: OnboardingKind) {
  return kind === "clinic" ? clinicStoragePrefix : storagePrefix;
}

export const hospitalTypes = [
  "Hospital",
  "Clinic",
  "Diagnostic Center",
  "Nursing Home",
  "Specialty Center",
];

export const hospitalOwnershipTypes = ["Private", "Government", "Trust"];

export const clinicTypes = [
  "General Clinic",
  "Multi-specialty Clinic",
  "Dental Clinic",
  "Eye Clinic",
  "Skin Clinic",
  "Orthopedic Clinic",
  "Physiotherapy Clinic",
  "Mental Health Clinic",
  "Diagnostic Clinic",
  "Pediatrics Clinic",
  "Gynecology Clinic",
  "ENT Clinic",
  "Custom",
];

export const clinicOwnershipTypes = [
  "Individual",
  "Partnership",
  "LLP",
  "Pvt Ltd",
  "Trust",
];

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

export const clinicDepartmentNames = [
  "General Medicine",
  "Pediatrics",
  "Gynecology",
  "Orthopedics",
  "Dentistry",
  "Dermatology",
  "Psychiatry",
  "ENT",
  "Cardiology",
  "Physiotherapy",
];

export const clinicServiceNames = [
  "General Consultation",
  "Vaccination",
  "ECG",
  "Dressing",
  "Nebulization",
  "Health Checkups",
  "Blood Collection",
  "Physiotherapy",
  "Diabetes Management",
  "Nutrition Counseling",
];

export const clinicServiceCategories = [
  "Consultation",
  "Procedure",
  "Diagnostics",
  "Preventive Care",
  "Therapy",
  "Chronic Care",
  "Nutrition",
];

export const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
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
export const clinicStoragePrefix = "viruj:clinic-onboarding";
