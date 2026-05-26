import type { ErpOrganizationRole } from "@erp_virujhealth/auth";
import { env } from "@erp_virujhealth/env/server";
import { randomBytes } from "node:crypto";

const roleLabels: Record<ErpOrganizationRole, string> = {
  APPOINTMENT_HANDLER: "Appointment Handler",
  COMMUNITY_MANAGER: "Community Manager",
  FINANCE_MANAGER: "Finance Handler",
  ORG_ADMIN: "Organization Admin",
};
function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export type StaffCredentialEmail = {
  confirmationUrl: string;
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

export function buildStaffConfirmationUrl(invitationId: string) {
  const baseUrl = process.env.CORS_ORIGIN || "http://localhost:3001";

  return `${baseUrl.replace(/\/$/, "")}/staff-confirmation/${invitationId}`;
}

export async function sendStaffCredentialEmail(payload: StaffCredentialEmail) {
  const subject = `Your Viruj Health ERP ${roleLabels[payload.role]} access`;
  const body = [
    `Hi ${payload.name},`,
    "",
    `${payload.organizationName} has created your Viruj Health ERP account.`,
    "",
    `Confirm access: ${payload.confirmationUrl}`,
    `Login URL after confirmation: ${payload.loginUrl}`,
    `Email: ${payload.email}`,
    `Temporary password: ${payload.password}`,
    `Assigned role: ${roleLabels[payload.role]}`,
    "",
    "Please confirm your access first, then sign in and change your password after first login.",
  ].join("\n");
  const html = buildCredentialEmailHtml(payload);

  if (!env.RESEND_API_KEY) {
    console.info("[Staff Invite Email:dev-fallback]", {
      body,
      subject,
      to: payload.email,
    });

    return {
      body,
      provider: "dev-fallback",
      subject,
      to: payload.email,
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: env.ERP_FROM_EMAIL,
      html,
      subject,
      text: body,
      to: [payload.email],
    }),
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const result = (await response.json().catch(() => null)) as {
    error?: {
      message?: string;
    };
    id?: string;
    message?: string;
  } | null;

  if (!response.ok) {
    console.error("[Staff Invite Email:resend-error]", {
      error: result?.error?.message || result?.message,
      from: env.ERP_FROM_EMAIL,
      status: response.status,
      to: payload.email,
    });

    throw new Error(
      result?.error?.message ||
        result?.message ||
        "Resend could not send the staff credential email."
    );
  }

  console.info("[Staff Invite Email:resend-sent]", {
    from: env.ERP_FROM_EMAIL,
    id: result?.id,
    to: payload.email,
  });

  return {
    body,
    id: result?.id,
    provider: "resend",
    subject,
    to: payload.email,
  };
}

function buildCredentialEmailHtml(payload: StaffCredentialEmail) {
  const roleLabel = roleLabels[payload.role];

  return `
<div style="margin:0;background:#f4f7fb;padding:40px 20px;font-family:Inter,Arial,sans-serif;color:#172033"> <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dce6f2;border-radius:24px;overflow:hidden;box-shadow:0 28px 80px rgba(15,23,42,0.10)"> <!-- Header --> <div style="background:linear-gradient(135deg,#003b73 0%,#0057a8 100%);padding:34px 36px;color:white"> <div style="font-size:12px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#bfe3ff"> Viruj Health ERP </div> <h1 style="margin:14px 0 10px;font-size:30px;line-height:1.2;font-weight:800"> Your ${roleLabel} access is ready </h1> <p style="margin:0;font-size:15px;line-height:1.7;color:#d9ebff"> Secure access has been provisioned for your hospital ERP workspace. </p> </div> <!-- Body --> <div style="padding:36px"> <p style="font-size:16px;line-height:1.7;margin:0 0 18px"> Hi <strong>${escapeHtml(payload.name)}</strong>, </p> <p style="font-size:15px;line-height:1.8;color:#435066;margin:0 0 28px"> ${escapeHtml(payload.organizationName)} has invited you to access the Viruj Health ERP platform as a <strong>${roleLabel}</strong>. Please confirm your access and complete your first sign-in to activate your staff account. </p> <!-- Credentials Card --> <div style="border:1px solid #d9e5f2;background:#f8fbff;border-radius:18px;padding:24px;margin-bottom:28px"> <div style="margin-bottom:18px"> <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#718198;margin-bottom:8px"> Login Email </div> <div style="font-size:16px;font-weight:700;color:#172033"> ${escapeHtml(payload.email)} </div> </div> <div> <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#718198;margin-bottom:8px"> Temporary Password </div> <div style="font-size:20px;font-weight:900;letter-spacing:0.04em;color:#003b73"> ${escapeHtml(payload.password)} </div> </div> </div> <!-- CTA --> <div style="margin-bottom:28px"> <a href="${payload.confirmationUrl}" style=" display:inline-flex; align-items:center; justify-content:center; background:#00478d; color:white; text-decoration:none; font-weight:800; font-size:15px; padding:14px 22px; border-radius:12px; box-shadow:0 10px 25px rgba(0,71,141,0.25); " > Confirm Staff Access </a> </div> <!-- Access Info --> <div style="border-top:1px solid #e5edf6;padding-top:22px"> <div style="margin-bottom:14px"> <div style="font-size:13px;color:#64748b;line-height:1.7"> Assigned role: <strong style="color:#172033">${roleLabel}</strong> </div> </div> <div style="margin-bottom:14px"> <div style="font-size:13px;color:#64748b;line-height:1.7"> After confirmation, use the credentials above to sign in to your ERP dashboard. </div> </div> <div> <div style="font-size:13px;color:#64748b;line-height:1.7"> For security reasons, you will be required to change your password after your first login. </div> </div> </div> </div> <!-- Footer --> <div style="background:#f8fafc;border-top:1px solid #e6edf5;padding:24px 36px"> <div style="font-size:13px;color:#64748b;line-height:1.8"> This invitation was generated securely by <strong style="color:#172033">Viruj Health ERP</strong>. </div> <div style="font-size:12px;color:#94a3b8;margin-top:8px"> © 2026 Viruj Health. All rights reserved. </div> </div> </div> </div>`;
}
