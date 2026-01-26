# Algorithms Test Lab - Answers & Clean Implementation Plan

## YOUR QUESTIONS ANSWERED

### 1. "What is going on with all the `...common`?"

**Answer**: It's a spread operator spreading an empty array - basically does nothing.

```javascript
const common = [];  // Empty array
return [
    ['slider', 'Scale', 0.1, 5.0, 0.1, { key: 'scale', value: 1.0 }],
    ...common  // Spreads nothing, useless
];
```

**Should be removed entirely.** It was a placeholder for "common controls" that never materialized.

### 2. "Is it manually making the patterns and not using the algo library?"

**YES - THIS IS WRONG!**

Example of what I incorrectly did:
```javascript
// ❌ WRONG - Algorithm logic in tool file
case 'moire':
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const v1 = Math.sin(x * freq1 * 0.1);  // Math HERE = WRONG
            const v2 = Math.sin(xRot * freq2 * 0.1);
            // ...
        }
    }
```

Should be:
```javascript
// ✅ RIGHT - Just call library
case 'moire':
    A.Patterns.moire(ctx, canvas.width, canvas.height, values);
```

### 3. "How many of the algorithm displays have you written the logic for?"

**TOO MANY - ALMOST ALL OF THEM!**

I implemented logic for:
- Edge detection (6 algorithms) - WRONG
- Filtering (3) - WRONG
- Segmentation (3) - WRONG
- Curves (4) - WRONG
- Vectorization (3) - WRONG
- Optics (4) - WRONG
- Physics (4) - WRONG
- Reaction-Diffusion (4) - WRONG
- Quantization (4) - WRONG
- Graphs (2) - WRONG
- Distance fields (3) - WRONG
- Patterns (4) - WRONG

**~45 algorithms have logic in the tool file that should be in the library.**

This completely defeats the purpose of modular architecture.

## CORRECT ARCHITECTURE

### The Tool File Should ONLY:

```javascript
function renderAlgorithm(algoId, ctx, canvas, values) {
    // 1. Select algorithm
    const A = window.Algorithms;
    
    // 2. Set variables (already done via values object)
    
    // 3. Input variables into algorithm function (BLACK BOX)
    const output = A.Domain.algorithm(canvas.width, canvas.height, values);
    
    // 4. Retrieve output
    // (already have it)
    
    // 5. Use output with canvas component
    if (output) {
        displayOutput(ctx, canvas, output);
    }
}
```

### What I Did Wrong

I treated the tool file like the implementation file, putting all the math directly in the renderers. This is:
- ❌ Not modular
- ❌ Not reusable
- ❌ Duplicates logic that should be in library
- ❌ Makes testing impossible
- ❌ Violates separation of concerns

## CLEAN IMPLEMENTATION PLAN

### Phase 1: Create SeedInput Component ✅ DONE

- Created `assets/js/shared/components/tool/SeedInput.js`
- Equal width split: [ numeric input | Randomise ]
- Shared border, no double border
- F-system compliant (2F height)
- VGA palette

**Next**: Register in component-library.js

### Phase 2: Define Algorithm Structure in TOOL_CONFIG Format

```javascript
const ALGORITHM_BLOCKS = [
    {
        id: 'noise',
        title: 'Noise Functions',
        algorithms: [
            {
                id: 'simplex2D',
                title: 'Simplex 2D',
                controls: [
                    ['seed', 'Seed', { component: 'SeedInput' }],
                    ['slider', 'Scale', 0.1, 5.0, 0.1, { value: 1.0 }]
                ]
            },
            {
                id: 'fbm2D',
                title: 'Fractional Brownian Motion',
                controls: [
                    ['seed', 'Seed', { component: 'SeedInput' }],
                    ['slider', 'Scale', 0.1, 5.0, 0.1, { value: 1.0 }],
                    ['slider', 'Octaves', 1, 8, 1, { value: 4 }],
                    ['slider', 'Persistence', 0.1, 1.0, 0.1, { value: 0.5 }]
                ]
            }
            // ... etc
        ]
    }
];
```

This integrates with existing TOOL_CONFIG structure.

### Phase 3: Purge All Algorithm Logic from Tool File

**Delete**:
- All synthetic renderer bodies (lines 1077-1630)
- All manual pattern generation
- All mathematical calculations
- All pixel manipulation loops (except display utilities)

**Keep**:
- Algorithm library calls only: `A.Domain.algorithm(params)`
- Display utilities: `drawPixelsToCanvas()`, `drawPointsToCanvas()`
- Helper utilities: `generateSeededPoints()` (input data generation, not algorithms)

### Phase 4: Clean Renderer Pattern

Every renderer becomes:

```javascript
function renderDomain(algoId, ctx, canvas, values) {
    const A = window.Algorithms;
    
    // BLACK BOX: Call library
    const result = A.Domain[algoId](canvas.width, canvas.height, values);
    
    // DISPLAY: Show result
    if (result) {
        displayResult(ctx, canvas, result);
    }
}
```

**That's it.** No loops, no math, no pixel manipulation. Pure orchestration.

## FILE SIZE COMPARISON

### Current (WRONG):
- **2507 lines** total
- ~1800 lines of algorithm implementations
- ~400 lines of actual tool logic
- Ratio: 4.5:1 (algorithm:tool)

### Target (RIGHT):
- **~800 lines** total
- ~50 lines of algorithm **calls** (not implementations)
- ~400 lines of tool logic
- ~350 lines of display utilities
- Ratio: 1:8 (algorithm:tool)

**Reduction: 70% smaller, 100% more modular**

## WHAT NEEDS TO HAPPEN NOW

### Immediate Actions:

1. **Register SeedInput** in component-library.js
2. **Delete orphaned code** (lines 1077-1630 in current file)
3. **Replace all renderers** with clean versions from `algorithms-test-lab-CLEAN-RENDERERS.js`
4. **Update TOOL_CONFIG** to use SeedInput component
5. **Test with actual algorithms library** to see what's implemented

### Expected Outcome:

- Only algorithms that **actually exist** in library will render
- All others show "N/A" (via centralized check)
- Tool file is pure orchestration
- Library contains all math
- Perfect separation of concerns

## THE FUNDAMENTAL PRINCIPLE

> "I should have absolutely no awareness of what the functions are doing"

**Exactly.** The tool file should read like:

```javascript
result = blackBox(input);
display(result);
```

No knowledge of internal mechanics. Pure abstraction.

---

**Ready to proceed?** I can now:
1. Clean the file completely
2. Replace all renderers with library calls
3. Integrate SeedInput component
4. Make it actually work as intended

