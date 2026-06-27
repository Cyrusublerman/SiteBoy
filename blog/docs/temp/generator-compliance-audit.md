# D3 — Generator compliance audit (pass 2 — complete)

Date: 2026-06-08. Tool: `.cursor/skills/page-compliance-audit/scripts/grep-violations.sh` + manual p5 §9 review. Scope: 23 shipped `.gen.js` files.

Legend: **PASS** = no hard-gate FAIL; **PASS*** = grep hits confirmed false-positive / canvas-output only; **NOTE** = documented exception.

## Summary

| Verdict | Count | Scripts |
| --- | --- | --- |
| PASS | 12 | animated-lines, clockwise, curtain-morph, defecated, golden-grid, harmonics, moire, order-disorder, shape-array, unified-pattern, generative-pattern, wave-equation-synth |
| PASS* | 11 | circles, cymatics, fibonacci-balls, interference-figure, lissajous, quine, solar-system, squares, tile-mosaic, torus, wave-interference |
| FAIL | 0 | — |

Hard-gate FAIL total: **0** (target met).

## Per-script matrix

| Script | ctx | Static hits | Hard gates | Verdict | Notes |
| --- | --- | --- | --- | --- | --- |
| animated-lines.gen.js | p5 | 0 | — | PASS | — |
| circles.gen.js | 2d | 7 | — | PASS* | rgb() canvas fill |
| clockwise.gen.js | p5 | 0 | — | PASS | — |
| curtain-morph.gen.js | p5 | 0 | — | PASS | — |
| cymatics.gen.js | 2d | 5 | — | PASS* | OffscreenCanvas; rgba canvas output |
| defecated.gen.js | p5 | 0 | — | PASS | host `p5Renderer:webgl`; frame-based morph |
| fibonacci-balls.gen.js | p5 | 1 | — | PASS* | info body only |
| generative-pattern.gen.js | p5 | 0 | — | PASS | hidden registry |
| golden-grid.gen.js | p5 | 0 | — | PASS | — |
| harmonics.gen.js | 2d | 0 | — | PASS | — |
| interference-figure.gen.js | 2d | 8 | — | PASS* | `_toSrgb` identifier false positive |
| lissajous.gen.js | 2d | 1 | — | PASS* | info body only |
| moire.gen.js | 2d | 0 | — | PASS | — |
| order-disorder.gen.js | p5 | 0 | — | PASS | — |
| quine.gen.js | p5 | 7 | — | PASS* | colourway hex in config |
| shape-array.gen.js | p5 | 0 | — | PASS | — |
| solar-system.gen.js | 2d | 6 | — | PASS* | F-derived HUD fonts; VGA HUD overlays; moon/planet data colours intentional (NOTE) |
| squares.gen.js | 2d | 2 | — | PASS* | hsl canvas output |
| tile-mosaic.gen.js | 2d | 21 | — | PASS* | z-stack shadow via offset blit; PAT-008 rgba/gradient canvas output |
| torus.gen.js | 2d | 1 | — | PASS* | rgba canvas mesh |
| unified-pattern.gen.js | 2d | 0 | — | PASS | hidden |
| wave-equation-synth.gen.js | 2d | 0 | — | PASS | dead wavExporter removed |
| wave-interference.gen.js | p5 | 3 | — | PASS* | hue2rgb fn name false positive |

## Fixes landed

### Pass 1 (2026-06-08)

1. `cymatics.gen.js` — `document.createElement('canvas')` → `OffscreenCanvas`.
2. `solar-system.gen.js` — `"Space Mono"` → `"Atkinson Hyperlegible Mono"`.

### Pass 2 (2026-06-08)

1. **Host** — `canvas.p5Renderer` in `script-types.js`; WEBGL init in `generative-tool-host.js`; optional 4th `activeFps` arg to `p5Draw`.
2. **defecated.gen.js** — `p5Renderer:'webgl'`; removed createCanvas/loop/inline styles/millis; frame-based morph cycle.
3. **tile-mosaic.gen.js** — `_drawZStackShadow` offset blit; removed `ctx.shadow*`.
4. **solar-system.gen.js** — F-derived font constants; VGA + `globalAlpha` HUD overlays.
5. **wave-equation-synth.gen.js** — deleted dead `wavExporter()` DOM block.

## Accepted exceptions (NOTE)

- **solar-system** — `MOON_DATA` / non-VGA scientific body hex in data tables (user-confirmed; not HUD violations).
- **tile-mosaic** — PAT-008 sprite bevel gradients and colourway config hex (canvas output / user palette).

## p5 §9 manual review (11 p5 scripts)

All clear: no script calls `createCanvas()`, `p.loop()`, or inline canvas positioning. `defecated` uses host WEBGL via `p5Renderer:'webgl'`.

## Re-run

```bash
for f in assets/js/tools/generators/scripts/**/*.gen.js; do
  echo "=== $f ==="
  bash .cursor/skills/page-compliance-audit/scripts/grep-violations.sh "$f"
done
```

Done when (D3): PASS for all 23 rows with zero hard-gate FAIL — **verified pass 2**.
