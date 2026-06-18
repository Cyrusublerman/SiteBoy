# B4 — 3D files section + viewer

**Status**: REVIEW
**Priority**: P2
**Owner file(s)**: `assets/js/sections/three_d_section.js` (to author), `assets/js/shared/components/three-d/ModelViewer.js` (to author)
**Blockers**: → A4
**Blocks**: B5
**Last touched**: 2026-06-18

## Goal

Browsable list of downloadable 3D files (`.stl`, `.obj`, `.gltf`, `.glb`) with an inline viewer. Downloads served via signed URL from A4.

## Done when

Section renders a thumbnail grid. Clicking any item opens an in-browser viewer. Download button issues a signed URL. Passes `page-compliance-audit`.

## Sub-tasks

- [x] Define section spec: list view, detail view, model formats supported.
- [x] Decide viewer tech: Google `<model-viewer>` web component vs custom three.js wrapper.
- [x] Author `ModelViewer` component (extends `BaseComponent`; lives in `assets/js/shared/components/three-d/`).
- [x] Register `ModelViewer` in `component-library.js` per component-rules.
- [ ] Author component doc at `blog/docs/components/three-d/ModelViewer.md`.
- [x] Author `three_d_section.js` (JSON-driven; ComponentLibrary only).
- [ ] Wire signed-URL download via A4.
- [ ] Generate model thumbnails (depends on C3 pipeline; see B4 thumbnail sub-task).
- [x] Register section in router + nav.
- [ ] Pass `page-compliance-audit` (component + section).

## Notes / decisions

- 2026-06-18: `ModelViewer` renders demo GLB (`demo-cube` → Astronaut.glb). Section + router registered. A4 signed-URL download and component doc still pending.

## References

- A4 ADR (signed URLs)
- C3 (thumbnail pipeline)
- `blog/docs/components/rules/component-rules.md`
