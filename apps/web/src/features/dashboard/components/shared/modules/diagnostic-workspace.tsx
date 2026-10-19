"use client";
import { useQuery } from "@tanstack/react-query";
import { RoleDashboardPage } from "../role-dashboard-page";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { diagnosticMoney } from "@/features/dashboard/lib/diagnostics";
import { virujBackend } from "@/lib/viruj-backend";
export function DiagnosticWorkspace({
  tenant,
  organizationName,
  userName,
}: {
  tenant: ErpTenantContext;
  organizationName?: string;
  userName: string;
}) {
  const organizationId = tenant.organizationId;
  const appointments = useQuery({
    queryKey: virujBackend.appointments.key({ organizationId }),
    queryFn: () => virujBackend.appointments.list({ organizationId }),
    retry: false,
  });
  const diagnosticOrders = useQuery({
    queryKey: virujBackend.diagnostics.key(organizationId, "orders"),
    queryFn: () => virujBackend.diagnostics.orders(organizationId),
    retry: false,
  });
  const catalogue = useQuery({
    queryKey: virujBackend.diagnostics.key(organizationId, "services"),
    queryFn: () => virujBackend.diagnostics.services(organizationId),
    retry: false,
  });
  const rows = appointments.data ?? [];
  const orders = diagnosticOrders.data ?? [];
  const released = orders.filter((order) => order.status === "released");
  const active = orders.filter(
    (order) => !["released", "cancelled"].includes(order.status)
  );
  const statuses = [...new Set(rows.map((row) => row.status))].map(
    (status) => ({
      label:
        status === "pending_approval"
          ? "Awaiting approval"
          : status.replaceAll("_", " "),
      value: rows.filter((row) => row.status === status).length,
      color: "var(--dashboard-brand)",
    })
  );
  return (
    <RoleDashboardPage
      tone={tenant.providerType === "radiology" ? "radiology" : "pathology"}
      organizationId={organizationId}
      organizationName={organizationName}
      userName={userName}
      loading={[appointments, diagnosticOrders, catalogue].some(
        (query) => query.isPending
      )}
      refreshing={[appointments, diagnosticOrders, catalogue].some(
        (query) => query.isFetching
      )}
      unavailable={[
        ...(appointments.isError ? ["appointments"] : []),
        ...(diagnosticOrders.isError ? ["orders"] : []),
        ...(catalogue.isError ? ["services"] : []),
      ]}
      onRefresh={() => {
        void Promise.all([
          appointments.refetch(),
          diagnosticOrders.refetch(),
          catalogue.refetch(),
        ]);
      }}
      analytics={{
        appointments: rows,
        appointmentStatuses: statuses,
        stats: [
          {
            label: "Appointment Requests",
            value: String(rows.length),
            note: "Bookings for this organisation",
          },
          {
            label: "Patients",
            value: String(
              new Set(rows.map((row) => row.patientPhone || row.patientName))
                .size
            ),
            note: "Patients with bookings",
          },
          {
            label: "Active Doctors",
            value: String(active.length),
            note: "Across the latest 200 orders",
          },
          {
            label: "Active Services",
            value: String(released.length),
            note: "Across the latest 200 orders",
          },
        ],
        charts: [
          {
            title: "Bookings",
            labels: statuses.map((status) => status.label),
            values: statuses.map((status) => status.value),
          },
          {
            title: "Orders",
            labels: ["Active", "Review", "Released"],
            values: [
              active.length,
              orders.filter((order) => order.status === "review").length,
              released.length,
            ],
          },
          {
            title: "Reports",
            labels: ["Review", "Released"],
            values: [
              orders.filter((order) => order.status === "review").length,
              released.length,
            ],
          },
        ],
        services: (catalogue.data ?? [])
          .filter((service) => service.active)
          .map((service) => ({
            id: service.id,
            title: service.name,
            subtitle: service.modality || service.specimen || service.code,
            meta: diagnosticMoney(service.pricePaise),
          })),
      }}
    />
  );
}
