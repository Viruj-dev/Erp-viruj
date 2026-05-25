import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "./middleware/auth";
import { auditRouter } from "./routes/audit";
import { appointmentsRouter } from "./routes/appointments";
import {
  billingRouter,
  communityRouter,
  patientsRouter,
  schedulesRouter,
} from "./routes/module-access";
import { projectsRouter } from "./routes/projects";
import { staffRouter } from "./routes/staff";
import { testRouter } from "./routes/test";
import { todoRouter } from "./routes/todo";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  audit: auditRouter,
  appointments: appointmentsRouter,
  billing: billingRouter,
  community: communityRouter,
  patients: patientsRouter,
  schedules: schedulesRouter,
  staff: staffRouter,
  todo: todoRouter,
  test: testRouter,
  projects: projectsRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
