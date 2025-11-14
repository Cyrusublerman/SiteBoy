/**
 * Lissajous Animation - Parametric Harmonic Curves
 * Refactored for SiteBoy Framework
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';

    class LissajousAnimation {
        constructor(containerElement, options = {}) {
            this.container = containerElement;
            this.options = {
                width: options.width || 600,
                height: options.height || 600,
                points: options.points || 20000,
                ...options
            };
            
            this.canvas = null;
            this.ctx = null;
            this.isRunning = false;
            this.animationId = null;
            
            // Animation state
            this.state = {
                Ax1: 1, wx1: 1, px1: 1, phi_x1: 0,
                Ax2: 0, wx2: 1, px2: 1, phi_x2: 0,
                Mx: 0, wxm1: 0, pxm1: 1, phi_xm1: 0, wxm2: 0, pxm2: 1, phi_xm2: 0,
                Ay1_delta: 0, wy1_delta: 0, py1_delta: 0, phi_y1_delta: 0,
                Ay2_delta: 0, wy2_delta: 0, py2_delta: 0, phi_y2_delta: 0,
                My_delta: 0, wym1_delta: 0, pym1_delta: 0, phi_ym1_delta: 0,
                wym2_delta: 0, pym2_delta: 0, phi_ym2_delta: 0
            };
            
            this.varSequence = [
                { name: 'Ax1', type: 'A' }, { name: 'wx1', type: 'w' }, { name: 'px1', type: 'p' }, { name: 'phi_x1', type: 'phi' },
                { name: 'Ax2', type: 'A' }, { name: 'wx2', type: 'w' }, { name: 'px2', type: 'p' }, { name: 'phi_x2', type: 'phi' },
                { name: 'Mx', type: 'M' }, { name: 'wxm1', type: 'w' }, { name: 'pxm1', type: 'p' }, { name: 'phi_xm1', type: 'phi' },
                { name: 'wxm2', type: 'w' }, { name: 'pxm2', type: 'p' }, { name: 'phi_xm2', type: 'phi' },
                { name: 'Ay1_delta', type: 'A' }, { name: 'wy1_delta', type: 'w' }, { name: 'py1_delta', type: 'p' }, { name: 'phi_y1_delta', type: 'phi' },
                { name: 'Ay2_delta', type: 'A' }, { name: 'wy2_delta', type: 'w' }, { name: 'py2_delta', type: 'p' }, { name: 'phi_y2_delta', type: 'phi' },
                { name: 'My_delta', type: 'M' }, { name: 'wym1_delta', type: 'w' }, { name: 'pym1_delta', type: 'p' }, { name: 'phi_ym1_delta', type: 'phi' },
                { name: 'wym2_delta', type: 'w' }, { name: 'pym2_delta', type: 'p' }, { name: 'phi_ym2_delta', type: 'phi' }
            ];
            
            this.RULES = {
                A: { min: -1, max: 1, step: 0.02 },
                w: { min: -250, max: 250, step: 1 },
                p: { min: 0, max: 5, step: 1 },
                phi: { min: -2, max: 2, step: 0.1 },
                M: { min: -1, max: 1, step: 0.02 }
            };
            
            this.varIndex = 0;
            this.currentVar = null;
            this.targetValue = 0;
            this.animating = false;
            
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
            this.ctx = this.canvas.getContext('2d');
            
            // Append to container
            this.container.appendChild(this.canvas);
        }

        safePow(base, exp) {
            if (Math.abs(base) < 1e-9 && exp < 0) return 0;
            return Math.sign(base) * Math.pow(Math.abs(base), exp);
        }

        evaluate(t) {
            const s = this.state;
            const x = s.Ax1 * this.safePow(Math.cos(s.wx1 * t + s.phi_x1 * Math.PI), s.px1) +
                      s.Ax2 * this.safePow(Math.cos(s.wx2 * t + s.phi_x2 * Math.PI), s.px2) +
                      s.Mx * this.safePow(Math.cos(s.wxm1 * t + s.phi_xm1 * Math.PI), s.pxm1) *
                             this.safePow(Math.sin(s.wxm2 * t + s.phi_xm2 * Math.PI), s.pxm2);
            
            const Ay1 = s.Ax1 + s.Ay1_delta;
            const wy1 = s.wx1 + s.wy1_delta;
            const py1 = s.px1 + s.py1_delta;
            const phi_y1 = s.phi_x1 + s.phi_y1_delta;
            
            const Ay2 = s.Ax2 + s.Ay2_delta;
            const wy2 = s.wx2 + s.wy2_delta;
            const py2 = s.px2 + s.py2_delta;
            const phi_y2 = s.phi_x2 + s.phi_y2_delta;
            
            const My = s.Mx + s.My_delta;
            const wym1 = s.wxm1 + s.wym1_delta;
            const pym1 = s.pym1;
            const phi_ym1 = s.phi_xm1 + s.phi_ym1_delta;
            const wym2 = s.wxm2 + s.wym2_delta;
            const pym2 = s.pym2;
            const phi_ym2 = s.phi_xm2 + s.phi_ym2_delta;
            
            const y = Ay1 * this.safePow(Math.sin(wy1 * t + phi_y1 * Math.PI), py1) +
                      Ay2 * this.safePow(Math.sin(wy2 * t + phi_y2 * Math.PI), py2) +
                      My * this.safePow(Math.sin(wym1 * t + phi_ym1 * Math.PI), pym1) *
                           this.safePow(Math.cos(wym2 * t + phi_ym2 * Math.PI), pym2);
            
            return { x, y };
        }

        draw() {
            const SIZE = this.canvas.width;
            const SCALE = SIZE * 0.75;
            const CENTER = SIZE / 2;
            
            // Clear
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, SIZE, SIZE);
            
            // Draw curve
            this.ctx.strokeStyle = '#c0c0c0';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            
            let started = false;
            let firstPoint = null;
            
            for (let i = 0; i <= this.options.points; i++) {
                const t = (i / this.options.points) * 2 * Math.PI;
                const { x, y } = this.evaluate(t);
                
                if (!isFinite(x) || !isFinite(y)) {
                    started = false;
                    continue;
                }
                
                const screenX = CENTER + x * SCALE;
                const screenY = CENTER - y * SCALE;
                
                if (!started) {
                    this.ctx.moveTo(screenX, screenY);
                    firstPoint = { x: screenX, y: screenY };
                    started = true;
                } else {
                    this.ctx.lineTo(screenX, screenY);
                }
            }
            
            if (firstPoint && started) {
                this.ctx.lineTo(firstPoint.x, firstPoint.y);
            }
            
            this.ctx.stroke();
        }

        getRandomTarget(varName, type) {
            const rule = this.RULES[type];
            const range = rule.max - rule.min;
            const steps = Math.floor(range / rule.step);
            const value = rule.min + Math.floor(Math.random() * (steps + 1)) * rule.step;
            return value;
        }

        updateVariable() {
            if (!this.animating) {
                const varInfo = this.varSequence[this.varIndex];
                this.currentVar = varInfo.name;
                this.targetValue = this.getRandomTarget(varInfo.name, varInfo.type);
                this.animating = true;
            }
            
            const varInfo = this.varSequence[this.varIndex];
            const rule = this.RULES[varInfo.type];
            const current = this.state[this.currentVar];
            const diff = this.targetValue - current;
            
            if (Math.abs(diff) < rule.step) {
                this.state[this.currentVar] = this.targetValue;
                this.animating = false;
                this.varIndex = (this.varIndex + 1) % this.varSequence.length;
            } else {
                const direction = diff > 0 ? 1 : -1;
                this.state[this.currentVar] += direction * rule.step;
            }
        }

        start() {
            if (this.isRunning) return;
            this.isRunning = true;
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
            this.updateVariable();
            this.draw();
            this.animationId = requestAnimationFrame(() => this.animate());
        }

        destroy() {
            this.stop();
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
            this.canvas = null;
            this.ctx = null;
        }
    }

    // Export to window
    window.LissajousAnimation = LissajousAnimation;
    console.log('〰️ Lissajous Animation loaded');
})();






