import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import dotenv from "dotenv";

dotenv.config({ path: "apps/server/.env" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not found");
    return;
  }
  console.log("Testing connection to:", url.split("@")[1]);
  const sql = neon(url);
  const db = drizzle(sql);

  try {
    const result = await db.execute("SELECT 1 as connected");
    console.log("Successfully connected to DB:", result);
  } catch (err) {
    console.error("Failed to connect to DB:", err);
  }
}

main();
