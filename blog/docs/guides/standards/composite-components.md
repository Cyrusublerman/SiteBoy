# Composite Component Construction

How to build a component from subcomponents bound into one partition with shared boundaries, no gaps, and stack-aware borders.

**Authority:** `design-law.md §2–3` (partition + boundary), `border-system.md` (edge ownership), `component-patterns.md §1–2` (mandate + canonical primitives), `text-treatment.md` (label rules). On conflict, those win; this doc only adds composition law.

---

## 1. Defined terms

| Term | Definition |
| --- | --- |
| Composite | A component whose visible body is exactly one Partition subdivided into Cells. |
| Cell | One subdivision of a Composite: a subcomponent instance or a single primitive element. |
| Embeddable primitive | A leaf component exposing the Contract (§3) so a Composite can own its outer box. |
| Shared boundary | One `1px var(--c-border)` line owned by exactly one of two adjacent Cells. |
| Owner | The single Cell (or container) that declares a given boundary. |
| Stack edge | An outer edge of a Composite that meets a sibling when stacked (top in a vertical stack; left in a horizontal stack). |

---

## 2. Invariants (MUST)

- **I1.** A Composite renders as exactly one outer Partition. No floating Cells; no inter-Cell gaps (`gap: 0`). Separation is by shared boundary only (design-law §3.2, §10).
- **I2.** Every internal division is one `1px` shared boundary with exactly one Owner (I6).
- **I3.** Horizontal Cell stack: each Cell after the first owns the divider via `border-left`; first Cell none; no Cell declares `border-right` (container owns the right edge). (border-system §4)
- **I4.** Vertical Cell stack: pick one convention per Composite — either the lower Cell owns the divider via `border-top`, or the upper "header" Cell owns it via `border-bottom`. Never both. (border-system §3, §8)
- **I5.** The outer box is owned by the container; when Composites stack flush, each Stack edge is toggleable so the neighbour's edge serves instead.
- **I6.** Two adjacent Cells MUST NOT both declare a border on their shared edge (no `2px` line).
- **I7.** Sizing is F-derived. Interactive Cell height `2F`. A non-interactive label row may be `1.5F`. Outer height = content + borders via `box-sizing: border-box` (e.g. `height: calc(2F) + 2px` for a 1px top+bottom box).
- **I8.** State by inversion (active/hover: `bg var(--c-text)` / `color var(--c-bg)`). Error = `var(--c-accent)` on one owned edge, distinct from the idle border (design-law §6.3, §14.3).
- **I9.** No Cell uses `margin` for separation (margin breaks shared boundary — border-system §14).

---

## 3. Embeddable primitive contract

A leaf component is composable only if it exposes ALL of:

- **C1. Per-edge border control** — an option to suppress any edge (`borders: {top,right,bottom,left}`) or an `embedded` flag that drops top/bottom/right and keeps `border-left` dividers. Lets the container own the outer box (I5, I6).
- **C2. F-derived sizing hooks** — height/track/thumb expressed in F units; no hard px. (I7)
- **C3. Value API** — `getValue()`, `setValue(v, triggerChange=false)`, plus `onInput`/`onChange`. A Composite uses `setValue(v, false)` to sync sibling Cells without feedback loops.
- **C4. Lifecycle** — `render()` returns the element; `destroy()` cascades; no `document.*` outside `BaseComponent`.
- **C5. No outer margin** — spacing is the container's concern.

Reference implementations: `Slider` (`borders` option, `--slider-*` F hooks), `NumericInput` (`embedded` mode, reordered `[ − | field | + ]`).

---

## 4. Assembly procedure (ordered)

1. Select primitives from `component-patterns.md §2`. If a needed primitive lacks the Contract (§3), **extend it first** — never inline DOM (component-patterns §1).
2. Build the outer Partition: container, `border: 1px solid var(--c-border)`, `box-sizing: border-box`, `gap: 0`, height = content + borders (I7).
3. Place Cells in reading order. Assign divider ownership per I3 (horizontal) or I4 (vertical).
4. Suppress each primitive's edges owned by the container or a neighbour (C1) so every join is single-line (I6).
5. Wire cross-Cell state with C3 (`setValue(v, false)` on the siblings).
6. Make Stack edges toggleable for flush stacking (e.g. `topBorder` option + `setTopBorder()`); default the edge ON (standalone-correct).
7. Title: an attached title div above the control box — `border-left`+`border-right` always, `border-top` = Stack-edge toggle, **no `border-bottom`** (control box top is the shared divider, I4). Box: `height: 1.5F`, `padding: 0 F/2`, `box-sizing: border-box`. Label UPPERCASE `F × 0.75` left, `var(--c-text)` (text-treatment §2), ellipsis overflow. The `0 F/2` title inset is fixed for every Composite so titles align down a mixed column; it is intentionally tighter than the `0 F` of interactive Cells below it (matches `ExpressionParam`).
8. States: cover the design-law §14 taxonomy; inversion + accent-edge error (I8).

---

## 5. Flush stacking of Composites in a block

- The block sets `flush` → `gap: 0` on its content (`tool-base._blockContentStyle`).
- The block container owns its padding `F` and the block header owns its `border-bottom`.
- The first Composite keeps its Stack edge; each subsequent Composite sets the Stack-edge toggle OFF (`topBorder: false`) so the stack is one continuous bordered column (border-system §3).
- A primitive that is not Contract-compliant (§3) MUST NOT be flush-stacked with Composites; give it the Contract first.

---

## 6. Worked example A — `ExpressionParam` (reference)

One Partition, title div + control box, three Cells in the control box.

```
┌ LABEL ───────────────────┐   title div: border-top (toggle) + L + R, no bottom
├───┬──────────┬───┬────┬───┤   control box top = shared divider (I4)
│ = │ ───o───  │ − │ {} │ + │   = toggle | Slider | NumericInput(embedded)
└───┴──────────┴───┴────┴───┘   control box: top + L + R + bottom
```

- Cells: toggle (first, no border), `Slider` (`borders:{left:true,…false}`), `NumericInput` (`embedded`, `[ − | field | + ]`).
- Dividers: every Cell after the toggle owns `border-left` (I3).
- Stack edge: `topBorder` on the title div; `setTopBorder(false)` when flush-stacked (§5).
- Files: `assets/js/shared/components/input/ExpressionParam.js`, `Slider.js`, `NumericInput.js`; wiring `tools/generators/core/parameter-builder.js`, `tools/core/tool-base.js`.

---

## 7. Worked example B — `ToggleGroup` (reference)

`assets/js/shared/components/input/ToggleGroup.js` is a Composite: one bordered Partition of toggle/radio/checkbox Cells, no gaps, state by row inversion. (Pre-refactor it violated the law — items in a flex column with `gap: F/2` (I1), no outer Partition, label at `F` non-uppercase, state by a decorative check box (I8).)

Vertical `list` layout:

- **Outer Partition:** items container = `border: 1px solid var(--c-border)`, `box-sizing: border-box`, `gap: 0`.
- **Title div** (when `label` set): attached above, same rule as §6 step 7 (`height: 1.5F`, `padding: 0 F/2`, top = `topBorder` toggle, L+R always, no bottom). Label UPPERCASE `F × 0.75` left.
- **Item Cell:** `height: 2F`, `padding: 0 F`, UPPERCASE `F × 0.75` left (text-treatment §8). Vertical stack (I4): first item `border-top: none`; each later item `border-top: 1px` (the container owns the bottom). No gap.
- **State:** active/selected item inverts (`bg var(--c-text)`, `color var(--c-bg)`); no custom-box glyph — inversion is the signal (I8). Hover inverts; active-selected stays inverted.
- **Horizontal `row` layout:** horizontal stack (I3) — each Cell after the first owns `border-left`, `gap: 0`; active inverts.
- **`grid` layout:** `grid-template-columns: repeat(N, …)`, `gap: 0`; each Cell owns `border-left` when not in column 0 and `border-top` when not in row 0; the container owns the outer box.
- **Contract:** `topBorder` + `setTopBorder()` (Stack edge); `embedded` flag drops the outer box and keeps `border-left` only (C1); `getValue`/`setValue`/`onChange` unchanged (C3).
- Wiring: `parameter-builder` sets `topBorder: false` on every Contract-aware component after the first in a group; `tool-base` forwards `topBorder`/`embedded` for `toggle`/`radio`/`checkbox`.

`ToggleGroup` is thus a segmented partition consistent with every other control, and Contract-compliant (`embedded` lets it nest inside another Composite).

---

## 8. Acceptance checklist (binary)

- [ ] Renders as exactly one outer Partition; `gap: 0` everywhere inside.
- [ ] Every internal line is `1px` with a single Owner; no `2px` joins.
- [ ] Horizontal dividers via `border-left`; vertical via one of `border-top`/`border-bottom` (not both).
- [ ] Each embedded primitive suppresses container/neighbour-owned edges (C1).
- [ ] Stack edge toggleable; default ON; flush stack sets it OFF after the first.
- [ ] All sizes F-derived; interactive rows `2F`; outer height includes borders via `border-box`.
- [ ] State by inversion; error by accent on one owned edge.
- [ ] Cross-Cell state synced via `setValue(v, false)`; no feedback loop.
- [ ] No `margin` for spacing; no inline DOM for a primitive that exists in `component-patterns.md §2`.

---

End of Composite Component Construction.
