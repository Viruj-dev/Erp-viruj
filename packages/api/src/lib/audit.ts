import { auditLogs, type AuditAction } from "@erp_virujhealth/db/schema/audit";
import { randomUUID } from "node:crypto";

import type { ErpActor } from "../context";

type AuditDatabase = {
  insert: (table: typeof auditLogs) => {
    values: (value: typeof auditLogs.$inferInsert) => Promise<unknown>;
  };
};

export async function recordAuditLog({
  action,
  actor,
  db,
  entityId,
  entityType,
  metadata,
}: {
  action: AuditAction;
  actor: ErpActor;
  db: AuditDatabase;
  entityId?: string | null;
  entityType?: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(auditLogs).values({
    action,
    actorUserId: actor.userId,
    entityId: entityId ?? null,
    entityType: entityType ?? null,
    id: randomUUID(),
    metadata: metadata ?? null,
    organizationId: actor.organizationId,
  });
}
