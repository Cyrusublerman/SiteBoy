/**
 * Solar System Visualization Tool - SiteBoy Framework
 * 
 * Real-time planetary positions using NASA JPL Keplerian elements
 * Features:
 * - Accurate orbital mechanics
 * - Planetary trails
 * - Asteroid belt
 * - Viewer position on Earth with field of view
 * - Planet selection and measurement
 * - Hours since Great Emu War counter
 * 
 * @version 1.0.0
 * @dependencies None (pure astronomical calculations)
 */

class SolarSystemTool {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = deps;
        this.componentInstances = [];
        
        // Configuration
        this.config = {
            canvas: { maxSize: 800 },
            sun: { radius: 695700, color: '#FFFFFF', displayScale: 0.04 },
            viewer: { color: '#0000FF', markerSize: 2, fovAngle: 30, coneLength: 20 },
            trail: { maxLength: 20, maxPoints: 50, enabled: true },
            asteroidBelt: { innerRadius: 2.2, outerRadius: 3.2, particleCount: 300, colors: ['white', 'black'] },
            scaling: { planetSizeMultiplier: 1, distanceScale: 0.45 },
            performance: { updateInterval: 1000, useRAF: true }
        };
        
        // Constants
        this.CONSTANTS = {
            J2000_MS: 946728000000,
            EMU_WAR_MS: new Date(1932, 10, 2, 11, 0, 0).getTime(),
            DEG_TO_RAD: Math.PI / 180,
            RAD_TO_DEG: 180 / Math.PI,
            TWO_PI: Math.PI * 2,
            E_STAR_FACTOR: 57.29578
        };
        
        // NASA JPL Keplerian Elements (all white except Earth which is blue)
        this.PLANET_DATA = [
            {name: 'Mercury', a0: 0.38709927, aDot: 0.00000037, e0: 0.20563593, eDot: 0.00001906, I0: 7.00497902, IDot: -0.00594749, L0: 252.25032350, LDot: 149472.67411175, w0: 77.45779628, wDot: 0.16047689, O0: 48.33076593, ODot: -0.12534081, color: '#FFFFFF', radius: 2439.7},
            {name: 'Venus', a0: 0.72333566, aDot: 0.00000390, e0: 0.00677672, eDot: -0.00004107, I0: 3.39467605, IDot: -0.00078890, L0: 181.97909950, LDot: 58517.81538729, w0: 131.60246718, wDot: 0.00268329, O0: 76.67984255, ODot: -0.27769418, color: '#FFFFFF', radius: 6051.8},
            {name: 'Earth', a0: 1.00000261, aDot: 0.00000562, e0: 0.01671123, eDot: -0.00004392, I0: -0.00001531, IDot: -0.01294668, L0: 100.46457166, LDot: 35999.37244981, w0: 102.93768193, wDot: 0.32327364, O0: 0.0, ODot: 0.0, color: '#0000FF', radius: 6371},
            {name: 'Mars', a0: 1.52371034, aDot: 0.00001847, e0: 0.09339410, eDot: 0.00007882, I0: 1.84969142, IDot: -0.00813131, L0: -4.55343205, LDot: 19140.30268499, w0: -23.94362959, wDot: 0.44441088, O0: 49.55953891, ODot: -0.29257343, color: '#FFFFFF', radius: 3389.5},
            {name: 'Jupiter', a0: 5.20288700, aDot: -0.00011607, e0: 0.04838624, eDot: -0.00013253, I0: 1.30439695, IDot: -0.00183714, L0: 34.39644051, LDot: 3034.74612775, w0: 14.72847983, wDot: 0.21252668, O0: 100.47390909, ODot: 0.20469106, color: '#FFFFFF', radius: 69911},
            {name: 'Saturn', a0: 9.53667594, aDot: -0.00125060, e0: 0.05386179, eDot: -0.00050991, I0: 2.48599187, IDot: 0.00193609, L0: 49.95424423, LDot: 1222.49362201, w0: 92.59887831, wDot: -0.41897216, O0: 113.66242448, ODot: -0.28867794, color: '#FFFFFF', radius: 58232},
            {name: 'Uranus', a0: 19.18916464, aDot: -0.00196176, e0: 0.04725744, eDot: -0.00004397, I0: 0.77263783, IDot: -0.00242939, L0: 313.23810451, LDot: 428.48202785, w0: 170.95427630, wDot: 0.40805281, O0: 74.01692503, ODot: 0.04240589, color: '#FFFFFF', radius: 25362},
            {name: 'Neptune', a0: 30.06992276, aDot: 0.00026291, e0: 0.00859048, eDot: 0.00005105, I0: 1.77004347, IDot: 0.00035372, L0: -55.12002969, LDot: 218.45945325, w0: 44.96476227, wDot: -0.32241464, O0: 131.78422574, ODot: -0.00508664, color: '#FFFFFF', radius: 24622}
        ];
        
        // State
        this.planets = [];
        this.asteroidParticles = [];
        this.asteroidCached = null;
        this.selectedPlanets = [];
        this.longitude = null;
        this.latitude = null;
        this.customDate = null;
        this.animationFrame = null;
        this.lastUpdate = 0;
        
        // UI elements
        this.canvas = null;
        this.ctx = null;
    }
    
    render() {
        this.destroy();
        
        // Canvas only - no title or description
        const canvasContainer = document.createElement('div');
        canvasContainer.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            background: #000000;
        `;
        
        this.canvas = document.createElement('canvas');
        // Set initial size before appending (will be adjusted after DOM insertion)
        // 80% of max size
        const initialSize = Math.min(800, window.innerWidth - 100) * 0.8;
        this.canvas.width = initialSize;
        this.canvas.height = initialSize;
        this.canvas.style.cssText = `display: block;`;
        this.ctx = this.canvas.getContext('2d');
        
        canvasContainer.appendChild(this.canvas);
        this.container.appendChild(canvasContainer);
        
        // Now resize based on actual container width (after DOM insertion)
        setTimeout(() => this.resizeCanvas(), 0);
        
        // Initialize planets
        this.initializePlanets();
        
        // Generate asteroid belt
        this.generateAsteroidBelt();
        
        // Request geolocation
        this.requestLocation();
        
        // Start animation
        this.startAnimation();
        
        // Add click handler
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Add resize handler
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        const containerWidth = this.container ? this.container.clientWidth : window.innerWidth;
        // 80% of available size
        const size = Math.min(containerWidth || 800, this.config.canvas.maxSize) * 0.8;
        // Only resize if size is valid
        if (size > 0) {
            this.canvas.width = size;
            this.canvas.height = size;
            this.asteroidCached = null;
        }
    }
    
    initializePlanets() {
        this.planets = this.PLANET_DATA.map(data => ({
            ...data,
            trail: [],
            trailLength: 0,
            cachedPos: null,
            lastT: null,
            screenX: 0,
            screenY: 0,
            screenRadius: 0
        }));
    }
    
    generateAsteroidBelt() {
        this.asteroidParticles = [];
        const colors = this.config.asteroidBelt.colors;
        for (let i = 0; i < this.config.asteroidBelt.particleCount; i++) {
            this.asteroidParticles.push({
                angle: Math.random() * this.CONSTANTS.TWO_PI,
                distance: this.config.asteroidBelt.innerRadius + 
                         Math.random() * (this.config.asteroidBelt.outerRadius - this.config.asteroidBelt.innerRadius),
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
        this.asteroidCached = null;
    }
    
    requestLocation() {
        // Use IP-based geolocation (no permission required)
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                this.longitude = data.longitude;
                this.latitude = data.latitude;
                console.log(`🌍 Location from IP: ${data.city}, ${data.country_name} (${this.latitude}°, ${this.longitude}°)`);
            })
            .catch(error => {
                console.warn('IP geolocation failed:', error);
                // Fallback to system time if IP lookup fails
            });
    }
    
    getCenturiesPastJ2000() {
        const currentTime = this.customDate || Date.now();
        const daysSinceJ2000 = (currentTime - this.CONSTANTS.J2000_MS) / 86400000;
        return daysSinceJ2000 / 36525;
    }
    
    getLocalSolarTime() {
        const d = new Date(this.customDate || Date.now());
        const hours = d.getUTCHours();
        const minutes = d.getUTCMinutes();
        const seconds = d.getUTCSeconds();
        let timeOfDayUTC = (hours + minutes / 60 + seconds / 3600) / 24;
        
        if (this.longitude !== null) {
            const longitudeHours = this.longitude / 15;
            let solarTime = (timeOfDayUTC + longitudeHours / 24) % 1;
            if (solarTime < 0) solarTime += 1;
            return solarTime;
        }
        return (d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600) / 24;
    }
    
    solveKeplerEquation(M, e) {
        const eStar = this.CONSTANTS.E_STAR_FACTOR * e;
        const MRad = M * this.CONSTANTS.DEG_TO_RAD;
        let E = M + eStar * Math.sin(MRad);
        
        const tol = 1e-6;
        let iter = 0;
        const maxIter = 30;
        
        while (iter < maxIter) {
            const ERad = E * this.CONSTANTS.DEG_TO_RAD;
            const sinE = Math.sin(ERad);
            const cosE = Math.cos(ERad);
            const deltaM = M - (E - eStar * sinE);
            if (Math.abs(deltaM) < tol) break;
            E += deltaM / (1 - e * cosE);
            iter++;
        }
        return E;
    }
    
    normalizeAngle(angle) {
        while (angle > 180) angle -= 360;
        while (angle < -180) angle += 360;
        return angle;
    }
    
    computePlanetPosition(planet, T) {
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
        const M = this.normalizeAngle(L - wBar);
        const E = this.solveKeplerEquation(M, e);
        const ERad = E * this.CONSTANTS.DEG_TO_RAD;
        
        const cosE = Math.cos(ERad);
        const sinE = Math.sin(ERad);
        const sqrtFactor = Math.sqrt(1 - e * e);
        
        const xPrime = a * (cosE - e);
        const yPrime = a * sqrtFactor * sinE;
        
        const wRad = w * this.CONSTANTS.DEG_TO_RAD;
        const ORad = O * this.CONSTANTS.DEG_TO_RAD;
        const IRad = I * this.CONSTANTS.DEG_TO_RAD;
        
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
    
    scaleDistance(distanceAU) {
        return Math.log(distanceAU * 10 + 1);
    }
    
    startAnimation() {
        const animate = () => {
            const now = Date.now();
            if ((now - this.lastUpdate) >= this.config.performance.updateInterval) {
                this.lastUpdate = now;
                this.renderFrame();
            }
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }
    
    renderFrame() {
        const s = this.canvas.width;
        const cx = s / 2;
        const cy = s / 2;
        const T = this.getCenturiesPastJ2000();
        
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, s, s);
        
        // Set up coordinate system
        this.ctx.save();
        this.ctx.translate(cx, cy);
        
        // Calculate scales
        const cs = s * this.config.scaling.distanceScale;
        const maxDist = this.scaleDistance(this.planets[this.planets.length - 1].a0);
        const distScale = cs / maxDist;
        const sunDisplayRadius = s * this.config.sun.displayScale;
        const sizeScale = sunDisplayRadius / this.config.sun.radius * this.config.scaling.planetSizeMultiplier;
        
        // Draw sun
        this.ctx.fillStyle = this.config.sun.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.config.sun.radius * sizeScale, 0, this.CONSTANTS.TWO_PI);
        this.ctx.fill();
        
        // Draw asteroid belt
        this.drawAsteroidBelt(distScale);
        
        // Draw planets
        let earthData = null;
        for (let planet of this.planets) {
            const pos = this.computePlanetPosition(planet, T);
            const angle = Math.atan2(pos.y, pos.x);
            const scaledDist = this.scaleDistance(pos.distance) * distScale;
            
            const px = scaledDist * Math.cos(angle);
            const py = scaledDist * Math.sin(angle);
            
            planet.screenX = px;
            planet.screenY = py;
            planet.screenRadius = planet.radius * sizeScale;
            
            if (planet.name === 'Earth') {
                earthData = {x: px, y: py, angle: angle, radius: planet.screenRadius};
            }
            
            // Highlight if selected
            if (this.selectedPlanets.includes(planet)) {
                this.ctx.strokeStyle = '#FF00FF';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(px, py, planet.screenRadius + 3, 0, this.CONSTANTS.TWO_PI);
                this.ctx.stroke();
            }
            
            // Draw planet (filled with proportional size)
            this.ctx.fillStyle = planet.color;
            this.ctx.beginPath();
            this.ctx.arc(px, py, planet.screenRadius, 0, this.CONSTANTS.TWO_PI);
            this.ctx.fill();
        }
        
        // Draw viewer position and FOV cone on Earth
        if (earthData) {
            const localSolarTime = this.getLocalSolarTime();
            const rotationAngle = localSolarTime * this.CONSTANTS.TWO_PI;
            const viewerAngle = earthData.angle + rotationAngle;
            
            const viewerX = earthData.x + earthData.radius * Math.cos(viewerAngle);
            const viewerY = earthData.y + earthData.radius * Math.sin(viewerAngle);
            
            // Draw FOV cone FIRST (so viewer dot appears on top)
            const fovRad = this.config.viewer.fovAngle * this.CONSTANTS.DEG_TO_RAD;
            const leftAngle = viewerAngle - fovRad;
            const rightAngle = viewerAngle + fovRad;
            
            const leftX = viewerX + this.config.viewer.coneLength * Math.cos(leftAngle);
            const leftY = viewerY + this.config.viewer.coneLength * Math.sin(leftAngle);
            const rightX = viewerX + this.config.viewer.coneLength * Math.cos(rightAngle);
            const rightY = viewerY + this.config.viewer.coneLength * Math.sin(rightAngle);
            
            this.ctx.strokeStyle = this.config.viewer.color;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(leftX, leftY);
            this.ctx.lineTo(rightX, rightY);
            this.ctx.stroke();
            
            // Draw viewer dot AFTER cone (on top)
            this.ctx.fillStyle = this.config.viewer.color;
            this.ctx.beginPath();
            this.ctx.arc(viewerX, viewerY, this.config.viewer.markerSize, 0, this.CONSTANTS.TWO_PI);
            this.ctx.fill();
        }
        
        this.ctx.restore();
        
        // Draw UI text
        const hrs = Math.floor((Date.now() - this.CONSTANTS.EMU_WAR_MS) / 3600000);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(hrs.toLocaleString() + ' hours since the Great Emu War', cx, s - 20);
        
        // Calculate distance to Pluto in Average Giraffe Small Intestines
        const earthPos = this.computePlanetPosition(this.planets[2], T); // Earth is index 2
        const plutoA = 39.48; // Pluto's semi-major axis in AU
        const plutoAngle = T * 0.004; // Pluto's orbital motion (approximate)
        const plutoX = plutoA * Math.cos(plutoAngle);
        const plutoY = plutoA * Math.sin(plutoAngle);
        const distAU = Math.sqrt(Math.pow(plutoX - earthPos.x, 2) + Math.pow(plutoY - earthPos.y, 2));
        const distMeters = distAU * 149597870700; // AU to meters
        const distGiraffes = distMeters / 36; // Average giraffe small intestine = 36m
        this.ctx.fillText(distGiraffes.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' Average Giraffe Small Intestines to Pluto', cx, s - 40);
    }
    
    drawAsteroidBelt(distScale) {
        if (!this.asteroidCached) {
            this.asteroidCached = [];
            for (let p of this.asteroidParticles) {
                const scaledDist = this.scaleDistance(p.distance);
                this.asteroidCached.push({
                    x: scaledDist * Math.cos(p.angle),
                    y: scaledDist * Math.sin(p.angle),
                    color: p.color
                });
            }
        }
        
        for (let p of this.asteroidCached) {
            const x = p.x * distScale;
            const y = p.y * distScale;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
        }
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left - this.canvas.width / 2;
        const clickY = e.clientY - rect.top - this.canvas.height / 2;
        
        let planetClicked = false;
        
        for (let planet of this.planets) {
            const dx = clickX - planet.screenX;
            const dy = clickY - planet.screenY;
            const distSq = dx * dx + dy * dy;
            const checkRadius = Math.max(planet.screenRadius, 5); // Minimum click target
            
            if (distSq <= checkRadius * checkRadius) {
                if (this.selectedPlanets.length >= 2) {
                    this.selectedPlanets = [];
                }
                this.selectedPlanets.push(planet);
                console.log('Selected:', planet.name);
                planetClicked = true;
                break;
            }
        }
        
        // Clear selections if clicking empty space
        if (!planetClicked) {
            this.selectedPlanets = [];
            console.log('Selections cleared');
        }
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        for (const instance of this.componentInstances) {
            if (instance && typeof instance.destroy === 'function') {
                instance.destroy();
            }
        }
        this.componentInstances = [];
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        this.canvas = null;
        this.ctx = null;
    }
}

window.SolarSystemTool = SolarSystemTool;
console.log('🌌 Solar System Tool loaded');

