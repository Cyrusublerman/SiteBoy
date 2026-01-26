# Phase 2.5: Formula-to-Code Verification — Multifilament Image Print Tool

## Technique 1: SequenceGenerator

**Source:** `blog/ideas/reference documentation/Experiments-main/lib/grid/sequences.js`

**Formula:**
$$
\text{Count}(N, M) = N \times \frac{N^M - 1}{N - 1}
$$

Where:
- N = number of colors/filaments
- M = number of layers per tile
- Count = total valid sequences generated

### Term-by-Term Mapping

| Math Term | Meaning | Expected Code Pattern | Example |
|-----------|---------|----------------------|---------|
| $N$ | Number of colors | Function parameter | `generateSequences(N, M)` |
| $M$ | Number of layers | Function parameter | `generateSequences(N, M)` |
| $N^M$ | Total combinations (including invalid) | Implicit in recursion depth | `gen([], 0)` with depth M |
| $(N^M - 1)$ | Combinations minus all-zero | `isValid()` filter | Rejects `s.every(v => v === 0)` |
| $\frac{N^M - 1}{N - 1}$ | Valid sequences per color | Recursion logic | Gap check prevents invalid |

### Code Verification

**Implementation location:** `lib/grid/sequences.js:24-74`

**Actual code:**
```javascript
export function generateSequences(N, M) {
    const seqs = [];
    
    function isValid(s) {
        if (s.every(v => v === 0)) return false;  // Reject all-empty
        let seenZero = false;
        for (let v of s) {
            if (v === 0) seenZero = true;
            else if (seenZero) return false;  // Gap detected
        }
        return true;
    }
    
    function gen(cur, d) {
        if (d === M) {
            if (isValid(cur)) seqs.push([...cur]);
            return;
        }
        
        if (cur.length > 0 && cur[cur.length - 1] === 0) {
            gen([...cur, 0], d + 1);  // Once zero, only zeros
        } else {
            for (let v = 0; v <= N; v++) {  // 0 or 1..N
                gen([...cur, v], d + 1);
            }
        }
    }
    
    gen([], 0);
    return seqs;
}
```

**Verification:**

| Math Term | Code Expression | Match? |
|-----------|----------------|--------|
| N colors | `for (let v = 0; v <= N; v++)` generates 0..N values | ✓ |
| M layers | Recursion depth `d === M` | ✓ |
| All-empty rejection | `if (s.every(v => v === 0)) return false` | ✓ |
| Gap prevention | `if (seenZero && v !== 0) return false` | ✓ |
| Result count | Matches formula: 4 colors, 4 layers = 340 sequences | ✓ |

---

## Technique 2: ImageQuantizer (Floyd-Steinberg Dithering)

**Source:** `blog/ideas/reference documentation/Experiments-main/lib/quantize/index.js`

**Formula:**
$$
\text{error} = \text{original} - \text{quantized}
$$

$$
\text{diffusion} = \begin{bmatrix}
\_ & \* & \frac{7}{16} \\
\frac{3}{16} & \frac{5}{16} & \frac{1}{16}
\end{bmatrix}
$$

Where:
- ★ = current pixel
- error = color difference after quantization
- Fractions = error weights distributed to neighbors

### Term-by-Term Mapping

| Math Term | Meaning | Expected Code Pattern | Example |
|-----------|---------|----------------------|---------|
| original | Pixel RGB before quantization | `{r, g, b}` from ImageData | `r = data[idx]` |
| quantized | Nearest palette color | `findClosest(original, palette)` | `closest = findClosest(...)` |
| error | Color difference | `original - quantized` per channel | `err_r = r - closest.r` |
| $\frac{7}{16}$ | Right neighbor weight | `error * 7/16` | `(7/16) * err_r` |
| $\frac{3}{16}$ | Bottom-left weight | `error * 3/16` | `(3/16) * err_r` |
| $\frac{5}{16}$ | Bottom weight | `error * 5/16` | `(5/16) * err_r` |
| $\frac{1}{16}$ | Bottom-right weight | `error * 1/16` | `(1/16) * err_r` |

### Code Verification

**Implementation location:** `lib/quantize/index.js:~30-90` (approximate, in quantizeImage function)

**Actual code (simplified excerpt):**
```javascript
export function quantizeImage(imageData, palette, options = {}) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const dither = options.dither !== false;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const original = {
                r: data[idx],
                g: data[idx + 1],
                b: data[idx + 2]
            };
            
            const quantized = findClosest(original, palette);
            
            data[idx] = quantized.r;
            data[idx + 1] = quantized.g;
            data[idx + 2] = quantized.b;
            
            if (dither) {
                const err_r = original.r - quantized.r;
                const err_g = original.g - quantized.g;
                const err_b = original.b - quantized.b;
                
                // Distribute error to 4 neighbors
                distributeError(x + 1, y, err_r * 7/16, err_g * 7/16, err_b * 7/16);
                distributeError(x - 1, y + 1, err_r * 3/16, err_g * 3/16, err_b * 3/16);
                distributeError(x, y + 1, err_r * 5/16, err_g * 5/16, err_b * 5/16);
                distributeError(x + 1, y + 1, err_r * 1/16, err_g * 1/16, err_b * 1/16);
            }
        }
    }
}
```

**Verification:**

| Math Term | Code Expression | Match? |
|-----------|----------------|--------|
| original | `{r: data[idx], g: data[idx+1], b: data[idx+2]}` | ✓ |
| quantized | `findClosest(original, palette)` | ✓ |
| error | `err_r = original.r - quantized.r` (per channel) | ✓ |
| 7/16 right | `distributeError(x+1, y, err * 7/16)` | ✓ |
| 3/16 bottom-left | `distributeError(x-1, y+1, err * 3/16)` | ✓ |
| 5/16 bottom | `distributeError(x, y+1, err * 5/16)` | ✓ |
| 1/16 bottom-right | `distributeError(x+1, y+1, err * 1/16)` | ✓ |

---

## Technique 3: Color Distance (Euclidean)

**Source:** `blog/ideas/reference documentation/Experiments-main/lib/core/utils.js`

**Formula:**
$$
d(c_1, c_2) = \sqrt{(R_1 - R_2)^2 + (G_1 - G_2)^2 + (B_1 - B_2)^2}
$$

### Term-by-Term Mapping

| Math Term | Meaning | Expected Code Pattern | Example |
|-----------|---------|----------------------|---------|
| $c_1$ | First color | Function parameter | `findClosest(c, palette)` |
| $c_2$ | Second color | Palette color | `palette.forEach(p => ...)` |
| $(R_1 - R_2)^2$ | Red channel squared difference | `(c.r - p.r) ** 2` | `const dr2 = (c.r - p.r)**2` |
| $(G_1 - G_2)^2$ | Green channel squared difference | `(c.g - p.g) ** 2` | `const dg2 = (c.g - p.g)**2` |
| $(B_1 - B_2)^2$ | Blue channel squared difference | `(c.b - p.b) ** 2` | `const db2 = (c.b - p.b)**2` |
| $\sqrt{\sum}$ | Euclidean distance | `Math.sqrt(dr2 + dg2 + db2)` | `const dist = Math.sqrt(...)` |

### Code Verification

**Implementation location:** `lib/core/utils.js:102-112`

**Actual code:**
```javascript
export function findClosest(c, palette) {
    let min = Infinity;
    let closest = palette[0];
    
    palette.forEach(p => {
        const dist = Math.sqrt(
            (c.r - p.r) ** 2 + 
            (c.g - p.g) ** 2 + 
            (c.b - p.b) ** 2
        );
        
        if (dist < min) {
            min = dist;
            closest = p;
        }
    });
    
    return closest;
}
```

**Verification:**

| Math Term | Code Expression | Match? |
|-----------|----------------|--------|
| $(R_1 - R_2)^2$ | `(c.r - p.r) ** 2` | ✓ |
| $(G_1 - G_2)^2$ | `(c.g - p.g) ** 2` | ✓ |
| $(B_1 - B_2)^2$ | `(c.b - p.b) ** 2` | ✓ |
| $\sqrt{\sum}$ | `Math.sqrt(sum)` | ✓ |
| $\text{arg min}_i d(c, p_i)$ | `if (dist < min) { min = dist; closest = p; }` | ✓ |

---

## Technique 4: Color Simulation (Averaging)

**Source:** `blog/ideas/reference documentation/Experiments-main/lib/core/utils.js`

**Formula:**
$$
RGB_{\text{result}} = \frac{1}{n} \sum_{i=1}^{n} RGB_{\text{layer}_i}
$$

Where:
- n = number of non-empty layers
- RGB_layer_i = color of filament on layer i

### Term-by-Term Mapping

| Math Term | Meaning | Expected Code Pattern | Example |
|-----------|---------|----------------------|---------|
| n | Count of non-empty layers | `sequence.filter(v => v !== 0).length` | `const count = ...` |
| $RGB_{\text{layer}_i}$ | Filament color | `colours[sequence[i] - 1].h` (hex to RGB) | `const rgb = hex2rgb(...)` |
| $\sum$ | Sum all layer colors | `sum.r += rgb.r` per layer | Loop accumulation |
| $\frac{1}{n}$ | Average | `sum.r / count` | Final division |

### Code Verification

**Implementation location:** `lib/core/utils.js:~65-85` (simColour function)

**Actual code (simplified):**
```javascript
export function simColour(sequence, colours) {
    let sum = {r: 0, g: 0, b: 0};
    let count = 0;
    
    for (let layer of sequence) {
        if (layer === 0) continue;  // Skip empty layers
        
        const hex = colours[layer - 1].h;
        const rgb = hex2rgb(hex);
        
        sum.r += rgb.r;
        sum.g += rgb.g;
        sum.b += rgb.b;
        count++;
    }
    
    return {
        r: Math.round(sum.r / count),
        g: Math.round(sum.g / count),
        b: Math.round(sum.b / count)
    };
}
```

**Verification:**

| Math Term | Code Expression | Match? |
|-----------|----------------|--------|
| n (non-empty count) | `count++` when `layer !== 0` | ✓ |
| $RGB_{\text{layer}_i}$ | `hex2rgb(colours[layer - 1].h)` | ✓ |
| $\sum RGB$ | `sum.r += rgb.r` (per channel) | ✓ |
| $\frac{\sum}{n}$ | `sum.r / count` (with rounding) | ✓ |

---

## Technique 5: STL Box Geometry

**Source:** `blog/ideas/reference documentation/Experiments-main/lib/stl/index.js`

**Formula:**
$$
\text{Box} = 6 \text{ faces} \times 2 \text{ triangles} = 12 \text{ facets}
$$

Each facet:
$$
\text{facet normal } \vec{n}
$$
$$
\quad \text{vertex } (x_0, y_0, z_0)
$$
$$
\quad \text{vertex } (x_1, y_1, z_1)
$$
$$
\quad \text{vertex } (x_2, y_2, z_2)
$$

### Term-by-Term Mapping

| Math Term | Meaning | Expected Code Pattern | Example |
|-----------|---------|----------------------|---------|
| 6 faces | Top, bottom, left, right, front, back | 6 code blocks (2 facets each) | `// Bottom face (Z-)` |
| 2 triangles | Each quad split into 2 triangles | 2 facet definitions per face | Triangle 1 + Triangle 2 |
| $\vec{n}$ | Normal vector (perpendicular) | `facet normal x y z` | `facet normal 0 0 -1` |
| $(x_i, y_i, z_i)$ | Vertex coordinates | `vertex x y z` | `vertex ${x0} ${y0} ${z0}` |

### Code Verification

**Implementation location:** `lib/stl/index.js:78-233`

**Actual code (excerpt - bottom face):**
```javascript
export function generateBox(x0, y0, z0, x1, y1, z1) {
    return `facet normal 0 0 -1
  outer loop
    vertex ${x0} ${y0} ${z0}
    vertex ${x1} ${y0} ${z0}
    vertex ${x1} ${y1} ${z0}
  endloop
endfacet
facet normal 0 0 -1
  outer loop
    vertex ${x0} ${y0} ${z0}
    vertex ${x1} ${y1} ${z0}
    vertex ${x0} ${y1} ${z0}
  endloop
endfacet
...` // + 10 more facets for other faces
}
```

**Verification:**

| Math Term | Code Expression | Match? |
|-----------|----------------|--------|
| 6 faces | Code has 6 pairs of facets | ✓ |
| 2 triangles/face | Each pair shares normal, different vertices | ✓ |
| Normal vectors | `(0,0,-1)`, `(0,0,1)`, `(-1,0,0)`, `(1,0,0)`, `(0,-1,0)`, `(0,1,0)` | ✓ |
| Vertex coords | `${x0} ${y0} ${z0}` template literals | ✓ |
| 12 total facets | 6 faces × 2 triangles | ✓ |

---

## GATE 2.5: Mathematical Correctness

### ❓ For EACH formula, does every term map to code correctly?

**[X] YES** — All terms verified:

1. **Sequence Count:** N, M, validation logic ✓
2. **Floyd-Steinberg:** All 4 error diffusion weights (7/16, 3/16, 5/16, 1/16) ✓
3. **Color Distance:** All 3 RGB channel differences + sqrt ✓
4. **Color Averaging:** Sum and division for all channels ✓
5. **STL Geometry:** All 12 facets with correct normals ✓

### ❓ Are variable names in code consistent with mathematical notation?

**[X] YES** — Clear correspondence:

| Math | Code | Consistent? |
|------|------|-------------|
| N, M | `N`, `M` | ✓ (exact match) |
| error | `err_r`, `err_g`, `err_b` | ✓ (per-channel) |
| $d(c_1, c_2)$ | `dist` | ✓ (distance) |
| $\sum RGB$ | `sum.r`, `sum.g`, `sum.b` | ✓ (accumulator) |
| $(x_0, y_0, z_0)$ | `x0`, `y0`, `z0` | ✓ (exact match) |

All variable names clearly map to mathematical notation or use intuitive abbreviations.

---

## Passing Score: ✅ 100% YES

All formulas verified term-by-term. Code implementations match mathematical specifications exactly. Proceeding to Phase 3.

---

*Phase 2.5 Complete: January 3, 2026*

