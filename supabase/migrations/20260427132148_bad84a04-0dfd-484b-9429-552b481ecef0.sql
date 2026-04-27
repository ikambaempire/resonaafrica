DROP TABLE IF EXISTS public.email_templates CASCADE;
DROP TABLE IF EXISTS public.form_fields CASCADE;
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

DROP FUNCTION IF EXISTS public.register_for_event(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.get_registration_count(uuid) CASCADE;

DROP TYPE IF EXISTS public.event_status CASCADE;
DROP TYPE IF EXISTS public.registration_status CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'creator' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'creator';
  END IF;
EXCEPTION WHEN undefined_object THEN
  NULL;
END $$;