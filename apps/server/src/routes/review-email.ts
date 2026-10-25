import { html } from "hono/html";

export async function reviewEmailHtml(
  status: "approved" | "rejected",
  signInUrl: string,
  reason?: string
) {
  const approved = status === "approved";
  const heading = approved
    ? "Your workspace is ready"
    : "A few details need updating";
  const message = approved
    ? "Your application is approved. Sign in with your existing email and password to open your workspace."
    : "Please review the note below, update your saved details, and submit your application again.";
  return (
    await html`<!doctype html>
      <html lang="en">
        <body
          style="margin:0;padding:24px 12px;background:#f7f5f4;font-family:Arial,sans-serif;color:#24302d"
        >
          <table
            role="presentation"
            style="width:100%;max-width:560px;margin:0 auto;border-spacing:0;background:#ffffff;border:1px solid #e8dfdc;border-radius:16px"
          >
            <tr>
              <td
                style="padding:28px 28px 20px;border-bottom:1px solid #eee7e4;font-size:20px;font-weight:bold;color:#7f1d1d"
              >
                Viruj Health
              </td>
            </tr>
            <tr>
              <td style="padding:28px">
                <p
                  style="margin:0 0 12px;font-size:11px;font-weight:bold;letter-spacing:1.5px;color:#6b625e"
                >
                  ${approved ? "APPLICATION APPROVED" : "APPLICATION UPDATE"}
                </p>
                <h1
                  style="margin:0 0 16px;font-size:26px;line-height:1.3;color:#212b28"
                >
                  ${heading}
                </h1>
                <p style="margin:0 0 22px;font-size:15px;line-height:1.7">
                  ${message}
                </p>
                ${!approved && reason
                  ? html`<table
                      role="presentation"
                      style="width:100%;margin:0 0 24px;border-spacing:0;background:#faf4ef;border:1px solid #eadbd0;border-radius:10px"
                    >
                      <tr>
                        <td style="padding:18px">
                          <p
                            style="margin:0 0 8px;font-size:12px;font-weight:bold;color:#7f4b2d"
                          >
                            REVIEW NOTE
                          </p>
                          <p
                            style="margin:0;font-size:15px;line-height:1.7;white-space:pre-wrap;word-break:break-word"
                          >
                            ${reason}
                          </p>
                        </td>
                      </tr>
                    </table>`
                  : ""}
                <p style="margin:0 0 22px">
                  <a
                    href="${signInUrl}"
                    style="display:inline-block;padding:14px 22px;border-radius:8px;background:#7f1d1d;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none"
                    >${approved
                      ? "Sign in to Viruj Health"
                      : "Update application"}</a
                  >
                </p>
                <p
                  style="margin:0;font-size:13px;line-height:1.7;color:#6b625e"
                >
                  ${approved
                    ? "Your onboarding details are saved. You do not need to request access again."
                    : "Use your existing email and password. Your account and saved details are retained."}
                </p>
                ${approved
                  ? html`<p
                      style="margin:16px 0 0;font-size:13px;line-height:1.7;color:#6b625e"
                    >
                      Keep your credentials private. Give access only to
                      authorized team members and follow your organization’s
                      privacy policies when handling patient information.
                    </p>`
                  : ""}
              </td>
            </tr>
            <tr>
              <td
                style="padding:20px 28px;border-top:1px solid #eee7e4;font-size:12px;line-height:1.7;color:#6b625e"
              >
                Need help?
                <a href="mailto:support@virujhealth.com" style="color:#7f1d1d"
                  >Contact our support team</a
                >.
              </td>
            </tr>
          </table>
        </body>
      </html>`
  ).toString();
}
