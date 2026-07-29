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
import {
  type ErpOrganizationRole,
  type OrganizationMemberRole,
  normalizeOrganizationMemberRole,
} from "./roles";
import { networkInterfaces } from "node:os";
import { z } from "zod";

export {
  organizationTypes,
  type OrganizationType,
} from "@erp_virujhealth/db/schema/auth";
export {
  organizationRoleOptions,
  organizationRoleSchema,
  normalizeOrganizationMemberRole,
  type ErpOrganizationRole,
  type OrganizationMemberRole,
} from "./roles";

export const erpStatements = {
  audit: ["read"] as const,
  appointment: ["read", "update", "manage"] as const,
  billing: ["read", "manage"] as const,
  billingInvoices: ["read", "download"] as const,
  billingPaymentMethods: ["read", "manage"] as const,
  billingProfile: ["read", "update"] as const,
  billingRefunds: ["read"] as const,
  billingTransactions: ["read"] as const,
  community: ["read", "manage"] as const,
  consultation: ["read", "create", "update", "manage"] as const,
  doctorDirectory: ["read", "manage"] as const,
  facility: [
    "read",
    "create",
    "update",
    "delete",
    "publish",
    "archive",
  ] as const,
  invitation: ["read", "create", "cancel"] as const,
  hospitalSettings: ["read", "update"] as const,
  member: ["read", "create", "update", "delete"] as const,
  organization: ["read", "update", "delete"] as const,
  patient: ["read"] as const,
  prescription: ["read", "create", "manage"] as const,
  project: ["read", "create", "update", "delete"] as const,
  schedule: ["read", "manage"] as const,
  subscription: ["read", "change_plan", "cancel", "reactivate"] as const,
} as const;

const accessControl = createAccessControl(erpStatements);

export const organizationRoles = {
  OWNER: accessControl.newRole({
    audit: ["read"],
    appointment: ["read", "update", "manage"],
    billing: ["read", "manage"],
    billingInvoices: ["read", "download"],
    billingPaymentMethods: ["read", "manage"],
    billingProfile: ["read", "update"],
    billingRefunds: ["read"],
    billingTransactions: ["read"],
    subscription: ["read", "change_plan", "cancel", "reactivate"],
    community: ["read", "manage"],
    consultation: ["read", "create", "update", "manage"],
    doctorDirectory: ["read", "manage"],
    facility: ["read", "create", "update", "delete", "publish", "archive"],
    invitation: ["read", "create", "cancel"],
    hospitalSettings: ["read", "update"],
    member: ["read", "create", "update", "delete"],
    organization: ["read", "update", "delete"],
    patient: ["read"],
    prescription: ["read", "create", "manage"],
    project: ["read", "create", "update", "delete"],
    schedule: ["read", "manage"],
  }),
  CLINIC_OWNER: accessControl.newRole({
    audit: ["read"],
    appointment: ["read", "update", "manage"],
    billing: ["read", "manage"],
    billingInvoices: ["read", "download"],
    billingPaymentMethods: ["read", "manage"],
    billingProfile: ["read", "update"],
    billingRefunds: ["read"],
    billingTransactions: ["read"],
    subscription: ["read", "change_plan", "cancel", "reactivate"],
    community: ["read", "manage"],
    consultation: ["read", "create", "update", "manage"],
    doctorDirectory: ["read", "manage"],
    facility: ["read", "create", "update", "delete", "publish", "archive"],
    invitation: ["read", "create", "cancel"],
    hospitalSettings: ["read", "update"],
    member: ["read", "create", "update", "delete"],
    organization: ["read", "update", "delete"],
    patient: ["read"],
    prescription: ["read", "create", "manage"],
    project: ["read", "create", "update", "delete"],
    schedule: ["read", "manage"],
  }),
  ADMIN: accessControl.newRole({
    audit: ["read"],
    appointment: ["read", "update", "manage"],
    billing: ["read", "manage"],
    billingInvoices: ["read", "download"],
    billingPaymentMethods: ["read", "manage"],
    billingProfile: ["read", "update"],
    billingRefunds: ["read"],
    billingTransactions: ["read"],
    subscription: ["read", "change_plan", "cancel", "reactivate"],
    community: ["read", "manage"],
    consultation: ["read", "create", "update", "manage"],
    doctorDirectory: ["read", "manage"],
    facility: ["read", "create", "update", "delete", "publish", "archive"],
    invitation: ["read", "create", "cancel"],
    hospitalSettings: ["read", "update"],
    member: ["read", "create", "update", "delete"],
    organization: ["read", "update"],
    patient: ["read"],
    prescription: ["read", "create", "manage"],
    project: ["read", "create", "update", "delete"],
    schedule: ["read", "manage"],
  }),
  CLINIC_ADMIN: accessControl.newRole({
    audit: ["read"],
    appointment: ["read", "update", "manage"],
    billing: ["read", "manage"],
    billingInvoices: ["read", "download"],
    billingPaymentMethods: ["read", "manage"],
    billingProfile: ["read", "update"],
    billingRefunds: ["read"],
    billingTransactions: ["read"],
    subscription: ["read", "change_plan", "cancel", "reactivate"],
    community: ["read", "manage"],
    consultation: ["read", "create", "update", "manage"],
    doctorDirectory: ["read", "manage"],
    facility: ["read", "create", "update", "delete", "publish", "archive"],
    invitation: ["read", "create", "cancel"],
    hospitalSettings: ["read", "update"],
    member: ["read", "create", "update", "delete"],
    organization: ["read", "update"],
    patient: ["read"],
    prescription: ["read", "create", "manage"],
    project: ["read", "create", "update", "delete"],
    schedule: ["read", "manage"],
  }),
  MANAGER: accessControl.newRole({
    audit: ["read"],
    appointment: ["read", "update", "manage"],
    billing: ["read", "manage"],
    billingInvoices: ["read", "download"],
    billingPaymentMethods: ["read", "manage"],
    billingProfile: ["read", "update"],
    billingRefunds: ["read"],
    billingTransactions: ["read"],
    subscription: ["read", "change_plan", "cancel", "reactivate"],
    community: ["read", "manage"],
    consultation: ["read", "create", "update"],
    doctorDirectory: ["read", "manage"],
    facility: ["read", "create", "update", "delete", "publish", "archive"],
    invitation: ["read", "create", "cancel"],
    member: ["read", "create", "update"],
    organization: ["read"],
    patient: ["read"],
    prescription: ["read", "create"],
    project: ["read", "create", "update", "delete"],
    schedule: ["read", "manage"],
  }),
  DOCTOR: accessControl.newRole({
    appointment: ["read", "update", "manage"],
    consultation: ["read", "create", "update", "manage"],
    doctorDirectory: ["read"],
    facility: ["read"],
    organization: ["read"],
    patient: ["read"],
    prescription: ["read", "create", "manage"],
    project: ["read"],
    schedule: ["read", "manage"],
  }),
  STAFF: accessControl.newRole({
    appointment: ["read", "update"],
    community: ["read"],
    doctorDirectory: ["read"],
    facility: ["read"],
    organization: ["read"],
    patient: ["read"],
    project: ["read"],
    schedule: ["read"],
  }),
  CLINIC_STAFF: accessControl.newRole({
    appointment: ["read", "update"],
    community: ["read"],
    doctorDirectory: ["read"],
    facility: ["read"],
    organization: ["read"],
    patient: ["read"],
    project: ["read"],
    schedule: ["read"],
  }),
  RECEPTIONIST: accessControl.newRole({
    appointment: ["read", "update", "manage"],
    doctorDirectory: ["read"],
    facility: ["read"],
    organization: ["read", "update"],
    patient: ["read"],
    project: ["read", "create"],
    schedule: ["read", "manage"],
  }),
  TECHNICIAN: accessControl.newRole({
    appointment: ["read", "update"],
    organization: ["read"],
    patient: ["read"],
    project: ["read"],
  }),
  ORG_ADMIN: accessControl.newRole({
    audit: ["read"],
    appointment: ["read", "update", "manage"],
    billing: ["read", "manage"],
    billingInvoices: ["read", "download"],
    billingPaymentMethods: ["read", "manage"],
    billingProfile: ["read", "update"],
    billingRefunds: ["read"],
    billingTransactions: ["read"],
    subscription: ["read", "change_plan", "cancel", "reactivate"],
    community: ["read", "manage"],
    consultation: ["read", "create", "update", "manage"],
    doctorDirectory: ["read", "manage"],
    facility: ["read", "create", "update", "delete", "publish", "archive"],
    invitation: ["read", "create", "cancel"],
    hospitalSettings: ["read", "update"],
    member: ["read", "create", "update", "delete"],
    organization: ["read", "update"],
    patient: ["read"],
    prescription: ["read", "create", "manage"],
    project: ["read", "create", "update", "delete"],
    schedule: ["read", "manage"],
  }),
  APPOINTMENT_HANDLER: accessControl.newRole({
    appointment: ["read", "update", "manage"],
    doctorDirectory: ["read"],
    facility: ["read"],
    organization: ["read"],
    patient: ["read"],
    project: ["read"],
    schedule: ["read", "manage"],
  }),
  COMMUNITY_MANAGER: accessControl.newRole({
    community: ["read", "manage"],
    organization: ["read"],
    project: ["read"],
  }),
  admin: accessControl.newRole({
    audit: ["read"],
    appointment: ["read", "update", "manage"],
    billing: ["read", "manage"],
    billingInvoices: ["read", "download"],
    billingPaymentMethods: ["read", "manage"],
    billingProfile: ["read", "update"],
    billingRefunds: ["read"],
    billingTransactions: ["read"],
    subscription: ["read", "change_plan", "cancel", "reactivate"],
    community: ["read", "manage"],
    consultation: ["read", "create", "update", "manage"],
    doctorDirectory: ["read", "manage"],
    facility: ["read", "create", "update", "delete", "publish", "archive"],
    invitation: ["read", "create", "cancel"],
    hospitalSettings: ["read", "update"],
    member: ["read", "create", "update", "delete"],
    organization: ["read", "update"],
    patient: ["read"],
    prescription: ["read", "create", "manage"],
    project: ["read", "create", "update", "delete"],
    schedule: ["read", "manage"],
  }),
  billing: accessControl.newRole({
    billing: ["read", "manage"],
    billingInvoices: ["read", "download"],
    billingPaymentMethods: ["read", "manage"],
    billingProfile: ["read", "update"],
    billingRefunds: ["read"],
    billingTransactions: ["read"],
    subscription: ["read", "change_plan", "cancel", "reactivate"],
    organization: ["read"],
    project: ["read"],
  }),
  doctor: accessControl.newRole({
    appointment: ["read", "update", "manage"],
    consultation: ["read", "create", "update", "manage"],
    doctorDirectory: ["read"],
    facility: ["read"],
    member: ["read"],
    organization: ["read"],
    patient: ["read"],
    prescription: ["read", "create", "manage"],
    project: ["read", "create", "update"],
    schedule: ["read", "manage"],
  }),
  lab_tech: accessControl.newRole({
    appointment: ["read", "update", "manage"],
    organization: ["read"],
    patient: ["read"],
    project: ["read"],
    schedule: ["read", "manage"],
  }),
  manager: accessControl.newRole({
    audit: ["read"],
    appointment: ["read", "update", "manage"],
    billing: ["read", "manage"],
    billingInvoices: ["read", "download"],
    billingPaymentMethods: ["read", "manage"],
    billingProfile: ["read", "update"],
    billingRefunds: ["read"],
    billingTransactions: ["read"],
    subscription: ["read", "change_plan", "cancel", "reactivate"],
    community: ["read", "manage"],
    consultation: ["read", "create", "update"],
    doctorDirectory: ["read", "manage"],
    facility: ["read", "create", "update", "delete", "publish", "archive"],
    invitation: ["read", "create", "cancel"],
    member: ["read", "create", "update"],
    organization: ["read", "update"],
    patient: ["read"],
    project: ["read", "create", "update", "delete"],
    schedule: ["read", "manage"],
  }),
  owner: accessControl.newRole({
    audit: ["read"],
    appointment: ["read", "update", "manage"],
    billing: ["read", "manage"],
    billingInvoices: ["read", "download"],
    billingPaymentMethods: ["read", "manage"],
    billingProfile: ["read", "update"],
    billingRefunds: ["read"],
    billingTransactions: ["read"],
    subscription: ["read", "change_plan", "cancel", "reactivate"],
    community: ["read", "manage"],
    consultation: ["read", "create", "update", "manage"],
    doctorDirectory: ["read", "manage"],
    facility: ["read", "create", "update", "delete", "publish", "archive"],
    invitation: ["read", "create", "cancel"],
    hospitalSettings: ["read", "update"],
    member: ["read", "create", "update", "delete"],
    organization: ["read", "update", "delete"],
    patient: ["read"],
    prescription: ["read", "create", "manage"],
    project: ["read", "create", "update", "delete"],
    schedule: ["read", "manage"],
  }),
  receptionist: accessControl.newRole({
    appointment: ["read", "update", "manage"],
    doctorDirectory: ["read"],
    facility: ["read"],
    invitation: ["read"],
    member: ["read"],
    organization: ["read"],
    patient: ["read"],
    project: ["read", "create"],
    schedule: ["read", "manage"],
  }),
} as const;

export type ErpPermissionRequest = Partial<{
  [Key in keyof typeof erpStatements]: ReadonlyArray<
    (typeof erpStatements)[Key][number]
  >;
}>;

export const subscriptionBillingPermissionChecks = {
  "subscription.read": { subscription: ["read"] },
  "subscription.change_plan": { subscription: ["change_plan"] },
  "subscription.cancel": { subscription: ["cancel"] },
  "subscription.reactivate": { subscription: ["reactivate"] },
  "billing.profile.read": { billingProfile: ["read"] },
  "billing.profile.update": { billingProfile: ["update"] },
  "billing.invoices.read": { billingInvoices: ["read"] },
  "billing.invoices.download": { billingInvoices: ["download"] },
  "billing.transactions.read": { billingTransactions: ["read"] },
  "billing.payment_methods.read": { billingPaymentMethods: ["read"] },
  "billing.payment_methods.manage": { billingPaymentMethods: ["manage"] },
  "billing.refunds.read": { billingRefunds: ["read"] },
} as const satisfies Record<string, ErpPermissionRequest>;

export type SubscriptionBillingPermissionName =
  keyof typeof subscriptionBillingPermissionChecks;

export const subscriptionBillingPermissionNames = Object.keys(
  subscriptionBillingPermissionChecks
) as SubscriptionBillingPermissionName[];

const organizationTypeSchema = z.enum(schema.organizationTypes);
const trustedOrigins = buildTrustedOrigins();

type SessionOrganizationMembership = Awaited<
  ReturnType<typeof resolveActiveOrganizationMembership>
>;

const resolveActiveOrganizationMembership = async (
  userId: string,
  activeOrganizationId?: string | null
) => {
  const memberships = await db
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
    .where(eq(schema.member.userId, userId));

  if (memberships.length === 0) {
    return null;
  }

  const activeMembership =
    memberships.find(
      (membership) => membership.organizationId === activeOrganizationId
    ) ?? (memberships.length === 1 ? memberships[0] : null);

  return activeMembership ?? null;
};

const buildSessionOrganizationContext = (
  membership: SessionOrganizationMembership
) => {
  if (!membership) {
    return {
      activeMember: null,
      activeOrganization: null,
    };
  }

  return {
    activeMember: {
      createdAt: membership.createdAt,
      id: membership.id,
      organizationId: membership.organizationId,
      permissions: getOrganizationPermissions(membership.role),
      role: membership.role,
      userId: membership.userId,
    },
    activeOrganization: membership.organization?.id
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
  };
};

export const hasOrganizationPermission = (
  role: string,
  permissions: ErpPermissionRequest
) => {
  const normalizedRole = normalizeOrganizationMemberRole(role);
  const definition =
    organizationRoles[
      (normalizedRole ?? role) as ErpOrganizationRole | OrganizationMemberRole
    ];

  if (!definition) {
    return false;
  }

  const authorize = definition.authorize as (request: ErpPermissionRequest) => {
    success: boolean;
  };

  return authorize(permissions).success;
};

export const getOrganizationPermissions = (role: string) =>
  subscriptionBillingPermissionNames.filter((permission) =>
    hasOrganizationPermission(
      role,
      subscriptionBillingPermissionChecks[permission]
    )
  );

const centralApiPermissionChecks = {
  "activity.read": { audit: ["read"] },
  "analytics.export": { audit: ["read"] },
  "analytics.read": { audit: ["read"] },
  "appointment.approve": { appointment: ["manage"] },
  "appointment.cancel": { appointment: ["manage"] },
  "appointment.complete": { appointment: ["manage"] },
  "appointment.create": { appointment: ["update", "manage"] },
  "appointment.no_show": { appointment: ["manage"] },
  "appointment.read": { appointment: ["read"] },
  "appointment.reject": { appointment: ["manage"] },
  "appointment.reschedule": { appointment: ["manage"] },
  "appointment.update": { appointment: ["update", "manage"] },
  "appointments.read": { appointment: ["read"] },
  "appointments.write": { appointment: ["update", "manage"] },
  "billing.invoices.download": { billingInvoices: ["download"] },
  "billing.invoices.read": { billingInvoices: ["read"] },
  "billing.payment_methods.manage": { billingPaymentMethods: ["manage"] },
  "billing.payment_methods.read": { billingPaymentMethods: ["read"] },
  "billing.profile.read": { billingProfile: ["read"] },
  "billing.profile.update": { billingProfile: ["update"] },
  "billing.read": { billing: ["read"] },
  "billing.refunds.read": { billingRefunds: ["read"] },
  "billing.transactions.read": { billingTransactions: ["read"] },
  "billing.write": { billing: ["manage"] },
  "clinic.doctor.create": { doctorDirectory: ["manage"] },
  "clinic.doctor.delete": { doctorDirectory: ["manage"] },
  "clinic.doctor.read": { doctorDirectory: ["read"] },
  "clinic.facility.create": { facility: ["create"] },
  "clinic.facility.delete": { facility: ["delete"] },
  "clinic.facility.read": { facility: ["read"] },
  "clinic.facility.update": { facility: ["update"] },
  "clinic.gallery.create": { facility: ["create", "update"] },
  "clinic.gallery.delete": { facility: ["delete"] },
  "clinic.gallery.read": { facility: ["read"] },
  "clinic.profile.read": { organization: ["read"] },
  "clinic.profile.update": { organization: ["update"] },
  "clinic.review.read": { community: ["read"] },
  "clinic.service.create": { facility: ["create"] },
  "clinic.service.delete": { facility: ["delete"] },
  "clinic.service.read": { facility: ["read"] },
  "clinic.service.update": { facility: ["update"] },
  "clinic.staff.create": { member: ["create"] },
  "clinic.staff.delete": { member: ["delete"] },
  "clinic.staff.read": { member: ["read"] },
  "clinic.staff.update": { member: ["update"] },
  "dashboard.layout.manage": { organization: ["update"] },
  "dashboard.read": { organization: ["read"] },
  "department.assign_head": { facility: ["update"] },
  "department.create": { facility: ["create"] },
  "department.read": { facility: ["read"] },
  "department.update": { facility: ["update"] },
  "doctor.appointment.read": { appointment: ["read"] },
  "doctor.appointment.update": { appointment: ["update", "manage"] },
  "doctor.availability.create": { schedule: ["manage"] },
  "doctor.availability.delete": { schedule: ["manage"] },
  "doctor.availability.read": { schedule: ["read"] },
  "doctor.availability.update": { schedule: ["manage"] },
  "doctor.consultation.create": { consultation: ["create"] },
  "doctor.consultation.read": { consultation: ["read"] },
  "doctor.consultation.update": { consultation: ["update", "manage"] },
  "doctor.dashboard.read": { doctorDirectory: ["read"] },
  "doctor.patient.read": { patient: ["read"] },
  "doctor.profile.read": { doctorDirectory: ["read"] },
  "doctor.profile.update": { doctorDirectory: ["manage"] },
  "doctor.settings.read": { organization: ["read"] },
  "doctor.settings.update": { organization: ["update"] },
  "doctor_association.assign": { doctorDirectory: ["manage"] },
  "doctor_association.read": { doctorDirectory: ["read"] },
  "doctor_association.remove": { doctorDirectory: ["manage"] },
  "doctor_association.update": { doctorDirectory: ["manage"] },
  "hospital_profile.read": { organization: ["read"] },
  "hospital_profile.update": { organization: ["update"] },
  "hospital_service.create": { facility: ["create"] },
  "hospital_service.read": { facility: ["read"] },
  "hospital_service.update": { facility: ["update"] },
  "hospital.settings.operational.read": { hospitalSettings: ["read"] },
  "hospital.settings.operational.update": { hospitalSettings: ["update"] },
  "hospital.settings.notifications.read": { hospitalSettings: ["read"] },
  "hospital.settings.notifications.update": { hospitalSettings: ["update"] },
  "hospital.settings.security.read": { hospitalSettings: ["read"] },
  "hospital.settings.security.update": { hospitalSettings: ["update"] },
  "hospital.security.sessions.read": { hospitalSettings: ["read"] },
  "hospital.security.sessions.revoke": { hospitalSettings: ["update"] },
  "hospital.security.sessions.revoke-all": { hospitalSettings: ["update"] },
  "hospital.security.policy-history.read": { hospitalSettings: ["read"] },
  "hospital.data-exports.capabilities.read": { hospitalSettings: ["read"] },
  "hospital.data-exports.policies.read": { hospitalSettings: ["read"] },
  "hospital.data-exports.policies.update": { hospitalSettings: ["update"] },
  "hospital.data-exports.read": { hospitalSettings: ["read"] },
  "hospital.data-exports.create": { hospitalSettings: ["update"] },
  "hospital.data-exports.approve": { hospitalSettings: ["update"] },
  "hospital.data-exports.reject": { hospitalSettings: ["update"] },
  "hospital.data-exports.cancel": { hospitalSettings: ["update"] },
  "hospital.data-exports.download": { hospitalSettings: ["read"] },
  "lead.assign": { community: ["manage"] },
  "lead.convert": { community: ["manage"] },
  "lead.create": { community: ["manage"] },
  "lead.read": { community: ["read"] },
  "lead.update": { community: ["manage"] },
  "marketplace.listing.publish": { facility: ["publish"] },
  "marketplace.profile.manage": { organization: ["update"] },
  "marketplace.read": { organization: ["read"] },
  "marketplace.service.manage": { facility: ["update"] },
  "media.attach": { facility: ["create", "update"] },
  "media.delete": { facility: ["delete"] },
  "media.download": { facility: ["read"] },
  "media.read": { facility: ["read"] },
  "media.upload": { facility: ["create", "update"] },
  "notification.preference.manage": { organization: ["update"] },
  "notification.read": { community: ["read"] },
  "notification.send": { community: ["manage"] },
  "patient.read": { patient: ["read"] },
  "patient.search": { patient: ["read"] },
  "patient.timeline.read": { patient: ["read"] },
  "patients.read": { patient: ["read"] },
  "prescription.create": { prescription: ["create"] },
  "prescription.manage": { prescription: ["manage"] },
  "prescription.read": { prescription: ["read"] },
  "report.download": { audit: ["read"] },
  "report.read": { audit: ["read"] },
  "report.run": { audit: ["read"] },
  "review.aggregate.read": { community: ["read"] },
  "review.create": { community: ["manage"] },
  "review.moderate": { community: ["manage"] },
  "review.read": { community: ["read"] },
  "review.reply": { community: ["manage"] },
  "schedule.read": { schedule: ["read"] },
  "schedule.update": { schedule: ["manage"] },
  "settings.audit.read": { audit: ["read"] },
  "settings.read": { organization: ["read"] },
  "settings.rollback": { organization: ["update"] },
  "settings.update": { organization: ["update"] },
  "settings.user_preference.manage": { organization: ["update"] },
  "subscription.cancel": { subscription: ["cancel"] },
  "subscription.change_plan": { subscription: ["change_plan"] },
  "subscription.reactivate": { subscription: ["reactivate"] },
  "subscription.read": { subscription: ["read"] },
} as const satisfies Record<string, ErpPermissionRequest>;

export const getCentralApiPermissions = (role: string) =>
  Object.entries(centralApiPermissionChecks)
    .filter(([, permission]) => hasOrganizationPermission(role, permission))
    .map(([permission]) => permission);
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins,
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
    organization({
      ac: accessControl,
      allowUserToCreateOrganization: true,
      creatorRole: "OWNER",
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
        const membership = activeOrganizationId
          ? await db
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
              .limit(1)
              .then((memberships) => memberships[0] ?? null)
          : await resolveActiveOrganizationMembership(
              user.id,
              activeOrganizationId
            );

        const organizationContext = buildSessionOrganizationContext(membership);

        return {
          ...organizationContext,
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

function buildTrustedOrigins() {
  const origins = new Set(
    env.CORS_ORIGIN.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  );

  if (env.NODE_ENV !== "production") {
    origins.add("http://localhost:3001");
    origins.add("http://127.0.0.1:3001");

    for (const networkInterface of Object.values(networkInterfaces())) {
      for (const address of networkInterface ?? []) {
        if (address.family === "IPv4" && !address.internal) {
          origins.add(`http://${address.address}:3001`);
        }
      }
    }
  }

  return Array.from(origins);
}
