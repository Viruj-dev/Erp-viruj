import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
let pathname = "/hospital";
mock.module("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ replace: () => {} }),
}));
mock.module("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({
      data: {
        user: { id: "user" },
        activeOrganization: {
          id: "org",
          slug: "hospital",
          organizationType: "hospital",
        },
      },
    }),
    useActiveOrganization: () => ({ data: null }),
    useListOrganizations: () => ({ data: [] }),
  },
}));
mock.module("@/lib/central-api-token", () => ({
  clearCentralApiToken: () => {},
  setCentralApiTokenIdentity: () => {},
}));
mock.module("@/lib/viruj-backend", () => ({ virujBackend: {} }));
const { AccessReviewGate } = await import("./access-review-gate");
test("reopening ERP checks saved-session approval before mounting the old setup gate", () => {
  for (const path of [
    "/hospital",
    "/hospital/hospital/dashboard",
    "/dashboard",
  ]) {
    pathname = path;
    const html = renderToStaticMarkup(
      <AccessReviewGate>
        <p>Old organization setup gate</p>
      </AccessReviewGate>
    );
    expect(html).toContain("Checking your workspace access");
    expect(html).not.toContain("Old organization setup gate");
  }
});
