/**
 * @fileoverview Build a normalised Sobel gradient VectorField from an RGBA pixel buffer.
 *
 * @source DISTORT image pipeline reference (src/modules/field/base-gradient.js)
 * @wikipedia https://en.wikipedia.org/wiki/Sobel_operator
 * @formula gx = [-1,0,1; -2,0,2; -1,0,1] * L; gy = [-1,-2,-1; 0,0,0; 1,2,1] * L
 *   where L = ITU-R BT.601 luma: 0.299R + 0.587G + 0.114B
 */

const LUMA_R = 0.299;
const LUMA_G = 0.587;
const LUMA_B = 0.114;

/**
 * Convert RGBA pixel buffer to a Float32Array of per-pixel luminance in [0, 255].
 * @param {Uint8ClampedArray} pixels - RGBA buffer, length = width * height * 4
 * @returns {Float32Array}
 */
function toLumaMap(pixels) {
  const out = new Float32Array(pixels.length >> 2);
  for (let i = 0, p = 0; i < pixels.length; i += 4, p++) {
    out[p] = pixels[i] * LUMA_R + pixels[i + 1] * LUMA_G + pixels[i + 2] * LUMA_B;
  }
  return out;
}

/**
 * Build a 2-D gradient VectorField from an RGBA pixel buffer using the Sobel operator.
 * @param {Uint8ClampedArray} pixels - Source RGBA buffer
 * @param {number} width
 * @param {number} height
 * @param {boolean} [normalize=true] - Normalise each vector to unit length
 * @returns {{ width: number, height: number, vectors: Float32Array }}
 */
export function buildBaseGradient(pixels, width, height, normalize = true) {
  const lum = toLumaMap(pixels);
  const vectors = new Float32Array(width * height * 2);

  const lumaAt = (x, y) =>
    lum[Math.max(0, Math.min(height - 1, y)) * width + Math.max(0, Math.min(width - 1, x))];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gx =
        -lumaAt(x - 1, y - 1) + lumaAt(x + 1, y - 1) +
        -2 * lumaAt(x - 1, y) + 2 * lumaAt(x + 1, y) +
        -lumaAt(x - 1, y + 1) + lumaAt(x + 1, y + 1);
      const gy =
        -lumaAt(x - 1, y - 1) - 2 * lumaAt(x, y - 1) - lumaAt(x + 1, y - 1) +
         lumaAt(x - 1, y + 1) + 2 * lumaAt(x, y + 1) + lumaAt(x + 1, y + 1);

      const i = (y * width + x) * 2;
      if (normalize) {
        const d = Math.hypot(gx, gy) || 1;
        vectors[i] = gx / d;
        vectors[i + 1] = gy / d;
      } else {
        vectors[i] = gx;
        vectors[i + 1] = gy;
      }
    }
  }

  return { width, height, vectors };
}
