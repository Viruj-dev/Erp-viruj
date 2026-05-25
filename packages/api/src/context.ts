import type { Context as HonoContext } from "hono";

import {
  auth,
  normalizeOrganizationMemberRole,
  type OrganizationType,
} from "@erp_virujhealth/auth";

export type CreateContextOptions = {
  context: HonoContext;
};

export type ErpActor = {
  organizationId: string;
  organizationType: OrganizationType;
  userId: string;
  role: NonNullable<ReturnType<typeof normalizeOrganizationMemberRole>>;
  memberId: string;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  return {
    actor: buildErpActor(session),
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

function buildErpActor(session: Awaited<ReturnType<typeof auth.api.getSession>>) {
  const activeOrganization = session?.activeOrganization;
  const activeMember = session?.activeMember;
  const normalizedRole = activeMember?.role
    ? normalizeOrganizationMemberRole(activeMember.role)
    : null;

  if (
    !session?.user?.id ||
    !activeOrganization?.id ||
    !activeOrganization.organizationType ||
    !activeMember?.id ||
    !normalizedRole
  ) {
    return null;
  }

  return {
    memberId: activeMember.id,
    organizationId: activeOrganization.id,
    organizationType: activeOrganization.organizationType,
    role: normalizedRole,
    userId: session.user.id,
  } satisfies ErpActor;
}
