# ✅ IMPORT ERRORS FIXED

## Issue
```
The requested module '/assets/js/shared/algorithms/index.js' does not provide an export named 'buildSequenceMap'
```

## Root Cause
The action modules were importing from `/assets/js/shared/algorithms/index.js`, but that file only exports namespaced groups (e.g., `Combinatorics.*`, `ColorUtils.*`). Individual functions like `buildSequenceMap`, `simColour`, etc. are NOT re-exported at the top level.

## Solution
Changed all imports to reference the specific algorithm files directly, matching the pattern used in the working monolith.

---

## Changes Made

### MFP-SourceActions.js
**Before:**
```javascript
import { calculateGridLayout, buildSequenceMap, simColour, rgb_to_key } from '../../../shared/algorithms/index.js';
import { exportArtworkSTLs } from '../../../shared/algorithms/index.js';
```

**After:**
```javascript
import { calculateGridLayout } from '../../../shared/algorithms/layout/grid-layout.js';
import { buildSequenceMap } from '../../../shared/algorithms/combinatorics/sequences.js';
import { simColour, rgb_to_key } from '../../../shared/algorithms/color/color-utils.js';
import { exportArtworkSTLs } from '../../../shared/algorithms/geometry/stl-generation.js';
```

### MFP-ScanActions.js
**Before:**
```javascript
import { simColour, rgb_to_key, buildSequenceMap } from '../../../shared/algorithms/index.js';
// ...
const { sortSequences } = await import('../../../shared/algorithms/index.js');
```

**After:**
```javascript
import { simColour, rgb_to_key } from '../../../shared/algorithms/color/color-utils.js';
import { buildSequenceMap } from '../../../shared/algorithms/combinatorics/sequences.js';
// ...
const { sortSequences } = await import('../../../shared/algorithms/combinatorics/sequences.js');
```

---

## Verified Imports

| Function | Actual Location |
|----------|----------------|
| `buildSequenceMap` | `algorithms/combinatorics/sequences.js` |
| `sortSequences` | `algorithms/combinatorics/sequences.js` |
| `simColour` | `algorithms/color/color-utils.js` |
| `rgb_to_key` | `algorithms/color/color-utils.js` |
| `calculateGridLayout` | `algorithms/layout/grid-layout.js` |
| `exportArtworkSTLs` | `algorithms/geometry/stl-generation.js` |

---

## Status
✅ **FIXED** - Tool should now load correctly.

All imports now match the pattern used in the working monolith (`multifilament-print-tool.js`).

