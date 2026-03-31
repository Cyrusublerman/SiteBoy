# WAVE DISTORTION — Review 2403

- type: `wavedistortion`
- category: PHYSICS
- isVector: false
- verdict: KEEP — rebuild as stateful wave-field simulation system
- priority: HIGH
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Applies a sinusoidal/ripple coordinate displacement to the image | — |
| 1.2 | Visually distinct from all other modules? | PARTIALLY — overlaps heavily with domain warp and noise field if it remains a static displacement | WARN |
| 1.3 | Verdict | KEEP — must become a stateful iterative wave simulation to justify distinct existence | — |

## Critical Distinction

The module must be redefined from:
```
apply sinusoidal/ripple displacement (instantaneous)
```
To:
```
simulate evolving wave field → derive displacement/modulation → apply to image
```

A static ripple distortion overlaps too heavily with DOMAIN WARP and RIPPLE. The PHYSICS classification is only justified if the module implements **stateful propagation with memory, damping, emitters, and interference**.

## Issues

```
[ERROR] [PARITY] Module is a static ripple distortion — not a stateful wave simulation
Location: nodes/wavedistortion — full implementation
Evidence: Displacement is computed from a fixed wave function, not from an evolving simulation state. No propagation, no interference, no emitters, no damping over time.
Impact: Module is not meaningfully distinct from RIPPLE or DOMAIN WARP in its current form.
```

```
[ERROR] [PARITY] No emitter system — single implicit ripple source only
Location: nodes/wavedistortion — wave source
Evidence: No multi-point emitters, no interference between sources.
Impact: Cannot produce interference patterns, standing waves, or cymatic structures.
```

```
[ERROR] [PARITY] No image coupling — wave field does not respond to image data
Location: nodes/wavedistortion — simulation
Evidence: No image-driven seeding, parameter fields, or forcing.
Impact: Output is independent of source image.
```

## Required Upgrade Specification

### Two Operating Classes

| Class | Description |
|---|---|
| INSTANT WAVE | Direct wave field — lightweight procedural ripples |
| SIMULATED WAVE | Stateful iterative solver — propagation, interference, ocean motion, cymatics |

Module focus: **SIMULATED WAVE** — this is what makes it unique.

### Five-Layer Target Architecture

```
Layer 1: Wave Field Initialisation
Layer 2: Wave Simulation + Emitters
Layer 3: Image Coupling
Layer 4: Output Fields
Layer 5: Image Modification + Compositing
```

---

### Layer 1 — Wave Field Initialisation

| Param | Notes |
|---|---|
| INIT MODE | RIPPLE / NOISE / FLAT / IMAGE SEED / EDGE SEED / POINT EMITTERS / LINE EMITTERS / CUSTOM MASK |
| INITIAL AMPLITUDE | Starting wave magnitude |
| INITIAL RADIUS | Initial ripple size |
| SEED SOURCE | LUMINANCE / HUE / SATURATION / EDGE MAP / DISTANCE TO EDGE / MASK |
| SEED THRESHOLD | Image value cutoff for seeding |
| SEED SOFTNESS | Hard vs soft seeding boundary |

---

### Layer 2 — Wave Simulation + Emitters

**Simulation:**

| Param | Notes |
|---|---|
| INITIAL WARMUP STEPS | Steps run before first display |
| STEPS PER FRAME | Internal iterations per visible frame |
| WAVE SPEED | Propagation speed |
| DAMPING | Decay over time |
| DISPERSION | Frequency-dependent spreading |
| VISCOSITY | Liquid-like / heavy behaviour |
| BOUNDARY MODE | CLAMP / REFLECT / WRAP / ABSORB |
| RESOLUTION | Internal simulation resolution |
| RETAIN STATE | Continue evolving over time |
| RESET ON CHANGE | Restart when params change |
| FRAME | Time/animation param (G9) |
| MODE | STATIC MATURE / CONTINUOUS EVOLUTION / FRAME-DRIVEN EMITTERS |

**Emitters (major subsystem):**

| Param | Notes |
|---|---|
| EMITTER COUNT | Number of emitters |
| EMITTER MODE | MANUAL / GRID / RADIAL / RANDOM / IMAGE-DRIVEN |
| EMITTER POSITIONS | X/Y per emitter (canvas click-to-pick — G6) |
| EMITTER FREQUENCY | Per emitter |
| EMITTER PHASE | Per emitter |
| EMITTER AMPLITUDE | Per emitter |
| EMITTER RADIUS | Spatial extent |
| PULSE MODE | CONTINUOUS / IMPULSE |
| PHASE LOCK | Structured phase relation between emitters |
| SUPERPOSITION | How emitters combine (additive / clamped / normalised) |
| REFLECTION STRENGTH | Boundary reflection for standing patterns |

**Ocean Mode (multi-scale wave specialisation):**

| Param | Notes |
|---|---|
| DIRECTIONAL WAVES | Global travelling wave direction |
| SECONDARY CHOP | Higher-frequency overlay |
| CURRENT DRIFT | Slow large-scale directional advection |
| TURBULENCE STRENGTH | Local irregularity |
| WAVE SPECTRUM | Mix of wavelengths |
| WIND DIRECTION | Propagation bias |

**Cymatics Mode (standing-wave specialisation):**

| Param | Notes |
|---|---|
| CYMATIC MODE | PLATE / CIRCULAR MEMBRANE / RECTANGULAR MEMBRANE / FREE FIELD |
| DRIVE FREQUENCY | |
| DRIVE AMPLITUDE | |
| RESONANCE | Standing-pattern reinforcement |
| NODE SHARPNESS | Node/antinode contrast |
| NODE OUTPUT | HEIGHT / VELOCITY / ABSOLUTE AMPLITUDE / NODAL MASK |

---

### Layer 3 — Image Coupling

**Image → wave system:**

| Stage | Mechanism |
|---|---|
| A. Initial seeding | Image properties define starting wave state |
| B. Local parameter fields | Image drives DAMPING, WAVE SPEED, TURBULENCE spatially |
| C. Ongoing forcing | Image continuously injects energy (FORCING STRENGTH, FORCING INTERVAL) |

**Image-derived fields usable as drivers:**
LUMINANCE / RED / GREEN / BLUE / HUE / SATURATION / GRADIENT MAGNITUDE / GRADIENT ANGLE / LOCAL CONTRAST / EDGE MAP / **DISTANCE TO EDGE** (first-class) / POSITION X/Y / RADIAL DISTANCE

**Turbulence layer:**

| Param | Notes |
|---|---|
| TURBULENCE TYPE | NOISE / IMAGE GRADIENT / IMAGE LUMINANCE / HYBRID |
| TURBULENCE STRENGTH | |
| TURBULENCE SCALE | |
| TURBULENCE DRIFT | |
| TURBULENCE COUPLING SOURCE | Image field driving turbulence |

---

### Layer 4 — Output Fields

| Field | Notes |
|---|---|
| WAVE HEIGHT | Primary displacement field |
| WAVE VELOCITY | Rate of change per region |
| WAVE SLOPE | Gradient magnitude of field |
| WAVE NORMAL | Direction perpendicular to surface slope |
| INTERFERENCE STRENGTH | Crossing/structure highlighting |
| NODE MASK | Cymatic/standing-wave mode |
| CURVATURE | Foam-like or edge-like visual treatment |

**Output rendering params:**

| Param | Notes |
|---|---|
| OUTPUT MODE | HEIGHT / VELOCITY / INTERFERENCE / NODE MASK / GRADIENT |
| NORMALISE OUTPUT | Map to predictable display range |
| CONTRAST / GAIN | |
| MIN COLOUR / MAX COLOUR | Colour ramp for mapped output |

---

### Layer 5 — Image Modification + Compositing

| Target | Notes |
|---|---|
| COORDINATE DISPLACEMENT | Standard — shift sampling coords by wave height/slope |
| RGB INDEPENDENT WARP | Channels respond differently to wave field |
| HUE MODULATION | Wave field shifts hue |
| SATURATION MODULATION | Wave field modulates chroma |
| LIGHTNESS MODULATION | Wave field modulates tone |
| BLUR MODULATION | High-energy zones blur more |
| SHARPEN MODULATION | Nodes/ridges sharpen |
| MASK OUTPUT | Wave field as compositing mask |

| Compositing Param | Notes |
|---|---|
| OPACITY | Standard |
| BLEND MODE | Standard |
| CLAMP MODE | CLAMP / MIRROR / WRAP / TRANSPARENT |
| SAMPLING MODE | NEAREST / BILINEAR / BICUBIC |

---

## Action Items

1. **[CRITICAL]** Rebuild as stateful iterative wave simulation — implement propagation, damping, boundary conditions, and retain-state logic.
2. **[HIGH PRIORITY]** Implement multi-point emitter system with EMITTER COUNT, MODE, PHASE LOCK, and SUPERPOSITION.
3. **[HIGH PRIORITY]** Implement image coupling: seed mode, image-driven DAMPING and WAVE SPEED fields, DISTANCE TO EDGE as first-class driver.
4. **[HIGH PRIORITY]** Implement INITIAL WARMUP STEPS, STEPS PER FRAME, RETAIN STATE, RESET ON CHANGE.
5. **[HIGH PRIORITY]** Implement output fields and colour ramp output mapping.
6. Add OCEAN MODE params (DIRECTIONAL WAVES, SECONDARY CHOP, TURBULENCE).
7. Add CYMATICS MODE (PLATE/MEMBRANE, DRIVE FREQUENCY, RESONANCE, NODE OUTPUT).
8. Add canvas click-to-pick for emitter positions (global — G6).
9. Add FRAME param (global — G9).
10. Ensure all heavy computation runs in web worker (global — G12).
11. Fix +D driver button (global — G1).
12. Audit all params for `driveable: true` (global — G2).
13. Slider direct input and double-click-to-default (global — G5).
14. Add unit labels to all numeric params (global — G16).
15. Hide mode-conditional params (global — G14).
