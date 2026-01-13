# Markdown Typography & Aesthetic System — Site Build Guide (Expanded)

This document is a **binding specification** for making Markdown pages on the site look like *designed editorial documents* (poster-grade hierarchy + Swiss grid discipline) while remaining compatible with:

* Space Mono-only typography
* VGA-style constrained palette
* Existing BU/F-based layout logic
* Prism syntax highlighting
* MathJax rendering

It is written to be used as the **single reference** for an AI agent building or refactoring Markdown presentation.

---

## 0. Scope

### 0.1 In scope

* CSS-only presentation improvements to Markdown output (`marked.js` → HTML)
* A coherent typographic system: scale, rhythm, measure, spacing
* Markdown-specific components: tables, HRs, callouts, lists, figures, code, math
* Integration constraints: theme variables, Prism, MathJax
* QA fixture and acceptance tests

### 0.2 Out of scope

* Changing Markdown parsing rules or adding new syntax (unless explicitly requested later)
* JS-based layout shifts or runtime typography hacks
* Changing global site layout rules unrelated to Markdown

---

## 1. Design Intent

Markdown pages must:

1. Read as **designed artefacts**, not browser defaults.
2. Exhibit **hard hierarchy**: one dominant headline tier, unambiguous sectioning.
3. Maintain **controlled measure**: prose sits in deliberate column width.
4. Maintain **quantised rhythm**: spacing is grid-aligned, not "CSS default".
5. Use **few typographic roles** at any moment; avoid mid-scale ambiguity.
6. Use **micro-typography** (tracking/case/leading) to encode hierarchy.
7. Keep **component language consistent**: borders, rules, surfaces repeat across tables/callouts/figures.

A Markdown page should plausibly be printable as a clean editorial handout.

---

## 2. Non-Negotiable Constraints

### 2.1 Ownership and cascade control

* All Markdown styling must be scoped under `.markdown-body`.
* There must be **one canonical owner** of `.markdown-body` rules.
* No duplicated `.markdown-body` selectors across files.
* The canonical section must be contiguous (single block), so it is diffable and auditable.

### 2.2 No JS for presentation

* No JS to add wrappers, restructure DOM, or calculate CSS values at runtime.
* Any width-aware behaviour must be achieved via CSS (clamp, container queries) unless explicitly overridden later.

### 2.3 Font discipline

* One font family: Space Mono (and safe monospace fallback).
* No font switching inside Markdown for "style".
* Contrast comes from: **size, weight, spacing, case, and composition**.

### 2.4 Palette discipline

* Only existing palette variables.
* No gradients, shadows, blur, glow.
* Surfaces must be achieved via: border + subtle alpha backgrounds.

### 2.5 Grid allegiance

* All spacing must resolve to the base unit system (BU/F).
* No arbitrary pixel padding/margins in Markdown rules.

---

## 3. Document Model

Markdown is a **document subsystem** with:

* A **token layer** (sizes, spacing, tracking, line heights)
* A **mapping layer** (Markdown elements → roles)
* A **component layer** (table/callout/code/figure)

You must implement in this order. Styling elements ad-hoc is disallowed.

---

## 4. Token System

### 4.1 Required tokens

The system must define these CSS custom properties (all scoped under `.markdown-body` or its container):

#### Measure and layout

* `--md-measure-min`
* `--md-measure-ideal`
* `--md-measure-max`
* `--md-measure` (final clamp)
* `--md-gutter` (left/right padding inside measure)

#### Rhythm

* `--md-u` (primary rhythm unit; derived from BU/F)
* `--md-block-gap` (standard block separation)
* `--md-section-gap` (between major sections)

#### Type sizes

* `--md-body`
* `--md-small`
* `--md-label`
* `--md-h1` … `--md-h6`

#### Line heights (role-specific)

* `--md-lh-body`
* `--md-lh-head`
* `--md-lh-code`

#### Tracking

* `--md-track-body`
* `--md-track-label`
* `--md-track-small`

#### Borders/surfaces

* `--md-border`
* `--md-surface-weak`
* `--md-surface-mid`

### 4.2 Role philosophy

* **Few sizes, decisive jumps.**
* H1/H2 should be clearly separated from body.
* H4–H6 are structural markers: they must remain legible and distinct.
* Labels (overlines, microheadings) use uppercase + positive tracking.

---

## 5. Measure (Controlled Line Length)

### 5.1 Target behaviour

* Prose must never run full width.
* Monospace comfortable range is lower than proportional fonts.

### 5.2 Implementation requirements

* Prose column uses `max-width: var(--md-measure)`.
* The measure is a `clamp(min, ideal, max)`.
* Tables and code blocks may overflow horizontally **within their own scroll surfaces**, not by breaking the page.

### 5.3 Measure edge cases

* On very wide screens, measure caps.
* On small screens, measure becomes 100% minus gutters.
* Long URLs and inline code must wrap or scroll without destroying layout.

---

## 6. Width-Aware Scaling (Your Font Width Ratio Principle)

This system preserves your earlier intent: keep typographic relations stable with respect to container width.

### 6.1 Principle

* A monospace font's perceived density depends strongly on average glyph width.
* A `fontWidthRatio` allows you to reason about characters-per-line and derive stable measures.

### 6.2 Constraints in the current regime

* You may keep `fontWidthRatio` **as a single constant** for Space Mono.
* You may not introduce additional font families to justify ratios.

### 6.3 Allowed outputs

The agent must implement one of these strategies:

#### Strategy A (CSS-only, recommended)

* Use clamp-based measure and clamp-based font sizes.
* Keep role multipliers quantised and stable.

#### Strategy B (hybrid, only if you later permit JS)

* Compute base size from container width and snap to BU.
* Not allowed unless explicitly requested later.

The agent must not silently choose Strategy B.

---

## 7. Type Scale and Hierarchy

### 7.1 Hierarchy rules

* H1 is the single dominant headline.
* H2 is the major sectional boundary.
* H3 introduces subsections.
* H4–H6 must not collapse into "same as body".

### 7.2 Heading spacing rules

* Larger **pre-space** than post-space.
* The first heading in a document has no top margin.
* Headings must not be separated from the following paragraph by excessive whitespace.

### 7.3 Case and tracking

* Optional: treat certain headings as "labels" (uppercase + tracking) only when explicitly specified; do not auto-uppercase all headings.
* Labels and metadata always get positive tracking.

---

## 8. Rhythm (Vertical Spacing)

### 8.1 Block rhythm primitives

All block-level elements must share a consistent base margin defined by `--md-block-gap`:

* `p`, `ul`, `ol`, `dl`, `pre`, `table`, `blockquote`, `figure`, `hr`

### 8.2 Internal margin hygiene

Within container components (blockquote, table cells, callouts), remove double margins:

* First child: no top margin
* Last child: no bottom margin

This prevents "p inside blockquote" from exploding spacing.

### 8.3 Sectioning

`--md-section-gap` is used between:

* H2 boundaries
* major thematic breaks
* HR separators

---

## 9. Markdown Element → Role Mapping

This mapping is mandatory.

### 9.1 Typographic mapping

* `h1` → H1 role
* `h2` → H2 role
* `h3` → H3 role
* `h4` → H4 role
* `h5` → H5 role
* `h6` → H6 role
* `p` → Body role
* `small` / `figcaption` → Small role

### 9.2 Inline semantics

* `strong` → weight emphasis only
* `em` → italics emphasis only
* `code` → inline technical term styling
* `a` → link affordance

### 9.3 Block semantics

* `blockquote` → callout surface
* `pre` → code block surface
* `hr` → section delimiter
* `table` → data surface
* `figure` → editorial media surface

---

## 10. Component Specifications

### 10.1 Tables (Data Surfaces)

Tables must be fully styled and readable.

#### Required behaviours

* Visible grid lines using `--md-border`.
* Header row with distinct surface.
* Cell padding quantised to `--md-u`.
* Subtle zebra striping using an alpha surface.
* Wide tables scroll horizontally without breaking layout.

#### Alignment and wrapping

* Default: left aligned
* Long cell contents must wrap; table as a whole may scroll.

#### Captions

* If a caption exists, it uses Small role and sits above or below with consistent rhythm.

### 10.2 Horizontal Rules

HR is a designed delimiter.

#### Required behaviours

* 1px rule (no browser bevel)
* Uses border colour
* Uses `--md-section-gap` above and below

### 10.3 Callouts (Blockquotes)

Blockquotes behave as editorial callouts.

#### Required behaviours

* Left border indicator
* Padded interior
* Subtle surface
* Margins harmonised with rhythm
* Internal margin hygiene (first/last child)

#### Optional semantic variants

If you later add parsing support, callouts can become typed admonitions (note/tip/warn/danger).
Until then, only neutral styling is required.

### 10.4 Lists

Lists must look structured and grid-locked.

#### Required behaviours

* Indentation = integer multiples of `--md-u`
* Nested lists have tighter vertical spacing
* Between-list blocks retain `--md-block-gap`

### 10.5 Code

Code is a primary technical reading surface.

#### Inline code

* Must not look like a "button" unless your whole UI uses that convention.
* Prefer: subtle border or subtle surface.

#### Fenced code blocks

* Must have a clear boundary
* Padding quantised
* Must not break Prism tokens
* Must support horizontal scrolling for long lines

### 10.6 Math (MathJax)

Math must integrate with rhythm.

#### Required behaviours

* Display math uses block gap and section gap appropriately
* Long equations have overflow strategy (scroll is acceptable)
* Math does not collide with code/table surfaces

### 10.7 Figures and media

Figures must behave like editorial objects.

#### Required behaviours

* Controlled width (within measure)
* Consistent spacing
* Caption styling as Small role
* Border language consistent with other components

---

## 11. Additional Markdown Features (Must-Have Edge Cases)

The agent must explicitly test and handle:

### 11.1 Task lists

* `- [ ]` and `- [x]` if present
* Checkbox alignment and spacing must not break list rhythm

### 11.2 Details/Summary

If Markdown contains `<details>`:

* Summary should read as a label
* Details content should use a bordered surface

### 11.3 Long URLs and unbroken strings

* Must not overflow measure and break layout
* Prefer `overflow-wrap: anywhere` on prose contexts

### 11.4 Nested block content

* `blockquote` containing lists, code blocks, etc.
* Must maintain margin hygiene and not explode spacing

---

## 12. Page-Level Composition

Markdown pages must integrate with site framing while achieving a **magazine/editorial** feel.

### 12.1 Document container pattern

A Markdown document is rendered into a container (existing `.markdown-body`). The magazine vibe is achieved by introducing a **secondary editorial grid** inside that container.

Required layers:

1. **Page frame** (already handled by site layout)
2. **Editorial wrapper**: constrains measure and defines column/grid behaviour
3. **Content blocks**: prose, figures, callouts, tables, code, etc.

### 12.2 Editorial grid modes

The system must support at least three modes, switchable per page or per block.

#### Mode A — Single column prose (default)

* Controlled measure
* Best for long reading

#### Mode B — Two-column magazine layout (desktop only)

* Used for content-dense "article" pages
* Collapses to single column on mobile

#### Mode C — Grid blocks (feature panels)

* Used for sidebars, pull quotes, media-led sections
* Implemented via CSS Grid within a wrapper

### 12.3 Column system requirements

Because Markdown alone cannot reliably produce magazine layouts, the system must use **HTML wrappers inside Markdown** (supported by `marked.js` raw HTML).

Allowed wrappers (author-facing):

* `<section class="md-article">…</section>`
* `<div class="md-cols">…</div>`
* `<div class="md-grid">…</div>`
* `<aside class="md-aside">…</aside>`
* `<figure class="md-figure">…</figure>`
* `<blockquote class="md-pullquote">…</blockquote>`
* `<p class="md-kicker">…</p>`
* `<p class="md-dek">…</p>`
* `<p class="md-byline">…</p>`

Disallowed:

* Inline styles
* Arbitrary layout div soup
* Hardcoded colours

### 12.4 Magazine header pattern (optional but supported)

If a page is an "article", it may start with:

* **Kicker** (label role, uppercase + tracking)
* **Headline** (H1 role)
* **Dek** (lead paragraph, slightly larger or looser leading)
* **Byline/metadata** (small role)

This must be achievable with either:

* pure Markdown (H1 + paragraphs), or
* HTML classes (`md-kicker`, `md-dek`, `md-byline`) for precision.

### 12.5 TOC integration (optional)

If TOC exists:

* It must not compete with the headline.
* It may live as a right-column sidebar in Mode B.
* On mobile it collapses under the header.

---

## 13. Guiding the AI Toward High-Level Typographic Sensibility

This section reframes the problem: **the goal is not templates or components**, but to encode *design judgement* so that any output the AI produces exhibits high-level typographic sensibility by default.

The AI must be guided to make *fewer but better decisions*, using constraints, priorities, and evaluation heuristics rather than explicit layouts.

---

## 13.1 Core Principle: Encode Taste, Not Layout

High-quality editorial typography emerges from **decision hierarchies**, not from specific structures.

The AI must be guided to:

* Prefer **restraint over novelty**
* Prefer **clarity over density**
* Prefer **hierarchy over decoration**
* Prefer **whitespace over separators**

The system must bias the AI away from:

* Filling space
* Adding visual features
* Overusing blocks, rules, or emphasis

---

## 13.2 The Editorial Decision Stack (Mandatory Order)

For any Markdown page, the AI must reason in this order:

1. **What is the dominant reading action?**

   * Long-form reading
   * Scanning / reference
   * Feature highlight

2. **What deserves attention first?**

   * Headline
   * Image
   * Key statement

3. **What can safely be de-emphasised?**

   * Metadata
   * Supporting detail
   * Repetition

4. **What can be removed entirely?**

If the AI cannot justify an element's presence in this sequence, it must not be introduced.

---

## 13.3 Hierarchy Heuristics (Non-Negotiable)

The AI must follow these heuristics when assigning typographic weight:

* There must be **one and only one visual apex** per page.
* Every level below must be *clearly weaker* than the level above.
* If two elements compete visually, one must be reduced.
* If hierarchy is unclear, reduce variety, not increase contrast.

Red flags the AI must avoid:

* Headings that look like body text
* Body text that looks like headings
* Multiple "headline-like" elements

---

## 13.4 Scale Discipline

The AI must:

* Use **few size steps**
* Avoid smooth or continuous scales
* Prefer integer or rational relationships

If the AI introduces a new size, it must justify:

* Why an existing size could not be reused

If justification cannot be given, the size must be removed.

---

## 13.5 Line Length & Measure Sensibility

The AI must treat line length as a **primary design variable**, not a by-product.

Guidelines:

* Prose that feels tiring → reduce measure
* Prose that feels disjointed → slightly increase measure
* Never allow full-width prose unless explicitly requested

The AI must never use columns or grids to compensate for poor measure.

---

## 13.6 Whitespace as Structure

Whitespace is the AI's primary layout tool.

Rules:

* Prefer increasing space over adding lines or boxes
* Large conceptual breaks → whitespace, not rules
* Rules (`hr`, borders) are only used when whitespace alone is ambiguous

If the AI adds a separator, it must justify why whitespace was insufficient.

---

## 13.7 Emphasis Discipline

The AI must limit emphasis.

Rules:

* Do not stack emphasis types (e.g. size + weight + colour)
* Inline emphasis must be rare
* Block emphasis (callouts, quotes) must be sparse

If everything is emphasised, nothing is.

---

## 13.8 Image & Figure Judgement

Images must earn their place.

The AI must ask:

* Does this image clarify, anchor, or interrupt meaningfully?
* Would the page read better without it?

If the answer is unclear, omit the image.

Captions must:

* Add context, not restate the obvious
* Be visually subordinate to the image

---

## 13.9 Block Quotes & Callouts: When to Use Them

Block quotes are *rhetorical devices*, not containers.

Use only when:

* A sentence deserves to interrupt reading flow
* A concept benefits from isolation

Do not use block quotes to:

* Highlight definitions
* Add decoration
* Compensate for weak writing

---

## 13.10 Columns: A Last Resort, Not a Default

Columns are a **reading mode change**.

The AI must only introduce columns if:

* The content is dense but shallow
* The reader is scanning, not reading deeply

If columns are used:

* Collapse to single column for narrative passages
* Never mix columns with heavy code or tables

---

## 13.11 Sensory Consistency Checks

Before finalising output, the AI must run these checks:

* **Squint test**: hierarchy should still be visible
* **Zoom-out test**: page should read as a rhythm, not noise
* **Scroll test**: cadence should feel intentional

If any test fails, reduce complexity.

---

## 13.12 Taste Enforcement Rules

The AI must enforce these hard rules:

* Never introduce visual novelty without removing something else
* Never solve a problem by adding more styles
* When in doubt, simplify
* When uncertain, reduce

---

## 13.13 Failure Modes to Actively Avoid

The AI must detect and avoid:

* "UI-ification" of editorial pages
* Overuse of boxes, cards, and dividers
* Excessive componentisation
* Treating Markdown like a dashboard

Markdown pages are documents, not interfaces.

---

## 13.14 What Success Looks Like

A successful Markdown page:

* Feels calm
* Feels deliberate
* Feels sparse but complete
* Can be skimmed or read deeply
* Makes poor typography feel immediately obvious by contrast

If the output feels "designed", but cannot explain *why*, it is likely correct.

---

Layout Mechanics for Magazine Vibe (CSS Behaviours)

### 14.1 Columns vs grid

Columns (`column-count`) are good for continuous prose but can cause bad breaks.
Grid (`display: grid`) is good for intentional placement.

The system must support both:

* `.md-cols` uses CSS columns for prose flow
* `.md-grid` uses CSS grid for block placement

### 14.2 Preventing bad column breaks

Within `.md-cols`, certain blocks must avoid splitting:

* figures
* pull quotes
* tables
* code blocks
* asides/insets

Required CSS behaviours:

* `break-inside: avoid` (and vendor equivalents where needed)
* Treat blocks as column "atoms"

### 14.3 Column rhythm

* Column gap = integer multiple of `--md-u`
* Headings should span columns only if explicitly requested via a wrapper

### 14.4 Editorial alignment rules

* Captions align with image left edge
* Pull quotes align to the same left edge as body
* Asides align to grid edges, not floating randomly

---

## 15. Component-Level Editorial Details

### 15.1 Captions and credits

Captions are not optional in magazine vibe.

Rules:

* `md-caption` uses Small role
* `md-credit` uses Label/Small hybrid: uppercase + tracking + reduced opacity
* Caption block has margin-top = small fraction of `--md-u`

### 15.2 Kicker and overlines

Kicker and overlines create editorial tone.

Rules:

* uppercase
* positive tracking
* small size
* tight spacing to H1

### 15.3 Pull quotes

Pull quotes create scanning rhythm.

Rules:

* Larger than body
* Distinct surface but minimal
* Attribution styled as Small role

### 15.4 Image behaviour

Images require deliberate policy:

* default: contained within measure
* optional: `md-bleed` class to allow controlled bleed (desktop only)
* always: captions and alt text

### 15.5 Custom HTML elements policy

Allowed semantic elements (preferred):

* `section`, `aside`, `figure`, `figcaption`, `blockquote`, `cite`, `details`, `summary`

Allowed utility containers:

* `div` only when it carries a known class from this guide

Not allowed:

* arbitrary class names
* inline styles
* nested wrappers that duplicate roles

---

## 16. Accessibility and Legibility Requirements

* All text must maintain clear contrast against background.
* Small text must remain readable; avoid going below practical minimum.
* Focus styles for links must exist and be visible.
* Hover effects must not be the only affordance.
* Captions/credits must remain selectable text (no images of text).

---

## 17. Dark/Light Theme Behaviour

If the site supports theme switching:

* Markdown surfaces (callouts, tables, code blocks) must adapt using variables.
* No hardcoded colours inside Markdown rules.
* Zebra striping must remain subtle and not invert into high-contrast noise.

---

## 18. Migration Plan (From Current State)

The agent must execute this sequence without deviation:

1. Identify duplicate Markdown CSS blocks across CSS files.
2. Choose the canonical owner file.
3. Delete or neutralise all non-owner `.markdown-body` rules.
4. Rebuild the canonical `.markdown-body` section using this guide.
5. Run the fixture test page and visually verify acceptance.

No "incremental patching" across multiple files is allowed.

---

## 19. QA Fixture (Mandatory)

The agent must create a single Markdown fixture document containing:

* H1–H6
* Several paragraphs (including long lines)
* Inline emphasis and inline code
* A fenced code block (with Prism language)
* Nested lists (ordered + unordered)
* A blockquote with multiple paragraphs and a list inside
* Multiple `---` HR separators
* A normal table and a wide table
* A figure with caption
* MathJax inline and display equations
* A long URL/unbroken string test
* (If applicable) a task list and details/summary

---

## 20. Acceptance Criteria (Pass/Fail)

A Markdown presentation pass is valid only if:

### 20.1 Hierarchy

* H1 is dominant
* Sectioning is obvious at a glance
* No "mushy" mid-scale competition

### 20.2 Measure

* Prose is constrained and comfortable
* No full-width wall-of-text

### 20.3 Rhythm

* Spacing feels grid-locked
* Components align visually via shared border/surface language

### 20.4 Defaults eliminated

* Tables, HRs, lists, blockquotes do not resemble browser defaults

### 20.5 Technical integration intact

* Prism highlighting remains correct
* MathJax renders correctly
* No layout breakage on mobile

---

## 21. Agent Output Requirements

The agent must output these deliverables in order:

1. **Token Table**

   * List every token defined in Section 4
   * Include its intended role and dependencies

2. **Mapping Table**

   * Markdown element → token role/component

3. **Canonical CSS Section**

   * A single contiguous `.markdown-body` CSS block implementing the system

4. **Fixture Markdown Document**

   * As defined in Section 16

5. **QA Checklist Report**

   * A plain checklist marking each acceptance item pass/fail

No other documentation is required.

