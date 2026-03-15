# 07 — Signifier Placement and Glyph Conventions

Source: [complaint-distort_build-120326.md](../complaint-distort_build-120326.md)
Part of: [assessment 2026-03-12/](.)

---

## Complaint Passages

> "the plus sign is on the left when for other dropdowns and adding things it should be on the right of the object"
> "it has an arrow on the right which makes no sense considering its not a drop down"
> "in the add effect dropdown everything is centered which has never been done ber"

---

## 1. What a Signifier Is

A signifier is a visual element whose primary purpose is to indicate an interaction type or affordance. In this system, signifiers are text glyphs (Unicode characters) rather than icons: `▾`, `▸`, `+`, `×`, `▶`, `■`. They carry meaning not through their visual form alone but through the conventions by which they are used.

Signifiers are distinct from labels: a label names what something is or does; a signifier communicates how something works. `+ ADD EFFECT` — here `ADD EFFECT` is the label and `+` is the signifier. The label tells the user what will happen; the signifier tells the user what type of interaction they are initiating (an addition, in this case).

Signifiers work through convention. Their meaning is not inherent — `+` does not contain the meaning "add" in any absolute sense. Its meaning is established by consistent use: in this system and in every other interface the user has encountered, `+` precedes or follows an action that adds something. When `+` appears on the LEFT of a label, the convention established in most interfaces is:

- Left glyph = glyph precedes the label = the glyph is announcing what type of action follows
- Right glyph = glyph follows the label = the glyph is indicating what type of control this is (direction, expansion state, etc.)

In the SiteBoy system, collapsible sections use `▸` on the LEFT and `▾` on the LEFT — both indicating the collapsed/expanded state of the section. The glyph position (left) means the glyph precedes the label and announces the control's state.

For expand/collapse, left-positioned glyphs are consistent with the system's precedent. For add actions, the complaint identifies a different precedent: adding things should have the glyph on the RIGHT. This implies a distinction between:

- State glyphs (left): show what state the control is in — collapsed `▸ SECTION`, expanded `▾ SECTION`
- Action glyphs (right): show what type of addition or trigger action is available — `ADD EFFECT +`

---

## 2. Signifier Failures in the Distort Build

### 2.1 `+` on the Left of `ADD EFFECT`

The EffectStack add button reads `+ ADD EFFECT`. The `+` glyph is on the left.

The complaint states: "for other dropdowns and adding things it should be on the right of the object." This identifies a de facto convention: in this system, action-indicating glyphs for add/trigger actions belong on the right.

Looking at the collapsible patterns in the existing codebase: `▾` and `▸` appear on the LEFT for expand/collapse — these are STATE glyphs. The distinction the complaint draws is: state glyphs go left (they precede the label to describe the current state), action glyphs go right (they follow the label to indicate the affordance available after the label).

Under this convention, `ADD EFFECT +` is correct. `+ ADD EFFECT` is a violation of the site-level convention. The violation exists because the convention was never documented — the builder had no reference to check.

**Guide:** `design-law.md §3.4` — "analogous action regions should use the same structural logic." Glyph placement is part of structural logic.

**[NO GUIDE]:** No standard defines glyph placement convention. The distinction between state glyphs (left) and action glyphs (right) is inferred from existing usage but never stated.

### 2.2 `▾` on a File Picker Trigger

The SOURCE cell in `DistortToolbar` displays `▾` after the source name. `▾` means "this control opens a dropdown list of options below it." Clicking the SOURCE cell opens a native file picker — a dialog, not a dropdown list.

This is a signifier-type mismatch: the glyph implies dropdown; the interaction is file dialog. The user who understands the convention will expect a list of options and will be confused by a file picker appearing instead.

The root cause: the builder used `▾` as a generic "this opens something" signifier, detaching it from its specific meaning. The glyph's convention is more specific than "opens something" — it specifically means "opens a list of selectable options below this element." File pickers are not lists of selectable options below the element.

**Guide:** `design-law.md §6.3` — state is shown by structural mechanisms, not decorative conventions. The `▾` implies a structural state (closed dropdown → open list) that this element never enters.

**[NO GUIDE]:** No standard defines the specific interaction type implied by `▾`. No rule prohibits using `▾` on a non-dropdown element.

### 2.3 Text Alignment in CategoryPicker

> "in the add effect dropdown everything is centered which has never been done ber"

The CategoryPicker items are `text-align: left` in code (verified in the source), but the empty-state message ("NO MATCH") uses `text-align: center`. The complaint may also be responding to the visual perception of centred content caused by the close button's horizontal positioning.

Regardless of the specific element, the complaint identifies a centring convention that has no precedent in the system. All other list-type elements in the site (NodePanel params, EffectStack items, sidebar controls) are left-aligned. Centring text in a list is a different alignment convention — it communicates something different (usually a decorative or promotional treatment, or a distinct status message).

The use of centring for the "NO MATCH" placeholder is defensible as a status message in the empty-state style, where centring is common. But if the system has never used centring for this purpose, it is an undocumented convention — a locally invented visual logic.

**Guide:** `design-law.md §2.5` — "No element may invent its own local visual logic if an analogous element already exists elsewhere."

**[NO GUIDE]:** No standard defines text alignment conventions for different content types. No distinction between alignment in populated lists vs empty states is documented.

---

## 3. Analysis: The Absent Signifier Catalogue

The design-law's typography section covers font, case, and function. It does not cover signifiers — glyphs that operate in a separate semiotic register from text (they are not labels; they are icons rendered in character form).

The system has de facto signifier conventions established through accumulated usage:
- `▾` — dropdown open/expanded or closed dropdown
- `▸` — collapsed state (rightward pointing = expand to the right or below)
- `+` — add action
- `×` — close or remove
- `▶` / `■` — play / stop (transport)
- `◀` — previous / back

None of these conventions is documented. They are inferred by reviewing existing components. This means:
- A builder cannot verify their signifier choice against a standard
- Inconsistencies can accumulate across components without detection
- The meaning of any glyph is only as consistent as the reviewing process allows

The cost of undocumented signifiers is subtle: each inconsistency does not cause an obvious functional failure. The interface still works. But each inconsistency degrades the user's ability to build accurate mental models — and degraded mental models produce users who cannot predict what will happen when they interact with new parts of the interface. Over time, an interface with inconsistent signifiers requires active interpretation at every interaction, instead of allowing learned conventions to reduce cognitive load.

---

## 4. What Needs to Exist: A Signifier Catalogue

A signifier catalogue is needed that defines, for each glyph in use:

| Glyph | Name | Meaning in this system | Interaction type | Permitted position |
|-------|------|----------------------|------------------|-------------------|
| `▾` | Dropdown arrow | This control opens a list of options below it | Dropdown only | Right of label |
| `▸` | Expand arrow | This control is collapsed; clicking expands it | Toggle (expand/collapse) | Left of label (state glyph) |
| `▾` | Collapse arrow | This control is expanded; clicking collapses it | Toggle (expand/collapse) | Left of label (state glyph) |
| `+` | Add | This control adds a new item or opens an add flow | Add action | Right of label |
| `×` | Close/Remove | This control closes a panel or removes an item | Destructive or dismissive action | Left of label OR standalone |
| `▶` | Play | Initiates playback | Transport control | Left of label or standalone |
| `■` | Stop | Stops playback | Transport control | Left of label or standalone |
| `◀` | Previous | Goes to previous item | Transport control | Standalone |
| `▶▶` | Next | Goes to next item | Transport control | Standalone |

**Position rule:**
- State glyphs (describe current state of the element): LEFT of label
- Action glyphs (describe what happens on activation): RIGHT of label
- Standalone glyphs (element is glyph only, no text label): centred within cell

**Alignment rule:**
- All label text: left-aligned within the cell, with `padding-left: F`
- Empty state messages (when no content is available): centred within the region, but only when the region is clearly a placeholder context (not a list item)

**Glyph-type matching rule:**
- A glyph may only appear on an element if the element performs the interaction type that glyph implies
- `▾` may not appear on a file picker trigger, a toggle button, or any element that does not open a positioned list
- `▸`/`▾` may not appear on a trigger button that opens a modal, dialog, or overlay panel (those are not expand/collapse)
