import { Hono } from "hono";

import { handleServerError } from "../middleware/error-handler";
import { registerHttpMiddleware } from "../middleware/http";
import { registerAuthRoutes } from "../routes/auth";
import { registerDoctorRoutes } from "../routes/doctors";
import { registerFacilityRoutes } from "../routes/facilities";
import { registerHealthRoutes } from "../routes/health";

export function createApp(app = new Hono()) {

  app.onError(handleServerError);

  registerHttpMiddleware(app);
  registerAuthRoutes(app);
  registerDoctorRoutes(app);
  registerFacilityRoutes(app);
  registerHealthRoutes(app);

  return app;
}
