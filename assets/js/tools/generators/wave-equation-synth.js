/**
 * Wave Equation Synth - DSP Audio Generator
 * 
 * Generate audio from arbitrary mathematical equations.
 * 
 * Design Spec: blog/ideas/tools/wave-equation-synth/01-design-spec.md
 * 
 * @version 1.0.0
 */
// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { AnimationLoop } from '../../core/animation-foundation.js';
import { DSPEvaluator } from '../../shared/algorithms/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
    // MODULE-LEVEL STATE
    // ═══════════════════════════════════════════════════════════════════════════════
    
    var audioAnimator = null;
    var analyser = null;
    var dataArray = null;

    // ═══════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════════

    export const TOOL_CONFIG = {
        title: 'WAVE EQUATION SYNTH',
        
        sidebar: [
            // ═══════════════════════════════════════════════════════════════════
            // TAB 1: CONTROLS — Core Parameters & Visualization
            // ═══════════════════════════════════════════════════════════════════
            ['CONTROLS', [
                ['Core', [
                    ['slider', 'Base Frequency', 1, 2000, 1, { value: 440, key: 'baseFreq', withNumber: true }],
                    ['dropdown', 'Sample Rate', ['8000', '22050', '44100', '48000'], { key: 'sampleRate', value: '48000' }],
                    ['slider', 'Duration', 0.1, 30, 0.1, { value: 5, key: 'duration', withNumber: true }],
                ]],
                ['Equations', [
                    ['text', 'Equation 1', 'sin(2*PI*p)', { key: 'eq1', placeholder: 'sin(2*PI*p)' }],
                    ['text', 'Equation 2', '', { key: 'eq2', placeholder: 'sin(4*PI*p)*0.5' }],
                    ['text', 'Equation 3', '', { key: 'eq3', placeholder: 'tri(p)*0.3' }],
                    ['slider', 'Mix', 0, 1, 0.01, { value: 0.5, key: 'mix', withNumber: true }],
                ]],
                ['Visualization', [
                    ['dropdown', 'Mode', ['Oscilloscope', 'Segmented', 'Circular'], { key: 'vizMode', value: 'Oscilloscope' }],
                    ['stepper', 'Cycles Shown', 1, 64, 1, { value: 4, key: 'cycles' }],
                    ['slider', 'Modulation Depth', 0, 1, 0.01, { value: 0.3, key: 'modDepth', withNumber: true }],
                    ['color', 'Waveform', '#00FF00', { key: 'waveColor' }],
                    ['color', 'Background', '#000000', { key: 'bgColor' }],
                    ['slider', 'Line Width', 1, 5, 0.5, { value: 2, key: 'lineWidth', withNumber: true }],
                ]],
                ['Info', [
                    ['label', 'Variables: p=phase, w=2π×freq, u=sample, t=time, g=global phase', { variant: 'caption' }],
                    ['label', 'Functions: sin, cos, tan, abs, sqrt, tri(), saw(), sqr()', { variant: 'caption' }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 2: AUDIO — Playback & Export
            // ═══════════════════════════════════════════════════════════════════
            ['AUDIO', [
                ['Playback', [
                    ['button', 'Play', null, { key: 'play' }],
                    ['button', 'Stop', null, { key: 'stop' }],
                    ['slider', 'Volume', 0, 100, 1, { value: 50, key: 'volume', withNumber: true }],
                ]],
                ['Output', [
                    ['progress', 'Level', 0, { key: 'audioLevel' }],
                    ['value', '0 Hz', { label: 'Frequency', key: 'freqDisplay' }],
                ]],
                ['Export', [
                    ['button', 'Download WAV', null, { key: 'exportWav' }],
                    ['button', 'Copy Equation', null, { key: 'copyEq' }],
                ]],
            ]],
        ],
        
        // Auto-injects CANVAS tab (sizing controls)
        canvas: { 
            width: 420, 
            height: 420,
            showControls: true 
        },
        
        // Animation config for waveform visualization
        animation: {
            type: 'infinite',
            defaultFps: 60,
            canPrerender: false  // Real-time audio visualization
        },
        
        onInit: function(values) {
            var self = this;
            
            // Initialize audio context later (requires user gesture)
            this.audioContext = null;
            this.oscillatorNode = null;
            this.gainNode = null;
            this.scriptNode = null;
            this.isPlaying = false;
            
            // Wire buttons
            wireButton(this, 'play', function() { startAudio(self); });
            wireButton(this, 'stop', function() { stopAudio(self); });
            wireButton(this, 'exportWav', function() { exportWAV(self); });
            wireButton(this, 'copyEq', function() { copyEquation(self); });
        },
        
        onUpdate: function(key, value, allValues) {
            var self = this;
            
            // Canvas width/height now handled by auto-CANVAS tab
            
            if (key === 'volume' && this.gainNode) {
                this.gainNode.gain.value = value / 100 * 0.5;
            }
            
            if (key === 'baseFreq') {
                var freqComp = this.getComponent('freqDisplay');
                if (freqComp && freqComp.setValue) {
                    freqComp.setValue(value + ' Hz');
                }
            }
        },
        
        onDraw: function(ctx, canvas, values) {
            var w = canvas.width;
            var h = canvas.height;
            
            // Clear
            ctx.fillStyle = values.bgColor || '#000000';
            ctx.fillRect(0, 0, w, h);
            
            var vizMode = values.vizMode || 'Oscilloscope';
            
            if (this.isPlaying && dataArray) {
                // Draw live waveform
                drawWaveform(ctx, w, h, dataArray, values, vizMode);
            } else {
                // Draw equation preview
                drawEquationPreview(ctx, w, h, values, vizMode);
            }
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // AUDIO PLAYBACK
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function startAudio(toolInstance) {
        if (toolInstance.isPlaying) return;
        
        var values = toolInstance.getValues();
        
        // Create AudioContext on user gesture
        if (!toolInstance.audioContext) {
            toolInstance.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        var ctx = toolInstance.audioContext;
        
        // Resume if suspended
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        
        // Create nodes
        toolInstance.gainNode = ctx.createGain();
        toolInstance.gainNode.gain.value = (values.volume || 50) / 100 * 0.5;
        
        analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        // Create script processor for custom waveform
        var bufferSize = 4096;
        toolInstance.scriptNode = ctx.createScriptProcessor(bufferSize, 0, 1);
        
        var sampleRate = parseInt(values.sampleRate) || 48000;
        var baseFreq = values.baseFreq || 440;
        var eq1 = values.eq1 || 'sin(2*PI*p)';
        var eq2 = values.eq2 || '';
        var eq3 = values.eq3 || '';
        var mix = values.mix || 0.5;
        
        var phase = 0;
        var globalSample = 0;
        
        toolInstance.scriptNode.onaudioprocess = function(e) {
            var output = e.outputBuffer.getChannelData(0);
            var bufRate = ctx.sampleRate;
            var phaseInc = baseFreq / bufRate;
            
            for (var i = 0; i < output.length; i++) {
                var p = phase;
                var w = 2 * Math.PI * baseFreq;
                var u = globalSample / (values.duration * bufRate);
                var t = globalSample / bufRate;
                var g = globalSample * phaseInc;
                
                var sample = evaluateEquation(eq1, p, w, u, t, g);
                
                if (eq2) {
                    var s2 = evaluateEquation(eq2, p, w, u, t, g);
                    sample = sample * (1 - mix) + s2 * mix;
                }
                
                if (eq3) {
                    var s3 = evaluateEquation(eq3, p, w, u, t, g);
                    sample = sample * 0.7 + s3 * 0.3;
                }
                
                output[i] = Math.max(-1, Math.min(1, sample));
                
                phase += phaseInc;
                if (phase >= 1) phase -= 1;
                globalSample++;
            }
        };
        
        // Connect nodes
        toolInstance.scriptNode.connect(toolInstance.gainNode);
        toolInstance.gainNode.connect(analyser);
        analyser.connect(ctx.destination);
        
        toolInstance.isPlaying = true;
        
        // Start visualization loop
        startVisualization(toolInstance);
    }
    
    function stopAudio(toolInstance) {
        if (!toolInstance.isPlaying) return;
        
        if (toolInstance.scriptNode) {
            toolInstance.scriptNode.disconnect();
            toolInstance.scriptNode = null;
        }
        
        if (toolInstance.gainNode) {
            toolInstance.gainNode.disconnect();
        }
        
        toolInstance.isPlaying = false;
        
        if (audioAnimator) {
            audioAnimator.stop();
        }
        
        toolInstance.draw();
    }
    
    function startVisualization(toolInstance) {
        if (!AnimationLoop) {
            return;
        }

        if (audioAnimator) {
            audioAnimator.destroy();
        }

        audioAnimator = new AnimationLoop({
            fps: 30,
            onFrame: function() {
                if (!toolInstance.isPlaying) {
                    audioAnimator.stop();
                    return;
                }
                
                // Get frequency data
                if (analyser) {
                    analyser.getByteTimeDomainData(dataArray);
                }
                
                // Update level display
                var levelComp = toolInstance.getComponent('audioLevel');
                if (levelComp && levelComp.setValue && dataArray) {
                    var sum = 0;
                    for (var i = 0; i < dataArray.length; i++) {
                        sum += Math.abs(dataArray[i] - 128);
                    }
                    var level = (sum / dataArray.length / 128) * 100;
                    levelComp.setValue(level);
                }
                
                toolInstance.draw();
            }
        });
        audioAnimator.start();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EQUATION EVALUATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // Cache compiled equations for performance
    var compiledEquations = new Map();

    function evaluateEquation(eq, p, w, u, t, g) {
        if (!eq) return 0;

        try {
            // Use algorithms library DSP evaluator
            if (DSPEvaluator) {
                // Cache compiled equations
                if (!compiledEquations.has(eq)) {
                    try {
                        compiledEquations.set(eq, DSPEvaluator.parseEquation(eq));
                    } catch (e) {
                        console.warn('Failed to parse equation:', eq, e);
                        return 0;
                    }
                }

                const evaluator = compiledEquations.get(eq);
                // Map variables: p=phase, w=angular_velocity, u=normalized_time, t=time, g=global_phase
                const vars = { p, w, u, t, g };
                return evaluator(vars);
            } else {
                // Fallback: simple eval (not recommended)
                console.warn('DSPEvaluator not available, using fallback');
                var PI = Math.PI;
                var sin = Math.sin;
                var cos = Math.cos;
                var tan = Math.tan;
                var abs = Math.abs;
                var sqrt = Math.sqrt;
                var pow = Math.pow;
                var floor = Math.floor;
                var ceil = Math.ceil;
                var min = Math.min;
                var max = Math.max;

                var tri = function(x) { return 4 * Math.abs((x % 1) - 0.5) - 1; };
                var saw = function(x) { return 2 * (x % 1) - 1; };
                var sqr = function(x) { return (x % 1) < 0.5 ? 1 : -1; };
                var noise = function() { return Math.random() * 2 - 1; };

                var result = eval(eq);
                return isNaN(result) ? 0 : result;
            }
        } catch (e) {
            console.warn('Equation evaluation error:', e);
            return 0;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // VISUALIZATION
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function drawWaveform(ctx, w, h, data, values, mode) {
        var waveColor = values.waveColor || '#00FF00';
        var lineWidth = values.lineWidth || 2;
        
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = lineWidth;
        
        if (mode === 'Oscilloscope') {
            drawOscilloscope(ctx, w, h, data);
        } else if (mode === 'Segmented') {
            drawSegmented(ctx, w, h, data, values);
        } else if (mode === 'Circular') {
            drawCircular(ctx, w, h, data, values);
        }
    }
    
    function drawOscilloscope(ctx, w, h, data) {
        ctx.beginPath();
        
        var sliceWidth = w / data.length;
        var x = 0;
        
        for (var i = 0; i < data.length; i++) {
            var v = data[i] / 128.0;
            var y = v * h / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        ctx.stroke();
    }
    
    function drawSegmented(ctx, w, h, data, values) {
        var cycles = values.cycles || 4;
        var segmentWidth = w / cycles;
        
        for (var c = 0; c < cycles; c++) {
            ctx.beginPath();
            var startIdx = Math.floor((c / cycles) * data.length);
            var endIdx = Math.floor(((c + 1) / cycles) * data.length);
            
            for (var i = startIdx; i < endIdx; i++) {
                var x = (i - startIdx) / (endIdx - startIdx) * segmentWidth + c * segmentWidth;
                var v = data[i] / 128.0;
                var y = h / 2 + (v - 1) * h / 4;
                
                if (i === startIdx) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }
    }
    
    function drawCircular(ctx, w, h, data, values) {
        var cx = w / 2;
        var cy = h / 2;
        var baseRadius = Math.min(w, h) / 3;
        var modDepth = values.modDepth || 0.3;
        
        ctx.beginPath();
        
        for (var i = 0; i < data.length; i++) {
            var angle = (i / data.length) * Math.PI * 2;
            var v = data[i] / 128.0;
            var r = baseRadius + (v - 1) * baseRadius * modDepth;
            
            var x = cx + Math.cos(angle) * r;
            var y = cy + Math.sin(angle) * r;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.stroke();
    }
    
    function drawEquationPreview(ctx, w, h, values, mode) {
        var waveColor = values.waveColor || '#00FF00';
        var lineWidth = values.lineWidth || 2;
        var baseFreq = values.baseFreq || 440;
        var cycles = values.cycles || 4;
        var eq1 = values.eq1 || 'sin(2*PI*p)';
        
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = 0.5;
        
        ctx.beginPath();
        
        var samples = 500;
        for (var i = 0; i < samples; i++) {
            var p = (i / samples) * cycles;
            p = p - Math.floor(p);
            var t = i / samples;
            var w_val = 2 * Math.PI * baseFreq;
            
            var sample = evaluateEquation(eq1, p, w_val, t, t, i / samples);
            
            var x = (i / samples) * w;
            var y = h / 2 - sample * h / 3;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Draw "Press Play" text
        ctx.fillStyle = waveColor;
        ctx.font = '14px "Atkinson Hyperlegible", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Press "Play" to start audio', w / 2, h - 20);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function exportWAV(toolInstance) {
        var values = toolInstance.getValues();
        var sampleRate = parseInt(values.sampleRate) || 48000;
        var duration = values.duration || 5;
        var baseFreq = values.baseFreq || 440;
        var eq1 = values.eq1 || 'sin(2*PI*p)';
        var eq2 = values.eq2 || '';
        var mix = values.mix || 0.5;
        
        var numSamples = Math.floor(sampleRate * duration);
        var samples = new Float32Array(numSamples);
        
        var phaseInc = baseFreq / sampleRate;
        var phase = 0;
        
        for (var i = 0; i < numSamples; i++) {
            var p = phase;
            var w = 2 * Math.PI * baseFreq;
            var u = i / numSamples;
            var t = i / sampleRate;
            var g = i * phaseInc;
            
            var sample = evaluateEquation(eq1, p, w, u, t, g);
            
            if (eq2) {
                var s2 = evaluateEquation(eq2, p, w, u, t, g);
                sample = sample * (1 - mix) + s2 * mix;
            }
            
            samples[i] = Math.max(-1, Math.min(1, sample));
            
            phase += phaseInc;
            if (phase >= 1) phase -= 1;
        }
        
        // Create WAV file
        var wav = createWAV(samples, sampleRate);
        var blob = new Blob([wav], { type: 'audio/wav' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'wave-synth.wav';
        a.click();
        URL.revokeObjectURL(a.href);
    }
    
    function createWAV(samples, sampleRate) {
        var buffer = new ArrayBuffer(44 + samples.length * 2);
        var view = new DataView(buffer);
        
        // RIFF header
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        writeString(view, 8, 'WAVE');
        
        // fmt chunk
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM
        view.setUint16(22, 1, true); // Mono
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        
        // data chunk
        writeString(view, 36, 'data');
        view.setUint32(40, samples.length * 2, true);
        
        // Samples
        for (var i = 0; i < samples.length; i++) {
            var s = Math.max(-1, Math.min(1, samples[i]));
            view.setInt16(44 + i * 2, s * 0x7FFF, true);
        }
        
        return buffer;
    }
    
    function writeString(view, offset, string) {
        for (var i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
    
    function copyEquation(toolInstance) {
        var values = toolInstance.getValues();
        var eq = values.eq1 || '';
        navigator.clipboard.writeText(eq).then(function() {
            alert('Equation copied to clipboard');
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function wireButton(tool, key, callback) {
        var btn = tool.getComponent(key);
        if (btn && btn.element) {
            btn.element.addEventListener('click', callback);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════════════════

export class WaveEquationSynthTool {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = {
            ComponentLibrary,
            ...deps
        };
        this.tool = null;
        this.render();
    }
    
    render() {
        try {
            
            
            this.tool = new ToolBase(TOOL_CONFIG, this.deps);
            this.tool.mount(this.container);
            this.tool.draw();
            
            window.debugLog('TOOLS', '✅ WaveEquationSynthTool rendered');
        } catch (error) {
            console.error('❌ WaveEquationSynthTool error:', error);
            this.container.innerHTML = 
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>WAVE EQUATION SYNTH ERROR</h2>' +
                '<p style="color: red;">' + error.message + '</p>' +
                '</div>';
        }
    }
    
    destroy() {
        // Stop audio
        if (this.tool) {
            stopAudio(this.tool);
            
            if (this.tool.audioContext) {
                this.tool.audioContext.close();
                this.tool.audioContext = null;
            }
        }
        
        if (audioAnimator) {
            audioAnimator.destroy();
            audioAnimator = null;
        }
        
        analyser = null;
        dataArray = null;
        
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    }
}

// Export as default for tools_section.js
export default WaveEquationSynthTool;

window.debugLog('TOOLS', '✅ WaveEquationSynthTool loaded (ES Module)');

