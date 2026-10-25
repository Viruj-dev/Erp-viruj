import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import config from "../../next.config";

test("ERP proxies both SSE endpoints so preview and production use first-party cookies", async () => {
  const rewrites = await config.rewrites!();
  if (Array.isArray(rewrites)) throw new Error("Expected grouped rewrites");
  const route = rewrites.afterFiles?.find(route => route.source === "/events/:path*");
  const api = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
  expect(route?.destination).toBe(`${api}/events/:path*`);
  const hook = readFileSync(new URL("./use-realtime-invalidation.tsx", import.meta.url), "utf8");
  expect(hook).toContain("const origin = window.location.origin;");
  expect(hook).toContain('credentials: "include"');
  expect(hook).toContain("getCentralApiToken(true)");
});
