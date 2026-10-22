"use client";
import { useQuery } from "@tanstack/react-query";
import { RoleDashboardPage } from "../role-dashboard-page";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { diagnosticMoney } from "@/features/dashboard/lib/diagnostics";
import { virujBackend } from "@/lib/viruj-backend";
import { useRouter } from "next/navigation";
import { diagnosticBookingAppointment } from "@/features/dashboard/lib/diagnostic-bookings";

export function DiagnosticWorkspace({
  tenant,
  organizationName,
  userName
}: {
  tenant: ErpTenantContext;
  organizationName?: string;
  userName: string;
}) {
  const router = useRouter();
  const bookings = useQuery({
    queryKey: ["diagnostic-bookings", tenant.organizationId],
    queryFn: () => virujBackend.diagnostics.bookings(tenant.organizationId)
  });
  const services = useQuery({
    queryKey: virujBackend.diagnostics.key(tenant.organizationId, "services"),
    queryFn: () => virujBackend.diagnostics.services(tenant.organizationId)
  });
  const branches = useQuery({
    queryKey: ["diagnostic-availability", tenant.organizationId, "branches"],
    queryFn: () => virujBackend.diagnostics.branches(tenant.organizationId)
  });
  const rows = (bookings.data ?? []).map(diagnosticBookingAppointment);
  const activeServices = (services.data ?? []).filter(
    (service) => service.active
  );
  const published = (branches.data ?? []).filter((branch) => branch.published);
  const statuses = [
    "pending_approval",
    "approved",
    "rejected",
    "cancelled"
  ].map((status, index) => ({
    label: ["Awaiting approval", "Approved", "Rejected", "Cancelled"][index],
    value: rows.filter((row) => row.status === status).length,
    color: "var(--dashboard-brand)"
  }));
  return (
    <RoleDashboardPage
      tone={tenant.providerType === "radiology" ? "radiology" : "pathology"}
      organizationId={tenant.organizationId}
      organizationName={organizationName}
      userName={userName}
      loading={[bookings, services, branches].some((query) => query.isPending)}
      refreshing={[bookings, services, branches].some(
        (query) => query.isFetching
      )}
      unavailable={[
        ...(bookings.isError ? ["appointments"] : []),
        ...(services.isError ? ["services"] : []),
        ...(branches.isError ? ["doctors"] : [])
      ]}
      onRefresh={() => {
        void bookings.refetch();
        void services.refetch();
        void branches.refetch();
      }}
      onAppointmentSelect={() => router.push(tenant.buildRoute("appointments"))}
      analytics={{
        appointments: rows,
        appointmentStatuses: statuses,
        stats: [
          {
            label: "Appointment Requests",
            value: String(rows.length),
            note: "Latest service bookings"
          },
          {
            label: "Patients",
            value: String(
              new Set(rows.map((row) => row.patientPhone || row.patientName))
                .size
            ),
            note: "Patients with bookings"
          },
          {
            label: "Active Doctors",
            value: String(published.length),
            note: "Branches visible in the app"
          },
          {
            label: "Active Services",
            value: String(activeServices.length),
            note: "Services offered by your centre"
          }
        ],
        charts: [
          {
            title: "Appointments",
            labels: statuses.map((status) => status.label),
            values: statuses.map((status) => status.value)
          },
          {
            title: "Branches",
            labels: ["Published", "Private"],
            values: [
              published.length,
              (branches.data?.length ?? 0) - published.length
            ]
          },
          {
            title: "Services",
            labels: ["Active", "Archived"],
            values: [
              activeServices.length,
              (services.data?.length ?? 0) - activeServices.length
            ]
          }
        ],
        doctors: (branches.data ?? []).map((branch) => ({
          id: branch.id,
          title: branch.name,
          subtitle: branch.address,
          meta: branch.published ? "Published" : "Private"
        })),
        services: activeServices.map((service) => ({
          id: service.id,
          title: service.name,
          subtitle: service.preparation || service.code,
          meta: diagnosticMoney(service.pricePaise)
        }))
      }}
    />
  );
}
