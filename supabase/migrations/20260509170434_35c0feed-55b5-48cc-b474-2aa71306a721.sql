
-- 1. Seed admin user ikambaempireltd@gmail.com (idempotent)
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'ikambaempireltd@gmail.com';

  if v_user_id is null then
    v_user_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'ikambaempireltd@gmail.com',
      crypt('EMPIRE@IKAMBA2025', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"iKAMBA Empire"}'::jsonb,
      now(), now(), '', '', '', ''
    );

    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'ikambaempireltd@gmail.com', 'email_verified', true),
      'email',
      v_user_id::text,
      now(), now(), now()
    );
  else
    update auth.users
      set encrypted_password = crypt('EMPIRE@IKAMBA2025', gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
          updated_at = now()
      where id = v_user_id;
  end if;

  insert into public.profiles (id, full_name)
  values (v_user_id, 'iKAMBA Empire')
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (v_user_id, 'admin')
  on conflict (user_id, role) do nothing;
end $$;

-- 2. Update handle_new_user to also auto-admin the new email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;

  if lower(new.email) in ('azeem.mushimiyimana@gmail.com', 'ikambaempireltd@gmail.com') then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;

  return new;
end;
$function$;

-- 3. Helper to grant admin (or other role) by email — admin only
create or replace function public.grant_role_by_email(_email text, _role app_role)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_user_id uuid;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only admins can grant roles';
  end if;

  select id into v_user_id from auth.users where lower(email) = lower(_email);
  if v_user_id is null then
    raise exception 'No user found with email %', _email;
  end if;

  insert into public.user_roles (user_id, role)
  values (v_user_id, _role)
  on conflict (user_id, role) do nothing;

  return v_user_id;
end;
$$;

-- 4. Ecosystem entries
create table if not exists public.ecosystem_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  city text,
  country text,
  description text,
  website text,
  contact_email text,
  logo_url text,
  cover_url text,
  tags text[] default '{}',
  sort_order integer not null default 100,
  is_hidden boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ecosystem_entries enable row level security;

create policy "Anyone can view visible ecosystem entries"
  on public.ecosystem_entries for select
  using (is_hidden = false);

create policy "Admins can view all ecosystem entries"
  on public.ecosystem_entries for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert ecosystem entries"
  on public.ecosystem_entries for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update ecosystem entries"
  on public.ecosystem_entries for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete ecosystem entries"
  on public.ecosystem_entries for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create trigger update_ecosystem_entries_updated_at
  before update on public.ecosystem_entries
  for each row execute function public.update_updated_at_column();

-- 5. Realtime on profiles for live user count
alter publication supabase_realtime add table public.profiles;
