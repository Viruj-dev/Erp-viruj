import type { Hono } from "hono";

export function registerHealthRoutes(app: Hono) {
  app.get("/", (context) => {
    return context.text("OK");
  });
}
