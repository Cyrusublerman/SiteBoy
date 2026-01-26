# Subsection Header UX/UI Analysis

## Problem Statement
Algorithm Test Lab sidebar headers were collapsible (with +/- toggles) when they should be selectable items. The collapsibility made them non-selectable since clicking would toggle expand/collapse instead of selecting.

## Solution Implemented ✅

### Three Block Modes Supported

#### 1. **Container Mode** (default)
```javascript
['Block Title', [...controls]]
// or explicitly:
['Block Title', [...controls], { mode: 'container' }]
```
- Toggle icon (+/−) on right
- Click header → expand/collapse content
- Hover → invert colors
- **Use for:** Settings panels, control groups

#### 2. **Selectable Mode**
```javascript
['Block Title', [], { mode: 'selectable', id: 'item-id', key: 'callbackKey' }]
```
- No toggle icon
- Click header → select item (triggers `onUpdate(key, id)`)
- Hover → gray background (unless active)
- Active → inverted colors + `.active` class
- **Use for:** Menu items, list selections (no nested controls)

#### 3. **Selectable + Collapsible Mode** (NEW)
```javascript
['Block Title', [...controls], { mode: 'selectableCollapsible', id: 'item-id', key: 'callbackKey', defaultCollapsed: false }]
```
- **Split-zone interaction:**
  - Click **title area** → select item
  - Click **toggle icon** → expand/collapse controls
- Both selection state AND collapse state visible
- Title hover → underline (shows clickable)
- Toggle hover → gray background
- Active → inverted header colors
- **Use for:** Selectable items WITH controls (algorithm parameters, preset options)

### Visual Patterns

```
CONTAINER MODE (unchanged):
┌─────────────────────────┐
│ Settings            [−] │  ← Toggle icon
├─────────────────────────┤
│   Seed: [42]            │
│   Octaves: [4]          │
└─────────────────────────┘

SELECTABLE MODE:
┌─────────────────────────┐
│ ● Perlin 2D             │  ← Active (inverted, no toggle)
├─────────────────────────┤
│ ○ Simplex 2D            │  ← Inactive
└─────────────────────────┘

SELECTABLE + COLLAPSIBLE MODE:
┌─────────────────────────┐
│ ● PERLIN 2D         [−] │  ← Selected + Expanded
├─────────────────────────┤
│   Seed: [42]            │
│   Octaves: [4]          │
└─────────────────────────┘
┌─────────────────────────┐
│ ● SIMPLEX 2D        [+] │  ← Selected + Collapsed
└─────────────────────────┘
┌─────────────────────────┐
│ ○ fBm 2D            [+] │  ← Not selected + Collapsed
└─────────────────────────┘
```

### Implementation Details

#### ToolBase Extension (`tool-base.js`)
- `_buildBlock()` now accepts `options.mode` parameter
- Three modes: `'container'` (default), `'selectable'`, `'selectableCollapsible'`
- CSS classes: `.tool-block-header--container`, `.tool-block-header--selectable`, `.tool-block-header--selectable-collapsible`
- Split-zone interaction uses `stopPropagation()` to separate title/toggle clicks
- Title element gets `user-select: none` to prevent text selection during clicks

#### Algorithm Test Lab Updates
- `buildSidebarForPage()`: Auto-detects mode based on controls presence
  - No controls → `selectable`
  - Has controls → `selectableCollapsible`
- `onUpdate()`: Handles `selectedAlgorithm` key
- `selectAlgorithm()`: Queries both selectable classes
- `setupAlgorithmSelection()`: Simplified (only handles default selection)

### Options Reference

```javascript
{
  mode: 'container' | 'selectable' | 'selectableCollapsible',  // Block behavior
  id: 'unique-id',                     // Item identifier (for selectable modes)
  key: 'callbackKey',                  // onUpdate key (for selectable modes)
  defaultCollapsed: false              // Initial collapse state (for collapsible modes)
}
```

### Backward Compatibility
- No `options` or `mode` specified → defaults to `'container'`
- Existing tools continue working without modification
- Opt-in to selectable modes via config flag

### Benefits
1. **Flexible UX:** Three modes cover all use cases
2. **Clear semantics:** Intent explicit in config
3. **Reusable:** Any tool can use any mode
4. **Clean interaction:** Split-zone prevents click conflicts
5. **Maintainable:** Single source of truth in ToolBase
6. **Accessible:** Distinct visual states for all modes

### Example Usage

```javascript
// Algorithm Test Lab pattern:
const controls = getControlsForAlgorithm(algoId);
const mode = controls.length > 0 ? 'selectableCollapsible' : 'selectable';

return [
  'Algorithm Name',
  controls,
  { mode, id: algoId, key: 'selectedAlgorithm', defaultCollapsed: false }
];

// Simple menu pattern:
['Menu Item', [], { mode: 'selectable', id: 'item-1', key: 'menuSelection' }]

// Traditional panel:
['Settings', [['slider', 'Value', 0, 100]]]  // Defaults to container mode
```

## Testing Checklist
- [x] Algorithm Test Lab headers are clickable (not just collapsible)
- [x] Clicking title area selects algorithm
- [x] Clicking toggle icon expands/collapses controls
- [x] Active header shows inverted colors
- [x] Title hover shows underline (clickable indicator)
- [x] Toggle hover shows gray background
- [x] Other tools (Media Manager, etc.) still have collapsible headers
- [x] Page switching preserves selection state
- [x] No linting errors

