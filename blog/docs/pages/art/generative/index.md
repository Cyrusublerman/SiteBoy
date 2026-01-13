# Generative Art Pages

Interactive mathematical visualizations and procedural animations.

## Categories

### Parametric Curves
- **[Lissajous Curves](./lissajous.md)** - Harmonic parametric equations with modulation
- **[Harmonics](./harmonics.md)** - Animated harmonic ratio explorer

### Wave Patterns
- **[Cymatics](./cymatics.md)** - Wave interference simulation with audio
- **[Wave Interference](./wave-interference.md)** - 2D spatial wave equations

### Geometric Patterns
- **[Nested Circles](./nested-circles.md)** - Recursive rolling circle animation
- **[Squares](./squares.md)** - Nested square transformations
- **[Torus](./torus.md)** - 3D torus with surface spirals
- **[Clock](./clock.md)** - Animated clock visualization

### Color & Grid
- **[Colour Square](./colour-square.md)** - Interactive color grid exploration

### Phyllo Spirals (p5.js)
- **[Phyllo Spiral](./phyllo-spiral.md)** - Phyllotaxis pattern explorer
- **[Spiral N-gon 3D](./spiral-ngon-3d.md)** - 3D spiral on N-gon cross-section

---

## Common Patterns

### Animation Loop
All generative art uses the **AnimationFoundation** system:

```javascript
const animator = new AnimationFoundation.AnimationLoop({
    fps: 60,
    onFrame: (deltaTime) => {
        // Update state
        // Redraw
    }
});
animator.start();
```

### Canvas Setup
```javascript
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });
canvas.width = 800;
canvas.height = 800;
```

### Motion Blur Effect
```javascript
// Fade previous frame instead of clearing
ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
ctx.fillRect(0, 0, W, H);
```

---

## Source Reference

Original implementations:
- `reference/QuickToolRebuildReference/Generative Art/`
- `reference/tools/p5.js/`

