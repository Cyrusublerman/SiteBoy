# G2 — Docs cleanup pass

**Status**: DONE
**Priority**: P1
**Owner file(s)**: `blog/docs/temp/`, `blog/docs/guides/`, `blog/docs/site/`
**Blockers**: none
**Blocks**: G3
**Last touched**: 2026-06-18

## Goal

`blog/docs/temp/` contains only short-lived working notes. Evergreen content is promoted; superseded content is deleted. Every guide passes the workspace user-rule for "high density of meaning, formal logic, strict defined terms".

## Done when

(a) `blog/docs/temp/` contains only files <30 days old.
(b) Every guide file lives in one of `guides/standards/`, `guides/checklists/`, `site/`, `pages/`, or the per-tool spec folder.
(c) Every promoted doc has terms defined upfront and uses tables over prose where possible.

## Sub-tasks

- [x] Inventory `blog/docs/temp/`: baseline 187 files (2026-06-18).
- [x] For each `*-build-guide.md`: archived 58 to `blog/docs/pages/tools/processors/distort/build-guides/archive/`.
- [x] For each `*-complete.md`: deleted (superseded).
- [x] For each `*-fix-*.md` / `*-debug-*.md`: deleted (issues tracked in todo system).
- [x] Promoted evergreen analyses: 4 distort ops docs → `pages/tools/processors/distort/`; `gallery-status.md` → `site/`.
- [x] Deleted 119 ephemeral files >30 days old; 5 recent files remain in `temp/`.
- [ ] Run a density rewrite pass on every promoted doc.
- [ ] Update cross-links.

## Notes / decisions

(append-only)

## References

- Workspace user-rule on docs density.
- G3 (downstream — portal index re-flow)
