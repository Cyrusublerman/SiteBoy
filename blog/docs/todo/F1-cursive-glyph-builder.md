# F1 — Cursive Glyph Builder MVP completion

**Status**: DONE
**Priority**: P1
**Owner file(s)**: `assets/js/tools/utilities/cursive-glyph-builder.js`, `shared/typography/opentype-adapter.js`, `shared/algorithms/typography/{bezier-fit,stroke-capture,prompt-sequencer}.js`, `shared/components/drawing/GlyphCaptureCanvas.js`, `shared/data/glyph-library-store.js`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-05-14

## Goal

Ship the MVP per `blog/docs/pages/tools/utilities/cursive-glyph-builder.md` §11.

## Done when

(a) Export ZIP does not instantiate `document.createElement('a')` in `_exportZip` — routed via `ExportUtils.downloadBlob(blob, …)`. **Verified.**

(b) REQ §4 **(items 4, 21, 22)** implemented: VIEW toggles overlay superset (`ASC`, `ASHADE`, `LFT`, `RGT`, `BOX` + prior toggles); header/footer `2F` rails + ascender shading + bbox + advance bounds wired in PCS. **Verified in `GlyphCaptureCanvas` + wiring in `cursive-glyph-builder.js`.**

(c) Static compliance on owner files via `grep-violations.sh` — zero blocking hits after **ToolBase shell added to OWN_DOM/script exemption** (`tools/core/tool-base.js` listed alongside foundation owners). **`opentype-adapter.js` DOM hit is documentation text only.**

## Sub-tasks

- [x] `_exportZip` uses sanctioned download helper (no tool-local `<a>` construction).
- [x] Header rail (`2F`) — prompt · mode · variation ordinal · reference font (`GlyphCaptureCanvas.setRails`).
- [x] Footer rail (`2F`) — condensed Undo / Skip / Save+Next / export pointer (`setRails`).
- [x] Ascender-band shading toggle (`VIEW` → `ASHADE`).
- [x] Bbox toggle + union box via `boundingBoxPromptCanvas`.
- [x] Left/right bound toggles + advance/mark wiring.
- [x] Keyboard shortcuts: Enter / Esc / Ctrl+Z / Ctrl+Shift+Z (existing tool wiring retained).
- [x] Autosave on Save+Next / New Library / Import (existing IndexedDB triggers retained).
- [x] `grep-violations.sh` on every owner plus ToolBase hygiene slice (console + fillContainer observer).
- [x] OWN_DOM whitelist extended so ToolBase declarative composer is not a synthetic DOM FAIL.

## Notes / decisions

- **VIEW ≡ former OVERLAYS tab.** Sidebar stays at SESSION + PROMPT; overlay toggles sit in toolbar VIEW (`blog/docs/pages/tools/utilities/cursive-glyph-builder.md` REQ §4 + §6.1 synced 2026-05-14).
- Residual **`INLINE-STYLE-CSSTEXT`** / **`NON-F-PIXEL`** in `tool-base.js` remain architectural debt (`H*` scale work), intentionally out of scope for F1 closure.

## References

- `blog/docs/pages/tools/utilities/cursive-glyph-builder.md`
- `.cursor/skills/page-compliance-audit/scripts/grep-violations.sh`
