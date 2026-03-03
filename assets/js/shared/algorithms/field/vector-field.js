/**
 * @fileoverview 2-D vector field creation, normalisation, and bilinear/nearest sampling.
 *
 * @source DISTORT image pipeline reference (src/modules/field/vector-field.js)
 * @wikipedia https://en.wikipedia.org/wiki/Vector_field
 * @formula bilinear: f(x,y) = (1-tx)(1-ty)*f00 + tx(1-ty)*f10 + (1-tx)ty*f01 + tx*ty*f11
 */

/**
 * Create a validated VectorField object.
 * @param {number} width
 * @param {number} height
 * @param {Float32Array} vectors - Interleaved [vx0,vy0, vx1,vy1, ...], length = width*height*2
 * @returns {{ width: number, height: number, vectors: Float32Array }}
 */
export function createVectorField(width, height, vectors) {
  if (vectors.length !== width * height * 2) throw new Error('Vector length mismatch');
  return { width, height, vectors };
}

/**
 * Return a new field with each vector normalised to unit length.
 * @param {{ width: number, height: number, vectors: Float32Array }} field
 * @returns {{ width: number, height: number, vectors: Float32Array }}
 */
export function normalizeField(field) {
  const vectors = new Float32Array(field.vectors.length);
  for (let i = 0; i < field.vectors.length; i += 2) {
    const x = field.vectors[i];
    const y = field.vectors[i + 1];
    const d = Math.hypot(x, y) || 1;
    vectors[i] = x / d;
    vectors[i + 1] = y / d;
  }
  return { width: field.width, height: field.height, vectors };
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/**
 * Sample a vector field at a fractional coordinate.
 * @param {{ width: number, height: number, vectors: Float32Array }} field
 * @param {number} x - Fractional x in [0, width-1]
 * @param {number} y - Fractional y in [0, height-1]
 * @param {'nearest'|'bilinear'} [mode='nearest']
 * @returns {[number, number]} [vx, vy]
 */
export function sampleField(field, x, y, mode = 'nearest') {
  const { vectors, width, height } = field;

  if (mode === 'nearest') {
    const xi = Math.round(clamp(x, 0, width - 1));
    const yi = Math.round(clamp(y, 0, height - 1));
    const i = (yi * width + xi) * 2;
    return [vectors[i], vectors[i + 1]];
  }

  const x0 = Math.floor(clamp(x, 0, width - 1));
  const y0 = Math.floor(clamp(y, 0, height - 1));
  const x1 = clamp(x0 + 1, 0, width - 1);
  const y1 = clamp(y0 + 1, 0, height - 1);
  const tx = x - x0;
  const ty = y - y0;

  const at = (xx, yy) => {
    const i = (yy * width + xx) * 2;
    return [vectors[i], vectors[i + 1]];
  };

  const a = at(x0, y0), b = at(x1, y0), c = at(x0, y1), d = at(x1, y1);
  const mix = (u, v, t) => u + (v - u) * t;
  const top = [mix(a[0], b[0], tx), mix(a[1], b[1], tx)];
  const bot = [mix(c[0], d[0], tx), mix(c[1], d[1], tx)];
  return [mix(top[0], bot[0], ty), mix(top[1], bot[1], ty)];
}
