/**
 * @fileoverview Generic front propagation — iterative point tracing with pluggable step function.
 *
 * @source DISTORT image pipeline reference (src/modules/line/front-propagation-core.js)
 * @wikipedia https://en.wikipedia.org/wiki/Level-set_method
 * @formula next = stepFn(current, index, points); continue until null or terminateFn
 */

/**
 * Propagate a front from a start point by iteratively applying stepFn.
 * Stops when stepFn returns null/undefined, when terminateFn returns true,
 * or when `steps` iterations are exhausted.
 *
 * @param {{ x: number, y: number }} start - Starting point
 * @param {object} opts
 * @param {number} [opts.steps=64] - Maximum iterations
 * @param {(cur: {x,y}, i: number, pts: {x,y}[]) => {x,y}|null} opts.stepFn - Advance function
 * @param {((next: {x,y}, i: number, pts: {x,y}[]) => boolean)|null} [opts.terminateFn] - Early stop
 * @returns {Array<{x:number,y:number}>} Traced point array including start
 */
export function propagateFront(start, { steps = 64, stepFn, terminateFn = null } = {}) {
  const points = [start];
  let cur = start;

  for (let i = 0; i < steps; i++) {
    const next = stepFn(cur, i, points);
    if (!next) break;
    if (terminateFn?.(next, i, points)) break;
    points.push(next);
    cur = next;
  }

  return points;
}
