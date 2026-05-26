import { auth, organizationRoleOptions } from "@erp_virujhealth/auth";
import { db } from "@erp_virujhealth/db";
import { invitation, member, organization, user } from "@erp_virujhealth/db/schema/auth";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import z from "zod";

import { recordAuditLog } from "../lib/audit";
import {
  buildStaffLoginUrl,
  generateTemporaryPassword,
  sendStaffCredentialEmail,
} from "../lib/staff-onboarding";
import { permissionedErpProcedure, requireErpActor } from "../middleware/auth";

const inviteStaffInputSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1).optional(),
  role: z.enum(organizationRoleOptions),
});

const updateStaffRoleInputSchema = z.object({
  memberId: z.string().min(1),
  role: z.enum(organizationRoleOptions),
});

const memberIdInputSchema = z.object({
  memberId: z.string().min(1),
});

const invitationIdInputSchema = z.object({
  invitationId: z.string().min(1),
});

const invitationTtlMs = 7 * 24 * 60 * 60 * 1000;

export const staffRouter = {
  listMembers: permissionedErpProcedure({
    member: ["read"],
  }).handler(async ({ context }) => {
    const actor = requireErpActor(context);

    return db
      .select({
        createdAt: member.createdAt,
        email: user.email,
        emailVerified: user.emailVerified,
        id: member.id,
        image: user.image,
        name: user.name,
        role: member.role,
        status: user.emailVerified,
        userId: user.id,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, actor.organizationId))
      .orderBy(desc(member.createdAt));
  }),

  listInvitations: permissionedErpProcedure({
    invitation: ["read"],
  }).handler(async ({ context }) => {
    const actor = requireErpActor(context);

    return db
      .select({
        createdAt: invitation.createdAt,
        email: invitation.email,
        expiresAt: invitation.expiresAt,
        id: invitation.id,
        role: invitation.role,
        status: invitation.status,
      })
      .from(invitation)
      .where(eq(invitation.organizationId, actor.organizationId))
      .orderBy(desc(invitation.createdAt));
  }),

  invite: permissionedErpProcedure({
    invitation: ["create"],
  })
    .input(inviteStaffInputSchema)
    .handler(async ({ context, input }) => {
      const actor = requireErpActor(context);
      const email = input.email.toLowerCase();
      const displayName = input.name?.trim() || email.split("@")[0] || "Staff";

      const [existingUser] = await db
        .select({ id: user.id, name: user.name })
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      if (existingUser) {
        const [existingMember] = await db
          .select({ id: member.id })
          .from(member)
          .where(
            and(
              eq(member.organizationId, actor.organizationId),
              eq(member.userId, existingUser.id)
            )
          )
          .limit(1);

        if (existingMember) {
          throw new ORPCError("CONFLICT", {
            message: "This user is already a staff member.",
          });
        }
      }

      const [existingInvitation] = await db
        .select({
          email: invitation.email,
          expiresAt: invitation.expiresAt,
          id: invitation.id,
          role: invitation.role,
          status: invitation.status,
        })
        .from(invitation)
        .where(
          and(
            eq(invitation.organizationId, actor.organizationId),
            eq(invitation.email, email),
            eq(invitation.status, "pending"),
            gt(invitation.expiresAt, new Date())
          )
        )
        .limit(1);

      if (existingInvitation) {
        return existingInvitation;
      }

      const [actorOrganization] = await db
        .select({
          id: organization.id,
          name: organization.name,
          organizationType: organization.organizationType,
        })
        .from(organization)
        .where(eq(organization.id, actor.organizationId))
        .limit(1);

      if (!actorOrganization) {
        throw new ORPCError("NOT_FOUND", {
          message: "Active organization was not found.",
        });
      }

      const temporaryPassword = existingUser
        ? null
        : generateTemporaryPassword();
      const staffUser =
        existingUser ??
        (await createStaffAuthUser({
          email,
          name: displayName,
          password: temporaryPassword!,
        }));

      return db.transaction(async (tx) => {
        const expiresAt = new Date(Date.now() + invitationTtlMs);
        const [createdInvitation] = await tx
          .insert(invitation)
          .values({
            email,
            expiresAt,
            id: randomUUID(),
            inviterId: actor.userId,
            organizationId: actor.organizationId,
            role: input.role,
            status: "accepted",
          })
          .returning({
            email: invitation.email,
            expiresAt: invitation.expiresAt,
            id: invitation.id,
            role: invitation.role,
            status: invitation.status,
          });

        if (!createdInvitation) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Unable to create staff invitation.",
          });
        }

        const [createdMember] = await tx
          .insert(member)
          .values({
            id: randomUUID(),
            organizationId: actor.organizationId,
            role: input.role,
            userId: staffUser.id,
          })
          .onConflictDoNothing()
          .returning({
            id: member.id,
          });

        if (!createdMember) {
          throw new ORPCError("CONFLICT", {
            message: "This user is already a staff member.",
          });
        }

        await recordAuditLog({
          action: "STAFF_INVITED",
          actor,
          db: tx,
          entityId: createdInvitation.id,
          entityType: "StaffInvitation",
          metadata: {
            email,
            role: input.role,
          },
        });

        const loginUrl = buildStaffLoginUrl(
          actorOrganization.organizationType,
          input.role
        );
        const credentialEmail = temporaryPassword
          ? await sendStaffCredentialEmail({
              email,
              loginUrl,
              name: displayName,
              organizationName: actorOrganization.name,
              password: temporaryPassword,
              role: input.role,
            })
          : null;

        return {
          ...createdInvitation,
          onboarding: {
            emailSent: Boolean(credentialEmail),
            loginUrl,
            temporaryCredentials: temporaryPassword
              ? {
                  email,
                  password: temporaryPassword,
                }
              : null,
          },
        };
      });
    }),

  updateRole: permissionedErpProcedure({
    member: ["update"],
  })
    .input(updateStaffRoleInputSchema)
    .handler(async ({ context, input }) => {
      const actor = requireErpActor(context);

      return db.transaction(async (tx) => {
        const [targetMember] = await tx
          .select({
            id: member.id,
            role: member.role,
            userId: member.userId,
          })
          .from(member)
          .where(
            and(
              eq(member.id, input.memberId),
              eq(member.organizationId, actor.organizationId)
            )
          )
          .limit(1);

        if (!targetMember) {
          throw new ORPCError("NOT_FOUND", {
            message: "Staff member not found.",
          });
        }

        if (targetMember.userId === actor.userId) {
          throw new ORPCError("FORBIDDEN", {
            message: "You cannot change your own ERP role.",
          });
        }

        const [updatedMember] = await tx
          .update(member)
          .set({ role: input.role })
          .where(
            and(
              eq(member.id, input.memberId),
              eq(member.organizationId, actor.organizationId)
            )
          )
          .returning({
            id: member.id,
            organizationId: member.organizationId,
            role: member.role,
            userId: member.userId,
          });

        if (!updatedMember) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Unable to update staff role.",
          });
        }

        await recordAuditLog({
          action: "STAFF_ROLE_UPDATED",
          actor,
          db: tx,
          entityId: updatedMember.id,
          entityType: "OrganizationMember",
          metadata: {
            fromRole: targetMember.role,
            targetUserId: targetMember.userId,
            toRole: input.role,
          },
        });

        return updatedMember;
      });
    }),

  remove: permissionedErpProcedure({
    member: ["delete"],
  })
    .input(memberIdInputSchema)
    .handler(async ({ context, input }) => {
      const actor = requireErpActor(context);

      return db.transaction(async (tx) => {
        const [targetMember] = await tx
          .select({
            id: member.id,
            role: member.role,
            userId: member.userId,
          })
          .from(member)
          .where(
            and(
              eq(member.id, input.memberId),
              eq(member.organizationId, actor.organizationId)
            )
          )
          .limit(1);

        if (!targetMember) {
          throw new ORPCError("NOT_FOUND", {
            message: "Staff member not found.",
          });
        }

        if (targetMember.userId === actor.userId) {
          throw new ORPCError("FORBIDDEN", {
            message: "You cannot remove your own staff access.",
          });
        }

        await tx
          .delete(member)
          .where(
            and(
              eq(member.id, input.memberId),
              eq(member.organizationId, actor.organizationId)
            )
          );

        await recordAuditLog({
          action: "STAFF_REMOVED",
          actor,
          db: tx,
          entityId: targetMember.id,
          entityType: "OrganizationMember",
          metadata: {
            role: targetMember.role,
            targetUserId: targetMember.userId,
          },
        });

        return { success: true };
      });
    }),

  cancelInvitation: permissionedErpProcedure({
    invitation: ["cancel"],
  })
    .input(invitationIdInputSchema)
    .handler(async ({ context, input }) => {
      const actor = requireErpActor(context);

      return db.transaction(async (tx) => {
        const [targetInvitation] = await tx
          .select({
            email: invitation.email,
            id: invitation.id,
            role: invitation.role,
            status: invitation.status,
          })
          .from(invitation)
          .where(
            and(
              eq(invitation.id, input.invitationId),
              eq(invitation.organizationId, actor.organizationId)
            )
          )
          .limit(1);

        if (!targetInvitation) {
          throw new ORPCError("NOT_FOUND", {
            message: "Invitation not found.",
          });
        }

        const [updatedInvitation] = await tx
          .update(invitation)
          .set({ status: "cancelled" })
          .where(
            and(
              eq(invitation.id, input.invitationId),
              eq(invitation.organizationId, actor.organizationId)
            )
          )
          .returning({
            email: invitation.email,
            id: invitation.id,
            role: invitation.role,
            status: invitation.status,
          });

        if (!updatedInvitation) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Unable to cancel invitation.",
          });
        }

        await recordAuditLog({
          action: "STAFF_INVITATION_CANCELLED",
          actor,
          db: tx,
          entityId: targetInvitation.id,
          entityType: "StaffInvitation",
          metadata: {
            email: targetInvitation.email,
            fromStatus: targetInvitation.status,
            role: targetInvitation.role,
            toStatus: "cancelled",
          },
        });

        return updatedInvitation;
      });
    }),
};

async function createStaffAuthUser({
  email,
  name,
  password,
}: {
  email: string;
  name: string;
  password: string;
}) {
  const result = (await auth.api.signUpEmail({
    body: {
      email,
      name,
      password,
      rememberMe: false,
    },
  })) as {
    user?: {
      id: string;
    };
  };

  if (!result.user?.id) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Unable to create staff login account.",
    });
  }

  await db
    .update(user)
    .set({ emailVerified: true })
    .where(eq(user.id, result.user.id));

  return {
    id: result.user.id,
    name,
  };
}
