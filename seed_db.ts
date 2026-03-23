import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: "apps/server/.env" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not found");
    return;
  }
  const sql = postgres(url, { ssl: "require" });
  try {
    console.log("Seeding mock appointments...");
    const existing = await sql`SELECT id FROM appointments LIMIT 1`;
    if (existing.length > 0) {
      console.log("Already has appointments, skipping seed.");
      return;
    }

    const nextId = "mock-" + Math.random().toString(36).substring(7);
    await sql`
      INSERT INTO appointments (
        id, patient_name, doctor_name, appointment_date, 
        appointment_time, appointment_mode, status
      ) VALUES (
        ${nextId}, 'Aarav Khanna', 'Dr. Meera Sethi', NOW(), 
        '09:30', 'In-person', 'confirmed'
      )
    `;
    console.log("Seed successful.");
  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await sql.end();
  }
}

main();
