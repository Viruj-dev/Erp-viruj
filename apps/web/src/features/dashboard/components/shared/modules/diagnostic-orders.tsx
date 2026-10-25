"use client";

import { useQueryUserId } from "@/lib/use-realtime-invalidation";
import { SectionSkeleton } from "@/features/dashboard/components/shared/page-skeleton";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/erp/input";
import { ErpSelect } from "@/components/ui/erp/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from "@/components/ui/erp/dialog";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import {
  diagnosticLabel,
  diagnosticPermissions,
  diagnosticStages,
  diagnosticMoney,
  type DiagnosticOrder,
  type DiagnosticService
} from "@/features/dashboard/lib/diagnostics";
import { virujBackend } from "@/lib/viruj-backend";
import { DiagnosticCatalogue } from "./diagnostic-catalogue";
import { DiagnosticReport } from "./diagnostic-report";
import { DiagnosticBookingInbox } from "./diagnostic-bookings";
import { DiagnosticAvailability } from "./diagnostic-availability";

export function DiagnosticOrders({
  tenant,
  organizationName,
  initialTab = "orders"
}: {
  tenant: ErpTenantContext;
  organizationName?: string;
  initialTab?: "orders" | "reports" | "bookings";
}) {
  const userId = useQueryUserId();
  const client = useQueryClient();
  const [tab, setTab] = useState<
    "orders" | "catalogue" | "reports" | "bookings" | "availability"
  >(initialTab);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const key = virujBackend.diagnostics.key(userId, tenant.organizationId, "orders");
  const orders = useQuery({
    queryKey: key,
    queryFn: () => virujBackend.diagnostics.orders(tenant.organizationId)
  });
  const services = useQuery({
    queryKey: virujBackend.diagnostics.key(userId, tenant.organizationId, "services"),
    queryFn: () => virujBackend.diagnostics.services(tenant.organizationId)
  });
  const selected = orders.data?.find((order) => order.id === selectedId);
  const pathology = tenant.providerType === "pathology";
  const accent = pathology
    ? "bg-orange-700 text-white hover:bg-orange-800"
    : "bg-rose-700 text-white hover:bg-rose-800";
  const kind = pathology ? "pathology" : "radiology";
  const rows = (orders.data ?? []).filter(
    (order) =>
      (tab !== "reports" || order.status === "released") &&
      (status === "all" || order.status === status) &&
      `${order.patientName} ${order.patientPhone} ${order.id} ${order.barcode ?? ""} ${order.serviceSnapshot.name}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );
  return (
    <div className="w-full space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {pathology ? "Pathology" : "Radiology"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold">
            {pathology ? "Laboratory operations" : "Imaging operations"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {pathology
              ? "From sample collection to an authorised report."
              : "From scan scheduling to an authorised report."}
          </p>
        </div>
        <Button className={accent} onClick={() => setCreating(true)}>
          New {pathology ? "test" : "scan"} order
        </Button>
      </header>
      <div className="flex flex-wrap gap-2" aria-label="Diagnostic sections">
        {(
          [
            "catalogue",
            "bookings",
            "orders",
            "reports",
            "availability"
          ] as const
        ).map((value) => (
          <Button
            key={value}
            aria-pressed={tab === value}
            variant={tab === value ? "default" : "outline"}
            className={tab === value ? accent : ""}
            onClick={() => {
              setTab(value);
              setStatus("all");
            }}
          >
            {diagnosticLabel(value)}
          </Button>
        ))}
      </div>
      {tab === "bookings" ? (
        <DiagnosticBookingInbox tenant={tenant} />
      ) : tab === "availability" ? (
        <DiagnosticAvailability
          tenant={tenant}
          organizationName={organizationName}
        />
      ) : tab === "catalogue" ? (
        <DiagnosticCatalogue tenant={tenant} />
      ) : (
        <section className="overflow-hidden rounded-2xl border bg-card">
          <div className="flex flex-wrap gap-3 border-b p-4">
            <Input
              aria-label="Search diagnostic orders"
              placeholder="Patient, test, sample ID or order ID"
              className="max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {tab !== "reports" && (
              <ErpSelect
                aria-label="Order status"
                className="rounded-lg border bg-background px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All statuses</option>
                {[...diagnosticStages[kind], "cancelled"].map((stage) => (
                  <option key={stage} value={stage}>
                    {diagnosticLabel(stage)}
                  </option>
                ))}
              </ErpSelect>
            )}
            <Button
              variant="outline"
              disabled={orders.isFetching}
              onClick={() => void orders.refetch()}
            >
              Refresh
            </Button>
          </div>
          {orders.isPending ? (
            <SectionSkeleton />
          ) : orders.isError ? (
            <p className="p-8 text-sm text-destructive" role="alert">
              {orders.error.message}
            </p>
          ) : !rows.length ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              {tab === "reports"
                ? "No released reports match your search."
                : "No orders match. Create an order after adding a service to your catalogue."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    {[
                      "Patient",
                      "Service",
                      "Priority",
                      "Status",
                      "Created",
                      "Action"
                    ].map((label) => (
                      <th key={label} scope="col" className="px-5 py-3">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((order) => (
                    <tr key={order.id} className="border-t">
                      <td className="px-5 py-4">
                        <p className="font-semibold">{order.patientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.patientPhone}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        {order.serviceSnapshot.name}
                      </td>
                      <td className="px-5 py-4">
                        {order.priority === "urgent" ? (
                          <span className="font-semibold text-red-700 dark:text-red-300">
                            Urgent
                          </span>
                        ) : (
                          "Routine"
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {diagnosticLabel(order.status)}
                      </td>
                      <td className="px-5 py-4">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedId(order.id)}
                        >
                          Open
                          <span className="sr-only">
                            {" "}
                            order for {order.patientName}
                          </span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="border-t p-4 text-xs text-muted-foreground">
            Showing the latest 200 orders. Sample identifiers are unique;
            reports require doctor authorisation.
          </p>
        </section>
      )}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogTitle>New diagnostic order</DialogTitle>
          <DialogDescription>
            Register the patient and select one test panel or scan.
          </DialogDescription>
          {services.isPending ? (
            <SectionSkeleton />
          ) : services.isError ? (
            <p role="alert">
              Unable to load services. Close this form and refresh.
            </p>
          ) : (
            <NewOrder
              tenant={tenant}
              services={services.data ?? []}
              onSaved={() => {
                setCreating(false);
                void client.invalidateQueries({ queryKey: key });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogTitle>
            {selected?.patientName} · {selected?.serviceSnapshot.name}
          </DialogTitle>
          <DialogDescription>
            Track progress and review the diagnostic record.
          </DialogDescription>
          {selected && (
            <OrderDetail
              key={`${selected.id}:${selected.version}`}
              order={selected}
              tenant={tenant}
              organizationName={organizationName}
              onSaved={() => void client.invalidateQueries({ queryKey: key })}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewOrder({
  tenant,
  services,
  onSaved
}: {
  tenant: ErpTenantContext;
  services: DiagnosticService[];
  onSaved: () => void;
}) {
  const active = services.filter((s) => s.active);
  const [serviceId, setServiceId] = useState(active[0]?.id ?? "");
  const selected = active.find((s) => s.id === serviceId);
  const save = useMutation({
    mutationFn: (
      body: Parameters<typeof virujBackend.diagnostics.createOrder>[1]
    ) => virujBackend.diagnostics.createOrder(tenant.organizationId, body),
    onSuccess: onSaved
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    save.mutate({
      serviceId,
      patientName: String(f.get("patientName")),
      patientPhone: String(f.get("patientPhone")),
      patientAge:
        f.get("patientAge") === "" ? null : Number(f.get("patientAge")),
      patientSex: String(f.get("patientSex")),
      referringDoctor: String(f.get("referringDoctor")),
      branch: String(f.get("branch")),
      priority: String(f.get("priority"))
    });
  }
  if (!active.length)
    return (
      <p className="text-sm text-muted-foreground">
        A manager must add an active service in the Catalogue tab before
        creating orders.
      </p>
    );
  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block space-y-1 text-sm">
        Test / scan
        <ErpSelect
          className="w-full rounded-lg border bg-background p-2"
          required
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
        >
          {active.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {diagnosticMoney(s.pricePaise)}
            </option>
          ))}
        </ErpSelect>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          Patient name
          <Input name="patientName" required maxLength={150} />
        </label>
        <label className="space-y-1 text-sm">
          Phone
          <Input name="patientPhone" type="tel" maxLength={30} />
        </label>
        <label className="space-y-1 text-sm">
          Age (years)
          <Input name="patientAge" type="number" min="0" max="150" step="1" />
        </label>
        <label className="space-y-1 text-sm">
          Sex
          <Input name="patientSex" maxLength={40} />
        </label>
        <label className="space-y-1 text-sm">
          Referring doctor
          <Input name="referringDoctor" maxLength={150} />
        </label>
        <label className="space-y-1 text-sm">
          Branch
          <Input name="branch" maxLength={150} />
        </label>
        <label className="space-y-1 text-sm">
          Priority
          <ErpSelect
            name="priority"
            className="w-full rounded-lg border bg-background p-2"
          >
            <option value="routine">Routine</option>
            <option value="urgent">Urgent</option>
          </ErpSelect>
        </label>
      </div>
      {selected?.preparation && (
        <p className="whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm">
          Preparation: {selected.preparation}
        </p>
      )}
      {save.isError && (
        <p role="alert" className="text-sm text-destructive">
          {save.error.message}
        </p>
      )}
      <Button
        type="submit"
        disabled={save.isPending}
        className={
          tenant.providerType === "pathology"
            ? "bg-orange-700 text-white hover:bg-orange-800"
            : "bg-rose-700 text-white hover:bg-rose-800"
        }
      >
        {save.isPending ? "Creating…" : "Create order"}
      </Button>
    </form>
  );
}

function OrderDetail({
  order,
  tenant,
  organizationName,
  onSaved
}: {
  order: DiagnosticOrder;
  tenant: ErpTenantContext;
  organizationName?: string;
  onSaved: () => void;
}) {
  const permissions = diagnosticPermissions(tenant.role);
  const [note, setNote] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [confirmRelease, setConfirmRelease] = useState(false);
  const update = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      virujBackend.diagnostics.updateOrder(tenant.organizationId, order.id, {
        ...body,
        version: order.version
      }),
    onSuccess: onSaved
  });
  const stages = diagnosticStages[order.kind];
  const next = stages[stages.indexOf(order.status) + 1];
  const terminal = ["released", "cancelled"].includes(order.status);
  const editable =
    order.kind === "pathology"
      ? order.status === "processing"
      : order.status === "reporting";
  const clinicalNext =
    next === "review" || next === "processing" || next === "reporting";
  const canAdvance =
    next === "released"
      ? permissions.release
      : clinicalNext
        ? permissions.results
        : true;
  const accent =
    tenant.providerType === "pathology"
      ? "bg-orange-700 text-white hover:bg-orange-800"
      : "bg-rose-700 text-white hover:bg-rose-800";
  function results(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    update.mutate({
      action: "results",
      results: order.serviceSnapshot.parameters.map((p, i) => ({
        ...p,
        value: String(f.get(`result-${i}`) ?? "")
      })),
      findings: String(f.get("findings") ?? ""),
      imageUrl: String(f.get("imageUrl") ?? ""),
      impression: String(f.get("impression") ?? ""),
      reportNote: String(f.get("reportNote") ?? "")
    });
  }
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {stages.map((stage) => (
          <span
            key={stage}
            className={`rounded-md border px-2 py-1 text-xs ${stage === order.status ? accent : "text-muted-foreground"}`}
          >
            {diagnosticLabel(stage)}
          </span>
        ))}
      </div>
      <dl className="grid gap-3 rounded-xl bg-muted/40 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">
            {order.kind === "radiology" ? "Study ID" : "Order ID"}
          </dt>
          <dd className="break-all">{order.id}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Status / priority</dt>
          <dd>
            {diagnosticLabel(order.status)} / {order.priority}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Patient</dt>
          <dd>
            {order.patientAge ?? "Age not provided"} ·{" "}
            {order.patientSex || "Sex not provided"} · {order.patientPhone}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Price at order</dt>
          <dd>{diagnosticMoney(order.serviceSnapshot.pricePaise)}</dd>
        </div>
        {order.barcode && (
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Sample identifier</dt>
            <dd className="break-all font-mono text-xs">{order.barcode}</dd>
          </div>
        )}
        {order.scheduledAt && (
          <div>
            <dt className="text-muted-foreground">Scheduled</dt>
            <dd>{new Date(order.scheduledAt).toLocaleString("en-IN")}</dd>
          </div>
        )}
        {order.sampleNote && (
          <div>
            <dt className="text-muted-foreground">
              Cancellation / recollection reason
            </dt>
            <dd>{order.sampleNote}</dd>
          </div>
        )}
      </dl>
      {order.status === "released" ? (
        <DiagnosticReport order={order} organizationName={organizationName} />
      ) : (
        <>
          {editable && permissions.results && (
            <form onSubmit={results} className="space-y-4">
              <h3 className="font-semibold">
                {order.kind === "pathology" ? "Test results" : "Report draft"}
              </h3>
              {order.kind === "pathology" ? (
                order.serviceSnapshot.parameters.map((p, i) => (
                  <label key={p.name} className="block space-y-1 text-sm">
                    {p.name} {p.unit && `(${p.unit})`}
                    <Input
                      name={`result-${i}`}
                      maxLength={500}
                      defaultValue={
                        order.results.find((r) => r.name === p.name)?.value ??
                        ""
                      }
                    />
                    <span className="text-xs text-muted-foreground">
                      {p.reference || "Reference range not configured"}
                    </span>
                  </label>
                ))
              ) : (
                <>
                  <label className="block space-y-1 text-sm">
                    Secure image / DICOM viewer link
                    <Input
                      name="imageUrl"
                      type="url"
                      maxLength={2000}
                      defaultValue={order.imageUrl ?? ""}
                      placeholder="https://�"
                    />
                  </label>
                  {(["findings", "impression"] as const).map((field) => (
                    <label key={field} className="block space-y-1 text-sm">
                      {diagnosticLabel(field)}
                      <textarea
                        name={field}
                        defaultValue={order[field]}
                        maxLength={field === "findings" ? 20000 : 10000}
                        className="min-h-28 w-full rounded-lg border bg-background p-3"
                      />
                    </label>
                  ))}
                </>
              )}
              <label className="block space-y-1 text-sm">
                Report note
                <textarea
                  name="reportNote"
                  defaultValue={order.reportNote}
                  maxLength={5000}
                  className="min-h-20 w-full rounded-lg border bg-background p-3"
                />
              </label>
              <Button
                type="submit"
                disabled={update.isPending}
                className={accent}
              >
                Save draft
              </Button>
            </form>
          )}
          {order.status === "review" && (
            <div className="space-y-3 rounded-xl border p-4">
              <h3 className="font-semibold">
                Review report before authorisation
              </h3>
              {order.kind === "pathology" ? (
                order.results.map((r) => (
                  <p key={r.name} className="text-sm">
                    {r.name}:{" "}
                    <strong>
                      {r.value} {r.unit}
                    </strong>{" "}
                    · {r.reference}
                  </p>
                ))
              ) : (
                <>
                  <h4 className="text-sm font-semibold">Findings</h4>
                  <p className="whitespace-pre-wrap text-sm">
                    {order.findings}
                  </p>
                  <h4 className="text-sm font-semibold">Impression</h4>
                  <p className="whitespace-pre-wrap text-sm">
                    {order.impression}
                  </p>
                </>
              )}
              {order.kind === "radiology" &&
                order.imageUrl &&
                /^https?:\/\//i.test(order.imageUrl) && (
                  <a
                    href={order.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline"
                  >
                    Open study images
                  </a>
                )}
              {order.reportNote && (
                <p className="whitespace-pre-wrap text-sm">
                  {order.reportNote}
                </p>
              )}
              {permissions.results && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={update.isPending}
                  onClick={() =>
                    update.mutate({
                      action: "transition",
                      status:
                        order.kind === "pathology" ? "processing" : "reporting"
                    })
                  }
                >
                  Return for corrections
                </Button>
              )}
              {permissions.release ? (
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={confirmRelease}
                    onChange={(e) => setConfirmRelease(e.target.checked)}
                    className="mt-1"
                  />
                  I have reviewed this report and authorise its release.
                  Released reports cannot be edited.
                </label>
              ) : (
                <p className="text-sm text-muted-foreground">
                  A team member with the Doctor role must authorise this report.
                </p>
              )}
            </div>
          )}
          {!terminal && next && canAdvance && (
            <div className="space-y-3 border-t pt-4">
              {next === "scheduled" && (
                <label className="block space-y-1 text-sm">
                  Scheduled date and time (your local time)
                  <Input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </label>
              )}
              <Button
                type="button"
                className={accent}
                disabled={
                  update.isPending ||
                  (next === "released" && !confirmRelease) ||
                  (next === "scheduled" && !scheduledAt)
                }
                onClick={() =>
                  update.mutate({
                    action: "transition",
                    status: next,
                    ...(scheduledAt
                      ? { scheduledAt: new Date(scheduledAt).toISOString() }
                      : {})
                  })
                }
              >
                {next === "released"
                  ? "Authorise and release report"
                  : `Mark as ${diagnosticLabel(next).toLowerCase()}`}
              </Button>
              {editable && (
                <p className="text-xs text-muted-foreground">
                  Save the draft before sending it for review.
                </p>
              )}
            </div>
          )}
          {!terminal && (
            <div className="space-y-3 border-t pt-4">
              <label className="block space-y-1 text-sm">
                Reason for cancellation
                {order.kind === "pathology" &&
                ["collected", "received"].includes(order.status)
                  ? " or recollection"
                  : ""}
                <Input
                  value={note}
                  maxLength={1000}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!note.trim() || update.isPending}
                  onClick={() =>
                    update.mutate({
                      action: "transition",
                      status: "cancelled",
                      note
                    })
                  }
                >
                  Cancel order
                </Button>
                {order.kind === "pathology" &&
                  ["collected", "received"].includes(order.status) && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!note.trim() || update.isPending}
                      onClick={() =>
                        update.mutate({
                          action: "transition",
                          status: "ordered",
                          note
                        })
                      }
                    >
                      Request recollection
                    </Button>
                  )}
              </div>
            </div>
          )}
        </>
      )}
      {update.isError && (
        <p role="alert" className="text-sm text-destructive">
          {update.error.message} Refresh the order list to load the latest
          record.
        </p>
      )}
    </div>
  );
}
