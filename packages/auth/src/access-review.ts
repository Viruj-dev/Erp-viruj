import { db } from "@erp_virujhealth/db";
import { env } from "@erp_virujhealth/env/server";
import { sql } from "drizzle-orm";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { APIError } from "better-auth/api";

export async function requireReviewedSignIn(userId: string) {
  const reviews = await db.execute(
    sql`SELECT r.status FROM erp_access_reviews r JOIN members m ON m.organization_id=r.organization_id WHERE m.user_id=${userId} AND r.status IN ('pending','approved')`
  );
  if (
    reviews.some((review) => review.status === "pending") &&
    !reviews.some((review) => review.status === "approved")
  )
    throw new APIError("FORBIDDEN", {
      code: "ACCESS_REVIEW_PENDING",
      message:
        "Your request is under review. We’ll email you once it’s reviewed.",
    });
}

export function clientIp(headers: Headers) {
  const value = env.ERP_CLIENT_IP_HEADER
    ? headers.get(env.ERP_CLIENT_IP_HEADER)?.trim()
    : null;
  if (value && isIP(value)) return value;
  if (env.NODE_ENV !== "production") return "127.0.0.1";
  throw new Error("A trusted ERP_CLIENT_IP_HEADER is required.");
}
export function limitWindow(now: number, seconds: number) {
  // Daily signup windows follow the product's India timezone.
  const offset = seconds === 86400 ? 19800000 : 0;
  return new Date(
    Math.floor((now + offset) / (seconds * 1000)) * seconds * 1000 - offset
  );
}
export async function takeRequestLimit(
  key: string,
  max: number,
  seconds: number
) {
  const digest = createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(key)
    .digest("hex");
  const start = limitWindow(Date.now(), seconds).toISOString();
  const rows =
    await db.execute(sql`INSERT INTO erp_request_limits (key,window_start,count) VALUES (${digest},${start},1)
    ON CONFLICT (key,window_start) DO UPDATE SET count=erp_request_limits.count+1 WHERE erp_request_limits.count < ${max} RETURNING count`);
  return rows.length > 0;
}
export async function sendReviewEmail(
  email: string,
  subject: string,
  text: string,
  html?: string
) {
  if (!env.RESEND_API_KEY)
    throw new Error("RESEND_API_KEY is required for application emails.");
  const result = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.ERP_FROM_EMAIL,
      to: [email],
      subject,
      text,
      html,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!result.ok)
    throw new Error(`Application email delivery failed (${result.status}).`);
}
