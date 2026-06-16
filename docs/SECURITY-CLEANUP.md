# Security Cleanup Notes

During the portfolio rebuild (June 2026), MCA coursework was removed from the
working tree. Two security issues were found in that coursework. **The files
are gone from the current tree but remain in git history** until a history
purge is performed.

## 1. Exposed credentials — action required

| Secret | Where it lived | Action |
|---|---|---|
| MySQL credentials (`root` / `1234`) | `movie-catalog/db.env` | Change the MySQL root password on any machine that used it. Never commit `.env` files (now blocked by `.gitignore`). |
| API-Ninjas API key | `FSD/react/App.js` (hardcoded) | Rotate the key at https://api-ninjas.com/profile. |

Rotate both regardless of whether the history purge below is performed —
assume anything ever pushed to a public repo is compromised.

## 2. Optional: purge history

History still contains the secrets above plus a ~16 MB demo video
(`FSD/CIA-2/`). To purge them (this **rewrites history and force-pushes**;
close or merge open PRs first, and re-clone afterwards):

```bash
pip install git-filter-repo
git clone https://github.com/Vishwaxs/vv-s-portfolio fresh-clone && cd fresh-clone

git filter-repo \
  --path movie-catalog/db.env \
  --path FSD/react/App.js \
  --path-glob 'FSD/CIA-2/*' \
  --invert-paths

git remote add origin https://github.com/Vishwaxs/vv-s-portfolio
git push --force --all origin
git push --force --tags origin
```

After force-pushing, every collaborator must re-clone (or hard-reset) their
local copies.
