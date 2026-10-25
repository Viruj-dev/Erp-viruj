import { env } from "@erp_virujhealth/env/server";

export async function sendPasswordResetEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  if (!env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is required to send password reset emails."
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.ERP_FROM_EMAIL,
      to: [email],
      subject: "Reset your Viruj Health password",
      text: [
        "We received a request to reset your Viruj Health password.",
        "",
        `Reset your password: ${url}`,
        "",
        "This link expires in one hour. If you did not request a reset, you can ignore this email.",
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Password reset email delivery failed (${response.status}).`
    );
  }
}
