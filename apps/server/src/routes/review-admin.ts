import { getCentralApiPermissions } from "@erp_virujhealth/auth";
import {
  clientIp,
  takeRequestLimit,
  sendReviewEmail,
} from "@erp_virujhealth/auth/access-review";
import { db } from "@erp_virujhealth/db";
import { env } from "@erp_virujhealth/env/server";
import { sql } from "drizzle-orm";
import type { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { bodyLimit } from "hono/body-limit";
import { SignJWT, jwtVerify } from "jose";
import { timingSafeEqual } from "node:crypto";
import { reviewEmailHtml } from "./review-email";

const cookieName = "erp_review_admin";
function adminKey() {
  if (
    !env.ERP_REVIEW_ADMIN_SECRET ||
    !env.ERP_REVIEW_ADMIN_ID ||
    !env.ERP_REVIEW_ADMIN_PASSWORD_HASH
  )
    throw new Error("Review administrator credentials are not configured.");
  return new TextEncoder().encode(env.ERP_REVIEW_ADMIN_SECRET);
}
async function centralToken(row: Record<string, unknown>) {
  return new SignJWT({
    platform: "erp",
    tenant_id: row.organization_id,
    organization_type: row.organization_type,
    role: "OWNER",
    permissions: getCentralApiPermissions("OWNER"),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(row.applicant_id))
    .setIssuer("viruj-auth")
    .setAudience("viruj-central-api")
    .setIssuedAt()
    .setExpirationTime("2m")
    .sign(new TextEncoder().encode(env.CENTRAL_API_JWT_SECRET));
}
async function notify(row: Record<string, unknown>) {
  if (!env.ERP_WEB_URL) throw new Error("ERP_WEB_URL must be configured.");
  const signInUrl = new URL("/auth", env.ERP_WEB_URL).toString();
  if (row.status === "approved") {
    if (!env.CENTRAL_API_URL || !env.ERP_WEB_URL)
      throw new Error("CENTRAL_API_URL and ERP_WEB_URL must be configured.");
    const sync = await fetch(
      `${env.CENTRAL_API_URL}/api/erp/access-review/sync`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${await centralToken(row)}` },
        signal: AbortSignal.timeout(15000),
      }
    );
    if (!sync.ok)
      throw new Error("Approval saved; directory synchronization needs retry.");
    await sendReviewEmail(
      String(row.email),
      "Your Viruj Health workspace is approved",
      [
        "Your application is approved and your workspace is ready.",
        "Sign in with your existing email and password. Your onboarding details are saved, and you do not need to request access again.",
        `Sign in to Viruj Health: ${signInUrl}`,
        "Keep your credentials private. Grant access only to authorized team members and follow your organization's privacy policies when handling patient information.",
        "For assistance, contact support@virujhealth.com.",
      ].join("\n\n"),
      await reviewEmailHtml("approved", signInUrl)
    );
  } else {
    await sendReviewEmail(
      String(row.email),
      "Update your Viruj Health application",
      `Your application needs a few updates before we can approve it.\n\nReview note: ${row.reason}\n\nSign in with your existing email and password to open your saved application. Correct your details and submit again. Your account and saved details are retained.\n\nUpdate your application: ${signInUrl}\n\nNeed help? Contact support@virujhealth.com.`,
      await reviewEmailHtml("rejected", signInUrl, String(row.reason || ""))
    );
  }
  await db.execute(
    sql`UPDATE erp_access_reviews SET email_sent_at=now() WHERE organization_id=${row.organization_id} AND revision=${row.revision}`
  );
}
export function registerReviewAdminRoutes(app: Hono) {
  app.use("/auth/review-admin/*", bodyLimit({ maxSize: 8192 }));
  app.use("/auth/review-admin/*", async (c, next) => {
    c.header("Cache-Control", "no-store");
    c.header("X-Content-Type-Options", "nosniff");
    if (c.req.method !== "OPTIONS") {
      const allowed = new Set([new URL(env.ERP_REVIEW_ADMIN_ORIGIN).origin]);
      if (env.NODE_ENV !== "production") allowed.add("http://localhost:3001");
      let origin = c.req.header("Origin");
      if (!origin) {
        try {
          origin = new URL(c.req.header("Referer") ?? "").origin;
        } catch {
          origin = "";
        }
      }
      if (!allowed.has(origin))
        return c.json(
          { error: "Use the administrator panel to perform this action." },
          403
        );
    }
    if (c.req.path.endsWith("/login")) return next();
    try {
      const { payload } = await jwtVerify(
        getCookie(c, cookieName) ?? "",
        adminKey(),
        {
          algorithms: ["HS256"],
          issuer: "viruj-review-admin",
          audience: "review-panel",
        }
      );
      if (payload.sub !== env.ERP_REVIEW_ADMIN_ID)
        return c.json({ error: "Administrator sign-in required." }, 401);
    } catch {
      return c.json({ error: "Administrator sign-in required." }, 401);
    }
    return next();
  });
  app.post("/auth/review-admin/login", async (c) => {
    const key = adminKey();
    if (
      !(await takeRequestLimit(`admin:${clientIp(c.req.raw.headers)}`, 5, 900))
    )
      return c.json(
        { error: "Too many sign-in attempts. Try again in 15 minutes." },
        429
      );
    const body = await c.req.json().catch(() => null);
    const password =
      typeof body?.password === "string" && body.password.length <= 512
        ? body.password
        : "";
    const id = Buffer.from(typeof body?.id === "string" ? body.id : "");
    const expected = Buffer.from(env.ERP_REVIEW_ADMIN_ID!);
    const validPassword = await Bun.password.verify(
      password,
      env.ERP_REVIEW_ADMIN_PASSWORD_HASH!
    );
    if (
      id.length !== expected.length ||
      !timingSafeEqual(id, expected) ||
      !validPassword
    )
      return c.json({ error: "Invalid administrator credentials." }, 401);
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(env.ERP_REVIEW_ADMIN_ID!)
      .setIssuer("viruj-review-admin")
      .setAudience("review-panel")
      .setIssuedAt()
      .setExpirationTime("30m")
      .sign(key);
    setCookie(c, cookieName, token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/auth/review-admin",
      maxAge: 1800,
    });
    return c.json({ ok: true });
  });
  app.post("/auth/review-admin/logout", (c) => {
    deleteCookie(c, cookieName, { path: "/auth/review-admin" });
    return c.json({ ok: true });
  });
  app.get("/auth/review-admin/requests", async (c) => {
    const logs = c.req.query("view") === "logs";
    const offset = Math.max(
      0,
      Math.min(1000000, Number(c.req.query("offset")) || 0)
    );
    const rows = await db.execute(
      sql`SELECT r.*,u.name AS applicant_name,u.email,o.name AS organization_name,o.organization_type,o.slug FROM erp_access_reviews r JOIN users u ON u.id=r.applicant_id JOIN organizations o ON o.id=r.organization_id WHERE ${logs ? sql`r.status IN ('approved','rejected')` : sql`r.status='pending'`} ORDER BY ${logs ? sql`r.reviewed_at DESC` : sql`r.submitted_at DESC`} LIMIT 50 OFFSET ${offset}`
    );
    return c.json(rows);
  });
  app.post("/auth/review-admin/requests/:id/decision", async (c) => {
    const body = await c.req.json().catch(() => null);
    if (
      !body ||
      !["approved", "rejected"].includes(body.status) ||
      !Number.isInteger(body.revision) ||
      (body.status === "rejected" &&
        (typeof body.reason !== "string" ||
          !body.reason.trim() ||
          body.reason.length > 2000))
    )
      return c.json(
        {
          error:
            "Choose a decision and give clear review notes when requesting corrections.",
        },
        400
      );
    const updated = await db.execute(
      sql`UPDATE erp_access_reviews SET status=${body.status},reason=${body.status === "rejected" ? body.reason.trim() : null},reviewed_at=now(),email_sent_at=NULL WHERE organization_id=${c.req.param("id")} AND status='pending' AND revision=${body.revision} RETURNING organization_id`
    );
    if (!updated.length)
      return c.json(
        {
          error:
            "This application has changed. Refresh the list before reviewing it.",
        },
        409
      );
    return deliver(c.req.param("id"), c);
  });
  app.post(
    "/auth/review-admin/requests/:id/documents/:documentId",
    async (c) => {
      if (!env.CENTRAL_API_URL)
        return c.json({ error: "Document service is not configured." }, 503);
      const token = await new SignJWT({
        document_id: c.req.param("documentId"),
      })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(c.req.param("id"))
        .setIssuer("viruj-review-admin")
        .setAudience("review-document")
        .setIssuedAt()
        .setExpirationTime("1m")
        .sign(new TextEncoder().encode(env.CENTRAL_API_JWT_SECRET));
      const result = await fetch(
        `${env.CENTRAL_API_URL}/api/internal/review-document`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(15000),
        }
      );
      if (!result.ok)
        return c.json({ error: "Unable to open this document." }, 502);
      if (!result.headers.get("Content-Type")?.includes("application/json")) {
        return new Response(result.body, {
          headers: {
            "Content-Type":
              result.headers.get("Content-Type") || "application/octet-stream",
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
      return c.json(await result.json());
    }
  );
  app.post("/auth/review-admin/requests/:id/resend", async (c) =>
    deliver(c.req.param("id"), c)
  );
}
async function deliver(id: string, c: import("hono").Context) {
  const rows = await db.execute(
    sql`SELECT r.*,u.email,o.organization_type,o.slug FROM erp_access_reviews r JOIN users u ON u.id=r.applicant_id JOIN organizations o ON o.id=r.organization_id WHERE r.organization_id=${id} AND r.status IN ('approved','rejected')`
  );
  const row = rows[0];
  if (!row) return c.json({ error: "Reviewed application not found." }, 404);
  try {
    await notify(row);
    return c.json({ ok: true });
  } catch (error) {
    console.error("Review notification failed", error);
    return c.json(
      {
        error:
          "Decision saved. Email or directory synchronization failed; use Send email again to retry.",
      },
      502
    );
  }
}
