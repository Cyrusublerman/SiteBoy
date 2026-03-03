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
 * @param {Uint8ClampedArray} out - RGBA buffer (mutated)
 * @param {number} i - Byte index of the pixel (must be multiple of 4)
 * @param {[number,number,number,number]} color - [R, G, B, A] 0-255
 * @param {number} alpha - Additional alpha multiplier in [0, 1]
 */
function blendPixel(out, i, color, alpha) {
  const a = (color[3] / 255) * alpha;
  const inv = 1 - a;
  out[i]     = out[i]     * inv + color[0] * a;
  out[i + 1] = out[i + 1] * inv + color[1] * a;
  out[i + 2] = out[i + 2] * inv + color[2] * a;
  out[i + 3] = Math.max(out[i + 3], 255 * a + out[i + 3] * inv);
}

/**
 * Paint a single circular brush stamp onto a pixel buffer.
 * Uses a hard-edge/soft-falloff alpha profile: fully opaque within the hardness
 * fraction of the radius, linearly falling to zero at the outer edge.
 *
 * @param {Uint8ClampedArray} pixels - Source RGBA buffer (not mutated)
 * @param {number} width
 * @param {number} height
 * @param {number} x - Centre X
 * @param {number} y - Centre Y
 * @param {[number,number,number,number]} [color=[0,0,0,255]]
 * @param {number} [radius=2]
 * @param {number} [hardness=0.8] - Inner opaque fraction [0, 1]
 * @returns {Uint8ClampedArray} New buffer with stamp applied
 */
export function paintStamp(pixels, width, height, x, y, color = [0, 0, 0, 255], radius = 2, hardness = 0.8) {
  const out = new Uint8ClampedArray(pixels);
  const rr = radius * radius;
  for (let oy = -radius; oy <= radius; oy++) {
    for (let ox = -radius; ox <= radius; ox++) {
      const d2 = ox * ox + oy * oy;
      if (d2 > rr) continue;
      const px = Math.round(x + ox);
      const py = Math.round(y + oy);
      if (px < 0 || py < 0 || px >= width || py >= height) continue;
      const t = Math.sqrt(d2) / radius;
      const alpha = t <= hardness ? 1 : Math.max(0, 1 - (t - hardness) / (1 - hardness));
      blendPixel(out, (py * width + px) * 4, color, alpha);
    }
  }
  return out;
}

/**
 * Paint a series of brush stamps along an array of points.
 * @param {Uint8ClampedArray} pixels
 * @param {number} width
 * @param {number} height
 * @param {Array<{x:number,y:number}>} points
 * @param {object} [opts={}]
 * @param {[number,number,number,number]} [opts.color=[0,0,0,255]]
 * @param {number} [opts.radius=2]
 * @param {number} [opts.hardness=0.8]
 * @returns {Uint8ClampedArray} New buffer
 */
export function paintPolyline(pixels, width, height, points, opts = {}) {
  let out = new Uint8ClampedArray(pixels);
  for (const p of points) {
    out = paintStamp(out, width, height, p.x, p.y, opts.color, opts.radius, opts.hardness);
  }
  return out;
}
