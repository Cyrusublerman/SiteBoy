# Blender G-code Workflow — Current Geo Nodes Analysis Plan

## 1. Purpose

This file defines what must be analysed in the current Blender file before refactoring the Geometry Nodes system.

The goal is not to judge the nodes visually. The goal is to map ownership, data flow, dependencies, failure modes, and nozzleboss readiness.

## 2. Inventory Scope

Analyse every current item in the Blender file that affects the G-code workflow:

- objects with GN modifiers;
- node groups;
- nested node groups;
- modifiers after GN, including Solidify;
- materials used for speed/flow preview;
- named attributes;
- vertex colour layers;
- nozzleboss-related objects;
- build-volume references;
- text blocks containing G-code or macros.

## 3. Object-Level Questions

For each relevant object:

- What is the object name?
- What is the object type?
- Which modifiers does it have?
- Which GN modifier is active?
- What node group does the modifier use?
- What input geometry does it consume?
- What output geometry does it produce?
- Is it a source, intermediate, debug, or export object?
- Does nozzleboss operate on this object?

## 4. Node Group Inventory

For each node group:

- What is the exact node group name?
- Is it active, experimental, duplicate, or obsolete?
- Which object/modifier uses it?
- Which other node groups call it?
- What problem does it solve?
- What inputs does it expose?
- What outputs does it produce?
- What attributes does it read?
- What attributes does it write?
- Does it depend on object transforms or scene scale?
- Does it depend on a specific Blender version?

## 5. Socket and Interface Audit

For each group interface:

- socket name;
- socket type;
- default value;
- min/max if present;
- unit meaning;
- whether it is user-facing;
- whether it duplicates another parameter;
- whether it should be renamed;
- whether it should move to `PRINT_Params`.

Critical duplicated parameters to find:

- layer height;
- nozzle diameter;
- extrusion width;
- ring count;
- point count;
- resolution;
- speed;
- flow;
- material/tool selection;
- units scale.

## 6. Internal Node Map

For each node group, map:

- frame names;
- major node chains;
- repeat zones;
- simulation zones if any;
- group input nodes;
- group output nodes;
- reroutes;
- switches;
- named attributes;
- hidden sockets;
- muted nodes;
- unconnected nodes.

## 7. Data Flow Audit

For each group, trace:

```text
Group Input
  -> process stages
  -> attributes
  -> Group Output
```

Record:

- geometry domain changes;
- mesh-to-curve conversions;
- curve-to-mesh conversions;
- point cloud stages;
- selection fields;
- index fields;
- accumulators;
- sorting;
- sample operations.

## 8. Repeat Zone Audit

For every repeat zone:

- What is the iteration count?
- Which repeat items exist?
- Which sockets are auto-created?
- Which accumulator carries geometry?
- Are inputs linked by name or index?
- Are iteration-dependent nodes physically inside the zone?
- Is any external geometry linked across the zone boundary incorrectly?
- Does each iteration add, replace, or filter geometry?
- What happens on zero iterations?

Known risk:

```text
wrong repeat socket -> empty output or geometry lost
```

## 9. Contour Algorithm Audit

For each contour method:

- What mathematical method is used?
- Is it point-based, edge-based, face-based, ray-based, or boundary-based?
- Does it support concave geometry?
- Does it support re-entrant geometry?
- Does it support multiple loops per layer?
- How are points ordered?
- How are components separated?
- How are seams chosen?
- What causes origin lines?
- What causes self-intersections?

## 10. Seam and Helix Audit

Analyse:

- how ring starts are defined;
- how ring ends are sampled;
- whether `Sample Curve` uses `FACTOR` or `LENGTH`;
- how clockwise/counter-clockwise direction is implemented;
- how next-ring seam points are selected;
- how bridges are merged into curves;
- whether first and final endpoints remain open;
- whether multiple components are handled.

Failure checks:

- connector to origin;
- connector to wrong component;
- diagonal bridge across object;
- bridge length too long;
- seam direction inconsistent.

## 11. Post-Process Audit

For fillet:

- where it occurs;
- radius;
- count;
- toggle state;
- whether it can self-intersect.

For blur:

- whether it blurs position;
- whether delta is `blurred - original`;
- whether Z is zeroed;
- strength;
- iterations;
- whether it changes layer height.

For resample:

- count mode or length mode;
- default values;
- point caps;
- whether resampling happens before or after seam logic.

## 12. Attribute Audit

List all named attributes and colour attributes:

- name;
- type;
- domain;
- producer group;
- consumer group;
- value range;
- export relevance.

Expected/future attributes:

- `layer_index`;
- `component_id`;
- `path_index`;
- `flow`;
- `speed`;
- `tool`;
- `is_seam`;
- `is_bridge`.

nozzleboss colour layers:

- `Flow`;
- `Speed`;
- `Tool`.

## 13. Material Audit

For each material used in the workflow:

- name;
- purpose;
- whether it is visual only;
- whether it duplicates speed/flow/tool metadata;
- whether it should be retained as debug preview.

Known issue:

```text
materials do not replace nozzleboss vertex colours
```

## 14. nozzleboss Readiness Audit

Check:

- final object type;
- mesh order;
- vertex order;
- polygon structure;
- layer height represented by geometry;
- vertex colour layers;
- nozzleboss panel settings;
- start/end G-code;
- tool macro setup.

Questions:

- Can nozzleboss export the current object?
- If not, what contract item fails?
- Is failure due to geometry, metadata, order, or addon configuration?

## 15. Validation Audit

Search for:

- empty geometry paths;
- origin jumps;
- NaN/infinite points;
- self-intersections;
- layer Z drift;
- duplicated layers;
- too many points;
- zero-length curves;
- extremely long bridges;
- path outside build volume.

## 16. Duplication Audit

Find duplicate ownership of:

- contour extraction;
- spiral generation;
- layer height;
- speed system;
- stitch/bridge logic;
- mesh-to-curve layers;
- nozzleboss conversion;
- smoothing.

Each duplicate must be classified:

```text
keep
merge
deprecate
delete later
```

Do not delete during analysis.

## 17. Per-Node-Group File Requirement

Every current node group gets one mapping file in:

```text
current-geo-nodes/
```

Each file must record:

- exact group name;
- role;
- status;
- inputs;
- outputs;
- internal stages;
- maths;
- attributes;
- dependencies;
- failure modes;
- refactor decision.

