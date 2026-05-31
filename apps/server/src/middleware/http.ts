import { env } from "@erp_virujhealth/env/server";
import type { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { networkInterfaces } from "node:os";

const allowedOrigins = buildAllowedOrigins();

export function registerHttpMiddleware(app: Hono) {
  app.use(logger());
  app.use(
    "/*",
    cors({
      origin: (origin) =>
        !origin || allowedOrigins.has(origin) ? origin : env.CORS_ORIGIN,
      allowMethods: ["DELETE", "GET", "PATCH", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "Cookie"],
      credentials: true,
    })
  );
}

function buildAllowedOrigins() {
  const origins = new Set([env.CORS_ORIGIN]);

  if (env.NODE_ENV !== "production") {
    origins.add("http://localhost:3001");
    origins.add("http://127.0.0.1:3001");

    for (const networkInterface of Object.values(networkInterfaces())) {
      for (const address of networkInterface ?? []) {
        if (address.family === "IPv4" && !address.internal) {
          origins.add(`http://${address.address}:3001`);
        }
      }
    }
  }

  return origins;
}
