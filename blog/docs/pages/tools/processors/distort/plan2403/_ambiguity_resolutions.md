# AMBIGUITY RESOLUTIONS — PLAN2403

**Authority:** Session 2026-03-31 user decisions. **SSoT** for Phase 7 items formerly listed as unresolved in `_implementation_plan.md`. Apply at module/registry/reference builds; do not re-litigate without new user decision.

| ID | TOPIC | DECISION |
| --- | --- | --- |
| A1 | PERLINOVERLAY type string | `noiseoverlay`. Display label: NOISE OVERLAY. Registry/CategoryPicker/rename when QUANTISE rebuild cycle touches NOISE category. |
| A2 | DELAUNAYMESH display | Display: TESSELLATION. Type string: prefer `tessellation` at rename moment; until rename, `delaunaymesh` code key remains with display override per UI contract. |
| A3 | QUANTISE dither set | Full set per `blog/docs/algorithms/image.md` §Dithering: 8 error-diffusion + 3 ordered + nearest-color (12 exposed modes incl. NONE or nearest as baseline per UI design). |
| A4 | MERGE feature depth | Full multi-stage / full review specs for each MERGE target — not MVP-first. |
| A5 | INTERFERENCE param | Rename IRIDESCENCE → **COUPLING STRENGTH** (same semantics: scales thickness→colour coupling). |
| A6 | LUMFLOW display | **LUMINANCE FLOW** canonical display; align CategoryPicker with `lumflow` type row. |
| A7 | VORONOI→TESSELLATION API | **Mode only**: TOPOLOGY dropdown on TESSELLATION module; `VoronoiDiagram2D` internal helper — **no** standalone field-bus export requirement for parity with this decision. |
| A8 | G4 blur | **Single BLUR module** with MODE: BOX \| GAUSSIAN \| MOTION \| RADIAL \| MEDIAN \| BILATERAL. **Cascade:** Phase 10 Tier D + module count; not applied until implementation programme. |
| A9 | INVERT COLOUR sub-mode | Under MODE COLOUR-only: sub-modes **HSL ROTATE** (hue +180° in HSL, preserve S/L) and **PER-CHANNEL** (255−v per RGB channel). |

**Non-action here:** `_implementation_plan.md` not rewritten by this file; downstream agent merges these rows into reference packs and registry when executing Phase 10.
