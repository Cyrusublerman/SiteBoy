### Cross-font size equivalence

The Font Size Comparison tool solves the following problem: given Font A rendered at \(s_A\) px and Font B rendered at \(s_B\) px, find \(s_B'\) such that Font B appears optically the same size as Font A, using either cap height or x-height as the equivalence criterion.

Measuring cap height as a function of `font-size`:

$$h_{\text{cap}}(f, s) = \texttt{measureText}_f(\text{'H'}, s)\texttt{.actualBoundingBoxAscent}$$

where \(f\) is the font family and \(s\) is the pixel size. The target `font-size` for Font B is:

$$s_B' = s_A \cdot \frac{h_{\text{cap}}(A, s_A)}{h_{\text{cap}}(B, s_B)} \cdot \frac{s_B}{s_A} = s_B \cdot \frac{h_{\text{cap}}(A, s_A)}{h_{\text{cap}}(B, s_B)}$$

More generally, defining the *measured size ratio*:

$$R = \frac{h_{\text{metric}}(A, s_A)}{h_{\text{metric}}(B, s_B)}$$

the equivalent size for Font B at the chosen metric is:

$$s_B' = s_B \cdot R$$

When \(R > 1\), Font B appears smaller than Font A at the same CSS size; Font B must be enlarged. When \(R < 1\), Font B appears larger.

### Character ratio

The comparison also reports the *character width ratio*:

$$R_w = \frac{\texttt{measureText}_A(\text{'H'}, s_A)\texttt{.width}}{\texttt{measureText}_B(\text{'H'}, s_B')\texttt{.width}}$$

This indicates how similar the advance widths are at the optically equivalent sizes — relevant for detecting whether swapping a fallback font will cause text reflow.

### Implementation

```javascript
function computeEquivalentSize(fontA, sizeA, fontB, sizeB, metric = 'cap') {
    const letter = metric === 'cap' ? 'H' : 'x';
    const ctx = new OffscreenCanvas(1, 1).getContext('2d');

    ctx.font = `${sizeA}px "${fontA}"`;
    const hA = ctx.measureText(letter).actualBoundingBoxAscent;

    ctx.font = `${sizeB}px "${fontB}"`;
    const hB = ctx.measureText(letter).actualBoundingBoxAscent;

    return sizeB * (hA / hB);
}
```

`OffscreenCanvas` is used here to avoid polluting the main canvas context state. The function is synchronous; font loading must be complete before it is called.

### Practical use

A design system specifying body text at 16 px in *Atkinson Hyperlegible* can use this ratio to find the equivalent `font-size` for a fallback monospace font, ensuring that the fallback does not shift text length or apparent size. This is the same calculation used internally by the SiteBoy F-system when font tokens are derived.
