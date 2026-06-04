# Glyph Rig Deformation

**Status:** DESIGN | **Cluster:** plotter-paths

Supersedes Zhang–Suen thinning (v5a) and distance-field ridge detection (v5b).

**Aim:** Extract a minimal stick-figure rig from each glyph (anchors + curves) derived directly from OpenType path structure. Deform via anchor translation rather than outline-vertex translation. Reapply thickness at render time.

---

## Why previous approaches failed

**v5a — Zhang–Suen thinning.** Dense pixel paths; ignored typographic structure. Failures: off-centre medial axis (I), curved extremity gaps (O/D/B), diagonal fragmentation (A/V/W).

**v5b — Distance-field ridge detection.** Failures: missed diagonal strokes (V/A), 2px-wide ridges on rectangular strokes flagged as false junctions (I), spurious ridge fragments from stroke-end feathering.

**Root cause shared by both:** Operate on rasterised pixel data and reconstruct structure from it. The structure is already present in the OpenType path commands. New pipeline reads from vector outline directly; uses distance field only as a per-stroke thickness probe.

---

## Pipeline

| Stage | Name | Input | Output |
|---|---|---|---|
| 1 | Extract rig | OpenType path | `{anchors, curves, thickness}` |
| 2 | Store rest pose | Rig | Anchor `(u,v)` in glyph bbox |
| 3 | Bilinear deform | Rest `(u,v)` + target quad | Anchor screen positions |
| 4 | Curve reconstruction | Deformed anchors | Curve polylines |
| 5 | Thickness sweep | Curves + stored thickness | Filled outline |
| 6 | Render | Filled outline | Pixels |

Stages 3–6 exist in v5. New work = stages 1–2 (rig extraction).

---

## Algorithm

### Stage 1 — Contour flattening
Flatten OpenType `moveTo/lineTo/quadraticCurveTo/cubicCurveTo/close` to polylines via recursive adaptive subdivision (tolerance: 0.2px at reference size). Reuses `GlyphGeometryBuilder._pc`.

**Output:** `contours: Array<Array<{x,y}>>` — one polyline per closed contour.

### Stage 2 — Curvature sampling
Resample each contour to fixed density (~100 samples or proportional to arc length). At each sample `i`, compute signed turning angle:
```
θ_i = signed_angle( p[i-k] → p[i],  p[i] → p[i+k] )
```
Sign from cross product (positive = convex for outer contour, negative = concave).

**Output:** `turning: Float32Array`

### Stage 3 — Corner detection
Corner candidate if: `|θ_i| > 15°` AND `|θ_i|` is a local maximum within `±k` samples (NMS).

**Output:** `corners: Array<{x, y, angle, sign, contourIdx, sampleIdx}>`

### Stage 4 — Corner classification and pairing

**Rule A — End-cap pair:** Two convex corners within `d ≤ stroke_width × 1.5` along contour, combined turning ≈ 180° → one anchor at midpoint.

**Rule B — Bend pair:** One concave + one convex corner approximately opposite across glyph body (`d ≤ stroke_width × 2`) → one anchor at midpoint.

**Rule C — Junction pair:** Two concave corners within `d ≤ stroke_width × 1.5` → one anchor at midpoint.

**Rule D — Bowl extrema:** Contour with no corners above threshold → 4 synthetic anchors at bounding-box extrema (top/right/bottom/left).

### Stage 5 — Anchor synthesis
Walk corner-pair classifications; emit anchors at midpoints per rule above.

### Stage 6 — Stroke linking
Two anchors connect iff there is a contour arc from one pair's corners to the other's that passes through the glyph interior without looping back. Junction anchors emit multiple curves. Bowl extrema form a cycle.

**Output:** `curves: Array<{a0, a1}>`

### Stage 7 — Thickness probe
Sample distance field at N points along each curve's straight-line path. Store mean distance-to-edge as stroke half-width per curve. Used at render to sweep constant thickness.

---

## Expected anchor counts

| Glyph | Anchors | Breakdown |
|---|---|---|
| I | 2 | 2 end-caps |
| L | 3 | 2 end-caps + 1 bend |
| T | 4 | 2 end-caps + 1 junction + 1 end-cap |
| O | 4 | 4 bbox extrema (Rule D) |
| A | 5 | apex junction + 2 baseline end-caps + 2 crossbar junctions |
| e | 7 | 4 bowl extrema + 2 crossbar-bowl junctions + 1 terminal end-cap |

---

## Deformation integration

Bilinear warp applied **only to anchors**:
```
anchor_out = bilinear(anchor_rest_uv, targetQuad)
```
Curves follow; thickness reapplied at render via stroke sweep.

**Performance:** Typical glyph outline: 60–200 vertices. Rig: 2–8 anchors. 10–100× reduction in per-frame deformation work. One-time rig extraction + one-time thickness sweep per frame.

---

## Class architecture

```
ContourFlattener     OpenType commands → polyline contours (reuses GlyphGeometryBuilder._pc)
CurvatureSampler     contours → per-sample turning angles
CornerDetector       turning angles → corner candidates (NMS + threshold)
CornerPairer         corners → classified pairs (end-cap / bend / junction / bowl-extrema)
AnchorSynthesizer    pairs → anchor positions
StrokeLinker         anchor pairs ↔ curve list
ThicknessProbe       curves + distance field → per-curve half-width
RigBuilder           orchestrator + cache (replaces v5 SkeletonExtractor)
```

**Public API unchanged from v5.** `RigBuilder.extract(char, font, res, threshold)` returns same result shape with new keys.

---

## Open questions

1. **Reference stroke-width for pairing thresholds:** Per-corner distance-field value, or glyph-wide mean? Proposal: glyph-wide mean for v1; per-corner as future refinement.
2. **Serifs/spurs:** Out of scope for v1 (sans-serif only). Future: merge close corner pairs at end-caps.
3. **Multi-contour glyphs (i, j, !):** Result includes `components` list, each `{anchors, curves, thicknesses}`. All components deform together.
4. **Single unpaired convex corners (e.g. 'a' terminal, 'g' ear):** Emit as spur anchor at corner; connect to nearest anchor via short curve.

---

## Implementation phases

| Phase | Scope | Acceptance |
|---|---|---|
| 1 | Contour flattening + curvature sampling | L curvature chart shows exactly 5 positive + 1 negative peak above 15°; O chart is flat |
| 2 | Corner detection + classification | Corner counts match expected values; colour markers visually correct on SVG |
| 3 | Anchor synthesis + stroke linking | Anchor counts match table ±1; curves pass through interior not counter holes |
| 4 | Browser integration | Every ASCII glyph produces rig; slider updates rig in real time |

---

## Acceptance criteria (full)

1. Every ASCII glyph (A–Z, a–z, 0–9, common punctuation) produces a rig with no errors.
2. Anchor counts match table for I/L/T/A/O/e within ±1.
3. Rig editor shows anchors, curves, corners (debug), and thickness per curve.
4. Threshold slider 0.3→3.0 produces visible rig changes.
5. No glyph produces zero anchors or zero curves (except space).
6. Same font/char/resolution/threshold always produces the same rig (cache correct).

---

## Rollback

Feature flag: `window.__USE_RIG_PIPELINE`. Default off until Phase 4 passes acceptance. Fallback: bounding-box quad deformation from v5. Zhang–Suen/distance-field code removed entirely.


---

## Related ideas

- [Pen Plotter](pen-plotter.md)
- [Complex Line Shading](../../tools/complex-line-shading/00-overview.md)
- [Stipple → Single-Line Path](stipple-single-line-path.md)
