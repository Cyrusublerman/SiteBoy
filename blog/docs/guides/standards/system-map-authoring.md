# System Map Authoring Standard (v4)

Used by: Card 07 (Stage B.5 — Reference System Map), Card 09 (Stage C.5 — Live System Map + Divergence Notes).

The four-part System Map is a permanent artefact reused by future analysis. Every map across all 25 generators must follow these conventions exactly.

## File Template

```markdown
# <generator-id> — System Map

## Reference (v4 — YYYY-MM-DD)

**Source:** `<reference path>` (<line count> lines)
**Mode:** <p5-instance | p5-global | canvas2d | webgl | webgl2 | webgpu | html-embedded-sketch | other:<spec>>
**Coverage:** <N functions mapped, M not-relevant>

### Lifecycle
```mermaid
<flowchart>
```

### Function Call Graph
```mermaid
<flowchart>
```

### Data Pathways

<table>

### State Inventory

<table>

## Live (v4 — YYYY-MM-DD)

[same children]

## Architectural Divergence Notes

[bullet list]
```

No extra headings. No prose preamble. No conclusion.

## Mermaid Rules

| Concern | Rule |
|---|---|
| Lifecycle | `flowchart TD` |
| Call Graph | `flowchart LR` |
| Edge | `-->` direct call; `-.->` indirect/event |
| Styling | no `style`, `classDef`, `linkStyle` |
| Self-loop | lifecycle only |

## Data Pathway Schema

| Column | Rule |
|---|---|
| `pathway_id` | `P-NN` |
| `input` | typed inputs |
| `transform chain` | exact function names |
| `output` | typed output |
| `per-frame?` | `yes` / `no` |
| `parallelisable?` | closed vocabulary |

Parallel vocabulary: `n/a`, `no (sequential state)`, `partial (per-row)`, `partial (per-band)`, `yes (per-particle)`, `yes (per-pixel)`, `yes (per-vertex)`, `yes (embarrassingly)`.

## State Inventory Schema

| Column | Rule |
|---|---|
| `name` | exact identifier |
| `scope` | closed vocabulary |
| `type` | closed type vocabulary |
| `purpose` | <= 12 words |
| `initialised by` | function / `host` / `literal` |
| `mutated by` | functions / `(immutable)` / `host` |

Scope vocabulary: `module`, `module-const`, `instance`, `closure`, `host`, `external`.

## Divergence Notes

- One bullet per structural difference.
- Do not restate Diff Table rows.
- If identical: `- No architectural divergence — live is a faithful port of reference.`

## Quality Gates

- Heading set matches template.
- Source path exists.
- Mode uses the closed set.
- Lifecycle node names are canonical.
- Data Pathways use closed `parallelisable?` vocabulary.
- State Inventory uses closed `scope` vocabulary.
- No mermaid styling directives.
- Divergence section present.
