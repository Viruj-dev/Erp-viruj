import { db } from "@erp_virujhealth/db";
import { counters } from "@erp_virujhealth/db/schema/counter";
import { eq } from "drizzle-orm";
import z from "zod";

import { publicProcedure } from "../index";

export const testRouter = {
  ping: publicProcedure.handler(() => {
    return {
      message: "pong",
      timestamp: new Date().toISOString(),
    };
  }),

  getCounter: publicProcedure
    .input(z.object({ name: z.string() }))
    .handler(async ({ input }) => {
      const result = await db
        .select()
        .from(counters)
        .where(eq(counters.name, input.name))
        .limit(1);
      
      if (result.length === 0) {
        // Create it if it doesn't exist
        const [inserted] = await db
          .insert(counters)
          .values({ name: input.name, value: 0 })
          .returning();
        return inserted;
      }
      
      return result[0];
    }),

  incrementCounter: publicProcedure
    .input(z.object({ name: z.string(), amount: z.number().default(1) }))
    .handler(async ({ input }) => {
      const result = await db
        .select()
        .from(counters)
        .where(eq(counters.name, input.name))
        .limit(1);

      if (result.length === 0) {
        const [inserted] = await db
          .insert(counters)
          .values({ name: input.name, value: input.amount })
          .returning();
        return inserted;
      }

      const current = result[0];
      if (!current) {
        throw new Error("Counter not found");
      }

      const [updated] = await db
        .update(counters)
        .set({ value: current.value + input.amount })
        .where(eq(counters.name, input.name))
        .returning();
      
      return updated;
    }),

  resetCounter: publicProcedure
    .input(z.object({ name: z.string() }))
    .handler(async ({ input }) => {
      const [updated] = await db
        .update(counters)
        .set({ value: 0 })
        .where(eq(counters.name, input.name))
        .returning();
      
      return updated;
    }),
};
