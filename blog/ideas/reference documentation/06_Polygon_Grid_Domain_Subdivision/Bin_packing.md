# Bin Packing Problem

## 1. Overview
The bin packing problem is a combinatorial optimization problem: pack objects of varying sizes into a finite number of bins of fixed capacity, minimizing wasted space or number of bins. In computer graphics, this applies to texture atlasing, sprite sheet generation, tile placement, and UI layout.

## 2. Problem Formulation

### 2.1 1D Bin Packing
Given:
- Items with sizes \(s_1, s_2, ..., s_n\)
- Bins with capacity \(C\)

Minimize number of bins such that:
- Each item assigned to exactly one bin
- Sum of items in each bin \(\leq C\)

### 2.2 2D Rectangle Packing
Given:
- Rectangles with dimensions \((w_i, h_i)\)
- Container with dimensions \((W, H)\)

Find non-overlapping placement of all rectangles within container.

### 2.3 NP-Hardness
Bin packing is NP-hard. Optimal solutions require exponential time. Practical applications use heuristic algorithms.

## 3. 1D Algorithms

### 3.1 Next Fit (NF)
Keep current bin open, start new bin when item doesn't fit.
- **Time**: O(n)
- **Quality**: \(\leq 2 \cdot \text{OPT}\)

```
bins = [[]]
for item in items:
    if sum(bins[-1]) + item <= capacity:
        bins[-1].append(item)
    else:
        bins.append([item])
```

### 3.2 First Fit (FF)
Place item in first bin that has room.
- **Time**: O(n²) naive, O(n log n) with tree
- **Quality**: \(\leq 1.7 \cdot \text{OPT}\)

```
for item in items:
    placed = false
    for bin in bins:
        if sum(bin) + item <= capacity:
            bin.append(item)
            placed = true
            break
    if not placed:
        bins.append([item])
```

### 3.3 Best Fit (BF)
Place item in bin that will have least remaining space.
- **Time**: O(n log n) with heap
- **Quality**: \(\leq 1.7 \cdot \text{OPT}\)

### 3.4 First Fit Decreasing (FFD)
Sort items by size (largest first), then apply First Fit.
- **Quality**: \(\leq (11/9) \cdot \text{OPT} + 6/9\)

## 4. 2D Rectangle Packing Algorithms

### 4.1 Shelf Algorithms
Pack rectangles in horizontal shelves.

**Next Fit Decreasing Height (NFDH)**:
1. Sort by height (tallest first)
2. Place on current shelf if fits
3. Start new shelf otherwise

**Best Fit Decreasing Height (BFDH)**:
Place on shelf with best fit (least wasted width).

### 4.2 Guillotine Packing
Each placement creates guillotine cuts dividing remaining space.

**Split strategies**:
- Shorter Leftover Axis Split (SLAS)
- Longer Leftover Axis Split (LLAS)
- Shorter Remaining Axis Split (SRAS)
- Longer Remaining Axis Split (LRAS)

```
function guillotinePack(rects, binW, binH):
    freeRects = [{x:0, y:0, w:binW, h:binH}]
    
    for rect in sorted(rects, key=area, reverse=true):
        // Find best free rectangle
        bestIdx = findBestFit(freeRects, rect)
        if bestIdx < 0: fail
        
        // Place rectangle
        freeRect = freeRects[bestIdx]
        rect.x = freeRect.x
        rect.y = freeRect.y
        
        // Split remaining space
        split(freeRects, bestIdx, rect)
```

### 4.3 MaxRects Algorithm
Maintain list of maximal free rectangles.

**Steps**:
1. Start with single free rect (entire bin)
2. For each item, find best free rect
3. Place item, split free rect
4. Merge overlapping free rects

**Heuristics for choosing placement**:
- **BSSF** (Best Short Side Fit)
- **BLSF** (Best Long Side Fit)  
- **BAF** (Best Area Fit)
- **BL** (Bottom-Left)

```
function maxRectsPack(rects, binW, binH):
    freeRects = [{x:0, y:0, w:binW, h:binH}]
    
    for rect in rects:
        bestScore = infinity
        bestRect = null
        bestIdx = -1
        
        for i, free in enumerate(freeRects):
            if rect.w <= free.w and rect.h <= free.h:
                score = scoreFunction(free, rect)
                if score < bestScore:
                    bestScore = score
                    bestRect = free
                    bestIdx = i
        
        if bestRect:
            place(rect, bestRect)
            splitMaxRects(freeRects, rect)
            pruneFreeRects(freeRects)
```

### 4.4 Skyline Algorithm
Maintain "skyline" of placed rectangles.

```
function skylinePack(rects, binW, binH):
    skyline = [{x:0, w:binW, y:0}]  // Initial flat line
    
    for rect in sorted(rects, key=area, reverse=true):
        // Find best position on skyline
        bestX, bestY = findBestPosition(skyline, rect)
        
        // Update skyline
        addToSkyline(skyline, bestX, rect.w, rect.h)
```

## 5. Rotation
Allow 90° rotation to improve packing:

```
function tryFit(rect, freeRect):
    // Try both orientations
    fit1 = rect.w <= freeRect.w and rect.h <= freeRect.h
    fit2 = rect.h <= freeRect.w and rect.w <= freeRect.h
    
    if fit1 and fit2:
        // Choose better orientation
        return betterOrientation(rect, freeRect)
    else if fit1:
        return {rotated: false}
    else if fit2:
        return {rotated: true}
    else:
        return null
```

## 6. Multi-Bin Packing
When items don't fit in single container:

```
function multiPagePack(rects, binW, binH):
    pages = []
    remaining = rects.sorted(by=area, reverse=true)
    
    while remaining.length > 0:
        page = new Page(binW, binH)
        packed = page.pack(remaining)
        remaining = remaining.filter(r => !packed.includes(r))
        pages.push(page)
    
    return pages
```

## 7. Quality Metrics

### 7.1 Packing Efficiency
$$\eta = \frac{\sum \text{area}(\text{items})}{\text{area}(\text{container})}$$

### 7.2 Utilization per Bin
$$U_i = \frac{\sum_{j \in \text{bin}_i} s_j}{C}$$

### 7.3 Approximation Ratio
$$\frac{\text{ALG}(I)}{\text{OPT}(I)}$$

## 8. Applications
- Texture atlases (game assets)
- Sprite sheet generation
- Tile mosaic layout
- CSS sprite optimization
- Memory allocation
- Cutting stock problem

## 9. References
- Coffman, E. G., Garey, M. R., and Johnson, D. S. "Approximation algorithms for bin packing." Algorithm Design for Computer System Design (1984).
- Jylänki, Jukka. "A thousand ways to pack the bin." (2010). http://clb.confined.space/files/RectangleBinPack.pdf
- "Bin packing problem." Wikipedia. https://en.wikipedia.org/wiki/Bin_packing_problem

