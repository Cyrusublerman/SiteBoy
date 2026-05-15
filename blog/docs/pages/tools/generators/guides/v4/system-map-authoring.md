# System Map Authoring Standard (v4)

Used by: Card 07 (Stage B.5 — Reference System Map), Card 09 (Stage C.5 — Live System Map + Divergence Notes).

The four-part System Map is a permanent artefact reused by future analysis. Every map across all 25 generators must follow these conventions exactly.

## File template (exact heading structure required)

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

[same five children: Source / Mode / Coverage / Lifecycle / Function Call Graph / Data Pathways / State Inventory]

## Architectural Divergence Notes

[bullet list]
```

No additional headings. No prose preamble. No conclusion. Headings exact as written.

## Mermaid conventions

| Concern | Rule |
|---|---|
| Diagram type | Lifecycle = `flowchart TD`. Call Graph = `flowchart LR`. No others. |
| Node id | Camel-case function name from source, no parens. e.g. `buildSources`. |
| Node label | Optional — only if id alone is ambiguous. Format: `id["label"]`. Lifecycle only, never Call Graph. |
| Edge | `-->` direct call. `-.->` indirect/event-triggered. `==>` forbidden. Edge labels only when conditional: `draw -->\|mode=density\| drawDensity`. |
| Subgraph | Required in Call Graph if total nodes > 20. Partition by phase: `init`, `perframe`, `event`, `cleanup`. |
| Styling | None. No `style`, no `classDef`, no `linkStyle`. |
| Self-loops | Lifecycle only. `LOOP --> LOOP` for recurring frame. Forbidden in Call Graph. |
| Direction reversal | Forbidden. |
| Comments | Forbidden inside mermaid blocks. |

## Lifecycle flowchart contents (canonical node set)

Five canonical nodes only, unless generator genuinely has additional phases (rare; document in Divergence):

| Node | Meaning | Source signal |
|---|---|---|
| `setup` | One-time init | `onInit`, `setup`, `p5Setup`, top-level statements |
| `firstDraw` | First render after setup | First `draw()` invocation |
| `loop` | Per-frame steady state | `draw()`, `p5Draw()` |
| `paramChange` | User param edit | `onParamChange`, `_handleParamChange` |
| `cleanup` | Teardown | `destroy`, `_cleanup`, `p.remove()` |

If a generator skips a canonical node (e.g. no `paramChange` handler), omit that node entirely.

## Function Call Graph inclusion rules

| Function in Coverage Map mapped to a `cap_id` | Include as node |
|---|---|
| Function marked `not-relevant: <reason>` | **Exclude** |
| Anonymous closure used as event listener | Include with id `<parent>_<event>` |
| Method on a class | Include as `Class.method` |
| Helper called only from one other function and ≤ 5 lines | Inline into parent (note in Coverage Map as `inlined-into: <parent>`) |
| Library/framework call (p5, MathUtils, Patterns.*) | **Exclude** — cite in Data Pathways `transform chain` |

If a function has > 3 callers, render as single node with multiple inbound edges (no duplication). If a function has > 6 callees, partition by phase via subgraph.

## Data Pathways table — schema and vocabulary

| Column | Rule |
|---|---|
| `pathway_id` | `P-NN` zero-padded, sequential. Stable across reference and live where pathways match by purpose. New live-only pathways get next free id; note in Divergence. |
| `input` | Comma-separated list of typed inputs. Format: `<name>:<type>`. Types from vocabulary below. |
| `transform chain` | `→`-separated function chain. Use exact function names from Coverage Map. Library calls in `Namespace.fn` form. |
| `output` | `<name>:<type>`. Single output per pathway. Multi-value returns split into multiple pathways. |
| `per-frame?` | `yes` / `no`. Determined by lifecycle position of consumer. |
| `parallelisable?` | One of vocabulary below. Determined by data-flow analysis, not guessing. |

### Type vocabulary (closed set — extend only with user approval)

`number`, `int`, `string`, `bool`, `Array<T>`, `T[]`, `Float32Array` / `Uint8ClampedArray` / `Uint16Array` / etc., `ImageData`, `Canvas2DContext`, `WebGLContext`, `GPUDevice` / `GPUTexture` / `GPUBuffer`, `p5.Graphics` / `p5.Image`, `{x:T, y:T, ...}`, `params.<name>`, `params.{a, b, c}`, `frame.t` / `frame.n`, `external:<source>`.

### Parallelisable vocabulary (closed set — feeds Stage E.6 Checks 2 and 3)

| Value | Means |
|---|---|
| `n/a` | Not per-frame; question doesn't apply |
| `no (sequential state)` | Iteration N+1 depends on iteration N (e.g. wave eqn timestep, reaction-diffusion) |
| `partial (per-row)` | Independent across rows, sequential within row |
| `partial (per-band)` | Independent across coarse bands, coupled within |
| `yes (per-particle)` | Each particle independent; particle count drives parallel width |
| `yes (per-pixel)` | Each pixel independent; W×H drives parallel width — **GPU/worker prime candidate** |
| `yes (per-vertex)` | Each vertex independent; vertex count drives parallel width — **GPU prime candidate** |
| `yes (embarrassingly)` | All inputs independent, no shared state |

## State Inventory table — schema and vocabulary

| Column | Rule |
|---|---|
| `name` | Exact identifier from source |
| `scope` | One of scope vocabulary below |
| `type` | From type vocabulary above |
| `purpose` | ≤ 12 words. No prose. |
| `initialised by` | Function name from Call Graph, or `host`, or `literal` |
| `mutated by` | Comma-separated function names, or `(immutable)`, or `host`. Empty list forbidden — write `(immutable)` explicitly. |

### Scope vocabulary (closed set)

| Value | Means | Smell? |
|---|---|---|
| `module` | Module-scope `let`/`const` outside any class/function — mutable | **Yes** — auto-flag Stage E.5 ARCH P2 `module-level-mutable-state` |
| `module-const` | Module-scope `const` never reassigned (truly immutable) | No |
| `instance` | Instance field on a class extending BaseComponent or similar | No |
| `closure` | Captured by enclosing function scope (e.g. inside `onInit`) | No |
| `host` | Maintained by `GenerativeToolHost` (`frame`, `params`) — generator only reads | No |
| `external` | Lives outside generator (`localStorage`, fetched URL) | Note in Divergence |

## Architectural Divergence Notes — content rules

- One bullet per distinct structural difference. No paragraph prose.
- Each bullet starts with a noun phrase, ends with the implication (file:line citation if relevant).
- Forbidden: bullets that merely restate a Diff Table row. Diff Table covers capability gaps; this section covers structural gaps (caching layers, indirection, state expansions, framework substitutions).
- If reference and live are structurally identical: write a single bullet `- No architectural divergence — live is a faithful port of reference.` Do not omit the section.

### Examples (good)

- `Live introduces _pixelDistCache: Float32Array[] precomputed in _buildPixelDistCache(); reference computes sqrt every pixel-frame. Pathway P-02 input expanded. See performance.md line 80.`
- `Reference uses mousePressed() to add sources; live moves source placement to template-only param dispatch — see Diff R-04 status absent (GEN P1).`
- `Live splits reference's monolithic draw() into three SCRIPT_CONFIG-level mode branches via mode param. Logic equivalent; cleaner separation.`

### Examples (bad)

- `Live and reference are different.` (no information)
- `cap_id R-04 is absent in live (see Diff Table).` (restates Diff)
- `It would be better if cymatics used GPU.` (recommendation, not divergence)

## Granularity rules

| Situation | Decision |
|---|---|
| Two consecutive transforms always run together with no observable intermediate value | Merge into one pathway with two functions in chain |
| One transform feeds two separately-consumed outputs | Split into two pathways with shared input |
| Helper ≤ 5 lines used only once | Inline in Call Graph; no separate pathway row |
| Render mode dispatch where each branch is a real distinct pipeline | One pathway per branch with `mode=<value>` in input column |
| Animation-only state update vs render | Two pathways: state advance (`P-NN: state[t-1] → step → state[t]`), render (`P-NN+1: state[t] → render → pixels`) |

## Cross-reference syntax

| Reference | Format | Example |
|---|---|---|
| Capability row | `cap_id <ID>` | `cap_id R-04` |
| Issue | `<TYPE>-<NN>` | `GEN-014`, `PERF-031` |
| Pathway in same map | `pathway_id <ID>` | `pathway_id P-02` |
| Function in same map | bare function id | `getWave` |
| Source line | `<path>:<line>` | `assets/js/tools/generators/scripts/wave/cymatics.gen.js:142` |
| Doc | `<doc>:line <N>` | `performance.md line 80` |

## Edge cases

| Edge case | Procedure |
|---|---|
| Reference is HTML with embedded sketch | `<script>` block is the source. Header `Mode: html-embedded-sketch`. Quote line range of embedded script. |
| Reference is multi-file | Manifest names canonical file. Include canonical functions only; cross-file calls in chain as `<otherfile>::<fn>`. |
| Reference uses external library (p5, three.js, jQuery) | Library calls excluded from Call Graph; listed in `transform chain` of Data Pathways using `Namespace.method`. |
| Reference has dead code | Function appears in Coverage Map as `not-relevant: dead code`. Excluded from Call Graph. |
| Reference has commented-out code | Ignored. Not mapped, not coverage-listed. |
| Live source has GPU shader sources | Shader is a Data Pathway with chain `wgsl:<shader-name>` (or `glsl:`). Not exploded into per-line nodes in Call Graph. |
| Live uses Web Worker | Worker boundary shown as Lifecycle edge `loop -.-> worker -.-> loop`. Worker function in Call Graph as separate `subgraph worker`. State crossing boundary tagged in State Inventory with scope `closure` and `mutated by: worker`. |
| Generator is a stub (live source < 50 lines) | Map both anyway. Live Map will be near-empty. Divergence: single bullet `Live is a stub; no implementation present.` |

## Quality gates (run before declaring map complete)

Greppable self-checks. Run each. Fix any failure before proceeding.

- [ ] Heading set matches template exactly (no extra, no missing)
- [ ] `**Source:**` line cites a path that exists
- [ ] `**Mode:**` value from closed set
- [ ] Lifecycle uses only canonical node names
- [ ] Call Graph node count = (Coverage Map mapped count) − (inlined-into count). Off-by-one fails the gate.
- [ ] Every Data Pathway `parallelisable?` value from closed vocabulary
- [ ] Every State Inventory `scope` value from closed vocabulary
- [ ] Every State Inventory row with `scope: module` has corresponding Stage E.5 ARCH issue logged
- [ ] No mermaid diagram contains `style`, `classDef`, `linkStyle`, or HTML
- [ ] Architectural Divergence section present (even if `No architectural divergence` single bullet)
- [ ] All cross-references resolve (cap_id exists in Capability Table; file:line exists in cited file)

If any gate fails, fix before proceeding to Stage D. The map IS the artefact — Stage D's `flow_divergence` column reads it directly.
