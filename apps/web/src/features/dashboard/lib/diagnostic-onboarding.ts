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
  "reportingCouncil",
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
  doctorInvitationsPending?: number;
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
export const diagnosticSetupKey = (userId: string, id: string) =>
  [userId, id, "diagnostics.services", "onboarding"] as const;

export function needsDiagnosticProfileCompletion(
  setup: DiagnosticOnboardingState,
  kind: "pathology" | "radiology"
) {
  const data = setup.data;
  if (!setup.completedAt || !data) return true;
  const requiredFields: (keyof DiagnosticSetup)[] = [
    "centreName",
    "registrationNumber",
    "phone",
    "email",
    "branchName",
    "address",
    "city",
    "state",
    "postalCode",
    "openingTime",
    "closingTime",
    ...(kind === "radiology"
      ? ([
          "legalName",
          "registrationAuthority",
          "reportingName",
          "reportingRegistration",
          "reportingEmail",
          "equipment",
          "referralPolicy",
          "screeningProcess",
          "imageWorkflow",
        ] as const)
      : []),
  ];
  return (
    requiredFields.some((field) => !String(data[field] ?? "").trim()) ||
    !data.workingDays?.length ||
    (kind === "radiology" && !data.modalities?.length)
  );
}
