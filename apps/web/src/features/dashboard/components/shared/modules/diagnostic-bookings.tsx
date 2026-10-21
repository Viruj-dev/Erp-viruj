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
  canVerifyDiagnosticArrival,
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
          canVerifyArrival: (id) =>
            Boolean(
              query.data?.some(
                (booking) =>
                  booking.id === id && canVerifyDiagnosticArrival(booking)
              )
            ),
        }}
      />
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogTitle>Booking details</DialogTitle>
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
  const active =
    ["requested", "accepted"].includes(booking.status) &&
    !booking.arrivalVerifiedAt;
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
          : "At-centre booking"}
      </p>
      {booking.note && <p className="text-sm">Reason: {booking.note}</p>}
      {booking.arrivalVerifiedAt ? (
        <p role="status" className="text-sm font-medium text-emerald-700">
          Arrival verified ·{" "}
          {new Date(booking.arrivalVerifiedAt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })}
        </p>
      ) : (
        canVerifyDiagnosticArrival(booking) && (
          <ArrivalVerification
            booking={booking}
            tenant={tenant}
            refresh={refresh}
          />
        )
      )}
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

function ArrivalVerification({
  booking,
  tenant,
  refresh,
}: {
  booking: DiagnosticBooking;
  tenant: ErpTenantContext;
  refresh(): void;
}) {
  const [otp, setOtp] = useState("");
  const [requested, setRequested] = useState(false);
  const action = useMutation({
    mutationFn: async (verify: boolean) => {
      if (verify) {
        await virujBackend.diagnostics.verifyDiagnosticArrival(
          tenant.organizationId,
          booking.id,
          booking.version,
          otp
        );
        refresh();
      } else {
        await virujBackend.diagnostics.requestDiagnosticArrival(
          tenant.organizationId,
          booking.id,
          booking.version
        );
        setRequested(true);
      }
    },
  });
  return (
    <section
      className="space-y-3 rounded-xl border bg-muted/30 p-4"
      aria-label="Patient arrival verification"
    >
      <p className="text-sm font-semibold">Verify patient arrival</p>
      <p className="text-xs text-muted-foreground">
        Request a code, then enter the four digits shown in the patient's My
        Health booking. Valid for five minutes.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={action.isPending}
          onClick={() => action.mutate(false)}
        >
          {requested ? "Request a new code" : "Request arrival code"}
        </Button>
        <Input
          aria-label="Four-digit arrival code"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
          placeholder="4-digit code"
          className="w-32 tabular-nums"
        />
        <Button
          disabled={action.isPending || !/^\d{4}$/.test(otp)}
          onClick={() => action.mutate(true)}
        >
          Verify arrival
        </Button>
      </div>
      {requested && (
        <p role="status" className="text-xs text-muted-foreground">
          Code is available in the patient's app.
        </p>
      )}
      {action.isError && (
        <p role="alert" className="text-sm text-destructive">
          {action.error.message}
        </p>
      )}
    </section>
  );
}
