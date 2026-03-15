# 03 — Naming and Labelling

Source: [complaint-distort_build-120326.md](../complaint-distort_build-120326.md)
Part of: [assessment 2026-03-12/](.)

---

## Complaint Passages

> "filter modules inst a filter it is a search so it is named wrong"
> "what does 'preview' actually do?"
> "it has an arrow on the right which makes no sense considering its not a drop down"
> "the source topbar element should say ['Source:' | either '{Source Name}' or 'Add Source +']"
> "the plus sign is on the left when for other dropdowns and adding things it should be on the right of the object"

---

## 1. The Role of Labels in This System

`design-law.md §5.3` states:

> "Typography exists to expose structure and state. It must not be used as ornament, atmosphere, or branding excess."

This is a precise claim: labels are not decorative identifiers. They are functional disclosures. A label's purpose is to tell the user one of three things:
- What this element is (structural disclosure)
- What state this element is currently in (state disclosure)
- What will happen if this element is activated (action consequence disclosure)

A label that fails to disclose any of these things accurately is not a label — it is noise in the typographic field. And unlike visual noise, which the user learns to ignore, typographic noise is harder to filter: text demands processing in a way that empty space does not.

The system's typography law covers the *form* of labels (case, family, sizing) but not their *semantic content*. This is the gap: the law tells builders what labels should look like but not what they should say.

---

## 2. Labelling Failures in the Distort Build

### 2.1 FILTER vs SEARCH

The `CategoryPicker` search input has placeholder text: `FILTER MODULES`.

The distinction between filtering and searching is precise:
- **Filter**: given a full set, remove items that do not match a criterion. The set is always visible; items are hidden or greyed out.
- **Search**: given a query, return items that match. Items not matching are not shown — they are absent from view, not present-but-hidden.

The `CategoryPicker` performs a search: items not matching the query string are not rendered at all. The full set is not visible. The operation is not filtering. The label `FILTER MODULES` is semantically incorrect.

Why does this matter? Labelling an operation incorrectly trains the user to misunderstand the interface. A user who has learned "filter" for this operation will bring that mental model to other contexts and be confused when filter behaves differently elsewhere (e.g. a true filter that preserves all items). The label creates a false taxonomy in the user's mind.

**What it should say:** `SEARCH MODULES` or simply the placeholder `SEARCH...` (lowercase per §5.2's "status microcopy" role, since the placeholder is instructional and quiet).

**Guide:** `design-law.md §5.3` — labels must expose structure and state, not obscure it.

**[NO GUIDE]:** No standard defines the semantic distinction between "search" and "filter" as applied to interactive components. No labelling vocabulary is defined for any interaction type.

### 2.2 PREVIEW — Mode Name Without Consequence

The toolbar contains a quality toggle. When quality is low/fast, the button reads `PREVIEW`. When quality is high/final, it reads `FULL`. The button toggles between these states.

The labels name the modes but do not describe their consequences. A user encountering this button for the first time cannot determine:
- What "preview" means in this context (lower resolution? fewer passes? approximated algorithms?)
- What they lose by staying in PREVIEW mode
- Whether FULL mode is computationally expensive
- Whether the toggle affects the current render or only future renders

"PREVIEW" is a mode name — the internal name the system uses to identify the state. It is not a user-facing disclosure of what the state means. The button signals "I am currently in a particular mode" without telling the user what that mode implies for their work.

This is the fundamental labelling failure: substituting an internal technical identifier for a user-facing description of consequence.

**What it should say:** A pair of labels that communicate render fidelity. Examples: `DRAFT` / `FINAL`, `FAST` / `FULL RES`, or a fixed label with a value indicator. The exact form depends on what the quality modes actually change — which itself is undocumented.

**Guide:** `design-law.md §5.3` — typography to expose state, not to use internal identifiers as if they were disclosures.

**[NO GUIDE]:** No standard exists for labelling quality or performance modes. No requirement exists that the consequence of a mode toggle be communicated to the user at the point of interaction.

### 2.3 The `▾` Glyph on a File Picker

The SOURCE cell in `DistortToolbar` displays a `▾` (downward-pointing triangle) glyph after the source name. `▾` is a universally understood signifier for a dropdown menu — a list of options that opens below the triggering element.

Clicking the SOURCE cell opens a native file picker dialog, not a dropdown menu. There is no dropdown. There are no options to select from a list. The `▾` is a false signifier: it promises an interaction type that does not exist.

This is distinct from a naming problem — it is a signifier-type mismatch. The glyph belongs to the domain of signifiers (covered more fully in `07-signifier-placement.md`) but the root cause here is a labelling logic failure: the builder applied a signifier convention without verifying that the signifier's implied interaction type matched the element's actual interaction type.

**Guide:** `design-law.md §6.3` — state is shown by explicit value change, positional change, inversion. The `▾` implies a state (closed dropdown → open dropdown) that the element never enters.

**[NO GUIDE]:** No standard defines which glyphs imply which interaction types, preventing a builder from knowing that `▾` implies "dropdown" and not "file picker".

### 2.4 Source Cell Format: Status and Action Combined

The complaint specifies:

> "the source topbar element should say ['Source:' | either '{Source Name}' or 'Add Source +']"

This is a precise labelling schema: the cell is divided into two semantic regions:
- A static label (`SOURCE:`) that names the datum
- A dynamic region that shows either the current value (`{Source Name}`) or an action trigger (`ADD SOURCE +`) when no value exists

This schema is structurally richer than the current implementation (`NO SOURCE` + `▾`). It correctly separates:
- The structural identifier (what kind of information this is)
- The content or action (the actual value or the path to setting it)

This pattern — `[LABEL: | VALUE or ACTION]` — is a standard UI convention for status cells with inline affordances. It is not currently defined in the SiteBoy guides as a named pattern, but it should be.

The `NO SOURCE` label currently used is a single-field approach: it names the absence of a value rather than naming the datum type separately from its value. This means the label changes meaning depending on state: `NO SOURCE` (no file) vs `FILENAME.PNG` (file loaded). The structural identifier `SOURCE:` is lost when a file is loaded — the label becomes only the filename, with no indication of what kind of datum it represents.

**[NO GUIDE]:** No standard defines the structure of a status-plus-action cell (a cell that shows a current value and provides an affordance to change it). No named pattern exists for `[LABEL: | VALUE or ACTION]` in toolbar or control contexts.

---

## 3. Analysis: What the Typography Law Covers and What It Does Not

`design-law.md §5` defines:
- Font family (Space Mono only)
- Case roles (UPPERCASE for controls/tabs, Title Case for block headers, Sentence case for body prose, lowercase for quiet status)
- The functional purpose of typography (expose structure and state, not ornament)

What it does not define:
- The semantic content of labels (what a label must say)
- The vocabulary of interaction types and their standard labels (search vs filter, save vs export, toggle vs switch)
- The required relationship between a label's content and the interaction it triggers
- The format for compound cells (label + value, label + action, status + trigger)
- Consequence disclosure requirements (must a toggle's label indicate what changes when toggled?)

The law is formal (what labels look like) but not semantic (what labels must mean). This is the core gap.

---

## 4. The Labelling Standard: What Needs to Exist

A labelling standard is needed that defines the following:

**4.1 Label type taxonomy.** Every label is one of:
- **Structural label**: names the element type or datum type (e.g. `SOURCE:`, `OPACITY`)
- **State label**: names the current value or mode (e.g. `FIT`, `FULL`)
- **Action label**: names the consequence of activation (e.g. `EXPORT PNG`, `ADD EFFECT`)
- **Compound label**: combines structural + state or structural + action (e.g. `SOURCE: FILENAME.PNG`)

**4.2 Action label requirements.** Action labels must describe the consequence, not the mechanism. `EXPORT PNG` (consequence: a PNG file is produced) is correct. `CLICK TO EXPORT` (mechanism) is incorrect. `EXPORT` alone is acceptable only when the output format is unambiguous from context.

**4.3 State label requirements.** State labels must be decodable without reference to the codebase. `PREVIEW` as a state label fails this test if the user cannot determine what "preview" means in terms of visible output. The label must communicate the operative difference between states, not just their names.

**4.4 Signifier-type matching.** Glyphs that imply an interaction type must only appear on elements that perform that interaction type. `▾` implies dropdown. `+` implies add. `×` implies close/remove. Using these glyphs on elements that perform different interactions is a labelling violation.

**4.5 Context-relative minimalism.** Labels should be minimal relative to their context. Within a module picker, "module" is contextually given and must not appear in item labels. Within a source cell, the datum type (`SOURCE:`) is part of the label structure and must not be dropped when a value is present.

**4.6 Vocabulary consistency.** Where a standard term exists (search, export, filter, undo, redo), use it correctly and consistently. Do not substitute synonyms or invent new terms for interactions that have established names.
