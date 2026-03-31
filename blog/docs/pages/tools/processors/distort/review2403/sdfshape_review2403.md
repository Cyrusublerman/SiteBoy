# SDF SHAPE — Review 2403

- type: `sdfshape`
- category: GEOMETRIC
- isVector: false
- verdict: KEEP — rebuild as signed distance field geometry and spatial field system
- priority: HIGH
- date: 2026-03-31
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Evaluates an SDF per pixel for a chosen primitive (CIRCLE, BOX, RING), converts signed distance to a hard or soft coverage alpha, and composites a user-specified RGB fill over the source image | — |
| 1.2 | Equivalent output from another module? | No other module renders analytical SDF shapes; however the current implementation squanders the field's richness by collapsing signed distance immediately to a fill alpha — the full value is not exploited | — |
| 1.3 | Verdict | KEEP — strong analytical foundation; correct behaviour; O(w×h) cost; distinct from all other modules. Needs aggressive upgrade, not removal | — |
| 1.4 | Name contains "MODULE" in picker? | NO | — |
| 1.5 | Hover tooltip present in picker? | YES | — |

## Section 2 — Functional Completeness

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 2.1 | Correct output with defaults? | YES — analytically clean shape rendered correctly; CIRCLE, BOX, RING all produce expected output; softness and invert function | — |
| 2.2 | Achieves stated purpose? Missing features? | Core fill compositor works. Missing: the signed distance field is computed and immediately discarded — not exposed as output. No outline mode. No distance or banded-distance output. No field export. No non-uniform scale (scaleX/scaleY), no rotation. Ring annulus width is hardcoded at size × 0.15 — not user-controllable. Shape vocabulary limited to 3 primitives (no ellipse, capsule, rounded box, triangle, polygon). All seven driveable params non-functional. FILL R/G/B split across tier 4 and tier 5 inconsistently | ERROR |
| 2.3 | Based on source reference? | No external source reference; standard SDF evaluation | — |

## Section 4 — Parameter and UI Audit

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 4.1 | Module-specific params (label, type)? | SHAPE (select: CIRCLE/BOX/RING), CENTRE X (0–1, driveable), CENTRE Y (0–1, driveable), SIZE (0.01–1, driveable), SOFTNESS (0–0.2, driveable), INVERT (toggle), FILL R (0–255, driveable), FILL G (0–255, driveable), FILL B (0–255, driveable) | — |
| 4.2 | All labels SCREAMING CASE, untruncated? | CENTRE X ✓, CENTRE Y ✓, SIZE ✓, SOFTNESS ✓, FILL R ✓, FILL G ✓, FILL B ✓ — compliant | — |
| 4.3 | Primary param visible by default? | SHAPE, CENTRE X, CENTRE Y, SIZE, SOFTNESS at tier 3–4 visible; FILL R/G/B mixed across tier 4 and 5 — inconsistent grouping | WARN |
| 4.4 | All controls respond correctly across range? | Scalar params function. Ring annulus width hardcoded at size × 0.15 — no THICKNESS param. FILL R/G/B as three 0–255 sliders is a poor colour model — one logical input split into three fragmented controls | WARN |
| 4.5 | Driver slots (+D) functional? | All seven range params marked `driveable: true`; apply() omits modulate — driver modulation impossible for all seven. This is the highest non-functional driver-slot count in the GEOMETRIC category. +D button also broken globally (G1) | ERROR |

## Section 5 — Performance

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 5.1 | Cost-scaling params? | None — O(w×h) fixed analytical evaluation; one of the cheapest modules in the set | — |
| 5.2 | Interactive in PREVIEW at max params? | YES — O(1) per pixel, no scaling concern | — |
| 5.3 | Acceptable FULL-mode render time at max params? | YES — fast at any resolution | — |

## Section 6 — Load and Stability

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 6.1 | Loads without errors on first add? | YES | — |
| 6.2 | Broken output at extreme param values? | No crash or NaN. SIZE at minimum (0.01) produces a near-invisible shape — valid. SOFTNESS at 0 produces a hard alias — valid | — |

## Section 7 — Final Critique

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 7.1 | Confusing, misleading, or inconsistent behaviour? | Seven driveable params presented to the user, none functional — matching the highest fake driver count of any module reviewed. FILL R/G/B as three separate 0–255 sliders is a poor colour model; they belong in a single colour picker component. FILL B at tier 5 while R and G are tier 4 is a tiering inconsistency with no justification. Ring annulus width not user-accessible despite being the defining geometric property of RING. No non-uniform scale or rotation means the module cannot align to or fit compositional structure | ERROR |
| 7.2 | Additional critique or observations? | This module has the strongest analytical foundation of any module in the GEOMETRIC category and one of the best foundations in the whole set. Signed distance fields are cheap, resolution-independent, and naturally field-like. The module's primary failure is collapsing the SDF immediately into a fill alpha and discarding all remaining field information. The upgrade priority is: (1) fix all seven fake driver slots; (2) expose the signed distance field as an output mode; (3) add outline, banded-distance, and mask output modes; (4) add scaleX/scaleY/rotation; (5) add RING THICKNESS param; (6) replace FILL R/G/B sliders with a colour picker component (G11); (7) add image-modification-by-field mode. Strategic role: spatial scaffold for masks, vignettes, halftone zones, grain confinement, blur windows, stipple density, and tessellation limits | — |

## Issues

```
[ERROR] [BUG] All seven driveable params have non-functional driver slots — apply() omits modulate
Location: nodes/geometric/SDFShapeNode.js — centreX, centreY, size, softness, fillR, fillG, fillB params + apply signature
Evidence: All seven range params have driveable: true. apply(src, dst, w, h, p) omits modulate entirely. No driver influence path exists for any param.
Impact: Highest non-functional driver-slot count in the GEOMETRIC category. Seven fake +D slots presented to the user. Particularly egregious because this module's cheap O(1) per-pixel math makes real driver support architecturally straightforward.
```

```
[ERROR] [PARITY] Signed distance field computed then immediately discarded — the core geometric information is not exposed
Location: nodes/geometric/SDFShapeNode.js — apply() via sdfShapeRGBA
Evidence: SDF value is computed per pixel and collapsed immediately to a fill alpha. No output mode for raw distance, unsigned distance, inside mask, outside mask, edge band, normal, tangent, or banded distance.
Impact: The module's strongest capability — a proper geometric distance field — is entirely inaccessible. All downstream uses (mask, driver, spatial modulation, image modification by distance) are blocked.
```

```
[WARN] [STANDARDS] No outline mode — most fundamental SDF rendering mode absent
Location: nodes/geometric/SDFShapeNode.js — apply()
Evidence: Only fill composite available. Outline (abs(dist) < width) is the most direct SDF rendering primitive and is not implemented.
Impact: Cannot produce shape outlines, contour rings, or annular highlights without workarounds.
```

```
[WARN] [STANDARDS] RING annulus width hardcoded at size × 0.15 — not user-controllable
Location: nodes/geometric/SDFShapeNode.js — apply() / sdfShapeRGBA
Evidence: No THICKNESS param. Ring width is fixed relative to size.
Impact: Cannot control ring proportions; thin or thick rings require workarounds.
```

```
[WARN] [STANDARDS] No non-uniform scale or rotation — module cannot align to composition
Location: nodes/geometric/SDFShapeNode.js — params
Evidence: Only CENTRE X, CENTRE Y, SIZE. No SCALE X, SCALE Y, ROTATION.
Impact: Circle cannot become ellipse; box cannot become rectangle; shapes cannot be oriented or aligned.
```

```
[WARN] [STANDARDS] FILL R/G/B split across tier 4 and tier 5 — inconsistent grouping; wrong colour control model
Location: nodes/geometric/SDFShapeNode.js — fillR (tier 4), fillG (tier 4), fillB (tier 5) params
Evidence: FILL B assigned tier 5 while R and G are tier 4. Three separate 0–255 sliders for one logical colour input violates component-patterns.md colour control standard (G11).
Impact: Fragmented colour control; tier inconsistency; poor UX.
```

```
[NOTE] [PARITY] Shape vocabulary limited to 3 primitives — ellipse, capsule, rounded box, polygon absent
Location: nodes/geometric/SDFShapeNode.js — shape param
Evidence: CIRCLE, BOX, RING only. Standard SDF primitive families (ellipse, capsule/line segment, rounded box, triangle, polygon, star, arc, sector) absent.
Impact: Limited geometric range; most compositional and masking use cases require shapes not available.
```

```
[NOTE] [PARITY] No image-modification-by-field mode — SDF cannot modulate image properties by distance
Location: nodes/geometric/SDFShapeNode.js — apply()
Evidence: Only fill composite output. No blur-by-distance, sharpen-by-distance, saturation-by-distance, grain-by-distance, or displacement-by-normal.
Impact: Module cannot function as a spatial scaffold for image modification — its highest-value downstream role.
```

```
[ERROR] [BUG] Driver slot +D button non-functional — see G1
Location: NodePanel — all param +D buttons
```

## Required Rebuild Specification

### Operating Modes

| Mode | Notes |
|---|---|
| FILL | Solid fill composite inside shape (current behaviour) |
| OUTLINE | Stroke rendered at SDF boundary (abs(dist) < width) |
| FILL + OUTLINE | Combined |
| SOFT HALO | Distance-driven luminance falloff |
| BANDED DISTANCE | Repeated contour rings from distance value |
| MASK | Inside/outside binary or soft mask for downstream use |
| DISTANCE FIELD | Raw signed/unsigned distance as scalar output |
| IMAGE MODIFY | Modulate image properties (blur, sharpen, saturation, grain) by field distance |

### Core Architecture

**A. Primitive**
SHAPE (CIRCLE / ELLIPSE / BOX / ROUNDED BOX / RING / CAPSULE / POLYGON / STAR / ARC)
CENTRE X, CENTRE Y, SCALE X, SCALE Y, ROTATION, ASPECT LOCK, INVERT

**B. Primitive Detail** (mode-conditional per shape — G14)
RING: THICKNESS (inner/outer radius), INNER FEATHER, OUTER FEATHER
BOX: CORNER RADIUS, WIDTH, HEIGHT
POLYGON: SIDES, STAR RATIO
ARC: START ANGLE, END ANGLE, RADIAL THICKNESS

**C. Distance Field**
OUTPUT MODE, SOFTNESS INNER, SOFTNESS OUTER, EDGE WIDTH, BAND FREQUENCY, BAND OFFSET, FIELD NORMALISE

**D. Render**
FILL COLOUR (single colour picker — G11), FILL OPACITY, OUTLINE WIDTH, OUTLINE COLOUR, GRADIENT MODE, HALO AMOUNT

**E. Image Modification**
BLUR BY FIELD, SHARPEN BY FIELD, LUMINANCE BY FIELD, SATURATION BY FIELD, GRAIN BY FIELD, DISPLACEMENT BY NORMAL

**F. Output**
OUTPUT TYPE, EXPORT DISTANCE FIELD, EXPORT MASK, EXPORT NORMAL, DOWNSTREAM DRIVER EXPORT

### Driver Boundary
Remove `driveable: true` from all seven params until apply() supports modulate. After architecture correction, all transform and render params are legitimate driver targets (cheap O(1) math makes real per-pixel driver support feasible here): CENTRE X, CENTRE Y, SCALE X, SCALE Y, ROTATION, SOFTNESS, FILL COLOUR, OUTLINE WIDTH, BAND FREQUENCY, COMPOSITE AMOUNT.

### Colour Control
Replace FILL R / FILL G / FILL B (three separate 0–255 sliders) with a single colour picker component (G11). Apply same to OUTLINE COLOUR.

### Minimum Acceptable Upgrade
1. Remove `driveable: true` from all seven params or implement modulate properly
2. Expose distance field as output mode (MASK and DISTANCE at minimum)
3. Add OUTLINE output mode
4. Add SCALE X, SCALE Y, ROTATION params
5. Add RING THICKNESS (inner/outer radius) param
6. Replace FILL R/G/B sliders with colour picker component (G11)
7. Fix FILL B tier from 5 to match FILL R/G tier

## Action Items

1. **[CRITICAL]** Remove `driveable: true` from all seven range params until apply() supports modulate — or implement real modulate support (preferred given O(1) cost).
2. **[CRITICAL]** Expose signed distance field: add OUTPUT MODE param (FILL / OUTLINE / MASK / DISTANCE / BANDED / IMAGE MODIFY); expose raw distance as scalar output for downstream use.
3. **[HIGH]** Add OUTLINE mode — render stroke at abs(dist) < OUTLINE WIDTH; add OUTLINE WIDTH param.
4. **[HIGH]** Add SCALE X, SCALE Y, ROTATION params — enable non-uniform scale and oriented shapes; add ASPECT LOCK toggle.
5. **[HIGH]** Add RING THICKNESS param (replaces hardcoded size × 0.15); separate INNER RADIUS and OUTER RADIUS controls.
6. **[HIGH]** Replace FILL R/FILL G/FILL B with a single colour picker component (G11); apply to OUTLINE COLOUR when added.
7. **[HIGH]** Add BANDED DISTANCE mode — BAND FREQUENCY and BAND OFFSET params; render distance contour rings.
8. **[HIGH]** Add IMAGE MODIFY mode — BLUR BY FIELD, LUMINANCE BY FIELD, SATURATION BY FIELD, GRAIN BY FIELD.
9. Expand shape vocabulary: add ELLIPSE, ROUNDED BOX, CAPSULE as next primitives.
10. Fix FILL B tier inconsistency — move to tier 4 to match FILL R and FILL G.
11. Ensure computation remains in web worker as field complexity grows (G12).
12. Fix +D driver button (G1); implement real per-pixel driver modulation once architecture supports it (G2).
13. Slider direct input and double-click-to-default (G5).
14. Add unit labels (G16): CENTRE X/Y — none (normalised 0–1); SIZE — none; SOFTNESS — none; OUTLINE WIDTH — px.
15. Hide primitive-specific params per active SHAPE (G14).
