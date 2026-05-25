ALTER TYPE "public"."organization_type" ADD VALUE 'doctor' BEFORE 'radiology';--> statement-breakpoint
CREATE TABLE "devtools_user" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"template_key" text NOT NULL,
	"label" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "organization_id" text;--> statement-breakpoint
UPDATE "appointments"
SET "organization_id" = (
	SELECT "id"
	FROM "organizations"
	ORDER BY "created_at"
	LIMIT 1
)
WHERE "organization_id" IS NULL;--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM "appointments" WHERE "organization_id" IS NULL) THEN
		RAISE EXCEPTION 'Cannot migrate appointments.organization_id because appointments exist before any organization was created.';
	END IF;
END $$;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_organization_id_idx" ON "appointments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "appointments_organization_status_idx" ON "appointments" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "appointments_organization_date_idx" ON "appointments" USING btree ("organization_id","appointment_date");
