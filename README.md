# Vishwas Vashishtha — Portfolio

Production portfolio built with Next.js 15 (App Router), React 19, Tailwind CSS v4, and Supabase. Content is fully database-driven and managed through a built-in admin dashboard, with a role-based portfolio engine and AI-assisted resume parsing.

## Features

- **Public site** — home, about, projects (with case-study pages), contact. Server components, ISR with tag-based revalidation.
- **Admin dashboard** (`/admin`) — CRUD for all content (profile, projects, skills, education, experience, achievements, certifications, social links), messages inbox, audit log, settings. Supabase Auth, single-admin model.
- **Role engine** — recruiters can view the portfolio tailored to a role (SDE / full-stack / frontend); content weighting and per-role overrides are configured in the admin.
- **Resume module** — upload multiple resume versions, parse PDFs into structured data with the Claude API, review AI-suggested syncs between resume and portfolio content, and activate the version served by the public "Download Resume" button.
- **SEO** — DB-driven metadata, JSON-LD, dynamic OG images, sitemap/robots.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 App Router, React 19, TypeScript |
| Styling | Tailwind CSS v4 (`@theme` design tokens), framer-motion (reveal animations only) |
| Data | Supabase (Postgres + RLS, Auth, Storage) |
| AI | Anthropic Claude API (resume parsing, sync suggestions) — optional |
| Hosting | Vercel |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys
npm run dev
```

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon (publishable) key |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Admin mutations, contact inserts |
| `ANTHROPIC_API_KEY` | optional | Enables AI resume parsing/sync (falls back to manual entry) |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical URL for metadata/sitemap |

See `docs/DEPLOYMENT.md` for full provisioning and deployment steps, and `docs/SECURITY-CLEANUP.md` for repo-history cleanup notes.

## Repo history note

This repository previously contained MCA coursework alongside the portfolio. Coursework was removed from the working tree (it remains in git history); see `docs/SECURITY-CLEANUP.md`.
