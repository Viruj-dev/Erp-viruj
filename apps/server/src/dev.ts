import app from "./index";

const port = Number(process.env.PORT ?? 3002);

Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`ERP Server starting on port ${port}`);
