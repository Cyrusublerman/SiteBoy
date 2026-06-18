/**
 * Harmonics Animation Tool - ToolBase Implementation
 * Musical intervals as Lissajous patterns - 12 minute cycle
 * 
 * @version 1.0.0 - ToolBase Refactor
 */

// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { AnimationLoop } from '../../core/animation-foundation.js';

// Animation state
    let startTime = null;
    let animator = null;
    let passDuration = 90;
    let totalCycleDuration = 720;
    
    // Musical intervals
    const intervals = [
        [1, 1],      // unison
        [16, 15],    // minor second
        [9, 8],      // major second
        [6, 5],      // minor third
        [5, 4],      // major third
        [4, 3],      // perfect fourth
        [45, 32],    // tritone
        [3, 2],      // perfect fifth
        [8, 5],      // minor sixth
        [5, 3],      // major sixth
        [9, 5],      // minor seventh
        [15, 8],     // major seventh
        [2, 1]       // octave
    ];
    
    const views = ['lateralClosed', 'counterCurrent', 'lateralOpen', 'concurrent'];
    
    // ToolBase configuration
    const TOOL_CONFIG = {
        title: 'MUSICAL HARMONICS',
        
        // Animation export config: 12-minute (720s) cycle, 8 passes of 90s each
        animation: {
            type: 'loop',
            loopDuration: 720,  // 12 minutes in seconds
            loopFrames: 720 * 60,  // 43200 frames at 60fps
            defaultFps: 60,
            canPrerender: true
        },
        
        sidebar: [
            ['CONTROLS', [
                ['Display', [
                    ['label', 'Ratio: 1:1', { key: 'ratioDisplay', variant: 'heading' }],
                    ['slider', 'Motion Blur', 0.01, 0.2, 0.01, { 
                        key: 'motionBlur', 
                        value: 0.05, 
                        precision: 2,
                        withNumber: true 
                    }],
                ]],
                ['Timing', [
                    ['slider', 'Pass Duration', 30, 180, 10, { 
                        key: 'passDuration', 
                        value: 90, 
                        withNumber: true 
                    }],
                    ['label', 'Full cycle: 12 minutes', { key: 'cycleInfo', variant: 'caption' }],
                ]],
                ['Actions', [
                    ['button', 'Reset Animation', null, { key: 'resetAnimation' }],
                ]],
            ]],
            // CANVAS tab auto-injected by ToolBase
        ],
        
        canvas: {
            width: 800,
            height: 800,
            showControls: true,
            motionBlur: 0.05  // Use ToolBase motion blur (applied before onDraw)
        },
        
        onInit: function(values) {
            const self = this;
            startTime = Date.now();
            
            // Wire reset button
            const resetBtn = this.getComponent('resetAnimation');
            if (resetBtn && resetBtn.element) {
                resetBtn.element.addEventListener('click', function() {
                    startTime = Date.now();
                    self.setStatus('Animation reset');
                });
            }
            
            // Start animation loop
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
            // Only handle tool-specific controls - ToolBase handles canvas controls
            switch(key) {
                case 'motionBlur':
                    // Update ToolBase motionBlur property (applied automatically in draw())
                    this.motionBlur = parseFloat(value) || 0.05;
                    break;
                    
                case 'passDuration':
                    passDuration = parseInt(value) || 90;
                    totalCycleDuration = passDuration * 8; // 8 passes per cycle
                    break;
            }
        },
        
        // Pre-render support: render a specific frame for animation export
        onRenderFrame: function(frameIndex, totalFrames) {
            // Calculate what time this frame represents
            const frameTime = (frameIndex / totalFrames) * totalCycleDuration;
            // Temporarily set startTime so elapsed time equals frameTime
            const originalStartTime = startTime;
            startTime = Date.now() - (frameTime * 1000);
            this.draw();
            startTime = originalStartTime;
        },
        
        onDraw: function(ctx, canvas, values) {
            const elapsed = (Date.now() - startTime) / 1000;
            const cycleTime = elapsed % totalCycleDuration;
            
            const passIndex = Math.floor(cycleTime / passDuration);
            const timeInPass = cycleTime % passDuration;
            
            const isAscending = passIndex % 2 === 0;
            const isTransitioning = !isAscending;
            
            const viewSegment = Math.floor(passIndex / 2);
            const currentViewIndex = viewSegment % views.length;
            const nextViewIndex = (viewSegment + 1) % views.length;
            
            const linearProgress = timeInPass / passDuration;
            const warpedProgress = timeWarp(linearProgress);
            
            let ratioProgress;
            if (isAscending) {
                ratioProgress = warpedProgress * (intervals.length - 1);
            } else {
                ratioProgress = (intervals.length - 1) * (1 - warpedProgress);
            }
            
            const viewProgress = isTransitioning ? warpedProgress : 0;
            
            const ratioIndex = Math.floor(ratioProgress);
            const ratioT = ratioProgress - ratioIndex;
            
            const safeRatioIndex = Math.min(Math.max(ratioIndex, 0), intervals.length - 1);
            const safeNextRatioIndex = Math.min(Math.max(ratioIndex + 1, 0), intervals.length - 1);
            
            const currentRatio = [
                intervals[safeRatioIndex][0] + (intervals[safeNextRatioIndex][0] - intervals[safeRatioIndex][0]) * ratioT,
                intervals[safeRatioIndex][1] + (intervals[safeNextRatioIndex][1] - intervals[safeRatioIndex][1]) * ratioT
            ];
            
            // Update ratio display
            const ratioLabel = this.getComponent('ratioDisplay');
            if (ratioLabel && ratioLabel.element) {
                ratioLabel.element.textContent = 'Ratio: ' + currentRatio[0].toFixed(2) + ':' + currentRatio[1].toFixed(2);
            }
            
            // Motion blur is now handled automatically by ToolBase (before onDraw is called)
            
            // Draw pattern
            const w = canvas.width;
            const h = canvas.height;
            const cx = w / 2;
            const cy = h / 2;
            const scale = Math.min(w, h) * 0.35;
            const baseRadius = scale * 0.7;
            const points = 800;
            const cycles = Math.max(2, Math.ceil(Math.max(currentRatio[0], currentRatio[1])) * 2);
            
            ctx.fillStyle = '#c0c0c0';
            
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2 * cycles;
                
                const current = getCoordinates(angle, currentRatio, views[currentViewIndex], scale, baseRadius);
                const next = getCoordinates(angle, currentRatio, views[nextViewIndex], scale, baseRadius);
                
                const x = cx + current.x * (1 - viewProgress) + next.x * viewProgress;
                const y = cy + current.y * (1 - viewProgress) + next.y * viewProgress;
                
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    };
    
    function timeWarp(x) {
        const numIntervals = intervals.length - 1;
        const scaledProgress = x * numIntervals;
        const currentInterval = Math.floor(scaledProgress);
        const localProgress = scaledProgress - currentInterval;
        
        const smoothstep = function(t) { return t * t * (3 - 2 * t); };
        let eased = smoothstep(localProgress);
        eased = smoothstep(eased);
        
        return (currentInterval + eased) / numIntervals;
    }
    
    function getCoordinates(t, ratio, view, scale, baseRadius) {
        const a = ratio[0];
        const b = ratio[1];
        
        if (!isFinite(a) || !isFinite(b) || !isFinite(t)) {
            return { x: 0, y: 0 };
        }
        
        switch(view) {
            case 'lateralOpen':
                return {
                    x: scale * Math.sin(a * t),
                    y: scale * Math.sin(b * t)
                };
            
            case 'lateralClosed':
                return {
                    x: scale * Math.cos(a * t),
                    y: scale * Math.sin(b * t)
                };
            
            case 'concurrent':
                var r1 = baseRadius * (1 + 0.6 * Math.sin(b * t));
                var angle1 = a * t;
                return {
                    x: r1 * Math.cos(angle1),
                    y: r1 * Math.sin(angle1)
                };
            
            case 'counterCurrent':
                var r2 = baseRadius * (1 + 0.6 * Math.sin(b * t));
                var angle2 = a * t - b * t;
                return {
                    x: r2 * Math.cos(angle2),
                    y: r2 * Math.sin(angle2)
                };
            
            default:
                return { x: 0, y: 0 };
        }
    }
    
    /**
     * HarmonicsTool wrapper class
     */
    function HarmonicsTool(container, deps) {
        this.container = container;
        this.deps = {
            ComponentLibrary,
            ...(deps || {})
        };
        this.tool = null;
        this.render();
    }
    
    HarmonicsTool.prototype.render = function() {
        try {
            this.tool = new ToolBase(TOOL_CONFIG, this.deps);
            this.tool.mount(this.container);
            this.tool.draw();
            window.debugLog('TOOLS', '✅ HarmonicsTool rendered');
        } catch (error) {
            console.error('❌ HarmonicsTool error:', error);
            this.container.innerHTML =
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>HARMONICS TOOL ERROR</h2>' +
                '<p style="color: red;">' + error.message + '</p>' +
                '</div>';
        }
    };
    
    HarmonicsTool.prototype.destroy = function() {
        if (animator) {
            animator.destroy();
            animator = null;
        }
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        startTime = null;
    };
    
    // ES Module export
    export { HarmonicsTool };
    export default HarmonicsTool;
    
    // Global compatibility
    if (typeof window !== 'undefined') {
        window.HarmonicsTool = HarmonicsTool;
    }
    
    window.debugLog('TOOLS', '✅ HarmonicsTool loaded (ToolBase)');

