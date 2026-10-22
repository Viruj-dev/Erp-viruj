import { describe, expect, test } from "bun:test";
import { getWorkspaceTheme, resolveWorkspaceRole } from "./role-theme";

describe("diagnostic workspace themes", () => {
  test("pathology uses orange and radiology uses teal", () => {
    expect(resolveWorkspaceRole("Pathology")).toBe("pathology");
    expect(resolveWorkspaceRole("Radiology")).toBe("radiology");
    expect(getWorkspaceTheme("Pathology").activeNav).toContain("orange");
    expect(getWorkspaceTheme("Radiology").activeNav).toContain("teal");
    expect(getWorkspaceTheme("Pathology")).not.toEqual(
      getWorkspaceTheme("Hospital")
    );
    expect(getWorkspaceTheme("Radiology")).not.toEqual(
      getWorkspaceTheme("Hospital")
    );
  });
});
