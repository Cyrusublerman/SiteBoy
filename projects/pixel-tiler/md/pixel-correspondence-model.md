### 2×2 tile mapping

The fundamental operation maps each output pixel at \((x_{\text{out}}, y_{\text{out}})\) to exactly one pixel in exactly one source image, determined by the parity of the output coordinates:

$$\text{slot}(x, y) = 2 \cdot (y \bmod 2) + (x \bmod 2)$$

This gives slot indices 0 (A: even column, even row), 1 (B: odd column, even row), 2 (C: even column, odd row), 3 (D: odd column, odd row). The corresponding source pixel is sampled at half the output coordinate:

$$x_{\text{src}} = \left\lfloor \frac{x_{\text{out}}}{2} \right\rfloor, \quad y_{\text{src}} = \left\lfloor \frac{y_{\text{out}}}{2} \right\rfloor$$

For an output canvas of \(2W \times 2H\) pixels, this scheme reads exactly \(W \times H\) pixels from each source, so all four images contribute equally to the output area. No sub-pixel interpolation is applied; each output pixel takes the exact value of its source counterpart.

### Normalisation

The four source images are not required to share dimensions. Before tiling, all images are normalised to the smallest common dimensions:

$$W_{\text{common}} = \min(W_A, W_B, W_C, W_D), \quad H_{\text{common}} = \min(H_A, H_B, H_C, H_D)$$

Normalisation is performed by drawing each image onto a canvas of size \(W_{\text{common}} \times H_{\text{common}}\) with `drawImage`, which rescales and crops. The normalised `ImageData` buffers are stored as typed arrays in memory and reused across all frame renders.

```javascript
function prepareImages(images) {
    const W = Math.min(...Object.values(images).map(img => img.naturalWidth));
    const H = Math.min(...Object.values(images).map(img => img.naturalHeight));

    const off = document.createElement('canvas');
    [off.width, off.height] = [W, H];
    const ctx = off.getContext('2d');

    return Object.fromEntries(Object.entries(images).map(([key, img]) => {
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(img, 0, 0, W, H);
        return [key, ctx.getImageData(0, 0, W, H)];
    }));
}
```

### Compositing

The tiling operation itself is a single pass over the \(2W \times 2H\) output buffer. The four normalised `data` arrays (each `Uint8ClampedArray` of length \(4WH\)) are indexed directly:

```javascript
function createTiledImage(frames, W, H, assignment) {
    // assignment: { 0: 'A', 1: 'B', 2: 'C', 3: 'D' }
    const out = new Uint8ClampedArray(4 * 2*W * 2*H);
    for (let y = 0; y < 2*H; y++) {
        for (let x = 0; x < 2*W; x++) {
            const slot = (y & 1) * 2 + (x & 1);     // 0..3
            const key  = assignment[slot];             // 'A'|'B'|'C'|'D'
            const src  = frames[key].data;
            const sx   = x >> 1, sy = y >> 1;
            const si   = (sy * W + sx) * 4;
            const di   = (y * 2*W + x) * 4;
            out[di]   = src[si];
            out[di+1] = src[si+1];
            out[di+2] = src[si+2];
            out[di+3] = src[si+3];
        }
    }
    return new ImageData(out, 2*W, 2*H);
}
```

The bitwise operations (`x & 1`, `x >> 1`) replace modulo and division in the hot loop. On a 1024×1024 normalised source set, the output is 2048×2048 (≈ 4M pixels × 4 channels = 16 MB), and the tiling pass completes in under 50 ms on a mid-range device in a single-threaded context.
