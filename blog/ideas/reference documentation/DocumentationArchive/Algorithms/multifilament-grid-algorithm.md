# Multifilament Grid Generation Algorithm - Exact Process

## Overview
The grid generation is a **deterministic 5-step algorithm** that creates a calibration pattern showing every possible color combination achievable with N filaments and M layers.

---

## STEP 1: Generate Valid Sequences

### Input Parameters
- `N` = Number of selected filaments (e.g., 2, 3, 4...)
- `M` = Layers per tile (e.g., 4)

### Algorithm
```
For each possible sequence of length M:
  where each position can be: 0 (empty) or 1..N (filament index)
  
  VALIDATION RULES:
  1. Reject if all zeros [0,0,0,0] - empty sequence
  2. Reject if has gaps [1,0,2,0] - non-zero after zero
  
  VALID EXAMPLES:
  ✅ [1,2,0,0] - filament 1, then 2, then empty
  ✅ [1,1,1,1] - all filament 1
  ✅ [2,3,0,0] - filament 2, then 3
  
  INVALID EXAMPLES:
  ❌ [0,0,0,0] - all empty
  ❌ [1,0,2,0] - gap (filament 2 after zero)
  ❌ [0,1,2,3] - starts with zero
```

### Recursive Generation
```javascript
function gen(current, depth) {
  if (depth === M) {
    if (isValid(current)) sequences.push(current);
    return;
  }
  
  // CRITICAL: Once we place a zero, only zeros can follow
  if (current[current.length - 1] === 0) {
    gen([...current, 0], depth + 1);
  } else {
    // Can use any filament (1..N) or empty (0)
    for (let v = 0; v <= N; v++) {
      gen([...current, v], depth + 1);
    }
  }
}
```

### Output
Array of valid sequences, e.g., for N=2, M=4:
```
[1,1,1,1] → all red
[1,1,1,2] → mostly red
[1,1,2,2] → half red, half blue
[1,2,2,2] → mostly blue
[2,2,2,2] → all blue
[1,1,1,0] → red layers (shorter)
[1,1,2,0]
[1,2,2,0]
... (340 total for N=4, M=4)
```

### Theoretical Count Formula
```
N × (N^M - 1) / (N - 1)

For N=4, M=4:
4 × (4^4 - 1) / (4 - 1)
= 4 × (256 - 1) / 3
= 4 × 255 / 3
= 340 sequences
```

---

## STEP 2: Calculate Grid Layout

### Input
- `sequenceCount` = 340 (from Step 1)
- `tileSize` = 10mm
- `gap` = 1mm
- `maxWidth` = min(bedW, scanW) = min(256, 210) = 210mm
- `maxHeight` = min(bedH, scanH) = min(256, 297) = 256mm

### Algorithm
```javascript
// 1. Calculate how many tiles fit per row/column
const step = tileSize + gap; // 11mm
const tilesPerRow = Math.floor((maxWidth + gap) / step); 
  // = floor((210 + 1) / 11) = 19 tiles
const tilesPerCol = Math.floor((maxHeight + gap) / step);
  // = floor((256 + 1) / 11) = 23 tiles
const maxTiles = tilesPerRow × tilesPerCol = 19 × 23 = 437

// 2. Start with square-ish layout
let cols = Math.ceil(sqrt(sequenceCount)); 
  // = ceil(sqrt(340)) = 19
let rows = Math.ceil(sequenceCount / cols);
  // = ceil(340 / 19) = 18

// 3. Adjust if doesn't fit constraints
while (cols > tilesPerRow || rows > tilesPerCol) {
  if (cols > tilesPerRow) {
    rows++;
    cols = Math.ceil(sequenceCount / rows);
  } else {
    cols++;
    rows = Math.ceil(sequenceCount / cols);
  }
  
  if (rows * cols > maxTiles) {
    ERROR: "Cannot fit"
  }
}

// 4. Calculate empty cells
const totalCells = rows × cols; // 19 × 18 = 342
const emptyCells = [];
for (let i = sequenceCount; i < totalCells; i++) {
  emptyCells.push(i); // [340, 341]
}

// 5. Calculate physical dimensions
const width = cols × step - gap; // 19 × 11 - 1 = 208mm
const height = rows × step - gap; // 18 × 11 - 1 = 197mm
```

### Output
```javascript
{
  rows: 18,
  cols: 19,
  width: 208mm,
  height: 197mm,
  emptyCells: [340, 341],
  fits: true
}
```

---

## STEP 3: Simulate Tile Colors

For each sequence, calculate the visual appearance:

### Color Mixing Formula
```javascript
function simColour(sequence, colours) {
  // Filter out empty layers (0)
  const activeLayers = sequence.filter(v => v > 0);
  
  // Average the RGB values of active filaments
  let r = 0, g = 0, b = 0;
  activeLayers.forEach(filIdx => {
    const color = colours[filIdx - 1]; // 0-indexed
    r += color.r;
    g += color.g;
    b += color.b;
  });
  
  const count = activeLayers.length;
  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count)
  };
}
```

### Example
```
Sequence: [1, 2, 0, 0]
Filament 1: Red {r:255, g:0, b:0}
Filament 2: Blue {r:0, g:0, b:255}

Result:
r = (255 + 0) / 2 = 127
g = (0 + 0) / 2 = 0
b = (0 + 255) / 2 = 127
→ Purple {r:127, g:0, b:127}
```

---

## STEP 4: Build Sequence Map

### Purpose
Create a lookup table: `RGB color` → `sequence data`

This is CRITICAL because:
- When scanning the printed grid, we detect RGB values
- We need to look up which sequence produced that color
- The map connects measured colors back to layer instructions

### Algorithm
```javascript
const sequenceMap = new Map();

sequences.forEach((seq, index) => {
  // 1. Calculate what color this sequence produces
  const color = simColour(seq, selectedFilaments);
  
  // 2. Create standardized RGB key (CRITICAL: must round to integers)
  const key = `${Math.round(color.r)},${Math.round(color.g)},${Math.round(color.b)}`;
  
  // 3. Calculate grid position
  const row = Math.floor(index / cols);
  const col = index % cols;
  
  // 4. Store in map
  sequenceMap.set(key, {
    sequence: seq,           // [1,2,0,0]
    colours: selectedFilaments,  // [{h:"#FF0000",n:"Red"}, ...]
    grid_position: {
      row: row,
      col: col,
      index: index
    }
  });
});
```

### Example Map Entry
```javascript
Key: "127,0,127"
Value: {
  sequence: [1, 2, 0, 0],
  colours: [
    {h: "#FF0000", n: "Red PETG"},
    {h: "#0000FF", n: "Blue PLA"}
  ],
  grid_position: {
    row: 5,
    col: 12,
    index: 107
  }
}
```

---

## STEP 5: Render Grid

### Canvas Drawing
```javascript
// Calculate pixel size per tile
const cellSize = Math.min(
  canvas.width / cols,
  canvas.height / rows
);

// Draw each sequence
sequences.forEach((seq, index) => {
  // Calculate position
  const row = Math.floor(index / cols);
  const col = index % cols;
  const x = col * cellSize;
  const y = row * cellSize;
  
  // Get color
  const color = simColour(seq, selectedFilaments);
  
  // Draw tile
  ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
  ctx.fillRect(x, y, cellSize, cellSize);
  
  // Draw border (darker to reduce bevel effect)
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, cellSize, cellSize);
});

// Draw empty cells
emptyCells.forEach(emptyIdx => {
  const row = Math.floor(emptyIdx / cols);
  const col = emptyIdx % cols;
  const x = col * cellSize;
  const y = row * cellSize;
  
  // Grey background
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(x, y, cellSize, cellSize);
  
  // Grey border
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, cellSize, cellSize);
  
  // Draw X
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 5, y + 5);
  ctx.lineTo(x + cellSize - 5, y + cellSize - 5);
  ctx.moveTo(x + cellSize - 5, y + 5);
  ctx.lineTo(x + 5, y + cellSize - 5);
  ctx.stroke();
});
```

---

## CSV Export Format

### Purpose
Export grid data for verification and external processing.

### Format
```csv
Index,Sequence,Expected RGB,Row,Col,Filament Names
0,"[1,1,1,1]","255 0 0",0,0,"Red PETG"
1,"[1,1,1,2]","191 0 63",0,1,"Red PETG|Blue PLA"
2,"[1,1,2,2]","127 0 127",0,2,"Red PETG|Blue PLA"
...
340,"[empty]","240 240 240",18,17,"(empty cell)"
341,"[empty]","240 240 240",18,18,"(empty cell)"
```

### Implementation
```javascript
export function exportGridCSV(gridData, sequenceMap) {
  const { sequences, rows, cols, colours, emptyCells } = gridData;
  
  let csv = 'Index,Sequence,Expected RGB,Row,Col,Filament Names\n';
  
  // Export filled cells
  sequences.forEach((seq, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const color = simColour(seq, colours);
    const filNames = seq
      .filter(v => v > 0)
      .map(v => colours[v - 1].n)
      .join('|');
    
    csv += `${index},"[${seq.join(' ')}]","${color.r} ${color.g} ${color.b}",${row},${col},"${filNames}"\n`;
  });
  
  // Export empty cells
  emptyCells.forEach(index => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    csv += `${index},"[empty]","240 240 240",${row},${col},"(empty cell)"\n`;
  });
  
  return csv;
}
```

---

## Comparison CSV (Scan Phase)

### Purpose
After printing and scanning, compare expected vs measured colors.

### Format
```csv
Index,Sequence,Expected,Measured
0,"[1 1 1 1]","255 0 0","252 3 2"
1,"[1 1 1 2]","191 0 63","189 2 65"
2,"[1 1 2 2]","127 0 127","125 1 129"
...
```

### Implementation
```javascript
export function exportComparisonCSV(gridData, scannedPalette) {
  const { sequences, colours } = gridData;
  
  let csv = 'Index,Sequence,Expected,Measured\n';
  
  sequences.forEach((seq, i) => {
    if (i >= scannedPalette.length) return;
    
    const expected = simColour(seq, colours);
    const measured = scannedPalette[i];
    
    csv += `${i},"[${seq.join(' ')}]","${expected.r} ${expected.g} ${expected.b}","${measured.r} ${measured.g} ${measured.b}"\n`;
  });
  
  return csv;
}
```

---

## Critical Implementation Notes

### 1. RGB Key Standardization
**ALWAYS round RGB values to integers for Map keys:**
```javascript
// ✅ CORRECT
const key = `${Math.round(r)},${Math.round(g)},${Math.round(b)}`;

// ❌ WRONG - causes lookup failures
const key = `${r},${g},${b}`; // might be "127.5,0.3,127.8"
```

### 2. Empty Cell Tracking
**Must track empty cells separately from sequences:**
```javascript
// Total cells includes empty ones
const totalCells = rows * cols;

// Empty cells start after last sequence
const emptyCells = [];
for (let i = sequences.length; i < totalCells; i++) {
  emptyCells.push(i);
}
```

### 3. Grid Order
**Sequences are placed left-to-right, top-to-bottom:**
```
Index:  0   1   2   3   4
       [5] [6] [7] [8] [9]
       ...

Position calculation:
row = floor(index / cols)
col = index % cols
```

### 4. Physical Dimensions
**Account for gaps correctly:**
```javascript
// Each tile + gap
const step = tileSize + gap;

// Total width (subtract final gap)
const width = cols * step - gap;

// NOT this (wrong):
const width = cols * tileSize + (cols - 1) * gap;
```

---

## Current Implementation Status

### ✅ Implemented
1. Sequence generation (correct algorithm)
2. Grid layout calculation (correct formula)
3. Color simulation (correct averaging)
4. Sequence map building (correct keys)
5. Basic canvas rendering

### ❌ Missing
1. **CSV Export** - Grid data export
2. **CSV Export** - Comparison export (scan phase)
3. Interactive grid (click to show sequence)
4. Empty cell visualization (grey + X)
5. Grid metadata display

### 🔧 Needs Fix
1. Canvas rendering should show empty cells with X
2. Stats display should be in separate row (not in canvas)
3. Export buttons should trigger CSV/JSON downloads

