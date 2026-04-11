/**
 * @fileoverview 2D Delaunay triangulation (Bowyer–Watson), non-mutating input.
 * @module geometry/delaunay-2d
 */

/**
 * @param {{x:number,y:number}[]} pts - working copy including super-triangle verts
 * @param {number[]} tri
 * @param {{x:number,y:number}} p
 * @returns {boolean}
 */
function inCircumcircle(pts, tri, p) {
  const a = pts[tri[0]];
  const b = pts[tri[1]];
  const c = pts[tri[2]];
  const ax = a.x - p.x;
  const ay = a.y - p.y;
  const bx = b.x - p.x;
  const by = b.y - p.y;
  const cx = c.x - p.x;
  const cy = c.y - p.y;
  return (
    ax * (by * (cx * cx + cy * cy) - cy * (bx * bx + by * by)) -
      ay * (bx * (cx * cx + cy * cy) - cx * (bx * bx + by * by)) +
      (ax * ax + ay * ay) * (bx * cy - by * cx) >
    0
  );
}

/**
 * @param {{x:number,y:number}[]} pts - mutated: super-triangle vertices appended
 * @returns {number[][]} triangles as [i,j,k], indices only into original point set
 */
function bowyerWatson(pts) {
  const si = pts.length;
  if (si < 3) return [];

  const minX = pts.reduce((m, p) => Math.min(m, p.x), Infinity);
  const minY = pts.reduce((m, p) => Math.min(m, p.y), Infinity);
  const maxX = pts.reduce((m, p) => Math.max(m, p.x), -Infinity);
  const maxY = pts.reduce((m, p) => Math.max(m, p.y), -Infinity);
  const dx = maxX - minX;
  const dy = maxY - minY;
  const dmax = Math.max(dx, dy) * 2;
  pts.push(
    { x: minX - dmax, y: minY - 1 },
    { x: minX + dmax * 2, y: minY - 1 },
    { x: minX + dx / 2, y: maxY + dmax }
  );

  let tris = [[si, si + 1, si + 2]];
  for (let i = 0; i < si; i++) {
    const p = pts[i];
    const bad = [];
    const poly = [];
    for (const t of tris) {
      if (inCircumcircle(pts, t, p)) bad.push(t);
    }
    for (const t of bad) {
      for (let j = 0; j < 3; j++) {
        const e = [t[j], t[(j + 1) % 3]];
        let shared = false;
        for (const b of bad) {
          if (b === t) continue;
          for (let k = 0; k < 3; k++) {
            if (
              (b[k] === e[0] && b[(k + 1) % 3] === e[1]) ||
              (b[k] === e[1] && b[(k + 1) % 3] === e[0])
            ) {
              shared = true;
              break;
            }
          }
          if (shared) break;
        }
        if (!shared) poly.push(e);
      }
    }
    tris = tris.filter((t) => !bad.includes(t));
    for (const e of poly) tris.push([e[0], e[1], i]);
  }
  return tris.filter((t) => t[0] < si && t[1] < si && t[2] < si);
}

/**
 * @param {Array<{x:number,y:number}>} points
 * @returns {{ triangles: number[][], points: {x:number,y:number}[] }}
 */
export function delaunayTriangulation2D(points) {
  if (!points || points.length < 3) {
    return { triangles: [], points: points ? points.map((p) => ({ x: p.x, y: p.y })) : [] };
  }
  const pts = points.map((p) => ({ x: p.x, y: p.y }));
  const triangles = bowyerWatson(pts);
  return {
    triangles,
    points: points.map((p) => ({ x: p.x, y: p.y }))
  };
}
