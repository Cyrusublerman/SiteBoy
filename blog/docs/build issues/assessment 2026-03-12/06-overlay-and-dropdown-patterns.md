# 06 — Overlay and Dropdown Patterns

Source: [complaint-distort_build-120326.md](../complaint-distort_build-120326.md)
Part of: [assessment 2026-03-12/](.)

---

## Complaint Passages

> "the dropdown needs its own overflow and should be on a different layer and not alter the size of the sidebar. it is missing its left right and bottom borders but has an unneccesary top border"
> "the drop down for the export options is not the same width as the export button"
> "on hover there should be popup text that gives a one sentence description of the module"
> "the collapsable sections are styled wrong and not in line with out other collapsable elements of the site"
> "the collapsable sections in the add module dropdown should be closed by default"

---

## 1. The Tension Between Partition Law and Temporal Expansion

The partition model requires that every visible element be a partition of its parent rectangle. Partitions are static: they exist as subdivisions of the page at all times. The layout does not change when the user interacts — partitions remain in place, and only their contents (text, state signals, visual treatments) change.

But many UI patterns require a surface that only exists at certain times — a surface that appears on demand and disappears when no longer needed. Dropdowns, pickers, tooltips, and expanded panels are all temporal: they are not always present in the layout.

This creates a genuine structural tension in the SiteBoy system. The partition model has no native vocabulary for temporal surfaces. The law prohibits floating elements — but a dropdown that appears on demand, if it takes space from other partitions, would alter the layout (violating partition stability). If it floats above the layout, it violates the floating prohibition.

The system currently resolves this tension inconsistently:

- `DistortToolbar` export dropdown: absolutely positioned floating panel (floating violation)
- `CategoryPicker`: inserted as a flex child of the content area, displacing other content (layout alteration)
- Collapsible sections in NodePanel/CategoryPicker: inline expansion, pushing content below (layout alteration — but within a scrollable container, so acceptable)

None of these approaches is defined as the authorised pattern. Each builder invents a local solution. Each local solution produces a different class of violation.

---

## 2. Overlay Failures in the Distort Build

### 2.1 Export Dropdown — Floating Panel

The export dropdown is `position: absolute; top: 100%; right: -1px`. This places it entirely outside the normal document flow — it does not occupy space in the toolbar; it floats above the interface below.

The dropdown has its own four-sided border (`border: 1px solid var(--c-border)`). Its width (`min-width: 15F`) is independent of the EXPORT cell that triggers it. Its right edge does not align with the toolbar's right edge; the `-1px` offset is a local pixel correction with no F-system basis.

The result is a panel that reads as an object placed on top of the page, not as a partition of it. This is the literal definition of a floating element — which is prohibited by `design-law.md §3.3`.

The correct approach for an export dropdown in this system: the export cell in the toolbar should expand downward, with the dropdown becoming a partition below the toolbar (pushing the content area down by the dropdown's height, or — in a scrollable sidebar context — using the sidebar's own scroll). The dropdown's left and right edges share the export cell's edges. Its top edge is the toolbar's bottom edge. Its bottom edge is a new shared boundary.

Alternatively, if the export list is long and pushing the layout is unacceptable, the dropdown may be a bounded overlay that shares all four of its edges with named structural elements — but this requires the system to define an authorised overlay pattern, which does not currently exist.

**Guide:**
- `design-law.md §3.3` — "Floating elements are prohibited unless explicitly required by the brief."
- `design-law.md §10` — "floating cards" prohibited.

**[NO GUIDE]:** No standard defines an authorised overlay pattern. No standard specifies how a toolbar dropdown should relate to its trigger cell in width or boundary.

### 2.2 CategoryPicker — Layout-Altering Inline Substitution

The `CategoryPicker` replaces the content of the EffectStack's content area. It is inserted as a flex child via `appendChild`, displacing the NodePanel list. The sidebar's overall height and overflow behaviour change when the picker is open.

The complaint identifies two structural problems:
1. The picker alters the size of the sidebar — it should be on its own layer, not affecting the document flow
2. It has incomplete borders (top only; no left/right/bottom)

The `design-law.md §8.4` preference for inline expansion over modal interruption suggests the inline approach is directionally correct: the picker should replace content in the sidebar, not open a modal above it. But the implementation does not correctly contain the picker within the sidebar's boundaries — it alters the sidebar's layout instead of substituting content within a stable container.

The correct implementation: the picker is placed into a stable, fixed-height container within the sidebar (a container that does not grow). The container maintains its boundaries; the picker fills it. The picker shares the container's left, right, top, and bottom edges — its borders are the container's borders. The picker does not have independent borders; it inherits them from the container.

This is the distinction between a panel that *replaces content* (correct) and a panel that *alters the container* (incorrect).

**Guide:**
- `design-law.md §8.4` — "Prefer inline expansion, substitution, or subdivision before modal interruption." Inline substitution is the right approach; the execution violates partition law.
- `design-law.md §3.2` — Incomplete border set; left/right/bottom edges are not defined.

### 2.3 Collapsible Sections — Inconsistent Pattern

The CategoryPicker uses collapsible category headers. These headers have a specific visual treatment: `▸`/`▾` glyphs, `var(--c-border)` text colour, and default-open state. Other collapsible elements in the site (NodePanel body, mask section, etc.) use the same glyph pattern but may differ in colour treatment and default state.

The complaint identifies:
- Collapsible sections default to open; site convention is closed by default
- The styling does not match other collapsible elements

`design-law.md §8.1` — "If an element is created without considering the logic of analogous elements, it is a failure." The builder of the CategoryPicker did not audit the existing collapsible pattern and verify that the CategoryPicker's implementation matched it.

The authorised collapsible pattern is implied by existing usage but not documented. Because it is not documented, the builder had no reference to check against.

**Guide:**
- `design-law.md §2.5` — systemic inheritance required.
- `design-law.md §8.1` — analogy-first rule.

**[NO GUIDE]:** The collapsible pattern is not documented as a named component with defined visual treatment and default state. Builders must infer it from existing usage — which is unreliable when usage is inconsistent.

### 2.4 Hover Descriptions — Missing Pattern

> "on hover there should be popup text that gives a one sentence description of the module"

The module items in CategoryPicker have labels only. There is no mechanism for displaying a description on hover. The user cannot learn what a module does without adding it to the stack and observing its effect.

A hover description (tooltip, annotation, or inline expansion) is a contextual information pattern. The design-law's inline preference (`§8.4`) and simultaneity rule (`§8.3`) suggest that if contextual information must be shown, it should be shown inline rather than in a floating tooltip — but the law does not define a pattern for this.

The complaint's specification — "popup text that gives a one sentence description" — implies a tooltip. Tooltips are floating elements. The design-law prohibits floating elements. This is a genuine conflict: the natural solution (tooltip) is prohibited, but no inline alternative is defined.

Resolving this conflict requires a documented pattern for contextual information at point of interaction that is both partition-compliant and usable. Possible approaches:
- An inline expansion: the item grows to show the description below the label (alters layout — problematic in a fixed picker)
- A dedicated description panel: a fixed-size region at the bottom of the picker that shows the description of the hovered item (a partition of the picker — partition-compliant, but requires a permanently visible region even when no item is hovered)
- A status bar: a thin strip at the bottom of the sidebar that shows contextual information on hover (a partition of the sidebar — partition-compliant, general-purpose)

None of these is currently defined. The complaint correctly identifies the need; the system does not have a pattern to satisfy it.

**[NO GUIDE]:** No pattern exists for contextual information at point of interaction. No standard defines how hover descriptions, tooltips, or inline annotations should be structured in this system.

---

## 3. Analysis: The Temporal Surface Problem

The consistent thread across all overlay and dropdown violations is the absence of a defined pattern for temporal surfaces — elements that exist only during certain states of the interface.

The partition model as defined handles static surfaces well. It does not handle temporal surfaces at all. The law's response to temporal surfaces is to prohibit the most common approach (floating overlays) and recommend inline expansion. But inline expansion has its own partition implications that are not addressed.

The current guide offers:
- §3.3: prohibit floating elements
- §8.4: prefer inline before modal
- §8.3: simultaneity (concurrent controls must remain accessible)

It does not offer:
- A defined pattern for inline substitution (how to replace content within a fixed container without altering the container)
- A defined pattern for anchored expansion (how to expand below a trigger cell without floating)
- A defined pattern for contextual information on hover
- A defined pattern for collapsible elements (default state, visual treatment, animation policy)
- A defined pattern for any temporal surface

---

## 4. What Needs to Exist

An overlay and dropdown pattern standard is needed that defines:

**4.1 Temporal surface classification.** Three categories:
- **Inline substitution**: one content region replaces another within a fixed container. No layout alteration. Container shares all edges with the substituting content.
- **Anchored expansion**: a new partition appears adjacent to (above, below, or beside) an existing partition. The parent container grows. All edges of the expansion are shared with named structural elements.
- **Bounded overlay**: a surface that appears above the layout. Shares at least two edges with structural elements (e.g. left and right edges of the sidebar). Never floats without structural anchoring. Must define all four edges explicitly.

**4.2 Prohibition on unanchored overlays.** A floating surface that does not share at least two edges with named structural elements is prohibited. The export dropdown's `position: absolute; min-width: 15F` with no edge registration is the failure case.

**4.3 Collapsible component standard.** Define:
- Default state: closed
- Open/close glyph: `▸` (closed) / `▾` (open), placed at the right of the label
- Colour: `var(--c-border)` for the header in closed state; `var(--c-text)` for the header in open state
- Transition: none (immediate, no animation)
- Header height: `2F`
- Content: inline, within the parent container's scroll context

**4.4 Contextual information pattern.** Define an authorised pattern for hover/focus descriptions:
- A status strip: a `2F`-high partition at the bottom of the containing panel that shows the description of the focused/hovered item. Empty when no item is focused. Always present as a partition (not appearing/disappearing on hover).
- Content: one sentence, Sentence case, `F × 0.75px`, `var(--c-border)` colour when empty, `var(--c-text)` when populated.

**4.5 Dropdown width rule.** A dropdown that expands from a trigger cell must match the trigger cell's width at minimum. If the dropdown requires more width (e.g. for longer labels), it may extend to the nearest structural boundary (e.g. the sidebar edge or viewport edge), but must share that edge explicitly.
