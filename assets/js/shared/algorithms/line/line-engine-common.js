/**
 * @fileoverview Line engine common utilities — clipping, bounds, seeded PRNG, path length.
 *
 * @source DISTORT image pipeline reference (src/modules/line/line-engine-common.js)
 * @wikipedia https://en.wikipedia.org/wiki/Linear_congruential_generator
 * @formula LCG: s = (s * 1664525 + 1013904223) >>> 0; rng = s / 2^32
 */

/**
 * Clamp a point to [0, width-1] × [0, height-1].
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {{ x: number, y: number }}
 */
export function clipPoint(x, y, width, height) {
  return {
    x: Math.max(0, Math.min(width - 1, x)),
    y: Math.max(0, Math.min(height - 1, y))
  };
}

/**
 * Compute axis-aligned bounding box of an array of polylines.
 * @param {Array<Array<{x:number,y:number}>>} lines
 * @returns {{ minX: number, minY: number, maxX: number, maxY: number }}
 */
export function lineBounds(lines) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const line of lines) {
    for (const p of line) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  return { minX, minY, maxX, maxY };
}

/**
 * Create a deterministic pseudo-random number generator using a linear
 * congruential generator (Knuth/ANSI C parameters).
 * @param {number} seed - Integer seed (default 1)
 * @returns {() => number} Function returning values in [0, 1)
 */
export function seededRandom(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/**
 * Compute the total arc-length of a polyline.
 * @param {Array<{x:number,y:number}>} line
 * @returns {number}
 */
export function pathLength(line) {
  let len = 0;
  for (let i = 1; i < line.length; i++) {
    const dx = line[i].x - line[i - 1].x;
    const dy = line[i].y - line[i - 1].y;
    len += Math.hypot(dx, dy);
  }
  return len;
}
