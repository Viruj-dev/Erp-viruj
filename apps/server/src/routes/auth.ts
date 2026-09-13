import { auth, getCentralApiPermissions } from "@erp_virujhealth/auth";
import { db } from "@erp_virujhealth/db";
import { env } from "@erp_virujhealth/env/server";
import {
  member,
  organization,
  organizationTypes,
  normalizeOrganizationType,
  session,
} from "@erp_virujhealth/db/schema/auth";
import { and, eq } from "drizzle-orm";
import type { Hono } from "hono";
import { randomUUID } from "node:crypto";
import { SignJWT } from "jose";

const defaultOrganizationType = "hospital";

export function registerAuthRoutes(app: Hono) {
  app.get("/auth/central-api-token", async (context) => {
    context.header("Cache-Control", "no-store");
    try {
      const authSession = await auth.api.getSession({
        headers: context.req.raw.headers,
      });

      if (!authSession?.user) {
        return context.json({ error: "Not authenticated" }, 401);
      }

      const activeOrganization = authSession.activeOrganization as
        | { id?: string; organizationType?: string }
        | null
        | undefined;
      const tenantId = activeOrganization?.id;

      if (!tenantId) {
        return context.json({ error: "Active organization required" }, 403);
      }

      const activeMembership = await db
        .select({
          organizationId: member.organizationId,
          role: member.role,
          organizationType: organization.organizationType,
        })
        .from(member)
        .innerJoin(organization, eq(member.organizationId, organization.id))
        .where(
          and(
            eq(member.organizationId, tenantId),
            eq(member.userId, authSession.user.id)
          )
        )
        .limit(1)
        .then((memberships) => memberships[0] ?? null);

      if (!activeMembership) {
        return context.json(
          { error: "Active organization membership required" },
          403
        );
      }

      const now = Math.floor(Date.now() / 1000);
      const exp = now + 15 * 60;
      const role = activeMembership.role;
      const permissions = getCentralApiPermissions(role);
      const token = await new SignJWT({
        platform: "erp",
        role,
        tenant_id: activeMembership.organizationId,
        organization_type: activeMembership.organizationType,
        permissions,
      })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setSubject(authSession.user.id)
        .setIssuer("viruj-auth")
        .setAudience("viruj-central-api")
        .setIssuedAt(now)
        .setExpirationTime(exp)
        .sign(new TextEncoder().encode(env.CENTRAL_API_JWT_SECRET));

      return context.json({
        token,
        expiresAt: new Date(exp * 1000).toISOString(),
      });
    } catch (error) {
      console.error("[Auth] Central API token issue failed:", error);
      return context.json({ error: "Unable to issue central API token." }, 500);
    }
  });
  app.post("/auth/activate-organization", async (context) => {
    try {
      const authSession = await auth.api.getSession({
        headers: context.req.raw.headers,
      });

      if (!authSession?.user) {
        return context.json({ error: "Not authenticated" }, 401);
      }

      const body = await context.req.json().catch(() => ({}));
      const organizationId =
        typeof body.organizationId === "string" ? body.organizationId : "";

      if (!organizationId) {
        return context.json({ error: "Organization ID is required" }, 400);
      }

      const selectedMembership = await db
        .select({
          organizationId: member.organizationId,
          organizationType: organization.organizationType,
        })
        .from(member)
        .innerJoin(organization, eq(member.organizationId, organization.id))
        .where(
          and(
            eq(member.organizationId, organizationId),
            eq(member.userId, authSession.user.id)
          )
        )
        .limit(1)
        .then((memberships) => memberships[0] ?? null);

      if (!selectedMembership) {
        return context.json(
          { error: "You do not belong to this organization" },
          403
        );
      }

      await setSessionActiveOrganization(
        authSession,
        selectedMembership.organizationId
      );

      return context.json({
        id: selectedMembership.organizationId,
        organizationType: selectedMembership.organizationType,
      });
    } catch (error) {
      console.error("[Auth] Organization activation failed:", error);
      return context.json(
        {
          error: "Unable to activate organization.",
        },
        500
      );
    }
  });

  app.post("/auth/bootstrap-organization", async (context) => {
    try {
      const authSession = await auth.api.getSession({
        headers: context.req.raw.headers,
      });

      if (!authSession?.user) {
        return context.json({ error: "Not authenticated" }, 401);
      }

      const body = await context.req.json().catch(() => ({}));
      const requestedType =
        typeof body.organizationType === "string" ? body.organizationType : "";
      const organizationType = organizationTypes.includes(
        requestedType.trim().toLowerCase() as (typeof organizationTypes)[number]
      )
        ? normalizeOrganizationType(requestedType)
        : defaultOrganizationType;

      const name =
        typeof body.name === "string" && body.name.trim()
          ? body.name.trim()
          : "Viruj Health Workspace";
      const requestedSlug =
        typeof body.slug === "string" && body.slug.trim()
          ? body.slug.trim()
          : `viruj-workspace-${randomUUID().slice(0, 8)}`;

      const existingMembership = await findMembership(
        authSession.user.id,
        organizationType
      );
      let selectedOrganization = existingMembership;

      if (!selectedOrganization) {
        selectedOrganization = await db.transaction(async (tx) => {
          // Only a newly inserted organization can grant ownership here.
          const [created] = await tx
            .insert(organization)
            .values({
              id: randomUUID(),
              name,
              organizationType,
              slug: requestedSlug,
            })
            .onConflictDoNothing({ target: organization.slug })
            .returning({
              organizationId: organization.id,
              organizationType: organization.organizationType,
            });

          if (!created) {
            return null;
          }

          await tx.insert(member).values({
            id: randomUUID(),
            organizationId: created.organizationId,
            role: "OWNER",
            userId: authSession.user.id,
          });
          return created;
        });
      }

      if (!selectedOrganization) {
        return context.json(
          { error: "Organization slug is unavailable." },
          409
        );
      }

      await setSessionActiveOrganization(
        authSession,
        selectedOrganization.organizationId
      );

      return context.json({
        id: selectedOrganization.organizationId,
        organizationType: selectedOrganization.organizationType,
      });
    } catch (error) {
      console.error("[Auth] Organization bootstrap failed:", error);
      return context.json(
        {
          error: "Unable to bootstrap organization.",
        },
        500
      );
    }
  });

  app.on(["POST", "GET"], "/auth/*", (context) =>
    auth.handler(context.req.raw)
  );
}

async function setSessionActiveOrganization(
  authSession: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>,
  organizationId: string
) {
  const sessionToken = (
    authSession.session as {
      id?: string;
      token?: string;
    }
  ).token;
  const sessionId = (
    authSession.session as {
      id?: string;
      token?: string;
    }
  ).id;

  if (sessionToken) {
    await db
      .update(session)
      .set({ activeOrganizationId: organizationId })
      .where(eq(session.token, sessionToken));
    return;
  }

  if (sessionId) {
    await db
      .update(session)
      .set({ activeOrganizationId: organizationId })
      .where(
        and(eq(session.id, sessionId), eq(session.userId, authSession.user.id))
      );
  }
}

function findMembership(
  userId: string,
  organizationType?: (typeof organizationTypes)[number]
) {
  return db
    .select({
      organizationId: member.organizationId,
      organizationType: organization.organizationType,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(
      organizationType
        ? and(
            eq(member.userId, userId),
            eq(organization.organizationType, organizationType)
          )
        : eq(member.userId, userId)
    )
    .limit(1)
    .then((memberships) => memberships[0] ?? null);
}
