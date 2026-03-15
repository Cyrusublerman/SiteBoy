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

## NOTE

**[STANDARDS] — parseColor Called Every Frame**

`parseColor(params.fgColor)` and `parseColor(params.bgColor)` still called each draw. Hex string parsing when colours are unchanged is redundant but not a correctness issue.

---

**[STANDARDS] — weightA / weightB Sliders Capped at 1**

`weightA` max=1, `weightB` max=1. Prevents asymmetric amplification; deliberate design choice, now documented in infoSections KNOWN LIMITATIONS.
