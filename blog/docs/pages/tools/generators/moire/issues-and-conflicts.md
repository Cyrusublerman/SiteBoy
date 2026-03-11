# Moiré — Issues and Conflicts

## ERROR [BUG] — Triangle Mask SDF: const Declaration in switch Case + Incorrect Formula

**Location:** `computeMask`, `case 'triangle':` block (lines 105–108).

**Code:**
```javascript
case 'triangle':
    const ax = Math.abs(x);
    d = Math.max(ax * 0.866 + y * 0.5, -y) - 0.5;
    d = (d + 0.5) / 1;
    break;
```

**Issue 1 — Syntax:** `const ax` is declared inside a `switch` case without a bracing block. In non-strict mode, the `const` is scoped to the entire `switch` block and will throw a `SyntaxError: Identifier 'ax' has already been declared` if `computeMask` is called more than once with `type='triangle'` (since the const is in the switch block scope and cannot be re-declared). In strict mode this throws immediately.

**Fix:** Wrap the case body in a block: `case 'triangle': { const ax = ...; ... break; }`.

**Issue 2 — Formula:** `d = (d + 0.5) / 1` divides by 1, which is a no-op. The intent was likely a normalisation divisor (e.g., dividing by some scale factor), but the value 1 was left as a placeholder. The triangle SDF formula is incomplete and will produce incorrect masking. The expression `max(|x|·0.866 + y·0.5, −y) − 0.5` approximates one face of a downward-pointing equilateral triangle, but the full SDF requires all three half-planes: `max(|x|·0.866 + y·0.5, −y)`.

**Severity:** ERROR — the triangle mask path is syntactically broken in environments that enforce block scoping for `const`.

---

## WARN [STANDARDS] — Non-Standard Parameter Types: color, toggle, dropdown

**Location:** `SCRIPT_CONFIG.parameters` — `fgColor`/`bgColor` use `type: 'color'`, `invert` uses `type: 'toggle'`, `combineMode`/`maskType` use `type: 'dropdown'`.

**Rule:** `code-standards.md` §Parameter Types: standard types are `slider` and `radio`.

**Issue:** If the host's parameter renderer only handles `slider` and `radio`, these parameters will not render a UI control. The `color` type picker, `toggle` checkbox, and `dropdown` select may or may not be implemented in the host.

**Risk:** Medium — parameters silently fall back to their defaults if the host doesn't recognise the type.

---

## WARN [STANDARDS] — Inert canvasWidth / canvasHeight Parameters

**Location:** `SCRIPT_CONFIG.parameters` group "Canvas".

**Rule:** Parameters must affect rendered output when changed.

**Issue:** `draw` reads `canvas.width` and `canvas.height` directly, not `params.canvasWidth` or `params.canvasHeight`. Slider adjustments have no effect.

**Fix:** Remove the Canvas group or implement host canvas resize support.

---

## WARN [STANDARDS] — No animatableParams Declared

**Location:** `SCRIPT_CONFIG.animation`.

**Rule:** `code-standards.md` §Animation: generators with `type: 'infinite'` that have user-configurable animation speed must declare `animatableParams` to identify phase/speed parameters.

**Issue:** Animation is implicitly driven by `frame` inside `draw`. The host cannot identify which parameters control animation or display them prominently in the animation UI. `phaseSpeed`, `phaseOffset`, and `centreOsc` are animation-relevant parameters with no declaration.

**Fix:** Add `animatableParams: ['phaseOffset']` to the animation object (phaseOffset is the phase parameter swept by the animation).

---

## WARN [STANDARDS] — console.log in Production Export

**Location:** Line 514: `console.log('✅ Moiré Generator script loaded');`

**Fix:** Remove.

---

## WARN [PARITY] — angularModAmplitude Missing

**Location:** `SCRIPT_CONFIG.parameters` — not present.

**Legacy Spec:** The `angularModAmplitude` slider controls the amplitude of the angular modulation. In the live script, the angular grating is multiplied at fixed amplitude 1 whenever `angularFreq > 0`. There is no control over how strongly the angular modulation affects the radial pattern.

**Impact:** Reduced control over pattern character.

---

## WARN [PARITY] — maskRotation Missing

**Location:** `computeMask`, `SCRIPT_CONFIG.parameters`.

**Legacy Spec:** `maskRotation [0, 360]` slider rotates the mask shape. Not implemented in the live script; masks are always axis-aligned.

---

## WARN [PARITY] — Polygon Mask Replaced by Square

**Legacy Spec:** `maskType` options include 'polygon'. Live has 'square' instead. A regular polygon SDF with configurable sides was intended; the square (Chebyshev distance) is a fixed 4-sided approximation.

---

## WARN [PARITY] — WebGL Not Implemented

**Legacy Spec:** Primary rendering path is a WebGL fragment shader. Only CPU ImageData is implemented in the live script.

**Impact:** Performance at larger resolutions (1024×1024) may be insufficient at 30 FPS without a Worker path.

---

## NOTE [STANDARDS] — parseColor Called Every Frame

**Location:** `draw` — `parseColor(params.fgColor)` and `parseColor(params.bgColor)`.

**Issue:** Hex string parsing per frame is unnecessary if colours haven't changed. Not a correctness issue.

**Fix:** Cache parsed colour objects keyed by hex string; invalidate when params change.

---

## NOTE [STANDARDS] — weightA / weightB Sliders Capped at 1

**Location:** Multi-Centre group — `weightA` max=1, `weightB` max=1.

**Issue:** Weights > 1 would allow asymmetric amplification (centre A brighter than centre B). The cap at 1 prevents this and may limit pattern variation. Not a bug, but a deliberate design choice worth documenting.
