# H2 — Eliminate console.log outside owners

**Status**: WIP
**Priority**: P1
**Owner file(s)**: every file in `assets/js/` except `console.error`/`console.warn` call sites
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-05-12

## Goal

No `console.log(` calls remain in source. All debug logging uses `window.debugLog(CATEGORY, …)` per `.cursorrules` Debug Logging System.

## Done when

`rg "console\.log\(" assets/js/` returns zero results. `console.error` and `console.warn` calls remain unchanged.

## Sub-tasks

- [ ] Inventory: `rg "console\.log\(" assets/js/ | wc -l` baseline.
- [ ] Replace each call with the appropriate `window.debugLog(CATEGORY, …)` per the five-category map in `.cursorrules`:
  - `INIT` — startup / version messages
  - `LAYOUT` — F-system / dimensions / resize
  - `NAVIGATION` — route changes / subheader
  - `TOOLS` — tool-specific operations
  - `VERBOSE` — high-frequency operations
- [ ] Verify `console.error` / `console.warn` remain.
- [ ] Re-run inventory; verify zero.

## Notes / decisions

- Router conversion already in flight (see F3).

## References

- `.cursorrules` Debug Logging System
- `assets/js/core/config.js` (debug-log utilities)
