import type { ErpOrganizationRole } from "@erp_virujhealth/auth";
import { env } from "@erp_virujhealth/env/server";
import { randomBytes } from "node:crypto";

const roleLabels: Record<ErpOrganizationRole, string> = {
  APPOINTMENT_HANDLER: "Appointment Handler",
  COMMUNITY_MANAGER: "Community Manager",
  FINANCE_MANAGER: "Finance Handler",
  ORG_ADMIN: "Organization Admin",
};

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
  <div style="margin:0;background:#f6f8fb;padding:32px;font-family:Inter,Arial,sans-serif;color:#172033">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #dfe7f1;border-radius:18px;overflow:hidden;box-shadow:0 24px 70px rgba(15,23,42,0.10)">
      <div style="background:#003b73;padding:28px 32px;color:white">
        <div style="font-size:12px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#9fd7ff">Viruj Health ERP</div>
        <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2">Your ${roleLabel} access is ready</h1>
      </div>
      <div style="padding:30px 32px">
        <p style="font-size:16px;line-height:1.6;margin:0 0 18px">Hi ${escapeHtml(payload.name)},</p>
        <p style="font-size:15px;line-height:1.7;margin:0 0 24px">${escapeHtml(payload.organizationName)} has created your Viruj Health ERP account. Confirm your access first so your staff status changes from pending to on duty.</p>
        <div style="border:1px solid #dbe6f3;border-radius:14px;background:#f8fbff;padding:18px;margin-bottom:22px">
          <p style="margin:0 0 10px;font-size:13px;color:#526070">Email</p>
          <p style="margin:0 0 18px;font-size:16px;font-weight:800">${escapeHtml(payload.email)}</p>
          <p style="margin:0 0 10px;font-size:13px;color:#526070">Temporary password</p>
          <p style="margin:0;font-size:18px;font-weight:900;letter-spacing:0.02em">${escapeHtml(payload.password)}</p>
        </div>
        <a href="${payload.confirmationUrl}" style="display:inline-block;background:#00478d;color:white;text-decoration:none;font-weight:800;padding:13px 18px;border-radius:10px">Confirm Staff Access</a>
        <p style="font-size:13px;line-height:1.6;color:#657184;margin:24px 0 0">Assigned role: <strong>${roleLabel}</strong>. After confirmation, sign in with these credentials and change your password after first login.</p>
      </div>
    </div>
  </div>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
