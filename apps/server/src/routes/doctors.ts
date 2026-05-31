import { auth } from "@erp_virujhealth/auth";
import { db } from "@erp_virujhealth/db";
import { doctor } from "@erp_virujhealth/db/schema/auth";
import { and, desc, eq } from "drizzle-orm";
import type { Context, Hono } from "hono";
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
    const access = await requireHospitalOrganizationId(context);

    if ("response" in access) {
      return access.response;
    }

    const doctors = await db
      .select()
      .from(doctor)
      .where(eq(doctor.organizationId, access.organizationId))
      .orderBy(desc(doctor.createdAt));

    return context.json(doctors.map(mapDoctor));
  });

  app.post("/erp/doctors", async (context) => {
    const access = await requireHospitalOrganizationId(context);

    if ("response" in access) {
      return access.response;
    }

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
        organizationId: access.organizationId,
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
    const access = await requireHospitalOrganizationId(context);

    if ("response" in access) {
      return access.response;
    }

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
          eq(doctor.organizationId, access.organizationId)
        )
      )
      .returning();

    if (!updated) {
      return context.json({ error: "doctor_not_found" }, 404);
    }

    return context.json(mapDoctor(updated));
  });

  app.delete("/erp/doctors/:id", async (context) => {
    const access = await requireHospitalOrganizationId(context);

    if ("response" in access) {
      return access.response;
    }

    const [deleted] = await db
      .delete(doctor)
      .where(
        and(
          eq(doctor.id, context.req.param("id")),
          eq(doctor.organizationId, access.organizationId)
        )
      )
      .returning({ id: doctor.id });

    if (!deleted) {
      return context.json({ error: "doctor_not_found" }, 404);
    }

    return context.json({ success: true });
  });

  app.post("/erp/doctors/:id/publish", async (context) => {
    const access = await requireHospitalOrganizationId(context);

    if ("response" in access) {
      return access.response;
    }

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
          eq(doctor.organizationId, access.organizationId)
        )
      )
      .returning();

    if (!updated) {
      return context.json({ error: "doctor_not_found" }, 404);
    }

    return context.json(mapDoctor(updated));
  });

  app.post("/erp/doctors/publish", async (context) => {
    const access = await requireHospitalOrganizationId(context);

    if ("response" in access) {
      return access.response;
    }

    const now = new Date();

    const doctors = await db
      .update(doctor)
      .set({
        appVisibility: "visible",
        published: true,
        publishedAt: now,
        updatedAt: now,
      })
      .where(eq(doctor.organizationId, access.organizationId))
      .returning();

    return context.json({
      count: doctors.length,
      doctors: doctors.map(mapDoctor),
      message: "Doctor directory published to the app.",
    });
  });
}

async function requireHospitalOrganizationId(context: Context) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });
  const activeOrganization = session?.activeOrganization as
    | {
        id?: string;
        organizationType?: string;
      }
    | null
    | undefined;

  if (!session?.user) {
    return {
      response: context.json(
        {
          error: "not_authenticated",
          message: "Sign in before managing hospital doctors.",
        },
        401
      ),
    };
  }

  if (!activeOrganization?.id) {
    return {
      response: context.json(
        {
          error: "active_organization_required",
          message: "Choose a hospital workspace before managing doctors.",
        },
        401
      ),
    };
  }

  if (activeOrganization.organizationType !== "hospital") {
    return {
      response: context.json(
        {
          error: "hospital_workspace_required",
          message: "Doctor directory management is only available in hospital workspaces.",
        },
        403
      ),
    };
  }

  return {
    organizationId: activeOrganization.id,
  };
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
