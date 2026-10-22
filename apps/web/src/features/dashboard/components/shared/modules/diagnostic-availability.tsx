"use client";

import { PageSkeleton } from "@/features/dashboard/components/shared/page-skeleton";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/erp/input";
import { ErpSelect } from "@/components/ui/erp/select";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { diagnosticPermissions } from "@/features/dashboard/lib/diagnostics";
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
      body: {
        centreName: organizationName || "Diagnostic centre",
        name: f.get("name"),
        address: f.get("address"),
        phone: f.get("phone"),
        published: f.get("published") === "on",
        homeCollection: f.get("homeCollection") === "on",
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
  if ([branches, slots, services].some((query) => query.isLoading))
    return <PageSkeleton />;

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">
          Branches & appointment availability
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Only published branches and active services appear in the patient app.
          Set recurring booking hours in Services. You can also add individual
          appointment slots here.
        </p>
      </header>
      {[branches, slots, services].some((q) => q.isError) && (
        <p role="alert" className="text-destructive">
          Unable to load availability. Refresh this page.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {manage && (
          <>
            <Button variant="outline" onClick={() => setShowBranch((v) => !v)}>
              Add branch
            </Button>
            <Button variant="outline" onClick={() => setShowSlot((v) => !v)}>
              Add appointment slot
            </Button>
          </>
        )}
      </div>
      {showBranch && (
        <form
          onSubmit={branchSubmit}
          className="space-y-4 rounded-2xl border p-5"
        >
          <h3 className="font-semibold">New branch</h3>
          <label className="block text-sm">
            Branch name
            <Input name="name" required maxLength={150} />
          </label>
          <label className="block text-sm">
            Full address
            <Input name="address" required maxLength={1000} />
          </label>
          <label className="block text-sm">
            Phone
            <Input name="phone" type="tel" maxLength={30} />
          </label>
          <label className="flex gap-2 text-sm">
            <input type="checkbox" name="published" />
            Publish this branch and its active catalogue in the patient app
          </label>
          {tenant.providerType === "pathology" && (
            <label className="flex gap-2 text-sm">
              <input type="checkbox" name="homeCollection" />
              Offer home collection
            </label>
          )}
          <Button type="submit" disabled={branchMutation.isPending}>
            Save branch
          </Button>
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
              {branch.published ? "Published in app" : "Private"} ·{" "}
              {branch.homeCollection
                ? "Home collection available"
                : "Centre visits"}
            </p>
            {manage && (
              <Button
                variant="outline"
                disabled={branchMutation.isPending}
                onClick={() =>
                  branchMutation.mutate({
                    id: branch.id,
                    body: { ...branch, published: !branch.published },
                  })
                }
              >
                {branch.published ? "Unpublish" : "Publish"}
              </Button>
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
