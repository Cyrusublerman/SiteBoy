# Component Reference

All UI components for tool pages.

## Categories

| Category | Components |
|----------|------------|
| [Input](./input/) | slider, stepper, text, dropdown, toggle, color, file, button, equation |
| [Output](./output/) | label, value, progress |
| [Container](./container/) | Grid, Stack, Section |

## Quick Syntax Reference

### Input Components

```javascript
// Numeric
['slider', 'Label', min, max, step, { value, withNumber, precision }]
['stepper', 'Label', min, max, step, { value, withNumber, withStepper }]

// Text
['text', 'Label', defaultValue, { placeholder, multiline }]

// Selection
['dropdown', 'Label', [{value, label}], { value }]
['toggle', 'Label', ['Item1', 'Item2'], { mode: 'checkbox'|'radio' }]

// Other
['color', 'Label', '#default', { showHex }]
['file', 'Label', 'accept/*', { buttonText }]
['button', 'Text', onClick, { size }]
['equation', 'template', { param: {value, min, max, step} }]
```

### Output Components

```javascript
['label', 'Content', { variant: 'heading'|'body'|'status' }]
['value', 'Value', { label, unit }]
['progress', 'Label', initialValue, { showLabel }]
```

## Auto-Generated Keys

Labels become value keys:
- `'My Label'` → `values.my_label`
- `'Frequency (Hz)'` → `values.frequency__hz_`

Override: `{ key: 'custom' }`

## Value Types

| Component | Value Type |
|-----------|-----------|
| slider/stepper | `number` |
| text | `string` |
| dropdown | `string` (selected value) |
| toggle | `string[]` (checked items) |
| color | `string` (hex: '#RRGGBB') |
| file | `File` object |
| equation | `object` ({ param: value }) |

