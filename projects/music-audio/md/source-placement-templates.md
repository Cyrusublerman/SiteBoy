### Purpose

Template positions define where wave sources are placed on the canvas when a chord or configuration preset is applied. They distribute sources spatially so that the interference pattern is geometrically coherent with the harmonic structure. A chord with three voices placed symmetrically about the canvas centre produces a pattern with three-fold rotational symmetry; the same chord placed at random positions does not.

### Template catalogue

| Template | Count | Geometry |
|---|---|---|
| `circle6` | 6 | Regular hexagon inscribed in 80% of the smaller canvas dimension |
| `circle12` | 12 | Regular 12-gon, same radius |
| `grid3` | 9 | 3×3 uniform grid |
| `grid4` | 16 | 4×4 uniform grid |
| `star5` | 5 | Regular pentagram vertices |
| `star8` | 8 | Regular octagram vertices |
| `corners` | 4 | Four corners at 90% of canvas extent |
| `cross` | 5 | Centre plus four cardinal compass points |

### Position generation

For a circular template of \(n\) points at radius \(r\) on a canvas of width \(W\) and height \(H\):

$$x_k = \frac{W}{2} + r \cdot \cos\!\left(\frac{2\pi k}{n}\right), \quad y_k = \frac{H}{2} + r \cdot \sin\!\left(\frac{2\pi k}{n}\right), \quad k \in *0, n)$$

The first source is placed at the top (\(\theta = -\pi/2\)) by adding a phase offset:

$$\theta_k = \frac{2\pi k}{n} - \frac{\pi}{2}$$

For the `grid3` template at spacing \(d = W/4\) centred at \((W/2, H/2)\):

$$x_{i,j} = \frac{W}{2} + (j - 1) \cdot d, \quad y_{i,j} = \frac{H}{2} + (i - 1) \cdot d, \quad i, j \in \{0, 1, 2\}$$

### Chord-to-template mapping

When the user applies a chord template, the implementation:

1. Fetches the chord's semitone offsets (see [Equal Temperament*).
2. Generates template positions for a count equal to the chord's note count (or the nearest template size).
3. For each `(position, semitone)` pair, creates one `WaveSource` object and assigns the corresponding frequency.
4. If Web Audio is active, creates one `OscillatorNode` per source.

```javascript
function applyChordTemplate(canvas, baseHz, chordName, templateName) {
    const semitones  = CHORDS[chordName];
    const positions  = getTemplatePositions(canvas, templateName, semitones.length);
    const newSources = semitones.map((n, i) => ({
        x:    positions[i].x,
        y:    positions[i].y,
        freq: baseHz * 2 ** (n / 12),
        amp:  defaultAmp
    }));
    sources.push(...newSources);
    if (audioActive) createOscillators(newSources);
}
```
