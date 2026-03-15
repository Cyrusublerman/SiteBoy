/**
 * Solar System Script - Real-time planetary positions
 * Uses NASA JPL Keplerian elements for accurate orbital mechanics
 *
 * @script solar-system
 * @category other
 * @version 5.0.0
 */

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const J2000_MS = 946728000000;
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
        type:            'infinite',
        defaultFps:      1,
        sequencer:       false,
        animatableParams: []
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
    _asteroidCached: null,       // normalised log-scale positions per particle
    _beltDistScale: null,        // distScale at which _beltScreenCache was built
    _beltCX: null,               // cx at which _beltScreenCache was built
    _beltCY: null,               // cy at which _beltScreenCache was built
    _beltScreenCache: null,      // absolute pixel positions for current distScale/cx/cy
    _longitude: null,
    _latitude: null,
    _locationRequested: false,

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

    // ── Parameters (inert canvasWidth/Height removed) ─────────────────
    parameters: [
        {
            group: 'Display',
            params: [
                { key: 'distanceScale',  type: 'slider', label: 'Distance Scale', min: 0.2,  max: 0.8,  step: 0.05, default: 0.45, precision: 2 },
                { key: 'planetScale',    type: 'slider', label: 'Planet Scale',   min: 0.5,  max: 3.0,  step: 0.1,  default: 1.0,  precision: 1 },
                { key: 'showLabels',     type: 'toggle', label: 'Show Labels',    default: false },
                { key: 'showInfo',       type: 'toggle', label: 'Show Info',      default: true  }
            ]
        },
        {
            group: 'Asteroid Belt',
            params: [
                { key: 'asteroidCount',    type: 'slider', label: 'Particles',  min: 100, max: 1000, step: 50, default: 300 },
                { key: 'showAsteroidBelt', type: 'toggle', label: 'Show Belt',  default: true }
            ]
        },
        {
            group: 'Viewer',
            params: [
                { key: 'showViewer', type: 'toggle', label: 'Show Viewer', default: true },
                { key: 'fovAngle',   type: 'slider', label: 'FOV Angle',   min: 10, max: 90, step: 5, default: 30 }
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

    // _frame is intentionally unused — this generator reads Date.now() directly.
    // Frame-indexed animation is not meaningful for a real-time astronomical display.
    draw(ctx, canvas, params, _frame) {
        if (this._planets.length === 0) {
            this._initializePlanets();
            this._generateAsteroidBelt(params.asteroidCount || 300);
            this._requestLocation();
        }

        if (this._asteroidParticles.length !== (params.asteroidCount || 300)) {
            this._generateAsteroidBelt(params.asteroidCount || 300);
        }

        const w  = canvas.width;
        const h  = canvas.height;
        const s  = Math.min(w, h);
        const cx = w / 2;
        const cy = h / 2;
        const T  = getCenturiesPastJ2000();

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

        let earthData = null;
        for (let i = 0; i < this._planets.length; i++) {
            const planet = this._planets[i];
            const pos    = computePlanetPosition(planet, T);
            const angle  = Math.atan2(pos.y, pos.x);
            const sd     = scaleDistance(pos.distance) * distScale;
            const px     = sd * Math.cos(angle);
            const py     = sd * Math.sin(angle);

            planet.screenX      = px;
            planet.screenY      = py;
            planet.screenRadius = Math.max(planet.radius * sizeScale, 2);

            if (planet.name === 'Earth') {
                earthData = { x: px, y: py, angle, radius: planet.screenRadius };
            }

            ctx.fillStyle = planet.color;
            ctx.beginPath();
            ctx.arc(px, py, planet.screenRadius, 0, TWO_PI);
            ctx.fill();

            if (params.showLabels) {
                ctx.fillStyle  = '#808080';
                ctx.font       = '10px "Space Mono", monospace';
                ctx.textAlign  = 'center';
                ctx.fillText(planet.name, px, py - planet.screenRadius - 4);
            }
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

            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(vx, vy, 2, 0, TWO_PI);
            ctx.fill();
        }

        ctx.restore();

        if (params.showInfo) {
            const hrs = Math.floor((Date.now() - EMU_WAR_MS) / 3600000);
            ctx.fillStyle = '#808080';
            ctx.font      = '10px "Space Mono", monospace';
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
    }
};
