/**
 * Wave Interference - p5.js Generator
 *
 * Four wave sources orbit the canvas perimeter at different speeds. Their
 * superimposed surface normals are converted to RGB via angular differences.
 * A reference vector traces a triangle path and rotates the colour mapping.
 *
 * Based on wave_interference sketch.
 * Uses pixel-level rendering for performance (loadPixels/updatePixels).
 *
 * @version 1.0.0
 */

export const SCRIPT_CONFIG = {
    id: 'p5-wave-interference',
    title: 'Wave Interference',
    category: 'wave',
    description: 'Four orbiting wave sources create interference patterns rendered via surface normal colour mapping.',
    version: '1.0.0',

    canvas: { width: 1080, height: 1080, context: 'p5' },

    parameters: [
        {
            group: 'Wave',
            params: [
                { key: 'amplitude',  type: 'slider', label: 'Amplitude',  min: 1,     max: 12,   step: 0.5, default: 4 },
                { key: 'frequency',  type: 'slider', label: 'Frequency',  min: 0.05,  max: 0.5,  step: 0.01, default: 0.251 },
                { key: 'speed',      type: 'slider', label: 'Speed',      min: 0.001, max: 0.1,  step: 0.001, default: 0.02 }
            ]
        },
        {
            group: 'Sources',
            params: [
                { key: 's1Loops', type: 'slider', label: 'Source 1 Loops', min: 1, max: 30, step: 1, default: 10 },
                { key: 's2Loops', type: 'slider', label: 'Source 2 Loops', min: 1, max: 30, step: 1, default: 7 },
                { key: 's3Loops', type: 'slider', label: 'Source 3 Loops', min: 1, max: 30, step: 1, default: 18 },
                { key: 's4Loops', type: 'slider', label: 'Source 4 Loops', min: 1, max: 30, step: 1, default: 3 }
            ]
        },
        {
            group: 'Render',
            params: [
                { key: 'resolution',  type: 'slider', label: 'Resolution', min: 1, max: 6, step: 1, default: 2 },
                { key: 'cycleFrames', type: 'slider', label: 'Cycle Frames', min: 360, max: 7200, step: 360, default: 3600 }
            ]
        }
    ],

    presets: [
        {
            name: 'Classic',
            amplitude: 4, frequency: 0.251, speed: 0.02,
            s1Loops: 10, s2Loops: 7, s3Loops: 18, s4Loops: 3,
            resolution: 2, cycleFrames: 3600
        },
        {
            name: 'High Freq',
            amplitude: 3, frequency: 0.4, speed: 0.03,
            s1Loops: 8, s2Loops: 5, s3Loops: 13, s4Loops: 2,
            resolution: 2, cycleFrames: 2400
        },
        {
            name: 'Low Detail',
            amplitude: 6, frequency: 0.15, speed: 0.015,
            s1Loops: 10, s2Loops: 7, s3Loops: 18, s4Loops: 3,
            resolution: 4, cycleFrames: 3600
        }
    ],

    animation: { type: 'loop', loopFrames: 3600, defaultFps: 60 },

    // Triangle vertices for reference vector path
    _triangle: [
        { x: 540, y: 54 }, { x: 1026, y: 1026 }, { x: 54, y: 1026 }
    ],

    _perimeter: 4320,

    _perimeterToXY(pos, W, H) {
        pos = ((pos % this._perimeter) + this._perimeter) % this._perimeter;
        if (pos < W)           return { x: pos,             y: 0 };
        if (pos < W + H)       return { x: W,               y: pos - W };
        if (pos < 2 * W + H)   return { x: 2 * W + H - pos, y: H };
        return { x: 0, y: this._perimeter - pos };
    },

    _getSourcePos(loops, clockwise, startOffset, time, cycleFrames, W, H) {
        const progress  = (time % cycleFrames) / cycleFrames;
        const direction = clockwise ? 1 : -1;
        const pos = startOffset + progress * loops * this._perimeter * direction;
        return this._perimeterToXY(pos, W, H);
    },

    _getRefVector(time, cycleFrames, W, H) {
        const loops = 10;
        const t = ((time % cycleFrames) / cycleFrames) * loops;
        const triProg = t % 1;
        const edgeProg = triProg * 3;
        const edgeIdx  = Math.floor(edgeProg) % 3;
        const edgeT    = edgeProg - edgeIdx;
        const v0 = this._triangle[edgeIdx];
        const v1 = this._triangle[(edgeIdx + 1) % 3];
        const sx = v0.x + (v1.x - v0.x) * edgeT;
        const sy = v0.y + (v1.y - v0.y) * edgeT;
        const theta = (sx / W) * Math.PI * 2;
        const phi   = (sy / H) * Math.PI;
        return {
            x: Math.sin(phi) * Math.cos(theta),
            y: Math.sin(phi) * Math.sin(theta),
            z: Math.cos(phi)
        };
    },

    _waveHeight(px, py, src, time, amp, freq, spd) {
        const dx = px - src.x, dy = py - src.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        return amp * (Math.sin(freq * d - spd * time) + 1) / 2;
    },

    _sumHeight(px, py, sources, time, amp, freq, spd) {
        return sources.reduce((t, s) => t + this._waveHeight(px, py, s, time, amp, freq, spd), 0);
    },

    _calcNormal(px, py, sources, time, amp, freq, spd) {
        const delta = 1;
        const hL = this._sumHeight(px - delta, py, sources, time, amp, freq, spd);
        const hR = this._sumHeight(px + delta, py, sources, time, amp, freq, spd);
        const hD = this._sumHeight(px, py - delta, sources, time, amp, freq, spd);
        const hU = this._sumHeight(px, py + delta, sources, time, amp, freq, spd);
        const nx = -(hR - hL) / 2, ny = -(hU - hD) / 2, nz = 1;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        return { x: nx / len, y: ny / len, z: nz / len };
    },

    _wrapAngle(a) {
        while (a >  Math.PI) a -= 2 * Math.PI;
        while (a < -Math.PI) a += 2 * Math.PI;
        return a;
    },

    _mapToColor(val, min, max) {
        return Math.round(Math.max(0, Math.min(255, (val - min) / (max - min) * 255)));
    },

    _deltaToRGB(nA, nB, ref) {
        const aXY = this._wrapAngle(Math.atan2(nA.y, nA.x) - Math.atan2(ref.y, ref.x));
        const aXZ = this._wrapAngle(Math.atan2(nA.z, nA.x) - Math.atan2(ref.z, ref.x));
        const aZY = this._wrapAngle(Math.atan2(nA.y, nA.z) - Math.atan2(ref.y, ref.z));
        const bXY = this._wrapAngle(Math.atan2(nB.y, nB.x) - Math.atan2(ref.y, ref.x));
        const bXZ = this._wrapAngle(Math.atan2(nB.z, nB.x) - Math.atan2(ref.z, ref.x));
        const bZY = this._wrapAngle(Math.atan2(nB.y, nB.z) - Math.atan2(ref.y, ref.z));
        const TPI = 2 * Math.PI;
        return {
            r: this._mapToColor(aXY + bXY, -TPI, TPI),
            g: this._mapToColor(aXZ + bXZ, -TPI, TPI),
            b: this._mapToColor(aZY + bZY, -TPI, TPI)
        };
    },

    _hueShift(rgb, deg) {
        // HSL conversion for hue shift
        const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                default: h = ((r - g) / d + 4) / 6; break;
            }
        }
        h = ((h * 360 + deg) % 360 + 360) % 360 / 360;
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1; if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        let rr, gg, bb;
        if (s === 0) { rr = gg = bb = l; } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const pv = 2 * l - q;
            rr = hue2rgb(pv, q, h + 1/3);
            gg = hue2rgb(pv, q, h);
            bb = hue2rgb(pv, q, h - 1/3);
        }
        return { r: Math.round(rr * 255), g: Math.round(gg * 255), b: Math.round(bb * 255) };
    },

    p5Setup(p, params) {
        p.pixelDensity(1);
        p.noLoop();
    },

    p5Draw(p, params, frame) {
        const { amplitude, frequency, speed, s1Loops, s2Loops, s3Loops, s4Loops, resolution, cycleFrames } = params;
        const W = p.width, H = p.height;
        const perimeter = 2 * (W + H);
        const time = frame;

        const srcConfigs = [
            { loops: s1Loops, clockwise: true,  startOffset: 0 },
            { loops: s2Loops, clockwise: true,  startOffset: perimeter / 2 },
            { loops: s3Loops, clockwise: false, startOffset: perimeter / 4 },
            { loops: s4Loops, clockwise: false, startOffset: (3 * perimeter) / 4 }
        ];

        const sources = srcConfigs.map(sc => this._getSourcePos(sc.loops, sc.clockwise, sc.startOffset, time, cycleFrames, W, H));
        const ref = this._getRefVector(time, cycleFrames, W, H);
        const pairA = [sources[0], sources[1]];
        const pairB = [sources[2], sources[3]];
        const allSources = [...pairA, ...pairB];

        p.loadPixels();
        const reso = resolution;

        for (let y = 0; y < H; y += reso) {
            for (let x = 0; x < W; x += reso) {
                const nA = this._calcNormal(x, y, pairA, time, amplitude, frequency, speed);
                const nB = this._calcNormal(x, y, pairB, time, amplitude, frequency, speed);
                let col  = this._deltaToRGB(nA, nB, ref);
                const zTotal = this._sumHeight(x, y, allSources, time, amplitude, frequency, speed);
                col = this._hueShift(col, (zTotal / 16) * 360);

                for (let dy = 0; dy < reso && y + dy < H; dy++) {
                    for (let dx = 0; dx < reso && x + dx < W; dx++) {
                        const idx = 4 * ((y + dy) * W + (x + dx));
                        p.pixels[idx]     = col.r;
                        p.pixels[idx + 1] = col.g;
                        p.pixels[idx + 2] = col.b;
                        p.pixels[idx + 3] = 255;
                    }
                }
            }
        }
        p.updatePixels();
    }
};
