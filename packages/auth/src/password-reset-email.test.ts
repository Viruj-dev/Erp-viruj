import { afterEach, expect, spyOn, test } from "bun:test";

process.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/test";
process.env.BETTER_AUTH_SECRET ??= "test-secret-with-at-least-32-characters";
process.env.BETTER_AUTH_URL ??= "http://localhost:3002";
process.env.CORS_ORIGIN ??= "http://localhost:3001";
process.env.CENTRAL_API_JWT_SECRET ??=
  "test-jwt-secret-with-at-least-32-characters";
process.env.RESEND_API_KEY ??= "test-resend-key";

const { sendPasswordResetEmail } = await import("./password-reset-email");

afterEach(() => {
  spyOn(globalThis, "fetch").mockRestore();
});

test("sends the reset link only to the account email", async () => {
  const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(null, { status: 200 })
  );
  const url =
    "https://auth.example.com/auth/reset-password/test-token?callbackURL=https%3A%2F%2Ferp.example.com&test=\"<tag>'";

  await sendPasswordResetEmail({ email: "registered@example.com", url });

  expect(fetchSpy).toHaveBeenCalledTimes(1);
  const call = fetchSpy.mock.calls[0];
  if (!call) {
    throw new Error("Expected a request to the email provider.");
  }
  const [endpoint, options] = call;
  expect(endpoint).toBe("https://api.resend.com/emails");
  const payload = JSON.parse(String(options?.body));
  expect(payload.to).toEqual(["registered@example.com"]);
  expect(payload.text).toContain(url);
  expect(payload.text).toContain("expires in one hour");
  expect(payload.html).toContain("Reset my password");
  expect(payload.html).toContain("one hour");
  expect(payload.html).toContain("Your password will stay the same");
  expect(payload.html).toContain('name="viewport"');
  const escapedUrl = url.replace(
    /[&<>"']/g,
    (character) => `&#${character.charCodeAt(0)};`
  );
  expect(payload.html.split(`href="${escapedUrl}"`)).toHaveLength(3);
  expect(payload.html).not.toContain('"<tag>');
});

test("reports mail provider failures without exposing response details", async () => {
  spyOn(globalThis, "fetch").mockResolvedValue(
    new Response("provider details", { status: 503 })
  );

  await expect(
    sendPasswordResetEmail({
      email: "registered@example.com",
      url: "https://auth.example.com/auth/reset-password/test-token",
    })
  ).rejects.toThrow("Password reset email delivery failed (503).");
});
