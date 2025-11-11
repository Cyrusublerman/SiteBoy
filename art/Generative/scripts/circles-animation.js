/**
 * Circles Animation - Nested Rolling Circles
 * Refactored for SiteBoy Framework
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';

    class CirclesAnimation {
        constructor(containerElement, options = {}) {
            this.container = containerElement;
            this.options = {
                width: options.width || 600,
                height: options.height || 600,
                numCircles: options.numCircles || 100,
                largestRadius: options.largestRadius || 250,
                cycleFrames: options.cycleFrames || 3600,
                ...options
            };
            
            this.canvas = null;
            this.ctx = null;
            this.frame = 0;
            this.mode = 'lines';
            this.isRunning = false;
            this.animationId = null;
            this.circles = [];
            this.controls = {};
            
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
            this.ctx = this.canvas.getContext('2d', { alpha: false });
            
            // Build circle data with minimum radius protection
            const radiusDecrement = (this.options.largestRadius * 2) / this.options.numCircles;
            const minRadius = 5; // Minimum radius to prevent negative values
            this.circles = Array.from({ length: this.options.numCircles }, (_, i) => {
                const calculatedRadius = this.options.largestRadius - i * radiusDecrement;
                return {
                    radius: Math.max(calculatedRadius, minRadius), // Never go below minRadius
                    parent: i === 0 ? null : i - 1
                };
            }).filter(circle => circle.radius >= minRadius); // Remove circles that would be too small
            
            // Create controls
            this.createControls();
            
            // Append to container
            this.container.appendChild(this.canvas);
        }

        createControls() {
            const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
            
            // Controls container
            const controlsContainer = document.createElement('div');
            controlsContainer.style.cssText = `
                display: flex;
                gap: 1px;
                margin-top: ${F}px;
                border: 1px solid var(--c-border);
            `;
            
            // Mode buttons
            const modes = [
                { id: 'lines', label: 'LINES' },
                { id: 'bw', label: 'B/W' },
                { id: 'gradient', label: 'GRADIENT' }
            ];
            
            modes.forEach(m => {
                const btn = document.createElement('button');
                btn.textContent = m.label;
                btn.style.cssText = `
                    flex: 1;
                    height: ${F * 2}px;
                    background: var(--c-bg);
                    color: var(--c-text);
                    border: none;
                    border-right: 1px solid var(--c-border);
                    font-family: 'Space Mono', monospace;
                    font-size: ${F}px;
                    cursor: pointer;
                    text-transform: uppercase;
                `;
                btn.dataset.mode = m.id;
                
                if (m.id === this.mode) {
                    btn.style.background = 'var(--c-text)';
                    btn.style.color = 'var(--c-bg)';
                }
                
                btn.addEventListener('click', () => {
                    this.mode = m.id;
                    // Update all buttons
                    controlsContainer.querySelectorAll('button').forEach(b => {
                        b.style.background = 'var(--c-bg)';
                        b.style.color = 'var(--c-text)';
                    });
                    btn.style.background = 'var(--c-text)';
                    btn.style.color = 'var(--c-bg)';
                });
                
                btn.addEventListener('mouseenter', () => {
                    if (btn.dataset.mode !== this.mode) {
                        btn.style.background = 'var(--c-text)';
                        btn.style.color = 'var(--c-bg)';
                    }
                });
                
                btn.addEventListener('mouseleave', () => {
                    if (btn.dataset.mode !== this.mode) {
                        btn.style.background = 'var(--c-bg)';
                        btn.style.color = 'var(--c-text)';
                    }
                });
                
                controlsContainer.appendChild(btn);
                this.controls[m.id] = btn;
            });
            
            // Remove border from last button
            const lastBtn = controlsContainer.lastElementChild;
            if (lastBtn) lastBtn.style.borderRight = 'none';
            
            this.container.appendChild(controlsContainer);
        }

        draw() {
            this.frame++;
            
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const cycleFrames = this.options.cycleFrames;
            
            // Clear
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Calculate all transforms
            const transforms = [];
            
            for (let i = 0; i < this.circles.length; i++) {
                const circle = this.circles[i];
                
                if (circle.parent === null) {
                    transforms[i] = { x: centerX, y: centerY, rotation: 0 };
                } else {
                    const parent = this.circles[circle.parent];
                    const parentTransform = transforms[circle.parent];
                    const orbitRadius = parent.radius - circle.radius;
                    const orbitAngle = (this.frame / cycleFrames) * Math.PI * 2;
                    const rollRotation = orbitAngle;
                    
                    const localX = orbitRadius * Math.cos(orbitAngle);
                    const localY = orbitRadius * Math.sin(orbitAngle);
                    const cos = Math.cos(parentTransform.rotation);
                    const sin = Math.sin(parentTransform.rotation);
                    
                    transforms[i] = {
                        x: parentTransform.x + localX * cos - localY * sin,
                        y: parentTransform.y + localX * sin + localY * cos,
                        rotation: parentTransform.rotation + rollRotation
                    };
                }
            }
            
            // Draw based on mode
            this.circles.forEach((circle, i) => {
                const t = transforms[i];
                this.ctx.save();
                this.ctx.translate(t.x, t.y);
                this.ctx.rotate(t.rotation);
                this.ctx.beginPath();
                this.ctx.arc(0, 0, circle.radius, 0, Math.PI * 2);
                
                if (this.mode === 'lines') {
                    this.ctx.strokeStyle = '#c0c0c0';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.stroke();
                } else if (this.mode === 'bw') {
                    const isWhite = i % 2 === 0;
                    if (isWhite) {
                        this.ctx.fillStyle = '#c0c0c0';
                        this.ctx.fill();
                    } else {
                        this.ctx.fillStyle = '#000000';
                        this.ctx.fill();
                        this.ctx.strokeStyle = '#c0c0c0';
                        this.ctx.lineWidth = 1.5;
                        this.ctx.stroke();
                    }
                } else if (this.mode === 'gradient') {
                    this.ctx.fillStyle = 'rgba(192, 192, 192, 0.01)';
                    this.ctx.fill();
                }
                
                this.ctx.restore();
            });
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
            this.circles = [];
            this.controls = {};
        }
    }

    // Export to window
    window.CirclesAnimation = CirclesAnimation;
    console.log('🔵 Circles Animation loaded');
})();



