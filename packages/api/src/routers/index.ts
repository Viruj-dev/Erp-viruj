import type { RouterClient } from "@orpc/server";

import { appointmentsRouter } from "./appointments";
import { protectedProcedure, publicProcedure } from "../index";
import { projectsRouter } from "./projects";
import { todoRouter } from "./todo";
import { testRouter } from "./test";

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
