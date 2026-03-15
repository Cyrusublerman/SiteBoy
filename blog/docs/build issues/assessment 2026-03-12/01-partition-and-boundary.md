# 01 — Partition and Boundary Integrity

Source: [complaint-distort_build-120326.md](../complaint-distort_build-120326.md)
Part of: [assessment 2026-03-12/](.)

---

## Complaint Passages

> "the add effect button is a floating button that does not share borders which is violation"
> "there is a double border under the button which is a clear violation"
> "the dropdown needs its own overflow and should be on a different layer and not alter the size of the sidebar. it is missing its left right and bottom borders but has an unneccesary top border"
> "the drop down for the export options is not the same width as the export button. there is an awkwards empty gap between the export button and the right border"
> "the buttons at top are not proportional. the preview and export are not divisions of the space"

---

## 1. The Partition Model: A Formal Statement

The SiteBoy design system is built on one governing geometric principle: the page is a single rectangle, and every visible region is a partition of that rectangle. Partitioning is recursive — a partition may itself be subdivided into child partitions, each of which subdivides its parent, and so on. No element floats, overlaps, or exists outside this hierarchy.

This is not an aesthetic preference. It is a structural epistemology: the page has exactly one consistent geometric logic, and every element's position, size, and boundary are derivable from that logic. A user who understands the root rectangle can understand the position of any element without needing local explanations. A builder who follows the partition model cannot produce a floating element, a misaligned boundary, or an unexplained gap — because the model leaves no room for those outcomes.

The two operative consequences:

**Shared boundaries:** When two partitions are adjacent, they share one edge. That edge is one line — one 1px border — jointly owned by both regions. It is not two lines, one belonging to each region independently.

**Exhaustive coverage:** The union of all child partitions must equal the parent. There are no gaps between partitions, no unclaimed regions, and no space that belongs to no partition.

---

## 2. The Distort Build Violations

### 2.1 EffectStack Add Button — Private Border

The add button in `EffectStack` is rendered as:

```
border: 1px solid var(--c-border);  // all four sides
```

Below it, the content area is rendered as:

```
border-top: 1px solid var(--c-border);
```

This produces two independent 1px lines between the button and the content area. They are adjacent, both border-coloured, and produce a visually heavier line than any other boundary in the interface. This is a double border.

The root cause: the button's four-sided private border treats it as an object placed within the stack, not as a partition of the stack. A partition does not need its own bottom border because the top border of the next partition serves that function. The button's private border is the precise definition of a "private outline around an isolated object" — the pattern `design-law.md §2.3` prohibits.

The correct structure: the button has no explicit border. Its top edge is the bottom edge of the rail above it (a shared boundary). Its bottom edge is the top edge of the content area below it (shared boundary). The content area's `border-top` is the only line between them.

**Guide:**
- `design-law.md §2.3` — "Borders are usually shared boundaries between adjacent partitions, not private outlines around isolated objects."
- `design-law.md §10` — "detached bordered buttons in open space" explicitly prohibited.
- `f-system.md §Border Handling` — "Use negative margins: `margin: -1px 0 0 -1px`" or grid with `gap: 0` to prevent double-border accumulation.

### 2.2 CategoryPicker — Incomplete Border Set

The `CategoryPicker` component, when open, is inserted as a flex child into the `EffectStack` content area. It inherits a `border-top` from the content area container. It has no explicit left, right, or bottom borders.

A panel that replaces the content of a container must define all four of its edges if it is to read as a bounded region. The `border-top` alone produces a panel that reads as open on three sides — it has a top edge defined by the containing border, but no visible containment on the remaining three sides.

The correct structure: the `CategoryPicker` should define its left, right, and bottom edges by sharing them with the sidebar's own edges (i.e., inheriting the sidebar's right border as its right edge), or — if it is to be a distinct layer — by fully enclosing itself with borders on all sides that meet the surrounding structure.

The "unnecessary top border" complaint identifies a subtler issue: when the picker is a flex child of the content area, the content area already provides a `border-top`. The picker should not independently add another. If it shares the content area's top edge, the content area's border is that edge.

**Guide:**
- `design-law.md §3.2` — "Prefer shared boundaries to isolated outlines." A panel within a larger container should share the container's edges, not re-declare them.
- `design-law.md §3.1.1` — "Every visible element must belong to a parent rectangle." A panel open on three sides does not belong to any rectangle — it is structurally ambiguous.

### 2.3 DistortToolbar Export Dropdown — Floating Panel

The export dropdown is built as:

```
position: absolute;
top: 100%;
right: -1px;
min-width: 15F;
border: 1px solid var(--c-border);
```

This is an absolutely positioned element placed below the toolbar, floating above the rest of the interface. It has its own four-sided border. It is a card panel — precisely the pattern `design-law.md §3.3` and `§10` prohibit.

The width of the dropdown (`min-width: 15F`) is independent of the EXPORT cell width that triggers it. The dropdown is wider than its parent cell in many states, extending beyond the cell's boundaries in both directions.

The "awkward empty gap" to the right of the export button is a separate but related violation. The toolbar's percentage-based widths do not sum to 100% consistently across all states, leaving an unclaimed region that belongs to no partition.

**Guide:**
- `design-law.md §3.3` — "Floating elements are prohibited unless explicitly required by the brief." The dropdown is not explicitly required; inline or anchored alternatives are possible.
- `design-law.md §10` — "floating cards" and "controls overlaid on a PCS when they can exist as partitions around it" are prohibited patterns.
- `design-law.md §3.1.3` — "A region that cannot be explained as a partition is invalid." The gap to the right of the export button is an invalid region.

### 2.4 Toolbar Proportions — Non-Partition Widths

The toolbar cells use percentage widths (`37.5%`, `6.25%`, `12.5%`). These percentages produce a toolbar that appears partitioned but is not derivable from the F-system. If F changes, the proportions do not scale coherently — the cells will re-proportionate incorrectly because their widths are relative to the toolbar, not derived from F.

Additionally, the percentages do not account for the 1px shared boundaries between cells. Each shared boundary consumes 1px from the available width. A correct F-derived toolbar accounts for these subtractions explicitly (`nF - 1px` where required by `f-system.md`).

**Guide:**
- `design-law.md §4.1` — "All compliant dimensions derive from F, F/2, or an integer multiple of F."
- `design-law.md §4.3` — "If changing F breaks proportion, the component is non-compliant and must be redesigned."
- `f-system.md §Border Handling` — "Size adjustment: `nF - 1px` only when mathematically required."

---

## 3. Analysis: Is the Principle Sufficiently Expressed?

`design-law.md` states the partition model clearly and correctly in §2.1–§2.3 and §3. The prohibited patterns in §10 are explicit. The F-system document provides concrete border handling patterns.

The principle is sufficient. The enforcement is absent.

The specific failure mode is that a builder can satisfy the stated principle at a high level while violating it in implementation detail. The Implementation Gate (§12) asks "Why is it not floating?" — but a builder can answer "because it is a child of the toolbar div" and proceed with an absolutely positioned element. The gate question is not precise enough to catch this.

What is missing is not a stronger statement of principle but a more granular test. Specifically:

**Missing test: Boundary completeness.** Before any element is implemented, it must answer: which of its four edges is shared with a named adjacent element? Any edge that is not shared with a named adjacent element must be justified by the brief. An element with zero shared edges is a floating object and is prohibited.

**Missing test: Zero-gap coverage.** The toolbar's cell widths must demonstrably sum to the toolbar width minus the count of shared boundaries × 1px. A percentage-based layout cannot satisfy this test.

**Missing test: No private bottom border when a sibling below defines a border-top.** This specific case (add button + content area) is the most common double-border source. It should be a named anti-pattern with an explicit fix.

---

## 4. What Needs to Exist

The partition and boundary principle does not need a new document. It needs a more specific implementation checklist appended to `design-law.md §12` or to a new tool-build checklist:

- Boundary completeness test (all four edges accounted for by shared boundaries or explicit justification)
- Coverage test (widths sum correctly, accounting for 1px shared boundaries)
- No-private-border-when-adjacent-sibling-exists test (named anti-pattern)
- Floating element test: "does this element have `position: absolute` or `position: fixed`?" If yes, justify or redesign

These are binary pass/fail questions that a builder can run before committing code, not after receiving a design review.
