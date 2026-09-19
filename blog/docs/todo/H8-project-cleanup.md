# H8 — Project state cleanup

**Status**: REVIEW
**Priority**: P0
**Owner file(s)**: `blog/docs/todo/index.md`, `.gitignore`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-09-19

## Goal

One canonical git line, one dashboard that matches GitHub, junk gone. Not a feature sprint.

## Done when

Cleanup P0–P7 verified 2026-09-18. After-job 2026-09-19: PRs 15 and 25–30 on `main` and closed; B6 Index Map sources on `main`.

## Sub-tasks

- [x] P0 Park B6 on `wip/b6-index-map`
- [x] P1 Fast-forward `main` to `origin/main`
- [x] P2 Merge PR #24 locally (do not merge 25–30)
- [x] P3 Dashboard truth (this file + index)
- [x] P4 Root junk
- [x] P5 Docs hoard
- [x] P6 Vendored clones / generated output
- [x] P7 Verify predicate; status → REVIEW

## Open PR inventory

| PR | Outcome |
| --- | --- |
| 24 | Merged to `main` 2026-09-19. |
| 25 | Cherry-pick `468f2e2d`. ID remapped to **A6**. Closed. |
| 26 | Cherry-pick `560f4315`. Closed. |
| 27 | Cherry-pick `a2885fd9`. ID remapped to **A7**. Closed. |
| 28 | Cherry-pick `e464d129` (**G4**). Closed. |
| 29 | Cherry-pick `155b81b8`. Closed. |
| 30 | Cherry-pick `30197809`. Closed. |
| 15 | Cherry-pick `a722ceba`. Closed. |

## New IDs opened in H8

- **A5** function-entrypoint consolidation — DONE (ADR + `api/content/[resource].js` on `main`).
- **B6** Index Map hybrid — REVIEW, **on `main`** after rebase 2026-09-19.
- **B7** PKL Wiki / Blog / Figures — REVIEW (sections on `main`; audit open).
- MFA/CSRF/rate-limit stay inside **A2** (already implemented as A2 sub-tasks). Gallery admin stays inside **G1**.

## Notes / decisions

- 2026-09-18: local June `main` was 49 commits behind origin. Zero unique local commits. B6 was uncommitted; parked first.
- 2026-09-18: A1 remains REVIEW (#24): host config exists; live custom-domain/parity unproven. A2/A3/A4 no longer list A1 as a code blocker; remaining work is preview verification.
- 2026-09-18: B5 already BLOCKED by #24 (SLA re-scope). F2 and G1 flipped WIP → REVIEW (stubs/partial editors landed; 14-day SLA).
- After H8: rebase B6, or land stack 25→30 in base order, or work only on `main`.
- 2026-09-19: stack 15/25–30 cherry-picked and closed; B6 rebased onto `main` and merged.

## References

- `blog/docs/site/adr-A5-function-consolidation.md`
- `blog/docs/site/pkl-publication-integration.md`
- `blog/docs/guides/ai-routing-map.md`
