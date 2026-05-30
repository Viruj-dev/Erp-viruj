import { auth } from "@erp_virujhealth/auth";
import { db } from "@erp_virujhealth/db";
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

const defaultOrganizationType = "hospital";

export function registerAuthRoutes(app: Hono) {
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
        const existingOrganization = await db
          .select({
            organizationId: organization.id,
            organizationType: organization.organizationType,
          })
          .from(organization)
          .where(eq(organization.slug, requestedSlug))
          .limit(1)
          .then((organizations) => organizations[0] ?? null);

        selectedOrganization =
          existingOrganization ?? {
            organizationId: randomUUID(),
            organizationType,
          };

        if (!existingOrganization) {
          await db
            .insert(organization)
            .values({
              id: selectedOrganization.organizationId,
              name,
              organizationType,
              slug: requestedSlug,
            })
            .onConflictDoNothing();
        }

        await db
          .insert(member)
          .values({
            id: randomUUID(),
            organizationId: selectedOrganization.organizationId,
            role: "OWNER",
            userId: authSession.user.id,
          })
          .onConflictDoNothing();

        selectedOrganization =
          (await findMembership(authSession.user.id, organizationType)) ??
          selectedOrganization;
      }

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
          .set({ activeOrganizationId: selectedOrganization.organizationId })
          .where(eq(session.token, sessionToken));
      } else if (sessionId) {
        await db
          .update(session)
          .set({ activeOrganizationId: selectedOrganization.organizationId })
          .where(
            and(
              eq(session.id, sessionId),
              eq(session.userId, authSession.user.id)
            )
          );
      }

      return context.json({
        id: selectedOrganization.organizationId,
        organizationType: selectedOrganization.organizationType,
      });
    } catch (error) {
      console.error("[Auth] Organization bootstrap failed:", error);
      return context.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to bootstrap organization.",
        },
        500
      );
    }
  });

  app.on(["POST", "GET"], "/auth/*", (context) => auth.handler(context.req.raw));
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
