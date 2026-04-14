import { Hono } from "hono";

import { handleServerError } from "../middleware/error-handler";
import { registerHttpMiddleware } from "../middleware/http";
import { registerAuthRoutes } from "../routes/auth";
import { registerHealthRoutes } from "../routes/health";
import { registerRpcRoutes } from "../routes/rpc";
import { registerTestPanelRoutes } from "../routes/test-panel";

export function createApp() {
  const app = new Hono();

  app.onError(handleServerError);

  registerHttpMiddleware(app);
  registerAuthRoutes(app);
  registerRpcRoutes(app);
  registerTestPanelRoutes(app);
  registerHealthRoutes(app);

  return app;
}
