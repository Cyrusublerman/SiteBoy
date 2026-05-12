# Blender G-code Workflow - Video Synthesis Design Guide

Combined synthesis of the supplied videos:

```text
Curve-profile G-code builder / multi-part bowl
Bending G-code with overhang using Boundary Brush
Setting up test prints
Understanding print failures
Creating complex patterns with Stitch Maker
Non-planar starter setup
```

Purpose: convert video workflow observations into build rules for our Blender G-code system.

---

## 1. Core Workflow Observed

The video workflow is not a normal slicer workflow.

```text
draw/edit curve profile
  -> generate wrapper surface
  -> generate spiralised G-code path
  -> deform wrapper
  -> G-code follows wrapper
  -> preview line thickness / tool clearance
  -> isolate risky section if needed
  -> export with NozzleBoss
```

Primary method:

```text
design the toolpath directly in Blender
do not model a finished object and send it to a slicer
```

The geometry is composed from several live objects:

| Object | Meaning |
|---|---|
| Curve | User-edited profile source |
| Wrapper | Deformable surface used to bend/control the print path |
| G-code | Actual spiralised printable toolpath |
| Build volume | Printer limit reference |
| Nozzle/toolhead | Collision and clearance reference |

---

## 2. Curve-Wrapper-G-code Triad

The most important design pattern is the triad:

```text
Curve profile -> Wrapper surface -> G-code toolpath
```

### Curve

Role:

```text
fast editable source shape
```

Behaviour:

```text
editing the curve updates wrapper and G-code
curve handle mode changes shape quality
profile can be duplicated into separate parts
```

Design implication:

```text
SRC_Curve must remain live and cheap to edit.
Changing the profile must not require rebuilding the whole export object manually.
```

### Wrapper

Role:

```text
deformation carrier
```

The wrapper is not the printed path. It is a control surface used to bend, shrinkwrap, sculpt, crease, and weight-paint the path.

Observed operations:

```text
apply wrapper modifiers before direct edit / weight paint
weight paint vertex groups for graded shrinkwrap
bind G-code to wrapper via Surface Deform
unbind and rebind when wrapper vertex count changes
use Boundary Brush to bend wrapper without adding geometry
use creases to control bend sharpness under subdivision
```

### G-code

Role:

```text
printable spiralised path mesh
```

Observed controls:

```text
layer height
height / number of layers
segments per revolution
stitch maker pattern modifiers
Surface Deform binding to wrapper
Solidify preview toggle
```

---

## 3. Critical Difference from Our Target Architecture

The videos use `SurfaceDeform` as an active design mechanism.

Our audit found:

```text
SurfaceDeform strips Flow/Speed/Tool vertex colour attributes.
NozzleBoss export fails if attributes are written before SurfaceDeform.
```

Therefore the design guide is:

```text
SurfaceDeform is allowed only before final nozzleboss attribute writing.
Flow/Speed/Tool must be written after all wrapper deformation is baked/resolved.
```

Implementation-safe model:

```text
Design stage:
  curve -> wrapper -> deformed path preview

Export stage:
  evaluated/deformed ordered path
    -> NB_StripMesh
    -> NB_WriteAttributes
    -> NB_ContractCheck
    -> NozzleBoss
```

Forbidden final stack:

```text
NB_WriteAttributes -> SurfaceDeform -> export
```

Allowed final stack:

```text
SurfaceDeform / wrapper deformation -> NB_StripMesh -> NB_WriteAttributes -> export
```

Preferred long-term rule:

```text
wrapper deformation produces an ordered path curve
export mesh is rebuilt from that path curve
NozzleBoss attributes are written last
```

---

## 4. Wrapper Deformation Guide

### 4.1 Binding

When G-code is driven by a wrapper:

```text
G-code SurfaceDeform target = wrapper
Bind after wrapper topology is final
Unbind before changing wrapper vertex count
Rebind after changing wrapper vertex count
```

Wrapper vertex count changes include:

```text
deleting top vertices
extruding wrapper height
adding loop cuts
changing topology with dynamic sculpting
```

Forbidden for wrapper used by SurfaceDeform:

```text
Dyntopo sculpting
uncontrolled remesh
topology-changing edits after bind
```

Reason:

```text
SurfaceDeform depends on stable source/target topology.
```

### 4.2 Boundary Brush

The Boundary Brush is used because it bends boundary regions rather than simply pushing surface points.

Required brush settings:

```text
Brush unit size = Scene, not View
```

Reason:

```text
Scene size keeps the edited physical length stable as the view zoom changes.
```

Viewport notes:

```text
Use wireframe mode to see the editable wrapper topology.
Brush radius is limited by viewport size.
Zoom out before setting a very large bend radius.
The white boundary line is the real affected length; yellow circle is a view-space guide.
```

### 4.3 Creases

Crease rings are used to preserve layer spacing through steep bends.

Observed failure:

```text
smooth bend compressed the path spacing from 0.4mm to around 0.32-0.37mm in overhang transition zones
```

Fix:

```text
select bend ring(s)
set Mean Crease near 1.0
adjust crease down if a softer bend is needed
```

Design implication:

```text
WRAP_CreaseControl should be a first-class process.
POST_BlurXY must not erase intended wrapper crease behaviour.
```

---

## 5. Layer Height, Nozzle Size, and Extrusion Width

The videos distinguish three different physical values:

| Value | Meaning |
|---|---|
| Physical nozzle diameter | Hardware hole size, e.g. 0.8mm |
| NozzleBoss nozzle size | Extrusion width used for material calculation |
| Layer height / path offset | Distance between adjacent spiral turns or layers |

Rules observed:

```text
For vertical walls: layer height should be near or below nozzle diameter.
For steep overhangs: layer/path offset may need to be slightly above nozzle width to create clearance.
NozzleBoss nozzle size may be tuned below physical nozzle diameter to reduce extrusion.
```

Example values:

```text
physical nozzle = 0.8mm
NozzleBoss nozzle size = 0.6mm to 1.0mm tuning range
overhang layer height = 0.84mm
```

Failure cause:

```text
if adjacent overhang passes are too close, excess material has nowhere to go
material bulges sideways
next pass hits the bulge
failure accumulates along the path
```

Design implication:

```text
PRINT_Params must separate:
- physical_nozzle_diameter
- extrusion_width_nozzleboss
- layer_height
- overhang_clearance_offset
```

Do not collapse all of these into one `nozzle_diameter` value.

---

## 6. Stitch Maker Design Rules

Stitch Maker is both structural and decorative.

Observed controls:

| Control | Meaning |
|---|---|
| gap per stitch | distance between repeated stitch events |
| stitch length | how many path segments extend out/in per stitch |
| stitch offset | angular/sequence phase shift |
| start level | lower layer bound of pattern |
| height/end level | upper layer bound of pattern |
| stitch depth | radial depth of pattern |
| switch direction | winding inversion |
| iterations | smoothing amount |

Pattern method:

```text
add one stitch maker modifier
duplicate it to layer pattern blocks
change start/end bounds
change offset
change gap and length
use multiple stitch makers to compose complex patterns
```

Segments-per-revolution rule:

```text
choose segment counts divisible by useful pattern counts
```

Observed example:

```text
segments_per_revolution = 192
192 / 3 = 64
```

Reason:

```text
patterns align around the circumference when segment count divides cleanly
changing segments per revolution twists / phases the pattern up the object
```

Design implication:

```text
PATTERN_Stitch should be modular and stackable.
Pattern phase should be expressed formally:
  selected = ((path_index + offset) mod gap_per_stitch) < stitch_length
```

Validation:

```text
stitch_length <= gap_per_stitch
gap_per_stitch > 0
segments_per_revolution % repeat_count == 0 when exact repeat alignment is requested
```

---

## 7. Toolhead and Gantry Clearance

The videos use physical clearance previews:

```text
nozzle asset
part-cooling fan clearance
gantry/belt proxy
build volume asset
```

Observed constraints:

```text
plastic printing is more collision-sensitive than ceramic
part cooling fan can be the limiting collision feature
A1 Mini has asymmetric clearance directions
newer H2S fan design has more symmetric clearance
small vertical moves may tolerate steeper angles
large moves across whole print require shallower toolhead-clearance angle
```

Design implication:

```text
VIZ_ToolheadClearance should be part of the design workflow.
```

Minimum guide object set:

| Object | Purpose |
|---|---|
| Nozzle cone/cylinder | Check bead placement and local clearance |
| Fan shroud proxy | Check overhang collisions |
| Gantry/belt proxy | Check already-printed parts during multi-part sequence |
| Build volume | Check printer limits |

Future validation:

```text
TOOL_ClearanceCheck(path, printed_geometry, toolhead_proxy)
```

This is not required for first implementation, but the architecture should leave room for it.

---

## 8. Multi-Part Stacking and Print Order

Observed bowl workflow:

```text
make bowl body
duplicate curve/wrapper/G-code collection
shape one foot
bind/deform foot to body wrapper
duplicate foot collection around 3D cursor
rotate 120 degrees
check clearance between already-printed parts and next toolpath
```

Important print-order rule:

```text
parts cannot be considered independently
the toolhead may collide with already-printed parts when printing later parts
```

Design implication:

```text
PART_Sequence must exist before reliable multi-part export.
```

Minimum data:

```text
part_id
print_order
part_bounds
completed_geometry_before_part
toolhead_clearance_proxy
```

For v1:

```text
single export object / single path is supported
multi-part print order is manual and must be previewed
```

---

## 9. Layer Thickness Preview

The videos use a shader/preview to show layer-line thickness or stretching.

Purpose:

```text
warn when deformation causes local path spacing to become too thick or too compressed
```

Observed interpretation:

```text
darkest/marked regions show thickest or most stressed layer spacing
stretched foot paths are visually obvious
overhang transition zones are high risk
```

Design implication:

```text
DEBUG_LayerSpacingPreview is required.
```

Inputs:

```text
ordered path
layer_index
neighbouring path/layer positions
physical_nozzle_diameter
extrusion_width
```

Outputs:

```text
spacing_mm
spacing_ratio = spacing_mm / extrusion_width
too_close flag
too_far flag
viewport colour/material preview
```

Recommended thresholds:

```text
too_close: spacing_ratio < 0.85
ideal:     0.95 <= spacing_ratio <= 1.15
too_far:   spacing_ratio > 1.25
```

These thresholds are provisional and printer/material-dependent.

---

## 10. Test Print Extraction Workflow

The videos test only risky sections instead of printing the whole object.

Manual workflow:

```text
duplicate G-code object
apply SurfaceDeform
apply stitch modifier(s)
delete Solidify
convert to mesh
select risky face band
separate by selection
delete unused part
flatten bottom rim
set origin to flattened rim
snap origin to build-plate centre
export normally
```

Flattening method:

```text
select bottom rim
set pivot = Active Element
S -> Z -> 0
G + Shift for fine vertical adjustment
```

Design implication:

```text
TEST_ExtractBand should become a helper workflow.
```

Possible automation:

```text
input: export path mesh, layer_start, layer_count
output: flat-bottom test coupon placed at bed centre
```

Validation:

```text
test coupon must preserve risky overhang/pattern geometry
test coupon may add a deliberately flattened base layer
```

---

## 11. Failure Analysis Guide

Failure described:

```text
print starts clean
pattern clarity degrades
surface becomes bobbly
overextrusion accumulates along overhang
```

Elimination logic:

```text
same settings across failed region
same extrusion width
same overhang
same layer height
therefore failure is due to cumulative material build-up along path, not local parameter change
```

Physical explanation:

```text
adjacent nozzle positions are too close
extruded bead has no lateral escape room
material bulges
next pass collides with bulge
bulge grows over repeated passes
```

Fixes observed:

```text
reduce NozzleBoss nozzle size / extrusion width
keep stitch variation so passes touch intermittently rather than forming a continuous compressed wall
increase overhang path offset slightly where clearance is required
test a small risky band before full print
```

Design implication:

```text
PRINT_FailureGuide should expose tunable parameters:
- extrusion_width_nozzleboss
- physical_nozzle_diameter
- layer_height
- overhang_spacing
- stitch_depth
- stitch_gap
- speed
- flow
```

---

## 12. Boundary Brush Overhang Guide

The boundary brush can preserve layer spacing better than freeform deformation, but only if the wrapper topology supports it.

Guide:

```text
1. Extend wrapper to match G-code height.
2. Add enough loop cuts for bend control.
3. Bind G-code to wrapper only after wrapper topology is stable.
4. Use Boundary Brush with scene unit size.
5. Use wireframe to see real editable loops.
6. Use crease rings at steep bends.
7. Measure local layer spacing after bend.
8. If compressed, increase crease or adjust wrapper topology.
```

Rule:

```text
for non-planar overhangs, preserving local path spacing matters more than producing visually smooth wrapper curvature
```

Counter-intuitive finding:

```text
a sharper creased bend can print better than a visually smoother bend
```

Reason:

```text
the creased bend preserved layer spacing closer to 0.4mm
the smooth bend compressed spacing in the critical transition zone
```

---

## 13. NozzleBoss Setup Guide

Required user setup before export:

```text
set NozzleBoss nozzle size / extrusion width
set travel speed
set extrusion speed
set Flow/Speed/Tool layer behaviour through vertex colours
ensure Start/End/T0/T1 text blocks exist
```

Observed advice:

```text
0.8mm physical nozzle at 30mm/s extrusion speed may be near printer limit
20mm/s may be safer for large-nozzle plastic printing
NozzleBoss nozzle size may be tuned below physical nozzle to reduce material
```

Design implication:

```text
PRINT_Params must include NozzleBoss export settings separately from geometric layer settings.
```

---

## 14. Required New Design Guides for Our Build

### 14.1 SETUP_BlenderEnvironment

Must define:

```text
Blender 4.5+
asset browser path
viewport clipping for 1 BU = 1 mm
required add-ons
NozzleBoss ZIP install
startup file save
text preset folder
```

### 14.2 SRC_CurveWrapperPath

Must define:

```text
Curve profile edits generate/update wrapper and G-code.
Wrapper controls deformation.
G-code is export candidate, not design-control surface.
```

### 14.3 WRAP_DeformPath

Must define:

```text
SurfaceDeform can be used for design preview.
Final export must rebuild/write attributes after deformation.
Wrapper topology must be stable before bind.
```

### 14.4 PATTERN_StitchStack

Must define:

```text
multiple stitch modifiers/groups may compose one pattern
gap, length, offset, start, height, depth are explicit parameters
segment count divisibility controls repeat alignment
```

### 14.5 DEBUG_LayerSpacingPreview

Must define:

```text
preview local path spacing against nozzle/extrusion width
mark too-close and too-far zones
support overhang-risk visualisation
```

### 14.6 VIZ_ToolheadClearance

Must define:

```text
nozzle, fan, gantry/belt proxies
collision check for overhang and multi-part sequence
printer-specific clearance profiles
```

### 14.7 TEST_ExtractRiskBand

Must define:

```text
select risky layer band
separate test coupon
flatten base
snap to bed centre
export as normal
```

---

## 15. Required Changes to Current Target Architecture

Add to `11-target-architecture.md`:

```text
SETUP_BlenderEnvironment as precondition section.
SRC_CurveWrapperPath as source mode.
WRAP_DeformPath as design-stage group/process before NB_StripMesh.
DEBUG_LayerSpacingPreview as validation/debug output.
VIZ_ToolheadClearance as optional visual aid.
TEST_ExtractRiskBand as helper/export utility.
PRINT_Params split into physical_nozzle_diameter, extrusion_width_nozzleboss, layer_height, overhang_spacing.
```

Modify current rule:

```text
No SurfaceDeform in final export stack
```

to:

```text
SurfaceDeform may be used only before final strip mesh rebuild and attribute write.
No SurfaceDeform after NB_WriteAttributes.
```

Add validation:

```text
layer_spacing_ratio check
toolhead_clearance check
segment divisibility check for exact repeat patterns
test coupon export path
```

---

## 16. Synthesis: What Our Build Should Become

The videos show a workflow with three distinct layers:

```text
1. Human design layer:
   curve editing, wrapper sculpting, snapping, origin placement, build-volume awareness

2. Toolpath construction layer:
   spiral path, stitch patterns, layer schedule, wrapper deformation, non-planar bends

3. Export safety layer:
   strip mesh rebuild, vertex order, Flow/Speed/Tool writing, NozzleBoss export, test coupons
```

Our current docs strongly cover layer 2 and part of layer 3.
They under-cover layer 1 and the physical print-risk feedback loops.

The build should therefore prioritise:

```text
Design affordances:
  fast curve/wrapper editing
  live build-volume and toolhead context
  layer spacing preview

Export invariants:
  ordered path
  no attributes before deformation
  Flow/Speed/Tool last
  test high-risk bands before full print
```

Final principle:

```text
Blender is not just generating geometry.
Blender is the print-design cockpit: shape, toolpath, clearance, risk preview, and export contract must be visible together.
```
