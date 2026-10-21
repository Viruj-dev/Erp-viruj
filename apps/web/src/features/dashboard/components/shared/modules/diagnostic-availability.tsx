"use client";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/erp/input";
import { ErpSelect } from "@/components/ui/erp/select";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { diagnosticPermissions } from "@/features/dashboard/lib/diagnostics";
import type { DiagnosticBranch } from "@/features/dashboard/lib/diagnostic-bookings";
import Link from "next/link";
import { virujBackend } from "@/lib/viruj-backend";
import { DateTimePicker } from "../../hospital/pages/onboarding/date-time-picker";
import { appointmentUtcDateTime } from "./appointments/utils";

export function DiagnosticAvailability({
  tenant,
  organizationName,
}: {
  tenant: ErpTenantContext;
  organizationName?: string;
}) {
  const client = useQueryClient(),
    prefix = ["diagnostic-availability", tenant.organizationId];
  const branches = useQuery({
    queryKey: [...prefix, "branches"],
    queryFn: () => virujBackend.diagnostics.branches(tenant.organizationId),
  });
  const slots = useQuery({
    queryKey: [...prefix, "slots"],
    queryFn: () => virujBackend.diagnostics.slots(tenant.organizationId),
  });
  const services = useQuery({
    queryKey: virujBackend.diagnostics.key(tenant.organizationId, "services"),
    queryFn: () => virujBackend.diagnostics.services(tenant.organizationId),
  });
  const [showBranch, setShowBranch] = useState(false),
    [showSlot, setShowSlot] = useState(false);
  const [editingBranch, setEditingBranch] = useState<DiagnosticBranch | null>(
    null
  );
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [slotError, setSlotError] = useState("");
  const refresh = () => {
    void client.invalidateQueries({ queryKey: prefix });
  };
  const branchMutation = useMutation({
    mutationFn: ({
      body,
      id,
    }: {
      body: Record<string, unknown>;
      id?: string;
    }) => virujBackend.diagnostics.saveBranch(tenant.organizationId, body, id),
    onSuccess: () => {
      setShowBranch(false);
      setEditingBranch(null);
      refresh();
    },
  });
  const slotMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      virujBackend.diagnostics.createSlot(tenant.organizationId, body),
    onSuccess: () => {
      setShowSlot(false);
      refresh();
    },
  });
  const manage = diagnosticPermissions(tenant.role).catalogue;
  function branchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    branchMutation.mutate({
      id: editingBranch?.id,
      body: {
        ...(editingBranch
          ? {}
          : { centreName: organizationName || "Diagnostic centre" }),
        name: f.get("name"),
        address: f.get("address"),
        phone: f.get("phone"),
        published: f.get("published") === "on",
        homeCollection: f.get("homeCollection") === "on",
        latitude: Number(f.get("latitude")),
        longitude: Number(f.get("longitude")),
      },
    });
  }
  function slotSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSlotError("");
    let start: string, end: string;
    try {
      start = appointmentUtcDateTime(startsAt, "Asia/Kolkata");
      end = appointmentUtcDateTime(endsAt, "Asia/Kolkata");
      if (Date.parse(end) <= Date.parse(start))
        throw new Error("The end time must be later than the start time.");
    } catch (error) {
      setSlotError(
        error instanceof Error ? error.message : "Select a date and time."
      );
      return;
    }
    slotMutation.mutate({
      branchId: f.get("branchId"),
      serviceId: f.get("serviceId"),
      resource: f.get("resource"),
      startsAt: start,
      endsAt: end,
      blocked: f.get("blocked") === "on",
    });
  }
  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">
          Publish your centre to the patient app
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete organization setup, add an active service with its price, and
          save your branch location. Publish when ready so nearby patients can
          find your centre. Appointment slots let them request a booking.
        </p>
      </header>
      <div className="flex flex-wrap gap-4 text-sm">
        <Link
          className="underline underline-offset-4"
          href={tenant.buildRoute("onboarding")}
        >
          Organization setup & primary location
        </Link>
        <Link
          className="underline underline-offset-4"
          href={tenant.buildRoute(
            tenant.providerType === "pathology" ? "services" : "radiology"
          )}
        >
          Services & prices
        </Link>
      </div>
      {[branches, slots, services].some((q) => q.isError) && (
        <p role="alert" className="text-destructive">
          Unable to load availability. Refresh this page.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {manage && (
          <>
            <Button
              variant="outline"
              onClick={() => {
                setEditingBranch(null);
                setShowBranch((v) => !v);
              }}
            >
              Add branch
            </Button>
            <Button variant="outline" onClick={() => setShowSlot((v) => !v)}>
              Add appointment slot
            </Button>
          </>
        )}
      </div>
      {!branches.isPending && !branches.isError && !branches.data?.length && (
        <p className="rounded-2xl border p-5 text-sm text-muted-foreground">
          No branches yet. Complete organization setup to create your primary
          branch, or add a branch above.
        </p>
      )}
      {showBranch && (
        <form
          key={editingBranch?.id ?? "new"}
          onSubmit={branchSubmit}
          className="space-y-4 rounded-2xl border p-5"
        >
          <h3 className="font-semibold">
            {editingBranch ? "Edit branch & map location" : "New branch"}
          </h3>
          <label className="block text-sm">
            Branch name
            <Input
              name="name"
              required
              maxLength={150}
              defaultValue={editingBranch?.name}
            />
          </label>
          <label className="block text-sm">
            Full address
            <Input
              name="address"
              required
              maxLength={1000}
              defaultValue={editingBranch?.address}
            />
          </label>
          <label className="block text-sm">
            Phone
            <Input
              name="phone"
              type="tel"
              maxLength={30}
              defaultValue={editingBranch?.phone}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              Latitude
              <Input
                name="latitude"
                type="number"
                step="any"
                min={-90}
                max={90}
                required
                defaultValue={editingBranch?.latitude ?? ""}
                placeholder="e.g. 28.6139"
              />
            </label>
            <label className="block text-sm">
              Longitude
              <Input
                name="longitude"
                type="number"
                step="any"
                min={-180}
                max={180}
                required
                defaultValue={editingBranch?.longitude ?? ""}
                placeholder="e.g. 77.2090"
              />
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Use the coordinates of this branch's map pin. Patients only see
            centres within their selected search radius.
          </p>
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              name="published"
              defaultChecked={editingBranch?.published}
            />
            Publish this branch and its active catalogue in the patient app
          </label>
          {tenant.providerType === "pathology" && (
            <label className="flex gap-2 text-sm">
              <input
                type="checkbox"
                name="homeCollection"
                defaultChecked={editingBranch?.homeCollection}
              />
              Offer home collection
            </label>
          )}
          <div className="flex gap-3">
            <Button type="submit" disabled={branchMutation.isPending}>
              Save branch
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowBranch(false);
                setEditingBranch(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
      {branchMutation.isError && (
        <p role="alert" className="text-destructive">
          {branchMutation.error.message}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {branches.data?.map((branch) => (
          <article key={branch.id} className="space-y-2 rounded-2xl border p-5">
            <h3 className="font-semibold">{branch.name}</h3>
            <p className="text-sm text-muted-foreground">{branch.address}</p>
            <p className="text-sm">
              {branch.published && !branch.publicationIssues?.length
                ? "Published for nearby patients"
                : branch.published
                  ? "Published, but not visible yet"
                  : "Private — not visible in the app"}{" "}
              ·{" "}
              {branch.homeCollection
                ? "Home collection available"
                : "Centre visits"}
            </p>
            {branch.latitude != null && branch.longitude != null && (
              <p className="text-xs text-muted-foreground">
                Map location: {branch.latitude}, {branch.longitude}
              </p>
            )}
            {!!branch.publicationIssues?.length && (
              <div className="rounded-xl bg-muted p-3 text-sm">
                <p className="font-medium">
                  Before this branch can appear in the app:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {branch.publicationIssues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            {branch.published &&
              !branch.publicationIssues?.length &&
              !slots.isPending &&
              !slots.isError &&
              !slots.data?.some(
                (slot) =>
                  slot.branchId === branch.id &&
                  !slot.blocked &&
                  !slot.reserved &&
                  new Date(slot.startsAt).getTime() > Date.now()
              ) && (
                <p className="text-sm text-muted-foreground">
                  Published, but no available appointment slots are listed. Add
                  slots to accept app bookings.
                </p>
              )}
            {manage && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={branchMutation.isPending}
                  onClick={() => {
                    branchMutation.reset();
                    setEditingBranch(branch);
                    setShowBranch(true);
                  }}
                >
                  Edit branch & location
                </Button>
                <Button
                  variant="outline"
                  disabled={
                    branchMutation.isPending ||
                    (!branch.published &&
                      Boolean(branch.publicationIssues?.length))
                  }
                  onClick={() =>
                    branchMutation.mutate({
                      id: branch.id,
                      body: {
                        name: branch.name,
                        address: branch.address,
                        phone: branch.phone,
                        homeCollection: branch.homeCollection,
                        published: !branch.published,
                      },
                    })
                  }
                >
                  {branch.published
                    ? "Unpublish from app"
                    : "Publish to patient app"}
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>
      {showSlot && (
        <form
          onSubmit={slotSubmit}
          className="grid gap-4 rounded-2xl border p-5 sm:grid-cols-2"
        >
          <h3 className="font-semibold sm:col-span-2">
            New appointment slot · Indian Standard Time
          </h3>
          <label className="text-sm">
            Branch
            <ErpSelect
              name="branchId"
              required
              className="w-full rounded-lg border bg-background p-2"
            >
              <option value="">Select branch</option>
              {branches.data?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </ErpSelect>
          </label>
          <label className="text-sm">
            Service
            <ErpSelect
              name="serviceId"
              required
              className="w-full rounded-lg border bg-background p-2"
            >
              <option value="">Select service</option>
              {services.data
                ?.filter((s) => s.active)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </ErpSelect>
          </label>
          <label className="text-sm">
            {tenant.providerType === "pathology"
              ? "Appointment counter / collection desk"
              : "Machine / resource identifier"}
            <Input
              name="resource"
              required
              maxLength={150}
              placeholder={
                tenant.providerType === "pathology"
                  ? "Collection desk 1"
                  : "MRI-1"
              }
            />
          </label>
          <DateTimePicker
            label="Starts"
            value={startsAt}
            onChange={setStartsAt}
            themeClassName={`vh-onboarding--${tenant.providerType}`}
          />
          <DateTimePicker
            label="Ends"
            value={endsAt}
            onChange={setEndsAt}
            themeClassName={`vh-onboarding--${tenant.providerType}`}
          />
          {slotError && (
            <p role="alert" className="text-sm text-destructive sm:col-span-2">
              {slotError}
            </p>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="blocked" />
            Unavailable during this time
          </label>
          <Button type="submit" disabled={slotMutation.isPending}>
            Save slot
          </Button>
        </form>
      )}
      {slotMutation.isError && (
        <p role="alert" className="text-destructive">
          {slotMutation.error.message}
        </p>
      )}
      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              {["Branch", "Resource", "Starts", "Ends", "Availability"].map(
                (h) => (
                  <th scope="col" key={h} className="p-4">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {slots.data?.map((slot) => (
              <tr key={slot.id} className="border-t">
                <td className="p-4">{slot.branch.name}</td>
                <td className="p-4">{slot.resource}</td>
                <td className="p-4">
                  {new Date(slot.startsAt).toLocaleString("en-IN")}
                </td>
                <td className="p-4">
                  {new Date(slot.endsAt).toLocaleString("en-IN")}
                </td>
                <td className="p-4">
                  {slot.blocked
                    ? "Maintenance"
                    : slot.reserved
                      ? "Reserved"
                      : "Available"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Latest 200 future slots. Use a consistent counter or resource name to
        prevent overlapping appointments.
      </p>
    </section>
  );
}
