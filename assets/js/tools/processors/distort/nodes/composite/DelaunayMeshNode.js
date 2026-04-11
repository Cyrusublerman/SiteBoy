import { createEffectModule } from '../../core/EffectModule.js';
import { SeededRNG } from '../../core/SeededRNG.js';
import { delaunayTriangulation2D } from '../../../../../shared/algorithms/geometry/delaunay-2d.js';
import { voronoiDiagram2d } from '../../../../../shared/algorithms/geometry/voronoi-2d.js';

// ── Stage 1: Image analysis ────────────────────────────────────────────────────

function buildGradientField(src, w, h) {
  const n = w * h;
  const mag = new Float32Array(n);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const lum = (px, py) => {
        const cx = Math.max(0, Math.min(w - 1, px));
        const cy = Math.max(0, Math.min(h - 1, py));
        const i = (cy * w + cx) * 4;
        return src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114;
      };
      const gx = lum(x + 1, y) - lum(x - 1, y);
      const gy = lum(x, y + 1) - lum(x, y - 1);
      mag[y * w + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  let maxMag = 0;
  for (let i = 0; i < n; i++) if (mag[i] > maxMag) maxMag = mag[i];
  if (maxMag > 0) for (let i = 0; i < n; i++) mag[i] /= maxMag;
  return mag;
}

function buildEdgeField(gradMag, w, h, falloff) {
  // Distance transform approximation: iterative box spread
  const n = w * h;
  const edge = new Float32Array(n);
  const threshold = 0.2;
  for (let i = 0; i < n; i++) edge[i] = gradMag[i] > threshold ? 1.0 : 0.0;
  const r = Math.max(1, Math.round(falloff * Math.max(w, h) * 0.1));
  const tmp = new Float32Array(n);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let mx = 0;
      for (let dx = -r; dx <= r; dx++) {
        const cx = Math.max(0, Math.min(w - 1, x + dx));
        const v = edge[y * w + cx];
        if (v > mx) mx = v;
      }
      tmp[y * w + x] = mx;
    }
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let mx = 0;
      for (let dy = -r; dy <= r; dy++) {
        const cy = Math.max(0, Math.min(h - 1, y + dy));
        const v = tmp[cy * w + x];
        if (v > mx) mx = v;
      }
      edge[y * w + x] = mx;
    }
  }
  return edge;
}

// ── Stage 2: Density field ─────────────────────────────────────────────────────

function buildDensityField(src, w, h, densityMode, baseDensity, gradBoost, edgeBoost, edgeFalloff, densityCurve) {
  const n = w * h;
  const density = new Float32Array(n);

  if (densityMode === 'UNIFORM') {
    for (let i = 0; i < n; i++) density[i] = 1.0;
    return density;
  }

  const gradMag = buildGradientField(src, w, h);
  const edgeField = (densityMode === 'EDGE WEIGHTED' || densityMode === 'EDGE DISTANCE' || densityMode === 'HYBRID')
    ? buildEdgeField(gradMag, w, h, edgeFalloff)
    : null;

  const base = baseDensity / 100;

  for (let i = 0; i < n; i++) {
    let d = base;
    if (densityMode === 'GRADIENT WEIGHTED' || densityMode === 'HYBRID') {
      d += gradMag[i] * (gradBoost / 10);
    }
    if ((densityMode === 'EDGE WEIGHTED' || densityMode === 'EDGE DISTANCE' || densityMode === 'HYBRID') && edgeField) {
      d += edgeField[i] * (edgeBoost / 10);
    }
    if (densityMode === 'CONTRAST WEIGHTED') {
      d += gradMag[i] * (gradBoost / 10);
    }
    density[i] = Math.max(0, Math.min(1, d));
  }

  // Apply density curve
  for (let i = 0; i < n; i++) {
    const v = density[i];
    if (densityCurve === 'SMOOTHSTEP') {
      density[i] = v * v * (3 - 2 * v);
    } else if (densityCurve === 'EXPONENTIAL') {
      density[i] = v * v;
    } else if (densityCurve === 'THRESHOLDED') {
      density[i] = v > 0.3 ? 1.0 : 0.1;
    }
    // LINEAR: no change
  }
  return density;
}

// ── Stage 3: Seed generation ───────────────────────────────────────────────────

function generateUniformSeeds(count, w, h, rng) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    pts.push({ x: rng.next() * w, y: rng.next() * h });
  }
  return pts;
}

function generateJitteredGridSeeds(count, w, h, rng) {
  const cols = Math.ceil(Math.sqrt(count * w / h));
  const rows = Math.ceil(count / cols);
  const cw = w / cols, ch = h / rows;
  const pts = [];
  for (let row = 0; row < rows && pts.length < count; row++) {
    for (let col = 0; col < cols && pts.length < count; col++) {
      pts.push({
        x: (col + 0.5 + (rng.next() - 0.5) * 0.8) * cw,
        y: (row + 0.5 + (rng.next() - 0.5) * 0.8) * ch
      });
    }
  }
  return pts;
}

function generatePoissonDiscSeeds(count, w, h, rng, minDist) {
  const cellSize = minDist / Math.SQRT2;
  const gw = Math.ceil(w / cellSize);
  const gh = Math.ceil(h / cellSize);
  const grid = new Int32Array(gw * gh).fill(-1);
  const pts = [];
  const active = [];

  const gridIdx = (x, y) => {
    const gx = Math.floor(x / cellSize);
    const gy = Math.floor(y / cellSize);
    if (gx < 0 || gx >= gw || gy < 0 || gy >= gh) return -1;
    return gy * gw + gx;
  };

  const fits = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return false;
    const gx = Math.floor(x / cellSize);
    const gy = Math.floor(y / cellSize);
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = gx + dx, ny = gy + dy;
        if (nx < 0 || nx >= gw || ny < 0 || ny >= gh) continue;
        const pi = grid[ny * gw + nx];
        if (pi === -1) continue;
        const p = pts[pi];
        const ddx = p.x - x, ddy = p.y - y;
        if (ddx * ddx + ddy * ddy < minDist * minDist) return false;
      }
    }
    return true;
  };

  const first = { x: rng.next() * w, y: rng.next() * h };
  pts.push(first);
  const fi = gridIdx(first.x, first.y);
  if (fi >= 0) grid[fi] = 0;
  active.push(0);

  while (active.length > 0 && pts.length < count) {
    const ri = Math.floor(rng.next() * active.length);
    const idx = active[ri];
    const p = pts[idx];
    let found = false;
    for (let k = 0; k < 20; k++) {
      const angle = rng.next() * Math.PI * 2;
      const dist = minDist + rng.next() * minDist;
      const nx = p.x + Math.cos(angle) * dist;
      const ny = p.y + Math.sin(angle) * dist;
      if (fits(nx, ny)) {
        const np = { x: nx, y: ny };
        pts.push(np);
        const ni = gridIdx(nx, ny);
        if (ni >= 0) grid[ni] = pts.length - 1;
        active.push(pts.length - 1);
        found = true;
        break;
      }
    }
    if (!found) active.splice(ri, 1);
  }
  return pts.slice(0, count);
}

function generateDensityWeightedSeeds(count, w, h, rng, density) {
  // Build CDF for rejection sampling
  const n = w * h;
  let total = 0;
  for (let i = 0; i < n; i++) total += density[i] + 0.05;
  const pts = [];
  let attempts = 0;
  const maxAttempts = count * 50;
  while (pts.length < count && attempts++ < maxAttempts) {
    const rx = rng.next() * w;
    const ry = rng.next() * h;
    const xi = Math.min(w - 1, Math.floor(rx));
    const yi = Math.min(h - 1, Math.floor(ry));
    const d = density[yi * w + xi] + 0.05;
    if (rng.next() < d) {
      pts.push({ x: rx, y: ry });
    }
  }
  // Fill remainder with uniform if density field too sparse
  while (pts.length < count) {
    pts.push({ x: rng.next() * w, y: rng.next() * h });
  }
  return pts;
}

function generateSeeds(count, w, h, seedMode, rng, density) {
  const minDist = Math.sqrt((w * h) / count) * 0.6;
  switch (seedMode) {
    case 'JITTERED GRID':          return generateJitteredGridSeeds(count, w, h, rng);
    case 'POISSON-DISC':           return generatePoissonDiscSeeds(count, w, h, rng, minDist);
    case 'EDGE WEIGHTED':          return generateDensityWeightedSeeds(count, w, h, rng, density);
    case 'HYBRID WEIGHTED POISSON': {
      const densePts = generateDensityWeightedSeeds(Math.ceil(count * 0.6), w, h, rng, density);
      const poissonPts = generatePoissonDiscSeeds(Math.ceil(count * 0.4), w, h, rng, minDist * 0.5);
      return [...densePts, ...poissonPts].slice(0, count);
    }
    default: return generateUniformSeeds(count, w, h, rng); // UNIFORM RANDOM
  }
}

// ── Rasterisation helpers ──────────────────────────────────────────────────────

function sampleAvgColour(src, w, h, pts) {
  if (pts.length === 0) return [128, 128, 128, 255];
  let r = 0, g = 0, b = 0, a = 0;
  for (const { x, y } of pts) {
    const xi = Math.max(0, Math.min(w - 1, Math.round(x)));
    const yi = Math.max(0, Math.min(h - 1, Math.round(y)));
    const i = (yi * w + xi) * 4;
    r += src[i]; g += src[i + 1]; b += src[i + 2]; a += src[i + 3];
  }
  const n = pts.length;
  return [r / n, g / n, b / n, a / n];
}

function sampleCentroidColour(src, w, h, cx, cy) {
  const xi = Math.max(0, Math.min(w - 1, Math.round(cx)));
  const yi = Math.max(0, Math.min(h - 1, Math.round(cy)));
  const i = (yi * w + xi) * 4;
  return [src[i], src[i + 1], src[i + 2], src[i + 3]];
}

function applyColourVariation(r, g, b, jitter, quantLevels, hueShift, rng) {
  if (jitter > 0) {
    const j = jitter * 30;
    r = Math.max(0, Math.min(255, r + (rng.next() * 2 - 1) * j));
    g = Math.max(0, Math.min(255, g + (rng.next() * 2 - 1) * j));
    b = Math.max(0, Math.min(255, b + (rng.next() * 2 - 1) * j));
  }
  if (quantLevels > 0) {
    const step = 255 / quantLevels;
    r = Math.round(r / step) * step;
    g = Math.round(g / step) * step;
    b = Math.round(b / step) * step;
  }
  if (hueShift !== 0) {
    // RGB→HSL→shift→RGB
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    if (max === min) return [r, g, b];
    const d = max - min;
    const s = d / (l > 0.5 ? 2 - max - min : max + min);
    let h = 0;
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = ((h / 6 + hueShift / 360) % 1 + 1) % 1;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t) => {
      const tt = ((t % 1) + 1) % 1;
      if (tt < 1/6) return p + (q - p) * 6 * tt;
      if (tt < 1/2) return q;
      if (tt < 2/3) return p + (q - p) * (2/3 - tt) * 6;
      return p;
    };
    r = Math.round(hue2rgb(h + 1/3) * 255);
    g = Math.round(hue2rgb(h) * 255);
    b = Math.round(hue2rgb(h - 1/3) * 255);
  }
  return [
    Math.max(0, Math.min(255, Math.round(r))),
    Math.max(0, Math.min(255, Math.round(g))),
    Math.max(0, Math.min(255, Math.round(b)))
  ];
}

// Barycentric scan-line fill for a triangle
function rasteriseTriangle(dst, w, h, ax, ay, bx, by, cx, cy, r, g, b, a) {
  const minY = Math.max(0, Math.floor(Math.min(ay, by, cy)));
  const maxY = Math.min(h - 1, Math.ceil(Math.max(ay, by, cy)));
  for (let y = minY; y <= maxY; y++) {
    let xMin = w, xMax = -1;
    const scanEdge = (x0, y0, x1, y1) => {
      if ((y0 <= y && y < y1) || (y1 <= y && y < y0)) {
        const t = (y - y0) / (y1 - y0);
        const xi = x0 + t * (x1 - x0);
        if (xi < xMin) xMin = xi;
        if (xi > xMax) xMax = xi;
      }
    };
    scanEdge(ax, ay, bx, by);
    scanEdge(bx, by, cx, cy);
    scanEdge(cx, cy, ax, ay);
    const startX = Math.max(0, Math.floor(xMin));
    const endX   = Math.min(w - 1, Math.ceil(xMax));
    for (let x = startX; x <= endX; x++) {
      const i = (y * w + x) * 4;
      dst[i] = r; dst[i + 1] = g; dst[i + 2] = b; dst[i + 3] = a;
    }
  }
}

// Draw a thick line segment (aliased)
function drawLine(dst, w, h, x0, y0, x1, y1, lineW, r, g, b) {
  const hw = Math.max(0.5, lineW / 2);
  const dx = x1 - x0, dy = y1 - y0;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.5) return;
  const nx = -dy / len, ny = dx / len;
  const minX = Math.max(0, Math.floor(Math.min(x0, x1) - hw - 1));
  const maxX = Math.min(w - 1, Math.ceil(Math.max(x0, x1) + hw + 1));
  const minY = Math.max(0, Math.floor(Math.min(y0, y1) - hw - 1));
  const maxY = Math.min(h - 1, Math.ceil(Math.max(y0, y1) + hw + 1));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const px = x - x0, py = y - y0;
      const along = px * (dx / len) + py * (dy / len);
      const perp  = Math.abs(px * nx + py * ny);
      if (along >= 0 && along <= len && perp < hw) {
        const i = (y * w + x) * 4;
        dst[i] = r; dst[i + 1] = g; dst[i + 2] = b; dst[i + 3] = 255;
      }
    }
  }
}

// Rasterise a convex/arbitrary polygon (ear-clip into triangles via fan)
function rasterisePolygon(dst, w, h, poly, r, g, b, a) {
  if (poly.length < 3) return;
  const ax = poly[0].x, ay = poly[0].y;
  for (let i = 1; i < poly.length - 1; i++) {
    rasteriseTriangle(dst, w, h, ax, ay, poly[i].x, poly[i].y, poly[i + 1].x, poly[i + 1].y, r, g, b, a);
  }
}

function drawPolygonEdges(dst, w, h, poly, lw, r, g, b) {
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b2 = poly[(i + 1) % poly.length];
    drawLine(dst, w, h, a.x, a.y, b2.x, b2.y, lw, r, g, b);
  }
}

// Collect pixels inside a triangle's bounding box via barycentric test
function collectTriPixels(src, w, h, ax, ay, bx, by, cx, cy) {
  const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
  const maxX = Math.min(w - 1, Math.ceil(Math.max(ax, bx, cx)));
  const minY = Math.max(0, Math.floor(Math.min(ay, by, cy)));
  const maxY = Math.min(h - 1, Math.ceil(Math.max(ay, by, cy)));
  const pts = [];
  const sign = (p1x, p1y, p2x, p2y, p3x, p3y) => (p1x - p3x) * (p2y - p3y) - (p2x - p3x) * (p1y - p3y);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const d1 = sign(x, y, ax, ay, bx, by);
      const d2 = sign(x, y, bx, by, cx, cy);
      const d3 = sign(x, y, cx, cy, ax, ay);
      const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
      const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
      if (!(hasNeg && hasPos)) pts.push({ x, y });
    }
  }
  return pts;
}

// ── Main apply ────────────────────────────────────────────────────────────────

export const MosaicNode = createEffectModule({
  type: 'mosaic',
  name: 'MOSAIC',
  category: 'COMPOSITE',
  forceWorkerPreview: true,

  params: {
    // Stage 2 — Density
    densityMode:   { label: 'DENSITY MODE',  type: 'select', options: ['UNIFORM', 'GRADIENT WEIGHTED', 'EDGE WEIGHTED', 'EDGE DISTANCE', 'CONTRAST WEIGHTED', 'HYBRID'], value: 'HYBRID', tier: 4 },
    baseDensity:   { label: 'BASE DENSITY',  min: 5,   max: 100,  step: 1,    value: 20,  tier: 4, unit: '%', driveable: true },
    gradBoost:     { label: 'GRAD BOOST',    min: 0,   max: 10,   step: 0.1,  value: 5,   tier: 4, unit: '0-10', driveable: true },
    edgeBoost:     { label: 'EDGE BOOST',    min: 0,   max: 10,   step: 0.1,  value: 5,   tier: 4, unit: '0-10', driveable: true },
    edgeFalloff:   { label: 'EDGE FALLOFF',  min: 0.5, max: 10,   step: 0.5,  value: 2,   tier: 4, unit: 'r', driveable: true },
    densityCurve:  { label: 'DENSITY CURVE', type: 'select', options: ['LINEAR', 'SMOOTHSTEP', 'EXPONENTIAL', 'THRESHOLDED'], value: 'SMOOTHSTEP', tier: 5 },
    // Stage 3 — Seeds
    pointCount:    { label: 'POINTS',        min: 10,  max: 2000, step: 10,   value: 300, tier: 3, previewMax: 200, unit: 'pts', driveable: true },
    seedMode:      { label: 'SEED MODE',     type: 'select', options: ['UNIFORM RANDOM', 'JITTERED GRID', 'POISSON-DISC', 'EDGE WEIGHTED', 'HYBRID WEIGHTED POISSON'], value: 'HYBRID WEIGHTED POISSON', tier: 3 },
    seed:          { label: 'SEED',          min: 0,   max: 9999, step: 1,    value: 42,  tier: 4, unit: 'n', driveable: true },
    // Stage 5 — Topology
    renderMode:    { label: 'RENDER MODE',   type: 'select', options: ['FILL', 'WIREFRAME', 'BOTH', 'VORONOI'], value: 'FILL', tier: 3 },
    // Stage 5 — Wire
    wireWidth:     { label: 'WIRE WIDTH',    min: 0.5, max: 5,    step: 0.25, value: 1,   tier: 4, unit: 'px', driveable: true },
    wireColourR:   { label: 'WIRE R',        min: 0,   max: 255,  step: 1,    value: 0,   tier: 5, unit: 'lvl', driveable: true },
    wireColourG:   { label: 'WIRE G',        min: 0,   max: 255,  step: 1,    value: 0,   tier: 5, unit: 'lvl', driveable: true },
    wireColourB:   { label: 'WIRE B',        min: 0,   max: 255,  step: 1,    value: 0,   tier: 5, unit: 'lvl', driveable: true },
    // Stage 6 — Cell colour
    colourMode:    { label: 'COLOUR MODE',   type: 'select', options: ['SOURCE-AVG', 'SOURCE-CENTROID', 'SOLID', 'PALETTE'], value: 'SOURCE-AVG', tier: 3 },
    colourJitter:  { label: 'COLOUR JITTER', min: 0,   max: 1,    step: 0.01, value: 0,   tier: 4, unit: '0-1', driveable: true },
    quantiseLevels:{ label: 'QUANTISE',      min: 0,   max: 32,   step: 1,    value: 0,   tier: 4, unit: 'lvl', driveable: true },
    hueShift:      { label: 'HUE SHIFT',     min: -180, max: 180, step: 1,    value: 0,   tier: 4, unit: '°', driveable: true },
    // Stage 8 — Output
    outputMode:    { label: 'OUTPUT MODE',   type: 'select', options: ['REPLACE', 'OVERLAY', 'MASK'], value: 'REPLACE', tier: 4 }
  },

  apply(src, dst, w, h, p, ctx, modulate) {
    const isPreview = ctx?.quality === 'preview';
    const count = p.pointCount; // already preview-capped by _resolveParams
    const rngSeed = (ctx?.nodeSeed ?? 0) ^ (p.seed | 0);
    const rng = new SeededRNG(rngSeed);

    // Stage 2: build density field
    const density = buildDensityField(
      src, w, h,
      p.densityMode,
      p.baseDensity,
      p.gradBoost,
      p.edgeBoost,
      p.edgeFalloff,
      p.densityCurve
    );

    // Stage 3: generate seeds
    const seeds = generateSeeds(count, w, h, p.seedMode, rng, density);
    if (seeds.length < 3) { dst.set(src); return; }

    // Stage 4: (relaxation — reserved for future phase)

    const wr = Math.round(p.wireColourR);
    const wg = Math.round(p.wireColourG);
    const wb = Math.round(p.wireColourB);
    const ww = p.wireWidth;
    const jitter = p.colourJitter;
    const quant = Math.round(p.quantiseLevels);
    const hShift = p.hueShift;

    // Stage 5 + 6 + 7: topology, cell colour, render
    if (p.renderMode === 'VORONOI') {
      // Voronoi polygon mosaic
      const { cells } = voronoiDiagram2d(seeds, w, h);
      dst.set(src);
      const colRng = new SeededRNG(rngSeed ^ 0xdeadbeef);
      for (const cell of cells) {
        if (cell.polygon.length < 3) continue;
        const site = seeds[cell.siteIdx];

        let cr, cg, cb, ca;
        if (p.colourMode === 'SOURCE-CENTROID' || p.colourMode === 'SOURCE-AVG') {
          [cr, cg, cb, ca] = sampleCentroidColour(src, w, h, site.x, site.y);
        } else {
          cr = cg = cb = 180; ca = 255;
        }
        [cr, cg, cb] = applyColourVariation(cr, cg, cb, jitter, quant, hShift, colRng);

        if (p.outputMode === 'MASK') {
          rasterisePolygon(dst, w, h, cell.polygon, cr, cg, cb, 255);
        } else {
          rasterisePolygon(dst, w, h, cell.polygon, cr, cg, cb, ca);
        }
      }
    } else {
      // Delaunay triangulation
      const { triangles, points: tpts } = delaunayTriangulation2D(seeds);
      if (triangles.length === 0) { dst.set(src); return; }

      if (p.renderMode === 'WIREFRAME') {
        dst.set(src);
      } else {
        dst.fill(0);
      }

      const colRng = new SeededRNG(rngSeed ^ 0xdeadbeef);

      if (p.renderMode !== 'WIREFRAME') {
        for (const tri of triangles) {
          const pa = tpts[tri[0]], pb = tpts[tri[1]], pc = tpts[tri[2]];
          const ax = pa.x, ay = pa.y, bx = pb.x, by = pb.y, cx = pc.x, cy = pc.y;
          const centX = (ax + bx + cx) / 3;
          const centY = (ay + by + cy) / 3;

          let cr, cg, cb, ca;
          if (p.colourMode === 'SOURCE-AVG') {
            const pixels = collectTriPixels(src, w, h, ax, ay, bx, by, cx, cy);
            if (pixels.length === 0) {
              [cr, cg, cb, ca] = sampleCentroidColour(src, w, h, centX, centY);
            } else {
              [cr, cg, cb, ca] = sampleAvgColour(src, w, h, pixels);
            }
          } else if (p.colourMode === 'SOURCE-CENTROID') {
            [cr, cg, cb, ca] = sampleCentroidColour(src, w, h, centX, centY);
          } else {
            cr = cg = cb = 180; ca = 255;
          }
          [cr, cg, cb] = applyColourVariation(cr, cg, cb, jitter, quant, hShift, colRng);

          if (p.outputMode === 'OVERLAY') {
            // blend over src
            const alpha = 0.8;
            const tmpDst = new Uint8ClampedArray(4);
            rasteriseTriangle(tmpDst, w, h, ax, ay, bx, by, cx, cy, cr, cg, cb, Math.round(ca * alpha));
            // For OVERLAY we write directly (compositing handled by node opacity/blendMode at pipeline level)
            rasteriseTriangle(dst, w, h, ax, ay, bx, by, cx, cy, cr, cg, cb, Math.round(ca));
          } else if (p.outputMode === 'MASK') {
            rasteriseTriangle(dst, w, h, ax, ay, bx, by, cx, cy, cr, cg, cb, 255);
          } else {
            rasteriseTriangle(dst, w, h, ax, ay, bx, by, cx, cy, cr, cg, cb, Math.round(ca));
          }
        }
      }

      if (p.renderMode === 'WIREFRAME' || p.renderMode === 'BOTH') {
        const seen = new Set();
        for (const tri of triangles) {
          for (let e = 0; e < 3; e++) {
            const i = tri[e], j = tri[(e + 1) % 3];
            const key = i < j ? `${i}-${j}` : `${j}-${i}`;
            if (seen.has(key)) continue;
            seen.add(key);
            const pa = tpts[i], pb = tpts[j];
            drawLine(dst, w, h, pa.x, pa.y, pb.x, pb.y, ww, wr, wg, wb);
          }
        }
      }
    }

    // For VORONOI wireframe (edges are implicit in fill — future stage)
  },

  fromJSON(data) {
    // Legacy colorMode migration
    if (data.params?.colorMode && !data.params?.renderMode) {
      const legacy = data.params.colorMode;
      data.params.renderMode = legacy === 'WIRE' ? 'WIREFRAME' : 'FILL';
      delete data.params.colorMode;
    }
  }
});
