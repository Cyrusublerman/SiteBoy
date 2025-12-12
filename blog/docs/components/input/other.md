# Other Input Components

Color picker, file upload, buttons.

## Color Input

Color picker with optional hex field.

### Syntax
```javascript
['color', label, defaultColor, config]
```

### Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| label | string | ✓ | Display label |
| defaultColor | string | | Initial hex color |
| config | object | | Additional config |

### Config

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| value | string | '#000000' | Initial color |
| showHex | boolean | true | Show hex input field |
| key | string | auto | Value access key |

### Example
```javascript
['color', 'Background', '#1a1a2e', { showHex: true }]
// values.background → '#1a1a2e'
```

---

## File Input

File upload button.

### Syntax
```javascript
['file', label, accept, config]
```

### Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| label | string | ✓ | Display label |
| accept | string | '*/*' | MIME types |
| config | object | | Additional config |

### Config

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| buttonText | string | 'Choose...' | Button label |
| multiple | boolean | false | Allow multiple files |
| key | string | auto | Value access key |

### Accept Examples
```javascript
'image/*'           // Any image
'image/png'         // PNG only
'image/png,image/jpeg'  // PNG or JPEG
'.json'             // JSON files
'audio/*'           // Any audio
```

### Example
```javascript
['file', 'Source Image', 'image/*', { buttonText: 'Upload' }]
// values.source_image → File object
```

---

## Button

Action button (no value, just onClick).

### Syntax
```javascript
['button', text, onClick, config]
```

### Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| text | string | ✓ | Button text |
| onClick | function | ✓ | Click handler |
| config | object | | Additional config |

### Config

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| size | string | 'm' | 's', 'm', or 'l' |
| disabled | boolean | false | Disable button |

### Example
```javascript
['button', 'Reset', () => tool.reset(), { size: 'm' }]
['button', 'Export PNG', () => savePNG()]
```

---

## Equation Editor

Interactive equation with editable parameters.

### Syntax
```javascript
['equation', template, params, config]
```

### Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| template | string | ✓ | Equation template |
| params | object | ✓ | Parameter definitions |
| config | object | | Additional config |

### Template Format

Use `{name}` for editable parameters:
```javascript
'y = {A} × sin({f} × x + {φ})'
```

### Param Definition

```javascript
{
    A: { value: 1.0, min: 0, max: 2, step: 0.1, precision: 1 },
    f: { value: 2.0, min: 0.1, max: 10, step: 0.1, precision: 1 },
    φ: { value: 0, min: 0, max: 6.28, step: 0.01, precision: 2 },
}
```

### Example
```javascript
['equation', 'y = {A} × sin({ω}t)', {
    A: { value: 1, min: 0, max: 5, step: 0.1 },
    ω: { value: 1, min: 0.1, max: 10, step: 0.1 },
}]
// values.equation → { A: 1, ω: 1 }
```

