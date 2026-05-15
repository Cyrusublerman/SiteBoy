# H3 — Remove dist/ churn from commits

**Status**: TODO
**Priority**: P1
**Owner file(s)**: `.gitignore`, `dist/`
**Blockers**: none
**Blocks**: F3 (clean commits)
**Last touched**: 2026-05-12

## Goal

`dist/` is a build artefact and must not be tracked. The current branch carries dozens of `dist/assets/*-<hash>.js` adds/deletes (visible in `git status`).

## Done when

(a) `.gitignore` contains `dist/`.
(b) `git ls-files dist/` returns empty.
(c) Future commits never include `dist/` changes (verifiable by repeating the check post-build).

## Sub-tasks

- [ ] Confirm `.gitignore` covers `dist/`.
- [ ] `git rm -r --cached dist/` to untrack existing files.
- [ ] Commit the untrack as one isolated commit.
- [ ] Verify `git status` shows no `dist/` entries after a fresh `npm run build`.
- [ ] If A1 host needs build artefacts, configure the host-side build pipeline (Vercel build step) — never commit the output.

## Notes / decisions

(append-only)

## References

- A1 (host-side build pipeline)
- F3 (current branch diff is bloated by dist/ churn)
