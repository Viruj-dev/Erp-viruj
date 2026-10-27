import { expect, mock, test } from "bun:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

let providerType = "doctor";
const bootstrap = mock(async (_input: unknown) => ({
  data: { id: "workspace" },
}));
mock.module("react", () => ({
  ...React,
  useState: (initial: unknown) => [
    initial === "login"
      ? "onboarding"
      : initial && typeof initial === "object" && "organizationType" in initial
        ? {
            ...initial,
            organizationType: providerType,
            organizationName: "Old hospital",
            name: "Dr Meera",
            email: "meera@example.test",
          }
        : initial,
    () => {},
  ],
}));
mock.module("@/lib/auth-client", () => ({
  authClient: { signUp: { email: async () => ({}) } },
  bootstrapOrganization: bootstrap,
  getAuthActionError: () => null,
  acceptInvitation: async () => ({}),
}));
mock.module("@/lib/central-api-token", () => ({
  clearCentralApiToken: () => {},
}));
const { ErpDemoLogin } = await import("./login-screen");

test("doctor signup hides workspace name and ignores a name entered for another provider type", async () => {
  providerType = "doctor";
  expect(
    renderToStaticMarkup(
      <ErpDemoLogin onAuthenticated={() => {}} onPendingChange={() => {}} />
    )
  ).not.toContain("Workspace name");
  const originalWindow = globalThis.window;
  globalThis.window = {
    sessionStorage: { getItem: () => null },
  } as unknown as Window & typeof globalThis;
  try {
    const tree = ErpDemoLogin({
      onAuthenticated: () => {},
      onPendingChange: () => {},
    });
    const findForm = (
      node: React.ReactNode
    ):
      | React.ReactElement<{
          onSubmit: (event: { preventDefault: () => void }) => void;
        }>
      | undefined => {
      for (const child of React.Children.toArray(node)) {
        if (!React.isValidElement<{ children?: React.ReactNode }>(child))
          continue;
        if (child.type === "form") return child as ReturnType<typeof findForm>;
        const form = findForm(child.props.children);
        if (form) return form;
      }
    };
    await findForm(tree)!.props.onSubmit({ preventDefault() {} });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(bootstrap).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Dr Meera's Doctor Practice",
        organizationType: "doctor",
        slug: expect.stringContaining("dr-meera-"),
      })
    );
  } finally {
    globalThis.window = originalWindow;
  }
});

test("other provider types still ask for a workspace name", () => {
  for (providerType of ["hospital", "clinic", "pathology", "radiology"]) {
    expect(
      renderToStaticMarkup(
        <ErpDemoLogin onAuthenticated={() => {}} onPendingChange={() => {}} />
      )
    ).toContain("Workspace name");
  }
});
