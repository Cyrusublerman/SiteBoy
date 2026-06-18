# OTSUTHRESHOLD — Build Guide

- module: otsuthreshold
- node: OtsuThresholdNode.js
- category: SEGMENTATION
- review verdict: KEEP
- rebuild severity: MODERATE

---

## Current State Summary

Factory module (`createEffectModule`). Correct implementation of Otsu's method on BT.601 luminance. Two params: `mode` (BINARY/MASK) and `invert` (toggle). All existing functionality is correct, efficient (O(n)), and stable. No crashes, no NaN, no arch violations.

Weaknesses are scope, not correctness. The module is a black box: the computed threshold `t` is never surfaced, cannot be biased, and the input domain is fixed to luminance. No SOFT MASK or FIELD output mode. No post-segmentation cleanup. No `driveable` params (none exist yet, but the review mandates adding numeric params — all of which must be driveable per G2).

`apply()` signature is truncated — `ctx` and `modulate` are absent. No current consequence, but mandatory before any driveable param is added.

---

## Reference Parity Gaps

Reference source (`reference/distort/otsuthreshold/source/OtsuThresholdNode.js`) is identical to the live implementation — it is a pre-review snapshot. The reference pack documents the current module as fully paritymatched. No parity holes identified in `feature-parity.md`.

The review spec (`review2403`) defines an expanded target state beyond the reference snapshot:

| Feature | Reference | Live | Review Target | Gap |
|---|---|---|---|---|
| BINARY output mode | yes | yes | yes | none |
| MASK output mode | yes | yes | yes | none |
| INVERT toggle | yes | yes | yes | none |
| Alpha preserved | yes | yes | yes | none |
| Computed threshold exposed in UI | no | no | yes | **missing** |
| THRESHOLD OFFSET param (−128 to +128) | no | no | yes | **missing** |
| INPUT DOMAIN param (LUMA/R/G/B/SAT/CHROMA/GRADIENT/EXTERNAL) | no | no | yes | **missing** |
| SOFT MASK output mode | no | no | yes | **missing** |
| SOFTNESS param (0–64, visible when SOFT MASK) | no | no | yes | **missing** |
| FIELD output mode | no | no | yes | **missing** |
| CLEANUP: HOLE FILL toggle | no | no | optional | **deferred** |
| CLEANUP: ISLAND MIN AREA param | no | no | optional | **deferred** |
| Multi-level Otsu (CLASSES 2–4) | no | no | future | **deferred** |

---

## Review Spec Gaps

All mandatory items from `review2403` §Required Rebuild Specification §Minimum Acceptable Upgrade:

1. **[HIGH]** Computed threshold value not exposed — no read-only display of `t` in NodePanel.
2. **[HIGH]** THRESHOLD OFFSET param absent — user cannot shift the computed threshold.
3. **[HIGH]** INPUT DOMAIN param absent — luminance hardcoded; R/G/B/saturation/chroma/gradient inputs unavailable.
4. **[HIGH]** SOFT MASK output mode absent — MODE only offers BINARY/MASK; sigmoid boundary not supported.
5. **[HIGH]** FIELD output mode absent — segmentation result cannot be exported for downstream driver use.
6. **[MEDIUM]** `apply()` signature truncated — missing `ctx, modulate` args; required before any driveable param is wired.
7. **[LOW]** Inline `new Uint8Array(n)` on every call — GC pressure at high frame rates; acceptable now, mitigate when ctx buffer pool exists.

---

## Missing Parameters

All additions are mandated by `review2403` action items 1–5:

| Key | Label | Type | Min | Max | Step | Default | Tier | Driveable | Unit | Visibility |
|---|---|---|---|---|---|---|---|---|---|---|
| `domain` | `INPUT DOMAIN` | select | — | — | — | `'LUMINANCE'` | 3 | no | — | always |
| `offset` | `THRESHOLD OFFSET` | range | −128 | 128 | 1 | 0 | 3 | **yes** | (raw) | always |
| `softness` | `SOFTNESS` | range | 0 | 64 | 1 | 8 | 3 | **yes** | (raw) | only when `mode === 'SOFT MASK'` (G14) |
| threshold readout | `THRESHOLD` | display | — | — | — | — | 3 | no | (raw) | always; read-only computed value |

`mode` must be extended: `['BINARY', 'MASK', 'SOFT MASK', 'FIELD']`.

---

## Extra/Incorrect Parameters

None. Existing `mode` and `invert` params are correct and must be retained.

---

## UI Compliance Issues

| Issue | Source | Severity |
|---|---|---|
| `apply()` missing `ctx, modulate` — required by factory contract | issues-and-conflicts.md | WARN |
| No `driveable: true` on any numeric param — no range params currently exist, but all that are added must be driveable per G2 | G2 | WARN |
| No unit annotation on `offset` or `softness` — must be defined per-param for NodePanel renderer per G16 | G16 | WARN |
| Mode-conditional params (`softness`) must be hidden when `mode !== 'SOFT MASK'` — not yet implemented (no such params yet) | G14 | WARN |
| No slider direct-input or double-click-to-default on new range params (no range params exist yet; applies immediately upon addition) | G5 | WARN |

---

## Global Issues

| ID | Title | Applicability to this module |
|---|---|---|
| G1 | Driver (+D) button non-functional | Applies once `offset` and `softness` params are added — +D slots will exist but will not open driver settings until G1 is fixed globally |
| G2 | All numeric params must be driveable | `offset` and `softness` must carry `driveable: true`; no existing range params to retrofit |
| G5 | Slider direct input + double-click-to-default | Applies to `offset` and `softness` once added; slider component fix is global, not per-module |
| G6 | Canvas click-to-pick for centre params | Not applicable — no centre X/Y param |
| G7 | Vector modules must be identifiable | Not applicable — pixel module |
| G9 | Time/iteration modules must expose FRAME param | Not applicable — no internal time state |
| G10 | Vector modules need in-module SVG export | Not applicable — pixel module |
| G11 | Shared components for overlapping feature additions | FIELD output and INPUT DOMAIN select are candidates for shared components if other segmentation-category modules are added in future; at present this is the sole SEGMENTATION module so no cross-module duplication risk |
| G12 | Web worker usage | Not applicable — O(n) linear; no worker needed |
| G14 | Mode-conditional params must be hidden | `softness` must be hidden when `mode !== 'SOFT MASK'`; implement via `when` field in param definition |
| G16 | Slider/number inputs must display units | `offset`: no dimensional unit (raw value 0–255 range); `softness`: no dimensional unit; both must declare explicit unit labels in param definition |

---

## Merge Absorption

No merge absorptions required. The current source is identical to the archived reference. No divergence.

---

## Required Changes (priority ordered)

**1. Extend `apply()` signature** (prerequisite for all driveable params)
- Change: `apply(src, dst, w, h, p)` → `apply(src, dst, w, h, p, ctx, modulate)`
- File: `OtsuThresholdNode.js`
- No logic change — `ctx` and `modulate` unused until driveable params are wired.

**2. Extend `mode` options**
- Add `'SOFT MASK'` and `'FIELD'` to `options` array.
- File: `OtsuThresholdNode.js`, `mode` param definition.

**3. Add `domain` param (INPUT DOMAIN)**
- `type: 'select'`, options: `['LUMINANCE', 'RED', 'GREEN', 'BLUE', 'SATURATION', 'CHROMA', 'GRADIENT', 'EXTERNAL']`
- Default: `'LUMINANCE'`, tier 3, no driveable.
- Implement domain-specific sampling in the luma extraction pass:
  - LUMINANCE: existing BT.601 formula (no change)
  - RED/GREEN/BLUE: direct channel read
  - SATURATION: HSL-converted S channel
  - CHROMA: `sqrt((R-L)²+(G-L)²+(B-L)²)` normalised, or Euclidean distance from achromatic
  - GRADIENT: Sobel magnitude of luminance, normalised to 0–255
  - EXTERNAL: reserved; fall through to LUMINANCE until field wiring is available

**4. Add `offset` param (THRESHOLD OFFSET)**
- `type: 'range'`, min: −128, max: 128, step: 1, default: 0, tier: 3, `driveable: true`, unit: `''` (raw).
- Apply after computing `t`: clamped effective threshold = `Math.max(0, Math.min(255, t + p.offset))`.
- Wire `modulate('offset', i)` in apply loop if driveable.

**5. Add `softness` param (SOFTNESS)**
- `type: 'range'`, min: 0, max: 64, step: 1, default: 8, tier: 3, `driveable: true`, unit: `''`.
- Visibility: `when: { mode: 'SOFT MASK' }` — hidden unless mode is SOFT MASK (G14).
- Used in SOFT MASK output: sigmoid boundary `s = 1 / (1 + exp(-(luma[i] - tEff) * (softness || 1) / 16))`.

**6. Implement SOFT MASK output mode**
- When `p.mode === 'SOFT MASK'`: compute sigmoid weight `s` per pixel using `tEff` and `p.softness`.
- If `p.invert`: `s = 1 - s`.
- `dst[j] = src[j] * s; dst[j+1] = src[j+1] * s; dst[j+2] = src[j+2] * s;`

**7. Implement FIELD output mode**
- When `p.mode === 'FIELD'`: write `bit × 255` (or `s × 255` if soft) to all three channels as a scalar field — identical visually to BINARY but semantically tagged as a field for downstream driver use.
- Downstream field consumption is a pipeline/driver system concern; the module need only write the scalar correctly.

**8. Expose computed threshold as read-only display value**
- After computing `tEff`, write to a `computed.threshold` slot (or equivalent NodePanel hook) to render a read-only label in the panel.
- Implementation depends on the NodePanel's mechanism for computed/display-only values — use existing pattern from other modules if available; otherwise coordinate with NodePanel engineer.

**9. Add unit labels to all new numeric params (G16)**
- `offset`: unit `''` (no label — raw signed integer). Document as "shift applied to Otsu threshold before classification".
- `softness`: unit `''`. Document as "sigmoid sharpness — higher = harder edge".
- Both param definitions must include unit field consumed by NodePanel slider component.

---

## Verification Criteria

1. **Existing functionality preserved:** BINARY and MASK modes produce identical output to pre-change implementation at all `invert` states.
2. **THRESHOLD OFFSET:** Setting offset to +50 on a bimodal image demonstrably shifts the classification boundary toward brighter pixels; −50 shifts toward darker. Clamped to [0, 255] — no NaN, no out-of-bounds.
3. **INPUT DOMAIN:** Switching from LUMINANCE to RED produces a different threshold on an image with strongly chromatic content. GRADIENT domain thresholds on edge magnitude, not tonal value.
4. **SOFT MASK:** Output at SOFTNESS=0 approximates hard MASK; at SOFTNESS=64 the boundary is visibly blurred/graduated. Alpha preserved.
5. **FIELD mode:** Output is a grayscale scalar (visually identical to BINARY); pipeline driver system can read this channel as a modulation map.
6. **`driveable: true`** on `offset` and `softness` — +D buttons appear in NodePanel on both params once G1 is resolved.
7. **`softness` hidden** when `mode` ≠ `'SOFT MASK'` — NodePanel does not render the row.
8. **`apply()` signature** is `apply(src, dst, w, h, p, ctx, modulate)` — no regression in factory wiring.
9. **Unit labels** render in NodePanel for `offset` and `softness` slider rows.
10. **Computed threshold readout** updates on every render to reflect the actual `tEff` used for the current image.
11. **No raw hex/rgb colours, no document.*, no RAF, no setInterval** introduced.
