# H3 — Remove dist/ churn from commits

**Status**: DONE
**Priority**: P1
**Owner file(s)**: `.gitignore`, `dist/`
**Blockers**: none
**Blocks**: F3 (clean commits)
**Last touched**: 2026-07-23

## Goal

`dist/` is a build artefact and must not be tracked. The current branch carries dozens of `dist/assets/*-<hash>.js` adds/deletes (visible in `git status`).

## Done when

(a) `.gitignore` contains `dist/`.
(b) `git ls-files dist/` returns empty.
(c) Future commits never include `dist/` changes (verifiable by repeating the check post-build).

## Sub-tasks

- [x] Confirm `.gitignore` covers `dist/`.
- [x] Confirm `git ls-files dist/` returns no tracked files.
- [x] Confirm the untracked build artefact state is already committed.
- [x] Verify `git status` shows no `dist/` entries after a fresh `npm run build`.
- [x] Configure the Vercel host-side build pipeline; never commit output.

## Notes / decisions

- 2026-07-23: Predicate verified in an isolated `origin/main` worktree after a fresh build.

## References

- A1 (host-side build pipeline)
- F3 (current branch diff is bloated by dist/ churn)
