
create or replace function public.get_top_podcasts(_limit int default 10)
returns table (
  podcast_id uuid,
  plays bigint,
  slug text,
  title text,
  cover_url text,
  category text
)
language sql
stable
security definer
set search_path = public
as $$
  with counts as (
    select ep.podcast_id, count(*)::bigint as plays
    from public.episode_plays ep
    group by ep.podcast_id
  ),
  ranked as (
    select p.id as podcast_id, coalesce(c.plays, 0) as plays, p.slug, p.title, p.cover_url, p.category, p.created_at
    from public.podcasts p
    left join counts c on c.podcast_id = p.id
    where p.is_published = true
    order by coalesce(c.plays, 0) desc, p.created_at desc
    limit _limit
  )
  select podcast_id, plays, slug, title, cover_url, category from ranked;
$$;

grant execute on function public.get_top_podcasts(int) to anon, authenticated;
