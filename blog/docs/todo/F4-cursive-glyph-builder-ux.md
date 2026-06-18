# F4 — Cursive glyph builder toolbar + sidebar UX

**Status**: DONE
**Priority**: P1
**Owner file(s)**: `assets/js/tools/utilities/cursive-glyph-builder.js`, `assets/js/shared/components/drawing/GlyphCaptureCanvas.js`, `assets/js/shared/components/tool/GlyphBuilderToolbar.js`, `assets/js/tools/core/tool-base.js`, `assets/js/shared/layout.js`, `assets/js/shared/components/input/Dropdown.js`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-06-18

## Goal

Align glyph builder chrome with generator tools; canvas-column toolbar; SESSION font/typography; VIEW tab; row-grid capture; PREVIEW/GLYPHS views. Docs: page spec §0 + §15 (`blog/docs/pages/tools/utilities/cursive-glyph-builder.md`).

## Done when

(a) Canvas-column toolbar only: INFO, SCALE (cycles fit→fill→actual), PREVIEW, GLYPHS, EXPORT▾; no font control on toolbar. **predicate**: `GlyphBuilderToolbar.js` grid; `TOOL_CONFIG` SESSION has `fontFamily` dropdown.

(b) Font pick and New Library advance queue/session (`Dropdown` + `setValueSilent`; modal on destructive actions). **predicate**: `_handleUpdate` `fontFamily`; `_rebuildFontDropdown`; `_confirmAndNewLibrary`.

(c) PROMPT tab: status line `mode — glyphs — coverage%`; Current 3-col; Queue 4-col. **predicate**: `TOOL_CONFIG` + `_updatePromptUI` `sessionLine`.

(d) Tool route container keeps `tool-viewport` padding after resize. **predicate**: `PageContainer.setSubheaderState` respects `tool-viewport` class (`layout.js`).

(e) Capture uses vertical row grid (`getRowWindow`, `_resolvePromptLayout`); inactive rows + ghost ink; not a two-upcoming-preview strip. **predicate**: `setInactiveRows`, `setGhostInk`, `setUpcoming([])` in `_renderCurrentPrompt`.

(f) TTC-only or failed font pick clears adapter, `__noop__` dropdown, `fontStatus` caption. **predicate**: `_handleFontLoadFailure`.

(g) No CANVAS sidebar tab; canvas display via SCALE; export PNG/ZIP via EXPORT▾ only. **predicate**: `TOOL_CONFIG` has SESSION, PROMPT, VIEW only; no `canvasWidth`/`exportPng` sidebar keys.

(h) ZIP via `AssetLoader.ensureJSZip()` only. **predicate**: `_loadJSZip()`; no `import('jszip')` in tool file.

(i) Rail typography `F×0.75` (active), idle `F`. **predicate**: `GlyphCaptureCanvas._drawRails` / `_drawIdleHint`.

(j) Page doc §0 operator guide matches shipped UI (INFO panel). **predicate**: `blog/docs/pages/tools/utilities/cursive-glyph-builder.md` §0 + §15 aligned with code (2026-05-21).

(k) Browser smoke checklist passed (handover §8). **predicate**: all items in `blog/docs/temp/cursive-glyph-builder-handover.md` §8 checked in browser at `#tools/utilities/cursive-glyph-builder`.

## Sub-tasks

- [x] ToolBase canvas slot + GlyphBuilderToolbar
- [x] SCALE / PREVIEW / GLYPHS view modes
- [x] Sidebar SESSION / PROMPT / VIEW (guides, PAN, ink)
- [x] Row-grid capture + ghost ink
- [x] SESSION typography + font capabilities UI
- [x] Tool viewport padding on resize
- [x] Font load failure / TTC messaging
- [x] AssetLoader JSZip
- [x] Page doc §0 + §4–§9 + §15 sync (INFO alignment)
- [x] Browser verify Done when (a)–(k) — handover §9

## Notes

- 2026-06-18: Browser smoke at `#tools/utilities/cursive-glyph-builder` — toolbar/sidebar/export chrome, SCALE cycle, PREVIEW toggle verified. Page §0 updated for EXPORT SVG.

## References

- `blog/docs/pages/tools/utilities/cursive-glyph-builder.md` §0 (operator), §15 (live UI)
- `blog/docs/temp/cursive-glyph-builder-handover.md` §3–§7, §14
- `assets/js/shared/components/tool/GeneratorToolbar.js`
- `blog/docs/todo/F1-cursive-glyph-builder.md`
