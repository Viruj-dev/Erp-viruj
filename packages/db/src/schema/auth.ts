import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const organizationTypes = [
  "hospital",
  "clinic",
  "doctor",
  "radiology",
  "pathology",
] as const;

export type OrganizationType = (typeof organizationTypes)[number];

export function normalizeOrganizationType(value: string): OrganizationType {
  const normalized = value.trim().toLowerCase();

  if (organizationTypes.includes(normalized as OrganizationType)) {
    return normalized as OrganizationType;
  }

  throw new Error("Invalid organization type");
}

export const organizationTypeEnum = pgEnum(
  "organization_type",
  organizationTypes
);

export const organization = pgTable(
  "organizations",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    organizationType: organizationTypeEnum("organization_type").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("organizations_slug_idx").on(table.slug),
    index("organizations_type_idx").on(table.organizationType),
  ]
);

export const user = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    activeOrganizationId: text("active_organization_id").references(
      () => organization.id,
      {
        onDelete: "set null",
      }
    ),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("sessions_active_organization_id_idx").on(table.activeOrganizationId),
    index("sessions_user_id_idx").on(table.userId),
  ]
);

export const account = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("accounts_user_id_idx").on(table.userId)]
);

export const verification = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)]
);

export const member = pgTable(
  "members",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("members_organization_id_idx").on(table.organizationId),
    index("members_user_id_idx").on(table.userId),
    uniqueIndex("members_organization_user_idx").on(
      table.organizationId,
      table.userId
    ),
  ]
);

export const invitation = pgTable(
  "invitations",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role").notNull(),
    status: text("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("invitations_email_idx").on(table.email),
    index("invitations_organization_id_idx").on(table.organizationId),
    index("invitations_status_idx").on(table.status),
  ]
);

export const organizationRelations = relations(organization, ({ many }) => ({
  doctors: many(doctor),
  facilities: many(facility),
  invitations: many(invitation),
  members: many(member),
  sessions: many(session),
}));

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  invitationsSent: many(invitation),
  memberships: many(member),
  sessions: many(session),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  activeOrganization: one(organization, {
    fields: [session.activeOrganizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  inviter: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
}));

export const devtoolsUser = pgTable(
  "devtools_user",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    templateKey: text("template_key").notNull(),
    label: text("label").notNull(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }
);

export const doctor = pgTable(
  "doctors",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    specialty: text("specialty").notNull(),
    department: text("department").notNull().default("General OPD"),
    qualification: text("qualification").notNull().default(""),
    experience: text("experience").notNull().default(""),
    fee: text("fee").notNull().default(""),
    phone: text("phone").notNull().default(""),
    availability: text("availability").notNull().default(""),
    appVisibility: text("app_visibility").notNull().default("hidden"),
    published: boolean("published").default(false).notNull(),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("doctors_organization_id_idx").on(table.organizationId),
    index("doctors_organization_published_idx").on(
      table.organizationId,
      table.published
    ),
  ]
);

export const doctorRelations = relations(doctor, ({ one }) => ({
  organization: one(organization, {
    fields: [doctor.organizationId],
    references: [organization.id],
  }),
}));


export const facility = pgTable(
  "facilities",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    category: text("category").notNull(),
    shortDescription: text("short_description").notNull().default(""),
    description: text("description").notNull().default(""),
    bannerImage: text("banner_image").notNull().default(""),
    galleryImages: jsonb("gallery_images").$type<string[]>().notNull().default([]),
    isAvailable: boolean("is_available").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    appointmentRequired: boolean("appointment_required").default(false).notNull(),
    onlineBooking: boolean("online_booking").default(false).notNull(),
    emergencyService: boolean("emergency_service").default(false).notNull(),
    available247: boolean("available_247").default(false).notNull(),
    startingPrice: integer("starting_price"),
    currency: text("currency").notNull().default("INR"),
    priceText: text("price_text").notNull().default(""),
    status: text("status").notNull().default("draft"),
    displayOrder: integer("display_order").default(0).notNull(),
    visibility: text("visibility").notNull().default("public"),
    seoTitle: text("seo_title").notNull().default(""),
    seoDescription: text("seo_description").notNull().default(""),
    keywords: jsonb("keywords").$type<string[]>().notNull().default([]),
    createdBy: text("created_by").notNull().default("System"),
    updatedBy: text("updated_by").notNull().default("System"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("facilities_organization_id_idx").on(table.organizationId),
    index("facilities_organization_status_idx").on(
      table.organizationId,
      table.status
    ),
    index("facilities_organization_category_idx").on(
      table.organizationId,
      table.category
    ),
    uniqueIndex("facilities_organization_slug_idx").on(
      table.organizationId,
      table.slug
    ),
  ]
);

export const facilityRelations = relations(facility, ({ one }) => ({
  organization: one(organization, {
    fields: [facility.organizationId],
    references: [organization.id],
  }),
}));
