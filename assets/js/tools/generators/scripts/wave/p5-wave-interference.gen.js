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
 * @version 1.1.0
 */

export const SCRIPT_CONFIG = {
    id: 'p5-wave-interference',
    title: 'Wave Interference',
    category: 'wave',
    description: 'Four orbiting wave sources create interference patterns rendered via surface normal colour mapping.',
    version: '1.1.0',

    canvas: { width: 1080, height: 1080, context: 'p5' },

    compute: {
        cost: 'per-pixel',
        interactionScale: 0.5,
        idleDelay: 200,
    },

    parameters: [
        {
            group: 'Wave',
            params: [
                { key: 'amplitude',  type: 'slider', label: 'Amplitude',  min: 1,     max: 12,   step: 0.5,  default: 4 },
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
                { key: 'resolution', type: 'slider', label: 'Resolution', min: 1, max: 6, step: 1, default: 2 }
            ]
        }
    ],

    presets: [
        {
            name: 'Classic',
            values: {
                amplitude: 4, frequency: 0.251, speed: 0.02,
                s1Loops: 10, s2Loops: 7, s3Loops: 18, s4Loops: 3,
                resolution: 2
            }
        },
        {
            name: 'High Freq',
            values: {
                amplitude: 3, frequency: 0.4, speed: 0.03,
                s1Loops: 8, s2Loops: 5, s3Loops: 13, s4Loops: 2,
                resolution: 2
            }
        },
        {
            name: 'Low Detail',
            values: {
                amplitude: 6, frequency: 0.15, speed: 0.015,
                s1Loops: 10, s2Loops: 7, s3Loops: 18, s4Loops: 3,
                resolution: 4
            }
        }
    ],

    animation: { type: 'loop', loopFrames: 3600, defaultFps: 60, animatableParams: ['amplitude', 'speed', 'frequency'] },

    export: { png: true, gif: true, webm: false },

    infoSections: [
        {
            heading: 'Overview',
            body: 'Wave Interference renders interference patterns from four orbiting wave sources on a 1080x1080 pixel canvas. Each pixel\'s colour is derived from the angular differences between the surface normals of two source pairs and a rotating reference vector. The generator is fully deterministic — every frame depends only on the frame number and current parameter values, with no random elements.'
        },
        {
            heading: 'Wave Model',
            body: 'Each source emits a scalar wave described by: h(px, py, src, t) = amplitude x (sin(frequency x distance - speed x t) + 1) / 2, where distance is the Euclidean distance from the pixel to the source. There is no distance decay — amplitude is uniform at all ranges. The wave heights of a source pair are summed at each pixel to produce a local surface height used for normal estimation.'
        },
        {
            heading: 'Source Orbits',
            body: 'Four sources orbit the canvas perimeter continuously. Sources 1 and 2 form Pair A; sources 3 and 4 form Pair B. Sources 1 and 3 travel clockwise; sources 2 and 4 travel counter-clockwise. Start offsets are 0, half-perimeter, quarter-perimeter, and three-quarter-perimeter respectively. Each source completes its loop count per animation cycle. All positions are deterministic and frame-based.'
        },
        {
            heading: 'Surface Normals',
            body: 'For each effective pixel, two surface normals are computed — one for Pair A and one for Pair B — using a 4-point finite difference of the summed wave heights at offsets of 1 pixel in each cardinal direction. The resulting gradient vector is normalised to a unit sphere. This gives a compact representation of the local surface tilt at the interference pattern\'s surface.'
        },
        {
            heading: 'Colour Mapping',
            body: 'Six angular differences are computed between the pair normals and a rotating reference vector: three from Pair A (XY, XZ, ZY planes) and three from Pair B. Each is wrapped to [-pi, pi]. The XY differences sum to the red channel, the XZ differences to green, and the ZY differences to blue. Each channel is linearly mapped from [-2pi, 2pi] to [0, 255]. A hue shift is then applied using the total summed wave height across all four sources, rotating the colour by up to 360 degrees.'
        },
        {
            heading: 'Reference Vector',
            body: 'The reference vector traces a triangle with vertices at approximately (540, 54), (1026, 1026), and (54, 1026) on the canvas, completing 10 circuits per animation cycle. The triangle position is converted to spherical coordinates — theta from the x-position and phi from the y-position — and mapped to a unit sphere. This rotating reference continuously shifts the colour output throughout the cycle.'
        },
        {
            heading: 'Parameters',
            body: 'Amplitude (1-12): wave height scale; higher values increase colour saturation and contrast. Frequency (0.05-0.5): spatial frequency of waves; higher values produce finer interference fringes. Speed (0.001-0.1): temporal phase rate; controls how fast the wave pattern evolves. Source 1-4 Loops (1-30): orbit count per cycle for each source; different values produce complex asymmetric patterns. Resolution (1-6): pixel block size for rendering; 1 is full quality at ~2-5 fps, 6 gives blocks at ~60 fps. The animation cycle is fixed at 3600 frames.'
        },
        {
            heading: 'Performance',
            body: 'At full resolution (1) the generator computes approximately 20 transcendental operations per pixel across 1.16 million pixels — expect 2-5 fps on the main thread. At the default resolution of 2 (291k effective pixels), expect 5-15 fps. Resolution 4 gives 20-40 fps; resolution 6 meets the 60 fps target. During parameter interaction, canvas resolution is automatically halved to maintain responsiveness, then restored after 200ms of inactivity. Use resolution 4-6 for real-time preview and resolution 1-2 for final output.'
        }
    ],

    // Triangle vertices for reference vector path (hardcoded for 1080x1080 canonical triangle)
    _triangle: [
        { x: 540, y: 54 }, { x: 1026, y: 1026 }, { x: 54, y: 1026 }
    ],

    _perimeterToXY(pos, W, H) {
        const perimeter = 2 * (W + H);
        pos = ((pos % perimeter) + perimeter) % perimeter;
        if (pos < W)           return { x: pos,             y: 0 };
        if (pos < W + H)       return { x: W,               y: pos - W };
        if (pos < 2 * W + H)   return { x: 2 * W + H - pos, y: H };
        return { x: 0, y: perimeter - pos };
    },

    _getSourcePos(loops, clockwise, startOffset, time, cycleFrames, W, H) {
        const perimeter  = 2 * (W + H);
        const progress   = (time % cycleFrames) / cycleFrames;
        const direction  = clockwise ? 1 : -1;
        const pos = startOffset + progress * loops * perimeter * direction;
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

    // refAtanYX/ZX/YZ: pre-cached atan2 values for the reference vector (constant per frame).
    // Caller must compute these once outside the pixel loop and pass them in.
    _deltaToRGB(nA, nB, refAtanYX, refAtanZX, refAtanYZ) {
        const aXY = this._wrapAngle(Math.atan2(nA.y, nA.x) - refAtanYX);
        const aXZ = this._wrapAngle(Math.atan2(nA.z, nA.x) - refAtanZX);
        const aZY = this._wrapAngle(Math.atan2(nA.y, nA.z) - refAtanYZ);
        const bXY = this._wrapAngle(Math.atan2(nB.y, nB.x) - refAtanYX);
        const bXZ = this._wrapAngle(Math.atan2(nB.z, nB.x) - refAtanZX);
        const bZY = this._wrapAngle(Math.atan2(nB.y, nB.z) - refAtanYZ);
        const TPI = 2 * Math.PI;
        return {
            r: this._mapToColor(aXY + bXY, -TPI, TPI),
            g: this._mapToColor(aXZ + bXZ, -TPI, TPI),
            b: this._mapToColor(aZY + bZY, -TPI, TPI)
        };
    },

    _hueShift(rgb, deg) {
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
        const { amplitude, frequency, speed, s1Loops, s2Loops, s3Loops, s4Loops, resolution } = params;
        const cycleFrames = this.animation.loopFrames;
        const W = p.width, H = p.height;
        const perimeter = 2 * (W + H);
        const time = frame;

        const sources = [
            this._getSourcePos(s1Loops, true,  0,                time, cycleFrames, W, H),
            this._getSourcePos(s2Loops, true,  perimeter / 2,    time, cycleFrames, W, H),
            this._getSourcePos(s3Loops, false, perimeter / 4,    time, cycleFrames, W, H),
            this._getSourcePos(s4Loops, false, (3 * perimeter) / 4, time, cycleFrames, W, H)
        ];
        const pairA = [sources[0], sources[1]];
        const pairB = [sources[2], sources[3]];
        const allSources = sources;

        const ref = this._getRefVector(time, cycleFrames, W, H);
        // Cache per-frame reference atan2 values — constant for all pixels this frame.
        const refAtanYX = Math.atan2(ref.y, ref.x);
        const refAtanZX = Math.atan2(ref.z, ref.x);
        const refAtanYZ = Math.atan2(ref.y, ref.z);

        p.loadPixels();
        const reso = resolution;

        for (let y = 0; y < H; y += reso) {
            for (let x = 0; x < W; x += reso) {
                const nA = this._calcNormal(x, y, pairA, time, amplitude, frequency, speed);
                const nB = this._calcNormal(x, y, pairB, time, amplitude, frequency, speed);
                let col  = this._deltaToRGB(nA, nB, refAtanYX, refAtanZX, refAtanYZ);
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
