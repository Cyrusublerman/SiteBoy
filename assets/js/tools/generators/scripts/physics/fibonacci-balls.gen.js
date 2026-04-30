/**
 * Fibonacci Balls - p5.js Generator
 *
 * Fibonacci-radius circles packed using a front-chain algorithm. Each outer
 * circle contains a smaller inner circle that bounces inside it. Collisions
 * trigger HSL colour shifts: hue by size ratio, saturation by collision angle,
 * lightness by speed ratio. Trails add motion blur.
 *
 * Canvas size is determined by the Fibonacci sequence (fib[fibIndex]).
 *
 * Based on Fib_balls sketch.
 *
 * @version 1.1.0
 */

import '../../../../shared/algorithms/core/math-utils.js';
import { AudioOutput } from '../../../../shared/components/output/AudioOutput.js';

// =====================================================
// Fibonacci & Geometry helpers (module-level, shared)
// =====================================================

function _fibSeq(n) {
    const s = [1, 1];
    for (let i = 2; i < n; i++) s.push(s[i - 1] + s[i - 2]);
    return s;
}

function _dist(ax, ay, bx, by) {
    const dx = ax - bx, dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
}

function _tangentToTwo(c1, c2, r) {
    const d = _dist(c1.x, c1.y, c2.x, c2.y);
    const r1 = c1.r + r, r2 = c2.r + r;
    if (d > r1 + r2 || d < Math.abs(r1 - r2)) return [];
    const a  = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h  = Math.sqrt(Math.max(0, r1 * r1 - a * a));
    const dx = (c2.x - c1.x) / d, dy = (c2.y - c1.y) / d;
    const px = c1.x + a * dx, py = c1.y + a * dy;
    return [{ x: px + h * dy, y: py - h * dx }, { x: px - h * dy, y: py + h * dx }];
}

function _overlapsAny(x, y, r, circles) {
    for (const c of circles) {
        if (_dist(x, y, c.x, c.y) < r + c.r - 0.5) return true;
    }
    return false;
}

function _inBounds(x, y, r, size) {
    return x - r >= 2 && x + r <= size - 2 && y - r >= 2 && y + r <= size - 2;
}

function _packFrontChain(radii, fibIndices, size) {
    if (radii.length === 0) return [];
    const packed = [];
    const cx = size / 2, cy = size / 2;
    packed.push({ x: cx, y: cy, r: radii[0], fibIndex: fibIndices[0] });
    if (radii.length === 1) return packed;
    packed.push({ x: cx + radii[0] + radii[1], y: cy, r: radii[1], fibIndex: fibIndices[1] });
    if (radii.length === 2) return packed;

    let front = [0, 1];

    for (let i = 2; i < radii.length; i++) {
        const r = radii[i];
        let bestPos = null, bestScore = Infinity, bestInsert = -1;

        for (let j = 0; j < front.length; j++) {
            const k  = (j + 1) % front.length;
            const c1 = packed[front[j]], c2 = packed[front[k]];
            const candidates = _tangentToTwo(c1, c2, r);
            for (const pos of candidates) {
                if (!_inBounds(pos.x, pos.y, r, size)) continue;
                if (_overlapsAny(pos.x, pos.y, r, packed)) continue;
                const score = _dist(pos.x, pos.y, cx, cy);
                if (score < bestScore) { bestScore = score; bestPos = pos; bestInsert = j + 1; }
            }
        }

        if (bestPos) {
            packed.push({ x: bestPos.x, y: bestPos.y, r, fibIndex: fibIndices[i] });
            front.splice(bestInsert, 0, packed.length - 1);
            // Prune front (remove interior nodes)
            front = front.filter(idx => {
                const c = packed[idx];
                let nbrs = 0;
                for (let ii = 0; ii < packed.length; ii++) {
                    if (ii === idx) continue;
                    if (_dist(c.x, c.y, packed[ii].x, packed[ii].y) <= c.r + packed[ii].r + 1) nbrs++;
                }
                return nbrs < 6;
            });
        } else {
            // Fallback: find any tangent position
            for (const c of packed) {
                let placed = false;
                for (let a = 0; a < 36; a++) {
                    const theta = (a / 36) * Math.PI * 2;
                    const x = c.x + Math.cos(theta) * (c.r + r);
                    const y = c.y + Math.sin(theta) * (c.r + r);
                    if (_inBounds(x, y, r, size) && !_overlapsAny(x, y, r, packed)) {
                        packed.push({ x, y, r, fibIndex: fibIndices[i] });
                        front.push(packed.length - 1);
                        placed = true;
                        break;
                    }
                }
                if (placed) break;
            }
        }
    }
    return packed;
}

// =====================================================
// SCRIPT CONFIG
// =====================================================

export const SCRIPT_CONFIG = {
    id: 'fibonacci-balls',
    title: 'Fibonacci Balls',
    category: 'physics',
    description: 'Fibonacci-radius circles packed together. Each circle contains a bouncing inner ball. Collisions shift HSL colour based on size, angle, and speed.',
    version: '1.1.0',

    canvas: { width: 610, height: 610, context: 'p5' },

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Fibonacci Balls is a P5.js rigid-body physics simulation. A set of outer circles with radii drawn from consecutive Fibonacci numbers are packed into a square canvas using a front-chain tangent-placement algorithm, then animated as bouncing rigid bodies. Each outer circle contains a smaller inner ball that bounces freely inside it. Collisions between outer circles shift the HSL colour of both participants: hue proportional to size ratio, saturation proportional to collision angle, lightness proportional to speed difference. Inner balls shift colour on boundary bounce by angle, speed, and radial position. All circles leave positional trails with per-step opacity decay. Canvas size is itself a Fibonacci number: F[fibIndexForCanvas] (default 14 → 610px, 15 → 987px). The simulation is infinite and non-deterministic; velocityGrowth causes exponential speed amplification producing sustained chaotic motion, bounded by a per-frame speed cap (canvasSize × 0.3) to prevent tunnelling.'
        },
        {
            heading: 'ALGORITHM',
            body: 'Fibonacci sequence: standard iterative recurrence returning first n terms [1,1,2,3,5,...]. Canvas size = F[fibIndexForCanvas]. Outer circles use radii {F[i] | 2 ≤ i < maxFibIndex}, sorted descending. Front-chain packing: first circle at canvas centre; second tangent along x-axis; each successive circle finds the tangent position to adjacent front pairs minimising distance to centre, filtered for bounds and non-overlap. Interior front nodes (≥6 neighbours within r+neighbour.r+1) are pruned after each insertion. Fallback: if no front-chain position found, 36 evenly-spaced angular candidates tangent to each existing circle are tested. Physics per frame: (1) velocity grown by velocityGrowth, clamped to maxSpeed = canvasSize × 0.3; (2) position updated; (3) collisionPasses iterations of position-based separation — pairs pushed apart by overlap × separationStrength scaled by mass ratio (mass = r²); (4) wall bounce: reflect velocity component × restitution, clamp position; (5) one pass of elastic impulse resolution: j = dvn × (1+restitution) / (1/m1+1/m2), post-collision velocities scaled by collisionDamping. Inner balls move in parent-local coordinates; boundary collision (|localPos| > parent.r − inner.r) reflects velocity and applies restitution × collisionDamping. Colour: cyclic modular arithmetic colorMod(n,m) = ((n%m)+m)%m; hue shift by sizeRatio×hueShiftScale, saturation by (angle/π)×satShiftScale, lightness clamped to [25,85]. Rebuild triggered when fibIndexForCanvas or maxFibIndex changes (_cfgKey guard).'
        },
        {
            heading: 'PARAMETERS',
            body: 'Circles group (2 params). fibIndexForCanvas: slider 10–15 step 1 default 14 — canvas size as F[index]; triggers full rebuild. maxFibIndex: slider 4–12 step 1 default 12 — upper bound (exclusive) of Fibonacci radii set; 12 → up to 10 outer circles (F[2]…F[11]); triggers rebuild. Physics group (7 params). outerSpeed: slider 0.1–3 step 0.1 default 0.5 — initial outer circle speed magnitude. innerSpeed: slider 0.1–3 step 0.1 default 0.3 — initial inner ball speed magnitude. restitution: slider 0.5–1 step 0.05 default 0.95 — velocity fraction retained after wall bounce or impulse collision. collisionPasses: slider 1–16 step 1 default 8 — position-correction iterations per frame; higher values reduce interpenetration. separationStrength: slider 0.1–1 step 0.1 default 0.5 — positional push per separation pass. collisionDamping: slider 0.1–1 step 0.05 default 0.5 — speed scale applied after velocity impulse resolution. velocityGrowth: slider 1–1.05 step 0.001 default 1.01 — per-frame velocity multiplier; values above 1 cause chaotic speed growth bounded by the per-frame speed cap. Colour group (3 params). hueShiftScale: slider 0–100 step 5 default 50 — maximum hue change per collision (degrees). satShiftScale: slider 0–30 step 1 default 15 — maximum saturation shift per collision. lightShiftScale: slider 0–40 step 2 default 20 — maximum lightness shift per bounce. Trails group (2 params). trailLength: slider 0–15 step 1 default 5 — ghost positions retained per ball. trailAlphaDecay: slider 0.3–0.95 step 0.05 default 0.6 — per-step opacity retention; lower values fade trails faster. Total: 14 parameters. All are functional.'
        },
        {
            heading: 'PRESETS',
            body: 'Three presets. Classic (default): fibIndexForCanvas=14, maxFibIndex=12, outerSpeed=0.5, innerSpeed=0.3, restitution=0.95, collisionPasses=8, separationStrength=0.5, collisionDamping=0.5, velocityGrowth=1.01, hueShiftScale=50, satShiftScale=15, lightShiftScale=20, trailLength=5, trailAlphaDecay=0.6 — balanced reference state with steady colour evolution and visible trails. Bouncy: maxFibIndex=10 (fewer, larger circles), outerSpeed=1.5, innerSpeed=1.0, restitution=0.98, collisionPasses=12, velocityGrowth=1.005 (slower divergence), elevated colour shifts — fast energetic collisions with dense trails. Dense: maxFibIndex=12 (full circle set), reduced speeds, fewer passes, subdued colour shifts, shorter trails — slow meditative evolution. All presets use the standard { name, values: {...} } format.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Per-frame complexity: O(collisionPasses × N²) dominated by the separation loop, where N ≤ 10 at default maxFibIndex=12. At maximum parameters: 16 passes × 100 pairs = 1600 separation operations, plus O(N) velocity resolution and O(trailLength × N) draw calls. Estimated <2 ms/frame on mid-range hardware. Well within the 16.7 ms budget at all parameter values. Compute tier: particle — no Tier 2 adaptive resolution or Tier 3 worker offload is required. Rebuild cost (_buildCircles): O(N³) worst-case for _packFrontChain; at N=10 approximately 1000 operations; acceptable as one-time cost triggered only by fibIndexForCanvas or maxFibIndex change. Worker offload is not feasible: the generator uses P5.js canvas API (p.fill, p.circle, p.background) bound to a live P5 instance; porting to ImageData would require a full rewrite of all rendering.'
        },
        {
            heading: 'ANIMATION',
            body: 'Type: infinite. defaultFps: 60. No loopFrames; no fixed period. Non-deterministic: velocityGrowth causes exponential speed amplification making long-term trajectory state path-dependent and irreproducible from frame index alone. GIF and WebM export are disabled (non-deterministic). PNG export is available for static frame capture. Sequencer is disabled: no parameters are suited to linear phase animation; the simulation state accumulates via collision history, not a clock-driven phase. Per-frame speed cap (canvasSize × 0.3 px/frame) applied to both outer circles and inner balls prevents the simulation from reaching the velocity-tunnelling regime while preserving chaotic character.'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'Infinite non-deterministic simulation: output cannot be reproduced from frame index alone; GIF and WebM export are unavailable. Canvas size is Fibonacci-derived and not independently configurable; changing fibIndexForCanvas alters the physics canvas size at runtime but the host P5 canvas element may not resize to match (SCRIPT_CONFIG canvas.width/height are static at the default 610). Speed cap preserves simulation usability but does not reset accumulated colour state; after extended runtime, colours may dwell at clamped lightness boundaries. At maxFibIndex=4, the smallest inner ball (r=1 in parent r=2) has maxD=1, producing near-zero inner motion. Fallback circle packing (36-angle scan) may fail to place the largest circles in dense configurations, so effective N may be lower than maxFibIndex − 2. Colour lightness clamping (l < 25 → +50; l > 85 → −30) produces discontinuous jumps visible as sudden brightness shifts after sustained collisions.'
        },
        {
            heading: 'REFERENCES',
            body: 'Algorithm origins: circle packing via front-chain tangent-to-two placement — Apollonius tangency problem (classical geometry); impulse-based rigid-body collision response — Baraff, D. (1997) "An Introduction to Physically Based Modeling". Original sketch: "Fib_balls" (no published URL).'
        }
    ],

    compute: { cost: 'particle' },

    parameters: [
        {
            group: 'Circles',
            params: [
                { key: 'fibIndexForCanvas', type: 'slider', label: 'Fib Canvas Index', min: 10, max: 15, step: 1, default: 14 },
                { key: 'maxFibIndex',       type: 'slider', label: 'Max Fib Index',    min: 4,  max: 16, step: 1, default: 12 }
            ]
        },
        {
            group: 'Physics',
            params: [
                { key: 'outerSpeed',         type: 'slider', label: 'Outer Speed',        min: 0.1, max: 3,    step: 0.1, default: 0.5 },
                { key: 'innerSpeed',         type: 'slider', label: 'Inner Speed',        min: 0.1, max: 3,    step: 0.1, default: 0.3 },
                { key: 'restitution',        type: 'slider', label: 'Restitution',        min: 0.5, max: 1,    step: 0.05, default: 0.95 },
                { key: 'collisionPasses',    type: 'slider', label: 'Collision Passes',   min: 1,   max: 16,   step: 1,   default: 8 },
                { key: 'separationStrength', type: 'slider', label: 'Separation',         min: 0.1, max: 1,    step: 0.1, default: 0.5 },
                { key: 'collisionDamping',   type: 'slider', label: 'Collision Damping',  min: 0.1, max: 1,    step: 0.05, default: 0.5 },
                { key: 'velocityGrowth',     type: 'slider', label: 'Velocity Growth',    min: 1,   max: 1.05, step: 0.001, default: 1.01 }
            ]
        },
        {
            group: 'Colour',
            params: [
                { key: 'hueShiftScale',   type: 'slider', label: 'Hue Shift Scale',   min: 0, max: 100, step: 5, default: 50 },
                { key: 'satShiftScale',   type: 'slider', label: 'Sat Shift Scale',   min: 0, max: 30,  step: 1, default: 15 },
                { key: 'lightShiftScale', type: 'slider', label: 'Light Shift Scale', min: 0, max: 40,  step: 2, default: 20 }
            ]
        },
        {
            group: 'Trails',
            params: [
                { key: 'trailLength',     type: 'slider', label: 'Trail Length',     min: 0,  max: 15,  step: 1,    default: 5 },
                { key: 'trailAlphaDecay', type: 'slider', label: 'Trail Alpha Decay', min: 0.3, max: 0.95, step: 0.05, default: 0.6 }
            ]
        },
        {
            group: 'Sound',
            collapsed: true,
            params: [
                { key: 'soundEnabled',  type: 'toggle', label: 'Collision Sound', default: false },
                { key: 'soundGain',     type: 'slider', label: 'Gain',     min: 0,   max: 1,    step: 0.05, default: 0.3 },
                { key: 'soundDuration', type: 'slider', label: 'Duration', min: 0.02, max: 0.5, step: 0.01, default: 0.12 },
                { key: 'soundBaseFreq', type: 'slider', label: 'Base Freq (Hz)', min: 100, max: 1000, step: 10, default: 300 }
            ]
        }
    ],

    presets: [
        {
            name: 'Classic',
            values: {
                fibIndexForCanvas: 14, maxFibIndex: 12,
                outerSpeed: 0.5, innerSpeed: 0.3, restitution: 0.95, collisionPasses: 8,
                separationStrength: 0.5, collisionDamping: 0.5, velocityGrowth: 1.01,
                hueShiftScale: 50, satShiftScale: 15, lightShiftScale: 20,
                trailLength: 5, trailAlphaDecay: 0.6
            }
        },
        {
            name: 'Bouncy',
            values: {
                fibIndexForCanvas: 14, maxFibIndex: 10,
                outerSpeed: 1.5, innerSpeed: 1.0, restitution: 0.98, collisionPasses: 12,
                separationStrength: 0.6, collisionDamping: 0.7, velocityGrowth: 1.005,
                hueShiftScale: 80, satShiftScale: 20, lightShiftScale: 30,
                trailLength: 8, trailAlphaDecay: 0.7
            }
        },
        {
            name: 'Dense',
            values: {
                fibIndexForCanvas: 14, maxFibIndex: 12,
                outerSpeed: 0.3, innerSpeed: 0.2, restitution: 0.9, collisionPasses: 6,
                separationStrength: 0.4, collisionDamping: 0.4, velocityGrowth: 1.02,
                hueShiftScale: 40, satShiftScale: 10, lightShiftScale: 15,
                trailLength: 3, trailAlphaDecay: 0.5
            }
        }
    ],

    export: { png: true, gif: false, webm: true },

    animation: {
        type: 'infinite',
        defaultFps: 60,
        animatableParams: [],
        sequencer: false,
        animationExport: true
    },

    // State
    _circles: null,
    _canvasSize: 610,
    _lastCfgKey: null,
    _audioOutput: null,

    _cfgKey(params) {
        return `${params.fibIndexForCanvas}|${params.maxFibIndex}`;
    },

    _colorMod(n, m) { return ((n % m) + m) % m; },

    _speed(c) { return Math.sqrt(c.vx * c.vx + c.vy * c.vy); },

    _applyCollisionColor(c1, c2, nx, ny, params) {
        const { hueShiftScale, satShiftScale, lightShiftScale } = params;
        const sizeRatio = (c2.r - c1.r) / (c1.r + c2.r);
        const hShift = sizeRatio * hueShiftScale;
        c1.h = this._colorMod(c1.h + hShift, 360);
        c2.h = this._colorMod(c2.h - hShift, 360);

        const angle  = Math.atan2(ny, nx);
        const sShift = (angle / Math.PI) * satShiftScale;
        c1.s = this._colorMod(c1.s + 5 + sShift, 100);
        c2.s = this._colorMod(c2.s + 5 - sShift, 100);

        const sp1 = this._speed(c1), sp2 = this._speed(c2);
        const lShift = ((sp2 - sp1) / (sp1 + sp2 + 0.001)) * lightShiftScale;
        c1.l = this._colorMod(c1.l + lShift, 100);
        c2.l = this._colorMod(c2.l - lShift, 100);
        if (c1.l < 25) c1.l += 50; if (c1.l > 85) c1.l -= 30;
        if (c2.l < 25) c2.l += 50; if (c2.l > 85) c2.l -= 30;

        // FIB-02: collision sound pitched by radius (larger ball → lower pitch)
        if (params.soundEnabled && this._audioOutput) {
            const maxR = Math.max(c1.r, c2.r);
            // Inversely proportional to radius; anchor: r=89 → ~300 Hz at soundBaseFreq=300
            const pitch = params.soundBaseFreq * (89 / Math.max(maxR, 1));
            this._audioOutput.trigger(
                Math.max(40, Math.min(pitch, 4000)),
                params.soundDuration,
                params.soundGain
            );
        }
    },

    _separate(c1, c2, params) {
        const dx = c2.x - c1.x, dy = c2.y - c1.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const minDist = c1.r + c2.r;
        if (d >= minDist || d === 0) return false;
        const nx = dx / d, ny = dy / d;
        const overlap = minDist - d;
        const m1 = c1.r * c1.r, m2 = c2.r * c2.r, total = m1 + m2;
        const push = overlap * params.separationStrength;
        c1.x -= nx * push * (m2 / total);
        c1.y -= ny * push * (m2 / total);
        c2.x += nx * push * (m1 / total);
        c2.y += ny * push * (m1 / total);
        return { nx, ny };
    },

    _resolveVelocity(c1, c2, params) {
        const dx = c2.x - c1.x, dy = c2.y - c1.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const minDist = c1.r + c2.r;
        if (d > minDist * 1.01 || d === 0) return false;
        const nx = dx / d, ny = dy / d;
        const dvn = (c1.vx - c2.vx) * nx + (c1.vy - c2.vy) * ny;
        if (dvn <= 0) return false;
        const m1 = c1.r * c1.r, m2 = c2.r * c2.r;
        const j = dvn * (1 + params.restitution) / (1 / m1 + 1 / m2);
        c1.vx -= (j / m1) * nx; c1.vy -= (j / m1) * ny;
        c2.vx += (j / m2) * nx; c2.vy += (j / m2) * ny;
        c1.vx *= params.collisionDamping; c1.vy *= params.collisionDamping;
        c2.vx *= params.collisionDamping; c2.vy *= params.collisionDamping;
        return { nx, ny };
    },

    _bounceWalls(c, size, params) {
        if (c.x - c.r < 0)    { c.x = c.r;        c.vx =  Math.abs(c.vx) * params.restitution; }
        if (c.x + c.r > size) { c.x = size - c.r;  c.vx = -Math.abs(c.vx) * params.restitution; }
        if (c.y - c.r < 0)    { c.y = c.r;         c.vy =  Math.abs(c.vy) * params.restitution; }
        if (c.y + c.r > size) { c.y = size - c.r;  c.vy = -Math.abs(c.vy) * params.restitution; }
    },

    _buildCircles(params) {
        const { fibIndexForCanvas, maxFibIndex, outerSpeed, innerSpeed } = params;
        // FIB-01: perf-budget warning above 14 circles (O(N²) collision loop)
        const expectedN = Math.max(0, maxFibIndex - 2);
        if (expectedN > 14) {
            console.warn(`fibonacci-balls: maxFibIndex=${maxFibIndex} yields ~${expectedN} circles; collision cost is O(N²) — expect frame drops on slow hardware.`);
        }
        const seq  = _fibSeq(fibIndexForCanvas + 1);
        const size = seq[fibIndexForCanvas];

        const radiiData = seq
            .map((r, i) => ({ r, i, fibNum: seq[i] }))
            .filter(item => item.i >= 2 && item.i < maxFibIndex)
            .sort((a, b) => b.r - a.r);

        const packed = _packFrontChain(
            radiiData.map(d => d.r),
            radiiData.map(d => d.i),
            size
        );

        return packed.map(p => {
            const fibNum   = seq[p.fibIndex];
            const angle    = fibNum * (Math.PI / 180);
            const prevR    = p.fibIndex >= 1 ? seq[p.fibIndex - 1] : 0;
            const hasInner = prevR > 0 && prevR < p.r;
            return {
                x: p.x, y: p.y, r: p.r,
                fibIndex: p.fibIndex, fibNum,
                vx: Math.cos(angle) * outerSpeed,
                vy: Math.sin(angle) * outerSpeed,
                h: 0, s: 0, l: 100,
                trail: [],
                inner: hasInner ? {
                    r: prevR, parent: null,
                    localX: 0, localY: 0,
                    vx: Math.cos(angle) * innerSpeed,
                    vy: Math.sin(angle) * innerSpeed,
                    h: 0, s: 0, l: 100,
                    trail: []
                } : null
            };
        });
    },

    _updateInner(inner, parent, params) {
        inner.trail.push({ x: inner.localX, y: inner.localY });
        if (inner.trail.length > params.trailLength) inner.trail.shift();

        inner.vx *= params.velocityGrowth;
        inner.vy *= params.velocityGrowth;

        // Speed cap: prevent inner ball from travelling more than the available
        // radius per frame, which would cause it to skip over the boundary.
        const maxD = parent.r - inner.r;
        const maxSpd = Math.max(maxD, 1);
        const innerSpd = Math.sqrt(inner.vx * inner.vx + inner.vy * inner.vy);
        if (innerSpd > maxSpd) {
            const scale = maxSpd / innerSpd;
            inner.vx *= scale;
            inner.vy *= scale;
        }

        inner.localX += inner.vx;
        inner.localY += inner.vy;

        if (maxD <= 0) { inner.localX = 0; inner.localY = 0; return; }
        const d = Math.sqrt(inner.localX * inner.localX + inner.localY * inner.localY);
        if (d > maxD) {
            const nx = inner.localX / d, ny = inner.localY / d;
            inner.localX = nx * maxD; inner.localY = ny * maxD;
            const dot = inner.vx * nx + inner.vy * ny;
            inner.vx = (inner.vx - 2 * dot * nx) * params.restitution * params.collisionDamping;
            inner.vy = (inner.vy - 2 * dot * ny) * params.restitution * params.collisionDamping;
            const angle = Math.atan2(ny, nx);
            const spd   = Math.sqrt(inner.vx * inner.vx + inner.vy * inner.vy);
            inner.h = this._colorMod(inner.h + (angle / Math.PI) * params.hueShiftScale, 360);
            inner.s = this._colorMod(inner.s + 5 + spd * 8, 100);
            const posNorm = d / maxD;
            inner.l = this._colorMod(inner.l + (0.5 - posNorm) * params.lightShiftScale, 100);
            if (inner.l < 25) inner.l += 50; if (inner.l > 85) inner.l -= 30;
        }
    },

    _drawCircle(p, c, params) {
        p.noStroke();
        // Outer trails
        for (let i = 0; i < c.trail.length; i++) {
            const t = c.trail[i];
            const alpha = Math.pow(params.trailAlphaDecay, c.trail.length - i);
            p.fill(c.h, c.s, c.l, alpha * 0.4);
            p.circle(t.x, t.y, c.r * 2);
        }
        p.fill(c.h, c.s, c.l, 0.9);
        p.circle(c.x, c.y, c.r * 2);

        // Inner
        if (c.inner) {
            const inner = c.inner;
            const px = c.x, py = c.y;
            for (let i = 0; i < inner.trail.length; i++) {
                const t = inner.trail[i];
                const alpha = Math.pow(params.trailAlphaDecay, inner.trail.length - i);
                p.fill(inner.h, inner.s, inner.l, alpha * 0.7);
                const sz = inner.r * 2 * (0.5 + 0.5 * (i / inner.trail.length));
                p.circle(px + t.x, py + t.y, sz);
            }
            p.fill(inner.h, inner.s, inner.l, 0.95);
            p.circle(px + inner.localX, py + inner.localY, inner.r * 2);
        }
    },

    // FIB-03: expose audio emitter for host to wire into AnimationExport
    getAudioEmitter() {
        return this._audioOutput;
    },

    destroy() {
        if (this._audioOutput) {
            this._audioOutput.destroy();
            this._audioOutput = null;
        }
    },

    p5Setup(p, params) {
        p.colorMode(p.HSL, 360, 100, 100, 1);
        p.noStroke();
        p.noLoop();

        // FIB-02: create audio emitter for collision sounds
        if (this._audioOutput) this._audioOutput.destroy();
        this._audioOutput = new AudioOutput({ waveform: 'sine', gain: params.soundGain ?? 0.3 }, {});

        const seq  = _fibSeq(params.fibIndexForCanvas + 1);
        this._canvasSize = seq[params.fibIndexForCanvas];
        this._circles    = this._buildCircles(params);
        this._lastCfgKey = this._cfgKey(params);
    },

    p5Draw(p, params, frame) {
        if (this._cfgKey(params) !== this._lastCfgKey) {
            const seq = _fibSeq(params.fibIndexForCanvas + 1);
            this._canvasSize = seq[params.fibIndexForCanvas];
            this._circles    = this._buildCircles(params);
            this._lastCfgKey = this._cfgKey(params);
        }

        const { collisionPasses, velocityGrowth } = params;
        const size    = this._canvasSize;
        const circles = this._circles;
        // Cap at 30% of canvas size per frame to prevent tunnelling at high velocityGrowth values
        const maxOuterSpeed = size * 0.3;

        p.background(0, 0, 8);

        // Update trails and velocity
        for (const c of circles) {
            c.trail.push({ x: c.x, y: c.y });
            if (c.trail.length > params.trailLength) c.trail.shift();
            c.vx *= velocityGrowth;
            c.vy *= velocityGrowth;
            const spd = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
            if (spd > maxOuterSpeed) {
                const s = maxOuterSpeed / spd;
                c.vx *= s;
                c.vy *= s;
            }
            c.x += c.vx;
            c.y += c.vy;
        }

        // Collision resolution (multi-pass)
        for (let pass = 0; pass < collisionPasses; pass++) {
            for (let i = 0; i < circles.length; i++) {
                for (let j = i + 1; j < circles.length; j++) {
                    this._separate(circles[i], circles[j], params);
                }
            }
            for (const c of circles) this._bounceWalls(c, size, params);
        }

        // Velocity collision response + colour
        for (let i = 0; i < circles.length; i++) {
            for (let j = i + 1; j < circles.length; j++) {
                const res = this._resolveVelocity(circles[i], circles[j], params);
                if (res) this._applyCollisionColor(circles[i], circles[j], res.nx, res.ny, params);
            }
        }

        // Inner circle updates
        for (const c of circles) {
            if (c.inner) this._updateInner(c.inner, c, params);
        }

        // Draw
        for (const c of circles) this._drawCircle(p, c, params);
    }
};
