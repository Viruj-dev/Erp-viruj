import { hasOrganizationPermission } from "@erp_virujhealth/auth";
import { ORPCError, os } from "@orpc/server";

import type { Context, ErpActor } from "../context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next();
});

const requireOrganizationMembership = o.middleware(
  async ({ context, next }) => {
    const session = context.session;

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    if (!context.actor) {
      throw new ORPCError("FORBIDDEN", {
        message:
          "An active organization membership is required for ERP routes.",
      });
    }

    return next();
  }
);

export const protectedProcedure = publicProcedure.use(requireAuth);

export const erpProcedure = protectedProcedure.use(
  requireOrganizationMembership
);

export const permissionedErpProcedure = (
  permissions: Parameters<typeof hasOrganizationPermission>[1]
) =>
  erpProcedure.use(async ({ context, next }) => {
    const memberRole = context.actor?.role;

    if (!memberRole || !hasOrganizationPermission(memberRole, permissions)) {
      throw new ORPCError("FORBIDDEN", {
        message:
          "Your organization role does not have permission for this action.",
      });
    }

    return next();
  });

export function requireErpActor(context: Context): ErpActor {
  if (!context.actor) {
    throw new ORPCError("FORBIDDEN", {
      message: "An active organization actor is required for ERP routes.",
    });
  }

  return context.actor;
}
