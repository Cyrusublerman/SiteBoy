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
 * @version 1.0.0
 */

// =====================================================
// Math aliases
// =====================================================
const _PI  = Math.PI;
const _TAU = Math.PI * 2;
const _sin = Math.sin, _cos = Math.cos, _sqrt = Math.sqrt;
const _floor = Math.floor, _abs = Math.abs, _max = Math.max, _min = Math.min;
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

function _transformShapes(shapes, tx, cx, cy) {
    const { scaleX = 1, scaleY = 1, skewX = 0, skewY = 0, perspectiveY = 0 } = tx;
    return shapes.map(s => s.map(p => {
        const x = p.x - cx, y = p.y - cy;
        const sx = x + y * _tan(skewX), sy = y + x * _tan(skewY);
        const px = sx * scaleX, py = sy * scaleY;
        const pScale = perspectiveY !== 0 ? _max(0.1, 1 - perspectiveY * (py / 300)) : 1;
        return { x: cx + px * pScale, y: cy + py };
    }));
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

    // Subdivide oversized segments
    const minSegs = mod.minSegments || 0;
    if (minSegs > 0 && pointSets.length > 0) {
        const maxLen = _floor(pointSets[0].length / minSegs);
        return _subdivide(allSegments, maxLen, globalEHat || { x: 0, y: 1 });
    }
    return allSegments;
}

function _findApex(pts) {
    if (pts.length < 3) return -1;
    const first = pts[0], last = pts[pts.length - 1];
    const dx = last.x - first.x, dy = last.y - first.y;
    const len = _sqrt(dx * dx + dy * dy);
    if (len < 0.001) return _floor(pts.length / 2);
    let maxDist = 0, apex = _floor(pts.length / 2);
    for (let i = 1; i < pts.length - 1; i++) {
        const px = pts[i].x - first.x, py = pts[i].y - first.y;
        const d = _abs(px * dy - py * dx) / len;
        if (d > maxDist) { maxDist = d; apex = i; }
    }
    return apex;
}

function _subdivide(segments, maxLen, eHat) {
    const result = [];
    for (const seg of segments) {
        if (seg.pts.length <= maxLen) { result.push(seg); continue; }
        let apex = _findApex(seg.pts);
        if (apex <= 1) apex = _floor(seg.pts.length / 3);
        if (apex >= seg.pts.length - 2) apex = _floor(2 * seg.pts.length / 3);
        const pts1 = seg.pts.slice(0, apex + 1), pts2 = seg.pts.slice(apex);
        const sum1 = pts1.reduce((s, p) => s + p.x * eHat.x + p.y * eHat.y, 0);
        const sum2 = pts2.reduce((s, p) => s + p.x * eHat.x + p.y * eHat.y, 0);
        const sub = _subdivide([
            { pts: pts1, extrusionDirs: seg.extrusionDirs?.slice(0, apex + 1), side: seg.side, axisAvg: sum1 / pts1.length, ringIndex: seg.ringIndex, ringAvgDist: seg.ringAvgDist },
            { pts: pts2, extrusionDirs: seg.extrusionDirs?.slice(apex),        side: seg.side, axisAvg: sum2 / pts2.length, ringIndex: seg.ringIndex, ringAvgDist: seg.ringAvgDist }
        ], maxLen, eHat);
        sub.forEach(s => result.push(s));
    }
    return result;
}

// =====================================================
// F3: Draw curtain segments
// =====================================================

function _drawCurtainSegments(p, allSegments, extrusionCfg) {
    if (allSegments.length === 0) return;
    const { mode = 'parallel', vanishingPoint: vp, direction, distance = 100, factor = 0.4, shadingMode = 'gradient', gradientSteps = 30 } = extrusionCfg;

    let globalEHat = null;
    if (mode === 'parallel') {
        const dir = direction || { x: 0, y: 1 };
        const eMag = _sqrt(dir.x * dir.x + dir.y * dir.y) || 1;
        globalEHat = { x: dir.x / eMag, y: dir.y / eMag };
    }

    // Sort
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
            for (let step = 0; step < gradientSteps; step++) {
                const t0 = step / gradientSteps, t1 = (step + 1) / gradientSteps;
                const tMid = (t0 + t1) / 2;
                const shade = isFront ? _lerp(255, 0, tMid) : _lerp(0, 255, tMid);
                p.fill(shade);
                p.beginShape();
                for (const pt of seg.pts) { const ep = extrudePoint(pt, t0); p.vertex(ep.x, ep.y); }
                for (let j = seg.pts.length - 1; j >= 0; j--) { const ep = extrudePoint(seg.pts[j], t1); p.vertex(ep.x, ep.y); }
                p.endShape(p.CLOSE);
            }
        } else {
            const shade = shadingMode === 'solid-grey' ? (isFront ? 255 : 128) : (isFront ? 255 : 0);
            p.noStroke();
            p.fill(shade);
            p.beginShape();
            for (const pt of seg.pts) p.vertex(pt.x, pt.y);
            for (let j = extrPts.length - 1; j >= 0; j--) p.vertex(extrPts[j].x, extrPts[j].y);
            p.endShape(p.CLOSE);
            p.stroke(0); p.strokeWeight(1); p.noFill();
            p.beginShape(); seg.pts.forEach(pt => p.vertex(pt.x, pt.y)); p.endShape();
            p.beginShape(); extrPts.forEach(pt => p.vertex(pt.x, pt.y)); p.endShape();
        }
    }
}

// =====================================================
// SCRIPT CONFIG
// =====================================================

export const SCRIPT_CONFIG = {
    id: 'curtain-morph',
    title: 'Curtain Morph',
    category: 'other',
    description: 'Polygon rings morph between shapes while wave oscillators create flowing curtain surfaces, extruded with perspective and shaded by light direction.',
    version: '1.0.0',

    canvas: { width: 1080, height: 1080, context: 'p5' },

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
                { key: 'waveAmplitude',    type: 'slider', label: 'Amplitude',       min: 0,    max: 50, step: 1, default: 10 },
                { key: 'ampVariation',     type: 'slider', label: 'Amp Variation',   min: 0,    max: 2,  step: 0.1, default: 0.5 },
                { key: 'weightVariation',  type: 'slider', label: 'Weight Variation', min: 0,   max: 2,  step: 0.1, default: 1 },
                { key: 'phaseVariation',   type: 'slider', label: 'Phase Variation', min: 0,    max: 1,  step: 0.05, default: 0 }
            ]
        },
        {
            group: 'Extrusion',
            params: [
                { key: 'extrusionMode',   type: 'dropdown', label: 'Mode', options: ['vanishing', 'parallel'], default: 'vanishing' },
                { key: 'extrusionFactor', type: 'slider',   label: 'VP Factor',   min: 0, max: 1,   step: 0.05, default: 0.4 },
                { key: 'extrusionDist',   type: 'slider',   label: 'Parallel Dist', min: 10, max: 300, step: 10, default: 100 },
                { key: 'vpX',             type: 'slider',   label: 'VP X Offset', min: -540, max: 540, step: 20, default: 0 },
                { key: 'vpY',             type: 'slider',   label: 'VP Y Offset', min: -540, max: 540, step: 20, default: 0 },
                { key: 'lightX',          type: 'slider',   label: 'Light X',     min: -540, max: 540, step: 20, default: 0 },
                { key: 'lightY',          type: 'slider',   label: 'Light Y',     min: -540, max: 540, step: 20, default: -300 }
            ]
        },
        {
            group: 'Shading',
            params: [
                { key: 'shadingMode',    type: 'dropdown', label: 'Shading', options: ['gradient', 'solid', 'solid-grey'], default: 'gradient' },
                { key: 'gradientSteps', type: 'slider',   label: 'Gradient Steps', min: 5, max: 60, step: 5, default: 30 },
                { key: 'invertSides',   type: 'dropdown', label: 'Invert Sides', options: ['off', 'on'], default: 'off' },
                { key: 'normalSide',    type: 'dropdown', label: 'Normal Side', options: ['left', 'right'], default: 'left' }
            ]
        }
    ],

    presets: [
        {
            name: 'Classic',
            ringCount: 5, outerRadius: 420, polySpacing: 150, resolution: 2000,
            minSides: 4, maxSides: 10, loopFrames: 3600,
            waveAmplitude: 10, ampVariation: 0.5, weightVariation: 1, phaseVariation: 0,
            extrusionMode: 'vanishing', extrusionFactor: 0.4, extrusionDist: 100,
            vpX: 0, vpY: 0, lightX: 0, lightY: -300,
            shadingMode: 'gradient', gradientSteps: 30, invertSides: 'off', normalSide: 'left'
        },
        {
            name: 'Solid',
            ringCount: 5, outerRadius: 420, polySpacing: 150, resolution: 1000,
            minSides: 3, maxSides: 8, loopFrames: 3600,
            waveAmplitude: 15, ampVariation: 0.5, weightVariation: 1, phaseVariation: 0,
            extrusionMode: 'vanishing', extrusionFactor: 0.4, extrusionDist: 100,
            vpX: 0, vpY: 0, lightX: 0, lightY: -300,
            shadingMode: 'solid-grey', gradientSteps: 30, invertSides: 'off', normalSide: 'left'
        },
        {
            name: 'Parallel',
            ringCount: 4, outerRadius: 350, polySpacing: 120, resolution: 1500,
            minSides: 3, maxSides: 12, loopFrames: 3600,
            waveAmplitude: 20, ampVariation: 0.3, weightVariation: 0.8, phaseVariation: 0.1,
            extrusionMode: 'parallel', extrusionFactor: 0.4, extrusionDist: 120,
            vpX: 0, vpY: 0, lightX: 100, lightY: -200,
            shadingMode: 'gradient', gradientSteps: 20, invertSides: 'off', normalSide: 'left'
        }
    ],

    animation: { type: 'loop', loopFrames: 3600, defaultFps: 60 },

    // State
    _timingState: null,
    _lastTmKey: null,

    _tmKey: p => `${p.minSides}|${p.maxSides}|${p.loopFrames}`,

    _getWaves() {
        return [
            { cycles: 50.0, w: 0.70, loops: 200, phase: 0.0 },
            { cycles: 23.0, w: 0.50, loops: -40, phase: 1.2 },
            { cycles: 10.0, w: 0.40, loops: 7,   phase: 2.4 }
        ];
    },

    p5Setup(p, params) {
        p.noLoop();
        this._timingState = _buildTimeline({
            minSides: params.minSides, maxSides: params.maxSides, cyclesPerLoop: 1
        }, params.loopFrames);
        this._lastTmKey = this._tmKey(params);
    },

    p5Draw(p, params, frame) {
        const tmKey = this._tmKey(params);
        if (tmKey !== this._lastTmKey) {
            this._timingState = _buildTimeline({
                minSides: params.minSides, maxSides: params.maxSides, cyclesPerLoop: 1
            }, params.loopFrames);
            this._lastTmKey = tmKey;
        }

        const { ringCount: count, outerRadius, polySpacing, resolution,
                minSides, maxSides, loopFrames,
                waveAmplitude: amplitude, ampVariation, weightVariation, phaseVariation,
                extrusionMode, extrusionFactor, extrusionDist, vpX, vpY, lightX, lightY,
                shadingMode, gradientSteps, invertSides, normalSide } = params;

        const sc = { count, outerRadius, resolution, polySpacing, minSides, maxSides };
        const state  = _getTimingState(this._timingState, frame);
        const rot    = 0; // noVisualRotation = true
        let pointSets;

        if (state.sidesT !== undefined) {
            const from = _buildPolygonRings(state.fromSides, sc, rot);
            const to   = _buildPolygonRings(state.toSides,   sc, rot);
            pointSets = _morphShapes(from, to, state.sidesT);
        } else {
            pointSets = _buildPolygonRings(state.sides, sc, rot);
        }

        pointSets = _translateShapes(pointSets, 540, 540);

        const extrusionCfg = {
            mode:            extrusionMode,
            direction:       { x: 0, y: 1 },
            distance:        extrusionDist,
            factor:          extrusionFactor,
            vanishingPoint:  { x: 540 + vpX,   y: 540 + vpY },
            lightSource:     { x: 540 + lightX, y: 540 + lightY },
            shadingMode,
            gradientSteps
        };

        const mod = {
            loopFrames, amplitude, ampVariation, weightVariation, phaseVariation,
            minSegments: 0,
            waves: this._getWaves()
        };

        const t = frame % loopFrames;

        p.background(255);
        const segments = _buildCurtainSegments(
            pointSets, extrusionCfg, normalSide,
            mod, t, invertSides === 'on'
        );
        _drawCurtainSegments(p, segments, extrusionCfg);
    }
};
