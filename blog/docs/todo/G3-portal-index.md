# G3 — Documentation portal index refresh

**Status**: DONE
**Priority**: P2
**Owner file(s)**: `blog/docs/SITEBOY_DOCUMENTATION_PORTAL.md`, `blog/docs/index.md`
**Blockers**: → G2
**Blocks**: —
**Last touched**: 2026-06-18

## Goal

`SITEBOY_DOCUMENTATION_PORTAL.md` reflects the post-cleanup tree with zero broken links.

## Done when

A link-check pass over the portal returns zero 404s within the repo. Every top-level docs entry is reachable from the portal in ≤2 clicks.

## Sub-tasks

- [x] Run a link-extraction + existence check on the portal.
- [x] Update every broken link (40 fixed; portal rewrite).
- [x] Add entries for ADRs, store-spec, notes-tool-scope, gallery-status.
- [x] Remove entries for deleted/archived docs (redirect to old-docs/).
- [x] Sync `blog/docs/index.md` to the same shape.

## Notes / decisions

(append-only)

## References

- `blog/docs/SITEBOY_DOCUMENTATION_PORTAL.md`
- `blog/docs/index.md`
