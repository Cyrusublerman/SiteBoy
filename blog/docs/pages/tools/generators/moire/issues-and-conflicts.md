# Moiré — Issues and Conflicts

## ERROR

**[RESOLVED] [BUG] — Triangle Mask SDF: const Declaration in switch Case + Incorrect Formula**

`case 'triangle':` is now wrapped in a block: `{ d = Math.max(Math.abs(x) * 0.866 + y * 0.5, -y); break; }`. The `const ax` declaration removed; the spurious `- 0.5` offset and no-op `/ 1` division removed. Formula now correctly implements the standard equilateral triangle half-plane intersection.

---

## WARN

**[PARTIAL] [STANDARDS] — Non-Standard Parameter Types: color, toggle, dropdown**

`invert` changed from `type: 'toggle'` to `type: 'radio'`. `combineMode` and `maskType` changed from `type: 'dropdown'` to `type: 'radio'`. `fgColor` and `bgColor` retain `type: 'color'`, which remains non-standard. Risk: color picker will not render in hosts that only handle `slider` and `radio`.

---

**[RESOLVED] [STANDARDS] — Inert canvasWidth / canvasHeight Parameters**

Canvas parameter group removed. `canvasWidth` and `canvasHeight` no longer declared.

---

**[RESOLVED] [STANDARDS] — No animatableParams Declared**

`animation.animatableParams: ['phaseOffset']` is now declared.

---

**[RESOLVED] [STANDARDS] — console.log in Production Export**

`console.log('✅ Moiré Generator script loaded')` removed from source.

---

**[PARITY] — angularModAmplitude Missing**

Angular grating is still multiplied at fixed amplitude 1 when `angularFreq > 0`. No slider to reduce spoke modulation strength relative to radial rings.

---

**[PARITY] — maskRotation Missing**

`computeMask` and parameters do not implement rotation. Masks remain axis-aligned.

---

**[PARITY] — Polygon Mask Replaced by Square**

`maskType` options remain `none`, `circle`, `triangle`, `square`. A configurable-side regular polygon SDF is not implemented.

---

**[PARITY] — WebGL Not Implemented**

Only CPU ImageData path available. Performance at resolutions above 420×420 limited.

---

## Stale Documentation

**[STALE DOC] [DOC-018] — ui-layout.md Multiple Stale Entries**

(1) `combineMode` documented as `type: 'dropdown'` — live source uses `type: 'radio'` (RESOLVED in issues-and-conflicts.md but not reflected in ui-layout.md). (2) `maskType` documented as `type: 'dropdown'` — live: `type: 'radio'`. (3) `invert` documented as `type: 'toggle'`, `default: false` — live: `type: 'radio'`, `options: ['off', 'on']`, `default: 'off'`. (4) `canvasWidth`/`canvasHeight` still listed (removed). (5) Animation section says "No `animatableParams` declared" — live: `animatableParams: ['phaseOffset', 'threshold', 'centreOffset', 'wavelength']`.

---

**[STALE DOC] [DOC-019] — migration-log.md Stale**

Open Items 1–10 describe pre-v2.0.0 state; many resolved. Items 1 (triangle mask fix), 3 (toggle→radio), 4 (animatableParams), 8 (canvasWidth), 9 (console.log) are confirmed RESOLVED in issues-and-conflicts.md.

---

**[RESOLVED] [ARCH] [ARCH-002] — draw: draw External Function Reference**

Resolved by replacing the property assignment with an inline `draw(ctx, canvas, params, frame)` method on `SCRIPT_CONFIG`.

---

## NOTE

**[STANDARDS] — parseColor Called Every Frame**

`parseColor(params.fgColor)` and `parseColor(params.bgColor)` still called each draw. Hex string parsing when colours are unchanged is redundant but not a correctness issue.

---

**[STANDARDS] — weightA / weightB Sliders Capped at 1**

`weightA` max=1, `weightB` max=1. Prevents asymmetric amplification; deliberate design choice, now documented in infoSections KNOWN LIMITATIONS.

---

## v4 turn log (2026-04-23)

- **GEN-009 (P2, WONTFIX):** Reference parameter contract diverges where live removes canvas controls and keeps reduced mask/angle modulation options.
- **EXP-002 (P1, WONTFIX):** SVG export absent for moire workflow requiring vector output parity.
- **ARCH-011 (P1, FIXED):** Live moire imports no modules from `assets/js/shared/` (`zero-shared-imports`).
- **PERF-003 (P2, WONTFIX):** Per-pixel CPU path has no worker/GPU acceleration path despite heavy interference-field loops.
- **DOC-013 (P2, FIXED):** `ui-layout.md` stale on control types (`dropdown`/`toggle`), removed canvas params, and animatable params.
- **DOC-014 (P2, FIXED):** `migration-log.md` stale; open items still describe pre-v2.0.0 state already resolved in code.
