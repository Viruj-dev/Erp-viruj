import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

type Backend = typeof import("./viruj-backend").virujBackend;

// Checked by tsc without invoking the API or loading authentication modules.
function checkKeyContracts(
  members: Backend["staff"]["membersKey"],
  invitations: Backend["staff"]["invitationsKey"],
  audit: Backend["audit"]["key"]
) {
  for (const key of [members, invitations, audit]) {
    key("user", "org");
    // @ts-expect-error Both identity arguments are required.
    key("org");
    // @ts-expect-error An unresolved user cannot be passed to a scoped key.
    key(undefined, "org");
    // @ts-expect-error An unresolved organization cannot be passed to a scoped key.
    key("user", undefined);
  }
}

test("all five staff mutations invalidate on settlement using the captured scope", () => {
  const path = new URL(
    "../features/dashboard/components/hospital/pages/staff.tsx",
    import.meta.url
  );
  const file = ts.createSourceFile(
    "staff.tsx",
    readFileSync(path, "utf8"),
    ts.ScriptTarget.Latest,
    true
  );
  const mutations: ts.ObjectLiteralExpression[] = [];
  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(file) === "useMutation"
    ) {
      const options = node.arguments[0];
      if (options && ts.isObjectLiteralExpression(options))
        mutations.push(options);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  expect(mutations).toHaveLength(5);
  for (const options of mutations) {
    const property = (name: string) =>
      options.properties
        .find((item) => item.name?.getText(file) === name)
        ?.getText(file);
    expect(property("onMutate")).toContain("() => staffScope");
    expect(property("onSettled")).toContain(
      "(_result, _error, _variables, scope)"
    );
    expect(property("onSettled")).toContain("invalidateStaffData(scope)");
    expect(property("onSuccess") ?? "").not.toContain("invalidateStaffData");
  }
  expect(
    mutations.filter((options) =>
      options.properties.some(
        (item) => item.name?.getText(file) === "onSuccess"
      )
    )
  ).toHaveLength(2);
});
