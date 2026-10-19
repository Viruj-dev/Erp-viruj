export type DiagnosticKind = "pathology" | "radiology";
export type DiagnosticParameter = {
  name: string;
  unit: string;
  reference: string;
};
export type DiagnosticService = {
  id: string;
  kind: DiagnosticKind;
  code: string;
  name: string;
  specimen: string | null;
  modality: string | null;
  preparation: string;
  pricePaise: number;
  turnaroundHours: number;
  parameters: DiagnosticParameter[];
  active: boolean;
};
export type DiagnosticServiceInput = Omit<
  DiagnosticService,
  "id" | "kind" | "active"
>;
export type DiagnosticOrder = {
  id: string;
  kind: DiagnosticKind;
  serviceId: string;
  serviceSnapshot: Omit<DiagnosticService, "id" | "kind" | "active">;
  patientName: string;
  patientPhone: string;
  patientAge: number | null;
  patientSex: string;
  referringDoctor: string;
  branch: string;
  priority: "routine" | "urgent";
  status: string;
  barcode: string | null;
  sampleNote: string;
  results: (DiagnosticParameter & { value: string })[];
  findings: string;
  impression: string;
  reportNote: string;
  version: number;
  scheduledAt: string | null;
  releasedAt: string | null;
  releasedBy: string | null;
  createdAt: string;
};
export const diagnosticStages: Record<DiagnosticKind, readonly string[]> = {
  pathology: [
    "ordered",
    "collected",
    "received",
    "processing",
    "review",
    "released",
  ],
  radiology: [
    "ordered",
    "scheduled",
    "checked_in",
    "scanning",
    "reporting",
    "review",
    "released",
  ],
};
export function diagnosticPermissions(role?: string | null) {
  const manager = [
    "OWNER",
    "ADMIN",
    "ORG_ADMIN",
    "MANAGER",
    "owner",
    "admin",
    "manager",
  ].includes(role ?? "");
  const doctor = role === "DOCTOR" || role === "doctor";
  const technician = role === "TECHNICIAN" || role === "lab_tech";
  return {
    catalogue: manager,
    results: manager || doctor || technician,
    release: doctor,
  };
}
export function diagnosticLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}
export function diagnosticMoney(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}
