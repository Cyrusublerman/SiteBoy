# ToolBase Sidebar Structure - CRITICAL FIX

## The Error

```
TypeError: Cannot read properties of null (reading 'mode')
    at ToolBase._buildBlock (tool-base.js:538:38)
```

## Root Cause

ToolBase sidebar config has a **strict 3-level structure**:

```javascript
['TAB NAME', [           // Level 1: Tab
    ['Block Title', [    // Level 2: Block
        ['component', ...args]  // Level 3: Component
    ]]
]]
```

## What Went Wrong

### ❌ INCORRECT (What we had):
```javascript
['ADJUSTMENTS', [
    ['adjustment-bundle', 'standard', null, { key: 'imageAdjust' }]  // ← Parser thinks this is a BLOCK
]]
```

ToolBase parser reads this as:
- `'adjustment-bundle'` = Block Title (string)
- `'standard'` = Components array (should be array, got string!)
- `null` = Options object (should be object, got null!)

Then at line 538 it tries: `options.mode` → `null.mode` → **TypeError**

### ✅ CORRECT (What we need):
```javascript
['ADJUSTMENTS', [
    ['Image Adjustments', [                                          // ← Block wrapper
        ['adjustment-bundle', 'standard', null, { key: 'imageAdjust' }]
    ]]
]]
```

## ToolBase Parser Logic

```javascript
// tool-base.js line 496-498
blocks.forEach((blockDef, blockIndex) => {
    const [blockTitle, components, options = {}] = blockDef;
    //     ^^^^^^^^^^  ^^^^^^^^^^  ^^^^^^^
    //     string      array       object
    const block = this._buildBlock(blockTitle, components, blockIndex === 0, options);
});
```

Parser expects `blockDef` to be:
```javascript
['Title', [components...], { options }]
//  [0]        [1]              [2]
```

## How to Identify This Error

### Signs you need a block wrapper:
1. Component definition directly under tab
2. Error: "Cannot read properties of null (reading 'mode')"
3. Error occurs in `ToolBase._buildBlock`

### Quick check:
```javascript
// ❌ BAD: Component directly under tab
['TAB', [
    ['component-type', arg1, arg2]
]]

// ✅ GOOD: Component wrapped in block
['TAB', [
    ['Block Title', [
        ['component-type', arg1, arg2]
    ]]
]]
```

## Valid Sidebar Structures

### Structure 1: Single Tab with Blocks
```javascript
sidebar: [
    ['Controls', [
        ['Block 1', [
            ['slider', 'Value', 0, 100, 1]
        ]],
        ['Block 2', [
            ['button', 'Action']
        ]]
    ]]
]
```

### Structure 2: Multiple Tabs with Blocks
```javascript
sidebar: [
    ['CONTROLS', [
        ['Parameters', [
            ['slider', 'Size', 1, 10, 1]
        ]]
    ]],
    ['CANVAS', [
        ['Export', [
            ['button', 'Download']
        ]]
    ]]
]
```

### Structure 3: Tab with Nested Panels
```javascript
sidebar: [
    ['TAB', [
        ['PANEL A', [
            ['Block 1', [
                ['slider', 'X', 0, 100, 1]
            ]]
        ]],
        ['PANEL B', [
            ['Block 2', [
                ['slider', 'Y', 0, 100, 1]
            ]]
        ]]
    ]]
]
```

## ❌ NEVER Do This

```javascript
// BAD: Component directly under tab
['TAB', [
    ['component-type', 'label', args]  // ← Parser thinks this is a block!
]]

// BAD: Block without components array
['TAB', [
    ['Block Title']  // ← Missing components array
]]

// BAD: Mixing levels
['TAB', [
    ['slider', 'X', 0, 100],           // ← Component without block
    ['Block', [                        // ← Block mixed with component
        ['button', 'OK']
    ]]
]]
```

## ✅ ALWAYS Do This

```javascript
// GOOD: Proper 3-level structure
['TAB', [
    ['Block Title', [                  // ← Always wrap in block
        ['component-type', ...args]
    ]]
]]

// GOOD: Even for single component
['TAB', [
    ['Controls', [                     // ← Still need block wrapper
        ['slider', 'Value', 0, 100, 1]
    ]]
]]
```

## The Fix Applied

### Before (crashed):
```javascript
['ADJUSTMENTS', [
    ['adjustment-bundle', 'standard', null, { key: 'imageAdjust' }],
]],
```

### After (works):
```javascript
['ADJUSTMENTS', [
    ['Image Adjustments', [
        ['adjustment-bundle', 'standard', null, { key: 'imageAdjust' }],
    ]],
]],
```

## Why This Structure?

ToolBase needs to know:
1. **Tab level**: What tabs to create
2. **Block level**: How to group components with headers
3. **Component level**: What components to render

Skipping the block level confuses the parser because it can't distinguish between:
- A block definition: `['Title', [components]]`
- A component definition: `['type', arg1, arg2]`

Both are arrays starting with a string!

## Debugging Checklist

If you get "Cannot read properties of null (reading 'mode')":

1. Check sidebar config structure
2. Ensure every component is wrapped in `['Block Title', [components]]`
3. Verify tab structure: `['TAB', [blocks]]`
4. Count nesting levels: should be exactly 3
5. Add console.log to see what parser receives:
   ```javascript
   blocks.forEach((blockDef) => {
       console.log('Block def:', blockDef);
       const [title, components, options] = blockDef;
       console.log('Parsed:', { title, components, options });
   });
   ```

## Summary

**Rule**: Every component must be inside a block, every block must be inside a tab.

**Structure**: `['TAB', [['BLOCK', [['component', ...]]]]]`

**Error**: `null.mode` means you skipped the block level and ToolBase parsed your component as a block.

**Fix**: Wrap your component(s) in `['Block Title', [components]]`

