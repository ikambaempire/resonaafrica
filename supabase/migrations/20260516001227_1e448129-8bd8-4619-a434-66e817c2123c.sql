-- Admin function to list all users with their email and profile data
create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  full_name text,
  username text,
  company text,
  avatar_url text,
  profile_kind text,
  category text,
  website text,
  bio text,
  created_at timestamptz,
  roles text[]
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    u.email::text,
    p.full_name,
    p.username,
    p.company,
    p.avatar_url,
    p.profile_kind,
    p.category,
    p.website,
    p.bio,
    p.created_at,
    coalesce(
      (select array_agg(ur.role::text) from public.user_roles ur where ur.user_id = p.id),
      '{}'::text[]
    ) as roles
  from public.profiles p
  left join auth.users u on u.id = p.id
  where public.has_role(auth.uid(), 'admin')
  order by p.created_at desc;
$$;

revoke all on function public.admin_list_users() from public;
grant execute on function public.admin_list_users() to authenticated;