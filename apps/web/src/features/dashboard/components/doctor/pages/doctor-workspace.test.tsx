import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DoctorWorkspaceContext } from "@/features/dashboard/lib/doctor-workspace";
import { createErpTenantContext } from "@/features/dashboard/lib/erp-tenant";
import { DoctorDashboardPage } from "./doctor-overview-pages";
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
  const html = render(<DoctorProfileForm onboarding />, {
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
  const html = render(<DoctorDashboardPage />, {
    "/doctor/profile/completion": { percentage: 0 },
    "/doctor/profile": {
      id: "a",
      fullName: "",
      languages: [],
      isPublic: false,
    },
    "/doctor/verification": { status: "NOT_SUBMITTED", documents: [] },
  });
  expect(html).toContain("Doctor onboarding");
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
        <DoctorDashboardPage />
      </DoctorWorkspaceContext.Provider>
    </QueryClientProvider>
  );
  expect(html).toContain("Unable to load your doctor workspace");
  expect(html).toContain("Retry");
  expect(html).not.toContain("Appointments today");
  client.clear();
});
