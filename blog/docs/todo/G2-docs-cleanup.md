# G2 — Docs cleanup pass

**Status**: TODO
**Priority**: P1
**Owner file(s)**: `blog/docs/temp/`, `blog/docs/guides/`, `blog/docs/site/`
**Blockers**: none
**Blocks**: G3
**Last touched**: 2026-05-12

## Goal

`blog/docs/temp/` contains only short-lived working notes. Evergreen content is promoted; superseded content is deleted. Every guide passes the workspace user-rule for "high density of meaning, formal logic, strict defined terms".

## Done when

(a) `blog/docs/temp/` contains only files <30 days old.
(b) Every guide file lives in one of `guides/standards/`, `guides/checklists/`, `site/`, `pages/`, or the per-tool spec folder.
(c) Every promoted doc has terms defined upfront and uses tables over prose where possible.

## Sub-tasks

- [ ] Inventory `blog/docs/temp/`: `ls | wc -l` baseline (~180 files).
- [ ] For each `*-build-guide.md`: check it has a matching Node + shader; if yes and module is shipped, the guide is superseded — move to `blog/docs/pages/tools/processors/distort/build-guides/archive/` or delete.
- [ ] For each `*-complete.md`: confirm DONE in this todo system; delete or archive.
- [ ] For each `*-fix-*.md` / `*-debug-*.md`: extract any unresolved issue into a todo file; delete the original.
- [ ] For evergreen analyses (e.g. architecture reviews, spec specs), promote to `blog/docs/site/` or `blog/docs/guides/`.
- [ ] Run a density rewrite pass on every promoted doc.
- [ ] Update cross-links.

## Notes / decisions

(append-only)

## References

- Workspace user-rule on docs density.
- G3 (downstream — portal index re-flow)
