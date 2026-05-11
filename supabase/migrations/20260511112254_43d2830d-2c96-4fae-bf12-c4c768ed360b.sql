-- Extend profiles with creator fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text UNIQUE,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS profile_kind text,
  ADD COLUMN IF NOT EXISTS is_setup_complete boolean NOT NULL DEFAULT false;

-- Allow public reads of profiles that have a username (i.e. opted-in public profile)
DROP POLICY IF EXISTS "Public can view profiles with username" ON public.profiles;
CREATE POLICY "Public can view profiles with username"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (username IS NOT NULL);

-- Followers table
CREATE TABLE IF NOT EXISTS public.profile_followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  follower_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, follower_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_followers_profile ON public.profile_followers(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_followers_follower ON public.profile_followers(follower_id);

ALTER TABLE public.profile_followers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read followers" ON public.profile_followers;
CREATE POLICY "Anyone can read followers"
ON public.profile_followers FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Users can follow" ON public.profile_followers;
CREATE POLICY "Users can follow"
ON public.profile_followers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.profile_followers;
CREATE POLICY "Users can unfollow"
ON public.profile_followers FOR DELETE
TO authenticated
USING (auth.uid() = follower_id);

-- Trigger to keep profiles.updated_at fresh
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper to fetch a profile + stats by username (public, safe)
CREATE OR REPLACE FUNCTION public.get_public_profile(_username text)
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  cover_url text,
  bio text,
  category text,
  profile_kind text,
  company text,
  website text,
  social_links jsonb,
  follower_count bigint,
  podcast_count bigint,
  episode_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.cover_url,
    p.bio,
    p.category,
    p.profile_kind,
    p.company,
    p.website,
    p.social_links,
    (SELECT count(*) FROM public.profile_followers f WHERE f.profile_id = p.id)::bigint AS follower_count,
    (SELECT count(*) FROM public.podcasts pod WHERE pod.owner_id = p.id AND pod.is_published = true)::bigint AS podcast_count,
    (SELECT count(*) FROM public.episodes e WHERE e.owner_id = p.id AND e.status = 'published')::bigint AS episode_count
  FROM public.profiles p
  WHERE p.username = _username
  LIMIT 1;
$$;