/**
 * Cymatics Animation - Wave Interference Patterns (Visual Only)
 * Refactored for SiteBoy Framework
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';

    class WaveSource {
        constructor(x, y, freq, amp) {
            this.x = x;
            this.y = y;
            this.freq = freq;
            this.amp = amp;
        }

        getWave(px, py, t) {
            const dx = px - this.x;
            const dy = py - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const w = 2 * Math.PI / this.freq;
            return this.amp * Math.sin(w * dist - t);
        }

        getDisplacement(px, py, t) {
            const dx = px - this.x;
            const dy = py - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const wave = this.getWave(px, py, t);
            return { 
                x: (dx / dist) * wave,
                y: (dy / dist) * wave
            };
        }
    }

    class CymaticsAnimation {
        constructor(containerElement, options = {}) {
            this.container = containerElement;
            this.options = {
                width: options.width || 600,
                height: options.height || 600,
                speed: options.speed || 0.1,
                initialPattern: options.initialPattern || 'triangle',
                ...options
            };
            
            this.canvas = null;
            this.ctx = null;
            this.sources = [];
            this.particles = [];
            this.t = 0;
            this.isRunning = false;
            this.animationId = null;
            this.vizMode = 'particle';
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
                cursor: crosshair;
            `;
            this.ctx = this.canvas.getContext('2d');
            
            // Initialize particles
            this.initParticles();
            
            // Setup initial pattern
            this.setupPattern(this.options.initialPattern);
            
            // Canvas click handler
            this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
            
            // Create controls
            this.createControls();
            
            // Append to container
            this.container.appendChild(this.canvas);
        }

        initParticles() {
            this.particles = [];
            for (let y = 0; y < this.canvas.height; y += 5) {
                for (let x = 0; x < this.canvas.width; x += 5) {
                    this.particles.push({ x, y, ox: x, oy: y });
                }
            }
        }

        setupPattern(pattern) {
            this.sources = [];
            const W = this.canvas.width;
            const H = this.canvas.height;
            const cx = W / 2;
            const cy = H / 2;
            
            if (pattern === 'triangle') {
                this.sources.push(new WaveSource(cx, H * 0.25, 50, 8));
                this.sources.push(new WaveSource(W * 0.25, H * 0.75, 50, 8));
                this.sources.push(new WaveSource(W * 0.75, H * 0.75, 50, 8));
            } else if (pattern === 'square') {
                this.sources.push(new WaveSource(W * 0.25, H * 0.25, 50, 8));
                this.sources.push(new WaveSource(W * 0.75, H * 0.25, 50, 8));
                this.sources.push(new WaveSource(W * 0.25, H * 0.75, 50, 8));
                this.sources.push(new WaveSource(W * 0.75, H * 0.75, 50, 8));
            } else if (pattern === 'circle') {
                const radius = Math.min(W, H) * 0.3;
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    this.sources.push(new WaveSource(
                        cx + Math.cos(angle) * radius,
                        cy + Math.sin(angle) * radius,
                        50,
                        8
                    ));
                }
            }
        }

        handleCanvasClick(e) {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            this.sources.push(new WaveSource(x, y, 50, 8));
        }

        createControls() {
            const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
            
            const controlsContainer = document.createElement('div');
            controlsContainer.style.cssText = `
                display: flex;
                gap: 1px;
                margin-top: ${F}px;
                border: 1px solid var(--c-border);
            `;
            
            const patterns = ['TRIANGLE', 'SQUARE', 'CIRCLE', 'CLEAR'];
            
            patterns.forEach((label) => {
                const btn = document.createElement('button');
                btn.textContent = label;
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
                
                btn.addEventListener('click', () => {
                    if (label === 'CLEAR') {
                        this.sources = [];
                    } else {
                        this.setupPattern(label.toLowerCase());
                    }
                });
                
                btn.addEventListener('mouseenter', () => {
                    btn.style.background = 'var(--c-text)';
                    btn.style.color = 'var(--c-bg)';
                });
                
                btn.addEventListener('mouseleave', () => {
                    btn.style.background = 'var(--c-bg)';
                    btn.style.color = 'var(--c-text)';
                });
                
                controlsContainer.appendChild(btn);
                this.controls[label] = btn;
            });
            
            const lastBtn = controlsContainer.lastElementChild;
            if (lastBtn) lastBtn.style.borderRight = 'none';
            
            this.container.appendChild(controlsContainer);
        }

        updateParticles() {
            for (let p of this.particles) {
                let dx = 0, dy = 0;
                for (let s of this.sources) {
                    const d = s.getDisplacement(p.ox, p.oy, this.t);
                    dx += d.x;
                    dy += d.y;
                }
                p.x = p.ox + dx;
                p.y = p.oy + dy;
            }
        }

        draw() {
            // Clear
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Update particles
            this.updateParticles();
            
            // Draw particles
            for (let p of this.particles) {
                const disp = Math.sqrt((p.x - p.ox) ** 2 + (p.y - p.oy) ** 2);
                const alpha = Math.min(disp * 0.15, 1);
                if (alpha > 0.05) {
                    this.ctx.fillStyle = `rgba(192, 192, 192, ${alpha})`;
                    this.ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
                }
            }
            
            // Draw sources
            this.ctx.fillStyle = '#ffffff';
            for (let s of this.sources) {
                this.ctx.beginPath();
                this.ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.t += this.options.speed;
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
            this.sources = [];
            this.particles = [];
            this.controls = {};
        }
    }

    // Export to window
    window.CymaticsAnimation = CymaticsAnimation;
    console.log('🌊 Cymatics Animation loaded');
})();






