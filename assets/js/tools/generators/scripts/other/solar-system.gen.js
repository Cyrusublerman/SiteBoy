/**
 * Solar System Script - Real-time planetary positions
 * Uses NASA JPL Keplerian elements for accurate orbital mechanics
 *
 * @script solar-system
 * @category other
 * @version 5.0.0
 */

import '../../../../shared/algorithms/core/math-utils.js';
import { TIME_ANCHORS, SCALES, getElapsedLabel } from '../../../../shared/algorithms/astronomy/time-anchors.js';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const J2000_MS = 946728000000;

const F = 14;
const FONT_SM = `${Math.round(F * 0.57)}px "Atkinson Hyperlegible Mono", monospace`;
const FONT_MD = `${Math.round(F * 0.64)}px "Atkinson Hyperlegible Mono", monospace`;
const FONT_LG = `${Math.round(F * 0.71)}px "Atkinson Hyperlegible Mono", monospace`;

// SOL-04: Moon data — simplified Keplerian (circular orbit, parent-relative)
// Fields: parent (planet name), a (AU), period (days), radius (km), color, phase0 (deg)
const MOON_DATA = [
    // Earth
    { parent: 'Earth',   name: 'Moon',     a: 0.002570, period:   27.32158, radius:  1737, color: '#c0c0c0', phase0:   0 },
    // Mars
    { parent: 'Mars',    name: 'Phobos',   a: 0.0000627, period:   0.31891, radius:    11, color: '#996633', phase0:  45 },
    { parent: 'Mars',    name: 'Deimos',   a: 0.0001568, period:   1.26244, radius:     6, color: '#cc9966', phase0: 120 },
    // Jupiter (Galilean)
    { parent: 'Jupiter', name: 'Io',       a: 0.002820,  period:   1.76914, radius:  1821, color: '#ffcc00', phase0:  30 },
    { parent: 'Jupiter', name: 'Europa',   a: 0.004490,  period:   3.55118, radius:  1561, color: '#e0c080', phase0:  90 },
    { parent: 'Jupiter', name: 'Ganymede', a: 0.007155,  period:   7.15455, radius:  2634, color: '#999966', phase0: 150 },
    { parent: 'Jupiter', name: 'Callisto', a: 0.01258,   period:  16.68902, radius:  2410, color: '#808080', phase0: 210 },
    // Saturn
    { parent: 'Saturn',  name: 'Titan',    a: 0.00816,   period:  15.94542, radius:  2575, color: '#ffaa44', phase0:  60 },
];
const EMU_WAR_MS = new Date(1932, 10, 2, 11, 0, 0).getTime();
const DEG_TO_RAD = Math.PI / 180;
const TWO_PI = Math.PI * 2;
const E_STAR_FACTOR = 57.29578;

// NASA JPL Keplerian Elements (valid 1800–2050)
const PLANET_DATA = [
    { name: 'Mercury', a0: 0.38709927, aDot: 0.00000037,  e0: 0.20563593, eDot:  0.00001906, I0:  7.00497902, IDot: -0.00594749, L0:  252.25032350, LDot: 149472.67411175, w0:  77.45779628, wDot:  0.16047689, O0:  48.33076593, ODot: -0.12534081, color: '#c0c0c0', radius:  2439.7 },
    { name: 'Venus',   a0: 0.72333566, aDot: 0.00000390,  e0: 0.00677672, eDot: -0.00004107, I0:  3.39467605, IDot: -0.00078890, L0:  181.97909950, LDot:  58517.81538729, w0: 131.60246718, wDot:  0.00268329, O0:  76.67984255, ODot: -0.27769418, color: '#ffff00', radius:  6051.8 },
    { name: 'Earth',   a0: 1.00000261, aDot: 0.00000562,  e0: 0.01671123, eDot: -0.00004392, I0: -0.00001531, IDot: -0.01294668, L0:  100.46457166, LDot:  35999.37244981, w0: 102.93768193, wDot:  0.32327364, O0:  0.0,         ODot:  0.0,         color: '#00ffff', radius:  6371   },
    { name: 'Mars',    a0: 1.52371034, aDot: 0.00001847,  e0: 0.09339410, eDot:  0.00007882, I0:  1.84969142, IDot: -0.00813131, L0:   -4.55343205, LDot:  19140.30268499, w0: -23.94362959, wDot:  0.44441088, O0:  49.55953891, ODot: -0.29257343, color: '#ff0000', radius:  3389.5 },
    { name: 'Jupiter', a0: 5.20288700, aDot: -0.00011607, e0: 0.04838624, eDot: -0.00013253, I0:  1.30439695, IDot: -0.00183714, L0:   34.39644051, LDot:   3034.74612775, w0:  14.72847983, wDot:  0.21252668, O0: 100.47390909, ODot:  0.20469106, color: '#ffff00', radius: 69911   },
    { name: 'Saturn',  a0: 9.53667594, aDot: -0.00125060, e0: 0.05386179, eDot: -0.00050991, I0:  2.48599187, IDot:  0.00193609, L0:   49.95424423, LDot:   1222.49362201, w0:  92.59887831, wDot: -0.41897216, O0: 113.66242448, ODot: -0.28867794, color: '#808000', radius: 58232   },
    { name: 'Uranus',  a0: 19.18916464, aDot: -0.00196176, e0: 0.04725744, eDot: -0.00004397, I0:  0.77263783, IDot: -0.00242939, L0:  313.23810451, LDot:    428.48202785, w0: 170.95427630, wDot:  0.40805281, O0:  74.01692503, ODot:  0.04240589, color: '#008080', radius: 25362   },
    { name: 'Neptune', a0: 30.06992276, aDot:  0.00026291, e0: 0.00859048, eDot:  0.00005105, I0:  1.77004347, IDot:  0.00035372, L0:  -55.12002969, LDot:    218.45945325, w0:  44.96476227, wDot: -0.32241464, O0: 131.78422574, ODot: -0.00508664, color: '#0000ff', radius: 24622   }
];

// ═══════════════════════════════════════════════════════════════════
// PURE FUNCTIONS (no module state)
// ═══════════════════════════════════════════════════════════════════

function getCenturiesPastJ2000() {
    return (Date.now() - J2000_MS) / 86400000 / 36525;
}

function solveKeplerEquation(M, e) {
    // Newton-Raphson: M = E − e·sin(E); working in degrees, tolerance 10⁻⁶°
    const eStar = E_STAR_FACTOR * e;
    let E = M + eStar * Math.sin(M * DEG_TO_RAD);
    for (let iter = 0; iter < 30; iter++) {
        const ERad = E * DEG_TO_RAD;
        const dM = M - (E - eStar * Math.sin(ERad));
        if (Math.abs(dM) < 1e-6) break;
        E += dM / (1 - e * Math.cos(ERad));
    }
    return E;
}

function normalizeAngle(angle) {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
}

function computePlanetPosition(planet, T) {
    if (planet.cachedPos !== null && planet.lastT === T) return planet.cachedPos;

    const a    = planet.a0 + planet.aDot * T;
    const e    = planet.e0 + planet.eDot * T;
    const I    = planet.I0 + planet.IDot * T;
    const L    = planet.L0 + planet.LDot * T;
    const wBar = planet.w0 + planet.wDot * T;
    const O    = planet.O0 + planet.ODot * T;

    const w = wBar - O;
    const M = normalizeAngle(L - wBar);
    const EAngle = solveKeplerEquation(M, e);
    const ERad = EAngle * DEG_TO_RAD;

    const cosE = Math.cos(ERad);
    const sinE = Math.sin(ERad);
    const xPrime = a * (cosE - e);
    const yPrime = a * Math.sqrt(1 - e * e) * sinE;

    const wRad = w * DEG_TO_RAD;
    const ORad = O * DEG_TO_RAD;
    const IRad = I * DEG_TO_RAD;
    const cosW = Math.cos(wRad), sinW = Math.sin(wRad);
    const cosO = Math.cos(ORad), sinO = Math.sin(ORad);
    const cosI = Math.cos(IRad);

    const xEcl = (cosW * cosO - sinW * sinO * cosI) * xPrime +
                 (-sinW * cosO - cosW * sinO * cosI) * yPrime;
    const yEcl = (cosW * sinO + sinW * cosO * cosI) * xPrime +
                 (-sinW * sinO + cosW * cosO * cosI) * yPrime;

    planet.cachedPos = { x: xEcl, y: yEcl, distance: Math.sqrt(xEcl * xEcl + yEcl * yEcl) };
    planet.lastT = T;
    return planet.cachedPos;
}

function scaleDistance(distanceAU) {
    return Math.log(distanceAU * 10 + 1);
}

// ═══════════════════════════════════════════════════════════════════
// SCRIPT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export const SCRIPT_CONFIG = {
    id: 'solar-system',
    title: 'Solar System',
    category: 'other',
    version: '5.0.0',

    canvas: {
        width: 800,
        height: 800,
        context: '2d',
        background: '#000000'
    },

    animation: {
        type:             'infinite',
        defaultFps:       1,
        sequencer:        false,
        animatableParams: ['distanceScale', 'planetScale'],
        // SOL-03: fps bumped when timeRate is not realtime (driven by param change at draw time)
    },

    export: {
        png: true,
        svg: true,
        gif: false,
        webm: false,
        sequence: false
    },

    // ── Instance state (on SCRIPT_CONFIG; not module-level) ──────────
    _planets: [],
    _asteroidParticles: [],
    _asteroidCached: null,
    _beltDistScale: null,
    _beltCX: null,
    _beltCY: null,
    _beltScreenCache: null,
    _longitude: null,
    _latitude: null,
    _locationRequested: false,
    _hoveredPlanet: null,
    _pointerX: null,
    _pointerY: null,
    _canvasPointerHandler: null,
    _canvasLeaveHandler: null,
    _pointerCanvas: null,

    // ── INFO tab ─────────────────────────────────────────────────────
    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Real-time heliocentric planetary positions for all eight planets (Mercury–Neptune) using NASA JPL Keplerian orbital elements valid 1800–2050. Each planet is defined by six time-varying elements (a, e, I, L, ω̄, Ω) that evolve linearly with Julian centuries past J2000. Positions are resolved via Newton-Raphson iteration on Kepler\'s equation. Distances are compressed logarithmically — log(AU×10+1) — fitting all eight orbits within the canvas while preserving inner-planet separation. An asteroid belt of configurable particle count is randomly placed between 2.2–3.2 AU. An optional viewer marker shows your position on Earth\'s surface derived from IP-based geolocation, with a configurable FOV cone. Info text displays hours elapsed since the Great Emu War and current Earth–Pluto distance in giraffe small intestines. Output is non-deterministic: each frame reads Date.now() directly, producing actual real-world positions.'
        },
        {
            heading: 'ALGORITHM',
            body: 'getCenturiesPastJ2000: T = (Date.now() − J2000_MS) / 86400000 / 36525. Each orbital element evolves linearly: a(T) = a₀ + ȧ×T (and likewise for e, I, L, ω̄, Ω). Derived: ω = ω̄ − Ω; M = normalise(L − ω̄) ∈ [−180°, 180°]. solveKeplerEquation: Newton-Raphson on M = E − e·sin(E); initial estimate E₀ = M + eStar·sin(M_rad) where eStar = 57.29578×e; iteration Eₙ₊₁ = Eₙ + ΔM/(1 − e·cosEₙ); convergence at |ΔM| < 10⁻⁶°; max 30 iterations, typically 3–5. Orbital plane: x\' = a(cosE − e); y\' = a√(1−e²)·sinE. Ecliptic transform: xEcl = (cosω cosΩ − sinω sinΩ cosI)x\' + (−sinω cosΩ − cosω sinΩ cosI)y\'. scaleDistance: log(AU×10+1). Display: cs = s×distanceScale; maxDist = scaleDistance(a₀_Neptune); distScale = cs/maxDist; px = scaleDistance(r)×distScale×cos(atan2(y,x)). Planet radius: max(planet.radius × sunDisplayRadius/695700 × planetScale, 2). getLocalSolarTime: solarTime = (utcFrac + longitude/15/24) mod 1. Viewer angle: earthOrbitAngle + solarTime×2π. Emu War: floor((Date.now() − EMU_WAR_MS) / 3600000). Pluto (approx): angle = T×0.004 rad; dist = sqrt((39.48cosθ − earthX)² + (39.48sinθ − earthY)²) AU; ×149597870700/36 = giraffe intestines.'
        },
        {
            heading: 'PARAMETERS',
            body: 'Distance Scale (distanceScale 0.2–0.8): fraction of the shorter canvas dimension allocated to the full orbit span. Higher values spread orbits towards the edges; cs = s×distanceScale; distScale = cs/maxDist. Planet Scale (planetScale 0.5–3.0): multiplier on computed planet display radii; at 1.0 radii are proportional to true planetary sizes relative to the Sun; minimum radius clamped to 2px. Show Labels (showLabels): draws each planet\'s name in grey above its circle. Show Info (showInfo): draws Emu War elapsed hours and Earth–Pluto distance in giraffe intestines at the canvas bottom. Particles (asteroidCount 100–1000, step 50): number of random asteroid belt particles; changing this value regenerates the belt with new random positions — the layout is not a denser version of the previous one. Show Belt (showAsteroidBelt): renders asteroid belt as 1×1px white or grey dots. Show Viewer (showViewer): draws a 2px cyan dot on Earth at the local-solar-time position, plus a FOV cone of two line segments. FOV Angle (fovAngle 10°–90°, step 5°): half-opening angle of the viewer FOV cone; cone lines extend 20px from the viewer dot.'
        },
        {
            heading: 'PRESETS',
            body: 'Default: distanceScale 0.45, planetScale 1.0, 300 belt particles, belt visible, viewer visible, labels hidden, info visible — baseline real-time view. Dense Belt: 1000 belt particles, labels shown, viewer hidden — emphasises the asteroid band visual. Minimal: distanceScale 0.5, planetScale 1.5, 100 particles, belt hidden, viewer hidden, labels shown, info hidden — clean planetary position display at larger scale.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Frame budget: 1000ms (defaultFps=1). Dominant operation: asteroid belt rendering, O(count) per frame where count ∈ [100, 1000]. Implemented via single ImageData putImageData call (replaces individual fillRect calls). Belt screen positions are cached per (distScale, cx, cy) tuple; rebuilt only on canvas resize or distanceScale change. Normalised positions rebuilt only on asteroidCount change. Kepler solver: 3–5 Newton-Raphson iterations per planet per second; 8 planets ≈ 40 iterations/s; negligible. Planet position caching: computePlanetPosition caches per T value; at 1fps T changes once per frame so cache misses once per frame per planet. IP geolocation fetch fires once per load; asynchronous; no frame-budget impact.'
        },
        {
            heading: 'ANIMATION',
            body: 'Type: infinite. Default rate: 1fps. The generator reads Date.now() each frame — output is non-deterministic with respect to frame index. Same-frame-number does not produce the same output across runs. GIF, WebM, and sequence export are disabled for this reason. PNG export captures the current real-world planetary position snapshot. The frame argument passed by the host is intentionally unused.'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'Viewer position depends on IP geolocation (ipapi.co free tier, city-level accuracy). On first load the fetch is in-flight; viewer displays at the UTC-based position until the response arrives — no loading indicator is shown. If ipapi.co is unreachable the viewer falls back silently to UTC wall-clock time. Planet trails, angular separation measurement, planet selection, and custom date navigation are not implemented. Pluto distance uses a simplified circular orbit approximation (not Keplerian). The generator always shows current real-world positions; historical or future dates are inaccessible. Orbital elements are valid for 1800–2050; accuracy degrades outside this range.'
        },
        {
            heading: 'REFERENCES',
            body: 'Orbital elements: E.M. Standish, "Approximate Positions of the Planets", NASA JPL Solar System Dynamics, https://ssd.jpl.nasa.gov/planets/approx_pos.html. Kepler equation: Newton-Raphson method as described in the JPL technical note. Geolocation: ipapi.co (IP-based, no GPS, no browser permission prompt). Emu War commenced: 2 November 1932. Giraffe small intestine length: assumed 36m.'
        }
    ],

    // ── Presets (flat format — values at top level) ───────────────────
    presets: [
        { name: 'Default',    values: { distanceScale: 0.45, planetScale: 1.0, asteroidCount: 300,  showAsteroidBelt: true,  showViewer: true,  showLabels: false, showInfo: true,  fovAngle: 30 } },
        { name: 'Dense Belt', values: { distanceScale: 0.45, planetScale: 1.0, asteroidCount: 1000, showAsteroidBelt: true,  showViewer: false, showLabels: true,  showInfo: true,  fovAngle: 30 } },
        { name: 'Minimal',    values: { distanceScale: 0.5,  planetScale: 1.5, asteroidCount: 100,  showAsteroidBelt: false, showViewer: false, showLabels: true,  showInfo: false, fovAngle: 30 } }
    ],

    equations: [
        { caption: 'Kepler equation', latex: 'M = E - e\\sin E' },
        { caption: 'Orbital plane', latex: "x' = a(\\cos E - e),\\quad y' = a\\sqrt{1-e^2}\\sin E" },
        { caption: 'Display scale', latex: 'd_{\\mathrm{display}} = \\log(AU \\cdot 10 + 1)' },
    ],

    // ── Parameters (inert canvasWidth/Height removed) ─────────────────
    parameters: [
        {
            group: 'Display',
            params: [
                { key: 'distanceScale', type: 'slider', label: 'Distance Scale',
                  min: 0.2, max: 0.8, step: 0.05, default: 0.45, precision: 2 },
                // SOL-01: sizeMode — how to scale planet display radii
                { key: 'sizeMode', type: 'select', label: 'Size Mode',
                  options: [
                    { value: 'proportional',  label: 'Proportional (true scale)' },
                    { value: 'logarithmic',   label: 'Logarithmic' },
                    { value: 'exaggerated',   label: 'Exaggerated (×5 small)' }
                  ], default: 'proportional' },
                { key: 'planetScale', type: 'slider', label: 'Planet Scale',
                  min: 0.5, max: 3.0, step: 0.1, default: 1.0, precision: 1 },
                // SOL-02: terminator shading toggle
                { key: 'showTerminator', type: 'toggle', label: 'Terminator Shading', default: false },
                { key: 'showLabels',     type: 'toggle', label: 'Show Labels',         default: false },
                { key: 'showInfo',       type: 'toggle', label: 'Show Info',           default: true  },
                // SOL-04: moon display toggle
                { key: 'showMoons',      type: 'toggle', label: 'Show Moons',          default: false }
            ]
        },
        // SOL-03: time controls — rate and animation range
        {
            group: 'Time',
            params: [
                { key: 'timeRate', type: 'select', label: 'Time Rate',
                  options: [
                    { value: 'realtime',  label: 'Real-Time (live)' },
                    { value: 'day',       label: '1 day / sec' },
                    { value: 'week',      label: '1 week / sec' },
                    { value: 'month',     label: '1 month / sec' },
                    { value: 'year',      label: '1 year / sec' },
                    { value: 'decade',    label: '1 decade / sec' },
                    { value: 'century',   label: '1 century / sec' }
                  ], default: 'realtime' },
                { key: 'animRange', type: 'select', label: 'Animation Window',
                  options: [
                    { value: 'none',     label: 'None (real-time)' },
                    { value: 'day',      label: 'Last 24 hours' },
                    { value: 'week',     label: 'Last 7 days' },
                    { value: 'year',     label: 'Last year' },
                    { value: 'decade',   label: 'Last decade' },
                    { value: 'century',  label: 'Last century' }
                  ], default: 'none' }
            ]
        },
        {
            group: 'Asteroid Belt',
            params: [
                { key: 'asteroidCount',    type: 'slider', label: 'Particles', min: 100, max: 1000, step: 50, default: 300 },
                { key: 'showAsteroidBelt', type: 'toggle', label: 'Show Belt', default: true }
            ]
        },
        {
            group: 'Viewer',
            params: [
                { key: 'showViewer',  type: 'toggle', label: 'Show Viewer',  default: true },
                { key: 'fovAngle',    type: 'slider', label: 'FOV Angle',    min: 10, max: 90, step: 5, default: 30 },
                // SOL-05: viewer reticle toggle
                { key: 'showReticle', type: 'toggle', label: 'Viewer Reticle', default: true }
            ]
        },
        // SOL-07: multi-scale time panel
        {
            group: 'Time Panel', defaultCollapsed: true,
            params: [
                { key: 'showTimePanel',  type: 'toggle', label: 'Show Time Panel', default: false },
                { key: 'timePanelScale', type: 'select', label: 'Time Scale',
                  options: [
                    { value: 'seconds',   label: 'Seconds' },
                    { value: 'minutes',   label: 'Minutes' },
                    { value: 'hours',     label: 'Hours'   },
                    { value: 'days',      label: 'Days'    },
                    { value: 'months',    label: 'Months'  },
                    { value: 'years',     label: 'Years'   },
                    { value: 'decades',   label: 'Decades' },
                    { value: 'centuries', label: 'Centuries' },
                    { value: 'millennia', label: 'Millennia' },
                    { value: 'megayears', label: 'Megayears (Myr)' },
                    { value: 'gigayears', label: 'Gigayears (Gyr)' }
                  ], default: 'years' }
            ]
        }
    ],

    // ── Methods ───────────────────────────────────────────────────────

    _initializePlanets() {
        this._planets = PLANET_DATA.map(data => ({
            ...data,
            cachedPos: null,
            lastT: null,
            screenX: 0,
            screenY: 0,
            screenRadius: 0
        }));
    },

    _generateAsteroidBelt(count) {
        this._asteroidParticles = [];
        const inner = 2.2;
        const outer = 3.2;
        for (let i = 0; i < count; i++) {
            this._asteroidParticles.push({
                angle:    Math.random() * TWO_PI,
                distance: inner + Math.random() * (outer - inner),
                white:    Math.random() < 0.5
            });
        }
        this._asteroidCached    = null;
        this._beltDistScale     = null;
        this._beltCX            = null;
        this._beltCY            = null;
        this._beltScreenCache   = null;
    },

    _drawAsteroidBelt(ctx, distScale, cx, cy, w, h) {
        // Level-1 cache: normalised log-scale positions (rebuilt on belt regeneration)
        if (!this._asteroidCached) {
            this._asteroidCached = this._asteroidParticles.map(p => {
                const s = scaleDistance(p.distance);
                return { nx: s * Math.cos(p.angle), ny: s * Math.sin(p.angle), white: p.white };
            });
            this._beltDistScale = null; // force level-2 rebuild
        }

        // Level-2 cache: absolute pixel positions (rebuilt when spatial params change)
        if (this._beltDistScale !== distScale || this._beltCX !== cx || this._beltCY !== cy) {
            this._beltDistScale   = distScale;
            this._beltCX          = cx;
            this._beltCY          = cy;
            this._beltScreenCache = this._asteroidCached.map(p => ({
                x:     Math.round(cx + p.nx * distScale),
                y:     Math.round(cy + p.ny * distScale),
                white: p.white
            }));
        }

        // Single ImageData write replaces O(count) fillRect calls.
        // putImageData ignores the canvas transform; coordinates are absolute pixels.
        // Uint32 fill on little-endian: 0xFF000000 = RGBA(0,0,0,255) = opaque black.
        const imgData = ctx.createImageData(w, h);
        const buf32   = new Uint32Array(imgData.data.buffer);
        buf32.fill(0xFF000000);
        for (let i = 0, n = this._beltScreenCache.length; i < n; i++) {
            const p = this._beltScreenCache[i];
            if (p.x >= 0 && p.x < w && p.y >= 0 && p.y < h) {
                buf32[p.y * w + p.x] = p.white ? 0xFFFFFFFF : 0xFF808080;
            }
        }
        ctx.putImageData(imgData, 0, 0);
    },

    _getLocalSolarTime() {
        const d = new Date();
        const utcFrac = (d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600) / 24;
        if (this._longitude !== null) {
            let t = (utcFrac + this._longitude / 15 / 24) % 1;
            if (t < 0) t += 1;
            return t;
        }
        return (d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600) / 24;
    },

    destroy() {
        if (this._pointerCanvas) {
            this._pointerCanvas.removeEventListener('pointermove', this._canvasPointerHandler);
            this._pointerCanvas.removeEventListener('pointerleave', this._canvasLeaveHandler);
        }
        this._canvasPointerHandler = null;
        this._canvasLeaveHandler   = null;
        this._hoveredPlanet        = null;
        this._pointerCanvas        = null;
    },

    _requestLocation() {
        if (this._locationRequested) return;
        this._locationRequested = true;
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                this._longitude = data.longitude;
                this._latitude  = data.latitude;
            })
            .catch(() => {});
    },

    // SOL-03: compute T (Julian centuries past J2000) given timeRate and animRange params.
    _computeT(params, frame) {
        const MS_PER_CENTURY = 36525 * 86400000;
        const rateMap = {
            realtime: 0,
            day:      86400000,
            week:     7 * 86400000,
            month:    30 * 86400000,
            year:     365.25 * 86400000,
            decade:   10 * 365.25 * 86400000,
            century:  MS_PER_CENTURY
        };
        const rangeMap = {
            none:    0,
            day:     86400000,
            week:    7 * 86400000,
            year:    365.25 * 86400000,
            decade:  10 * 365.25 * 86400000,
            century: MS_PER_CENTURY
        };
        const timeRate  = params.timeRate  || 'realtime';
        const animRange = params.animRange || 'none';

        if (timeRate === 'realtime' && animRange === 'none') {
            return getCenturiesPastJ2000();
        }
        // Base T from current real time
        const baseT = getCenturiesPastJ2000();
        const nowMs = Date.now();

        if (animRange !== 'none') {
            // Animate frame-driven offset within the range
            const rangeMs = rangeMap[animRange] || 0;
            const fps = params._fps || 1;
            const ratePerFrame = (rateMap[timeRate] || 86400000) / 1000 / fps;
            // Sweep back from now by animRange over a looping animation
            const elapsed = (frame * ratePerFrame) % rangeMs;
            return (nowMs - rangeMs + elapsed - J2000_MS) / MS_PER_CENTURY;
        }
        // Fixed-rate time-lapse from current real position
        const rateMs = rateMap[timeRate] || 0;
        const offsetMs = frame * rateMs / (params._fps || 1);
        return (nowMs + offsetMs - J2000_MS) / MS_PER_CENTURY;
    },

    // SOL-01: compute display radius for a planet given sizeMode
    _planetDisplayRadius(planet, sizeScale, sizeMode, sunRadius) {
        const trueR = Math.max(planet.radius * sizeScale, 2);
        if (sizeMode === 'logarithmic') {
            return Math.max(Math.log(planet.radius) / Math.log(695700) * sunRadius * 0.6, 2);
        } else if (sizeMode === 'exaggerated') {
            // Exaggerate small planets (Mercury, Mars) relative to gas giants
            const refR = 6371; // Earth radius km
            if (planet.radius < refR * 2) {
                return Math.max(planet.radius * sizeScale * 5, 3);
            }
            return trueR;
        }
        return trueR; // proportional
    },

    // SOL-02: draw terminator (day/night boundary) on a planet circle
    _drawTerminator(ctx, px, py, r, planetAngle) {
        if (r < 3) return;
        // Sun is at origin; planet is at (px, py); angle from sun to planet
        // Light comes from (0,0), so the terminator is perpendicular to the sun direction
        const sunAngle = Math.atan2(-py, -px); // direction FROM planet TOWARD sun
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, r, 0, TWO_PI);
        ctx.clip();
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(px, py, r + 1, sunAngle + Math.PI / 2, sunAngle + (3 * Math.PI / 2));
        ctx.lineTo(px, py);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    },

    // SOL-04: compute moon position relative to its parent planet (in canvas coords)
    _moonScreenPos(moon, parentScreenX, parentScreenY, distScale, T) {
        // T is Julian centuries past J2000; period is in days
        const daysPastJ2000 = T * 36525;
        const phaseRad = (moon.phase0 * Math.PI / 180) + (TWO_PI * daysPastJ2000 / moon.period);
        const orbitPx = moon.a * distScale;
        return {
            x: parentScreenX + orbitPx * Math.cos(phaseRad),
            y: parentScreenY + orbitPx * Math.sin(phaseRad)
        };
    },

    // SOL-04: draw moons for all planets in _planets that have entries in MOON_DATA
    _drawMoons(ctx, distScale, T, sizeScale, params) {
        for (const moon of MOON_DATA) {
            const parent = this._planets.find(p => p.name === moon.parent);
            if (!parent) continue;
            const { x: mx, y: my } = this._moonScreenPos(moon, parent.screenX, parent.screenY, distScale, T);
            const r = Math.max(moon.radius * sizeScale, 1);
            ctx.fillStyle = moon.color;
            ctx.beginPath();
            ctx.arc(mx, my, r, 0, TWO_PI);
            ctx.fill();
            if (params.showLabels && r >= 2) {
                ctx.fillStyle  = '#808080';
                ctx.font       = FONT_SM;
                ctx.textAlign  = 'center';
                ctx.fillText(moon.name, mx, my - r - 3);
            }
        }
    },

    // SOL-05: draw a reticle (crosshairs + outer ring) at the viewer position
    _drawViewerReticle(ctx, vx, vy, solarTime) {
        const RING_R  = 6;
        const CROSS   = 10;
        ctx.save();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth   = 1;
        // Outer ring
        ctx.beginPath();
        ctx.arc(vx, vy, RING_R, 0, TWO_PI);
        ctx.stroke();
        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(vx - CROSS, vy);
        ctx.lineTo(vx - RING_R, vy);
        ctx.moveTo(vx + RING_R, vy);
        ctx.lineTo(vx + CROSS,  vy);
        ctx.moveTo(vx, vy - CROSS);
        ctx.lineTo(vx, vy - RING_R);
        ctx.moveTo(vx, vy + RING_R);
        ctx.lineTo(vx, vy + CROSS);
        ctx.stroke();
        // Local time label (fractional 24h → HH:MM)
        const totalMinutes = Math.round(solarTime * 24 * 60) % (24 * 60);
        const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
        const mm = String(totalMinutes % 60).padStart(2, '0');
        ctx.fillStyle  = '#00ffff';
        ctx.font       = FONT_SM;
        ctx.textAlign  = 'center';
        ctx.fillText(`${hh}:${mm}`, vx, vy - RING_R - 4);
        ctx.restore();
    },

    // SOL-07: draw multi-scale time-anchor panel in top-right corner
    _drawTimePanel(ctx, w, h, scale) {
        const anchors = TIME_ANCHORS.filter(a => a.scale === scale)
            .sort((a, b) => a.ms - b.ms);
        if (anchors.length === 0) return;

        const PAD  = 8;
        const LH   = 13;
        const COL1 = 130; // px reserved for elapsed label
        const titleH = LH + 4;
        const rowH   = LH;
        const panelH = titleH + anchors.length * rowH + PAD * 2;
        const panelW = 340;
        const px     = w - panelW - PAD;
        const py     = PAD;

        ctx.save();
        ctx.globalAlpha = 0.82;
        ctx.fillStyle = '#000000';
        ctx.fillRect(px, py, panelW, panelH);
        ctx.restore();
        ctx.strokeStyle = '#808080';
        ctx.lineWidth   = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, panelW - 1, panelH - 1);

        ctx.font      = FONT_MD;
        ctx.textAlign = 'left';

        // Title
        ctx.fillStyle = '#808080';
        ctx.fillText(`TIME ANCHORS — ${scale.toUpperCase()}`, px + PAD, py + PAD + 9);

        // Rows
        for (let i = 0; i < anchors.length; i++) {
            const a   = anchors[i];
            const ry  = py + titleH + PAD + i * rowH + 9;
            const ela = getElapsedLabel(a.ms, scale);
            ctx.fillStyle = '#808080';
            ctx.fillText(ela, px + PAD, ry);
            ctx.fillStyle = '#c0c0c0';
            ctx.fillText(a.label, px + PAD + COL1, ry);
        }
    },

    // _frame is used when timeRate !== 'realtime'
    draw(ctx, canvas, params, _frame) {
        if (this._planets.length === 0) {
            this._initializePlanets();
            this._generateAsteroidBelt(params.asteroidCount || 300);
            this._requestLocation();
        }

        // Lazily attach pointer handlers for planet hit-testing (SOL-06)
        if (!this._canvasPointerHandler) {
            this._canvasPointerHandler = (e) => {
                this._pointerX = e.offsetX;
                this._pointerY = e.offsetY;
            };
            this._canvasLeaveHandler = () => {
                this._pointerX = null;
                this._pointerY = null;
                this._hoveredPlanet = null;
            };
            canvas.addEventListener('pointermove', this._canvasPointerHandler);
            canvas.addEventListener('pointerleave', this._canvasLeaveHandler);
            this._pointerCanvas = canvas;
        }

        if (this._asteroidParticles.length !== (params.asteroidCount || 300)) {
            this._generateAsteroidBelt(params.asteroidCount || 300);
        }

        const w  = canvas.width;
        const h  = canvas.height;
        const s  = Math.min(w, h);
        const cx = w / 2;
        const cy = h / 2;
        // SOL-03: use configurable time rate
        const T  = this._computeT(params, _frame);

        const distanceScaleParam = params.distanceScale || 0.45;
        const planetScale        = params.planetScale   || 1.0;
        const cs         = s * distanceScaleParam;
        const maxDist    = scaleDistance(this._planets[this._planets.length - 1].a0);
        const distScale  = cs / maxDist;
        const sunRadius  = s * 0.04;
        const sizeScale  = sunRadius / 695700 * planetScale;

        // Clear canvas. When belt is shown, ImageData overwrites this with opaque black;
        // keeping the fillRect ensures a clean background when the belt is hidden.
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        // Asteroid belt rendered via ImageData before ctx.translate so the sun and
        // planets composited afterwards are not obscured by opaque ImageData pixels.
        if (params.showAsteroidBelt) {
            this._drawAsteroidBelt(ctx, distScale, cx, cy, w, h);
        }

        ctx.save();
        ctx.translate(cx, cy);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 695700 * sizeScale, 0, TWO_PI);
        ctx.fill();

        // Update hover detection in canvas coordinate space (translate already applied)
        if (this._pointerX != null) {
            const mx = this._pointerX - cx;
            const my = this._pointerY - cy;
            let closest = Infinity;
            this._hoveredPlanet = null;
            for (const planet of this._planets) {
                const dx = mx - planet.screenX;
                const dy = my - planet.screenY;
                const d2 = dx * dx + dy * dy;
                const threshold = Math.max(planet.screenRadius + 8, 12);
                if (d2 <= threshold * threshold && d2 < closest) {
                    closest = d2;
                    this._hoveredPlanet = planet;
                }
            }
        }

        let earthData = null;
        for (let i = 0; i < this._planets.length; i++) {
            const planet = this._planets[i];
            const pos    = computePlanetPosition(planet, T);
            const angle  = Math.atan2(pos.y, pos.x);
            const sd     = scaleDistance(pos.distance) * distScale;
            const px     = sd * Math.cos(angle);
            const py     = sd * Math.sin(angle);

            // SOL-01: use configured size mode
            const displayRadius = this._planetDisplayRadius(planet, sizeScale, params.sizeMode || 'proportional', sunRadius);
            planet.screenX      = px;
            planet.screenY      = py;
            planet.screenRadius = displayRadius;
            planet._orbitAngleDeg = angle * (180 / Math.PI);
            planet._distAU        = pos.distance;

            if (planet.name === 'Earth') {
                earthData = { x: px, y: py, angle, radius: planet.screenRadius };
            }

            ctx.fillStyle = planet.color;
            ctx.beginPath();
            ctx.arc(px, py, planet.screenRadius, 0, TWO_PI);
            ctx.fill();

            // SOL-02: terminator shading
            if (params.showTerminator) {
                this._drawTerminator(ctx, px, py, planet.screenRadius, angle);
            }

            if (params.showLabels) {
                ctx.fillStyle  = '#808080';
                ctx.font       = FONT_LG;
                ctx.textAlign  = 'center';
                ctx.fillText(planet.name, px, py - planet.screenRadius - 4);
            }
        }

        // SOL-04: draw moons after planets so they layer on top of orbits
        if (params.showMoons) {
            this._drawMoons(ctx, distScale, T, sizeScale, params);
        }

        if (earthData && params.showViewer) {
            const solarTime   = this._getLocalSolarTime();
            const viewerAngle = earthData.angle + solarTime * TWO_PI;
            const vx          = earthData.x + earthData.radius * Math.cos(viewerAngle);
            const vy          = earthData.y + earthData.radius * Math.sin(viewerAngle);
            const fovRad      = (params.fovAngle || 30) * DEG_TO_RAD;
            const coneLen     = 20;
            const la          = viewerAngle - fovRad / 2;
            const ra          = viewerAngle + fovRad / 2;

            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth   = 1;
            ctx.beginPath();
            ctx.moveTo(vx, vy);
            ctx.lineTo(vx + coneLen * Math.cos(la), vy + coneLen * Math.sin(la));
            ctx.moveTo(vx, vy);
            ctx.lineTo(vx + coneLen * Math.cos(ra), vy + coneLen * Math.sin(ra));
            ctx.stroke();

            // SOL-05: viewer reticle (crosshairs + ring + time label) or simple dot
            if (params.showReticle) {
                this._drawViewerReticle(ctx, vx, vy, solarTime);
            } else {
                ctx.fillStyle = '#00ffff';
                ctx.beginPath();
                ctx.arc(vx, vy, 2, 0, TWO_PI);
                ctx.fill();
            }
        }

        ctx.restore();

        // Planet tooltip (SOL-06)
        if (this._hoveredPlanet && this._pointerX != null) {
            const p   = this._hoveredPlanet;
            const pos = computePlanetPosition(p, T);
            // Mean orbital velocity in km/s: v ≈ 2π × a × 1.496e8 km / (period_years × 3.156e7 s)
            const periodYears = Math.pow(pos.distance, 1.5);
            const velKmS = (TWO_PI * pos.distance * 1.496e8) / (periodYears * 3.156e7);
            const angleDeg = ((p._orbitAngleDeg % 360) + 360) % 360;

            const lines = [
                p.name.toUpperCase(),
                `dist   ${pos.distance.toFixed(3)} AU`,
                `angle  ${angleDeg.toFixed(1)}°`,
                `vel    ${velKmS.toFixed(1)} km/s`,
            ];

            const pad  = 8;
            const lh   = 14;
            const tw   = 136;
            const th   = lines.length * lh + pad * 2;
            let tx = this._pointerX + 14;
            let ty = this._pointerY - th / 2;
            if (tx + tw > w) tx = this._pointerX - tw - 14;
            if (ty < 0)      ty = 0;
            if (ty + th > h) ty = h - th;

            ctx.save();
            ctx.globalAlpha = 0.82;
            ctx.fillStyle = '#000000';
            ctx.fillRect(tx, ty, tw, th);
            ctx.restore();
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1;
            ctx.strokeRect(tx + 0.5, ty + 0.5, tw - 1, th - 1);

            ctx.font      = FONT_LG;
            ctx.textAlign = 'left';
            for (let i = 0; i < lines.length; i++) {
                ctx.fillStyle = i === 0 ? p.color : '#c0c0c0';
                ctx.fillText(lines[i], tx + pad, ty + pad + i * lh + 9);
            }
        }

        if (params.showInfo) {
            const hrs = Math.floor((Date.now() - EMU_WAR_MS) / 3600000);
            ctx.fillStyle = '#808080';
            ctx.font      = FONT_LG;
            ctx.textAlign = 'center';
            ctx.fillText(hrs.toLocaleString() + ' hours since the Great Emu War', cx, h - 20);

            const earthPos   = computePlanetPosition(this._planets[2], T);
            const plutoAngle = T * 0.004;
            const plutoX     = 39.48 * Math.cos(plutoAngle);
            const plutoY     = 39.48 * Math.sin(plutoAngle);
            const distAU     = Math.sqrt((plutoX - earthPos.x) ** 2 + (plutoY - earthPos.y) ** 2);
            const distGiraff = distAU * 149597870700 / 36;
            ctx.fillText(
                distGiraff.toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' giraffe intestines to Pluto',
                cx, h - 36
            );
        }

        // SOL-07: multi-scale time panel overlay
        if (params.showTimePanel) {
            this._drawTimePanel(ctx, w, h, params.timePanelScale || 'years');
        }
    }
};
