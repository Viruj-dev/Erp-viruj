import type { Context } from "hono";

export function handleServerError(error: Error, context: Context) {
  console.error("Hono error:", error);

  return context.json(
    {
      error: "Internal Server Error",
    },
    500
  );
}
