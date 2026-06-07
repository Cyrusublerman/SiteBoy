/**
 * @fileoverview Circular brush stamp and polyline painting with alpha blending.
 *
 * @source DISTORT image pipeline reference (src/modules/painter/brush-engine.js)
 * @wikipedia https://en.wikipedia.org/wiki/Digital_painting
 * @formula alpha(t) = 1 if t <= hardness else max(0, 1 - (t - hardness) / (1 - hardness))
 *   where t = distance / radius; output = over(base, color, alpha)
 */

/**
 * Alpha-blend a colour onto a single pixel using "over" compositing.
 * @source blog/docs/components/distort/modules/paintstroke.md
 * @wikipedia https://en.wikipedia.org/wiki/Alpha_compositing
 * @formula out = base * (1 - a) + color * a; a = (colorA/255) * alpha
 * @param {Uint8ClampedArray} out - RGBA buffer (mutated)
 * @param {number} i - Byte index of the pixel (must be multiple of 4)
 * @param {[number,number,number,number]} color - [R, G, B, A] 0-255
 * @param {number} alpha - Additional alpha multiplier in [0, 1]
 */
export function blendPixel(out, i, color, alpha) {
  const a = (color[3] / 255) * alpha;
  const inv = 1 - a;
  out[i]     = out[i]     * inv + color[0] * a;
  out[i + 1] = out[i + 1] * inv + color[1] * a;
  out[i + 2] = out[i + 2] * inv + color[2] * a;
  out[i + 3] = Math.min(255, out[i + 3] + 255 * a);
}

function _falloffAlpha(t, baseAlpha, hardness, falloff) {
  if (t <= hardness) return baseAlpha;
  const u = (t - hardness) / (1 - hardness + 1e-6);
  if (falloff === 'power') return baseAlpha * Math.max(0, 1 - u * u);
  return baseAlpha * Math.max(0, 1 - u);
}

/**
 * Radial gradient dab (reference GradientBrush): full opacity at centre, zero at rim.
 * @source blog/docs/components/distort/modules/paintstroke.md
 * @wikipedia https://en.wikipedia.org/wiki/Digital_painting
 * @formula alpha = colA * max(0, 1 - distance/radius)
 * @param {Uint8ClampedArray} buf - Mutated in place
 */
export function paintRadialGradient(buf, width, height, x, y, color = [0, 0, 0, 255], radius = 2, falloff = 'linear') {
  const colA = color[3] / 255;
  const rr = radius * radius;
  const x0 = Math.max(0, Math.floor(x - radius));
  const x1 = Math.min(width - 1, Math.ceil(x + radius));
  const y0 = Math.max(0, Math.floor(y - radius));
  const y1 = Math.min(height - 1, Math.ceil(y + radius));
  for (let py = y0; py <= y1; py++) {
    for (let px = x0; px <= x1; px++) {
      const dx = px - x;
      const dy = py - y;
      const d2 = dx * dx + dy * dy;
      if (d2 > rr) continue;
      const t = Math.sqrt(d2) / radius;
      const alpha = colA * Math.max(0, 1 - t);
      const inv = 1 - alpha;
      const j = (py * width + px) * 4;
      buf[j]     = buf[j]     * inv + color[0] * alpha;
      buf[j + 1] = buf[j + 1] * inv + color[1] * alpha;
      buf[j + 2] = buf[j + 2] * inv + color[2] * alpha;
      buf[j + 3] = Math.min(255, buf[j + 3] + 255 * alpha);
    }
  }
}

/**
 * Soft/hard ring stamp (mutates buf in place).
 * @source blog/docs/components/distort/modules/paintstroke.md
 * @wikipedia https://en.wikipedia.org/wiki/Digital_painting
 * @formula alpha(t) = 1 if t <= hardness else max(0, 1 - (t - hardness)/(1 - hardness))
 */
export function paintStampInPlace(buf, width, height, x, y, color = [0, 0, 0, 255], radius = 2, hardness = 0.8) {
  const rr = radius * radius;
  const colA = color[3] / 255;
  for (let oy = -radius; oy <= radius; oy++) {
    for (let ox = -radius; ox <= radius; ox++) {
      const d2 = ox * ox + oy * oy;
      if (d2 > rr) continue;
      const px = Math.round(x + ox);
      const py = Math.round(y + oy);
      if (px < 0 || py < 0 || px >= width || py >= height) continue;
      const t = Math.sqrt(d2) / radius;
      const alpha = _falloffAlpha(t, colA, hardness, 'linear');
      const inv = 1 - alpha;
      const j = (py * width + px) * 4;
      buf[j]     = buf[j]     * inv + color[0] * alpha;
      buf[j + 1] = buf[j + 1] * inv + color[1] * alpha;
      buf[j + 2] = buf[j + 2] * inv + color[2] * alpha;
      buf[j + 3] = Math.min(255, buf[j + 3] + 255 * alpha);
    }
  }
}

/**
 * Paint a single circular brush stamp onto a pixel buffer (returns new buffer).
 * @source blog/docs/components/distort/modules/paintstroke.md
 * @wikipedia https://en.wikipedia.org/wiki/Digital_painting
 * @formula delegates to paintStampInPlace on a buffer copy
 */
export function paintStamp(pixels, width, height, x, y, color = [0, 0, 0, 255], radius = 2, hardness = 0.8) {
  const out = new Uint8ClampedArray(pixels);
  paintStampInPlace(out, width, height, x, y, color, radius, hardness);
  return out;
}

/**
 * Hard-edge filled circle (mutates buf).
 * @source blog/docs/components/distort/modules/paintstroke.md
 * @wikipedia https://en.wikipedia.org/wiki/Digital_painting
 * @formula paintStampInPlace(..., hardness=1)
 */
export function paintHardCircle(buf, width, height, x, y, color, radius) {
  paintStampInPlace(buf, width, height, x, y, color, radius, 1);
}

/**
 * Oriented ellipse stamp (mutates buf).
 * @source blog/docs/components/distort/modules/paintstroke.md
 * @wikipedia https://en.wikipedia.org/wiki/Digital_painting
 * @formula dist = sqrt((lx/rA)^2 + (ly/rB)^2); alpha = colA * falloff(dist, hardness)
 */
export function paintEllipse(buf, width, height, cx, cy, color, radiusA, radiusB, angle, hardness = 0.75) {
  const cosA = Math.cos(-angle);
  const sinA = Math.sin(-angle);
  const rA2 = radiusA * radiusA;
  const rB2 = radiusB * radiusB;
  const rmax = Math.max(radiusA, radiusB);
  const x0 = Math.max(0, Math.floor(cx - rmax));
  const x1 = Math.min(width - 1, Math.ceil(cx + rmax));
  const y0 = Math.max(0, Math.floor(cy - rmax));
  const y1 = Math.min(height - 1, Math.ceil(cy + rmax));
  const colA = color[3] / 255;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const lx = cosA * dx - sinA * dy;
      const ly = sinA * dx + cosA * dy;
      const t = lx * lx / rA2 + ly * ly / rB2;
      if (t > 1) continue;
      const dist = Math.sqrt(t);
      const alpha = colA * _falloffAlpha(dist, 1, hardness, 'linear');
      const inv = 1 - alpha;
      const j = (y * width + x) * 4;
      buf[j]     = buf[j]     * inv + color[0] * alpha;
      buf[j + 1] = buf[j + 1] * inv + color[1] * alpha;
      buf[j + 2] = buf[j + 2] * inv + color[2] * alpha;
      buf[j + 3] = Math.min(255, buf[j + 3] + 255 * alpha);
    }
  }
}

/**
 * Sparse offset stamps (dry brush).
 * @source blog/docs/components/distort/modules/paintstroke.md
 * @wikipedia https://en.wikipedia.org/wiki/Digital_painting
 * @formula n filament stamps at random offsets within radius
 */
export function paintDryBrush(buf, width, height, x, y, color, radius, rng, filaments = 5) {
  for (let f = 0; f < filaments; f++) {
    const ox = (rng.next() * 2 - 1) * radius;
    const oy = (rng.next() * 2 - 1) * radius;
    paintRadialGradient(buf, width, height, x + ox, y + oy, color, Math.max(1, radius * 0.35));
  }
}

/**
 * Bristle stroke: parallel offset ellipses.
 * @source blog/docs/components/distort/modules/paintstroke.md
 * @wikipedia https://en.wikipedia.org/wiki/Digital_painting
 * @formula n parallel ellipses offset perpendicular to stroke angle
 */
export function paintBristle(buf, width, height, x, y, color, radiusA, radiusB, angle, hardness, rng) {
  const n = 4;
  for (let b = 0; b < n; b++) {
    const off = (b - (n - 1) / 2) * radiusB * 0.4;
    const cx = x + Math.cos(angle + Math.PI * 0.5) * off;
    const cy = y + Math.sin(angle + Math.PI * 0.5) * off;
    paintEllipse(buf, width, height, cx, cy, color, radiusA * 0.6, radiusB * 0.25, angle, hardness);
  }
}

/**
 * Paint a series of brush stamps along points (mutates copy chain).
 * @source blog/docs/components/distort/modules/paintstroke.md
 * @wikipedia https://en.wikipedia.org/wiki/Digital_painting
 * @formula stamp at each polyline vertex with shape-specific falloff
 */
export function paintPolyline(pixels, width, height, points, opts = {}) {
  const color = opts.color ?? [0, 0, 0, 255];
  const radius = opts.radius ?? 2;
  const hardness = opts.hardness ?? 0.8;
  const shape = opts.shape ?? 'SOFT DAB';
  const buf = new Uint8ClampedArray(pixels);
  for (const p of points) {
    const px = p.x ?? p[0];
    const py = p.y ?? p[1];
    if (shape === 'RADIAL GRADIENT' || shape === 'radialGradient') {
      paintRadialGradient(buf, width, height, px, py, color, radius);
    } else if (shape === 'HARD DAB') {
      paintHardCircle(buf, width, height, px, py, color, radius);
    } else {
      paintStamp(buf, width, height, px, py, color, radius, hardness);
    }
  }
  return buf;
}

/**
 * Stamp in-place according to brush shape name.
 * @source blog/docs/components/distort/modules/paintstroke.md
 * @wikipedia https://en.wikipedia.org/wiki/Digital_painting
 * @formula dispatches to shape-specific stamp; radius = size/2
 */
export function paintBrushShape(buf, w, h, x, y, color, size, shape, hardness, angle, rng, brushLength = 20) {
  const radius = Math.max(1, Math.round(size / 2));
  const shapeU = String(shape).toUpperCase();
  if (shapeU === 'RADIAL GRADIENT') {
    paintRadialGradient(buf, w, h, x, y, color, radius);
    return;
  }
  if (shapeU === 'HARD DAB') {
    paintHardCircle(buf, w, h, x, y, color, radius);
    return;
  }
  if (shapeU === 'ELLIPSE' || shapeU === 'RIBBON') {
    const rA = shapeU === 'RIBBON' ? Math.max(1, brushLength / 2) : Math.max(1, size * brushLength / 4);
    const rB = Math.max(1, size / 2);
    paintEllipse(buf, w, h, x, y, color, rA, rB, angle, hardness);
    return;
  }
  if (shapeU === 'BRISTLE') {
    paintBristle(buf, w, h, x, y, color, Math.max(1, size / 2), Math.max(1, size / 4), angle, hardness, rng);
    return;
  }
  if (shapeU === 'DRY BRUSH') {
    paintDryBrush(buf, w, h, x, y, color, radius, rng);
    return;
  }
  paintStampInPlace(buf, w, h, x, y, color, radius, hardness);
}
