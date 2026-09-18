# H8 — Project state cleanup

**Status**: REVIEW
**Priority**: P0
**Owner file(s)**: `blog/docs/todo/index.md`, `.gitignore`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-09-18

## Goal

One canonical git line, one dashboard that matches GitHub, junk gone. Not a feature sprint.

## Done when

Local `main` is a fast-forward of `origin/main` plus merge of PR #24 plus H8/P4–P6 commits; `wip/b6-index-map` exists and `main` does not contain Index Map sources; `blog/docs/todo/index.md` lists H8, D5–D8, B6 as parked, and every open PR 25–30/#15; root has no markdown files; `git ls-files` contains none of the P4 paths and no `blog/docs/old-docs/`; `blog/docs/temp/` is empty.

## Sub-tasks

- [x] P0 Park B6 on `wip/b6-index-map`
- [x] P1 Fast-forward `main` to `origin/main`
- [x] P2 Merge PR #24 locally (do not merge 25–30)
- [x] P3 Dashboard truth (this file + index)
- [x] P4 Root junk
- [x] P5 Docs hoard
- [x] P6 Vendored clones / generated output
- [x] P7 Verify predicate; status → REVIEW

## Open PR inventory (do not merge in H8)

| PR | Branch | Base | Meaning |
| --- | --- | --- | --- |
| 24 | `agent/dp-4-docs` | `main` | Merged locally 2026-09-18. Docs/TODO/runbook reconcile. |
| 25 | `agent/dp-7-pkl` | 24 | PKL eligibility default-deny |
| 26 | `agent/dp-5-admin` | 24 | Admin chrome + version history (continues G1) |
| 27 | `agent/dp-8-resilience` | 25 | Bucket/DB drift + snapshots |
| 28 | `agent/dp-6-blocks` | 24 | `:::block` parser + HTML sanitiser |
| 29 | `agent/dp-9-gallery` | 26 | Gallery display modes (continues C2/G1) |
| 30 | `agent/dp-10-blog` | 29 | Blog/About admin editors (continues G1) |
| 15 | `validation/vercel-exact-build` | `main` | Draft: Vercel command diagnosis. Close or finish. |

## New IDs opened in H8

- **A5** function-entrypoint consolidation — DONE (ADR + `api/content/[resource].js` on `main`).
- **B6** Index Map hybrid — REVIEW, code parked on `wip/b6-index-map`, not on `main`.
- **B7** PKL Wiki / Blog / Figures — REVIEW (sections on `main`; audit open).
- MFA/CSRF/rate-limit stay inside **A2** (already implemented as A2 sub-tasks). Gallery admin stays inside **G1**.

## Notes / decisions

- 2026-09-18: local June `main` was 49 commits behind origin. Zero unique local commits. B6 was uncommitted; parked first.
- 2026-09-18: A1 remains REVIEW (#24): host config exists; live custom-domain/parity unproven. A2/A3/A4 no longer list A1 as a code blocker; remaining work is preview verification.
- 2026-09-18: B5 already BLOCKED by #24 (SLA re-scope). F2 and G1 flipped WIP → REVIEW (stubs/partial editors landed; 14-day SLA).
- After H8: rebase B6, or land stack 25→30 in base order, or work only on `main`.

## References

- `blog/docs/site/adr-A5-function-consolidation.md`
- `blog/docs/site/pkl-publication-integration.md`
- `blog/docs/guides/ai-routing-map.md`
