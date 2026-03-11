# ASCII Art Export Formatting Fix

## The Problem

**User reported:** HTML export doesn't match canvas formatting

**Root cause:** Canvas draws characters with **exact pixel positioning**, but exports were using **plain text formatting**.

## Technical Analysis

### Canvas Rendering (How It Works)

**Monospace Mode:**
```javascript
// Grid-based: x = col * charWidth, y = row * lineHeight
for (row, col) {
    ctx.fillText(char, offsetX + col * charWidth, offsetY + row * lineHeight);
}
```

**Proportional Mode:**
```javascript
// Position-based: each char has absolute {x, y} coords
for (row) {
    for (item in row) {
        ctx.fillText(item.char, offsetX + item.x, offsetY + item.y);
    }
}
```

### Old Export Behavior (BROKEN)

**Both modes used same plain text approach:**
```javascript
// Just joined characters into lines
for (row) {
    line = row.join('');  // ❌ Loses positioning for proportional!
}
```

**Result:** Proportional mode exported as `[object Object][object Object]...` because it tried to join objects.

## The Fix

### 1. Plain Text Export
Now handles both grid structures:
```javascript
function gridToPlainText(grid) {
    for (row in grid) {
        for (item in row) {
            // Handle both strings (monospace) and {char,x,y} objects (proportional)
            line += typeof item === 'string' ? item : item.char;
        }
    }
}
```

**Limitation:** Plain text can't preserve proportional spacing (no pixel positioning in .txt files)

### 2. HTML Export
Now uses different rendering based on font mode:

**Monospace Mode:**
```html
<pre style="font-size:14px; line-height:1.0; letter-spacing:0px;">
...grid text...
</pre>
```

**Proportional Mode:**
```html
<div class="container" style="position:relative; font-size:14px;">
    <span class="char" style="position:absolute; left:0px; top:14px;">A</span>
    <span class="char" style="position:absolute; left:12px; top:14px;">s</span>
    ...
</div>
```

**Result:** HTML now matches canvas pixel-perfect!

### 3. SVG Export
Same dual approach:

**Monospace:** Single `<text>` with `<tspan>` per line
**Proportional:** Individual `<text>` elements at exact positions

## Changes Made

### Files Modified
- `exportPlainText()` - Handle both string and object grids
- `gridToPlainText()` - Extract chars from both formats
- `exportHTML()` - Dual rendering (pre vs positioned spans)
- `exportHTMLWithName()` - Same dual rendering
- `exportSVGWithName()` - Dual rendering (tspan vs individual text)

### Behavior Changes
| Export Format | Monospace | Proportional |
|---------------|-----------|--------------|
| Plain Text | Perfect (grid-based) | **Approximation** (loses spacing) |
| HTML | Perfect (pre) | **Perfect** (absolute positioning) |
| SVG | Perfect (tspan) | **Perfect** (individual text) |
| PNG/Canvas | Perfect | Perfect |

## Known Limitations

**Plain Text (.txt) for Proportional Mode:**
- Cannot preserve exact spacing (no pixel positioning)
- Characters appear in sequence without gaps
- **Recommendation:** Use HTML or SVG for proportional mode exports

**Why this happens:** `.txt` files are character-based, not pixel-based. A proportional character at `x=123px` can't be represented in plain text without adding 123 spaces (which would break wrapping/viewing).

## Testing Results

Before fix:
- Plain text: `[object Object][object Object]...`
- HTML: All characters collapsed (no spacing)
- SVG: Same collapse

After fix:
- Plain text: Readable characters (spacing approximated)
- HTML: Matches canvas exactly (pixel-perfect)
- SVG: Matches canvas exactly


