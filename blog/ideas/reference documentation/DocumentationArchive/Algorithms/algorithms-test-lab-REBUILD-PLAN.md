# Algorithms Test Lab - Complete Rebuild Plan

## CURRENT STATE
- **File Size**: 2507 lines
- **Problem**: ~1800 lines of algorithm logic that should be in library
- **Target Size**: ~700 lines of pure orchestration

## WHAT'S CORRECT (Keep)
- ✅ PAGES structure (lines 29-258) - hierarchical page/domain/algorithm data
- ✅ ALGORITHM_MAP generation (lines 261-276) - flat lookup
- ✅ ALGORITHM_DOCS_MAP (lines 490-567) - documentation paths
- ✅ State management (lines 295-304)
- ✅ Noise renderer (lines 1712-1766) - ACTUALLY calls library!
- ✅ Sampling renderer (lines 1771-1830) - calls library
- ✅ Space-filling renderer (lines 1835-1892) - calls library
- ✅ TSP renderer (lines 1896-1962) - calls library

## WHAT'S WRONG (Delete/Fix)

### ORPHANED CODE (Delete ~550 lines)
- Lines 1077-1630: renderReactionDiffusion through renderPhysics
  - These are synthetic implementations that should NOT exist
  - The centralized check already prevents them from being called
  - Pure dead code

### INCORRECT CONTROLS (Fix)

**Current fbm2D controls**:
```javascript
['slider', 'Octaves', 1, 8, 1, { ... }],
['slider', 'Persistence', 0.1, 1.0, 0.1, { ... }]
// ❌ MISSING: Lacunarity (default 2.0, range 1.5-3.0)
```

**Should be**:
```javascript
['seed', 'Seed', { component: 'SeedInput' }],
['slider', 'Frequency', 0.001, 0.1, 0.001, { value: 0.005 }],
['slider', 'Octaves', 1, 8, 1, { value: 4 }],
['slider', 'Lacunarity', 1.5, 3.0, 0.1, { value: 2.0 }],  // MISSING!
['slider', 'Persistence', 0.1, 0.9, 0.05, { value: 0.5 }]
```

**Current poissonDisk controls**:
```javascript
['slider', 'Sample Count', 12, 240, 1, { key: 'sampleCount', value: 120 }]
['slider', 'Radius', 4, 32, 1, { key: 'radius', value: 18 }]
// ❌ WRONG: Algorithm takes minDist + k (candidates), not sampleCount
```

**Should be**:
```javascript
['seed', 'Seed', { component: 'SeedInput' }],
['slider', 'Min Distance', 5, 50, 1, { key: 'minDist', value: 18 }],
['slider', 'Candidates (k)', 10, 60, 1, { key: 'k', value: 30 }]
```

### MISSING RENDERER CLEANUP

**renderPatterns()** (lines 1967-1995):
- Currently has synthetic code for: linearGrating, radialGrating, moire, halftone
- Should check if A.Patterns has these functions, else they show N/A via central check
- Need to verify if Patterns module has these (likely not)

**renderDistance()** (lines 2094-2171):
- Has synthetic code for sdfPrimitives, sdfBoolean, geodesic
- Should call A.SDF.* or A.Geodesic.* if available
- Otherwise N/A via central check

## REBUILD STRATEGY

### Option A: Surgical Cleanup (Moderate effort)
1. Delete lines 1077-1630 (orphaned synthetic renderers)
2. Fix controls for each algorithm (lines 773-900)
3. Clean renderPatterns and renderDistance
4. Add SeedInput component usage
5. Test

**Estimated effort**: 2-3 hours

### Option B: Complete Rewrite (Clean slate)
1. Keep PAGES structure
2. Rewrite everything else from scratch
3. Use clean renderer pattern (library calls only)
4. Proper controls based on algorithm signatures
5. Test systematically

**Estimated effort**: 4-6 hours

## RECOMMENDED: Option B (Complete Rewrite)

The file is too tangled to cleanly patch. A rewrite ensures:
- ✅ Pure orchestration (no algorithm logic)
- ✅ Correct controls (match algorithm parameters)
- ✅ Proper component usage (SeedInput)
- ✅ Clean, maintainable code
- ✅ Easy to test

## DETAILED REWRITE CHECKLIST

### 1. File Structure
- [ ] Header + imports (50 lines)
- [ ] VGA palette + constants (20 lines)
- [ ] PAGES structure (keep as-is, 230 lines)
- [ ] ALGORITHM_MAP generation (keep, 20 lines)
- [ ] ALGORITHM_DOCS_MAP (keep, 80 lines)
- [ ] State object (keep, 10 lines)

### 2. Control Definitions (NEW - Based on Actual Parameters)
- [ ] Noise controls (4 algorithms × 3-5 controls each)
  - simplex2D: seed, frequency
  - fbm2D: seed, frequency, octaves, lacunarity, persistence
  - domainWarp2D: seed, strength, scale, octaves
  - multiWarp2D: same as domainWarp2D
  
- [ ] Sampling controls (4 algorithms)
  - poissonDisk: seed, minDist, k
  - haltonSequence: count
  - lloydRelaxation: seed, iterations
  - importanceSampling: seed, count, weightFunction (preset)

- [ ] Patterns controls (5 algorithms)
  - truchet: seed, gridSize
  - linearGrating: frequency, rotation
  - radialGrating: frequency
  - moire: freq1, freq2, angle
  - halftone: dotSize, angle

- [ ] Space-Filling controls (5 algorithms)
  - All: order (3-7)

- [ ] TSP controls (3 algorithms)
  - All: seed, pointCount

- [ ] Physics controls (4 algorithms - TIME BASED!)
  - wave1D: frequency, wavelength, amplitude, time (animated)
  - wave2D: waveSpeed, damping, time (animated)
  - advection: flowSpeed, time (animated)
  - streamline: Similar

### 3. Renderer Functions (Clean - Library Calls Only)
- [ ] renderNoise() - Keep current (it's correct!)
- [ ] renderSampling() - Keep current (it's correct!)
- [ ] renderSpaceFilling() - Clean lSystem synthetic code
- [ ] renderTSP() - Keep current
- [ ] renderPatterns() - Remove ALL synthetic, call library only
- [ ] renderDistance() - Remove ALL synthetic, call library only
- [ ] DELETE: renderEdges, renderFiltering, renderSegmentation, renderCurves, etc.

### 4. Display Utilities (Keep/Add)
- [ ] drawPixelsToCanvas() - for 2D scalar fields
- [ ] drawPointsToCanvas() - for point arrays
- [ ] drawCurveToCanvas() - for path arrays
- [ ] drawTourToCanvas() - for TSP tours
- [ ] renderNA() - for unimplemented
- [ ] paletteIndex() - VGA mapping

### 5. Animation System (NEW - For Time-Based Algorithms)
- [ ] Add time state variable
- [ ] Add AnimationFoundation.AnimationLoop for physics
- [ ] Add play/pause/reset controls for animated algorithms
- [ ] Update renderer to pass time parameter

### 6. Component Integration
- [ ] Use SeedInput for all seed parameters
- [ ] Update TOOL_CONFIG to reference 'seed' control type
- [ ] Ensure ToolBase recognizes and renders SeedInput

## TESTING REQUIREMENTS

After rebuild, systematically test:
- [ ] Page 1: All 13 algorithms (noise, sampling, patterns)
- [ ] Page 2: All 12 algorithms (should show N/A or real output)
- [ ] Page 3: All 11 algorithms
- [ ] Page 4: All 10 algorithms
- [ ] Page 5: All 12 algorithms (time-based need animation)
- [ ] Page 6: All 4 algorithms

### Per-Algorithm Test:
1. Click block header → highlights white/black
2. Check ABOUT tab → correct documentation loads
3. Adjust controls → canvas updates
4. Verify either:
   - Real algorithm output (colored/shaped as expected)
   - OR "N/A" message (gray text on black)
5. Randomise button works (for algorithms with seed)

## SUCCESS CRITERIA

✅ File is ~700 lines (70% reduction)
✅ Zero algorithm logic in tool file
✅ All controls match algorithm signatures
✅ SeedInput component works
✅ Block headers highlight properly
✅ ABOUT tab updates on every click
✅ All 62 algorithms either render correctly or show N/A
✅ No synthetic/fake renderers
✅ Pure library calls only

---

**Recommendation**: Complete rewrite (Option B) in next session when you have 4-6 hours. The file is too tangled for surgical fixes.

