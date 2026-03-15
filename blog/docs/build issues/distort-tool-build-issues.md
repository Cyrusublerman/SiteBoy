# Distort Tool — Build Issues

Source of complaint: [complaint-distort_build-120326.md](./complaint-distort_build-120326.md)
Aesthetic review: [distort-ui-aesthetic-review.md](../temp/distort-ui-aesthetic-review.md)

---

## Preamble

The Distort tool was built following the SiteBoy guide process. The guides were consulted; the implementation gate (`design-law.md §12`) was nominally satisfied; the component architecture follows the required patterns (BaseComponent, AnimationFoundation, F-system). Despite this, the tool contains clear violations of the stated design intent across multiple components.

This is not primarily a failure of the builder. It is evidence that the guides, as currently written, are insufficient to prevent these violations. The guides express correct principles but provide inadequate process gates, incomplete coverage of recurring concerns, and no enforcement mechanism for many of the most frequent failure modes.

The issues below are categorised, described, traced to their complaint source, and cross-referenced against existing guides. Where a complaint identifies a problem for which no guide exists, that gap is flagged. Those gaps form the basis for the assessment documents in [`assessment 2026-03-12/`](./assessment%202026-03-12/).

---

## Category 1: Source Information Duplication

> "there are two separate source information bits. one in top bar and one in side bar. the one in side bar doesnt need to exist."

**Description:** Two separate elements display the loaded source image name. The `DistortToolbar` SOURCE cell in the top rail and a `_sourceReadout` div injected into the sidebar SOURCE block both reflect the same datum. The sidebar instance carries no additional information, enables no additional action, and signals no additional state that is not already present in the toolbar.

**Code location:** `distort-main.js` lines 146–158 (`_sourceReadout` creation and injection into `sourceBlock`).

**Guide:**
- `design-law.md §2.8` — "If an element neither exposes content, signals state, nor enables action, it should not exist."
- `design-law.md §2.5` — "No element may invent its own local visual logic if an analogous element already exists elsewhere."

**Verdict:** Clear violation. The sidebar readout duplicates the toolbar cell without justification.

**Gap:** None — existing guides are sufficient to identify this violation. The failure is in enforcement, not coverage.

---

## Category 2: Toolbar Source Cell Design

> "the source topbar element should say ['Source:' | either '{Source Name}' or 'Add Source +']. it has an arrow on the right which makes no sense considering its not a drop down."
> "the one in the top bar should be the width of the side bar when in landscape and 1/4 width of body when in portrait."

**Description:** The SOURCE cell in `DistortToolbar` is built as a button displaying `NO SOURCE` with a `▾` glyph. The `▾` glyph is a universally understood dropdown signifier. Clicking it opens a native file picker, not a dropdown menu. This is a false signifier — the visual implies an interaction type that does not exist.

The cell width is set to `37.5%` of the toolbar via percentage, not via F-system derivation. The specified width should be `30F` (the sidebar constant) in landscape and a portrait-responsive fraction — neither of which is currently implemented or derivable from the current percentage.

The label format `NO SOURCE` communicates absence but provides no affordance for action. The correct format separates the static label (`SOURCE:`) from the dynamic content (`{filename}` or `ADD SOURCE +`), matching the pattern of a status cell with an inline action trigger.

**Code location:** `DistortToolbar.js` `_buildSourceCell()`, lines 97–119.

**Guide:**
- `design-law.md §6.3` — "State is shown by... positional change, explicit value change." The `▾` glyph is a state signal that maps to the wrong interaction type.
- `design-law.md §4.1–4.2` — All dimensions derive from F or integer multiples. `37.5%` is neither.
- `ui-interface-overview.md §2` — sidebar width is `30F`; the source cell in landscape should share this constant, not invent a local percentage.

**[NO GUIDE]:** No standard exists for how source / file-input cells should be labelled or structured within a toolbar partition. No standard defines the format for a status-plus-action cell (label + dynamic value + trigger).

---

## Category 3: Toolbar Proportions and Completeness

> "the buttons at top are not proportional. the preview and export are not divisions of the space. the drop down for the export options is not the same width as the export button. there is an awkwards empty gap between the export button and the right border."

**Description:** The toolbar cells are sized as percentages (`37.5%`, `6.25%` × 5, `12.5%` × 2). These do not add to 100% cleanly across all states and produce a visible gap at the right edge. Percentage-based widths are not F-derived and cannot be rescaled coherently by changing F.

The EXPORT dropdown menu is absolutely positioned and sized with `min-width: 15F`. It does not inherit the width of its parent cell (the EXPORT button). The menu and the button it belongs to are visually mismatched in width.

PREVIEW and EXPORT are named as if they are equal peers in the toolbar partition. In practice PREVIEW is a quality toggle and EXPORT is an action trigger with a nested menu — they are functionally different and should not share equivalent visual weight unless the toolbar is divided into equal partitions by intent.

**Code location:** `DistortToolbar.js` `_createCell()` (line 210), `_buildExportCell()` (lines 130–157).

**Guide:**
- `design-law.md §4.1–4.2` — "All compliant dimensions derive from F, F/2, or an integer multiple of F." Percentages are not F-derived.
- `design-law.md §3.1.3` — "A region that cannot be explained as a partition is invalid." The gap at the right edge is not a partition.
- `design-law.md §3.3` — The export dropdown is a floating element positioned above the sheet, not a partition of it.
- `f-system.md` — F compliance test: "if changing F breaks proportion, the component is non-compliant."

**[NO GUIDE]:** No standard defines how toolbar cells should be divided when their content has functionally different types (status display vs quality toggle vs action trigger with submenu). No standard specifies how a cell's dropdown menu should relate in width to its parent cell.

---

## Category 4: EffectStack Add Button

> "in the stack the add effect button is a floating button that does not share borders which is violation."
> "the distance between it and the descriptive text doesnt follow any logic."
> "the descriptive text is redundant and therefore violation."
> "the plus sign is on the left when for other dropdowns and adding things it should be on the right of the object."
> "there is a double border under the button which is a clear violation."

**Description:** Five distinct violations in one component:

**4a. Floating button.** The add button has `border: 1px solid var(--c-border)` on all four sides. It is a full-width element but its border is private — it does not share edges with its neighbouring regions. The border above it and the border-top of the content area below it produce two adjacent 1px lines (double border). A compliant implementation would have the button's bottom edge be the shared boundary with the content area, with no private outline.

**4b. Double border.** The button's CSS sets `border: 1px solid var(--c-border)`. The content area (`distort-stack-content`) sets `border-top: 1px solid var(--c-border)`. These two borders are adjacent, producing a 2px-appearing boundary between them.

**4c. Redundant placeholder text.** When the stack is empty, the content area shows "ADD AN EFFECT TO BUILD THE PIPELINE". The button above already says "+ ADD EFFECT". The placeholder adds no information the button does not already communicate. It occupies space with no informational value.

**4d. Plus glyph placement.** The add button label reads `+ ADD EFFECT` with the glyph on the left. All other expand/add affordances on the site (collapsible headers, dropdown triggers) place the glyph to the right of the label. The placement is locally invented.

**4e. Arbitrary spacing.** The distance between the add button and the placeholder text is not F-derived. The gap reads as arbitrary.

**Code location:** `EffectStack.js` lines 32–119.

**Guide:**
- `design-law.md §10` — "detached bordered buttons in open space" explicitly prohibited.
- `design-law.md §2.3` — "Borders are usually shared boundaries between adjacent partitions, not private outlines around isolated objects."
- `design-law.md §2.8` — The placeholder text "neither exposes content, signals state, nor enables action" beyond what the button already does.
- `design-law.md §3.2` rule 2 — "Prefer adjacency to empty separation." The gap between button and text has no structural anchor.
- `f-system.md` border handling — "Use negative margins: `margin: -1px 0 0 -1px`" to eliminate double borders.
- `design-law.md §3.4` — "Analogous action regions should use the same structural logic." Glyph position is an analogous convention being violated.

**[NO GUIDE]:** No standard defines glyph placement convention (left vs right of label) for add, expand, or trigger actions.

---

## Category 5: CategoryPicker (Add Effect Dropdown)

> "in the add effect dropdown everything is centered which has never been done ber."
> "the close / filter modules divisions dont seem to be proportional."
> "there are 2 close buttons which is idiotic. the smaller one should be removed."
> "filter modules inst a filter it is a search so it is named wrong."
> "the collapsable sections are styled wrong and not in line with out other collapsable elements of the site."
> "on hover there should be popup text that gives a one sentence description of the module."
> "some of the modules have 'module' in their name which is redundant."
> "the dropdown needs its own overflow and should be on a different layer and not alter the size of the sidebar."
> "it is missing its left right and bottom borders but has an unneccesary top border."
> "the collapsable sections in the add module dropdown should be closed by default."

**Description:** Ten distinct issues in the CategoryPicker component:

**5a. Centred text alignment.** Module items use `text-align: left` in code but the overall layout and close button use centred patterns. No other list component on the site centres its items. This is a locally invented visual convention with no precedent and no authority.

**5b. Non-proportional header divisions.** The close cell is `7F` wide and the search input is `flex: 1`. This is a functional division but the `7F` value appears arbitrary relative to the toolbar's cell logic and is not explained by any structural rule.

**5c. Two close buttons.** The EffectStack add button changes label to `× CLOSE` when the picker is open. The CategoryPicker itself also has a `× CLOSE` button in its header. Two elements perform the same action within view of each other.

**5d. Wrong label: FILTER vs SEARCH.** The search input has placeholder `FILTER MODULES`. A filter removes items from a full set by criterion. A search narrows a set by substring match. The picker performs a search. The label is semantically incorrect.

**5e. Collapsible sections open by default.** Category headers in the picker are expanded by default (`this._collapsed = {}`). All other collapsible elements on the site default to closed. This violates systemic inheritance.

**5f. Collapsible section visual style.** The category headers use a colour (`var(--c-border)`) and a `▸`/`▾` glyph but their overall composition (full-width button, padding, border-top) differs from the site's established collapsible pattern in other tools.

**5g. No hover description.** Module items have a label only. There is no mechanism for exposing a one-sentence description of what a module does on hover or focus. This is a missing feature, not a visual violation, but it is a UX gap.

**5h. "Module" in module names.** Some registry entries include "module" in their label (e.g. `MODULE FLOW LINES`). Within a module picker, this qualifier is redundant context. It does not add informational value.

**5i. Layer and border structure.** The CategoryPicker is inserted into the EffectStack content area as a flex child, displacing the NodePanel list. It receives `border-top: 1px solid var(--c-border)` from the content area but has no left, right, or bottom border of its own. Its boundaries are incomplete. It also alters the sidebar layout height rather than floating on its own layer.

**5j. Open-by-default sections.** See 5e above.

**Code location:** `CategoryPicker.js` throughout; `EffectStack.js` lines 86–104.

**Guide:**
- `design-law.md §2.5` — "No element may invent its own local visual logic if an analogous element already exists elsewhere." (text alignment, collapsible style)
- `design-law.md §8.1` — "If an element is created without considering the logic of analogous elements, it is a failure." (default open state)
- `design-law.md §2.8` — Redundant "CLOSE" button and "module" in names.
- `design-law.md §5.3` — "Typography exists to expose structure and state." FILTER vs SEARCH is a labelling failure.
- `design-law.md §3.2` — Incomplete border set; panel lacks left/right/bottom edges.
- `design-law.md §4.2` — `7F` close cell: not anchored to a named structural constant.

**[NO GUIDE]:** No standard exists for on-hover descriptions, tooltips, or contextual information at point of interaction. No standard defines how overlay/picker panels should be layered, bordered, and contained relative to the sidebar partition. No standard addresses the naming convention for items within a contextual picker (whether category context makes type qualifiers redundant).

---

## Category 6: Mobile and Responsive Behaviour

> "in mobile the sidebar has two tabs 'pipeline' and 'canvas' but in landscape they are not visible."
> "in mobile the top buttons are almost impossible to read or use."
> "to save space the fit fill actual should become one button that flicks between the modes."
> "if I shrink the window to move into portrait mode the sidebar shits itself and nothing shows in the sections."

**Description:** Four issues across responsive behaviour:

**6a. Tab visibility inconsistency.** The ToolBase component renders PIPELINE and CANVAS tabs in the sidebar. In portrait mode these tabs are navigable. In landscape mode the tabs are either absent or hidden, with no equivalent navigation mechanism. Portrait mode and landscape mode are not using consistent structural elements — this is a new design language in landscape, not a reordering of the same partitions.

**6b. Toolbar readability on mobile.** The toolbar cells are sized as fixed heights and percentage widths. On small screens the text at `F × 0.75px` becomes unreadable and the tap targets fall below acceptable minimum size. No adaptation occurs.

**6c. No cyclic button for display modes.** FIT, FILL, and ACTUAL occupy three separate cells in the toolbar. In portrait/mobile contexts where toolbar width is severely constrained, these three cells cannot coexist at readable size. A cyclic button (one cell that cycles through modes on click) is a standard space-reduction pattern but is not defined or authorised anywhere in the guides.

**6d. Portrait mode rendering failure.** When the viewport is narrowed to portrait threshold, the sidebar sections render empty. This is an implementation bug, not a guide gap — portrait mode is defined as a reordering of the same partitions at the same F-based sizing. The failure is in the responsive implementation, not in the specification.

**Code location:** `distort-main.js` `_buildToolBase()` sidebar config; `DistortToolbar.js` `render()`.

**Guide:**
- `ui-interface-overview.md §5` — "Portrait mode is a reordering of partitions, not a new design language." Tabs must exist equivalently in both orientations.
- `ui-interface-overview.md §5` — "Same F-based sizing law remains in effect." Toolbar adaptation must not violate F-law.

**[NO GUIDE]:** No standard defines which controls must remain visible across all viewport sizes, which may be simplified, and which may be combined. No standard defines cyclic/grouped button patterns for space-constrained contexts. No breakpoint system is documented. No control priority ordering exists for responsive scenarios.

---

## Category 7: PREVIEW Button Clarity

> "what does 'preview' actually do?"

**Description:** The toolbar contains a quality toggle button labelled `PREVIEW` or `FULL`. The toggle switches `this._state.quality` between `'preview'` and `'final'`. What this means in practice — render resolution, computation depth, approximations made — is not communicated anywhere in the UI. A user encountering this button for the first time cannot determine its effect from the label alone.

The label `PREVIEW` is a mode name, not a description of consequence. A label that "exposes structure and state" (§5.3) would communicate what changes: e.g. `DRAFT` vs `FULL RES`, or a tooltip explaining the difference. Neither exists.

**Code location:** `DistortToolbar.js` lines 81–86, 283–286.

**Guide:**
- `design-law.md §5.3` — "Typography exists to expose structure and state. It must not be used as ornament, atmosphere, or branding excess." A label that names a mode without describing its consequence fails this test.

**[NO GUIDE]:** No standard exists for how quality modes, render tiers, or performance-affecting toggles should be labelled. No standard requires that the consequence of a state change be communicated at point of interaction (via label, annotation, or tooltip).

---

## Category 8: Empty Canvas State

> "if no source is loaded yet there should be text in the canvas area that is the same size as the standard text in a perfectly square box that says 'upload image'. you should be able to drag a file onto this or click to open."

**Description:** When no source image has been loaded, `ViewportCanvas` fills the canvas with `--vga-black` and displays nothing else. There is no affordance indicating that the canvas is inactive, no instruction for how to activate it, and no drag-and-drop target. The tool is in a non-functional state with no visible path to a functional state.

The user specifies the correct behaviour: a centred square box (at standard text size, i.e. F-derived) containing "UPLOAD IMAGE" text, clickable to open a file picker, and accepting drag-and-drop. This is an empty-state affordance — a defined visual treatment for a component that is awaiting its first input.

**Code location:** `ViewportCanvas.js` `_draw()` line 154–155 (black fill, no further content when `!this._result`).

**Guide:**
- `tool-standards.md §1.5` — File input is required. Drag and drop is listed as "optional" (recommended enhancement).
- `tool-standards.md §1.1` — "Canvas or Image Output" requires a clear/reset path and canvas interaction. No equivalent requirement for an empty-state affordance exists.

**[NO GUIDE]:** No standard defines what a canvas or PCS region must display in an uninitiated state (no input loaded). No standard defines inline upload affordances within the PCS. No standard describes the visual treatment of an empty state for any component type. This is a significant gap: the system has no state taxonomy at all for the "empty/uninitiated" state.

---

## Summary of Guide Gaps

The following complaints identify problems for which no existing guide provides coverage. Each gap is a candidate for a new standard or an extension of an existing one:

| Gap | Relevant Assessment File |
|-----|--------------------------|
| Toolbar source cell label format (status + action in one cell) | `03-naming-and-labelling.md` |
| Toolbar cell division logic when cells have heterogeneous function types | `01-partition-and-boundary.md` |
| Dropdown menu width relative to parent cell | `06-overlay-and-dropdown-patterns.md` |
| Glyph placement convention (left vs right of label) | `07-signifier-placement.md` |
| On-hover module descriptions / contextual tooltips | `04-state-representation.md` |
| Picker/overlay layer structure, border completeness, scroll containment | `06-overlay-and-dropdown-patterns.md` |
| Naming convention for items within a contextual picker | `03-naming-and-labelling.md` |
| Breakpoints, control priority tiers, responsive simplification patterns | `05-responsive-and-adaptive.md` |
| Cyclic/grouped button patterns for space-constrained contexts | `05-responsive-and-adaptive.md` |
| Quality mode labelling (consequence vs mode name) | `03-naming-and-labelling.md` |
| Empty/uninitiated state visual treatment for canvas and components | `04-state-representation.md` |
| Inline upload affordance within PCS | `04-state-representation.md` |
