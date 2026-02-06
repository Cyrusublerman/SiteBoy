# p5.js Generator Checklist

Pre-submission checklist for p5.js generators in the unified system.

---

## Script Config

- [ ] `id` is kebab-case, unique
- [ ] `title` is display-ready
- [ ] `category` is one of: parametric, wave, pattern, other
- [ ] `canvas.context` is `'p5'`
- [ ] `canvas.width` and `canvas.height` defined
- [ ] `parameters` has at least one group with params
- [ ] `p5Setup` function defined
- [ ] `p5Draw` function defined

## p5Setup Function

- [ ] Does NOT call `createCanvas()`
- [ ] Calls `p.noLoop()` (unless `p5Loop: true` in config)
- [ ] Uses `this` for persistent state
- [ ] No async operations (loadImage, loadFont, etc.)

## p5Draw Function

- [ ] Receives `(p, params, frame)` signature
- [ ] Clears/draws background each frame
- [ ] Uses `params` object for all control values
- [ ] Uses `frame` for animation (not internal counter)
- [ ] Deterministic output (same params + frame = same result)

## Colours

- [ ] All colours from VGA palette only
- [ ] No `color()` with non-VGA RGB values
- [ ] No named CSS colours
- [ ] No hex colours outside VGA set

## Animation

- [ ] `animation` config present if animated
- [ ] `loopFrames` set for looping animations
- [ ] `animatableParams` lists phase-animatable keys
- [ ] Seeded RNG if using random()

## Parameters

- [ ] All params have: key, type, label, default
- [ ] Sliders have: min, max, step
- [ ] Keys are camelCase
- [ ] Presets reference valid param keys

## Export Compatibility

- [ ] Sketch works in paused state (single frame render)
- [ ] Frame sequence produces consistent output
- [ ] No external dependencies (images, fonts) or preloaded via system

## Registration

- [ ] Script file in `tools/generators/scripts/{category}/`
- [ ] Import added to `script-registry.js`
- [ ] Category assignment in `getByCategory()`

---

## Quick Reference

### VGA Palette Hex Values
```
#000000 #800000 #008000 #808000
#000080 #800080 #008080 #c0c0c0
#808080 #ff0000 #00ff00 #ffff00
#0000ff #ff00ff #00ffff #ffffff
```

### Minimal Template
```javascript
export const SCRIPT_CONFIG = {
    id: 'my-p5-gen',
    title: 'My P5 Generator',
    category: 'pattern',
    canvas: { width: 800, height: 800, context: 'p5' },
    parameters: [{
        group: 'Controls',
        params: [
            { key: 'value', type: 'slider', label: 'Value',
              min: 0, max: 100, default: 50 }
        ]
    }],
    p5Setup(p, params) {
        p.noLoop();
    },
    p5Draw(p, params, frame) {
        p.background('#000000');
        p.fill('#00ff00');
        p.circle(p.width/2, p.height/2, params.value);
    }
};
```

