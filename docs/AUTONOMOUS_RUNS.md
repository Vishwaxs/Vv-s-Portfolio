# Autonomous run log

A rolling log for the scheduled "deep-work" agent. Each entry records one small,
buildable improvement so the next run can pick up cleanly.

## 2026-06-18 — Add unit test suite (Vitest)

**Change:** Introduced Vitest and the project's first automated tests. The repo
previously had zero tests despite carrying subtle, high-value business logic.

**Files changed**
- `package.json` — added `vitest` (devDependency) and `test` / `test:watch` scripts.
- `vitest.config.ts` — new; node environment, `@/*` path alias, `lib/**/*.test.ts` glob.
- `lib/role-engine.test.ts` — new; covers `pickActiveRole`, `rankProjects`,
  `rankSkills` (keyword boosts, pinned/hidden overrides, no-mutation of source,
  tie-breaking, skill slugify + weights, unpublished filtering).
- `lib/utils.test.ts` — new; covers `cn`, `formatDate`, `formatDateTime`, `publicAssetUrl`.
- `lib/validation/contact.test.ts` — new; covers the contact zod schema incl. the honeypot behaviour.

**Commands run**
- `npm test` → 3 files, 32 tests passing.
- `npx tsc --noEmit` → clean.
- `npm run lint` → no warnings or errors.

**Ready now:** `npm test` gives regression coverage for the role/persona ranking
engine — the portfolio's most distinctive and easily-broken logic.

**Next smallest step:** Add a CI workflow step (or extend the existing Vercel
workflow) to run `npm test` on pushes/PRs so the suite actually gates changes.
Then expand coverage to `lib/audit.ts` and the AI resume parsing helpers.
