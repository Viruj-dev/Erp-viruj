import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as routing from "./routing";
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
  buildDashboardPath,
  buildTenantDashboardPath,
  isDashboardPage,
} from "./routing";

const overview = readFileSync(
  new URL("../components/shared/role-dashboard-page.tsx", import.meta.url),
  "utf8"
);
const sidebar = readFileSync(
  new URL("../components/shared/layout/sidebar.tsx", import.meta.url),
  "utf8"
);

describe("dashboard navigation", () => {
  test("Open appointments uses the same destination as the sidebar", () => {
    const action = overview.match(
      /href=\{href\("([^"]+)"\)\}[^>]*>\s*Open appointments/
    );
    const navigation = sidebar.match(/id: "([^"]+)", label: "Appointments"/);
    expect(action).not.toBeNull();
    expect(navigation).not.toBeNull();
    expect(action![1]).toBe(navigation![1]);
  });

  for (const provider of ["clinic", "hospital", "doctor"] as const) {
    test(
      provider + " appointment links retain the workspace and section",
      () => {
        expect(buildDashboardPath(provider, "appointments")).toBe(
          "/" + provider + "/appointments/dashboard"
        );
        expect(
          buildTenantDashboardPath(provider, "my-practice", "appointments")
        ).toBe("/" + provider + "/my-practice/appointments/dashboard");
        for (const section of [
          "dashboard",
          "review",
          "patients",
          "settings",
        ] as const) {
          const page = ("appointments-" + section) as
            | "appointments-dashboard"
            | "appointments-review"
            | "appointments-patients"
            | "appointments-settings";
          expect(buildTenantDashboardPath(provider, "my-practice", page)).toBe(
            "/" + provider + "/my-practice/appointments/" + section
          );
        }
      }
    );
  }

  test("dashboard action links name registered pages", () => {
    for (const match of overview.matchAll(/href\("([^"]+)"\)/g)) {
      expect(isDashboardPage(match[1])).toBe(true);
    }
  });
});

// Render the overview tree without fetching data or mounting unrelated widgets.
function dashboardLinks(
  provider: "clinic" | "hospital" | "doctor",
  tenant: boolean
) {
  type Element = { props?: { href?: string; children?: unknown } };
  const jsx = (_type: unknown, props: Element["props"]) => ({ props });
  const exported: Record<string, (props: unknown) => Element> = {};
  runInNewContext(
    ts.transpileModule(overview, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    {
      exports: exported,
      require: (name: string) => {
        if (name === "react")
          return { useState: (value: unknown) => [value, () => {}] };
        if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
        if (name === "next/navigation")
          return {
            usePathname: () =>
              tenant
                ? "/" + provider + "/my-practice/dashboard"
                : "/" + provider,
          };
        if (name.endsWith("/routing")) return routing;
        return {};
      },
    }
  );
  const tree = exported.RoleDashboardPage({
    tone: provider,
    userName: "Test",
    analytics: {},
  });
  const links: string[] = [];
  const visit = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== "object") return;
    const props = (node as Element).props;
    if (props?.href) links.push(props.href);
    visit(props?.children);
  };
  visit(tree);
  return links;
}

for (const provider of ["clinic", "hospital", "doctor"] as const) {
  for (const tenant of [false, true]) {
    test(
      provider +
        (tenant ? " tenant" : " direct") +
        " dashboard links reach supported screens",
      () => {
        const screen = readFileSync(
          new URL(
            "../screens/" +
              (provider === "hospital" ? "erp" : provider) +
              "-home-screen.tsx",
            import.meta.url
          ),
          "utf8"
        );
        const supported = Array.from(
          screen.matchAll(/case "([^"]+)":/g),
          (match) => match[1]
        );
        const expected = new Set(
          supported.map((page) =>
            tenant
              ? buildTenantDashboardPath(
                  provider,
                  "my-practice",
                  page as routing.DashboardPage
                )
              : buildDashboardPath(provider, page as routing.DashboardPage)
          )
        );
        const links = dashboardLinks(provider, tenant);
        expect(links.length).toBeGreaterThan(0);
        for (const link of links) expect(expected.has(link)).toBe(true);
        const servicePath = provider === "hospital" ? "facilities" : "services";
        if (provider !== "doctor")
          expect(links.some((link) => link.includes("/" + servicePath))).toBe(
            true
          );
        else
          expect(
            links.some((link) => /\/(doctors|services)\//.test(link))
          ).toBe(false);
      }
    );
  }
}
