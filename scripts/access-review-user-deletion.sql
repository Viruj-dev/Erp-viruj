-- Run against the ERP AUTH database before deploying the deleted-applicant UI.
-- Preserve organization review decisions and snapshots when an applicant is deleted.
BEGIN;
ALTER TABLE public.erp_access_reviews
  DROP CONSTRAINT erp_access_reviews_applicant_id_fkey,
  ALTER COLUMN applicant_id DROP NOT NULL,
  ADD CONSTRAINT erp_access_reviews_applicant_id_fkey
    FOREIGN KEY (applicant_id) REFERENCES public.users(id) ON DELETE SET NULL;
COMMIT;
