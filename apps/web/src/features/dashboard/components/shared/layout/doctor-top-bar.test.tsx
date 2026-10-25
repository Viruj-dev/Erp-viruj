import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
mock.module("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({ data: { user: { name: "Account name" } } }),
  },
}));
mock.module("@/lib/theme-provider", () => ({
  useTheme: () => ({ theme: "light", toggleTheme() {} }),
}));
mock.module("@/features/notifications", () => ({
  NotificationCenter: () => null,
}));
mock.module(
  "@/features/dashboard/components/shared/profile/profile-dropdown",
  () => ({ ProfileDropdown: () => null })
);
const { ErpDemoTopBar } = await import("./top-bar");
test("doctor top bar uses the doctor identity and avatar while hospital keeps its organisation icon", () => {
  const client = new QueryClient();
  client.setQueryData(["", "doctor-a", "doctors", "doctor", "/doctor/profile"], {
    fullName: "Dr Test",
    specialization: "Cardiology",
    gender: "female",
  });
  const render = (organizationLabel: string) =>
    renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <ErpDemoTopBar
          organizationId="doctor-a"
          organizationLabel={organizationLabel}
          organizationName="Organisation name"
          roleLabel="OWNER"
          userName="Account name"
          onNavigateToProfile={() => {}}
          onLogout={() => {}}
        />
      </QueryClientProvider>
    );
  const doctor = render("Doctor");
  expect(doctor).toContain("Dr Test");
  expect(doctor).toContain("Cardiology");
  expect(doctor).toContain("female avatar");
  expect(doctor).not.toContain("lucide-building2");
  expect(doctor).not.toContain("Organisation name");
  const hospital = render("Hospital");
  expect(hospital).toContain("lucide-building2");
  expect(hospital).toContain("Organisation name");
  client.clear();
});
