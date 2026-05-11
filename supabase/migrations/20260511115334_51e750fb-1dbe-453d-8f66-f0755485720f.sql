
ALTER TABLE public.episodes
  ADD COLUMN IF NOT EXISTS youtube_video_id text,
  ADD COLUMN IF NOT EXISTS youtube_views bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS youtube_views_synced_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_episodes_youtube_video_id ON public.episodes(youtube_video_id) WHERE youtube_video_id IS NOT NULL;

UPDATE public.episodes
SET youtube_video_id = (regexp_match(embed_url, '(?:v=|youtu\.be/|embed/|shorts/)([A-Za-z0-9_-]{11})'))[1]
WHERE embed_provider = 'youtube'
  AND embed_url IS NOT NULL
  AND youtube_video_id IS NULL;

DROP FUNCTION IF EXISTS public.get_top_podcasts(integer);

CREATE FUNCTION public.get_top_podcasts(_limit integer DEFAULT 10)
RETURNS TABLE(podcast_id uuid, plays bigint, resona_views bigint, youtube_views bigint, slug text, title text, cover_url text, category text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH counts AS (
    SELECT ep.podcast_id, count(*)::bigint AS plays
    FROM public.episode_plays ep
    GROUP BY ep.podcast_id
  ),
  yt AS (
    SELECT e.podcast_id, coalesce(sum(e.youtube_views),0)::bigint AS yt_views
    FROM public.episodes e
    GROUP BY e.podcast_id
  )
  SELECT
    p.id AS podcast_id,
    (coalesce(c.plays,0) + coalesce(y.yt_views,0))::bigint AS plays,
    coalesce(c.plays,0)::bigint AS resona_views,
    coalesce(y.yt_views,0)::bigint AS youtube_views,
    p.slug, p.title, p.cover_url, p.category
  FROM public.podcasts p
  LEFT JOIN counts c ON c.podcast_id = p.id
  LEFT JOIN yt y ON y.podcast_id = p.id
  WHERE p.is_published = true
  ORDER BY (coalesce(c.plays,0) + coalesce(y.yt_views,0)) DESC, p.created_at DESC
  LIMIT _limit;
$$;

CREATE TABLE IF NOT EXISTS public.creator_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  external_id text,
  handle text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  connected_at timestamptz NOT NULL DEFAULT now(),
  last_sync_at timestamptz,
  UNIQUE (user_id, provider)
);

ALTER TABLE public.creator_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own integrations" ON public.creator_integrations;
CREATE POLICY "Users manage own integrations"
ON public.creator_integrations
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins view all integrations" ON public.creator_integrations;
CREATE POLICY "Admins view all integrations"
ON public.creator_integrations
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
