# Interference Figure — Migration Log

## Pack Generated

Date: 2026-03-10
Source analysed: `assets/js/tools/generators/scripts/other/interference-figure.gen.js` v(none — stub)
Legacy docs: `interference-figure-spec.md` (mixed bundle), `interference-figure-audit.md` (audit only)

## Summary of Migration State

**Generator is not implemented.** Both live and archive sources are identical stubs. All 10 required subsystems (per audit) are missing.

## Architecture Gap Summary

| Step | Subsystem | Module | Status |
|---|---|---|---|
| 1 | Normalised coordinate grid | GEO-026 | Missing |
| 2 | Polar transform | GEO-027 | Missing |
| 3 | OPD basis fields | PHYS-006 | Missing |
| 4 | Fractal noise | PAT-017 | Missing |
| 5 | OPD perturbation | PHYS-007 | Missing |
| 6 | Phase retardation | PHYS-008 | Missing |
| 7 | Interference intensity | PHYS-009 | Missing |
| 8 | Polarisation factor | PHYS-010 | Missing |
| 9 | Spectral to RGB | COLOR-009 | Missing |
| 10 | Tone mapper | COLOR-010 | Missing |

## Implementation Roadmap

1. Embed CIE 1931 CMF table (31 wavelengths, 400–700 nm) — HIGH priority prerequisite.
2. Implement OPD basis fields with all 10 components (PHYS-006) — HIGH priority.
3. Implement `sin²(Δ/2)` intensity per wavelength (PHYS-008, PHYS-009).
4. Implement spectral-to-XYZ-to-RGB conversion (COLOR-009).
5. Implement tone mapper with exposure/gamma (COLOR-010).
6. Implement fractal noise (PAT-017) — MEDIUM priority.
7. Implement OPD perturbation (PHYS-007).
8. Implement polarisation factor (PHYS-010) — MEDIUM priority.
9. Implement coordinate system and polar transform (GEO-026, GEO-027).
10. Build full SCRIPT_CONFIG with all 26 parameters, 6 presets, `animation: { type: 'none' }`, export block.
11. Resolve canvas size: adopt 420×420 per spec.
