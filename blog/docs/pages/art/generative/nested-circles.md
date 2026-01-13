# Nested Circles

Animated recursive rolling circle visualization.

## Overview

Creates hypnotic patterns by nesting circles that roll within each other. Each circle orbits inside its parent, creating complex Spirograph-like patterns.

## Mathematical Foundation

### Rolling Circle
Each circle rolls inside the previous one:
```javascript
const t = frame * circleIndex * 0.003 * animationSpeed;

const x = prevX + radius * Math.cos(t);
const y = prevY + radius * Math.sin(t);
```

### Radius Progression
```javascript
let radius = largestRadius;
for (let i = 0; i < numCircles; i++) {
    // Draw circle at calculated position
    radius -= radiusDecrement;
}
```

## Parameters

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| Count | 10-200 | 100 | Number of nested circles |
| Largest Radius | 100-400 | 350 | Outermost circle size |
| Radius Step | 1-10 | 3.5 | Decrease per circle |
| Animation Speed | 0.1-3.0 | 1.0 | Rotation multiplier |

## Display Modes

### 1. Circle Mode
Draws complete circles:
```javascript
ctx.beginPath();
ctx.arc(x, y, radius, 0, TWO_PI);
ctx.stroke();
```

### 2. Square Mode
Draws rotated squares:
```javascript
ctx.save();
ctx.translate(x, y);
ctx.rotate(t);
ctx.strokeRect(-radius, -radius, radius * 2, radius * 2);
ctx.restore();
```

### 3. Lines Mode
Connects circle centers:
```javascript
ctx.moveTo(prevX, prevY);
ctx.lineTo(x, y);
```

## Rendering

### Motion Blur Effect
```javascript
// Fade previous frame
ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

### Center Origin
```javascript
ctx.translate(centerX, centerY);
```

## Animation

Uses `AnimationFoundation.AnimationLoop`:
```javascript
animator = new AnimationFoundation.AnimationLoop({
    fps: 60,
    onFrame: () => {
        frame++;
        tool.triggerDraw();
    }
});
```

## Visual Effects

### Color Cycling
```javascript
const hue = (frame + circleIndex * 3) % 360;
ctx.strokeStyle = `hsl(${hue}, 70%, 50%)`;
```

### Line Width Gradient
```javascript
ctx.lineWidth = 1 + (i / numCircles) * 2;
```

## Use Cases

- Ambient visualizations
- Mathematical demonstrations
- Generative art
- Loading animations

## Source Reference

Based on: `reference/QuickToolRebuildReference/Generative Art/circles/`

