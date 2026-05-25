import { db } from "@erp_virujhealth/db";
import { auditLogs } from "@erp_virujhealth/db/schema/audit";
import { user } from "@erp_virujhealth/db/schema/auth";
import { desc, eq } from "drizzle-orm";

import { permissionedErpProcedure, requireErpActor } from "../middleware/auth";

export const auditRouter = {
  recent: permissionedErpProcedure({
    audit: ["read"],
  }).handler(async ({ context }) => {
    const actor = requireErpActor(context);

    return db
      .select({
        action: auditLogs.action,
        actorEmail: user.email,
        actorName: user.name,
        actorUserId: auditLogs.actorUserId,
        createdAt: auditLogs.createdAt,
        entityId: auditLogs.entityId,
        entityType: auditLogs.entityType,
        id: auditLogs.id,
        metadata: auditLogs.metadata,
      })
      .from(auditLogs)
      .leftJoin(user, eq(auditLogs.actorUserId, user.id))
      .where(eq(auditLogs.organizationId, actor.organizationId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(50);
  }),
};
