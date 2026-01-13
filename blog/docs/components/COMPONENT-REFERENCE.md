# Component Reference — Complete API

For quick per-component summaries and paths, see `components/index.md` and linked category pages. This file is the definitive API.

This is the definitive reference for all Tool UI components.  
Each component has exact options, types, and examples.  
**NO INTERPRETATION REQUIRED** — follow this specification literally.

---

## How to Use This Document

1. Find the component you need by category
2. Copy the options structure exactly
3. Fill in your values
4. All dimensions use F-units (F=14px, F2=7px)

---

## Component Categories

| Category | Components |
|----------|------------|
| **INPUT** | NumericInput, TextInput, Button, Dropdown, Select, ToggleGroup, ColorInput, FileInput, EquationEditor |
| **OUTPUT** | Text, ProgressBar, Canvas, SVG, Media, AudioOutput |
| **CONTAINER** | Stack, Grid, Section, Tabs, Collection |

---

## TOOLBASE SHORTHAND MAPPING

When using `ToolBase`, use these shorthand type strings:

| Shorthand | Component Class | Notes |
|-----------|-----------------|-------|
| `'slider'` | NumericInput | `display: 'slider'` |
| `'number'` | NumericInput | `display: 'field'` |
| `'stepper'` | NumericInput | `showSteppers: true` |
| `'text'` | TextInput | Single line |
| `'textarea'` | TextInput | `multiline: true` |
| `'dropdown'` | Dropdown | Custom styled |
| `'select'` | Dropdown | Alias |
| `'toggle'` | ToggleGroup | Checkbox mode |
| `'radio'` | ToggleGroup | `exclusive: true` |
| `'checkbox'` | ToggleGroup | Alias for toggle |
| `'color'` | ColorInput | — |
| `'file'` | FileInput | — |
| `'button'` | Button | — |
| `'equation'` | EquationEditor | — |
| `'label'` | Text | variant: body/heading |
| `'value'` | Text | variant: value |
| `'progress'` | ProgressBar | — |
| `'section'` | Section | — |
| `'grid'` | Grid | — |

---

# INPUT COMPONENTS

---

## NumericInput

Numeric value input with slider, field, and/or steppers.

### Options

```javascript
{
    // VALUE
    value: 50,              // number — current value (REQUIRED)
    defaultValue: 50,       // number — reset value
    min: 0,                 // number — minimum (default: -Infinity)
    max: 100,               // number — maximum (default: Infinity)
    step: 1,                // number — increment (default: 1)
    
    // DISPLAY MODE
    display: 'both',        // 'slider' | 'field' | 'both' (default: 'both')
    showSteppers: false,    // boolean — show +/- buttons
    logarithmic: false,     // boolean — log scale slider
    
    // LABELS
    label: 'Volume',        // string — label text
    unit: '%',              // string — unit suffix
    precision: 0,           // number — decimal places (auto-inferred from step)
    
    // WIDTH
    fieldWidth: 4,          // number — field width in F units (auto-calculated)
    
    // EVENTS
    onChange: (v) => {},    // function(value) — on commit
    onInput: (v) => {},     // function(value) — on drag (continuous)
}
```

### ToolBase Usage

```javascript
// Slider only
['slider', 'Volume', 0, 100, 1, { value: 50, unit: '%' }]

// Number field only
['number', 'Frequency', 0.1, 10, 0.1, { value: 2.5, precision: 1 }]

// With steppers
['stepper', 'Sides', 3, 12, 1, { value: 6, withNumber: true }]

// Slider + number field (default)
['slider', 'Scale', 10, 200, 1, { value: 100, withNumber: true }]
```

### Direct Usage

```javascript
const numeric = new NumericInput({
    label: 'Scale',
    value: 100,
    min: 10,
    max: 200,
    step: 1,
    display: 'both',
    unit: '%',
    onChange: (val) => console.log(val)
}, deps);
container.appendChild(numeric.render());
```

---

## TextInput

Text input (single line or multiline).

### Options

```javascript
{
    value: '',              // string — current text
    placeholder: '',        // string — placeholder
    label: '',              // string — label
    multiline: false,       // boolean — textarea mode
    rows: 4,                // number — textarea rows (if multiline)
    maxLength: null,        // number — character limit
    pattern: null,          // string — regex pattern
    disabled: false,        // boolean
    
    onChange: (v) => {},    // function(value) — on blur/enter
    onInput: (v) => {},     // function(value) — on each keystroke
}
```

### ToolBase Usage

```javascript
// Single line
['text', 'Name', '', { placeholder: 'Enter name...' }]

// Multiline
['textarea', 'Description', '', { placeholder: 'Enter description...', rows: 5 }]
```

---

## Button

Single button or button group.

### Options (Single Button)

```javascript
{
    text: 'Submit',         // string — button text (REQUIRED)
    icon: '▶',              // string — icon character
    title: 'Click me',      // string — tooltip
    disabled: false,        // boolean
    
    // SIZING
    size: 'm',              // 's' | 'm' | 'l' — height (1.5F | 2F | 3F)
    fill: false,            // boolean — full width
    
    onClick: () => {},      // function — click handler
}
```

### Options (Button Group)

```javascript
{
    buttons: [              // array — button definitions (REQUIRED for group)
        { text: 'A', value: 'a' },
        { text: 'B', value: 'b' },
        { text: 'C', value: 'c' }
    ],
    mode: 'action',         // 'action' | 'toggle' | 'radio'
                            // action: independent clicks
                            // toggle: multi-select (stay pressed)
                            // radio: single select
    layout: 'row',          // 'row' | 'column' | 'grid'
    columns: 3,             // number — grid columns (if layout:'grid')
    
    activeValue: null,      // any — selected value (radio mode)
    activeValues: [],       // array — selected values (toggle mode)
    
    onSelect: (v) => {},    // function(value) or function(value, isActive)
}
```

### ToolBase Usage

```javascript
// Single button
['button', 'Process', () => doSomething()]

// Button group would need direct instantiation
```

---

## Dropdown

Custom-styled dropdown (replaces native select).

### Options

```javascript
{
    options: [              // array — dropdown items (REQUIRED)
        { value: 'opt1', label: 'Option One' },
        { value: 'opt2', label: 'Option Two' },
        // OR simple strings:
        'Option One', 'Option Two'
    ],
    value: 'opt1',          // any — selected value
    label: 'Mode',          // string — label
    placeholder: 'Select...', // string
    disabled: false,        // boolean
    
    onChange: (v) => {},    // function(value)
}
```

### ToolBase Usage

```javascript
['dropdown', 'Wave Type', ['Sine', 'Square', 'Triangle'], { value: 'Sine' }]

// With objects
['dropdown', 'Mode', [
    { value: 'fast', label: 'Fast Mode' },
    { value: 'slow', label: 'Slow Mode' }
], { value: 'fast' }]
```

---

## Select

Native HTML select (fallback, prefer Dropdown).

### Options

```javascript
{
    options: [],            // array — same as Dropdown
    value: '',              // any
    label: '',              // string
    placeholder: '',        // string
    disabled: false,        // boolean
    searchable: false,      // boolean — not implemented
    
    onChange: (v) => {},    // function(value)
}
```

---

## ToggleGroup

Checkboxes or radio buttons.

### Options

```javascript
{
    items: [                // array — options (REQUIRED)
        { value: 'grid', label: 'Show Grid' },
        { value: 'axes', label: 'Show Axes' },
        // OR simple strings:
        'Show Grid', 'Show Axes'
    ],
    layout: 'list',         // 'list' | 'row' — vertical or horizontal
    exclusive: false,       // boolean — radio mode (single select)
    label: 'Display',       // string — group label
    
    // STATE
    selectedValues: [],     // array — checked values (checkbox mode)
    selectedValue: null,    // any — checked value (radio mode)
    
    onChange: (v) => {},    // function(value) or function([values])
}
```

### ToolBase Usage

```javascript
// Checkboxes (multi-select)
['toggle', 'Options', ['Show Grid', 'Animate', 'Fill'], { selectedValues: ['Animate'] }]

// Radio buttons (single-select)
['radio', 'Mode', ['Fast', 'Normal', 'Slow'], { selectedValue: 'Normal' }]
```

---

## ColorInput

Color picker with optional hex input and swatches.

### Options

```javascript
{
    value: '#000000',       // string — hex color (REQUIRED)
    label: 'Color',         // string
    showHex: true,          // boolean — show hex text input
    swatches: null,         // array of hex strings — preset swatches
    
    onChange: (v) => {},    // function(hexValue)
}
```

### ToolBase Usage

```javascript
['color', 'Wave Color', '#FF0000', { showHex: true }]

// With swatches
['color', 'Palette', '#000000', { 
    swatches: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'] 
}]
```

---

## FileInput

File picker with styled button.

### Options

```javascript
{
    label: 'Upload',        // string — label
    accept: '*/*',          // string — MIME type filter
    multiple: false,        // boolean — allow multiple files
    buttonText: 'Browse...', // string — button text
    
    onChange: (f) => {},    // function(File) or function(FileList)
}
```

### ToolBase Usage

```javascript
['file', 'Upload Image', 'image/*', { buttonText: 'Choose...' }]

// Multiple files
['file', 'Upload Files', '*/*', { multiple: true }]
```

---

## EquationEditor

Interactive equation with editable inline values.

### Options

```javascript
{
    template: 'y = {A}·sin({f}·x + {φ})',  // string — equation with {param} placeholders
    params: {                              // object — parameter definitions
        A: { value: 1.0, min: 0, max: 2, step: 0.1, precision: 1 },
        f: { value: 2.0, min: 0.1, max: 10, step: 0.1, precision: 1 },
        φ: { value: 0, min: 0, max: 6.28, step: 0.01, precision: 2 }
    },
    
    onChange: (name, val, allVals) => {},  // function(paramName, newValue, allValues)
}
```

### ToolBase Usage

```javascript
['equation', 'y = {A}·sin({f}·x + {φ})', {
    A: { value: 1.0, min: 0, max: 2, step: 0.1, precision: 1 },
    f: { value: 2.0, min: 0.1, max: 10, step: 0.1, precision: 1 },
    φ: { value: 0, min: 0, max: 6.28, step: 0.01, precision: 2 }
}]
```

---

# OUTPUT COMPONENTS

---

## Text

Text display (heading, body, status, or value).

### Options

```javascript
{
    variant: 'body',        // 'heading' | 'body' | 'status' | 'value'
    content: '',            // string — text content
    
    // HEADING
    level: 2,               // number 1-6 — heading level (if variant:'heading')
    
    // STATUS
    statusType: 'info',     // 'info' | 'success' | 'warning' | 'error'
    
    // VALUE
    label: 'FPS',           // string — label (if variant:'value')
    value: 60,              // any — value to display
    unit: 'fps',            // string — unit suffix
    precision: 2,           // number — decimal places for numbers
}
```

### ToolBase Usage

```javascript
// Heading
['label', 'Section Title', { variant: 'heading', level: 3 }]

// Body text
['label', 'This is a paragraph of text.', { variant: 'body' }]

// Status message
['label', 'Success!', { variant: 'status', status: 'success' }]

// Value display
['value', '60', { label: 'Frame Rate', unit: 'fps' }]
```

---

## ProgressBar

Progress indicator.

### Options

```javascript
{
    value: 0,               // number 0-100 (REQUIRED)
    label: 'Loading',       // string — label
    showLabel: true,        // boolean — show percentage
    indeterminate: false,   // boolean — animated loading state
    format: (v) => `${v}%`, // function — custom label format
}
```

### ToolBase Usage

```javascript
['progress', 'Loading', 65]

// Indeterminate
['progress', 'Processing', 0, { indeterminate: true }]
```

### Methods

```javascript
progressBar.setValue(50);           // Update value
progressBar.setIndeterminate(true); // Enable indeterminate
progressBar.complete();             // Set to 100%
progressBar.reset();                // Set to 0%
```

---

## Canvas

2D or WebGL canvas.

### Options

```javascript
{
    // CONTEXT
    context: '2d',          // '2d' | 'webgl'
    
    // SIZING
    width: 400,             // number — pixels
    height: 400,            // number — pixels
    aspectRatio: null,      // number — if set, height = width/aspectRatio
    
    // RENDERING
    draw: (ctx, w, h) => {},  // function — render function
    
    // INTERACTION
    interactive: false,     // boolean — enable mouse events
    onClick: (x, y, e) => {},     // function — click handler
    onDrag: (x, y, dx, dy, e) => {},  // function — drag handler
    onWheel: (delta, e) => {},        // function — scroll handler
    
    // HUD OVERLAYS
    hud: [                  // array — overlay Text configs
        { label: 'FPS', value: 60, anchor: 'top-left' }
    ],
}
```

### Methods

```javascript
canvas.redraw();                    // Call draw function
canvas.clear();                     // Clear canvas
canvas.resize(800, 600);            // Resize
canvas.getContext();                // Get ctx
canvas.getCanvas();                 // Get canvas element
canvas.getImageData();              // Get pixel data
canvas.toDataURL();                 // Get base64
canvas.download('image.png');       // Download as file
canvas.updateHUD(0, 120);           // Update HUD value
```

---

## SVG

SVG display and manipulation.

### Options

```javascript
{
    width: '100%',          // string | number
    height: '400px',        // string | number
    viewBox: '0 0 100 100', // string
    preserveAspectRatio: 'xMidYMid meet', // string
    
    content: '',            // string — SVG inner HTML
    generator: (svg) => {}, // function — programmatic SVG creation
    
    interactive: false,     // boolean
    onClick: (el, e) => {}, // function — element click
    
    downloadable: false,    // boolean
    filename: 'image',      // string — download filename
}
```

### Methods

```javascript
svg.setContent('<circle cx="50" cy="50" r="40"/>');
svg.setViewBox('0 0 200 200');
svg.clear();
svg.getSVGElement();
svg.getSVGString();
svg.downloadSVG('shape');
svg.downloadPNG('shape', 2); // scale factor
```

---

## Media

Image, video, or audio display.

### Options

```javascript
{
    type: 'image',          // 'image' | 'video' | 'audio'
    src: '',                // string — URL (REQUIRED)
    alt: '',                // string — alt text (image)
    caption: '',            // string — caption
    
    // VIDEO/AUDIO
    controls: true,         // boolean
    autoplay: false,        // boolean
    loop: false,            // boolean
    muted: false,           // boolean
    
    // IMAGE
    zoomable: false,        // boolean — click to lightbox
    
    onLoad: () => {},       // function
    onError: () => {},      // function
}
```

### Methods

```javascript
media.setSrc('new-url.jpg');
media.play();               // video/audio
media.pause();              // video/audio
media.getMediaElement();
```

---

## AudioOutput

Web Audio oscillator (no visible UI).

### Options

```javascript
{
    frequencies: [440],     // array — Hz values
    waveform: 'sine',       // 'sine' | 'square' | 'sawtooth' | 'triangle'
    gain: 0.3,              // number 0-1
}
```

### Methods

```javascript
audio.play();
audio.stop();
audio.setFrequencies([440, 880]);
audio.addFrequency(660);
audio.removeFrequency(880);
audio.setGain(0.5);
audio.setWaveform('triangle');
audio.getFrequencies();
audio.isActive();
```

---

# CONTAINER COMPONENTS

---

## Stack

Vertical or horizontal container.

### Options

```javascript
{
    direction: 'column',    // 'row' | 'column'
    gap: 1,                 // number — gap in F units
    align: 'stretch',       // 'start' | 'center' | 'end' | 'stretch'
    padding: 0,             // number — padding in F units
    
    children: [],           // array — child components
}
```

### Methods

```javascript
stack.addChild(component);
stack.clear();
```

---

## Grid

Grid or flex container.

### Options

```javascript
{
    mode: 'grid',           // 'grid' | 'flex'
    
    // GRID MODE
    columns: 2,             // number — column count
    rows: null,             // number — row count (auto if null)
    gap: 1,                 // number — gap in F units
    sharedBorders: false,   // boolean — collapse borders between items
    
    // FLEX MODE
    direction: 'row',       // 'row' | 'column'
    wrap: true,             // boolean
    justify: 'start',       // 'start' | 'center' | 'end' | 'between' | 'around'
    align: 'start',         // 'start' | 'center' | 'end' | 'stretch'
    
    children: [],           // array — child components
}
```

### Methods

```javascript
grid.addChild(component, index);
grid.removeChild(index);
grid.clear();
grid.setColumns(4);
```

---

## Section

Collapsible section container.

### Options

```javascript
{
    title: 'Section',       // string (REQUIRED)
    collapsible: true,      // boolean
    collapsed: false,       // boolean — initial state
    storageKey: null,       // string — localStorage key for persistence
    
    children: [],           // array — child components
}
```

### Methods

```javascript
section.toggle();
section.expand();
section.collapse();
section.addChild(component);
section.setTitle('New Title');
section.clear();
```

---

## Tabs

Tabbed container.

### Options

```javascript
{
    tabs: [                 // array — tab definitions (REQUIRED)
        { 
            id: 'tab1',     // any — unique ID
            label: 'Tab 1', // string — tab button text
            content: element // Component or HTMLElement
        },
        { id: 'tab2', label: 'Tab 2', content: anotherElement }
    ],
    activeTab: 'tab1',      // any — initially active tab ID
    storageKey: null,       // string — localStorage key
    
    onTabChange: (id) => {}, // function(tabId)
}
```

### Methods

```javascript
tabs.setActiveTab('tab2');
tabs.getActiveTab();
tabs.addTab({ id: 'new', label: 'New', content: element });
```

---

## Collection

List, grid, or carousel of items.

### Options

```javascript
{
    items: [                // array — item data (REQUIRED)
        { id: 1, label: 'Item 1', color: '#FF0000' },
        { id: 2, label: 'Item 2', thumbnail: 'url.jpg' }
    ],
    
    layout: 'list',         // 'list' | 'grid' | 'carousel'
    columns: 4,             // number — grid columns
    gap: 0.5,               // number — gap in F units
    
    // ITEM RENDERING
    itemSize: null,         // number — size in F units (auto if null)
    itemType: 'text',       // 'text' | 'swatch' | 'thumbnail'
    itemRenderer: null,     // function(item, deps) => Element (custom)
    
    // SELECTION
    selectable: false,      // boolean
    multiSelect: false,     // boolean
    selectedIds: [],        // array
    
    // ACTIONS
    removable: false,       // boolean — show remove buttons
    draggable: false,       // boolean — drag to reorder (not implemented)
    
    onSelect: (id) => {},   // function(id) or function([ids])
    onRemove: (item, id) => {}, // function
    onReorder: (items) => {},   // function
}
```

### Methods

```javascript
collection.setItems([...]);
collection.addItem({ id: 3, label: 'New' });
collection.removeItem(2);
collection.getSelectedItems();
collection.setSelection([1, 3]);
collection.clearSelection();
collection.clear();
```

---

# COMPLETE TOOLBASE EXAMPLE

```javascript
const TOOL_CONFIG = {
    title: 'Wave Generator',
    
    sidebar: [
        ['CONTROLS', [
            ['Wave Parameters', [
                ['slider', 'Amplitude', 0, 100, 1, { value: 50, unit: '%' }],
                ['slider', 'Frequency', 0.1, 10, 0.1, { value: 2, precision: 1, withNumber: true }],
                ['dropdown', 'Wave Type', ['Sine', 'Square', 'Triangle'], { value: 'Sine' }],
                ['color', 'Wave Color', '#FF5500'],
            ]],
            ['Display', [
                ['toggle', 'Show', ['Grid', 'Axes', 'Labels']],
            ]],
        ]],
        ['OUTPUT', [
            ['Status', [
                ['value', '60', { label: 'FPS', unit: 'fps' }],
                ['progress', 'Render', 0, { key: 'render_progress' }],
            ]],
        ]],
    ],
    
    canvas: { size: 420 },
    
    onInit: function(values) {
        console.log('Initialized:', values);
    },
    
    onUpdate: function(key, value, all) {
        console.log(`${key} = ${value}`);
    },
    
    onDraw: function(ctx, canvas, values) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // ... draw wave ...
    }
};

const tool = new window.ToolBase(TOOL_CONFIG, deps);
tool.mount(container);
```

---

# COMPONENT LIBRARY ACCESS

Components are available via:

```javascript
// From ComponentLibrary (when loaded via index.html)
window.ComponentLibrary.ToolNumericInput
window.ComponentLibrary.ToolDropdown
window.ComponentLibrary.ToolButton
// etc.

// In ToolBase, components are instantiated automatically from config
```

---

# F-SYSTEM REFERENCE

| Token | Value | Usage |
|-------|-------|-------|
| `F` | 14px | Base unit, component height |
| `F2` | 7px | Half unit, gaps, padding |
| `2F` | 28px | Large controls, headings |
| `3F` | 42px | Extra large |
| `4F` | 56px | Headers |
| `30F` | 420px | Default sidebar width |
| `42F` | 588px | Default canvas size |

All dimensions MUST be F-multiples. Exception: `-1px` for shared borders.

---

End of Component Reference.

