/**
 * @fileoverview 2D Voronoi diagram: Delaunay dual (triangle circumcenters), clipped to a rectangle.
 * @module geometry/voronoi-2d
 */

import { delaunayTriangulation2D } from './delaunay-2d.js';

/**
 * @param {Array<{x:number,y:number}>} poly
 * @param {number} a
 * @param {number} b
 * @param {number} c - keep vertices with a*x + b*y + c <= eps
 * @returns {Array<{x:number,y:number}>}
 */
function clipHalfPlane(poly, a, b, c, eps = 1e-9) {
  if (poly.length === 0) return [];
  const inside = (p) => a * p.x + b * p.y + c <= eps;
  const intersect = (p1, p2) => {
    const d1 = a * p1.x + b * p1.y + c;
    const d2 = a * p2.x + b * p2.y + c;
    const t = d1 / (d1 - d2);
    return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
  };
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    const cin = inside(cur);
    const pin = inside(prev);
    if (cin) {
      if (!pin) out.push(intersect(prev, cur));
      out.push(cur);
    } else if (pin) {
      out.push(intersect(prev, cur));
    }
  }
  return out;
}

function clipPolygonToRect(poly, width, height) {
  let p = poly;
  p = clipHalfPlane(p, -1, 0, 0);
  p = clipHalfPlane(p, 1, 0, -width);
  p = clipHalfPlane(p, 0, -1, 0);
  p = clipHalfPlane(p, 0, 1, -height);
  return p;
}

/**
 * @param {number} ax
 * @param {number} ay
 * @param {number} bx
 * @param {number} by
 * @param {number} cx
 * @param {number} cy
 * @returns {{x:number,y:number}|null}
 */
function circumcenter(ax, ay, bx, by, cx, cy) {
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(d) < 1e-14) return null;
  const a2 = ax * ax + ay * ay;
  const b2 = bx * bx + by * by;
  const c2 = cx * cx + cy * cy;
  const ux = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d;
  const uy = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d;
  return { x: ux, y: uy };
}

/**
 * @param {Array<{x:number,y:number}>} sites
 * @param {number} siteIdx
 * @param {number} width
 * @param {number} height
 * @returns {{x:number,y:number}[]}
 */
function voronoiCellHalfPlane(sites, siteIdx, width, height) {
  let poly = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height }
  ];
  const si = sites[siteIdx];
  for (let j = 0; j < sites.length; j++) {
    if (j === siteIdx) continue;
    const sj = sites[j];
    const a = 2 * (sj.x - si.x);
    const b = 2 * (sj.y - si.y);
    const c = si.x * si.x + si.y * si.y - sj.x * sj.x - sj.y * sj.y;
    poly = clipHalfPlane(poly, a, b, c);
    if (poly.length === 0) break;
  }
  return poly;
}

/**
 * Nearest-site index (brute force).
 * @param {number} x
 * @param {number} y
 * @param {Array<{x:number,y:number}>} sites
 * @returns {number} index or -1 if empty
 */
export function voronoiQuery2d(x, y, sites) {
  if (!sites || sites.length === 0) return -1;
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < sites.length; i++) {
    const dx = sites[i].x - x;
    const dy = sites[i].y - y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD) {
      bestD = d2;
      best = i;
    }
  }
  return best;
}

/**
 * @param {Array<{x:number,y:number}>} points
 * @param {number} width
 * @param {number} height
 * @returns {{ cells: Array<{ siteIdx: number, polygon: {x:number,y:number}[] }>, sites: {x:number,y:number}[] }}
 */
export function voronoiDiagram2d(points, width, height) {
  const sites = points.map((p) => ({ x: p.x, y: p.y }));
  if (sites.length === 0) return { cells: [], sites: [] };

  if (sites.length === 1) {
    return {
      cells: [{ siteIdx: 0, polygon: clipPolygonToRect([{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }], width, height) }],
      sites
    };
  }

  const { triangles } = delaunayTriangulation2D(sites);
  const incident = sites.map(() => []);
  for (let t = 0; t < triangles.length; t++) {
    const tri = triangles[t];
    incident[tri[0]].push(t);
    incident[tri[1]].push(t);
    incident[tri[2]].push(t);
  }

  const cells = [];
  for (let i = 0; i < sites.length; i++) {
    const centers = [];
    const seen = new Set();
    for (const ti of incident[i]) {
      const [ia, ib, ic] = triangles[ti];
      const pa = sites[ia];
      const pb = sites[ib];
      const pc = sites[ic];
      const cc = circumcenter(pa.x, pa.y, pb.x, pb.y, pc.x, pc.y);
      if (!cc) continue;
      const key = `${Math.round(cc.x * 1e6)},${Math.round(cc.y * 1e6)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      centers.push(cc);
    }
    const sx = sites[i].x;
    const sy = sites[i].y;
    centers.sort(
      (p, q) => Math.atan2(p.y - sy, p.x - sx) - Math.atan2(q.y - sy, q.x - sx)
    );
    let polygon =
      centers.length >= 3 ? centers : voronoiCellHalfPlane(sites, i, width, height);
    polygon = clipPolygonToRect(polygon, width, height);
    cells.push({ siteIdx: i, polygon });
  }
  return { cells, sites };
}
