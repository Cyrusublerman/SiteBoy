# Solar System Clock (Real-Time Planetary Visualization)

## 1. Source Analysis

**Source file(s):** 
- `reference/QuickToolRebuildReference/Generative Art/clock/dist/script.js` (original)
- `assets/js/tools/solar-system-tool.js` (converted)

**Related docs found:** None

### Purpose
Real-time solar system visualization using NASA JPL Keplerian orbital elements. Shows accurate planetary positions, trails, asteroid belt, viewer position on Earth, and distance measurements. Includes whimsical displays (hours since Emu War, distance to Pluto in giraffe intestines).

### Output Type
- [ ] Static image
- [x] Animation (real-time orbit)
- [x] Interactive visualization (planet selection)
- [x] Data/calculation result (measurements)
- [ ] Audio
- [x] Downloadable file (PNG, SVG export added)

### Current Implementation
1. Keplerian orbital elements for 8 planets (Mercury→Neptune)
2. Kepler equation solver (Newton-Raphson iteration)
3. Heliocentric coordinate calculation
4. Logarithmic distance scaling to fit all orbits
5. Circular buffer for efficient trail storage
6. Asteroid belt with black/white noise pattern
7. Geolocation for viewer position (local solar time)
8. Planet selection for distance/angle measurement
9. 1-second physics update, 60fps render

---

## 2. Tool Classification

**Is this a tool?** Yes (astronomical visualization)

**Input:** Date/time (optional), geolocation (optional)
**Processing:** Orbital mechanics calculation
**Output:** Real-time solar system visualization

**Frame-based?** Yes
**Looping?** Yes (continuous)
**Duration:** Infinite

---

## 3. Variable Analysis

### Exposed Parameters (from converted tool)
| Variable | Current Type | Range/Options | Purpose |
|----------|--------------|---------------|---------|
| distanceScale | number | 0.2-0.8 | Canvas space for orbits |
| planetScale | number | 0.5-3.0 | Planet size multiplier |
| asteroidCount | number | 100-1000 | Asteroid belt particles |
| showAsteroidBelt | toggle | on/off | Belt visibility |
| fovAngle | number | 10-90 | Viewer FOV cone |
| showViewer | toggle | on/off | Earth viewer marker |
| trailLength | number | 5-50 | Trail pixel length |
| showTrails | toggle | on/off | Trail visibility |
| canvasWidth | number | 400-1200 | Output width |
| canvasHeight | number | 400-1200 | Output height |

### CONFIG Object (from source)
| Section | Key | Default | Purpose |
|---------|-----|---------|---------|
| canvas | maxSize | 800 | Max canvas dimension |
| sun | displayScale | 0.04 | Sun size fraction |
| trail | maxLength | 20 | Trail pixels |
| trail | maxPoints | 50 | Trail buffer size |
| asteroidBelt | innerRadius | 2.2 | Inner edge (AU) |
| asteroidBelt | outerRadius | 3.2 | Outer edge (AU) |
| asteroidBelt | particleCount | 300 | Asteroid count |
| viewer | fovAngle | 30 | FOV half-angle |
| viewer | coneLength | 20 | FOV line length |

### Recommended UI Components
| Parameter | Component Type | Config |
|-----------|----------------|--------|
| Distance Scale | slider | 0.2-0.8, step 0.05 |
| Planet Scale | slider | 0.5-3, step 0.1 |
| Asteroid Count | slider | 100-1000, step 50 |
| Show Belt | toggle | Enabled |
| FOV Angle | slider | 10-90, step 5 |
| Show Viewer | toggle | Enabled |
| Trail Length | slider | 5-50, step 5 |
| Show Trails | toggle | Enabled |
| Export PNG | button | download |
| Export SVG | button | download |

### Missing Controls (not in source, should add)
- [x] Export PNG (added in conversion)
- [x] Export SVG (added in conversion)
- [x] Canvas size (added in conversion)
- [ ] Custom date selection
- [ ] Speed control (time acceleration)
- [ ] Planet info display
- [ ] Pause on selection

---

## 4. Gap Analysis

### Available in our library but missing in source:
- Export PNG/SVG (added)
- Canvas resize (added)
- Time control / date picker

### Source features requiring new components:
- Date picker for custom dates
- Time acceleration slider

---

## 5. Input/Output Specification

### Inputs
| Name | Type | Default | Min | Max | Step | Notes |
|------|------|---------|-----|-----|------|-------|
| distanceScale | number | 0.45 | 0.2 | 0.8 | 0.05 | Orbit fit |
| planetScale | number | 1.0 | 0.5 | 3.0 | 0.1 | Size mult |
| asteroidCount | number | 300 | 100 | 1000 | 50 | Belt density |
| showAsteroidBelt | boolean | true | - | - | - | Belt visible |
| fovAngle | number | 30 | 10 | 90 | 5 | Viewer FOV |
| showViewer | boolean | true | - | - | - | Viewer visible |
| trailLength | number | 20 | 5 | 50 | 5 | Trail length |
| showTrails | boolean | true | - | - | - | Trails visible |
| canvasWidth | number | 800 | 400 | 1200 | 50 | px |
| canvasHeight | number | 800 | 400 | 1200 | 50 | px |

### Outputs
| Output | Type | Format | Trigger |
|--------|------|--------|---------|
| Animation | canvas | continuous | Auto |
| Selection Info | text | distance/angle | On click |
| PNG | download | image/png | Export button |
| SVG | download | image/svg+xml | Export button |

---

## 6. ToolBase Configuration

```javascript
const TOOL_CONFIG = {
    title: 'SOLAR SYSTEM',
    
    sidebar: [
        ['CONTROLS', [
            ['Display', [
                ['slider', 'Distance Scale', 0.2, 0.8, 0.05, { value: 0.45, key: 'distanceScale' }],
                ['slider', 'Planet Scale', 0.5, 3.0, 0.1, { value: 1.0, key: 'planetScale' }],
            ]],
            ['Asteroid Belt', [
                ['slider', 'Particles', 100, 1000, 50, { value: 300, key: 'asteroidCount' }],
                ['toggle', 'Show Belt', ['Enabled'], { key: 'showAsteroidBelt', selectedValues: ['Enabled'] }],
            ]],
            ['Viewer', [
                ['slider', 'FOV Angle', 10, 90, 5, { value: 30, key: 'fovAngle' }],
                ['toggle', 'Show Viewer', ['Enabled'], { key: 'showViewer', selectedValues: ['Enabled'] }],
            ]],
            ['Trails', [
                ['slider', 'Length', 5, 50, 5, { value: 20, key: 'trailLength' }],
                ['toggle', 'Show Trails', ['Enabled'], { key: 'showTrails', selectedValues: ['Enabled'] }],
            ]],
        ]],
        ['CANVAS', [
            ['Size', [
                ['slider', 'Width', 400, 1200, 50, { value: 800, key: 'canvasWidth' }],
                ['slider', 'Height', 400, 1200, 50, { value: 800, key: 'canvasHeight' }],
            ]],
        ]],
        ['EXPORT', [
            ['Download', [
                ['button', 'Export PNG', { key: 'exportPng' }],
                ['button', 'Export SVG', { key: 'exportSvg' }],
            ]],
        ]],
    ],
    
    canvas: { size: 420 },
    
    onInit: function(values) {
        this.initializePlanets();
        this.generateAsteroidBelt(values.asteroidCount);
        this.requestLocation();
        this.startAnimation();
    },
    
    onDraw: function(ctx, canvas, values) {
        this.renderSolarSystem(ctx, canvas, values);
    },
    
    destroy: function() {
        if (this.animator) this.animator.destroy();
        if (this.tool) this.tool.destroy();
    }
};
```

---

## 7. Implementation Notes

- **Keplerian Elements:** Uses NASA JPL approximation formulae valid 1800-2050 AD
- **Kepler Solver:** Newton-Raphson iteration with 30 max iterations, 1e-6° tolerance
- **Time System:** J2000 epoch (Jan 1, 2000 12:00 TT) as reference
- **Logarithmic Scaling:** `log(AU * 10 + 1)` compresses outer planet distances
- **Circular Buffer:** O(1) push/get for efficient trail management
- **Geolocation:** Uses browser API for viewer longitude (solar time calculation)
- **Animation Loop:** Must use AnimationFoundation, not raw RAF
- **Status:** Already converted to ToolBase format with export

---

## 8. Reusable Code Candidates

| Code Block | Lines | Category | Similar To | Reuse Potential |
|------------|-------|----------|------------|-----------------|
| Utils module | 50 | math | - | High |
| TimeManager | 40 | time | - | High |
| LocationManager | 40 | geo | about-you | High |
| KeplerSolver | 40 | physics | - | High |
| CircularBuffer | 30 | data structure | - | High |
| Planet class | 80 | astronomy | - | Medium |
| AsteroidBelt | 40 | rendering | - | Low |
| SelectionManager | 30 | interaction | - | Medium |
| Renderer | 200 | canvas | - | Low |

**Shared Utility Candidates:**
- `OrbitalMechanics.keplerSolve(M, e)` - Kepler equation solver
- `OrbitalMechanics.planetPosition(elements, T)` - Heliocentric coordinates
- `GeoLocation.getLocalSolarTime(longitude)` - Solar time from longitude
- `CircularBuffer` - Efficient fixed-size history buffer

