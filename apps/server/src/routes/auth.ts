import { auth } from "@erp_virujhealth/auth";
import type { Hono } from "hono";

export function registerAuthRoutes(app: Hono) {
  app.on(["POST", "GET"], "/api/auth/*", (context) =>
    auth.handler(context.req.raw)
  );
}
