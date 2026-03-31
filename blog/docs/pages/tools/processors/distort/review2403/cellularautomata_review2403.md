# CELLULAR AUTOMATA — Review 2403

- type: `cellularautomata`
- category: PHYSICS
- isVector: false
- verdict: KEEP — rebuild as full stateful rule-based simulation system
- priority: HIGH
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Runs a cellular automaton simulation (binary rules: Life, HighLife, Seeds, DayNight, Maze, Anneal) seeded from image threshold, then blends result over the image | — |
| 1.2 | Visually distinct from all other modules? | PARTIALLY — overlaps with thresholding, dithering, and pattern overlays if it remains a simple static threshold + CA overlay | WARN |
| 1.3 | Verdict | KEEP — must be a full iterative rule-based simulation with image coupling to justify distinct existence | — |

## Critical Distinction

Distinct from static overlays because:
- Cells have **memory** — state depends on prior state
- Evolution is **rule-dependent** — same image, different rule, radically different result
- Can produce **stable, oscillatory, chaotic, or propagative** behaviour
- Many steps required for mature structure

The module's value is in **discrete state evolution** and **emergent cellular morphology from image structure**.

## Current Implementation

Presets: Life, HighLife, Seeds, DayNight, Maze, Anneal. Step count, init threshold. Valid foundation — severely under-developed.

## Issues

```
[ERROR] [PARITY] No image coupling — initialisation only uses threshold; no image-driven rule fields or forcing
Location: nodes/cellularautomata — full implementation
Evidence: Image only sets initial alive/dead via threshold. No image-driven birth/survival fields, no ongoing forcing, no image-responsive rule variation.
Impact: Simulation evolves independently of image content after seeding.
```

```
[ERROR] [PARITY] No stepping control — warmup/steps-per-frame/freeze absent
Location: nodes/cellularautomata — simulation control
Evidence: Only flat step count exposed. Cannot separate warmup from continuous evolution or control display frame mapping.
Impact: Cannot reach mature stable states reliably; no animation control.
```

```
[ERROR] [PARITY] Output is binary alive/dead overlay only — no derived fields or colour mapping
Location: nodes/cellularautomata — output stage
Evidence: No age map, birth/death events, change rate, distance-to-active, or colour ramp.
Impact: Output is visually limited; derived fields that would make CA useful in a pipeline are absent.
```

```
[WARN] [PARITY] Rule system is named presets only — no custom birth/survival set definition
Location: nodes/cellularautomata — rule params
Evidence: Cannot define custom outer-totalistic rules (e.g. B3/S23 notation). Neighbourhood type and boundary mode not exposed.
Impact: Cannot explore CA space beyond six named presets.
```

## Required Upgrade Specification

### Six-Layer Target Architecture

```
Layer 1: State Initialisation
Layer 2: Rule System
Layer 3: Simulation Stepping
Layer 4: Image Coupling
Layer 5: Output Fields + Mapping
Layer 6: Image Modification + Compositing
```

---

### Layer 1 — State Initialisation

| Param | Notes |
|---|---|
| INIT MODE | RANDOM / THRESHOLDED IMAGE / BAND IMAGE / EDGE SEED / DISTANCE SEED / NOISE SEED / REGION SEED / POINT/LINE/MASK SEED |
| INIT SOURCE | IMAGE / NOISE / RANDOM / MASK / EDGE MAP / DISTANCE MAP |
| INIT METRIC | LUMINANCE / HUE / SATURATION / RED / GREEN / BLUE / GRADIENT MAGNITUDE / DISTANCE TO EDGE |
| INIT THRESHOLD | Activation cutoff |
| INIT SOFTNESS | Hard vs probabilistic seeding |
| INIT DENSITY | Useful for random modes |
| SEED JITTER | Stochastic irregularity |
| INVERT INIT | Swap active/inactive mapping |

---

### Layer 2 — Rule System

| Param | Notes |
|---|---|
| RULE PRESET | LIFE / HIGHLIFE / SEEDS / DAYNIGHT / MAZE / ANNEAL / CUSTOM |
| BIRTH SET | Custom rule birth conditions (B notation) |
| SURVIVAL SET | Custom rule survival conditions (S notation) |
| NEIGHBOURHOOD | MOORE / VON NEUMANN / EXTENDED |
| BOUNDARY MODE | WRAP / CLAMP / REFLECT / ABSORB |
| STATE COUNT | Binary (current); multi-state future |

---

### Layer 3 — Simulation Stepping

| Param | Notes |
|---|---|
| INITIAL WARMUP STEPS | Steps run before first display |
| STEPS PER FRAME | Updates per visible frame |
| MAX STEPS | Hard cap |
| RETAIN STATE | Continue evolving over time |
| RESET ON CHANGE | Restart when params change |
| FREEZE | Hold current state |
| AUTO-STOP | Halt when population/change falls below threshold |
| RESOLUTION | Internal simulation resolution |
| FRAME | Time/animation param (G9) |
| MODE | STATIC MATURE / CONTINUOUS EVOLUTION / FRAME-DRIVEN REINITIALISATION |

---

### Layer 4 — Image Coupling

**Four distinct stages where image influences CA:**

| Stage | Mechanism | Priority |
|---|---|---|
| A. Initial state | Image determines starting alive/dead distribution | HIGH — best first |
| B. Local rule fields | Image drives birth/survival bias spatially | HIGH — most powerful long-term |
| C. Ongoing forcing | Image continuously injects/suppresses cell states | MEDIUM — advanced |
| D. Output → image | CA field modifies image via mask/partition/displacement | HIGH |

**Image-driven rule variation (B — most important long-term):**

| Param | Notes |
|---|---|
| RULE DRIVER SOURCE | Image field that selects/blends rule families spatially |
| BIRTH BIAS DRIVER | Image field modifies local birth probability |
| SURVIVAL BIAS DRIVER | Image field modifies local survival probability |
| NEIGHBOURHOOD BIAS | Image changes effective neighbourhood weighting |
| PRESET FIELD | Different image regions use different rule presets |

**Ongoing forcing:**

| Param | Notes |
|---|---|
| FORCE SOURCE | Image field / mask |
| FORCE STRENGTH | |
| FORCE INTERVAL | EVERY STEP / EVERY N STEPS / FRAME BOUNDARY |
| FORCE MODE | ADD ALIVE / KILL CELLS / BIAS BIRTH / BIAS SURVIVAL / REPLACE STATE |

**Image-derived fields usable as drivers:**
LUMINANCE / RED / GREEN / BLUE / HUE / SATURATION / GRADIENT MAGNITUDE / GRADIENT ANGLE / LOCAL CONTRAST / EDGE MAP / **DISTANCE TO EDGE** (first-class) / POSITION X/Y / RADIAL DISTANCE

---

### Layer 5 — Output Fields + Mapping

**Derived output fields:**

| Field | Notes |
|---|---|
| ALIVE STATE | Basic active/inactive (current only output) |
| CELL AGE | How long a cell has remained alive |
| BIRTH MAP | Where cells were recently born |
| DEATH MAP | Where cells recently died |
| CHANGE RATE | How dynamic each area is |
| NEIGHBOUR COUNT | Local density field |
| **DISTANCE TO ACTIVE CELLS** | Smooth modulation field — first-class |
| CLUSTER ID | Advanced region-based field (future) |

**Output rendering params:**

| Param | Notes |
|---|---|
| OUTPUT MODE | ALIVE/DEAD / AGE / BIRTH MAP / DEATH MAP / CHANGE MAP / NEIGHBOUR COUNT / DISTANCE TO ACTIVE |
| NORMALISE OUTPUT | Map to predictable range |
| CONTRAST / GAIN | |
| MIN COLOUR / MAX COLOUR | Colour ramp |

---

### Layer 6 — Image Modification + Compositing

| Target | Notes |
|---|---|
| MASK | Alive cells reveal/hide image |
| COLOUR PARTITION | Alive/dead cells receive different grading |
| AGE MAPPING | Older cells get different tint, blur, brightness |
| DISPLACEMENT | Distance to active cells or change fronts drives displacement |
| SHARPNESS | Birth/death fronts sharpen or blur |
| OPACITY | CA state modulates alpha |
| PATTERN DRIVER | CA output drives halftone size, grating phase, noise threshold, etc. |

| Compositing Param | Notes |
|---|---|
| OPACITY | Standard |
| BLEND MODE | Standard |

---

## Action Items

1. **[HIGH PRIORITY]** Implement image-driven initialisation: INIT MODE with THRESHOLDED IMAGE, EDGE SEED, DISTANCE SEED, NOISE SEED options.
2. **[HIGH PRIORITY]** Implement INITIAL WARMUP STEPS, STEPS PER FRAME, RETAIN STATE, RESET ON CHANGE, FREEZE.
3. **[HIGH PRIORITY]** Implement expanded output modes: ALIVE STATE, CELL AGE, BIRTH MAP, DEATH MAP, CHANGE RATE, DISTANCE TO ACTIVE.
4. **[HIGH PRIORITY]** Add colour ramp output mapping: MIN COLOUR, MAX COLOUR, OUTPUT MODE.
5. Add custom rule definition: BIRTH SET, SURVIVAL SET in B/S notation.
6. Add NEIGHBOURHOOD (Moore / Von Neumann) and BOUNDARY MODE params.
7. Implement image-driven BIRTH BIAS and SURVIVAL BIAS fields (most important long-term upgrade).
8. Implement ongoing forcing: FORCE SOURCE, FORCE STRENGTH, FORCE INTERVAL, FORCE MODE.
9. Add FRAME param (global — G9).
10. Ensure all simulation steps run in web worker (global — G12).
11. Fix +D driver button (global — G1).
12. Audit all params for `driveable: true` (global — G2).
13. Slider direct input and double-click-to-default (global — G5).
14. Add unit labels to all numeric params (global — G16).
15. Hide mode-conditional params (global — G14).
