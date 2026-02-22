import { pgTable, text, integer, serial } from "drizzle-orm/pg-core";

export const counters = pgTable("counters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  value: integer("value").notNull().default(0),
});
