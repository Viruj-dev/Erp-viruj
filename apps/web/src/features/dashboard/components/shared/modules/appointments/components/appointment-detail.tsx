"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/features/dashboard/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/features/dashboard/components/ui/dialog";
import { virujBackend, type VirujAppointmentStatus } from "@/lib/viruj-backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  appointmentLocalDateTime,
  appointmentUtcDateTime,
  availableAppointmentActions,
  formatDate,
  getStatusLabel,
} from "../utils";

export function AppointmentDetailDialog({
  appointmentId,
  organizationId,
  onClose,
}: {
  appointmentId: string;
  organizationId: string;
  onClose: () => void;
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <AppointmentDetail
          appointmentId={appointmentId}
          organizationId={organizationId}
        />
      </DialogContent>
    </Dialog>
  );
}

export function AppointmentDetail({
  appointmentId,
  organizationId,
}: {
  appointmentId: string;
  organizationId: string;
}) {
  const queryClient = useQueryClient();
  const key = virujBackend.appointments.key({ organizationId });
  const details = useQuery({
    queryKey: [...key, "detail", appointmentId],
    queryFn: () =>
      virujBackend.appointments.detail({ id: appointmentId, organizationId }),
    gcTime: 0,
    refetchInterval: 15_000,
    retry: false,
  });
  const permissions = useQuery({
    queryKey: [...key, "permissions"],
    queryFn: () => virujBackend.appointments.permissions(organizationId),
    gcTime: 0,
    retry: false,
  });
  const [reason, setReason] = useState("");
  const [otp, setOtp] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [rescheduling, setRescheduling] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  useEffect(() => {
    if (!expiresAt) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);
  const mutation = useMutation({
    mutationFn: async (input: {
      action: "generate" | "verify" | "status";
      status?: VirujAppointmentStatus;
      startsAt?: string;
      endsAt?: string;
    }) => {
      const appointment = details.data;
      if (!appointment) throw new Error("Reload appointment details first.");
      const context = {
        id: appointmentId,
        organizationId,
        expectedVersion: appointment.version,
      };
      if (input.action === "generate")
        return virujBackend.appointments.generateArrivalOtp(context);
      if (input.action === "verify")
        return virujBackend.appointments.verifyArrival({ ...context, otp });
      if (!input.status) throw new Error("Choose an appointment action.");
      return virujBackend.appointments.updateStatus({
        ...context,
        status: input.status,
        approvalNotes: reason.trim() || undefined,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
      });
    },
    onSuccess: async (result) => {
      setLocalError(null);
      if ("expiresAt" in result) {
        setExpiresAt(result.expiresAt);
        setNow(Date.now());
        setOtp("");
      } else {
        setExpiresAt(null);
        setOtp("");
        setReason("");
        setRescheduling(false);
      }
      await queryClient.invalidateQueries({ queryKey: key });
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: key });
    },
  });
  const perform = (
    action: "generate" | "verify" | "status",
    status?: VirujAppointmentStatus
  ) => {
    if (mutation.isPending) return;
    setLocalError(null);
    mutation.reset();
    try {
      const timezone = details.data?.timezone || "Asia/Kolkata";
      const startsAt =
        status === "rescheduled"
          ? appointmentUtcDateTime(start, timezone)
          : undefined;
      const endsAt =
        status === "rescheduled"
          ? appointmentUtcDateTime(end, timezone)
          : undefined;
      if (startsAt && endsAt && Date.parse(endsAt) <= Date.parse(startsAt))
        throw new Error("End time must follow start time.");
      mutation.mutate({ action, status, startsAt, endsAt });
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Unable to update appointment."
      );
    }
  };
  if (details.isPending)
    return (
      <>
        <DialogHeader>
          <DialogTitle>Appointment details</DialogTitle>
          <DialogDescription>
            Loading patient and appointment...
          </DialogDescription>
        </DialogHeader>
        <p role="status">Loading...</p>
      </>
    );
  if (details.isError)
    return (
      <>
        <DialogHeader>
          <DialogTitle>Appointment details</DialogTitle>
          <DialogDescription>
            Unable to load this appointment.
          </DialogDescription>
        </DialogHeader>
        <p role="alert">{details.error.message}</p>
        <Button onClick={() => void details.refetch()} variant="outline">
          Retry
        </Button>
      </>
    );
  const appointment = details.data;
  const timezone = appointment.timezone || "Asia/Kolkata";
  const actions = availableAppointmentActions(
    appointment,
    permissions.data ?? []
  );
  const canVerifyArrival =
    appointment.status === "approved" &&
    appointment.bookingSource !== "staff" &&
    Boolean(appointment.patientUserId) &&
    permissions.data?.includes("appointment.complete");
  const snapshot = appointment.patientDetails;
  const assessment = [
    ["Full name", snapshot?.fullName ?? appointment.patientName],
    ["Phone", snapshot?.phoneNumber ?? appointment.patientPhone],
    ["Age", snapshot?.age ?? appointment.patientAge],
    ["Gender", snapshot?.gender ?? appointment.patientGender],
    ["Height (cm)", snapshot?.height],
    ["Weight (kg)", snapshot?.weight],
  ];
  const photo = snapshot?.complaintPhoto;
  const error = localError || mutation.error?.message;
  const remaining = expiresAt
    ? Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000))
    : 0;
  return (
    <div className="space-y-5">
      <DialogHeader>
        <DialogTitle>{appointment.patientName}</DialogTitle>
        <DialogDescription>
          {getStatusLabel(appointment.status)} · {appointment.appointmentMode} ·{" "}
          {appointment.doctorName}
        </DialogDescription>
      </DialogHeader>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Date</dt>
          <dd>{formatDate(appointment.appointmentDate, timezone)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Time ({timezone})</dt>
          <dd>{appointment.appointmentTime}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Department</dt>
          <dd>{appointment.departmentName || "General"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Email</dt>
          <dd>{appointment.patientEmail || "Not provided"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Patient reason</dt>
          <dd>{appointment.reason || "Not provided"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Provider notes</dt>
          <dd>{appointment.approvalNotes || "None"}</dd>
        </div>
      </dl>
      <section aria-label="Patient assessment at booking" className="space-y-3">
        <h3 className="font-semibold">Patient details at booking</h3>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {assessment.map(([label, value]) => (
            <div key={String(label)}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd>
                {value === undefined || value === null || value === ""
                  ? "Not provided"
                  : value}
              </dd>
            </div>
          ))}
        </dl>
        {photo && /^data:image\/(jpeg|png|webp);base64,/.test(photo) ? (
          <figure>
            <Image
              alt="Complaint photo submitted by the patient with this appointment request"
              className="max-h-80 w-full rounded-lg object-contain"
              height={320}
              src={photo}
              unoptimized
              width={480}
            />
            <figcaption className="mt-2 text-xs text-muted-foreground">
              Patient submitted complaint photo
            </figcaption>
          </figure>
        ) : null}
      </section>
      {permissions.isError ? (
        <div role="alert">
          <p className="text-sm">Unable to check appointment permissions.</p>
          <Button onClick={() => void permissions.refetch()} variant="outline">
            Retry permissions
          </Button>
        </div>
      ) : null}
      {actions.length ? (
        <section className="space-y-3" aria-label="Appointment decisions">
          <label
            className="block space-y-1 text-sm"
            htmlFor={`notes-${appointmentId}`}
          >
            <span>Decision notes / rejection reason</span>
            <textarea
              className="min-h-20 w-full rounded-md border bg-background p-2"
              id={`notes-${appointmentId}`}
              maxLength={2000}
              onChange={(event) => setReason(event.target.value)}
              value={reason}
            />
          </label>
          {["pending_approval", "rescheduled"].includes(appointment.status) ? (
            <p className="text-sm text-muted-foreground">
              The requested time is not confirmed. Approve only after checking
              doctor availability.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {actions
              .filter((status) => status !== "rescheduled")
              .map((status) => (
                <Button
                  disabled={mutation.isPending}
                  key={status}
                  onClick={() => perform("status", status)}
                  variant={status === "approved" ? "default" : "outline"}
                >
                  {
                    (
                      {
                        approved: "Approve",
                        rejected: "Reject",
                        cancelled: "Cancel appointment",
                        no_show: "Mark no-show",
                        completed: "Complete staff appointment",
                      } as Partial<Record<VirujAppointmentStatus, string>>
                    )[status]
                  }
                </Button>
              ))}
            {actions.includes("rescheduled") ? (
              <Button
                disabled={mutation.isPending}
                onClick={() => {
                  setRescheduling(!rescheduling);
                  setStart(
                    appointmentLocalDateTime(
                      appointment.startsAt || appointment.appointmentDate,
                      timezone
                    )
                  );
                  setEnd(
                    appointmentLocalDateTime(
                      appointment.endsAt ||
                        new Date(
                          Date.parse(appointment.appointmentDate) + 30 * 60_000
                        ).toISOString(),
                      timezone
                    )
                  );
                }}
                variant="outline"
              >
                Reschedule
              </Button>
            ) : null}
          </div>
          {rescheduling ? (
            <form
              className="space-y-3 rounded-lg border p-3"
              onSubmit={(event) => {
                event.preventDefault();
                perform("status", "rescheduled");
              }}
            >
              <p className="text-sm">
                New schedule in {timezone}. The backend checks doctor conflicts.
              </p>
              <label
                className="block text-sm"
                htmlFor={`start-${appointmentId}`}
              >
                Start
                <Input
                  id={`start-${appointmentId}`}
                  onChange={(event) => setStart(event.target.value)}
                  required
                  type="datetime-local"
                  value={start}
                />
              </label>
              <label className="block text-sm" htmlFor={`end-${appointmentId}`}>
                End
                <Input
                  id={`end-${appointmentId}`}
                  onChange={(event) => setEnd(event.target.value)}
                  required
                  type="datetime-local"
                  value={end}
                />
              </label>
              <Button disabled={mutation.isPending} type="submit">
                Save new schedule
              </Button>
            </form>
          ) : null}
        </section>
      ) : null}
      {canVerifyArrival ? (
        <section
          className="space-y-3 rounded-lg border p-4"
          aria-label="Verify patient arrival"
        >
          <h3 className="font-semibold">Verify arrival</h3>
          <p className="text-sm text-muted-foreground">
            Send a four-digit code to the patient&apos;s Viruj app, then enter
            the code they provide. Successful verification records attendance.
          </p>
          <Button
            disabled={mutation.isPending}
            onClick={() => perform("generate")}
            variant="outline"
          >
            {expiresAt ? "Send replacement code" : "Send arrival code"}
          </Button>
          {expiresAt ? (
            <p className="text-sm" role="status">
              {remaining > 0
                ? `Code available in the patient's app. Expires in ${remaining} seconds. Replacement invalidates the previous code.`
                : "Code expired. Send a replacement code."}
            </p>
          ) : null}
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              perform("verify");
            }}
          >
            <label
              className="space-y-1 text-sm"
              htmlFor={`otp-${appointmentId}`}
            >
              <span>Patient&apos;s four-digit code</span>
              <Input
                autoComplete="off"
                id={`otp-${appointmentId}`}
                inputMode="numeric"
                maxLength={4}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, ""))
                }
                pattern="[0-9]{4}"
                required
                value={otp}
              />
            </label>
            <Button
              disabled={
                mutation.isPending ||
                !/^\d{4}$/.test(otp) ||
                Boolean(expiresAt && remaining === 0)
              }
              type="submit"
            >
              Verify attendance
            </Button>
          </form>
        </section>
      ) : null}
      {appointment.arrivalVerifiedAt ? (
        <p role="status" className="text-sm">
          Attendance verified{" "}
          {new Date(appointment.arrivalVerifiedAt).toLocaleString()}. This
          records arrival, not completion of medical treatment.
        </p>
      ) : null}
      {mutation.isPending ? (
        <p role="status" className="text-sm">
          Saving appointment action...
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
