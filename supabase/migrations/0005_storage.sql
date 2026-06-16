-- Storage buckets: public-assets (public read) and resumes (private)
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true), ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "public read assets" on storage.objects
  for select using (bucket_id = 'public-assets');
create policy "admin write assets" on storage.objects
  for insert to authenticated with check (bucket_id = 'public-assets' and public.is_admin());
create policy "admin update assets" on storage.objects
  for update to authenticated using (bucket_id = 'public-assets' and public.is_admin());
create policy "admin delete assets" on storage.objects
  for delete to authenticated using (bucket_id = 'public-assets' and public.is_admin());

create policy "admin read resumes" on storage.objects
  for select to authenticated using (bucket_id = 'resumes' and public.is_admin());
create policy "admin write resumes" on storage.objects
  for insert to authenticated with check (bucket_id = 'resumes' and public.is_admin());
create policy "admin update resumes" on storage.objects
  for update to authenticated using (bucket_id = 'resumes' and public.is_admin());
create policy "admin delete resumes" on storage.objects
  for delete to authenticated using (bucket_id = 'resumes' and public.is_admin());
