/**
 * Solar System Tool - ToolBase Declarative Format
 *
 * Real-time planetary positions using NASA JPL Keplerian elements
 * Features accurate orbital mechanics and viewer position on Earth
 *
 * @version 4.0.0 - ES Module conversion
 */

// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { ThrottledLoop } from '../../core/animation-foundation.js';

// ES Module constants and state

    // ═══════════════════════════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════════════

    const J2000_MS = 946728000000;
    const EMU_WAR_MS = new Date(1932, 10, 2, 11, 0, 0).getTime();
    const DEG_TO_RAD = Math.PI / 180;
    const TWO_PI = Math.PI * 2;
    const E_STAR_FACTOR = 57.29578;

    // NASA JPL Keplerian Elements
    const PLANET_DATA = [
        {name: 'Mercury', a0: 0.38709927, aDot: 0.00000037, e0: 0.20563593, eDot: 0.00001906, I0: 7.00497902, IDot: -0.00594749, L0: 252.25032350, LDot: 149472.67411175, w0: 77.45779628, wDot: 0.16047689, O0: 48.33076593, ODot: -0.12534081, color: '#FFFFFF', radius: 2439.7},
        {name: 'Venus', a0: 0.72333566, aDot: 0.00000390, e0: 0.00677672, eDot: -0.00004107, I0: 3.39467605, IDot: -0.00078890, L0: 181.97909950, LDot: 58517.81538729, w0: 131.60246718, wDot: 0.00268329, O0: 76.67984255, ODot: -0.27769418, color: '#FFFFFF', radius: 6051.8},
        {name: 'Earth', a0: 1.00000261, aDot: 0.00000562, e0: 0.01671123, eDot: -0.00004392, I0: -0.00001531, IDot: -0.01294668, L0: 100.46457166, LDot: 35999.37244981, w0: 102.93768193, wDot: 0.32327364, O0: 0.0, ODot: 0.0, color: '#0000FF', radius: 6371},
        {name: 'Mars', a0: 1.52371034, aDot: 0.00001847, e0: 0.09339410, eDot: 0.00007882, I0: 1.84969142, IDot: -0.00813131, L0: -4.55343205, LDot: 19140.30268499, w0: -23.94362959, wDot: 0.44441088, O0: 49.55953891, ODot: -0.29257343, color: '#FFFFFF', radius: 3389.5},
        {name: 'Jupiter', a0: 5.20288700, aDot: -0.00011607, e0: 0.04838624, eDot: -0.00013253, I0: 1.30439695, IDot: -0.00183714, L0: 34.39644051, LDot: 3034.74612775, w0: 14.72847983, wDot: 0.21252668, O0: 100.47390909, ODot: 0.20469106, color: '#FFFFFF', radius: 69911},
        {name: 'Saturn', a0: 9.53667594, aDot: -0.00125060, e0: 0.05386179, eDot: -0.00050991, I0: 2.48599187, IDot: 0.00193609, L0: 49.95424423, LDot: 1222.49362201, w0: 92.59887831, wDot: -0.41897216, O0: 113.66242448, ODot: -0.28867794, color: '#FFFFFF', radius: 58232},
        {name: 'Uranus', a0: 19.18916464, aDot: -0.00196176, e0: 0.04725744, eDot: -0.00004397, I0: 0.77263783, IDot: -0.00242939, L0: 313.23810451, LDot: 428.48202785, w0: 170.95427630, wDot: 0.40805281, O0: 74.01692503, ODot: 0.04240589, color: '#FFFFFF', radius: 25362},
        {name: 'Neptune', a0: 30.06992276, aDot: 0.00026291, e0: 0.00859048, eDot: 0.00005105, I0: 1.77004347, IDot: 0.00035372, L0: -55.12002969, LDot: 218.45945325, w0: 44.96476227, wDot: -0.32241464, O0: 131.78422574, ODot: -0.00508664, color: '#FFFFFF', radius: 24622}
    ];

    // ═══════════════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════════════

    let planets = [];
    let asteroidParticles = [];
    let asteroidCached = null;
    let selectedPlanets = [];
    let longitude = null;
    let latitude = null;
    let animator = null;

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CONFIG
    // ═══════════════════════════════════════════════════════════════════════════════

    const TOOL_CONFIG = {
        title: 'SOLAR SYSTEM',
        
        sidebar: [
            ['CONTROLS', [
                ['Display', [
                    ['slider', 'Distance Scale', 0.2, 0.8, 0.05, { value: 0.45, precision: 2, withNumber: true, key: 'distanceScale' }],
                    ['slider', 'Planet Scale', 0.5, 3.0, 0.1, { value: 1.0, precision: 1, withNumber: true, key: 'planetScale' }],
                ]],
                ['Asteroid Belt', [
                    ['slider', 'Particles', 100, 1000, 50, { value: 300, withNumber: true, key: 'asteroidCount' }],
                    ['toggle', 'Show Belt', ['Enabled'], { key: 'showAsteroidBelt', selectedValues: ['Enabled'] }],
                ]],
                ['Viewer', [
                    ['slider', 'FOV Angle', 10, 90, 5, { value: 30, withNumber: true, key: 'fovAngle' }],
                    ['toggle', 'Show Viewer', ['Enabled'], { key: 'showViewer', selectedValues: ['Enabled'] }],
                ]],
                ['Info', [
                    ['label', 'Click planets to select', { variant: 'caption' }],
                    ['label', 'Uses NASA JPL ephemeris', { variant: 'caption' }],
                ]],
            ]],
            ['EXPORT', [
                ['Canvas', [
                    ['slider', 'Width', 420, 2048, 1, { value: 420, key: 'canvasWidth', withNumber: true }],
                    ['slider', 'Height', 420, 2048, 1, { value: 420, key: 'canvasHeight', withNumber: true }],
                ]],
                ['Download', [
                    ['button', 'Export PNG', null, { key: 'exportPng' }],
                    ['button', 'Export SVG', null, { key: 'exportSvg' }],
                ]],
            ]],
        ],
        
        canvas: { size: 420 },
        
        onInit: function(values) {
            var self = this;
            
            // Initialize planets
            initializePlanets();
            
            // Generate asteroid belt
            generateAsteroidBelt(values.asteroidCount || 300);
            
            // Request geolocation
            requestLocation();
            
            // Initialize animation
            initAnimator(this);
            startAnimation();
            
            // Add click handler for planet selection
            var canvas = this.getCanvas();
            if (canvas) {
                canvas.addEventListener('click', function(e) {
                    handleCanvasClick(e, canvas);
                });
            }
            
            // Wire export PNG button
            var exportPngBtn = this.getComponent('exportPng');
            if (exportPngBtn && exportPngBtn.element) {
                exportPngBtn.element.addEventListener('click', function() {
                    exportPng(self);
                });
            }
            
            // Wire export SVG button
            var exportSvgBtn = this.getComponent('exportSvg');
            if (exportSvgBtn && exportSvgBtn.element) {
                exportSvgBtn.element.addEventListener('click', function() {
                    exportSvg(self);
                });
            }
        },
        
        onUpdate: function(key, value, allValues) {
            if (key === 'asteroidCount') {
                generateAsteroidBelt(value);
                asteroidCached = null;
            }
            
            // Handle canvas resize
            if (key === 'canvasWidth' || key === 'canvasHeight') {
                this.resizeCanvas(allValues.canvasWidth, allValues.canvasHeight);
                this.draw();
            }
        },
        
        onDraw: function(ctx, canvas, values) {
            renderSolarSystem(ctx, canvas, values);
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // ORBITAL MECHANICS
    // ═══════════════════════════════════════════════════════════════════════════════

    function initializePlanets() {
        planets = PLANET_DATA.map(function(data) {
            return Object.assign({}, data, {
                cachedPos: null,
                lastT: null,
                screenX: 0,
                screenY: 0,
                screenRadius: 0
            });
        });
    }

    function getCenturiesPastJ2000() {
        var daysSinceJ2000 = (Date.now() - J2000_MS) / 86400000;
        return daysSinceJ2000 / 36525;
    }

    function getLocalSolarTime() {
        var d = new Date();
        var hours = d.getUTCHours();
        var minutes = d.getUTCMinutes();
        var seconds = d.getUTCSeconds();
        var timeOfDayUTC = (hours + minutes / 60 + seconds / 3600) / 24;
        
        if (longitude !== null) {
            var longitudeHours = longitude / 15;
            var solarTime = (timeOfDayUTC + longitudeHours / 24) % 1;
            if (solarTime < 0) solarTime += 1;
            return solarTime;
        }
        return (d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600) / 24;
    }

    function solveKeplerEquation(M, e) {
        var eStar = E_STAR_FACTOR * e;
        var MRad = M * DEG_TO_RAD;
        var E = M + eStar * Math.sin(MRad);
        
        var tol = 1e-6;
        var iter = 0;
        var maxIter = 30;
        
        while (iter < maxIter) {
            var ERad = E * DEG_TO_RAD;
            var sinE = Math.sin(ERad);
            var cosE = Math.cos(ERad);
            var deltaM = M - (E - eStar * sinE);
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
        
        var a = planet.a0 + planet.aDot * T;
        var e = planet.e0 + planet.eDot * T;
        var I = planet.I0 + planet.IDot * T;
        var L = planet.L0 + planet.LDot * T;
        var wBar = planet.w0 + planet.wDot * T;
        var O = planet.O0 + planet.ODot * T;
        
        var w = wBar - O;
        var M = normalizeAngle(L - wBar);
        var E = solveKeplerEquation(M, e);
        var ERad = E * DEG_TO_RAD;
        
        var cosE = Math.cos(ERad);
        var sinE = Math.sin(ERad);
        var sqrtFactor = Math.sqrt(1 - e * e);
        
        var xPrime = a * (cosE - e);
        var yPrime = a * sqrtFactor * sinE;
        
        var wRad = w * DEG_TO_RAD;
        var ORad = O * DEG_TO_RAD;
        var IRad = I * DEG_TO_RAD;
        
        var cosW = Math.cos(wRad);
        var sinW = Math.sin(wRad);
        var cosO = Math.cos(ORad);
        var sinO = Math.sin(ORad);
        var cosI = Math.cos(IRad);
        
        var xEcl = (cosW * cosO - sinW * sinO * cosI) * xPrime + 
                   (-sinW * cosO - cosW * sinO * cosI) * yPrime;
        var yEcl = (cosW * sinO + sinW * cosO * cosI) * xPrime + 
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

    // ═══════════════════════════════════════════════════════════════════════════════
    // ASTEROID BELT
    // ═══════════════════════════════════════════════════════════════════════════════

    function generateAsteroidBelt(count) {
        asteroidParticles = [];
        var colors = ['white', 'black'];
        var innerRadius = 2.2;
        var outerRadius = 3.2;
        
        for (var i = 0; i < count; i++) {
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
            for (var i = 0; i < asteroidParticles.length; i++) {
                var p = asteroidParticles[i];
                var scaledDist = scaleDistance(p.distance);
                asteroidCached.push({
                    x: scaledDist * Math.cos(p.angle),
                    y: scaledDist * Math.sin(p.angle),
                    color: p.color
                });
            }
        }
        
        for (var i = 0; i < asteroidCached.length; i++) {
            var p = asteroidCached[i];
            var x = p.x * distScale;
            var y = p.y * distScale;
            ctx.fillStyle = p.color;
            ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // RENDERING
    // ═══════════════════════════════════════════════════════════════════════════════

    function renderSolarSystem(ctx, canvas, values) {
        var s = canvas.width;
        var cx = s / 2;
        var cy = s / 2;
        var T = getCenturiesPastJ2000();
        
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, s, s);
        
        // Set up coordinate system
        ctx.save();
        ctx.translate(cx, cy);
        
        // Calculate scales
        var distanceScale = values.distanceScale || 0.45;
        var planetScale = values.planetScale || 1.0;
        var cs = s * distanceScale;
        var maxDist = scaleDistance(planets[planets.length - 1].a0);
        var distScale = cs / maxDist;
        var sunDisplayRadius = s * 0.04;
        var sizeScale = sunDisplayRadius / 695700 * planetScale;
        
        // Draw sun
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 695700 * sizeScale, 0, TWO_PI);
        ctx.fill();
        
        // Draw asteroid belt
        var showAsteroidBelt = Array.isArray(values.showAsteroidBelt) && 
                               values.showAsteroidBelt.indexOf('Enabled') >= 0;
        if (showAsteroidBelt) {
            drawAsteroidBelt(ctx, distScale);
        }
        
        // Draw planets
        var earthData = null;
        for (var i = 0; i < planets.length; i++) {
            var planet = planets[i];
            var pos = computePlanetPosition(planet, T);
            var angle = Math.atan2(pos.y, pos.x);
            var scaledDist = scaleDistance(pos.distance) * distScale;
            
            var px = scaledDist * Math.cos(angle);
            var py = scaledDist * Math.sin(angle);
            
            planet.screenX = px;
            planet.screenY = py;
            planet.screenRadius = planet.radius * sizeScale;
            
            if (planet.name === 'Earth') {
                earthData = {x: px, y: py, angle: angle, radius: planet.screenRadius};
            }
            
            // Highlight if selected
            if (selectedPlanets.indexOf(planet) >= 0) {
                ctx.strokeStyle = '#FF00FF';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(px, py, planet.screenRadius + 3, 0, TWO_PI);
                ctx.stroke();
            }
            
            // Draw planet
            ctx.fillStyle = planet.color;
            ctx.beginPath();
            ctx.arc(px, py, planet.screenRadius, 0, TWO_PI);
            ctx.fill();
        }
        
        // Draw viewer position on Earth
        var showViewer = Array.isArray(values.showViewer) && 
                        values.showViewer.indexOf('Enabled') >= 0;
        if (earthData && showViewer) {
            var localSolarTime = getLocalSolarTime();
            var rotationAngle = localSolarTime * TWO_PI;
            var viewerAngle = earthData.angle + rotationAngle;
            
            var viewerX = earthData.x + earthData.radius * Math.cos(viewerAngle);
            var viewerY = earthData.y + earthData.radius * Math.sin(viewerAngle);
            
            // Draw FOV cone
            var fovAngle = values.fovAngle || 30;
            var fovRad = fovAngle * DEG_TO_RAD;
            var coneLength = 20;
            var leftAngle = viewerAngle - fovRad;
            var rightAngle = viewerAngle + fovRad;
            
            var leftX = viewerX + coneLength * Math.cos(leftAngle);
            var leftY = viewerY + coneLength * Math.sin(leftAngle);
            var rightX = viewerX + coneLength * Math.cos(rightAngle);
            var rightY = viewerY + coneLength * Math.sin(rightAngle);
            
            ctx.strokeStyle = '#0000FF';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(leftX, leftY);
            ctx.lineTo(rightX, rightY);
            ctx.stroke();
            
            // Draw viewer dot
            ctx.fillStyle = '#0000FF';
            ctx.beginPath();
            ctx.arc(viewerX, viewerY, 2, 0, TWO_PI);
            ctx.fill();
        }
        
        ctx.restore();
        
        // Draw UI text
        var hrs = Math.floor((Date.now() - EMU_WAR_MS) / 3600000);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(hrs.toLocaleString() + ' hours since the Great Emu War', cx, s - 20);
        
        // Calculate distance to Pluto
        var earthPos = computePlanetPosition(planets[2], T);
        var plutoA = 39.48;
        var plutoAngle = T * 0.004;
        var plutoX = plutoA * Math.cos(plutoAngle);
        var plutoY = plutoA * Math.sin(plutoAngle);
        var distAU = Math.sqrt(Math.pow(plutoX - earthPos.x, 2) + Math.pow(plutoY - earthPos.y, 2));
        var distMeters = distAU * 149597870700;
        var distGiraffes = distMeters / 36;
        ctx.fillText(distGiraffes.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' Giraffe Small Intestines to Pluto', cx, s - 36);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERACTION
    // ═══════════════════════════════════════════════════════════════════════════════

    function handleCanvasClick(e, canvas) {
        var rect = canvas.getBoundingClientRect();
        var clickX = e.clientX - rect.left - canvas.width / 2;
        var clickY = e.clientY - rect.top - canvas.height / 2;
        
        var planetClicked = false;
        
        for (var i = 0; i < planets.length; i++) {
            var planet = planets[i];
            var dx = clickX - planet.screenX;
            var dy = clickY - planet.screenY;
            var distSq = dx * dx + dy * dy;
            var checkRadius = Math.max(planet.screenRadius, 5);
            
            if (distSq <= checkRadius * checkRadius) {
                if (selectedPlanets.length >= 2) {
                    selectedPlanets = [];
                }
                selectedPlanets.push(planet);
                console.log('Selected:', planet.name);
                planetClicked = true;
                break;
            }
        }
        
        if (!planetClicked) {
            selectedPlanets = [];
        }
    }

    function requestLocation() {
        fetch('https://ipapi.co/json/')
            .then(function(res) { return res.json(); })
            .then(function(data) {
                longitude = data.longitude;
                latitude = data.latitude;
                console.log('Location from IP: ' + data.city + ', ' + data.country_name);
            })
            .catch(function(error) {
                console.warn('IP geolocation failed:', error);
            });
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ANIMATION
    // ═══════════════════════════════════════════════════════════════════════════════

    function initAnimator(toolInstance) {
        if (ThrottledLoop) {
            animator = new ThrottledLoop({
                onFrame: function() {
                    toolInstance.draw();
                },
                updateInterval: 1000
            });
        }
    }

    function startAnimation() {
        if (animator) {
            animator.start();
        }
    }

    function stopAnimation() {
        if (animator) {
            animator.stop();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EXPORT FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function exportPng(tool) {
        var canvas = tool.getCanvas();
        if (!canvas) {
            tool.setStatus('No canvas available');
            return;
        }
        
        var timestamp = new Date().toISOString().slice(0, 10);
        var filename = 'solar-system-' + timestamp + '.png';
        
        var link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        tool.setStatus('Exported: ' + filename);
    }

    function exportSvg(tool) {
        var canvas = tool.getCanvas();
        if (!canvas) {
            tool.setStatus('No canvas available');
            return;
        }
        
        var values = tool.getValues();
        var s = canvas.width;
        var cx = s / 2;
        var cy = s / 2;
        var T = getCenturiesPastJ2000();
        
        // Calculate scales
        var distanceScale = values.distanceScale || 0.45;
        var planetScale = values.planetScale || 1.0;
        var cs = s * distanceScale;
        var maxDist = scaleDistance(planets[planets.length - 1].a0);
        var distScale = cs / maxDist;
        var sunDisplayRadius = s * 0.04;
        var sizeScale = sunDisplayRadius / 695700 * planetScale;
        
        // Build SVG
        var svgParts = [];
        svgParts.push('<?xml version="1.0" encoding="UTF-8"?>');
        svgParts.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '">');
        svgParts.push('<rect width="100%" height="100%" fill="#000000"/>');
        svgParts.push('<g transform="translate(' + cx + ',' + cy + ')">');
        
        // Sun
        var sunRadius = 695700 * sizeScale;
        svgParts.push('<circle cx="0" cy="0" r="' + sunRadius.toFixed(2) + '" fill="#FFFFFF"/>');
        
        // Planets
        for (var i = 0; i < planets.length; i++) {
            var planet = planets[i];
            var pos = computePlanetPosition(planet, T);
            var angle = Math.atan2(pos.y, pos.x);
            var scaledDist = scaleDistance(pos.distance) * distScale;
            var px = scaledDist * Math.cos(angle);
            var py = scaledDist * Math.sin(angle);
            var pr = planet.radius * sizeScale;
            
            svgParts.push('<circle cx="' + px.toFixed(2) + '" cy="' + py.toFixed(2) + '" r="' + pr.toFixed(2) + '" fill="' + planet.color + '"/>');
        }
        
        svgParts.push('</g>');
        svgParts.push('</svg>');
        
        var svgContent = svgParts.join('\n');
        var blob = new Blob([svgContent], { type: 'image/svg+xml' });
        var url = URL.createObjectURL(blob);
        
        var timestamp = new Date().toISOString().slice(0, 10);
        var filename = 'solar-system-' + timestamp + '.svg';
        
        var link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
        tool.setStatus('Exported: ' + filename);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════════════════

// SolarSystemTool class definition
export class SolarSystemTool {
    constructor(container, deps) {
        this.container = container;
        this.deps = {
            ComponentLibrary,
            ...(deps || {})
        };
        this.tool = null;
        this.render();
    }
    
    render() {
        try {
            this.tool = new ToolBase(TOOL_CONFIG, this.deps);
            this.tool.mount(this.container);
            this.tool.draw();
        } catch (error) {
            console.error('SolarSystemTool error:', error);
            this.container.innerHTML = '<p style="color: var(--c-text); padding: 20px;">Error: ' + error.message + '</p>';
        }
    };
    
    destroy() {
        stopAnimation();
        if (animator) {
            animator.destroy();
            animator = null;
        }
        
        planets = [];
        asteroidParticles = [];
        asteroidCached = null;
        selectedPlanets = [];
        
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    }
}

console.log('✅ SolarSystemTool loaded (ES Module)');
