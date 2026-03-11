# Wave Interference — Migration Log

## Pack Generated

Date: 2026-03-10
Source analysed: `assets/js/tools/generators/scripts/wave/wave-interference.gen.js` v2.0.0
Legacy docs: `wave-interference.md` (mixed bundle), `wave-interference-audit.md` (audit only)

## Summary of Migration State

The live script is a functional v2 rewrite of the legacy vanilla JS tool. The core equation structure (R/X/Y components, 2 terms each, safePow, blend modes, normalised coordinates, rotation) is fully implemented. The most significant divergences from the legacy spec are:

1. **Output mode**: Binary thresholding replaced with continuous greyscale normalisation.
2. **Rendering path**: WebGL primary path not implemented; CPU ImageData is the only path (Worker offload available via `computePixels`).
3. **Missing UI controls**: 18 functional parameters have no corresponding UI slots.
4. **Missing modulation formula**: Live formula uses sum-of-sins vs spec's product-of-sin-cos.
5. **Missing interactive features**: No checkpoint system, no sequence animation.

## Architecture Changes from Legacy

| Aspect | Legacy | Live |
|---|---|---|
| Script format | Vanilla JS class-based, `window.*` | `.gen.js` module with SCRIPT_CONFIG export |
| Rendering | WebGL primary, CPU fallback | CPU only (Worker offload via computePixels) |
| State | Module-level `let state = {...}` | Stateless — all state in params argument |
| Animation | Per-parameter speed/direction + sequence | Phase params in `animatableParams` list only |
| Preset format | Partial objects (same in both) | Partial objects |
| Output | Binary (threshold) | Greyscale (normalised) |

## Open Items (Ordered by Priority)

1. Add 18 missing UI parameters to their groups (Or2, wave_r2, prm1/2, phi_rm1/2, Ox1/2, wave_x1/2, pxm1/2, phi_xm1/2, Oy1/2, wave_y1/2, pym1/2, phi_ym1/2).
2. Rename underscore parameter keys to camelCase (phi_r1 → phiR1, etc.) across draw, computePixels, animatableParams, and all presets.
3. Expand LANDMARKS to full parameter maps (remove dependency on default-merging).
4. Clarify whether binary thresholding is to be restored or whether greyscale is the intended output; update spec accordingly.
5. Implement modulation formula per spec (product of sin × cos) or document the intentional divergence.
6. Implement or defer checkpoint/sequence animation.
7. Remove `console.log` at line 439.
8. Remove inert `canvasWidth`/`canvasHeight` parameters or implement host canvas resize support.
