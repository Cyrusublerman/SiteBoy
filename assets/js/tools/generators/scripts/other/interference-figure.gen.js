/**
 * Interference Figure — Physical optical interference pattern generator
 *
 * Models two-beam interference in anisotropic crystals (conoscope/polariscope).
 * Computes optical path difference (OPD) from a weighted basis field, then
 * integrates spectral intensity against CIE 1931 CMF to produce XYZ colour.
 *
 * @script interference-figure
 * @category other
 * @version 1.0.0
 */

const PI     = Math.PI;
const TWO_PI = PI * 2;

// ─────────────────────────────────────────────────────────────────────────────
// CIE 1931 2° colour-matching functions (x̄, ȳ, z̄) — 400–700 nm, 10 nm steps
// Source: CIE publication 15:2004 / Stiles & Burch (1959)
// ─────────────────────────────────────────────────────────────────────────────
const _XB = [
    0.01360, 0.04458, 0.13438, 0.28390, 0.34828, 0.33620, 0.29080, 0.19536,
    0.09564, 0.03201, 0.00490, 0.02477, 0.09289, 0.19938, 0.32896, 0.46518,
    0.60400, 0.74260, 0.86605, 0.96199, 1.06220, 1.00225, 0.85437, 0.64240,
    0.44790, 0.28350, 0.16482, 0.09076, 0.04624, 0.02283, 0.01146
];
const _YB = [
    0.00396, 0.01211, 0.04000, 0.11600, 0.23000, 0.38000, 0.60000, 0.81295,
    0.95800, 1.02390, 1.00000, 0.97395, 0.93480, 0.88720, 0.82450, 0.75280,
    0.64240, 0.53360, 0.43091, 0.32956, 0.23200, 0.15940, 0.10700, 0.07170,
    0.04677, 0.02980, 0.01700, 0.00910, 0.00465, 0.00229, 0.00114
];
const _ZB = [
    0.06750, 0.22490, 0.67850, 1.38560, 1.74706, 1.77211, 1.66920, 1.28764,
    0.81295, 0.46518, 0.27200, 0.15820, 0.08416, 0.04696, 0.02459, 0.01288,
    0.00755, 0.00375, 0.00213, 0.00113, 0.00060, 0.00030, 0.00015, 0.00008,
    0.00002, 0.00001, 0.00000, 0.00000, 0.00000, 0.00000, 0.00000
];

// Normalisation: sum of ȳ over 31 wavelengths (≈ 12.17); Y → 1 for white
const _YN = _YB.reduce((a, b) => a + b, 0);

// OPD field (normalised) → nm conversion. At r=1, D_radial=1 → 3000 nm OPD.
const OPD_SCALE = 3000;

// ─────────────────────────────────────────────────────────────────────────────
// Family canonical weights — non-negative [0, 1]; slider sign controls direction
// ─────────────────────────────────────────────────────────────────────────────
const FAMILY_NAMES = [
    'Rings', 'Spiral', 'Biaxial', 'Grid', 'Petal', 'Multi-Axis', 'Organic', 'Hybrid'
];
const FAMILY_WEIGHTS = [
    /* Rings      */ { radial:1.0, spiral:0.0, wedgeX:0.0, wedgeY:0.0, n2:0.0, n4:0.0, n6:0.0, n8:0.0, saddle:0.0, square:0.0 },
    /* Spiral     */ { radial:0.2, spiral:1.0, wedgeX:0.0, wedgeY:0.0, n2:0.0, n4:0.0, n6:0.0, n8:0.0, saddle:0.0, square:0.0 },
    /* Biaxial    */ { radial:0.3, spiral:0.0, wedgeX:0.0, wedgeY:0.0, n2:1.0, n4:0.0, n6:0.0, n8:0.0, saddle:0.5, square:0.0 },
    /* Grid       */ { radial:0.0, spiral:0.0, wedgeX:1.0, wedgeY:1.0, n2:0.0, n4:0.0, n6:0.0, n8:0.0, saddle:0.0, square:0.5 },
    /* Petal      */ { radial:0.3, spiral:0.0, wedgeX:0.0, wedgeY:0.0, n2:0.0, n4:0.0, n6:1.0, n8:0.5, saddle:0.0, square:0.0 },
    /* Multi-Axis */ { radial:0.5, spiral:0.0, wedgeX:0.0, wedgeY:0.0, n2:0.5, n4:0.5, n6:0.0, n8:0.0, saddle:0.3, square:0.0 },
    /* Organic    */ { radial:0.5, spiral:0.3, wedgeX:0.0, wedgeY:0.0, n2:0.0, n4:0.0, n6:0.0, n8:0.0, saddle:0.0, square:0.0 },
    /* Hybrid     */ { radial:0.4, spiral:0.3, wedgeX:0.2, wedgeY:0.2, n2:0.3, n4:0.3, n6:0.2, n8:0.2, saddle:0.2, square:0.2 }
];

// ─────────────────────────────────────────────────────────────────────────────
// Perlin noise — Ken Perlin's reference permutation table (256 values)
// ─────────────────────────────────────────────────────────────────────────────
const _P0 = [
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,
    69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,
    252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,
    168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,
    211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,
    80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,
    109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,
    85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,
    152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,
    110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,
    144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,
    106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,
    67,29,24,72,243,141,128,195,78,66,215,61,156,180
];
const _PERM = new Uint8Array(512);
for (let i = 0; i < 256; i++) _PERM[i] = _PERM[256 + i] = _P0[i];

// Main-thread ImageData buffer pool — one entry per canvas size
const _bufPool = {};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — main-thread only (reference module-scope constants)
// ─────────────────────────────────────────────────────────────────────────────

function _fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }

function _lerpN(a, b, t) { return a + (b - a) * t; }

function _grad2(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function _perlin2(x, y) {
    const X  = Math.floor(x) & 255;
    const Y  = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u  = _fade(xf);
    const v  = _fade(yf);
    const a  = _PERM[X]     + Y;
    const b  = _PERM[X + 1] + Y;
    return _lerpN(
        _lerpN(_grad2(_PERM[a],     xf,     yf    ), _grad2(_PERM[b],     xf - 1, yf    ), u),
        _lerpN(_grad2(_PERM[a + 1], xf,     yf - 1), _grad2(_PERM[b + 1], xf - 1, yf - 1), u),
        v
    );
}

function _fractalNoise(x, y, octaves) {
    let val = 0, amp = 1, freq = 1, maxAmp = 0;
    for (let o = 0; o < octaves; o++) {
        val += _perlin2(x * freq, y * freq) * amp;
        maxAmp += amp;
        amp *= 0.5;
        freq *= 2;
    }
    return val / maxAmp;
}

function _blendFamilies(name, morph) {
    let fi = FAMILY_NAMES.indexOf(name);
    if (fi < 0) fi = 0;
    const ni = (fi + 1) % FAMILY_NAMES.length;
    const m = Math.max(0, Math.min(1, morph || 0));
    const A = FAMILY_WEIGHTS[fi];
    const B = FAMILY_WEIGHTS[ni];
    return {
        radial: A.radial * (1 - m) + B.radial * m,
        spiral: A.spiral * (1 - m) + B.spiral * m,
        wedgeX: A.wedgeX * (1 - m) + B.wedgeX * m,
        wedgeY: A.wedgeY * (1 - m) + B.wedgeY * m,
        n2:     A.n2     * (1 - m) + B.n2     * m,
        n4:     A.n4     * (1 - m) + B.n4     * m,
        n6:     A.n6     * (1 - m) + B.n6     * m,
        n8:     A.n8     * (1 - m) + B.n8     * m,
        saddle: A.saddle * (1 - m) + B.saddle * m,
        square: A.square * (1 - m) + B.square * m
    };
}

function _parseBg(hex) {
    const h = (hex || '#000000').replace('#', '');
    return [
        parseInt(h.slice(0, 2), 16) || 0,
        parseInt(h.slice(2, 4), 16) || 0,
        parseInt(h.slice(4, 6), 16) || 0
    ];
}

function _toSrgb(lin, exposure, gamma) {
    const v = lin * exposure;
    if (v <= 0) return 0;
    return Math.min(255, Math.round(Math.pow(v, 1 / gamma) * 255));
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE PIXEL RENDER — main-thread path (uses module-scope helpers)
// ─────────────────────────────────────────────────────────────────────────────

function _renderSpectral(imageData, params) {
    const W = imageData.width;
    const H = imageData.height;
    const data = imageData.data;

    const plateRotation   = (params.plateRotation  || 0) * PI / 180;
    const globalScale     = params.globalScale      || 1;
    const spectralMode    = params.spectralMode     || 'Physical';
    const exposure        = params.exposure         || 1;
    const gamma           = params.gamma            || 2.2;
    const satBoost        = params.saturationBoost  || 1;
    const noiseWeight     = params.noiseWeight      || 0;
    const noiseScale      = params.noiseScale       || 1;
    const noiseOctaves    = Math.max(1, Math.min(5, Math.round(params.noiseOctaves || 2)));
    const multiAxisCount  = Math.max(0, Math.min(4, Math.round(params.multiAxisCount || 0)));
    const axisRadius      = params.axisRadius       || 0.3;
    const axisAngleSpread = (params.axisAngleSpread || 90) * PI / 180;
    const spiralRate      = params.spiralRate       || 2;
    const bg              = _parseBg(params.backgroundColor);

    const fw  = _blendFamilies(params.patternFamily || 'Rings', params.patternMorph || 0);
    const rW  = (params.radialWeight    || 0) * fw.radial;
    const spW = (params.spiralWeight    || 0) * fw.spiral;
    const wXW = (params.wedgeXWeight    || 0) * fw.wedgeX;
    const wYW = (params.wedgeYWeight    || 0) * fw.wedgeY;
    const n2W = (params.angularN2Weight || 0) * fw.n2;
    const n4W = (params.angularN4Weight || 0) * fw.n4;
    const n6W = (params.angularN6Weight || 0) * fw.n6;
    const n8W = (params.angularN8Weight || 0) * fw.n8;
    const sdW = (params.saddleWeight    || 0) * fw.saddle;
    const sqW = (params.squareWeight    || 0) * fw.square;

    const cx     = W / 2;
    const cy     = H / 2;
    const cScale = 2 / (Math.min(W, H) * globalScale);
    const cosR   = Math.cos(plateRotation);
    const sinR   = Math.sin(plateRotation);

    for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
            let u = (px - cx) * cScale;
            let v = (py - cy) * cScale;
            const ur = u * cosR - v * sinR;
            const vr = u * sinR + v * cosR;
            u = ur; v = vr;

            const r     = Math.sqrt(u * u + v * v);
            const theta = Math.atan2(v, u);
            const mxuv  = Math.max(Math.abs(u), Math.abs(v));

            let D = rW  * r * r
                  + spW * r * (spiralRate * theta / TWO_PI)
                  + n2W * Math.sin(2 * theta)
                  + n4W * Math.sin(4 * theta)
                  + n6W * Math.sin(6 * theta)
                  + n8W * Math.sin(8 * theta)
                  + sdW * (u * u - v * v)
                  + sqW * mxuv * mxuv
                  + wXW * Math.abs(u)
                  + wYW * Math.abs(v);

            if (multiAxisCount > 0) {
                const angStep = TWO_PI / multiAxisCount;
                for (let ai = 0; ai < multiAxisCount; ai++) {
                    const ang = ai * angStep + axisAngleSpread;
                    const ax  = axisRadius * Math.cos(ang);
                    const ay  = axisRadius * Math.sin(ang);
                    const du  = u - ax;
                    const dv  = v - ay;
                    D += rW * (du * du + dv * dv) * 0.5;
                }
            }

            if (noiseWeight > 0) {
                D += noiseWeight * _fractalNoise(u * noiseScale, v * noiseScale, noiseOctaves);
            }

            const Dnm = D * OPD_SCALE;
            let sR, sG, sB;

            if (spectralMode === 'Physical') {
                let X = 0, Y = 0, Z = 0;
                for (let k = 0; k < 31; k++) {
                    const lam = 400 + k * 10;
                    const s   = Math.sin(PI * Dnm / lam);
                    const Ik  = s * s;
                    X += Ik * _XB[k];
                    Y += Ik * _YB[k];
                    Z += Ik * _ZB[k];
                }
                X /= _YN; Y /= _YN; Z /= _YN;

                let lr = X *  3.2406 + Y * -1.5372 + Z * -0.4986;
                let lg = X * -0.9689 + Y *  1.8758 + Z *  0.0415;
                let lb = X *  0.0557 + Y * -0.2040 + Z *  1.0570;

                if (satBoost !== 1) {
                    const lum = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
                    lr = lum + (lr - lum) * satBoost;
                    lg = lum + (lg - lum) * satBoost;
                    lb = lum + (lb - lum) * satBoost;
                }

                sR = _toSrgb(lr, exposure, gamma);
                sG = _toSrgb(lg, exposure, gamma);
                sB = _toSrgb(lb, exposure, gamma);
            } else {
                // Stylised mode: sin² intensity at green midpoint, hue from OPD cycles
                const s550 = Math.sin(PI * Dnm / 550);
                const brt  = Math.min(1, s550 * s550 * exposure);
                const hue  = ((Dnm / 550) % 1 + 1) % 1;
                const h6   = hue * 6;
                const hi   = Math.floor(h6) % 6;
                const f    = h6 - Math.floor(h6);
                const q_   = brt * (1 - f);
                const t_   = brt * f;
                let rr, gg, bb;
                switch (hi) {
                    case 0: rr = brt; gg = t_;  bb = 0;   break;
                    case 1: rr = q_;  gg = brt; bb = 0;   break;
                    case 2: rr = 0;   gg = brt; bb = t_;  break;
                    case 3: rr = 0;   gg = q_;  bb = brt; break;
                    case 4: rr = t_;  gg = 0;   bb = brt; break;
                    default: rr = brt; gg = 0;  bb = q_;  break;
                }
                sR = Math.min(255, Math.round(rr * 255));
                sG = Math.min(255, Math.round(gg * 255));
                sB = Math.min(255, Math.round(bb * 255));
            }

            // Blend spectral output with background; dark interference regions → background
            const alpha = Math.max(sR, sG, sB) / 255;
            const i4    = (py * W + px) * 4;
            data[i4]     = Math.round(bg[0] * (1 - alpha) + sR * alpha);
            data[i4 + 1] = Math.round(bg[1] * (1 - alpha) + sG * alpha);
            data[i4 + 2] = Math.round(bg[2] * (1 - alpha) + sB * alpha);
            data[i4 + 3] = 255;
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAW — main-thread render (uses module-scope helpers + buffer pool)
// ─────────────────────────────────────────────────────────────────────────────

function draw(ctx, canvas, params) {
    const W   = canvas.width;
    const H   = canvas.height;
    const key = `${W}x${H}`;
    if (!_bufPool[key]) _bufPool[key] = ctx.createImageData(W, H);
    _renderSpectral(_bufPool[key], params);
    ctx.putImageData(_bufPool[key], 0, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULTS + PRESETS
// ─────────────────────────────────────────────────────────────────────────────

const _D = {
    patternFamily:   'Rings',
    patternMorph:    0,
    radialWeight:    1,
    spiralWeight:    1,
    spiralRate:      2,
    wedgeXWeight:    1,
    wedgeYWeight:    1,
    angularN2Weight: 1,
    angularN4Weight: 1,
    angularN6Weight: 1,
    angularN8Weight: 1,
    saddleWeight:    1,
    squareWeight:    1,
    plateRotation:   0,
    globalScale:     1,
    multiAxisCount:  0,
    axisRadius:      0.3,
    axisAngleSpread: 90,
    backgroundColor: '#000000',
    spectralMode:    'Physical',
    exposure:        1,
    gamma:           2.2,
    saturationBoost: 1,
    noiseWeight:     0,
    noiseScale:      1,
    noiseOctaves:    2
};

const _PRESETS = [
    {
        name: 'Rings',
        values: { ..._D, patternFamily: 'Rings', patternMorph: 0 }
    },
    {
        name: 'Spiral',
        values: { ..._D, patternFamily: 'Spiral', patternMorph: 0, spiralRate: 3, globalScale: 0.8 }
    },
    {
        name: 'Biaxial',
        values: { ..._D, patternFamily: 'Biaxial', patternMorph: 0, globalScale: 1.2 }
    },
    {
        name: 'Grid',
        values: { ..._D, patternFamily: 'Grid', patternMorph: 0, globalScale: 1.2 }
    },
    {
        name: 'Petal',
        values: { ..._D, patternFamily: 'Petal', patternMorph: 0, globalScale: 0.9 }
    },
    {
        name: 'Organic',
        values: {
            ..._D,
            patternFamily: 'Organic', patternMorph: 0,
            noiseWeight: 0.25, noiseScale: 2, noiseOctaves: 3,
            globalScale: 0.9
        }
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// SCRIPT CONFIG
// ─────────────────────────────────────────────────────────────────────────────

export const SCRIPT_CONFIG = {
    id:          'interference-figure',
    title:       'Interference Figure',
    category:    'other',
    description: 'Physical optical interference pattern generator based on two-beam interference and CIE 1931 spectral integration.',
    version:     '1.0.0',

    compute: {
        worker:           true,
        interactionScale: 0.5,
        idleDelay:        250
    },

    canvas: {
        width:      420,
        height:     420,
        context:    '2d',
        background: '#000000'
    },

    animation: { type: 'none' },

    export: { png: true, gif: false, webm: false },

    presets: _PRESETS,

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Interference Figure generates crystal-like optical interference patterns resembling images produced by a polariscope or conoscope. For each pixel on a normalised 420x420 canvas, an optical path difference (OPD) scalar field D(u,v) is computed from a weighted sum of ten basis functions: radial (r^2), Archimedean spiral (r x theta x spiralRate / 2pi), four angular harmonics (sin(n x theta) for n = 2, 4, 6, 8), saddle (u^2 - v^2), square (max(|u|, |v|)^2), and wedge X/Y (|u|, |v|). Eight named pattern families (Rings, Spiral, Biaxial, Grid, Petal, Multi-Axis, Organic, Hybrid) define canonical weight vectors for these fields; patternMorph (0 to 1) interpolates continuously between adjacent families. Individual field-weight sliders scale each family contribution (slider = 1: full family weight; slider = 0: muted). Optional Perlin FBM noise perturbs D for organic ring distortion. The OPD field is scaled to nanometres (OPD_SCALE = 3000 nm at field value 1.0). In Physical mode, 31 wavelength samples (400-700 nm) compute I_k = sin^2(pi x D x OPD_SCALE / lambda_k) and integrate against CIE 1931 2 degree CMF to produce XYZ, converted to sRGB. In Stylised mode, hue is mapped from OPD cycles with sin^2 brightness at 550 nm. Dark interference regions reveal the background colour via luminance blending. The generator is static (no animation); computation is offloaded to a Web Worker via ComputeScheduler Tier 3, with 50% adaptive resolution during slider interaction (Tier 2).'
        },
        {
            heading: 'ALGORITHM',
            body: 'Coordinate system: pixel (px, py) is normalised to u = (px - W/2) x 2 / (min(W,H) x globalScale), v = (py - H/2) x 2 / (min(W,H) x globalScale). Plate rotation theta = plateRotation x pi/180 is applied as u\' = u cosTheta - v sinTheta, v\' = u sinTheta + v cosTheta. Polar: r = sqrt(u\'^2 + v\'^2), theta = atan2(v\', u\'). OPD basis: family canonical weights (fw) are blended between FAMILY_WEIGHTS[fi] and FAMILY_WEIGHTS[(fi+1) % 8] by patternMorph. Effective weight per field = sliderValue x fw[field]. D = rW x r^2 + spW x r x (spiralRate x theta / 2pi) + n2W x sin(2 x theta) + n4W x sin(4 x theta) + n6W x sin(6 x theta) + n8W x sin(8 x theta) + sdW x (u^2 - v^2) + sqW x max(|u|,|v|)^2 + wXW x |u| + wYW x |v|. Multi-axis: multiAxisCount axes equally spaced over 2pi starting at axisAngleSpread radians, each at axisRadius from the origin, each contributing rW x 0.5 x [(u-ax)^2 + (v-ay)^2] to D. Noise: D += noiseWeight x FBM(u x noiseScale, v x noiseScale, noiseOctaves) where FBM accumulates Perlin noise with halving amplitude and doubling frequency per octave. Phase retardation: delta_k / 2 = pi x D x 3000 / lambda_k. Intensity: I_k = sin^2(delta_k / 2). Spectral integration: X = sum(I_k x xbar_k) / Y_norm, Y = sum(I_k x ybar_k) / Y_norm, Z = sum(I_k x zbar_k) / Y_norm, where Y_norm = sum(ybar_k) ~= 12.17. XYZ to linear sRGB via D65 3x3 matrix. Saturation boost: lum = 0.2126r + 0.7152g + 0.0722b; channel = lum + (channel - lum) x saturationBoost. Tone map: sRGB = clamp(0, floor((lin x exposure)^(1/gamma) x 255), 255). Background blend: final = bg x (1 - alpha) + spectral x alpha, where alpha = max(R,G,B) / 255.'
        },
        {
            heading: 'PARAMETERS',
            body: 'Pattern — patternFamily: dropdown, options Rings / Spiral / Biaxial / Grid / Petal / Multi-Axis / Organic / Hybrid, default Rings; selects the canonical OPD field weight set. patternMorph: slider 0 to 1 step 0.01, default 0; interpolates weights from the selected family toward the next family in the list. Fields — radialWeight: slider 0 to 1 step 0.01, default 1; scales the r^2 radial component. spiralWeight: slider 0 to 1 step 0.01, default 1; scales the Archimedean spiral component. spiralRate: slider -4 to 4 step 0.1, default 2; spiral turns per normalised unit. wedgeXWeight: slider 0 to 1 step 0.01, default 1; scales the |u| horizontal wedge. wedgeYWeight: slider 0 to 1 step 0.01, default 1; scales the |v| vertical wedge. Angular — angularN2Weight: slider -1 to 1 step 0.01, default 1; scales sin(2 theta); negative inverts the harmonic. angularN4Weight: slider -1 to 1 step 0.01, default 1; scales sin(4 theta). angularN6Weight: slider -1 to 1 step 0.01, default 1; scales sin(6 theta). angularN8Weight: slider -1 to 1 step 0.01, default 1; scales sin(8 theta). Transform — saddleWeight: slider -1 to 1 step 0.01, default 1; scales u^2 - v^2 saddle field; negative inverts curvature. squareWeight: slider 0 to 1 step 0.01, default 1; scales max(|u|,|v|)^2 square envelope. plateRotation: slider -180 to 180 step 1, default 0; rotates the entire field coordinate system in degrees. globalScale: slider 0.2 to 3 step 0.05, default 1; scales the normalised coordinate system (higher = zoomed in, more rings). Multi-Axis — multiAxisCount: slider 0 to 4 step 1, default 0; number of off-centre optical axes to add. axisRadius: slider 0 to 0.5 step 0.01, default 0.3; radius of axis ring in normalised units. axisAngleSpread: slider 0 to 180 step 1, default 90; starting angle offset for axis placement (degrees). Colour — backgroundColor: color (VGA palette), default black; background for destructive interference regions. spectralMode: radio Physical / Stylised, default Physical; Physical uses full CIE CMF spectral integration; Stylised uses hue-per-OPD-cycle with sin^2 at 550 nm. exposure: slider 0.5 to 2 step 0.05, default 1; linear pre-gamma brightness multiplier. gamma: slider 1.8 to 2.4 step 0.05, default 2.2; display gamma exponent. saturationBoost: slider 0.5 to 1.5 step 0.05, default 1; lerp from luminance toward full chroma. Noise — noiseWeight: slider 0 to 0.5 step 0.01, default 0; amplitude of fractal noise added to OPD field. noiseScale: slider 0.2 to 4 step 0.1, default 1; spatial frequency of noise in normalised coords. noiseOctaves: slider 1 to 5 step 1, default 2; fractal noise octave count.'
        },
        {
            heading: 'PRESETS',
            body: 'Rings (default): patternFamily = Rings, all sliders at 1. Produces concentric spectral rings; pure radial OPD field D = r^2 x OPD_SCALE. Dark centre (isogyre), coloured rings radiating outward. Spiral: patternFamily = Spiral, spiralRate = 3, globalScale = 0.8. Dominant spiral component (fw.spiral = 1) plus weak radial (fw.radial = 0.2). Rings unwind into a spectral spiral. Biaxial: patternFamily = Biaxial, globalScale = 1.2. Combines radial (fw.radial = 0.3), angular N2 (fw.n2 = 1), and saddle (fw.saddle = 0.5). Produces a figure-8 or hyperbolic isogyres pattern characteristic of biaxial crystal conoscopy. Grid: patternFamily = Grid, globalScale = 1.2. Combines horizontal and vertical wedge fields (fw.wedgeX = fw.wedgeY = 1) with square envelope (fw.square = 0.5). Produces a rectangular grid of spectral fringes. Petal: patternFamily = Petal, globalScale = 0.9. Dominant N6 harmonic (fw.n6 = 1) with N8 (fw.n8 = 0.5) and weak radial (fw.radial = 0.3). Produces 6-petalled flower-like spectral pattern. Organic: patternFamily = Organic, noiseWeight = 0.25, noiseScale = 2, noiseOctaves = 3, globalScale = 0.9. Radial and spiral fields with significant fractal noise perturbation. Rings are distorted into flowing organic forms.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Complexity: O(W x H x N_lambda) where N_lambda = 31. At 420x420 = 176,400 pixels: approximately 5.5 million sin evaluations per render plus OPD field arithmetic (~10 ops/pixel) and fractal noise (octaves x perlin evals/pixel when noiseWeight > 0). Estimated render time: 20-80 ms in a Worker on modern hardware. Frame budget constraint does not apply (static generator, no 16.7 ms target). Interactive target: < 500 ms per parameter change, met by Worker offload. Two ComputeScheduler mitigations are active. Tier 2: adaptive resolution renders at 50% linear scale (~25% pixel count, ~210x210) during slider interaction, reducing load by approximately 75%. Full resolution is restored after 250 ms of idle. Tier 3: Worker offload routes computePixels off-main-thread via ComputeScheduler; main thread is not blocked during render. draw() provides the full-resolution fallback on Worker error and after Tier 2 restore. Buffer pooling in draw() reuses the 420x420 ImageData (~700 KB) across calls. computePixels() in the Worker allocates fresh buffers (GC not a concern in short-lived Worker tasks). Noise performance: fractal noise with noiseOctaves = 3 adds approximately 3x perlin evaluations per pixel; disable (noiseWeight = 0) for maximum speed.'
        },
        {
            heading: 'ANIMATION',
            body: 'This generator produces a static image. animation.type = "none". There are no frame-dependent variables; the output is fully determined by the current parameter set. export.gif and export.webm are false. PNG export is available. The ANIMATE tab is present but controls are inactive for static generators. Sequencer is not applicable. To explore temporal change, adjust parameters interactively; Tier 2 adaptive resolution maintains sub-100 ms interactive response during slider drag.'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'Polarisation factor (PHYS-010): the optional polarisation-angle modulation of interference intensity documented in the spec is not implemented. The modulation formula is partially specified ("not fully specified in legacy spec"); excluding it avoids introducing undocumented behaviour. OPD_SCALE is a fixed internal constant (3000 nm). It is not exposed as a parameter. To adjust ring count, use globalScale (0.2 to 3); a 3x increase in globalScale multiplies effective OPD by approximately 9x (quadratic field). patternMorph interpolates toward the next family in the fixed FAMILY_NAMES list, not toward a user-selected target family. SVG export specified in ui-layout.md is not implemented; per-pixel putImageData is incompatible with vector export. backgroundColor resolves to the VGA 16-colour palette (parameter-builder constraint); free hex input is not supported. Stylised spectral mode is not physically accurate; it maps OPD cycles to HSV hue with sin^2 at 550 nm for brightness. CIE CMF values are the 1931 2-degree standard observer; the 10-degree observer or CIE 170-2 functions would be more accurate for large-field viewing.'
        },
        {
            heading: 'REFERENCES',
            body: 'Live script: assets/js/tools/generators/scripts/other/interference-figure.gen.js v1.0.0. Registry: assets/js/tools/generators/core/script-registry.js. Host: assets/js/tools/generators/core/generative-tool-host.js. Algorithm basis: Born & Wolf, "Principles of Optics" (7th ed.), Chapter 7 (two-beam interference) and Chapter 14 (conoscopy). CIE CMF: CIE publication 15:2004 (Colorimetry, 3rd ed.). Spectral-to-RGB matrix: IEC 61966-2-1:1999 (sRGB standard). Perlin noise: K. Perlin, "An Image Synthesizer" (SIGGRAPH 1985); improved gradient: K. Perlin, "Improving Noise" (SIGGRAPH 2002). OPD field basis decomposition: Malacara, "Optical Shop Testing" (3rd ed., 2007), Chapter 5 (conoscopic fringe analysis). Pattern family definitions: bespoke synthesis of standard conoscope fringe types (uniaxial, biaxial, Archimedean, cartesian).'
        }
    ],

    parameters: [
        {
            group: 'Pattern',
            params: [
                {
                    key: 'patternFamily', type: 'dropdown', label: 'Family',
                    options: ['Rings', 'Spiral', 'Biaxial', 'Grid', 'Petal', 'Multi-Axis', 'Organic', 'Hybrid'],
                    default: 'Rings'
                },
                {
                    key: 'patternMorph', type: 'slider', label: 'Morph',
                    min: 0, max: 1, step: 0.01, default: 0, precision: 2
                }
            ]
        },
        {
            group: 'Fields',
            params: [
                { key: 'radialWeight',  type: 'slider', label: 'Radial',   min: 0,  max: 1,  step: 0.01, default: 1,   precision: 2 },
                { key: 'spiralWeight',  type: 'slider', label: 'Spiral',   min: 0,  max: 1,  step: 0.01, default: 1,   precision: 2 },
                { key: 'spiralRate',    type: 'slider', label: 'Spiral Rate', min: -4, max: 4, step: 0.1, default: 2,   precision: 1 },
                { key: 'wedgeXWeight',  type: 'slider', label: 'Wedge X',  min: 0,  max: 1,  step: 0.01, default: 1,   precision: 2 },
                { key: 'wedgeYWeight',  type: 'slider', label: 'Wedge Y',  min: 0,  max: 1,  step: 0.01, default: 1,   precision: 2 }
            ]
        },
        {
            group: 'Angular',
            defaultCollapsed: true,
            params: [
                { key: 'angularN2Weight', type: 'slider', label: 'N2 sin(2θ)', min: -1, max: 1, step: 0.01, default: 1, precision: 2 },
                { key: 'angularN4Weight', type: 'slider', label: 'N4 sin(4θ)', min: -1, max: 1, step: 0.01, default: 1, precision: 2 },
                { key: 'angularN6Weight', type: 'slider', label: 'N6 sin(6θ)', min: -1, max: 1, step: 0.01, default: 1, precision: 2 },
                { key: 'angularN8Weight', type: 'slider', label: 'N8 sin(8θ)', min: -1, max: 1, step: 0.01, default: 1, precision: 2 }
            ]
        },
        {
            group: 'Transform',
            defaultCollapsed: true,
            params: [
                { key: 'saddleWeight',   type: 'slider', label: 'Saddle',    min: -1,   max: 1,   step: 0.01, default: 1,   precision: 2 },
                { key: 'squareWeight',   type: 'slider', label: 'Square',    min: 0,    max: 1,   step: 0.01, default: 1,   precision: 2 },
                { key: 'plateRotation',  type: 'slider', label: 'Rotation',  min: -180, max: 180, step: 1,    default: 0,   precision: 0 },
                { key: 'globalScale',    type: 'slider', label: 'Scale',     min: 0.2,  max: 3,   step: 0.05, default: 1,   precision: 2 }
            ]
        },
        {
            group: 'Multi-Axis',
            defaultCollapsed: true,
            params: [
                { key: 'multiAxisCount',  type: 'slider', label: 'Axis Count',  min: 0,   max: 4,   step: 1,    default: 0,   precision: 0 },
                { key: 'axisRadius',      type: 'slider', label: 'Axis Radius', min: 0,   max: 0.5, step: 0.01, default: 0.3, precision: 2 },
                { key: 'axisAngleSpread', type: 'slider', label: 'Angle Spread', min: 0, max: 180,  step: 1,    default: 90,  precision: 0 }
            ]
        },
        {
            group: 'Colour',
            params: [
                { key: 'backgroundColor', type: 'color',    label: 'Background',  default: '#000000' },
                { key: 'spectralMode',     type: 'radio',   label: 'Mode',        options: ['Physical', 'Stylised'], default: 'Physical' },
                { key: 'exposure',         type: 'slider',  label: 'Exposure',    min: 0.5, max: 2,   step: 0.05, default: 1,   precision: 2 },
                { key: 'gamma',            type: 'slider',  label: 'Gamma',       min: 1.8, max: 2.4, step: 0.05, default: 2.2, precision: 2 },
                { key: 'saturationBoost',  type: 'slider',  label: 'Saturation',  min: 0.5, max: 1.5, step: 0.05, default: 1,   precision: 2 }
            ]
        },
        {
            group: 'Noise',
            defaultCollapsed: true,
            params: [
                { key: 'noiseWeight',  type: 'slider', label: 'Weight',  min: 0,   max: 0.5, step: 0.01, default: 0,   precision: 2 },
                { key: 'noiseScale',   type: 'slider', label: 'Scale',   min: 0.2, max: 4,   step: 0.1,  default: 1,   precision: 1 },
                { key: 'noiseOctaves', type: 'slider', label: 'Octaves', min: 1,   max: 5,   step: 1,    default: 2,   precision: 0 }
            ]
        }
    ],

    draw,

    /**
     * Tier-3 worker function — self-contained; no module-scope references.
     * Receives an empty ImageData (buffer transferred). Returns filled ImageData.
     */
    computePixels: function(imageData, params) {
        const W    = imageData.width;
        const H    = imageData.height;
        const data = imageData.data;

        // ── Inline constants ──────────────────────────────────────────────────
        const PI     = Math.PI;
        const TWO_PI = PI * 2;
        const OPD_SCALE = 3000;

        // CIE 1931 2° CMF — 400-700 nm, 10 nm steps, 31 entries
        const XB = [
            0.01360, 0.04458, 0.13438, 0.28390, 0.34828, 0.33620, 0.29080, 0.19536,
            0.09564, 0.03201, 0.00490, 0.02477, 0.09289, 0.19938, 0.32896, 0.46518,
            0.60400, 0.74260, 0.86605, 0.96199, 1.06220, 1.00225, 0.85437, 0.64240,
            0.44790, 0.28350, 0.16482, 0.09076, 0.04624, 0.02283, 0.01146
        ];
        const YB = [
            0.00396, 0.01211, 0.04000, 0.11600, 0.23000, 0.38000, 0.60000, 0.81295,
            0.95800, 1.02390, 1.00000, 0.97395, 0.93480, 0.88720, 0.82450, 0.75280,
            0.64240, 0.53360, 0.43091, 0.32956, 0.23200, 0.15940, 0.10700, 0.07170,
            0.04677, 0.02980, 0.01700, 0.00910, 0.00465, 0.00229, 0.00114
        ];
        const ZB = [
            0.06750, 0.22490, 0.67850, 1.38560, 1.74706, 1.77211, 1.66920, 1.28764,
            0.81295, 0.46518, 0.27200, 0.15820, 0.08416, 0.04696, 0.02459, 0.01288,
            0.00755, 0.00375, 0.00213, 0.00113, 0.00060, 0.00030, 0.00015, 0.00008,
            0.00002, 0.00001, 0.00000, 0.00000, 0.00000, 0.00000, 0.00000
        ];
        let YN = 0;
        for (let k = 0; k < 31; k++) YN += YB[k];

        // Family canonical weights (order matches FAMILY_NAMES)
        const FW = [
            { radial:1.0, spiral:0.0, wedgeX:0.0, wedgeY:0.0, n2:0.0, n4:0.0, n6:0.0, n8:0.0, saddle:0.0, square:0.0 },
            { radial:0.2, spiral:1.0, wedgeX:0.0, wedgeY:0.0, n2:0.0, n4:0.0, n6:0.0, n8:0.0, saddle:0.0, square:0.0 },
            { radial:0.3, spiral:0.0, wedgeX:0.0, wedgeY:0.0, n2:1.0, n4:0.0, n6:0.0, n8:0.0, saddle:0.5, square:0.0 },
            { radial:0.0, spiral:0.0, wedgeX:1.0, wedgeY:1.0, n2:0.0, n4:0.0, n6:0.0, n8:0.0, saddle:0.0, square:0.5 },
            { radial:0.3, spiral:0.0, wedgeX:0.0, wedgeY:0.0, n2:0.0, n4:0.0, n6:1.0, n8:0.5, saddle:0.0, square:0.0 },
            { radial:0.5, spiral:0.0, wedgeX:0.0, wedgeY:0.0, n2:0.5, n4:0.5, n6:0.0, n8:0.0, saddle:0.3, square:0.0 },
            { radial:0.5, spiral:0.3, wedgeX:0.0, wedgeY:0.0, n2:0.0, n4:0.0, n6:0.0, n8:0.0, saddle:0.0, square:0.0 },
            { radial:0.4, spiral:0.3, wedgeX:0.2, wedgeY:0.2, n2:0.3, n4:0.3, n6:0.2, n8:0.2, saddle:0.2, square:0.2 }
        ];
        const FN = ['Rings', 'Spiral', 'Biaxial', 'Grid', 'Petal', 'Multi-Axis', 'Organic', 'Hybrid'];

        // Perlin permutation table
        const P0 = [
            151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,
            69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,
            252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,
            168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,
            211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,
            80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,
            109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,
            85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,
            152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,
            110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,
            144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,
            106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,
            67,29,24,72,243,141,128,195,78,66,215,61,156,180
        ];
        const PERM = new Uint8Array(512);
        for (let i = 0; i < 256; i++) PERM[i] = PERM[256 + i] = P0[i];

        // ── Inline helpers ────────────────────────────────────────────────────
        function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
        function lerpW(a, b, t) { return a + (b - a) * t; }
        function grad2(h, x, y) {
            const hh = h & 3;
            const u  = hh < 2 ? x : y;
            const v  = hh < 2 ? y : x;
            return ((hh & 1) === 0 ? u : -u) + ((hh & 2) === 0 ? v : -v);
        }
        function perlin2(x, y) {
            const X  = Math.floor(x) & 255;
            const Y  = Math.floor(y) & 255;
            const xf = x - Math.floor(x);
            const yf = y - Math.floor(y);
            const u  = fade(xf);
            const v  = fade(yf);
            const a  = PERM[X]     + Y;
            const b  = PERM[X + 1] + Y;
            return lerpW(
                lerpW(grad2(PERM[a],     xf,     yf    ), grad2(PERM[b],     xf - 1, yf    ), u),
                lerpW(grad2(PERM[a + 1], xf,     yf - 1), grad2(PERM[b + 1], xf - 1, yf - 1), u),
                v
            );
        }
        function fbm(x, y, oct) {
            let val = 0, amp = 1, freq = 1, maxAmp = 0;
            for (let o = 0; o < oct; o++) {
                val += perlin2(x * freq, y * freq) * amp;
                maxAmp += amp; amp *= 0.5; freq *= 2;
            }
            return val / maxAmp;
        }
        function toSrgb(lin, exp, gam) {
            const v = lin * exp;
            if (v <= 0) return 0;
            return Math.min(255, Math.round(Math.pow(v, 1 / gam) * 255));
        }

        // ── Parse params ──────────────────────────────────────────────────────
        const plateRotation   = (params.plateRotation  || 0) * PI / 180;
        const globalScale     = params.globalScale      || 1;
        const spectralMode    = params.spectralMode     || 'Physical';
        const exposure        = params.exposure         || 1;
        const gamma           = params.gamma            || 2.2;
        const satBoost        = params.saturationBoost  || 1;
        const noiseWeight     = params.noiseWeight      || 0;
        const noiseScale      = params.noiseScale       || 1;
        const noiseOctaves    = Math.max(1, Math.min(5, Math.round(params.noiseOctaves || 2)));
        const multiAxisCount  = Math.max(0, Math.min(4, Math.round(params.multiAxisCount || 0)));
        const axisRadius      = params.axisRadius       || 0.3;
        const axisAngleSpread = (params.axisAngleSpread || 90) * PI / 180;
        const spiralRate      = params.spiralRate       || 2;

        const bgHex = (params.backgroundColor || '#000000').replace('#', '');
        const bgR   = parseInt(bgHex.slice(0, 2), 16) || 0;
        const bgG   = parseInt(bgHex.slice(2, 4), 16) || 0;
        const bgB   = parseInt(bgHex.slice(4, 6), 16) || 0;

        // ── Family blend ──────────────────────────────────────────────────────
        let fi = FN.indexOf(params.patternFamily || 'Rings');
        if (fi < 0) fi = 0;
        const ni = (fi + 1) % 8;
        const m  = Math.max(0, Math.min(1, params.patternMorph || 0));
        const A  = FW[fi];
        const B  = FW[ni];

        const rW  = (params.radialWeight    || 0) * (A.radial * (1 - m) + B.radial * m);
        const spW = (params.spiralWeight    || 0) * (A.spiral * (1 - m) + B.spiral * m);
        const wXW = (params.wedgeXWeight    || 0) * (A.wedgeX * (1 - m) + B.wedgeX * m);
        const wYW = (params.wedgeYWeight    || 0) * (A.wedgeY * (1 - m) + B.wedgeY * m);
        const n2W = (params.angularN2Weight || 0) * (A.n2     * (1 - m) + B.n2     * m);
        const n4W = (params.angularN4Weight || 0) * (A.n4     * (1 - m) + B.n4     * m);
        const n6W = (params.angularN6Weight || 0) * (A.n6     * (1 - m) + B.n6     * m);
        const n8W = (params.angularN8Weight || 0) * (A.n8     * (1 - m) + B.n8     * m);
        const sdW = (params.saddleWeight    || 0) * (A.saddle * (1 - m) + B.saddle * m);
        const sqW = (params.squareWeight    || 0) * (A.square * (1 - m) + B.square * m);

        // ── Coordinate constants ──────────────────────────────────────────────
        const cx     = W / 2;
        const cy     = H / 2;
        const cScale = 2 / (Math.min(W, H) * globalScale);
        const cosR   = Math.cos(plateRotation);
        const sinR   = Math.sin(plateRotation);

        // ── Pixel loop ────────────────────────────────────────────────────────
        for (let py = 0; py < H; py++) {
            for (let px = 0; px < W; px++) {
                let u = (px - cx) * cScale;
                let v = (py - cy) * cScale;
                const ur = u * cosR - v * sinR;
                const vr = u * sinR + v * cosR;
                u = ur; v = vr;

                const r     = Math.sqrt(u * u + v * v);
                const theta = Math.atan2(v, u);
                const mxuv  = Math.max(Math.abs(u), Math.abs(v));

                let D = rW  * r * r
                      + spW * r * (spiralRate * theta / TWO_PI)
                      + n2W * Math.sin(2 * theta)
                      + n4W * Math.sin(4 * theta)
                      + n6W * Math.sin(6 * theta)
                      + n8W * Math.sin(8 * theta)
                      + sdW * (u * u - v * v)
                      + sqW * mxuv * mxuv
                      + wXW * Math.abs(u)
                      + wYW * Math.abs(v);

                if (multiAxisCount > 0) {
                    const angStep = TWO_PI / multiAxisCount;
                    for (let ai = 0; ai < multiAxisCount; ai++) {
                        const ang = ai * angStep + axisAngleSpread;
                        const ax  = axisRadius * Math.cos(ang);
                        const ay  = axisRadius * Math.sin(ang);
                        const du  = u - ax;
                        const dv  = v - ay;
                        D += rW * (du * du + dv * dv) * 0.5;
                    }
                }

                if (noiseWeight > 0) {
                    D += noiseWeight * fbm(u * noiseScale, v * noiseScale, noiseOctaves);
                }

                const Dnm = D * OPD_SCALE;
                let sR, sG, sB;

                if (spectralMode === 'Physical') {
                    let X = 0, Y = 0, Z = 0;
                    for (let k = 0; k < 31; k++) {
                        const lam = 400 + k * 10;
                        const s   = Math.sin(PI * Dnm / lam);
                        const Ik  = s * s;
                        X += Ik * XB[k];
                        Y += Ik * YB[k];
                        Z += Ik * ZB[k];
                    }
                    X /= YN; Y /= YN; Z /= YN;

                    let lr = X *  3.2406 + Y * -1.5372 + Z * -0.4986;
                    let lg = X * -0.9689 + Y *  1.8758 + Z *  0.0415;
                    let lb = X *  0.0557 + Y * -0.2040 + Z *  1.0570;

                    if (satBoost !== 1) {
                        const lum = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
                        lr = lum + (lr - lum) * satBoost;
                        lg = lum + (lg - lum) * satBoost;
                        lb = lum + (lb - lum) * satBoost;
                    }

                    sR = toSrgb(lr, exposure, gamma);
                    sG = toSrgb(lg, exposure, gamma);
                    sB = toSrgb(lb, exposure, gamma);
                } else {
                    const s550 = Math.sin(PI * Dnm / 550);
                    const brt  = Math.min(1, s550 * s550 * exposure);
                    const hue  = ((Dnm / 550) % 1 + 1) % 1;
                    const h6   = hue * 6;
                    const hi   = Math.floor(h6) % 6;
                    const f    = h6 - Math.floor(h6);
                    const q_   = brt * (1 - f);
                    const t_   = brt * f;
                    let rr, gg, bb;
                    switch (hi) {
                        case 0: rr = brt; gg = t_;  bb = 0;   break;
                        case 1: rr = q_;  gg = brt; bb = 0;   break;
                        case 2: rr = 0;   gg = brt; bb = t_;  break;
                        case 3: rr = 0;   gg = q_;  bb = brt; break;
                        case 4: rr = t_;  gg = 0;   bb = brt; break;
                        default: rr = brt; gg = 0;  bb = q_;  break;
                    }
                    sR = Math.min(255, Math.round(rr * 255));
                    sG = Math.min(255, Math.round(gg * 255));
                    sB = Math.min(255, Math.round(bb * 255));
                }

                const alpha = Math.max(sR, sG, sB) / 255;
                const i4    = (py * W + px) * 4;
                data[i4]     = Math.round(bgR * (1 - alpha) + sR * alpha);
                data[i4 + 1] = Math.round(bgG * (1 - alpha) + sG * alpha);
                data[i4 + 2] = Math.round(bgB * (1 - alpha) + sB * alpha);
                data[i4 + 3] = 255;
            }
        }

        return imageData;
    }
};
