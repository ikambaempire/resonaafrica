
CREATE OR REPLACE FUNCTION public.podcast_public_stats(_podcast_id uuid)
RETURNS TABLE (total_plays bigint, total_seconds bigint, day date, day_plays bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH agg AS (
    SELECT count(*)::bigint AS total_plays,
           coalesce(sum(listened_seconds),0)::bigint AS total_seconds
    FROM public.episode_plays
    WHERE podcast_id = _podcast_id
  ),
  days AS (
    SELECT (created_at AT TIME ZONE 'UTC')::date AS day, count(*)::bigint AS day_plays
    FROM public.episode_plays
    WHERE podcast_id = _podcast_id
      AND created_at >= now() - interval '30 days'
    GROUP BY 1
  )
  SELECT a.total_plays, a.total_seconds, d.day, d.day_plays
  FROM agg a
  LEFT JOIN days d ON true;
$$;

REVOKE ALL ON FUNCTION public.podcast_public_stats(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.podcast_public_stats(uuid) TO anon, authenticated;
