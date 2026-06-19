-- Performance advisor fixes.

-- Covering indexes for foreign keys (linter 0001_unindexed_foreign_keys).
create index if not exists idx_profile_resume_active_id on public.profile (resume_active_id);
create index if not exists idx_project_screenshots_project_id on public.project_screenshots (project_id);
create index if not exists idx_projects_category_id on public.projects (category_id);
create index if not exists idx_resumes_parent_id on public.resumes (parent_id);
create index if not exists idx_resumes_role_id on public.resumes (role_id);
create index if not exists idx_skills_category_id on public.skills (category_id);

-- Evaluate auth.uid() once per query instead of once per row
-- (linter 0003_auth_rls_initplan).
alter policy "own membership" on public.admin_users
  using (user_id = (select auth.uid()));
