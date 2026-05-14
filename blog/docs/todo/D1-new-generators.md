# D1 — Ship queued generators

**Status**: TODO
**Priority**: P1
**Owner file(s)**: `assets/js/tools/generators/scripts/<category>/<slug>.gen.js`, `assets/js/tools/generators/core/parameter-builder.js`
**Blockers**: none
**Blocks**: D3
**Last touched**: 2026-05-12

## Goal

Every approved-but-unshipped generator lands in the registry, renders, and conforms to the unified pipeline.

## Done when

The queue table below is fully filled in. Every generator row reaches `DONE`. Each script passes `page-compliance-audit` (kind `generator` or `p5-generator`).

## Currently shipped (23)

`moire`, `golden-grid`, `quine`, `solar-system`, `unified-pattern`, `animated-lines`, `squares`, `generative-pattern`, `wave-equation-synth`, `wave-interference`, `order-disorder`, `clockwise`, `torus`, `circles`, `tile-mosaic`, `lissajous`, `harmonics`, `interference-figure`, `cymatics`, `defecated`, `shape-array`, `fibonacci-balls`, `curtain-morph`.

## Queue (to be populated)

| Slug | Category | Spec doc | Status |
| --- | --- | --- | --- |
| _TBD_ |  |  |  |

(Populate from `blog/docs/pages/tools/generators/guides/` and any user-named candidates. Each row needs: slug, category, spec doc, status.)

## Sub-tasks

- [ ] Enumerate every spec in `blog/docs/pages/tools/generators/guides/` lacking a matching `.gen.js`.
- [ ] For each, add a row to the queue table above.
- [ ] For each queued generator: scaffold `.gen.js`, wire to parameter-builder, register in unified pipeline.
- [ ] Run audit on each.
- [ ] Update D2 record-button coverage to include new generators.

## Notes / decisions

(append-only)

## References

- `assets/js/tools/generators/core/parameter-builder.js`
- `blog/docs/pages/tools/generators/guides/`
