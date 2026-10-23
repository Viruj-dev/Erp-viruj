import { singleRegistryMatch } from "../../shared/workspace/doctor-registration-field";
import {
  DoctorProfessionalFields,
  validExperienceInput,
} from "./doctor-professional-fields";
import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DoctorWorkspaceContext } from "@/features/dashboard/lib/doctor-workspace";
import { createErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
mock.module("next/navigation", () => ({ useRouter: () => ({ replace() {} }) }));
const {
  DoctorOnboardingGate,
  doctorSessionDate,
  DoctorCredentialsFields,
  doctorRegistryFields,
} = await import("./doctor-onboarding-flow");
import { DoctorProfileForm } from "./doctor-onboarding";
import {
  DoctorCalendarPage,
  doctorDayAppointmentsPath,
} from "./doctor-calendar";
import { DoctorConsultationsPage } from "./doctor-encounter-pages";
const tenant = createErpTenantContext({
  organizationId: "doctor-a",
  providerType: "doctor",
  role: "OWNER",
})!;
function render(node: React.ReactNode, data: Record<string, unknown>) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  for (const [path, value] of Object.entries(data))
    client.setQueryData(["doctor-workspace", "doctor-a", path], value);
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
    "Check NMC register",
    "Set availability",
  ])
    expect(html).toContain(label);
  expect(html).not.toContain("Aris Thorne");
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
  expect(html).toContain("My clinic");
  expect(html).toContain("7 attended patients");
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
  expect(html).toContain("Step 1 of 5");
  expect(html).toContain("Save &amp; Continue");
  expect(html).not.toContain("erp-shell");
  expect(html).not.toContain("Appointments today");
  expect(html).not.toContain("Unavailable");
});
test("failed setup check shows one retry state instead of an unavailable dashboard", () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryOnMount: false } },
  });
  const key = ["doctor-workspace", "doctor-a", "/doctor/profile/completion"];
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
  expect(html).toContain("Work locations");
  expect(html).toContain("Availability &amp; fees");
  expect(html).not.toContain("erp-shell");
});
test("initial workplace sessions use upcoming weekdays in India", () => {
  expect(doctorSessionDate("THURSDAY", new Date("2026-10-21T20:00:00Z"))).toBe(
    "2026-10-22"
  );
  expect(doctorSessionDate("MONDAY", new Date("2026-10-21T20:00:00Z"))).toBe(
    "2026-10-26"
  );
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
