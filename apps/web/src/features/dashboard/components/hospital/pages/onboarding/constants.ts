import type { OnboardingKind, StepDefinition, StepId } from "./types";

export const hospitalSteps: StepDefinition[] = [
  { id: "profile", label: "Organization Profile", kicker: "Identity" },
  { id: "locations", label: "Locations & Branches", kicker: "Network" },
  { id: "departments", label: "Departments", kicker: "Care units" },
  { id: "services", label: "Services", kicker: "Hospital services" },
  { id: "review", label: "Review & Complete", kicker: "Submit" },
];

export const clinicSteps: StepDefinition[] = [
  { id: "profile", label: "Organization Profile", kicker: "Identity" },
  { id: "contact", label: "Contact Information", kicker: "Reachability" },
  { id: "locations", label: "Location", kicker: "Address" },
  { id: "workingHours", label: "Working Hours", kicker: "Schedule" },
  {
    id: "departments",
    label: "Departments / Specialties",
    kicker: "Care units",
  },
  { id: "doctors", label: "Doctors", kicker: "Clinical team" },
  { id: "review", label: "Review & Complete", kicker: "Submit" },
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
  review: "Review your hospital details before submitting",
  services: "Choose the services available at your hospital",
  workingHours: "Set daily opening hours",
};

export const clinicStepDescriptions: Record<StepId, string> = {
  clinicProfile: "Add about, languages, photos, and cover image",
  contact: "Add mobile, email, WhatsApp, and emergency contact",
  departments: "Select specialties from the Viruj department directory",
  doctors: "Add registered doctors and their availability",
  locations: "Add address, map link, and coordinates",
  profile: "Add clinic identity and registration details",
  public: "Control what appears on the Viruj patient app",
  review: "Review your clinic details before submitting",
  services: "Add services, pricing, duration, and online availability",
  workingHours: "Set your weekly schedule in Indian Standard Time",
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
export const hospitalServiceGroups = [
  {
    name: "Emergency and critical care",
    services: [
      "24x7 Emergency / Trauma Care",
      "Ambulance Service",
      "Air Ambulance",
      "ICU / NICU / PICU",
      "Burn Unit",
      "Poison Control",
    ],
  },
  {
    name: "Diagnostics and imaging",
    services: [
      "In-house Pathology Lab",
      "Radiology (X-ray, Ultrasound)",
      "CT Scan",
      "MRI",
      "PET Scan",
      "Mammography",
      "Bone Density (DEXA)",
      "Cardiac Diagnostics (ECG, Echo, TMT)",
      "Home Sample Collection",
    ],
  },
  {
    name: "Surgical and procedural",
    services: [
      "Day Care Surgery",
      "Robotic Surgery",
      "Laparoscopic Surgery",
      "Cath Lab",
      "Dialysis Unit",
      "Endoscopy",
      "Organ Transplant",
    ],
  },
  {
    name: "Maternity and child care",
    services: [
      "Maternity / Labour Rooms",
      "IVF / Fertility Services",
      "Neonatal Care",
      "Pediatric Vaccination",
      "Lactation Support",
    ],
  },
  {
    name: "Pharmacy and supplies",
    services: [
      "24x7 Pharmacy",
      "Blood Bank",
      "Oxygen Supply",
      "Medical Equipment Rental",
    ],
  },
  {
    name: "Outpatient and preventive",
    services: [
      "Health Check-up Packages",
      "Executive Health Check-ups",
      "Corporate Health Programs",
      "Vaccination Services",
      "Telemedicine / Video Consultation",
      "Second Opinion Services",
      "Home Healthcare / Home Nursing",
    ],
  },
  {
    name: "Rehab and wellness",
    services: [
      "Physiotherapy",
      "Occupational Therapy",
      "Cardiac Rehabilitation",
      "De-addiction Center",
      "Nutrition and Dietetics",
      "Yoga / Ayurveda / AYUSH",
      "Palliative Care",
    ],
  },
  {
    name: "Patient facilities",
    services: [
      "Private / Deluxe / Suite Rooms",
      "Attendant Stay",
      "Cafeteria / Canteen",
      "Pickup and Drop",
      "Interpreter Services",
      "Insurance Desk / TPA Support",
      "Cashless Treatment",
      "International Patient Services",
    ],
  },
  {
    name: "Camps and outreach (temporary)",
    services: [
      "Health Camps",
      "Blood Donation Drives",
      "Vaccination Drives",
      "Mobile Health Van",
      "Visiting Consultants",
    ],
  },
] as const;
