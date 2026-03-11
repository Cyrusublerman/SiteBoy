# Classify Reference Material

Every file involved in a module migration must be classified before it is used. Classification determines how the file is used when writing the documentation pack. Assign one class per file. Record each classification in `source-reference.md` and `migration-log.md`.

---

## 1. Classification Definitions

| Class | Definition |
| --- | --- |
| `functional source node` | A live `*Node.js` file that the Pipeline actually executes. This is the primary source of truth for algorithm, parameters, and execution order. |
| `component-level doc` | The existing `blog/docs/components/distort/modules/<type>.md` file for this module. A structured spec/reference hybrid — describes identity, algorithm, parameters, pipeline behaviour, mask controls, modulation targets. Treat as a high-confidence spec. |
| `design/spec only` | A document describing intended features, parameters, or behaviour without providing implementation. Written before or alongside implementation. |
| `audit only` | A document that analyses existing code against a standard or specification. Identifies gaps, bugs, or compliance failures. |
| `mixed bundle` | Contains both spec-like content (intended features, design rationale) and audit-like content (code analysis, identified gaps). |

---

## 2. Decision Tree

Apply in order. Stop at first YES.

```
1. Is the file a *Node.js file that Pipeline executes (in nodes/ subtree)?
   YES → functional source node

2. Is the file the component-level doc at
   blog/docs/components/distort/modules/<type>.md?
   YES → component-level doc

3. Is the file a .md document describing only intended features without
   analysing any existing implementation?
   YES → design/spec only

4. Is the file a .md document that analyses existing code against a standard?
   YES → audit only

5. Does the file contain both spec-like sections AND audit-like sections?
   YES → mixed bundle

6. None of the above → classify as design/spec only and note the
   ambiguity in migration-log.md
```

---

## 3. Per-Class Handling

### `functional source node`

**Used for:** `mechanisms.md`, `ui-layout.md`, `performance.md`, `description.md` (partial), `source-reference.md`

This is the authoritative source for everything about how the module actually behaves. Every parameter in `mechanisms.md` and `ui-layout.md` must be verifiable directly from this file. Any feature in the documentation that cannot be traced to a line in this file is either a parity hole or an error.

Do not use a functional source to populate `feature-parity.md` — that file compares the source against other inputs, not against itself.

### `component-level doc`

**Used for:** `feature-parity.md` (primary comparison target), `description.md` (algorithm origin, scope boundary), `issues-and-conflicts.md` (parity holes)

The component-level doc is a high-confidence spec. Compare every param listed in it against the functional source. Params in the doc but not in the source are parity holes. Params in the source but not in the doc are undocumented additions — record both as issues.

If the component-level doc and the functional source directly contradict each other (different default value, different tier, different label), record a CONFLICT issue. Do not pick a winner — record both sides.

### `design/spec only`

**Used for:** `feature-parity.md` (feature inventory), `issues-and-conflicts.md` (parity holes)

Read every described feature. For each, check whether it exists in the live source. Record the result in `feature-parity.md`. Features described in the spec but absent from the source are parity holes (NOTE). Features that conflict with the source are WARN.

### `audit only`

**Used for:** `issues-and-conflicts.md` (carrying forward previously identified issues)

For each issue the audit identified, determine whether it is still valid in the current live source:
- Still present → carry forward at the severity assigned (or reassign using `issue-flagging.md`)
- Resolved → note as resolved in `feature-parity.md`
- Cannot verify → note as unverified

Do not blindly copy audit findings — verify each against the current source.

### `mixed bundle`

**Used for:** both `feature-parity.md` and `issues-and-conflicts.md`

Split the document into its spec sections and audit sections. Process the spec sections as `design/spec only`. Process the audit sections as `audit only`.

If the split is ambiguous, treat the whole as a spec (lower risk of missing parity holes).

---

## 4. Identifying a Source Node vs. a Spec Doc

Signs that a `.js` file is not a functional source node:
- No `export class <Name>Node extends EffectNode` declaration
- No `apply(src, dst, w, h, ctx)` method
- The file describes visual output in prose without implementation
- The filename does not follow the `<Name>Node.js` pattern
- The file is in a directory that is not `nodes/`

**Action:** classify as `design/spec only`. In `source-reference.md`, note: "This file is a design document, not a functional source node. No live implementation was identified at this path."

---

## 5. When No Legacy Docs Exist

If `reference/distort/<type>/legacy-docs/` is empty and the component-level doc is the only input:

- Record "no additional legacy docs located" in `source-reference.md` and `migration-log.md`
- In `feature-parity.md`: note "Component-level doc is the sole non-source reference. All parity assessment is against that doc."
- In `issues-and-conflicts.md`: note "No audit history. Issues identified here are from code review of the live source node and comparison against the component-level doc only."

This is not a failure state — it is an accurate record of available inputs.
