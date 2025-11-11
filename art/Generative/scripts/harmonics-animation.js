/**
 * Harmonics Animation - Musical Interval Visualization
 * Refactored for SiteBoy Framework
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';

    class HarmonicsAnimation {
        constructor(containerElement, options = {}) {
            this.container = containerElement;
            this.options = {
                width: options.width || 600,
                height: options.height || 600,
                passDuration: options.passDuration || 90, // seconds
                motionBlurAlpha: options.motionBlurAlpha || 0.05,
                ...options
            };
            
            this.canvas = null;
            this.ctx = null;
            this.isRunning = false;
            this.animationId = null;
            this.startTime = null;
            
            this.intervals = [
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
            
            this.views = ['lateralClosed', 'counterCurrent', 'lateralOpen', 'concurrent'];
            this.totalCycleDuration = 720; // 12 minutes total
            
            this.init();
        }

        init() {
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.options.width;
            this.canvas.height = this.options.height;
            this.canvas.style.cssText = `
                display: block;
                width: 100%;
                height: auto;
                border: 1px solid var(--c-border);
                background: var(--c-bg);
            `;
            this.ctx = this.canvas.getContext('2d', { 
                alpha: false,
                desynchronized: true
            });
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
            
            // Create info display
            this.createInfoDisplay();
            
            // Append to container
            this.container.appendChild(this.canvas);
        }

        createInfoDisplay() {
            const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
            
            this.infoEl = document.createElement('div');
            this.infoEl.style.cssText = `
                margin-top: ${F}px;
                padding: ${F}px;
                border: 1px solid var(--c-border);
                background: var(--c-bg);
                color: var(--c-text);
                font-family: 'Space Mono', monospace;
                font-size: ${F}px;
                text-align: center;
            `;
            this.infoEl.textContent = 'Ratio: 1:1';
            
            this.container.appendChild(this.infoEl);
        }

        timeWarp(x) {
            const numIntervals = this.intervals.length - 1;
            const scaledProgress = x * numIntervals;
            const currentInterval = Math.floor(scaledProgress);
            const localProgress = scaledProgress - currentInterval;
            
            const smoothstep = (t) => t * t * (3 - 2 * t);
            let eased = smoothstep(localProgress);
            eased = smoothstep(eased);
            
            return (currentInterval + eased) / numIntervals;
        }

        getCoordinates(t, ratio, view, scale, baseRadius) {
            const [a, b] = ratio;
            
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
                    const r1 = baseRadius * (1 + 0.6 * Math.sin(b * t));
                    const angle1 = a * t;
                    return {
                        x: r1 * Math.cos(angle1),
                        y: r1 * Math.sin(angle1)
                    };
                
                case 'counterCurrent':
                    const r2 = baseRadius * (1 + 0.6 * Math.sin(b * t));
                    const angle2 = a * t - b * t;
                    return {
                        x: r2 * Math.cos(angle2),
                        y: r2 * Math.sin(angle2)
                    };
                
                default:
                    return { x: 0, y: 0 };
            }
        }

        drawUnifiedPattern(ratio, currentView, nextView, viewT) {
            const w = this.canvas.width;
            const h = this.canvas.height;
            const cx = w / 2;
            const cy = h / 2;
            
            // Motion blur effect
            this.ctx.fillStyle = `rgba(0, 0, 0, ${this.options.motionBlurAlpha})`;
            this.ctx.fillRect(0, 0, w, h);
            
            const points = 800;
            const scale = Math.min(w, h) * 0.35;
            const baseRadius = scale * 0.7;
            
            this.ctx.fillStyle = '#c0c0c0';
            
            const cycles = Math.max(2, Math.ceil(Math.max(ratio[0], ratio[1])) * 2);
            
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2 * cycles;
                
                const current = this.getCoordinates(angle, ratio, currentView, scale, baseRadius);
                const next = this.getCoordinates(angle, ratio, nextView, scale, baseRadius);
                
                const x = cx + current.x * (1 - viewT) + next.x * viewT;
                const y = cy + current.y * (1 - viewT) + next.y * viewT;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, 1, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        draw() {
            const elapsed = (Date.now() - this.startTime) / 1000;
            const cycleTime = elapsed % this.totalCycleDuration;
            
            const passIndex = Math.floor(cycleTime / this.options.passDuration);
            const timeInPass = cycleTime % this.options.passDuration;
            
            const isAscending = passIndex % 2 === 0;
            const isTransitioning = !isAscending;
            
            const viewSegment = Math.floor(passIndex / 2);
            const currentViewIndex = viewSegment % this.views.length;
            const nextViewIndex = (viewSegment + 1) % this.views.length;
            
            const linearProgress = timeInPass / this.options.passDuration;
            const warpedProgress = this.timeWarp(linearProgress);
            
            let ratioProgress;
            if (isAscending) {
                ratioProgress = warpedProgress * (this.intervals.length - 1);
            } else {
                ratioProgress = (this.intervals.length - 1) * (1 - warpedProgress);
            }
            
            const viewProgress = isTransitioning ? warpedProgress : 0;
            
            const ratioIndex = Math.floor(ratioProgress);
            const ratioT = ratioProgress - ratioIndex;
            
            const safeRatioIndex = Math.min(Math.max(ratioIndex, 0), this.intervals.length - 1);
            const safeNextRatioIndex = Math.min(Math.max(ratioIndex + 1, 0), this.intervals.length - 1);
            
            const currentRatio = [
                this.intervals[safeRatioIndex][0] + (this.intervals[safeNextRatioIndex][0] - this.intervals[safeRatioIndex][0]) * ratioT,
                this.intervals[safeRatioIndex][1] + (this.intervals[safeNextRatioIndex][1] - this.intervals[safeRatioIndex][1]) * ratioT
            ];
            
            // Update display
            this.infoEl.textContent = `Ratio: ${currentRatio[0].toFixed(2)}:${currentRatio[1].toFixed(2)}`;
            
            // Draw pattern
            this.drawUnifiedPattern(
                currentRatio,
                this.views[currentViewIndex],
                this.views[nextViewIndex],
                viewProgress
            );
        }

        start() {
            if (this.isRunning) return;
            this.isRunning = true;
            this.startTime = Date.now();
            this.animate();
        }

        stop() {
            this.isRunning = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }

        animate() {
            if (!this.isRunning) return;
            this.draw();
            this.animationId = requestAnimationFrame(() => this.animate());
        }

        destroy() {
            this.stop();
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
            if (this.infoEl && this.infoEl.parentNode) {
                this.infoEl.parentNode.removeChild(this.infoEl);
            }
            this.canvas = null;
            this.ctx = null;
            this.infoEl = null;
        }
    }

    // Export to window
    window.HarmonicsAnimation = HarmonicsAnimation;
    console.log('🎵 Harmonics Animation loaded');
})();

