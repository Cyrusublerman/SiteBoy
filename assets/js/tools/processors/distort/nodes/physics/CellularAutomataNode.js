import { createEffectModule } from '../../core/EffectModule.js';
import { capByFrame } from '../../core/frameCap.js';
import { SeededRNG, hashSeed } from '../../core/SeededRNG.js';
import { PerlinNoise } from '../../core/PerlinNoise.js';

// ── Rule tables ──────────────────────────────────────────────────────────────

const RULE_PRESETS = {
  LIFE:     { birth: [3],          survival: [2, 3] },
  HIGHLIFE: { birth: [3, 6],       survival: [2, 3] },
  SEEDS:    { birth: [2],          survival: [] },
  DAYNIGHT: { birth: [3, 6, 7, 8], survival: [3, 4, 6, 7, 8] },
  MAZE:     { birth: [3],          survival: [1, 2, 3, 4, 5] },
  ANNEAL:   { birth: [4, 6, 7, 8], survival: [3, 5, 6, 7, 8] },
};

// ── Rule parsing ─────────────────────────────────────────────────────────────

function _parseBS(str) {
  const s = (str || '').toUpperCase();
  const bm = s.match(/B([0-8]*)/);
  const sm = s.match(/S([0-8]*)/);
  return {
    birth:    bm ? [...bm[1]].map(Number) : [],
    survival: sm ? [...sm[1]].map(Number) : [],
  };
}

function _resolveRule(ruleKey, ruleString) {
  if (ruleKey === 'CUSTOM') return _parseBS(ruleString);
  return RULE_PRESETS[ruleKey] ?? RULE_PRESETS.LIFE;
}

// ── Boundary helper ──────────────────────────────────────────────────────────

function _bounded(v, size, mode) {
  if (mode === 'WRAP')    return (v + size) % size;
  if (mode === 'CLAMP')   return v < 0 || v >= size ? -1 : v;
  if (mode === 'REFLECT') {
    if (v < 0) return -v - 1;
    if (v >= size) return 2 * size - v - 1;
    return v;
  }
  // ABSORB
  return v < 0 || v >= size ? -1 : v;
}

// ── Neighbour counting ───────────────────────────────────────────────────────

function _mooreN(grid, w, h, x, y, boundary) {
  let n = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = _bounded(x + dx, w, boundary);
      const ny = _bounded(y + dy, h, boundary);
      if (nx >= 0 && ny >= 0 && grid[ny * w + nx] > 0) n++;
    }
  }
  return n;
}

function _vonNeumannN(grid, w, h, x, y, boundary) {
  let n = 0;
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dx, dy] of dirs) {
    const nx = _bounded(x + dx, w, boundary);
    const ny = _bounded(y + dy, h, boundary);
    if (nx >= 0 && ny >= 0 && grid[ny * w + nx] > 0) n++;
  }
  return n;
}

// ── Grid seeding ─────────────────────────────────────────────────────────────

function _seedGrid(src, w, h, p, rng, noise) {
  const n    = w * h;
  const grid = new Uint8Array(n);
  const mode = p.seedMode;

  if (mode === 'RANDOM') {
    const density = p.initDensity;
    for (let i = 0; i < n; i++) grid[i] = rng.next() < density ? 1 : 0;
  } else if (mode === 'NOISE') {
    const density = p.initDensity;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nv = (noise.noise2D(x / w * 4, y / h * 4) + 1) * 0.5;
        grid[y * w + x] = nv > (1 - density) ? 1 : 0;
      }
    }
  } else if (mode === 'EDGE') {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const lum = (idx) => src[idx * 4] * 0.299 + src[idx * 4 + 1] * 0.587 + src[idx * 4 + 2] * 0.114;
        const nx = Math.min(w - 1, x + 1), px = Math.max(0, x - 1);
        const ny = Math.min(h - 1, y + 1), py = Math.max(0, y - 1);
        const gx = lum(y * w + nx) - lum(y * w + px);
        const gy = lum(ny * w + x) - lum(py * w + x);
        grid[y * w + x] = Math.sqrt(gx * gx + gy * gy) > p.seedThreshold ? 1 : 0;
      }
    }
  } else {
    // IMAGE (default)
    const thresh    = p.seedThreshold;
    const softness  = p.initSoftness;
    for (let i = 0; i < n; i++) {
      const j   = i * 4;
      const lum = src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114;
      if (softness < 1) {
        grid[i] = lum > thresh ? 1 : 0;
      } else {
        const prob = Math.max(0, Math.min(1, 0.5 + (lum - thresh) / softness));
        grid[i] = rng.next() < prob ? 1 : 0;
      }
    }
  }

  if (p.invertInit) for (let i = 0; i < n; i++) grid[i] = grid[i] ? 0 : 1;
  return grid;
}

// ── Simulation step ──────────────────────────────────────────────────────────

function _stepBS(grid, next, age, birthMap, deathMap, w, h, rule, neighbourhood, boundary) {
  const { birth, survival } = rule;
  const bs = new Set(birth), ss = new Set(survival);
  const countFn = neighbourhood === 'VONNEUMANN' ? _vonNeumannN : _mooreN;
  let anyAlive = false;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i     = y * w + x;
      const alive = grid[i] > 0;
      const nc    = countFn(grid, w, h, x, y, boundary);
      const nxt   = alive ? (ss.has(nc) ? 1 : 0) : (bs.has(nc) ? 1 : 0);
      next[i] = nxt;
      age[i]  = nxt ? (alive ? age[i] + 1 : 1) : 0;
      birthMap[i] = (!alive && nxt) ? 255 : 0;
      deathMap[i] = (alive && !nxt) ? 255 : 0;
      if (nxt) anyAlive = true;
    }
  }
  return anyAlive;
}

// States: 0=dead 1=alive 2=dying
function _stepBrainsBrain(grid, next, birthMap, deathMap, w, h, neighbourhood, boundary) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i   = y * w + x;
      const cur = grid[i];
      let nxt;
      if (cur === 1) {
        nxt = 2;
      } else if (cur === 2) {
        nxt = 0;
      } else {
        // Count only state-1 (alive) neighbours
        let ac = 0;
        if (neighbourhood === 'VONNEUMANN') {
          const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          for (const [dx, dy] of dirs) {
            const nx = _bounded(x + dx, w, boundary), ny = _bounded(y + dy, h, boundary);
            if (nx >= 0 && ny >= 0 && grid[ny * w + nx] === 1) ac++;
          }
        } else {
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = _bounded(x + dx, w, boundary), ny = _bounded(y + dy, h, boundary);
            if (nx >= 0 && ny >= 0 && grid[ny * w + nx] === 1) ac++;
          }
        }
        nxt = ac === 2 ? 1 : 0;
      }
      next[i]     = nxt;
      birthMap[i] = (cur === 0 && nxt === 1) ? 255 : 0;
      deathMap[i] = (cur === 1 && nxt === 2) ? 255 : 0;
    }
  }
}

function _stepCyclic(grid, next, w, h, states, neighbourhood, boundary) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i    = y * w + x;
      const cur  = grid[i];
      const succ = (cur + 1) % states;
      let found  = false;
      if (neighbourhood === 'VONNEUMANN') {
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dx, dy] of dirs) {
          const nx = _bounded(x + dx, w, boundary), ny = _bounded(y + dy, h, boundary);
          if (nx >= 0 && ny >= 0 && grid[ny * w + nx] === succ) { found = true; break; }
        }
      } else {
        outer: for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = _bounded(x + dx, w, boundary), ny = _bounded(y + dy, h, boundary);
            if (nx >= 0 && ny >= 0 && grid[ny * w + nx] === succ) { found = true; break outer; }
          }
        }
      }
      next[i] = found ? succ : cur;
    }
  }
}

// ── Run N steps (mutates state in-place) ─────────────────────────────────────

function _runSteps(state, w, h, p, steps) {
  const { grid, next, age, birthMap, deathMap } = state;
  const isCyclic    = p.rule === 'CYCLIC';
  const isBrain     = p.rule === 'BRIANS BRAIN';
  const rule        = (isCyclic || isBrain) ? null : _resolveRule(p.rule, p.ruleString);
  const neighbourhood = p.neighbourhood;
  const boundary    = p.boundaryMode;
  const states      = (p.cyclicStates | 0) || 4;

  for (let s = 0; s < steps; s++) {
    if (isCyclic) {
      _stepCyclic(grid, next, w, h, states, neighbourhood, boundary);
    } else if (isBrain) {
      _stepBriansBrain(grid, next, birthMap, deathMap, w, h, neighbourhood, boundary);
    } else {
      const anyAlive = _stepBS(grid, next, age, birthMap, deathMap, w, h, rule, neighbourhood, boundary);
      if (!anyAlive && p.autoStop) break;
    }
    // Swap grid ↔ next
    grid.set(next);
  }
}

// ── Distance-to-active (BFS) ─────────────────────────────────────────────────

function _distanceToActive(grid, w, h) {
  const n    = w * h;
  const dist = new Float32Array(n).fill(n);
  const q    = [];
  for (let i = 0; i < n; i++) if (grid[i] > 0) { dist[i] = 0; q.push(i); }
  const dirs = [-1, 1, -w, w];
  let head = 0;
  while (head < q.length) {
    const i = q[head++];
    const x = i % w, y = (i / w) | 0;
    const d = dist[i] + 1;
    for (const dd of dirs) {
      const ni = i + dd;
      if (ni < 0 || ni >= n) continue;
      const nx = ni % w;
      // Prevent wrap-around on left/right edges
      if (Math.abs(nx - x) > 1) continue;
      if (dist[ni] > d) { dist[ni] = d; q.push(ni); }
    }
  }
  return dist;
}

// ── Build output field ────────────────────────────────────────────────────────

function _buildField(grid, age, birthMap, deathMap, w, h, outputMode) {
  const n = w * h;
  if (outputMode === 'AGE') {
    const f = new Float32Array(n);
    for (let i = 0; i < n; i++) f[i] = age[i];
    return f;
  }
  if (outputMode === 'BIRTH')  { const f = new Float32Array(n); for (let i = 0; i < n; i++) f[i] = birthMap[i]; return f; }
  if (outputMode === 'DEATH')  { const f = new Float32Array(n); for (let i = 0; i < n; i++) f[i] = deathMap[i]; return f; }
  if (outputMode === 'CHANGE') {
    const f = new Float32Array(n);
    for (let i = 0; i < n; i++) f[i] = (birthMap[i] || deathMap[i]) ? 255 : 0;
    return f;
  }
  if (outputMode === 'NEIGHBOURS') {
    const f = new Float32Array(n);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      f[y * w + x] = _mooreN(grid, w, h, x, y, 'WRAP') * (255 / 8);
    }
    return f;
  }
  if (outputMode === 'DISTANCE') return _distanceToActive(grid, w, h);
  // ALIVE (default)
  const f = new Float32Array(n);
  for (let i = 0; i < n; i++) f[i] = grid[i] > 0 ? 255 : 0;
  return f;
}

// ── Hex colour helper ─────────────────────────────────────────────────────────

function _hexToRGB(hex) {
  const h = (hex || '#ffffff').replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) || 0,
    g: parseInt(h.slice(2, 4), 16) || 0,
    b: parseInt(h.slice(4, 6), 16) || 0,
  };
}

// ── Output compositing ────────────────────────────────────────────────────────

function _composite(src, dst, w, h, field, p, modulate) {
  const n    = w * h;
  const minC = _hexToRGB(p.minColour);
  const maxC = _hexToRGB(p.maxColour);
  const mode = p.couplingMode;

  let fMin = Infinity, fMax = -Infinity;
  if (p.normaliseOutput) {
    for (let i = 0; i < n; i++) {
      if (field[i] < fMin) fMin = field[i];
      if (field[i] > fMax) fMax = field[i];
    }
    if (fMax <= fMin) fMax = fMin + 1;
  } else {
    fMin = 0; fMax = 255;
  }

  const contrast = p.outputContrast;
  const gain     = p.outputGain;

  for (let i = 0; i < n; i++) {
    const j     = i * 4;
    const blend = modulate('blendAmt', i);
    const inv   = 1 - blend;

    const t  = (field[i] - fMin) / (fMax - fMin);
    const tc = Math.max(0, Math.min(1, ((t * gain) - 0.5) * contrast + 0.5));

    const cr = Math.round(minC.r + tc * (maxC.r - minC.r));
    const cg = Math.round(minC.g + tc * (maxC.g - minC.g));
    const cb = Math.round(minC.b + tc * (maxC.b - minC.b));

    if (mode === 'REPLACE') {
      dst[j] = cr; dst[j + 1] = cg; dst[j + 2] = cb; dst[j + 3] = src[j + 3];
    } else if (mode === 'MASK') {
      dst[j]     = Math.round(src[j]     * tc);
      dst[j + 1] = Math.round(src[j + 1] * tc);
      dst[j + 2] = Math.round(src[j + 2] * tc);
      dst[j + 3] = src[j + 3];
    } else if (mode === 'INVERT-BY-STATE') {
      const alive = field[i] > (fMin + (fMax - fMin) * 0.5) ? 1 : 0;
      dst[j]     = alive ? 255 - src[j]     : src[j];
      dst[j + 1] = alive ? 255 - src[j + 1] : src[j + 1];
      dst[j + 2] = alive ? 255 - src[j + 2] : src[j + 2];
      dst[j + 3] = src[j + 3];
    } else if (mode === 'SATURATE-BY-STATE') {
      const alive = field[i] > (fMin + (fMax - fMin) * 0.5) ? 1 : 0;
      const lum   = Math.round(src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114);
      dst[j]     = alive ? src[j]     : lum;
      dst[j + 1] = alive ? src[j + 1] : lum;
      dst[j + 2] = alive ? src[j + 2] : lum;
      dst[j + 3] = src[j + 3];
    } else {
      // OVERLAY
      dst[j]     = Math.round(src[j]     * inv + cr * blend);
      dst[j + 1] = Math.round(src[j + 1] * inv + cg * blend);
      dst[j + 2] = Math.round(src[j + 2] * inv + cb * blend);
      dst[j + 3] = src[j + 3];
    }
  }
}

// ── Node ─────────────────────────────────────────────────────────────────────

export const CellularAutomataNode = createEffectModule({
  type: 'cellularautomata',
  name: 'CELL AUTOMATA',
  category: 'PHYSICS',
  forceWorkerPreview: true,

  params: {
    // Layer 1 — seed
    seedMode:       { label: 'SEED MODE',    type: 'select', options: ['IMAGE', 'RANDOM', 'NOISE', 'EDGE'], value: 'IMAGE', tier: 3 },
    seedThreshold:  { label: 'SEED THRESH',  min: 0,   max: 255,  step: 1,    value: 128, tier: 3, driveable: true, unit: 'lvl' },
    initDensity:    { label: 'DENSITY',      min: 0,   max: 1,    step: 0.01, value: 0.3, tier: 4, driveable: true, unit: '0–1' },
    initSoftness:   { label: 'SOFTNESS',     min: 0,   max: 128,  step: 1,    value: 0,   tier: 4, driveable: true, unit: 'lvl' },
    invertInit:     { label: 'INVERT SEED',  type: 'toggle', value: false, tier: 5 },
    seed:           { label: 'SEED',         min: 0,   max: 9999, step: 1,    value: 0,   tier: 4, driveable: true, unit: 'n' },

    // Layer 2 — rule
    rule:           { label: 'RULE',         type: 'select', options: ['LIFE', 'HIGHLIFE', 'SEEDS', 'DAYNIGHT', 'MAZE', 'ANNEAL', 'BRIANS BRAIN', 'CYCLIC', 'CUSTOM'], value: 'LIFE', tier: 3 },
    ruleString:     { label: 'B/S RULE',     type: 'text',   value: 'B3/S23', tier: 4 },
    neighbourhood:  { label: 'NEIGHBOURS',   type: 'select', options: ['MOORE', 'VONNEUMANN'], value: 'MOORE', tier: 4 },
    boundaryMode:   { label: 'BOUNDARY',     type: 'select', options: ['WRAP', 'CLAMP', 'REFLECT', 'ABSORB'], value: 'WRAP', tier: 4 },
    cyclicStates:   { label: 'CYCLIC STATES',min: 2,   max: 16,   step: 1,    value: 4,   tier: 4, driveable: true, unit: 'n' },

    // Layer 3 — stepping
    frame:          { label: 'FRAME',        min: 0,   max: 240,  step: 1,    value: 0,   tier: 3, driveable: true, unit: 'frames' },
    warmupSteps:    { label: 'WARMUP',       min: 0,   max: 500,  step: 1,    value: 0,   tier: 4, driveable: true, unit: 'n' },
    stepsPerFrame:  { label: 'STEPS/FRAME',  min: 1,   max: 50,   step: 1,    value: 1,   tier: 3, previewMax: 2, driveable: true, unit: 'n' },
    maxSteps:       { label: 'MAX STEPS',    min: 1,   max: 500,  step: 1,    value: 50,  tier: 4, previewMax: 20, driveable: true, unit: 'n' },
    retainState:    { label: 'RETAIN STATE', type: 'toggle', value: false, tier: 3 },
    freeze:         { label: 'FREEZE',       type: 'toggle', value: false, tier: 4 },
    autoStop:       { label: 'AUTO-STOP',    type: 'toggle', value: false, tier: 5 },

    // Layer 5 — output
    outputMode:      { label: 'OUTPUT MODE', type: 'select', options: ['ALIVE', 'AGE', 'BIRTH', 'DEATH', 'CHANGE', 'NEIGHBOURS', 'DISTANCE'], value: 'ALIVE', tier: 3 },
    normaliseOutput: { label: 'NORMALISE',   type: 'toggle', value: true, tier: 4 },
    outputContrast:  { label: 'CONTRAST',    min: 0.1, max: 5,    step: 0.1,  value: 1,   tier: 4, driveable: true, unit: '0–1' },
    outputGain:      { label: 'GAIN',        min: 0,   max: 4,    step: 0.1,  value: 1,   tier: 4, driveable: true, unit: '0–1' },
    minColour:       { label: 'MIN COLOUR',  type: 'colour', value: '#000000', tier: 4 },
    maxColour:       { label: 'MAX COLOUR',  type: 'colour', value: '#ffffff', tier: 4 },

    // Layer 6 — compositing
    couplingMode:   { label: 'COUPLING',     type: 'select', options: ['OVERLAY', 'MASK', 'REPLACE', 'INVERT-BY-STATE', 'SATURATE-BY-STATE'], value: 'OVERLAY', tier: 3 },
    blendAmt:       { label: 'BLEND',        min: 0,   max: 1,    step: 0.01, value: 0.5, tier: 3, driveable: true, unit: '0–1' },
  },

  apply(src, dst, w, h, p, ctx, modulate) {
    const n        = w * h;
    const rngSeed  = hashSeed(p.seed | 0, ctx?.nodeIndex ?? 0, ctx?.nodeId ?? 0);
    const isCyclic = p.rule === 'CYCLIC';
    const isBrain  = p.rule === 'BRIANS BRAIN';
    const states   = (p.cyclicStates | 0) || 4;

    // State cache key — invalidate on any init-affecting param change
    const stateKey = `${p.seed}|${p.rule}|${p.ruleString}|${p.seedMode}|${p.seedThreshold}|${p.initDensity}|${p.initSoftness}|${p.invertInit}|${w}|${h}`;

    const needsInit = !this._state || !p.retainState || this._state.key !== stateKey;

    if (needsInit) {
      const rng   = new SeededRNG(rngSeed);
      const noise = new PerlinNoise(rngSeed);

      let grid;
      if (isCyclic) {
        grid = new Uint8Array(n);
        for (let i = 0; i < n; i++) grid[i] = rng.nextInt(0, states);
      } else if (isBrain) {
        const base = _seedGrid(src, w, h, p, rng, noise);
        grid = new Uint8Array(n);
        for (let i = 0; i < n; i++) grid[i] = base[i] ? 1 : 0;
      } else {
        grid = _seedGrid(src, w, h, p, rng, noise);
      }

      const state = {
        key:      stateKey,
        grid,
        next:     new Uint8Array(n),
        age:      new Int32Array(n),
        birthMap: new Uint8Array(n),
        deathMap: new Uint8Array(n),
        frozen:   false,
      };

      // Apply warmup steps immediately on init
      const warmup = p.warmupSteps | 0;
      if (warmup > 0) _runSteps(state, w, h, p, warmup);

      this._state = state;
    }

    const state = this._state;

    if (p.freeze || state.frozen) {
      const field = _buildField(state.grid, state.age, state.birthMap, state.deathMap, w, h, p.outputMode);
      _composite(src, dst, w, h, field, p, modulate);
      return;
    }

    if (p.retainState) {
      // Stateful: advance by stepsPerFrame capped by frame driver
      let steps = p.stepsPerFrame | 0;
      steps = capByFrame(steps, p.frame);
      _runSteps(state, w, h, p, steps);

      if (p.autoStop && !isCyclic && !isBrain) {
        let alive = 0;
        for (let i = 0; i < n; i++) if (state.grid[i] > 0) alive++;
        if (alive === 0) state.frozen = true;
      }
    } else {
      // Stateless: run warmup + maxSteps each call (state is fresh from needsInit above)
      let totalRemaining = p.maxSteps | 0;
      totalRemaining = capByFrame(totalRemaining, p.frame);
      _runSteps(state, w, h, p, totalRemaining);
    }

    const field = _buildField(state.grid, state.age, state.birthMap, state.deathMap, w, h, p.outputMode);
    _composite(src, dst, w, h, field, p, modulate);
  },

  destroy() {
    this._state = null;
  },
});

