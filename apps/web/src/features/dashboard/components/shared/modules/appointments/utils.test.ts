import { expect, test } from "bun:test";
import {
  appointmentLocalDateTime,
  appointmentUtcDateTime,
  availableAppointmentActions,
} from "./utils";
import type { AppointmentRecord } from "./types";

test("appointment actions honor lifecycle and action permissions", () => {
  const appointment = { status: "pending_approval" } as AppointmentRecord;
  expect(
    availableAppointmentActions(appointment, [
      "appointment.approve",
      "appointment.reject",
    ])
  ).toEqual(["approved", "rejected"]);
  expect(
    availableAppointmentActions({ ...appointment, status: "approved" }, [
      "appointment.approve",
      "appointment.reject",
      "appointment.cancel",
      "appointment.complete",
    ])
  ).toEqual(["cancelled"]);
  expect(
    availableAppointmentActions({ ...appointment, status: "completed" }, [
      "appointment.complete",
    ])
  ).toEqual([]);
  expect(availableAppointmentActions(appointment, [])).toEqual([]);
  expect(
    availableAppointmentActions({ ...appointment, status: "rescheduled" }, [
      "appointment.approve",
    ])
  ).toEqual(["approved"]);
});

test("scheduling uses provider timezone, including timezone gaps", () => {
  expect(appointmentUtcDateTime("2026-10-03T10:00", "Asia/Kolkata")).toBe(
    "2026-10-03T04:30:00.000Z"
  );
  expect(
    appointmentLocalDateTime("2026-10-03T04:30:00.000Z", "Asia/Kolkata")
  ).toBe("2026-10-03T10:00");
  expect(appointmentUtcDateTime("2026-07-15T10:00", "America/New_York")).toBe(
    "2026-07-15T14:00:00.000Z"
  );
  expect(() =>
    appointmentUtcDateTime("2026-03-08T02:30", "America/New_York")
  ).toThrow();
  expect(() =>
    appointmentUtcDateTime("2026-02-30T10:00", "Asia/Kolkata")
  ).toThrow();
});
