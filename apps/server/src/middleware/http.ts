import { env } from "@erp_virujhealth/env/server";
import type { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

export function registerHttpMiddleware(app: Hono) {
  app.use(logger());
  app.use(
    "/*",
    cors({
      origin: env.CORS_ORIGIN,
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "Cookie"],
      credentials: true,
    })
  );
}
