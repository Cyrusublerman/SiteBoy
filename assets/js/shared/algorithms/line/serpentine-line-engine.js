/**
 * @fileoverview Serpentine line engine — luminance-responsive single-path border-traversal.
 *
 * Two modes:
 *   buildSerpentineLines    — stateless: generates sinusoidal horizontal sweeps
 *   initSerpentineState / updateSerpentineState / toSerpentineLineSet — stateful:
 *     single particle emits from the left edge following a sinusoidal spawn phase,
 *     traverses the canvas clockwise along borders when it reaches the right edge.
 *
 * @source DISTORT image pipeline reference (src/modules/line/serpentine-line-engine.js)
 * @wikipedia https://en.wikipedia.org/wiki/Serpentine_curve
 * @formula y(x) = y0 + A * sin(x * f) + jitter; particle dx += baseSpeed * (1 - drag(lum))
 */

import { lineBounds, seededRandom } from './line-engine-common.js';

/**
 * Generate a set of sinusoidal horizontal sweep lines (stateless).
 * @param {object} opts
 * @param {number} opts.width
 * @param {number} opts.height
 * @param {number} [opts.spacing=8] - Vertical distance between sweeps
 * @param {number} [opts.amplitude=4] - Sinusoidal peak displacement
 * @param {number} [opts.frequency=0.15] - Cycles per pixel
 * @param {number} [opts.seed=1]
 * @param {number} [opts.jitter=0] - Per-point random noise
 * @returns {{ lines: Array<Array<{x,y}>>, bounds: object }}
 */
export function buildSerpentineLines({ width, height, spacing = 8, amplitude = 4, frequency = 0.15, seed = 1, jitter = 0 }) {
  const rnd = seededRandom(seed);
  const lines = [];
  for (let y0 = 0; y0 < height; y0 += spacing) {
    const line = [];
    for (let x = 0; x < width; x++) {
      const j = jitter ? (rnd() * 2 - 1) * jitter : 0;
      line.push({ x, y: y0 + Math.sin(x * frequency) * amplitude + j });
    }
    lines.push(line);
  }
  return { lines, bounds: lineBounds(lines) };
}

/**
 * Initialise mutable serpentine particle state.
 * @param {object} opts
 * @param {number} opts.width
 * @param {number} opts.height
 * @param {number} [opts.padding=0]
 * @returns {object} Mutable state
 */
export function initSerpentineState({ width, height, padding = 0 } = {}) {
  return { width, height, padding, points: [], spawnPhase: 0, startY: null, complete: false };
}

/**
 * Advance the serpentine particle system by one frame.
 * New particles spawn from the left edge at a sinusoidally varying Y position.
 * Each particle moves right, slowed by luminance drag. When a particle reaches the
 * right edge it traverses clockwise along borders back to its starting Y.
 * @param {object} state - Mutable state from initSerpentineState
 * @param {object} opts
 * @param {(x:number,y:number)=>number} [opts.luminanceAt]
 * @param {(lum:number)=>number} [opts.drag]
 * @param {number} [opts.baseSpeed=0.3]
 * @param {number} [opts.spawnRate=8] - Particles spawned per frame
 * @param {number} [opts.oscSpeed=1]
 * @param {number} [opts.oscTopPercent=0]
 * @param {number} [opts.oscBottomPercent=100]
 * @param {boolean} [opts.invert=false]
 * @returns {object} Same state (mutated)
 */
export function updateSerpentineState(state, {
  luminanceAt = () => 0.5,
  drag = (lum) => lum * 0.5,
  baseSpeed = 0.3,
  spawnRate = 8,
  oscSpeed = 1,
  oscTopPercent = 0,
  oscBottomPercent = 100,
  invert = false
} = {}) {
  if (state.complete) return state;
  const { width, height, padding } = state;
  const oscTop = padding + (oscTopPercent / 100) * (height - 2 * padding);
  const oscBottom = padding + (oscBottomPercent / 100) * (height - 2 * padding);
  const amp = (oscBottom - oscTop) / 2;
  const center = (oscBottom + oscTop) / 2;

  for (let i = 0; i < spawnRate; i++) {
    const y = center + Math.sin(state.spawnPhase) * amp;
    state.points.push({ x: padding, y, borderPhase: null });
    if (state.startY == null) state.startY = y;
    state.spawnPhase += oscSpeed * 0.01;
  }

  for (const p of state.points) {
    if (p.borderPhase) continue;
    let lum = luminanceAt(p.x, p.y);
    if (invert) lum = 1 - lum;
    p.x += baseSpeed * (1 - drag(lum));
    if (p.x >= width - padding) { p.x = width - padding; p.borderPhase = 'right'; }
  }

  const speed = baseSpeed * 2;
  const right = width - padding;
  const bottom = height - padding;
  for (const p of state.points) {
    if (!p.borderPhase) continue;
    if (p.borderPhase === 'right') {
      p.y += speed;
      if (p.y >= bottom) { p.y = bottom; p.borderPhase = 'bottom'; }
    } else if (p.borderPhase === 'bottom') {
      p.x -= speed;
      if (p.x <= padding) { p.x = padding; p.borderPhase = 'left'; }
    } else if (p.borderPhase === 'left') {
      p.y -= speed;
      if (state.startY != null && p.y <= state.startY) { p.y = state.startY; p.borderPhase = 'done'; }
    }
  }

  while (state.points.length && state.points[0].borderPhase === 'done') state.points.shift();
  if (state.startY != null && state.points.length === 0) state.complete = true;

  return state;
}

/**
 * Convert current serpentine state to a LineSet for rendering.
 * @param {object} state
 * @returns {{ lines: Array<Array<{x,y}>>, bounds: object }}
 */
export function toSerpentineLineSet(state) {
  return {
    lines: [state.points.map((p) => ({ x: p.x, y: p.y }))],
    bounds: lineBounds([state.points])
  };
}

/**
 * Simulate wavefront propagation — multiple horizontal wavefronts flow downward,
 * each slowed by luminance drag. For each wavefront, spawn an identical row of
 * horizontal points that advect independently based on local luminance.
 *
 * @param {object} opts
 * @param {number}  opts.width
 * @param {number}  opts.height
 * @param {(x:number,y:number)=>number} opts.luminanceAt
 * @param {number}  [opts.mode='flow']        - 'flow' or 'serpentine'
 * @param {number}  [opts.spacing=6]          - Y spacing between wavefronts (px)
 * @param {number}  [opts.amplitude=2.5]      - Sinusoidal Y offset for spawn row
 * @param {number}  [opts.frequency=1]        - Sine frequency for spawn offset
 * @param {number}  [opts.baseSpeed=0.5]      - Horizontal step size per iteration
 * @param {number}  [opts.dragLight=0]        - Drag for light pixels
 * @param {number}  [opts.dragDark=0.5]       - Drag for dark pixels
 * @param {number}  [opts.iterations=200]     - Simulation iterations
 * @returns {{ lines: Array<Array<{x,y}>>, bounds: object }}
 */
export function buildWavefrontLines({
  width, height, luminanceAt,
  mode = 'flow', spacing = 6, amplitude = 2.5, frequency = 1,
  baseSpeed = 0.5, dragLight = 0, dragDark = 0.5, iterations = 200
}) {
  const pad = 2;
  const lineStart = pad, lineEnd = width - pad;
  const flowStart = pad, farEdge = height - pad;
  const spawnInterval = Math.max(1, Math.round(spacing / Math.max(0.01, baseSpeed)));
  const waveFronts = [];
  let framesSinceSpawn = Infinity;

  for (let frame = 0; frame < iterations; frame++) {
    framesSinceSpawn++;
    if (framesSinceSpawn >= spawnInterval) {
      const pts = [];
      for (let s = lineStart; s <= lineEnd; s++) {
        pts.push({
          linePos: s,
          flowPos: flowStart + Math.sin(s * frequency * 0.01) * amplitude
        });
      }
      waveFronts.push({ points: pts, complete: false });
      framesSinceSpawn = 0;
    }
    for (const wf of waveFronts) {
      if (wf.complete) continue;
      let allDone = true;
      for (const pt of wf.points) {
        if (pt.flowPos >= farEdge) continue;
        const lum = luminanceAt(pt.linePos, pt.flowPos);
        const t = 1 - lum;
        const drag = dragLight + (dragDark - dragLight) * t;
        pt.flowPos += baseSpeed * (1 - drag);
        if (pt.flowPos >= farEdge) pt.flowPos = farEdge; else allDone = false;
      }
      if (allDone) wf.complete = true;
    }
  }

  const lines = waveFronts
    .filter(wf => wf.points && wf.points.length > 1)
    .map(wf => wf.points.map(pt => ({ x: pt.linePos, y: pt.flowPos })));
  return { lines, bounds: lineBounds(lines) };
}
