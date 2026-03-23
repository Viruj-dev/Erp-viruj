import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: "apps/server/.env" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not found");
    return;
  }
  const sql = neon(url);
  try {
    console.log("Creating appointments table...");
    await sql(`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        patient_name TEXT NOT NULL,
        patient_phone TEXT,
        doctor_name TEXT NOT NULL,
        doctor_specialty TEXT,
        department_name TEXT,
        hospital_address TEXT,
        appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
        appointment_time TEXT NOT NULL,
        appointment_mode TEXT NOT NULL,
        reason TEXT,
        approval_notes TEXT,
        status TEXT NOT NULL DEFAULT 'pending_approval',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Table created.");
  } catch (err) {
    console.error("Failed to create table:", err);
  }
}

main();
