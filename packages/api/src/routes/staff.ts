import { auth, organizationRoleOptions } from "@erp_virujhealth/auth";
import { db } from "@erp_virujhealth/db";
import {
  account,
  invitation,
  member,
  organization,
  user,
} from "@erp_virujhealth/db/schema/auth";
import { hashPassword } from "better-auth/crypto";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import z from "zod";

import { recordAuditLog } from "../lib/audit";
import {
  buildStaffConfirmationUrl,
  buildStaffLoginUrl,
  generateTemporaryPassword,
  sendStaffCredentialEmail,
} from "../lib/staff-onboarding";
import {
  permissionedErpProcedure,
  publicProcedure,
  requireErpActor,
} from "../middleware/auth";

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

      let existingMember: { id: string } | undefined;

      if (existingUser) {
        [existingMember] = await db
          .select({ id: member.id })
          .from(member)
          .where(
            and(
              eq(member.organizationId, actor.organizationId),
              eq(member.userId, existingUser.id)
            )
          )
          .limit(1);
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
        const temporaryPassword = generateTemporaryPassword();
        const staffUser =
          existingUser ??
          (await createStaffAuthUser({
            email,
            name: displayName,
            password: temporaryPassword,
          }));

        await setStaffTemporaryPassword(staffUser.id, temporaryPassword);
        await db
          .update(user)
          .set({ emailVerified: false })
          .where(eq(user.id, staffUser.id));

        await db
          .update(invitation)
          .set({
            expiresAt: new Date(Date.now() + invitationTtlMs),
            role: input.role,
          })
          .where(eq(invitation.id, existingInvitation.id));

        if (existingMember) {
          await db
            .update(member)
            .set({ role: input.role })
            .where(eq(member.id, existingMember.id));
        }

        const loginUrl = buildStaffLoginUrl(
          actorOrganization.organizationType,
          input.role
        );
        const confirmationUrl = buildStaffConfirmationUrl(
          existingInvitation.id
        );
        const credentialEmail = await sendStaffCredentialEmail({
          confirmationUrl,
          email,
          loginUrl,
          name: displayName,
          organizationName: actorOrganization.name,
          password: temporaryPassword,
          role: input.role,
        });

        return {
          ...existingInvitation,
          role: input.role,
          onboarding: {
            confirmationUrl,
            emailSent: Boolean(credentialEmail),
            loginUrl,
            temporaryCredentials: {
              email,
              password: temporaryPassword,
            },
          },
        };
      }

      const temporaryPassword = generateTemporaryPassword();
      const staffUser =
        existingUser ??
        (await createStaffAuthUser({
          email,
          name: displayName,
          password: temporaryPassword!,
        }));

      if (existingUser) {
        await setStaffTemporaryPassword(existingUser.id, temporaryPassword);
        await db
          .update(user)
          .set({ emailVerified: false })
          .where(eq(user.id, existingUser.id));
      }

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
            status: "pending",
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

        if (existingMember) {
          await tx
            .update(member)
            .set({ role: input.role })
            .where(eq(member.id, existingMember.id));
        } else {
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
        const confirmationUrl = buildStaffConfirmationUrl(createdInvitation.id);
        const credentialEmail = await sendStaffCredentialEmail({
          confirmationUrl,
          email,
          loginUrl,
          name: displayName,
          organizationName: actorOrganization.name,
          password: temporaryPassword,
          role: input.role,
        });

        return {
          ...createdInvitation,
          onboarding: {
            confirmationUrl,
            emailSent: Boolean(credentialEmail),
            loginUrl,
            temporaryCredentials: {
              email,
              password: temporaryPassword,
            },
          },
        };
      });
    }),

  confirmInvitation: publicProcedure
    .input(invitationIdInputSchema)
    .handler(async ({ input }) => {
      return db.transaction(async (tx) => {
        const [targetInvitation] = await tx
          .select({
            email: invitation.email,
            expiresAt: invitation.expiresAt,
            id: invitation.id,
            organizationId: invitation.organizationId,
            organizationType: organization.organizationType,
            role: invitation.role,
            status: invitation.status,
          })
          .from(invitation)
          .innerJoin(organization, eq(invitation.organizationId, organization.id))
          .where(eq(invitation.id, input.invitationId))
          .limit(1);

        if (!targetInvitation) {
          throw new ORPCError("NOT_FOUND", {
            message: "This staff confirmation link is invalid.",
          });
        }

        const loginUrl = buildStaffLoginUrl(
          targetInvitation.organizationType,
          targetInvitation.role
        );

        if (targetInvitation.status === "accepted") {
          return {
            email: targetInvitation.email,
            loginUrl,
            role: targetInvitation.role,
            status: "accepted",
          };
        }

        if (targetInvitation.status !== "pending") {
          throw new ORPCError("BAD_REQUEST", {
            message: "This staff confirmation link is no longer active.",
          });
        }

        if (
          targetInvitation.expiresAt &&
          targetInvitation.expiresAt.getTime() < Date.now()
        ) {
          throw new ORPCError("BAD_REQUEST", {
            message: "This staff confirmation link has expired.",
          });
        }

        const [staffUser] = await tx
          .select({ id: user.id })
          .from(user)
          .where(eq(user.email, targetInvitation.email))
          .limit(1);

        if (!staffUser) {
          throw new ORPCError("NOT_FOUND", {
            message: "The staff login account was not found.",
          });
        }

        await tx
          .update(invitation)
          .set({ status: "accepted" })
          .where(eq(invitation.id, targetInvitation.id));

        await tx
          .update(user)
          .set({ emailVerified: true })
          .where(eq(user.id, staffUser.id));

        return {
          email: targetInvitation.email,
          loginUrl,
          role: targetInvitation.role,
          status: "accepted",
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

  return {
    id: result.user.id,
    name,
  };
}

async function setStaffTemporaryPassword(userId: string, password: string) {
  const hashedPassword = await hashPassword(password);
  const [updatedAccount] = await db
    .update(account)
    .set({ password: hashedPassword })
    .where(
      and(eq(account.userId, userId), eq(account.providerId, "credential"))
    )
    .returning({
      id: account.id,
    });

  if (updatedAccount) {
    return;
  }

  await db.insert(account).values({
    accountId: userId,
    id: randomUUID(),
    password: hashedPassword,
    providerId: "credential",
    userId,
  });
}
