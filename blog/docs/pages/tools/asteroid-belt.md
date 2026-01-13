# Asteroid Belt Tool

Animated asteroid belt visualization with procedural generation.

## Overview

Canvas-based visualization of an asteroid belt with adjustable parameters and smooth rotation animation.

## Features

### Belt Parameters
| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| Inner Radius | 0.5-5.0 | 2.2 | Inner edge (AU scale) |
| Outer Radius | 1.0-8.0 | 3.2 | Outer edge (AU scale) |
| Particle Count | 50-2000 | 300 | Number of asteroids |

### Display Controls
| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| Scale | 20-200 | 80 | Zoom level |
| Background | Color | #000000 | Canvas background |

### Animation
| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| Rotation | Toggle | Off | Enable belt rotation |
| Speed | 0.1-5.0 | 0.5 | Rotation speed |

## Particle Generation

### Random Distribution
```javascript
function generateParticles(values) {
    particles = [];
    for (let i = 0; i < values.particleCount; i++) {
        particles.push({
            angle: Math.random() * TWO_PI,
            distance: innerRadius + Math.random() * (outerRadius - innerRadius),
            color: Math.random() < 0.5 ? 'white' : 'black'
        });
    }
}
```

### Noise Pattern
Alternating black/white particles create a speckled noise effect mimicking the chaotic nature of asteroid distribution.

## Rendering

### Coordinate Transform
```javascript
// Center origin
ctx.translate(centerX, centerY);

// Apply rotation
ctx.rotate(rotationAngle);

// Draw particles
for (const p of particles) {
    const x = p.distance * scale * Math.cos(p.angle);
    const y = p.distance * scale * Math.sin(p.angle);
    ctx.fillStyle = p.color;
    ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
}
```

### Position Caching
Positions are cached after generation for performance:
```javascript
if (!cached) {
    cached = particles.map(p => ({
        x: p.distance * Math.cos(p.angle),
        y: p.distance * Math.sin(p.angle),
        color: p.color
    }));
}
```

## Animation System

Uses `AnimationFoundation.AnimationLoop`:
```javascript
animator = new AnimationFoundation.AnimationLoop({
    fps: 60,
    onFrame: (deltaTime) => {
        if (rotationEnabled) {
            rotationAngle += 0.001 * speed;
            tool.triggerDraw();
        }
    }
});
```

## Actions

- **Regenerate**: Create new random particle distribution
- **Clear**: Remove all particles

## Astronomical Context

Based on the real asteroid belt between Mars and Jupiter:
- Inner edge: ~2.2 AU
- Outer edge: ~3.2 AU
- Contains millions of objects

## ToolBase Format

Implements the declarative ToolBase pattern:
```javascript
const TOOL_CONFIG = {
    title: 'ASTEROID BELT',
    sidebar: [...],
    canvas: { size: 420 },
    onInit: function(values) {...},
    onUpdate: function(key, value, values) {...},
    onDraw: function(ctx, canvas, values) {...}
};
```

## Source Reference

`assets/js/tools/asteroid-belt-tool.js`

