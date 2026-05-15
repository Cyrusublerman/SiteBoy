# ErrorPane — blocking error surface

## Role
Full-bleed inset overlay (`error-pane`): title (`--c-*` text), monospace detail, single dismiss calling `onDismiss` (typically hide ToolBase overlay).

## Constructor
| Field | Meaning |
|-------|---------|
| `title` | Uppercased headline. |
| `detail` | Body string (`err.message`). |
| `dismissLabel` | Default `DISMISS`. |
| `onDismiss()` | Runs after tear-down hook (ToolBase hides overlay). |

## Placement
Constructed by tools → `tool.showFloatingOverlay(pane)`. Must `.destroy()` with tool lifecycle.
