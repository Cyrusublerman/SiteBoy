# TRUCHET — Build Guide

- module: truchet
- node: TruchetNode.js
- category: PATTERN
- review verdict: KEEP
- rebuild severity: CRITICAL

---

## Current State Summary

`TruchetNode.js` is a thin factory wrapper over `truchetRGBA` (in `pattern-generators.js`). It exposes 3 params: `tileSize` (range), `strokeWidth` (range, declared `driveable:true`), and `internalBlend` (select). The algorithm is SDF-based quarter-circle arc Truchet tiling with a seeded bitwise-hash orientation selector.

Functional state: the pattern renders correctly as a static overlay. No field derivation, no driver wiring, no image-modification stage, no layer architecture. `strokeWidth` is declared driveable but `apply()` passes `p.strokeWidth` directly to `truchetRGBA` — driving is inert.

Param key `blendMode` in the reference source has been renamed `internalBlend` in the live node. `fromJSON` in `EffectNode.js` contains a migration shim for this (line 245–248).

---

## Reference Parity Gaps

| Gap | Evidence | Severity |
|---|---|---|
| `tileSize` missing `driveable:true` | Reference source: `driveable` absent; review spec §Layer 2 requires it as driver-capable; G2 mandates all numeric params be driveable | HIGH |
| `strokeWidth` driver wiring absent | `driveable:true` declared but `apply()` does not call `getModulated('strokeWidth', pixelIdx, ctx)` — per-pixel variation is silent no-op | HIGH |
| `blendMode` tier mismatch | Legacy doc assigns tier 5; reference source assigns tier 4; live node assigns tier 4 — legacy is incorrect, live is correct | LOW |
| Preview strategy conflict | Legacy doc claims "No reduction"; reference source and live node both declare `previewMax:40` on `tileSize` and `previewMax:8` on `strokeWidth` — legacy is incorrect, source is authoritative | INFO |

---

## Review Spec Gaps

The review spec mandates a five-layer architecture. Current implementation covers Layer 1 (partially) and Layer 4 (partially). All other layers are absent.

### Layer 1 — Pattern Generation (partial)

Present: `tileSize`, `strokeWidth`, seeded orientation hash (two orientations only, bitwise XOR).  
Missing: `TILE MOTIF` (motif family: quarter arc / double arc / cross / blob / multi-line / filled tile), `ORIENTATION MODE` (fixed / random / checker / driven), `SEED` (exposed user param — currently `ctx.nodeSeed` only, not a user-facing param), `GRID OFFSET X`, `GRID OFFSET Y`, `ROTATION`.

### Layer 2 — Driver System (absent)

Not implemented. Required for all driver-capable params:  
`TILE SIZE`, `STROKE WIDTH`, `ORIENTATION`, `MOTIF SELECTION`, `PATTERN COLOUR`, `PATTERN OPACITY`, `DISPLACEMENT STRENGTH`, `DISPLACEMENT RADIUS`, `COLOUR SHIFT STRENGTH`, `BLUR STRENGTH`.

Each driver requires: DRIVER ENABLED, DRIVER SOURCE, DRIVER METRIC, INPUT MIN/MAX, OUTPUT MIN/MAX, CURVE, BLEND AMOUNT, INVERT.

### Layer 3 — Field Derivation (absent)

Image-derived fields absent: LUMINANCE, HUE, SATURATION, RGB, GRADIENT MAGNITUDE, GRADIENT ANGLE, LOCAL CONTRAST, EDGE MAP, DISTANCE TO EDGE, POSITION X/Y, RADIAL DISTANCE.  
Pattern-derived fields absent: TILE ID, ORIENTATION STATE, MOTIF STATE, STROKE MASK, REGION MASK, DISTANCE TO STROKE, DISTANCE TO TILE BOUNDARY, NEAREST CURVE TANGENT, NEAREST CURVE NORMAL.

### Layer 4 — Rendering (partial)

Present: `internalBlend` (MULTIPLY / SCREEN / OVERLAY).  
Missing: `PATTERN COLOUR`, `PATTERN OPACITY`, `BACKGROUND FILL`, `ANTI-ALIAS`.

### Layer 5 — Image Modification (absent)

Not implemented. Required params: `MODIFICATION MODE` (NONE / STROKE MASK / REGION MASK / ORIENTATION PARTITION / DISTANCE FIELD / DISPLACEMENT), `INSIDE EFFECT STRENGTH`, `OUTSIDE EFFECT STRENGTH`, `MASK FEATHER`, `DISPLACEMENT STRENGTH`, `DISPLACEMENT RADIUS`, `COLOUR SHIFT STRENGTH`, `BLUR STRENGTH`, `SHARPEN STRENGTH`, `ORIENTATION A TREATMENT`, `ORIENTATION B TREATMENT`.

---

## Missing Parameters

All parameters below are absent from the live node.

### Layer 1 additions

| Key (proposed) | Label | Type | Notes |
|---|---|---|---|
| `tileMotif` | `TILE MOTIF` | select | `QUARTER ARC / DOUBLE ARC / CROSS / BLOB / MULTI-LINE / FILLED` |
| `orientationMode` | `ORIENT MODE` | select | `FIXED / RANDOM / CHECKER / DRIVEN` |
| `seed` | `SEED` | range | Expose `ctx.nodeSeed` as a user-editable param; integer |
| `gridOffsetX` | `OFFSET X` | range | Horizontal lattice offset in px; driveable |
| `gridOffsetY` | `OFFSET Y` | range | Vertical lattice offset in px; driveable |
| `rotation` | `ROTATION` | range | Global pattern rotation in degrees; driveable |

### Layer 2 additions (per driver-capable param)

Generic driver block per param: `<key>DriverEnabled`, `<key>DriverSource`, `<key>DriverMetric`, `<key>InputMin`, `<key>InputMax`, `<key>OutputMin`, `<key>OutputMax`, `<key>Curve`, `<key>BlendAmount`, `<key>Invert`. Must be implemented as a shared component (G11).

### Layer 4 additions

| Key (proposed) | Label | Type | Notes |
|---|---|---|---|
| `patternColour` | `PATTERN COLOUR` | color | Rendered motif colour; driveable |
| `patternOpacity` | `PATTERN OPACITY` | range | 0–1; driveable |
| `backgroundFill` | `BG FILL` | color | Optional background; toggle-gated |
| `antiAlias` | `ANTI-ALIAS` | toggle | AA on arc SDF threshold |

### Layer 5 additions

| Key (proposed) | Label | Type | Notes |
|---|---|---|---|
| `modificationMode` | `MOD MODE` | select | `NONE / STROKE MASK / REGION MASK / ORIENTATION PARTITION / DISTANCE FIELD / DISPLACEMENT`; G14 applies |
| `insideStrength` | `INSIDE STR` | range | driveable |
| `outsideStrength` | `OUTSIDE STR` | range | driveable |
| `maskFeather` | `MASK FEATHER` | range | driveable |
| `displacementStrength` | `DISPLACE STR` | range | driveable |
| `displacementRadius` | `DISPLACE RAD` | range | driveable |
| `colourShiftStrength` | `COLOUR SHIFT` | range | driveable |
| `blurStrength` | `BLUR STR` | range | driveable |
| `sharpenStrength` | `SHARPEN STR` | range | driveable |
| `orientationATreatment` | `ORIENT A` | select | Treatment for A-state tiles |
| `orientationBTreatment` | `ORIENT B` | select | Treatment for B-state tiles |

---

## Extra/Incorrect Parameters

| Key | Issue |
|---|---|
| `internalBlend` | Key renamed from `blendMode` (reference source); migration shim present in `EffectNode.fromJSON`. Not incorrect per se, but name diverges from reference. Retain `internalBlend` — shim already handles old data. |

No spurious parameters beyond those documented.

---

## UI Compliance Issues

| Issue | Applies To | Standard |
|---|---|---|
| `tileSize` missing `driveable:true` | `tileSize` param | G2: all numeric params must support drivers |
| `strokeWidth` driver declared but inert | `apply()` body | G2 / issues-and-conflicts.md: `getModulated()` must be called per pixel |
| `internalBlend` (select) — conditional visibility not yet required but will be once `modificationMode` and `orientationMode` are added | Future: Layer 5 params must be hidden when `modificationMode` is NONE | G14: mode-conditional params must be hidden when not applicable |
| No unit on `tileSize` or `strokeWidth` values rendered in NodePanel | Both range params | G16: numeric params must display units; both declare `unit:'px'` — verify NodePanel renders it |
| Driver (+D) button non-functional globally | All driveable params | G1: NodePanel +D button event handler is broken; fix G1 before verifying driver wiring |

No label case, glyph, border, or colour violations in the param definitions themselves (labels are ≤16 chars SCREAMING CASE; keys are camelCase). NodePanel rendering compliance (border-system, semiotics) is a host responsibility, not per-module.

---

## Global Issues

| Issue | Status in this module |
|---|---|
| G1 — Driver (+D) button non-functional | Affects all driveable params. `strokeWidth` is declared driveable; once driver wiring is added to `apply()`, G1 must be resolved before functional verification is possible. Not a module-level fix. |
| G2 — All numeric params must be driveable | `tileSize` missing `driveable:true`. All future numeric params (gridOffsetX, gridOffsetY, rotation, patternOpacity, insideStrength, outsideStrength, maskFeather, displacementStrength, displacementRadius, colourShiftStrength, blurStrength, sharpenStrength) must declare `driveable:true`. |
| G5 — Slider direct input and double-click-to-default | Host-level (NodePanel/slider component). No per-module action. |
| G6 — Canvas click-to-pick for centre params | Not applicable to truchet — no centre X/Y params exist or are planned. |
| G7 — Vector modules must be identifiable | Not applicable — truchet is a pixel module. |
| G9 — Time-based modules must expose FRAME param | Not applicable — truchet is deterministic, not time-based. |
| G10 — Vector modules must include SVG export | Not applicable. |
| G11 — Overlapping features must use shared components | Applies to the driver block UI. The driver architecture (Layer 2) must be implemented as a shared component/control block, not reimplemented per param or per module. Before writing any driver param UI, confirm or build the shared driver component. |
| G12 — Web worker usage | Truchet is O(w×h) constant-factor, render cost class A (<16 ms). No worker migration required. No action. |
| G14 — Mode-conditional params must be hidden when not applicable | Applies to Layer 5 params: all modification sub-params (`insideStrength`, `outsideStrength`, `maskFeather`, `displacementStrength`, `displacementRadius`, etc.) must be hidden when `modificationMode` is NONE. `orientationMode`-conditional params must be hidden when `orientationMode` is FIXED. |
| G16 — Slider/number inputs must display units | `tileSize` and `strokeWidth` both declare `unit:'px'`. Verify NodePanel renders unit. All future range params must declare appropriate `unit` values (`px`, `°`, `0–1`, etc.). |

---

## Merge Absorption

| Item | Source | Required Change |
|---|---|---|
| `fromJSON` migration shim for `blendMode` → `internalBlend` | `EffectNode.js` L245–248 | Retain — handles backward compatibility for serialised presets using old key. No action. |
| `truchetRGBA` algorithm | `pattern-generators.js` | Current algorithm only supports: tileSize, strokeWidth, blendMode, seed. All new layer functionality (motif selection, field derivation, image modification) will require extension of `truchetRGBA` or introduction of new algorithm functions in the shared algorithms library. Changes belong in `pattern-generators.js`, not in `TruchetNode.js`. |
| No presets using truchet | `registry.js` PRESETS | None to migrate. |

---

## Required Changes (priority ordered)

### P0 — Prerequisite (host-level, not this module)

1. **Fix G1**: Repair `NodePanel` +D button event handler so driver settings panel opens. Required before any driver wiring in this module can be functionally verified.

### P1 — Correctness fixes (module-level, immediate)

2. **Add `driveable:true` to `tileSize`**: Single property addition. Required by G2.

3. **Wire `strokeWidth` driver in `apply()`**: Replace `p.strokeWidth` with `getModulated('strokeWidth', pixelIdx, ctx)` — requires per-pixel loop structure rather than passing a single value into `truchetRGBA`. Either refactor `apply()` to call `truchetRGBA` per-pixel or pass a modulation callback through. The latter avoids restructuring `truchetRGBA`.

### P2 — Layer 1 completion (Phase 1 of review spec)

4. **Add `TILE MOTIF` param** (`tileMotif`, select). Extend `truchetRGBA` or introduce `truchetRGBA_v2` in `pattern-generators.js` to support motif families. Quarter arc is the existing motif; add double arc, cross, blob, multi-line, filled as modes.

5. **Add `ORIENTATION MODE` param** (`orientationMode`, select: FIXED / RANDOM / CHECKER / DRIVEN). FIXED uses a single orientation for all tiles; RANDOM uses current hash; CHECKER alternates deterministically; DRIVEN maps to image field.

6. **Expose `SEED` as a user param** (`seed`, range, integer). Currently implicit via `ctx.nodeSeed`. Add explicit param that overrides or offsets `ctx.nodeSeed`. Declare `driveable:true`.

7. **Add `GRID OFFSET X` / `GRID OFFSET Y`** (`gridOffsetX`, `gridOffsetY`, range, driveable). Lattice phase offsets.

8. **Add `ROTATION`** (`rotation`, range, 0–360°, driveable). Global pattern rotation.

### P3 — Layer 4 completion (Phase 1 rendering)

9. **Add `PATTERN COLOUR`** (`patternColour`, color, driveable). Rendered motif colour.

10. **Add `PATTERN OPACITY`** (`patternOpacity`, range 0–1, driveable).

11. **Add `ANTI-ALIAS` toggle** (`antiAlias`, toggle). Smooth SDF threshold; replaces binary step with smoothstep over 1px.

12. **Add `BACKGROUND FILL`** (`backgroundFill`, color). Optional; show only when enabled.

### P4 — Driver system (Phase 2 of review spec)

13. **Implement generic driver architecture as shared component** (G11). Before adding driver params to this module, confirm or build `DriverControl` in `ComponentLibrary`. The driver block must be shared across all modules — not reimplemented here. Then attach driver support to: `tileSize`, `strokeWidth`, `orientationMode` (when `DRIVEN`), `tileMotif`, `patternColour`, `patternOpacity`.

### P5 — Layer 3 — Field derivation (Phase 3–4 of review spec)

14. **Image-derived fields**: Implement in `pattern-generators.js` (or a new `field-derivation.js` in shared algorithms): LUMINANCE, GRADIENT MAGNITUDE, GRADIENT ANGLE, EDGE MAP, DISTANCE TO EDGE, POSITION X/Y, RADIAL DISTANCE.

15. **Pattern-derived fields**: After rasterisation of tile arcs — STROKE MASK, DISTANCE TO STROKE, TILE ID, ORIENTATION STATE, CURVE TANGENT, CURVE NORMAL.

### P6 — Layer 5 — Image modification (Phase 5–6 of review spec)

16. **Add `MODIFICATION MODE` param** with G14-compliant conditional visibility. Show modification sub-params only when mode ≠ NONE.

17. **Implement modification sub-params**: insideStrength, outsideStrength, maskFeather, displacementStrength, displacementRadius, colourShiftStrength, blurStrength, sharpenStrength, orientationATreatment, orientationBTreatment.

18. **Implement stroke-mask-based treatment**: pixels within STROKE MASK receive `insideStrength`-scaled effect; outside receive `outsideStrength`.

19. **Implement distance-to-stroke field treatment**: continuous scalar field drives colour ramp / blur / brightness.

20. **Implement normal-based displacement**: `x' = x + normal.x × f(distToStroke)`, `y' = y + normal.y × f(distToStroke)`.

### P7 — Unit and metadata completeness

21. **Declare `unit` on all new range params**: `gridOffsetX`/`Y` → `'px'`; `rotation` → `'°'`; `patternOpacity` → `'0–1'`; `insideStrength`/`outsideStrength`/etc. → appropriate unit. Required by G16.

22. **Verify NodePanel renders `unit:'px'`** on existing `tileSize` and `strokeWidth` params.

---

## Verification Criteria

After all required changes, the following must hold:

1. `tileSize` has `driveable:true`; the +D button (once G1 is fixed) opens driver settings for it.
2. `strokeWidth` driving is functional: setting a luminance driver on `strokeWidth` produces per-pixel variation in arc thickness visible in the output.
3. All 6 TILE MOTIF options produce distinct visual output.
4. ORIENTATION MODE FIXED produces a uniform-orientation grid; RANDOM reproduces current seeded-hash behaviour; CHECKER alternates A/B deterministically.
5. GRID OFFSET X/Y shift the tile lattice without discontinuity at edges.
6. ROTATION rotates the global pattern without artefacts.
7. PATTERN COLOUR and PATTERN OPACITY affect rendered motif independently of blend mode.
8. ANTI-ALIAS toggle visibly smooths arc edges on zoomed output.
9. With `modificationMode = NONE`, all Layer 5 sub-params are hidden (G14).
10. With `modificationMode = STROKE MASK`, inside and outside pixel regions receive independent effects.
11. Distance-to-stroke scalar field is computable and drives a visible colour ramp over source pixels.
12. Normal-based displacement produces image distortion aligned to arc curve normals.
13. Driver architecture uses the shared driver component (G11) — no per-module reimplementation.
14. All range params display their unit in the NodePanel value readout (G16).
15. No `requestAnimationFrame`, `setInterval`, `document.*`, or `window.*` introduced.
16. `destroy()` (factory-provided) correctly cleans up any stateful resources introduced in the rebuild.
17. Serialisation round-trip (`toJSON` / `fromJSON`) preserves all new params; `internalBlend` migration shim continues to function for legacy presets.
18. Preview caps (`previewMax`) declared on all computationally relevant params; render cost remains class A at preview resolution.
