-- Row Level Security for all tables
alter table public.admin_users enable row level security;
alter table public.audit_logs enable row level security;
alter table public.site_settings enable row level security;
alter table public.profile enable row level security;
alter table public.social_links enable row level security;
alter table public.sections enable row level security;
alter table public.skill_categories enable row level security;
alter table public.skills enable row level security;
alter table public.project_categories enable row level security;
alter table public.projects enable row level security;
alter table public.project_screenshots enable row level security;
alter table public.experience enable row level security;
alter table public.education enable row level security;
alter table public.certifications enable row level security;
alter table public.achievements enable row level security;
alter table public.contact_messages enable row level security;
alter table public.roles enable row level security;
alter table public.role_content_overrides enable row level security;
alter table public.resumes enable row level security;
alter table public.sync_suggestions enable row level security;

-- admin_users: a user may check their own membership; writes via service role only
create policy "own membership" on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- audit_logs: append-only; admin can read and insert, nobody can update/delete
create policy "admin read audit" on public.audit_logs
  for select to authenticated using (public.is_admin());
create policy "admin insert audit" on public.audit_logs
  for insert to authenticated with check (public.is_admin());

-- site_settings: admin only
create policy "admin all settings" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- profile: public read (singleton, no published flag), admin write
create policy "public read profile" on public.profile for select using (true);
create policy "admin write profile" on public.profile
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- published-gated public content
create policy "public read social" on public.social_links for select using (published);
create policy "admin write social" on public.social_links
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read sections" on public.sections for select using (published);
create policy "admin write sections" on public.sections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read skill_categories" on public.skill_categories for select using (true);
create policy "admin write skill_categories" on public.skill_categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read skills" on public.skills for select using (published);
create policy "admin write skills" on public.skills
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read project_categories" on public.project_categories for select using (true);
create policy "admin write project_categories" on public.project_categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read projects" on public.projects for select using (published);
create policy "admin write projects" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read screenshots" on public.project_screenshots for select
  using (exists (select 1 from public.projects p where p.id = project_id and p.published));
create policy "admin write screenshots" on public.project_screenshots
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read experience" on public.experience for select using (published);
create policy "admin write experience" on public.experience
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read education" on public.education for select using (published);
create policy "admin write education" on public.education
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read certifications" on public.certifications for select using (published);
create policy "admin write certifications" on public.certifications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read achievements" on public.achievements for select using (published);
create policy "admin write achievements" on public.achievements
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- contact: anyone may submit; only admin reads/manages
create policy "anyone insert contact" on public.contact_messages for insert with check (true);
create policy "admin read contact" on public.contact_messages
  for select to authenticated using (public.is_admin());
create policy "admin update contact" on public.contact_messages
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete contact" on public.contact_messages
  for delete to authenticated using (public.is_admin());

-- roles: public read of published roles, admin write
create policy "public read roles" on public.roles for select using (published);
create policy "admin write roles" on public.roles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read role_overrides" on public.role_content_overrides for select using (true);
create policy "admin write role_overrides" on public.role_content_overrides
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- resumes + suggestions: admin only (public download goes through a signed-URL API route)
create policy "admin all resumes" on public.resumes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all suggestions" on public.sync_suggestions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
