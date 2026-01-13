# Hamming Distance

## 1. Overview
Hamming distance is a metric that counts the number of positions at which corresponding symbols differ between two strings of equal length. Originally developed for error detection in telecommunications, it is widely used in coding theory, cryptography, and similarity comparison for binary data.

## 2. Mathematical Definition

### 2.1 For Binary Strings
Given two binary strings \(x\) and \(y\) of length \(n\):

$$d_H(x, y) = \sum_{i=1}^{n} |x_i - y_i| = \sum_{i=1}^{n} (x_i \oplus y_i)$$

Where \(\oplus\) is XOR. Equivalently:
$$d_H(x, y) = \text{popcount}(x \oplus y)$$

### 2.2 For General Strings
For strings over any alphabet:

$$d_H(x, y) = |\{i : x_i \neq y_i\}|$$

### 2.3 Properties
- **Non-negative**: \(d_H(x, y) \geq 0\)
- **Identity**: \(d_H(x, y) = 0 \iff x = y\)
- **Symmetry**: \(d_H(x, y) = d_H(y, x)\)
- **Triangle inequality**: \(d_H(x, z) \leq d_H(x, y) + d_H(y, z)\)
- **Bounded**: \(0 \leq d_H(x, y) \leq n\)

## 3. Computation Methods

### 3.1 Naive (O(n))
```
function hammingDistance(a, b):
    if len(a) != len(b): error
    count = 0
    for i in range(len(a)):
        if a[i] != b[i]:
            count++
    return count
```

### 3.2 XOR + Popcount (Efficient for Integers)
```
function hammingDistance(a, b):
    xor = a ^ b
    return popcount(xor)
```

### 3.3 Popcount Implementations
**Lookup table** (fast, memory):
```
table = precompute counts for 0-255
popcount(x) = table[x & 0xFF] + table[(x >> 8) & 0xFF] + ...
```

**Bit manipulation** (no memory):
```
function popcount(x):
    x = x - ((x >> 1) & 0x55555555)
    x = (x & 0x33333333) + ((x >> 2) & 0x33333333)
    x = (x + (x >> 4)) & 0x0F0F0F0F
    return (x * 0x01010101) >> 24
```

**Hardware instruction** (fastest):
```
__builtin_popcount(x)  // GCC
_mm_popcnt_u32(x)      // x86 SSE4.2
```

## 4. Applications

### 4.1 Error Detection/Correction
- **Hamming codes**: Detect and correct single-bit errors
- **Minimum distance**: \(d_{\min}\) of code determines error capability
  - Detect up to \(d_{\min} - 1\) errors
  - Correct up to \(\lfloor(d_{\min} - 1)/2\rfloor\) errors

### 4.2 Similarity Matching
For binary feature vectors:
$$\text{similarity} = 1 - \frac{d_H(x, y)}{n}$$

### 4.3 Image Comparison
- **Perceptual hashing**: Compare phash/dhash fingerprints
- **Template matching**: Binary pattern comparison
- **Glyph selection**: Find best-matching character for image region

### 4.4 DNA Sequence Analysis
Count nucleotide substitutions between sequences.

### 4.5 Cryptography
- Analyze cipher security (avalanche effect)
- Side-channel attack resistance

## 5. Related Metrics

### 5.1 Normalized Hamming Distance
$$d_{H,\text{norm}}(x, y) = \frac{d_H(x, y)}{n}$$

Range: [0, 1]

### 5.2 Hamming Weight
Number of non-zero symbols in a string:
$$w_H(x) = d_H(x, \mathbf{0}) = |\{i : x_i \neq 0\}|$$

### 5.3 Levenshtein Distance
Edit distance allowing insertions and deletions (more general than Hamming).

### 5.4 Jaccard Distance
For sets: \(1 - |A \cap B| / |A \cup B|\)

## 6. Hamming Ball
The set of all strings within distance \(r\) of a center string:
$$B_r(x) = \{y : d_H(x, y) \leq r\}$$

Size (for binary alphabet):
$$|B_r(x)| = \sum_{i=0}^{r} \binom{n}{i}$$

## 7. Use in ASCII Art Generation
For matching image cells to glyphs:
1. Convert cell to binary feature vector (thresholded gradient)
2. Convert each glyph to binary feature vector
3. Select glyph with minimum Hamming distance to cell

```
function selectGlyph(cell_features, glyph_database):
    best_glyph = null
    best_distance = infinity
    for glyph in glyph_database:
        d = hammingDistance(cell_features, glyph.features)
        if d < best_distance:
            best_distance = d
            best_glyph = glyph
    return best_glyph
```

## 8. References
- Hamming, Richard W. "Error detecting and error correcting codes." Bell System Technical Journal 29.2 (1950): 147-160.
- "Hamming distance." Wikipedia. https://en.wikipedia.org/wiki/Hamming_distance

