import { beforeEach, expect, mock, test } from "bun:test";
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
const status = mock(async (_id: string) => ({
  status: "rejected",
  reason: "Correct the registration",
  completed: true,
}));
const reapply = mock(async (_id: string) => ({
  status: "draft",
  reason: "Correct the registration",
}));
const submit = mock(async (_id: string) => ({
  status: "pending",
  reason: null,
}));
mock.module("@/lib/viruj-backend", () => ({
  virujBackend: { accessReview: { status, reapply, submit } },
}));
const { AccessReviewGate, loadAccessReview } =
  await import("./access-review-gate");
beforeEach(() => {
  status.mockClear();
  reapply.mockClear();
  submit.mockClear();
  status.mockResolvedValue({
    status: "rejected",
    reason: "Correct the registration",
    completed: true,
  });
  reapply.mockResolvedValue({
    status: "draft",
    reason: "Correct the registration",
  });
});

test("rejected users reopen saved onboarding without submitting another request", async () => {
  expect(await loadAccessReview("org")).toMatchObject({
    status: "draft",
    reason: "Correct the registration",
  });
  expect(reapply).toHaveBeenCalledWith("org");
  expect(submit).not.toHaveBeenCalled();
});
test("approved and pending accounts are never reopened or resubmitted", async () => {
  for (const saved of ["approved", "pending", "draft"]) {
    status.mockResolvedValue({ status: saved, reason: "", completed: true });
    expect(await loadAccessReview("org")).toMatchObject({ status: saved });
  }
  expect(reapply).not.toHaveBeenCalled();
  expect(submit).not.toHaveBeenCalled();
});
test("reopening failures cannot unlock onboarding", async () => {
  reapply.mockRejectedValueOnce(new Error("Unable to reopen"));
  await expect(loadAccessReview("org")).rejects.toThrow("Unable to reopen");
  expect(submit).not.toHaveBeenCalled();
});
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
