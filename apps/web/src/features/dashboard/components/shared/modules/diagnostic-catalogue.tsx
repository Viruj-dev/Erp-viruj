"use client";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/erp/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/erp/dialog";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import {
  diagnosticMoney,
  diagnosticPermissions,
  type DiagnosticService,
  type DiagnosticParameter,
  type DiagnosticServiceInput,
} from "@/features/dashboard/lib/diagnostics";
import { virujBackend } from "@/lib/viruj-backend";

export function DiagnosticCatalogue({ tenant }: { tenant: ErpTenantContext }) {
  const client = useQueryClient();
  const [editing, setEditing] = useState<DiagnosticService | "new" | null>(
    null
  );
  const [search, setSearch] = useState("");
  const canManage = diagnosticPermissions(tenant.role).catalogue;
  const key = virujBackend.diagnostics.key(tenant.organizationId, "services");
  const query = useQuery({
    queryKey: key,
    queryFn: () => virujBackend.diagnostics.services(tenant.organizationId),
  });
  const archive = useMutation({
    mutationFn: (service: DiagnosticService) =>
      virujBackend.diagnostics.setServiceActive(
        tenant.organizationId,
        service.id,
        !service.active
      ),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  const pathology = tenant.providerType === "pathology";
  const accent = pathology
    ? "bg-orange-700 text-white hover:bg-orange-800"
    : "bg-zinc-700 text-white hover:bg-zinc-800";
  const rows = (query.data ?? []).filter((s) =>
    `${s.name} ${s.code}`.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">
            {pathology ? "Test catalogue" : "Scan catalogue"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure services, preparation, pricing and turnaround time.
          </p>
        </div>
        {canManage && (
          <Button className={accent} onClick={() => setEditing("new")}>
            Add {pathology ? "test" : "scan"}
          </Button>
        )}
      </div>
      <Input
        aria-label="Search catalogue"
        placeholder="Search by name or code"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      {query.isPending ? (
        <p role="status">Loading catalogue…</p>
      ) : query.isError ? (
        <div role="alert" className="rounded-xl border p-5">
          <p>Unable to load the catalogue.</p>
          <Button variant="outline" onClick={() => void query.refetch()}>
            Try again
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          {search
            ? "No matching services."
            : "Your catalogue is empty. A manager can add the first service."}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((service) => (
            <article
              key={service.id}
              className="space-y-4 rounded-2xl border bg-card p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold tracking-widest text-muted-foreground">
                  {service.code}
                </span>
                <span className="rounded-md bg-muted px-2 py-1 text-xs">
                  {service.active ? "Active" : "Archived"}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{service.name}</h3>
              <p className="text-sm text-muted-foreground">
                {service.specimen || service.modality} ·{" "}
                {service.turnaroundHours} hour turnaround
              </p>
              <p className="text-2xl font-semibold">
                {diagnosticMoney(service.pricePaise)}
              </p>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {service.preparation ||
                  "No preparation instructions configured."}
              </p>
              {canManage && (
                <div className="flex gap-2 border-t pt-4">
                  <Button variant="outline" onClick={() => setEditing(service)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    disabled={archive.isPending}
                    onClick={() => archive.mutate(service)}
                  >
                    {service.active ? "Archive" : "Activate"}
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {archive.isError && (
        <p role="alert" className="text-sm text-destructive">
          {archive.error.message}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Showing up to 200 catalogue entries. Existing orders retain their
        original service configuration.
      </p>
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogTitle>
            {editing === "new" ? "Add service" : "Edit service"}
          </DialogTitle>
          <DialogDescription>
            Reference ranges are configured by your laboratory and copied into
            each new order.
          </DialogDescription>
          {editing && (
            <ServiceForm
              key={editing === "new" ? "new" : editing.id}
              tenant={tenant}
              service={editing === "new" ? undefined : editing}
              onSaved={() => {
                setEditing(null);
                void client.invalidateQueries({ queryKey: key });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ServiceForm({
  tenant,
  service,
  onSaved,
}: {
  tenant: ErpTenantContext;
  service?: DiagnosticService;
  onSaved: () => void;
}) {
  const pathology = tenant.providerType === "pathology";
  const [parameters, setParameters] = useState<DiagnosticParameter[]>(
    service?.parameters ?? [{ name: "", unit: "", reference: "" }]
  );
  const save = useMutation({
    mutationFn: (data: DiagnosticServiceInput) =>
      virujBackend.diagnostics.saveService(
        tenant.organizationId,
        data,
        service?.id
      ),
    onSuccess: onSaved,
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    save.mutate({
      name: String(form.get("name")),
      code: String(form.get("code")),
      pricePaise: Math.round(Number(form.get("price")) * 100),
      turnaroundHours: Number(form.get("turnaroundHours")),
      preparation: String(form.get("preparation")),
      specimen: pathology ? String(form.get("specimen")) : null,
      modality: pathology ? null : String(form.get("modality")),
      parameters: pathology ? parameters : [],
    });
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          Service name
          <Input
            required
            maxLength={150}
            name="name"
            defaultValue={service?.name}
          />
        </label>
        <label className="space-y-1 text-sm">
          Service code
          <Input
            required
            maxLength={40}
            name="code"
            defaultValue={service?.code}
          />
        </label>
        <label className="space-y-1 text-sm">
          Price (₹)
          <Input
            required
            type="number"
            min="0"
            max="1000000"
            step="0.01"
            name="price"
            defaultValue={(service?.pricePaise ?? 0) / 100}
          />
        </label>
        <label className="space-y-1 text-sm">
          Turnaround (hours)
          <Input
            required
            type="number"
            min="1"
            max="8760"
            step="1"
            name="turnaroundHours"
            defaultValue={service?.turnaroundHours ?? 24}
          />
        </label>
        <label className="space-y-1 text-sm">
          {pathology ? "Specimen" : "Modality"}
          <Input
            required
            name={pathology ? "specimen" : "modality"}
            defaultValue={
              (pathology ? service?.specimen : service?.modality) ?? ""
            }
            placeholder={pathology ? "Whole blood" : "CT, MRI, X-ray…"}
          />
        </label>
      </div>
      <label className="block space-y-1 text-sm">
        Preparation instructions
        <textarea
          name="preparation"
          maxLength={3000}
          defaultValue={service?.preparation}
          className="min-h-20 w-full rounded-lg border bg-transparent p-3"
        />
      </label>
      {pathology && (
        <fieldset className="space-y-3 rounded-xl border p-4">
          <legend className="px-2 text-sm font-semibold">
            Result parameters
          </legend>
          {parameters.map((p, index) => (
            <div
              key={index}
              className="grid gap-2 sm:grid-cols-[1fr_0.7fr_1fr_auto]"
            >
              <Input
                aria-label={`Parameter ${index + 1} name`}
                required
                placeholder="Parameter"
                value={p.name}
                onChange={(e) =>
                  setParameters((rows) =>
                    rows.map((row, i) =>
                      i === index ? { ...row, name: e.target.value } : row
                    )
                  )
                }
              />
              <Input
                aria-label={`Parameter ${index + 1} unit`}
                placeholder="Unit"
                value={p.unit}
                onChange={(e) =>
                  setParameters((rows) =>
                    rows.map((row, i) =>
                      i === index ? { ...row, unit: e.target.value } : row
                    )
                  )
                }
              />
              <Input
                aria-label={`Parameter ${index + 1} reference range`}
                placeholder="Reference / applicability"
                value={p.reference}
                onChange={(e) =>
                  setParameters((rows) =>
                    rows.map((row, i) =>
                      i === index ? { ...row, reference: e.target.value } : row
                    )
                  )
                }
              />
              <Button
                type="button"
                variant="outline"
                aria-label={`Remove parameter ${index + 1}`}
                disabled={parameters.length === 1}
                onClick={() =>
                  setParameters((rows) => rows.filter((_, i) => i !== index))
                }
              >
                ×
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            disabled={parameters.length >= 100}
            onClick={() =>
              setParameters((rows) => [
                ...rows,
                { name: "", unit: "", reference: "" },
              ])
            }
          >
            Add parameter
          </Button>
        </fieldset>
      )}
      {save.isError && (
        <p role="alert" className="text-sm text-destructive">
          {save.error.message}
        </p>
      )}
      <Button
        disabled={save.isPending}
        type="submit"
        className={
          pathology
            ? "bg-orange-700 text-white hover:bg-orange-800"
            : "bg-zinc-700 text-white hover:bg-zinc-800"
        }
      >
        {save.isPending ? "Saving…" : "Save service"}
      </Button>
    </form>
  );
}
