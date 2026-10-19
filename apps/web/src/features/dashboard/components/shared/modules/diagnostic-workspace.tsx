"use client";
import { useQuery } from "@tanstack/react-query";
import { RoleDashboardPage } from "../role-dashboard-page";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { diagnosticMoney } from "@/features/dashboard/lib/diagnostics";
import { virujBackend } from "@/lib/viruj-backend";
import Link from "next/link";

export function DiagnosticWorkspace({
  tenant,
  organizationName,
  userName,
}: {
  tenant: ErpTenantContext;
  organizationName?: string;
  userName: string;
}) {
  return tenant.providerType === "pathology" ? (
    <PathologyWorkspace tenant={tenant} organizationName={organizationName} />
  ) : (
    <DiagnosticOverview
      tenant={tenant}
      organizationName={organizationName}
      userName={userName}
    />
  );
}

function PathologyWorkspace({
  tenant,
  organizationName,
}: {
  tenant: ErpTenantContext;
  organizationName?: string;
}) {
  const bookings = useQuery({
    queryKey: ["diagnostic-bookings", tenant.organizationId],
    queryFn: () => virujBackend.diagnostics.bookings(tenant.organizationId),
  });
  const services = useQuery({
    queryKey: virujBackend.diagnostics.key(tenant.organizationId, "services"),
    queryFn: () => virujBackend.diagnostics.services(tenant.organizationId),
  });
  const branches = useQuery({
    queryKey: ["diagnostic-availability", tenant.organizationId, "branches"],
    queryFn: () => virujBackend.diagnostics.branches(tenant.organizationId),
  });
  const queries = [bookings, services, branches];
  const rows = bookings.data ?? [];
  const stats = [
    [
      "Appointment requests",
      rows.filter((row) => row.status === "requested").length,
    ],
    [
      "Confirmed appointments",
      rows.filter((row) => row.status === "accepted").length,
    ],
    [
      "Active services",
      services.data?.filter((service) => service.active).length ?? 0,
    ],
    [
      "Published branches",
      branches.data?.filter((branch) => branch.published).length ?? 0,
    ],
  ] as const;
  const upcoming = rows
    .filter(
      (row) =>
        ["requested", "accepted"].includes(row.status) &&
        new Date(row.slot.startsAt).getTime() >= bookings.dataUpdatedAt
    )
    .sort((a, b) => a.slot.startsAt.localeCompare(b.slot.startsAt))
    .slice(0, 5);
  return (
    <div className="mx-auto max-w-7xl space-y-7 p-4 sm:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-300">
            {organizationName || "Pathology workspace"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Appointments. Services. Your centre.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage what patients can book and keep your centre ready for their
            visit.
          </p>
        </div>
        <Link
          href={tenant.buildRoute("services")}
          className="rounded-xl bg-orange-700 px-5 py-3 text-sm font-medium text-white hover:bg-orange-800"
        >
          Manage services
        </Link>
      </header>
      {queries.some((query) => query.isPending) ? (
        <p role="status">Loading your workspace…</p>
      ) : queries.some((query) => query.isError) ? (
        <div role="alert" className="rounded-xl border p-5">
          <p>Some workspace data could not be loaded.</p>
          <button
            className="mt-3 underline"
            onClick={() => {
              for (const query of queries) void query.refetch();
            }}
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(([label, value]) => (
              <article key={label} className="rounded-2xl border bg-card p-6">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-4 text-4xl font-semibold tracking-tight">
                  {value}
                </p>
              </article>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <section className="rounded-2xl border bg-card p-6">
              <div className="flex justify-between gap-3">
                <h2 className="text-lg font-semibold">Upcoming appointments</h2>
                <Link
                  className="text-sm text-orange-700 dark:text-orange-300"
                  href={tenant.buildRoute("appointments")}
                >
                  View all
                </Link>
              </div>
              <div className="mt-5 divide-y">
                {upcoming.length === 0 && (
                  <p className="py-8 text-sm text-muted-foreground">
                    No upcoming appointments. Publish a branch and add
                    appointment slots in Facilities.
                  </p>
                )}
                {upcoming.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-wrap justify-between gap-3 py-4"
                  >
                    <div>
                      <p className="font-medium">{booking.order.patientName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {booking.order.serviceSnapshot.name} ·{" "}
                        {booking.slot.branch.name}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p>
                        {new Date(booking.slot.startsAt).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                      <p className="mt-1 capitalize text-orange-700 dark:text-orange-300">
                        {booking.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border bg-card p-6">
              <h2 className="text-lg font-semibold">Appointment analytics</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Based on the latest {rows.length} bookings returned by the
                server.
              </p>
              <div className="mt-6 space-y-5">
                {(
                  ["requested", "accepted", "declined", "cancelled"] as const
                ).map((status) => {
                  const count = rows.filter(
                    (row) => row.status === status
                  ).length;
                  return (
                    <div key={status}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="capitalize">{status}</span>
                        <span>{count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-orange-600"
                          style={{
                            width: `${rows.length ? (count / rows.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-semibold">Your services</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.data
                ?.filter((service) => service.active)
                .slice(0, 6)
                .map((service) => (
                  <Link
                    key={service.id}
                    href={tenant.buildRoute("services")}
                    className="rounded-xl border p-4 hover:bg-muted"
                  >
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {diagnosticMoney(service.pricePaise)} ·{" "}
                      {service.durationMinutes} minutes
                    </p>
                  </Link>
                ))}
              {!services.data?.some((service) => service.active) && (
                <p className="text-sm text-muted-foreground">
                  Add your first service to start building your app listing.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function DiagnosticOverview({
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
