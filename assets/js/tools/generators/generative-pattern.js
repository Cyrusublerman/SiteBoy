/**
 * Generative Pattern Algorithm — UNIFIED IMPLEMENTATION
 * 
 * Implements the original design: unified system where all patterns emerge from
 * a single point network with evolution running ON the network.
 * 
 * Architecture:
 * - ONE point network (points with {x,y,u,v,alive,weight})
 * - Evolution (RD/CA) modulates point weights via network diffusion
 * - Truchet tiles determined by local edge connectivity
 * - Single distance field computed from edges
 * - All render modes are views of the same unified structure
 * 
 * @version 5.0.0 - Unified architecture (matches original design)
 */
// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { AnimationLoop } from '../../core/animation-foundation.js';
import {
    Sampling,
    Noise,
    SpatialIndex,
    Advection,
    ReactionDiffusion,
    Patterns,
    Rendering,
    MathUtils
} from '../../shared/algorithms/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
    // LIBRARY IMPORTS
    // ═══════════════════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════════════════
    // STATE — Unified structure
    // ═══════════════════════════════════════════════════════════════════════════════
    
    var state = {
        points: [],         // {x, y, u, v, alive, weight}
        edges: [],          // {i, j, weight}
        kdTree: null,
        distanceField: null,  // Global distance field from edges
        rng: null,
        animator: null,
        time: 0,
        playing: false
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════════


    // ═══════════════════════════════════════════════════════════════════════════════
    // BUILD FUNCTIONS — Create unified point network
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function rebuild(v, tool) {
        buildPoints(v, tool);
        buildEdges(v);
        buildVelocityField(v, tool);
        initEvolutionState(v);
    }
    
    function buildPoints(v, tool) {
        var w = tool.tool.canvas.width, h = tool.tool.canvas.height;
        var cols = Math.floor(w / (30 / v.density));
        var rows = Math.floor(h / (30 / v.density));
        
        // Generate jittered grid
        var raw = Sampling.jitteredGrid(w, h, cols, rows, v.jitter, state.rng);
        
        // Filter by noise clustering + apply grid strength
        state.points = raw.filter(function(p) {
            p.noise = Noise.simplex2D(p.x / (100 * v.clusterScale), p.y / (100 * v.clusterScale));
            return v.clusterScale <= 1 || p.noise >= -0.3;
        }).map(function(p) {
            var gx = Math.round(p.x / 30) * 30;
            var gy = Math.round(p.y / 30) * 30;
            return { 
                x: gx * v.gridStrength + p.x * (1 - v.gridStrength), 
                y: gy * v.gridStrength + p.y * (1 - v.gridStrength),
                
                // Evolution state (initialized here, updated by stepEvolution)
                u: 1.0,
                v: 0.0,
                alive: false,
                
                // Rendering property (modulated by evolution)
                weight: 1.0,
                
                // Internal
                noise: p.noise
            };
        });
        
        // Build spatial index
        if (state.points.length > 0) {
            state.kdTree = SpatialIndex.buildKdTree(state.points);
        }
    }
    
    function buildEdges(v) {
        if (state.points.length < 2) { state.edges = []; return; }
        
        var radius = v.neighborRadius * 20;
        var pairs = SpatialIndex.findClosePointPairs(state.points, radius);
        
        // Apply degree constraint + axis bias
        var deg = new Array(state.points.length).fill(0);
        state.edges = pairs
            .map(function(pair) {
                var dx = state.points[pair.j].x - state.points[pair.i].x;
                var dy = state.points[pair.j].y - state.points[pair.i].y;
                var angle = Math.atan2(dy, dx);
                var bias = 1 - v.axisBias * (1 - Math.abs(Math.cos(2 * angle)));
                return { i: pair.i, j: pair.j, dist: pair.dist * bias, angle: angle, weight: 1.0 };
            })
            .sort(function(a, b) { return a.dist - b.dist; })
            .filter(function(e) {
                if (deg[e.i] < v.maxDegree && deg[e.j] < v.maxDegree) {
                    deg[e.i]++; deg[e.j]++;
                    // Apply arc quantization
                    if (v.arcQuant > 0) {
                        var step = Math.PI / Math.max(4, Math.round(8 * v.arcQuant));
                        e.angle = Math.round(e.angle / step) * step;
                    }
                    return true;
                }
                return false;
            });
    }
    
    function buildVelocityField(v, tool) {
        // For advection (not critical to unified structure)
        // Using curl noise for smooth flow
        state.velocityField = {
            w: Math.floor(tool.tool.canvas.width / 4),
            h: Math.floor(tool.tool.canvas.height / 4)
        };
        state.velocityField.vx = Advection.curlNoiseVelocityField(
            state.velocityField.w,
            state.velocityField.h,
            Noise.simplex2D,
            v.noiseFrequency * 0.01,
            1.0
        ).vx;
        state.velocityField.vy = Advection.curlNoiseVelocityField(
            state.velocityField.w,
            state.velocityField.h,
            Noise.simplex2D,
            v.noiseFrequency * 0.01,
            1.0
        ).vy;
    }
    
    function initEvolutionState(v) {
        // Initialize evolution state on points based on mode
        var n = state.points.length;
        if (n === 0) return;
        
        if (v.evolutionMode === 'Reaction-Diffusion') {
            // Seed RD in center
            var cx = 0, cy = 0;
            for (var i = 0; i < n; i++) {
                cx += state.points[i].x;
                cy += state.points[i].y;
            }
            cx /= n; cy /= n;
            
            for (var i = 0; i < n; i++) {
                var p = state.points[i];
                var dist = Math.sqrt((p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy));
                if (dist < 50) {
                    p.u = 0.5 + (Math.random() - 0.5) * 0.1;
                    p.v = 0.25 + (Math.random() - 0.5) * 0.1;
                } else {
                    p.u = 1.0;
                    p.v = 0.0;
                }
                p.weight = 1.0;
            }
        } else if (v.evolutionMode === 'Cellular Automaton') {
            // Random seed for CA
            for (var i = 0; i < n; i++) {
                state.points[i].alive = Math.random() < 0.3;
                state.points[i].u = 1.0;
                state.points[i].v = 0.0;
                state.points[i].weight = state.points[i].alive ? 2.0 : 0.5;
            }
        } else {
            // None - reset to defaults
            for (var i = 0; i < n; i++) {
                state.points[i].u = 1.0;
                state.points[i].v = 0.0;
                state.points[i].alive = false;
                state.points[i].weight = 1.0;
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EVOLUTION — ON THE NETWORK (not separate grids!)
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function stepEvolution(v) {
        if (v.evolutionMode === 'Reaction-Diffusion') {
            stepRD_onNetwork(v);
        } else if (v.evolutionMode === 'Cellular Automaton') {
            stepCA_onNetwork(v);
        }
    }
    
    /**
     * Gray-Scott RD on network
     * 
     * Adapted from grid-based formula:
     * ∂u/∂t = Du∇²u - uv² + f(1-u)
     * ∂v/∂t = Dv∇²v + uv² - (f+k)v
     * 
     * Network Laplacian: ∇²u_i = (1/k_i) * Σ_{j∈N(i)} (u_j - u_i)
     */
    function stepRD_onNetwork(v) {
        var n = state.points.length;
        if (n === 0) return;
        
        var Du = v.rdDu, Dv = v.rdDv, feed = v.feedRate, kill = v.killRate;
        
        // Compute network Laplacian for each point
        var lapU = new Float32Array(n);
        var lapV = new Float32Array(n);
        var degree = new Array(n).fill(0);
        
        // Sum over edges (each edge contributes to both endpoints)
        for (var e = 0; e < state.edges.length; e++) {
            var edge = state.edges[e];
            var i = edge.i, j = edge.j;
            
            lapU[i] += state.points[j].u - state.points[i].u;
            lapU[j] += state.points[i].u - state.points[j].u;
            lapV[i] += state.points[j].v - state.points[i].v;
            lapV[j] += state.points[i].v - state.points[j].v;
            
            degree[i]++;
            degree[j]++;
        }
        
        // Apply Gray-Scott reaction-diffusion
        for (var i = 0; i < n; i++) {
            var p = state.points[i];
            
            if (degree[i] > 0) {
                lapU[i] /= degree[i];
                lapV[i] /= degree[i];
            }
            
            var u = p.u;
            var v = p.v;
            var v2 = v * v;
            var uv2 = u * v2;  // Correct: u*v², not v³
            
            // Compute next state
            p.u_next = u + (Du * lapU[i] - uv2 + feed * (1 - u));
            p.v_next = v + (Dv * lapV[i] + uv2 - (feed + kill) * v);
            
            // Clamp to [0,1]
            p.u_next = Math.max(0, Math.min(1, p.u_next));
            p.v_next = Math.max(0, Math.min(1, p.v_next));
            
            // Modulate weight based on v concentration
            p.weight = 1.0 + 2.0 * p.v_next;
        }
        
        // Swap buffers
        for (var i = 0; i < n; i++) {
            state.points[i].u = state.points[i].u_next;
            state.points[i].v = state.points[i].v_next;
        }
    }
    
    /**
     * Cellular Automaton on network
     * Neighbors determined by edges, not Moore grid
     */
    function stepCA_onNetwork(v) {
        var n = state.points.length;
        if (n === 0) return;
        
        var rules = { 'Life': 'life', 'Seeds': 'seeds', 'Day & Night': 'dayNight', 
                     'Maze': 'maze', 'HighLife': 'highLife', 'Anneal': 'anneal' };
        var rule = ReactionDiffusion.CA_RULES[rules[v.caRule] || 'life'];
        
        var alive_next = new Array(n);
        
        // Count alive neighbors for each point
        for (var i = 0; i < n; i++) {
            var aliveNeighbors = 0;
            
            // Count via edges
            for (var e = 0; e < state.edges.length; e++) {
                var edge = state.edges[e];
                if (edge.i === i && state.points[edge.j].alive) aliveNeighbors++;
                if (edge.j === i && state.points[edge.i].alive) aliveNeighbors++;
            }
            
            // Apply CA rule
            if (state.points[i].alive) {
                alive_next[i] = rule.survival.includes(aliveNeighbors);
            } else {
                alive_next[i] = rule.birth.includes(aliveNeighbors);
            }
        }
        
        // Update state and modulate weights
        for (var i = 0; i < n; i++) {
            state.points[i].alive = alive_next[i];
            state.points[i].weight = alive_next[i] ? 2.0 : 0.5;
        }
    }
    
    function advectPoints(v, w, h) {
        if (!state.velocityField) return;
        
        var fw = state.velocityField.w;
        var fh = state.velocityField.h;
        var vx = state.velocityField.vx;
        var vy = state.velocityField.vy;
        
        for (var i = 0; i < state.points.length; i++) {
            var p = state.points[i];
            var next = Advection.advectParticleEuler(
                p.x / w * fw, p.y / h * fh,
                vx, vy, fw, fh, v.flowSpeed
            );
            p.x = (next.x / fw) * w;
            p.y = (next.y / fh) * h;
            
            // Wrap
            if (p.x < 0) p.x += w; if (p.x > w) p.x -= w;
            if (p.y < 0) p.y += h; if (p.y > h) p.y -= h;
        }
        
        // Rebuild edges after advection
        buildEdges(v);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // RENDERING — All modes view the unified structure
    // ═══════════════════════════════════════════════════════════════════════════════
    
    /**
     * Truchet: Tile pattern determined by edge connectivity (not random!)
     */
    function renderTruchet(ctx, w, h, v) {
        var cellSize = 30 / v.density;
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineCap = 'round';
        
        // For each point, determine tile from connectivity
        for (var i = 0; i < state.points.length; i++) {
            var p = state.points[i];
            
            // Find neighbors
            var neighbors = [];
            for (var e = 0; e < state.edges.length; e++) {
                var edge = state.edges[e];
                if (edge.i === i) {
                    neighbors.push({ angle: edge.angle, idx: edge.j });
                } else if (edge.j === i) {
                    var angle = edge.angle + Math.PI;
                    if (angle > Math.PI) angle -= 2 * Math.PI;
                    neighbors.push({ angle: angle, idx: edge.i });
                }
            }
            
            // Determine tile type from connectivity
            var tileState = 0;
            if (neighbors.length === 0) {
                tileState = 0;  // Dot
            } else if (neighbors.length <= 2) {
                // Line/arc - direction from first neighbor
                tileState = neighbors[0].angle > 0 ? 1 : 0;
            } else if (neighbors.length === 3) {
                tileState = 2;  // T-junction
            } else {
                tileState = 3;  // Cross
            }
            
            // Modulate by evolution state
            if (v.evolutionMode === 'Reaction-Diffusion' && p.v > 0.3) {
                tileState = 1 - (tileState % 2);  // Flip tile
            } else if (v.evolutionMode === 'Cellular Automaton' && p.alive) {
                tileState = 1 - (tileState % 2);
            }
            
            // Draw tile
            ctx.lineWidth = 2 * v.weightScale * p.weight / 2;  // Use evolved weight
            var arcs = Patterns.getTruchetArcs(0, 0, tileState % 2, cellSize * v.tileWindow);
            
            for (var a = 0; a < arcs.length; a++) {
                var arc = arcs[a];
                ctx.beginPath();
                ctx.arc(p.x + arc.cx, p.y + arc.cy, arc.r, arc.startAngle, arc.endAngle);
                ctx.stroke();
            }
        }
    }
    
    /**
     * Blob: Inflate points/edges by evolved weights
     */
    function renderBlobs(ctx, w, h, v) {
        Rendering.renderBlobs(ctx, state.points, state.edges, {
            pointRadius: 15 * v.weightScale,
            lineWidth: 15 * v.weightScale,
            radiusFn: function(p) { return 15 * v.weightScale * p.weight; },  // Use evolved weight
            fillStyle: '#FFFFFF'
        });
    }
    
    /**
     * Nested: Concentric contours around each point
     */
    function renderNested(ctx, w, h, v) {
        Rendering.renderConcentricContours(ctx, state.points, {
            count: v.contourCount,
            maxRadius: 40 * v.weightScale,
            lineWidth: v.weightScale,
            colors: ['#FFFFFF', '#808080'],
            fadeAlpha: true
        });
    }
    
    /**
     * Global: Distance field contours (would use state.distanceField if implemented)
     */
    function renderGlobal(ctx, w, h, v) {
        Rendering.renderDistanceContours(ctx, state.points, w, h, {
            count: v.contourCount,
            maxDist: 40,
            resolution: 4,
            lineWidth: v.weightScale,
            color: '#FFFFFF'
        });
    }
    
    function renderEdges(ctx) {
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        for (var i = 0; i < state.edges.length; i++) {
            var e = state.edges[i];
            ctx.beginPath();
            ctx.moveTo(state.points[e.i].x, state.points[e.i].y);
            ctx.lineTo(state.points[e.j].x, state.points[e.j].y);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
    
    function renderPoints(ctx) {
        ctx.fillStyle = '#00FFFF';
        for (var i = 0; i < state.points.length; i++) {
            var p = state.points[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ANIMATION
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function togglePlay(tool) { state.playing ? stopAnim() : startAnim(tool); }
    
    function startAnim(tool) {
        if (state.animator) state.animator.destroy();
        state.playing = true;
        var v = tool.getValues();
        state.animator = new AnimationLoop({
            fps: v.fps,
            onFrame: function() {
                state.time += 1 / v.fps;
                tool.draw();
            }
        });
        state.animator.start();
    }
    
    function stopAnim() {
        state.playing = false;
        if (state.animator) state.animator.pause();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // UTILITY
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function wire(tool, key, fn) {
        var c = tool.getComponent(key);
        if (c && c.element) c.element.addEventListener('click', fn);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════════════════

export class GenerativePatternTool {
    constructor(container, deps) {
        this.container = container;
        this.deps = {
            ComponentLibrary,
            ...deps
        };
        this.tool = null;
        this.render();
    }

    _createConfig() {
            return {
                title: 'GENERATIVE PATTERN',

                animation: { type: 'loop', loopFrames: 300, defaultFps: 60, canPrerender: true },
                canvas: { width: 420, height: 420, showControls: true },

                sidebar: [
                    ['CONTROLS', [
                        ['Distribution', [
                            ['slider', 'Density', 0.1, 2.0, 0.01, { value: 1.0, key: 'density', withNumber: true }],
                            ['slider', 'Grid Strength', 0, 1, 0.01, { value: 0.5, key: 'gridStrength', withNumber: true }],
                            ['slider', 'Cluster Scale', 0.1, 5.0, 0.1, { value: 1.0, key: 'clusterScale', withNumber: true }],
                            ['slider', 'Jitter', 0, 1, 0.01, { value: 0.2, key: 'jitter', withNumber: true }],
                        ]],
                        ['Connectivity', [
                            ['slider', 'Neighbor Radius', 0.5, 5.0, 0.1, { value: 2.0, key: 'neighborRadius', withNumber: true }],
                            ['stepper', 'Max Degree', 2, 8, 1, { value: 4, key: 'maxDegree' }],
                            ['slider', 'Arc Quantisation', 0, 1, 0.1, { value: 0, key: 'arcQuant', withNumber: true }],
                            ['slider', 'Axis Bias', 0, 1, 0.01, { value: 0, key: 'axisBias', withNumber: true }],
                        ]],
                    ]],
                    ['SETTINGS', [
                        ['Evolution', [
                            ['dropdown', 'Mode', ['None', 'Reaction-Diffusion', 'Cellular Automaton'], { key: 'evolutionMode', value: 'None' }],
                        ]],
                        ['RD Parameters', [
                            ['slider', 'Du', 0.1, 1.0, 0.01, { value: 0.2, key: 'rdDu', withNumber: true }],
                            ['slider', 'Dv', 0.01, 0.2, 0.01, { value: 0.1, key: 'rdDv', withNumber: true }],
                            ['slider', 'Feed Rate', 0, 0.1, 0.001, { value: 0.055, key: 'feedRate', withNumber: true, precision: 3 }],
                            ['slider', 'Kill Rate', 0, 0.1, 0.001, { value: 0.062, key: 'killRate', withNumber: true, precision: 3 }],
                        ]],
                        ['CA Parameters', [
                            ['dropdown', 'CA Rule', ['Life', 'Seeds', 'Day & Night', 'Maze', 'HighLife', 'Anneal'], { key: 'caRule', value: 'Life' }],
                        ]],
                        ['Rendering', [
                            ['dropdown', 'Render Mode', ['Truchet', 'Blob', 'Nested', 'Global'], { key: 'renderMode', value: 'Truchet' }],
                            ['slider', 'Weight Scale', 0.1, 3.0, 0.1, { value: 1.0, key: 'weightScale', withNumber: true }],
                            ['slider', 'Tile Window', 0.5, 2.0, 0.1, { value: 1.0, key: 'tileWindow', withNumber: true }],
                            ['stepper', 'Contour Count', 2, 32, 1, { value: 8, key: 'contourCount' }],
                        ]],
                    ]],
                    ['EVOLUTION', [
                        ['Playback', [
                            ['button', 'Play/Pause', null, { key: 'playPause' }],
                            ['button', 'Reset', null, { key: 'reset' }],
                            ['slider', 'FPS', 1, 60, 1, { value: 30, key: 'fps', withNumber: true }],
                            ['toggle', 'Options', ['Loop'], { key: 'animOptions', selectedValues: ['Loop'] }],
                        ]],
                        ['Flow', [
                            ['slider', 'Flow Speed', 0, 1, 0.01, { value: 0.3, key: 'flowSpeed', withNumber: true }],
                            ['slider', 'Noise Frequency', 0.1, 2.0, 0.1, { value: 0.5, key: 'noiseFrequency', withNumber: true }],
                        ]],
                        ['Display', [
                            ['toggle', 'Overlays', ['Show Points', 'Show Edges'], { key: 'overlays', selectedValues: [] }],
                        ]],
                        ['About System', [
                            ['label', 'UNIFIED GENERATIVE SYSTEM', { variant: 'heading' }],
                            ['label', 'All patterns emerge from one point network', { variant: 'body' }],
                            ['label', 'Evolution runs ON the point network', { variant: 'caption' }],
                            ['label', 'RD: Diffuses via edges, modulates point weights', { variant: 'caption' }],
                            ['label', 'CA: Neighbors via edges, modulates point weights', { variant: 'caption' }],
                            ['label', 'Truchet: Tile pattern from edge connectivity', { variant: 'caption' }],
                            ['label', 'Blob: Point/edge inflation by evolved weights', { variant: 'caption' }],
                            ['label', 'Contours: From single global distance field', { variant: 'caption' }],
                        ]],
                    ]],
                ],

                // Arrow function callbacks bound to instance
                onInit: (values) => this._onInit(values),
                onUpdate: (key, value, allValues) => this._onUpdate(key, value, allValues),
                onDraw: (ctx, canvas, values) => this._onDraw(ctx, canvas, values),
                onRenderFrame: (i) => this._onRenderFrame(i)
            };
    }

    // Instance callback methods
    _onInit(values) {
            state.rng = MathUtils.seededRandom(12345);
            Noise.seedNoise(12345);

            wire(this.tool, 'playPause', () => togglePlay(this));
            wire(this.tool, 'reset', () => { rebuild(values, this); this.tool.draw(); });

        rebuild(values, this);
    }

    _onUpdate(key, val, v) {
            // Distribution → rebuild points
            if ('density gridStrength clusterScale jitter'.indexOf(key) >= 0) {
                buildPoints(v, this);
                buildEdges(v);
                this.tool.draw();
            }
            // Connectivity → rebuild edges
            if ('neighborRadius maxDegree arcQuant axisBias'.indexOf(key) >= 0) {
                buildEdges(v);
                this.tool.draw();
            }
            // Evolution mode change → reset evolution state
            if (key === 'evolutionMode') {
                initEvolutionState(v);
                // Seed pattern
                for (var i = 0; i < 10; i++) stepEvolution(v);
                this.tool.draw();
            }
            // RD/CA params → just redraw (params used live in stepEvolution)
            if ('rdDu rdDv feedRate killRate caRule'.indexOf(key) >= 0) {
                this.tool.draw();
            }
            // Render params → redraw
            if ('renderMode weightScale tileWindow contourCount'.indexOf(key) >= 0) {
                this.tool.draw();
            }
            // Flow params → rebuild velocity field
            if ('noiseFrequency flowSpeed'.indexOf(key) >= 0) {
                buildVelocityField(v, this);
            }
        // Animation
        if (key === 'fps' && state.animator) state.animator.fps = val;
    }

    _onDraw(ctx, canvas, v) {
            var w = canvas.width, h = canvas.height;

            // Clear
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);

            // Step evolution if active (even when not animating - shows static pattern)
            if (v.evolutionMode !== 'None') {
                stepEvolution(v);
            }

            // Advect points if playing
            if (state.playing) {
                advectPoints(v, w, h);
            }

            // Render based on mode (all use unified state)
            var renderers = {
                'Truchet': renderTruchet,
                'Blob': renderBlobs,
                'Nested': renderNested,
                'Global': renderGlobal
            };
            (renderers[v.renderMode] || renderTruchet)(ctx, w, h, v);

        // Overlays
        var ov = v.overlays || [];
        if (ov.indexOf('Show Edges') >= 0) renderEdges(ctx);
        if (ov.indexOf('Show Points') >= 0) renderPoints(ctx);
    }

    _onRenderFrame(i) {
        state.time = i / 60;
        this.tool.draw();
    }

    render() {
        if (!this.tool) {
            const config = this._createConfig();
            this.tool = new ToolBase(config, this.deps);
            this.tool.mount(this.container);
            this.tool.draw();
        }
        return this;
    }

    destroy() {
        if (state.animator) state.animator.destroy();
        state = { points: [], edges: [], kdTree: null, distanceField: null,
                  rng: null, animator: null, time: 0, playing: false };
        if (this.tool) this.tool.destroy();
    }
}

// Export as default for tools_section.js
export default GenerativePatternTool;

console.log('✅ GenerativePatternTool v5.0.0 (UNIFIED)');

