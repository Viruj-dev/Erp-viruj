import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: "apps/server/.env" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not found");
    return;
  }
  
  // Create a connection
  const sql = postgres(url, { ssl: "require" });

  try {
    console.log("Setting up database tables manually with postgres driver...");

    // Create Enums
    await sql.unsafe(`
      DO $$ BEGIN
        CREATE TYPE app_role AS ENUM ('PATIENT', 'DOCTOR', 'HOSPITAL', 'CLINIC', 'RADIOLOGY', 'PATHOLOGY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Organizations
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    // Users
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        email_verified BOOLEAN DEFAULT FALSE NOT NULL,
        image TEXT,
        role app_role DEFAULT 'PATIENT' NOT NULL,
        organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    // Appointments
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        patient_user_id TEXT,
        patient_name TEXT NOT NULL,
        patient_phone TEXT,
        patient_age INTEGER,
        patient_gender TEXT,
        patient_height TEXT,
        patient_weight TEXT,
        doctor_id INTEGER,
        doctor_name TEXT NOT NULL,
        doctor_specialty TEXT,
        doctor_qualifications TEXT,
        hospital_id INTEGER,
        hospital_name TEXT,
        hospital_address TEXT,
        department_name TEXT,
        appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
        appointment_time TEXT NOT NULL,
        appointment_mode TEXT NOT NULL,
        reason TEXT,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'pending_approval',
        approval_notes TEXT,
        approved_by TEXT,
        approved_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        cancelled_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    console.log("Tables created successfully.");

  } catch (err) {
    console.error("Database setup failed:", err);
  } finally {
    await sql.end();
  }
}

main();
