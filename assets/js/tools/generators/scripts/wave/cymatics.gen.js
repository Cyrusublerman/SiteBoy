/**
 * Cymatics Script - Wave interference patterns with musical frequencies
 * 
 * @script cymatics
 * @category wave
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const TWO_PI = Math.PI * 2;

const CHORDS = {
    maj: [0, 4, 7],
    min: [0, 3, 7],
    dim: [0, 3, 6],
    aug: [0, 4, 8],
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
    triangle: (W, H) => [[W/2, H/4], [W/4, 3*H/4], [3*W/4, 3*H/4]],
    circle6: (W, H) => {
        const cx = W/2, cy = H/2;
        return Array.from({length: 6}, (_, i) => {
            const a = (i / 6) * TWO_PI;
            return [cx + Math.cos(a) * (W * 0.3), cy + Math.sin(a) * (H * 0.3)];
        });
    },
    circle12: (W, H) => {
        const cx = W/2, cy = H/2;
        return Array.from({length: 12}, (_, i) => {
            const a = (i / 12) * TWO_PI;
            return [cx + Math.cos(a) * (W * 0.35), cy + Math.sin(a) * (H * 0.35)];
        });
    },
    grid3: (W, H) => {
        const positions = [];
        for (let i = 1; i <= 3; i++) {
            for (let j = 1; j <= 3; j++) {
                positions.push([(W / 4) * i, (H / 4) * j]);
            }
        }
        return positions;
    },
    grid4: (W, H) => {
        const positions = [];
        for (let i = 1; i <= 4; i++) {
            for (let j = 1; j <= 4; j++) {
                positions.push([(W / 5) * i, (H / 5) * j]);
            }
        }
        return positions;
    },
    star5: (W, H) => {
        const cx = W/2, cy = H/2;
        return Array.from({length: 5}, (_, i) => {
            const a = (i / 5) * TWO_PI - Math.PI / 2;
            return [cx + Math.cos(a) * (W * 0.3), cy + Math.sin(a) * (H * 0.3)];
        });
    },
    corners: (W, H) => {
        const m = W * 0.15;
        return [[m, m], [W - m, m], [m, H - m], [W - m, H - m]];
    },
    cross: (W, H) => {
        const cx = W/2, cy = H/2;
        return [[cx, H * 0.15], [cx, H * 0.85], [W * 0.15, cy], [W * 0.85, cy], [cx, cy]];
    }
};

// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════

let sources = [];
let particles = [];
let t = 0;

// ═══════════════════════════════════════════════════════════════════
// WAVE SOURCE
// ═══════════════════════════════════════════════════════════════════

class WaveSource {
    constructor(x, y, semitone, amplitude, baseFreq) {
        this.x = x;
        this.y = y;
        this.semitone = semitone;
        this.amp = amplitude;
        this.baseFreq = baseFreq;
        this.noteFreq = baseFreq * Math.pow(2, semitone / 12);
        this.freq = this.noteFreq / 10;
    }
    
    getWave(px, py, time) {
        const dx = px - this.x;
        const dy = py - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        return this.amp * Math.sin(TWO_PI * (dist / this.freq - time));
    }
    
    getDisplacement(px, py, time) {
        const dx = px - this.x;
        const dy = py - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const wave = this.getWave(px, py, time);
        return { 
            x: (dx / dist) * wave,
            y: (dy / dist) * wave
        };
    }
}

// ═══════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════

function initParticles(W, H, spacing) {
    particles = [];
    for (let y = 0; y < H; y += spacing) {
        for (let x = 0; x < W; x += spacing) {
            particles.push({ x: x, y: y, ox: x, oy: y });
        }
    }
}

function setupSources(template, chordType, W, H, baseFreq, amp) {
    const positions = TEMPLATES[template] ? TEMPLATES[template](W, H) : TEMPLATES.triangle(W, H);
    const intervals = CHORDS[chordType] || CHORDS.maj;
    
    sources = positions.map((pos, i) => {
        const semitone = intervals[i % intervals.length];
        return new WaveSource(pos[0], pos[1], semitone, amp, baseFreq);
    });
}

// ═══════════════════════════════════════════════════════════════════
// DRAWING MODES
// ═══════════════════════════════════════════════════════════════════

function drawParticle(ctx, W, H, speed) {
    // Update particles
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        let dx = 0, dy = 0;
        for (let j = 0; j < sources.length; j++) {
            const d = sources[j].getDisplacement(p.ox, p.oy, t);
            dx += d.x;
            dy += d.y;
        }
        p.x = p.ox + dx;
        p.y = p.oy + dy;
    }
    
    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);
    
    // Batch particles by alpha
    const NUM_BUCKETS = 20;
    const alphaBuckets = Array.from({length: NUM_BUCKETS}, () => []);
    
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const disp = Math.sqrt((p.x - p.ox) * (p.x - p.ox) + (p.y - p.oy) * (p.y - p.oy));
        const alpha = Math.min(disp * 0.15, 1);
        if (alpha > 0.05) {
            const bucketIdx = Math.min(NUM_BUCKETS - 1, Math.floor((alpha - 0.05) / 0.95 * NUM_BUCKETS));
            alphaBuckets[bucketIdx].push(p);
        }
    }
    
    // Draw each bucket
    for (let b = 0; b < NUM_BUCKETS; b++) {
        const bucket = alphaBuckets[b];
        if (bucket.length === 0) continue;
        
        const bucketAlpha = 0.05 + (b + 0.5) / NUM_BUCKETS * 0.95;
        ctx.fillStyle = `rgba(192, 192, 192, ${bucketAlpha.toFixed(2)})`;
        
        ctx.beginPath();
        for (let i = 0; i < bucket.length; i++) {
            const p = bucket[i];
            ctx.rect(Math.floor(p.x), Math.floor(p.y), 2, 2);
        }
        ctx.fill();
    }
}

function drawDensity(ctx, W, H, boost) {
    if (sources.length === 0) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, W, H);
        return;
    }
    
    const imageData = ctx.createImageData(W, H);
    const data = imageData.data;
    let minI = Infinity, maxI = -Infinity;
    const intensities = new Float32Array(W * H);
    
    let idx = 0;
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            let total = 0;
            for (let s = 0; s < sources.length; s++) {
                total += Math.abs(sources[s].getWave(x, y, t));
            }
            intensities[idx] = total;
            if (total < minI) minI = total;
            if (total > maxI) maxI = total;
            idx++;
        }
    }
    
    const range = maxI - minI || 1;
    
    for (let i = 0; i < intensities.length; i++) {
        let normalized = (intensities[i] - minI) / range;
        normalized = Math.pow(normalized, 1 / boost);
        const grey = Math.floor(normalized * 255);
        
        const pixelIdx = i * 4;
        data[pixelIdx] = grey;
        data[pixelIdx + 1] = grey;
        data[pixelIdx + 2] = grey;
        data[pixelIdx + 3] = 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function drawRadial(ctx, W, H, boost) {
    if (sources.length === 0) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, W, H);
        return;
    }
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);
    
    const res = 2;
    let minI = Infinity, maxI = -Infinity;
    const points = [];
    
    for (let y = 0; y < H; y += res) {
        for (let x = 0; x < W; x += res) {
            let total = 0;
            for (let s = 0; s < sources.length; s++) {
                total += Math.abs(sources[s].getWave(x, y, t));
            }
            points.push({ x, y, intensity: total });
            if (total < minI) minI = total;
            if (total > maxI) maxI = total;
        }
    }
    
    const range = maxI - minI || 1;
    
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        let normalized = (p.intensity - minI) / range;
        normalized = Math.pow(normalized, 1 / boost);
        
        if (normalized > 0.05) {
            const grey = Math.floor(normalized * 255);
            ctx.fillStyle = `rgb(${grey},${grey},${grey})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(1, res * 0.8), 0, TWO_PI);
            ctx.fill();
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// DRAW FUNCTION
// ═══════════════════════════════════════════════════════════════════

function draw(ctx, canvas, params, frame) {
    const W = canvas.width;
    const H = canvas.height;
    
    // Initialize on first frame or size change
    if (particles.length === 0 || sources.length === 0) {
        initParticles(W, H, params.particleSpacing || 5);
        setupSources(
            params.template || 'triangle',
            params.chordType || 'maj',
            W, H,
            ROOT_NOTES[params.rootNote] || 440,
            params.amplitude || 3
        );
    }
    
    // Update time
    const speed = params.speed || 0.08;
    t = frame * speed;
    
    // Update sources if params changed
    const baseFreq = ROOT_NOTES[params.rootNote] || 440;
    for (let i = 0; i < sources.length; i++) {
        sources[i].amp = params.amplitude || 3;
        sources[i].baseFreq = baseFreq;
        sources[i].noteFreq = baseFreq * Math.pow(2, sources[i].semitone / 12);
        sources[i].freq = sources[i].noteFreq / 10;
    }
    
    // Draw based on mode
    const vizMode = (params.vizMode || 'particle').toLowerCase();
    const boost = params.boost || 3;
    
    if (vizMode === 'particle') {
        drawParticle(ctx, W, H, speed);
    } else if (vizMode === 'density') {
        drawDensity(ctx, W, H, boost);
    } else if (vizMode === 'radial') {
        drawRadial(ctx, W, H, boost);
    }
    
    // Draw source markers
    if (params.showSources) {
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < sources.length; i++) {
            ctx.beginPath();
            ctx.arc(sources[i].x, sources[i].y, 4, 0, TWO_PI);
            ctx.fill();
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// SCRIPT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export const SCRIPT_CONFIG = {
    id: 'cymatics',
    title: 'Cymatics',
    category: 'wave',
    description: 'Wave interference patterns with musical frequencies. Simulates Chladni plate vibration patterns using multiple wave sources with harmonic frequency relationships.',
    version: '1.0.0',
    
    canvas: {
        width: 512,
        height: 512,
        context: '2d',
        background: '#000000'
    },
    
    animation: {
        type: 'infinite',
        defaultFps: 60,
        canPrerender: true
    },
    
    export: {
        png: true,
        gif: true,
        webm: true,
        sequence: true
    },
    
    presets: [
        {
            name: 'Default',
            values: {
                vizMode: 'particle',
                rootNote: 'A4',
                chordType: 'maj',
                template: 'triangle',
                amplitude: 3,
                speed: 0.08,
                boost: 3,
                particleSpacing: 5,
                showSources: true
            }
        },
        {
            name: 'Density Field',
            values: {
                vizMode: 'density',
                rootNote: 'C4',
                chordType: 'min7',
                template: 'circle6',
                amplitude: 4,
                speed: 0.05,
                boost: 4,
                particleSpacing: 5,
                showSources: false
            }
        },
        {
            name: 'Grid Pattern',
            values: {
                vizMode: 'particle',
                rootNote: 'G4',
                chordType: 'maj7',
                template: 'grid3',
                amplitude: 2,
                speed: 0.1,
                boost: 3,
                particleSpacing: 4,
                showSources: true
            }
        }
    ],
    
    parameters: [
        {
            group: 'Visualization',
            params: [
                {
                    key: 'vizMode',
                    type: 'radio',
                    label: 'Display',
                    options: ['Particle', 'Density', 'Radial'],
                    default: 'Particle'
                },
                {
                    key: 'showSources',
                    type: 'toggle',
                    label: 'Show Sources',
                    default: true
                }
            ]
        },
        {
            group: 'Frequency',
            params: [
                {
                    key: 'rootNote',
                    type: 'dropdown',
                    label: 'Root Note',
                    options: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'],
                    default: 'A4'
                },
                {
                    key: 'chordType',
                    type: 'dropdown',
                    label: 'Chord Type',
                    options: ['maj', 'min', 'dim', 'aug', 'maj7', 'min7', 'dom7', 'sus4'],
                    default: 'maj'
                }
            ]
        },
        {
            group: 'Pattern',
            params: [
                {
                    key: 'template',
                    type: 'dropdown',
                    label: 'Layout',
                    options: ['triangle', 'circle6', 'circle12', 'grid3', 'grid4', 'star5', 'corners', 'cross'],
                    default: 'triangle'
                }
            ]
        },
        {
            group: 'Wave Parameters',
            params: [
                {
                    key: 'amplitude',
                    type: 'slider',
                    label: 'Amplitude',
                    min: 1,
                    max: 10,
                    step: 0.5,
                    default: 3,
                    precision: 1
                },
                {
                    key: 'speed',
                    type: 'slider',
                    label: 'Speed',
                    min: 0.01,
                    max: 0.2,
                    step: 0.01,
                    default: 0.08,
                    precision: 2
                },
                {
                    key: 'boost',
                    type: 'slider',
                    label: 'Contrast',
                    min: 1,
                    max: 10,
                    step: 0.5,
                    default: 3,
                    precision: 1
                },
                {
                    key: 'particleSpacing',
                    type: 'slider',
                    label: 'Particle Density',
                    min: 2,
                    max: 10,
                    step: 1,
                    default: 5
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
                    min: 256,
                    max: 1024,
                    step: 64,
                    default: 512
                },
                {
                    key: 'canvasHeight',
                    type: 'slider',
                    label: 'Height',
                    min: 256,
                    max: 1024,
                    step: 64,
                    default: 512
                }
            ]
        }
    ],
    
    // Reset state on cleanup
    onDestroy: () => {
        sources = [];
        particles = [];
        t = 0;
    },
    
    draw: draw
};

console.log('✅ Cymatics script loaded');
