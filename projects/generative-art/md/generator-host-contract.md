### The four-tab sidebar

Every generator is served by the unified Generator Host. The host enforces a fixed four-tab sidebar layout:

| Tab | Purpose |
|---|---|
| PARAMS | All mathematical parameters for the generator (amplitude, frequency, count, etc.) |
| ANIMATE | Frame rate, animation speed, motion blur, checkpoint-based sequence playback |
| EXPORT | PNG/SVG/GIF/ZIP export; frame count; format selection |
| INFO | Auto-generated info panel documenting the generator's equations |

No generator may define its own tabs or extend the sidebar beyond this structure. Parameters are declared as a flat list of sidebar controls in the generator's `TOOL_CONFIG.sidebar` array; the host injects them into the PARAMS tab.

### Engine choice

The host provides two rendering engines per generator:

- **Canvas 2D** — default; uses `ctx.fillRect`, `ctx.beginPath`, `ctx.lineTo`, etc. Suitable for line-based and point-based visualisations.
- **WebGL fragment shader** — available for generators that benefit from per-pixel computation (wave interference density mode, noise fields). Declared via `canvas.engine = 'webgl'` in `TOOL_CONFIG`.

Engine selection does not affect the sidebar contract. The generator receives a `ctx` object appropriate to its declared engine.

### Layout invariants

The canvas area occupies the right portion of the viewport at `flex: 1`. The sidebar is fixed at 30F (420px) width. The host does not allow any controls, overlays, or labels inside the canvas area — all interaction is through the sidebar. The canvas is scaled to fill its container while maintaining the generator's declared aspect ratio.

### Registration

Generators register themselves with the host by assigning to `window[generatorId]`:

```javascript
(function () {
    const MyGenerator = {
        id: 'my-generator',
        TOOL_CONFIG: {
            title: 'MY GENERATOR',
            sidebar: [ /* PARAMS controls */ ],
            canvas: { width: 800, height: 800 },
            onInit: function(values) { /* ... */ },
            onDraw: function(ctx, canvas, values) { /* ... */ },
            destroy: function() { if (this.animator) this.animator.destroy(); }
        }
    };
    window.MyGenerator = MyGenerator;
})();
```

The router loads the generator's script file, reads `window[id].TOOL_CONFIG`, and mounts it into the host.
