import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.string().min(1),
    CENTRAL_API_JWT_SECRET: z.string().min(32),
    ERP_FROM_EMAIL: z
      .string()
      .default("Viruj Health ERP <support@virujhealth.com>"),
    ERP_CLIENT_IP_HEADER: z.string().optional(),
    ERP_REVIEW_ADMIN_ORIGIN: z.url().default("https://admin.virujhealth.com"),
    ERP_REVIEW_ADMIN_ID: z.string().optional(),
    ERP_REVIEW_ADMIN_PASSWORD_HASH: z.string().optional(),
    ERP_REVIEW_ADMIN_SECRET: z.string().min(32).optional(),
    ERP_WEB_URL: z.url().optional(),
    CENTRAL_API_URL: z.url().optional(),
    RESEND_API_KEY: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
