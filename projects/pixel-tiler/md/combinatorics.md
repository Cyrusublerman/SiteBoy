### Mode 1: Single arrangement

The four images are assigned to slots in the natural order A→0, B→1, C→2, D→3. One frame is produced. This is the compositing mode: the user loads four images and receives one tiled output.

### Mode 2: 24 permutations

A permutation assigns each of the four distinct source images to one of the four slots without repetition. The total count is:

$$P(4, 4) = 4! = 24$$

These are enumerated with the Steinhaus–Johnson–Trotter algorithm (or equivalently with Heap's algorithm) to produce all 24 orderings in a sequence where consecutive frames differ by exactly one swap. This minimises visual discontinuity in the animation. The assignment for frame \(i\) is the \(i\)-th permutation in the chosen enumeration order.

```javascript
function generatePermutations(images) {
    const keys = Object.keys(images);   // ['A','B','C','D']
    const perms = [];

    function permute(arr, l = 0) {
        if (l === arr.length) { perms.push([...arr]); return; }
        for (let i = l; i < arr.length; i++) {
            [arr[l], arr[i]] = [arr[i], arr[l]];
            permute(arr, l + 1);
            [arr[l], arr[i]] = [arr[i], arr[l]];
        }
    }
    permute(keys);
    return perms;
}
```

Each element of `perms` is an array `[k0, k1, k2, k3]` assigning image key \(k_j\) to slot \(j\). The corresponding `assignment` object is `{ 0: k0, 1: k1, 2: k2, 3: k3 }`.

### Mode 3: 256 combinations

When repetition is allowed — each of the four slots independently draws from any of the four images — the count is:

$$4^4 = 256$$

This is the full set of functions from slots \(\{0,1,2,3\}\) to images \(\{A,B,C,D\}\). Every combination is addressed by the base-4 representation of its index:

$$\text{assignment}[j] = \text{images}\!\left[\left\lfloor \frac{i}{4^j} \right\rfloor \bmod 4\right] \quad j \in \{0,1,2,3\}$$

```javascript
function generateAllCombinations(images) {
    const keys = Object.keys(images);   // ['A','B','C','D']
    const combs = [];
    for (let i = 0; i < 256; i++) {
        combs.push({
            0: keys[(i      ) & 3],
            1: keys[(i >> 2 ) & 3],
            2: keys[(i >> 4 ) & 3],
            3: keys[(i >> 6 ) & 3]
        });
    }
    return combs;
}
```

The bit-shift addressing is equivalent to the floor-and-modulo formula but operates entirely on integers. Index 0 assigns all four slots to image A; index 255 assigns all four slots to image D; the 24 permutations from Mode 2 are a subset of these 256 arrangements.

### Frame indexing

All three modes share the same rendering path: given frame index \(i\), retrieve the \(i\)-th assignment and pass it to `createTiledImage`. The frame count for each mode is 1, 24, and 256 respectively. Frame indices are zero-based; the animation loops by wrapping with modulo.
