# Phase A — Repro Protocols & Root-Cause Verifications
_date: 2026-04-28_

## A-02 — Verify X-004/X-005 closure (canvas display)

| Row | Script | Finding | Status |
|-----|--------|---------|--------|
| MOI-01 | moire.gen.js | Full `w×h` pixel loop — no `Math.min` | ✅ CLOSED |
| WIN-01 | wave-interference.gen.js | `W = canvas.width`, `H = canvas.height` — rectangular | ✅ CLOSED |
| QUI-04 | quine.gen.js | `createGraphics(1080, 1080)` hardcoded — canvas resize has no effect | ❌ STILL OPEN → Phase B patch |

## A-01 — P0 Reproduction Protocols

### CYM-01 — Cymatics strobe on first frame
**Hypothesis:** Host adaptive-resolution switch (Tier 2 `interactionScale`/`idleDelay` in `compute`) triggers a resolution change during the first animation tick, causing the offscreen canvas (`ensureOffscreen`) to be recreated mid-draw with mismatched cache dimensions (`_cacheW`, `_cacheH`).  
**Secondary:** if `frame` is undefined on tick 0, `t = frame * speed` → `NaN` → all particle positions `NaN` → blank frame, then valid frame → flash.  
**Accept:** first 5 frames render consistently; no resolution switch on frame 0.

### TIL-01/02 — Tile-mosaic empty space & overlap
**Root cause confirmed:** Shelf-packing with random-height tiles. When `shelfY + th > H`, tiles are simply skipped (`break`). No backfilling, no second-pass. With ±40% height variance the rightmost column of each shelf is often wasted. No MaxRects or second-pass algorithm present.  
**Accept:** 0 background pixels, 0 overlap on 1024² × every preset.

### CIR-03 — Stray spoke in Lines mode
**Root cause confirmed:** Lines 79–80 of circles.gen.js draw `moveTo(x,y); lineTo(x + r*cosA, y + r*sinA)` for each circle — a radial spoke from each circle's own centre to its rim at angle `orbitAngle`. Since all circles share the same `cosA/sinA`, all spokes terminate at the same canvas-space point `(cx + r₀·cosA, cy + r₀·sinA)`. The visual appears as a single persistent line from canvas centre to the outermost rim point.  
**Fix:** remove the `moveTo(x,y); lineTo(...)` spoke lines; keep arc only.  
**Accept:** no segment from any circle endpoint to centre at any frame.

### CIR-04 — Flat transform model (not epicyclic)
**Root cause confirmed:** `transforms[i].x = parentT.x + orbitRadius * cosA` with the same `cosA/sinA` for ALL layers. This makes all circles co-rotate at identical angular speed — a "rigid arm" not epicyclic rolling. The algorithm comment in the INFO block actually admits this.  
**Fix:** replace flat arm with nested `ctx.save/translate/rotate` per layer, with independent `rotationsPerCycle[i]` (Phase D CIR-05).  
**Accept:** layer i's centre-point traces the parent's circumference.

### IFG-01 — Interference-figure resize race
**Root cause:** `computePixels` dispatched to worker with `imageData` sized at draw-call time. On resize, the host calls draw twice (old size, new size) in quick succession. The old-sized worker job may complete AFTER the new-sized `putImageData` call, corrupting the canvas with wrong-dimension data.  
**Fix:** add generation token `_genId++`; worker result ignored if `result.genId !== _currentGenId`. Debounce resize via existing HOST throttle.  
**Accept:** no size mismatch artefact on rapid resize sequence.

### IFG-02 — Worker not invoked during animation
**Audit:** `compute.worker: true` declared. `computePixels` present. Actual invocation path goes through `ComputeScheduler`. Need to verify DevTools Worker panel shows activity during animation play.  
**Status:** accept if worker thread shows activity; otherwise fix ComputeScheduler dispatch path.

### SOL-06 — Planet hit-testing absent
**Root cause confirmed:** No pointer event handler registered. `planet.screenX/Y/screenRadius` computed per-frame but not used for picking. `showLabels` draws static text only.  
**Fix:** attach `pointerdown` to canvas in `lifecycle.onInit`; iterate `_planets` in screen-space; show tooltip on nearest planet within threshold.

### DEF-03 — Render overshoots canvas bounds
**Root cause confirmed:** `createCanvas(800, 600)` and `createGraphics(800, 600)` hardcoded. Not matched to canvas dimensions at runtime. Gaussian blur kernel offsets UVs ±15 texels — outside the [0,1] UV range at edges; WebGL clamp-to-edge repeats edge pixels, producing smeared edge artefacts at actual canvas boundary.  
**Fix:** read `canvas.width/height` in `p5Setup` via the `canvas` param; set graphics buffers to match. Add `ctx.save(); ctx.beginPath(); ctx.rect(0,0,W,H); ctx.clip()` before composite step.

### ORD-03 — Order-disorder performance
**Root cause:** Main-thread p5 draw loop. `p5.noise()` and `p.vertex()` require the p5 instance — not worker-eligible as-is. Per audit, worker migration requires rewriting noise and drawing to ImageData.  
**Fix strategy:** wire `ThrottledLoop` via HOST to cap to 30 FPS; reduce p5 `pixelDensity` to 1; investigate whether per-point loop can be replaced with a `computePixels` ImageData approach removing p5 dependency entirely.

### QUI-05 — Quine worker
**Root cause:** `_diffuse()` runs on main thread inside `p5Draw`. No worker declared.  
**Fix:** move residue buffer + diffusion to a `computePixels` worker; declare `compute: { worker: true }`. Text compositing stays on main thread.

### WIN-02 — Wave-interference lag (pre-merger)
**Root cause:** `Float32Array(W*H)` superposition loop on main thread O(N_sources × W × H) per frame. `compute.worker: true` declared — verify actual dispatch in Phase C post-merger.

## A-03 — Reference Comparisons

### circles — CIR-04 gap list
- Current: rigid arm (all circles same angular rate)
- Reference intent: epicyclic — each circle rolls inside parent
- Gap: no `rotationsPerCycle` param, no nested `ctx.save/rotate`

### curtain-morph — CUR-01 gap list
- Core morphing algorithm intact (multi-sine curtain displacement, ring morph, extrusion shading)
- Regression candidate: gradient shading redundantly computes `extrPts` in non-gradient branch
- Regression hunt: defer to CUR-02 (`git log -p`) in Phase E

### golden-grid — GOL-04 gap list
- H/S/L driven by cell geometry proportions (wNorm/hNorm/aNorm)
- Missing: explicit `positionModulation` channel (x/y grid position → H/S/L offset), `depthModulation` channel (subdivision depth → intensity)
- Only 3 animatable: `hueSpeed`, `satSpeed`, `lumSpeed`

### defecated — DEF-01/DEF-02 gap list
- 40 fonts (need ≥50 — FontRegistry has 54 via X-009)
- Bleed: 31×31 Gaussian on WebGL quad — not an ink absorption model. Replace with multi-pass Gaussian-into-paper-mask (reaction-diffusion deferred if too slow)
- Canvas hardcoded 800×600; needs dynamic sizing

### quine — QUI-02 gap list
- Ink diffusion: custom CA single-direction-per-frame wet-bleed (custom, not Gaussian)
- Model is reasonable; main rethink needed: decouple from 1080×1080 fixed buffer
- Font size applied in p5 graphics pixel space (correct), but font metrics not recomputed when canvas changes aspect ratio
