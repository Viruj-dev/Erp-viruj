import type { DiagnosticOrder } from "./diagnostics";
export type DiagnosticBranch = {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  phone: string;
  published: boolean;
  homeCollection: boolean;
};
export type DiagnosticSlot = {
  id: string;
  branchId: string;
  serviceId: string;
  resource: string;
  startsAt: string;
  endsAt: string;
  reserved: boolean;
  blocked: boolean;
  branch: { name: string };
};
export type DiagnosticBooking = {
  id: string;
  status: "requested" | "accepted" | "declined" | "cancelled";
  version: number;
  note: string;
  collectionMode: string;
  collectionAddress: string;
  createdAt: string;
  slot: DiagnosticSlot;
  order: DiagnosticOrder;
};
