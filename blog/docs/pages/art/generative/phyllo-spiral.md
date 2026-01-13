# Phyllo Spiral

Interactive phyllotaxis pattern explorer using the golden angle.

## Overview

Phyllotaxis is the arrangement of leaves, seeds, or other plant parts in spiral patterns. This tool visualizes these patterns using the golden angle (137.5°) and highlights Fibonacci-related structure.

## Mathematical Foundation

### Golden Angle
```
φ = 137.5077...° = 360° × (2 - φ) where φ = (1 + √5) / 2
```

This angle minimizes overlap between successive elements, creating optimal packing.

### Spiral Equation
```javascript
for (let i = 0; i < pointNumber; i++) {
    const angle = rotation * i;  // Default: 137.5°
    const r = (Math.sqrt(i) * radius) / Math.sqrt(pointNumber);
    const x = centerX + r * cos(angle);
    const y = centerY + r * sin(angle);
}
```

### Fibonacci Connection

Points are connected by two sets of spirals:
- **n1 spirals**: Connect every n1-th point
- **n2 spirals**: Connect every n2-th point

When n1 and n2 are consecutive Fibonacci numbers (e.g., 5 and 8), the spirals align perfectly with the phyllotactic pattern.

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| n1 | 5 | First connection interval |
| n2 | 8 | Second connection interval |
| Points | n1 × n2 | Total dots in pattern |
| Rotation | 137.5° | Angle between consecutive points |
| Dot size | 2 | Size of point markers |
| Spiral size | 100% | Scale of pattern |

## Color Customization

- **Background color**
- **Dot color**
- **Number color** (point indices)
- **n1 spiral color** (red default)
- **n2 spiral color** (blue default)

## Display Options

- Toggle point dots
- Toggle point numbers
- Adjust dot size

## Implementation

### Fibonacci Generator
```javascript
class Fibonacci {
    constructor() {
        this.prev = BigInt(0);
        this.current = BigInt(1);
    }
    
    next() {
        let next = this.prev + this.current;
        this.prev = this.current;
        this.current = next;
        return this.current;
    }
}
```

### Drawing Spiral Lines
```javascript
// Connect n1 spirals
for (let i = 0; i < n1; i++) {
    let iterations = Math.floor((pointNumber - i) / n1);
    for (let x = 1; x <= iterations; x++) {
        line(
            points[(x-1) * n1 + i],
            points[x * n1 + i]
        );
    }
}
```

## Interesting Patterns

| n1 | n2 | Pattern |
|----|----|----|
| 1 | 1 | Single spiral |
| 1 | 2 | Simple double |
| 3 | 5 | Fibonacci small |
| 5 | 8 | Fibonacci classic |
| 8 | 13 | Fibonacci dense |
| 13 | 21 | Sunflower-like |
| 21 | 34 | Dense packing |

## Platform

Built with p5.js for interactive graphics.

## Source Reference

- `reference/tools/p5.js/Phyllo_Spiral_2025_09_12_01_22_59/`
- Related: `reference/tools/p5.js/phyllo_2_plane_copy_2025_09_12_01_26_14/`

