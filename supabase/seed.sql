-- Seed data: verified facts only (no fabricated testimonials, stats, or certifications)
-- Applied to the vv-portfolio Supabase project; mirrored here for documentation.

insert into public.profile (full_name, headline, tagline, bio_md, location, email, phone)
values (
  'Vishwas Vashishtha',
  'Full-stack developer & MCA student at Christ University, Bangalore',
  'I build web apps with React, Next.js, Node.js and SQL — and I''m looking for SDE internship opportunities.',
  E'I''m an MCA student at Christ University, Bangalore (class of 2027), with a BCA from Chandigarh University.\n\nI work across the stack: React and Next.js on the frontend, Node.js/Express and SQL on the backend. Most of what I''ve shipped so far comes from building real things end to end — a movie catalog API with MySQL, a React app, and this portfolio itself (Next.js 15 + Supabase, with an admin dashboard and AI-assisted resume sync).\n\nI''m currently looking for SDE internship and new-grad roles for 2026–27.',
  'Bangalore, India',
  'vishwasvashishtha@mca.christuniversity.in',
  '+91 7060200434'
);

insert into public.social_links (platform, url, label, icon, sort_order) values
  ('github',   'https://github.com/Vishwaxs',        'GitHub',   'github',   1),
  ('linkedin', 'https://linkedin.com/in/vishwaxss',  'LinkedIn', 'linkedin', 2),
  ('x',        'https://x.com/vishwaxs',             'X',        'twitter',  3);

insert into public.sections (slug, title, subtitle, body_md) values
  ('hero', 'Vishwas Vashishtha', 'Full-stack developer & MCA student',
   'MCA ''27 at Christ University, Bangalore · 4 shipped projects · open to SDE internships'),
  ('about', 'About me', 'Student developer, building end to end',
   E'From a BCA at Chandigarh University (8.03 CGPA, 2022–2025) to an MCA at Christ University, Bangalore (2025–2027, in progress), I''ve been learning by shipping: REST APIs with Express and MySQL, React frontends, and most recently this site — a Next.js 15 app backed by Supabase with a full admin dashboard.'),
  ('contact', 'Get in touch', 'Open to SDE internships and new-grad roles',
   'The fastest way to reach me is email. I''m based in Bangalore and open to on-site, hybrid, or remote roles.');

insert into public.skill_categories (name, slug, sort_order) values
  ('Languages', 'languages', 1),
  ('Frontend',  'frontend',  2),
  ('Backend',   'backend',   3),
  ('Tools',     'tools',     4);

insert into public.skills (category_id, name, level, featured, sort_order)
select c.id, s.name, s.level, s.featured, s.sort_order
from (values
  ('languages', 'JavaScript',   4, true,  1),
  ('languages', 'TypeScript',   3, true,  2),
  ('languages', 'SQL',          3, false, 3),
  ('languages', 'HTML & CSS',   4, false, 4),
  ('frontend',  'React',        4, true,  1),
  ('frontend',  'Next.js',      3, true,  2),
  ('frontend',  'Tailwind CSS', 4, false, 3),
  ('backend',   'Node.js',      3, true,  1),
  ('backend',   'Express',      3, false, 2),
  ('backend',   'MySQL',        3, false, 3),
  ('backend',   'Supabase (Postgres)', 3, false, 4),
  ('tools',     'Git & GitHub', 4, false, 1),
  ('tools',     'Vercel',       3, false, 2)
) as s(category_slug, name, level, featured, sort_order)
join public.skill_categories c on c.slug = s.category_slug;

insert into public.project_categories (name, slug, sort_order) values
  ('Full-stack', 'fullstack', 1),
  ('Backend & APIs', 'backend', 2),
  ('Frontend', 'frontend', 3);

insert into public.projects
  (slug, title, summary, description_md, category_id, tech_stack, repo_url,
   featured, recruiter_highlight, architecture_md, challenges_md, learnings_md,
   status, started_on, published, sort_order)
values
  (
    'vv-portfolio',
    'This portfolio (Next.js 15 + Supabase)',
    'A database-driven portfolio with an admin dashboard, role-based content engine, and AI-assisted resume parsing.',
    E'This site is itself my most complete project. Every piece of content — projects, skills, education, even the hero copy — lives in Postgres (Supabase) and is editable through a custom admin dashboard.\n\nIt also includes a resume management module: I can upload multiple resume versions as PDFs, have Claude parse them into structured data, and review AI-generated suggestions for keeping the portfolio in sync with whichever resume is active.',
    (select id from public.project_categories where slug = 'fullstack'),
    array['Next.js 15','React 19','TypeScript','Tailwind CSS v4','Supabase','PostgreSQL','Claude API','Vercel'],
    'https://github.com/Vishwaxs/vv-s-portfolio',
    true,
    'Production-grade full-stack build: RLS-secured Postgres schema, server components, audit-logged admin CRUD, and an AI resume-sync pipeline.',
    E'- **Public site**: Next.js server components reading from Supabase via cached fetchers (`unstable_cache` + tag revalidation), so pages are static-fast but update the moment content changes in the admin.\n- **Admin**: Supabase Auth (single admin user), middleware-protected routes, server actions for every mutation, each one writing to an append-only `audit_logs` table.\n- **Role engine**: a `roles` table with per-role hero copy and skill/keyword weights re-ranks projects and skills for different audiences (SDE, full-stack, frontend) via a cookie-based switcher.\n- **Resume module**: PDFs stored in a private bucket; Claude parses them into a zod-validated JSON shape; an AI diff suggests create/update/delete operations against live content, each approved or rejected by hand.',
    E'- Designing RLS policies that let anonymous visitors read published content while locking every write behind an `is_admin()` check — without recursive policy lookups.\n- Keeping the public pages statically cached while still supporting per-role content (solved by reading the role cookie only in role-sensitive components).\n- Making the AI sync safe: suggestions never auto-apply; every change goes through the same audited server-action path as manual edits.',
    E'- How Postgres row-level security actually composes with app-level auth.\n- Next.js caching semantics: tags, revalidation, and what makes a route dynamic.\n- Schema design for content that has to be editable, versionable, and auditable.',
    'in_progress', '2026-05-01', true, 1
  ),
  (
    'movie-catalog',
    'Movie Catalog API',
    'A REST API for managing a movie collection, built with Express and MySQL.',
    E'A CRUD backend for a movie catalog: Express routes over a MySQL database, with endpoints for listing, creating, updating, and deleting movies.\n\nBuilt as a from-scratch exercise in backend fundamentals — no ORM, hand-written SQL, and explicit connection handling.',
    (select id from public.project_categories where slug = 'backend'),
    array['Node.js','Express','MySQL'],
    null,
    true,
    'Hand-rolled REST + SQL: demonstrates understanding of HTTP semantics, schema design, and parameterized queries without ORM training wheels.',
    E'- Express app with a conventional REST surface (`GET/POST/PUT/DELETE /movies`).\n- MySQL schema with a normalized movies table; queries written directly with parameterized statements.\n- Environment-based configuration for database credentials.',
    E'- Handling MySQL connection lifecycle correctly (pooling vs. single connections, releasing on error paths).\n- Learning the hard way why credentials belong in environment variables, not in the repo.',
    E'- REST design and status-code discipline.\n- SQL basics in practice: schema design, parameterized queries, and why injection-safe queries matter.',
    'completed', '2025-11-01', true, 2
  ),
  (
    'equilisync',
    'EquiliSync',
    'A React application built as a structured front-end project.',
    E'A React app exploring component architecture, state management, and client-side routing — built as a self-contained front-end project during my MCA coursework.',
    (select id from public.project_categories where slug = 'frontend'),
    array['React','JavaScript','CSS'],
    null,
    false,
    'Component-driven React build: props/state discipline and UI composition.',
    '', '', '',
    'completed', '2025-09-01', true, 3
  ),
  (
    'e-shop-explorer',
    'E-Shop Explorer',
    'A shop-browsing UI built in vanilla JavaScript — no frameworks.',
    E'A product-browsing interface written in plain HTML, CSS, and JavaScript: DOM manipulation, event handling, and state kept by hand. Building it without a framework made the value of React''s abstractions concrete.',
    (select id from public.project_categories where slug = 'frontend'),
    array['JavaScript','HTML','CSS'],
    null,
    false,
    'Vanilla-JS fundamentals: manual DOM updates and state management, the groundwork frameworks abstract away.',
    '', '', '',
    'completed', '2025-08-01', true, 4
  );

insert into public.education (institution, degree, field, start_date, end_date, grade, highlights, sort_order) values
  ('Christ University, Bangalore', 'Master of Computer Applications (MCA)', 'Computer Applications',
   '2025-07-01', '2027-04-30', '8.0 CGPA (in progress)',
   array['Full-stack development coursework: Next.js, React, Express, MySQL'], 1),
  ('Chandigarh University', 'Bachelor of Computer Applications (BCA)', 'Computer Applications',
   '2022-07-01', '2025-05-31', '8.03 CGPA',
   array[]::text[], 2);

-- The admin marks ONE role is_active (shown publicly); sde starts active (see 0006_active_role.sql).
insert into public.roles (slug, name, description, is_default, hero_headline, hero_tagline, skill_weights, keyword_boosts, sort_order) values
  ('sde', 'Software Engineer', 'Generalist SDE positioning: problem solving, fundamentals, end-to-end ownership.',
   true,
   'Vishwas Vashishtha — software engineer in the making',
   'MCA student at Christ University, Bangalore, building full-stack projects end to end. Open to SDE internships.',
   '{"javascript": 1.0, "typescript": 1.0, "sql": 1.0, "react": 0.8, "node-js": 0.9}'::jsonb,
   '{"api": 1.0, "sql": 1.0, "postgres": 0.8, "rest": 0.8}'::jsonb, 1),
  ('fullstack', 'Full-stack Developer', 'Emphasis on owning features across frontend, backend, and database.',
   false,
   'Vishwas Vashishtha — full-stack developer',
   'React and Next.js on the front, Node and SQL on the back. I build features end to end.',
   '{"next-js": 1.0, "react": 1.0, "node-js": 1.0, "supabase-postgres": 0.9, "mysql": 0.8}'::jsonb,
   '{"supabase": 1.0, "next.js": 1.0, "express": 0.9, "full-stack": 1.0}'::jsonb, 2),
  ('frontend', 'Frontend Developer', 'Emphasis on UI engineering, React, and design systems.',
   false,
   'Vishwas Vashishtha — frontend developer',
   'React, Next.js, and Tailwind — interfaces that are fast, accessible, and maintainable.',
   '{"react": 1.0, "next-js": 1.0, "tailwind-css": 1.0, "html-css": 0.9, "javascript": 0.9}'::jsonb,
   '{"react": 1.0, "ui": 1.0, "tailwind": 1.0, "frontend": 1.0}'::jsonb, 3),
  ('backend', 'Backend Developer', 'APIs, databases, and server-side logic.',
   false,
   'Vishwas Vashishtha — backend developer',
   'I build REST APIs and relational data models with Node, Express, and SQL — and I care about correctness and clean schema design.',
   '{"node-js": 1.0, "express": 1.0, "sql": 1.0, "mysql": 0.9, "supabase-postgres": 0.9, "javascript": 0.7}'::jsonb,
   '{"api": 1.0, "rest": 1.0, "sql": 1.0, "express": 0.9, "mysql": 0.9, "postgres": 0.9, "node": 0.8}'::jsonb, 4),
  ('data-analyst', 'Data Analyst', 'Turning data into decisions with SQL and analysis.',
   false,
   'Vishwas Vashishtha — data analyst',
   'MCA student strong in SQL and problem solving, building toward analytics roles — querying, modeling, and making sense of data.',
   '{"sql": 1.0, "mysql": 0.9, "supabase-postgres": 0.8, "javascript": 0.5}'::jsonb,
   '{"sql": 1.0, "mysql": 0.9, "postgres": 0.9, "data": 1.0, "analytics": 1.0, "query": 0.8}'::jsonb, 5),
  ('data-engineer', 'Data Engineer', 'Pipelines, databases, and data infrastructure.',
   false,
   'Vishwas Vashishtha — data engineer',
   'I work with relational databases and backend services, building toward data-engineering: schemas, pipelines, and reliable storage.',
   '{"sql": 1.0, "mysql": 0.9, "supabase-postgres": 1.0, "node-js": 0.8, "express": 0.6}'::jsonb,
   '{"sql": 1.0, "postgres": 1.0, "mysql": 0.9, "pipeline": 1.0, "etl": 1.0, "data": 1.0, "api": 0.6}'::jsonb, 6),
  ('devops', 'Cloud / DevOps Engineer', 'Deployment, CI/CD, and cloud infrastructure.',
   false,
   'Vishwas Vashishtha — cloud & DevOps',
   'I ship and operate full-stack apps on modern cloud platforms — git-based CI/CD, Vercel, and Supabase — and I''m deepening my cloud skills.',
   '{"vercel": 1.0, "git-github": 1.0, "supabase-postgres": 0.9, "next-js": 0.7, "node-js": 0.7}'::jsonb,
   '{"vercel": 1.0, "ci/cd": 1.0, "cloud": 1.0, "deploy": 1.0, "docker": 0.8, "github": 0.9, "supabase": 0.8}'::jsonb, 7);

insert into public.site_settings (key, value) values
  ('seo', '{"site_name": "Vishwas Vashishtha", "title_template": "%s · Vishwas Vashishtha", "default_description": "Full-stack developer & MCA student at Christ University, Bangalore. React, Next.js, Node.js, SQL. Open to SDE internships."}'::jsonb),
  ('analytics', '{"ga_id": null}'::jsonb);
