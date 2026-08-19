-- Orbix · pegar en Supabase → SQL Editor → Run
-- Auth: Email + password. En Authentication → URL Configuration
-- agrega http://localhost:3010/** y tu dominio de Vercel.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  phone text,
  title text,
  avatar_color text default '#171716',
  active_company_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rut text not null default '',
  giro text not null default '',
  address text not null default '',
  city text not null default '',
  region text not null default '',
  phone text not null default '',
  email text not null default '',
  iva_rate numeric not null default 0.19,
  logo_color text not null default '#a3a3a3',
  bank text not null default '',
  account text not null default '',
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_members (
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'admin'
    check (role in ('admin', 'contador', 'rrhh', 'lectura')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  email text not null,
  name text not null default '',
  role text not null default 'lectura'
    check (role in ('admin', 'contador', 'rrhh', 'lectura')),
  invited_by uuid references auth.users (id),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists invites_pending_email
  on public.invites (company_id, lower(email))
  where accepted_at is null;

create index if not exists company_members_user_idx on public.company_members (user_id);
create index if not exists invites_email_idx on public.invites (lower(email));

alter table public.profiles
  drop constraint if exists profiles_active_company_id_fkey;
alter table public.profiles
  add constraint profiles_active_company_id_fkey
  foreign key (active_company_id) references public.companies (id) on delete set null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists companies_updated_at on public.companies;
create trigger companies_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
    coalesce(new.email, '')
  )
  on conflict (id) do update
    set email = excluded.email,
        name = case when public.profiles.name = '' then excluded.name else public.profiles.name end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_company_member(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.company_members
    where company_id = cid and user_id = auth.uid()
  );
$$;

create or replace function public.is_company_admin(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.company_members
    where company_id = cid and user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.shares_company_with(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members a
    join public.company_members b on a.company_id = b.company_id
    where a.user_id = auth.uid() and b.user_id = target
  );
$$;

create or replace function public.ensure_workspace(company_name text default 'Mi empresa')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  uemail text;
  uname text;
  meta_company text;
  new_company public.companies;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select
    coalesce(u.email, ''),
    coalesce(nullif(u.raw_user_meta_data->>'name', ''), split_part(coalesce(u.email, ''), '@', 1)),
    nullif(u.raw_user_meta_data->>'company_name', '')
  into uemail, uname, meta_company
  from auth.users u
  where u.id = uid;

  insert into public.profiles (id, name, email)
  values (uid, uname, uemail)
  on conflict (id) do update
    set email = excluded.email,
        name = case when public.profiles.name = '' then excluded.name else public.profiles.name end;

  insert into public.company_members (company_id, user_id, role)
  select i.company_id, uid, i.role
  from public.invites i
  where lower(i.email) = lower(uemail)
    and i.accepted_at is null
  on conflict (company_id, user_id) do nothing;

  update public.invites
  set accepted_at = now()
  where lower(email) = lower(uemail)
    and accepted_at is null;

  if not exists (select 1 from public.company_members where user_id = uid) then
    insert into public.companies (name, email, created_by)
    values (
      coalesce(nullif(company_name, ''), meta_company, 'Mi empresa'),
      uemail,
      uid
    )
    returning * into new_company;

    insert into public.company_members (company_id, user_id, role)
    values (new_company.id, uid, 'admin');

    update public.profiles
    set active_company_id = new_company.id
    where id = uid;
  elsif (select active_company_id from public.profiles where id = uid) is null then
    update public.profiles
    set active_company_id = (
      select company_id from public.company_members where user_id = uid limit 1
    )
    where id = uid;
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.invites enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.shares_company_with(id));

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists "companies_select" on public.companies;
create policy "companies_select" on public.companies
  for select to authenticated
  using (public.is_company_member(id));

drop policy if exists "companies_update" on public.companies;
create policy "companies_update" on public.companies
  for update to authenticated
  using (public.is_company_admin(id))
  with check (public.is_company_admin(id));

drop policy if exists "members_select" on public.company_members;
create policy "members_select" on public.company_members
  for select to authenticated
  using (public.is_company_member(company_id));

drop policy if exists "members_update" on public.company_members;
create policy "members_update" on public.company_members
  for update to authenticated
  using (public.is_company_admin(company_id))
  with check (public.is_company_admin(company_id));

drop policy if exists "invites_select" on public.invites;
create policy "invites_select" on public.invites
  for select to authenticated
  using (public.is_company_admin(company_id));

drop policy if exists "invites_insert" on public.invites;
create policy "invites_insert" on public.invites
  for insert to authenticated
  with check (public.is_company_admin(company_id));

drop policy if exists "invites_delete" on public.invites;
create policy "invites_delete" on public.invites
  for delete to authenticated
  using (public.is_company_admin(company_id));

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, update on public.companies to authenticated;
grant select, update on public.company_members to authenticated;
grant select, insert, delete on public.invites to authenticated;
grant execute on function public.ensure_workspace(text) to authenticated;
grant execute on function public.is_company_member(uuid) to authenticated;
grant execute on function public.is_company_admin(uuid) to authenticated;
grant execute on function public.shares_company_with(uuid) to authenticated;
