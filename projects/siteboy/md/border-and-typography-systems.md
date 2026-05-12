### Border system

**Axiom.** A border exists because two regions meet. It is not a private outline around a single element.

**Constant.** All borders: `1px solid var(--c-border)`. No other weight, style, or colour for structural borders.

**Vertical stack rule.** When elements are stacked vertically (sidebar blocks, list items, collapsible sections):

| Position in stack | `border-top` | `border-bottom` |
|---|---|---|
| First element | `none` | `none` |
| Middle element | `1px solid var(--c-border)` | `none` |
| Last element | `1px solid var(--c-border)` | `1px solid var(--c-border)` |
| Only element | `none` | `1px solid var(--c-border)` |

Each internal boundary is owned by the element below it (via `border-top`). The terminal boundary at the stack bottom has no element below to own it, so the last element adds `border-bottom`.

**Horizontal stack rule.** When elements are in a row (toolbar cells, tabs):

| Position in row | `border-left` | `border-right` |
|---|---|---|
| First cell | `none` | `none` |
| Middle cell | `1px solid var(--c-border)` | `none` |
| Last cell | `1px solid var(--c-border)` | `none` |

Internal boundaries are owned by the element to the right (via `border-left`). The row container owns its outer edges.

**Why this matters.** Without this rule, adjacent elements each add their own border on the shared side, producing 2px visual gaps and misaligned separation. The shared-boundary rule eliminates this class of visual inconsistency system-wide.

**Prohibited borders.** `border-radius`, `box-shadow`, `text-shadow`, `outline` (except for keyboard focus). No borders on floating elements (which are themselves prohibited). No decorative gaps that break the partition into unrelated objects.

### Typography system

**Typeface.** `'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace`. No other typeface is authorised.

**Case roles:**

| Role | Case |
|---|---|
| Tabs, toolbar cells, node names, parameter labels, select options | UPPERCASE |
| Block titles, section titles | Title Case |
| Body prose, explanatory sentences | Sentence case |
| Status microcopy | lowercase (when intentionally quiet and secondary) |

**Font sizes.** Two sizes only:

| Token | Value | Use |
|---|---|---|
| Controls | `F × 0.75` = 10.5px | All buttons, inputs, labels, list items |
| Headings | `F` = 14px | Block titles, section headers |

No `F × 0.85`, no `F × 1.5`, no `px` values that are not derivable from `F`. Visual distinction is achieved by weight or case — not by a non-standard size.

**Function.** Typography exists to expose structure and state. Not ornament, not atmosphere, not branding. Typographic emphasis is prohibited where partition or inversion would solve the problem.

### Semiotics

Label taxonomy:

| Type | Definition | Example |
|---|---|---|
| State label | Current state of element/system | `NO SOURCE`, `RENDERING...` |
| Action label | Action triggered by activation | `EXPORT PNG`, `ADD EFFECT` |
| Identifier | Names a value, object, or region | `BLUR RADIUS`, `PIPELINE` |
| Qualifier | Modifies a noun within scope | `GLOBAL SEED`, `FRAME COUNT` |

**Glyph catalogue:**

| Glyph | Interaction type | Permitted on |
|---|---|---|
| `▾` | Opens a dropdown list | Dropdown triggers only |
| `+` | Adds a new item | Add/create actions only |
| `×` | Closes or removes | Close/remove actions only |
| `▸` / `▾` | Expands/collapses inline section | Collapsible section headers only |
| `…` | Opens a file dialog/continuation | File picker browse actions only |

Glyph position: **state glyphs left, action glyphs right**. Mismatched positions violate the semiotics rule.
