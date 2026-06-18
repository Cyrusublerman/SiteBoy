# FLOWFIELD — Build Guide

- module: flowfield
- node: FlowFieldNode.js
- category: WARP
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

Live node (`nodes/warp/FlowFieldNode.js`) is a `createEffectModule` factory with 8 params. Registry entry correct. All param keys, label casing, tier assignments, ranges, and defaults match the reference source exactly. Algorithm delegation (`flowFieldWarp`, `PerlinNoise`) is correct. Preview strategy is hybrid: factory `previewMax` on `strength` (60) and `advectSteps` (3), plus an inline `ctx.quality` check for interpolation mode (`nearest`/`bilinear`) and `ctx.previewScale` strength scaling — both justified and correct.

**Deviations from reference source:**

1. `frame` param added (`{ value:0, min:0, max:240, step:1, tier:3, driveable:true, unit:'frames' }`) — not in reference source; added to satisfy G9.
2. All 8 params have `unit` fields — not in reference source; added to satisfy G16.
3. `capByFrame(adv, p.frame)` applied to `advectSteps` in `apply()` — not in reference source; coupled to the added `frame` param.
4. `octaves`, `lacunarity`, `gain`, `advectSteps` have `driveable: true` — reference source has these four without `driveable`; live adds it (satisfies G2).
5. `apply()` still omits `modulate` argument — identical defect in both live and reference source.

The live node is structurally sound and algorithmically complete. All required changes are additive or signature-level.

---

## Reference Parity Gaps

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| R1 | `apply()` omits `modulate` — declared `apply(src, dst, w, h, p, ctx)` | HIGH | Three `driveable: true` params (`noiseScale`, `strength`, `curl`) cannot modulate per-pixel. Present in both live and reference source; must be fixed in live. |
| R2 | `octaves` has no `previewMax` | LOW | Reference source also lacks it. NOISE category peers (`perlinoverlay`, `domainwarp`) cap octaves at 4. At `octaves=8`, `advectSteps=3` (PREVIEW cap): 48 Perlin evals/pixel. Recommend `previewMax: 4`. |
| R3 | `PerlinNoise` instantiated on every `apply()` call | LOW | Reference source shares this defect. Permutation table rebuilt each call. Caching keyed by `nodeSeed` would eliminate redundant work. |

---

## Review Spec Gaps

The review spec (flowfield_review2403.md) raised two feature requests and three global action items:

| # | Spec Item | Status | Notes |
|---|-----------|--------|-------|
| RS1 | Add SEED param for Perlin noise | RESOLVED-PARTIAL | `ctx.nodeSeed` already seeds `PerlinNoise`; no user-exposed SEED param exists. Seed is provided at the pipeline/context level, not as a module param. G11 applies: use shared `NoiseSourceControl` component when built. |
| RS2 | Add OCTAVES param | RESOLVED | `octaves` param present at tier 4, range 1–8, default 3. |
| RS3 | Fix +D driver button (G1) | OPEN | Global issue; out of module scope. |
| RS4 | `driveable: true` on all numerics (G2) | RESOLVED | All 8 params have `driveable: true` in live node. |
| RS5 | Slider direct input + double-click-to-default (G5) | OPEN | Global UI issue; out of module scope. |

---

## Missing Parameters

| Key | Label | Type | Range | Default | Tier | Rationale |
|-----|-------|------|-------|---------|------|-----------|
| — | — | — | — | — | — | None required. `frame` already added (G9). All reference params present. |

**Note on SEED exposure:** The review spec requests a user-facing SEED param. `ctx.nodeSeed` provides seed control at the pipeline layer. If a per-module SEED param is added, it must use the shared `NoiseSourceControl` component (G11). Defer until that component exists; do not implement ad hoc.

---

## Extra/Incorrect Parameters

| Key | Issue | Action |
|-----|-------|--------|
| `frame` | Added in live to satisfy G9. Not in reference source. Semantically correct: `capByFrame(adv, p.frame)` scales advection steps by frame counter, enabling animation. | **KEEP.** G9-compliant. Verify `capByFrame` behaviour is correct (does not reduce `advectSteps` below 1; returns integer). |

No params are incorrect. No params should be removed.

---

## UI Compliance Issues

| # | Issue | Source | Action |
|---|-------|--------|--------|
| U1 | All 8 params have `unit` fields in live node — UI must render them | G16 | Confirm NodePanel renders `unit` for all param rows. Units defined: `frame→'frames'`, `noiseScale→'n'`, `strength→'px'`, `curl→'n'`, `octaves→'n'`, `lacunarity→'n'`, `gain→'0–1'`, `advectSteps→'n'`. |
| U2 | `curl` unit `'n'` is ambiguous for a signed normalised range `[−1, 1]` | — | Consider unit `'−1–1'` or `'n'` with tooltip. Low priority. |
| U3 | No mode-conditional params in this module | G14 | Not applicable — no MODE dropdown. |
| U4 | No centre X/Y params | G6 | Not applicable. |
| U5 | Not a vector module | G7, G10 | Not applicable. |

---

## Global Issues

| ID | Applies? | Module impact | Required action |
|----|----------|---------------|-----------------|
| G1 | YES | `noiseScale`, `strength`, `curl`, `octaves`, `lacunarity`, `gain`, `advectSteps`, `frame` all have `driveable: true`; +D button non-functional globally | Fix NodePanel +D handler (global fix; no change to this module) |
| G2 | RESOLVED | All 8 params have `driveable: true` | None |
| G5 | YES | All 8 slider params affected | Fix slider component (global fix; no change to this module) |
| G6 | N/A | No centre X/Y params | None |
| G7 | N/A | Pixel module, not vector | None |
| G9 | RESOLVED | `frame` param added; `capByFrame` wired to `advectSteps` | Verify `capByFrame` clamps correctly; confirm `frame` drives animation system when ready |
| G10 | N/A | Not a vector module | None |
| G11 | PENDING | SEED exposure deferred pending `NoiseSourceControl` shared component | When `NoiseSourceControl` is built, add seed param via shared component |
| G12 | LOW | At max params (advectSteps=10, octaves=8, 4K), cost is D-class (>1 s). PREVIEW mitigations adequate for interactive use. | Confirm `apply()` runs in render worker, not main thread. No module-level change needed. |
| G14 | N/A | No mode-switching params | None |
| G16 | RESOLVED | All params have `unit` fields in live node | Confirm NodePanel renders units |

---

## Merge Absorption

Changes already absorbed into the live node relative to the reference source:

| Change | Source | Status |
|--------|--------|--------|
| `frame` param added (tier 3, driveable, `unit:'frames'`) | G9 | Present |
| `capByFrame(adv, p.frame)` in apply() | G9 | Present |
| `driveable: true` on `octaves`, `lacunarity`, `gain`, `advectSteps` | G2 | Present |
| `unit` field on all params | G16 | Present |

Not yet absorbed:

| Change | Source | Reason |
|--------|--------|--------|
| `modulate` argument in `apply()` + per-pixel driver reads | G1/G2 (R1) | Blocked on G1 (driver system broken); must land when G1 is fixed |
| `previewMax: 4` on `octaves` | R2 | Not absorbed; low priority |
| `PerlinNoise` caching by seed | R3 | Performance opt; not absorbed |

---

## Required Changes (priority ordered)

### P1 — HIGH: Add `modulate` to `apply()` and wire driveable params

**File:** `assets/js/tools/processors/distort/nodes/warp/FlowFieldNode.js`

Change `apply(src, dst, w, h, p, ctx)` to `apply(src, dst, w, h, p, ctx, modulate)`. Inside `apply()`, before calling `flowFieldWarp`, resolve per-call scalar values with modulate fallback:

```js
apply(src, dst, w, h, p, ctx, modulate) {
  const noise = new PerlinNoise(ctx?.nodeSeed ?? 42);
  const interp = ctx?.quality === 'preview' ? 'nearest' : 'bilinear';
  const str = p.strength * (ctx?.quality === 'preview' && ctx?.previewScale ? ctx.previewScale : 1);
  let adv = p.advectSteps;
  adv = capByFrame(adv, p.frame);
  dst.set(flowFieldWarp(src, w, h, p.noiseScale, p.octaves, p.lacunarity, p.gain, str, p.curl, adv, noise, interp, modulate));
}
```

**Note:** `flowFieldWarp` must also accept and apply `modulate` per-pixel for `noiseScale`, `strength`, and `curl` to actually vary. This change spans both the node and `geometry/warp.js`. Coordinate with the warp algorithm owner. Do not implement without G1 fix in place (unverifiable until driver UI works).

**Dependency:** G1 (driver UI must be functional to test).

---

### P2 — LOW: Add `previewMax: 4` to `octaves`

**File:** `assets/js/tools/processors/distort/nodes/warp/FlowFieldNode.js`

```js
octaves: { value: 3, min: 1, max: 8, step: 1, label: 'OCTAVES', tier: 4, driveable: true, unit: 'n', previewMax: 4 },
```

Brings `octaves` in line with NOISE category peers (`perlinoverlay`, `domainwarp`). Reduces PREVIEW per-pixel cost at high `octaves` from 48 to 24 evaluations (advectSteps capped at 3).

---

### P3 — LOW: Cache `PerlinNoise` instance by seed

**File:** `assets/js/tools/processors/distort/nodes/warp/FlowFieldNode.js`

Move noise construction outside `apply()` or cache by `nodeSeed`. Only reconstruct when `ctx.nodeSeed` changes. Avoids permutation table rebuild on every render call. Impact is modest at default params but non-negligible at high `octaves` and `advectSteps`.

**Caution:** Factory pattern (`createEffectModule`) does not expose module-level state by default. Verify the factory contract before implementing. If not supported, document as deferred.

---

### P4 — DEFERRED: User-facing SEED param

Do not add until `NoiseSourceControl` shared component exists (G11). When it does, wire seed through that component rather than as a raw integer slider.

---

## Verification Criteria

| # | Criterion | Method |
|---|-----------|--------|
| V1 | Module renders correctly in FULL and PREVIEW quality | Visual: load image, apply FLOW FIELD, compare PREVIEW vs FULL at default params |
| V2 | `strength` in PREVIEW is scaled by `ctx.previewScale` — displacement visually equivalent to FULL at same param value | Visual: toggle PREVIEW/FULL with strength=40, verify displacement appears proportional |
| V3 | `advectSteps` capped at 3 in PREVIEW, `strength` capped at 60 | Confirm via NodePanel param display in PREVIEW mode |
| V4 | `curl=0` produces irrotational (stretching/converging) flow; `curl=±1` produces purely rotational (swirling) flow | Visual: set curl to 0, then ±1; verify qualitative character changes |
| V5 | `frame` param drives advectSteps via `capByFrame` correctly — does not reduce below 1; does not exceed `advectSteps` max | Unit: call `capByFrame(advectSteps, frame)` for boundary values (frame=0, frame=1, frame=240) |
| V6 | LIQUID preset loads with `flowfield` node at `noiseScale:4, octaves:4, strength:80, curl:0.3, advectSteps:4` | Registry PRESETS.LIQUID — confirm param values match |
| V7 | DATAMOSH preset loads with `flowfield` node at `noiseScale:5, octaves:3, strength:30, curl:0, advectSteps:2` | Registry PRESETS.DATAMOSH — confirm param values match |
| V8 | After P1: driver slot on `noiseScale`, `strength`, `curl` produces visible per-pixel variation when a driver is attached | Requires G1 fix first |
| V9 | After P2: at `octaves=8` in PREVIEW, effective octaves is capped at 4 | Confirm via profiling or param display |
| V10 | All param `unit` fields rendered in NodePanel slider rows | Visual: inspect NodePanel for each param row |
