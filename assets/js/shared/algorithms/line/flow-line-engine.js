/**
 * @fileoverview Flow-line engine — field-following wavefront propagation and streamline tracing.
 *
 * Two modes:
 *   buildFlowLines   — stateless: traces streamlines from seeds through a VectorField
 *   initWavefrontState / advanceWavefrontEngine / getDrawableWavefrontLines — stateful:
 *     animates a cohort of wavefronts that spawn at regular intervals and flow across
 *     the canvas, displaced by a luminance-based drag function.
 *
 * @source DISTORT image pipeline reference (src/modules/line/flow-line-engine.js)
 * @wikipedia https://en.wikipedia.org/wiki/Streamlines,_streaklines,_and_pathlines
 * @formula dx/dt = vx(x,y), dy/dt = vy(x,y); Euler integration with step size s
 */

import { sampleField } from '../field/vector-field.js';
import { clipPoint, lineBounds } from './line-engine-common.js';
import { propagateFront } from './front-propagation-core.js';

/**
 * Trace streamlines from an array of seed points through a VectorField.
 * @param {object} opts
 * @param {{ width: number, height: number, vectors: Float32Array }} opts.field
 * @param {Array<{x:number,y:number}>} [opts.seeds=[]]
 * @param {number} [opts.iterations=64] - Steps per line
 * @param {number} [opts.step=1] - Euler step size in pixels
 * @param {number} [opts.minMove=0.0001] - Stop if displacement < this
 * @param {Set<string>|null} [opts.occupancy=null] - Grid occupancy set for non-crossing
 * @returns {{ lines: Array<Array<{x,y}>>, bounds: object }}
 */
export function buildFlowLines({ field, seeds = [], iterations = 64, step = 1, minMove = 0.0001, occupancy = null }) {
  const lines = [];
  for (const seed of seeds) {
    const line = propagateFront(seed, {
      steps: iterations,
      stepFn: (p) => {
        const [vx, vy] = sampleField(field, p.x, p.y, 'bilinear');
        const nx = p.x + vx * step;
        const ny = p.y + vy * step;
        if (Math.hypot(nx - p.x, ny - p.y) < minMove) return null;
        const next = clipPoint(nx, ny, field.width, field.height);
        if (occupancy) {
          const key = `${Math.round(next.x)},${Math.round(next.y)}`;
          if (occupancy.has(key)) return null;
          occupancy.add(key);
        }
        return next;
      }
    });
    lines.push(line);
  }
  return { lines, bounds: lineBounds(lines) };
}

/**
 * Initialise mutable wavefront engine state.
 * @param {object} opts
 * @param {number} opts.width
 * @param {number} opts.height
 * @param {number} [opts.padding=0]
 * @param {'horizontal'|'vertical'} [opts.orientation='horizontal']
 * @returns {object} Mutable state object — pass to advanceWavefrontEngine each frame
 */
export function initWavefrontState({ width, height, padding = 0, orientation = 'horizontal' } = {}) {
  const isHoriz = orientation === 'horizontal';
  return {
    fronts: [],
    gcHead: 0,
    frame: 0,
    frontIndex: 0,
    isHoriz,
    lineStart: padding,
    lineEnd: (isHoriz ? width : height) - padding,
    flowStart: padding,
    farEdge: (isHoriz ? height : width) - padding,
    complete: false
  };
}

function spawnFront(state, { lineSpacing = 6, sampleStep = 1, oscAmplitude = 0, oscFreq = 1, phaseIncrement = 0, baseSpeed = 0.5, stopSpawnFrame = 0 }) {
  const spawnInterval = Math.max(1, Math.round(lineSpacing / Math.max(0.01, baseSpeed)));
  if (state.frame % spawnInterval !== 0) return;
  if (stopSpawnFrame > 0 && state.frame >= stopSpawnFrame) return;

  const points = [];
  for (let s = state.lineStart; s <= state.lineEnd; s += sampleStep) {
    points.push({ linePos: s, flowPos: state.flowStart + Math.sin((s * oscFreq) / Math.max(1, state.lineEnd)) * oscAmplitude });
  }
  state.fronts.push({ points, complete: false });
  state.frontIndex += 1;
}

/**
 * Advance the wavefront engine by one frame.
 * Spawns new fronts, updates all active front positions via drag(lum), GCs complete fronts.
 * @param {object} state - Mutable state from initWavefrontState
 * @param {object} opts
 * @param {(x:number,y:number)=>number} [opts.luminanceAt] - Returns luma in [0,1] at (x,y)
 * @param {(lum:number)=>number} [opts.drag] - Maps luma to drag coefficient [0,1]
 * @param {number} [opts.baseSpeed=0.5]
 * @param {number} [opts.lineSpacing=6]
 * @param {number} [opts.sampleStep=1]
 * @param {number} [opts.oscAmplitude=0]
 * @param {number} [opts.oscFreq=1]
 * @param {number} [opts.phaseIncrement=0]
 * @param {number} [opts.stopSpawnFrame=0]
 * @param {boolean} [opts.invert=false]
 * @returns {object} Same state (mutated)
 */
export function advanceWavefrontEngine(state, {
  luminanceAt = () => 0.5,
  drag = (lum) => lum * 0.5,
  baseSpeed = 0.5,
  lineSpacing = 6,
  sampleStep = 1,
  oscAmplitude = 0,
  oscFreq = 1,
  phaseIncrement = 0,
  stopSpawnFrame = 0,
  invert = false
} = {}) {
  if (state.complete) return state;

  spawnFront(state, { lineSpacing, sampleStep, oscAmplitude, oscFreq, phaseIncrement, baseSpeed, stopSpawnFrame });

  for (let i = state.gcHead; i < state.fronts.length; i++) {
    const front = state.fronts[i];
    if (!front || front.complete) continue;

    let allDone = true;
    for (const p of front.points) {
      if (p.flowPos >= state.farEdge) continue;
      const cx = state.isHoriz ? p.linePos : p.flowPos;
      const cy = state.isHoriz ? p.flowPos : p.linePos;
      let lum = luminanceAt(cx, cy);
      if (invert) lum = 1 - lum;
      p.flowPos += baseSpeed * (1 - drag(lum));
      if (p.flowPos < state.farEdge) allDone = false;
      if (p.flowPos > state.farEdge) p.flowPos = state.farEdge;
    }
    front.complete = allDone;
  }

  while (state.gcHead < state.fronts.length && state.fronts[state.gcHead]?.complete) {
    state.fronts[state.gcHead] = null;
    state.gcHead += 1;
  }

  if (stopSpawnFrame > 0 && state.frame >= stopSpawnFrame && state.gcHead >= state.fronts.length) {
    state.complete = true;
  }

  state.frame += 1;
  return state;
}

/**
 * Extract renderable polylines from current wavefront state.
 * @param {object} state - State from initWavefrontState / advanceWavefrontEngine
 * @param {number} [progress=1] - Fraction [0,1] of lines to return
 * @returns {Array<Array<{x:number,y:number}>>}
 */
export function getDrawableWavefrontLines(state, progress = 1) {
  const active = [];
  for (let i = state.gcHead; i < state.fronts.length; i++) {
    const front = state.fronts[i];
    if (!front) continue;
    active.push(front.points.map((p) => ({
      x: state.isHoriz ? p.linePos : p.flowPos,
      y: state.isHoriz ? p.flowPos : p.linePos
    })));
  }
  if (progress >= 1) return active;
  return active.slice(0, Math.max(1, Math.ceil(active.length * progress)));
}

// ── Gradient-displaced line patterns ─────────────────────────────────────────

function _buildGradientField(src, w, h, deadzone) {
  const n = w * h;
  const L = new Float32Array(n);
  for (let i = 0; i < n; i++) { const j = i * 4; L[i] = (0.2126 * src[j] + 0.7152 * src[j + 1] + 0.0722 * src[j + 2]) / 255; }
  const gx = new Float32Array(n), gy = new Float32Array(n);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    gx[i] = -L[(y-1)*w+x-1] + L[(y-1)*w+x+1] - 2*L[y*w+x-1] + 2*L[y*w+x+1] - L[(y+1)*w+x-1] + L[(y+1)*w+x+1];
    gy[i] = -L[(y-1)*w+x-1] - 2*L[(y-1)*w+x] - L[(y-1)*w+x+1] + L[(y+1)*w+x-1] + 2*L[(y+1)*w+x] + L[(y+1)*w+x+1];
  }
  const lum = L, cos = new Float32Array(n), sin = new Float32Array(n);
  const dzF = Math.max(deadzone * 2, 0.001);
  for (let i = 0; i < n; i++) {
    const rm = Math.sqrt(gx[i] * gx[i] + gy[i] * gy[i]);
    let t = 0;
    if (rm > deadzone) { t = Math.min((rm - deadzone) / dzF, 1); t = t * t * (3 - 2 * t); }
    if (rm > 0.0001) { cos[i] = gx[i] / rm; sin[i] = gy[i] / rm; }
    else { cos[i] = 0; sin[i] = 0; }
  }
  return { lum, cos, sin, w, h };
}

function _sampleGradField(field, x, y) {
  const ix = Math.max(0, Math.min(~~x, field.w - 1));
  const iy = Math.max(0, Math.min(~~y, field.h - 1));
  const i = iy * field.w + ix;
  return { lum: field.lum[i], cx: -field.sin[i], cy: field.cos[i] };
}

function _genPatternLines(type, w, h, spacing) {
  const lines = [];
  const PI2 = Math.PI * 2, cx = w / 2, cy = h / 2;
  if (type === 'horizontal' || type === 'grid') {
    for (let y = 0; y < h; y += spacing) {
      const pts = []; for (let x = 0; x < w; x++) pts.push({ x, y }); lines.push(pts);
    }
    if (type === 'grid') for (let x = 0; x < w; x += spacing) {
      const pts = []; for (let y = 0; y < h; y++) pts.push({ x, y }); lines.push(pts);
    }
  } else if (type === 'vertical') {
    for (let x = 0; x < w; x += spacing) {
      const pts = []; for (let y = 0; y < h; y++) pts.push({ x, y }); lines.push(pts);
    }
  } else if (type === 'diagonal') {
    const diag = Math.sqrt(w * w + h * h);
    for (let d = -h; d < w + h; d += spacing) {
      const pts = [];
      for (let t = 0; t < w + h; t++) {
        const x = d + t * 0.707, y = t * 0.707;
        if (x >= 0 && x < w && y >= 0 && y < h) pts.push({ x, y });
      }
      if (pts.length > 2) lines.push(pts);
    }
  } else if (type === 'radial') {
    const mr = Math.sqrt(cx * cx + cy * cy), as = spacing * 0.02;
    for (let a = 0; a < PI2; a += as) {
      const pts = []; for (let r = 0; r < mr; r += 2) pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
      if (pts.length > 1) lines.push(pts);
    }
  } else if (type === 'concentric') {
    const mr = Math.sqrt(cx * cx + cy * cy);
    for (let r = spacing; r < mr; r += spacing) {
      const sg = Math.max(60, ~~(r * 0.5)), pts = [];
      for (let j = 0; j <= sg; j++) { const a = (j / sg) * PI2; pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }); }
      lines.push(pts);
    }
  }
  return lines;
}

/**
 * Generate a pattern of lines and displace each point using a luminance gradient field.
 * @param {object} opts
 * @param {Uint8ClampedArray} opts.src
 * @param {number}  opts.width
 * @param {number}  opts.height
 * @param {'horizontal'|'vertical'|'diagonal'|'grid'|'radial'|'concentric'} [opts.pattern='horizontal']
 * @param {number}  [opts.spacing=8]       - Seed line spacing
 * @param {number}  [opts.resolution=2]    - Point sampling interval
 * @param {number}  [opts.amplitude=15]    - Displacement magnitude
 * @param {number}  [opts.lumExp=1]        - Luminance exponent
 * @param {number}  [opts.damping=0.95]    - Per-iteration damping
 * @param {number}  [opts.iterations=3]    - Displacement accumulation iterations
 * @returns {{ lines: Array<Array<{x,y}>>, bounds: object }}
 */
export function buildGradientDisplacedLines({
  src, width, height,
  pattern = 'horizontal', spacing = 8, resolution = 2,
  amplitude = 15, lumExp = 1, damping = 0.95, iterations = 3
}) {
  const field = _buildGradientField(src, width, height, 0.02);
  const rawLines = _genPatternLines(pattern, width, height, spacing);

  const nPts = rawLines.map(l => Math.ceil(l.length / resolution));
  const dmData = nPts.map(n => new Float32Array(n * 2));

  for (let iter = 0; iter < iterations; iter++) {
    const dampFactor = 1 - damping;
    for (let l = 0; l < rawLines.length; l++) { const d = dmData[l]; for (let i = 0; i < d.length; i++) d[i] *= dampFactor; }
    for (let l = 0; l < rawLines.length; l++) {
      const pts = rawLines[l];
      for (let pi = 0; pi < nPts[l]; pi++) {
        const idx = pi * resolution; if (idx >= pts.length) break;
        const fv = _sampleGradField(field, pts[idx].x, pts[idx].y);
        const lum = Math.pow(fv.lum, lumExp);
        dmData[l][pi * 2]     += lum * amplitude * 0.5;
        dmData[l][pi * 2 + 1] += lum * amplitude;
      }
    }
  }

  const lines = [];
  for (let l = 0; l < rawLines.length; l++) {
    const pts = rawLines[l], line = [];
    for (let pi = 0; pi < nPts[l]; pi++) {
      const idx = pi * resolution; if (idx >= pts.length) break;
      line.push({ x: pts[idx].x + dmData[l][pi * 2], y: pts[idx].y + dmData[l][pi * 2 + 1] });
    }
    if (line.length > 1) lines.push(line);
  }
  return { lines, bounds: lineBounds(lines) };
}
