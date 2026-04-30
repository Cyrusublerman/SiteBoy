# Interference Figure — Issues and Conflicts

## ERROR

**[RESOLVED]** **[BUG] Generator Not Implemented (Stub)**
Full implementation present in `interference-figure.gen.js` v1.0.0: 10 OPD basis fields, 8 pattern families, CIE 1931 spectral integration, Physical and Stylised modes, fractal noise, multi-axis, Worker offload via `computePixels`.

**[RESOLVED]** **[BUG] sources Parameter Has No Effect**
Replaced with 26-parameter set across Pattern, Fields, Angular, Transform, Multi-Axis, Colour, and Noise groups.

---

## WARN

**[RESOLVED]** **[STANDARDS] No animation Block in SCRIPT_CONFIG**
`animation: { type: 'none' }` added.

**[RESOLVED]** **[STANDARDS] No export Block in SCRIPT_CONFIG**
`export: { png: true, gif: false, webm: false }` added. Note: SVG export specified in ui-layout.md is not implemented; per-pixel `putImageData` is incompatible with vector export (documented in KNOWN LIMITATIONS).

**[RESOLVED]** **[CONFLICT] Canvas Size Conflict (spec vs live)**
Canvas is now 420×420 per spec.

---

## NOTE

**[RESOLVED]** **[RESEARCH] CIE Colour Matching Functions Required**
31-element CIE 1931 2° CMF tables (`_XB`, `_YB`, `_ZB`) embedded at 400–700 nm, 10 nm steps. Source: CIE publication 15:2004 / Stiles & Burch (1959).

**[RESOLVED]** **[RESEARCH] OPD Field Specification**
10 OPD basis fields fully implemented: radial (r²), Archimedean spiral (r×θ×spiralRate/2π), angular harmonics sin(nθ) for n=2,4,6,8, saddle (u²−v²), square (max(|u|,|v|)²), wedge X/Y (|u|,|v|). Eight named pattern families with canonical weight vectors; patternMorph interpolates linearly between adjacent families.

**[RESOLVED]** **[RESEARCH] Pattern Morph Between Families**
Linear interpolation between `FAMILY_WEIGHTS[fi]` and `FAMILY_WEIGHTS[(fi+1)%8]` by `patternMorph`. Design decision documented; full list of 8 families in fixed order.

## Stale Documentation

**[STALE DOC] [DOC-039] — migration-log.md States Generator Not Implemented**

Migration log was written against the stub (v(none)). States "Generator is not implemented" with all 10 subsystems missing. Live source is v1.0.0 with full implementation (10 OPD basis fields, 8 pattern families, CIE 1931 CMF table, Physical and Stylised modes, fractal noise, multi-axis, Worker offload). Migration log must be rewritten to document the actual implementation.

---

**[STALE DOC] [DOC-040] — All Docs Written Against Stub/Spec**

All pack files (ui-layout.md, mechanisms.md, description.md, feature-parity.md, performance.md) were produced when the generator was a stub. They describe the spec intent (11 roadmap steps, 26 intended parameters). Full review of all docs against live v1.0.0 source required.

---

**[RESIDUAL] Polarisation factor (PHYS-010)**
Optional polarisation-angle modulation of interference intensity is not implemented. Modulation formula is partially specified in legacy spec ("not fully specified"); exclusion avoids undocumented behaviour. Documented in KNOWN LIMITATIONS.

---

## v4 turn log (2026-04-23)

- **GEN-019 (P1, WONTFIX):** Reference source is a placeholder stub; strict source parity against live implementation is not meaningful.
- **GEN-020 (P1, WONTFIX):** Reference single-parameter stub contract diverges from live 26-parameter implementation.
- **GEN-021 (P1, WONTFIX):** Reference minimal script skeleton diverges from live presets/worker/export/info architecture.
- **ARCH-024 (P1, FIXED):** Live interference-figure imports no modules from `assets/js/shared/` (`zero-shared-imports`).
- **DOC-037 (P2, FIXED):** `migration-log.md` updated to live v1.0.0 implementation state.
- **DOC-038 (P2, FIXED):** Generator docs synced away from stub-era status for the core pack files.
