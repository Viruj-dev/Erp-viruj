import type { Context } from "hono";

export function handleServerError(error: Error, context: Context) {
  console.error("Hono error:", error);

  return context.json(
    {
      error: "Internal Server Error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    },
    500
  );
}
