# Page Design Guide for AI Agents

**PURPOSE:** Guide external AI agents to produce high-quality page designs that integrate smoothly into our tool system.

---

## Terminology

Use these exact terms consistently:

| Term | Definition |
|------|------------|
| **Tool** | An interactive page with sidebar controls and canvas output |
| **Sidebar** | Left panel containing all input controls |
| **Canvas** | Right panel displaying visual/audio output |
| **Tab** | Top-level sidebar section (e.g., CONTROLS, CANVAS) |
| **Block** | Grouping of related controls within a tab (e.g., Parameters, Style) |
| **Component** | Individual UI element (slider, button, color picker, etc.) |
| **Key** | Unique identifier for a component's value (camelCase) |
| **F-unit** | Base sizing unit = 14px (all sizes should be F-multiples) |

### Hierarchy

```
Tool
├── Sidebar
│   └── Tab (CONTROLS, CANVAS, etc.)
│       └── Block (Parameters, Style, etc.)
│           └── Component (slider, button, etc.)
└── Canvas
    └── Visual/Audio output
```

---

## What You're Designing

You are designing **interactive tool pages** for a creative coding platform. Each page:
- Has a **sidebar** with controls (sliders, buttons, dropdowns, etc.)
- Has a **canvas** that displays output (visuals, audio waveform, etc.)
- May be **static** (user adjusts → output updates) or **animated** (continuous playback)

---

## Design Process

### Step 1: Define Purpose

Answer these questions:

```
1. WHAT does this tool do? (one sentence)
2. WHO would use it? (artist, designer, developer, etc.)
3. WHAT is the output? (image, animation, audio, data, file)
4. WHAT makes this unique? (what can't they do elsewhere?)
```

### Step 2: Identify Output Type

Check ONE primary output:

| Output Type | Characteristics | Required Components |
|-------------|-----------------|---------------------|
| **Static Image** | User adjusts → canvas updates | `slider`: Width/Height, `button`: Download PNG, `button`: Clear |
| **Animation** | Continuous playback | `button`: Play/Pause, `slider`: FPS, `toggle`: Loop, `button`: Export Frame/GIF |
| **Audio** | Sound generation | `button`: Play/Stop, `slider`: Volume, `progress`: Level meter |
| **Data/Calculation** | Computed values | `value`: displays, `button`: Copy, `button`: Export |
| **File Processing** | Transform input file | `file`: Upload, `button`: Export result |

### Step 3: List All Parameters

For each adjustable value, document:

```
PARAMETER: [name]
TYPE: slider | dropdown | toggle | color | text | file | button
RANGE: [min] to [max] (if numeric)
DEFAULT: [value]
STEP: [increment] (if numeric)
PURPOSE: [what it controls]
```

**Group parameters by function:**
- **Core Parameters** — Essential to the tool's function
- **Appearance** — Colors, sizes, visual style
- **Behavior** — How it operates, modes, options
- **Canvas** — Size, resolution, display mode
- **Export** — Download buttons, format options

### Step 4: Define Interactions

Document how parameters affect output:

```
WHEN [parameter] changes:
  → [what happens to the output]
  → [any side effects on other parameters]
```

Document button actions:

```
BUTTON: [label]
ACTION: [what it does when clicked]
```

### Step 5: Plan Visual Layout

Describe the canvas content:

```
CANVAS CONTENT:
- [what is drawn/displayed]
- [coordinate system: centered, top-left, etc.]
- [color scheme expectations]
```

---

## Output Format

Produce a markdown document with these exact sections:

```markdown
# [Tool Name]

## 1. Overview

**Purpose:** [one sentence]
**Output Type:** [Static Image | Animation | Audio | Data | File Processing]
**Target User:** [who uses this]

## 2. Parameters

### Core Parameters

| Parameter | Type | Range | Default | Step | Purpose |
|-----------|------|-------|---------|------|---------|
| | | | | | |

### Appearance

| Parameter | Type | Options/Range | Default | Purpose |
|-----------|------|---------------|---------|---------|
| | | | | |

### Behavior

| Parameter | Type | Options | Default | Purpose |
|-----------|------|---------|---------|---------|
| | | | | |

## 3. Controls Layout

### Tab: [TAB NAME]

**Block: [Block Title]**
- [component type]: [label] — [purpose]
- [component type]: [label] — [purpose]

**Block: [Block Title]**
- [component type]: [label] — [purpose]

### Tab: [TAB NAME]
...

## 4. Interactions

### Parameter Effects

| When | Then |
|------|------|
| [parameter] changes | [effect] |

### Button Actions

| Button | Action |
|--------|--------|
| [label] | [what happens] |

## 5. Canvas Specification

**Content:** [what is displayed]
**Coordinate System:** [origin, axes]
**Default Size:** [width × height in pixels]
**Background:** [color/pattern]

### Visual Elements

- [element 1]: [how it's drawn, what controls affect it]
- [element 2]: [description]

## 6. Algorithm Notes

[If applicable, describe the core logic/math:]
- [key formulas]
- [processing steps]
- [performance considerations]

## 7. Similar Tools

[Reference existing tools this is similar to:]
- [tool name]: [what's similar, what's different]

## 8. Future Extensions

[Optional features that could be added later:]
- [extension 1]
- [extension 2]
```

---

## Complete Component Reference

All available components with correct nomenclature. **Use these exact type names.**

---

### INPUT COMPONENTS

#### `slider` — Numeric Slider
A horizontal slider for continuous numeric values.

| Property | Type | Description |
|----------|------|-------------|
| label | string | Display label |
| min | number | Minimum value |
| max | number | Maximum value |
| step | number | Increment step |
| value | number | Default value |
| withNumber | boolean | Show number field beside slider |
| precision | number | Decimal places |
| unit | string | Unit suffix (%, px, etc.) |

**Syntax:** `['slider', 'Label', min, max, step, { value, withNumber, unit, key }]`

**Example:**
```
slider: Volume, 0-100, step 1, default 50, with number field, unit %
```

---

#### `number` — Number Field
A text input for precise numeric entry. No slider.

| Property | Type | Description |
|----------|------|-------------|
| label | string | Display label |
| min | number | Minimum value |
| max | number | Maximum value |
| step | number | Increment step |
| value | number | Default value |
| precision | number | Decimal places |

**Syntax:** `['number', 'Label', min, max, step, { value, precision, key }]`

**Example:**
```
number: Frequency, 0.1-10, step 0.1, default 2.5, precision 1
```

---

#### `stepper` — Number with +/- Buttons
A number field with increment/decrement buttons. Best for integers.

| Property | Type | Description |
|----------|------|-------------|
| label | string | Display label |
| min | number | Minimum value |
| max | number | Maximum value |
| step | number | Increment step |
| value | number | Default value |

**Syntax:** `['stepper', 'Label', min, max, step, { value, key }]`

**Example:**
```
stepper: Sides, 3-12, step 1, default 6
```

---

#### `text` — Single-Line Text Input
A one-line text field.

| Property | Type | Description |
|----------|------|-------------|
| label | string | Display label |
| value | string | Default text |
| placeholder | string | Hint text |

**Syntax:** `['text', 'Label', defaultValue, { placeholder, key }]`

**Example:**
```
text: Name, placeholder "Enter name..."
```

---

#### `textarea` — Multi-Line Text Input
A text area for longer content.

| Property | Type | Description |
|----------|------|-------------|
| label | string | Display label |
| value | string | Default text |
| rows | number | Number of rows |
| placeholder | string | Hint text |

**Syntax:** `['textarea', 'Label', defaultValue, { rows, placeholder, key }]`

**Example:**
```
textarea: Description, 5 rows, placeholder "Enter description..."
```

---

#### `dropdown` — Dropdown Menu
A custom-styled select menu. Opens downward with options.

| Property | Type | Description |
|----------|------|-------------|
| label | string | Display label |
| options | array | List of options (strings or {value, label} objects) |
| value | string | Selected value |

**Syntax:** `['dropdown', 'Label', [options], { value, key }]`

**Example:**
```
dropdown: Wave Type, options: [Sine, Square, Triangle, Sawtooth], default Sine
```

---

#### `radio` — Radio Buttons (Single Select)
A group of options where only ONE can be selected.

| Property | Type | Description |
|----------|------|-------------|
| label | string | Group label |
| items | array | Option labels |
| selectedValue | string | Initially selected |

**Syntax:** `['radio', 'Label', [items], { selectedValue, key }]`

**Example:**
```
radio: Mode, options: [Fast, Normal, Slow], default Normal
```

---

#### `toggle` — Checkboxes (Multi Select)
A group of options where MULTIPLE can be selected.

| Property | Type | Description |
|----------|------|-------------|
| label | string | Group label |
| items | array | Option labels |
| selectedValues | array | Initially selected items |

**Syntax:** `['toggle', 'Label', [items], { selectedValues, key }]`

**Example:**
```
toggle: Options, options: [Show Grid, Animate, Fill], selected: [Animate]
```

---

#### `color` — Color Picker
A color input with optional hex text field and swatches.

| Property | Type | Description |
|----------|------|-------------|
| label | string | Display label |
| value | string | Hex color (#RRGGBB) |
| showHex | boolean | Show hex text input |
| swatches | array | Preset color palette |

**Syntax:** `['color', 'Label', '#RRGGBB', { showHex, swatches, key }]`

**Example:**
```
color: Fill Color, default #FF0000, show hex input
color: Palette, default #000000, swatches: [#FF0000, #00FF00, #0000FF]
```

---

#### `file` — File Upload
A styled file picker button.

| Property | Type | Description |
|----------|------|-------------|
| label | string | Display label |
| accept | string | MIME type filter (image/*, audio/*, etc.) |
| multiple | boolean | Allow multiple files |
| buttonText | string | Button label |

**Syntax:** `['file', 'Label', 'mime/type', { buttonText, multiple, key }]`

**Example:**
```
file: Upload Image, accepts image/*, button "Choose..."
```

---

#### `button` — Action Button
A clickable button that triggers an action.

| Property | Type | Description |
|----------|------|-------------|
| text | string | Button label |
| size | string | 's', 'm', or 'l' |

**Syntax:** `['button', 'Label', null, { key, size }]`

**Example:**
```
button: Reset — clears canvas and resets all values
button: Download PNG — exports canvas as PNG file
```

---

#### `equation` — Interactive Equation Editor
Displays a mathematical equation with clickable, editable parameters.

| Property | Type | Description |
|----------|------|-------------|
| template | string | Equation with {param} placeholders |
| params | object | Parameter definitions with value, min, max, step |

**Syntax:** `['equation', 'template with {vars}', { var: { value, min, max, step, precision } }]`

**Example:**
```
equation: y = {A}·sin({f}·x + {φ})
  - A: 0-2, step 0.1, default 1.0
  - f: 0.1-10, step 0.1, default 2.0
  - φ: 0-6.28, step 0.01, default 0
```

---

### OUTPUT COMPONENTS

#### `label` — Static Text
Displays text (headings, body, status messages).

| Property | Type | Description |
|----------|------|-------------|
| content | string | Text content |
| variant | string | 'heading', 'body', 'status' |
| level | number | Heading level 1-6 (if heading) |
| status | string | 'info', 'success', 'warning', 'error' (if status) |

**Syntax:** `['label', 'text content', { variant, level, key }]`

**Example:**
```
label: "Section Title" — heading level 3
label: "Operation complete!" — status success
```

---

#### `value` — Dynamic Value Display
Shows a labeled value with optional unit.

| Property | Type | Description |
|----------|------|-------------|
| value | any | Value to display |
| label | string | Label text |
| unit | string | Unit suffix |

**Syntax:** `['value', initialValue, { label, unit, key }]`

**Example:**
```
value: Frame Rate, unit fps — displays "Frame Rate: 60 fps"
value: Position, unit px — displays "Position: 120 px"
```

---

#### `progress` — Progress Bar
A horizontal bar showing progress 0-100%.

| Property | Type | Description |
|----------|------|-------------|
| label | string | Label text |
| value | number | Progress 0-100 |
| indeterminate | boolean | Animated loading state |

**Syntax:** `['progress', 'Label', value, { indeterminate, key }]`

**Example:**
```
progress: Loading, default 0 — shows progress bar
progress: Processing, indeterminate — shows animated loading
```

---

### CONTAINER COMPONENTS (Advanced)

#### `section` — Collapsible Section
A container with a header that can collapse/expand.

**When to use:** Group related controls under a collapsible header.

---

#### `grid` — Grid Layout
Arranges child elements in a grid.

| Property | Type | Description |
|----------|------|-------------|
| columns | number | Number of columns |
| gap | number | Gap between items (F-units) |

**When to use:** Arrange multiple small items (buttons, swatches) in a grid.

---

## Quick Component Summary

| Type | Purpose | Key Options |
|------|---------|-------------|
| `slider` | Continuous numeric | min, max, step, withNumber |
| `number` | Precise numeric entry | min, max, step, precision |
| `stepper` | Integer with +/- | min, max, step |
| `text` | Single-line text | placeholder |
| `textarea` | Multi-line text | rows, placeholder |
| `dropdown` | Select from list | options, value |
| `radio` | Single select | items, selectedValue |
| `toggle` | Multi select | items, selectedValues |
| `color` | Color picker | showHex, swatches |
| `file` | File upload | accept, multiple |
| `button` | Action trigger | (wire in onInit) |
| `equation` | Interactive formula | template, params |
| `label` | Static text | variant, level |
| `value` | Dynamic display | label, unit |
| `progress` | Progress bar | indeterminate |

---

## Standard Tab Names

Use these UPPERCASE tab names for consistency:

| Tab | When to Use | Typical Contents |
|-----|-------------|------------------|
| `CONTROLS` | Always | Primary parameters, core inputs |
| `STYLE` | Visual tools | Colors, stroke, fill, appearance |
| `CANVAS` | Visual tools | Size, resolution, display mode |
| `ANIMATION` | Animated tools | Play/pause, FPS, loop, frame export |
| `AUDIO` | Audio tools | Play/stop, volume, waveform |
| `PRESETS` | Complex tools | Save/load configurations |
| `INFO` | Documentation | Help text, formulas, credits |

---

## Standard Block Names

Use these Title Case block names:

| Block | When to Use | Typical Contents |
|-------|-------------|------------------|
| `Parameters` | Always | Core adjustable values |
| `Shape` | Geometry tools | Points, radius, dimensions |
| `Style` | Visual tools | Colors, stroke width, fill |
| `Canvas` | Visual tools | Width, height, display mode |
| `Export` | All tools | Download PNG, SVG, etc. |
| `Playback` | Animated tools | Play, pause, FPS, loop |
| `Audio` | Audio tools | Play, stop, volume |
| `Source` | File processing | File upload, clear |
| `Output` | Data tools | Result displays, values |
| `Options` | Various | Toggle options, modes |

---

## Sizing Guidelines

Use F-unit multiples where applicable:

| Size | F-Multiple | Use For |
|------|------------|---------|
| 14px | 1F | Small gaps, fine detail |
| 28px | 2F | Control height, small spacing |
| 56px | 4F | Section gaps |
| 112px | 8F | Large panels |
| 420px | 30F | Default canvas |

Canvas sizes should be F-multiples: 196, 280, 392, 420, 560, 784, 840...

---

## Checklist Before Submitting

- [ ] Purpose is clear in one sentence
- [ ] Output type is identified
- [ ] All parameters have type, range, default, purpose
- [ ] Parameters are grouped logically
- [ ] Tab and block names use standard vocabulary
- [ ] Button actions are described
- [ ] Canvas content is specified
- [ ] Similar existing tools are noted (if any)

---

## Example: Minimal Tool Design

```markdown
# Circle Generator

## 1. Overview

**Purpose:** Generate concentric circle patterns with customizable colors and spacing.
**Output Type:** Static Image
**Target User:** Designers, artists

## 2. Parameters

### Core Parameters

| Parameter | Type | Range | Default | Step | Purpose |
|-----------|------|-------|---------|------|---------|
| Ring Count | slider | 1-50 | 10 | 1 | Number of concentric rings |
| Spacing | slider | 5-100 | 20 | 1 | Pixels between rings |
| Stroke Width | slider | 1-20 | 2 | 0.5 | Line thickness |

### Appearance

| Parameter | Type | Options/Range | Default | Purpose |
|-----------|------|---------------|---------|---------|
| Stroke Color | color | — | #FFFFFF | Ring line color |
| Background | color | — | #000000 | Canvas background |
| Alternate Colors | toggle | [Enabled] | [] | Alternate between two colors |

## 3. Controls Layout

### Tab: CONTROLS

**Block: Rings**
- slider: Ring Count — number of circles
- slider: Spacing — distance between rings
- slider: Stroke Width — line thickness

**Block: Colors**
- color: Stroke — ring color
- color: Background — canvas fill
- toggle: Options — [Alternate Colors]

### Tab: CANVAS

**Block: Size**
- slider: Width — canvas width (14-2048)
- slider: Height — canvas height (14-2048)

**Block: Export**
- button: Download PNG — save as image
- button: Download SVG — save as vector

## 4. Interactions

### Parameter Effects

| When | Then |
|------|------|
| Ring Count changes | Redraw with new number of rings |
| Spacing changes | Adjust distance between rings |
| Alternate Colors enabled | Use stroke color for odd rings, background for even |

### Button Actions

| Button | Action |
|--------|--------|
| Download PNG | Export canvas as PNG file |
| Download SVG | Generate and download SVG |

## 5. Canvas Specification

**Content:** Concentric circles from center
**Coordinate System:** Origin at canvas center
**Default Size:** 420 × 420 px
**Background:** Background color parameter

### Visual Elements

- Rings: Drawn as stroked circles, innermost first
- Spacing calculated from center outward

## 6. Algorithm Notes

- Rings drawn from smallest to largest
- Each ring radius = ringIndex × spacing
- Stop when radius exceeds canvas diagonal / 2

## 7. Similar Tools

- None in current library

## 8. Future Extensions

- Gradient fill between rings
- Animation: pulsing rings
- Multiple center points
```

---

## File Locations

When your design is implemented, files go here:

```
SiteBoy/
├── blog/
│   └── docs/
│       └── pages/
│           ├── tools/
│           │   └── my-tool.md       ← DESIGN DOCUMENT
│           └── art/generative/
│               └── my-animation.md  ← DESIGN DOCUMENT
│
├── assets/
│   └── js/
│       └── tools/
│           └── my-tool.js           ← IMPLEMENTATION
│
├── index.html                        ← SCRIPT REGISTRATION
│
└── assets/
    └── js/
        └── sections/
            └── tools_section.js      ← ROUTING (4 places)
```

### Implementation Steps

After design is approved:

1. **Design document** → `blog/docs/pages/tools/{tool-name}.md`
2. **Implementation** → `assets/js/tools/{tool-name}.js`
3. **Script tag** → `index.html` (after tool-base.js)
4. **Routing** → `tools_section.js` (4 places: pages, toolsSections, allTools, renderTool)

See `blog/docs/guides/tools/tool-build-guide.md` for detailed registration steps.

---

## Common Mistakes to Avoid

| Mistake | Correct Approach |
|---------|------------------|
| Vague parameter purposes | Be specific: "Controls X by doing Y" |
| Missing defaults | Every parameter needs a sensible default |
| Unbounded ranges | All numeric inputs need min/max |
| Undefined button actions | Describe exactly what each button does |
| Forgetting canvas export | All visual tools need PNG export at minimum |
| Skipping animation controls | Animated tools MUST have play/pause, FPS |
| Missing output type | Always specify: static, animation, audio, data |

---

End of Page Design Guide.

