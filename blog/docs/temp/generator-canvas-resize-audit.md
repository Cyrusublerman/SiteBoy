# Generator canvas resize audit

Date: 2026-06-08. Test size: 2000×800. Tiers: A = display aspect (buffer + CSS + uniform scale + export); B = content reflow.

## Host (all scripts)

| Check | Result | Evidence |
| --- | --- | --- |
| 2D resize via `canvasComponent.resize` | PASS | `generative-tool-host.js` `_handleCanvasResize` |
| P5 resize via `resizeCanvas` + display mode | PASS | same |
| P5 `p5Setup` re-run on resize | PASS | same (added 2026-06-08) |
| Bypass `tool.canvas.width=` in generators | PASS | grep: none in `assets/js/tools/generators/` |
| Export uses active canvas element | PASS | `_getActiveCanvas()` |

## Script matrix (26 registry IDs)

| ID | hidden | ctx | default | Tier A | Tier B | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| lissajous | | 2d | 800×800 | PASS | PASS | `draw` reads `canvas.width/height` |
| harmonics | | 2d | 800×800 | PASS | PASS | same |
| torus | | 2d | 800×800 | PASS | PASS | `min(W,H)` scaling |
| wave-interference | | p5 | 1080×1080 | PASS | PASS | `_triangle(W,H)` fix |
| cymatics | | 2d | 512×512 | PASS | PASS | dynamic W/H in draw |
| moire | | 2d | 420×420 | PASS | PASS | normalised coords from W/H |
| generative-pattern | yes | p5 | 800×800 | PASS | PASS | `_lastCanvasW/H` rebuild |
| tile-mosaic | | 2d | 800×800 | PASS | PASS | OffscreenCanvas from W/H |
| golden-grid | | p5 | 800×800 | PASS | PASS | `p5Setup` re-run; subdivide uses p.width/height |
| order-disorder | | p5 | 1080×1080 | PASS | PASS | `p5Setup` re-run rebuilds grid |
| animated-lines | | p5 | 600×500 | PASS | PASS | `translate(p.width/2, p.height/2)` |
| shape-array | | p5 | 1080×1080 | PASS | PASS | offset from p.width/height |
| p5-wave-interference | yes | p5 | alias | PASS | PASS | → wave-interference |
| p5-wave-colour | yes | p5 | alias | PASS | PASS | → wave-interference |
| fibonacci-balls | | p5 | 610×610 | PASS | NOTE | physics uses param `fibIndexForCanvas`; OUTPUT Size overrides host buffer; sim domain may diverge from Fib param — intentional param model |
| circles | | 2d | 800×800 | PASS | PASS | dynamic W/H |
| squares | | 2d | 800×800 | PASS | PASS | dynamic W/H |
| solar-system | | 2d | 800×800 | PASS | PASS | belt cache keyed on canvas w/h |
| interference-figure | | 2d | 420×420 | PASS | PASS | dynamic W/H |
| wave-equation-synth | | 2d | 420×420 | PASS | PASS | dynamic W/H |
| unified-pattern | yes | 2d | 800×800 | PASS | PASS | `createImageData(canvas.width, …)` |
| defecated | | p5 | 800×600 | PASS | PASS | resize buffers in `p5Draw` |
| clockwise | | p5 | 1080×1080 | PASS | PASS | centre/bounds → p.width/height fix |
| curtain-morph | | p5 | 1080×1080 | PASS | PASS | centre → p.width/2, p.height/2 fix |
| quine | | p5 | 1080×1080 | PASS | PASS | W/H from p.width/height in draw |

Tier A verification: code path review + host/script fixes (2026-06-08). Buffer/CSS sync enforced by `Canvas.resize` (2d) and p5 `resizeCanvas` (p5). FIT/FILL/ACTUAL use uniform `scale()` only.

Tier B fixes applied: host `p5Setup` re-run; `clockwise.gen.js`, `curtain-morph.gen.js`, `wave-interference.gen.js`, `generative-pattern.gen.js`.

## Exceptions

- **fibonacci-balls**: Tier B NOTE — simulation canvas size is driven by `fibIndexForCanvas`, not OUTPUT Size alone; host resize changes pixel buffer but not Fibonacci index param. Documented; no script change (param model).
