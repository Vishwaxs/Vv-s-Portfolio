# Deployment Guide

## Supabase (already provisioned)

Project: **vv-portfolio** (`uqfsdxaoqktwndcguxcu`, region `ap-south-1`) in
Vishwaxs's Org. The schema, RLS policies, storage buckets, and seed content are
applied — migration sources live in `supabase/migrations/` and `supabase/seed.sql`.

### Logging in / creating the admin account

`/admin/login` offers two methods: a passwordless **email link** (magic link)
and **email + password**.

**Easiest (recommended) — self-bootstrap via email link:**

1. Set env vars (Vercel → Settings → Environment Variables):
   `BOOTSTRAP_ADMIN_EMAIL` = your email, and `SUPABASE_SERVICE_ROLE_KEY`
   (Supabase → Project Settings → API). Redeploy.
2. Supabase → **Authentication → URL Configuration**: set *Site URL* to your
   production URL and add `https://YOUR-DOMAIN/auth/callback` to *Redirect URLs*.
3. Go to `/admin/login` → **Email link** → enter that same email → open the link
   from your inbox. On first login you're auto-enrolled as the admin.
4. (Optional) Supabase → **Authentication → Providers / Sign-ups**: disable new
   signups so only your email can request a usable session.

> Free-tier note: Supabase's built-in email has low hourly limits and links may
> land in spam. For reliable delivery configure custom SMTP, or use the manual
> method below.

**Manual alternative (no email needed):**

1. Supabase → **Authentication → Users → Add user** — your email + a password,
   check *Auto Confirm User*.
2. **SQL Editor:**
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'you@example.com'
   on conflict do nothing;
   ```
3. Sign in at `/admin/login` with the **Password** tab.

**Google sign-in (optional):** create an OAuth client in Google Cloud, add the
client id/secret under Supabase → Authentication → Providers → Google, then a
"Continue with Google" button can be added to the login form.

### Keys

- Project URL and anon key: **Project Settings → API**. The anon key is safe in
  the browser — RLS limits it to published content + contact submissions.
- Service role key (same page): server-only. Used **only** to sign URLs for the
  public resume download. Without it, everything works except that button.

## Vercel

1. Import the GitHub repo into Vercel (framework auto-detects Next.js; the app
   is at the repo root).
2. Set environment variables (Production + Preview):

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://uqfsdxaoqktwndcguxcu.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key from Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | service role key (mark *Sensitive*) |
   | `GEMINI_API_KEY` | optional — enables AI resume parsing via Google Gemini |
   | `ANTHROPIC_API_KEY` | optional — alternative AI provider (Gemini wins if both set) |
   | `NEXT_PUBLIC_SITE_URL` | the production URL, e.g. `https://vv.example.com` |

   The resume module uses **Gemini** when `GEMINI_API_KEY` is present, otherwise
   **Anthropic** when `ANTHROPIC_API_KEY` is present; with neither, it falls back
   to manual entry. Optionally set `GEMINI_MODEL` (default `gemini-2.5-flash`).

3. Deploy. After the first deploy, update `NEXT_PUBLIC_SITE_URL` if you attach
   a custom domain (Vercel → Domains), and redeploy so metadata/sitemap use it.

## Content workflow

- Edit everything at `/admin` — changes revalidate the public pages
  immediately (tag-based ISR; a 1-hour fallback revalidation also applies).
- Upload project screenshots/avatars to the `public-assets` storage bucket and
  reference their paths in the admin forms.
- Upload resume PDFs at `/admin/resumes`; click ✨ to parse (needs
  `ANTHROPIC_API_KEY`), review/import, then ✓ to make a version active. The
  homepage "Download resume" serves the active version via signed URL.

## CI

`.github/workflows/ci.yml` runs lint, typecheck, and build on every PR with
dummy Supabase env vars (data fetchers fail soft to empty content, so the
build never depends on a live database).

## Security model

- RLS on every table; anon sees only published rows; all writes require
  `admin_users` membership (checked by `is_admin()` security definer).
- Contact form: zod validation + honeypot + 5/hour/IP rate limit enforced in a
  security-definer RPC (no service role in that path).
- `audit_logs` is append-only — no update/delete policy exists for any role.
- Resume PDFs live in a private bucket; the public never gets direct access,
  only short-lived signed URLs for the active version.
