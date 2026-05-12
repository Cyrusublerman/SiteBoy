### The sequence space

A calibration grid must contain every distinct colour that can be produced by the selected filament set across the chosen layer count. For \(c\) filaments and \(L\) total layers with \(b\) fixed base layers, the number of variable layers is \(v = L - b\). The number of distinct variable-layer sequences is:

$$N = c^v$$

Each sequence is an element of \(\{1, \ldots, c\}^v\) — a \(v\)-tuple of filament indices. For example, with \(c = 3\) filaments and \(v = 2\) variable layers: \(N = 9\) sequences, enumerated as \(\{(1,1), (1,2), (1,3), (2,1), \ldots, (3,3)\}\).

### Base-layer cycling

The \(b\) base layers are fixed and cycle through the filaments in selection order, ensuring that every sequence in the grid has some contribution from all selected filaments:

$$f_j = ((j \bmod c) + 1), \quad j \in [0, b)$$

For \(c = 3\) and \(b = 2\): layer 0 uses filament 1, layer 1 uses filament 2.

### Variable-layer enumeration

Sequence index \(i \in [0, N)\) is decoded as a base-\(c\) number. Layer \(j\) of sequence \(i\) (where \(j \geq b\)) uses filament:

$$f_j = \left\lfloor \frac{i}{c^{j-b}} \right\rfloor \bmod c + 1$$

This is the standard positional notation: the least significant base-\(c\) digit of \(i\) determines the first variable layer, the next digit the second, and so on:

```javascript
function generateSequences(c, L, b) {
    const v = L - b;
    const N = c ** v;
    return Array.from({ length: N }, (_, i) => {
        const seq = [];
        // Base layers
        for (let j = 0; j < b; j++) seq.push((j % c) + 1);
        // Variable layers
        for (let j = 0; j < v; j++) {
            seq.push(Math.floor(i / c ** j) % c + 1);
        }
        return seq;
    });
}
```

### Practical scale

The tile count grows exponentially. With a default tile size of 10 mm, a 2 mm gap, and a 220×220 mm print bed:

| Config | Sequences | Grid size | Fits 220×220? |
|---|---|---|---|
| 2c 3L 1b | \(2^2 = 4\) | 2×2 | Yes |
| 3c 4L 2b | \(3^2 = 9\) | 3×3 | Yes |
| 4c 4L 2b | \(4^2 = 16\) | 4×4 | Yes |
| 4c 6L 2b | \(4^4 = 256\) | 16×16 | Requires 220 mm+ |
| 5c 4L 2b | \(5^2 = 25\) | 5×5 | Yes |
| 10c 3L 1b | \(10^2 = 100\) | 10×10 | Borderline |

Beyond approximately 100–200 tiles the grid exceeds the scan constraint (A4 flatbed = 200×200 mm effective), requiring multi-page printing.
