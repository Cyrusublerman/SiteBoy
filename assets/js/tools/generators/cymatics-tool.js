/**
 * Cymatics Animation Tool - ToolBase Implementation
 * Wave interference patterns with musical frequencies
 * 
 * @version 1.0.0 - ToolBase Refactor
 */

// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { AnimationLoop } from '../../core/animation-foundation.js';
import { WaveSolver } from '../../shared/algorithms/index.js';

// Animation state
    let t = 0;
    let animator = null;
    let vizMode = 'particle';
    let sources = [];
    let particles = [];
    let baseFreq = 440;
    let amp = 3;
    let speed = 0.08;
    let boost = 3;
    let sourceIdCounter = 0;
    
    // Musical chords
    var CHORDS = {
        maj: [0, 4, 7],
        min: [0, 3, 7],
        dim: [0, 3, 6],
        aug: [0, 4, 8],
        maj7: [0, 4, 7, 11],
        min7: [0, 3, 7, 10],
        dom7: [0, 4, 7, 10],
        sus4: [0, 5, 7]
    };
    
    // WaveSource class
    function WaveSource(x, y, semitone, amplitude, id, freq) {
        this.x = x;
        this.y = y;
        this.semitone = semitone;
        this.amp = amplitude;
        this.id = id;
        this.baseFreq = freq;
        this.noteFreq = freq * Math.pow(2, semitone / 12);
        this.freq = this.noteFreq / 10;
    }
    
    WaveSource.prototype.getWave = function(px, py, time) {
        var dx = px - this.x;
        var dy = py - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        
        // Use shared WaveSolver for radial wave calculation
        return WaveSolver.travellingWaveRadial(dist, time, {
            freq: 1 / this.freq,
            amp: this.amp
        });
    };
    
    WaveSource.prototype.getDisplacement = function(px, py, time) {
        var dx = px - this.x;
        var dy = py - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var wave = this.getWave(px, py, time);
        return { 
            x: (dx / dist) * wave,
            y: (dy / dist) * wave
        };
    };
    
    // ToolBase configuration
    const TOOL_CONFIG = {
        title: 'CYMATICS',
        
        // Animation export config: continuous animation (user sets frames)
        animation: {
            type: 'infinite',
            loopFrames: 0,  // No defined loop - continuous
            defaultFps: 60,
            canPrerender: true
        },
        
        sidebar: [
            // ═══════════════════════════════════════════════════════════════════
            // TAB 1: CONTROLS — Visualization, Frequency, Parameters
            // ═══════════════════════════════════════════════════════════════════
            ['CONTROLS', [
                ['Visualization', [
                    ['radio', 'Display', ['Particle', 'Density', 'Radial'], { 
                        key: 'vizMode', 
                        selectedValue: 'Particle' 
                    }],
                ]],
                ['Frequency', [
                    ['dropdown', 'Root Note', ['C4 (262Hz)', 'D4 (294Hz)', 'E4 (330Hz)', 'F4 (349Hz)', 'G4 (392Hz)', 'A4 (440Hz)', 'B4 (494Hz)'], { 
                        key: 'rootNote'
                    }],
                    ['dropdown', 'Chord Type', ['Major', 'Minor', 'Diminished', 'Augmented', 'Major 7', 'Minor 7', 'Dom 7', 'Sus 4'], { 
                        key: 'chordType'
                    }],
                ]],
                ['Wave Parameters', [
                    ['slider', 'Amplitude', 1, 10, 0.5, { key: 'amplitude', value: 3, precision: 1, withNumber: true }],
                    ['slider', 'Speed', 0.01, 0.2, 0.01, { key: 'speed', value: 0.08, precision: 2, withNumber: true }],
                    ['slider', 'Contrast', 1, 10, 0.5, { key: 'boost', value: 3, precision: 1, withNumber: true }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 2: TEMPLATES — Pattern Layouts
            // ═══════════════════════════════════════════════════════════════════
            ['TEMPLATES', [
                ['Pattern', [
                    ['dropdown', 'Layout', ['Triangle', 'Circle 6', 'Circle 12', 'Grid 3x3', 'Grid 4x4', 'Star 5', 'Corners', 'Cross'], { 
                        key: 'template'
                    }],
                ]],
                ['Actions', [
                    ['button', 'Clear Sources', null, { key: 'clearSources' }],
                ]],
            ]],
            // Auto-CANVAS and Auto-ANIMATION tabs will be injected (total: 4 tabs)
        ],
        
        canvas: {
            width: 512,
            height: 512,
            showControls: true
        },
        
        onInit: function(values) {
            var self = this;
            
            // Initialize particles
            initParticles(this.canvas.width, this.canvas.height);
            
            // Setup default chord (Major triangle)
            setupChord('maj', this.canvas.width, this.canvas.height);
            
            // Wire clear button
            var clearBtn = this.getComponent('clearSources');
            if (clearBtn && clearBtn.element) {
                clearBtn.element.addEventListener('click', function() {
                    sources = [];
                    sourceIdCounter = 0;
                    self.setStatus('Sources cleared');
                });
            }
            
            // Start animation loop
            // Use AnimationFoundation.AnimationLoop (required - no direct RAF)
            if (AnimationLoop) {
                animator = new AnimationLoop({
                    onFrame: function() {
                        self.draw();
                    }
                });
                animator.start();
            } else {
                console.error('AnimationFoundation not available - animation disabled');
                // Fallback: draw once immediately so canvas isn't blank
                self.draw();
                animator = { destroy: function() { } };
            }
        },
        
        onUpdate: function(key, value, allValues) {
            var self = this;
            
            switch(key) {
                case 'vizMode':
                    vizMode = (value || 'Particle').toLowerCase();
                    break;
                    
                case 'rootNote':
                    var freqMap = {
                        'C4 (262Hz)': 262, 'D4 (294Hz)': 294, 'E4 (330Hz)': 330,
                        'F4 (349Hz)': 349, 'G4 (392Hz)': 392, 'A4 (440Hz)': 440, 'B4 (494Hz)': 494
                    };
                    baseFreq = freqMap[value] || 440;
                    updateSourceFreqs();
                    break;
                    
                case 'chordType':
                    var chordMap = {
                        'Major': 'maj', 'Minor': 'min', 'Diminished': 'dim', 'Augmented': 'aug',
                        'Major 7': 'maj7', 'Minor 7': 'min7', 'Dom 7': 'dom7', 'Sus 4': 'sus4'
                    };
                    var chordKey = chordMap[value] || 'maj';
                    setupChord(chordKey, this.canvas.width, this.canvas.height);
                    break;
                    
                case 'template':
                    var templateMap = {
                        'Triangle': 'triangle', 'Circle 6': 'circle6', 'Circle 12': 'circle12',
                        'Grid 3x3': 'grid3', 'Grid 4x4': 'grid4', 'Star 5': 'star5',
                        'Corners': 'corners', 'Cross': 'cross'
                    };
                    setupTemplate(templateMap[value] || 'triangle', this.canvas.width, this.canvas.height);
                    break;
                    
                case 'amplitude':
                    amp = parseFloat(value) || 3;
                    break;
                    
                case 'speed':
                    speed = parseFloat(value) || 0.08;
                    break;
                    
                case 'boost':
                    boost = parseFloat(value) || 3;
                    break;
                    
                // Canvas resize - reinitialize particles
                case '_canvasWidth':
                case '_canvasHeight':
                    initParticles(this.canvas.width, this.canvas.height);
                    break;
            }
        },
        
        // Pre-render support: render a specific frame for animation export
        onRenderFrame: function(frameIndex, totalFrames) {
            var originalT = t;
            // Each frame advances t by 'speed' amount
            t = frameIndex * speed;
            
            var ctx = this.ctx;
            var canvas = this.canvas;
            var W = canvas.width;
            var H = canvas.height;
            
            if (vizMode === 'particle') {
                // Update particles for this frame
                for (var i = 0; i < particles.length; i++) {
                    var p = particles[i];
                    var dx = 0, dy = 0;
                    for (var j = 0; j < sources.length; j++) {
                        var d = sources[j].getDisplacement(p.ox, p.oy, t);
                        dx += d.x;
                        dy += d.y;
                    }
                    p.x = p.ox + dx;
                    p.y = p.oy + dy;
                }
                drawParticle(ctx, W, H);
            } else if (vizMode === 'density') {
                drawDensity(ctx, W, H);
            } else if (vizMode === 'radial') {
                drawRadial(ctx, W, H);
            }
            
            // Draw source markers
            ctx.fillStyle = '#fff';
            for (var i = 0; i < sources.length; i++) {
                ctx.beginPath();
                ctx.arc(sources[i].x, sources[i].y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            
            t = originalT;
        },
        
        onDraw: function(ctx, canvas, values) {
            t += speed;
            
            var W = canvas.width;
            var H = canvas.height;
            
            if (vizMode === 'particle') {
                drawParticle(ctx, W, H);
            } else if (vizMode === 'density') {
                drawDensity(ctx, W, H);
            } else if (vizMode === 'radial') {
                drawRadial(ctx, W, H);
            }
            
            // Draw source markers
            ctx.fillStyle = '#fff';
            for (var i = 0; i < sources.length; i++) {
                ctx.beginPath();
                ctx.arc(sources[i].x, sources[i].y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    };
    
    function initParticles(W, H) {
        particles = [];
        for (var y = 0; y < H; y += 5) {
            for (var x = 0; x < W; x += 5) {
                particles.push({ x: x, y: y, ox: x, oy: y });
            }
        }
    }
    
    function updateSourceFreqs() {
        for (var i = 0; i < sources.length; i++) {
            sources[i].baseFreq = baseFreq;
            sources[i].noteFreq = baseFreq * Math.pow(2, sources[i].semitone / 12);
            sources[i].freq = sources[i].noteFreq / 10;
        }
    }
    
    function setupChord(chordType, W, H) {
        sources = [];
        sourceIdCounter = 0;
        var intervals = CHORDS[chordType] || [0, 4, 7];
        
        // Default triangle positions
        var positions = intervals.length === 3 ? 
            [[W/2, H/4], [W/4, 3*H/4], [3*W/4, 3*H/4]] :
            [[W/3, H/3], [2*W/3, H/3], [W/3, 2*H/3], [2*W/3, 2*H/3]];
        
        for (var i = 0; i < intervals.length && i < positions.length; i++) {
            sources.push(new WaveSource(positions[i][0], positions[i][1], intervals[i], amp, sourceIdCounter++, baseFreq));
        }
    }
    
    function setupTemplate(template, W, H) {
        var positions = getTemplatePositions(template, W, H);
        sources = [];
        sourceIdCounter = 0;
        
        // Get current chord intervals or default to major
        var intervals = [0, 4, 7];
        
        for (var i = 0; i < positions.length; i++) {
            var semitone = intervals[i % intervals.length];
            sources.push(new WaveSource(positions[i][0], positions[i][1], semitone, amp, sourceIdCounter++, baseFreq));
        }
    }
    
    function getTemplatePositions(template, W, H) {
        var cx = W / 2;
        var cy = H / 2;
        var positions = [];
        
        switch(template) {
            case 'triangle':
                positions = [[W/2, H/4], [W/4, 3*H/4], [3*W/4, 3*H/4]];
                break;
            case 'circle6':
                for (var i = 0; i < 6; i++) {
                    var a = (i / 6) * Math.PI * 2;
                    positions.push([cx + Math.cos(a) * (W * 0.3), cy + Math.sin(a) * (H * 0.3)]);
                }
                break;
            case 'circle12':
                for (var i = 0; i < 12; i++) {
                    var a = (i / 12) * Math.PI * 2;
                    positions.push([cx + Math.cos(a) * (W * 0.35), cy + Math.sin(a) * (H * 0.35)]);
                }
                break;
            case 'grid3':
                for (var i = 1; i <= 3; i++) {
                    for (var j = 1; j <= 3; j++) {
                        positions.push([(W / 4) * i, (H / 4) * j]);
                    }
                }
                break;
            case 'grid4':
                for (var i = 1; i <= 4; i++) {
                    for (var j = 1; j <= 4; j++) {
                        positions.push([(W / 5) * i, (H / 5) * j]);
                    }
                }
                break;
            case 'star5':
                for (var i = 0; i < 5; i++) {
                    var a = (i / 5) * Math.PI * 2 - Math.PI / 2;
                    positions.push([cx + Math.cos(a) * (W * 0.3), cy + Math.sin(a) * (H * 0.3)]);
                }
                break;
            case 'corners':
                var m = W * 0.15;
                positions = [[m, m], [W - m, m], [m, H - m], [W - m, H - m]];
                break;
            case 'cross':
                positions = [[cx, H * 0.15], [cx, H * 0.85], [W * 0.15, cy], [W * 0.85, cy], [cx, cy]];
                break;
            default:
                positions = [[W/2, H/4], [W/4, 3*H/4], [3*W/4, 3*H/4]];
        }
        return positions;
    }
    
    function drawParticle(ctx, W, H) {
        // Update particles
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            var dx = 0, dy = 0;
            for (var j = 0; j < sources.length; j++) {
                var d = sources[j].getDisplacement(p.ox, p.oy, t);
                dx += d.x;
                dy += d.y;
            }
            p.x = p.ox + dx;
            p.y = p.oy + dy;
        }
        
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, W, H);
        
        // OPTIMIZED: Batch particles by alpha into buckets (reduces N draw calls to ~20)
        // Alpha range: 0.05 to 1.0, quantized into 20 buckets
        var NUM_BUCKETS = 20;
        var alphaBuckets = [];
        for (var b = 0; b < NUM_BUCKETS; b++) {
            alphaBuckets[b] = [];
        }
        
        // Sort particles into alpha buckets
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            var disp = Math.sqrt((p.x - p.ox) * (p.x - p.ox) + (p.y - p.oy) * (p.y - p.oy));
            var alpha = Math.min(disp * 0.15, 1);
            if (alpha > 0.05) {
                // Map alpha 0.05-1.0 to bucket 0-19
                var bucketIdx = Math.min(NUM_BUCKETS - 1, Math.floor((alpha - 0.05) / 0.95 * NUM_BUCKETS));
                alphaBuckets[bucketIdx].push(p);
            }
        }
        
        // Draw each bucket with single beginPath/fill (batched drawing)
        for (var b = 0; b < NUM_BUCKETS; b++) {
            var bucket = alphaBuckets[b];
            if (bucket.length === 0) continue;
            
            // Calculate alpha for this bucket (center of range)
            var bucketAlpha = 0.05 + (b + 0.5) / NUM_BUCKETS * 0.95;
            ctx.fillStyle = 'rgba(192, 192, 192, ' + bucketAlpha.toFixed(2) + ')';
            
            // Single path for all particles in bucket
            ctx.beginPath();
            for (var i = 0; i < bucket.length; i++) {
                var p = bucket[i];
                ctx.rect(Math.floor(p.x), Math.floor(p.y), 2, 2);
            }
            ctx.fill();
        }
    }
    
    function drawDensity(ctx, W, H) {
        if (sources.length === 0) {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, W, H);
            return;
        }
        
        var imageData = ctx.createImageData(W, H);
        var data = imageData.data;
        var minI = Infinity, maxI = -Infinity;
        var intensities = new Float32Array(W * H);
        
        var idx = 0;
        for (var y = 0; y < H; y++) {
            for (var x = 0; x < W; x++) {
                var total = 0;
                for (var s = 0; s < sources.length; s++) {
                    total += Math.abs(sources[s].getWave(x, y, t));
                }
                intensities[idx] = total;
                if (total < minI) minI = total;
                if (total > maxI) maxI = total;
                idx++;
            }
        }
        
        var range = maxI - minI || 1;
        
        for (var i = 0; i < intensities.length; i++) {
            var normalized = (intensities[i] - minI) / range;
            normalized = Math.pow(normalized, 1 / boost);
            var grey = Math.floor(normalized * 255);
            
            var pixelIdx = i * 4;
            data[pixelIdx] = grey;
            data[pixelIdx + 1] = grey;
            data[pixelIdx + 2] = grey;
            data[pixelIdx + 3] = 255;
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    function drawRadial(ctx, W, H) {
        if (sources.length === 0) {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, W, H);
            return;
        }
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        
        var res = 2;
        var minI = Infinity, maxI = -Infinity;
        var points = [];
        
        for (var y = 0; y < H; y += res) {
            for (var x = 0; x < W; x += res) {
                var total = 0;
                for (var s = 0; s < sources.length; s++) {
                    total += Math.abs(sources[s].getWave(x, y, t));
                }
                points.push({ x: x, y: y, intensity: total });
                if (total < minI) minI = total;
                if (total > maxI) maxI = total;
            }
        }
        
        var range = maxI - minI || 1;
        
        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            var normalized = (p.intensity - minI) / range;
            normalized = Math.pow(normalized, 1 / boost);
            
            if (normalized > 0.05) {
                var grey = Math.floor(normalized * 255);
                ctx.fillStyle = 'rgb(' + grey + ',' + grey + ',' + grey + ')';
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(1, res * 0.8), 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    /**
     * CymaticsTool wrapper class
     */
    function CymaticsTool(container, deps) {
        this.container = container;
        this.deps = {
            ComponentLibrary,
            ...(deps || {})
        };
        this.tool = null;
        this.render();
    }
    
    CymaticsTool.prototype.render = function() {
        try {
            this.tool = new ToolBase(TOOL_CONFIG, this.deps);
            this.tool.mount(this.container);
            this.tool.draw();
            console.log('✅ CymaticsTool rendered');
        } catch (error) {
            console.error('❌ CymaticsTool error:', error);
            this.container.innerHTML =
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>CYMATICS TOOL ERROR</h2>' +
                '<p style="color: red;">' + error.message + '</p>' +
                '</div>';
        }
    };
    
    CymaticsTool.prototype.destroy = function() {
        if (animator) {
            animator.destroy();
            animator = null;
        }
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        t = 0;
        sources = [];
        particles = [];
    };

// ES Module export
export { CymaticsTool };
export default CymaticsTool;

// Global compatibility
if (typeof window !== 'undefined') {
    window.CymaticsTool = CymaticsTool;
}

console.log('✅ CymaticsTool loaded (ToolBase)');
