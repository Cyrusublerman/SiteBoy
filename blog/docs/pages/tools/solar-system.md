# Solar System Tool

Real-time planetary positions using NASA JPL Keplerian elements.

## Overview

Accurate visualization of our solar system with:
- Real-time planetary positions (valid 1800-2050 AD)
- Interactive planet selection and measurement
- Viewer position on Earth based on local solar time
- Asteroid belt visualization

## Astronomical Data

### Keplerian Orbital Elements

Each planet has 6 elements with rates of change per century:

| Element | Symbol | Description |
|---------|--------|-------------|
| Semi-major axis | a | Orbit size (AU) |
| Eccentricity | e | Orbit shape (0=circle, <1=ellipse) |
| Inclination | I | Tilt from ecliptic (degrees) |
| Mean longitude | L | Position in orbit (degrees) |
| Long. of perihelion | ω | Orbit orientation (degrees) |
| Long. of asc. node | Ω | Where orbit crosses ecliptic |

### Planets Included

| Planet | Semi-major Axis (AU) | Color |
|--------|---------------------|-------|
| Mercury | 0.387 | White |
| Venus | 0.723 | White |
| Earth | 1.000 | Blue |
| Mars | 1.524 | White |
| Jupiter | 5.203 | White |
| Saturn | 9.537 | White |
| Uranus | 19.189 | White |
| Neptune | 30.070 | White |

## Features

### Position Calculation

Implements NASA JPL approximation formulae:
1. Update orbital elements for time T (centuries past J2000)
2. Calculate mean anomaly M = L - ω
3. Solve Kepler's equation: M = E - e·sin(E)
4. Convert to Cartesian coordinates in orbital plane
5. Rotate to ecliptic plane coordinates

### Kepler Solver

Newton-Raphson iteration with caching:
```javascript
// Initial guess
var E = M + (180/π) * e * sin(M);

// Iterate until convergence
while (|ΔM| > tolerance) {
    ΔM = M - (E - e*sin(E));
    ΔE = ΔM / (1 - e*cos(E));
    E += ΔE;
}
```

### Distance Scaling

Logarithmic compression for visibility:
```javascript
function scaleDistance(distanceAU) {
    return Math.log(distanceAU * 10 + 1);
}
```

### Viewer Position

Shows your position on Earth based on local solar time:
- Uses browser geolocation API
- Calculates local solar time from longitude
- Positions viewer marker on Earth's surface
- Draws field-of-view cone

### Planet Trails

Circular buffer for efficient trail rendering:
- O(1) push and get operations
- Configurable trail length
- Alpha-faded gradient

### Selection & Measurement

Click planets to:
- Select up to 2 planets
- Draw connecting triangle to sun
- Calculate angular separation
- Display measurement labels

## Configuration

```javascript
CONFIG = {
    canvas: { maxSize: 800 },
    sun: { displayScale: 0.04 },
    trail: { maxLength: 20, maxPoints: 50 },
    asteroidBelt: {
        innerRadius: 2.2,  // AU
        outerRadius: 3.2,  // AU
        particleCount: 300
    },
    scaling: {
        planetSizeMultiplier: 1,
        distanceScale: 0.45
    }
};
```

## Time Functions

- **getCenturiesPastJ2000()**: Time parameter for orbital calculations
- **setCustomDate(dateString)**: View historical/future configurations
- **resetToNow()**: Return to real-time mode
- **getHoursSinceEmuWar()**: Easter egg counter

## UI Elements

- Canvas with centered coordinate system
- Planet click/selection
- Measurement display (distance, angle)
- Info text (Emu War counter, Pluto distance in "Giraffe Intestines")

## Source Reference

`reference/QuickToolRebuildReference/Generative Art/clock/`

Note: Despite the folder name, this is the Solar System visualization, not a clock.

