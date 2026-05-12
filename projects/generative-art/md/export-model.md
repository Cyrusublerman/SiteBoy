### Frame determinism as the export contract

Because each generator's draw function is a deterministic function of `(parameters, time)`, the export system can render any frame or sequence of frames by setting the time state and calling the draw function, without running the live animation loop. This decouples export quality from playback performance: an export at 4096×4096 that takes 500 ms per frame is acceptable even though it would never achieve 60 fps in the live view.

### PNG export

Single-frame export calls `canvas.toBlob('image/png')` at the canvas's native resolution. The filename includes the generator name and the current time counter formatted to three decimal places.

### SVG export

Available for generators whose drawing operations are translatable to SVG path data. The export algorithm replaces `ctx.stroke()`/`ctx.fill()` calls with SVG path element construction during the draw call. Canvas-pixel operations (particle systems, per-pixel computation) cannot be exported to SVG and fall back to PNG.

### Sequence export (ZIP)

For animated exports, the export system:

1. Sets the canvas to the export dimensions (may differ from the display canvas).
2. Iterates over frame indices \(k \in [0, F)\) where \(F\) is the declared frame count.
3. For each frame, sets `t = k / \text{fps}` and calls `onDraw`.
4. Captures `canvas.toBlob()` and accumulates PNGs in a JSZip archive.
5. Triggers a download of the ZIP archive.

The user controls: frame count, export FPS (may differ from playback FPS for slow-motion or time-lapse), and output dimensions. A progress indicator in the sidebar status line reports `frame k / F` during the batch.

### GIF export

For short animations, gif.js encodes the frame sequence directly into a GIF. The quality parameter (1–20) trades file size for colour accuracy. GIF is limited to 256 colours per frame; for generators with full-colour output this produces dithering artefacts; PNG sequence is preferred for colour-critical work.

### WebM export

For WebM-capable browsers, the MediaRecorder API captures the canvas stream directly during a live playback pass. This is more efficient than frame-by-frame capture for real-time generators but cannot exceed the playback frame rate and does not support export dimensions larger than the display canvas.
