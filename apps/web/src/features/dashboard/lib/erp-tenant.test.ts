import { describe, expect, test } from "bun:test";
import { virujBackend } from "@/lib/viruj-backend";
import {
  buildErpRoute,
  createErpTenantContext,
  getProviderCapabilities,
  getProviderTerminology,
} from "./erp-tenant";

describe("shared ERP tenant helpers", () => {
  test("builds provider-aware appointment routes", () => {
    expect(
      buildErpRoute({
        organizationSlug: "apollo-main",
        page: "appointments-review",
        providerType: "hospital",
      })
    ).toBe("/hospital/apollo-main/appointments/review");

    expect(
      buildErpRoute({
        organizationSlug: "smile-clinic",
        page: "appointments-patients",
        providerType: "clinic",
      })
    ).toBe("/clinic/smile-clinic/appointments/patients");
  });

  test("keeps provider capabilities and terminology out of screens", () => {
    expect(getProviderCapabilities("clinic").appointments.supportsBeds).toBe(
      false
    );
    expect(getProviderCapabilities("clinic").facilities.supportsBeds).toBe(
      false
    );
    expect(
      getProviderCapabilities("clinic").facilities.supportsOperatingTheatres
    ).toBe(false);
    expect(
      getProviderCapabilities("clinic").services.supportsDepartmentAssignment
    ).toBe(false);
    expect(getProviderCapabilities("hospital").appointments.supportsBeds).toBe(
      true
    );
    expect(
      getProviderCapabilities("hospital").facilities.supportsOperatingTheatres
    ).toBe(true);
    expect(
      getProviderCapabilities("hospital").services.supportsDepartmentAssignment
    ).toBe(true);
    expect(getProviderTerminology("clinic").departmentLabel).toBe("Specialty");
    expect(getProviderTerminology("hospital").departmentLabel).toBe(
      "Department"
    );
  });

  test("does not create shared cache keys across tenants", () => {
    expect(
      virujBackend.appointments.key({ organizationId: "hospital-a" })
    ).not.toEqual(
      virujBackend.appointments.key({ organizationId: "clinic-a" })
    );
    expect(
      virujBackend.facilities.key({ organizationId: "hospital-a" })
    ).not.toEqual(virujBackend.facilities.key({ organizationId: "clinic-a" }));
    expect(
      virujBackend.services.key({ organizationId: "hospital-a" })
    ).not.toEqual(virujBackend.services.key({ organizationId: "clinic-a" }));
  });

  test("resolves hospital, clinic and independent doctor tenant contexts", () => {
    const doctor = createErpTenantContext({
      organizationId: "doctor-a",
      organizationSlug: "doctor-a",
      providerType: "doctor",
      role: "DOCTOR",
    });
    expect(doctor?.providerType).toBe("doctor");
    expect(doctor?.capabilities.appointments.enabled).toBe(true);
    expect(doctor?.buildRoute("appointments-review")).toBe(
      "/doctor/doctor-a/appointments/review"
    );
    expect(
      createErpTenantContext({
        organizationId: "clinic-a",
        providerType: "clinic",
        role: "CLINIC_ADMIN",
      })?.providerType
    ).toBe("clinic");

    expect(
      createErpTenantContext({
        organizationId: "radio-a",
        providerType: "radiology",
      })
    ).toBeNull();
  });
});
