/**
 * DISTORT — deterministic LCG random number generator.
 * LCG parameters: Knuth/ANSI C (multiplier 1664525, increment 1013904223).
 * hashSeed: deterministic seed derivation from global seed + node index + node id.
 */
export class SeededRNG {
  constructor(s) {
    this.seed = s >>> 0;
  }

  next() {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  nextRange(a, b) { return a + this.next() * (b - a); }
  nextInt(a, b)   { return Math.floor(this.nextRange(a, b)); }
}

/**
 * Derive a deterministic uint32 seed from global seed, node index, and node id.
 * Uses multiply-then-xor diffusion to avoid correlated seeds.
 * @param {number} g - Global seed
 * @param {number} n - Node index
 * @param {number} [x=0] - Node id
 * @returns {number} uint32 seed
 */
export function hashSeed(g, n, x = 0) {
  let h = g ^ (n * 2654435761) ^ (x * 2246822519);
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}
