# NumericInput

Numeric value input with slider, number field, and/or steppers.

## Aliases
- `slider` - Slider (optionally with number field)
- `number` - Number field only
- `stepper` - Number field with +/- buttons

## Syntax

```javascript
['slider', label, min, max, step, options]
```

## Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| label | string | ✓ | Display label |
| min | number | ✓ | Minimum value |
| max | number | ✓ | Maximum value |
| step | number | ✓ | Increment amount |
| options | object | | Additional config |

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| value | number | min | Initial value |
| withNumber | boolean | false | Show number field with slider |
| withStepper | boolean | false | Show +/- buttons |
| precision | number | auto | Decimal places |
| key | string | auto | Value access key |
| unit | string | '' | Unit label (e.g., 'px', 'Hz') |

## Examples

### Slider Only
```javascript
['slider', 'Opacity', 0, 100, 1]
// values.opacity → number
```

### Slider + Number Field
```javascript
['slider', 'Size', 10, 500, 1, { value: 100, withNumber: true }]
// values.size → number
```

### With Steppers
```javascript
['stepper', 'Count', 1, 10, 1, { value: 5, withNumber: true, withStepper: true }]
// values.count → number
```

### Float Precision
```javascript
['slider', 'Frequency', 0.1, 10.0, 0.1, { value: 2.0, precision: 1 }]
// values.frequency → 2.0, 2.1, 2.2, ...
```

## Value Access

```javascript
onUpdate: (key, value) => {
    if (key === 'opacity') {
        ctx.globalAlpha = value / 100;
    }
}
```

## Notes

- Precision auto-inferred from step if not specified
- Field width auto-calculated from min/max range
- Slider uses `flex: 1` to fill available space

