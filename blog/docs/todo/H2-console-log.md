# H2 — Eliminate console.log outside owners

**Status**: DONE
**Priority**: P1
**Owner file(s)**: every file in `assets/js/` except `console.error`/`console.warn` call sites
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-06-18

## Goal

No `console.log(` calls remain in source. All debug logging uses `window.debugLog(CATEGORY, …)` per `.cursorrules` Debug Logging System.

## Done when

`rg "console\.log\(" assets/js/` returns zero results. `console.error` and `console.warn` calls remain unchanged.

## Sub-tasks

- [x] Inventory: baseline 424 occurrences across 72 files.
- [x] Replace each call with the appropriate `window.debugLog(CATEGORY, …)` per the five-category map in `.cursorrules`.
- [x] Verify `console.error` / `console.warn` remain.
- [x] Re-run inventory; verify zero.

## Notes / decisions

- Router conversion already in flight (see F3).

## References

- `.cursorrules` Debug Logging System
- `assets/js/core/config.js` (debug-log utilities)
