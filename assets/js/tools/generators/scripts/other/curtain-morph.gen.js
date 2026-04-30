/**
 * Curtain Morph - p5.js Generator
 *
 * Polygon rings morph between shapes while wave oscillators displace points
 * along their normals, creating a flowing curtain-like surface. Segments are
 * extruded toward a vanishing point and shaded by face orientation relative
 * to a light source.
 *
 * Architecture: F1 (Shape Generator) → F2 (Curtain Builder) → F3 (Renderer)
 *
 * Based on ring_polygon sketch.
 *
 * @version 1.1.0
 */

import '../../../../shared/algorithms/core/math-utils.js';

// =====================================================
// Math aliases
// =====================================================
const _PI  = Math.PI;
const _TAU = Math.PI * 2;
const _sin = Math.sin, _cos = Math.cos, _sqrt = Math.sqrt;
const _floor = Math.floor, _abs = Math.abs, _max = Math.max;
const _tan = Math.tan, _lerp = (a, b, t) => a + (b - a) * t;
const _HALF_PI = Math.PI / 2;

// =====================================================
// Geometry Utils
// =====================================================

function _internalAngle(n) { return (n - 2) * _PI / n; }

function _radiusForEqualArea(n, outerRadius, maxSides) {
    const side = 2 * outerRadius, targetArea = side * side;
    if (n >= maxSides) return _sqrt(targetArea / _PI);
    return _sqrt(2 * targetArea / (n * _sin(_TAU / n)));
}

function _centroidOffsetY(n, r, vertexOffset, maxSides) {
    if (n >= maxSides) return 0;
    let minY = Infinity, maxY = -Infinity;
    const sectorAngle = _TAU / n;
    for (let i = 0; i < n; i++) {
        const y = r * _sin(vertexOffset - i * sectorAngle);
        if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    return -((minY + maxY) / 2);
}

function _buildPolygonRings(sides, sc, baseRotation) {
    const { count, outerRadius, resolution, polySpacing, maxSides } = sc;
    const maxS = maxSides || 50;
    const adjR  = _radiusForEqualArea(sides, outerRadius, maxS);
    const innerR = adjR - (count - 1) * polySpacing;
    const vOffset = (sides === 4) ? -_HALF_PI - _PI / 4 : -_HALF_PI;
    const centY   = _centroidOffsetY(sides, adjR, vOffset, maxS);
    const rot     = baseRotation || 0;
    const shapes  = [];

    for (let i = 0; i < count; i++) {
        const radius = _max(innerR + i * polySpacing, polySpacing * 0.3);
        const pts    = [];
        for (let j = 0; j <= resolution; j++) {
            const s     = j / resolution;
            const angle = -_HALF_PI - s * _TAU + rot;
            if (sides >= maxS) {
                pts.push({ x: radius * _cos(angle), y: radius * _sin(angle) + centY });
            } else {
                const sA    = _TAU / sides;
                const normA = ((vOffset - angle) % _TAU + _TAU) % _TAU;
                const sec   = _floor(normA / sA);
                const locT  = (normA - sec * sA) / sA;
                const a1    = vOffset - sec * sA;
                const a2    = vOffset - (sec + 1) * sA;
                pts.push({
                    x: _lerp(radius * _cos(a1), radius * _cos(a2), locT),
                    y: _lerp(radius * _sin(a1), radius * _sin(a2), locT) + centY
                });
            }
        }
        shapes.push(pts);
    }
    return shapes;
}

function _morphShapes(a, b, t) {
    return a.map((shapeA, i) => shapeA.map((p, j) => ({
        x: _lerp(p.x, b[i][j].x, t), y: _lerp(p.y, b[i][j].y, t)
    })));
}

function _translateShapes(shapes, dx, dy) {
    return shapes.map(s => s.map(p => ({ x: p.x + dx, y: p.y + dy })));
}

// =====================================================
// Timing Module
// =====================================================

function _buildTimeline(sc, loopFrames) {
    const { minSides = 3, maxSides = 50, cyclesPerLoop = 1 } = sc;
    const minS = _max(3, minSides), maxS = _max(minS, maxSides);

    let totalAngles = 0;
    for (let n = minS; n <= maxS; n++) totalAngles += _internalAngle(n);
    const scaleFactor = _PI / totalAngles;

    const tl = [];
    tl.push({ type: 'hold', sides: minS, rotation: 0, duration: 0.02 });

    const numMorphs = maxS - minS;
    let cumRot = 0;

    if (numMorphs > 0) {
        const morphDur = 0.8 / numMorphs / 2, holdDur = 0.8 / numMorphs / 2;
        for (let n = minS; n < maxS; n++) {
            const nextRot = cumRot + _internalAngle(n + 1) * scaleFactor;
            tl.push({ type: 'morph', fromSides: n, toSides: n + 1, fromRotation: cumRot, toRotation: nextRot, duration: morphDur });
            cumRot = nextRot;
            tl.push({ type: 'hold', sides: n + 1, rotation: cumRot, duration: holdDur });
        }
    }

    tl.push({ type: 'hold', sides: maxS, rotation: cumRot, duration: 0.05 });
    tl.push({ type: 'morph', fromSides: maxS, toSides: minS, fromRotation: cumRot, toRotation: _PI, duration: 0.05 });

    let total = tl.reduce((s, seg) => s + seg.duration, 0);
    tl.forEach(seg => { seg.duration /= total; });

    return { timeline: tl, loopFrames, cyclesPerLoop };
}

function _getTimingState(tm, frame) {
    const { timeline, loopFrames, cyclesPerLoop } = tm;
    const loopProgress   = (frame % loopFrames) / loopFrames;
    const scaledProgress = (loopProgress * cyclesPerLoop) % 1.0;
    const cycleIndex     = _floor(loopProgress * cyclesPerLoop);
    const baseRotation   = cycleIndex * _PI;
    let elapsed = 0;
    for (const seg of timeline) {
        if (scaledProgress < elapsed + seg.duration) {
            const localT = (scaledProgress - elapsed) / seg.duration;
            const eased  = 0.5 - 0.5 * _cos(localT * _PI);
            if (seg.type === 'hold') {
                return { sides: seg.sides, rotation: baseRotation + seg.rotation };
            }
            return {
                fromSides: seg.fromSides, toSides: seg.toSides, sidesT: eased,
                rotation: baseRotation + _lerp(seg.fromRotation, seg.toRotation, eased)
            };
        }
        elapsed += seg.duration;
    }
    return { sides: timeline[0].sides, rotation: baseRotation };
}

// =====================================================
// Oscillator (wave displacement)
// =====================================================

function _softLimit(x) { return Math.tanh(1.35 * x) / Math.tanh(1.35); }

function _oscillate(i, t, mod) {
    const { waves, amplitude, loopFrames, totalPoints, lineIndex = 0,
            ampVariation = 0, weightVariation = 0, phaseVariation = 0 } = mod;
    const u = i / (totalPoints - 1);
    const ampMod = 1 + ampVariation * _sin(_TAU * lineIndex / 10);
    const linePhase = lineIndex * phaseVariation;

    const modWeights = waves.map(w => w.w * (1 + weightVariation * 0.5 * _cos(_TAU * lineIndex / 10 + w.phase)));
    const wSum = _max(0.0001, modWeights.reduce((s, w) => s + _abs(w), 0));

    let s = 0;
    for (let j = 0; j < waves.length; j++) {
        const w = waves[j];
        const timePhase  = (_TAU * w.loops * t) / loopFrames;
        const spacePhase = _TAU * w.cycles * u;
        s += modWeights[j] * _sin(spacePhase - timePhase + w.phase + linePhase);
    }
    return amplitude * ampMod * _softLimit(s / wSum);
}

// =====================================================
// F2: Build curtain segments
// =====================================================

function _buildCurtainSegments(pointSets, extrusionCfg, normalSide, mod, t, invertSides) {
    const { mode = 'parallel', vanishingPoint: vp, lightSource: light,
            direction, factor = 0.4, distance = 100 } = extrusionCfg;

    let globalEHat = null;
    if (mode === 'parallel') {
        const dir = direction || { x: 0, y: 1 };
        const eMag = _sqrt(dir.x * dir.x + dir.y * dir.y) || 1;
        globalEHat = { x: dir.x / eMag, y: dir.y / eMag };
    }

    const allSegments = [];

    for (let setIdx = 0; setIdx < pointSets.length; setIdx++) {
        const pointSet = pointSets[setIdx];
        const n = pointSet.length;
        if (n < 2) continue;

        let ringAvgDist = 0;
        if (mode === 'vanishing') {
            for (let i = 0; i < n; i++) {
                const dx = pointSet[i].x - vp.x, dy = pointSet[i].y - vp.y;
                ringAvgDist += _sqrt(dx * dx + dy * dy);
            }
            ringAvgDist /= n;
        }

        // Tangents from original points
        const tangents = [];
        for (let i = 0; i < n; i++) {
            const prevIdx = (i === 0 || i === n - 1) ? n - 2 : i - 1;
            const nextIdx = (i === 0 || i === n - 1) ? 1 : i + 1;
            const tx = pointSet[nextIdx].x - pointSet[prevIdx].x;
            const ty = pointSet[nextIdx].y - pointSet[prevIdx].y;
            const mag = _sqrt(tx * tx + ty * ty) || 1;
            tangents.push({ x: tx / mag, y: ty / mag });
        }

        // Normals from tangents (for oscillator)
        const normals = tangents.map(tng => normalSide === 'left'
            ? { x: -tng.y, y:  tng.x }
            : { x:  tng.y, y: -tng.x }
        );

        // Wave-displace points
        const wavedPts = pointSet.map((pt, i) => {
            const disp = _oscillate(i, t, { ...mod, totalPoints: n, lineIndex: setIdx });
            return { x: pt.x + disp * normals[i].x, y: pt.y + disp * normals[i].y };
        });
        if (n > 1) wavedPts[n - 1] = { x: wavedPts[0].x, y: wavedPts[0].y };

        // Re-calculate normals from waved curve for lighting/extrusion
        const pointSides = [];
        const pointExtDirs = [];
        const pointDistVP  = [];

        for (let i = 0; i < n; i++) {
            const prevIdx = (i === 0 || i === n - 1) ? n - 2 : i - 1;
            const nextIdx = (i === 0 || i === n - 1) ? 1 : i + 1;
            const tx = wavedPts[nextIdx].x - wavedPts[prevIdx].x;
            const ty = wavedPts[nextIdx].y - wavedPts[prevIdx].y;
            const tMag = _sqrt(tx * tx + ty * ty) || 1;
            const nx = normalSide === 'left' ? -ty / tMag :  ty / tMag;
            const ny = normalSide === 'left' ?  tx / tMag : -tx / tMag;

            let eHat, distVP = 0;
            if (mode === 'vanishing') {
                const dx = vp.x - wavedPts[i].x, dy = vp.y - wavedPts[i].y;
                const dMag = _sqrt(dx * dx + dy * dy) || 1;
                eHat = { x: dx / dMag, y: dy / dMag };
                distVP = dMag;
            } else {
                eHat = globalEHat;
            }
            pointExtDirs.push(eHat);
            pointDistVP.push(distVP);

            const lx = light.x - wavedPts[i].x, ly = light.y - wavedPts[i].y;
            const lMag = _sqrt(lx * lx + ly * ly) || 1;
            const dot  = nx * lx / lMag + ny * ly / lMag;
            let side = dot >= 0 ? 'front' : 'back';
            if (invertSides) side = side === 'front' ? 'back' : 'front';
            pointSides.push(side);
        }

        // Split into same-side runs
        const pushSeg = (run, side) => {
            if (run.length < 2) return;
            const pts  = run.map(r => r.pt);
            const dirs = run.map(r => r.eDir);
            let axisAvg = 0;
            for (const r of run) axisAvg += (mode === 'vanishing' ? r.dist : r.pt.x * globalEHat.x + r.pt.y * globalEHat.y);
            axisAvg /= run.length;
            allSegments.push({ pts, extrusionDirs: dirs, side, axisAvg, ringIndex: setIdx, ringAvgDist });
        };

        let curRun  = [{ pt: wavedPts[0], eDir: pointExtDirs[0], dist: pointDistVP[0] }];
        let curSide = pointSides[0];
        for (let i = 1; i < n; i++) {
            if (pointSides[i] === curSide) {
                curRun.push({ pt: wavedPts[i], eDir: pointExtDirs[i], dist: pointDistVP[i] });
            } else {
                pushSeg(curRun, curSide);
                curRun  = [
                    { pt: wavedPts[i - 1], eDir: pointExtDirs[i - 1], dist: pointDistVP[i - 1] },
                    { pt: wavedPts[i],     eDir: pointExtDirs[i],     dist: pointDistVP[i] }
                ];
                curSide = pointSides[i];
            }
        }
        pushSeg(curRun, curSide);
    }

    return allSegments;
}

// =====================================================
// F3: Draw curtain segments
// =====================================================

// CUR-01: helper to parse a hex colour into [r,g,b] array
function _hexToArr(hex) {
    const h = (hex || '#000000').replace('#', '');
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

function _drawCurtainSegments(p, allSegments, extrusionCfg) {
    if (allSegments.length === 0) return;
    const { mode = 'parallel', vanishingPoint: vp, direction, distance = 100, factor = 0.4,
            shadingMode = 'gradient', gradientSteps = 30,
            // CUR-01: colourway colours passed through cfg
            colFront = [255,255,255], colBack = [0,0,0], colMid = [128,128,128] } = extrusionCfg;

    let globalEHat = null;
    if (mode === 'parallel') {
        const dir = direction || { x: 0, y: 1 };
        const eMag = _sqrt(dir.x * dir.x + dir.y * dir.y) || 1;
        globalEHat = { x: dir.x / eMag, y: dir.y / eMag };
    }

    if (mode === 'vanishing') {
        allSegments.sort((a, b) => {
            const d = b.ringAvgDist - a.ringAvgDist;
            return _abs(d) > 1 ? d : b.axisAvg - a.axisAvg;
        });
    } else {
        allSegments.sort((a, b) => a.ringIndex !== b.ringIndex ? a.ringIndex - b.ringIndex : a.axisAvg - b.axisAvg);
    }

    const extrudePoint = (pt, t) => mode === 'vanishing'
        ? { x: pt.x + t * factor * (vp.x - pt.x), y: pt.y + t * factor * (vp.y - pt.y) }
        : { x: pt.x + t * distance * globalEHat.x, y: pt.y + t * distance * globalEHat.y };

    for (const seg of allSegments) {
        const isFront = seg.side === 'front';
        const extrPts = seg.pts.map(pt => extrudePoint(pt, 1));

        if (shadingMode === 'gradient') {
            p.noStroke();
            // CUR-01: gradient blends between colFront and colBack
            for (let step = 0; step < gradientSteps; step++) {
                const t0 = step / gradientSteps, t1 = (step + 1) / gradientSteps;
                const tMid = (t0 + t1) / 2;
                const from = isFront ? colFront : colBack;
                const to   = isFront ? colBack  : colFront;
                const r = Math.round(_lerp(from[0], to[0], tMid));
                const g = Math.round(_lerp(from[1], to[1], tMid));
                const b = Math.round(_lerp(from[2], to[2], tMid));
                p.fill(r, g, b);
                p.beginShape();
                for (const pt of seg.pts) { const ep = extrudePoint(pt, t0); p.vertex(ep.x, ep.y); }
                for (let j = seg.pts.length - 1; j >= 0; j--) { const ep = extrudePoint(seg.pts[j], t1); p.vertex(ep.x, ep.y); }
                p.endShape(p.CLOSE);
            }
        } else {
            // CUR-01: use colourway colours instead of hardcoded 255/128/0
            let fCol;
            if (shadingMode === 'solid-grey') {
                fCol = isFront ? colFront : colMid;
            } else {
                fCol = isFront ? colFront : colBack;
            }
            p.noStroke();
            p.fill(fCol[0], fCol[1], fCol[2]);
            p.beginShape();
            for (const pt of seg.pts) p.vertex(pt.x, pt.y);
            for (let j = extrPts.length - 1; j >= 0; j--) p.vertex(extrPts[j].x, extrPts[j].y);
            p.endShape(p.CLOSE);
            p.stroke(colBack[0], colBack[1], colBack[2]); p.strokeWeight(1); p.noFill();
            p.beginShape(); seg.pts.forEach(pt => p.vertex(pt.x, pt.y)); p.endShape();
            p.beginShape(); extrPts.forEach(pt => p.vertex(pt.x, pt.y)); p.endShape();
        }
    }
}

// =====================================================
// Module-level state (not on SCRIPT_CONFIG)
// =====================================================

let _timingState = null;
let _lastTmKey   = null;
let _cachedRings = null;
let _cachedRingKey = null;

function _tmKey(p) { return `${p.minSides}|${p.maxSides}|${p.loopFrames}`; }

// CUR-01: wave1Cycles and wave1Loops are now user-configurable
function _getWaves(wave1Cycles, wave1Loops) {
    return [
        { cycles: wave1Cycles || 50.0, w: 0.70, loops: wave1Loops !== undefined ? wave1Loops : 200, phase: 0.0 },
        { cycles: 23.0, w: 0.50, loops: -40, phase: 1.2 },
        { cycles: 10.0, w: 0.40, loops: 7,   phase: 2.4 }
    ];
}

// =====================================================
// SCRIPT CONFIG
// =====================================================

export const SCRIPT_CONFIG = {
    id: 'curtain-morph',
    title: 'Curtain Morph',
    category: 'other',
    description: 'Polygon rings morph between shapes while wave oscillators create flowing curtain surfaces, extruded with perspective and shaded by light direction.',
    version: '1.1.0',

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Curtain Morph renders ringCount concentric polygon rings that continuously morph through every n-gon from minSides to maxSides and back. Three hardcoded sine-wave oscillators displace each ring\'s points perpendicular to the curve, producing a flowing curtain-like surface. The surface is extruded in vanishing-point or parallel mode and shaded by face orientation relative to a configurable light source. Three-stage pipeline: F1 builds polygon rings via a frame-based timeline; F2 wave-displaces points, classifies each as front or back by dot product, and groups contiguous same-side points into segments; F3 depth-sorts segments and draws each as a quadrilateral with gradient or solid shading. Canvas: 1080×1080, p5.js context. Fully deterministic; export-compatible for PNG and GIF.'
        },
        {
            heading: 'ALGORITHM',
            body: 'Time model: t = frame % loopFrames; loopProgress = t / loopFrames. _buildTimeline: total rotation = π across all morph steps (scaled by internalAngle sums); segments — 2% initial hold at minSides, 80% split evenly as morph/hold pairs for n = minSides..maxSides−1, 5% extended hold at maxSides, 5% fast morph back; all durations normalised to sum 1. _getTimingState: cosine-eased localT per segment; returns {sides, rotation} for hold or {fromSides, toSides, sidesT, rotation} for morph. _buildPolygonRings: produces ringCount rings at resolution+1 points each; adjR = _radiusForEqualArea(sides, outerRadius, maxSides) where for circles r = sqrt(targetArea/π) and for polygon r = sqrt(2×targetArea/(n×sin(2π/n))); innerR = adjR − (count−1)×polySpacing; each ring radius = max(innerR + i×polySpacing, polySpacing×0.3); _centroidOffsetY corrects vertical centroid; vOffset = −π/2−π/4 for squares, −π/2 otherwise; per-point linear interpolation between polygon vertices; baseRotation applied as angle offset. _morphShapes: per-point lerp between two ring sets at t=sidesT. _oscillate(i, t, mod): u = i/(totalPoints−1); ampMod = 1 + ampVariation×sin(2π×lineIndex/10); linePhase = lineIndex×phaseVariation; modWeights[j] = w[j].w×(1 + weightVariation×0.5×cos(2π×lineIndex/10 + phase)); wSum = Σ|modWeights|; s = Σ modWeights[j]×sin(2π×cycles[j]×u − 2π×loops[j]×t/loopFrames + phase[j] + linePhase); displacement = amplitude×ampMod×tanh(1.35×s/wSum)/tanh(1.35). _buildCurtainSegments: tangents via central difference; normals from tangents (left or right); wave-displace each point; re-compute normals from displaced curve; classify each point as front or back by dot product of normal against light direction; consecutive same-side points form a run; side transitions share the boundary point. Extrusion: vanishing — eHat = unit vector toward VP per waved point; parallel — fixed eHat = (0,1). _drawCurtainSegments: sort — vanishing by ringAvgDist desc then axisAvg; parallel by ringIndex asc then axisAvg; gradient — gradientSteps filled quad strips, front lerps shade 255→0, back 0→255 across strip depth; solid/solid-grey — one filled quad per segment, front=255, back=0 (solid) or back=128 (solid-grey), with stroke outline.'
        },
        {
            heading: 'PARAMETERS',
            body: 'Shape group — ringCount: slider 1–10 step 1 default 5; number of concentric polygon rings. outerRadius: slider 100–520 step 10 default 420; bounding radius of the outermost ring in canvas pixels. polySpacing: slider 20–300 step 10 default 150; pixel gap between successive ring radii. resolution: slider 100–3000 step 100 default 2000; points per ring (resolution+1 total including closing point); primary performance driver in gradient mode — cost scales as ringCount×gradientSteps×resolution. minSides: slider 3–10 step 1 default 4; starting polygon shape; triggers timeline rebuild on change. maxSides: slider 4–20 step 1 default 10; ending polygon shape; triggers timeline rebuild on change. loopFrames: slider 360–7200 step 360 default 3600; frames per complete morph cycle; triggers timeline rebuild on change; also updates animation.loopFrames for export. Waves group — waveAmplitude: slider 0–50 step 1 default 10; maximum wave displacement in canvas pixels. ampVariation: slider 0–2 step 0.1 default 0.5; depth of per-ring amplitude modulation (sinusoidal by ring index over period 10). weightVariation: slider 0–2 step 0.1 default 1; depth of per-ring wave weight modulation. phaseVariation: slider 0–1 step 0.05 default 0; per-ring phase shift increment applied as lineIndex×phaseVariation. Extrusion group — extrusionMode: dropdown vanishing|parallel default vanishing; selects extrusion geometry. extrusionFactor: slider 0–1 step 0.05 default 0.4; VP depth factor in vanishing mode (fraction of distance to VP). extrusionDist: slider 10–300 step 10 default 100; parallel extrusion distance in canvas pixels. vpX: slider −540–540 step 20 default 0; vanishing point X offset from canvas centre (vanishing mode only). vpY: slider −540–540 step 20 default 0; vanishing point Y offset from canvas centre (vanishing mode only). lightX: slider −540–540 step 20 default 0; light source X offset from canvas centre. lightY: slider −540–540 step 20 default −300; light source Y offset from canvas centre. Shading group — shadingMode: dropdown gradient|solid|solid-grey default gradient; gradient draws gradientSteps filled strips; solid uses white (front) / black (back); solid-grey uses white (front) / mid-grey (back). gradientSteps: slider 5–60 step 5 default 30; filled strip count per segment in gradient mode; reduce to 5–10 for interactive use. invertSides: dropdown off|on default off; swaps front/back classification, equivalent to inverting light polarity without adjusting lightX/lightY. normalSide: dropdown left|right default left; which side of the ring curve is treated as the front face.'
        },
        {
            heading: 'PRESETS',
            body: 'Classic: 5 rings, resolution 2000, gradient shading, vanishing extrusion, waveAmplitude 10 — the baseline visual at default quality. Solid: 5 rings, resolution 1000, solid-grey shading, vanishing extrusion, waveAmplitude 15 — significantly faster render; sharp extruded edges; suited for interactive exploration. Parallel: 4 rings, resolution 1500, gradient shading, parallel extrusion with extrusionDist 120, phaseVariation 0.1, light at (100, −200) — downward extrusion produces a different curtain geometry with stacked horizontal bands.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Three-stage cost — F1: O(ringCount×resolution) trig per frame; at defaults (5 rings, 2000 pts): ~10,000 trig calls. F2: O(ringCount×resolution) oscillator evaluations — 3 sin + 3 cos + 1 tanh per point; at defaults: ~70,000 transcendental calls/frame. F3: O(ringCount×gradientSteps×resolution) vertex calls — dominates; at defaults (5×30×2000×2): ~600,000 vertex calls/frame; at max settings (10×60×3000×2): ~7,200,000 — severe frame drops expected. Compute tier: geometric (Tier 2). Worker offload not feasible: P5 API renders to canvas; data transfer overhead for ringCount×resolution points/frame would offset any gain. Adaptive resolution (Tier 2, interactionScale 0.5): reduces effective vertex count by 4× during slider interaction. Ring geometry is cached during hold segments (when polygon shape and rotation are constant); oscillator is recomputed every frame regardless. Performance guidance — use solid or solid-grey for interactive exploration; switch to gradient for export; reduce gradientSteps to 5–10 for interactive gradient use; reduce resolution to 200–400 for fast feedback.'
        },
        {
            heading: 'ANIMATION',
            body: 'Type: loop. Default loopFrames: 3600 (60 seconds at 60 FPS). User param loopFrames (360–7200) controls actual cycle period; animation.loopFrames is updated in p5Setup to match, keeping export frame count consistent. Fully deterministic: frame % loopFrames drives all timing; same frame index and params always produce identical output. No Math.random, no Date.now dependency. Animatable params: waveAmplitude, ampVariation, weightVariation, phaseVariation, vpX, vpY, lightX, lightY, extrusionFactor, extrusionDist — all vary smoothly and meaningfully when sequenced. loopFrames, minSides, maxSides are excluded (trigger structural rebuilds). Sequencer enabled. Export: PNG (all states), GIF (deterministic loop).'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'Parallel extrusion direction is hardcoded to (0,1) — always downward; no user angle control. vpX/vpY have no effect in parallel mode. The three wave oscillator components (cycles, weights, base phases) are hardcoded; users cannot change individual wave frequencies or speeds. At resolution=2000 the closing point (j=resolution) duplicates j=0, adding one redundant oscillation computation per ring per frame — intentional for closed shape continuity. At high parameter combinations (resolution ≥ 2000, gradientSteps ≥ 30, ringCount ≥ 7), gradient mode will cause significant frame rate reduction; solid or solid-grey mode is recommended for interactive use at these settings. GIF export at loopFrames=7200 produces 7200 frames (120 seconds at 60 FPS); use lower loopFrames for manageable export sizes.'
        },
        {
            heading: 'REFERENCES',
            body: 'Origin: port of ring_polygon sketch. No archived legacy source. Algorithm: concentric polygon morphology via per-vertex linear interpolation with cosine-eased timeline; normal displacement via three-frequency sine waves with tanh(1.35x)/tanh(1.35) soft-limiting; vanishing-point or parallel extrusion; Lambert-like front/back face classification by dot product of surface normal against light direction vector.'
        }
    ],

    canvas: {
        width: 1080, height: 1080, context: 'p5',
        // CUR-01: colourway for background/front face/back face shading colours
        colourway: [
            { id: 'background', label: 'Background',      colour: '#000000' },
            { id: 'front',      label: 'Front Face',      colour: '#ffffff' },
            { id: 'back',       label: 'Back Face',       colour: '#000000' },
            { id: 'midgrey',    label: 'Mid (solid-grey)', colour: '#808080' }
        ]
    },

    compute: { cost: 'geometric', interactionScale: 0.5, idleDelay: 200 },

    parameters: [
        {
            group: 'Shape',
            params: [
                { key: 'ringCount',   type: 'slider', label: 'Ring Count',    min: 1, max: 10, step: 1,   default: 5 },
                { key: 'outerRadius', type: 'slider', label: 'Outer Radius',  min: 100, max: 520, step: 10, default: 420 },
                { key: 'polySpacing', type: 'slider', label: 'Poly Spacing',  min: 20, max: 300, step: 10, default: 150 },
                { key: 'resolution',  type: 'slider', label: 'Resolution',    min: 100, max: 3000, step: 100, default: 2000 },
                { key: 'minSides',    type: 'slider', label: 'Min Sides',     min: 3,   max: 10, step: 1,  default: 4 },
                { key: 'maxSides',    type: 'slider', label: 'Max Sides',     min: 4,   max: 20, step: 1,  default: 10 },
                { key: 'loopFrames',  type: 'slider', label: 'Loop Frames',   min: 360, max: 7200, step: 360, default: 3600 }
            ]
        },
        {
            group: 'Waves',
            params: [
                { key: 'waveAmplitude',   type: 'slider', label: 'Amplitude',        min: 0, max: 50, step: 1,    default: 10 },
                { key: 'ampVariation',    type: 'slider', label: 'Amp Variation',    min: 0, max: 2,  step: 0.1,  default: 0.5 },
                { key: 'weightVariation', type: 'slider', label: 'Weight Variation', min: 0, max: 2,  step: 0.1,  default: 1 },
                { key: 'phaseVariation',  type: 'slider', label: 'Phase Variation',  min: 0, max: 1,  step: 0.05, default: 0 },
                // CUR-01: expose wave component 1 tuning (cycles = spatial freq, loops = time freq)
                { key: 'wave1Cycles',  type: 'slider', label: 'Wave 1 Cycles',   min: 5,   max: 120, step: 5,  default: 50,  precision: 0 },
                { key: 'wave1Loops',   type: 'slider', label: 'Wave 1 Speed',    min: -400, max: 400, step: 20, default: 200, precision: 0 }
            ]
        },
        {
            group: 'Extrusion',
            params: [
                { key: 'extrusionMode',   type: 'dropdown', label: 'Mode',          options: ['vanishing', 'parallel'], default: 'vanishing' },
                { key: 'extrusionFactor', type: 'slider',   label: 'VP Factor',     min: 0, max: 1,    step: 0.05, default: 0.4 },
                { key: 'extrusionDist',   type: 'slider',   label: 'Parallel Dist', min: 10, max: 300, step: 10,   default: 100 },
                // CUR-01: expose parallel direction angle
                { key: 'directionAngle',  type: 'slider',   label: 'Direction Angle (°)',
                  min: 0, max: 360, step: 5, default: 90, precision: 0 },
                { key: 'vpX',    type: 'slider', label: 'VP X',    min: -540, max: 540, step: 20, default: 0 },
                { key: 'vpY',    type: 'slider', label: 'VP Y',    min: -540, max: 540, step: 20, default: 0 },
                { key: 'lightX', type: 'slider', label: 'Light X', min: -540, max: 540, step: 20, default: 0 },
                { key: 'lightY', type: 'slider', label: 'Light Y', min: -540, max: 540, step: 20, default: -300 }
            ]
        },
        {
            group: 'Shading',
            params: [
                { key: 'shadingMode',    type: 'dropdown', label: 'Shading',        options: ['gradient', 'solid', 'solid-grey'], default: 'gradient' },
                { key: 'gradientSteps', type: 'slider',   label: 'Gradient Steps', min: 5, max: 60, step: 5, default: 30 },
                { key: 'invertSides',   type: 'dropdown', label: 'Invert Sides',   options: ['off', 'on'], default: 'off' },
                { key: 'normalSide',    type: 'dropdown', label: 'Normal Side',    options: ['left', 'right'], default: 'left' }
            ]
        }
    ],

    presets: [
        {
            name: 'Classic',
            values: {
                ringCount: 5, outerRadius: 420, polySpacing: 150, resolution: 2000,
                minSides: 4, maxSides: 10, loopFrames: 3600,
                waveAmplitude: 10, ampVariation: 0.5, weightVariation: 1, phaseVariation: 0,
                extrusionMode: 'vanishing', extrusionFactor: 0.4, extrusionDist: 100,
                vpX: 0, vpY: 0, lightX: 0, lightY: -300,
                shadingMode: 'gradient', gradientSteps: 30, invertSides: 'off', normalSide: 'left'
            }
        },
        {
            name: 'Solid',
            values: {
                ringCount: 5, outerRadius: 420, polySpacing: 150, resolution: 1000,
                minSides: 3, maxSides: 8, loopFrames: 3600,
                waveAmplitude: 15, ampVariation: 0.5, weightVariation: 1, phaseVariation: 0,
                extrusionMode: 'vanishing', extrusionFactor: 0.4, extrusionDist: 100,
                vpX: 0, vpY: 0, lightX: 0, lightY: -300,
                shadingMode: 'solid-grey', gradientSteps: 30, invertSides: 'off', normalSide: 'left'
            }
        },
        {
            name: 'Parallel',
            values: {
                ringCount: 4, outerRadius: 350, polySpacing: 120, resolution: 1500,
                minSides: 3, maxSides: 12, loopFrames: 3600,
                waveAmplitude: 20, ampVariation: 0.3, weightVariation: 0.8, phaseVariation: 0.1,
                extrusionMode: 'parallel', extrusionFactor: 0.4, extrusionDist: 120,
                vpX: 0, vpY: 0, lightX: 100, lightY: -200,
                shadingMode: 'gradient', gradientSteps: 20, invertSides: 'off', normalSide: 'left'
            }
        }
    ],

    animation: {
        type: 'loop',
        loopFrames: 3600,
        defaultFps: 60,
        animatableParams: [
            'waveAmplitude', 'ampVariation', 'weightVariation', 'phaseVariation',
            'vpX', 'vpY', 'lightX', 'lightY', 'extrusionFactor', 'extrusionDist'
        ],
        sequencer: true,
    },

    export: { png: true, gif: true, webm: false },

    p5Setup(p, params) {
        this.animation.loopFrames = params.loopFrames;
        p.noLoop();
        _timingState = _buildTimeline({
            minSides: params.minSides, maxSides: params.maxSides, cyclesPerLoop: 1
        }, params.loopFrames);
        _lastTmKey = _tmKey(params);
        _cachedRings = null;
        _cachedRingKey = null;
    },

    p5Draw(p, params, frame) {
        const tmKey = _tmKey(params);
        if (tmKey !== _lastTmKey) {
            this.animation.loopFrames = params.loopFrames;
            _timingState = _buildTimeline({
                minSides: params.minSides, maxSides: params.maxSides, cyclesPerLoop: 1
            }, params.loopFrames);
            _lastTmKey = tmKey;
            _cachedRings = null;
            _cachedRingKey = null;
        }

        const { ringCount: count, outerRadius, polySpacing, resolution,
                minSides, maxSides, loopFrames,
                waveAmplitude: amplitude, ampVariation, weightVariation, phaseVariation,
                wave1Cycles, wave1Loops,
                extrusionMode, extrusionFactor, extrusionDist, directionAngle,
                vpX, vpY, lightX, lightY,
                shadingMode, gradientSteps, invertSides, normalSide } = params;

        // CUR-01: resolve colourway colours for rendering
        const cw = params.colourway || [];
        const colFront = _hexToArr((cw.find(c => c.id === 'front')     || {}).colour || '#ffffff');
        const colBack  = _hexToArr((cw.find(c => c.id === 'back')      || {}).colour || '#000000');
        const colMid   = _hexToArr((cw.find(c => c.id === 'midgrey')   || {}).colour || '#808080');
        const colBg    = _hexToArr((cw.find(c => c.id === 'background')|| {}).colour || '#000000');

        const sc = { count, outerRadius, resolution, polySpacing, minSides, maxSides };
        const state = _getTimingState(_timingState, frame);
        const rot   = state.rotation;

        let pointSets;
        if (state.sidesT !== undefined) {
            const from = _buildPolygonRings(state.fromSides, sc, rot);
            const to   = _buildPolygonRings(state.toSides,   sc, rot);
            pointSets = _morphShapes(from, to, state.sidesT);
        } else {
            const ringKey = `${state.sides}:${rot}:${count}:${outerRadius}:${resolution}:${polySpacing}:${maxSides}`;
            if (ringKey !== _cachedRingKey) {
                _cachedRings   = _buildPolygonRings(state.sides, sc, rot);
                _cachedRingKey = ringKey;
            }
            pointSets = _cachedRings;
        }

        pointSets = _translateShapes(pointSets, 540, 540);

        // CUR-01: configurable parallel direction angle
        const dirRad = ((directionAngle || 90) * _PI / 180);
        const extrusionCfg = {
            mode:           extrusionMode,
            direction:      { x: _cos(dirRad), y: _sin(dirRad) },
            distance:       extrusionDist,
            factor:         extrusionFactor,
            vanishingPoint: { x: 540 + vpX,   y: 540 + vpY },
            lightSource:    { x: 540 + lightX, y: 540 + lightY },
            shadingMode,
            gradientSteps,
            // CUR-01: pass resolved colourway to renderer
            colFront, colBack, colMid
        };

        const mod = {
            loopFrames, amplitude, ampVariation, weightVariation, phaseVariation,
            waves: _getWaves(wave1Cycles, wave1Loops)
        };

        const t = frame % loopFrames;

        // CUR-01: use colourway background colour
        p.background(colBg[0], colBg[1], colBg[2]);
        const segments = _buildCurtainSegments(
            pointSets, extrusionCfg, normalSide,
            mod, t, invertSides === 'on'
        );
        _drawCurtainSegments(p, segments, extrusionCfg);
    }
};
