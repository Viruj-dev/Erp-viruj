import { expect, test } from "bun:test";
import { resolveReviewWorkspace } from "./review-workspace";

const org = {
  id: "pending-workspace",
  slug: "hospital",
  organizationType: "hospital",
};
test("review checks use the saved session workspace when active-organization has not been set", () => {
  expect(resolveReviewWorkspace({ activeOrganization: org }, null)).toEqual(
    org
  );
  expect(
    resolveReviewWorkspace({ activeOrganization: org }, { ...org, id: "stale" })
  ).toEqual(org);
});
test("active organization is the fallback and missing workspace never grants access", () => {
  expect(resolveReviewWorkspace({}, org)).toEqual(org);
  expect(resolveReviewWorkspace({ activeOrganization: {} }, org)).toEqual(org);
  expect(resolveReviewWorkspace(null, null)).toBeNull();
});
