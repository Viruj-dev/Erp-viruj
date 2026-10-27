import { beforeEach, expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { ComponentProps } from "react";
const AccessScreen = (await import("./organization-access-screen"))
  .OrganizationAccessScreen;

const workspaces = ["hospital", "clinic", "pathology", "radiology"].map(
  (type) => ({
    id: `${type}-id`,
    name: `My ${type}`,
    organizationType: type,
    membershipRole: type === "hospital" ? "OWNER" : "ADMIN",
    slug: `${type}-workspace`,
  })
);
const activate = mock(async (_input: { organizationId: string }) => ({
  error: null as { message: string } | null,
}));
const navigate = mock((_path: string) => {});
let screen: ComponentProps<typeof AccessScreen>;
mock.module("./organization-access-screen", () => ({
  OrganizationAccessScreen: (props: ComponentProps<typeof AccessScreen>) => {
    screen = props;
    return <AccessScreen {...props} />;
  },
}));
mock.module("next/navigation", () => ({
  useRouter: () => ({ replace: navigate }),
}));
mock.module("@/components/ui/erp/select", () => ({
  ErpSelect: (props: ComponentProps<"select">) => <select {...props} />,
}));
mock.module("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({
      data: { user: { id: "user", email: "provider@example.test" } },
      isPending: false,
    }),
    useListOrganizations: () => ({
      data: workspaces,
      isPending: false,
      refetch: async () => {},
    }),
  },
  activateOrganization: activate,
  bootstrapOrganization: mock(async () => ({ data: null })),
  getAuthActionError: (result: { error?: { message: string } | null }) =>
    result.error?.message ?? null,
}));
mock.module("@/lib/central-api-token", () => ({
  clearCentralApiToken: () => {},
}));
const { ProviderWorkspacesScreen } =
  await import("./provider-workspaces-screen");
const originalWindow = globalThis.window;
beforeEach(() => {
  activate.mockReset();
  activate.mockResolvedValue({ error: null });
  navigate.mockClear();
});

test("existing email shows linked ERPs and assigned roles without asking the user to define them", () => {
  const html = renderToStaticMarkup(<ProviderWorkspacesScreen />);
  expect(html).toContain("provider@example.test");
  for (const workspace of workspaces) expect(html).toContain(workspace.name);
  for (const workspace of workspaces)
    expect(html).toContain(`${workspace.organizationType} ERP`);
  expect(html).toContain("Your role:");
  expect(html).toContain("owner");
  expect(html).toContain("admin");
  expect(html).toContain("Add another ERP workspace");
  expect(html).not.toContain("Workspace name");
  expect(html).not.toContain("Provider type unavailable");
});

test("switching reloads the selected provider dashboard only after successful activation", async () => {
  globalThis.window = {
    location: { assign: navigate, href: "http://localhost:3001/workspaces" },
  } as unknown as Window & typeof globalThis;
  try {
    renderToStaticMarkup(<ProviderWorkspacesScreen />);
    for (const workspace of workspaces) {
      await screen.onSelectOrganization(workspace.id);
      expect(activate).toHaveBeenLastCalledWith({
        organizationId: workspace.id,
      });
      expect(navigate).toHaveBeenLastCalledWith(
        `/${workspace.organizationType}/${workspace.slug}/dashboard`
      );
    }
    navigate.mockClear();
    activate.mockResolvedValueOnce({
      error: { message: "Workspace could not be activated" },
    });
    await screen.onSelectOrganization(workspaces[0].id);
    expect(navigate).not.toHaveBeenCalled();
    activate.mockClear();
    await screen.onSelectOrganization("someone-elses-workspace");
    expect(activate).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  } finally {
    globalThis.window = originalWindow;
  }
});

test("provider setup is shown when the email has no linked ERP", () => {
  const saved = workspaces.splice(0);
  try {
    const html = renderToStaticMarkup(<ProviderWorkspacesScreen />);
    expect(html).toContain("Workspace name");
    expect(html).toContain("Provider type");
    expect(html).toContain("Add ERP workspace");
    for (const type of [
      "hospital",
      "clinic",
      "doctor",
      "pathology",
      "radiology",
    ])
      expect(html).toContain(`value="${type}"`);
  } finally {
    workspaces.push(...saved);
  }
});
