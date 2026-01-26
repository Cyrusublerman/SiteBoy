# MFP Refactor - Scan Folder Integration Notes

## Discovery: Pre-existing Scan Helper Classes

During the refactor, discovered a well-structured scan helper system already exists:

### Location: `assets/js/tools/fabrication/scan/`

**Files:**
1. `scan-overlay-controller.js` (353 lines) - Manages transform state for grid overlays
2. `scan-tile-analyzer.js` (212 lines) - Orchestrates pixel sampling for tile analysis
3. `scan-visualization-modes.js` (287 lines) - Different analysis view modes
4. `sequence-library-builder.js` (259 lines) - Builds sequence lookup structures

**Architecture:**
- **Tool-specific modules** (stateful, UI-focused)
- **Proper separation**: Calls algorithms from `shared/algorithms/`
- **Pure functional algorithms** in separate files:
  - `grid-scan-transform.js` - Transform math (grid to scan space)
  - `tile-color-extraction.js` - Pixel sampling logic

## Integration Strategy

### What We Did
The new `MFP-Scan.js` module **integrates** with these helpers rather than replacing them:

```javascript
// Import existing scan helpers
import { ScanOverlayController } from '../scan/scan-overlay-controller.js';
import { ScanTileAnalyzer } from '../scan/scan-tile-analyzer.js';

// In MFP-Scan.js
this.overlayController = new ScanOverlayController(gridConfig, scanDimensions);
this.tileAnalyzer = new ScanTileAnalyzer(gridConfig, scanImageData, transform);
```

### Why This Works
1. **Separation of concerns**: Helper classes handle state, our module handles UI
2. **Reusability**: Same helpers can be used by other tools
3. **Standards compliance**: Helper classes don't violate DOM rules
4. **No duplication**: We use existing logic instead of rewriting

## Comparison: Two Approaches

### Old Monolith Approach
- 4892 lines in one file
- Direct DOM manipulation everywhere
- Mixed concerns (UI + logic + rendering)
- No reusability

### New Modular + Helper Classes Approach
- **MFP-Scan.js** (655 lines): UI orchestration, ComponentLibrary
- **scan-overlay-controller.js** (353 lines): Transform state management
- **scan-tile-analyzer.js** (212 lines): Analysis orchestration
- **Algorithms** (separate): Pure math functions
- **Result**: Clean separation, high reusability, standards-compliant

## Architecture Layers

```
┌─────────────────────────────────────────┐
│ MFP-Scan.js (UI Layer)                  │
│ - ComponentLibrary integration          │
│ - Canvas event handling                 │
│ - User interactions                     │
└──────────────┬──────────────────────────┘
               │
               ├─ imports ──> ScanOverlayController (State Layer)
               │              - Transform state
               │              - Drag/resize handling
               │
               ├─ imports ──> ScanTileAnalyzer (Orchestration Layer)
               │              - Tile-by-tile analysis
               │              - Progress tracking
               │
               └─ imports ──> Algorithms (Pure Functions)
                              - grid-scan-transform.js
                              - tile-color-extraction.js
```

## Future: Consider Consolidation?

**Current state**: Two parallel scan systems
1. Old monolithic code in `multifilament-print-tool.js` (being replaced)
2. Clean helper classes in `scan/` folder (being integrated)

**After refactor complete**: Consider if `scan/` folder should be:
- **Option A**: Keep as shared helpers (if other tools use them)
- **Option B**: Move into `multifilament-print/` if only used there
- **Option C**: Keep separate but document as MFP-specific helpers

**Recommendation**: Keep separate for now. The helper classes are well-architected and might be useful for future scanning tools.

## Checklist: What Still Needs Work

### In MFP-Scan.js (placeholders marked TODO):
- [ ] Implement full scan analysis using `ScanTileAnalyzer`
- [ ] Wire up visual analysis view (uses `scan-visualization-modes.js`)
- [ ] Complete export functions (GPL, quantization config, comparison CSV)
- [ ] Test corner-based grid transform in all display modes
- [ ] Verify project import/export with scan data

### Integration Tests Needed:
- [ ] Load project → shows scan analysis
- [ ] Drag grid corners → updates transform correctly
- [ ] Analyze scan → generates all output files
- [ ] Export project ZIP → includes scan folder with all files
- [ ] Re-import project → restores scan state perfectly

## Key Insight

The scan folder represents an **earlier modularization attempt** that got the architecture right:
- Stateful helpers that don't violate DOM rules ✅
- Proper algorithm separation ✅
- Clean interfaces ✅

Our refactor builds on this foundation rather than replacing it. This is the **correct approach** for incremental improvement.

