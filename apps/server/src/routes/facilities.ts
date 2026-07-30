import { auth, hasOrganizationPermission } from "@erp_virujhealth/auth";
import { db } from "@erp_virujhealth/db";
import { facility } from "@erp_virujhealth/db/schema/auth";
import { and, asc, desc, eq, ne } from "drizzle-orm";
import type { Context, Hono } from "hono";
import { randomUUID } from "node:crypto";

type FacilityPermissionAction =
  | "archive"
  | "create"
  | "delete"
  | "publish"
  | "read"
  | "update";

type FacilityStatus = "active" | "archived" | "draft";
type FacilityVisibility = "hidden" | "public";

type FacilityInput = {
  appointmentRequired?: unknown;
  available247?: unknown;
  bannerImage?: unknown;
  category?: unknown;
  currency?: unknown;
  description?: unknown;
  displayOrder?: unknown;
  emergencyService?: unknown;
  galleryImages?: unknown;
  isAvailable?: unknown;
  isFeatured?: unknown;
  keywords?: unknown;
  name?: unknown;
  onlineBooking?: unknown;
  priceText?: unknown;
  seoDescription?: unknown;
  seoTitle?: unknown;
  shortDescription?: unknown;
  slug?: unknown;
  startingPrice?: unknown;
  status?: unknown;
  visibility?: unknown;
};

const facilityStatuses = ["active", "draft", "archived"] as const;
const facilityVisibilities = ["public", "hidden"] as const;

export function registerFacilityRoutes(app: Hono) {
  app.get("/erp/facilities", async (context) => {
    const access = await requireFacilityAccess(context, "read");

    if ("response" in access) {
      return access.response;
    }

    const rows = await db
      .select()
      .from(facility)
      .where(eq(facility.organizationId, access.organizationId))
      .orderBy(asc(facility.displayOrder), desc(facility.updatedAt));

    return context.json(rows.map(mapFacility));
  });

  app.post("/erp/facilities", async (context) => {
    const access = await requireFacilityAccess(context, "create");

    if ("response" in access) {
      return access.response;
    }

    const payload = (await context.req.json().catch(() => ({}))) as FacilityInput;
    const parsed = normalizeFacilityInput(payload);
    const validationResponse = validateFacilityInput(context, parsed);

    if (validationResponse) {
      return validationResponse;
    }

    const slug = await uniqueSlug(access.organizationId, parsed.slug || slugify(parsed.name));
    const actor = access.actorName;
    const now = new Date();

    const [created] = await db
      .insert(facility)
      .values({
        ...parsed,
        id: randomUUID(),
        createdAt: now,
        createdBy: actor,
        organizationId: access.organizationId,
        slug,
        updatedAt: now,
        updatedBy: actor,
      })
      .returning();

    if (!created) {
      return context.json({ error: "facility_not_created" }, 500);
    }

    return context.json(mapFacility(created), 201);
  });

  app.patch("/erp/facilities/reorder", async (context) => {
    const access = await requireFacilityAccess(context, "update");

    if ("response" in access) {
      return access.response;
    }

    const payload = (await context.req.json().catch(() => ({}))) as {
      items?: Array<{ displayOrder?: unknown; id?: unknown }>;
    };
    const items = Array.isArray(payload.items) ? payload.items : [];

    await Promise.all(
      items.map((item, index) => {
        const id = textValue(item.id);
        const displayOrder = numberValue(item.displayOrder) ?? index;

        if (!id) {
          return Promise.resolve();
        }

        return db
          .update(facility)
          .set({ displayOrder, updatedAt: new Date(), updatedBy: access.actorName })
          .where(
            and(
              eq(facility.id, id),
              eq(facility.organizationId, access.organizationId)
            )
          );
      })
    );

    return context.json({ success: true });
  });

  app.get("/erp/facilities/:id", async (context) => {
    const access = await requireFacilityAccess(context, "read");

    if ("response" in access) {
      return access.response;
    }

    const record = await findFacility(access.organizationId, context.req.param("id"));

    if (!record) {
      return context.json({ error: "facility_not_found" }, 404);
    }

    return context.json(mapFacility(record));
  });

  app.patch("/erp/facilities/:id/status", async (context) => {
    const payload = (await context.req.json().catch(() => ({}))) as FacilityInput;
    const nextStatus = statusValue(payload.status);
    const action: FacilityPermissionAction =
      nextStatus === "archived"
        ? "archive"
        : nextStatus === "active"
          ? "publish"
          : "update";
    const access = await requireFacilityAccess(context, action);

    if ("response" in access) {
      return access.response;
    }

    if (!nextStatus) {
      return context.json(
        { error: "invalid_status", message: "Use active, draft, or archived." },
        400
      );
    }

    const [updated] = await db
      .update(facility)
      .set({
        isAvailable: boolValue(payload.isAvailable) ?? undefined,
        status: nextStatus,
        updatedAt: new Date(),
        updatedBy: access.actorName,
      })
      .where(
        and(
          eq(facility.id, context.req.param("id")),
          eq(facility.organizationId, access.organizationId)
        )
      )
      .returning();

    if (!updated) {
      return context.json({ error: "facility_not_found" }, 404);
    }

    return context.json(mapFacility(updated));
  });

  app.patch("/erp/facilities/:id", async (context) => {
    const access = await requireFacilityAccess(context, "update");

    if ("response" in access) {
      return access.response;
    }

    const facilityId = context.req.param("id");
    const payload = (await context.req.json().catch(() => ({}))) as FacilityInput;
    const parsed = normalizeFacilityInput(payload);
    const validationResponse = validateFacilityInput(context, parsed);

    if (validationResponse) {
      return validationResponse;
    }

    const desiredSlug = parsed.slug || slugify(parsed.name);
    const existingSlug = await db
      .select({ id: facility.id })
      .from(facility)
      .where(
        and(
          eq(facility.organizationId, access.organizationId),
          eq(facility.slug, desiredSlug),
          ne(facility.id, facilityId)
        )
      )
      .limit(1);

    if (existingSlug.length > 0) {
      return context.json(
        { error: "slug_exists", message: "Slug must be unique." },
        409
      );
    }

    const [updated] = await db
      .update(facility)
      .set({
        ...parsed,
        slug: desiredSlug,
        updatedAt: new Date(),
        updatedBy: access.actorName,
      })
      .where(
        and(
          eq(facility.id, facilityId),
          eq(facility.organizationId, access.organizationId)
        )
      )
      .returning();

    if (!updated) {
      return context.json({ error: "facility_not_found" }, 404);
    }

    return context.json(mapFacility(updated));
  });

  app.delete("/erp/facilities/:id", async (context) => {
    const access = await requireFacilityAccess(context, "delete");

    if ("response" in access) {
      return access.response;
    }

    const [deleted] = await db
      .delete(facility)
      .where(
        and(
          eq(facility.id, context.req.param("id")),
          eq(facility.organizationId, access.organizationId)
        )
      )
      .returning({ id: facility.id });

    if (!deleted) {
      return context.json({ error: "facility_not_found" }, 404);
    }

    return context.json({ success: true });
  });
}

async function requireFacilityAccess(context: Context, action: FacilityPermissionAction) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });
  const activeOrganization = session?.activeOrganization as
    | { id?: string; organizationType?: string }
    | null
    | undefined;
  const activeMember = session?.activeMember as { role?: string } | null | undefined;

  if (!session?.user) {
    return {
      response: context.json(
        { error: "not_authenticated", message: "Sign in before managing facilities." },
        401
      ),
    };
  }

  if (!activeOrganization?.id) {
    return {
      response: context.json(
        {
          error: "active_organization_required",
          message: "Choose a hospital or clinic workspace before managing facilities.",
        },
        401
      ),
    };
  }

  if (activeOrganization.organizationType !== "hospital" && activeOrganization.organizationType !== "clinic") {
    return {
      response: context.json(
        {
          error: "provider_workspace_required",
          message: "Facilities & Services is only available in hospital and clinic workspaces.",
        },
        403
      ),
    };
  }

  const role = activeMember?.role ?? "STAFF";

  if (!hasOrganizationPermission(role, { facility: [action] })) {
    return {
      response: context.json(
        { error: "permission_denied", message: `Missing facility.${action} permission.` },
        403
      ),
    };
  }

  return {
    actorName: session.user.name || session.user.email || "Viruj User",
    organizationId: activeOrganization.id,
  };
}

async function findFacility(organizationId: string, id: string) {
  const [record] = await db
    .select()
    .from(facility)
    .where(and(eq(facility.id, id), eq(facility.organizationId, organizationId)))
    .limit(1);

  return record ?? null;
}

async function uniqueSlug(organizationId: string, requestedSlug: string) {
  const baseSlug = slugify(requestedSlug) || "service";
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await db
      .select({ id: facility.id })
      .from(facility)
      .where(and(eq(facility.organizationId, organizationId), eq(facility.slug, slug)))
      .limit(1);

    if (existing.length === 0) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function normalizeFacilityInput(payload: FacilityInput) {
  return {
    appointmentRequired: boolValue(payload.appointmentRequired) ?? false,
    available247: boolValue(payload.available247) ?? false,
    bannerImage: textValue(payload.bannerImage),
    category: textValue(payload.category),
    currency: textValue(payload.currency) || "INR",
    description: textValue(payload.description),
    displayOrder: numberValue(payload.displayOrder) ?? 0,
    emergencyService: boolValue(payload.emergencyService) ?? false,
    galleryImages: stringArray(payload.galleryImages),
    isAvailable: boolValue(payload.isAvailable) ?? true,
    isFeatured: boolValue(payload.isFeatured) ?? false,
    keywords: stringArray(payload.keywords),
    name: textValue(payload.name),
    onlineBooking: boolValue(payload.onlineBooking) ?? false,
    priceText: textValue(payload.priceText),
    seoDescription: textValue(payload.seoDescription),
    seoTitle: textValue(payload.seoTitle),
    shortDescription: textValue(payload.shortDescription),
    slug: slugify(textValue(payload.slug)),
    startingPrice: numberValue(payload.startingPrice),
    status: statusValue(payload.status) ?? "draft",
    visibility: visibilityValue(payload.visibility) ?? "public",
  };
}

function validateFacilityInput(
  context: Context,
  input: ReturnType<typeof normalizeFacilityInput>
) {
  if (!input.name || !input.category) {
    return context.json(
      {
        error: "invalid_facility",
        message: "Service name and category are required.",
      },
      400
    );
  }

  if (input.startingPrice !== null && input.startingPrice < 0) {
    return context.json(
      { error: "invalid_price", message: "Price cannot be negative." },
      400
    );
  }

  return null;
}

function mapFacility(record: typeof facility.$inferSelect) {
  return {
    appointmentRequired: record.appointmentRequired,
    available247: record.available247,
    bannerImage: record.bannerImage,
    category: record.category,
    createdAt: record.createdAt.toISOString(),
    createdBy: record.createdBy,
    currency: record.currency,
    description: record.description,
    displayOrder: record.displayOrder,
    emergencyService: record.emergencyService,
    galleryImages: record.galleryImages,
    id: record.id,
    isAvailable: record.isAvailable,
    isFeatured: record.isFeatured,
    keywords: record.keywords,
    name: record.name,
    onlineBooking: record.onlineBooking,
    organizationId: record.organizationId,
    priceText: record.priceText,
    seoDescription: record.seoDescription,
    seoTitle: record.seoTitle,
    shortDescription: record.shortDescription,
    slug: record.slug,
    startingPrice: record.startingPrice,
    status: record.status as FacilityStatus,
    updatedAt: record.updatedAt.toISOString(),
    updatedBy: record.updatedBy,
    visibility: record.visibility as FacilityVisibility,
  };
}

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function boolValue(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function numberValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

function stringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => textValue(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function statusValue(value: unknown): FacilityStatus | null {
  const normalized = textValue(value).toLowerCase();
  return facilityStatuses.includes(normalized as FacilityStatus)
    ? (normalized as FacilityStatus)
    : null;
}

function visibilityValue(value: unknown): FacilityVisibility | null {
  const normalized = textValue(value).toLowerCase();
  return facilityVisibilities.includes(normalized as FacilityVisibility)
    ? (normalized as FacilityVisibility)
    : null;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
