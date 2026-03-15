# 05 — Responsive and Adaptive Layout

Source: [complaint-distort_build-120326.md](../complaint-distort_build-120326.md)
Part of: [assessment 2026-03-12/](.)

---

## Complaint Passages

> "in mobile the sidebar has two tabs 'pipeline' and 'canvas' but in landscape they are not visible"
> "in mobile the top buttons are almost impossible to read or use"
> "to save space the fit fill actual should become one button that flicks between the modes"
> "if I shrink the window to move into portrait mode the sidebar shits itself and nothing shows in the sections"
> "the one in the top bar should be the width of the side bar when in landscape and 1/4 width of body when in portrait"

---

## 1. What the Current Guides Say About Responsive Layout

`ui-interface-overview.md §5` defines portrait mode in its entirety as:

> "Portrait rule: PCS -> secondary controls. Default threshold: viewport width < 800px. Operational behaviour: PCS moves above the sidebar; sidebar remains scrollable; same F-based sizing law remains in effect. Portrait mode is a reordering of partitions, not a new design language."

This is the complete specification. It is four sentences. It establishes:
- The threshold (800px)
- The reordering rule (PCS first, controls second)
- The constraint that F-law remains in effect
- The principle that no new design conventions are introduced in portrait mode

What it does not establish:
- Which elements must remain present in portrait mode
- Which elements may be simplified, combined, or hidden
- What "simplified" means structurally under F-law
- How the toolbar behaves at narrow widths
- Whether tab navigation must exist in both orientations
- What constitutes an adequate tap target on touch devices
- How the sidebar's scrolling behaviour interacts with nested overflow contexts

This is not an adequate specification to build a responsive tool page from. A builder following this spec will produce a reordering of partitions that is technically compliant but may be unusable at small sizes, structurally broken when nested overflow contexts conflict, and missing navigation elements that were assumed to exist in both orientations.

---

## 2. Responsive Failures in the Distort Build

### 2.1 Tab Visibility Inconsistency

The `ToolBase` component renders PIPELINE and CANVAS tabs in the sidebar. In portrait mode (narrow viewport), these tabs are navigable: the user can switch between PIPELINE (effect stack) and CANVAS (output settings). In landscape mode (wide viewport), the tab rail is either absent from the sidebar or the tabs are present but the sidebar displays both tab contents simultaneously.

The result is a structural inconsistency between orientations. In portrait, the tool has explicit tab navigation. In landscape, it does not. These are not equivalent structures reordered — they are different structures. Portrait mode has introduced a design element (the tab as navigation unit) that landscape does not have.

The guide states portrait mode is "a reordering of partitions, not a new design language." The current implementation produces two different design languages: one with tabs and one without. This violates the principle — but the principle does not provide enough specificity to prevent the violation during build.

The correct interpretation of the guide: if the sidebar uses tabs in landscape, it uses tabs in portrait. If it does not use tabs in landscape, it does not use tabs in portrait. The structural elements must be equivalent; only their order may change. A tab that exists in portrait but not landscape is not a reordering — it is a new element introduced only for portrait.

**Guide:** `ui-interface-overview.md §5` — "portrait mode is a reordering of partitions, not a new design language."

**[NO GUIDE]:** No standard specifies that structural navigation elements (tabs, rails, panels) must be present in equivalent form across both orientations. The principle implies it; the specification does not state it explicitly.

### 2.2 Toolbar Readability on Mobile

The toolbar cells at `F × 0.75px` font size produce text of approximately 10.5px. At a typical mobile DPR of 2–3, this renders at effective display sizes of 21–31 CSS pixels — technically readable but approaching the threshold of comfortable readability for monospaced text. More critically, the tap target height of `2F = 28px` is below the minimum recommended touch target of 44px (Apple HIG) and 48dp (Google Material).

The toolbar was designed for a desktop context where precise pointer interaction is available. On touch devices, the targets are too small and the text too fine for reliable interaction. The guide specifies `2F` as control height universally — there is no provision for touch-specific sizing.

This is a genuine gap in the F-system: the F-system is optimised for pointer devices and produces control sizes that are inadequate for touch interaction. Changing `F` to address touch sizing would break the desktop layout.

**Guide:** `design-law.md §4.2` — control height defaults to `2F`. No exception for touch contexts.

**[NO GUIDE]:** No standard defines minimum touch target sizes. No provision exists in the F-system for touch-context adjustments. No breakpoint or context flag separates pointer from touch interaction.

### 2.3 FIT / FILL / ACTUAL — Three Cells at Narrow Width

The toolbar partitions FIT, FILL, and ACTUAL into three equal cells. At portrait width, three cells alongside the SOURCE cell, UNDO, REDO, PREVIEW, and EXPORT leave each cell approximately 6–8% of a narrow viewport — perhaps 18–24px at 320px viewport width. These cells are too small to tap reliably and their labels become unreadable.

The user's proposed solution is a cyclic button: one cell that cycles through FIT → FILL → ACTUAL → FIT on each tap, displaying the current mode as the label. This is a well-established pattern for mutually exclusive single-selection controls in constrained contexts.

A cyclic button is not currently defined, named, or authorised anywhere in the SiteBoy guides. It is neither prohibited nor permitted — it simply does not exist in the system's vocabulary. A builder who thought of it would have no authority to use it. A builder who did not think of it would produce three cells.

**Guide:** None directly applicable.

**[NO GUIDE]:** No standard defines cyclic or grouped buttons as a permitted pattern. No standard defines which controls may be combined in space-constrained contexts. No priority ordering of controls exists to guide which elements may be collapsed and which must remain individually accessible.

### 2.4 Portrait Mode Rendering Failure

When the viewport narrows to portrait threshold, sidebar sections render empty. This is described in the complaint as: "the sidebar shits itself and nothing shows in the sections."

This is an implementation bug — the guide's portrait mode specification is technically adequate to prevent this if followed: same F-law, same partitions, reordered. The rendering failure is caused by an implementation issue (likely conflicting flex/overflow contexts in the nested sidebar structure) that is not caused by a documentation gap.

However, the documentation gap that exists here is adjacent: the guide does not require any testing of portrait mode before the tool is considered complete. If there were a mandatory responsive verification step (screenshot at 375px, confirm all sections render), this bug would have been caught during build rather than in post-build review.

**Guide:** `ui-interface-overview.md §5` — same F-law in portrait. The guide is sufficient; the verification requirement is absent.

**[NO GUIDE]:** No standard requires responsive verification before a tool is considered ready. No test protocol for portrait mode rendering exists.

### 2.5 Source Cell Width Across Orientations

> "the one in the top bar should be the width of the side bar when in landscape and 1/4 width of body when in portrait"

The source cell in the toolbar should be aligned to a structural constant:
- Landscape: `30F` (the sidebar width) — the source cell in the toolbar aligns vertically with the sidebar, creating a visual registration between the two
- Portrait: `25%` of the body width — a proportional fraction appropriate to the narrower toolbar

The current implementation uses `37.5%` in all orientations — not `30F` in landscape (which at 420px would be a smaller fraction of a typical desktop viewport) and not 25% in portrait.

The core principle here is that the toolbar source cell should visually correspond to the sidebar column beneath it: in landscape, the source cell sits directly above the sidebar, so its width should match the sidebar width. This creates a coherent vertical alignment across the toolbar/sidebar boundary. The current `37.5%` has no such justification.

**Guide:** `design-law.md §4.2` — sidebar width is `30F`. `ui-interface-overview.md §2` — sidebar `30F fixed`. No guidance on how toolbar cells should relate to sidebar dimensions.

**[NO GUIDE]:** No standard defines vertical alignment relationships between the toolbar and sidebar. No standard specifies responsive width changes for toolbar cells.

---

## 3. Analysis: The Responsive Documentation Gap

The responsive documentation is a single paragraph. It establishes a correct principle (reorder, don't redesign) but provides none of the operational detail needed to build a usable responsive implementation. The gap has the following components:

**3.1 No breakpoint system.** The 800px threshold is defined, but only one threshold exists. No sub-thresholds are defined for intermediate sizes (e.g. tablets at 768px, small phones at 375px). No system of breakpoints exists.

**3.2 No control priority ordering.** When space is insufficient for all controls at their normal size, no guidance exists for which controls to preserve and which to simplify. The distort toolbar has eight or more cells; at narrow widths, some must be reduced. Without priority ordering, the builder makes arbitrary decisions.

**3.3 No permitted simplification patterns.** The guide says controls must follow F-law and be reordered, not redesigned. But it does not say what "reordering" includes. Does it include combining three cells into one? Hiding labels? Replacing text with glyphs? These are all reasonable simplification patterns — but none are defined or authorised.

**3.4 No touch context.** The system makes no distinction between pointer and touch interaction contexts. F-system sizing is calibrated for pointer (desktop). Touch requires different minimum target sizes. No provision for this distinction exists.

**3.5 No verification requirement.** Portrait mode compliance is not verified as part of the build process. A tool can be shipped with a broken portrait mode because no test step requires the builder to verify it.

---

## 4. What Needs to Exist

A responsive and adaptive layout standard is needed that covers:

**4.1 Breakpoint system.** Define named breakpoints and their thresholds:
- `landscape`: > 800px (current default)
- `portrait`: 480–800px (current, but underdefined)
- `compact`: < 480px (not currently defined)

**4.2 Control priority tiers.** For each tool, controls must be classified by priority:
- Tier 1: always visible in all orientations (primary action, primary state, primary output)
- Tier 2: visible in landscape; may be simplified in portrait
- Tier 3: visible in landscape; may be combined or hidden in portrait

**4.3 Permitted simplification patterns.**
- Cyclic button: three or more mutually exclusive modes → one cell cycling through them
- Label truncation: full text label → glyph-only in compact mode (only for glyphs with established meaning)
- Group collapse: multiple control cells → one expandable group cell

**4.4 Touch context provision.** Define a minimum touch target size (recommended: 44×44px, equivalent to `3F + 2px`). Where `2F` is insufficient, the touch target must be padded to minimum size without changing the visual cell size.

**4.5 Vertical registration.** In landscape mode, the toolbar source cell must align to the sidebar width. The toolbar and sidebar share a visual column; their widths must be governed by the same constant (`30F`).

**4.6 Responsive verification requirement.** Before any tool is considered complete, it must be verified at:
- Desktop landscape (>= 1280px)
- Tablet portrait (~768px)
- Mobile portrait (~375px)

At each size, all Tier 1 controls must be accessible, all sections must render, and all text must be legible.
