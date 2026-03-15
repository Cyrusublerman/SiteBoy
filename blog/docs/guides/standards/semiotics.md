# Semiotics — Symbol and Glyph Catalogue

Every symbol used in the UI. Zero agent decisions about which symbol to use, where to place it, or how to render it.

**Authority:** `design-law.md §13.4` (signifier-type matching), `design-law.md §15` (signifier catalogue and position rules).

---

## 1. Two Glyph Systems

The UI uses two distinct glyph systems for collapse/expand. The choice between them is determined by what the collapsed region contains — not by visual preference.

| System | Glyphs | Position | Use when |
| --- | --- | --- | --- |
| **Content section** | `▸` (collapsed) / `▾` (expanded) | Left of label | The collapsed region contains user-facing content: parameters, items, media, search results |
| **Structural block** | `+` (collapsed) / `−` (expanded) | Right of label | The collapsed region is structural scaffolding: a block of controls, a tab panel, a parameter group |

**Decision rule in plain language:** If the user came to the page to interact with what is inside, use `▸`/`▾`. If the collapsible exists only to organise the page, use `+`/`−`.

Examples:
- Category picker section with module list → `▸`/`▾` (user navigates into it)
- Sidebar parameter block ("Parameters", "Style") → `+`/`−` (structural scaffolding)
- Mask sub-section within a NodePanel → `▸`/`▾` (user content)
- TOC folder in documentation → `▸`/`▾` (user content)

---

## 2. Complete Glyph Catalogue

Every interaction type in the system and its assigned glyph. No glyph may be used for a purpose not listed here without an explicit user instruction.

| Interaction type | Glyph | Position | Notes |
| --- | --- | --- | --- |
| Open a dropdown list | `▾` | Right of label | Never `▼`, `v`, `⌄`, or `+` |
| Collapse content section | `▸` | Left of label | State glyph — shows current state (collapsed) |
| Expand content section | `▾` | Left of label | State glyph — shows current state (expanded) |
| Collapse structural block | `+` | Right of label | Structural only — not for user-content sections |
| Expand structural block | `−` | Right of label | Structural only |
| Add / create / append a new item | `+` | Right of label | e.g. `ADD EFFECT +` |
| Close / remove / dismiss | `×` | Right of label | e.g. `CLOSE ×`, remove buttons |
| Open a file dialog (browse/continue) | `…` | Right of label | When the action is browse/continue, not add |
| Add via file dialog (intent is adding) | `+` | Right of label | When the action's intent is to add content; see §3 |
| Play | `▶` | — | Transport only |
| Pause | `⏸` | — | Transport only |
| Stop | `■` | — | Transport only |
| Navigate previous | Left of `PREV` label | — | Full label: `← PREV` |
| Navigate next | Right of `NEXT` label | — | Full label: `NEXT →` |
| Sort ascending | `▲` | Right of label | Data table column headers |
| Sort descending | `▼` | Right of label | Data table column headers only — never for collapse |
| Drag handle | `⠿` | Left of element, muted colour | Fixed `2F × 2F` cell; `color: var(--c-border)` |
| Node enabled | `✓` | Fixed `2F × 2F` cell | |
| Node disabled | `○` | Fixed `2F × 2F` cell | |
| Solo / isolate | `S` | Fixed `2F × 2F` cell | Node panel utility |
| Pure status (no action) | — | — | No glyph on a pure status label |

---

## 3. Intent vs Mechanism Disambiguation

The same execution mechanism (a file dialog) can have two different intents.

| Intent | Glyph | Example |
| --- | --- | --- |
| **Browse / continue** — the user is selecting from existing files | `…` | "OPEN FILE …", "BROWSE …" |
| **Add / create** — the user is importing to add content | `+` | "ADD SOURCE +", "UPLOAD IMAGE +" |

Classify by the semantic intent of the action, not by the technical mechanism. A button that opens a file dialog to add a source image has intent "add" → glyph is `+`.

This rule overrides the `…` default from the catalogue above when intent is demonstrably "add."

---

## 4. Position Rules

From `design-law.md §15.1`, with concrete implementation:

| Glyph type | Position | Implementation |
| --- | --- | --- |
| State glyph (shows current state) | Left of label | Glyph `<span>` is first child; label `<span>` is second |
| Action glyph (shows what happens on click) | Right of label | Label `<span>` is first child; glyph `<span>` is last |
| Utility glyph (drag, enable, solo) | Separate cell, left of element | Fixed `2F × 2F` cell, not part of the label row |

**Spacing between glyph and label text:** One literal space character. Do not use `margin`, `padding`, or `gap` to create the visual space — the space is part of the text. Examples:

- `ADD EFFECT +` — one space before `+`
- `▸ COLOUR GRADE` — one space after `▸`
- `EXPORT ▾` — one space before `▾`

---

## 5. Canonical DOM Structure

Three incompatible patterns exist in the current codebase. Only one is correct going forward.

**Canonical pattern (use this for all new elements):**

```javascript
// Parent element
element.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 ${F}px;
    height: ${F * 2}px;
`;

// Label span
const label = document.createElement('span');
label.textContent = 'EXPORT';
label.style.flex = '1';
element.appendChild(label);

// Glyph span
const glyph = document.createElement('span');
glyph.textContent = '▾';
glyph.style.flexShrink = '0';
element.appendChild(glyph);
```

**Prohibited pattern A — text concatenation:**

```javascript
// WRONG: breaks truncation and styling
element.textContent = 'EXPORT ▾';
```

**Prohibited pattern B — gap-based icon:**

```javascript
// WRONG: produces inconsistent spacing, no flex alignment
icon.style.marginLeft = '2px';
```

**Exception:** Content section headers (`▸`/`▾`) where the glyph is always at the start and the text never truncates may use concatenation if the element is simple and the glyph precedes the label. The space character between glyph and label must still be present.

---

## 6. Disambiguation: `+` as "Add" vs `+` as "Expand"

The `+` glyph serves two roles:

| Role | Context | Label must include |
| --- | --- | --- |
| Add new item | Action glyph on a button | A verb that clarifies creation: `ADD EFFECT +`, `ADD SOURCE +` |
| Expand structural block | Structural collapse glyph | The block title provides context |

A bare `+` with no surrounding label context is ambiguous and prohibited. Every `+` must appear in a context where its meaning is self-evident from the label.

---

## 7. Prohibited Glyphs

The following glyphs are prohibited regardless of context:

| Prohibited | Correct alternative | Reason |
| --- | --- | --- |
| `▼` for collapse/expand | `▾` (content) or `−` (structural) | `▼` is reserved for sort-descending |
| `▶` for collapse | `▸` | `▶` is reserved for play |
| `⌄` or `v` as dropdown indicators | `▾` | Non-standard, visually inconsistent |
| `→` / `←` except in navigation labels | No glyph, or use label text | Reserved for `NEXT →` / `← PREV` |
| Any emoji | — | Violates style constraints |
| `✕` or `✗` for close | `×` | `×` is the canonical close glyph |
| `▮` for stop | `■` | `■` is the canonical stop glyph |

---

## 8. State Label vs Glyph Interaction

When a button is a cyclic toggle (changes state on click), the label shows the current state, not the next state. The glyph is not used to indicate state change — the label itself changes.

```
Current state: DRAFT   ← label shows current
Click → state becomes: FULL QUALITY

NOT: DRAFT → (click) → shows "FULL QUALITY" with a ▸ glyph
YES: DRAFT ← shows this; clicking changes label to FULL QUALITY
```

See `design-law.md §13.3` (state label rules).

---

## 9. Codebase Violations (reference — fixes are separate tasks)

| File | Line(s) | Violation | Correct glyph/structure |
| --- | --- | --- | --- |
| `assets/js/shared/content.js` | L995, L1081 | Uses `▼`/`▶` for TOC collapse/expand | `▸`/`▾` (content section system) |
| `assets/js/shared/components/input/Dropdown.js` | L115, L287 | Uses `+` as dropdown trigger glyph | `▾` |
| `assets/js/shared/components/tool/GeneratorToolbar.js` | L171, L281 | Uses `+` as menu trigger glyph | `▾` |
| `assets/js/tools/processors/distort/ui/CategoryPicker.js` | L108 | Glyph concatenated into text string | Separate `<span>` elements |
| `assets/js/tools/processors/distort/ui/NodePanel.js` | L427 | Glyph concatenated into text string | Separate `<span>` elements |

---

End of Semiotics.
