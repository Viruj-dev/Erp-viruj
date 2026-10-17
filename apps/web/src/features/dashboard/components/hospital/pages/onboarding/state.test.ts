import { expect, test } from "bun:test";
import { getDefaultOnboardingState, getPersistableOnboardingState, mergeOnboardingState, validateStep } from "./state";
import type { OnboardingState } from "./types";
function readyClinic(): OnboardingState {
  const data = getDefaultOnboardingState(undefined, "clinic");
  Object.assign(data.profile, { hospitalName: "Test Clinic", legalBusinessName: "Test Clinic LLP", registrationNumber: "CL-123", logoUrl: "https://example.test/logo.png", establishedYear: "2020", phone: "9999999999", email: "clinic@example.test" });
  Object.assign(data.branches[0], { address: "Test Road", city: "Delhi", state: "Delhi", postalCode: "110001", latitude: "28.6", longitude: "77.2" });
  data.departments = [{ name: "ENT", description: "", head: "", openTime: "09:00", closeTime: "18:00" }];
  data.doctors = [{ id: "one", name: "Test Doctor", inviteEmail: "", registrationNumber: "MC-123", department: "ENT", consultationFee: "0", experience: "0", availability: "Monday, 10:00 AM – 4:00 PM IST", availabilityDays: ["Monday"], availableFrom: "10:00", availableTo: "16:00" }];
  return data;
}
test("clinic accepts a registered doctor with zero fee and zero years of experience", () => expect(validateStep("review", readyClinic(), "clinic")).toBe(""));
test("launch revalidates registration and requires at least one doctor", () => {
  const data = readyClinic(); data.profile.registrationNumber = "";
  expect(validateStep("review", data, "clinic")).toContain("registration");
  data.profile.registrationNumber = "CL-1"; data.doctors = [];
  expect(validateStep("review", data, "clinic")).toContain("at least one doctor");
});
test("doctors need registration and a currently selected department", () => {
  const data = readyClinic(); data.doctors[0].registrationNumber = "";
  expect(validateStep("doctors", data, "clinic")).toContain("registration");
  data.doctors[0].registrationNumber = "MC-1"; data.departments = [];
  expect(validateStep("doctors", data, "clinic")).toContain("selected department");
});
test("rejects invalid fee, experience and clock ranges", () => {
  for (const patch of [{ consultationFee: "-1" }, { consultationFee: "NaN" }, { experience: "12 years" }, { experience: "1.5" }, { availableTo: "09:00" }, { availableTo: "25:00" }, { availabilityDays: [] }]) {
    const data = readyClinic(); Object.assign(data.doctors[0], patch);
    expect(validateStep("doctors", data, "clinic")).not.toBe("");
  }
});
test("requires uploaded logo and accepts omitted certificates", () => {
  const data = readyClinic(); expect(validateStep("profile", data, "clinic")).toBe("");
  data.profile.logoUrl = ""; data.profile.logoName = "local-only.png";
  expect(validateStep("profile", data, "clinic")).toContain("logo");
});
test("rejects reversed hours and breaks outside opening hours", () => {
  const data = readyClinic(); data.workingHours[0].closingTime = "08:00";
  expect(validateStep("workingHours", data, "clinic")).not.toBe("");
  data.workingHours[0].closingTime = "18:00"; data.workingHours[0].lunchBreak = "08:00 - 09:00";
  expect(validateStep("workingHours", data, "clinic")).toContain("break");
});
test("restores old drafts without losing departments or inventing availability", () => {
  const data = mergeOnboardingState({ departments: [{ name: "Cardiology", description: "", head: "", openTime: "09:00", closeTime: "18:00" }], doctors: [{ id: "old", name: "Doctor", availability: "Mon-Sat" }] } as Partial<OnboardingState>, undefined, "hospital");
  expect(data.departments[0].name).toBe("Cardiology");
  expect(data.doctors[0].registrationNumber).toBe("");
  expect(data.doctors[0].availabilityDays).toEqual([]);
  expect(getDefaultOnboardingState(undefined, "clinic").departments).toEqual([]);
});
test("persists uploaded certificates and structured schedules", () => {
  const data = readyClinic(); data.profile.certificateUrl = "https://example.test/certificate";
  const saved = mergeOnboardingState(getPersistableOnboardingState(data), undefined, "clinic");
  expect(saved.profile.certificateUrl).toBe(data.profile.certificateUrl);
  expect(saved.doctors[0].availabilityDays).toEqual(["Monday"]);
});
