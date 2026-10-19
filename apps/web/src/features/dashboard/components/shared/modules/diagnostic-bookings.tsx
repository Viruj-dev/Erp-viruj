"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/erp/input";
import type { ErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import {
  diagnosticLabel,
  diagnosticMoney,
} from "@/features/dashboard/lib/diagnostics";
import {
  diagnosticBookingAppointment,
  type DiagnosticBooking,
} from "@/features/dashboard/lib/diagnostic-bookings";
import { virujBackend } from "@/lib/viruj-backend";

import { ErpDemoAppointments } from "./appointments";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/erp/dialog";

export function DiagnosticBookingInbox({
  tenant,
}: {
  tenant: ErpTenantContext;
}) {
  const client = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const key = ["diagnostic-bookings", tenant.organizationId];
  const query = useQuery({
    queryKey: key,
    queryFn: () => virujBackend.diagnostics.bookings(tenant.organizationId),
    refetchInterval: 15000,
  });
  const refresh = () => {
    void client.invalidateQueries({ queryKey: key });
    void client.invalidateQueries({
      queryKey: virujBackend.diagnostics.key(tenant.organizationId, "orders"),
    });
  };
  const selected = query.data?.find((booking) => booking.id === selectedId);
  return (
    <>
      <ErpDemoAppointments
        tenant={tenant}
        section="dashboard"
        source={{
          data: (query.data ?? []).map(diagnosticBookingAppointment),
          isPending: query.isPending,
          isError: query.isError,
          error: query.error,
          isFetching: query.isFetching,
          refetch: query.refetch,
          onSelect: setSelectedId,
        }}
      />
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogTitle>Appointment details</DialogTitle>
          <DialogDescription>
            Review the patient, service and requested time.
          </DialogDescription>
          {selected && (
            <BookingCard
              key={`${selected.id}:${selected.version}`}
              booking={selected}
              tenant={tenant}
              refresh={refresh}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function BookingCard({
  booking,
  tenant,
  refresh,
}: {
  booking: DiagnosticBooking;
  tenant: ErpTenantContext;
  refresh(): void;
}) {
  const [note, setNote] = useState("");
  const save = useMutation({
    mutationFn: (status: string) =>
      virujBackend.diagnostics.decideBooking(
        tenant.organizationId,
        booking.id,
        { status, note, version: booking.version }
      ),
    onSuccess: refresh,
  });
  const active = ["requested", "accepted"].includes(booking.status);
  return (
    <article className="space-y-4 rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {diagnosticLabel(booking.status)}
          </p>
          <h3 className="mt-1 text-lg font-semibold">
            {booking.order.serviceSnapshot.name} ·{" "}
            {diagnosticMoney(booking.order.serviceSnapshot.pricePaise)}
          </h3>
          <p className="text-sm">
            {booking.order.patientName} · {booking.order.patientPhone}
          </p>
        </div>
        <div className="text-sm">
          <p>{new Date(booking.slot.startsAt).toLocaleString("en-IN")}</p>
          <p className="text-muted-foreground">
            {booking.slot.branch.name} · {booking.slot.resource}
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {booking.collectionMode === "home"
          ? `Home collection: ${booking.collectionAddress}`
          : "At-centre appointment"}
      </p>
      {booking.note && <p className="text-sm">Reason: {booking.note}</p>}
      {active && (
        <div className="space-y-3 border-t pt-4">
          <Input
            aria-label={`Reason for booking ${booking.id}`}
            placeholder="Reason required for decline or cancellation"
            maxLength={1000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {booking.status === "requested" && (
              <>
                <Button
                  disabled={save.isPending}
                  className={
                    tenant.providerType === "pathology"
                      ? "bg-orange-700 text-white hover:bg-orange-800"
                      : "bg-zinc-700 text-white hover:bg-zinc-800"
                  }
                  onClick={() => save.mutate("accepted")}
                >
                  Confirm booking
                </Button>
                <Button
                  variant="outline"
                  disabled={!note.trim() || save.isPending}
                  onClick={() => save.mutate("declined")}
                >
                  Decline
                </Button>
              </>
            )}
            <Button
              variant="outline"
              disabled={
                !note.trim() ||
                save.isPending ||
                !["ordered", "scheduled"].includes(booking.order.status)
              }
              onClick={() => save.mutate("cancelled")}
            >
              Cancel booking
            </Button>
          </div>
        </div>
      )}
      {save.isError && (
        <p role="alert" className="text-sm text-destructive">
          {save.error.message}
        </p>
      )}
    </article>
  );
}
