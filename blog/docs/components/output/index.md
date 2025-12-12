# Output Components

Components for displaying values and status.

## Text / Label

Display text content.

### Syntax
```javascript
['label', content, config]
```

### Config

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| variant | string | 'body' | 'heading', 'body', 'status' |
| level | number | 3 | Heading level (1-6) |
| status | string | | 'success', 'error', 'warning' |

### Examples

```javascript
// Heading
['label', 'Section Title', { variant: 'heading', level: 3 }]

// Body text
['label', 'Descriptive text here.', { variant: 'body' }]

// Status message
['label', 'Operation complete!', { variant: 'status', status: 'success' }]
```

---

## Value Display

Display a labeled value with unit.

### Syntax
```javascript
['value', value, config]
```

### Config

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| label | string | | Value label |
| unit | string | | Unit suffix |

### Example
```javascript
['value', '60', { label: 'Frame Rate', unit: 'fps' }]
// Displays: Frame Rate: 60 fps
```

---

## Progress Bar

Animated progress indicator.

### Syntax
```javascript
['progress', label, initialValue, config]
```

### Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| label | string | ✓ | Progress label |
| initialValue | number | 0 | Initial percentage (0-100) |
| config | object | | Additional config |

### Config

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| showLabel | boolean | true | Show percentage |
| key | string | auto | For programmatic updates |

### Example
```javascript
['progress', 'Rendering', 0, { key: 'render_progress', showLabel: true }]
```

### Programmatic Update
```javascript
const progress = tool.getComponent('render_progress');
progress.setValue(75); // Set to 75%
```

---

## Canvas

The canvas is automatically created by ToolBase.

### Access
```javascript
const canvas = tool.getCanvas();
const ctx = tool.getContext();
```

### Draw Callback
```javascript
onDraw: (ctx, canvas, values) => {
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    // ... draw using values
}
```

### Manual Redraw
```javascript
tool.draw();
```

### Status Text
```javascript
tool.setStatus('Canvas: 420×420px | Frame: 123');
```

