-- Role-based portfolio engine + multi-resume management + AI sync
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  is_default boolean not null default false,
  hero_headline text not null default '',
  hero_tagline text not null default '',
  skill_weights jsonb not null default '{}'::jsonb,
  keyword_boosts jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create unique index roles_one_default on public.roles (is_default) where is_default;

create table public.role_content_overrides (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  entity_type text not null check (entity_type in ('project','skill','section')),
  entity_id uuid not null,
  override jsonb not null default '{}'::jsonb,
  unique (role_id, entity_type, entity_id)
);

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  role_id uuid references public.roles(id) on delete set null,
  storage_path text,
  version int not null default 1,
  parent_id uuid references public.resumes(id) on delete set null,
  parsed jsonb,
  parse_status text not null default 'pending'
    check (parse_status in ('pending','parsing','parsed','failed','manual')),
  parse_error text,
  is_active boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index resumes_one_active on public.resumes (is_active) where is_active;
create trigger resumes_updated before update on public.resumes
  for each row execute function public.set_updated_at();

alter table public.profile
  add constraint profile_resume_active_fk
  foreign key (resume_active_id) references public.resumes(id) on delete set null;

create table public.sync_suggestions (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  entity_type text not null
    check (entity_type in ('profile','skill','project','experience','education','certification','achievement')),
  entity_id uuid,
  action text not null check (action in ('create','update','delete')),
  current_value jsonb,
  suggested_value jsonb not null,
  rationale text not null default '',
  confidence numeric check (confidence between 0 and 1),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz not null default now()
);
create index sync_suggestions_resume_idx on public.sync_suggestions (resume_id, status);
