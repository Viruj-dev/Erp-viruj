import { PATIENT_ROLE } from "@erp_virujhealth/auth";
import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next();
});

export const protectedProcedure = publicProcedure.use(requireAuth);

const requireErpAccess = o.middleware(async ({ context, next }) => {
  const session = context.session;

  if (!session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  if ((session.user as unknown as { role: string }).role === PATIENT_ROLE) {
    throw new ORPCError("FORBIDDEN", {
      message: "Patient users cannot access ERP routes.",
    });
  }

  return next();
});

export const erpProcedure = protectedProcedure.use(requireErpAccess);

export * from "./routers/index";
