import { expect, test } from "bun:test";
import { availableAppointmentActions } from "@/features/dashboard/components/shared/modules/appointments/utils";
import {
  appointmentViews,
  appointmentsForView,
  mapAppointmentToPatient,
} from "./utils";
import type { VirujAppointment } from "@/lib/viruj-backend";

test("status queues stay separate and sort requests by booking time and visits by schedule", () => {
  const make = (
    id: string,
    status: VirujAppointment["status"],
    day: number,
    booked: number
  ) =>
    ({
      id,
      status,
      patientName: "Patient",
      doctorName: "Doctor",
      appointmentDate: `2026-10-${String(day).padStart(2, "0")}T10:00:00Z`,
      createdAt: `2026-10-01T${String(booked).padStart(2, "0")}:00:00Z`,
    }) as VirujAppointment;
  const records = [
    make("older-request", "pending_approval", 4, 9),
    make("newer-request", "pending_approval", 3, 10),
    make("later-visit", "approved", 5, 9),
    make("earlier-visit", "approved", 2, 10),
    ...appointmentViews
      .filter(
        (view) => !["all", "approved", "pending_approval"].includes(view.value)
      )
      .map((view) =>
        make(view.value, view.value as VirujAppointment["status"], 3, 9)
      ),
  ];
  expect(
    appointmentsForView(records, "pending_approval", "").map(
      (record) => record.id
    )
  ).toEqual(["newer-request", "older-request"]);
  expect(
    appointmentsForView(records, "approved", "").map((record) => record.id)
  ).toEqual(["earlier-visit", "later-visit"]);
  for (const view of appointmentViews.filter((view) => view.value !== "all"))
    expect(
      appointmentsForView(records, view.value, "").every(
        (record) => record.status === view.value
      )
    ).toBe(true);
  expect(appointmentsForView(records, "all", "  DOCTOR ")).toHaveLength(
    records.length
  );
  expect(appointmentsForView(records, "all", "missing")).toEqual([]);
  expect(records[0]!.id).toBe("older-request");
});

test("patient queue preserves appointment identity, lower-case gender and provider date", () => {
  const appointment: VirujAppointment = {
    id: "appointment-x",
    status: "pending_approval",
    patientUserId: "shared-patient",
    patientName: "Test patient",
    patientEmail: "test@example.invalid",
    patientAge: 30,
    patientGender: "male",
    doctorName: "Test doctor",
    appointmentDate: "2026-09-30T20:00:00.000Z",
    appointmentTime: "01:30 AM",
    appointmentMode: "physical",
    timezone: "Asia/Kolkata",
  };
  const row = mapAppointmentToPatient(appointment);
  expect(row.appointmentId).toBe("appointment-x");
  expect(row.gender).toBe("M");
  expect(row.scheduleDate).toBe("01/10/26");
  expect(row.status).toBe("Pending Approval");
  expect(
    availableAppointmentActions(
      { ...appointment, bookingSource: "staff", status: "approved" },
      ["appointment.complete"]
    )
  ).toEqual(["completed"]);
  expect(
    availableAppointmentActions(
      { ...appointment, bookingSource: "mobile", status: "approved" },
      ["appointment.complete"]
    )
  ).toEqual([]);
  expect(
    mapAppointmentToPatient({
      ...appointment,
      id: "appointment-y",
      status: "completed",
    }).appointmentId
  ).toBe("appointment-y");
  expect(
    mapAppointmentToPatient({ ...appointment, status: "completed" }).status
  ).toBe("Completed");
});
