# Portrait/Landscape Layout Differences in ToolBase

## Root Cause Analysis

### The Problem
Tools appear to use "different classes entirely" when switching between portrait and landscape orientations. Custom styling options (like `inputClassName`) were lost on orientation change.

### Why It Happens

**ToolBase completely destroys and rebuilds the entire tool** when orientation changes:

```javascript:350:361:assets/js/tools/core/tool-base.js
_handleResize() {
    const isPortrait = window.innerWidth < window.innerHeight || window.innerWidth < 800;
    const wasPortrait = this.element.style.flexDirection === 'column';

    if (isPortrait !== wasPortrait) {
        // Layout orientation changed - full rebuild
        const parent = this.element.parentNode;
        if (parent) {
            this.destroy();
            parent.appendChild(this.render());
            this.draw();
        }
    }
    // ...
}
```

### Layout Differences

**Portrait Mode:**
- Uses `flexbox` with `flex-direction: column`
- Canvas area on top
- Sidebar below
- Order: canvas → sidebar

**Landscape Mode:**
- Uses `CSS Grid` with two columns
- Sidebar on left
- Canvas area on right
- Order: sidebar → canvas

### The Bug

When ToolBase parsed the `text` component configuration, it only extracted specific options:

```javascript
// BEFORE (missing inputClassName)
case 'text':
case 'textarea':
    options = {
        label: args[0],
        value: args[1] ?? '',
        placeholder: extraOptions.placeholder ?? '',
        multiline: typeLower === 'textarea',
        key: extraOptions.key ?? this._makeKey(args[0]),
        onChange: (v) => this._handleChange(options.key, v),
    };
    break;
```

**Result:** `inputClassName` was ignored during rebuild, causing TextInput to fall back to inline styles.

### The Fix

Pass through `inputClassName` and `rows` from `extraOptions`:

```javascript
// AFTER (complete passthrough)
case 'text':
case 'textarea':
    options = {
        label: args[0],
        value: args[1] ?? '',
        placeholder: extraOptions.placeholder ?? '',
        multiline: typeLower === 'textarea',
        inputClassName: extraOptions.inputClassName ?? null,
        rows: extraOptions.rows ?? 4,
        key: extraOptions.key ?? this._makeKey(args[0]),
        onChange: (v) => this._handleChange(options.key, v),
    };
    break;
```

## Files Modified

1. **assets/js/tools/core/tool-base.js**
   - Added `inputClassName` passthrough in `_parseComponentOptions()`
   - Added `rows` passthrough for consistency

2. **assets/js/shared/components/input/TextInput.js**
   - Added `inputClassName` option support
   - When provided, uses CSS class instead of inline styles

3. **assets/js/tools/processors/p5-to-video.js**
   - Passes `inputClassName: 'p5-code-textarea'` in config
   - Removed hacky `styleCodeTextarea()` method

4. **assets/css/styles.css**
   - Defines `.p5-code-textarea` with proper sizing
   - Responsive media query for portrait (60vh)
   - No `!important` needed (clean CSS)

## Lessons Learned

1. **Don't use `!important`** - it's a sign of architectural issues
2. **ToolBase rebuilds on orientation change** - all options must persist through config
3. **Check option passthrough** - ensure config parser forwards all custom options
4. **Inline styles override CSS** - use classes when possible
5. **Test both orientations** - layout systems may behave differently

## Related Files

- `assets/js/tools/core/tool-base.js` - Tool layout system
- `assets/js/shared/components/input/TextInput.js` - Input component
- `assets/css/styles.css` - Responsive styling

