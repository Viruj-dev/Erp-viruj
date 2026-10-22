import { describe, expect, test } from "bun:test";
import { getWorkspaceTheme, resolveWorkspaceRole } from "./role-theme";

describe("diagnostic workspace themes", () => {
  test("pathology uses orange and radiology uses rose", () => {
    expect(resolveWorkspaceRole("Pathology")).toBe("pathology");
    expect(resolveWorkspaceRole("Radiology")).toBe("radiology");
    expect(getWorkspaceTheme("Pathology").activeNav).toContain("orange");
    expect(getWorkspaceTheme("Radiology").activeNav).toContain("rose");
    expect(getWorkspaceTheme("Doctor").activeNav).toContain("emerald");
    expect(getWorkspaceTheme("Radiology").activeNav).not.toContain("emerald");
    expect(getWorkspaceTheme("Pathology")).not.toEqual(
      getWorkspaceTheme("Hospital")
    );
    expect(getWorkspaceTheme("Radiology")).not.toEqual(
      getWorkspaceTheme("Hospital")
    );
  });
});
