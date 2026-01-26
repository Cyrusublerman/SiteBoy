# Multifilament Print Filename Format Analysis

## Current Filename Format

### Pattern
```
cal-{colors}c{layers}L-{rows}x{cols}-{tilesize}mm[-gXofY]-YYYYMMDD.{ext}
```

### Example
```
cal-4c4L-10x10-10mm-20260106.zip          (single grid)
cal-3c4L-9x9-10mm-g1of2-20260104.png     (split grid, part 1 of 2)
```

---

## What CAN Be Extracted from Filename

| Field | Example | Description | Reliability |
|-------|---------|-------------|-------------|
| **Colors** | `4c` | Number of filaments used | ✅ Exact |
| **Layers** | `4L` | Layers per tile | ✅ Exact |
| **Grid Dimensions** | `10x10` | Rows × Cols | ✅ Exact |
| **Tile Size** | `10mm` | Tile dimension in mm | ✅ Exact |
| **Grid Index** | `g1of2` | Split grid part (optional) | ✅ Exact |
| **Export Date** | `20260106` | YYYYMMDD format | ✅ Exact |

**Total: 6 parameters** encoded in filename

---

## What CANNOT Be Extracted from Filename

### Critical Missing Parameters

| Parameter | Typical Default | Why Missing | Impact |
|-----------|-----------------|-------------|---------|
| **Gap** | 1mm | Not encoded in filename | ❌ Must guess or prompt |
| **Base Layers** | 3 | Feature not always present | ⚠️ Affects layer structure |
| **Top Layers** | 0 | Feature added in v1.1.0 | ⚠️ New feature, not in old files |
| **Sort Method** | "Layer Count" | Feature added in v1.1.0 | ⚠️ Affects tile ordering |
| **Specific Colors** | N/A | Only count, not IDs | ⚠️ Must reconstruct from data |
| **Bed Dimensions** | 256×256mm | Not part of grid export | ℹ️ Constraint info only |
| **Scan Dimensions** | 210×297mm | Not part of grid export | ℹ️ Constraint info only |

**Total: 7+ parameters** missing from filename

---

## Old Export Formats (Version History)

### v0.9.0 (CSV-only)
- **Format**: No grid-layout.json, only sequences.csv
- **Missing**: All UI settings (tile size, gap, base layers, sort method)
- **Recovery**: Reconstruct from CSV + filename + defaults

### v1.0.0 (First JSON)
- **Added**: grid-layout.json with basic structure
- **Missing**: sortMethod, topLayers
- **Recovery**: Add defaults (sortMethod="Layer Count", topLayers=0)

### v1.0.5 (Base Layers Added)
- **Added**: baseLayers field
- **Missing**: sortMethod, topLayers
- **Recovery**: Add defaults for sort and top

### v1.1.0 (Sorting Added)
- **Added**: sortMethod field
- **Missing**: topLayers
- **Recovery**: Add topLayers=0

### v1.2.0 (Current - Top Layers Added)
- **Complete**: All fields present
- **Format**: Full manifest with version tracking

---

## Import Strategy by Data Source

### Best Case: v1.2.0 ZIP
```
✅ Has: manifest.json with version
✅ Has: grid-layout.json with all fields
✅ Has: Complete metadata
→ Result: Perfect reconstruction
```

### Good Case: v1.0.x - v1.1.x ZIP
```
✅ Has: grid-layout.json with most fields
⚠️ Missing: 1-2 newer fields (sortMethod, topLayers)
→ Strategy: Auto-apply defaults (no prompt needed)
→ Result: Excellent reconstruction
```

### Degraded Case: v0.9.0 ZIP (CSV-only)
```
✅ Has: sequences.csv with grid data
✅ Has: Filename with 6 parameters
⚠️ Missing: Gap size
⚠️ Missing: Base/top layers
→ Strategy: Parse filename + use standard defaults
→ Prompt: Only if gap != 1mm expected
→ Result: Good reconstruction with assumptions
```

### Worst Case: Renamed File / No Pattern
```
❌ Filename doesn't match pattern
✅ Has: Internal JSON/CSV data
→ Strategy: Rely entirely on internal data + defaults
→ Prompt: User to verify all missing settings
→ Result: Functional but requires verification
```

---

## Recommended Default Values

When data is missing, use these defaults (based on most common use case):

| Setting | Default | Rationale |
|---------|---------|-----------|
| **Gap** | 1mm | Standard spacing for easy separation |
| **Base Layers** | 3 | Optimal for first-layer smoothness |
| **Top Layers** | 0 | Feature didn't exist in old exports |
| **Sort Method** | "Layer Count" | Most logical for calibration |
| **Bed Dimensions** | 256×256mm | Prusa Mini bed size (common) |
| **Scan Dimensions** | 210×297mm | A4 paper size (common) |

---

## Gap Size Detection Problem

**Critical Issue**: Gap is NOT in filename but dramatically affects grid dimensions.

### Example Problem:
- Filename says: `10x10-10mm` → Expected total: 109mm (with 1mm gap)
- Actual layout: width = 100mm
- **Calculated gap**: 0mm (tiles are touching!)

### Solution:
```javascript
// Reverse-calculate gap from layout dimensions
const expectedGap = (layoutWidth - (cols * tileSize)) / (cols - 1);
if (expectedGap !== layout.gap) {
    console.warn(`Gap mismatch: expected ${expectedGap}mm, got ${layout.gap}mm`);
}
```

---

## Future Filename Format Proposal

To encode more information without breaking backwards compatibility:

```
cal-{colors}c{layers}L-{rows}x{cols}-{tile}mm-g{gap}mm[-base{B}top{T}]-{sort}-YYYYMMDD.{ext}
```

### Example:
```
cal-4c4L-10x10-10mm-g1mm-base3top0-layercount-20260106.zip
```

### Benefits:
- ✅ Gap size encoded explicitly
- ✅ Base/top layers visible
- ✅ Sort method clear
- ✅ Still human-readable
- ✅ Backwards compatible (optional segments)

---

## Import Behavior Summary

### Current Implementation (v1.2.0):

1. **Parse Filename**
   - Extract: colors, layers, rows, cols, tileSize, date
   - Log: All extracted values
   - Validate: Against internal data

2. **Load ZIP Contents**
   - Try: manifest.json → detect version
   - Try: grid-layout.json → full structure
   - Fallback: sequences.csv → reconstruct

3. **Detect Missing Settings**
   - Compare: filename data vs internal data
   - Identify: Missing fields (gap, baseLayers, topLayers, sortMethod)
   - Classify: Critical vs auto-fixable

4. **Apply Defaults**
   - Auto-apply: Non-critical defaults (sortMethod, topLayers)
   - Prompt: Only if gap or base layers ambiguous
   - Log: All decisions

5. **Reconstruct UI**
   - Update: Filament picker
   - Update: All parameter controls
   - Update: Dropdowns
   - Force: Canvas redraw (immediate + delayed)

6. **Display Result**
   - Show: Grid on canvas immediately
   - Status: Success message with version info
   - Log: Complete summary in console

---

## Testing Checklist

- [ ] Import v1.2.0 ZIP → Should load instantly, no prompts
- [ ] Import v1.1.0 ZIP → Should add topLayers=0, no prompt
- [ ] Import v1.0.0 ZIP → Should add sortMethod + topLayers, no prompt
- [ ] Import v0.9.0 ZIP → Should reconstruct from CSV, auto-apply defaults
- [ ] Import renamed ZIP → Should detect data internally, prompt if needed
- [ ] Verify filename parsing → Console should show "Parsed from filename: {…}"
- [ ] Verify grid display → Canvas should show grid within 300ms
- [ ] Verify UI updates → All controls should match imported values


