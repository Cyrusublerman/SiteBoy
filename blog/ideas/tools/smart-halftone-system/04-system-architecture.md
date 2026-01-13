# Smart Halftone System — System Architecture

## 1. Module Chain Architecture

```
Input Source ──▶ Normalize ──▶ Tone Quantizer
                                    │
                 ┌──────────────────┴──────────────────┐
                 ▼                                     ▼
          Direction Field                        Tone Field
          (Gradient/RD)                          T(x,y)
                 │                                     │
                 ▼                                     │
          Line Coordinate                              │
             u(x,y)                                    │
                 │                                     │
                 └──────────────────┬──────────────────┘
                                    ▼
                          Line Family Generator
                                    │
                                    ▼
                            Pattern Layer
                                    │
                                    ▼
                                 Canvas
```

## 2. Style Recipes

### Base Multi-Family Line Halftone
```
ScalarInput → Normalize → ToneQuantizer → LineFamilyGenerator
```

### Smart Image-Driven
```
Image → GradientField → TangentField → LocalLineCoordinate
              ↓
       ToneQuantizer → LineFamilyGenerator
```

### Topographic Contour
```
HeightField → Normalize → IsoContourExtractor → ContourGenerator
```

### RD-Modulated
```
InitialConditions → GrayScott → Normalize → DomainWarp → LineFamilyGenerator
```

## 3. Performance

| Operation | Target |
|-----------|--------|
| RD step | 5ms |
| Gradient field | 10ms |
| Line evaluation | 8ms/frame |
| Contour extraction | 15ms |

