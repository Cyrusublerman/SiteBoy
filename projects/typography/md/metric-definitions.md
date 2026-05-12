### The baseline and the coordinate system

The Canvas 2D baseline is the reference line from which all TextMetrics distances are measured. Distances *above* the baseline are positive ascents; distances *below* the baseline are positive descents (both are reported as positive numbers, the sign of directionality is encoded in the field name).

The coordinate system origin for `measureText` is the point where the anchor character is placed — the leftmost edge of its advance, at the baseline. Metrics are relative to this origin.

### Cap height

$$h_{\text{cap}} = \texttt{measureText('H').actualBoundingBoxAscent}$$

The distance from the baseline to the top ink boundary of an uppercase 'H'. This is the metric designers use to define optical uppercase size. Two fonts at the same cap height look the same size for text consisting primarily of uppercase letters.

### x-height

$$h_x = \texttt{measureText('x').actualBoundingBoxAscent}$$

The distance from the baseline to the top ink boundary of a lowercase 'x'. Typefaces with large x-height ratios (\(h_x / h_{\text{cap}} \gtrsim 0.72\)) appear larger and more legible at small sizes. x-height is the primary perceptual size metric for body text.

### Ascent and descent

The *font bounding box* ascent and descent define the full typographic line box — the vertical extent that the browser reserves for every line of text at this font/size combination, regardless of the actual glyph content:

$$h_{\text{line}} = \texttt{fontBoundingBoxAscent} + \texttt{fontBoundingBoxDescent}$$

The ratio \(h_{\text{line}} / \texttt{fontSize}\) is the typographic leading factor. For most text fonts this is between 1.0 and 1.4.

### Advance width and side bearings

The advance width `m.width` is the total horizontal distance the cursor advances after the character, including left and right side bearings. The net ink width is:

$$w_{\text{ink}} = \texttt{actualBoundingBoxRight} + \texttt{actualBoundingBoxLeft}$$

(both fields are positive; `Left` is the distance from the advance origin to the left ink boundary, `Right` to the right boundary). The side bearings are:

$$\text{LSB} = \texttt{actualBoundingBoxLeft}, \quad \text{RSB} = \texttt{width} - \texttt{actualBoundingBoxRight}$$

### Visualisation

The Font Analysis tool overlays each metric as a horizontal rule on the letter canvas:

| Line colour | Metric |
|---|---|
| Green | Baseline |
| Red | `fontBoundingBoxAscent` (ascent) |
| Blue | `fontBoundingBoxDescent` (descent) |
| Magenta | Cap height (`H` actual ascent) |
| Yellow | x-height (`x` actual ascent) |

The letter is rendered at the user's chosen size; the canvas is sized to `fontBoundingBoxAscent + fontBoundingBoxDescent + 2×padding` so the full line box is visible.
