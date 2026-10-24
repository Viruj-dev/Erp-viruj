import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  WorkspaceApprovalContext,
  useWorkspaceApproved,
} from "./workspace-approval";
function Status({ id }: { id?: string | null }) {
  return <span>{useWorkspaceApproved(id) ? "approved" : "needs review"}</span>;
}
test("saved approval skips onboarding only for its own workspace", () => {
  for (const id of ["hospital", "clinic", "doctor", "pathology", "radiology"]) {
    expect(
      renderToStaticMarkup(
        <WorkspaceApprovalContext.Provider value={id}>
          <Status id={id} />
        </WorkspaceApprovalContext.Provider>
      )
    ).toContain("approved");
    expect(
      renderToStaticMarkup(
        <WorkspaceApprovalContext.Provider value={id}>
          <Status id="different-workspace" />
        </WorkspaceApprovalContext.Provider>
      )
    ).toContain("needs review");
  }
});
test("missing approval never unlocks onboarding", () => {
  expect(renderToStaticMarkup(<Status id="workspace" />)).toContain(
    "needs review"
  );
  expect(renderToStaticMarkup(<Status id={null} />)).toContain("needs review");
});
