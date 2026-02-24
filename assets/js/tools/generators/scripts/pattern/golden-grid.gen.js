/**
 * Golden Grid - p5.js Generator
 * 
 * Golden ratio recursive subdivision with animated proportions.
 * Based on pulsing_recursive_grid sketch.
 * 
 * First p5.js generator in the unified system - reference implementation.
 * 
 * @version 1.0.0
 */

const PHI = 1.618033988749;

// Precompute min/max proportions for normalization
const P_BIG = PHI / (1 + PHI);      // ≈ 0.618
const P_SMALL = 1 - P_BIG;           // ≈ 0.382

export const SCRIPT_CONFIG = {
    id: 'golden-grid',
    title: 'Golden Grid',
    category: 'pattern',
    description: 'Recursive golden ratio subdivision with animated proportions. Each cell\'s colour is derived from its proportional dimensions.',
    version: '1.0.0',
    
    canvas: {
        width: 800,
        height: 800,
        context: 'p5'
    },
    
    parameters: [
        {
            group: 'Subdivision',
            params: [
                { 
                    key: 'maxDepth', 
                    type: 'slider', 
                    label: 'Max Depth', 
                    min: 4, 
                    max: 16, 
                    step: 1, 
                    default: 13 
                },
                { 
                    key: 'loopFrames', 
                    type: 'slider', 
                    label: 'Loop Frames', 
                    min: 60, 
                    max: 720, 
                    step: 60, 
                    default: 360 
                }
            ]
        },
        {
            group: 'Animation',
            params: [
                { 
                    key: 'hueSpeed', 
                    type: 'slider', 
                    label: 'Hue Speed', 
                    min: 0, 
                    max: 10, 
                    step: 0.5, 
                    default: 3 
                },
                { 
                    key: 'satSpeed', 
                    type: 'slider', 
                    label: 'Saturation Speed', 
                    min: 0, 
                    max: 10, 
                    step: 0.5, 
                    default: 2 
                },
                { 
                    key: 'lumSpeed', 
                    type: 'slider', 
                    label: 'Lightness Speed', 
                    min: 0, 
                    max: 5, 
                    step: 0.5, 
                    default: 1 
                }
            ]
        }
    ],
    
    presets: [
        { name: 'Classic', maxDepth: 13, loopFrames: 360, hueSpeed: 3, satSpeed: 2, lumSpeed: 1 },
        { name: 'Deep', maxDepth: 16, loopFrames: 720, hueSpeed: 2, satSpeed: 1, lumSpeed: 0.5 },
        { name: 'Shallow', maxDepth: 8, loopFrames: 180, hueSpeed: 5, satSpeed: 3, lumSpeed: 2 },
        { name: 'Static', maxDepth: 13, loopFrames: 360, hueSpeed: 0, satSpeed: 0, lumSpeed: 0 }
    ],
    
    animation: {
        type: 'loop',
        loopFrames: 360,
        defaultFps: 60
    },
    
    // Module state (computed on setup)
    _normBounds: null,
    
    /**
     * Log normalization helper
     */
    _logNorm(val, minVal, maxVal) {
        const logMin = Math.log(minVal);
        const logMax = Math.log(maxVal);
        const logVal = Math.log(val);
        return (logVal - logMin) / (logMax - logMin);
    },
    
    /**
     * Calculate ratio from frame
     */
    _getRatio(frame, loopFrames) {
        const t = (frame % loopFrames) / loopFrames;
        const r = Math.pow(PHI, Math.sin(t * Math.PI * 2));
        return r / (1 + r);
    },
    
    /**
     * Recursive subdivision
     */
    _subdivide(p, x, y, w, h, depth, flipped, wProp, hProp, params, frame, bounds) {
        if (depth >= params.maxDepth) {
            const areaProp = wProp * hProp;
            
            // Log normalize to 0-1
            const wNorm = this._logNorm(wProp, bounds.wMin, bounds.wMax);
            const hNorm = this._logNorm(hProp, bounds.hMin, bounds.hMax);
            const aNorm = this._logNorm(areaProp, bounds.aMin, bounds.aMax);
            
            const t = (frame % params.loopFrames) / params.loopFrames;
            
            // H: width proportion (sawtooth)
            const hueNorm = (wNorm + t * params.hueSpeed) % 1;
            
            // S: height proportion (triangle ping-pong)
            const satNorm = 1 - Math.abs((hNorm + t * params.satSpeed) * 2 % 2 - 1);
            
            // L: area proportion (triangle ping-pong)
            const lumNorm = 1 - Math.abs((aNorm + t * params.lumSpeed) * 2 % 2 - 1);
            
            p.fill(hueNorm, satNorm, lumNorm);
            p.rect(x, y, w, h);
            return;
        }
        
        const ratio = this._getRatio(frame, params.loopFrames);
        const vert = (depth % 2) === 0;
        
        if (vert) {
            const wB = w * ratio;
            const wS = w - wB;
            const xB = flipped ? x + wS : x;
            const xS = flipped ? x : x + wB;
            this._subdivide(p, xB, y, wB, h, depth + 1, flipped, wProp * ratio, hProp, params, frame, bounds);
            this._subdivide(p, xS, y, wS, h, depth + 1, !flipped, wProp * (1 - ratio), hProp, params, frame, bounds);
        } else {
            const hB = h * ratio;
            const hS = h - hB;
            const yB = flipped ? y + hS : y;
            const yS = flipped ? y : y + hB;
            this._subdivide(p, x, yB, w, hB, depth + 1, flipped, wProp, hProp * ratio, params, frame, bounds);
            this._subdivide(p, x, yS, w, hS, depth + 1, !flipped, wProp, hProp * (1 - ratio), params, frame, bounds);
        }
    },
    
    /**
     * p5 setup - called once on load
     */
    p5Setup(p, params) {
        p.colorMode(p.HSL, 1, 1, 1);
        p.noStroke();
        p.noSmooth();
        p.noLoop();
        
        // Precompute normalization bounds based on maxDepth
        // Width: ceil(maxDepth/2) vertical splits
        // Height: floor(maxDepth/2) horizontal splits
        const vertSplits = Math.ceil(params.maxDepth / 2);
        const horzSplits = Math.floor(params.maxDepth / 2);
        
        this._normBounds = {
            wMax: Math.pow(P_BIG, vertSplits),
            wMin: Math.pow(P_SMALL, vertSplits),
            hMax: Math.pow(P_BIG, horzSplits),
            hMin: Math.pow(P_SMALL, horzSplits)
        };
        this._normBounds.aMax = this._normBounds.wMax * this._normBounds.hMax;
        this._normBounds.aMin = this._normBounds.wMin * this._normBounds.hMin;
    },
    
    /**
     * p5 draw - called per frame
     */
    p5Draw(p, params, frame) {
        // Recalculate bounds if maxDepth changed
        const vertSplits = Math.ceil(params.maxDepth / 2);
        const horzSplits = Math.floor(params.maxDepth / 2);
        
        const bounds = {
            wMax: Math.pow(P_BIG, vertSplits),
            wMin: Math.pow(P_SMALL, vertSplits),
            hMax: Math.pow(P_BIG, horzSplits),
            hMin: Math.pow(P_SMALL, horzSplits)
        };
        bounds.aMax = bounds.wMax * bounds.hMax;
        bounds.aMin = bounds.wMin * bounds.hMin;
        
        // Recursive subdivision
        this._subdivide(p, 0, 0, p.width, p.height, 0, false, 1, 1, params, frame, bounds);
    }
};
