import { expect, test } from "bun:test";
import { availableAppointmentActions } from "@/features/dashboard/components/shared/modules/appointments/utils";
import { mapAppointmentToPatient } from "./utils";
import type { VirujAppointment } from "@/lib/viruj-backend";

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
