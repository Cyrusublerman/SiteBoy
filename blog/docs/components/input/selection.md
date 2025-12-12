# Selection Components

Components for selecting from options.

## Dropdown

Styled dropdown menu.

### Syntax
```javascript
['dropdown', label, options, config]
```

### Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| label | string | ✓ | Display label |
| options | array | ✓ | Options list |
| config | object | | Additional config |

### Options Array Formats

```javascript
// Simple strings
['Option 1', 'Option 2', 'Option 3']

// Value/label pairs
[
    { value: 'opt1', label: 'Option One' },
    { value: 'opt2', label: 'Option Two' },
]
```

### Config

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| value | string | first | Initially selected value |
| key | string | auto | Value access key |

### Example
```javascript
['dropdown', 'Wave Type', [
    { value: 'sine', label: 'Sine Wave' },
    { value: 'square', label: 'Square Wave' },
    { value: 'triangle', label: 'Triangle' },
], { value: 'sine' }]
// values.wave_type → 'sine' | 'square' | 'triangle'
```

---

## Toggle Group

Checkbox or radio button group.

### Syntax
```javascript
['toggle', label, items, config]
```

### Aliases
- `toggle` - Multi-select checkboxes (default)
- `radio` - Single-select radio buttons
- `checkbox` - Same as toggle

### Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| label | string | ✓ | Group label |
| items | array | ✓ | Option labels |
| config | object | | Additional config |

### Config

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| mode | string | 'checkbox' | 'checkbox' or 'radio' |
| layout | string | 'list' | 'list' or 'row' |
| key | string | auto | Value access key |

### Examples

```javascript
// Checkboxes (multiple selection)
['toggle', 'Display', ['Grid', 'Axes', 'Labels']]
// values.display → ['Grid', 'Labels'] (array of selected)

// Radio buttons (single selection)
['radio', 'Mode', ['Normal', 'Inverted', 'Both'], { mode: 'radio' }]
// values.mode → 'Normal' (string)
```

## Value Types

| Component | Value Type | Example |
|-----------|-----------|---------|
| dropdown | string | `'sine'` |
| toggle/checkbox | string[] | `['Grid', 'Labels']` |
| radio | string | `'Normal'` |

