import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "./middleware/auth";
import { appointmentsRouter } from "./routes/appointments";
import { projectsRouter } from "./routes/projects";
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
  appointments: appointmentsRouter,
  todo: todoRouter,
  test: testRouter,
  projects: projectsRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
