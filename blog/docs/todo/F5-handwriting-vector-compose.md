# F5 — Handwriting vector compose export

**Status**: DONE
**Priority**: P2
**Owner file(s)**: `assets/js/shared/algorithms/typography/handwriting-compose.js`, `assets/js/tools/utilities/cursive-glyph-builder.js`, `assets/js/shared/components/tool/GlyphBuilderToolbar.js`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-06-18

## Goal

Compose captured cursive glyph strokes into vector SVG output (stroke-only paths) with simple per-glyph perturbation; export via Glyph Builder EXPORT▾ panel.

## Done when

(a) `handwriting-compose.js` exports `strokesToSVGPath`, `composeTextToVectors`, `perturbGlyph`, `buildSVGDocument` as pure functions. **predicate**: module exists; no DOM imports.

(b) EXPORT▾ includes **EXPORT SVG**; download is stroke-only SVG (no raster embed) from preview lorem composition. **predicate**: `_exportComposedSvg` + toolbar row; browser download verified.

(c) Perturbation applies baseline drift (Brownian) + size jitter per captured segment. **predicate**: `perturbGlyph` with `baselineAmplitude` / `sizeAmplitude` in compose path.

## Sub-tasks

- [x] Algorithm module `handwriting-compose.js`
- [x] Tool `_exportComposedSvg` wired to EXPORT▾
- [x] Browser verify SVG paths match composed preview ink

## Notes

- Extends F1/F4 glyph builder; no new route or sidebar tab.
- User text input deferred; exports `PREVIEW_LOREM_IPSUM` like preview view.

## References

- `blog/docs/temp/cursive-glyph-builder-handover.md`
- F1, F4
