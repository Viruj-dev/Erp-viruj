"use client";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/erp/input";
import { ErpSelect } from "@/components/ui/erp/select";
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
  type DiagnosticServiceInput,
} from "@/features/dashboard/lib/diagnostics";
import { pathologyServicePresets } from "@/features/dashboard/lib/pathology-services";
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
            {pathology ? "Services" : "Scan catalogue"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure services, preparation, pricing and turnaround time.
          </p>
        </div>
        {canManage && (
          <Button className={accent} onClick={() => setEditing("new")}>
            Add {pathology ? "service" : "scan"}
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
            Add the service details patients will see in the app. Publish your
            branch and add appointment availability when you are ready.
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
  const [kind, setKind] = useState<"pathology" | "radiology">(
    service?.kind ??
      (tenant.providerType === "radiology" ? "radiology" : "pathology")
  );
  const pathology = kind === "pathology";
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
      kind,
      name: String(form.get("name")),
      code: String(form.get("code")),
      pricePaise: Math.round(Number(form.get("price")) * 100),
      turnaroundHours: Number(form.get("turnaroundHours")),
      description: String(form.get("description") ?? ""),
      durationMinutes: Number(form.get("durationMinutes")),
      preparation: String(form.get("preparation")),
      specimen: pathology ? String(form.get("specimen")) : null,
      modality: pathology ? null : String(form.get("modality")),
      parameters: pathology ? (service?.parameters ?? []) : [],
    });
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      {tenant.providerType !== "pathology" && (
        <label className="block space-y-1 text-sm">
          Service type
          <ErpSelect
            className="w-full rounded-lg border bg-background p-2"
            disabled={Boolean(service)}
            value={kind}
            onChange={(e) =>
              setKind(e.target.value as "pathology" | "radiology")
            }
          >
            <option value="pathology">Pathology test / panel</option>
            <option value="radiology">Radiology scan</option>
          </ErpSelect>
        </label>
      )}
      <label className="block space-y-1 text-sm">
        Description
        <textarea
          name="description"
          maxLength={3000}
          defaultValue={service?.description}
          className="min-h-20 w-full rounded-lg border bg-transparent p-3"
        />
      </label>
      <label className="block space-y-1 text-sm">
        Appointment duration (minutes)
        <Input
          name="durationMinutes"
          type="number"
          min="1"
          max="1440"
          required
          defaultValue={service?.durationMinutes ?? 30}
        />
      </label>
      {pathology && (
        <label className="block space-y-1 text-sm">
          Choose a test or service
          <ErpSelect
            defaultValue=""
            onChange={(event) => {
              const preset = pathologyServicePresets.find(
                (item) => item.name === event.target.value
              );
              const form = event.currentTarget.form;
              if (!preset || !form) return;
              for (const key of ["name", "code", "specimen"] as const) {
                const input = form.elements.namedItem(key);
                if (input instanceof HTMLInputElement)
                  input.value = preset[key];
              }
            }}
          >
            <option value="">Custom service / choose from the list</option>
            {[
              ...new Set(pathologyServicePresets.map((item) => item.category)),
            ].map((category) => (
              <optgroup key={category} label={category}>
                {pathologyServicePresets
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <option key={item.code} value={item.name}>
                      {item.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </ErpSelect>
        </label>
      )}
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
