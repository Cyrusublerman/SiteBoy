# Classify Reference Material

Every file involved in a generator migration must be classified before it is used. Classification determines how the file is used when writing the documentation pack. Assign one class per file. Record each classification in `source-reference.md` and `migration-log.md`.

---

## 1. Classification Definitions

| Class | Definition |
| --- | --- |
| `functional source/reference tool` | A live, executable `.gen.js` script that the host actually runs. This is the primary source of truth for mechanisms, parameters, and state. |
| `design/spec only` | A document that describes intended features, parameters, or behaviour without providing implementation. Typically a spec or design brief written before or alongside implementation. |
| `audit only` | A document that analyses existing code or a previous implementation against a standard or specification. Typically identifies gaps, bugs, or compliance failures. |
| `mixed bundle` | A document that contains both spec-like content (intended features, design rationale) and audit-like content (analysis of existing code, identified gaps). |
| `page doc` | A narrative page document (e.g. an art page or generative page entry) that describes the generator for an end user. Contains design intent but is not structured as a spec or audit. Treat as a weak spec. |

---

## 2. Decision Tree

Apply these questions in order. Stop at the first YES.

```
1. Is the file a .gen.js script that the host actually executes?
   YES → functional source/reference tool

2. Is the file a .md document that describes only intended features
   without analysing any existing implementation?
   YES → design/spec only

3. Is the file a .md document that analyses existing code or a previous
   implementation against a standard or specification?
   YES → audit only

4. Does the file contain both spec-like sections (intended features,
   design intent) AND audit-like sections (code analysis, identified gaps)?
   YES → mixed bundle

5. Is the file a narrative page doc (prose description of the generator
   for an end user, not structured as a spec or audit)?
   YES → page doc

6. None of the above → classify as page doc (weakest class) and note the
   ambiguity in migration-log.md
```

---

## 3. Per-Class Handling

### `functional source/reference tool`

**Used for:** `mechanisms.md`, `ui-layout.md`, `performance.md`, `description.md` (partial), `source-reference.md`

This is the authoritative source for everything about how the generator actually behaves. Every parameter in `mechanisms.md` and `ui-layout.md` must be verifiable directly from this file. Any feature in the documentation that cannot be traced to a line in this file is either a parity hole or an error.

**Do not use** a functional source to populate `feature-parity.md` — that file compares the source against other inputs, not against itself.

### `design/spec only`

**Used for:** `feature-parity.md` (feature inventory), `issues-and-conflicts.md` (parity holes)

Read every described feature. For each, check whether it exists in the live source. Record the result in `feature-parity.md`. Features described in the spec but absent from the source are parity holes (NOTE). Features in the spec that conflict with the source implementation are WARN-level issues.

A spec that predates the current implementation may describe features that were deliberately dropped. "Deliberately absent" is a valid status if evidence supports it — record the reasoning.

### `audit only`

**Used for:** `issues-and-conflicts.md` (carrying forward previously identified issues)

Read every issue the audit identified. For each, determine whether it is still valid in the current live source:
- Still present → carry forward into `issues-and-conflicts.md` at the severity the audit assigned (or reassign using the taxonomy in `issue-flagging.md`)
- Resolved → note it as resolved in `feature-parity.md` under "previously identified issues now resolved"
- Cannot verify → note it as unverified

Do not blindly copy all audit findings — verify each against the current source.

### `mixed bundle`

**Used for:** both `feature-parity.md` and `issues-and-conflicts.md`

First read: split the document into its spec sections and its audit sections. Draw a boundary — sections that describe "what should happen" are spec; sections that describe "what does happen (and whether it matches)" are audit.

Process the spec sections as `design/spec only`. Process the audit sections as `audit only`.

If the split is ambiguous, treat the whole document as a spec (lower risk of missing parity holes).

### `page doc`

**Used for:** `description.md` (design intent, visual character), `feature-parity.md` (weak spec — lower confidence)

Extract design intent and visual descriptions. These inform `description.md` §3.2 (visual output) and §3.3 (what makes it distinct). Do not treat page doc descriptions as definitive specs — they are user-facing prose and may be simplified or imprecise.

If a page doc describes features not in the live source, record them as parity holes but with a note that the evidence quality is lower than a formal spec.

---

## 4. Identifying a Design Doc vs. a Functional Tool

Sometimes a file that looks like a generator source is actually a design document. Signs that a `.js` or `.md` file is not a functional source:

- No `export const SCRIPT_CONFIG` declaration
- No render hook (`p5Draw`, `p5Setup`, `draw`)
- The file describes visual output in prose without implementation
- The file is a `.md` file (always a document, never a functional source)
- The file references a future implementation ("will render...", "should include...")
- The filename contains words like `spec`, `design`, `brief`, `draft`, `concept`

**Action:** classify as `design/spec only`. In `source-reference.md`, note explicitly: "This file is a design document, not a functional source. No live implementation was identified at this path."

---

## 5. When No Legacy Docs Exist

If `reference/generators/<id>/legacy-docs/` is empty:

- Record "no legacy docs located" in `source-reference.md` and `migration-log.md`
- In `feature-parity.md`, note: "No legacy docs exist. Feature parity cannot be assessed against external inputs. The live source is the only available reference."
- In `issues-and-conflicts.md`, note: "No audit history exists for this generator. Issues identified here are based on code review of the live source only."

This is not a failure state — it is an accurate record of the available inputs.
