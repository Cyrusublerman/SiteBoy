# Defecated — Migration Log

## Status

**Live: v2.0.0.** The generator is fully implemented in `assets/js/tools/generators/scripts/other/defecated.gen.js`. It does not use the legacy `defecated-tool.js` ToolBase/iframe architecture; that file is superseded.

## Live Implementation Summary

- Canvas: 800×600, `context: 'p5'` (P5 WebGL mode)
- Animation: `infinite`, 60 fps; no sequencer; no GIF/WebM export
- GLSL shader: ink-bleed effect with directional spread and noise-warped edges (DEF-02)
- Font cycling: `FontRegistry.listFonts()` — all canvas fonts, display/handwriting priority first (DEF-01)
- Text input: `textMode` radio (Preset/Custom); preset dropdowns for line1/line2/line3; free-text `customText` field for custom mode (DEF-04)
- Parameter groups: Text, Layout, Timing, Effect, Display

## Architecture Resolution (vs. original blockers)

| Original blocker | Resolution |
|---|---|
| Host WebGL context | Resolved via `context: 'p5'` with P5 WEBGL mode — P5 creates and manages WebGL context internally |
| Text input type | Resolved: `type: 'text'` + `type: 'dropdown'` for preset mode; `type: 'radio'` for mode switch |
| Non-determinism | Accepted: font sequence advances per animation tick; PNG snapshot only |

## Parameters (live v2.0.0)

| Group | Key | Type |
|---|---|---|
| Text | `textMode` | radio (Preset/Custom) |
| Text | `customText` | text |
| Text | `line1`, `line2`, `line3` | dropdown |
| Layout | `targetWidth`, `maxHeight`, `lineGap` | slider |
| Timing | `morphTime`, `power` | slider |
| Effect | `blurMax` | slider |
| Display | `displayOptions` | toggle |

## Closed Items

All original architectural blockers resolved in v2.0.0. Stale "Not implemented" migration-log overwritten 2026-04-30.
