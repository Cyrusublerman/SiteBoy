# Interference Figure — Issues and Conflicts

## ERROR [BUG] — Generator Not Implemented (Stub)

**Location:** `assets/js/tools/generators/scripts/other/interference-figure.gen.js` — entire file.

**Issue:** Live script is a placeholder. The `draw` function fills the canvas black. `sources` parameter is not read. Source file referenced in TODO comment does not exist.

**Impact:** Catastrophic — generator produces no output.

**Required action:** Full implementation: OPD basis fields, spectral interference model, CIE colour conversion, tone mapping.

---

## ERROR [BUG] — sources Parameter Has No Effect

**Location:** `SCRIPT_CONFIG.parameters` — `sources` slider; `draw` — ignores params.

---

## WARN [STANDARDS] — No animation Block in SCRIPT_CONFIG

**Fix:** Add `animation: { type: 'none' }`.

---

## WARN [STANDARDS] — No export Block in SCRIPT_CONFIG

**Fix:** Add `export: { png: true, svg: true }` per spec.

---

## WARN [CONFLICT] — Canvas Size Conflict (spec vs live)

**Spec:** 420×420. **Live:** 800×800. Resolve to spec dimensions when implementing.

---

## NOTE [RESEARCH] — CIE Colour Matching Functions Required

Spectral-to-RGB conversion requires the CIE 1931 2° standard observer colour matching functions `x̄(λ)`, `ȳ(λ)`, `z̄(λ)` tabulated at suitable wavelength intervals. A 31-element (400–700 nm, 10 nm step) lookup table is the standard minimum. This table must be embedded in the script or imported.

---

## NOTE [RESEARCH] — OPD Field Specification

The audit lists 5 PHYS modules (PHYS-006 to PHYS-010) as HIGH priority research gaps. The OPD basis field specification (radial, spiral, angular harmonics, saddle, wedge, square) is defined in the spec but implementation detail is absent from both legacy documents. Reference: Born & Wolf, "Principles of Optics", chapter on conoscopic interference figures.

---

## NOTE [RESEARCH] — Pattern Morph Between Families

`patternMorph [0, 1]` interpolates between pattern families. The interpolation space (linear in field weights? nonlinear?) is unspecified. Requires design decision when implementing.
