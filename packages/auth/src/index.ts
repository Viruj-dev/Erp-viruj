import { db } from "@erp_virujhealth/db";
import * as schema from "@erp_virujhealth/db/schema/auth";
import { env } from "@erp_virujhealth/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { and, eq } from "drizzle-orm";
import {
  createAccessControl,
  customSession,
  organization,
} from "better-auth/plugins";
import { devtools } from "./devtools";
import { z } from "zod";

export {
  organizationTypes,
  type OrganizationType,
} from "@erp_virujhealth/db/schema/auth";

export const erpStatements = {
  appointment: ["read", "update"] as const,
  invitation: ["read", "create", "cancel"] as const,
  member: ["read", "create", "update", "delete"] as const,
  organization: ["read", "update", "delete"] as const,
  project: ["read", "create", "update", "delete"] as const,
} as const;

const accessControl = createAccessControl(erpStatements);

export const organizationRoles = {
  admin: accessControl.newRole({
    appointment: ["read", "update"],
    invitation: ["read", "create", "cancel"],
    member: ["read", "create", "update", "delete"],
    organization: ["read", "update"],
    project: ["read", "create", "update", "delete"],
  }),
  billing: accessControl.newRole({
    appointment: ["read"],
    organization: ["read"],
    project: ["read"],
  }),
  doctor: accessControl.newRole({
    appointment: ["read", "update"],
    member: ["read"],
    organization: ["read"],
    project: ["read", "create", "update"],
  }),
  lab_tech: accessControl.newRole({
    appointment: ["read", "update"],
    organization: ["read"],
    project: ["read"],
  }),
  manager: accessControl.newRole({
    appointment: ["read", "update"],
    invitation: ["read", "create", "cancel"],
    member: ["read", "create", "update"],
    organization: ["read", "update"],
    project: ["read", "create", "update", "delete"],
  }),
  owner: accessControl.newRole({
    appointment: ["read", "update"],
    invitation: ["read", "create", "cancel"],
    member: ["read", "create", "update", "delete"],
    organization: ["read", "update", "delete"],
    project: ["read", "create", "update", "delete"],
  }),
  receptionist: accessControl.newRole({
    appointment: ["read", "update"],
    invitation: ["read"],
    member: ["read"],
    organization: ["read"],
    project: ["read", "create"],
  }),
} as const;

export type OrganizationMemberRole = keyof typeof organizationRoles;
export type ErpPermissionRequest = Partial<{
  [Key in keyof typeof erpStatements]: Array<
    (typeof erpStatements)[Key][number]
  >;
}>;

const organizationTypeSchema = z.enum(schema.organizationTypes);

export const hasOrganizationPermission = (
  role: string,
  permissions: ErpPermissionRequest
) => {
  const definition = organizationRoles[role as OrganizationMemberRole];

  if (!definition) {
    return false;
  }

  const authorize = definition.authorize as (request: ErpPermissionRequest) => {
    success: boolean;
  };

  return authorize(permissions).success;
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
    },
  },
  plugins: [
    devtools.serverPlugin,
    organization({
      ac: accessControl,
      allowUserToCreateOrganization: true,
      creatorRole: "owner",
      invitationLimit: 250,
      membershipLimit: 500,
      requireEmailVerificationOnInvitation: false,
      roles: organizationRoles,
      schema: {
        organization: {
          additionalFields: {
            organizationType: {
              type: "string",
              input: true,
              required: true,
              returned: true,
              fieldName: "organization_type",
              validator: {
                input: organizationTypeSchema,
                output: organizationTypeSchema,
              },
            },
          },
        },
      },
    }),
    customSession(async ({ session, user }) => {
      try {
        const activeOrganizationId = (
          session as {
            activeOrganizationId?: string | null;
          }
        ).activeOrganizationId;

        if (!activeOrganizationId) {
          return {
            activeMember: null,
            activeOrganization: null,
            session,
            user,
          };
        }

        const [membership] = await db
          .select({
            createdAt: schema.member.createdAt,
            id: schema.member.id,
            organizationId: schema.member.organizationId,
            role: schema.member.role,
            userId: schema.member.userId,
            organization: {
              createdAt: schema.organization.createdAt,
              id: schema.organization.id,
              logo: schema.organization.logo,
              metadata: schema.organization.metadata,
              name: schema.organization.name,
              organizationType: schema.organization.organizationType,
              slug: schema.organization.slug,
              updatedAt: schema.organization.updatedAt,
            },
          })
          .from(schema.member)
          .leftJoin(
            schema.organization,
            eq(schema.member.organizationId, schema.organization.id)
          )
          .where(
            and(
              eq(schema.member.organizationId, activeOrganizationId),
              eq(schema.member.userId, user.id)
            )
          )
          .limit(1);

        return {
          activeMember: membership
            ? {
                createdAt: membership.createdAt,
                id: membership.id,
                organizationId: membership.organizationId,
                role: membership.role,
                userId: membership.userId,
              }
            : null,
          activeOrganization: membership?.organization?.id
            ? {
                createdAt: membership.organization.createdAt!,
                id: membership.organization.id,
                logo: membership.organization.logo,
                metadata: membership.organization.metadata,
                name: membership.organization.name!,
                organizationType: membership.organization.organizationType!,
                slug: membership.organization.slug!,
                updatedAt: membership.organization.updatedAt!,
              }
            : null,
          session,
          user,
        };
      } catch (error) {
        console.error("[Auth] Error in customSession:", error);
        return {
          activeMember: null,
          activeOrganization: null,
          session,
          user,
        };
      }
    }),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
