# Blender G-code Workflow — Questions To Answer

## 1. System Purpose

- What kinds of printed objects should this workflow prioritise first?
- Is the main use case artistic surface toolpaths, functional slicing, or experimental extrusion?
- Is nozzleboss definitely the export target, or should the system keep a Python exporter path open?
- Should the workflow support only FDM, or also clay/paste/robot extrusion?
- What is the minimum successful end-to-end print?

## 2. Source Inputs

- Which source mode should be implemented first: mesh, curve, spiral maths, or pure maths?
- Should mesh input mean closed manifold meshes only?
- Should non-manifold meshes be rejected or repaired?
- Should curve inputs be treated as centreline paths, profiles, or surface generators?
- Should pure maths generate curves directly or generate intermediate meshes?
- Should source objects stay editable after path generation?

## 3. Units and Scale

- What unit is canonical: millimetres or Blender units?
- Does the current Blender scene use scale `0.001`, and if so how should that be normalised?
- Where should unit conversion happen?
- Should every distance socket include `mm` in its name?
- Should the export object be dimensioned in real printer millimetres?

## 4. Printer Process Parameters

- What is the first target printer?
- What is the build volume?
- What default layer height should be used?
- What default nozzle diameter should be used?
- What default extrusion width should be used?
- What speed range should be considered safe?
- How should travel speed be represented if nozzleboss mostly serialises print moves?
- Should pressure advance or retraction be encoded anywhere?

## 5. Contour Algorithms

- Which contour method should be the primary production method?
- Should weak methods remain in the UI as debug/preview algorithms?
- Should `CT_RadialRaycast` be clearly labelled convex-only?
- Should `CT_ZBandVertex` be hidden from normal use?
- Can `CT_SlabBoundary` be made robust enough without Python?
- Does true component tracing require Python, or can GN handle it?
- Should Mesh Boolean be revisited in the exact Blender version used for production?

## 6. Cross-Section Topology

- How should the system represent multiple loops at one Z level?
- Should every loop get a `component_id`?
- Should holes be printed before or after outer loops?
- Should multiple loops be connected into one continuous path?
- Should multiple loops produce separate nozzleboss paths?
- What is the policy for open contours from non-manifold meshes?
- How should tiny islands be filtered?

## 7. Ring Ordering

- Should ring order always be bottom to top?
- Should top-down printing ever be allowed?
- Should layers be evenly spaced, adaptive, or both?
- If adaptive Z is allowed, can nozzleboss represent it safely?
- Should ring count or layer height be the primary user control?
- Should `rings` be derived from `height / layer_height` instead of manually entered?

## 8. Seam Policy

- Should default seam direction be clockwise or counter-clockwise?
- Should seam selection minimise bridge length, preserve direction, or both?
- Should seams avoid high curvature?
- Should seams avoid visible front-facing regions?
- Should seams slow speed or reduce flow?
- Should seams be paintable by the user?
- Should each component have an independent seam?

## 9. Helix Mode

- Should helix mode be allowed for multi-component layers?
- Should helix bridges be printed as extrusion or travel?
- Should bridge length have a hard maximum?
- What happens if no valid next-ring seam exists?
- Should the first and final endpoints remain open in all helix modes?
- Should helix mode support multiple simultaneous helices?

## 10. Closed-Loop Mode

- Should closed-loop mode insert start/stop compensation?
- Should closed-loop seams align vertically?
- Should closed-loop seams be randomised, hidden, or user-controlled?
- Should closed loops be exported as separate paths or one object?

## 11. Post-Processing

- What is the default post-process order?
- Is fillet always before blur?
- Should blur always preserve Z?
- Should resample be by count or length by default?
- What is the max point count per ring?
- What is the max total point count before warning?
- Should simplification remove nearly collinear points?
- Should smoothing be disabled near seams?

## 12. Print Metadata

- What named attributes should exist before export?
- Should `flow`, `speed`, and `tool` be stored as GN attributes before conversion to vertex colours?
- What value range should `Flow` use?
- What value range should `Speed` use?
- What value range should `Tool` use?
- Should curvature drive speed automatically?
- Should bridge/seam regions override speed and flow?

## 13. nozzleboss

- What exact mesh contract does the installed nozzleboss version require?
- Does it require upright quads?
- How does it read vertex order?
- How exactly are `Flow`, `Speed`, and `Tool` colour layers named?
- What value range does each channel expect?
- How are start/end G-code blocks configured?
- Can nozzleboss handle multiple path objects?
- Can nozzleboss handle variable layer height?
- What is the minimum valid nozzleboss test object?

## 14. Current Blender File

- Which objects contain the current GN modifiers?
- Which node groups are active?
- Which node groups are obsolete experiments?
- Which groups already work and should be preserved?
- Which groups produce origin lines?
- Which groups duplicate each other?
- Which groups own speed, stitch, spiral, contour, or export logic?

## 15. Validation

- What exact conditions block export?
- How should invalid layers be displayed?
- How should origin jumps be detected?
- How should self-intersections be detected?
- How should path order be checked?
- Should validation be GN-only, Python-only, or hybrid?
- Should validation generate a written report?

## 16. UI and Workflow

- Should the workflow be one master object with one modifier stack?
- Should source, contour, print, and export controls be separate objects?
- Should debug outputs be toggles on the main modifier?
- Should algorithm selection be visible to non-technical users?
- What should the default "safe" preset be?
- What should the experimental controls be hidden behind?

## 17. Documentation and Mapping

- What naming convention should every node group follow?
- What fields must every per-node-group map contain?
- Should screenshots be stored, or only textual maps?
- Should socket indices be recorded for Blender version safety?
- Should each group have a failure-mode section?

