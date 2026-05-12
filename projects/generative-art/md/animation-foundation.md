### Frame-indexed determinism

All animated generators use `AnimationFoundation.AnimationLoop` as the sole animation driver. No generator implements its own `requestAnimationFrame` loop. The loop calls the generator's `onFrame` callback on each tick, which increments a time counter and calls the draw function. The key constraint is that the draw function must be a pure function of the parameter state and the current time value: given the same inputs, it must produce the same output. This is called *frame-indexed determinism*.

Frame-indexed determinism is the prerequisite for the export system: the Export tab can ask the animation to render frame \(k\) at any time by setting the time counter to \(k / \text{fps}\) and calling the draw function. There is no accumulated state that drifts over time.

### AnimationLoop usage

```javascript
onInit: function(values) {
    this.t = 0;
    this.animator = new AnimationFoundation.AnimationLoop({
        fps: 60,
        onFrame: (delta) => {
            this.t += delta * values.speed;
            this.draw(this.ctx, this.canvas, values);
        }
    });
    this.animator.start();
},

destroy: function() {
    if (this.animator) this.animator.destroy();
}
```

`delta` is the elapsed time in seconds since the last frame, capped at `1/30` to prevent a large catch-up step when the tab is backgrounded. The `speed` parameter scales the time advance, allowing the user to slow or accelerate the animation without changing the underlying mathematical structure.

### Pause-state correctness

When the user pauses the animation (ANIMATE tab), `AnimationLoop.pause()` is called. On resume, `AnimationLoop.resume()` restores the loop without producing a catch-up frame. This is important for cumulative effects (motion blur, particle accumulation): a catch-up frame would add a burst of drawing that breaks the visual continuity.

### Motion blur via partial clear

Several generators use a temporal accumulation technique to produce motion blur: instead of clearing the canvas at the start of each frame, they fill it with a semi-transparent background:

```javascript
ctx.fillStyle = `rgba(0, 0, 0, ${1 - motionBlur})`;
ctx.fillRect(0, 0, W, H);
```

A `motionBlur` of 0.0 clears the canvas fully (no trail); a value of 0.95 leaves a long fade. This technique only works correctly when the generator's drawing calls are additive (drawing over the previous frame without erasing). The motion blur parameter is exposed in the ANIMATE tab for all generators that support it.

### Checkpoint interpolation

The ANIMATE tab provides a checkpoint system: the user saves up to N parameter states as *checkpoints* and enables *sequence playback*, which interpolates smoothly between checkpoints at a configurable transition frame count. Interpolation uses `smoothstep`:

$$f(t) = t^2(3 - 2t)$$

applied component-wise to all numeric parameters between adjacent checkpoints. Non-numeric parameters (e.g. wave type strings) switch at the midpoint of the transition. This system turns the generator into a timeline animator where each checkpoint is a keyframe.
