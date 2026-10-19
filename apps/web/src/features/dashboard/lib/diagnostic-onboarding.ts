export const diagnosticSetupFields = [
  "logoUrl",
  "logoName",
  "certificateUrl",
  "certificateName",
  "establishedYear",
  "website",
  "instagram",
  "facebook",
  "linkedin",
  "latitude",
  "longitude",
  "mapsLocation",
  "centreName",
  "legalName",
  "registrationNumber",
  "registrationAuthority",
  "additionalCertificates",
  "phone",
  "email",
  "branchName",
  "address",
  "city",
  "state",
  "postalCode",
  "openingTime",
  "closingTime",
  "reportingName",
  "reportingRegistration",
  "reportingEmail",
  "sampleHandling",
  "collectionInstructions",
  "equipment",
  "referralPolicy",
  "screeningProcess",
  "imageWorkflow",
] as const;
export type DiagnosticSetup = Record<
  (typeof diagnosticSetupFields)[number],
  string
> & {
  sections: string[];
  specimens: string[];
  modalities: string[];
  workingDays: string[];
  homeCollection: boolean;
  walkIns: boolean;
};
export type DiagnosticOnboardingState = {
  data: DiagnosticSetup | null;
  completedAt: string | null;
  version: number;
};
export function emptyDiagnosticSetup(name = "", email = ""): DiagnosticSetup {
  return {
    ...(Object.fromEntries(
      diagnosticSetupFields.map((field) => [field, ""])
    ) as Record<(typeof diagnosticSetupFields)[number], string>),
    centreName: name,
    email,
    branchName: "Main branch",
    openingTime: "09:00",
    closingTime: "18:00",
    sections: [],
    specimens: [],
    modalities: [],
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    homeCollection: false,
    walkIns: true,
  };
}
export function canManageDiagnosticSetup(role?: string | null) {
  return [
    "OWNER",
    "ADMIN",
    "ORG_ADMIN",
    "MANAGER",
    "owner",
    "admin",
    "manager",
  ].includes(role ?? "");
}
export const diagnosticSetupKey = (id: string) =>
  ["diagnostic-onboarding", id] as const;
