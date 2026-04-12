import { db } from "@erp_virujhealth/db";
import { user, member, organization } from "@erp_virujhealth/db/schema/auth";
import { createDevtoolsIntegration, defineDevtoolsConfig } from "better-auth-devtools/plugin";
import { eq } from "drizzle-orm";
import { generateId } from "better-auth";

const devtoolsConfig = defineDevtoolsConfig({
  templates: {
    owner: { label: "Owner", meta: { role: "owner" } },
    admin: { label: "Admin", meta: { role: "admin" } },
    doctor: { label: "Doctor", meta: { role: "doctor" } },
    manager: { label: "Manager", meta: { role: "manager" } },
    receptionist: { label: "Receptionist", meta: { role: "receptionist" } },
    billing: { label: "Billing", meta: { role: "billing" } },
    lab_tech: { label: "Lab Tech", meta: { role: "lab_tech" } },
  },
  editableFields: [
    {
      key: "role",
      label: "Role",
      type: "select",
      options: [
        "owner",
        "admin",
        "doctor",
        "manager",
        "receptionist",
        "billing",
        "lab_tech",
      ],
    },
  ],
  async createManagedUser(args) {
    // Check or create test organization
    let org = await db.query.organization.findFirst({
      where: eq(organization.slug, "test-org"),
    });

    if (!org) {
      const orgId = generateId();
      await db.insert(organization).values({
        id: orgId,
        name: "Test Organization",
        slug: "test-org",
        organizationType: "clinic",
      });
      org = await db.query.organization.findFirst({
        where: eq(organization.id, orgId),
      });
    }

    // Create user
    const userId = generateId();
    await db.insert(user).values({
      id: userId,
      email: args.email,
      name: args.template.label,
    });

    // Create member mapping
    if (org) {
      await db.insert(member).values({
        id: generateId(),
        organizationId: org.id,
        userId: userId,
        role: String(args.template.meta?.role ?? "receptionist"),
      });
    }

    return {
      userId: userId,
      email: args.email,
      label: args.template.label,
    };
  },
  async getSessionView(args) {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, args.userId),
    });

    const existingMember = await db.query.member.findFirst({
      where: eq(member.userId, args.userId),
    });

    return {
      userId: args.userId,
      email: existingUser?.email,
      label: existingUser?.name,
      fields: {
        sessionId: args.sessionId,
        role: existingMember?.role ?? "No Role",
      },
      editableFields: ["role"],
    };
  },
  async patchSession(args) {
    if (args.patch.role) {
      await db
        .update(member)
        .set({ role: String(args.patch.role) })
        .where(eq(member.userId, args.userId));
    }

    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, args.userId),
    });

    const existingMember = await db.query.member.findFirst({
      where: eq(member.userId, args.userId),
    });

    return {
      userId: args.userId,
      email: existingUser?.email,
      label: existingUser?.name,
      fields: {
        sessionId: args.sessionId,
        role: existingMember?.role ?? "No Role",
      },
      editableFields: ["role"],
    };
  },
});

export const devtools = createDevtoolsIntegration(devtoolsConfig);
export type DevtoolsConfig = typeof devtoolsConfig;
