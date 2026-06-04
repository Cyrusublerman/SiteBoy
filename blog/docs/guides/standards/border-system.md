# Border System

Concrete rules for every border decision. Eliminates agent judgement.

**Authority:** `design-law.md §3` (boundary rules), `design-law.md §4` (scale law).

---

## 1. Axiom

Borders are **shared boundaries** between adjacent partitions — not private outlines around isolated objects. A border exists because two regions meet, not because one region wants a frame.

---

## 2. Border Constant

All borders: `1px solid var(--c-border)`.

No other weight, style, or colour is authorised for structural borders. `1px` is the only permitted non-F value in the system.

---

## 3. Vertical Stack Rule

When elements are stacked vertically (sidebar blocks, list items, node panels, collapsible sections):

| Position in stack | `border-top` | `border-bottom` |
| --- | --- | --- |
| First element | `none` (shares parent's top edge) | `none` |
| Middle element | `1px solid var(--c-border)` | `none` |
| Last element | `1px solid var(--c-border)` | `1px solid var(--c-border)` |
| Only element | `none` | `1px solid var(--c-border)` |

**Rationale:** Each internal boundary is owned by the element below it (via `border-top`). The terminal boundary at the bottom of the stack has no element below to own it, so the last element adds `border-bottom`.

**Implementation:**

```javascript
items.forEach((item, i) => {
    const isFirst = i === 0;
    const isLast  = i === items.length - 1;
    item.style.borderTop    = isFirst ? 'none' : '1px solid var(--c-border)';
    item.style.borderBottom = isLast  ? '1px solid var(--c-border)' : 'none';
});
```

---

## 4. Horizontal Stack Rule

When elements are placed in a horizontal row (toolbar cells, tab bars, button groups):

| Position in row | `border-left` | `border-right` |
| --- | --- | --- |
| First cell | `none` (shares parent's left edge) | `none` |
| Middle cell | `1px solid var(--c-border)` | `none` |
| Last cell | `1px solid var(--c-border)` | `none` (shares parent's right edge) |
| Only cell | `none` | `none` |

Internal boundaries are owned by the element to the right (via `border-left`). The row container owns its outer edges.

Horizontal stacks also typically share a `border-bottom` with their parent or adjacent sibling below.

---

## 5. Container vs Child Ownership

| Border | Owner |
| --- | --- |
| Outer edges of a container (top, right, bottom, left of a sidebar, panel, toolbar) | Container |
| Internal divisions between children | Children (per §3 and §4) |
| Bottom of a scrollable container | Container — children do not need to provide a terminal border when the container already has one |

**Scrollable containers:** When a container has `overflow-y: auto` or `overflow-y: scroll`, the last child is not truly "last" in visual terms — it scrolls away. The terminal `border-bottom` belongs to the container, not the last child. Do not apply §3's "last element adds border-bottom" rule inside a scrollable container.

**Test:** If you remove a child element, does the container still have its outer boundaries intact? If not, the ownership is wrong.

---

## 6. Double-Border Prevention

A double border occurs when element N has `border-bottom` and element N+1 has `border-top`, producing a 2px line.

**Rule:** Adjacent siblings must not both declare a border on their shared edge. Assign ownership to one side only — by convention, the **lower/right** element owns the shared boundary via `border-top` or `border-left`.

**Diagnosis:** If a 2px line appears between two elements, find which element has the redundant border declaration and remove it.

**Components built from subcomponents:** when a control is assembled from several primitives bound into one bordered box, the composite owns the outer border and each embedded primitive suppresses the edges it does not own. See `composite-components.md` for the per-edge control contract (`borders`/`embedded`/`topBorder`).

---

## 7. Collapsible Section Borders

Collapsible sections (e.g. sidebar blocks, category headers) follow the vertical stack rule with additional state logic:

| State | Header `border-bottom` | Content area |
| --- | --- | --- |
| Collapsed | `none` — the header acts as an opaque block; its `border-top` separates it from the previous sibling | Hidden |
| Expanded | `1px solid var(--c-border)` — separates header from content below | Visible |

The **last** collapsible section in a stack adds `border-bottom` to itself (header when collapsed, content area when expanded) per §3.

```javascript
header.style.borderBottom = expanded ? '1px solid var(--c-border)' : 'none';
```

---

## 8. Header + Content Separation

When a panel has a header row above a content area (e.g. NodePanel header, block title):

The header owns the dividing border via `border-bottom`. The first content row must **not** add `border-top` — that would produce a double border.

| Element | Border |
| --- | --- |
| Header | `border-bottom: 1px solid var(--c-border)` |
| First content row | `border-top: none` |
| Subsequent content rows | `border-top: 1px solid var(--c-border)` |

---

## 9. Dropdown / Overlay Borders

Anchored expansion (dropdown menu below a trigger):

| Edge | Border | Rationale |
| --- | --- | --- |
| Top | `none` | Shared with trigger's bottom edge |
| Left | `1px solid var(--c-border)` | Own edge |
| Right | `1px solid var(--c-border)` | Own edge |
| Bottom | `1px solid var(--c-border)` | Terminal edge |

Bounded overlay (full-panel picker within a sidebar):

| Edge | Border | Rationale |
| --- | --- | --- |
| Top | `none` | Shared with trigger element above |
| Left | `1px solid var(--c-border)` | Own edge |
| Right | `1px solid var(--c-border)` | Own edge |
| Bottom | `1px solid var(--c-border)` | Terminal edge |

---

## 10. Toolbar Borders

The toolbar row is a horizontal container. Its borders:

| Edge | Border | Rationale |
| --- | --- | --- |
| Top | Per context — `none` if flush with page top | |
| Bottom | `1px solid var(--c-border)` | Separates toolbar from content below |
| Left/Right | `none` | Flush with page edges |

Internal cell divisions follow §4 (horizontal stack rule). Each cell except the first has `border-left`. No cell has `border-right`.

---

## 11. Tab Bar Borders

Tab bars follow horizontal stack rule (§4) with active-state modification:

| Element | Border |
| --- | --- |
| Inactive tab | `border-left` per §4; `border-bottom: 1px solid var(--c-border)` |
| Active tab | `border-left` per §4; `border-bottom: none` (merges with content below) |
| Tab bar container | `border-bottom: 1px solid var(--c-border)` extends under all inactive tabs |

The active tab's absent bottom border creates the visual connection between the tab and its content panel.

---

## 12. Input Control Borders

Interactive controls (buttons, dropdowns, selects, toggles) within a sidebar:

- Controls are inside a block. The block provides vertical separation (§3).
- Controls within the same block do **not** add borders between themselves — they are separated by spacing (`F/2`).
- Controls that are visually grouped (e.g. a slider + number field pair) share no internal borders.
- Standalone action buttons: `border: 1px solid var(--c-border)` (four-sided) only when the button is a discrete partition, not when it is part of a flow.

---

## 13. Current Codebase Violations (for reference — fixes are separate tasks)

| File | Location | Violation | Fix |
| --- | --- | --- | --- |
| `NodePanel.js` | Header L59 + first param row L264 | Header has `border-bottom`; first content row also has `border-top` — double border | Remove `border-top` from first content row (L264) |
| `tool-base.js` | Last block in a panel | Last block has `border-top` only — no terminal `border-bottom` | Add `border-bottom: 1px solid var(--c-border)` to the last block in each tab panel |
| `GeneratorToolbar.js` | Each toolbar cell L56, L67, L78, L89, L96, L112 | Each cell independently owns `border-bottom` instead of the container owning it | Move `border-bottom` to the toolbar container; remove from individual cells |

---

## 14. Prohibited Patterns

| Pattern | Problem | Fix |
| --- | --- | --- |
| Four-sided `border` on a stacked item | Creates private outline, not shared boundary | Use `border-top` / `border-bottom` per §3 |
| `border-bottom` on element N + `border-top` on element N+1 | Double border (2px line) | Remove one; prefer `border-top` on N+1 |
| Last item in stack with no `border-bottom` | Bottom of stack has no terminal boundary | Add `border-bottom` to last item |
| First item in stack with `border-top` | Doubles with container's top edge | Remove `border-top` from first item |
| `margin` to simulate spacing between bordered elements | Creates a gap instead of a shared boundary | Use shared border, remove margin |
| `outline` for visual borders | Outline does not participate in layout | Use `border` only |
| Border colour other than `var(--c-border)` | Violates colour law | Use `var(--c-border)` |

---

## 15. Decision Procedure

For any new element, answer in order:

1. Is this element part of a vertical stack? → Apply §3.
2. Is this element part of a horizontal row? → Apply §4.
3. Does this element have a header above content? → Apply §8.
4. Is this a dropdown or overlay? → Apply §9.
5. Is this element collapsible? → Apply §7.
6. Does my adjacent sibling already own the shared boundary? → Do not duplicate it.
7. Am I the last element in my stack? → Add `border-bottom`.

If any step produces a 2px line, §6 applies — remove the redundant declaration.

---

End of Border System.

