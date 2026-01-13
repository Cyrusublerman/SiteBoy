# ASCII Art Generator — System Architecture

## 1. Module Pipeline

```
┌─────────────────┐
│  GlyphSampler   │──▶ Font → Render → Features
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  GlyphFeatureDB │──▶ Indexed by density, orientation
└─────────────────┘
         │
         │
┌─────────────────┐
│ImagePreprocessor│──▶ Image → Grayscale → Tiles
└─────────────────┘
         │
         ▼
┌─────────────────┐
│TileFeatureExtractor│──▶ Per-tile features
└─────────────────┘
         │
         ▼
┌─────────────────┐
│     Matcher     │──▶ Cost function → Best glyph
└─────────────────┘
         │
         ▼
┌─────────────────┐
│CoherenceEngine  │──▶ Spatial refinement
└─────────────────┘
         │
         ▼
┌─────────────────┐
│    Renderer     │──▶ ASCII grid output
└─────────────────┘
```

## 2. Data Types

```typescript
interface GlyphEntry {
    char: string;
    unicode: number;
    features: GlyphFeatures;
}

interface GlyphDB {
    glyphs: GlyphEntry[];
    densityBuckets: Map<number, GlyphEntry[]>;
    orientationBuckets: Map<number, GlyphEntry[]>;
}

interface TileGrid {
    width: number;
    height: number;
    tiles: Array<Array<{
        features: GlyphFeatures;
        matchedGlyph: string;
        cost: number;
    }>>;
}
```

## 3. Processing Pipeline

| Stage | Input | Output | One-Time |
|-------|-------|--------|----------|
| Font render | Font file | Glyph bitmaps | ✅ |
| Feature extract | Bitmaps | GlyphDB | ✅ |
| Image preprocess | User image | Tile grid | Per-image |
| Tile features | Tiles | Features | Per-image |
| Matching | Features, DB | Glyph assignments | Per-image |
| Coherence | Grid | Refined grid | Optional |
| Render | Grid | ASCII text | Per-image |

## 4. Candidate Filtering

Restrict search space:
- Density: \( |D_g - D_t| < threshold \)
- Orientation: If \( M_t \) low → non-directional glyphs
- Use bucket lookup for O(1) filtering

