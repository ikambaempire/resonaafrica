-- Add video_url column for ecosystem entries
ALTER TABLE public.ecosystem_entries ADD COLUMN IF NOT EXISTS video_url text;

-- Create public storage bucket for ecosystem media (logos, covers, videos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ecosystem-media', 'ecosystem-media', true)
ON CONFLICT (id) DO NOTHING;

-- Policies: anyone can read; admins can write/update/delete
DROP POLICY IF EXISTS "Public read ecosystem-media" ON storage.objects;
CREATE POLICY "Public read ecosystem-media" ON storage.objects
  FOR SELECT USING (bucket_id = 'ecosystem-media');

DROP POLICY IF EXISTS "Admins upload ecosystem-media" ON storage.objects;
CREATE POLICY "Admins upload ecosystem-media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ecosystem-media' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins update ecosystem-media" ON storage.objects;
CREATE POLICY "Admins update ecosystem-media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'ecosystem-media' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins delete ecosystem-media" ON storage.objects;
CREATE POLICY "Admins delete ecosystem-media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'ecosystem-media' AND public.has_role(auth.uid(), 'admin'::public.app_role));