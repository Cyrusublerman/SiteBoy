/**
 * Lissajous Tool - Complete ToolBase Implementation
 * Parametric harmonic curves with independent X/Y parameters
 * 
 * @version 3.7.0 - Reset and presets properly reset delta mode
 */

// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { AnimationLoop } from '../../core/animation-foundation.js';

// ═══════════════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════════════
    
    var PI = Math.PI;
    var TWO_PI = PI * 2;
    
    // ═══════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════
    
    var animator = null;
    var frameCount = 0;
    var isPlaying = false;
    var toolRef = null;
    var showEquation = true;
    var equationFontSize = 24; // 2x default (12px)
    var deltaMode = false; // When true, Y params are deltas from X
    
    // Parameter state - X and Y can be INDEPENDENT or DELTA mode
    var params = {
        // X Term 1
        Ax1: 1, wx1: 1, px1: 1, phi_x1: 0,
        // X Term 2
        Ax2: 0, wx2: 1, px2: 1, phi_x2: 0,
        // X Modulation
        Mx: 0, wxm1: 0, pxm1: 1, phi_xm1: 0, wxm2: 0, pxm2: 1, phi_xm2: 0,
        // Y Term 1 (independent)
        Ay1: 1, wy1: 1, py1: 1, phi_y1: 0,
        // Y Term 2 (independent)
        Ay2: 0, wy2: 1, py2: 1, phi_y2: 0,
        // Y Modulation
        My: 0, wym1: 0, pym1: 1, phi_ym1: 0, wym2: 0, pym2: 1, phi_ym2: 0,
        // Global
        scale: 120, rotation: 0, points: 20000
    };
    
    // Default params for reset
    var DEFAULT_PARAMS = JSON.parse(JSON.stringify(params));
    
    // Phase animation state (independent X and Y)
    var phaseAnim = {
        phi_x1: { enabled: false, loopFrames: 60, base: 0, inverse: false },
        phi_x2: { enabled: false, loopFrames: 60, base: 0, inverse: false },
        phi_y1: { enabled: false, loopFrames: 60, base: 0, inverse: false },
        phi_y2: { enabled: false, loopFrames: 60, base: 0, inverse: false }
    };
    
    // History for undo (max 50)
    var historyStack = [];
    var MAX_HISTORY = 50;
    
    // Sequencer state - using ComponentLibrary.Sequencer
    var sequencerComponent = null;
    var currentToolInstance = null;
    var sequenceState = {
        playing: false,
        loop: true,
        currentIndex: 0,
        frameInSegment: 0,
        inTransition: false,
        fromParams: null,
        toParams: null,
        data: null  // Will hold sequencer data during playback
    };
    
    // ═══════════════════════════════════════════════════════════════════
    // COMPLETE LANDMARKS FROM SOURCE (all parameters specified)
    // ═══════════════════════════════════════════════════════════════════
    
    var LANDMARKS = [
        { name: "Complex Interference: 300hz", Ax1: 1.7, wx1: 2, px1: 1, Ay1: 1.2, wy1: 2, py1: 1, Mx: -1, wxm1: 75, pxm1: 1, wxm2: 75, pxm2: 1, My: -1, wym1: 2, pym1: 1, wym2: 300, pym2: 1 },
        { name: "Asymmetric Flow: 3:5", Ax1: 1, wx1: 3, px1: 1, Ax2: -1, wx2: 5, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 5, py2: 1 },
        { name: "Interference Pattern: 260hz", Ax1: 1.7, wx1: 1, px1: 1, Ay1: 1.2, wy1: 1, py1: 1, Mx: -1, wxm1: 260, pxm1: 1, wxm2: 1, pxm2: 1, My: -1, wym1: 260, pym1: 1, wym2: 2, pym2: 1 },
        { name: "Interference Pattern: 200hz", Ax1: 1.7, wx1: 1, px1: 1, Ay1: 1.2, wy1: 1, py1: 1, Mx: -1, wxm1: 2, pxm1: 1, wxm2: 200, pxm2: 1, My: -1, wym1: 2, pym1: 1, wym2: 200, pym2: 1 },
        { name: "Woven Bloom: 120hz", Ax1: 2, wx1: 1, px1: 1, Ay1: 1, wy1: 1, py1: 1, Mx: -1, wxm1: 1, pxm1: 1, wxm2: 120, pxm2: 1, My: -1, wym1: 2, pym1: 1, wym2: 120, pym2: 1 },
        { name: "Modulated Ring: 60hz", Ax1: 1, wx1: 60, px1: 1, Ay1: 1, wy1: 60, py1: 1, Mx: -1, wxm1: 60, pxm1: 1, wxm2: 1, pxm2: 1, Ay2: -1, wy2: 1, py2: 1 },
        { name: "Fine Web: 80hz", Ax1: 0.1, wx1: 1, px1: 1, Ay1: 1, wy1: 1, py1: 1, Mx: -1, wxm1: 1, pxm1: 1, wxm2: 80, pxm2: 1, Ay2: -1, wy2: 80, py2: 1 },
        { name: "Quintic Static: 500hz", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 500, px2: 5, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 500, py2: 3 },
        { name: "Quintic Filament: 250hz", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 250, px2: 5, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 250, py2: 3 },
        { name: "Spiroform: 3:5", Ax1: 1, wx1: 3, px1: 1, Ax2: -1, wx2: 5, px2: 1, Ay1: 1, wy1: 3, py1: 1, Ay2: -1, wy2: 5, py2: 1 },
        { name: "Involute Rosette: 1:3", Ax1: 1, wx1: 1, px1: 1, Ax2: 1, wx2: 3, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 3, py2: 1 },
        { name: "Involute Rosette: 1:5", Ax1: 1, wx1: 1, px1: 1, Ax2: 1, wx2: 5, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 5, py2: 1 },
        { name: "Cubic Spiro: 1:7", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 7, px2: 3, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 7, py2: 3 },
        { name: "Asymmetric Flow: 1:5:7", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 5, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 7, py2: 1 },
        { name: "Asymmetric Flow: 3:5:6", Ax1: 1, wx1: 3, px1: 1, Ax2: -1, wx2: 5, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 6, py2: 1 },
        { name: "Cubic Star: 1:2", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 2, px2: 3, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 2, py2: 3 },
        { name: "Rosette: 1:5", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 5, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 5, py2: 1 },
        { name: "Rosette: 1:3", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 3, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 3, py2: 1 },
        { name: "Offset Loop: 1:2:3", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 2, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 3, py2: 1 },
        { name: "Dense Rosette: 1:10", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 10, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 10, py2: 1 },
        { name: "Cubic Weave: 100hz", Ax1: 1, wx1: 1, px1: 3, Ax2: -1, wx2: 100, px2: 3, Ay1: 1, wy1: 1, py1: 3, Ay2: -1, wy2: 100, py2: 3 },
        { name: "Warped Field: 100hz", Ax1: 1, wx1: 1, px1: 1, Ay1: 1, wy1: 1, py1: 1, Mx: -1, wxm1: 100, pxm1: 1, wxm2: 2, pxm2: 1, Ay2: -1, wy2: 100, py2: 1 },
        { name: "Asymmetric Weave: 200hz", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 100, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 200, py2: 1 },
        { name: "Woven Web: 80hz", Ax1: 1, wx1: 1, px1: 1, Ay1: 1, wy1: 1, py1: 1, Mx: -1, wxm1: 1, pxm1: 1, wxm2: 80, pxm2: 1, Ay2: -1, wy2: 80, py2: 1 },
        { name: "Cubic Static: 550hz", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 550, px2: 3, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 550, py2: 3 },
        { name: "Cubic Filament: 180hz", Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 180, px2: 3, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 180, py2: 3 },
        { name: "Woven Bloom: 120hz (alt)", Ax1: 2, wx1: 1, px1: 1, Ay1: 1, wy1: 1, py1: 1, Mx: -1, wxm1: 1, pxm1: 1, wxm2: 120, pxm2: 1, My: -1, wym1: 2, pym1: 1, wym2: 120, pym2: 1 }
    ];
    
    var LANDMARK_NAMES = ['— Select Preset —'].concat(LANDMARKS.map(function(p) { return p.name; }));
    
    // ═══════════════════════════════════════════════════════════════════
    // MATH UTILITIES
    // ═══════════════════════════════════════════════════════════════════
    
    function safePow(base, exp) {
        if (Math.abs(base) < 1e-9 && exp < 0) return 0;
        return Math.sign(base) * Math.pow(Math.abs(base), exp);
    }
    
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    function wrap(v, min, max) {
        var range = max - min;
        return ((((v - min) % range) + range) % range) + min;
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // HISTORY
    // ═══════════════════════════════════════════════════════════════════
    
    function pushHistory() {
        // Store both params and deltaMode state
        historyStack.push({
            params: JSON.parse(JSON.stringify(params)),
            deltaMode: deltaMode
        });
        if (historyStack.length > MAX_HISTORY) {
            historyStack.shift();
        }
    }
    
    function popHistory(tool) {
        if (historyStack.length === 0) return;
        var prev = historyStack.pop();
        // Restore params
        Object.assign(params, prev.params);
        // Restore delta mode
        deltaMode = prev.deltaMode;
        tool.setValue('deltaMode', deltaMode ? ['On'] : []);
        syncUIFromParams(tool);
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // DELTA MODE - Resolve Y parameters
    // ═══════════════════════════════════════════════════════════════════
    
    // Convert Y slider values when switching between modes
    function convertYValuesForModeChange(tool, toDeltas) {
        var p = params;
        var yParams = [
            { y: 'Ay1', x: 'Ax1' },
            { y: 'wy1', x: 'wx1' },
            { y: 'py1', x: 'px1' },
            { y: 'phi_y1', x: 'phi_x1' },
            { y: 'Ay2', x: 'Ax2' },
            { y: 'wy2', x: 'wx2' },
            { y: 'py2', x: 'px2' },
            { y: 'phi_y2', x: 'phi_x2' },
            { y: 'wym1', x: 'wxm1' },
            { y: 'phi_ym1', x: 'phi_xm1' },
            { y: 'wym2', x: 'wxm2' },
            { y: 'phi_ym2', x: 'phi_xm2' }
        ];
        
        yParams.forEach(function(pair) {
            var currentY = p[pair.y] || 0;
            var xVal = p[pair.x] || 0;
            var newY;
            
            if (toDeltas) {
                // Converting TO delta mode: delta = absolute - X
                newY = currentY - xVal;
            } else {
                // Converting FROM delta mode: absolute = X + delta
                newY = xVal + currentY;
            }
            
            // Update internal params
            params[pair.y] = newY;
            
            // Update UI slider
            if (tool && tool.setValue) {
                tool.setValue(pair.y, newY);
            }
        });
        
        // Force redraw
        if (tool && tool.draw) {
            tool.draw();
        }
    }
    
    function getResolvedParams() {
        var p = params;
        if (!deltaMode) {
            // Independent mode - Y values are absolute
            return p;
        }
        // Delta mode - Y values are offsets from X
        return {
            // X parameters unchanged
            Ax1: p.Ax1, wx1: p.wx1, px1: p.px1, phi_x1: p.phi_x1,
            Ax2: p.Ax2, wx2: p.wx2, px2: p.px2, phi_x2: p.phi_x2,
            Mx: p.Mx, wxm1: p.wxm1, pxm1: p.pxm1, phi_xm1: p.phi_xm1,
            wxm2: p.wxm2, pxm2: p.pxm2, phi_xm2: p.phi_xm2,
            // Y Term 1 = X Term 1 + delta
            Ay1: p.Ax1 + p.Ay1,
            wy1: p.wx1 + p.wy1,
            py1: p.px1 + p.py1,
            phi_y1: p.phi_x1 + p.phi_y1,
            // Y Term 2 = X Term 2 + delta
            Ay2: p.Ax2 + p.Ay2,
            wy2: p.wx2 + p.wy2,
            py2: p.px2 + p.py2,
            phi_y2: p.phi_x2 + p.phi_y2,
            // Y Modulation = X Modulation + delta (except powers which stay absolute)
            My: p.My,
            wym1: p.wxm1 + p.wym1,
            pym1: p.pym1,
            phi_ym1: p.phi_xm1 + p.phi_ym1,
            wym2: p.wxm2 + p.wym2,
            pym2: p.pym2,
            phi_ym2: p.phi_xm2 + p.phi_ym2,
            // Global
            scale: p.scale, rotation: p.rotation, points: p.points
        };
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // EQUATION EVALUATION
    // ═══════════════════════════════════════════════════════════════════
    
    function evaluate(t) {
        var p = getResolvedParams();
        
        var x = p.Ax1 * safePow(Math.cos(p.wx1 * t + p.phi_x1), p.px1) +
                p.Ax2 * safePow(Math.cos(p.wx2 * t + p.phi_x2), p.px2) +
                p.Mx * safePow(Math.cos(p.wxm1 * t + p.phi_xm1), p.pxm1) * 
                       safePow(Math.sin(p.wxm2 * t + p.phi_xm2), p.pxm2);
        
        var y = p.Ay1 * safePow(Math.sin(p.wy1 * t + p.phi_y1), p.py1) +
                p.Ay2 * safePow(Math.sin(p.wy2 * t + p.phi_y2), p.py2) +
                p.My * safePow(Math.sin(p.wym1 * t + p.phi_ym1), p.pym1) * 
                       safePow(Math.cos(p.wym2 * t + p.phi_ym2), p.pym2);
        
        // Apply rotation
        if (p.rotation && p.rotation !== 0) {
            var rot = p.rotation * PI / 180;
            var cos_r = Math.cos(rot);
            var sin_r = Math.sin(rot);
            return {
                x: x * cos_r - y * sin_r,
                y: x * sin_r + y * cos_r
            };
        }
        
        return { x: x, y: y };
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // EQUATION DISPLAY STRING
    // ═══════════════════════════════════════════════════════════════════
    
    function formatEquation() {
        var p = getResolvedParams();
        
        var fmt = function(n) {
            if (Math.abs(n - Math.round(n)) < 0.01) return String(Math.round(n));
            return n.toFixed(2);
        };
        
        var fmtPhase = function(phi) {
            // Format phase as multiple of π if close
            var piRatio = phi / Math.PI;
            if (Math.abs(piRatio) < 0.01) return '';
            if (Math.abs(piRatio - 1) < 0.01) return '+π';
            if (Math.abs(piRatio + 1) < 0.01) return '-π';
            if (Math.abs(piRatio - 0.5) < 0.01) return '+π/2';
            if (Math.abs(piRatio + 0.5) < 0.01) return '-π/2';
            // Otherwise show numeric value
            var sign = phi >= 0 ? '+' : '';
            return sign + fmt(phi);
        };
        
        var term = function(A, w, power, phi, fn) {
            if (Math.abs(A) < 0.01) return '';
            var s = '';
            // Amplitude
            if (Math.abs(A - 1) > 0.01 && Math.abs(A + 1) > 0.01) s += fmt(A);
            else if (Math.abs(A + 1) < 0.01) s += '-';
            // Function name
            s += fn;
            // Power
            if (Math.abs(power - 1) > 0.01) s += '^' + fmt(power);
            // Argument with phase
            s += '(' + fmt(w) + 't' + fmtPhase(phi) + ')';
            return s;
        };
        
        // Format modulation term: M * fn1^p1(w1*t+φ1) * fn2^p2(w2*t+φ2)
        var modTerm = function(M, w1, p1, phi1, fn1, w2, p2, phi2, fn2) {
            if (Math.abs(M) < 0.01) return '';
            var s = '';
            // Amplitude
            if (Math.abs(M - 1) > 0.01 && Math.abs(M + 1) > 0.01) s += fmt(M);
            else if (Math.abs(M + 1) < 0.01) s += '-';
            // First function
            s += fn1;
            if (Math.abs(p1 - 1) > 0.01) s += '^' + fmt(p1);
            s += '(' + fmt(w1) + 't' + fmtPhase(phi1) + ')';
            // Multiply sign
            s += '·';
            // Second function
            s += fn2;
            if (Math.abs(p2 - 1) > 0.01) s += '^' + fmt(p2);
            s += '(' + fmt(w2) + 't' + fmtPhase(phi2) + ')';
            return s;
        };
        
        // X equation - include phase values and modulation
        var xParts = [];
        var x1 = term(p.Ax1, p.wx1, p.px1, p.phi_x1, 'cos');
        var x2 = term(p.Ax2, p.wx2, p.px2, p.phi_x2, 'cos');
        var xMod = modTerm(p.Mx, p.wxm1, p.pxm1, p.phi_xm1, 'cos', p.wxm2, p.pxm2, p.phi_xm2, 'sin');
        if (x1) xParts.push(x1);
        if (x2) xParts.push((p.Ax2 > 0 && xParts.length > 0 ? '+' : '') + x2);
        if (xMod) xParts.push((p.Mx > 0 && xParts.length > 0 ? '+' : '') + xMod);
        var xEq = xParts.join('') || '0';
        
        // Y equation - include phase values and modulation
        var yParts = [];
        var y1 = term(p.Ay1, p.wy1, p.py1, p.phi_y1, 'sin');
        var y2 = term(p.Ay2, p.wy2, p.py2, p.phi_y2, 'sin');
        var yMod = modTerm(p.My, p.wym1, p.pym1, p.phi_ym1, 'sin', p.wym2, p.pym2, p.phi_ym2, 'cos');
        if (y1) yParts.push(y1);
        if (y2) yParts.push((p.Ay2 > 0 && yParts.length > 0 ? '+' : '') + y2);
        if (yMod) yParts.push((p.My > 0 && yParts.length > 0 ? '+' : '') + yMod);
        var yEq = yParts.join('') || '0';
        
        return 'x=' + xEq + '  y=' + yEq;
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // SEQUENCER (using ComponentLibrary.Sequencer)
    // ═══════════════════════════════════════════════════════════════════
    
    function createSequencer(toolInstance) {
        currentToolInstance = toolInstance;
        
        // Find the SEQUENCE sub-tab content area
        var seqBtn = toolInstance.getComponent('playSequence');
        if (!seqBtn || !seqBtn.element) {
            setTimeout(function() { createSequencer(toolInstance); }, 100);
            return;
        }
        
        // Find parent block
        var parent = seqBtn.element.parentElement;
        while (parent && !parent.classList.contains('sidebar-block-content')) {
            parent = parent.parentElement;
        }
        if (!parent) parent = seqBtn.element.parentElement;
        
        // Clear the manual buttons - Sequencer has its own
        parent.innerHTML = '';
        
        if (window.ComponentLibrary && window.ComponentLibrary.Sequencer) {
            sequencerComponent = new window.ComponentLibrary.Sequencer({
                defaultHoldFrames: 60,
                defaultTransitionFrames: 60,
                loop: true,
                onSave: function() {
                    // Return current params for checkpoint
                    return JSON.parse(JSON.stringify(params));
                },
                onLoad: function(index, cpParams) {
                    pushHistory();
                    Object.assign(params, cpParams);
                    syncUIFromParams(toolInstance);
                    toolInstance.draw();
                },
                onPlay: function(data) {
                    sequenceState.data = data;
                    sequenceState.playing = true;
                    sequenceState.currentIndex = 0;
                    sequenceState.frameInSegment = 0;
                    sequenceState.inTransition = false;
                    sequenceState.loop = data.loop;
                    if (data.checkpoints.length > 0) {
                        Object.assign(params, data.checkpoints[0].params);
                    }
                    if (!isPlaying) {
                        isPlaying = true;
                        startAnimator(toolInstance);
                    }
                },
                onStop: function() {
                    sequenceState.playing = false;
                    sequencerComponent.setPlaying(false);
                },
                onTotalFramesChange: function(totalFrames) {
                    // Update export frames default
                    toolInstance.setValue('exportFrames', totalFrames);
                }
            });
            parent.appendChild(sequencerComponent.render());
            console.log('✅ Lissajous Sequencer created');
        } else {
            console.error('❌ ComponentLibrary.Sequencer not available');
        }
    }
    
    function lerpParams(from, to, t, mode, type) {
        var result = {};
        
        if (type === 'step') {
            // Step mode: use 'from' until t >= 1, then jump to 'to'
            return t >= 1 ? JSON.parse(JSON.stringify(to)) : JSON.parse(JSON.stringify(from));
        }
        
        // Blend mode: linear interpolation
        for (var key in from) {
            if (typeof from[key] === 'number' && typeof to[key] === 'number') {
                result[key] = lerp(from[key], to[key], t);
            } else {
                result[key] = to[key];
            }
        }
        return result;
    }
    
    function updateSequence() {
        if (!sequenceState.playing || !sequenceState.data) return;
        
        var data = sequenceState.data;
        var checkpoints = data.checkpoints;
        var transitions = data.transitions;
        
        if (checkpoints.length < 2) return;
        
        sequenceState.frameInSegment++;
        var cp = checkpoints[sequenceState.currentIndex];
        var tr = transitions[sequenceState.currentIndex] || { frames: 60, mode: 'all', type: 'blend' };
        
        if (!sequenceState.inTransition) {
            // In hold phase
            if (sequenceState.frameInSegment >= (cp.holdFrames || 60)) {
                // Start transition
                sequenceState.inTransition = true;
                sequenceState.frameInSegment = 0;
                sequenceState.fromParams = cp.params;
                var nextIdx = (sequenceState.currentIndex + 1) % checkpoints.length;
                sequenceState.toParams = checkpoints[nextIdx].params;
                sequenceState.transitionMode = tr.mode;
                sequenceState.transitionType = tr.type;
                sequenceState.transitionFrames = tr.frames || 60;
            }
        } else {
            // In transition phase
            var t = sequenceState.frameInSegment / sequenceState.transitionFrames;
            if (t >= 1) {
                // Transition complete
                sequenceState.currentIndex = (sequenceState.currentIndex + 1) % checkpoints.length;
                sequenceState.inTransition = false;
                sequenceState.frameInSegment = 0;
                Object.assign(params, checkpoints[sequenceState.currentIndex].params);
                
                // Check if sequence complete (non-looping)
                if (sequenceState.currentIndex === 0 && !sequenceState.loop) {
                    sequenceState.playing = false;
                    if (sequencerComponent) sequencerComponent.setPlaying(false);
                }
            } else {
                // Interpolate
                var interpolated = lerpParams(
                    sequenceState.fromParams, 
                    sequenceState.toParams, 
                    t,
                    sequenceState.transitionMode,
                    sequenceState.transitionType
                );
                Object.assign(params, interpolated);
            }
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // UI SYNC
    // ═══════════════════════════════════════════════════════════════════
    
    function syncUIFromParams(tool) {
        Object.keys(params).forEach(function(key) {
            tool.setValue(key, params[key]);
        });
    }
    
    function updateAnalysisDisplay(tool) {
        var historyComp = tool.getComponent('historyCount');
        if (historyComp && historyComp.element) {
            historyComp.element.textContent = historyStack.length + '/' + MAX_HISTORY;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // PRESET LOADING (applies ALL values from landmark)
    // ═══════════════════════════════════════════════════════════════════
    
    function loadLandmark(landmark) {
        // Reset to defaults first
        Object.assign(params, JSON.parse(JSON.stringify(DEFAULT_PARAMS)));
        
        // Apply ALL values from landmark
        Object.keys(landmark).forEach(function(key) {
            if (key !== 'name' && params.hasOwnProperty(key)) {
                params[key] = landmark[key];
            }
        });
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // ANIMATION
    // ═══════════════════════════════════════════════════════════════════
    
    function startAnimator(tool) {
        if (animator) return;
        toolRef = tool;
        
        if (AnimationLoop) {
            animator = new AnimationLoop({
                fps: 60,
                onFrame: function() {
                    if (!isPlaying) return;
                    frameCount++;
                    if (sequenceState.playing) updateSequence();
                    updatePhaseAnimations(tool);
                    tool.draw();
                }
            });
            animator.start();
        } else {
            console.error('AnimationFoundation not available - animation disabled');
            // Fallback: draw once immediately so canvas isn't blank
            tool.draw();
        }
    }
    
    function stopAnimator() {
        if (animator) {
            animator.destroy();
            animator = null;
        }
        isPlaying = false;
        sequenceState.playing = false;
    }
    
    function updatePhaseAnimations(tool) {
        var speed = tool.getValue('globalSpeed') || 1;
        
        if (phaseAnim.phi_x1.enabled) {
            var dir = phaseAnim.phi_x1.inverse ? -1 : 1;
            params.phi_x1 = wrap(phaseAnim.phi_x1.base + frameCount * dir * TWO_PI / phaseAnim.phi_x1.loopFrames * speed, -PI, PI);
        }
        if (phaseAnim.phi_x2.enabled) {
            var dir2 = phaseAnim.phi_x2.inverse ? -1 : 1;
            params.phi_x2 = wrap(phaseAnim.phi_x2.base + frameCount * dir2 * TWO_PI / phaseAnim.phi_x2.loopFrames * speed, -PI, PI);
        }
        if (phaseAnim.phi_y1.enabled) {
            var dir3 = phaseAnim.phi_y1.inverse ? -1 : 1;
            params.phi_y1 = wrap(phaseAnim.phi_y1.base + frameCount * dir3 * TWO_PI / phaseAnim.phi_y1.loopFrames * speed, -PI, PI);
        }
        if (phaseAnim.phi_y2.enabled) {
            var dir4 = phaseAnim.phi_y2.inverse ? -1 : 1;
            params.phi_y2 = wrap(phaseAnim.phi_y2.base + frameCount * dir4 * TWO_PI / phaseAnim.phi_y2.loopFrames * speed, -PI, PI);
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // TOOL CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════
    
    export const TOOL_CONFIG = {
        title: 'LISSAJOUS',
        
        canvas: {
            width: 800,
            height: 800,
            showControls: true,
            interactiveRotation: true,  // Enable click-drag on canvas
            // Extra blocks inserted BEFORE Export Image in CANVAS tab
            extraBlocksPosition: 'before-export',
            extraBlocks: [
                ['Equation', [
                    ['toggle', 'Show', ['On'], { key: 'showEquation', selectedValues: ['On'] }],
                    ['slider', 'Size', 12, 48, 2, { value: 24, key: 'equationSize', withNumber: true }],
                ]],
            ]
        },
        
        sidebar: [
            // Tab 1: PARAMETERS
            ['PARAMETERS', [
                ['GLOBAL', [
                    ['Presets', [
                        ['dropdown', 'Landmark', LANDMARK_NAMES, { key: 'landmark' }],
                        ['button', 'Reset All', null, { key: 'resetAll' }],
                    ]],
                    ['Transform', [
                        ['slider', 'Scale', 20, 300, 5, { value: 120, key: 'scale', withNumber: true }],
                        ['slider', 'Rotation', 0, 360, 1, { value: 0, key: 'rotation', withNumber: true }],
                        ['slider', 'Points', 1000, 80000, 1000, { value: 20000, key: 'points', withNumber: true }],
                    ]],
                ]],
                ['X-AXIS', [
                    ['Term 1', [
                        ['slider', 'Amplitude (Ax1)', -2, 2, 0.1, { value: 1, key: 'Ax1', precision: 1 }],
                        ['slider', 'Frequency (wx1)', -300, 300, 1, { value: 1, key: 'wx1', withNumber: true }],
                        ['slider', 'Power (px1)', -7, 7, 0.1, { value: 1, key: 'px1', precision: 1 }],
                        ['slider', 'Phase (φx1)', -3.14, 3.14, 0.01, { value: 0, key: 'phi_x1', precision: 2 }],
                    ]],
                    ['Term 2', [
                        ['slider', 'Amplitude (Ax2)', -2, 2, 0.1, { value: 0, key: 'Ax2', precision: 1 }],
                        ['slider', 'Frequency (wx2)', -300, 300, 1, { value: 1, key: 'wx2', withNumber: true }],
                        ['slider', 'Power (px2)', -7, 7, 0.1, { value: 1, key: 'px2', precision: 1 }],
                        ['slider', 'Phase (φx2)', -3.14, 3.14, 0.01, { value: 0, key: 'phi_x2', precision: 2 }],
                    ]],
                    ['Modulation', [
                        ['slider', 'Amplitude (Mx)', -2, 2, 0.1, { value: 0, key: 'Mx', precision: 1 }],
                        ['slider', 'Freq 1 (wxm1)', 0, 600, 1, { value: 0, key: 'wxm1', withNumber: true }],
                        ['slider', 'Power 1', -7, 7, 0.1, { value: 1, key: 'pxm1', precision: 1 }],
                        ['slider', 'Phase 1', -3.14, 3.14, 0.01, { value: 0, key: 'phi_xm1', precision: 2 }],
                        ['slider', 'Freq 2 (wxm2)', 0, 600, 1, { value: 0, key: 'wxm2', withNumber: true }],
                        ['slider', 'Power 2', -7, 7, 0.1, { value: 1, key: 'pxm2', precision: 1 }],
                        ['slider', 'Phase 2', -3.14, 3.14, 0.01, { value: 0, key: 'phi_xm2', precision: 2 }],
                    ]],
                ]],
                ['Y-AXIS', [
                    ['Mode', [
                        ['toggle', 'Delta from X', ['On'], { key: 'deltaMode' }],
                    ]],
                    ['Term 1', [
                        ['slider', 'Amplitude (Ay1)', -2, 2, 0.1, { value: 1, key: 'Ay1', precision: 1 }],
                        ['slider', 'Frequency (wy1)', -300, 300, 1, { value: 1, key: 'wy1', withNumber: true }],
                        ['slider', 'Power (py1)', -7, 7, 0.1, { value: 1, key: 'py1', precision: 1 }],
                        ['slider', 'Phase (φy1)', -3.14, 3.14, 0.01, { value: 0, key: 'phi_y1', precision: 2 }],
                    ]],
                    ['Term 2', [
                        ['slider', 'Amplitude (Ay2)', -2, 2, 0.1, { value: 0, key: 'Ay2', precision: 1 }],
                        ['slider', 'Frequency (wy2)', -300, 300, 1, { value: 1, key: 'wy2', withNumber: true }],
                        ['slider', 'Power (py2)', -7, 7, 0.1, { value: 1, key: 'py2', precision: 1 }],
                        ['slider', 'Phase (φy2)', -3.14, 3.14, 0.01, { value: 0, key: 'phi_y2', precision: 2 }],
                    ]],
                    ['Modulation', [
                        ['slider', 'Amplitude (My)', -2, 2, 0.1, { value: 0, key: 'My', precision: 1 }],
                        ['slider', 'Freq 1 (wym1)', 0, 600, 1, { value: 0, key: 'wym1', withNumber: true }],
                        ['slider', 'Power 1', -7, 7, 0.1, { value: 1, key: 'pym1', precision: 1 }],
                        ['slider', 'Phase 1', -3.14, 3.14, 0.01, { value: 0, key: 'phi_ym1', precision: 2 }],
                        ['slider', 'Freq 2 (wym2)', 0, 600, 1, { value: 0, key: 'wym2', withNumber: true }],
                        ['slider', 'Power 2', -7, 7, 0.1, { value: 1, key: 'pym2', precision: 1 }],
                        ['slider', 'Phase 2', -3.14, 3.14, 0.01, { value: 0, key: 'phi_ym2', precision: 2 }],
                    ]],
                ]],
            ]],
            // Tab 2: ANIMATION
            ['ANIMATION', [
                ['PLAYBACK', [
                    ['Controls', [
                        ['button', 'Play/Pause', null, { key: 'playPause' }],
                        ['button', 'Stop & Reset', null, { key: 'stopReset' }],
                        ['slider', 'Speed', 0.1, 5, 0.1, { value: 1, key: 'globalSpeed', precision: 1 }],
                    ]],
                    ['φx1 Animation', [
                        ['toggle', 'Enable', ['On'], { key: 'anim_phi_x1', selectedValues: [] }],
                        ['toggle', 'Inverse', ['Rev'], { key: 'inv_phi_x1', selectedValues: [] }],
                        ['slider', 'Loop Frames', 1, 3600, 1, { value: 60, key: 'loop_phi_x1', withNumber: true }],
                    ]],
                    ['φx2 Animation', [
                        ['toggle', 'Enable', ['On'], { key: 'anim_phi_x2', selectedValues: [] }],
                        ['toggle', 'Inverse', ['Rev'], { key: 'inv_phi_x2', selectedValues: [] }],
                        ['slider', 'Loop Frames', 1, 3600, 1, { value: 60, key: 'loop_phi_x2', withNumber: true }],
                    ]],
                    ['φy1 Animation', [
                        ['toggle', 'Enable', ['On'], { key: 'anim_phi_y1', selectedValues: [] }],
                        ['toggle', 'Inverse', ['Rev'], { key: 'inv_phi_y1', selectedValues: [] }],
                        ['slider', 'Loop Frames', 1, 3600, 1, { value: 60, key: 'loop_phi_y1', withNumber: true }],
                    ]],
                    ['φy2 Animation', [
                        ['toggle', 'Enable', ['On'], { key: 'anim_phi_y2', selectedValues: [] }],
                        ['toggle', 'Inverse', ['Rev'], { key: 'inv_phi_y2', selectedValues: [] }],
                        ['slider', 'Loop Frames', 1, 3600, 1, { value: 60, key: 'loop_phi_y2', withNumber: true }],
                    ]],
                    ['Trail', [
                        ['slider', 'Motion Blur', 0, 0.99, 0.01, { value: 0, key: 'motionBlur', precision: 2 }],
                    ]],
                ]],
                ['SEQUENCE', [
                    ['Sequencer', [
                        // Sequencer component will be injected here
                        ['button', 'Placeholder', null, { key: 'playSequence' }],
                    ]],
                    ['History', [
                        ['button', 'Undo', null, { key: 'undo' }],
                        ['value', '0/50', { label: 'Stack', key: 'historyCount' }],
                    ]],
                ]],
                ['EXPORT', [
                    ['Animation Export', [
                        ['slider', 'FPS', 1, 120, 1, { value: 60, key: 'exportFps', withNumber: true }],
                        ['slider', 'Frames', 1, 10000, 1, { value: 300, key: 'exportFrames', withNumber: true }],
                        ['dropdown', 'Format', ['ZIP', 'WebM', 'GIF'], { key: 'exportFormat' }],
                        ['button', 'Export Animation', null, { key: 'exportAnimation' }],
                    ]],
                    ['Image Export', [
                        ['button', 'Download PNG', null, { key: 'exportPng' }],
                        ['button', 'Copy to Clipboard', null, { key: 'copyClipboard' }],
                    ]],
                ]],
            ]],
            // Note: CANVAS tab is auto-injected by ToolBase when showControls=true
            // Add equation controls to canvas tab via injection
        ],
        
        onInit: function(values) {
            var self = this;
            
            var wireButton = function(tool, key, handler) {
                var comp = tool.getComponent(key);
                if (comp && comp.element) {
                    comp.element.addEventListener('click', function() { handler(comp.element); });
                }
            };
            
            wireButton(self, 'playPause', function(btn) {
                isPlaying = !isPlaying;
                btn.textContent = isPlaying ? 'PAUSE' : 'PLAY/PAUSE';
                if (isPlaying && !animator) startAnimator(self);
            });
            
            wireButton(self, 'stopReset', function() {
                stopAnimator();
                frameCount = 0;
                Object.keys(phaseAnim).forEach(function(key) {
                    phaseAnim[key].base = params[key.replace('phi_', 'phi_')] || 0;
                });
                self.draw();
                updateAnalysisDisplay(self);
            });
            
            wireButton(self, 'resetAll', function() {
                pushHistory();
                // Reset delta mode to OFF
                deltaMode = false;
                self.setValue('deltaMode', []);  // Uncheck the toggle
                // Reset all params to defaults
                Object.assign(params, JSON.parse(JSON.stringify(DEFAULT_PARAMS)));
                syncUIFromParams(self);
                self.draw();
            });
            
            wireButton(self, 'undo', function() {
                popHistory(self);
                self.draw();
            });
            
            // Create sequencer component
            setTimeout(function() { createSequencer(self); }, 0);
            
            updateAnalysisDisplay(self);
        },
        
        onUpdate: function(key, value, allValues) {
            var self = this;
            
            // Landmark selection
            if (key === 'landmark' && value !== '— Select Preset —') {
                var landmark = LANDMARKS.find(function(p) { return p.name === value; });
                if (landmark) {
                    pushHistory();
                    // Presets use absolute values, so turn off delta mode
                    deltaMode = false;
                    self.setValue('deltaMode', []);  // Uncheck the toggle
                    loadLandmark(landmark);
                    syncUIFromParams(self);
                    self.draw();
                }
            }
            
            // Parameter updates
            if (params.hasOwnProperty(key)) {
                pushHistory();
                params[key] = parseFloat(value) || 0;
            }
            
            // Phase animation toggles
            if (key === 'anim_phi_x1') {
                phaseAnim.phi_x1.enabled = (value || []).indexOf('On') >= 0;
                phaseAnim.phi_x1.base = params.phi_x1;
            }
            if (key === 'anim_phi_x2') {
                phaseAnim.phi_x2.enabled = (value || []).indexOf('On') >= 0;
                phaseAnim.phi_x2.base = params.phi_x2;
            }
            if (key === 'anim_phi_y1') {
                phaseAnim.phi_y1.enabled = (value || []).indexOf('On') >= 0;
                phaseAnim.phi_y1.base = params.phi_y1;
            }
            if (key === 'anim_phi_y2') {
                phaseAnim.phi_y2.enabled = (value || []).indexOf('On') >= 0;
                phaseAnim.phi_y2.base = params.phi_y2;
            }
            
            // Inverse toggles
            if (key === 'inv_phi_x1') phaseAnim.phi_x1.inverse = (value || []).indexOf('Rev') >= 0;
            if (key === 'inv_phi_x2') phaseAnim.phi_x2.inverse = (value || []).indexOf('Rev') >= 0;
            if (key === 'inv_phi_y1') phaseAnim.phi_y1.inverse = (value || []).indexOf('Rev') >= 0;
            if (key === 'inv_phi_y2') phaseAnim.phi_y2.inverse = (value || []).indexOf('Rev') >= 0;
            
            // Loop frames
            if (key === 'loop_phi_x1') phaseAnim.phi_x1.loopFrames = parseInt(value) || 60;
            if (key === 'loop_phi_x2') phaseAnim.phi_x2.loopFrames = parseInt(value) || 60;
            if (key === 'loop_phi_y1') phaseAnim.phi_y1.loopFrames = parseInt(value) || 60;
            if (key === 'loop_phi_y2') phaseAnim.phi_y2.loopFrames = parseInt(value) || 60;
            
            // Sequence loop
            if (key === 'loopSequence') sequenceState.loop = (value || []).indexOf('On') >= 0;
            
            // Delta mode toggle - convert Y values when mode changes
            if (key === 'deltaMode') {
                var newDeltaMode = (value || []).indexOf('On') >= 0;
                if (newDeltaMode !== deltaMode) {
                    convertYValuesForModeChange(self, newDeltaMode);
                    deltaMode = newDeltaMode;
                }
            }
            
            // Equation display toggle
            if (key === 'showEquation') showEquation = (value || []).indexOf('On') >= 0;
            if (key === 'equationSize') equationFontSize = parseInt(value) || 24;
            
            updateAnalysisDisplay(self);
        },
        
        onDraw: function(ctx, canvas, values) {
            var W = canvas.width;
            var H = canvas.height;
            var cx = W / 2;
            var cy = H / 2;
            
            // Motion blur or clear
            var blur = values.motionBlur || 0;
            if (blur > 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, ' + (1 - blur) + ')';
            } else {
                ctx.fillStyle = '#000000';
            }
            ctx.fillRect(0, 0, W, H);
            
            var scale = params.scale;
            var numPoints = params.points;
            
            // Draw curve
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            var started = false;
            for (var i = 0; i <= numPoints; i++) {
                var t = (i / numPoints) * TWO_PI;
                var pt = evaluate(t);
                
                if (!isFinite(pt.x) || !isFinite(pt.y)) {
                    started = false;
                    continue;
                }
                
                var screenX = cx + pt.x * scale;
                var screenY = cy - pt.y * scale;
                
                if (!started) {
                    ctx.moveTo(screenX, screenY);
                    started = true;
                } else {
                    ctx.lineTo(screenX, screenY);
                }
            }
            ctx.stroke();
            
            // Draw equation at BOTTOM with 2x font size
            if (showEquation) {
                ctx.fillStyle = '#c0c0c0';
                ctx.font = equationFontSize + 'px "Atkinson Hyperlegible", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(formatEquation(), cx, H - 10);
            }
            
            // Frame counter (top right)
            if (isPlaying || sequenceState.playing) {
                ctx.fillStyle = '#808080';
                ctx.font = '12px "Atkinson Hyperlegible", monospace';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'top';
                ctx.fillText('Frame: ' + frameCount, W - 10, 10);
            }
        }
    };
    
    // ═══════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════
    
    function LissajousTool(container, deps) {
        this.container = container;
        this.deps = {
            ComponentLibrary,
            ...(deps || {})
        };
        this.tool = null;
        this.render();
    }
    
    LissajousTool.prototype.render = function() {
        var self = this;
        try {
            this.tool = new ToolBase(TOOL_CONFIG, this.deps);
            this.tool.mount(this.container);
            this.tool.draw();
            
            console.log('✅ LissajousTool v3.7 rendered');
        } catch (error) {
            console.error('❌ LissajousTool error:', error);
            this.container.innerHTML = '<div style="padding:20px;color:var(--c-text)"><h2>ERROR</h2><p style="color:red">' + error.message + '</p></div>';
        }
    };
    
    LissajousTool.prototype.destroy = function() {
        stopAnimator();
        if (sequencerComponent) {
            sequencerComponent.destroy();
            sequencerComponent = null;
        }
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        toolRef = null;
        currentToolInstance = null;
        frameCount = 0;
        isPlaying = false;
        historyStack = [];
        sequenceState.playing = false;
        sequenceState.data = null;
    };
    
    // ES Module export
    export { LissajousTool };
    export default LissajousTool;
    
    // Global compatibility
    if (typeof window !== 'undefined') {
        window.LissajousTool = LissajousTool;
    }
    
    console.log('✅ LissajousTool v3.7 loaded (reset/presets reset delta mode)');
