# SiteBoy Design Law

Absolute authority for SiteBoy visual and interaction form.

If any subordinate document conflicts with this file, this file wins.

Related documents:
- `blog/docs/site/ui-interface-overview.md` — operational layouts and page archetypes
- `blog/docs/guides/standards/tool-standards.md` — tool minimum functionality
- `blog/docs/components/COMPONENT-REFERENCE.md` — component API

Implementation guides (apply this law to concrete situations):
- `blog/docs/guides/standards/border-system.md` — every border decision with exact CSS
- `blog/docs/guides/standards/semiotics.md` — every symbol, glyph, and DOM structure
- `blog/docs/guides/standards/text-treatment.md` — every text context with case, size, alignment, padding
- `blog/docs/guides/standards/component-patterns.md` — component selection, space division, build recipes, duplication prevention
- `blog/docs/guides/standards/composite-components.md` — building components from subcomponents bound into one partition (shared boundaries, no gaps, stack-aware borders)

---

## 0. Scope

This document owns:
- aesthetic doctrine
- geometric law
- scale law
- typography law
- colour law
- state signalling law
- prohibited patterns

This document does not own:
- component constructor API
- tool-specific workflows
- algorithm behaviour
- concrete CSS implementation patterns (see `border-system.md`, `semiotics.md`, `text-treatment.md`, `component-patterns.md`)

---

## 1. Terms

| Term | Definition |
| --- | --- |
| Root Rectangle | The page treated as one bounded field. |
| Partition | A child rectangle created by subdividing a parent rectangle. |
| Shared Boundary | One border line jointly owned by adjacent partitions. |
| Floating Element | A visible element that reads as placed on top of the sheet rather than cut from it. |
| PCS | Primary Content Surface. The dominant region of a page. |
| F | Global geometric constant. Base unit = 14px. |
| Local Rule | A sizing, spacing, border, or behaviour rule that applies only to one element or one local case. |

---

## 2. First Principles

### 2.1 Root Rectangle

SiteBoy must read as one rectangle that is recursively subdivided.

### 2.2 Recursive Partitioning

Every visible region must be legible as a partition of its parent region. UI is built by subdivision, not placement.

### 2.3 Shared Boundary

Borders are usually shared boundaries between adjacent partitions, not private outlines around isolated objects.

### 2.4 Deterministic Scale

All size and spacing derive from `F`. A compliant interface can be rescaled coherently by changing `F` once.

### 2.5 Systemic Inheritance

No element may invent its own local visual logic if an analogous element already exists elsewhere. New work must inherit existing law.

### 2.6 PCS Primacy

Each page has exactly one PCS. Secondary regions must visually defer to it.

### 2.7 Functional Hierarchy

Hierarchy is communicated by partition depth, adjacency, case, inversion, and boundary. Decoration is not a hierarchy mechanism.

### 2.8 Informative Minimalism

If an element neither exposes content, signals state, nor enables action, it should not exist.

---

## 3. Geometric Law

### 3.1 Partition Rule

1. Every visible element must belong to a parent rectangle.
2. Every child rectangle must align to the geometry of its siblings.
3. A region that cannot be explained as a partition is invalid.

### 3.2 Boundary Rule

1. Prefer shared boundaries to isolated outlines.
2. Prefer adjacency to empty separation.
3. Use outer margin only at page or major container edges.
4. Internal separation is by shared boundary, not by floating gap.

### 3.3 Floating Prohibition

Floating elements are prohibited unless explicitly required by the brief.

Examples of prohibited float:
- card panels
- detached action buttons
- modal-like chrome when inline partitioning is possible
- sidecars that break the sheet into unrelated objects

### 3.4 Structural Consistency

If one action region is partitioned into cells, analogous action regions should use the same logic unless a stronger system rule requires otherwise.

---

## 4. Scale Law

### 4.1 Global Constant

`F = 14px`.

All compliant dimensions derive from `F`, `F/2`, or an integer multiple of `F`, plus `1px` shared boundaries where required.

### 4.2 Deterministic Ratios

1. Control height defaults to `2F`.
2. Sidebar width defaults to `30F`.
3. Padding and gaps must be expressible through the same token system.
4. No ad-hoc local pixel values for layout logic.

### 4.3 Compliance Test

If changing `F` breaks proportion, alignment, or rhythm, the affected component is non-compliant and must be redesigned.

---

## 5. Typography Law

### 5.1 Family

Canonical font: `'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace`.

This matches the global declaration in `base.css`. No other typeface is authorised. The previous reference to Space Mono in this section was incorrect and is superseded.

### 5.2 Case Roles

| Role | Case |
| --- | --- |
| Tabs, toolbar cells, node names, parameter labels, select options | UPPERCASE |
| Block titles, section titles | Title Case |
| Body prose, explanatory sentences | Sentence case |
| Status microcopy | lowercase only when intentionally quiet and secondary |

### 5.3 Function

Typography exists to expose structure and state. It must not be used as ornament, atmosphere, or branding excess.

### 5.4 Prohibitions

Prohibited:
- mixed font systems without explicit authority
- decorative weight/size exceptions
- bespoke letterforms for one component
- typographic emphasis used where partition or inversion should solve the problem

---

## 6. Colour Law

### 6.1 UI Surfaces

UI code uses only:
- `var(--c-bg)`
- `var(--c-text)`
- `var(--c-border)`
- `var(--c-accent)`

No raw `hex`, `rgb`, `rgba`, `hsl`, or named colours in UI styling.

### 6.2 Rendered Output

Rendered output may use its own palette only where the owning document allows it. For VGA-bound output, use the restricted VGA palette only.

**Canvas output exception.** Pixels drawn to a `<canvas>` element as the generator's visual output are exempt from the VGA/CSS-variable constraint. Only UI surface colours — borders, backgrounds, text, control chrome — must use `var(--c-*)` tokens. Generator canvas output may use any colour. This exemption is strictly scoped to rendered canvas pixels; it does not apply to any UI element surrounding or overlaying the canvas.

### 6.3 State Signalling

State is shown by:
- inversion
- shared boundary
- positional change
- explicit value change

State is not shown by decorative colour ramps, glow, shadow, or soft emphasis.

---

## 7. PCS Law

1. Each page type has one PCS.
2. Secondary controls must defer to the PCS in area, contrast, and structural emphasis.
3. Tool pages are canvas-first.
4. Documentation pages are text-first.
5. Gallery pages are media-first.
6. TOC pages are list-first.

If a secondary surface competes with the PCS, the layout is wrong.

---

## 8. Behaviour Law

### 8.1 Inheritance Rule

If an element is created without considering the logic of analogous elements, it is a failure and must be remade.

### 8.2 Exception Rule

If a design need appears to require a local exception, extend the general law first. Do not special-case a component before testing whether the system itself needs a new rule.

### 8.3 Simultaneity Rule

Controls required at the same time should remain simultaneously accessible. Do not hide concurrent tasks behind avoidable tab switches or detached popups.

### 8.4 Inline Preference

Prefer inline expansion, substitution, or subdivision before modal interruption.

---

## 9. Component Validity Test

A component is valid only if all are true:

1. It reads as a partition, not an object.
2. Its borders are structurally justified.
3. Its size derives from `F`.
4. Its spacing derives from the same system as its neighbours.
5. Its typography follows the common law.
6. Its state signalling matches the rest of the site.
7. Its behaviour does not create a local exception without authority.

Any failure blocks adoption.

---

## 10. Prohibited Patterns

Prohibited unless explicitly authorised:
- floating cards
- detached bordered buttons in open space
- unshared outlines between adjacent regions
- decorative gaps that break the sheet
- raw layout pixels outside the `F` law
- multiple competing type systems
- gradient, shadow, glow, blur-chrome, rounded corners
- local one-off spacing conventions
- controls overlaid on a PCS when they can exist as partitions around it
- tool-specific aesthetic rules that override site law

**Exception — toolbar-anchored dropdown panels:** Export menus and info panels attached to the toolbar bottom edge are permitted when they use `var(--c-border)` shared boundaries, dismiss on outside click, do not permanently obscure the PCS, and do not introduce independent scroll contexts that compete with the sidebar. Applies to `GeneratorToolbar` and `GlyphBuilderToolbar`.

---

## 11. Authority Map

| Concern | Owning Document |
| --- | --- |
| Design law (principles) | `blog/docs/guides/standards/design-law.md` |
| UI operational layouts | `blog/docs/site/ui-interface-overview.md` |
| Tool minimum functionality | `blog/docs/guides/standards/tool-standards.md` |
| Component API | `blog/docs/components/COMPONENT-REFERENCE.md` |
| Tool-specific layout contracts | Tool-specific docs such as `blog/docs/components/distort/ui-ux.md` |
| Border rules (concrete CSS) | `blog/docs/guides/standards/border-system.md` |
| Glyph and symbol catalogue | `blog/docs/guides/standards/semiotics.md` |
| Text treatment by context | `blog/docs/guides/standards/text-treatment.md` |
| Component selection, space division, build recipes | `blog/docs/guides/standards/component-patterns.md` |

Subordinate documents may add local constraints. They may not override this law.

---

## 12. Implementation Gate

Before introducing any UI element, answer:

1. What parent rectangle does this belong to?
2. What shared boundaries justify it?
3. What `F`-derived rule sizes it?
4. What existing element class is it analogous to?
5. Why is it not floating?
6. Why is its state signalling consistent with the rest of the site?
7. Does an equivalent element already exist? If so, use it.
8. Does every edge of this partition share a boundary with a sibling or parent?
9. Which existing element does this most closely resemble — inherit from that, not from scratch.
10. Does this element handle all required states (uninitiated, loading, active, hover, active-selected, disabled, error, context-broken)?
11. Does the label exactly describe the interaction type triggered?
12. If this is a fix for a reported issue: does every clause of the complaint have a corresponding code change? Has each been verified by reading the current code, not by recollection?

If any answer is unclear, redesign before implementation.

---

## 13. Labelling and Naming Law

### 13.1 Label-Type Taxonomy

Every visible label belongs to exactly one type:

| Type | Definition | Example |
| --- | --- | --- |
| State label | Describes the current state of the element or system | `NO SOURCE`, `RENDERING...` |
| Action label | Names the action triggered by activating the element | `EXPORT PNG`, `ADD EFFECT` |
| Identifier | Names a value, object, or region without implying action or state | `BLUR RADIUS`, `PIPELINE` |
| Qualifier | Modifies a noun within its containing scope | `GLOBAL SEED`, `FRAME COUNT` |

### 13.2 Action Label Rules

1. An action label must describe the consequence, not the mechanism: `EXPORT PNG` not `SAVE FILE`.
2. An action label must not name a UI mode without defining the consequence of entering that mode.
3. A label that describes no consequence is opaque and must be replaced.

### 13.3 State Label Rules

1. A state label must be immediately legible without prior knowledge of the system.
2. Opaque state names that require learning are prohibited: prefer `DRAFT` over `PREVIEW`, `FULL QUALITY` over `FULL`.
3. A cyclic toggle must display the current state, not the state that will be entered.

### 13.4 Signifier-Type Matching

A glyph appended to a label signals an interaction type. The glyph must match the actual interaction:

| Glyph | Interaction type | Permitted on |
| --- | --- | --- |
| `▾` | Opens a dropdown list | Buttons that open a dropdown list only |
| `+` | Adds a new item | Buttons that create or append only |
| `×` | Closes or removes | Close buttons and remove actions only |
| `▸` / `▾` | Expands / collapses inline section | Collapsible section headers only |
| `…` | Opens a file dialog or continuation | File picker triggers only |

Using `▾` on a file picker trigger (which opens a dialog, not a list) violates this rule.

**Intent vs mechanism disambiguation:** When an action's semantic intent (add, create, append) differs from its execution mechanism (file dialog, API call, modal), classify by intent. Example: a button that adds a source image opens a file dialog — the intent is "add", so the glyph is `+`, not `…`. Use `…` only when the action's primary semantics is "browse" or "continue", not "add".

**Explicit instruction override:** When a user explicitly specifies a glyph, label, or behaviour for a particular element, that instruction overrides the categorical default from this table. Guide rules are defaults; user instructions on specific elements are requirements.

### 13.7 Authorised Font Sizes

Permitted font size multipliers within the F-system:

| Token | Value | Use |
| --- | --- | --- |
| Body / controls | `F × 0.75` | All buttons, inputs, labels, list items |
| Standard | `F` | Block titles, section headers |

No other multiplier (e.g. `F × 0.85`, `F × 1.5`) is authorised. If visual distinction is needed, use weight, case, or colour — not a non-standard font size.

### 13.5 Context-Relative Minimalism

Strip any qualifier that is redundant given the surrounding context:

- Inside a module picker, the word "Module" is known from context. Remove it from every item label.
- Inside a source block, the word "Source" in an item label is redundant if the block title already establishes context.

### 13.6 Vocabulary Consistency

| Correct | Incorrect | Reason |
| --- | --- | --- |
| SEARCH | FILTER | "Filter" means reduce an existing set; "search" means match against a query. Use the semantically accurate term. |
| ADD EFFECT | ADD MODULE | The user creates an effect in the stack, not a module. |

---

## 14. State Representation Law

### 14.1 State Taxonomy

Every interactive or stateful element must define behaviour for every applicable state:

| State | Definition |
| --- | --- |
| Uninitiated | Element exists but no user action has yet occurred; no data present |
| Loading | Computation or IO is in progress |
| Active | Element is in normal operation with data present |
| Hover | Pointer is over the element |
| Active-selected | Element is active and also currently selected or toggled on |
| Disabled | Element exists but cannot be activated in the current context |
| Error | An operation has failed or an invalid state has been reached |
| Context-broken | The element cannot function because a dependency is missing |

### 14.2 Uninitiated / Empty State

Every container that accepts user-provided content must show an explicit uninitiated state when empty:

1. The uninitiated state must include an affordance for the next action.
2. The affordance must use an action label (§13.2), not a passive description.
3. A black void or silent blank is not an uninitiated state.

Example: a viewport with no source image must display an affordance such as `UPLOAD IMAGE` that is itself interactive, not merely present.

### 14.3 Error State

1. The error state must be visually distinct from the idle/active state.
2. Error state must not share the same border colour as the idle border.
3. Use `var(--c-accent)` for error signalling if no dedicated error token exists.

### 14.4 Loading State

1. Loading state must present a deterministic text signal: e.g. `RENDERING...`.
2. Spinners and indeterminate animations are prohibited.
3. The loading signal must be positioned within the element it represents, not detached.

### 14.5 State Verification Requirement

Before shipping any interactive element, confirm each applicable state has been defined and implemented. An element with undefined states is incomplete.

---

## 15. Signifier Catalogue

### 15.1 Position Rules

1. State glyphs are positioned on the left side of the label.
2. Action glyphs are positioned on the right side of the label.
3. A glyph placed on the wrong side violates the position rule and must be corrected.

Examples:
- `▸ COLOUR GRADE` — category collapsed (state glyph, left — correct)
- `ADD EFFECT +` — not `+ ADD EFFECT` (action glyph, right — correct)
- `EXPORT ▾` — export dropdown trigger (action glyph indicating expansion, right — correct)

### 15.2 Glyph-Type Matching Rule

A glyph must match the interaction type of the element it is attached to (see §13.4). Mismatched glyphs are a §13 violation.

### 15.3 No Centred Glyphs in List Items

List items use left-aligned text. Glyphs within list items follow the same left/right position rule as all other elements. Centred item text is prohibited (§5.2 applies; all list items are UPPERCASE left-aligned).

---

## 16. Overlay and Dropdown Patterns

### 16.1 Temporal Surface Types

Three permitted patterns for elements that expand or appear in response to user action:

| Pattern | Definition | When to use |
| --- | --- | --- |
| Inline substitution | Replaces the triggering partition in-place; no additional surface | Pickers, filters, detail views within a bounded region — only when replacement does not alter the size of the containing region |
| Anchored expansion | Appends directly below (or adjacent to) the trigger; shares a boundary | Dropdowns, option menus |
| Bounded overlay | Occupies a defined region within the established layout; does not escape it | Full-panel pickers, search overlays within a sidebar — required when the surface must not alter the layout of its parent |

Floating overlays that appear in arbitrary screen positions are prohibited (§3.3).

**Anchored expansion — implementation requirements:**
- `position: absolute; top: 100%` relative to the trigger cell.
- `min-width: 100%` of the trigger cell (dropdown is never narrower than its trigger).
- Do not set `min-width` to a value exceeding the trigger cell's width.
- `border: 1px solid var(--c-border); border-top: none` (top boundary shared with trigger's bottom).
- `z-index` above sibling content.

**Bounded overlay — implementation requirements:**
- `position: absolute; inset: 0` relative to the nearest positioned ancestor (the containing panel).
- `z-index` above sibling content within that ancestor.
- `overflow-y: auto` for scrollable content.
- Borders: left, right, and bottom (`1px solid var(--c-border)`). Top border: none (shared with trigger element's bottom).
- Must not alter the layout dimensions (height, width, scroll) of its parent or siblings.

### 16.2 Dropdown Width Rule

A dropdown menu must be at least as wide as its trigger element. The dropdown must share a boundary with the trigger (top of dropdown = bottom of trigger). Width may exceed the trigger but must not be narrower.

### 16.3 Collapsible Section Standard

1. Border: top only — a collapsible section header uses `border-top: 1px solid var(--c-border)`.
2. Default state: collapsed, unless the total item count across all sections is fewer than five.
3. State glyph: `▸` when collapsed, `▾` when expanded; positioned left of the label.
4. A collapsible section must not introduce private four-sided borders.
5. Header text colour: `var(--c-text)`. Do not use `var(--c-border)` for collapsible header text.

### 16.4 Contextual Information Pattern

Hover descriptions for items in a list or picker are delivered via the native `title` attribute on the interactive element. No tooltip component or floating label is required unless the native title mechanism is insufficient.

The `title` attribute value must be populated from a data source that exists. Setting `title` to a fallback that equals the visible label provides no information and does not satisfy this requirement.

---

## 17. Toolbar Partition Rules

### 17.1 Cell Width Uniformity

All action cells in a toolbar (buttons that trigger actions: undo, redo, zoom modes, quality toggle, export, and equivalent) share equal width, sized at an integer F-multiple. The F-multiple is chosen so all cells fit within the available space; the recommended default is `6F` (`84px` at `F = 14px`).

### 17.2 Status Cell

One cell per toolbar is the **status cell** (e.g. source info, current file). Canonical term: "status cell". Do not call it "flex cell" or "source cell" in guide documents — those are implementation details or role-specific names. It uses `flex: 1` and absorbs all remaining width. In landscape orientation, its `min-width` equals the sidebar width constant (`30F`). In compact/portrait mode, its `min-width` reduces to `0`.

### 17.3 No Unclaimed Space

The sum of all fixed-width action cells plus the flex status cell must exhaust 100% of toolbar width at all viewport sizes. No gap, margin, or unclaimed region is permitted at any toolbar edge.

### 17.4 Dropdown Width

A dropdown menu anchored to a toolbar cell:
- Has `min-width: 100%` of its parent cell.
- Does not set a `min-width` value exceeding the parent cell's own width.
- May grow wider than the parent cell if content requires it, but the anchor point is the parent cell's boundary.

---

## 18. Status-Plus-Action Cell Format

A toolbar cell that displays both a static label (identifier) and dynamic content (state or action) uses the format:

```
LABEL: DYNAMIC_VALUE
```

When no value is loaded and the cell affords an add action, the dynamic portion includes the action glyph:

```
SOURCE: ADD SOURCE +
```

When a value is loaded, the dynamic portion shows the value without a glyph:

```
SOURCE: FILENAME.PNG 1920×1080
```

The static label (e.g. `SOURCE:`) is always present and never changes. The dynamic portion changes with state.

---

## 19. Bug-Fix Process and Verification Protocol

### 19.1 Process

When fixing a reported issue:

1. Read the complaint in full. Identify every discrete clause (one sentence = one clause).
2. Create a per-clause tracking list. Each clause maps to one or more required code changes.
3. Implement fixes for every clause. Do not skip structural fixes in favour of cosmetic ones.
4. Run post-fix verification (§19.2).

### 19.2 Post-Fix Verification

After implementing fixes for reported issues:

1. Re-read every sentence of the original complaint.
2. For each discrete clause, identify the specific code change (file, method, line) that addresses it.
3. If no code change addresses a complaint clause, the fix is incomplete. Do not mark the task as done.
4. Structural issues (overlay architecture, lifecycle bugs, responsive failures) must not be deferred in favour of cosmetic fixes. A cosmetic fix in isolation is not a fix.
5. Data dependencies must be fulfilled: if code reads a field (e.g. `entry.description`), that field must be populated in the data source. Code that reads an absent field is not a fix.
6. User-specified glyphs, labels, and behaviours on specific elements override guide categorical defaults. Guide rules are system-wide defaults; user instructions on a specific element are requirements for that element.

---

End of Design Law.
