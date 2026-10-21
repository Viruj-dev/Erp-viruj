"use client";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/erp/input";
import { Textarea } from "@/components/ui/erp/textarea";
import { Label } from "@/components/ui/erp/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/erp/dialog";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import {
  diagnosticPermissions,
  type DiagnosticService,
  type DiagnosticServiceInput,
} from "@/features/dashboard/lib/diagnostics";
import { pathologyServicePresets } from "@/features/dashboard/lib/pathology-services";
import { virujBackend } from "@/lib/viruj-backend";
import { ClinicServiceList } from "../facilities/_components/catalog";
import { Search } from "lucide-react";
import { DashboardPageShell } from "../dashboard-page-shell";

export function DiagnosticCatalogue({ tenant }: { tenant: ErpTenantContext }) {
  const client = useQueryClient();
  const [editing, setEditing] = useState<DiagnosticService | "new" | null>(
    null
  );
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
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
  const rows = (query.data ?? []).filter(
    (s) =>
      `${s.name} ${s.code}`.toLowerCase().includes(search.toLowerCase()) &&
      (status === "all" || (status === "active") === s.active)
  );
  const serviceRows = rows.map((service) => ({
    ...service,
    category: "Laboratory" as const,
    startingPrice: service.pricePaise / 100,
    priceText: "",
    currency: "INR",
    shortDescription: service.description || service.preparation,
    description: service.description || "",
    onlineBooking: false,
    appointmentRequired: true,
    status: service.active ? ("active" as const) : ("archived" as const),
    isAvailable: service.active,
  }));
  return (
    <DashboardPageShell
      eyebrow="Services"
      title={pathology ? "Services" : "Scan catalogue"}
      tone={pathology ? "orange" : "slate"}
      subtitle="Showcase your care. Manage the services patients can discover and book."
      actions={
        canManage && (
          <Button
            className={`${accent} h-11 rounded-xl px-4`}
            onClick={() => setEditing("new")}
          >
            Add {pathology ? "service" : "scan"}
          </Button>
        )
      }
    >
      <section className="rounded-2xl border border-slate-200/70 bg-white p-3 dark:border-white/[0.08] dark:bg-[#111418]">
        <div className="flex flex-wrap items-center gap-3">
          <Label className="relative min-w-60 flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              aria-label="Search services"
              placeholder="Search services"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 rounded-xl pl-10"
            />
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger
              aria-label="Service status"
              className="h-11 rounded-xl"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>
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
          {query.data?.length
            ? "No services match these filters."
            : "Your catalogue is empty. A manager can add the first service."}
        </p>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white dark:border-white/[0.08] dark:bg-[#111418]">
          <ClinicServiceList
            tone={pathology ? "orange" : "violet"}
            categoryLabel={pathology ? "Test branch" : "Modality"}
            facilities={serviceRows}
            categoryName={(service) =>
              pathologyServicePresets.find(
                (preset) => preset.code === service.code
              )?.category ||
              service.modality ||
              "Custom service"
            }
            permissions={{
              read: true,
              create: canManage,
              update: canManage,
              publish: canManage,
              archive: canManage,
              delete: false,
            }}
            isUpdatingId={archive.isPending ? archive.variables?.id : null}
            onActivate={(service) => archive.mutate(service)}
            onDeactivate={(service) => archive.mutate(service)}
            onEdit={(service) => setEditing(service)}
            onDelete={() => {}}
          />
        </section>
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
    </DashboardPageShell>
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
  const [selectedService, setSelectedService] = useState(
    pathologyServicePresets.find(
      (item) => item.name === service?.name || item.code === service?.code
    )?.name ?? ""
  );
  const detailsDisabled = pathology && !selectedService;
  const [serviceCode, setServiceCode] = useState(service?.code ?? "");
  const [scheduled, setScheduled] = useState(Boolean(service?.availability));
  const [workingDays, setWorkingDays] = useState(
    service?.availability?.days ?? [1, 2, 3, 4, 5, 6]
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
    const preset = pathologyServicePresets.find(
      (item) => item.name === form.get("pathologyService")
    );
    if (pathology && !preset) return;
    save.mutate({
      kind,
      name: preset?.name ?? String(form.get("name")),
      code: String(form.get("code")),
      pricePaise: Math.round(Number(form.get("price")) * 100),
      turnaroundHours: Number(form.get("turnaroundHours")),
      description: String(form.get("description") ?? ""),
      durationMinutes: Number(form.get("durationMinutes")),
      preparation: String(form.get("preparation")),
      specimen: pathology ? String(form.get("specimen")) : null,
      modality: pathology ? null : String(form.get("modality")),
      parameters: pathology ? (service?.parameters ?? []) : [],
      availability: scheduled
        ? {
            days: workingDays,
            startsAt: String(form.get("availableFrom")),
            endsAt: String(form.get("availableUntil")),
          }
        : null,
    });
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      {pathology ? (
        <input type="hidden" name="code" value={serviceCode} />
      ) : (
        <Label className="block space-y-1 text-sm">
          Service code
          <Input
            name="code"
            required
            maxLength={40}
            value={serviceCode}
            onChange={(event) => setServiceCode(event.target.value)}
          />
        </Label>
      )}
      {tenant.providerType !== "pathology" && (
        <Label className="block space-y-1 text-sm">
          Service type
          <Select
            disabled={Boolean(service)}
            value={kind}
            onValueChange={(value) =>
              setKind(value as "pathology" | "radiology")
            }
          >
            <SelectTrigger aria-label="Service type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pathology">Pathology test / panel</SelectItem>
              <SelectItem value="radiology">Radiology scan</SelectItem>
            </SelectContent>
          </Select>
        </Label>
      )}
      {pathology && (
        <div className="space-y-1 text-sm">
          <Label htmlFor="pathology-service">Choose a test or service</Label>
          <Select
            name="pathologyService"
            required
            value={selectedService}
            onValueChange={(value) => {
              const preset = pathologyServicePresets.find(
                (item) => item.name === value
              );
              if (!preset) return;
              setSelectedService(preset.name);
              setServiceCode(preset.code);
            }}
          >
            <SelectTrigger id="pathology-service" className="w-full">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {[
                ...new Set(
                  pathologyServicePresets.map((item) => item.category)
                ),
              ].map((category) => (
                <SelectGroup key={category}>
                  <SelectLabel>{category}</SelectLabel>
                  {pathologyServicePresets
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <SelectItem key={item.code} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <Label className="block space-y-1 text-sm">
        Description
        <Textarea
          disabled={detailsDisabled}
          name="description"
          maxLength={3000}
          defaultValue={service?.description}
          className="min-h-20 w-full rounded-lg border bg-transparent p-3"
        />
      </Label>
      <Label className="block space-y-1 text-sm">
        Appointment duration (minutes)
        <Input
          disabled={detailsDisabled}
          name="durationMinutes"
          type="number"
          min="1"
          max="1440"
          required
          defaultValue={service?.durationMinutes ?? 30}
        />
      </Label>
      <fieldset
        disabled={detailsDisabled}
        className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-white/10"
      >
        <legend className="px-1 text-sm font-medium">
          Mobile booking hours
        </legend>
        <Label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={scheduled}
            onChange={(event) => setScheduled(event.target.checked)}
          />
          Offer recurring appointment times for this service
        </Label>
        {scheduled && (
          <>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Service working days"
            >
              {[
                [1, "Mon"],
                [2, "Tue"],
                [3, "Wed"],
                [4, "Thu"],
                [5, "Fri"],
                [6, "Sat"],
                [0, "Sun"],
              ].map(([day, name]) => (
                <button
                  key={day}
                  type="button"
                  aria-pressed={workingDays.includes(Number(day))}
                  onClick={() =>
                    setWorkingDays((days) =>
                      days.includes(Number(day))
                        ? days.filter((value) => value !== day)
                        : [...days, Number(day)]
                    )
                  }
                  className={`rounded-lg border px-3 py-2 text-xs font-medium ${workingDays.includes(Number(day)) ? "border-orange-700 bg-orange-50 text-orange-800" : "border-slate-200 text-muted-foreground"}`}
                >
                  {name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Label className="space-y-1 text-sm">
                From (IST)
                <Input
                  type="time"
                  name="availableFrom"
                  required
                  defaultValue={service?.availability?.startsAt ?? "09:00"}
                />
              </Label>
              <Label className="space-y-1 text-sm">
                Until (IST)
                <Input
                  type="time"
                  name="availableUntil"
                  required
                  defaultValue={service?.availability?.endsAt ?? "17:00"}
                />
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Patients choose a time within these hours for the next 7 days.
              Appointment duration sets the spacing. Applies to all published
              branches; existing bookings are kept.
            </p>
          </>
        )}
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Label className="block space-y-1 text-sm">
          Service name
          <Input
            disabled={detailsDisabled}
            required
            maxLength={150}
            name="name"
            readOnly={pathology}
            value={pathology ? selectedService : undefined}
            defaultValue={pathology ? undefined : service?.name}
          />
        </Label>

        <Label className="block space-y-1 text-sm">
          Price (₹)
          <Input
            disabled={detailsDisabled}
            required
            type="number"
            min="0"
            max="1000000"
            step="0.01"
            name="price"
            defaultValue={(service?.pricePaise ?? 0) / 100}
          />
        </Label>
        <Label className="block space-y-1 text-sm">
          Turnaround (hours)
          <Input
            disabled={detailsDisabled}
            required
            type="number"
            min="1"
            max="8760"
            step="1"
            name="turnaroundHours"
            defaultValue={service?.turnaroundHours ?? 24}
          />
        </Label>
        <Label className="block space-y-1 text-sm">
          {pathology ? "Specimen" : "Modality"}
          <Input
            disabled={detailsDisabled}
            required
            name={pathology ? "specimen" : "modality"}
            defaultValue={
              (pathology ? service?.specimen : service?.modality) ?? ""
            }
            placeholder={pathology ? "Whole blood" : "CT, MRI, X-ray…"}
          />
        </Label>
      </div>
      <Label className="block space-y-1 text-sm">
        Preparation instructions
        <Textarea
          disabled={detailsDisabled}
          name="preparation"
          maxLength={3000}
          defaultValue={service?.preparation}
          className="min-h-20 w-full rounded-lg border bg-transparent p-3"
        />
      </Label>
      {save.isError && (
        <p role="alert" className="text-sm text-destructive">
          {save.error.message}
        </p>
      )}
      <Button
        disabled={
          save.isPending ||
          detailsDisabled ||
          (scheduled && !workingDays.length)
        }
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
