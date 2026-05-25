import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth";

export const auditActions = [
  "STAFF_INVITED",
  "STAFF_INVITATION_CANCELLED",
  "STAFF_REMOVED",
  "STAFF_ROLE_UPDATED",
  "APPOINTMENT_STATUS_UPDATED",
] as const;

export type AuditAction = (typeof auditActions)[number];

export const auditActionEnum = pgEnum("audit_action", auditActions);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    actorUserId: text("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    action: auditActionEnum("action").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_logs_organization_created_at_idx").on(
      table.organizationId,
      table.createdAt
    ),
    index("audit_logs_organization_action_idx").on(
      table.organizationId,
      table.action
    ),
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
  ]
);
