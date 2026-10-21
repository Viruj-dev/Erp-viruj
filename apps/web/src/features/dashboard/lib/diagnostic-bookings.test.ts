import { expect, test } from "bun:test";
import {
  canVerifyDiagnosticArrival,
  diagnosticBookingAppointment,
  type DiagnosticBooking,
} from "./diagnostic-bookings";

test("service appointments retain their booking ID and IST time in the shared appointment view", () => {
  const booking = {
    id: "booking-1",
    version: 3,
    status: "requested",
    createdAt: "2026-10-20T00:00:00Z",
    note: "Morning visit",
    collectionMode: "home",
    slot: {
      startsAt: "2026-10-20T04:00:00Z",
      endsAt: "2026-10-20T04:30:00Z",
      branch: { name: "Main branch" },
    },
    order: {
      patientName: "Test patient",
      patientPhone: "9999999999",
      serviceSnapshot: { name: "CBC" },
    },
  } as DiagnosticBooking;
  const row = diagnosticBookingAppointment(booking);
  expect(row.id).toBe("booking-1");
  expect(row.status).toBe("pending_approval");
  expect(row.appointmentTime.toLowerCase()).toBe("9:30 am");
  expect(row.timezone).toBe("Asia/Kolkata");
  expect(row.doctorName).toBe("CBC");
  expect(row.departmentName).toBe("Main branch");
  expect(
    diagnosticBookingAppointment({ ...booking, status: "declined" }).status
  ).toBe("rejected");
});

test("arrival verification is available before an accepted centre test starts", () => {
  const booking = {
    status: "accepted",
    collectionMode: "centre",
    arrivalVerifiedAt: null,
    order: { status: "ordered" },
  } as DiagnosticBooking;
  expect(canVerifyDiagnosticArrival(booking)).toBe(true);
  expect(
    canVerifyDiagnosticArrival({
      ...booking,
      order: { ...booking.order, status: "scheduled" },
    })
  ).toBe(true);
  expect(canVerifyDiagnosticArrival({ ...booking, status: "requested" })).toBe(
    false
  );
  expect(
    canVerifyDiagnosticArrival({ ...booking, collectionMode: "home" })
  ).toBe(false);
  expect(
    canVerifyDiagnosticArrival({
      ...booking,
      arrivalVerifiedAt: "2026-10-21T10:00:00Z",
    })
  ).toBe(false);
  expect(
    canVerifyDiagnosticArrival({
      ...booking,
      order: { ...booking.order, status: "released" },
    })
  ).toBe(false);
});
