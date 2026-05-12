# Blender G-code Workflow — nozzleboss Export Contract

## 1. Role

nozzleboss is the preferred G-code writer.

The Blender workflow should produce an object nozzleboss can serialise, rather than writing G-code directly from Geometry Nodes.

Repository:

```text
https://github.com/Heinz-Loepmeier/nozzleboss
```

## 2. Contract Summary

nozzleboss expects a mesh whose geometry encodes the print path.

Important assumptions:

- path order matters;
- vertex order matters;
- polygon area can be used to derive extrusion;
- vertex colours modulate export behaviour;
- G-code is emitted by walking the mesh/path structure.

## 3. Required Vertex Colour Channels

| Channel | Purpose |
|---------|---------|
| `Flow` | Extrusion multiplier |
| `Speed` | Feed-rate multiplier |
| `Tool` | Tool/macro selection |

The workflow must produce these layers before export.

## 4. Bridge from GN Attributes

GN may store:

```text
flow: float
speed: float
tool: int/float
```

nozzleboss needs:

```text
Flow: vertex colour
Speed: vertex colour
Tool: vertex colour
```

Required bridge:

```text
NB_WriteAttributes
```

## 5. Path Mesh Conversion

Input:

```text
ordered path curve
layer height
extrusion width
```

Output:

```text
upright strip mesh accepted by nozzleboss
```

Concept:

```text
top edge = nozzle path
bottom edge = top edge shifted by -layer_height in Z
quad strip = extrusion representation
```

The exact construction must match nozzleboss's documented/observed expectation.

## 6. Vertex Order

nozzleboss depends on traversal order.

Problem:

```text
Geometry Nodes may scramble vertex indices.
```

Decision:

```text
Before export, build the strip mesh from the ordered path curve and validate top-edge order.
```

Construction invariant:

```text
for each path point P_i:
  top_i = P_i
  bottom_i = P_i - (0, 0, layer_height_at_i)
  path_index(top_i) = i
  strip_side(top_i) = top

for each segment i -> i+1:
  create one upright quad from bottom_i, top_i, top_{i+1}, bottom_{i+1}
```

Validation:

```text
top-edge path_index is strictly increasing
distance(top_i, top_{i+1}) should be locally plausible
no large jump unless marked travel/macro
```

Repair policy:

```text
do not repair arbitrary evaluated meshes
if order validation fails, rebuild the strip from the ordered path curve
```

## 7. Layer Height Consistency

The path mesh strip height must equal the print layer height.

Required invariant:

```text
strip_height == layer_height
```

All groups consuming layer height must receive the same value.

## 8. Speed Mapping

Viewport material speed preview is optional.

Export speed must map to:

```text
Speed vertex colour
```

Potential mapping:

```text
Speed colour value 0..1 -> feed multiplier
```

Exact range should match nozzleboss configuration.

## 9. Flow Mapping

Flow multiplier must map to:

```text
Flow vertex colour
```

Potential use:

- seam compensation;
- curvature compensation;
- artistic extrusion variation;
- bead width experiments.

## 10. Tool Mapping

Tool channel can trigger:

- T0/T1;
- macro text blocks;
- filament changes;
- temperature changes;
- custom printer actions.

The workflow should expose tool assignment as path metadata, not hard-coded G-code.

## 11. Contract Validation

Before running nozzleboss export, check:

- object is mesh;
- required vertex colour layers exist;
- `Flow`, `Speed`, `Tool` are `BYTE_COLOR` attributes on the corner domain;
- vertex count > 0;
- polygon count > 0;
- no NaN coordinates;
- no origin jumps;
- no impossible edge length;
- strip height matches layer height;
- top-edge `path_index` is monotonic;
- object bounds fit inside printer build volume;
- object units are millimetre-consistent;
- vertex order follows toolpath order.

## 12. Failure Policy

If contract validation fails:

```text
do not export
show debug geometry
report failure class
```

Failure classes:

| Class | Meaning |
|-------|---------|
| EmptyPath | no printable geometry |
| OriginJump | sampled empty curve or invalid bridge |
| MissingColour | Flow/Speed/Tool not present |
| BadOrder | vertex traversal not path traversal |
| BadLayerHeight | strip height mismatch |
| OutOfBounds | outside build volume |

## 13. Future Python Role

Python remains useful for:

- auditing nozzleboss contract;
- batch export;
- report generation;
- fallback exporter if nozzleboss cannot express a path class.

Python should not replace nozzleboss until a specific nozzleboss limitation is proven.

