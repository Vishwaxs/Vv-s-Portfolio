-- Public content tables
create table public.profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  headline text not null default '',
  tagline text not null default '',
  bio_md text not null default '',
  location text not null default '',
  email text not null default '',
  phone text not null default '',
  avatar_path text,
  resume_active_id uuid,
  updated_at timestamptz not null default now()
);
create trigger profile_updated before update on public.profile
  for each row execute function public.set_updated_at();

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  label text not null default '',
  icon text not null default '',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null default '',
  subtitle text not null default '',
  body_md text not null default '',
  meta jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);
create trigger sections_updated before update on public.sections
  for each row execute function public.set_updated_at();

create table public.skill_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.skill_categories(id) on delete set null,
  name text not null,
  level smallint not null default 3 check (level between 1 and 5),
  icon text not null default '',
  years numeric,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.project_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  description_md text not null default '',
  category_id uuid references public.project_categories(id) on delete set null,
  tech_stack text[] not null default '{}',
  repo_url text,
  live_url text,
  video_url text,
  featured boolean not null default false,
  recruiter_highlight text,
  architecture_md text not null default '',
  challenges_md text not null default '',
  learnings_md text not null default '',
  status text not null default 'completed' check (status in ('completed','in_progress','archived')),
  started_on date,
  finished_on date,
  cover_image_path text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

create table public.project_screenshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null,
  alt text not null default '',
  sort_order int not null default 0
);

create table public.experience (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  organization text not null,
  org_url text,
  location text not null default '',
  employment_type text not null default '',
  start_date date not null,
  end_date date,
  summary_md text not null default '',
  highlights text[] not null default '{}',
  tech text[] not null default '{}',
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text not null,
  field text not null default '',
  start_date date not null,
  end_date date,
  grade text not null default '',
  highlights text[] not null default '{}',
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text not null,
  issue_date date,
  credential_url text,
  credential_id text,
  verified boolean not null default false,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description_md text not null default '',
  date date,
  url text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default '',
  message text not null,
  ip_hash text,
  user_agent text,
  status text not null default 'new' check (status in ('new','read','archived','spam')),
  created_at timestamptz not null default now()
);
create index contact_messages_ip_idx on public.contact_messages (ip_hash, created_at desc);
