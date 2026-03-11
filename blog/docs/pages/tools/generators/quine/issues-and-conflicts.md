# Quine — Issues and Conflicts

## ERROR

None.

## WARN

**[STANDARDS] All state on `SCRIPT_CONFIG`**
`_ego`, `_past`, `_present`, `_charIndex`, `_lineIndex`, `_dormant`, `_clearing`, `_blankLines`, `_lastRenderedLine`, `_noiseT`, `_residue`, `_echo`, `_reflection`, `_imagined`, `_nextFrame`, `_initialized` are all properties of `SCRIPT_CONFIG`. This violates the per-invocation scoping requirement — if multiple instances of the generator were mounted, they would share state.
Fix: move all mutable state into local variables within `p5Setup`/`p5Draw` closures, or use a state object returned from `p5Setup` and passed to `p5Draw`.

**[STANDARDS] Raw RGB colour objects**
`_BG`, `_INK_CODE`, `_INK_COMMENT` are hardcoded `{ r, g, b }` objects. Standard requires CSS variables (`var(--vga-*)`). Paper simulation colours may justify an exception (not UI colours), but should still be referenced via design tokens if they exist.
Fix: check whether equivalent tokens exist; if not, propose and add them.

**[STANDARDS] Non-standard preset format**
Presets use flat objects: `{ name, key1, key2, ... }`. Standard requires `{ name, values: { key1, key2, ... } }`.
Fix: wrap parameter fields in a `values` property.

**[STANDARDS] No `animatableParams` declared**
`animation.animatableParams` not defined. Host cannot infer which params can be animated.
Fix: add `animatableParams: ['entropy', 'urgency', 'gravity', 'delayScale']`.

**[STANDARDS] No export options**
No `export` block. Generator cannot participate in the export pipeline.
Fix: add `export: { formats: ['png'] }` (video export would require determinism fix first).

**[BUG] Non-deterministic timing**
`_noiseT` increments by 0.05 per character emitted, not per frame. As a result, the same frame number can produce different visual output depending on how many characters have been emitted up to that point, which depends on `delayScale` and `pauseDelay`. Pre-render is not reliable; two render passes with the same frame index may disagree.
Fix: derive pseudo-noise from a seeded value of `_charIndex` rather than a monotonic counter, and ensure the character emit timeline is fully derivable from `frame` and `params` alone.

**[PERFORMANCE] `_diffuse` full-canvas pass**
`_diffuse` iterates the full 1080×1080 interior twice per frame regardless of how many pixels are actually wet. At low `urgency` or high `entropy`, most pixels have `residue.A = 0` and the inner neighbourhood loop is skipped — but the outer loop overhead is O(W×H) regardless.
Fix: maintain a bounding box or dirty-region set of active pixels; only diffuse the active region.

**[PERFORMANCE] Three 56 MB Float32Array buffers**
`_residue`, `_echo`, `_reflection` together occupy ~56 MB of heap. On low-memory devices (< 4 GB RAM or heavily loaded tabs) this may cause GC pressure or allocation failures.
Fix: reduce to two buffers by ping-ponging; use `Uint16Array` with fixed-point if precision allows.

**[ARCHITECTURE] `p.noLoop()` in `p5Setup`**
`p.noLoop()` is called in setup. For the host's frame-drive model to work, it must call `p.redraw()` on each frame (or the host overrides the draw loop externally). Verify that the host's integration matches this expectation; if not, `p.noLoop()` may freeze the animation.
Fix: confirm host uses `p.redraw()` per frame, or remove `p.noLoop()` if the host uses `p5Draw` as a callback directly.

## NOTE

**[DEAD CODE] `_lastRenderedLine`**
Property is initialised in `_reset` but never written in `p5Draw`. Appears to be unused infrastructure.
Fix: remove the property.

**[ACCURACY] Header comment: "Perlin noise-driven delay"**
`_noiseT` is a simple linear accumulator, not a Perlin noise value. The pseudo-random distribution of delays is an artefact of `(_noiseT % 1.0) × 3` producing values in [0,3), not actual coherent noise.
Fix: update the comment, or replace `_noiseT` with a seeded pseudo-random generator for correctness.

**[PARITY] Partial quine**
`_QUINE_TEXT` renders parameter names without values. A true quine would render the exact source of `SCRIPT_CONFIG` including all numeric defaults, making the rendered text and the source identical. The current implementation is a "quine in spirit" only.
