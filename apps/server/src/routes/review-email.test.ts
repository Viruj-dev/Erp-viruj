import { expect, test } from "bun:test";
import { reviewEmailHtml } from "./review-email";

test("update emails have a readable review note and a regular sign-in button", async () => {
  const email = await reviewEmailHtml(
    "rejected",
    "https://erp.virujhealth.com/auth",
    "Please upload a clear certificate.\nCheck your registration number."
  );
  expect(email).toContain("Viruj Health");
  expect(email).toContain("REVIEW NOTE");
  expect(email).toContain("Please upload a clear certificate.");
  expect(email).toContain("Update application");
  expect(email).toContain('href="https://erp.virujhealth.com/auth"');
  expect(email).toContain("white-space:pre-wrap");
  expect(email).not.toContain("Viruj ERP");
  expect(email).not.toContain("Viruj Health ERP");
  expect(email).not.toContain("token=");
});
test("reviewer notes cannot inject markup or executable content", async () => {
  const email = await reviewEmailHtml(
    "rejected",
    "https://erp.virujhealth.com/auth",
    '<script>alert("x")</script> & <img src=x onerror=alert(1)>'
  );
  expect(email).not.toContain("<script>");
  expect(email).not.toContain("<img");
  expect(email).toContain("&lt;script&gt;");
  expect(email).toContain("&amp;");
});
test("approval emails retain saved access and privacy guidance", async () => {
  const email = await reviewEmailHtml(
    "approved",
    "https://erp.virujhealth.com/auth"
  );
  expect(email).toContain("Sign in to Viruj Health");
  expect(email).toContain("existing email and password");
  expect(email).toContain("do not need to request access again");
  expect(email).toContain("patient information");
  expect(email).not.toContain("REVIEW NOTE");
});
