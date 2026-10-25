-- Run after access-review-user-deletion.sql in a disposable/staging ERP auth DB.
-- All fixtures are rolled back, including on assertion failure.
BEGIN;
DO $$
DECLARE
  prefix text := 'deletion-test-' || md5(random()::text);
  review_status text;
BEGIN
  INSERT INTO public.users (id, name, email)
    VALUES (prefix, 'Deletion test', prefix || '@example.invalid');
  FOREACH review_status IN ARRAY ARRAY['draft','pending','approved','rejected'] LOOP
    INSERT INTO public.organizations (id, name, slug, organization_type)
      VALUES (prefix || review_status, 'Deletion test', prefix || review_status, 'hospital');
    INSERT INTO public.erp_access_reviews (organization_id, applicant_id, status, snapshot)
      VALUES (prefix || review_status, prefix, review_status, '{"test":true}');
  END LOOP;
  DELETE FROM public.users WHERE id = prefix;
  IF (SELECT count(*) FROM public.erp_access_reviews
      WHERE organization_id LIKE prefix || '%'
        AND applicant_id IS NULL AND snapshot = '{"test":true}'::jsonb) <> 4 THEN
    RAISE EXCEPTION 'Deleting an applicant must retain all four reviews and snapshots';
  END IF;
  IF (SELECT count(*) FROM public.organizations WHERE id LIKE prefix || '%') <> 4 THEN
    RAISE EXCEPTION 'Deleting an applicant must retain organizations';
  END IF;
END $$;
ROLLBACK;
