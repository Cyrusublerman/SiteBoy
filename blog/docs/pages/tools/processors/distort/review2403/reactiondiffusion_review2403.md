# REACTION DIFFUSION — Review 2403

- type: `reactiondiffusion`
- category: PHYSICS
- isVector: false
- verdict: KEEP — major simulation architecture upgrade required
- priority: HIGH
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Runs an iterative reaction-diffusion simulation (Gray-Scott style) and renders the resulting chemical field over the image | — |
| 1.2 | Visually distinct from all other modules? | YES — iterative dynamical simulation is unique | — |
| 1.3 | Verdict | KEEP — full simulation architecture upgrade required | — |

## Current Implementation

Preset selector (Mitosis, Coral, Spots, Maze, Worms, Solitons, Pulsating, Chaos), step count, seed size. Too reduced for a simulation of this class.

## Issues

```
[ERROR] [PARITY] Module lacks image-responsive simulation — no image-driven seeding, parameter fields, or forcing
Location: nodes/reactiondiffusion — full implementation
Evidence: Image data does not influence simulation state at any stage. Simulation evolves independently of the source image.
Impact: Module cannot produce image-specific morphology. Output is a generic simulation overlay, not an image-reactive effect.
```

```
[ERROR] [PARITY] No stepping control — warmup steps, steps-per-frame, and freeze/evolve mode absent
Location: nodes/reactiondiffusion — simulation control
Evidence: Only a flat step count is exposed. Cannot separate initial warmup from continuous evolution or control how many simulation steps map to each display frame.
Impact: Simulation is either underdeveloped, runs too long, or cannot be held in a stable mature state.
```

```
[ERROR] [PARITY] No output mapping controls — simulation field is not legibly rendered
Location: nodes/reactiondiffusion — output stage
Evidence: No output mode, colour ramp, normalisation, or contrast control. Raw chemical fields are not always visually useful without mapping.
Impact: Output may be illegible or aesthetically unusable.
```

```
[WARN] [PARITY] Presets are labels only — no spatial preset blending or image-driven parameter families
Location: nodes/reactiondiffusion — preset system
Evidence: Presets select one morphology family globally. Cannot blend between families spatially based on image properties.
Impact: Limited creative variation from presets alone.
```

## Required Upgrade Specification

### Core Design Principle

The module is a **simulation system**, not a filter. Three things must be explicitly controlled and separated:

1. **Simulation stepping** — how many steps, how fast, when to stop
2. **Frame display** — what step state maps to the visible frame
3. **Output baking / caching** — avoiding rerunning the simulation unnecessarily

### Four Image-Influence Stages

| Stage | Mechanism | Priority |
|---|---|---|
| 1. Initial seeding | Image determines starting chemical distribution | HIGH — safest first implementation |
| 2. Local parameter fields | Image drives feed/kill/diffusion spatially | HIGH — most important upgrade |
| 3. Ongoing forcing/injection | Image continuously perturbs simulation state | MEDIUM — advanced mode |
| 4. Render mapping | Simulation output modifies image via mask/displacement/colour | HIGH |

---

### Six-Layer Target Architecture

```
Layer 1: Initialisation
Layer 2: Parameter Fields
Layer 3: Simulation Engine
Layer 4: Stepping Control
Layer 5: Output Mapping
Layer 6: Compositing
```

---

### Layer 1 — Initialisation

| Param | Notes |
|---|---|
| PRESET | Mitosis / Coral / Spots / Maze / Worms / Solitons / Pulsating / Chaos |
| SEED MODE | RANDOM / LUMINANCE / THRESHOLDED LUMINANCE / EDGE / COLOUR-CLASS / REGION / RANDOM-BIASED |
| SEED SOURCE | What image property drives seeding |
| SEED THRESHOLD | Luminance cutoff for thresholded seeding |
| SEED SIZE | Current param — retain |
| SEED DENSITY | Density of seeded points |
| SEED RANDOMNESS | Stochastic variation in seed placement |
| IMAGE SEED STRENGTH | How strongly image biases seed placement vs pure random |

---

### Layer 2 — Parameter Fields

Global params with optional image-driven overrides:

| Param | Notes |
|---|---|
| FEED | Global feed rate |
| KILL | Global kill rate |
| DIFFUSION A | Global diffusion of chemical A |
| DIFFUSION B | Global diffusion of chemical B |
| FEED DRIVER | Image field → local feed override |
| KILL DRIVER | Image field → local kill override |
| DIFFUSION A DRIVER | Image field → local diffusion A |
| DIFFUSION B DRIVER | Image field → local diffusion B |

**Image-derived driver sources for all parameter fields:**
LUMINANCE / RED / GREEN / BLUE / HUE / SATURATION / GRADIENT MAGNITUDE / GRADIENT ANGLE / LOCAL CONTRAST / EDGE MAP / **DISTANCE TO EDGE** (first-class) / POSITION X/Y / RADIAL DISTANCE

**Recommended first image → parameter mappings:**
- LUMINANCE → FEED (bright = higher feed)
- LUMINANCE → KILL (dark = different kill regime)
- DISTANCE TO EDGE → parameter gradient (smooth morphology transition from structure)
- SATURATION → DIFFUSION B (vivid regions allow faster chemical B spread)

**Future:** PRESET BLEND DRIVER — image properties select or interpolate between preset parameter families spatially (e.g. bright = coral, dark = worms).

---

### Layer 3 — Simulation Engine

| Param | Notes |
|---|---|
| SIMULATION RESOLUTION | Internal resolution (lower = faster + larger patterns; higher = finer detail) |
| BOUNDARY MODE | Wrap / Clamp / Mirror |
| ANISOTROPY | Directional diffusion weighting (future) |
| NOISE INJECTION | Ongoing stochastic perturbation strength (future) |

**Ongoing Injection (advanced mode):**

| Param | Notes |
|---|---|
| INJECTION STRENGTH | How strongly image pushes simulation each step |
| INJECTION MODE | ADDITIVE / REPLACE / BIAS / THRESHOLDED PULSE |
| INJECTION INTERVAL | EVERY STEP / EVERY N STEPS / FRAME BOUNDARIES ONLY |

---

### Layer 4 — Stepping Control

| Param | Notes |
|---|---|
| INITIAL WARMUP STEPS | Steps run before first visible frame |
| STEPS PER FRAME | Simulation iterations per display frame |
| MAX STEPS | Hard cap for auto-settle |
| AUTO-SETTLE | Run until convergence threshold met |
| CONVERGENCE THRESHOLD | Average per-step change below which evolution pauses |
| PAUSE WHEN SETTLED | Stop evolution when converged |
| RETAIN STATE | Continue evolution when animating (G9 FRAME param drives time) |
| RESET ON PARAMETER CHANGE | Restart simulation when params change |
| WARMUP PRESET | FAST / MEDIUM / MATURE / FULLY DEVELOPED (human-readable step-count presets) |
| BAKE STATE | Cache mature simulation state — downstream modules do not rerun it |
| FRAME | Time/frame param for animation system (global — tracked in `_global_issues.md` G9) |

**Three animation modes (explicit MODE selection):**
1. STATIC MATURE — run N warmup steps, freeze
2. CONTINUOUS — evolve every frame via STEPS PER FRAME
3. FRAME-DRIVEN — seed/parameter drift linked to frame number

---

### Layer 5 — Output Mapping

| Param | Notes |
|---|---|
| OUTPUT MODE | A / B / A-B / ABSOLUTE DIFFERENCE / THRESHOLDED STATE / GRADIENT OF STATE |
| NORMALISE OUTPUT | Map to predictable display range |
| CONTRAST / GAIN | Expand output range |
| THRESHOLD | Convert to binary/semi-binary |
| MIN COLOUR | Colour for minimum mapped value |
| MAX COLOUR | Colour for maximum mapped value |
| COLOUR RAMP SOURCE | Which output signal drives ramp |

**Render-time image modification modes (simulation as mask/field):**
- Simulation output as image overlay
- Simulation output as displacement mask
- Simulation output as colour partition
- Simulation distance field as blur/sharpen guide
- Simulation state as driver for halftone, pattern, or other modules

---

### Layer 6 — Compositing

| Param | Notes |
|---|---|
| OPACITY | Standard |
| BLEND MODE | Standard |

---

## Action Items

1. **[HIGH PRIORITY]** Implement image-driven parameter fields: FEED DRIVER, KILL DRIVER, DIFFUSION A/B DRIVER from image-derived fields.
2. **[HIGH PRIORITY]** Implement SEED MODE with image-linked seeding options: luminance, thresholded luminance, edge, random-biased.
3. **[HIGH PRIORITY]** Separate INITIAL WARMUP STEPS from STEPS PER FRAME. Add WARMUP PRESET (Fast/Medium/Mature/Fully Developed).
4. **[HIGH PRIORITY]** Add FREEZE vs CONTINUOUS vs FRAME-DRIVEN animation mode.
5. **[HIGH PRIORITY]** Implement output mapping: OUTPUT MODE, NORMALISE, CONTRAST, MIN/MAX COLOUR ramp.
6. Add SIMULATION RESOLUTION param for preview vs final-quality tradeoff.
7. Add BAKE STATE to cache mature simulation for pipeline efficiency.
8. Add FRAME param (global — tracked in `_global_issues.md` G9).
9. Add AUTO-SETTLE / CONVERGENCE THRESHOLD for self-regulating step count.
10. Add PRESET BLEND DRIVER (future — image-driven spatial preset interpolation).
11. Fix +D driver button (global — tracked in `_global_issues.md` G1).
12. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
13. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
14. Add unit labels to all numeric params (global — tracked in `_global_issues.md` G16).
15. Ensure all heavy computation runs in web worker (global — tracked in `_global_issues.md` G12).
