-- Admin-controlled "active" persona shown on the public site.
alter table public.roles add column if not exists is_active boolean not null default false;
create unique index if not exists roles_one_active on public.roles (is_active) where is_active;

-- Activate the default SDE role to start (kept in sync with seed.sql).
update public.roles set is_active = true where slug = 'sde';
