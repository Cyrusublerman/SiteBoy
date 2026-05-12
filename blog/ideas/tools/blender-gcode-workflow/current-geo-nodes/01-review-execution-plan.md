# Current Geo Nodes — Review Execution Plan

Procedural plan for executing the audit defined in `../10-current-geo-nodes-analysis-plan.md` against the live Blender file.

This file is the *how*. The scope file is the *what*. The template is the *record format*.

## 0. Definitions

| Term | Meaning |
|------|---------|
| File | The currently open `.blend`. |
| Group | A `bpy.types.GeometryNodeTree` (top-level or nested). |
| User | An object whose modifier references a group (directly or via nesting). |
| Map file | One markdown file per group in `current-geo-nodes/` filled from `_template.md`. |
| Snapshot | A read-only Python dump from MCP (no `bpy.ops` edits). |
| Gate | A boolean condition that must hold before advancing to the next phase. |

## 1. Hard Constraints

- Read-only. No `bpy.ops`, no `node_tree` mutations, no link/unlink, no socket edits.
- One `.blend` per audit run. Record file path and `bpy.app.version` in every artefact.
- No node group is mapped from memory. Every field comes from a snapshot.
- One map file per group. No combined files. No skipped groups.
- Australian English. Defined terms only. No ambiguous adjectives ("nice", "clean", "robust") without measurable criterion.

## 2. Preconditions

P-1. Blender open with the target `.blend` loaded.
P-2. Blender MCP add-on running on `localhost:9876`.
P-3. `mcp_blender_get_scene_info` returns the expected file.
P-4. Free disk for snapshot dumps (estimate &lt; 5 MB total).

If any of P-1..P-4 fail, abort. Do not partial-run.

## 3. Phases

Phases are sequential. A phase may not start until the previous phase's gate passes.

### Phase A — Inventory Snapshot

Goal: capture the unfiltered set of objects, modifiers, groups, materials, attributes, and vertex colour layers.

Actions:
1. Run a single MCP Python block that returns a dict with:
   - `objects[]`: name, type, modifier stack (name, type, target group if GN).
   - `node_groups[]`: name, type, user count, is_nested, parent_groups[].
   - `materials[]`: name, users, is_in_workflow_object.
   - `mesh_attributes[]`: object, name, data_type, domain.
   - `colour_attributes[]`: object, layer, data_type, domain.
2. Persist the dict as JSON in agent context (do not write to repo).
3. Cross-check: every group referenced by an object's GN modifier must appear in `node_groups[]`.

Gate A:
- Snapshot returned without exception.
- `len(node_groups) >= len(workflow GN modifiers)`.
- Every workflow object has at least one GN modifier resolved.

### Phase B — Object Triage

Goal: classify every object as `source`, `intermediate`, `debug`, `export`, or `unrelated`.

Actions:
1. For each object with a GN modifier, populate the *Object/modifier users* field on the corresponding map files.
2. For each object, record the modifier order. Solidify, Triangulate, Weld, etc. after GN are recorded but not mapped here.
3. Mark `unrelated` objects out-of-scope for the rest of the audit.

Gate B:
- Every workflow object has exactly one classification.
- No object is left `unknown` at this phase.

### Phase C — Group Map Bootstrap

Goal: create one stub map file per group.

Actions:
1. For each group in `node_groups[]`:
   - Generate filename = kebab-case of exact group name.
   - Copy `_template.md` to `current-geo-nodes/<filename>.md`.
   - Fill *Identity* table only. Status defaults to `unknown`.
2. No other section is populated yet. Bootstrapping is mechanical.

Gate C:
- File count in `current-geo-nodes/` equals `len(node_groups) + 3` (index, template, this plan).
- Every map file has a non-empty *Exact name* row.

### Phase D — Per-Group Snapshot

Goal: extract the data needed to fill the rest of the template.

For each group, run one MCP block that returns:

```text
{
  "interface": [{ "name", "in_out", "socket_type", "default_value", "min", "max", "hidden" }],
  "nodes":     [{ "name", "type", "label", "muted", "parent_frame", "inputs[]", "outputs[]" }],
  "links":     [{ "from_node", "from_socket", "to_node", "to_socket" }],
  "frames":    [{ "name", "label", "children[]" }],
  "repeat_zones": [{ "input_node", "output_node", "items[]" }],
  "sim_zones":    [{ "input_node", "output_node", "items[]" }],
  "named_attribute_reads":  [{ "node", "name", "data_type", "domain" }],
  "named_attribute_writes": [{ "node", "name", "data_type", "domain" }],
  "switches": [{ "node", "switch_type", "default" }]
}
```

Persist per-group snapshots in agent context keyed by group name.

Gate D:
- Snapshot exists for every bootstrapped group.
- For every link, both endpoints exist in `nodes` (link integrity).
- For every repeat zone, both `input_node` and `output_node` resolve.

### Phase E — Per-Group Recording

Goal: fill sections 2..10 of every map file from its snapshot.

Order per file:
1. Section 3 *Inputs* and 4 *Outputs* — copy from `interface[]`.
2. Section 5 *Internal Structure* — frames, major chains by tracing from Group Input to Group Output, list every repeat zone with risk class (see below).
3. Section 7 *Attributes* — from `named_attribute_reads/writes`.
4. Section 8 *Materials / Vertex Colours* — from Phase A `materials[]` filtered to this group's users.
5. Section 6 *Maths / Theory* — describe in formal terms what the major chain computes. No prose padding.
6. Section 9 *Dependencies* — record version, required upstream domain (mesh / curve / points), downstream consumer, nozzleboss relevance.
7. Section 10 *Known Failure Modes* — populated from §3 risk classification below.
8. Section 2 *Role* — written last, as a single sentence stating the function.

Repeat zone risk classification:

| Class | Trigger |
|-------|---------|
| R1 boundary leak | external geometry linked into zone-internal node not via `Repeat Input`. |
| R2 mode mismatch | `Sample Curve` in `LENGTH` while indexed by factor (or vice versa). |
| R3 zero-iter | iteration count can be 0; output undefined. |
| R4 accumulator missing | iterations do not feed the accumulator slot. |
| R5 outside zone | iteration-dependent node placed outside the frame. |

Gate E:
- Every map file has zero empty required tables.
- No section reads "TBD" or "see other file".
- Status is updated from `unknown` to one of {active, experimental, duplicate, obsolete}. `unknown` permitted only with a written justification under §12.

### Phase F — Cross-Group Edges

Goal: produce a graph of group → group calls.

Actions:
1. From each group's `nodes[]`, find nodes of type `GeometryNodeGroup` and record the referenced sub-group.
2. Build adjacency `parent_group -> [child_group]`.
3. Record reverse adjacency on each child file under *Parent groups*.
4. Detect cycles. Cycles are reported as failures.

Gate F:
- Adjacency consistent both directions on every map file.
- No cycles, or all cycles documented with justification.

### Phase G — Attribute & Material Cross-Map

Goal: confirm where named attributes and colour attributes are produced and consumed.

Actions:
1. For each unique attribute name across all groups, produce a producer/consumer pair list.
2. Flag attributes with consumers but no producers as *unbound*.
3. Flag attributes with producers but no consumers as *dead*.
4. Compare attributes against the nozzleboss expected layers (`Flow`, `Speed`, `Tool`).

Output: append a table to each map file's §7 only when the group is a producer or consumer.

Gate G:
- No unbound attribute consumed by an export-facing group.
- All nozzleboss-required layers either present or flagged with a missing-producer entry.

### Phase H — Domain-Specific Audits

Run scope sections 9, 10, 11 from `../10-current-geo-nodes-analysis-plan.md`:

- §9 Contour algorithm audit — only on groups whose role is contour extraction.
- §10 Seam and helix audit — only on groups whose role is ring connection or stitching.
- §11 Post-process audit — only on fillet, blur, resample groups.

Each finding is written to the relevant map file's §10 *Known Failure Modes*. No new files created.

Gate H:
- Every contour, seam, and post-process group has a §10 entry, even if the entry is "no failure observed in test inputs".

### Phase I — nozzleboss Readiness

Apply scope §14. For each export-facing object, record:

- final mesh contract status (PASS / FAIL with reason);
- vertex order status;
- vertex colour layer presence;
- start/end G-code presence;
- tool macro presence.

This goes on the map file of the *terminal* group (the last group in the export chain), not on a new file.

Gate I:
- Every object classified `export` in Phase B has a recorded contract status.

### Phase J — Duplication Classification

Apply scope §16. For each duplicated concern:

1. Identify all groups solving it.
2. Choose one as `keep`.
3. Mark the rest as `merge into <keep>`, `deprecate`, or `delete later`.
4. Record the decision in §12 of each affected map file.

Gate J:
- Every duplicate set has exactly one `keep`.
- Every map file's §12 has a non-`unknown` decision, or a written reason why `unknown` is unavoidable.

### Phase K — Sign-Off

Goal: prove completeness.

Actions:
1. Verify file count: `len(map files) == len(node_groups)` discovered in Phase A.
2. Verify no map file has empty required sections (script check by line scan).
3. Verify every group in scope §17 list is mapped.
4. Append a single line to `00-index.md` under a new section *Audit Runs* recording: date, Blender version, file path, total groups, total duplicates, total export-ready objects.

Gate K (final):
- All earlier gates pass.
- `00-index.md` records the run.
- No map file has status `unknown` without justification.

## 4. Output Artefacts

| Artefact | Location | Producer phase |
|----------|----------|----------------|
| Per-group map file | `current-geo-nodes/<group>.md` | C (stub), E (filled) |
| Cross-group adjacency | inside each map file §1 | F |
| Attribute producer/consumer table | inside relevant §7 | G |
| Audit run log line | `00-index.md` | K |

No other files are created. No JSON, no CSV. Snapshot dumps live in agent context only.

## 5. Risk Controls

- Re-run Phase A if any object or group is added or renamed mid-audit. Restart from Phase B.
- Do not infer socket types from node labels. Read from `interface[]`.
- Do not assume default values. Read from `default_value`.
- Do not assume Blender version compatibility. Read from `bpy.app.version` once and compare every group.
- If any MCP call fails twice, stop the audit and record the failing call. Do not improvise a workaround.

## 6. Done Criteria

The audit is complete when *all* hold:

1. Phase K gate passes.
2. Every group has a filled map file.
3. Every map file has a refactor decision in §12.
4. Every duplicate set is resolved.
5. Every export-facing object has a nozzleboss contract status.
6. The audit run is recorded in `00-index.md`.

Any single failure means the audit is *incomplete*. Partial completion is not a pass.

## 7. Out of Scope

- Refactor implementation. Decisions only, no edits.
- Performance profiling. Not required for a structural audit.
- Visual judgement of output geometry. Use validation checks in §11 of the template.
- Documentation of *proposed* MFP remake groups. That lives in `../mfp-blender-remake/`.

## 8. Phase Dependency Graph

```text
A -> B -> C -> D -> E -> F -> G -> H -> I -> J -> K
```

No phase may be skipped. No phase may run in parallel with its predecessor. Within a phase, per-group work may run in any order.
