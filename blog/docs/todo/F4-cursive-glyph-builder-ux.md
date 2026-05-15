# F4 — Cursive glyph builder toolbar + sidebar UX

**Status**: REVIEW
**Priority**: P1
**Owner file(s)**: `assets/js/tools/utilities/cursive-glyph-builder.js`, `assets/js/shared/components/tool/GlyphBuilderToolbar.js`, `assets/js/tools/core/tool-base.js`, `assets/js/shared/components/input/Dropdown.js`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-05-15

## Goal

Align glyph builder chrome with generator tools; fix canvas-column toolbar; restore font/session actions; denser PROMPT sidebar.

## Done when

(a) Top bar uses generator-equivalent controls (reference font left, INFO / FIT / FILL / ACTUAL / EXPORT), lives only above the canvas column (`ToolBase.setTopBar` inset layout), and export includes import + PNG + library ZIP. **predicate**: code in `GlyphBuilderToolbar.js` + `setTopBar` inserts before `tool-canvas-slot`.

(b) Font pick and New Library advance queue/session (`Dropdown` fires change including optional `__noop__` handling; `setValueSilent` avoids duplicate loads; modal confirm still uses `ModalConfirm` + `showFloatingOverlay`). **predicate**: `_onFontDropdownChange` + `_confirmAndNewLibrary` wired; no `fontFamily` ToolBase control.

(c) PROMPT tab shows status line `mode — glyphs — coverage%`, Current and Queue use three columns via `contentColumns: 3`. **predicate**: `TOOL_CONFIG` + `_updatePromptUI`.

## Sub-tasks

- [x] ToolBase canvas slot + inset top bar
- [x] GlyphBuilderToolbar + library export
- [x] Dropdown `setValueSilent` / noop select
- [x] Sidebar VIEW tab for guides + draw height

## References

- `assets/js/shared/components/tool/GeneratorToolbar.js`
- `blog/docs/todo/F1-cursive-glyph-builder.md`
