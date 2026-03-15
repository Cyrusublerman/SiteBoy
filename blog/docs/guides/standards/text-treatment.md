# Text Treatment

How text is rendered in every UI context. Eliminates agent judgement on case, size, alignment, padding, height, and overflow.

**Authority:** `design-law.md §5` (typography law), `design-law.md §13` (labelling law), `design-law.md §4` (scale law).

---

## 1. Universal Constants

These apply everywhere. No exceptions.

| Property | Value | Notes |
| --- | --- | --- |
| Font family | `'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace` | Matches styles.css global declaration |
| Authorised font sizes | `F × 0.75` (`10.5px` at `F=14`) and `F` (`14px`) only | No other multipliers — design-law §13.7 |
| Interactive row height | `F × 2` (`28px` at `F=14`) | All buttons, toolbar cells, dropdown items, tabs, collapsible headers |
| Line-height (controls) | `F × 2` (matches row height) | Vertically centres text without flex |
| Line-height (prose) | `1.5` | Body text, documentation, description panels only |
| `text-transform` | See §2 per context | |
| `white-space` | `nowrap` in all controls | No wrapping in interactive elements |
| `overflow` + `text-overflow` | `hidden` + `ellipsis` in all controls | Text never overflows its container |

---

## 2. Context Table

Every location where text appears. For each context: case, size, alignment, and colour.

| Context | Case | Size | Alignment | Colour |
| --- | --- | --- | --- | --- |
| Toolbar action cell (button) | UPPERCASE | `F × 0.75` | Centre | `var(--c-text)` |
| Toolbar status cell (readout) | UPPERCASE | `F × 0.75` | Left | `var(--c-text)` |
| Toolbar status cell — dynamic value | UPPERCASE | `F × 0.75` | Left | `var(--c-text)` |
| Sidebar tab label | UPPERCASE | `F × 0.75` | Centre | `var(--c-text)` |
| Sidebar block title (structural) | Title Case | `F` | Left | `var(--c-text)` |
| Sidebar block title (bold) | Title Case | `F` | Left | `var(--c-text)`, `font-weight: bold` |
| Sidebar parameter label | UPPERCASE | `F × 0.75` | Left | `var(--c-text)` |
| Sidebar parameter value readout | UPPERCASE | `F × 0.75` | Right | `var(--c-text)` |
| Dropdown trigger label | UPPERCASE | `F × 0.75` | Left (glyph right via flex) | `var(--c-text)` |
| Dropdown menu item | UPPERCASE | `F × 0.75` | Left | `var(--c-text)` |
| Dropdown section header (within list) | UPPERCASE | `F × 0.75` | Left | `var(--c-border)` (muted) |
| Content section collapsible header | UPPERCASE | `F × 0.75` | Left | `var(--c-text)` |
| Structural block collapsible header | Title Case | `F` | Left | `var(--c-text)`, `font-weight: bold` |
| Standalone button label | UPPERCASE | `F × 0.75` | Centre | `var(--c-text)` |
| Canvas empty state affordance | UPPERCASE | `F` | Centre (both axes) | `var(--c-text)` |
| Input field text (user-typed) | As-typed | `F × 0.75` | Left | `var(--c-text)` |
| Numeric value display | As-typed | `F × 0.75` | Right | `var(--c-text)` |
| Transport readout (timecode, frame) | UPPERCASE | `F × 0.75` | Right | `var(--c-text)` |
| Error / validation text | Sentence case | `F × 0.75` | Left | `var(--c-accent)` |
| Node name label | UPPERCASE | `F × 0.75` | Left | `var(--c-text)` |
| Hover description (native `title` attr) | Sentence case | Browser default | — | Browser default |
| Prose body text (documentation) | Sentence case | `F` | Left | `var(--c-text)` |

**Text-align note for numeric readouts:** Always `right`. Not `centre`. This is consistent across NodePanel, DriverPicker, and TransportStrip. NumericInput's current `centre` alignment is a violation.

---

## 3. Padding Rules

Padding is expressed only as `F`, `F/2`, or `0`. No fixed pixel values.

| Context | Padding | Notes |
| --- | --- | --- |
| Toolbar cell | `0 F` | Zero vertical (height is `2F`), `F` horizontal |
| Sidebar block content area | `F` all sides | The block container, not individual controls |
| Sidebar component gap | `F/2` between siblings | `gap: F/2` on the flex column |
| Dropdown item | `0 F` | Zero vertical (height `2F`), `F` horizontal |
| Dropdown section header | `0 F` | Same as items — must align |
| Picker / list item | `0 F` | NOT `0 F*2` |
| Standalone button | `0 F` | |
| Collapsible section header | `0 F` | Height `2F`, horizontal `F` |
| Tab label | `0 F` | |
| Input field (text/number) | `0 F/2` | Tighter horizontal; height from container |
| Canvas empty state label | `F` all sides | Centred within available space |
| Transport strip cell | `0 F` | |

**Prohibited padding values:** Any literal `px` value that is not `1px` (border). Examples of current violations: `ToolCanvas` `4px 8px`, `ToolTabs` `8px 16px`, `CategoryPicker` items `0 ${F * 2}px`.

---

## 4. Height and Line-Height

**Universal interactive row height:** `height: F × 2` (`28px`).

This single rule is what produces visual regularity. If every interactive row is `2F` tall, every row in every tool aligns to the same grid.

Apply to: toolbar cells, dropdown items, tab labels, standalone buttons, collapsible section headers, picker items, parameter row controls.

**Do not override this height** for any interactive element. If an element seems to need more height, the design is wrong.

```javascript
element.style.height = `${F * 2}px`;
element.style.lineHeight = `${F * 2}px`;  // vertically centres single-line text
```

Do not use `padding-top`/`padding-bottom` to create height — use explicit `height` so the grid is enforced.

---

## 5. Text Overflow

Single canonical pattern for all control elements:

```javascript
element.style.overflow     = 'hidden';
element.style.whiteSpace   = 'nowrap';
element.style.textOverflow = 'ellipsis';
```

This applies to: toolbar cell labels, dropdown trigger text, dropdown item text, sidebar block titles, tab labels, button labels, parameter labels, node names.

Do not allow natural wrapping in any control. If a label is too long for its container, it truncates with `…`.

Multi-line text is permitted only in: prose body, description panels, documentation content, `title` attribute (hover tooltip).

---

## 6. Inversion (Hover and Active States)

Active and hovered elements use colour inversion, not a separate accent colour.

```javascript
// Hover state
element.style.background = 'var(--c-text)';
element.style.color      = 'var(--c-bg)';

// Return to idle
element.style.background = 'var(--c-bg)';
element.style.color      = 'var(--c-text)';
```

Do not use opacity, `var(--vga-gray)`, or any intermediate colour for hover on control elements. Full inversion only.

Exception: muted secondary labels (`var(--c-border)` colour) do not participate in hover inversion.

---

## 7. Prohibited Text Patterns

| Pattern | Violation | Fix |
| --- | --- | --- |
| Centred text in list items or dropdown items | Text-align must be left | `text-align: left` |
| Centred numeric readout | Numeric readouts are always right-aligned | `text-align: right` |
| Mixed case within one label | e.g. `Export PNG` in a toolbar cell | Make fully UPPERCASE: `EXPORT PNG` |
| Font size other than `F × 0.75` or `F` | e.g. `F × 0.85`, `F × 1.5`, `12px` | Use only authorised sizes — design-law §13.7 |
| `letter-spacing` on control elements | Only prose may use letter-spacing | Remove `letter-spacing` from controls |
| Fixed-pixel padding | e.g. `padding: 4px 8px` | Replace with `F`-based padding |
| Text wrapping in a control | e.g. a block title that wraps to two lines | Truncate with ellipsis; redesign if critical |
| Bold on anything other than block titles | Bold is reserved for structural block headers | Remove `font-weight: bold` from controls |
| Font weight below `400` on control labels | Light text reduces legibility on dark backgrounds | Use `font-weight: 400` minimum |

---

## 8. CSS Template for a Standard Interactive Row

```javascript
element.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: ${F * 2}px;
    padding: 0 ${F}px;
    font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
    font-size: ${F * 0.75}px;
    text-transform: uppercase;
    color: var(--c-text);
    background: var(--c-bg);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
    box-sizing: border-box;
`;
```

This is the template for: toolbar cells, dropdown items, tab labels, collapsible section headers, list picker items, standalone buttons. Deviate only where a specific §2 row specifies differently (e.g. block titles use `font-size: F` and `font-weight: bold`).

---

End of Text Treatment.
