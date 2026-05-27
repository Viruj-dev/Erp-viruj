import { z } from "zod";

export const organizationRoleOptions = [
  "ORG_ADMIN",
  "APPOINTMENT_HANDLER",
  "COMMUNITY_MANAGER",
] as const;

export const legacyOrganizationRoleOptions = [
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
): ErpOrganizationRole | null => {
  switch (role) {
    case "ORG_ADMIN":
    case "owner":
    case "admin":
    case "manager":
      return "ORG_ADMIN";
    case "APPOINTMENT_HANDLER":
    case "doctor":
    case "receptionist":
    case "lab_tech":
      return "APPOINTMENT_HANDLER";
    case "COMMUNITY_MANAGER":
      return "COMMUNITY_MANAGER";
    default:
      return null;
  }
};
