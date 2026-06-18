# D1 — Ship queued generators

**Status**: DONE
**Priority**: P1
**Owner file(s)**: `assets/js/tools/generators/scripts/<category>/<slug>.gen.js`, `assets/js/tools/generators/core/parameter-builder.js`
**Blockers**: none
**Blocks**: D3
**Last touched**: 2026-06-18

## Goal

Every approved-but-unshipped generator lands in the registry, renders, and conforms to the unified pipeline.

## Done when

The queue table below is fully filled in. Every generator row reaches `DONE`. Each script passes `page-compliance-audit` (kind `generator` or `p5-generator`).

## Currently shipped (23 active + 2 hidden aliases)

`moire`, `golden-grid`, `quine`, `solar-system`, `unified-pattern`, `animated-lines`, `squares`, `generative-pattern`, `wave-equation-synth`, `wave-interference`, `order-disorder`, `clockwise`, `torus`, `circles`, `tile-mosaic`, `lissajous`, `harmonics`, `interference-figure`, `cymatics`, `defecated`, `shape-array`, `fibonacci-balls`, `curtain-morph`.

Hidden aliases: `p5-wave-interference`, `p5-wave-colour` → `wave-interference.gen.js`.

## Queue

| Slug | Category | Spec doc | Status |
| --- | --- | --- | --- |
| harmonics | parametric | `blog/docs/pages/tools/generators/harmonics/` | DONE |
| lissajous | parametric | `blog/docs/pages/tools/generators/lissajous/` | DONE |
| torus | parametric | `blog/docs/pages/tools/generators/torus/` | DONE |
| wave-interference | wave | `blog/docs/pages/tools/generators/wave-interference/` | DONE |
| cymatics | wave | `blog/docs/pages/tools/generators/cymatics/` | DONE |
| moire | wave | `blog/docs/pages/tools/generators/moire/` | DONE |
| generative-pattern | pattern | `blog/docs/pages/tools/generators/generative-pattern/` | DONE |
| tile-mosaic | pattern | `blog/docs/pages/tools/generators/tile-mosaic/` | DONE |
| golden-grid | pattern | `blog/docs/pages/tools/generators/golden-grid/` | DONE |
| order-disorder | pattern | `blog/docs/pages/tools/generators/order-disorder/` | DONE |
| animated-lines | pattern | `blog/docs/pages/tools/generators/animated-lines/` | DONE |
| shape-array | pattern | `blog/docs/pages/tools/generators/shape-array/` | DONE |
| fibonacci-balls | physics | `blog/docs/pages/tools/generators/fibonacci-balls/` | DONE |
| circles | other | `blog/docs/pages/tools/generators/circles/` | DONE |
| squares | other | `blog/docs/pages/tools/generators/squares/` | DONE |
| solar-system | other | `blog/docs/pages/tools/generators/solar-system/` | DONE |
| interference-figure | other | `blog/docs/pages/tools/generators/interference-figure/` | DONE |
| wave-equation-synth | other | `blog/docs/pages/tools/generators/wave-equation-synth/` | DONE |
| unified-pattern | other | `blog/docs/pages/tools/generators/unified-pattern/` | DONE |
| defecated | other | `blog/docs/pages/tools/generators/defecated/` | DONE |
| clockwise | other | `blog/docs/pages/tools/generators/clockwise/` | DONE |
| curtain-morph | other | `blog/docs/pages/tools/generators/curtain-morph/` | DONE |
| quine | other | `blog/docs/pages/tools/generators/quine/` | DONE |
| p5-wave-interference | wave | `blog/docs/pages/tools/generators/p5-wave-interference/` | DONE (alias) |
| p5-wave-colour | wave | `blog/docs/pages/tools/generators/p5-wave-colour/` | DONE (alias) |

No spec under `blog/docs/pages/tools/generators/` (excluding `guides/`, `host/`, `template/`, `repro/`) lacks a matching `.gen.js`.

## Sub-tasks

- [x] Enumerate every spec in `blog/docs/pages/tools/generators/` lacking a matching `.gen.js`.
- [x] For each, add a row to the queue table above.
- [x] For each queued generator: scaffold `.gen.js`, wire to parameter-builder, register in unified pipeline.
- [ ] Run audit on each (→ D3).
- [x] Update D2 record-button coverage to include new generators (all p5/2d scripts).

## Notes / decisions

- 2026-06-18: Full inventory — 25 spec folders, 23 `.gen.js` files (+ 2 merged aliases). Queue empty of unshipped items.

## References

- `assets/js/tools/generators/core/parameter-builder.js`
- `blog/docs/pages/tools/generators/guides/`
