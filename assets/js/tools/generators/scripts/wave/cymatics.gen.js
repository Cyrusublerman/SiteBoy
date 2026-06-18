/**
 * Cymatics Script - Wave interference patterns with musical frequencies
 *
 * @script cymatics
 * @category wave
 * @version 1.0.1
 */

import '../../../../shared/algorithms/core/math-utils.js';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const TWO_PI = Math.PI * 2;

const CHORDS = {
    maj:  [0, 4, 7],
    min:  [0, 3, 7],
    dim:  [0, 3, 6],
    aug:  [0, 4, 8],
    maj7: [0, 4, 7, 11],
    min7: [0, 3, 7, 10],
    dom7: [0, 4, 7, 10],
    sus4: [0, 5, 7]
};

const ROOT_NOTES = {
    'C4': 262,
    'D4': 294,
    'E4': 330,
    'F4': 349,
    'G4': 392,
    'A4': 440,
    'B4': 494
};

const TEMPLATES = {
    triangle: (W, H) => [[W / 2, H / 4], [W / 4, 3 * H / 4], [3 * W / 4, 3 * H / 4]],
    circle6: (W, H) => {
        const cx = W / 2, cy = H / 2;
        return Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * TWO_PI;
            return [cx + Math.cos(a) * (W * 0.3), cy + Math.sin(a) * (H * 0.3)];
        });
    },
    circle12: (W, H) => {
        const cx = W / 2, cy = H / 2;
        return Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * TWO_PI;
            return [cx + Math.cos(a) * (W * 0.35), cy + Math.sin(a) * (H * 0.35)];
        });
    },
    grid3: (W, H) => {
        const p = [];
        for (let i = 1; i <= 3; i++) for (let j = 1; j <= 3; j++) p.push([(W / 4) * i, (H / 4) * j]);
        return p;
    },
    grid4: (W, H) => {
        const p = [];
        for (let i = 1; i <= 4; i++) for (let j = 1; j <= 4; j++) p.push([(W / 5) * i, (H / 5) * j]);
        return p;
    },
    star5: (W, H) => {
        const cx = W / 2, cy = H / 2;
        return Array.from({ length: 5 }, (_, i) => {
            const a = (i / 5) * TWO_PI - Math.PI / 2;
            return [cx + Math.cos(a) * (W * 0.3), cy + Math.sin(a) * (H * 0.3)];
        });
    },
    corners: (W, H) => {
        const m = W * 0.15;
        return [[m, m], [W - m, m], [m, H - m], [W - m, H - m]];
    },
    cross: (W, H) => {
        const cx = W / 2, cy = H / 2;
        return [[cx, H * 0.15], [cx, H * 0.85], [W * 0.15, cy], [W * 0.85, cy], [cx, cy]];
    }
};

// ═══════════════════════════════════════════════════════════════════
// GLYPH RENDERING
// ═══════════════════════════════════════════════════════════════════

const GLYPH_RENDERERS = {
    dot: (ctx, x, y, size) => {
        ctx.beginPath();
        ctx.arc(Math.floor(x), Math.floor(y), size / 2, 0, TWO_PI);
        ctx.fill();
    },
    square: (ctx, x, y, size) => {
        const h = size / 2;
        ctx.fillRect(Math.floor(x - h), Math.floor(y - h), size, size);
    },
    cross: (ctx, x, y, size) => {
        const h = size / 2, q = size / 4;
        ctx.fillRect(Math.floor(x - q), Math.floor(y - h), q * 2, size);
        ctx.fillRect(Math.floor(x - h), Math.floor(y - q), size, q * 2);
    },
    diamond: (ctx, x, y, size) => {
        const h = size / 2;
        ctx.beginPath();
        ctx.moveTo(Math.floor(x), Math.floor(y - h));
        ctx.lineTo(Math.floor(x + h), Math.floor(y));
        ctx.lineTo(Math.floor(x), Math.floor(y + h));
        ctx.lineTo(Math.floor(x - h), Math.floor(y));
        ctx.closePath();
        ctx.fill();
    }
};

// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════

let sources = [];
let particles = [];
let t = 0;
let _lastTemplate = null;
let _lastChordType = null;
let _lastParticleSpacing = null;
// CYM-02: manual source positions state
let _lastSourceMode = null;
let _manualSources = null; // null = use template-derived sources

// Distance caches: constant for fixed source positions; rebuilt only on template/chord/spacing change.
// _pixelDistCache[s] = Float32Array(W*H): Euclidean distance from source s to each canvas pixel.
// _partDistCache[s]  = { dists, ndx, ndy: Float32Array(N) }: distance and unit-vector components
//                      from source s to each particle rest position.
let _pixelDistCache = null;
let _partDistCache  = null;
let _cacheW = 0;
let _cacheH = 0;
let _offscreenCanvas = null;
let _offscreenCtx = null;

function ensureOffscreen(W, H) {
    if (!_offscreenCanvas || _offscreenCanvas.width !== W || _offscreenCanvas.height !== H) {
        if (typeof OffscreenCanvas === 'undefined') {
            throw new Error('Cymatics: OffscreenCanvas required for offscreen 2D buffer');
        }
        _offscreenCanvas = new OffscreenCanvas(W, H);
        _offscreenCtx = _offscreenCanvas.getContext('2d', { alpha: false });
    }
    return _offscreenCtx;
}

// ═══════════════════════════════════════════════════════════════════
// WAVE SOURCE
// ═══════════════════════════════════════════════════════════════════

class WaveSource {
    constructor(x, y, semitone, amplitude, baseFreq) {
        this.x        = x;
        this.y        = y;
        this.semitone = semitone;
        this.amp      = amplitude;
        this.baseFreq = baseFreq;
        this.noteFreq = baseFreq * Math.pow(2, semitone / 12);
        this.freq     = this.noteFreq / 10;
    }

    getWave(px, py, time) {
        const dx   = px - this.x;
        const dy   = py - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        return this.amp * Math.sin(TWO_PI * (dist / this.freq - time));
    }

    getDisplacement(px, py, time) {
        const dx   = px - this.x;
        const dy   = py - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const wave = this.getWave(px, py, time);
        return { x: (dx / dist) * wave, y: (dy / dist) * wave };
    }
}

// ═══════════════════════════════════════════════════════════════════
// INITIALISATION
// ═══════════════════════════════════════════════════════════════════

function initParticles(W, H, spacing) {
    particles = [];
    for (let y = 0; y < H; y += spacing) {
        for (let x = 0; x < W; x += spacing) {
            particles.push({ x, y, ox: x, oy: y });
        }
    }
}

function setupSources(template, chordType, W, H, baseFreq, amp) {
    const positions = (TEMPLATES[template] || TEMPLATES.triangle)(W, H);
    const intervals = CHORDS[chordType] || CHORDS.maj;
    sources = positions.map((pos, i) => {
        const semitone = intervals[i % intervals.length];
        return new WaveSource(pos[0], pos[1], semitone, amp, baseFreq);
    });
}

// Precomputes Euclidean distance from each source to every pixel.
// Called once after setupSources. Eliminates per-frame sqrt in density/radial inner loops.
function buildPixelDistCache(W, H) {
    _pixelDistCache = sources.map(src => {
        const dists = new Float32Array(W * H);
        let idx = 0;
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                const dx = x - src.x;
                const dy = y - src.y;
                dists[idx++] = Math.sqrt(dx * dx + dy * dy) || 1;
            }
        }
        return dists;
    });
    _cacheW = W;
    _cacheH = H;
}

// Precomputes distance and unit-vector components from each source to each particle rest position.
// Called once after initParticles. Eliminates per-frame sqrt in particle displacement inner loop.
function buildParticleDistCache() {
    const N = particles.length;
    _partDistCache = sources.map(src => {
        const dists = new Float32Array(N);
        const ndx   = new Float32Array(N);
        const ndy   = new Float32Array(N);
        for (let i = 0; i < N; i++) {
            const p    = particles[i];
            const dx   = p.ox - src.x;
            const dy   = p.oy - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            dists[i]   = dist;
            ndx[i]     = dx / dist;
            ndy[i]     = dy / dist;
        }
        return { dists, ndx, ndy };
    });
}

// ═══════════════════════════════════════════════════════════════════
// DRAWING MODES
// ═══════════════════════════════════════════════════════════════════

// CYM-03: parse hex colour to r,g,b components for alpha compositing
function _hexToRGB(hex) {
    const h = (hex || '#c0c0c0').replace('#', '');
    const n = parseInt(h.length === 3
        ? h.split('').map(c => c + c).join('')
        : h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function drawParticle(ctx, W, H, params) {
    // CYM-03: particle appearance params
    const glyph    = params.particleGlyph || 'dot';
    const size     = params.particleSize  || 2;
    const colourway = params.colourway || [];
    const bgEntry  = colourway.find(c => c.id === 'background');
    const fgEntry  = colourway.find(c => c.id === 'particle');
    const bgColour = bgEntry ? bgEntry.colour : '#000000';
    const fgRGB    = _hexToRGB(fgEntry ? fgEntry.colour : '#c0c0c0');
    const renderGlyph = GLYPH_RENDERERS[glyph] || GLYPH_RENDERERS.dot;

    // Update displaced positions using precomputed unit-vector cache (no per-call sqrt).
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        let dx = 0, dy = 0;
        for (let j = 0; j < sources.length; j++) {
            const c    = _partDistCache[j];
            const wave = sources[j].amp * Math.sin(TWO_PI * (c.dists[i] / sources[j].freq - t));
            dx += c.ndx[i] * wave;
            dy += c.ndy[i] * wave;
        }
        p.x = p.ox + dx;
        p.y = p.oy + dy;
    }

    ctx.fillStyle = bgColour;
    ctx.fillRect(0, 0, W, H);

    const NUM_BUCKETS  = 20;
    const alphaBuckets = Array.from({ length: NUM_BUCKETS }, () => []);

    for (let i = 0; i < particles.length; i++) {
        const p    = particles[i];
        const ddx  = p.x - p.ox;
        const ddy  = p.y - p.oy;
        const disp = Math.sqrt(ddx * ddx + ddy * ddy);
        const alpha = Math.min(disp * 0.15, 1);
        if (alpha > 0.05) {
            const bucketIdx = Math.min(NUM_BUCKETS - 1, Math.floor((alpha - 0.05) / 0.95 * NUM_BUCKETS));
            alphaBuckets[bucketIdx].push(p);
        }
    }

    for (let b = 0; b < NUM_BUCKETS; b++) {
        const bucket = alphaBuckets[b];
        if (bucket.length === 0) continue;
        const bucketAlpha = 0.05 + (b + 0.5) / NUM_BUCKETS * 0.95;
        ctx.fillStyle = `rgba(${fgRGB.r},${fgRGB.g},${fgRGB.b},${bucketAlpha.toFixed(2)})`;
        for (let i = 0; i < bucket.length; i++) {
            renderGlyph(ctx, bucket[i].x, bucket[i].y, size);
        }
    }
}

function drawDensity(ctx, W, H, boost, params) {
    const colourway = params.colourway || [];
    const bgEntry   = colourway.find(c => c.id === 'background');
    const fgEntry   = colourway.find(c => c.id === 'particle');
    const bgRGB     = _hexToRGB(bgEntry ? bgEntry.colour : '#000000');
    const fgRGB     = _hexToRGB(fgEntry ? fgEntry.colour : '#c0c0c0');

    if (sources.length === 0) {
        ctx.fillStyle = bgEntry ? bgEntry.colour : '#000000';
        ctx.fillRect(0, 0, W, H);
        return;
    }

    const total      = W * H;
    const renderCtx  = ensureOffscreen(W, H) || ctx;
    const imageData  = renderCtx.createImageData(W, H);
    const data       = imageData.data;
    const intensities = new Float32Array(total);
    const invBoost   = 1 / boost;

    for (let s = 0; s < sources.length; s++) {
        const srcDists    = _pixelDistCache[s];
        const scale       = TWO_PI / sources[s].freq;
        const amp         = sources[s].amp;
        const phaseOffset = -TWO_PI * t;
        for (let idx = 0; idx < total; idx++) {
            intensities[idx] += Math.abs(amp * Math.sin(scale * srcDists[idx] + phaseOffset));
        }
    }

    let minI = Infinity, maxI = -Infinity;
    for (let idx = 0; idx < total; idx++) {
        if (intensities[idx] < minI) minI = intensities[idx];
        if (intensities[idx] > maxI) maxI = intensities[idx];
    }

    const range = maxI - minI || 1;
    // CYM-04: lerp between bg and fg colours based on normalised intensity
    for (let i = 0; i < total; i++) {
        const n   = Math.pow((intensities[i] - minI) / range, invBoost);
        const px  = i * 4;
        data[px]     = Math.round(bgRGB.r + (fgRGB.r - bgRGB.r) * n);
        data[px + 1] = Math.round(bgRGB.g + (fgRGB.g - bgRGB.g) * n);
        data[px + 2] = Math.round(bgRGB.b + (fgRGB.b - bgRGB.b) * n);
        data[px + 3] = 255;
    }

    renderCtx.putImageData(imageData, 0, 0);
    if (renderCtx !== ctx && _offscreenCanvas) {
        ctx.drawImage(_offscreenCanvas, 0, 0);
    }
}

function drawRadial(ctx, W, H, boost, params) {
    const colourway = params.colourway || [];
    const bgEntry   = colourway.find(c => c.id === 'background');
    const fgEntry   = colourway.find(c => c.id === 'particle');
    const bgColour  = bgEntry ? bgEntry.colour : '#000000';
    const fgRGB     = _hexToRGB(fgEntry ? fgEntry.colour : '#c0c0c0');
    const size      = params.particleSize || 2;
    const glyph     = params.particleGlyph || 'dot';
    const renderGlyph = GLYPH_RENDERERS[glyph] || GLYPH_RENDERERS.dot;

    if (sources.length === 0) {
        ctx.fillStyle = bgColour;
        ctx.fillRect(0, 0, W, H);
        return;
    }

    const renderCtx = ensureOffscreen(W, H) || ctx;
    renderCtx.fillStyle = bgColour;
    renderCtx.fillRect(0, 0, W, H);

    const res      = Math.max(1, size | 0);
    const invBoost = 1 / boost;
    let minI = Infinity, maxI = -Infinity;
    const points = [];

    for (let y = 0; y < H; y += res) {
        for (let x = 0; x < W; x += res) {
            let total    = 0;
            const pixIdx = y * W + x;
            for (let s = 0; s < sources.length; s++) {
                const scale       = TWO_PI / sources[s].freq;
                const phaseOffset = -TWO_PI * t;
                total += Math.abs(sources[s].amp * Math.sin(scale * _pixelDistCache[s][pixIdx] + phaseOffset));
            }
            points.push({ x, y, intensity: total });
            if (total < minI) minI = total;
            if (total > maxI) maxI = total;
        }
    }

    const range = maxI - minI || 1;
    // CYM-04: use particle colour and glyph for radial dots
    for (let i = 0; i < points.length; i++) {
        const p          = points[i];
        const normalized = Math.pow((p.intensity - minI) / range, invBoost);
        if (normalized > 0.05) {
            renderCtx.fillStyle = `rgba(${fgRGB.r},${fgRGB.g},${fgRGB.b},${normalized.toFixed(2)})`;
            renderGlyph(renderCtx, p.x, p.y, size);
        }
    }

    if (renderCtx !== ctx && _offscreenCanvas) {
        ctx.drawImage(_offscreenCanvas, 0, 0);
    }
}

// ═══════════════════════════════════════════════════════════════════
// SCRIPT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export const SCRIPT_CONFIG = {
    id:          'cymatics',
    title:       'Cymatics',
    category:    'wave',
    description: 'Wave interference patterns with musical frequencies. Simulates Chladni plate vibration patterns using multiple wave sources with harmonic frequency relationships.',
    version:     '1.0.1',

    // Tier 2 adaptive resolution: 50% linear scale (25% pixel count) during slider interaction.
    compute: {
        cost:             'per-pixel',
        interactionScale: 0.5,
        idleDelay:        200,
        worker:           true,
    },

    canvas: {
        width:      512,
        height:     512,
        context:    '2d',
        background: '#000000',
        // CYM-04: colourway layers — background and particle foreground
        colourway: [
            { id: 'background', label: 'Background', colour: '#000000', kind: 'fill'   },
            { id: 'particle',   label: 'Particle',   colour: '#c0c0c0', kind: 'stroke', lineWidth: 1 }
        ]
    },

    animation: {
        type:            'infinite',
        defaultFps:      60,
        canPrerender:    true,   // t = frame × speed: fully deterministic, no Date.now() dependency.
        animatableParams: ['amplitude', 'speed', 'boost'],
        sequencer: true,
    },

    export: {
        png:      true,
        gif:      false,
        webm:     true,
        sequence: true
    },

    // CYM-02: emitter handles — active when sourceMode === 'manual'; up to 8 sources.
    overlay: {
        emitterHandles: {
            enabled: true,
            activateWhen: { param: 'sourceMode', value: 'manual' },
            handles: Array.from({ length: 8 }, (_, i) => ({
                id:     `s${i + 1}`,
                xParam: `s${i + 1}X`,
                yParam: `s${i + 1}Y`,
                label:  `${i + 1}`
            })),
            sourceCountParam: 'manualSourceCount'
        }
    },

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Cymatics models two-dimensional wave interference on a 512x512 canvas using multiple point sources, each emitting a circular wave at a frequency derived from musical pitch relationships. The mathematical basis is the superposition principle: at any canvas point (x, y) at time t, the total wave displacement is the sum of contributions from all active sources, where each source s at position (sx, sy) contributes amp x sin(2pi x (dist(x,y,s) / freq_s - t)). The spatial frequency freq_s is derived from the source pitch via equal temperament (noteFreq = baseFreq x 2^(semitone/12)), divided by 10 to produce a wavelength appropriate for the canvas scale. Sources are placed geometrically according to one of eight spatial templates (triangle, circle6, circle12, grid3, grid4, star5, corners, cross), with each source assigned a semitone offset from the root note according to a musical chord type (major, minor, diminished, augmented, major 7th, minor 7th, dominant 7th, suspended 4th). This maps musical interval relationships directly to spatial frequency ratios between sources, creating interference patterns analogous to Chladni plate resonance modes — regions of constructive and destructive interference that depend on both geometric arrangement and frequency ratios. The generator offers three visualisation modes. Particle mode tracks a uniform grid of probe points, computes the net radial displacement at each rest position from all wave sources, and renders each displaced particle as a 2x2 pixel rect batched by alpha into 20 opacity buckets. Density mode computes per-pixel total wave intensity, normalises across the canvas, applies a gamma curve (normalised^(1/boost)), and writes the result as greyscale via ImageData. Radial mode samples at a 2-pixel grid, computes intensity per sample, and draws filled circles at positions exceeding a 0.05 intensity threshold. Visually, the output ranges from a flowing field of displaced particles to a high-contrast greyscale interference map to a dot-matrix rendering of wave intensity. The spatial patterns animate continuously at 60fps, driven by t = frame x speed. Algorithm origin: Chladni figure simulation (Ernst Chladni, 1787); equal-temperament frequency mapping (12-tone equal temperament, standard since 1917); wave superposition (classical physics). The visualisation techniques are bespoke. Scope: Cymatics does not model wave reflection, absorption, or damping. Waves propagate infinitely and uniformly. It does not produce audio output. Source positions are determined entirely by template geometry; interactive placement is not implemented.'
        },
        {
            heading: 'ALGORITHM',
            body: 'Equal temperament pitch: noteFreq_s = baseFreq x 2^(semitone_s / 12), where baseFreq is the root frequency in Hz (C4=262, D4=294, E4=330, F4=349, G4=392, A4=440, B4=494) and semitone_s is the chord interval assigned to source s. Spatial frequency: freq_s = noteFreq_s / 10, mapping audible frequencies 262-494 Hz to pixel wavelengths of 26-49 pixels on a 512px canvas. Scalar wave at point: wave_s(x,y,t) = amp x sin(2pi x (dist(x,y,s) / freq_s - t)), where dist = sqrt((x-sx)^2 + (y-sy)^2) clamped to 1 minimum, amp is from params.amplitude, and t = frame x speed. Superposition for density and radial modes: total(x,y,t) = sum_s |wave_s(x,y,t)|. Normalisation: normalised = (total - min) / (max - min), where min and max are the per-frame global extrema. Gamma correction: gamma_corrected = normalised^(1/boost). Pixel value in density mode: grey = floor(gamma_corrected x 255) written as R=G=B=grey in ImageData. Radial displacement for particle mode: displacement_s = {x: (ox-sx)/dist x wave_s, y: (oy-sy)/dist x wave_s}; particle position = (ox + sum_s displacement_s.x, oy + sum_s displacement_s.y). Particle alpha: alpha = min(disp x 0.15, 1) where disp = sqrt of displacement magnitude; threshold 0.05; 20 buckets indexed as floor((alpha-0.05)/0.95 x 20). Time: t = frame x speed, deterministic with respect to frame number. State variables: sources (WaveSource array), particles ({x,y,ox,oy} array), t (time accumulator), _lastTemplate, _lastChordType, _lastParticleSpacing (change-detection trackers). WaveSource fields: x, y (canvas position), semitone (chord interval offset), amp, baseFreq, noteFreq, freq. Functions: WaveSource.constructor creates a source from position, semitone, amplitude, and baseFreq at O(1); WaveSource.getWave evaluates the scalar wave contribution at a point at O(1); WaveSource.getDisplacement returns the radial displacement vector at a point at O(1); initParticles creates a uniform grid of particle probes at O((W/spacing)^2); setupSources gets template positions, assigns chord semitones cycling, and constructs WaveSource objects at O(N_positions); buildPixelDistCache precomputes source-to-pixel Euclidean distances into a Float32Array per source at O(N_sources x W x H) — called once after setupSources, eliminates per-frame sqrt in density and radial inner loops; buildParticleDistCache precomputes source-to-particle distances and unit-vector components into Float32Arrays per source at O(N_sources x N_particles) — called once after initParticles, eliminates per-frame sqrt in particle displacement loop; drawParticle updates particle positions via cached unit-vector displacement and batches rendering into 20 alpha buckets at O(N_particles x N_sources); drawDensity computes per-pixel intensity using the pixel distance cache and writes normalised gamma-corrected greyscale ImageData at O(W x H x N_sources); drawRadial samples at 2px intervals using the pixel distance cache and draws filled arcs at positions above threshold at O((W/2) x (H/2) x N_sources) plus O(N_bright) arc draw calls; draw is the main render hook — performs lazy init with change detection, sets t, updates live source parameters, dispatches to the selected vizMode function, and draws source position markers. Render loop order: (1) detect template/chord/spacing change and rebuild sources, particles, and distance caches as needed; (2) t = frame x speed; (3) update amp, baseFreq, noteFreq, freq on all sources from current params; (4) dispatch to drawParticle, drawDensity, or drawRadial; (5) draw 4px white source markers if showSources. Live parameters (take effect immediately): rootNote, amplitude, speed, boost, vizMode, showSources. Rebuild parameters (trigger source or particle reinitialisation): template, chordType, particleSpacing.'
        },
        {
            heading: 'PARAMETERS',
            body: 'vizMode (Display, radio, default Particle): selects the rendering mode. Particle displaces a uniform probe grid and draws 2x2 rects batched by alpha. Density computes per-pixel intensity as greyscale ImageData. Radial samples at 2px intervals and draws filled circles at bright points. Applies live. showSources (Show Sources, toggle, default true): when true, draws a 4px white filled circle at each wave source position on top of the canvas output. Applies live. rootNote (Root Note, dropdown, default A4): sets the base frequency for all sources. Options: C4=262Hz, D4=294Hz, E4=330Hz, F4=349Hz, G4=392Hz, A4=440Hz, B4=494Hz. Applied live each frame by updating each source baseFreq, noteFreq, and freq. chordType (Chord Type, dropdown, default maj): sets the semitone interval array cycled when assigning intervals to sources. Options: maj [0,4,7], min [0,3,7], dim [0,3,6], aug [0,4,8], maj7 [0,4,7,11], min7 [0,3,7,10], dom7 [0,4,7,10], sus4 [0,5,7]. Triggers a full source rebuild and cache rebuild on change. template (Layout, dropdown, default triangle): sets the geometric arrangement and count of wave sources. Options and source counts: triangle=3, circle6=6, circle12=12, grid3=9, grid4=16, star5=5, corners=4, cross=5. Source count scales computation directly — grid4 is approximately 5x the density-mode cost of triangle. Triggers a full source, particle, and cache rebuild on change. amplitude (Amplitude, slider, min 1, max 10, step 0.5, default 3): wave amplitude applied to all sources; directly scales wave_s = amp x sin(...). Higher values increase particle displacement magnitude and pixel brightness in all modes. Applied live. speed (Speed, slider, min 0.01, max 0.2, step 0.01, default 0.08): rate of time accumulation; t = frame x speed. Higher speed advances the wave phase more rapidly per frame, making patterns appear to rotate faster. Applied live. boost (Contrast, slider, min 1, max 10, step 0.5, default 3): gamma correction exponent; normalised^(1/boost). Only affects density and radial modes. At boost=1, mapping is linear; above 1, mid-tones are brightened. Has no effect in particle mode. Applied live. particleSpacing (Particle Density, slider, min 2, max 10, step 1, default 5): spacing in pixels between particle probes in the uniform grid. At 5 on 512x512: approximately 10,486 particles. At 2: approximately 65,536 particles. Only visually affects particle mode. Triggers a particle rebuild and particle-cache rebuild on change.'
        },
        {
            heading: 'PRESETS',
            body: 'Default: triangle template (3 sources) at A4 major intervals in particle mode. Amplitude 3, speed 0.08, contrast 3, spacing 5, sources visible. Baseline state showing a flowing particle displacement field analogous to Chladni sand patterns on a vibrating plate at moderate source density. Density Field: circle6 template (6 sources) at C4 minor-7th intervals in density mode. Amplitude 4, speed 0.05, contrast 4, sources hidden. Full-canvas greyscale interference map with slow animation and enhanced gamma correction revealing mid-tone band structure. Grid Pattern: grid3 template (9 sources) at G4 major-7th intervals in particle mode. Amplitude 2, speed 0.1, contrast 3, spacing 4, sources visible. Denser particle grid with faster animation and complex 9-source interference geometry producing richer nodal structure than the default triangle.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Density mode complexity: O(W x H x N_sources) per frame. At 512x512 with grid4 (16 sources): approximately 4.19 million wave evaluations per frame — estimated 168 to 336ms, far exceeding the 16.7ms budget. Expected frame rate at this extreme: 3 to 6fps. At triangle (3 sources): approximately 786,432 evaluations, estimated 47ms, approximately 20fps. Particle mode: O(N_particles x N_sources). At spacing=5 with triangle (3 sources): approximately 31,458 evaluations, well within budget. At spacing=2 with grid4: approximately 1.05M evaluations, estimated 63ms, approximately 16fps. Radial mode: O((W/2) x (H/2) x N_sources) plus O(N_bright) arc draw calls. Distance precomputation applied: source-to-pixel and source-to-particle distances are constant after source setup. Per-frame sqrt calls are eliminated by precomputing into Float32Arrays per source (buildPixelDistCache, buildParticleDistCache). The hot inner loop is reduced from O(N x sqrt x sin) to O(N x sin), approximately halving computation. Cache is rebuilt only on template, chordType, or particleSpacing change. Memory: pixel distance cache at grid4 and 512x512 is approximately 16MB; particle distance cache at grid4 and spacing=2 is approximately 12MB. Compute tier 2 active: canvas resolution reduced to 50% linear (25% pixel count) during slider interaction, restoring to full resolution after 200ms idle (compute.interactionScale=0.5, compute.idleDelay=200). Primary recommendation: use triangle or circle6 in density mode for near-budget performance. Use grid4 only in particle mode with spacing of 5 or greater.'
        },
        {
            heading: 'ANIMATION',
            body: 'Type: infinite. No defined loop length or natural loop point. Time accumulation: t = frame x speed, where frame is an integer counter supplied by the host and speed is the Speed parameter (range 0.01 to 0.2, default 0.08). The animation is fully deterministic: the same frame number and the same parameters always produce identical pixel output. No Date.now() or Math.random() dependency. Source positions are fixed after template setup; only the wave phase advances each frame. At default speed 0.08 and 60fps, the phase advances 4.8 radians per second. PNG snapshot export is always available. WebM continuous export is supported given full determinism. GIF export is not supported because no loopFrames is defined and a natural loop point does not exist for the general case.'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'Performance: Density mode with high source-count templates (grid4, circle12) runs significantly below 60fps — expected 3 to 6fps at 512x512 for grid4. Use particle mode or triangle, circle6 templates for real-time animation. Parameter scope: the Contrast (boost) parameter has no effect in particle mode — it applies only to density and radial modes; moving the slider in particle mode produces no visible change. Not yet implemented: click-to-add wave sources at an arbitrary canvas position (original concept feature); Web Audio oscillator playback at each source frequency; per-source semitone selection override; radial mode resolution control (currently hardcoded to 2px sampling intervals). Template note: the original specification included a star8 template; the live implementation provides cross instead. GIF export not available: the animation has no defined loop length, so a cleanly-looping GIF cannot be pre-rendered. Canvas size is fixed at 512x512 and is not user-adjustable.'
        },
        {
            heading: 'REFERENCES',
            body: 'Chladni figure simulation: Ernst Chladni, 1787. Equal-temperament frequency mapping: 12-tone equal temperament, standard since 1917. Wave superposition: classical physics. Visualisation techniques (alpha-bucket batching, ImageData greyscale, radial arc rendering) are bespoke.'
        }
    ],

    presets: [
        {
            name: 'Default',
            values: {
                vizMode:        'Particle',
                rootNote:       'A4',
                chordType:      'maj',
                template:       'triangle',
                amplitude:      3,
                speed:          0.08,
                boost:          3,
                particleSpacing: 5,
                showSources:    true
            }
        },
        {
            name: 'Density Field',
            values: {
                vizMode:        'Density',
                rootNote:       'C4',
                chordType:      'min7',
                template:       'circle6',
                amplitude:      4,
                speed:          0.05,
                boost:          4,
                particleSpacing: 5,
                showSources:    false
            }
        },
        {
            name: 'Grid Pattern',
            values: {
                vizMode:        'Particle',
                rootNote:       'G4',
                chordType:      'maj7',
                template:       'grid3',
                amplitude:      2,
                speed:          0.1,
                boost:          3,
                particleSpacing: 4,
                showSources:    true
            }
        }
    ],

    parameters: [
        {
            group: 'Visualization',
            params: [
                { key: 'vizMode',     type: 'radio',   label: 'Display',
                  options: ['Particle', 'Density', 'Radial'], default: 'Particle' },
                // CYM-06: showSources controls both overlay handle visibility and orbit-mode markers
                { key: 'showSources', type: 'toggle',  label: 'Show Sources',   default: true }
            ]
        },
        // CYM-03: particle appearance controls
        {
            group: 'Particle',
            params: [
                { key: 'particleGlyph', type: 'select', label: 'Glyph',
                  options: [
                    { value: 'dot',     label: 'Dot' },
                    { value: 'square',  label: 'Square' },
                    { value: 'cross',   label: 'Cross' },
                    { value: 'diamond', label: 'Diamond' }
                  ], default: 'dot' },
                { key: 'particleSize', type: 'slider', label: 'Size',
                  min: 1, max: 12, step: 0.5, default: 2, precision: 1 },
                { key: 'particleSpacing', type: 'slider', label: 'Grid Spacing',
                  min: 2, max: 10, step: 1, default: 5 }
            ]
        },
        {
            group: 'Frequency',
            params: [
                { key: 'rootNote',  type: 'dropdown', label: 'Root Note',
                  options: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'], default: 'A4' },
                { key: 'chordType', type: 'dropdown', label: 'Chord Type',
                  options: ['maj', 'min', 'dim', 'aug', 'maj7', 'min7', 'dom7', 'sus4'], default: 'maj' }
            ]
        },
        {
            group: 'Pattern',
            params: [
                { key: 'template', type: 'dropdown', label: 'Layout',
                  options: ['triangle', 'circle6', 'circle12', 'grid3', 'grid4', 'star5', 'corners', 'cross'],
                  default: 'triangle' }
            ]
        },
        // CYM-02: manual source positions
        {
            group: 'Sources — Manual',
            defaultCollapsed: true,
            params: [
                { key: 'sourceMode', type: 'select', label: 'Source Mode',
                  options: [
                    { value: 'template', label: 'Template (auto)' },
                    { value: 'manual',   label: 'Manual (drag)' }
                  ], default: 'template' },
                { key: 'manualSourceCount', type: 'slider', label: 'Source Count',
                  min: 1, max: 8, step: 1, default: 3 },
                ...Array.from({ length: 8 }, (_, i) => ([
                    { key: `s${i+1}X`, type: 'slider', label: `S${i+1} X`, min: 0, max: 1, step: 0.01, default: 0.5, precision: 2 },
                    { key: `s${i+1}Y`, type: 'slider', label: `S${i+1} Y`, min: 0, max: 1, step: 0.01, default: 0.5, precision: 2 }
                ])).flat()
            ]
        },
        {
            group: 'Wave Parameters',
            params: [
                { key: 'amplitude', type: 'slider', label: 'Amplitude',
                  min: 1, max: 10, step: 0.5, default: 3, precision: 1 },
                { key: 'speed',     type: 'slider', label: 'Speed',
                  min: 0.01, max: 0.2, step: 0.01, default: 0.08, precision: 2 },
                { key: 'boost',     type: 'slider', label: 'Contrast',
                  min: 1, max: 10, step: 0.5, default: 3, precision: 1 }
            ]
        }
    ],

    computePixels: function(imageData, params, frame) {
        const W = imageData.width;
        const H = imageData.height;
        const data = imageData.data;

        const TWO_PI_LOCAL = Math.PI * 2;
        const CHORDS_LOCAL = {
            maj:  [0, 4, 7], min:  [0, 3, 7], dim:  [0, 3, 6], aug:  [0, 4, 8],
            maj7: [0, 4, 7, 11], min7: [0, 3, 7, 10], dom7: [0, 4, 7, 10], sus4: [0, 5, 7]
        };
        const ROOT_NOTES_LOCAL = { C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, B4: 494 };
        const TEMPLATES_LOCAL = {
            triangle: (w, h) => [[w / 2, h / 4], [w / 4, 3 * h / 4], [3 * w / 4, 3 * h / 4]],
            circle6: (w, h) => Array.from({ length: 6 }, (_, i) => {
                const a = (i / 6) * TWO_PI_LOCAL;
                return [w / 2 + Math.cos(a) * (w * 0.3), h / 2 + Math.sin(a) * (h * 0.3)];
            }),
            circle12: (w, h) => Array.from({ length: 12 }, (_, i) => {
                const a = (i / 12) * TWO_PI_LOCAL;
                return [w / 2 + Math.cos(a) * (w * 0.35), h / 2 + Math.sin(a) * (h * 0.35)];
            }),
            grid3: (w, h) => {
                const p = [];
                for (let i = 1; i <= 3; i++) for (let j = 1; j <= 3; j++) p.push([(w / 4) * i, (h / 4) * j]);
                return p;
            },
            grid4: (w, h) => {
                const p = [];
                for (let i = 1; i <= 4; i++) for (let j = 1; j <= 4; j++) p.push([(w / 5) * i, (h / 5) * j]);
                return p;
            },
            star5: (w, h) => Array.from({ length: 5 }, (_, i) => {
                const a = (i / 5) * TWO_PI_LOCAL - Math.PI / 2;
                return [w / 2 + Math.cos(a) * (w * 0.3), h / 2 + Math.sin(a) * (h * 0.3)];
            }),
            corners: (w, h) => {
                const m = w * 0.15;
                return [[m, m], [w - m, m], [m, h - m], [w - m, h - m]];
            },
            cross: (w, h) => [[w / 2, h * 0.15], [w / 2, h * 0.85], [w * 0.15, h / 2], [w * 0.85, h / 2], [w / 2, h / 2]]
        };

        const baseFreq = ROOT_NOTES_LOCAL[params.rootNote] || 440;
        const intervals = CHORDS_LOCAL[params.chordType] || CHORDS_LOCAL.maj;
        const positions = (TEMPLATES_LOCAL[params.template] || TEMPLATES_LOCAL.triangle)(W, H);
        const amp = params.amplitude || 3;
        const speed = params.speed || 0.08;
        const tLocal = frame * speed;
        const boost = params.boost || 3;
        const vizMode = (params.vizMode || 'Density').toLowerCase();
        const sourcesLocal = positions.map((pos, i) => {
            const semitone = intervals[i % intervals.length];
            const noteFreq = baseFreq * Math.pow(2, semitone / 12);
            return { x: pos[0], y: pos[1], freq: noteFreq / 10, amp };
        });

        for (let i = 0; i < data.length; i += 4) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 255;
        }

        if (vizMode === 'radial') {
            const res = 2;
            const pts = [];
            let minI = Infinity, maxI = -Infinity;
            for (let y = 0; y < H; y += res) {
                for (let x = 0; x < W; x += res) {
                    let total = 0;
                    for (let s = 0; s < sourcesLocal.length; s++) {
                        const src = sourcesLocal[s];
                        const dx = x - src.x;
                        const dy = y - src.y;
                        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                        total += Math.abs(src.amp * Math.sin(TWO_PI_LOCAL * (dist / src.freq - tLocal)));
                    }
                    pts.push({ x, y, i: total });
                    if (total < minI) minI = total;
                    if (total > maxI) maxI = total;
                }
            }
            const range = maxI - minI || 1;
            for (let p = 0; p < pts.length; p++) {
                const n = Math.pow((pts[p].i - minI) / range, 1 / boost);
                if (n <= 0.05) continue;
                const grey = Math.floor(n * 255);
                const idx = (Math.floor(pts[p].y) * W + Math.floor(pts[p].x)) * 4;
                if (idx >= 0 && idx + 3 < data.length) {
                    data[idx] = grey;
                    data[idx + 1] = grey;
                    data[idx + 2] = grey;
                }
            }
            return imageData;
        }

        // Density path (also used as worker fallback for particle mode)
        const total = W * H;
        const intensities = new Float32Array(total);
        let minI = Infinity, maxI = -Infinity;
        for (let idx = 0; idx < total; idx++) {
            const x = idx % W;
            const y = (idx / W) | 0;
            let acc = 0;
            for (let s = 0; s < sourcesLocal.length; s++) {
                const src = sourcesLocal[s];
                const dx = x - src.x;
                const dy = y - src.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                acc += Math.abs(src.amp * Math.sin(TWO_PI_LOCAL * (dist / src.freq - tLocal)));
            }
            intensities[idx] = acc;
            if (acc < minI) minI = acc;
            if (acc > maxI) maxI = acc;
        }
        const range = maxI - minI || 1;
        const invBoost = 1 / boost;
        for (let i = 0; i < total; i++) {
            const grey = Math.floor(Math.pow((intensities[i] - minI) / range, invBoost) * 255);
            const px = i * 4;
            data[px] = grey;
            data[px + 1] = grey;
            data[px + 2] = grey;
            data[px + 3] = 255;
        }
        return imageData;
    },

    destroy() {
        sources              = [];
        particles            = [];
        t                    = 0;
        _lastTemplate        = null;
        _lastChordType       = null;
        _lastParticleSpacing = null;
        _lastSourceMode      = null;
        _manualSources       = null;
        _pixelDistCache      = null;
        _partDistCache       = null;
        _cacheW              = 0;
        _cacheH              = 0;
        _offscreenCanvas     = null;
        _offscreenCtx        = null;
    },

    onDestroy() {
        this.destroy();
    },

    draw(ctx, canvas, params, frame) {
        const W = canvas.width;
        const H = canvas.height;

        const safeFrame   = +(frame || 0);
        const sizeChanged = _cacheW !== W || _cacheH !== H;
        const sourceMode  = params.sourceMode || 'template';

        // CYM-02: resolve sources — template or manual positions
        const modeChanged     = sourceMode !== _lastSourceMode;
        const templateChanged = params.template !== _lastTemplate || params.chordType !== _lastChordType;
        const spacingChanged  = params.particleSpacing !== _lastParticleSpacing;

        if (sourceMode === 'manual') {
            const count = Math.max(1, Math.min(8, (params.manualSourceCount || 3) | 0));
            // Rebuild if count, mode, or canvas changed
            if (modeChanged || sizeChanged || sources.length !== count) {
                const defaultXY = [
                    [0.25, 0.25], [0.75, 0.25], [0.5, 0.75],
                    [0.25, 0.75], [0.75, 0.75], [0.5, 0.25],
                    [0.1, 0.5],   [0.9, 0.5]
                ];
                sources = Array.from({ length: count }, (_, i) => {
                    const xN = params[`s${i+1}X`] ?? defaultXY[i]?.[0] ?? 0.5;
                    const yN = params[`s${i+1}Y`] ?? defaultXY[i]?.[1] ?? 0.5;
                    const semitone = (CHORDS[params.chordType || 'maj'] || CHORDS.maj)[i % (CHORDS[params.chordType || 'maj'] || CHORDS.maj).length];
                    return new WaveSource(xN * W, yN * H, semitone, params.amplitude || 3, ROOT_NOTES[params.rootNote] || 440);
                });
                buildPixelDistCache(W, H);
                _lastSourceMode = 'manual';
            } else {
                // Update positions from params live (handles dragged)
                for (let i = 0; i < sources.length; i++) {
                    const xN = params[`s${i+1}X`] ?? 0.5;
                    const yN = params[`s${i+1}Y`] ?? 0.5;
                    if (sources[i].x !== xN * W || sources[i].y !== yN * H) {
                        sources[i].x = xN * W;
                        sources[i].y = yN * H;
                        buildPixelDistCache(W, H);
                    }
                }
            }
        } else {
            if (sources.length === 0 || templateChanged || sizeChanged || modeChanged) {
                setupSources(params.template || 'triangle', params.chordType || 'maj',
                    W, H, ROOT_NOTES[params.rootNote] || 440, params.amplitude || 3);
                buildPixelDistCache(W, H);
                _lastTemplate   = params.template;
                _lastChordType  = params.chordType;
                _lastSourceMode = 'template';
            }
        }

        if (particles.length === 0 || spacingChanged || templateChanged || modeChanged || sizeChanged) {
            initParticles(W, H, params.particleSpacing || 5);
            buildParticleDistCache();
            _lastParticleSpacing = params.particleSpacing;
        }

        if (process?.env?.NODE_ENV === 'development') {
            console.assert(_cacheW === W && _cacheH === H,
                `[cymatics] cache size mismatch: expected ${W}×${H}, got ${_cacheW}×${_cacheH}`);
        }

        t = safeFrame * (params.speed || 0.08);

        const baseFreq = ROOT_NOTES[params.rootNote] || 440;
        for (let i = 0; i < sources.length; i++) {
            sources[i].amp      = params.amplitude || 3;
            sources[i].baseFreq = baseFreq;
            sources[i].noteFreq = baseFreq * Math.pow(2, sources[i].semitone / 12);
            sources[i].freq     = sources[i].noteFreq / 10;
        }

        const vizMode = (params.vizMode || 'Particle').toLowerCase();
        const boost   = params.boost || 3;

        if (vizMode === 'particle') {
            drawParticle(ctx, W, H, params);
        } else if (vizMode === 'density') {
            drawDensity(ctx, W, H, boost, params);
        } else if (vizMode === 'radial') {
            drawRadial(ctx, W, H, boost, params);
        }

        // CYM-06: showSources draws markers for orbit mode; in manual mode the HOST
        // overlay renders draggable handles, so we only draw static dots for orbit mode.
        if (params.showSources && sourceMode === 'template') {
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < sources.length; i++) {
                ctx.beginPath();
                ctx.arc(sources[i].x, sources[i].y, 4, 0, TWO_PI);
                ctx.fill();
            }
        }
    }
};
