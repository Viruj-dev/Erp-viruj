import { auth } from "@erp_virujhealth/auth";
import { db } from "@erp_virujhealth/db";
import { doctor } from "@erp_virujhealth/db/schema/auth";
import { and, desc, eq } from "drizzle-orm";
import type { Hono } from "hono";
import { randomUUID } from "node:crypto";

type DoctorInput = {
  availability?: unknown;
  department?: unknown;
  experience?: unknown;
  fee?: unknown;
  name?: unknown;
  phone?: unknown;
  qualification?: unknown;
  specialty?: unknown;
};

export function registerDoctorRoutes(app: Hono) {
  app.get("/erp/doctors", async (context) => {
    const organizationId = await requireActiveOrganizationId(context.req.raw.headers);

    const doctors = await db
      .select()
      .from(doctor)
      .where(eq(doctor.organizationId, organizationId))
      .orderBy(desc(doctor.createdAt));

    return context.json(doctors.map(mapDoctor));
  });

  app.post("/erp/doctors", async (context) => {
    const organizationId = await requireActiveOrganizationId(context.req.raw.headers);
    const payload = (await context.req.json().catch(() => ({}))) as DoctorInput;
    const name = textValue(payload.name);
    const specialty = textValue(payload.specialty);

    if (!name || !specialty) {
      return context.json(
        {
          error: "invalid_doctor",
          message: "Doctor name and specialty are required.",
        },
        400
      );
    }

    const [created] = await db
      .insert(doctor)
      .values({
        id: randomUUID(),
        organizationId,
        name,
        specialty,
        availability: textValue(payload.availability),
        department: textValue(payload.department) || "General OPD",
        experience: textValue(payload.experience),
        fee: textValue(payload.fee),
        phone: textValue(payload.phone),
        qualification: textValue(payload.qualification),
      })
      .returning();

    if (!created) {
      return context.json({ error: "doctor_not_created" }, 500);
    }

    return context.json(mapDoctor(created), 201);
  });

  app.patch("/erp/doctors/:id", async (context) => {
    const organizationId = await requireActiveOrganizationId(context.req.raw.headers);
    const payload = (await context.req.json().catch(() => ({}))) as DoctorInput;
    const name = textValue(payload.name);
    const specialty = textValue(payload.specialty);

    if (!name || !specialty) {
      return context.json(
        {
          error: "invalid_doctor",
          message: "Doctor name and specialty are required.",
        },
        400
      );
    }

    const [updated] = await db
      .update(doctor)
      .set({
        name,
        specialty,
        availability: textValue(payload.availability),
        department: textValue(payload.department) || "General OPD",
        experience: textValue(payload.experience),
        fee: textValue(payload.fee),
        phone: textValue(payload.phone),
        qualification: textValue(payload.qualification),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(doctor.id, context.req.param("id")),
          eq(doctor.organizationId, organizationId)
        )
      )
      .returning();

    if (!updated) {
      return context.json({ error: "doctor_not_found" }, 404);
    }

    return context.json(mapDoctor(updated));
  });

  app.delete("/erp/doctors/:id", async (context) => {
    const organizationId = await requireActiveOrganizationId(context.req.raw.headers);

    const [deleted] = await db
      .delete(doctor)
      .where(
        and(
          eq(doctor.id, context.req.param("id")),
          eq(doctor.organizationId, organizationId)
        )
      )
      .returning({ id: doctor.id });

    if (!deleted) {
      return context.json({ error: "doctor_not_found" }, 404);
    }

    return context.json({ success: true });
  });

  app.post("/erp/doctors/:id/publish", async (context) => {
    const organizationId = await requireActiveOrganizationId(context.req.raw.headers);
    const now = new Date();

    const [updated] = await db
      .update(doctor)
      .set({
        appVisibility: "visible",
        published: true,
        publishedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(doctor.id, context.req.param("id")),
          eq(doctor.organizationId, organizationId)
        )
      )
      .returning();

    if (!updated) {
      return context.json({ error: "doctor_not_found" }, 404);
    }

    return context.json(mapDoctor(updated));
  });

  app.post("/erp/doctors/publish", async (context) => {
    const organizationId = await requireActiveOrganizationId(context.req.raw.headers);
    const now = new Date();

    const doctors = await db
      .update(doctor)
      .set({
        appVisibility: "visible",
        published: true,
        publishedAt: now,
        updatedAt: now,
      })
      .where(eq(doctor.organizationId, organizationId))
      .returning();

    return context.json({
      count: doctors.length,
      doctors: doctors.map(mapDoctor),
      message: "Doctor directory published to the app.",
    });
  });
}

async function requireActiveOrganizationId(headers: Headers) {
  const session = await auth.api.getSession({ headers });
  const activeOrganization = session?.activeOrganization as
    | {
        id?: string;
      }
    | null
    | undefined;

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  if (!activeOrganization?.id) {
    throw new Error("Active organization is required");
  }

  return activeOrganization.id;
}

function mapDoctor(record: typeof doctor.$inferSelect) {
  return {
    appVisibility: record.appVisibility as "hidden" | "visible",
    availability: record.availability,
    createdAt: record.createdAt.toISOString(),
    department: record.department,
    experience: record.experience,
    fee: record.fee,
    id: record.id,
    name: record.name,
    organizationId: record.organizationId,
    phone: record.phone,
    published: record.published,
    publishedAt: record.publishedAt?.toISOString() ?? null,
    qualification: record.qualification,
    specialty: record.specialty,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
