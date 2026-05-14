# GlyphCaptureCanvas — drawing/capture helper

## Role
Logic + render for ink strokes atop a ToolBase-owned canvas; attaches pointer handlers to that canvas element.

## API (contract)
| Method | Purpose |
|--------|---------|
| `attach(canvasEl)` | Wire pointer/contextmenu listeners; crosshair cursor. |
| `detach()` | Reverse `attach`. |
| `draw(ctx)` | Reference path, overlays, upcoming-queue strip, ink, live stroke (ToolBase `onDraw`). |
| `setSize(w,h)` | Logical buffer size (`_w,_h`; must match backing store for normalisation consistency). |
| `setPrompt({text,glyphPathD,advance})` | Current reference path + spacing token. |
| `setFontMetrics(m)` | Em-scale metrics for guide lines. |
| `setReferenceHeightFraction(v)` | Baseline position as fraction of canvas height (`0.4–1.5`). |
| `setUpcoming(prompts)` | Horizontal queue overlay; `{id,text}[]`; slide on head change (`AnimationFoundation.AnimationLoop`). |
| `setOverlayToggles(...)` | Baseline/x-height/etc. |
| Ink: `undo` / `redo` / `clearInk` / `getStrokes()` | Stroke stack + export. |

## Ownership
Subclass of `BaseComponent`; **no DOM root** besides event binding on supplied canvas (`assets/js/shared/components/drawing/GlyphCaptureCanvas.js`).

## Related
Stroke pipeline: `assets/js/shared/algorithms/typography/stroke-capture.js`, `bezier-fit.js`. Host tool: `cursive-glyph-builder.js`.
