/**
 * Solar System Script - Real-time planetary positions
 * Uses NASA JPL Keplerian elements for accurate orbital mechanics
 * 
 * @script solar-system
 * @category other
 * @version 4.0.0
 */

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const J2000_MS = 946728000000;
const EMU_WAR_MS = new Date(1932, 10, 2, 11, 0, 0).getTime();
const DEG_TO_RAD = Math.PI / 180;
const TWO_PI = Math.PI * 2;
const E_STAR_FACTOR = 57.29578;

// NASA JPL Keplerian Elements
const PLANET_DATA = [
    {name: 'Mercury', a0: 0.38709927, aDot: 0.00000037, e0: 0.20563593, eDot: 0.00001906, I0: 7.00497902, IDot: -0.00594749, L0: 252.25032350, LDot: 149472.67411175, w0: 77.45779628, wDot: 0.16047689, O0: 48.33076593, ODot: -0.12534081, color: '#c0c0c0', radius: 2439.7},
    {name: 'Venus', a0: 0.72333566, aDot: 0.00000390, e0: 0.00677672, eDot: -0.00004107, I0: 3.39467605, IDot: -0.00078890, L0: 181.97909950, LDot: 58517.81538729, w0: 131.60246718, wDot: 0.00268329, O0: 76.67984255, ODot: -0.27769418, color: '#ffff00', radius: 6051.8},
    {name: 'Earth', a0: 1.00000261, aDot: 0.00000562, e0: 0.01671123, eDot: -0.00004392, I0: -0.00001531, IDot: -0.01294668, L0: 100.46457166, LDot: 35999.37244981, w0: 102.93768193, wDot: 0.32327364, O0: 0.0, ODot: 0.0, color: '#00ffff', radius: 6371},
    {name: 'Mars', a0: 1.52371034, aDot: 0.00001847, e0: 0.09339410, eDot: 0.00007882, I0: 1.84969142, IDot: -0.00813131, L0: -4.55343205, LDot: 19140.30268499, w0: -23.94362959, wDot: 0.44441088, O0: 49.55953891, ODot: -0.29257343, color: '#ff0000', radius: 3389.5},
    {name: 'Jupiter', a0: 5.20288700, aDot: -0.00011607, e0: 0.04838624, eDot: -0.00013253, I0: 1.30439695, IDot: -0.00183714, L0: 34.39644051, LDot: 3034.74612775, w0: 14.72847983, wDot: 0.21252668, O0: 100.47390909, ODot: 0.20469106, color: '#ffff00', radius: 69911},
    {name: 'Saturn', a0: 9.53667594, aDot: -0.00125060, e0: 0.05386179, eDot: -0.00050991, I0: 2.48599187, IDot: 0.00193609, L0: 49.95424423, LDot: 1222.49362201, w0: 92.59887831, wDot: -0.41897216, O0: 113.66242448, ODot: -0.28867794, color: '#808000', radius: 58232},
    {name: 'Uranus', a0: 19.18916464, aDot: -0.00196176, e0: 0.04725744, eDot: -0.00004397, I0: 0.77263783, IDot: -0.00242939, L0: 313.23810451, LDot: 428.48202785, w0: 170.95427630, wDot: 0.40805281, O0: 74.01692503, ODot: 0.04240589, color: '#008080', radius: 25362},
    {name: 'Neptune', a0: 30.06992276, aDot: 0.00026291, e0: 0.00859048, eDot: 0.00005105, I0: 1.77004347, IDot: 0.00035372, L0: -55.12002969, LDot: 218.45945325, w0: 44.96476227, wDot: -0.32241464, O0: 131.78422574, ODot: -0.00508664, color: '#0000ff', radius: 24622}
];

// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════

let planets = [];
let asteroidParticles = [];
let asteroidCached = null;
let longitude = null;
let latitude = null;
let locationRequested = false;

// ═══════════════════════════════════════════════════════════════════
// ORBITAL MECHANICS
// ═══════════════════════════════════════════════════════════════════

function initializePlanets() {
    planets = PLANET_DATA.map(data => ({
        ...data,
        cachedPos: null,
        lastT: null,
        screenX: 0,
        screenY: 0,
        screenRadius: 0
    }));
}

function getCenturiesPastJ2000() {
    const daysSinceJ2000 = (Date.now() - J2000_MS) / 86400000;
    return daysSinceJ2000 / 36525;
}

function getLocalSolarTime() {
    const d = new Date();
    const hours = d.getUTCHours();
    const minutes = d.getUTCMinutes();
    const seconds = d.getUTCSeconds();
    const timeOfDayUTC = (hours + minutes / 60 + seconds / 3600) / 24;
    
    if (longitude !== null) {
        const longitudeHours = longitude / 15;
        let solarTime = (timeOfDayUTC + longitudeHours / 24) % 1;
        if (solarTime < 0) solarTime += 1;
        return solarTime;
    }
    return (d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600) / 24;
}

function solveKeplerEquation(M, e) {
    const eStar = E_STAR_FACTOR * e;
    const MRad = M * DEG_TO_RAD;
    let E = M + eStar * Math.sin(MRad);
    
    const tol = 1e-6;
    let iter = 0;
    const maxIter = 30;
    
    while (iter < maxIter) {
        const ERad = E * DEG_TO_RAD;
        const sinE = Math.sin(ERad);
        const cosE = Math.cos(ERad);
        const deltaM = M - (E - eStar * sinE);
        if (Math.abs(deltaM) < tol) break;
        E += deltaM / (1 - e * cosE);
        iter++;
    }
    return E;
}

function normalizeAngle(angle) {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
}

function computePlanetPosition(planet, T) {
    if (planet.cachedPos !== null && planet.lastT === T) {
        return planet.cachedPos;
    }
    
    const a = planet.a0 + planet.aDot * T;
    const e = planet.e0 + planet.eDot * T;
    const I = planet.I0 + planet.IDot * T;
    const L = planet.L0 + planet.LDot * T;
    const wBar = planet.w0 + planet.wDot * T;
    const O = planet.O0 + planet.ODot * T;
    
    const w = wBar - O;
    const M = normalizeAngle(L - wBar);
    const EAngle = solveKeplerEquation(M, e);
    const ERad = EAngle * DEG_TO_RAD;
    
    const cosE = Math.cos(ERad);
    const sinE = Math.sin(ERad);
    const sqrtFactor = Math.sqrt(1 - e * e);
    
    const xPrime = a * (cosE - e);
    const yPrime = a * sqrtFactor * sinE;
    
    const wRad = w * DEG_TO_RAD;
    const ORad = O * DEG_TO_RAD;
    const IRad = I * DEG_TO_RAD;
    
    const cosW = Math.cos(wRad);
    const sinW = Math.sin(wRad);
    const cosO = Math.cos(ORad);
    const sinO = Math.sin(ORad);
    const cosI = Math.cos(IRad);
    
    const xEcl = (cosW * cosO - sinW * sinO * cosI) * xPrime + 
               (-sinW * cosO - cosW * sinO * cosI) * yPrime;
    const yEcl = (cosW * sinO + sinW * cosO * cosI) * xPrime + 
               (-sinW * sinO + cosW * cosO * cosI) * yPrime;
    
    planet.cachedPos = {
        x: xEcl,
        y: yEcl,
        distance: Math.sqrt(xEcl * xEcl + yEcl * yEcl)
    };
    planet.lastT = T;
    return planet.cachedPos;
}

function scaleDistance(distanceAU) {
    return Math.log(distanceAU * 10 + 1);
}

// ═══════════════════════════════════════════════════════════════════
// ASTEROID BELT
// ═══════════════════════════════════════════════════════════════════

function generateAsteroidBelt(count) {
    asteroidParticles = [];
    const colors = ['#ffffff', '#808080'];
    const innerRadius = 2.2;
    const outerRadius = 3.2;
    
    for (let i = 0; i < count; i++) {
        asteroidParticles.push({
            angle: Math.random() * TWO_PI,
            distance: innerRadius + Math.random() * (outerRadius - innerRadius),
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    asteroidCached = null;
}

function drawAsteroidBelt(ctx, distScale) {
    if (!asteroidCached) {
        asteroidCached = [];
        for (let i = 0; i < asteroidParticles.length; i++) {
            const p = asteroidParticles[i];
            const scaledDist = scaleDistance(p.distance);
            asteroidCached.push({
                x: scaledDist * Math.cos(p.angle),
                y: scaledDist * Math.sin(p.angle),
                color: p.color
            });
        }
    }
    
    for (let i = 0; i < asteroidCached.length; i++) {
        const p = asteroidCached[i];
        const x = p.x * distScale;
        const y = p.y * distScale;
        ctx.fillStyle = p.color;
        ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
    }
}

// ═══════════════════════════════════════════════════════════════════
// GEOLOCATION
// ═══════════════════════════════════════════════════════════════════

function requestLocation() {
    if (locationRequested) return;
    locationRequested = true;
    
    fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
            longitude = data.longitude;
            latitude = data.latitude;
        })
        .catch(() => {
            // Silent fail - use local time
        });
}

// ═══════════════════════════════════════════════════════════════════
// DRAW FUNCTION
// ═══════════════════════════════════════════════════════════════════

function draw(ctx, canvas, params, frame) {
    // Initialize on first frame
    if (planets.length === 0) {
        initializePlanets();
        generateAsteroidBelt(params.asteroidCount || 300);
        requestLocation();
    }
    
    // Regenerate asteroids if count changed
    if (asteroidParticles.length !== (params.asteroidCount || 300)) {
        generateAsteroidBelt(params.asteroidCount || 300);
    }
    
    const s = Math.min(canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const T = getCenturiesPastJ2000();
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set up coordinate system
    ctx.save();
    ctx.translate(cx, cy);
    
    // Calculate scales
    const distanceScale = params.distanceScale || 0.45;
    const planetScale = params.planetScale || 1.0;
    const cs = s * distanceScale;
    const maxDist = scaleDistance(planets[planets.length - 1].a0);
    const distScale = cs / maxDist;
    const sunDisplayRadius = s * 0.04;
    const sizeScale = sunDisplayRadius / 695700 * planetScale;
    
    // Draw sun
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 695700 * sizeScale, 0, TWO_PI);
    ctx.fill();
    
    // Draw asteroid belt
    if (params.showAsteroidBelt) {
        drawAsteroidBelt(ctx, distScale);
    }
    
    // Draw planets
    let earthData = null;
    for (let i = 0; i < planets.length; i++) {
        const planet = planets[i];
        const pos = computePlanetPosition(planet, T);
        const angle = Math.atan2(pos.y, pos.x);
        const scaledDist = scaleDistance(pos.distance) * distScale;
        
        const px = scaledDist * Math.cos(angle);
        const py = scaledDist * Math.sin(angle);
        
        planet.screenX = px;
        planet.screenY = py;
        planet.screenRadius = Math.max(planet.radius * sizeScale, 2);
        
        if (planet.name === 'Earth') {
            earthData = {x: px, y: py, angle: angle, radius: planet.screenRadius};
        }
        
        // Draw planet
        ctx.fillStyle = planet.color;
        ctx.beginPath();
        ctx.arc(px, py, planet.screenRadius, 0, TWO_PI);
        ctx.fill();
        
        // Draw planet label if enabled
        if (params.showLabels) {
            ctx.fillStyle = '#808080';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(planet.name, px, py - planet.screenRadius - 4);
        }
    }
    
    // Draw viewer position on Earth
    if (earthData && params.showViewer) {
        const localSolarTime = getLocalSolarTime();
        const rotationAngle = localSolarTime * TWO_PI;
        const viewerAngle = earthData.angle + rotationAngle;
        
        const viewerX = earthData.x + earthData.radius * Math.cos(viewerAngle);
        const viewerY = earthData.y + earthData.radius * Math.sin(viewerAngle);
        
        // Draw FOV cone
        const fovAngle = params.fovAngle || 30;
        const fovRad = fovAngle * DEG_TO_RAD;
        const coneLength = 20;
        const leftAngle = viewerAngle - fovRad / 2;
        const rightAngle = viewerAngle + fovRad / 2;
        
        const leftX = viewerX + coneLength * Math.cos(leftAngle);
        const leftY = viewerY + coneLength * Math.sin(leftAngle);
        const rightX = viewerX + coneLength * Math.cos(rightAngle);
        const rightY = viewerY + coneLength * Math.sin(rightAngle);
        
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(viewerX, viewerY);
        ctx.lineTo(leftX, leftY);
        ctx.moveTo(viewerX, viewerY);
        ctx.lineTo(rightX, rightY);
        ctx.stroke();
        
        // Draw viewer dot
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(viewerX, viewerY, 2, 0, TWO_PI);
        ctx.fill();
    }
    
    ctx.restore();
    
    // Draw info text
    if (params.showInfo) {
        const hrs = Math.floor((Date.now() - EMU_WAR_MS) / 3600000);
        ctx.fillStyle = '#808080';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(hrs.toLocaleString() + ' hours since the Great Emu War', cx, canvas.height - 20);
        
        // Calculate distance to Pluto
        const earthPos = computePlanetPosition(planets[2], T);
        const plutoA = 39.48;
        const plutoAngle = T * 0.004;
        const plutoX = plutoA * Math.cos(plutoAngle);
        const plutoY = plutoA * Math.sin(plutoAngle);
        const distAU = Math.sqrt(Math.pow(plutoX - earthPos.x, 2) + Math.pow(plutoY - earthPos.y, 2));
        const distMeters = distAU * 149597870700;
        const distGiraffes = distMeters / 36;
        ctx.fillText(distGiraffes.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' Giraffe intestines to Pluto', cx, canvas.height - 36);
    }
}

// ═══════════════════════════════════════════════════════════════════
// SCRIPT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export const SCRIPT_CONFIG = {
    id: 'solar-system',
    title: 'Solar System',
    category: 'other',
    description: 'Real-time planetary positions using NASA JPL Keplerian elements. Shows accurate orbital mechanics with viewer position on Earth.',
    version: '4.0.0',
    
    canvas: {
        width: 800,
        height: 800,
        context: '2d',
        background: '#000000'
    },
    
    animation: {
        type: 'infinite',
        defaultFps: 1,
        canPrerender: false
    },
    
    export: {
        png: true,
        svg: true,
        gif: false,
        webm: false,
        sequence: false
    },
    
    presets: [
        {
            name: 'Default',
            values: {
                distanceScale: 0.45,
                planetScale: 1.0,
                asteroidCount: 300,
                showAsteroidBelt: true,
                showViewer: true,
                showLabels: false,
                showInfo: true,
                fovAngle: 30
            }
        },
        {
            name: 'Dense Belt',
            values: {
                distanceScale: 0.45,
                planetScale: 1.0,
                asteroidCount: 1000,
                showAsteroidBelt: true,
                showViewer: false,
                showLabels: true,
                showInfo: true,
                fovAngle: 30
            }
        },
        {
            name: 'Minimal',
            values: {
                distanceScale: 0.5,
                planetScale: 1.5,
                asteroidCount: 100,
                showAsteroidBelt: false,
                showViewer: false,
                showLabels: true,
                showInfo: false,
                fovAngle: 30
            }
        }
    ],
    
    parameters: [
        {
            group: 'Display',
            params: [
                {
                    key: 'distanceScale',
                    type: 'slider',
                    label: 'Distance Scale',
                    min: 0.2,
                    max: 0.8,
                    step: 0.05,
                    default: 0.45,
                    precision: 2
                },
                {
                    key: 'planetScale',
                    type: 'slider',
                    label: 'Planet Scale',
                    min: 0.5,
                    max: 3.0,
                    step: 0.1,
                    default: 1.0,
                    precision: 1
                },
                {
                    key: 'showLabels',
                    type: 'toggle',
                    label: 'Show Labels',
                    default: false
                },
                {
                    key: 'showInfo',
                    type: 'toggle',
                    label: 'Show Info',
                    default: true
                }
            ]
        },
        {
            group: 'Asteroid Belt',
            params: [
                {
                    key: 'asteroidCount',
                    type: 'slider',
                    label: 'Particles',
                    min: 100,
                    max: 1000,
                    step: 50,
                    default: 300
                },
                {
                    key: 'showAsteroidBelt',
                    type: 'toggle',
                    label: 'Show Belt',
                    default: true
                }
            ]
        },
        {
            group: 'Viewer',
            params: [
                {
                    key: 'showViewer',
                    type: 'toggle',
                    label: 'Show Viewer',
                    default: true
                },
                {
                    key: 'fovAngle',
                    type: 'slider',
                    label: 'FOV Angle',
                    min: 10,
                    max: 90,
                    step: 5,
                    default: 30
                }
            ]
        },
        {
            group: 'Canvas',
            params: [
                {
                    key: 'canvasWidth',
                    type: 'slider',
                    label: 'Width',
                    min: 400,
                    max: 1600,
                    step: 100,
                    default: 800
                },
                {
                    key: 'canvasHeight',
                    type: 'slider',
                    label: 'Height',
                    min: 400,
                    max: 1600,
                    step: 100,
                    default: 800
                }
            ]
        }
    ],
    
    draw: draw
};

console.log('✅ Solar System script loaded');
