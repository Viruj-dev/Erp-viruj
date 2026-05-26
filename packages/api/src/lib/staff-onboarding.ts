import type { ErpOrganizationRole } from "@erp_virujhealth/auth";
import { randomBytes } from "node:crypto";

const roleLabels: Record<ErpOrganizationRole, string> = {
  APPOINTMENT_HANDLER: "Appointment Handler",
  COMMUNITY_MANAGER: "Community Manager",
  FINANCE_MANAGER: "Finance Handler",
  ORG_ADMIN: "Organization Admin",
};

export type StaffCredentialEmail = {
  email: string;
  loginUrl: string;
  name: string;
  organizationName: string;
  password: string;
  role: ErpOrganizationRole;
};

export function generateTemporaryPassword() {
  return `Viruj-${randomBytes(9).toString("base64url")}!7`;
}

export function buildStaffLoginUrl(organizationType: string, role: string) {
  const baseUrl = process.env.CORS_ORIGIN || "http://localhost:3001";
  const roleRoute =
    role === "FINANCE_MANAGER"
      ? "finance"
      : role === "APPOINTMENT_HANDLER"
        ? "appointments"
        : role === "COMMUNITY_MANAGER"
          ? "community"
          : "dashboard";

  return `${baseUrl.replace(/\/$/, "")}/${organizationType}/${roleRoute}`;
}

export async function sendStaffCredentialEmail(payload: StaffCredentialEmail) {
  const subject = `Your Viruj Health ERP ${roleLabels[payload.role]} access`;
  const body = [
    `Hi ${payload.name},`,
    "",
    `${payload.organizationName} has created your Viruj Health ERP account.`,
    "",
    `Login URL: ${payload.loginUrl}`,
    `Email: ${payload.email}`,
    `Temporary password: ${payload.password}`,
    `Assigned role: ${roleLabels[payload.role]}`,
    "",
    "Please sign in and change your password after first login.",
  ].join("\n");

  console.info("[Staff Invite Email]", {
    body,
    subject,
    to: payload.email,
  });

  return {
    body,
    subject,
    to: payload.email,
  };
}
