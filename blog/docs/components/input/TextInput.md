# TextInput

Single-line or multiline text entry.

## Modes
- `multiline: false` — input
- `multiline: true` — textarea

## Options
- `label` (string)
- `value` (string)
- `placeholder` (string)
- `multiline` (bool, default false)
- `rows` (number, default 4 for textarea)
- `maxLength` (number | null)
- `pattern` (string | null)
- `disabled` (bool)
- `key` (string, auto)
- Events: `onInput(value)`, `onChange(value)`

## Notes
- Full-width; uses F/F2 spacing.
- Inherits `getValue/setValue/clear`.

