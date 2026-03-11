# Generator Maths Standards

Applies to the documentation of generator scripts, specifically to the `mechanisms.md` pack file. Every formula or mathematical operation in a generator source must be documented to the standards defined here. A `mechanisms.md` that contains no formulas when the source contains mathematical operations is incomplete.

---

## 1. Formula Notation

Write every non-trivial formula as an inline formula immediately followed by a definition block for every symbol.

**Format:**

```
**<Formula name>:**
`<formula in inline notation>`

where:
- `<symbol>` — <what it represents>, <unit or domain>
- `<symbol>` — <what it represents>, <unit or domain>
```

**Example — elastic collision impulse from fibonacci-balls.gen.js:**

**Elastic collision impulse:**
`j = dvn × (1 + e) / (1/m₁ + 1/m₂)`

where:
- `j` — scalar impulse magnitude applied along the collision normal (pixel²·frame⁻¹ units, dimensionally consistent with the proxy mass definition)
- `dvn` — relative normal velocity: `(c1.vx − c2.vx)·nx + (c1.vy − c2.vy)·ny`; positive means the circles are approaching
- `e` — restitution coefficient (dimensionless, range 0–1); from `params.restitution`; 1 = perfectly elastic, 0 = perfectly inelastic
- `m₁ = r₁²`, `m₂ = r₂²` — proxy masses defined as radius squared (dimensionless, proportional to circle area)
- `nx, ny` — unit vector from c1 to c2 along the line of centres: `(c2.x − c1.x) / d, (c2.y − c1.y) / d`

**Velocity update:** `c1.vx −= (j/m₁)·nx`, `c1.vy −= (j/m₁)·ny` and `c2.vx += (j/m₂)·nx`, `c2.vy += (j/m₂)·ny`.

---

## 2. When a Formula Is Required

A formula is required whenever the source code performs a non-trivial mathematical operation. Use the following criteria:

**Always document:**
- Trigonometric expressions (`Math.sin`, `Math.cos`, `Math.atan2`) with their geometric meaning
- Parametric equations that define the visual output (e.g. `x = A·sin(ω₁t + δ)`, `y = B·sin(ω₂t)` for Lissajous)
- Physics update rules (velocity, position, force, impulse)
- Normalisation and modular arithmetic used for colour or angle: `h = ((h + shift) % 360 + 360) % 360`
- Distance and geometry operations that are not standard library calls
- Any weighted sum, interpolation, or blending formula

**One-liners that can be described in prose (no separate formula block required):**
- `Math.sqrt(dx*dx + dy*dy)` — Euclidean distance, universally understood; note it in the function inventory table but do not require a formula block
- `Math.max(0, x)` — floor clamp; prose is sufficient
- Simple linear scaling: `value / maxValue` — prose is sufficient

When in doubt, write the formula. Over-documentation is preferable to under-documentation.

---

## 3. Variable Definition Requirements

Every symbol that appears in a formula must be defined immediately after the formula. Definitions must state:

1. **What it represents physically or geometrically.** "The angle" is insufficient. "The polar angle of the position vector from the origin to the particle, in radians" is required.

2. **Its unit or domain.** Examples:
   - `radians`, `degrees` (convert if the source mixes degrees and radians)
   - `pixels` (for positions and distances in canvas space)
   - `pixels per frame` (for velocities)
   - `dimensionless, range 0–1` (for normalised quantities)
   - `integer, range [0, n)` (for indices)

3. **Its source.** Is it a `params.*` value? A `this.*` state variable? A computed intermediate? Name it.

---

## 4. Mathematical Model Classification

Every generator's `mechanisms.md` must state, in the opening section or as a header, the class of mathematics the generator uses. This provides orientation before the detailed sections.

**Classification examples:**

| Generator type | Model class |
| --- | --- |
| Lissajous curves | Parametric equations (Lissajous figures: bivariate sinusoids) |
| Fibonacci balls | Newtonian particle physics with elastic collision and circle packing geometry |
| Solar system | Keplerian orbital mechanics with logarithmic distance compression |
| Wave interference | Linear wave superposition (2D scalar field) |
| Cymatics | Discrete approximation of Chladni patterns via standing wave nodal lines |
| Reaction diffusion | Coupled partial differential equations (Gray-Scott model, discretised) |
| Moiré | Geometric interference of periodic line patterns |
| Torus | Parametric surface (toroidal coordinates projected to 2D or 3D) |
| Generative pattern | Procedural rule-based tiling (heuristic) |

If the generator is purely heuristic (no named mathematical basis), state: "This generator uses heuristic drawing rules with no named mathematical model."

---

## 5. Complexity Notation

State algorithmic complexity in Big-O notation for every loop or recursive operation. Define `n` explicitly — it is never obvious.

**Format:** `O(f(n)) where n = <what n is>`

**Examples:**

- `O(n²) where n = number of packed circles` — double loop over circle pairs
- `O(n × collisionPasses) where n = number of circles` — bounded by a parameter
- `O(w × h) where w, h = canvas width and height in pixels` — per-pixel operation
- `O(1)` — constant-time operation (distance check, single formula evaluation)

When a loop is bounded by a parameter (e.g. `collisionPasses`), state the complexity as a product: `O(n² × collisionPasses)`. This makes the performance impact of the parameter explicit.

---

## 6. Floating-Point Precision Notes

Note any operation where precision loss is a realistic concern:

**Precision risks to document:**
- Modular arithmetic on accumulated values: `hue = (hue + shift) % 360` — if `hue` grows very large before the modulo, floating-point precision degrades. Note if the generator bounds or resets the accumulated value.
- Summing many small values: can accumulate error. Note if the sum is used in a precision-sensitive comparison.
- Subtraction of nearly-equal large values: catastrophic cancellation. Rare in generators but flag if present.
- Integer index arithmetic that could overflow: unlikely in JS (Number is 64-bit float), but flag if indices are computed from large Fibonacci numbers.

**Format for precision notes:**

```
**Precision note:** `hue` is accumulated via modular addition every frame.
At 60 fps after 60 seconds (3600 frames), hue has been shifted 3600 times.
The generator uses `((hue + shift) % 360 + 360) % 360` which is correct and
does not accumulate error because the modulo resets the range every cycle.
```

If no precision risks exist, a brief statement is still required: "No precision risks identified in this generator."

---

## 7. When to Escalate a Formula to the Algorithm Library

A formula or algorithm in a generator script is a candidate for escalation to `assets/js/shared/algorithms/` when:

1. It is used in more than one generator (or is likely to be)
2. It is non-trivial (more than a one-liner)
3. It can be parameterised and called as a standalone function
4. It has a name in the field (it is a known algorithm, not a bespoke hack)

**Examples of escalation candidates:**
- Fibonacci sequence generation: `_fibSeq(n)` — generic, used anywhere Fibonacci numbers are needed
- Front-chain circle packing: `_packFrontChain(radii, indices, size)` — a known algorithm (Descartes circle theorem / Apollonius packing)
- Apollonius tangent point computation: `_tangentToTwo(c1, c2, r)` — general computational geometry
- Elastic impulse computation — general physics utility

**Escalation record format** (in `issues-and-conflicts.md`):

```
[NOTE] [ESCALATION] Algorithm candidate: <name>
Location: <function name> in <source file>
Description: <what it computes, one sentence>
Candidate library location: assets/js/shared/algorithms/<module>/<file>.js
Reason: non-trivial, named algorithm, likely reusable
```

Escalation does not block documentation or implementation. Flag and continue.
