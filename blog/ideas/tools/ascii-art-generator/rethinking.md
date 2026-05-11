The basic system is a **glyph feature-extraction pipeline**.

Each glyph is rendered once, normalised into a consistent coordinate space, divided into an `n1 × n2` grid, then each cell is measured across `n3` characteristics.

The result is not just a 9D vector anymore. It becomes:

```txt
n1 × n2 × n3 feature tensor
```

Or, flattened:

```txt
(n1 * n2 * n3)-dimensional feature vector
```

Example:

```txt
grid width  = n1 = 5
grid height = n2 = 7
features    = n3 = 4

total dimensions = 5 * 7 * 4 = 140
```

So each glyph becomes a point in **140-dimensional feature space**.

The structure would be:

```txt
Glyph
└── Grid cell 0
    ├── characteristic 0
    ├── characteristic 1
    ├── characteristic 2
    └── characteristic 3
└── Grid cell 1
    ├── characteristic 0
    ├── characteristic 1
    ├── characteristic 2
    └── characteristic 3
...
```

As a flat vector:

```js
glyphVector = [
  cell0_feature0,
  cell0_feature1,
  cell0_feature2,
  cell0_feature3,

  cell1_feature0,
  cell1_feature1,
  cell1_feature2,
  cell1_feature3,

  ...
]
```

## Basic pipeline

```txt
1. Choose typeface
2. Choose font size
3. Choose glyph set
4. Render each glyph into a fixed canvas
5. Normalise the glyph into a consistent coordinate system
6. Divide the analysis region into n1 × n2 cells
7. Measure n3 characteristics per cell
8. Normalise all measured values to comparable ranges
9. Store each glyph as a feature vector
10. Compare arbitrary target vectors against the glyph library
```

## Normalisation

Normalisation is the critical part.

You need to decide what the grid is aligned to.

There are three useful coordinate systems.

### 1. Em-square normalisation

Every glyph is measured inside the same typographic box.

This preserves typographic position.

Good for:

```txt
typesetting
ASCII-art-like substitution
matching characters by visible placement
keeping punctuation, ascenders, descenders meaningful
```

A full stop remains low. A quote mark remains high. A lowercase `l` stays tall.

This is the best default.

### 2. Glyph-bounding-box normalisation

Each glyph is cropped to its visible bounds, then stretched into the grid.

This compares shape independent of position.

Good for:

```txt
shape matching
glyph classification
finding similar silhouettes
```

But it destroys useful typographic information. A full stop, a comma, and a small circle may become more similar than they should.

### 3. Dual normalisation

Store both.

```js
{
  emGrid: [...],
  croppedGrid: [...]
}
```

This is the strongest system. One feature set captures typographic placement. The other captures pure shape.

## Possible per-cell characteristics

Each cell can store more than brightness.

For `n3`, you could use:

```txt
1. darkness
2. edge density
3. horizontal stroke energy
4. vertical stroke energy
5. diagonal stroke energy
6. centre of mass x
7. centre of mass y
8. local contrast
9. filled-pixel variance
10. distance-to-ink
```

A minimal useful set would be:

```txt
n3 = 4

0: darkness
1: edge density
2: horizontal directionality
3: vertical directionality
```

A stronger set:

```txt
n3 = 8

0: darkness
1: edge density
2: horizontal stroke energy
3: vertical stroke energy
4: diagonal / energy
5: anti-diagonal \ energy
6: local centre of mass x
7: local centre of mass y
```

The point is that each cell no longer just says:

```txt
how dark is this area?
```

It can also say:

```txt
what kind of visual structure exists in this area?
```

## Example data model

For a `5 × 7` grid with `8` features per cell:

```js
const glyphRecord = {
  glyph: "a",
  fontFamily: "Space Mono",
  fontSize: 128,
  gridWidth: 5,
  gridHeight: 7,
  featureCount: 8,

  normalisationMode: "em-square",

  vector: [
    // cell 0
    0.00, 0.02, 0.01, 0.00, 0.00, 0.00, 0.50, 0.50,

    // cell 1
    0.13, 0.24, 0.18, 0.05, 0.02, 0.01, 0.47, 0.62,

    // etc.
  ],

  globalFeatures: {
    totalDarkness: 0.37,
    width: 0.56,
    height: 0.72,
    centreOfMassX: 0.51,
    centreOfMassY: 0.57,
    baselineOffset: 0.14
  }
};
```

The vector length is:

```js
const dimensionCount = gridWidth * gridHeight * featureCount;
```

For the above:

```txt
5 × 7 × 8 = 280 dimensions
```

## Measuring the cells

For each glyph:

```txt
render glyph to pixel buffer
for each grid cell:
    collect pixels inside cell
    calculate feature 0
    calculate feature 1
    calculate feature 2
    ...
    calculate feature n3
append values to vector
```

Pseudo-code:

```js
function extractGlyphVector(imageData, gridWidth, gridHeight, featureExtractors) {
  const vector = [];

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const cellPixels = sampleCell(imageData, x, y, gridWidth, gridHeight);

      for (const extractor of featureExtractors) {
        const value = extractor(cellPixels);
        const normalisedValue = normaliseFeature(value, extractor.name);
        vector.push(normalisedValue);
      }
    }
  }

  return vector;
}
```

## Normalised feature ranges

Every characteristic should be mapped to a predictable range.

Usually:

```txt
0 to 1
```

Examples:

```txt
darkness:
0 = empty
1 = fully black

edge density:
0 = no edges
1 = maximum expected edge activity

horizontal stroke energy:
0 = none
1 = strong horizontal structure

centre of mass x:
0 = left side of cell
0.5 = centre of cell
1 = right side of cell
```

Without normalisation, one feature type can dominate the distance calculation.

For example, raw edge magnitude might have a much larger numeric range than darkness. Then matching would mostly become edge matching, even if that was not intended.

## Comparing glyphs

Once every glyph is converted to the same vector length, matching is simple.

Given:

```txt
targetVector
candidateGlyphVector
```

calculate distance.

Yes, Euclidean distance still works in high dimensions:

```txt
distance = sqrt(sum((target[i] - candidate[i])²))
```

JavaScript:

```js
function euclideanDistance(a, b) {
  let sum = 0;

  for (let i = 0; i < a.length; i++) {
    const difference = a[i] - b[i];
    sum += difference * difference;
  }

  return Math.sqrt(sum);
}
```

But for this kind of system, **weighted distance** is usually better.

```js
function weightedEuclideanDistance(a, b, weights) {
  let sum = 0;

  for (let i = 0; i < a.length; i++) {
    const difference = a[i] - b[i];
    sum += weights[i] * difference * difference;
  }

  return Math.sqrt(sum);
}
```

This allows you to say:

```txt
darkness matters most
edge direction matters slightly less
centre of mass matters only when ink exists
```

## Important issue with empty cells

Some characteristics are meaningless when a cell has no ink.

For example, if a cell is empty, its local centre of mass is undefined.

So each cell should probably include an **occupancy/darkness gate**.

Example:

```txt
if darkness < 0.01:
    centreOfMassX = 0.5
    centreOfMassY = 0.5
    centreOfMassWeight = 0
else:
    calculate centreOfMassX
    calculate centreOfMassY
    centreOfMassWeight = darkness
```

This prevents empty cells from corrupting similarity comparison.

## Better distance model

Instead of treating every feature equally, compare by feature groups.

```txt
total score =
  darknessDistance       * darknessWeight
+ edgeDistance           * edgeWeight
+ directionalityDistance * directionalityWeight
+ massPositionDistance   * massWeight
+ globalFeatureDistance  * globalWeight
```

Example:

```js
const score =
  gridDarknessDistance * 1.0 +
  gridEdgeDistance * 0.5 +
  gridDirectionDistance * 0.4 +
  centreOfMassDistance * 0.25 +
  globalFeatureDistance * 0.5;
```

This is better than a blind 280D Euclidean distance because it lets you control what “similar” means.

## Feature vector layout

Use a deterministic layout.

For example:

```txt
cell-major order
```

```txt
for each cell:
    feature 0
    feature 1
    feature 2
    feature 3
```

This gives:

```txt
[cell0_f0, cell0_f1, cell0_f2, cell0_f3, cell1_f0, cell1_f1, ...]
```

Alternative:

```txt
feature-major order
```

```txt
all darkness values
all edge values
all horizontal values
all vertical values
```

This gives:

```txt
[all_darkness_cells, all_edge_cells, all_horizontal_cells, ...]
```

For analysis and debugging, **feature-major order is often easier**.

For rendering and cell inspection, **cell-major order is often easier**.

I would store the structured tensor and generate flat vectors only when needed.

```js
{
  grid: [
    [
      { darkness: 0.0, edge: 0.0, horizontal: 0.0, vertical: 0.0 },
      { darkness: 0.2, edge: 0.4, horizontal: 0.1, vertical: 0.7 }
    ]
  ],

  vector: [...]
}
```

## Basic system architecture

```txt
Typeface Input
    ↓
Glyph Renderer
    ↓
Normalisation Layer
    ↓
Grid Sampler
    ↓
Feature Extractors
    ↓
Feature Normaliser
    ↓
Glyph Feature Library
    ↓
Similarity Search
    ↓
Closest Glyph / Ranked Glyphs
```

## Matching arbitrary values

Your arbitrary input must use the same structure.

If the glyphs are stored as:

```txt
n1 × n2 × n3
```

then the target must also be:

```txt
n1 × n2 × n3
```

Example:

```js
const target = {
  gridWidth: 5,
  gridHeight: 7,
  featureCount: 8,
  vector: [/* 280 values */]
};
```

Then:

```js
function findClosestGlyph(targetVector, glyphLibrary, weights) {
  let bestGlyph = null;
  let bestScore = Infinity;

  for (const glyphRecord of glyphLibrary) {
    const score = weightedEuclideanDistance(
      targetVector,
      glyphRecord.vector,
      weights
    );

    if (score < bestScore) {
      bestScore = score;
      bestGlyph = glyphRecord;
    }
  }

  return {
    glyph: bestGlyph.glyph,
    score: bestScore,
    record: bestGlyph
  };
}
```

## Recommended MVP

Use:

```txt
n1 = 5
n2 = 7
n3 = 4
```

Features:

```txt
0. darkness
1. edge density
2. horizontal stroke energy
3. vertical stroke energy
```

This gives:

```txt
5 × 7 × 4 = 140 dimensions
```

That is enough to distinguish glyphs much better than a 3×3 darkness-only system, while still being simple enough to inspect visually.

Then add global features:

```txt
total darkness
glyph width
glyph height
centre of mass x
centre of mass y
baseline-relative vertical position
```

## Core model

The system is:

```txt
glyph → normalised raster → n1×n2 grid → n3 features per cell → feature tensor → flattened vector → similarity search
```

Mathematically:

```txt
G = glyph
F(G) = vector in R^(n1 × n2 × n3)
```

Each glyph becomes a vector in high-dimensional space.

An arbitrary target also becomes a vector in the same space.

Closest glyph is:

```txt
argmin distance(target, glyphVector)
```

Meaning:

```txt
return the glyph whose feature vector has the smallest distance from the target feature vector
```
