import { singleRegistryMatch } from "../../shared/workspace/doctor-registration-field";
import {
  DoctorProfessionalFields,
  validExperienceInput,
} from "./doctor-professional-fields";
import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DoctorWorkspaceContext, doctorQueryKey } from "@/features/dashboard/lib/doctor-workspace";
import { createErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
mock.module("next/navigation", () => ({
  useRouter: () => ({ replace() {} }),
  usePathname: () => "/doctor/my-practice/dashboard",
}));
const { DoctorOnboardingGate, DoctorCredentialsFields, doctorRegistryFields } =
  await import("./doctor-onboarding-flow");
import { DoctorProfileForm } from "./doctor-onboarding";
import {
  DoctorCalendarPage,
  doctorDayAppointmentsPath,
} from "./doctor-calendar";
import {
  DoctorConsultationsPage,
  DoctorConsultationDetailPage,
} from "./doctor-encounter-pages";
const tenant = createErpTenantContext({
  organizationId: "doctor-a",
  providerType: "doctor",
  role: "OWNER",
})!;
function render(node: React.ReactNode, data: Record<string, unknown>) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryData(
    doctorQueryKey("", "doctor-a", "/doctor/working-hours"),
    []
  );
  for (const [path, value] of Object.entries(data))
    client.setQueryData(doctorQueryKey("", "doctor-a", path), value);
  const html = renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <DoctorWorkspaceContext.Provider value={tenant}>
        {node}
      </DoctorWorkspaceContext.Provider>
    </QueryClientProvider>
  );
  client.clear();
  return html;
}
test("doctor onboarding asks for professional and contact details", () => {
  const html = render(<DoctorProfileForm />, {
    "/doctor/profile": {
      id: "a",
      fullName: "",
      languages: [],
      isPublic: false,
    },
    "/doctor/verification": { status: "NOT_SUBMITTED", documents: [] },
  });
  for (const label of [
    "Full name",
    "Date of birth",
    "Phone number",
    "Email",
    "Department",
    "Speciality",
    "Qualification",
    "Experience (years)",
    "Consultation fee (INR)",
    "Consultation duration (minutes)",
    "License / registration certificate",
    "Our team will review your registration details and documents manually.",
    "Set availability",
  ])
    expect(html).toContain(label);
  expect(html).not.toContain("Aris Thorne");
  expect(html).not.toContain("Check NMC register");
});
test("calendar renders saved work events and attended count", () => {
  const today = new Date();
  today.setHours(9, 0, 0, 0);
  const end = new Date(today);
  end.setHours(10);
  const html = render(<DoctorCalendarPage />, {
    "/doctor/calendar": [
      {
        id: "e",
        title: "Real clinic rounds",
        startsAt: today.toISOString(),
        endsAt: end.toISOString(),
        locationId: "l",
        notes: "",
        pinned: true,
        highlight: "blue",
        reminderMinutes: 15,
        patientsAttended: 7,
      },
    ],
    "/doctor/locations": [{ id: "l", name: "My clinic", type: "CLINIC" }],
    "/doctor/availability": [],
    [doctorDayAppointmentsPath(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    )]: { data: [], pagination: { total: 0, totalPages: 0, page: 1 } },
  });
  expect(html).toContain("Real clinic rounds");
  expect(html).not.toContain("Appointments from your practices");
  expect(html).not.toContain("Personal-practice booking hours");
  expect(html).toContain("Calendar help");
  expect(html).not.toContain("Right-click a date");
  expect(html).toContain("Enable reminders");
});
test("consultations show actual patient and organisation without decision buttons", () => {
  const html = render(<DoctorConsultationsPage />, {
    "/doctor/appointments?page=1&pageSize=20&q=": {
      data: [
        {
          id: "apt",
          status: "CONFIRMED",
          startsAt: "2026-10-22T09:00:00Z",
          patient: { name: "Real Patient" },
          clinic: { name: "Linked Hospital" },
        },
      ],
      pagination: { total: 1, totalPages: 1, page: 1 },
    },
  });
  expect(html).toContain("Real Patient");
  expect(html).toContain("Linked Hospital");
  expect(html).not.toContain(">Confirm<");
  expect(html).not.toContain(">Decline<");
});

test("new doctor dashboard opens onboarding before mounting dashboard queries", () => {
  const html = render(
    <DoctorOnboardingGate
      currentPage="dashboard"
      organizationName="My practice"
      userName="Dr Test"
      userEmail="doctor@example.test"
    >
      <div data-testid="erp-shell">Dashboard shell</div>
    </DoctorOnboardingGate>,
    {
      "/doctor/profile/completion": { percentage: 0 },
      "/doctor/locations": [],
      "/doctor/profile": {
        id: "a",
        fullName: "",
        languages: [],
        isPublic: false,
      },
      "/doctor/verification": { status: "NOT_SUBMITTED", documents: [] },
    }
  );
  expect(html).toContain("Personal information");
  expect(html).toContain("vh-onboarding--doctor");
  expect(html).toContain("Step 1 of 4");
  expect(html).toContain("Save &amp; Continue");
  expect(html).not.toContain("erp-shell");
  expect(html).not.toContain("Appointments today");
  expect(html).not.toContain("Unavailable");
});
test("failed setup check shows one retry state instead of an unavailable dashboard", () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryOnMount: false } },
  });
  const key = doctorQueryKey("", "doctor-a", "/doctor/profile/completion");
  const query = client.getQueryCache().build(client, { queryKey: key });
  query.setState({
    status: "error",
    fetchStatus: "idle",
    error: new Error("Permission denied"),
  });
  const html = renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <DoctorWorkspaceContext.Provider value={tenant}>
        <DoctorOnboardingGate
          currentPage="dashboard"
          organizationName="My practice"
          userName="Dr Test"
          userEmail="doctor@example.test"
        >
          <div data-testid="erp-shell">Dashboard shell</div>
        </DoctorOnboardingGate>
      </DoctorWorkspaceContext.Provider>
    </QueryClientProvider>
  );
  expect(html).toContain("Unable to load your doctor workspace");
  expect(html).toContain("Retry");
  expect(html).not.toContain("Appointments today");
  client.clear();
});

test("completed setup opens the ERP shell instead of showing onboarding", () => {
  const html = render(
    <DoctorOnboardingGate
      currentPage="dashboard"
      organizationName="Practice"
      userName="Doctor"
      userEmail="doctor@example.test"
    >
      <div data-testid="erp-shell">Dashboard shell</div>
    </DoctorOnboardingGate>,
    { "/doctor/profile/completion": { percentage: 100 } }
  );
  expect(html).toContain("erp-shell");
  expect(html).not.toContain("vh-onboarding");
});
test("an explicit onboarding route always uses the shared full-screen frame", () => {
  const html = render(
    <DoctorOnboardingGate
      currentPage="onboarding"
      organizationName="Practice"
      userName="Doctor"
      userEmail="doctor@example.test"
    >
      <div data-testid="erp-shell">Dashboard shell</div>
    </DoctorOnboardingGate>,
    {
      "/doctor/profile/completion": { percentage: 100 },
      "/doctor/profile": {
        id: "a",
        fullName: "Doctor",
        languages: [],
        isPublic: false,
      },
      "/doctor/locations": [],
      "/doctor/verification": { status: "NOT_SUBMITTED", documents: [] },
    }
  );
  expect(html).toContain("vh-onboarding--doctor");
  expect(html).toContain("Professional credentials");
  expect(html).not.toContain("Where you work");
  expect(html).toContain("Availability &amp; fees");
  expect(html).not.toContain("erp-shell");
});
test("birth date and languages are optional in the onboarding identity step", () => {
  const html = render(
    <DoctorOnboardingGate
      currentPage="onboarding"
      organizationName="Practice"
      userName="Doctor"
      userEmail="doctor@example.test"
    >
      <div />
    </DoctorOnboardingGate>,
    {
      "/doctor/profile/completion": { percentage: 0 },
      "/doctor/profile": {
        id: "a",
        fullName: "Doctor",
        languages: [],
        isPublic: false,
      },
      "/doctor/locations": [],
      "/doctor/verification": { status: "NOT_SUBMITTED", documents: [] },
    }
  );
  for (const placeholder of ["Date of birth (optional)", "English, Hindi"]) {
    const input = html.match(
      new RegExp(
        '<input[^>]*placeholder="' +
          placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
          '"[^>]*>'
      )
    );
    expect(input).not.toBeNull();
    expect(input![0]).not.toContain("required");
  }
});
test("professional fields use the department directory and medical degree choices", () => {
  for (const qualification of ["MBBS", "MD", "MS"]) {
    const html = render(
      <DoctorProfessionalFields
        profile={{
          id: "a",
          fullName: "Doctor",
          languages: [],
          isPublic: false,
          department: "Cardiology",
          specialization: "Neurology",
          qualification,
        }}
        onChange={() => {}}
      />,
      {
        "/directory/departments": {
          data: [
            { id: 1, name: "Cardiology" },
            { id: 2, name: "Neurology" },
          ],
        },
      }
    );
    expect(html).toContain("Cardiology");
    expect(html).toContain("Neurology");
    expect(html).toContain(qualification);
    expect(html).toContain('inputMode="numeric"');
    expect(html).toContain("Whole years only");
  }
  const custom = render(
    <DoctorProfessionalFields
      profile={{
        id: "a",
        fullName: "Doctor",
        languages: [],
        isPublic: false,
        specialization: "Sports medicine",
      }}
      onChange={() => {}}
    />,
    { "/directory/departments": { data: [{ id: 1, name: "Cardiology" }] } }
  );
  expect(custom).toContain("Your speciality");
  expect(custom).toContain("Sports medicine");
});
test("experience input rejects words, fractions, exponents and out-of-range years", () => {
  for (const value of ["", "0", "5", "100"])
    expect(validExperienceInput(value)).toBe(true);
  for (const value of ["ten", "1.5", "1e2", "-1", "101", "1000", "+2"])
    expect(validExperienceInput(value)).toBe(false);
});

test("registration number is the first professional credentials field", () => {
  const html = render(
    <DoctorCredentialsFields
      profile={{ id: "a", fullName: "Doctor", languages: [], isPublic: false }}
      onChange={() => {}}
    />,
    { "/directory/departments": { data: [] } }
  );
  expect(html.indexOf("Registration number")).toBeLessThan(
    html.indexOf("Medical council")
  );
  expect(html.indexOf("Registration number")).toBeLessThan(
    html.indexOf("Speciality")
  );
});
test("NMC autofill maps returned identity and degree without inventing clinical details", () => {
  const record = {
    id: 1,
    name: "Vaishali Mehta",
    registrationNumber: "DMC/R/30051",
    medicalCouncil: "Delhi Medical Council",
    qualification: "M.B.B.S.",
    removed: false,
  };
  expect(doctorRegistryFields(record)).toEqual({
    fullName: "Vaishali Mehta",
    medicalRegistrationNumber: "DMC/R/30051",
    medicalCouncil: "Delhi Medical Council",
    qualification: "MBBS",
  });
  expect(
    doctorRegistryFields({ ...record, qualification: "" })
  ).not.toHaveProperty("qualification");
  expect(singleRegistryMatch([record])).toEqual(record);
  expect(
    singleRegistryMatch([record, { ...record, id: 2, name: "Another doctor" }])
  ).toBeUndefined();
  expect(singleRegistryMatch([{ ...record, removed: true }])).toBeUndefined();
});

test("patients use completed organisation appointments", () => {
  const html = render(<DoctorConsultationsPage completedOnly />, {
    "/doctor/appointments?page=1&pageSize=20&q=&status=COMPLETED": {
      data: [
        {
          id: "done",
          startsAt: "2026-10-23T09:00:00Z",
          status: "COMPLETED",
          patient: { name: "Completed Patient" },
          clinic: { name: "C Hospital" },
          reason: "Follow-up",
        },
      ],
      pagination: { page: 1, total: 1, totalPages: 1 },
    },
  });
  expect(html).toContain("Completed Patient");
  expect(html).toContain("C Hospital");
  expect(html).toContain("Follow-up");
  expect(html).not.toContain("Select a provider workspace");
});

test("doctor dashboard shows doctor metrics, appointments and calendar data in shared styling", async () => {
  const { DoctorDashboardPage, doctorCalendarOverview } =
    await import("./doctor-overview-pages");
  const event = {
    id: "pinned",
    title: "Hospital rounds",
    startsAt: "2099-10-23T09:00:00Z",
    endsAt: "2099-10-23T10:00:00Z",
    locationId: "hospital",
    notes: "Bring reports",
    pinned: true,
    highlight: "amber",
    reminderMinutes: 15,
    patientsAttended: 0,
  };
  const html = render(<DoctorDashboardPage />, {
    "/doctor/profile": {
      id: "a",
      fullName: "Test Doctor",
      languages: [],
      isPublic: false,
    },
    "/doctor/dashboard": {
      totalPatientsSeen: 125,
      completedAppointments: 140,
      patientsSeenToday: 4,
      workingOrganizations: 2,
      workingDays: ["MONDAY", "WEDNESDAY"],
      averageRating: 4.7,
      ratingCount: 23,
      nextAppointments: [
        {
          id: "next",
          startsAt: "2099-10-23T09:00:00Z",
          patient: { name: "Upcoming Patient" },
          clinic: { name: "C Hospital" },
        },
      ],
      patientTrends: {
        timezone: "Asia/Kolkata",
        weekly: [{ date: "2026-10-23", patients: 4 }],
        monthly: [],
      },
    },
    "/doctor/calendar": [event],
    "/doctor/locations": [
      {
        id: "hospital",
        name: "C Hospital",
        department: "ENT",
        schedules: [
          {
            dayOfWeek: "MONDAY",
            startTime: "09:00",
            endTime: "13:00",
            timezone: "Asia/Kolkata",
          },
        ],
      },
    ],
  });
  for (const text of [
    "erp-overview",
    "Your practice, at a glance.",
    "Patients seen",
    "125",
    "Organisations working with",
    "Working days",
    "Patient rating",
    "4.7 / 5",
    "23 patient ratings",
    "Upcoming Patient",
    "C Hospital",
    "Pinned events",
    "Highlighted events",
    "Hospital rounds",
    "Bring reports",
    "Weekly working schedule",
    "09:00",
    "Patients seen per day",
    "Weekly",
    "Monthly",
  ])
    expect(html).toContain(text);
  expect(html).not.toContain("Appointment requests");
  expect(html).not.toContain("awaiting approval");
  const sections = doctorCalendarOverview(
    [
      event,
      { ...event, id: "old", pinned: false, endsAt: "2020-01-01T10:00:00Z" },
    ],
    Date.parse("2026-10-23T00:00:00Z")
  );
  expect(sections.upcoming.map((e) => e.id)).toEqual(["pinned"]);
  expect(sections.pinned).toEqual([event]);
  expect(sections.highlighted).toEqual([event]);
});

test("doctor dashboard displays an honest empty rating and calendar state", async () => {
  const { DoctorDashboardPage } = await import("./doctor-overview-pages");
  const html = render(<DoctorDashboardPage />, {
    "/doctor/profile": { fullName: "Doctor" },
    "/doctor/dashboard": {
      totalPatientsSeen: 0,
      completedAppointments: 0,
      patientsSeenToday: 0,
      workingOrganizations: 0,
      workingDays: [],
      averageRating: null,
      ratingCount: 0,
      nextAppointments: [],
      patientTrends: { timezone: "Asia/Kolkata", weekly: [], monthly: [] },
    },
    "/doctor/calendar": [],
    "/doctor/locations": [],
  });
  expect(html).toContain("No ratings yet");
  expect(html).not.toContain("0.0 / 5");
  expect(html).toContain("No upcoming appointments.");
  expect(html).toContain("No completed patient appointments in this period.");
});

test("appointment details show the saved patient snapshot instead of demo clinical records", () => {
  const html = render(<DoctorConsultationDetailPage id="visit" />, {
    "/doctor/appointments/visit": {
      id: "visit",
      startsAt: "2026-10-23T09:00:00Z",
      status: "COMPLETED",
      patient: { name: "Account holder" },
      patientDetails: { fullName: "Actual patient", age: 24, gender: "Female" },
      clinic: { name: "C Hospital" },
      reason: "Follow-up assessment",
    },
  });
  expect(html).toContain("Actual patient");
  expect(html).toContain("C Hospital");
  expect(html).toContain("Follow-up assessment");
  expect(html).not.toContain("Margot");
  expect(html).not.toContain("Clinical content captured here");
});
