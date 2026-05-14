# G3 — Documentation portal index refresh

**Status**: TODO
**Priority**: P2
**Owner file(s)**: `blog/docs/SITEBOY_DOCUMENTATION_PORTAL.md`, `blog/docs/index.md`
**Blockers**: → G2
**Blocks**: —
**Last touched**: 2026-05-12

## Goal

`SITEBOY_DOCUMENTATION_PORTAL.md` reflects the post-cleanup tree with zero broken links.

## Done when

A link-check pass over the portal returns zero 404s within the repo. Every top-level docs entry is reachable from the portal in ≤2 clicks.

## Sub-tasks

- [ ] Run a link-extraction + existence check on the portal.
- [ ] Update every broken link.
- [ ] Add entries for any new docs landing in G2.
- [ ] Remove entries for deleted/archived docs.
- [ ] Sync `blog/docs/index.md` to the same shape.

## Notes / decisions

(append-only)

## References

- `blog/docs/SITEBOY_DOCUMENTATION_PORTAL.md`
- `blog/docs/index.md`
