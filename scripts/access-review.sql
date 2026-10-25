-- Run against the ERP AUTH database before deploying either service.
BEGIN;
-- Better Auth stores hashed sign-in links here; some local auth databases predate it.
CREATE TABLE IF NOT EXISTS public.verifications (
 id text PRIMARY KEY,
 identifier text NOT NULL,
 value text NOT NULL,
 expires_at timestamp NOT NULL,
 created_at timestamp NOT NULL DEFAULT now(),
 updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS verifications_identifier_idx ON public.verifications(identifier);
CREATE TABLE IF NOT EXISTS erp_access_reviews (
 organization_id text PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
 applicant_id text REFERENCES users(id) ON DELETE SET NULL,
 status text NOT NULL CHECK (status IN ('draft','pending','approved','rejected')),
 snapshot jsonb NOT NULL,
 submitted_at timestamptz NOT NULL DEFAULT now(),
 reviewed_at timestamptz,
 reason text,
 email_sent_at timestamptz,
 revision integer NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS erp_access_reviews_queue ON erp_access_reviews(status, submitted_at);
CREATE TABLE IF NOT EXISTS erp_request_limits (
 key text NOT NULL,
 window_start timestamptz NOT NULL,
 count integer NOT NULL,
 PRIMARY KEY(key, window_start)
);
COMMIT;
-- Hashed access-link claims prevent concurrent reuse on multiple auth instances.
CREATE TABLE IF NOT EXISTS erp_consumed_access_links (
 token_hash text PRIMARY KEY,
 consumed_at timestamptz NOT NULL DEFAULT now()
);
