import { db } from "@erp_virujhealth/db";
import * as schema from "@erp_virujhealth/db/schema/auth";
import { env } from "@erp_virujhealth/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { type AppRole } from "@erp_virujhealth/db/schema/auth";

export const PATIENT_ROLE: AppRole = "PATIENT";
export const DOCTOR_ROLE: AppRole = "DOCTOR";
export const HOSPITAL_ROLE: AppRole = "HOSPITAL";
export const CLINIC_ROLE: AppRole = "CLINIC";
export const RADIOLOGY_ROLE: AppRole = "RADIOLOGY";
export const PATHOLOGY_ROLE: AppRole = "PATHOLOGY";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [],
});
