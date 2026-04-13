import { z } from "zod";

export const organizationRoleOptions = [
  "owner",
  "admin",
  "manager",
  "doctor",
  "receptionist",
  "billing",
  "lab_tech",
] as const;

export const organizationRoleSchema = z.enum(organizationRoleOptions);

export type OrganizationMemberRole = (typeof organizationRoleOptions)[number];
