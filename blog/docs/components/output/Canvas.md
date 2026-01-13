# Canvas

ToolBase-managed canvas access.

## Usage
- Get canvas via ToolBase: `const canvas = tool.getCanvas(); const ctx = tool.getContext();`
- ToolBase injects size/status controls; no inline sizing.

## Notes
- Value is not stored; drawing occurs in `onDraw(ctx, canvas, values)`.
- Status text via `tool.setStatus(...)`.

