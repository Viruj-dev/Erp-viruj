import { afterAll, expect, mock, test } from "bun:test";
import type { ReactNode } from "react";
import * as reactDom from "react-dom";
import { renderToStaticMarkup } from "react-dom/server";

const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
Object.defineProperty(globalThis, "document", { configurable: true, value: { body: {} } });
mock.module("react-dom", () => ({ ...reactDom, createPortal: (children: ReactNode) => children }));
const { AddStaffEntryDialog } = await import("./staff-dialogs");
afterAll(() => {
  if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
  else Reflect.deleteProperty(globalThis, "document");
});

function render(isRetryPending = false) {
  return renderToStaticMarkup(<AddStaffEntryDialog
    email="qa@example.invalid" name="QA Staff" role="STAFF" roleOptions={["STAFF"]}
    emailDeliveryError={{ email: "qa@example.invalid", message: "Delivery unavailable" }}
    inviteError={null} isInvitePending={false} isRetryPending={isRetryPending}
    onClose={() => {}} onEmailChange={() => {}} onNameChange={() => {}}
    onRoleChange={() => {}} onSubmit={() => {}} onRetryEmailDelivery={() => {}}
  />);
}
test("saved invitations show delivery failure, preserve the address and offer retry", () => {
  const html = render();
  expect(html).toContain("Invitation saved");
  expect(html).toContain("Delivery unavailable");
  expect(html).toContain('value="qa@example.invalid"');
  expect(html).toContain("Retry email delivery");
});
test("email retry is disabled while a retry is pending", () => {
  expect(render(true)).toMatch(/<button[^>]*disabled=""[^>]*>Retrying/);
});
