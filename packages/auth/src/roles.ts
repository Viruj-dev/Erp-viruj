import { z } from "zod";

export const organizationRoleOptions = [
  "OWNER",
  "CLINIC_OWNER",
  "ADMIN",
  "CLINIC_ADMIN",
  "MANAGER",
  "DOCTOR",
  "STAFF",
  "CLINIC_STAFF",
  "RECEPTIONIST",
  "TECHNICIAN",
] as const;

export const legacyOrganizationRoleOptions = [
  "ORG_ADMIN",
  "APPOINTMENT_HANDLER",
  "COMMUNITY_MANAGER",
  "owner",
  "admin",
  "manager",
  "doctor",
  "receptionist",
  "billing",
  "lab_tech",
] as const;

export const acceptedOrganizationRoleOptions = [
  ...organizationRoleOptions,
  ...legacyOrganizationRoleOptions,
] as const;

export const organizationRoleSchema = z.enum(acceptedOrganizationRoleOptions);

export type OrganizationMemberRole =
  (typeof acceptedOrganizationRoleOptions)[number];

export type ErpOrganizationRole = (typeof organizationRoleOptions)[number];

export const normalizeOrganizationMemberRole = (
  role: string
): ErpOrganizationRole | "APPOINTMENT_HANDLER" | "COMMUNITY_MANAGER" | null => {
  switch (role) {
    case "owner":
    case "OWNER":
    case "CLINIC_OWNER":
      return "OWNER";
    case "ORG_ADMIN":
    case "admin":
    case "ADMIN":
    case "CLINIC_ADMIN":
      return "ADMIN";
    case "manager":
    case "MANAGER":
      return "MANAGER";
    case "doctor":
    case "DOCTOR":
      return "DOCTOR";
    case "receptionist":
    case "RECEPTIONIST":
      return "RECEPTIONIST";
    case "STAFF":
    case "CLINIC_STAFF":
      return "STAFF";
    case "lab_tech":
    case "TECHNICIAN":
      return "TECHNICIAN";
    // APPOINTMENT_HANDLER and COMMUNITY_MANAGER are distinct roles with their
    // own grant definitions in organizationRoles — they must not normalize
    // into DOCTOR or MANAGER.
    case "APPOINTMENT_HANDLER":
      return "APPOINTMENT_HANDLER";
    case "COMMUNITY_MANAGER":
      return "COMMUNITY_MANAGER";
    default:
      return null;
  }
};
