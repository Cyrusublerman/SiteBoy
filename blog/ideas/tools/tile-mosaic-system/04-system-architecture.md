# Tile Mosaic System — System Architecture

## 1. Data Flow

```
Parameters ──▶ Layout Engine ──▶ Macro-Tile Rects
                                       │
                                       ▼
                               Tile Grammar ──▶ Tile Type Assignment
                                       │
                                       ▼
                               Sprite Generator ──▶ Cached Sprites
                                       │
                                       ▼
                               Animation State ──▶ Transforms
                                       │
                                       ▼
                                   Renderer ──▶ Canvas
```

## 2. Data Types

```typescript
interface MacroTile {
    x: number;
    y: number;
    w: number;
    h: number;
    tileType: 'concentric' | 'wedge' | 'stripe' | 'solid' | 'texture' | 'micro';
    colorIndex: number;
    sprite: OffscreenCanvas;
}

interface LayoutState {
    tiles: MacroTile[];
    morphTarget: MacroTile[] | null;
    morphProgress: number;
}
```

## 3. Caching Strategy

| Asset | Cache Key | Rebuild Trigger |
|-------|-----------|-----------------|
| Tile sprites | `${type}_${size}_${palette}` | Rebuild Tiles button |
| Layout | `${cols}_${rows}_${mode}_${seed}` | Rebuild Layout button |
| Noise texture | `${seed}_${size}` | Seed change |

## 4. Performance Budget

| Operation | Target |
|-----------|--------|
| Sprite generation | 50ms (one-time) |
| Layout generation | 10ms |
| Morph interpolation | 1ms |
| Frame render | 8ms |

