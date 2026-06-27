# D3 — Generator compliance audit

**Status**: DONE
**Priority**: P2
**Owner file(s)**: `.cursor/skills/page-compliance-audit/`
**Blockers**: → D1
**Blocks**: —
**Last touched**: 2026-06-18

## Goal

Every shipped generator passes the page-compliance-audit skill with zero hard-gate FAIL.

## Done when

A single audit pass report is committed showing PASS for every `.gen.js` in `assets/js/tools/generators/scripts/`.

## Sub-tasks

- [x] Run audit on each of the 23 currently shipped scripts.
- [x] Triage results: fix FAILs as their own todo rows (or sub-tasks of D1 if not yet shipped).
- [x] For p5 generators specifically, verify `p5-generator-standards.md §9` forbidden patterns and frame-purity rule.
- [x] Verify no `requestAnimationFrame` / `setInterval` outside AnimationFoundation.
- [x] Verify VGA palette compliance in canvas output where rendering is "UI"-class (per `design-law.md §6.2`).

## Notes / decisions

- Pass 2 (2026-06-08): host `canvas.p5Renderer`; defecated frame timing; tile-mosaic offset shadow; solar-system F HUD; wave-synth DOM removed.
- **solar-system celestial colours**: intentional scientific palette in `PLANET_DATA`/`MOON_DATA` — grep RAW-COLOUR on data lines is NOTE, not FAIL (user confirmed).

## References

- `.cursor/skills/page-compliance-audit/SKILL.md`
- `blog/docs/guides/standards/p5-generator-standards.md`
- `blog/docs/temp/generator-compliance-audit.md`
