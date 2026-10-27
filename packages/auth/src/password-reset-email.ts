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

  const htmlUrl = url.replace(/[&<>"']/g, (character) => {
    return `&#${character.charCodeAt(0)};`;
  });

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
      html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Reset your Viruj Health password</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f2ee;color:#302529;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">A fresh start for your account. Reset your password securely; this link expires in one hour.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f2ee;table-layout:fixed;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:560px;table-layout:fixed;">
        <tr><td style="padding:0 0 24px;font-size:22px;font-weight:700;letter-spacing:-0.5px;color:#861d31;">viruj health<span style="font-size:12px;font-weight:400;letter-spacing:0;color:#74676b;"> &nbsp;/ &nbsp; ACCOUNT SECURITY</span></td></tr>
        <tr><td style="background-color:#ffffff;border:1px solid #e8e0dc;border-top:4px solid #861d31;border-radius:12px;padding:36px 28px;">
          <p style="margin:0 0 16px;color:#861d31;font-size:11px;font-weight:700;letter-spacing:2px;">PASSWORD RESET</p>
          <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.18;font-weight:400;letter-spacing:-0.8px;">Let’s get you<br>back to your account.</h1>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#675a5e;">We received a request to reset your Viruj Health password. Choose a new password using the secure link below.</p>
          <table role="presentation" cellspacing="0" cellpadding="0"><tr><td align="center" bgcolor="#861d31" style="border-radius:8px;mso-padding-alt:16px 28px;">
            <a href="${htmlUrl}" style="display:inline-block;background-color:#861d31;border:1px solid #861d31;border-radius:8px;padding:16px 28px;color:#ffffff;font-size:15px;font-weight:600;line-height:20px;text-decoration:none;text-align:center;mso-padding-alt:0;">Reset my password &nbsp; &rarr;</a>
          </td></tr></table>
          <p style="margin:16px 0 28px;font-size:12px;line-height:1.6;color:#74676b;">For your security, this link expires in <strong style="color:#46383d;">one hour.</strong></p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #eee7e3;"><tr><td style="padding-top:24px;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;line-height:1.6;">Didn’t request this?</p>
            <p style="margin:0;font-size:13px;line-height:1.7;color:#675a5e;">You can safely ignore this email. Your password will stay the same unless you use this link to change it.</p>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:24px 8px 0;">
          <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#74676b;">Button not working? Copy and paste this link into your browser:</p>
          <p style="margin:0;font-size:12px;line-height:1.7;word-break:break-all;overflow-wrap:anywhere;"><a href="${htmlUrl}" style="color:#861d31;text-decoration:underline;word-break:break-all;">${htmlUrl}</a></p>
          <p style="margin:24px 0 0;font-size:12px;line-height:1.7;color:#74676b;">Need help? <a href="mailto:support@virujhealth.com" style="color:#675a5e;text-decoration:underline;">Contact support</a><br>Viruj Health &middot; Account security</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
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
