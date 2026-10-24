import { describe, expect, test } from "bun:test";
import type { SubscriptionBillingPermissionName } from "./index";

Bun.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/viruj_test";
Bun.env.BETTER_AUTH_SECRET ??= "test-secret-for-rbac-permission-tests";
Bun.env.BETTER_AUTH_URL ??= "http://localhost:3001/auth";
Bun.env.CORS_ORIGIN ??= "http://localhost:3001";
Bun.env.CENTRAL_API_JWT_SECRET ??= "test-central-api-jwt-secret-32-bytes";

const authModule = import("./index");

test("legacy aliases use canonical grants without elevating specialist roles", async () => {
  const { getCentralApiPermissions, organizationRoles } = await authModule;
  expect(organizationRoles.doctor).toBe(organizationRoles.DOCTOR);
  expect(organizationRoles.lab_tech).toBe(organizationRoles.TECHNICIAN);
  expect(organizationRoles.receptionist).toBe(organizationRoles.RECEPTIONIST);
  for (const [alias, canonical] of [
    ["owner", "OWNER"],
    ["admin", "ADMIN"],
    ["manager", "MANAGER"],
    ["doctor", "DOCTOR"],
    ["receptionist", "RECEPTIONIST"],
    ["lab_tech", "TECHNICIAN"],
  ]) {
    expect(getCentralApiPermissions(alias)).toEqual(
      getCentralApiPermissions(canonical)
    );
  }
  expect(getCentralApiPermissions("doctor")).not.toContain(
    "staff.members.read"
  );
  expect(getCentralApiPermissions("lab_tech")).toContain(
    "diagnostics.reports.prepare"
  );
  for (const role of ["APPOINTMENT_HANDLER", "COMMUNITY_MANAGER"]) {
    const grants = getCentralApiPermissions(role);
    for (const permission of [
      "prescription.manage",
      "doctor.consultation.create",
      "billing.payment_methods.manage",
    ])
      expect(grants).not.toContain(permission);
  }
});

const expectedBillingPermissions = [
  "subscription.read",
  "subscription.change_plan",
  "subscription.cancel",
  "subscription.reactivate",
  "billing.profile.read",
  "billing.profile.update",
  "billing.invoices.read",
  "billing.invoices.download",
  "billing.transactions.read",
  "billing.payment_methods.read",
  "billing.payment_methods.manage",
  "billing.refunds.read",
] as const satisfies readonly SubscriptionBillingPermissionName[];

describe("subscription billing RBAC", () => {
  test("clinic location permissions follow existing organization management roles", async () => {
    const { getCentralApiPermissions, hasOrganizationPermission } =
      await authModule;
    for (const role of [
      "OWNER",
      "CLINIC_OWNER",
      "ADMIN",
      "CLINIC_ADMIN",
      "ORG_ADMIN",
      "owner",
      "admin",
      "MANAGER",
      "CLINIC_STAFF",
      "STAFF",
      "RECEPTIONIST",
      "DOCTOR",
      "TECHNICIAN",
      "billing",
      "unknown",
    ]) {
      const permissions = getCentralApiPermissions(role);
      for (const action of ["create", "update", "delete"]) {
        expect(
          permissions.includes(
            `clinic.location.${action}` as (typeof permissions)[number]
          )
        ).toBe(hasOrganizationPermission(role, { organization: ["update"] }));
      }
      expect(permissions.includes("clinic.location.read")).toBe(
        hasOrganizationPermission(role, { organization: ["read"] })
      );
    }
  });
  test("owner and super-admin roles receive subscription permissions", async () => {
    const { getOrganizationPermissions, hasOrganizationPermission } =
      await authModule;

    for (const role of ["OWNER", "owner", "ADMIN", "ORG_ADMIN", "admin"]) {
      expect(getOrganizationPermissions(role)).toEqual(
        Array.from(expectedBillingPermissions)
      );
      expect(hasOrganizationPermission(role, { subscription: ["read"] })).toBe(
        true
      );
    }
  });

  test("billing admin can access according to granted permissions", async () => {
    const { getOrganizationPermissions } = await authModule;
    const permissions = getOrganizationPermissions("billing");

    expect(permissions).toContain("subscription.read");
    expect(permissions).toContain("subscription.change_plan");
    expect(permissions).toContain("billing.invoices.download");
    expect(permissions).toContain("billing.payment_methods.manage");
  });

  test("normal staff cannot access subscription billing permissions", async () => {
    const { getOrganizationPermissions, hasOrganizationPermission } =
      await authModule;

    expect(getOrganizationPermissions("STAFF")).toEqual([]);
    expect(hasOrganizationPermission("STAFF", { subscription: ["read"] })).toBe(
      false
    );
  });

  test("stale token refresh obtains newly assigned permissions", async () => {
    const { getOrganizationPermissions } = await authModule;
    const staleTokenPermissions: string[] = [];
    const refreshedSessionPermissions = getOrganizationPermissions("OWNER");

    expect(staleTokenPermissions).not.toContain("subscription.read");
    expect(refreshedSessionPermissions).toContain("subscription.read");
    expect(refreshedSessionPermissions).toContain("billing.profile.update");
  });

  test("central API hospital operational settings permissions go only to owner and admin roles", async () => {
    const { getCentralApiPermissions } = await authModule;

    for (const role of [
      "OWNER",
      "CLINIC_OWNER",
      "ADMIN",
      "CLINIC_ADMIN",
      "ORG_ADMIN",
      "admin",
      "owner",
    ]) {
      expect(getCentralApiPermissions(role)).toContain(
        "hospital.settings.operational.read"
      );
      expect(getCentralApiPermissions(role)).toContain(
        "hospital.settings.operational.update"
      );
    }

    for (const role of [
      "MANAGER",
      "STAFF",
      "CLINIC_STAFF",
      "RECEPTIONIST",
      "TECHNICIAN",
      "billing",
      "doctor",
      "manager",
      "receptionist",
    ]) {
      expect(getCentralApiPermissions(role)).not.toContain(
        "hospital.settings.operational.read"
      );
      expect(getCentralApiPermissions(role)).not.toContain(
        "hospital.settings.operational.update"
      );
    }
  });

  test("central API hospital notification settings permissions go only to owner and admin roles", async () => {
    const { getCentralApiPermissions } = await authModule;

    for (const role of [
      "OWNER",
      "CLINIC_OWNER",
      "ADMIN",
      "CLINIC_ADMIN",
      "ORG_ADMIN",
      "admin",
      "owner",
    ]) {
      expect(getCentralApiPermissions(role)).toContain(
        "hospital.settings.notifications.read"
      );
      expect(getCentralApiPermissions(role)).toContain(
        "hospital.settings.notifications.update"
      );
    }

    for (const role of [
      "MANAGER",
      "STAFF",
      "CLINIC_STAFF",
      "RECEPTIONIST",
      "TECHNICIAN",
      "billing",
      "doctor",
      "manager",
      "receptionist",
    ]) {
      expect(getCentralApiPermissions(role)).not.toContain(
        "hospital.settings.notifications.read"
      );
      expect(getCentralApiPermissions(role)).not.toContain(
        "hospital.settings.notifications.update"
      );
    }
  });

  test("central API hospital security settings permissions go only to owner and admin roles", async () => {
    const { getCentralApiPermissions } = await authModule;
    const securityPermissions = [
      "hospital.settings.security.read",
      "hospital.settings.security.update",
      "hospital.security.sessions.read",
      "hospital.security.sessions.revoke",
      "hospital.security.sessions.revoke-all",
      "hospital.security.policy-history.read",
    ];

    for (const role of [
      "OWNER",
      "CLINIC_OWNER",
      "ADMIN",
      "CLINIC_ADMIN",
      "ORG_ADMIN",
      "admin",
      "owner",
    ]) {
      for (const permission of securityPermissions) {
        expect(getCentralApiPermissions(role)).toContain(permission);
      }
    }

    for (const role of [
      "MANAGER",
      "STAFF",
      "CLINIC_STAFF",
      "RECEPTIONIST",
      "TECHNICIAN",
      "billing",
      "doctor",
      "manager",
      "receptionist",
    ]) {
      for (const permission of securityPermissions) {
        expect(getCentralApiPermissions(role)).not.toContain(permission);
      }
    }
  });

  test("central API hospital data export permissions go only to owner and admin roles", async () => {
    const { getCentralApiPermissions } = await authModule;
    const exportPermissions = [
      "hospital.data-exports.capabilities.read",
      "hospital.data-exports.policies.read",
      "hospital.data-exports.policies.update",
      "hospital.data-exports.read",
      "hospital.data-exports.create",
      "hospital.data-exports.approve",
      "hospital.data-exports.reject",
      "hospital.data-exports.cancel",
      "hospital.data-exports.download",
    ];

    for (const role of [
      "OWNER",
      "CLINIC_OWNER",
      "ADMIN",
      "CLINIC_ADMIN",
      "ORG_ADMIN",
      "admin",
      "owner",
    ]) {
      for (const permission of exportPermissions) {
        expect(getCentralApiPermissions(role)).toContain(permission);
      }
    }

    for (const role of [
      "MANAGER",
      "STAFF",
      "CLINIC_STAFF",
      "RECEPTIONIST",
      "TECHNICIAN",
      "billing",
      "doctor",
      "manager",
      "receptionist",
    ]) {
      for (const permission of exportPermissions) {
        expect(getCentralApiPermissions(role)).not.toContain(permission);
      }
    }
  });
  test("permission-name mismatch cannot occur in canonical billing list", async () => {
    const { subscriptionBillingPermissionNames } = await authModule;

    expect(subscriptionBillingPermissionNames).toEqual(
      Array.from(expectedBillingPermissions)
    );
    expect(subscriptionBillingPermissionNames).not.toContain(
      "billing.subscription.read" as SubscriptionBillingPermissionName
    );
    expect(subscriptionBillingPermissionNames).not.toContain(
      "subscriptions.read" as SubscriptionBillingPermissionName
    );
  });
});

test("doctor workspace owners receive every permission required by onboarding and dashboard", async () => {
  const { getCentralApiPermissions } = await authModule;
  const required = [
    "doctor.dashboard.read",
    "doctor.profile.read",
    "doctor.profile.update",
    "doctor.verification.read",
    "doctor.verification.submit",
    "doctor.location.read",
    "doctor.location.create",
    "doctor.location.update",
    "doctor.location.delete",
    "doctor.availability.read",
    "doctor.availability.create",
    "doctor.availability.update",
    "doctor.availability.delete",
    "doctor.appointment.read",
    "doctor.appointment.update",
    "doctor.patient.read",
    "doctor.consultation.read",
    "doctor.consultation.create",
    "doctor.consultation.update",
    "doctor.settings.read",
    "doctor.settings.update",
    "doctor.file.read",
    "doctor.file.create",
    "doctor.file.delete",
  ];
  for (const role of ["OWNER", "owner", "ADMIN", "admin"]) {
    const granted = getCentralApiPermissions(role);
    for (const permission of required) expect(granted).toContain(permission);
  }
  for (const role of ["RECEPTIONIST", "unknown"]) {
    const granted = getCentralApiPermissions(role);
    for (const permission of [
      "doctor.verification.submit",
      "doctor.file.create",
      "doctor.file.delete",
    ])
      expect(granted).not.toContain(permission);
  }
});
