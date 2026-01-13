# F-System — Layout Architecture

## Core Principle

**F = 14px** is the base unit for all dimensions.

Container dimensions derive from F. Children fill available space using F for spacing only.

## Standard Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--F` | 14px | Base unit, body text, standard gaps |
| `--F2` | 7px | Tight gaps, half-unit spacing |
| `--2F` | 28px | Control heights (buttons, inputs) |
| `--30F` | 420px | Sidebar width |

## Control Sizing

All interactive controls: **2F (28px) height**
- Buttons, inputs, selects, slider tracks
- Checkboxes/radios: F × F (14×14)

## Spacing

| Context | Size |
|---------|------|
| Between controls (same group) | F2 (7px) |
| Between sections | F (14px) |
| Container padding | F (14px) |

## Tool Page Layout

```
┌─────────────────────────────────────────────┐
│ CONTENT CONTAINER (100vw - margins)         │
│ ┌──────────────┬────────────────────────────┤
│ │ SIDEBAR      │ CANVAS AREA                │
│ │ width: 30F   │ flex: 1                    │
│ │ height: 100% │ centers canvas             │
│ │ scrolls      │                            │
│ └──────────────┴────────────────────────────┘
└─────────────────────────────────────────────┘
```

- Sidebar: Fixed 30F width, scrolls internally
- Canvas: Fills remaining space, content centered

## CSS Patterns

```css
/* Control height */
height: calc(var(--F) * 2);

/* Standard gap */
gap: var(--F);

/* Tight gap */
gap: calc(var(--F) / 2);

/* Container padding */
padding: var(--F);

/* Fill available */
width: 100%;
height: 100%;
flex: 1;
```

## Border Handling

1px borders with shared edges:
- Use negative margins: `margin: -1px 0 0 -1px`
- Or grid with `gap: 0`, each cell owns its border
- Size adjustment: `nF - 1px` only when mathematically required

## Canvas Sizing

### Fit Mode (default)
Canvas scales to fit container, maintains aspect ratio, max 1:1.

### Actual Mode
Canvas displays at 1:1 pixels, scrollable if larger.

### Crisp Pixels
Integer scale factors for pixel-perfect rendering:
- 1:1 (100%), 1:2 (50%), 1:3 (33%), 1:4 (25%)...
- Uses `image-rendering: pixelated`

## Rules

1. Don't recalculate container size in components — they inherit from parent
2. Use `100%` and `flex: 1` for containers, not absolute F calculations
3. Reserve F calculations for: padding, margins, gaps, control heights
4. Sidebar width is constant (30F) — never recalculate
5. Canvas container never scrolls — canvas fits inside it

