# B5 — Point cloud / Gaussian splat viewer

**Status**: TODO
**Priority**: P3
**Owner file(s)**: `assets/js/shared/components/three-d/SplatViewer.js` (to author)
**Blockers**: → B4
**Blocks**: —
**Last touched**: 2026-05-12

## Goal

Render a `.splat` / `.ply` point-cloud or Gaussian-splat asset inside any `Canvas` PCS.

## Done when

`SplatViewer` component lands; example page renders one splat asset; orbit/zoom work; passes component audit.

## Sub-tasks

- [ ] Survey splat libraries (e.g. `gsplat.js`, `@spectacles-vue/gaussian-splatting`, raw WebGL2 implementations).
- [ ] Decide loader: streaming vs whole-file.
- [ ] Author `SplatViewer` (extends `BaseComponent`; reuse `gpu-foundation.js` for GPU access).
- [ ] Register in `component-library.js`.
- [ ] Author component doc.
- [ ] Create demo page in `three_d_section.js`.
- [ ] Verify on low-end GPU; document min-spec.

## Notes / decisions

(append-only)

## References

- `assets/js/core/gpu-foundation.js` (mandatory owner of GPU access)
- B4 (shares the 3D component category)
