/**
 * WaveInterferenceTool - Spatial Wave Equation Visualizer
 * @version 2.0.0
 * 
 * Full-featured rebuild with:
 * - All 57 equation parameters (R/X/Y terms + modulation)
 * - WebGL GPU rendering with CPU fallback
 * - Checkpoint system (save/load/drag-reorder)
 * - Sequence animation between checkpoints
 * - Per-parameter phase animation controls
 * 
 * Reference: reference/QuickToolRebuildReference/Generative Art/wave-interferance-2/
 */
// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { AnimationLoop } from '../../core/animation-foundation.js';
import { ExportUtils } from '../../shared/algorithms/index.js';

// ═══════════════════════════════════════════════════════════════════
    // MODULE STATE
    // ═══════════════════════════════════════════════════════════════════
    
    var animator = null;
    var frame = 0;
    var webglRenderer = null;
    
    // SequencerV2 instance
    var sequencerV2Wave = null;

    var animationState = {
        playing: false,
        mode: 'none', // 'none', 'phase'
        startTime: 0,
        phaseAnimations: {
            phi_r1: { enabled: false, speed: 1, direction: 1 },
            phi_r2: { enabled: false, speed: 1, direction: 1 },
            phi_x1: { enabled: false, speed: 1, direction: 1 },
            phi_x2: { enabled: false, speed: 1, direction: 1 },
            phi_y1: { enabled: false, speed: 1, direction: 1 },
            phi_y2: { enabled: false, speed: 1, direction: 1 }
        },
        phaseBaseValues: {}
    };

    // ═══════════════════════════════════════════════════════════════════
    // PRESETS (Landmarks)
    // ═══════════════════════════════════════════════════════════════════

    var LANDMARKS = {
        '20 Rings (Default)': { Ar1: 1, fr1: 20, pr1: 1 },
        '1 Ring': { Ar1: 1, fr1: 1, pr1: 1 },
        '3 Rings': { Ar1: 1, fr1: 3, pr1: 1 },
        '5 Rings': { Ar1: 1, fr1: 5, pr1: 1 },
        '10 Rings': { Ar1: 1, fr1: 10, pr1: 1 },
        'Inverted 5 Rings': { Ar1: -1, fr1: 5, pr1: 1 },
        'Offset Rings': { Ar1: 1, fr1: 5, pr1: 1, Or1: 0.3 },
        'Horizontal Lines': { Ay1: 1, fy1: 5, py1: 1 },
        'Vertical Lines': { Ax1: 1, fx1: 5, px1: 1 },
        'Grid 5×5': { Ax1: 1, fx1: 5, px1: 1, Ay1: 1, fy1: 5, py1: 1 },
        'Moiré Cross': { Ax1: 1, fx1: 5, px1: 1, Ay1: 1, fy1: 5.5, py1: 1 },
        'Rings + Grid': { Ar1: 1, fr1: 5, pr1: 1, Ax1: 0.3, fx1: 8, px1: 1, Ay1: 0.3, fy1: 8, py1: 1 },
        'Complex Interference': { Ar1: 1, fr1: 3, pr1: 1, Ar2: 0.5, fr2: 7, pr2: 1, Ax1: 0.3, fx1: 10, px1: 1 }
    };

    // ═══════════════════════════════════════════════════════════════════
    // DEFAULT PARAMETER VALUES
    // ═══════════════════════════════════════════════════════════════════

    function getDefaultParams() {
        return {
            // R Term 1
            Ar1: 1, fr1: 20, pr1: 1, phi_r1: 0, Or1: 0, wave_r1: 'sin',
            // R Term 2
            Ar2: 0, fr2: 0, pr2: 1, phi_r2: 0, Or2: 0, wave_r2: 'sin',
            // R Modulation
            Mr: 0, frm1: 0, prm1: 1, phi_rm1: 0, frm2: 0, prm2: 1, phi_rm2: 0,
            
            // X Term 1
            Ax1: 0, fx1: 0, px1: 1, phi_x1: 0, Ox1: 0, wave_x1: 'sin',
            // X Term 2
            Ax2: 0, fx2: 0, px2: 1, phi_x2: 0, Ox2: 0, wave_x2: 'sin',
            // X Modulation
            Mx: 0, fxm1: 0, pxm1: 1, phi_xm1: 0, fxm2: 0, pxm2: 1, phi_xm2: 0,
            
            // Y Term 1
            Ay1: 0, fy1: 0, py1: 1, phi_y1: 0, Oy1: 0, wave_y1: 'sin',
            // Y Term 2
            Ay2: 0, fy2: 0, py2: 1, phi_y2: 0, Oy2: 0, wave_y2: 'sin',
            // Y Modulation
            My: 0, fym1: 0, pym1: 1, phi_ym1: 0, fym2: 0, pym2: 1, phi_ym2: 0,
            
            // Global
            scale: 300,
            rotation: 0,
            blendMode: 'sum'
        };
    }

    // ═══════════════════════════════════════════════════════════════════
    // SLIDER RANGE DEFINITIONS
    // ═══════════════════════════════════════════════════════════════════

    var RANGES = {
        amp: { min: -2, max: 2, step: 0.1 },
        freq: { min: 0, max: 50, step: 0.5 },
        power: { min: -7, max: 7, step: 0.1 },
        phase: { min: -6.28, max: 6.28, step: 0.01 },
        offset: { min: -2, max: 2, step: 0.1 }
    };

    // ═══════════════════════════════════════════════════════════════════
    // HELPER: Create slider config
    // ═══════════════════════════════════════════════════════════════════

    function slider(label, range, key, defaultValue) {
        return ['slider', label, range.min, range.max, range.step, { 
            value: defaultValue !== undefined ? defaultValue : 0, 
            key: key, 
            withNumber: true 
        }];
    }

    function waveToggle(key) {
        return ['radio', 'Wave', ['sin', 'cos'], { key: key, selectedValue: 'sin' }];
    }

    // ═══════════════════════════════════════════════════════════════════
    // TOOL CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════

    export const TOOL_CONFIG = {
        title: 'WAVE INTERFERENCE',
        
        // CONSOLIDATED TO 3 TABS (+ CANVAS auto-injected = 4 total)
        sidebar: [
            ['EQUATION', [
                // R(r) - Radial
                ['R(r) Term 1', [
                    slider('Ar₁', RANGES.amp, 'Ar1', 1),
                    slider('fr₁', RANGES.freq, 'fr1', 20),
                    slider('pr₁', RANGES.power, 'pr1', 1),
                    slider('φr₁', RANGES.phase, 'phi_r1', 0),
                ]],
                ['R(r) Term 2', [
                    slider('Ar₂', RANGES.amp, 'Ar2', 0),
                    slider('fr₂', RANGES.freq, 'fr2', 0),
                    slider('pr₂', RANGES.power, 'pr2', 1),
                    slider('φr₂', RANGES.phase, 'phi_r2', 0),
                ]],
                // X(x) - Horizontal
                ['X(x) Term 1', [
                    slider('Ax₁', RANGES.amp, 'Ax1', 0),
                    slider('fx₁', RANGES.freq, 'fx1', 0),
                    slider('px₁', RANGES.power, 'px1', 1),
                    slider('φx₁', RANGES.phase, 'phi_x1', 0),
                ]],
                ['X(x) Term 2', [
                    slider('Ax₂', RANGES.amp, 'Ax2', 0),
                    slider('fx₂', RANGES.freq, 'fx2', 0),
                    slider('px₂', RANGES.power, 'px2', 1),
                    slider('φx₂', RANGES.phase, 'phi_x2', 0),
                ]],
                // Y(y) - Vertical
                ['Y(y) Term 1', [
                    slider('Ay₁', RANGES.amp, 'Ay1', 0),
                    slider('fy₁', RANGES.freq, 'fy1', 0),
                    slider('py₁', RANGES.power, 'py1', 1),
                    slider('φy₁', RANGES.phase, 'phi_y1', 0),
                ]],
                ['Y(y) Term 2', [
                    slider('Ay₂', RANGES.amp, 'Ay2', 0),
                    slider('fy₂', RANGES.freq, 'fy2', 0),
                    slider('py₂', RANGES.power, 'py2', 1),
                    slider('φy₂', RANGES.phase, 'phi_y2', 0),
                ]],
            ]],
            ['CONTROLS', [
                ['View', [
                    ['slider', 'Scale', 50, 500, 10, { value: 300, key: 'scale', withNumber: true }],
                    ['slider', 'Rotation', 0, 360, 1, { value: 0, key: 'rotation', withNumber: true }],
                    ['radio', 'Blend', ['sum', 'multiply'], { key: 'blendMode', selectedValue: 'sum' }],
                ]],
                ['Presets', [
                    ['dropdown', 'Landmark', Object.keys(LANDMARKS), { key: 'landmark', value: '20 Rings (Default)' }],
                    ['button', 'Apply Preset', null, { key: 'applyPreset' }],
                    ['button', 'Clear All', null, { key: 'clearAll' }],
                ]],
                ['Vector Export', [
                    ['button', 'Export SVG', null, { key: 'exportSvg' }],
                ]],
            ]],
            ['ANIMATION', [
                ['Checkpoints', [
                    ['button', 'Save State', null, { key: 'saveCheckpoint' }],
                    // CheckpointList component will be injected here
                ]],
                ['Phase Animation', [
                    ['toggle', 'Phases', ['φr₁', 'φr₂', 'φx₁', 'φy₁'], { key: 'animPhases', selectedValues: [] }],
                    ['slider', 'Speed', 0.1, 5, 0.1, { value: 1, key: 'phaseSpeed', withNumber: true }],
                ]],
                ['Playback', [
                    ['toggle', 'Loop', ['Enabled'], { key: 'sequenceLoop', selectedValues: ['Enabled'] }],
                    ['button', 'Play/Pause', null, { key: 'playPause' }],
                    ['button', 'Stop', null, { key: 'stopAnim' }],
                ]],
            ]],
            // Auto-CANVAS tab injected (no auto-ANIMATION - uses custom checkpoint animator)
        ],
        
        canvas: { 
            width: 840,
            height: 840,
            displayMode: 'fit',
            showControls: true
        },
        
        // NO animation config - uses custom checkpoint-based interpolation
        // AnimationExport would conflict with checkpoint system
        
        onInit: function(values) {
            var self = this;
            
            // Initialize WebGL renderer
            initWebGL(self);
            
            // Wire preset buttons
            wireButton(self, 'applyPreset', function() {
                var vals = self.getValues();
                var preset = LANDMARKS[vals.landmark];
                if (preset) {
                    // FIRST: Zero ALL amplitude parameters (this is key!)
                    var zeroAmplitudes = {
                        Ar1: 0, Ar2: 0, Mr: 0,
                        Ax1: 0, Ax2: 0, Mx: 0,
                        Ay1: 0, Ay2: 0, My: 0
                    };
                    Object.keys(zeroAmplitudes).forEach(function(k) {
                        self.setValue(k, 0);
                    });
                    
                    // Reset other params to defaults
                    var defaults = getDefaultParams();
                    Object.keys(defaults).forEach(function(k) {
                        // Skip amplitudes (already zeroed) and global settings
                        if (!zeroAmplitudes.hasOwnProperty(k) && 
                            k !== 'scale' && k !== 'rotation' && k !== 'blendMode') {
                            self.setValue(k, defaults[k]);
                        }
                    });
                    
                    // Apply preset values
                    Object.keys(preset).forEach(function(k) {
                        self.setValue(k, preset[k]);
                    });
                    self.draw();
                }
            });
            
            wireButton(self, 'clearAll', function() {
                var defaults = getDefaultParams();
                defaults.Ar1 = 0; defaults.fr1 = 0; // Clear even the default rings
                Object.keys(defaults).forEach(function(k) {
                    if (k !== 'scale' && k !== 'rotation' && k !== 'blendMode') {
                        self.setValue(k, defaults[k]);
                    }
                });
                self.draw();
            });
            
            // Create SequencerV2 into Checkpoints block
            setTimeout(function() {
                createSequencerV2Wave(self);
            }, 0);
            
            // Wire animation buttons
            wireButton(self, 'playPause', function(btn) {
                if (animationState.playing) {
                    pauseAnimation();
                    btn.textContent = 'PLAY';
                } else {
                    startAnimation(self);
                    btn.textContent = 'PAUSE';
                }
            });
            
            wireButton(self, 'stopAnim', function() {
                stopAnimation();
                var btn = self.getComponent('playPause');
                if (btn && btn.element) btn.element.textContent = 'PLAY';
            });
            
            // SVG export is custom for this tool (PNG handled by ToolBase)
            wireButton(self, 'exportSvg', function() {
                exportSvg(self);
            });
            
            // Animation export now handled by ToolBase CANVAS tab when animation config is present
        },
        
        onUpdate: function(key, value, allValues) {
            // Handle multi-select phase animation toggle
            if (key === 'animPhases') {
                var selected = value || [];
                animationState.phaseAnimations.phi_r1.enabled = selected.indexOf('φr₁') >= 0;
                animationState.phaseAnimations.phi_r2.enabled = selected.indexOf('φr₂') >= 0;
                animationState.phaseAnimations.phi_x1.enabled = selected.indexOf('φx₁') >= 0;
                animationState.phaseAnimations.phi_y1.enabled = selected.indexOf('φy₁') >= 0;
            } else if (key === 'phaseSpeed') {
                // Apply speed to all phases
                var speed = parseFloat(value) || 1;
                animationState.phaseAnimations.phi_r1.speed = speed;
                animationState.phaseAnimations.phi_r2.speed = speed;
                animationState.phaseAnimations.phi_x1.speed = speed;
                animationState.phaseAnimations.phi_y1.speed = speed;
            }
        },
        
        onDraw: function(ctx, canvas, values) {
            if (webglRenderer) {
                drawWebGL(webglRenderer, values);
            } else {
                drawCPU(ctx, canvas, values);
            }
        },
    };

    // ═══════════════════════════════════════════════════════════════════
    // MATH HELPERS
    // ═══════════════════════════════════════════════════════════════════

    function safePow(base, exp) {
        if (Math.abs(base) < 1e-9 && exp < 0) return 0;
        if (Math.abs(exp - 1) < 1e-9) return base;
        if (Math.abs(exp) < 1e-9) return 1;
        var sign = base >= 0 ? 1 : -1;
        var result = sign * Math.pow(Math.abs(base), exp);
        if (!isFinite(result) || isNaN(result)) return 0;
        return result;
    }

    function wave(type, val) {
        return type === 'cos' ? Math.cos(val) : Math.sin(val);
    }

    // ═══════════════════════════════════════════════════════════════════
    // CPU RENDERER
    // ═══════════════════════════════════════════════════════════════════

    function drawCPU(ctx, canvas, v) {
            var w = canvas.width;
            var h = canvas.height;
        var scale = v.scale || 300;
        var rotation = (v.rotation || 0) * Math.PI / 180;
        var blendMode = v.blendMode || 'sum';
            
            var cosRot = Math.cos(rotation);
            var sinRot = Math.sin(rotation);
            var halfW = w / 2;
            var halfH = h / 2;
            var TWO_PI = Math.PI * 2;
            
            var imageData = ctx.createImageData(w, h);
            var data = imageData.data;
            
            for (var py = 0; py < h; py++) {
                for (var px = 0; px < w; px++) {
                    var x = (px - halfW) / scale;
                    var y = (py - halfH) / scale;
                    
                    // Apply rotation
                    if (rotation !== 0) {
                        var xRot = x * cosRot - y * sinRot;
                        var yRot = x * sinRot + y * cosRot;
                        x = xRot;
                        y = yRot;
                    }
                    
                    var r = Math.sqrt(x * x + y * y);
                    
                    // R equation
                    var rVal = 0;
                if (Math.abs(v.Ar1) > 1e-9) {
                    rVal += v.Ar1 * safePow(wave(v.wave_r1, v.fr1 * TWO_PI * r + (v.phi_r1 || 0)), v.pr1 || 1) + (v.Or1 || 0);
                }
                if (Math.abs(v.Ar2) > 1e-9) {
                    rVal += v.Ar2 * safePow(wave(v.wave_r2, v.fr2 * TWO_PI * r + (v.phi_r2 || 0)), v.pr2 || 1) + (v.Or2 || 0);
                }
                if (Math.abs(v.Mr) > 1e-9) {
                    rVal += v.Mr * safePow(Math.sin(v.frm1 * TWO_PI * r + (v.phi_rm1 || 0)), v.prm1 || 1) *
                                   safePow(Math.cos(v.frm2 * TWO_PI * r + (v.phi_rm2 || 0)), v.prm2 || 1);
                    }
                    
                    // X equation
                    var xVal = 0;
                if (Math.abs(v.Ax1) > 1e-9) {
                    xVal += v.Ax1 * safePow(wave(v.wave_x1, v.fx1 * TWO_PI * x + (v.phi_x1 || 0)), v.px1 || 1) + (v.Ox1 || 0);
                }
                if (Math.abs(v.Ax2) > 1e-9) {
                    xVal += v.Ax2 * safePow(wave(v.wave_x2, v.fx2 * TWO_PI * x + (v.phi_x2 || 0)), v.px2 || 1) + (v.Ox2 || 0);
                }
                if (Math.abs(v.Mx) > 1e-9) {
                    xVal += v.Mx * safePow(Math.sin(v.fxm1 * TWO_PI * x + (v.phi_xm1 || 0)), v.pxm1 || 1) *
                                   safePow(Math.cos(v.fxm2 * TWO_PI * x + (v.phi_xm2 || 0)), v.pxm2 || 1);
                    }
                    
                    // Y equation
                    var yVal = 0;
                if (Math.abs(v.Ay1) > 1e-9) {
                    yVal += v.Ay1 * safePow(wave(v.wave_y1, v.fy1 * TWO_PI * y + (v.phi_y1 || 0)), v.py1 || 1) + (v.Oy1 || 0);
                }
                if (Math.abs(v.Ay2) > 1e-9) {
                    yVal += v.Ay2 * safePow(wave(v.wave_y2, v.fy2 * TWO_PI * y + (v.phi_y2 || 0)), v.py2 || 1) + (v.Oy2 || 0);
                }
                if (Math.abs(v.My) > 1e-9) {
                    yVal += v.My * safePow(Math.sin(v.fym1 * TWO_PI * y + (v.phi_ym1 || 0)), v.pym1 || 1) *
                                   safePow(Math.cos(v.fym2 * TWO_PI * y + (v.phi_ym2 || 0)), v.pym2 || 1);
                    }
                    
                    // Blend
                    var value = blendMode === 'multiply' ? (rVal * xVal * yVal) : (rVal + xVal + yVal);
                    var color = value > 0 ? 255 : 0;
                    
                    var idx = (py * w + px) * 4;
                    data[idx] = color;
                    data[idx + 1] = color;
                    data[idx + 2] = color;
                    data[idx + 3] = 255;
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
    }

    // ═══════════════════════════════════════════════════════════════════
    // WEBGL RENDERER
    // ═══════════════════════════════════════════════════════════════════

    var VERTEX_SHADER = `
        attribute vec2 a_position;
        varying vec2 v_coord;
        void main() {
            v_coord = a_position;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    var FRAGMENT_SHADER = `
        precision highp float;
        varying vec2 v_coord;
        uniform vec2 u_resolution;
        uniform float u_scale;
        uniform float u_rotation;
        uniform float u_blendMode;
        
        // R equation uniforms
        uniform float u_Ar1, u_fr1, u_pr1, u_phi_r1, u_Or1, u_wave_r1;
        uniform float u_Ar2, u_fr2, u_pr2, u_phi_r2, u_Or2, u_wave_r2;
        uniform float u_Mr, u_frm1, u_prm1, u_phi_rm1, u_frm2, u_prm2, u_phi_rm2;
        
        // X equation uniforms
        uniform float u_Ax1, u_fx1, u_px1, u_phi_x1, u_Ox1, u_wave_x1;
        uniform float u_Ax2, u_fx2, u_px2, u_phi_x2, u_Ox2, u_wave_x2;
        uniform float u_Mx, u_fxm1, u_pxm1, u_phi_xm1, u_fxm2, u_pxm2, u_phi_xm2;
        
        // Y equation uniforms
        uniform float u_Ay1, u_fy1, u_py1, u_phi_y1, u_Oy1, u_wave_y1;
        uniform float u_Ay2, u_fy2, u_py2, u_phi_y2, u_Oy2, u_wave_y2;
        uniform float u_My, u_fym1, u_pym1, u_phi_ym1, u_fym2, u_pym2, u_phi_ym2;
        
        const float TWO_PI = 6.28318530718;
        
        float safePow(float base, float exp) {
            if (abs(base) < 1e-9 && exp < 0.0) return 0.0;
            if (abs(exp - 1.0) < 1e-9) return base;
            if (abs(exp) < 1e-9) return 1.0;
            return sign(base) * pow(abs(base), exp);
        }
        
        float waveFunc(float usecos, float val) {
            return usecos > 0.5 ? cos(val) : sin(val);
        }
        
        float evaluateR(float r) {
            float result = 0.0;
            if (abs(u_Ar1) > 1e-9) {
                result += u_Ar1 * safePow(waveFunc(u_wave_r1, u_fr1 * TWO_PI * r + u_phi_r1), u_pr1) + u_Or1;
            }
            if (abs(u_Ar2) > 1e-9) {
                result += u_Ar2 * safePow(waveFunc(u_wave_r2, u_fr2 * TWO_PI * r + u_phi_r2), u_pr2) + u_Or2;
            }
            if (abs(u_Mr) > 1e-9) {
                result += u_Mr * safePow(sin(u_frm1 * TWO_PI * r + u_phi_rm1), u_prm1) * 
                                safePow(cos(u_frm2 * TWO_PI * r + u_phi_rm2), u_prm2);
            }
            return result;
        }
        
        float evaluateX(float x) {
            float result = 0.0;
            if (abs(u_Ax1) > 1e-9) {
                result += u_Ax1 * safePow(waveFunc(u_wave_x1, u_fx1 * TWO_PI * x + u_phi_x1), u_px1) + u_Ox1;
            }
            if (abs(u_Ax2) > 1e-9) {
                result += u_Ax2 * safePow(waveFunc(u_wave_x2, u_fx2 * TWO_PI * x + u_phi_x2), u_px2) + u_Ox2;
            }
            if (abs(u_Mx) > 1e-9) {
                result += u_Mx * safePow(sin(u_fxm1 * TWO_PI * x + u_phi_xm1), u_pxm1) * 
                                safePow(cos(u_fxm2 * TWO_PI * x + u_phi_xm2), u_pxm2);
            }
            return result;
        }
        
        float evaluateY(float y) {
            float result = 0.0;
            if (abs(u_Ay1) > 1e-9) {
                result += u_Ay1 * safePow(waveFunc(u_wave_y1, u_fy1 * TWO_PI * y + u_phi_y1), u_py1) + u_Oy1;
            }
            if (abs(u_Ay2) > 1e-9) {
                result += u_Ay2 * safePow(waveFunc(u_wave_y2, u_fy2 * TWO_PI * y + u_phi_y2), u_py2) + u_Oy2;
            }
            if (abs(u_My) > 1e-9) {
                result += u_My * safePow(sin(u_fym1 * TWO_PI * y + u_phi_ym1), u_pym1) * 
                                safePow(cos(u_fym2 * TWO_PI * y + u_phi_ym2), u_pym2);
            }
        return result;
    }

        void main() {
            vec2 coord = v_coord * u_resolution.x * 0.5 / u_scale;
            
            // Apply rotation
            float rad = u_rotation * 3.14159265 / 180.0;
            float cosR = cos(rad);
            float sinR = sin(rad);
            float x = coord.x * cosR - coord.y * sinR;
            float y = coord.x * sinR + coord.y * cosR;
            
            float r = length(vec2(x, y));
            float rVal = evaluateR(r);
            float xVal = evaluateX(x);
            float yVal = evaluateY(y);
            
            float value = (u_blendMode > 0.5) ? (rVal * xVal * yVal) : (rVal + xVal + yVal);
            float color = value > 0.0 ? 1.0 : 0.0;
            
            gl_FragColor = vec4(vec3(color), 1.0);
        }
    `;

    function initWebGL(toolInstance) {
        var canvas = toolInstance.getCanvas();
        if (!canvas) return;
        
        try {
            var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
                console.log('WebGL not available, using CPU renderer');
                return;
            }
            
            // Create shaders
            var vs = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vs, VERTEX_SHADER);
            gl.compileShader(vs);
            if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
                console.error('Vertex shader error:', gl.getShaderInfoLog(vs));
                return;
            }
            
            var fs = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fs, FRAGMENT_SHADER);
            gl.compileShader(fs);
            if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
                console.error('Fragment shader error:', gl.getShaderInfoLog(fs));
                return;
            }
            
            // Create program
            var program = gl.createProgram();
            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error('Program link error:', gl.getProgramInfoLog(program));
                return;
            }
            
            // Setup geometry
            var posBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1
            ]), gl.STATIC_DRAW);
            
            var posLoc = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
            
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.useProgram(program);
            
            webglRenderer = { gl: gl, program: program, canvas: canvas };
            console.log('✅ WebGL renderer initialized');
        } catch (e) {
            console.warn('WebGL init failed:', e);
        }
    }

    function drawWebGL(renderer, v) {
        var gl = renderer.gl;
        var program = renderer.program;
        var canvas = renderer.canvas;
        
        gl.viewport(0, 0, canvas.width, canvas.height);
        
        // Set uniforms
        gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height);
        gl.uniform1f(gl.getUniformLocation(program, 'u_scale'), v.scale || 300);
        gl.uniform1f(gl.getUniformLocation(program, 'u_rotation'), v.rotation || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_blendMode'), v.blendMode === 'multiply' ? 1.0 : 0.0);
        
        // R equation
        gl.uniform1f(gl.getUniformLocation(program, 'u_Ar1'), v.Ar1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_fr1'), v.fr1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_pr1'), v.pr1 || 1);
        gl.uniform1f(gl.getUniformLocation(program, 'u_phi_r1'), v.phi_r1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_Or1'), v.Or1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_wave_r1'), v.wave_r1 === 'cos' ? 1.0 : 0.0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_Ar2'), v.Ar2 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_fr2'), v.fr2 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_pr2'), v.pr2 || 1);
        gl.uniform1f(gl.getUniformLocation(program, 'u_phi_r2'), v.phi_r2 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_Or2'), v.Or2 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_wave_r2'), v.wave_r2 === 'cos' ? 1.0 : 0.0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_Mr'), v.Mr || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_frm1'), v.frm1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_prm1'), v.prm1 || 1);
        gl.uniform1f(gl.getUniformLocation(program, 'u_phi_rm1'), v.phi_rm1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_frm2'), v.frm2 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_prm2'), v.prm2 || 1);
        gl.uniform1f(gl.getUniformLocation(program, 'u_phi_rm2'), v.phi_rm2 || 0);
        
        // X equation
        gl.uniform1f(gl.getUniformLocation(program, 'u_Ax1'), v.Ax1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_fx1'), v.fx1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_px1'), v.px1 || 1);
        gl.uniform1f(gl.getUniformLocation(program, 'u_phi_x1'), v.phi_x1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_Ox1'), v.Ox1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_wave_x1'), v.wave_x1 === 'cos' ? 1.0 : 0.0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_Ax2'), v.Ax2 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_fx2'), v.fx2 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_px2'), v.px2 || 1);
        gl.uniform1f(gl.getUniformLocation(program, 'u_phi_x2'), v.phi_x2 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_Ox2'), v.Ox2 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_wave_x2'), v.wave_x2 === 'cos' ? 1.0 : 0.0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_Mx'), v.Mx || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_fxm1'), v.fxm1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_pxm1'), v.pxm1 || 1);
        gl.uniform1f(gl.getUniformLocation(program, 'u_phi_xm1'), v.phi_xm1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_fxm2'), v.fxm2 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_pxm2'), v.pxm2 || 1);
        gl.uniform1f(gl.getUniformLocation(program, 'u_phi_xm2'), v.phi_xm2 || 0);
        
        // Y equation
        gl.uniform1f(gl.getUniformLocation(program, 'u_Ay1'), v.Ay1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_fy1'), v.fy1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_py1'), v.py1 || 1);
        gl.uniform1f(gl.getUniformLocation(program, 'u_phi_y1'), v.phi_y1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_Oy1'), v.Oy1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_wave_y1'), v.wave_y1 === 'cos' ? 1.0 : 0.0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_Ay2'), v.Ay2 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_fy2'), v.fy2 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_py2'), v.py2 || 1);
        gl.uniform1f(gl.getUniformLocation(program, 'u_phi_y2'), v.phi_y2 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_Oy2'), v.Oy2 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_wave_y2'), v.wave_y2 === 'cos' ? 1.0 : 0.0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_My'), v.My || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_fym1'), v.fym1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_pym1'), v.pym1 || 1);
        gl.uniform1f(gl.getUniformLocation(program, 'u_phi_ym1'), v.phi_ym1 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_fym2'), v.fym2 || 0);
        gl.uniform1f(gl.getUniformLocation(program, 'u_pym2'), v.pym2 || 1);
        gl.uniform1f(gl.getUniformLocation(program, 'u_phi_ym2'), v.phi_ym2 || 0);
        
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    // ═══════════════════════════════════════════════════════════════════
    // SEQUENCER V2
    // ═══════════════════════════════════════════════════════════════════

    function createSequencerV2Wave(toolInstance) {
        var saveBtn = toolInstance.getComponent('saveCheckpoint');
        if (!saveBtn || !saveBtn.element) {
            setTimeout(function() { createSequencerV2Wave(toolInstance); }, 100);
            return;
        }

        var parent = saveBtn.element.parentElement;
        while (parent && !parent.classList.contains('tool-block-content')) {
            parent = parent.parentElement;
        }
        if (!parent) parent = saveBtn.element.parentElement;
        parent.innerHTML = '';

        if (!window.ComponentLibrary || !window.ComponentLibrary.SequencerV2) {
            console.error('❌ ComponentLibrary.SequencerV2 not available');
            return;
        }

        var paramKeys = Object.keys(getDefaultParams());

        sequencerV2Wave = new window.ComponentLibrary.SequencerV2({
            fps: 60,
            loop: true,
            defaultHold: 2,
            defaultSegmentDuration: 1.5,
            defaultEasing: 'easeInOutCubic',
            onSave: function() {
                var values = toolInstance.getValues();
                var snap = {};
                paramKeys.forEach(function(k) { snap[k] = values[k]; });
                return snap;
            },
            onLoad: function(cpParams) {
                Object.keys(cpParams).forEach(function(k) {
                    toolInstance.setValue(k, cpParams[k]);
                });
                toolInstance.draw();
            },
            onFrame: function(interpolated) {
                Object.keys(interpolated).forEach(function(k) {
                    toolInstance.setValue(k, interpolated[k]);
                });
                toolInstance.draw();
            }
        }, {});

        parent.appendChild(sequencerV2Wave.render());

        var stripEl = sequencerV2Wave.getStripElement();
        if (stripEl && toolInstance.canvasArea) {
            toolInstance.canvasArea.appendChild(stripEl);
        }

        console.log('✅ WaveInterference SequencerV2 created');
    }

    // ═══════════════════════════════════════════════════════════════════
    // ANIMATION SYSTEM
    // ═══════════════════════════════════════════════════════════════════

    function startAnimation(toolInstance) {
        if (animationState.playing) return;
        
        var hasPhaseEnabled = Object.values(animationState.phaseAnimations).some(function(p) { return p.enabled; });
        
        if (!hasPhaseEnabled) {
            console.log('Enable phase animation to use the phase animator');
            return;
        }
        
        animationState.playing = true;
        animationState.startTime = performance.now();
        
        // Store base phase values
        var values = toolInstance.getValues();
        Object.keys(animationState.phaseAnimations).forEach(function(key) {
            animationState.phaseBaseValues[key] = values[key] || 0;
        });
        
        // Start animation loop
        if (AnimationLoop) {
            animator = new AnimationLoop({
                fps: 60,
                onFrame: function() {
                    animateFrame(toolInstance);
                }
            });
            animator.start();
        }
    }

    function pauseAnimation() {
        if (animator) {
            if (animator.isPaused) {
                animator.resume();
            } else {
                animator.pause();
            }
        }
    }

    function stopAnimation() {
        animationState.playing = false;
        if (animator) {
            animator.destroy();
            animator = null;
        }
    }

    function animateFrame(toolInstance) {
        if (!animationState.playing) return;
        
        var elapsed = (performance.now() - animationState.startTime) / 1000;
        var values = toolInstance.getValues();
        var phaseSpeed = values.phaseSpeed || 1;
        
        Object.keys(animationState.phaseAnimations).forEach(function(key) {
            var phaseAnim = animationState.phaseAnimations[key];
            if (phaseAnim.enabled) {
                var baseValue = animationState.phaseBaseValues[key];
                var phaseIncrement = elapsed * phaseSpeed * phaseAnim.direction * Math.PI * 2;
                var newPhase = baseValue + phaseIncrement;
                var wrappedPhase = ((newPhase + Math.PI * 2) % (Math.PI * 4)) - Math.PI * 2;
                toolInstance.setValue(key, wrappedPhase);
            }
        });
        
        toolInstance.draw();
    }

    // ═══════════════════════════════════════════════════════════════════
    // EXPORT FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════

    function exportPng(toolInstance) {
        const canvas = toolInstance.getCanvas();
        if (!canvas) return;
        ExportUtils.exportCanvasPNG(canvas, 'wave-interference');
    }

    function exportSvg(toolInstance) {
        const canvas = toolInstance.getCanvas();
        if (!canvas) return;
        
        const values = toolInstance.getValues();
        const w = canvas.width;
        const h = canvas.height;
        const scale = values.scale || 300;
        const TWO_PI = Math.PI * 2;
        
        const paths = [];
        const resolution = 2;
        
        for (let py = 0; py < h; py += resolution) {
            for (let px = 0; px < w; px += resolution) {
                const x = (px - w/2) / scale;
                const y = (py - h/2) / scale;
                const r = Math.sqrt(x * x + y * y);
                
                const rVal = values.Ar1 ? values.Ar1 * safePow(Math.sin(values.fr1 * TWO_PI * r), values.pr1 || 1) : 0;
                const xVal = values.Ax1 ? values.Ax1 * safePow(Math.sin(values.fx1 * TWO_PI * x), values.px1 || 1) : 0;
                const yVal = values.Ay1 ? values.Ay1 * safePow(Math.sin(values.fy1 * TWO_PI * y), values.py1 || 1) : 0;
                
                if (rVal + xVal + yVal <= 0) {
                    paths.push(`M${px},${py} h${resolution} v${resolution} h-${resolution}Z`);
                }
            }
        }
        
        const svgParts = [];
        svgParts.push(ExportUtils.buildSVGHeader(w, h, 'white'));
        svgParts.push(`<path d="${paths.join(' ')}" fill="black"/>`);
        svgParts.push(ExportUtils.buildSVGFooter());
        
        ExportUtils.exportSVG(svgParts.join('\n'), 'wave-interference');
    }

    // ═══════════════════════════════════════════════════════════════════
    // ANIMATION EXPORT - Frame Sequence
    // ═══════════════════════════════════════════════════════════════════
    
    // Animation export now handled by ToolBase (see animation config in TOOL_CONFIG)

    // ═══════════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════

    function wireButton(tool, key, callback) {
        var btn = tool.getComponent(key);
        if (btn && btn.element) {
            btn.element.addEventListener('click', function() { callback(btn.element); });
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════

export class WaveInterferenceTool {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = {
            ComponentLibrary,
            ...deps
        };
    }
    
    render() {
        try {
            this.tool = new ToolBase(TOOL_CONFIG, this.deps);
            this.tool.mount(this.container);
            this.tool.draw();
            console.log('✅ WaveInterferenceTool rendered (v2.0 full features)');
        } catch (error) {
            console.error('❌ WaveInterferenceTool error:', error);
            this.container.innerHTML = '<div style="padding:20px;color:var(--c-text);"><h2>WAVE INTERFERENCE ERROR</h2><p style="color:red;">' + error.message + '</p></div>';
        }
    }
    
    destroy() {
        stopAnimation();
        if (sequencerV2Wave) {
            sequencerV2Wave.destroy();
            sequencerV2Wave = null;
        }
        webglRenderer = null;
        if (this.tool) { 
            this.tool.destroy(); 
            this.tool = null; 
        }
    }
}

// Export as default for tools_section.js
export default WaveInterferenceTool;
