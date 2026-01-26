# Algorithms Test Lab - Correct Controls Based on Actual Algorithms

## ALGORITHM PARAMETERS (From Library Code)

### Page 1: Noise, Sampling, Patterns

#### Noise Functions

**simplex2D(x, y)**
- NO built-in parameters - just x,y coordinates
- Caller must scale coordinates: `simplex2D(x * scale, y * scale)`
- Controls needed:
  - Frequency/Scale: 0.001 - 0.1 (coordinate multiplier)
  - Seed: 0-999999 (for permutation table)

**fbm2D(x, y, options)**
- `options.octaves` (default 4): number of noise layers - Controls: 1-8
- `options.lacunarity` (default 2.0): frequency multiplier per octave - Controls: 1.5-3.0
- `options.persistence` (default 0.5): amplitude decay per octave - Controls: 0.1-0.9
- Plus same scale/seed as simplex2D

**domainWarp2D(x, y, options)**
- `options.strength` (default 1.0): warp intensity - Controls: 0-100
- `options.scale` (default 0.01): noise frequency - Controls: 0.001-0.1
- `options.octaves` (default 4): fBm octaves for warp - Controls: 1-8
- Plus seed

#### Sampling

**poissonDisk(width, height, minDist, k=30, rng)**
- `minDist`: minimum distance between points - Controls: 5-50
- `k` (default 30): candidates per point (affects density) - Controls: 10-60
- Seed for RNG

**haltonSequence(count, bases=[2,3])**
- `count`: number of points - Controls: 10-500
- `bases`: prime number pair - Could expose or keep default

**lloydRelaxation(points, width, height, iterations=5)**
- `iterations`: relaxation steps - Controls: 1-20
- Initial points from another sampler

**importanceSampling(count, width, height, weightFn)**
- `count`: number of points
- `weightFn`: density function (x,y) → [0,1]
- Could provide preset functions (center-weighted, edge-weighted, etc.)

#### Patterns

**truchet(ctx, width, height, gridSize, seed)**
- `gridSize`: tile size - Controls: 12-48
- `seed`: random seed - Controls: 0-999999

### Page 4: Space-Filling, TSP

#### Space-Filling Curves

**HilbertCurve.generate(order)**
- `order`: recursion depth (gives 4^order points) - Controls: 3-7
- Order 3 = 64 points, Order 7 = 16384 points

**TSP Algorithms**

**nearestNeighbor(points)** - Just takes points array
**twoOpt(points, initialTour)** - Points + initial tour
**christofides(points)** - Just takes points array

Controls needed:
- Point count: 20-200
- Seed: for point generation

### Page 5: Physics

#### Wave Solver (TIME-BASED!)

**wave1D + stepWave1D(current, previous, params)**
- `params.c`: wave speed (default 1) - Controls: 0.1-2.0
- `params.damping`: energy loss (default 0.99) - Controls: 0.9-1.0
- Time stepping - needs animation loop!

**wave2D + stepWave2D(current, previous, width, height, params)**
- `params.c`: wave speed (default 0.5) - Controls: 0.1-1.0
- `params.damping`: damping factor (default 0.995) - Controls: 0.95-1.0
- Time stepping - needs animation loop!

**travellingWave(length, time, params)**
- `time`: current time - ANIMATION PARAMETER
- `params.frequency`: wave frequency - Controls: 0.1-5.0
- `params.wavelength`: spatial wavelength - Controls: 10-100
- `params.amplitude`: wave height - Controls: 0.1-1.0

## CORRECT TOOL_CONFIG STRUCTURE

```javascript
const ALGORITHMS = {
    noise: {
        simplex2D: {
            title: 'Simplex 2D',
            library: 'Noise.simplex2D',
            render: 'field2D', // Render as 2D scalar field
            controls: {
                seed: { component: 'SeedInput', min: 0, max: 999999, default: 0 },
                frequency: { type: 'slider', label: 'Frequency', min: 0.001, max: 0.1, step: 0.001, default: 0.01 }
            }
        },
        fbm2D: {
            title: 'Fractional Brownian Motion',
            library: 'Noise.fbm2D',
            render: 'field2D',
            controls: {
                seed: { component: 'SeedInput', min: 0, max: 999999, default: 0 },
                frequency: { type: 'slider', label: 'Frequency', min: 0.001, max: 0.1, step: 0.001, default: 0.005 },
                octaves: { type: 'slider', label: 'Octaves', min: 1, max: 8, step: 1, default: 4 },
                lacunarity: { type: 'slider', label: 'Lacunarity', min: 1.5, max: 3.0, step: 0.1, default: 2.0 },
                persistence: { type: 'slider', label: 'Persistence', min: 0.1, max: 0.9, step: 0.05, default: 0.5 }
            }
        },
        domainWarp2D: {
            title: 'Domain Warp',
            library: 'Noise.domainWarp2D',
            render: 'field2D',
            controls: {
                seed: { component: 'SeedInput', min: 0, max: 999999, default: 0 },
                strength: { type: 'slider', label: 'Warp Strength', min: 0, max: 100, step: 1, default: 25 },
                scale: { type: 'slider', label: 'Noise Scale', min: 0.001, max: 0.1, step: 0.001, default: 0.01 },
                octaves: { type: 'slider', label: 'Octaves', min: 1, max: 8, step: 1, default: 4 }
            }
        }
    },
    sampling: {
        poissonDisk: {
            title: 'Poisson Disk',
            library: 'Sampling.poissonDisk',
            render: 'points',
            controls: {
                seed: { component: 'SeedInput', min: 0, max: 999999, default: 0 },
                minDist: { type: 'slider', label: 'Min Distance', min: 5, max: 50, step: 1, default: 18 },
                candidates: { type: 'slider', label: 'Candidates (k)', min: 10, max: 60, step: 1, default: 30 }
            }
        },
        haltonSequence: {
            title: 'Halton Sequence',
            library: 'Sampling.haltonSequence',
            render: 'points',
            controls: {
                count: { type: 'slider', label: 'Point Count', min: 10, max: 500, step: 10, default: 120 }
            }
        }
    },
    spaceFilling: {
        hilbert: {
            title: 'Hilbert Curve',
            library: 'SpaceFilling.HilbertCurve.generate',
            render: 'curve',
            controls: {
                order: { type: 'slider', label: 'Order (2^n grid)', min: 3, max: 7, step: 1, default: 5 }
            }
        }
    },
    physics: {
        wave1D: {
            title: '1D Wave',
            library: 'WaveSolver.travellingWave',
            render: 'wave1D',
            animated: true, // FLAG: Needs time parameter
            controls: {
                frequency: { type: 'slider', label: 'Frequency', min: 0.1, max: 5.0, step: 0.1, default: 1.0 },
                wavelength: { type: 'slider', label: 'Wavelength', min: 10, max: 100, step: 5, default: 50 },
                amplitude: { type: 'slider', label: 'Amplitude', min: 0.1, max: 1.0, step: 0.1, default: 0.5 }
            }
        },
        wave2D: {
            title: '2D Wave Propagation',
            library: 'WaveSolver.stepWave2D',
            render: 'field2D',
            animated: true,
            controls: {
                waveSpeed: { type: 'slider', label: 'Wave Speed (c)', min: 0.1, max: 1.0, step: 0.05, default: 0.5 },
                damping: { type: 'slider', label: 'Damping', min: 0.95, max: 1.0, step: 0.005, default: 0.995 }
            }
        }
    }
};
```

## KEY INSIGHTS

1. **No arbitrary "Sample Count" sliders** - Use actual algorithm parameters
2. **Poisson Disk takes minDist + k**, not "count"
3. **fBm needs octaves + lacunarity + persistence** - not just "scale"
4. **Physics algorithms need TIME** - must animate or provide time control
5. **Each algorithm has specific parameters** - one size does NOT fit all

## RENDERING TYPES

Different algorithms need different display methods:

- `field2D`: 2D scalar field → draw as pixels with VGA palette
- `points`: Point array → draw as dots
- `curve`: Path of connected points → draw as stroke
- `wave1D`: 1D array → draw as line graph
- `animated`: Requires time-stepping/animation loop

This tells the renderer HOW to display the output from each algorithm.

