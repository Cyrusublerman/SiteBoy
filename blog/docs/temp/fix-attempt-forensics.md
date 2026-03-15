# Fix Attempt Forensics — Distort Tool Remediation

Source complaint: [complaint-distort_build-120326.md](../build%20issues/complaint-distort_build-120326.md)
Issue log: [distort-tool-build-issues.md](../build%20issues/distort-tool-build-issues.md)
Assessment: [assessment 2026-03-12/summary.md](../build%20issues/assessment%202026-03-12/summary.md)

---

## Part 1: What Was Fixed vs Missed

### 1A. Confirmed Fixed

| Complaint | Code location | Change made |
|-----------|--------------|-------------|
| Sidebar source readout duplicate | `distort-main.js` | `_sourceReadout` deleted; `['SOURCE', []]` removed from sidebar config |
| Add button floating (private border) | `EffectStack.js` line 34 | `border: 1px solid` changed to `border: none; border-bottom: 1px solid` |
| Double border under add button | `EffectStack.js` | `border-top` removed from `_contentEl` |
| Redundant placeholder text | `EffectStack.js` | Placeholder "ADD AN EFFECT..." removed |
| Plus glyph on left | `EffectStack.js` line 32 | `'+ ADD EFFECT'` changed to `'ADD EFFECT +'` |
| FILTER MODULES wrong name | `CategoryPicker.js` line 45 | Placeholder changed to `'SEARCH'` |
| Categories default open | `CategoryPicker.js` line 122 | `_collapsed[category] = true` on first encounter |
| "Module" in module names | `CategoryPicker.js` line 102 | `_stripModuleSuffix()` strips trailing "module" |
| FIT/FILL/ACTUAL on mobile | `DistortToolbar.js` | `_applyCompactMode()` creates cyclic zoom button |
| PREVIEW opaque label | `DistortToolbar.js` line 84 | Changed to `DRAFT`/`FULL` |

### 1B. Missed or Wrongly Fixed

**1. Source cell width**
- Complaint: "the one in the top bar should be the width of the side bar when in landscape and 1/4 width of body when in portrait."
- Current code: `_buildSourceCell()` calls `_createFlexCell()` → `flex: 1; min-width: 0`. No constraint on minimum width.
- Why missed: No guide rule tied toolbar source cell width to sidebar width constant. Agent did not interpret the complaint as a concrete pixel constraint.

**2. Source cell glyph**
- Complaint: `"Add Source +"`.
- Current code: Line 29 `_sourceName = 'ADD SOURCE …'`. Line 166 glyph span set to `'…'`. Line 426 fallback `'ADD SOURCE …'`.
- Why missed: Agent followed design-law.md §13.4 which classifies `…` as the correct glyph for file dialog triggers. Guide conflicted with user's explicit instruction. **User intent must override guide categorical default.** This is a guide deficiency, not a builder deficiency.

**3. Export dropdown width**
- Complaint: "the drop down for the export options is not the same width as the export button."
- Current code: `_buildExportCell()` line 223 sets `min-width: ${F * 15}px` while the cell at line 206 is `${F * 10}px`. Dropdown is forced wider than its button.
- Why missed: Agent left `min-width: ${F * 15}px` unchanged. The fix is a single line deletion. No guide stated dropdown min-width must not exceed parent cell width.

**4. Toolbar proportions**
- Complaint: "the buttons at top are not proportional. the preview and export are not divisions of the space."
- Current code: UNDO=`6F`, REDO=`6F`, FIT=`6F`, FILL=`6F`, ACTUAL=`6F`, DRAFT=`8F`, EXPORT=`10F`. Three different widths for functionally equivalent action cells.
- Why missed: No guide rule requires same-type toolbar action cells to share equal width. Agent sized each cell independently.

**5. Gap at right edge**
- Complaint: "there is an awkward empty gap between the export button and the right border."
- Current code: Export cell passes `isLast = true` removing its right border, but the unequal cell widths and flex calculation leave visual dead space.
- Why missed: Follows directly from the proportions problem (item 4). Not independently investigated.

**6. Picker text centred**
- Complaint: "in the add effect dropdown everything is centered which has never been done before."
- Current code: Category headers and items correctly have `text-align: left`. BUT the `CLOSE x` button in the header (line 63) has no explicit `text-align`, defaulting to browser-centred within its fixed `7F` width. This creates a visually centred header row.
- Why missed: Agent added `text-align: left` to list items but did not remove the close button that creates the centred appearance. Cosmetic fix applied without addressing structural cause.

**7. Header proportions**
- Complaint: "the close / filter modules divisions dont seem to be proportional."
- Current code: Close button is `width: ${F * 7}px` (arbitrary), search is `flex: 1`.
- Why missed: Agent did not touch the header structure. `7F` has no structural justification.

**8. Two close buttons**
- Complaint: "there are 2 close buttons which is idiotic. the smaller one should be removed."
- Current code: `EffectStack._renderContent()` line 80 toggles the add button to `'CLOSE ×'`. `CategoryPicker._buildHeader()` line 63 creates a separate `'CLOSE ×'` button. Both remain.
- Why missed: Agent did not remove either. The CategoryPicker close button requires structural deletion, not a label change.

**9. Collapsible section colour**
- Complaint: "the collapsable sections are styled wrong and not in line with our other collapsable elements of the site."
- Current code: `CategoryPicker._renderList()` line 136 sets category header `color: var(--c-border)` — a muted colour. All other collapsible headers on the site use `var(--c-text)`.
- Why missed: Agent did not audit existing collapsible components for colour comparison. No guide specified header text colour.

**10. No hover descriptions**
- Complaint: "on hover there should be popup text that gives a one sentence description of the module."
- Current code: `CategoryPicker._renderList()` line 156 sets `item.title = entry.description ?? entry.label`. The fallback `entry.label` means the `title` shows the same text as the button — zero informational value. No `description` field exists on ANY of the 69 registry entries.
- Why missed: Agent added the `title` attribute code (structural fix) but never populated the data source. The fix is functionally inert. This is a hollow implementation: code reads a field that does not exist.

**11. Picker layer and borders**
- Complaint: "the dropdown needs its own overflow and should be on a different layer and not alter the size of the sidebar. it is missing its left right and bottom borders but has an unnecessary top border."
- Current code: `CategoryPicker.render()` sets `height: 100%; min-height: 0` with no `position`, no z-index, no left/right/bottom borders. Appended at `EffectStack._renderContent()` line 104 as a normal flex child, displacing node panels and expanding the sidebar.
- Why missed: Structural architectural change. Agent made zero changes. The fix requires converting the picker from an inline flex child to a `position: absolute` overlay — a non-trivial structural change the agent deferred.

**12. Tab visibility in landscape**
- Complaint: "in mobile the sidebar has two tabs 'pipeline' and 'canvas' but in landscape they are not visible."
- Current code: `tool-base.js` `_buildSidebar()` checks `hasTabs` at line 468 based on `sidebarConfig.length > 1`. Distort has 2 tabs so `hasTabs = true`. Tabs should render in both orientations. However, initial portrait threshold is `< 600` (line 246) but resize handler uses `< 800` (line 359). This mismatch can cause the wrong layout to render after a resize event, hiding the tab bar.
- Why missed: Agent did not investigate `tool-base.js` at all.

**13. Portrait mode sidebar empty**
- Complaint: "if I shrink the window to move into portrait mode the sidebar shits itself and nothing shows in the sections."
- Current code: `tool-base.js` `_handleResize()` lines 362-369 calls `this.destroy(); parent.appendChild(this.render())` — a full DOM rebuild. `distort-main.js` `_onToolBaseInit()` runs only once during initial `_buildToolBase()` (line 132). After rebuild, `_onToolBaseInit` never re-runs, so EffectStack, ViewportCanvas, and TransportStrip are never re-injected into the new empty blocks.
- Why missed: Agent identified the root cause correctly but made zero code changes. The fix requires wrapping `_handleResize` in `distort-main.js` to trigger re-injection.

**14. Empty canvas box shape**
- Complaint: "text in the canvas area that is the same size as the standard text in a perfectly square box."
- Current code: `ViewportCanvas.js` line 109 sets `padding:${F}px ${F * 2}px` — horizontal padding is double vertical, producing a rectangle, not a square.
- Why missed: Agent implemented padding-based sizing without verifying that equal padding on all sides produces a square. It does not — the box width depends on text length, not on F.

**15. Empty canvas box text**
- Complaint: `"upload image"` (no glyph specified).
- Current code: Line 102 sets `uploadLabel.textContent = 'UPLOAD IMAGE …'` — trailing `…` added by agent.
- Why missed: Agent applied the `…` glyph from design-law §13.4 (file dialog signifier) when the user specified no glyph. Same guide-over-user failure as item 2.

---

## Part 2: Root Causes of Agent Failure

**1. Selective difficulty avoidance.** Easy cosmetic changes (label text, font sizes) were completed. Structural changes (picker overlay architecture, portrait lifecycle re-injection, ToolBase threshold fix) were skipped entirely with no acknowledgement.

**2. Guide-over-user.** When design-law.md §13.4 classified `…` as the correct glyph for file dialog triggers, the agent applied the rule even though the user explicitly wrote `"Add Source +"`. Categorical guide rules must yield to explicit user instruction on the specific element being built.

**3. No per-item tracking.** The to-do list grouped issues into broad tasks (e.g. "fix CategoryPicker borders") rather than tracking each discrete complaint sentence. This allowed sub-items to be skipped without detection.

**4. Hollow implementation.** The `item.title` attribute was set in `CategoryPicker` code but the `description` field it reads was never added to any registry entry. The structure was present; the data was absent.

**5. No verification pass.** The agent never re-read the original complaint after finishing. A sentence-by-sentence re-read would have detected that 15 of ~19 complaint clauses had no corresponding code change.

---

## Part 3: Guide Conflicts

### 3A. Direct conflicts between guide rules and user instructions

**Conflict 1: Glyph classification (§13.4 vs user intent)**

| Guide | User instruction | Verdict |
|-------|-----------------|---------|
| §13.4: `…` = file dialog trigger | "Add Source +" / "upload image" (no glyph) | User classifies by semantic intent (adding), guide classifies by mechanism (file dialog). **User intent wins.** |

Resolution: §13.4 must be amended to add an intent-vs-mechanism disambiguation rule. When the action's semantic intent is "add" or "create", the glyph is `+` even if the mechanism is a file dialog.

**Conflict 2: Picker surface type (§16.1 vs user requirement)**

| Guide | User instruction | Verdict |
|-------|-----------------|---------|
| §16.1: Inline substitution is a valid pattern | "on a different layer and not alter the size of the sidebar" | Inline substitution by definition alters the content area. User explicitly prohibits this. **User requirement wins.** |

Resolution: §16.1 must be amended to add CSS implementation requirements for bounded overlays, making it clear when each pattern is appropriate and how to implement it.

### 3B. Blindspots — guide coverage gaps

1. **Toolbar cell division.** No rule states that same-type action cells must share equal width. No formula for toolbar partitioning exists. Agent sized cells arbitrarily.

2. **Status cell width constraint.** No rule ties the toolbar source/status cell's minimum width to the sidebar width constant (`30F`). The relationship is logical (they share the same left boundary) but undocumented.

3. **Source/status cell label format.** The `[LABEL: | DYNAMIC_VALUE]` pattern for a cell that shows both a static identifier and dynamic content is not defined anywhere.

4. **Registry data completeness.** No requirement exists that `registry.js` entries must include a `description` field. The hover description feature depends on data that was never required to exist.

5. **Bounded overlay implementation.** §16.1 names the overlay types but provides zero CSS implementation guidance: no position, z-index, max-height, overflow, or border rules for bounded overlays.

6. **Responsive lifecycle.** No guide addresses what happens when ToolBase performs a full destroy/rebuild on orientation change. Tools that inject custom components have no documented re-injection mechanism.

7. **Post-fix verification protocol.** No process requires confirming that every complaint item maps to a code change. The process gate (§12) is pre-build only; no post-fix audit exists.

8. **User intent primacy.** No guide states that explicit user instructions override guide categorical defaults on the specific element being built.

9. **Authorised font sizes.** `F * 0.85` is used in three places (`CategoryPicker` items, `EffectStack` add button) but is not an authorised F-system token. Only `F * 0.75` and `F` are documented as permitted sizes.

### 3C. Omissions in previous guide updates

The previous fix attempt added §§13-16 to design-law.md and §5 to ui-interface-overview.md. These have:

- **§13.4**: Glyph table present. Intent-vs-mechanism disambiguation absent.
- **§16.1**: Overlay type taxonomy present. CSS implementation rules absent.
- **§16.3**: Border rule present. Text colour rule absent.
- **§5 (ui-interface-overview)**: Responsive breakpoints and simplification patterns present. Lifecycle/rebuild hook absent. Threshold consistency rule absent.
- **No post-fix verification** added to any process document.
- **No toolbar partition rule** added anywhere.
- **No registry data requirement** added.
- **No user intent primacy rule** added.
