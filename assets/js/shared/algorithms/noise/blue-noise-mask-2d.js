/**
 * @fileoverview Tiled blue-noise threshold mask: O(1) lookup from a precomputed tile.
 */

import { poissonDisk } from '../sampling/point-distribution.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function blueNoiseMask2D(x, y, size, tile) {
  if (size <= 0) return 0;
  const sx = ((Math.floor(x) % size) + size) % size;
  const sy = ((Math.floor(y) % size) + size) % size;
  return tile[sy * size + sx] / 255;
}

export function generateBlueNoiseTile(size, seed = 1) {
  const n = size * size;
  const tile = new Uint8Array(n);
  if (size <= 0) return tile;
  if (size === 1) {
    tile[0] = 128;
    return tile;
  }
  const rng = mulberry32(seed);
  const minDist = Math.max(1, size / 14);
  const pts = poissonDisk(size, size, minDist, 30, rng);
  if (pts.length === 0) pts.push({ x: size * 0.5, y: size * 0.5 });
  const entries = [];
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const cx = i + 0.5;
      const cy = j + 0.5;
      let d2 = Infinity;
      for (const p of pts) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        d2 = Math.min(d2, dx * dx + dy * dy);
      }
      entries.push({ i, j, d2, tie: j * size + i });
    }
  }
  entries.sort((a, b) => b.d2 - a.d2 || a.tie - b.tie);
  const denom = Math.max(1, n - 1);
  for (let k = 0; k < entries.length; k++) {
    const e = entries[k];
    tile[e.j * size + e.i] = Math.round((255 * k) / denom);
  }
  return tile;
}
