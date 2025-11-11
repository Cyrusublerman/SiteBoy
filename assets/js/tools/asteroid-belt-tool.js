/**
 * Asteroid Belt Tool - SiteBoy Framework
 * 
 * Canvas-based asteroid belt visualization with noise pattern
 * Features:
 * - Configurable inner/outer radius
 * - Adjustable particle count
 * - Random black/white noise effect
 * - Real-time parameter controls
 * - VGA aesthetic with F=12px mathematical foundation
 * 
 * @version 2.0.0
 * @dependencies ComponentLibrary, AnimationFoundation
 */

class AsteroidBeltTool {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = deps;
        this.componentInstances = [];
        
        // Tool state - CONFIGURATION
        this.config = {
            asteroidBelt: {
                innerRadius: 2.2,
                outerRadius: 3.2,
                particleCount: 300,
                colors: ['#FFFFFF', '#000000']  // Random mix of black and white for noise effect
            },
            canvas: {
                width: 600,
                height: 600,
                centerX: 300,
                centerY: 300,
                scale: 80  // Scale factor for distances (multiply radius by this)
            },
            animation: {
                enabled: false,
                speed: 0.5
            }
        };
        
        // CONSTANTS
        this.CONSTANTS = {
            TWO_PI: Math.PI * 2
        };
        
        // Asteroid belt data
        this.particles = [];
        this.cached = null;
        this.rotationAngle = 0;
        
        // Animation system - unified approach
        this.animator = null;
        
        // UI elements
        this.canvas = null;
        this.ctx = null;
    }
    
    render() {
        this.destroy();
        const F = this.deps.MF ? this.deps.MF.F : 12;
        
        // Title
        const title = document.createElement('h1');
        title.textContent = 'ASTEROID BELT VISUALIZER';
        title.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 2}px;
            color: var(--c-text);
            margin: 0 0 ${F}px 0;
            text-transform: uppercase;
        `;
        this.container.appendChild(title);
        
        // Main layout container
        const mainContainer = document.createElement('div');
        mainContainer.style.cssText = `
            display: grid; 
            grid-template-columns: ${F * 36}px 1fr; 
            gap: ${F}px;
            border: 1px solid var(--c-border);
        `;
        
        // Controls column
        const controls = document.createElement('div');
        controls.className = 'asteroid-controls';
        controls.style.cssText = `
            background: var(--c-bg);
        `;
        
        // Canvas section
        const canvasBox = this.createCanvasSection(F);
        
        mainContainer.appendChild(controls);
        mainContainer.appendChild(canvasBox);
        this.container.appendChild(mainContainer);
        
        // Create all control sections
        this.createAllSections(controls, F);
        
        // Initialize animation system
        this.initializeAnimator();
        
        // Generate initial particles and draw
        this.generate();
        this.draw();
        
        // Add responsive styles
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 1023px) {
                .asteroid-belt-container {
                    grid-template-columns: 1fr !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    createAllSections(controls, F) {
        const makeBox = (titleText) => {
            const box = document.createElement('div');
            box.style.cssText = `
                border-bottom: 1px solid var(--c-border); 
                background: var(--c-bg); 
                padding: ${F}px;
            `;
            
            const h = document.createElement('div');
            h.textContent = titleText;
            h.style.cssText = `
                font-weight: bold; 
                margin-bottom: ${F}px;
                font-family: 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F}px;
                text-transform: uppercase;
            `;
            box.appendChild(h);
            return box;
        };
        
        // Asteroid Belt Configuration
        this.createBeltSection(makeBox, controls, F);
        
        // Canvas Configuration
        this.createCanvasConfigSection(makeBox, controls, F);
        
        // Animation Controls
        this.createAnimationSection(makeBox, controls, F);
        
        // Action buttons
        this.createActionButtons(controls, F);
    }
    
    createBeltSection(makeBox, controls, F) {
        const box = makeBox('ASTEROID BELT');
        
        // Inner Radius
        const innerRadiusControl = this.createSlider(
            'INNER RADIUS', 
            0.5, 
            5.0, 
            0.1, 
            this.config.asteroidBelt.innerRadius,
            (val) => {
                this.config.asteroidBelt.innerRadius = parseFloat(val);
                this.generate();
                this.draw();
            },
            F
        );
        box.appendChild(innerRadiusControl);
        
        // Outer Radius
        const outerRadiusControl = this.createSlider(
            'OUTER RADIUS', 
            1.0, 
            8.0, 
            0.1, 
            this.config.asteroidBelt.outerRadius,
            (val) => {
                this.config.asteroidBelt.outerRadius = parseFloat(val);
                this.generate();
                this.draw();
            },
            F
        );
        box.appendChild(outerRadiusControl);
        
        // Particle Count
        const particleCountControl = this.createSlider(
            'PARTICLE COUNT', 
            50, 
            2000, 
            50, 
            this.config.asteroidBelt.particleCount,
            (val) => {
                this.config.asteroidBelt.particleCount = parseInt(val);
                this.generate();
                this.draw();
            },
            F
        );
        box.appendChild(particleCountControl);
        
        controls.appendChild(box);
    }
    
    createCanvasConfigSection(makeBox, controls, F) {
        const box = makeBox('CANVAS SETTINGS');
        
        // Scale
        const scaleControl = this.createSlider(
            'SCALE', 
            20, 
            200, 
            10, 
            this.config.canvas.scale,
            (val) => {
                this.config.canvas.scale = parseInt(val);
                this.draw();
            },
            F
        );
        box.appendChild(scaleControl);
        
        controls.appendChild(box);
    }
    
    createAnimationSection(makeBox, controls, F) {
        const box = makeBox('ANIMATION');
        
        // Animation toggle
        const toggleRow = document.createElement('div');
        toggleRow.style.cssText = `
            display: flex; 
            align-items: center; 
            gap: ${F}px; 
            margin-bottom: ${F}px;
        `;
        
        const toggleLabel = document.createElement('label');
        toggleLabel.textContent = 'ROTATE:';
        toggleLabel.style.cssText = `
            flex: 1;
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F}px;
        `;
        
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = this.config.animation.enabled ? 'ON' : 'OFF';
        toggleBtn.style.cssText = this.buttonStyle(F);
        toggleBtn.addEventListener('click', () => {
            this.config.animation.enabled = !this.config.animation.enabled;
            toggleBtn.textContent = this.config.animation.enabled ? 'ON' : 'OFF';
            if (this.config.animation.enabled) {
                this.startAnimation();
            } else {
                this.stopAnimation();
            }
        });
        
        toggleRow.appendChild(toggleLabel);
        toggleRow.appendChild(toggleBtn);
        box.appendChild(toggleRow);
        
        // Animation speed
        const speedControl = this.createSlider(
            'SPEED', 
            0.1, 
            5.0, 
            0.1, 
            this.config.animation.speed,
            (val) => {
                this.config.animation.speed = parseFloat(val);
            },
            F
        );
        box.appendChild(speedControl);
        
        controls.appendChild(box);
    }
    
    createSlider(label, min, max, step, value, onChange, F) {
        const container = document.createElement('div');
        container.style.cssText = `margin-bottom: ${F}px;`;
        
        const labelRow = document.createElement('div');
        labelRow.style.cssText = `
            display: flex; 
            justify-content: space-between; 
            margin-bottom: ${Math.floor(F/3)}px;
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F}px;
        `;
        
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        
        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = value;
        valueDisplay.style.cssText = 'color: var(--c-accent);';
        
        labelRow.appendChild(labelEl);
        labelRow.appendChild(valueDisplay);
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = value;
        slider.style.cssText = `width: 100%;`;
        
        slider.addEventListener('input', (e) => {
            valueDisplay.textContent = e.target.value;
            onChange(e.target.value);
        });
        
        container.appendChild(labelRow);
        container.appendChild(slider);
        return container;
    }
    
    createActionButtons(controls, F) {
        const btnRow = document.createElement('div');
        btnRow.style.cssText = `
            display: flex; 
            gap: ${Math.floor(F/2)}px; 
            padding: ${F}px;
            border-top: 1px solid var(--c-border);
        `;
        
        const regenerateBtn = document.createElement('button');
        regenerateBtn.textContent = 'REGENERATE';
        regenerateBtn.style.cssText = this.primaryButtonStyle(F);
        regenerateBtn.addEventListener('click', () => {
            this.generate();
            this.draw();
        });
        
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'CLEAR';
        clearBtn.style.cssText = this.buttonStyle(F);
        clearBtn.addEventListener('click', () => {
            this.particles = [];
            this.cached = null;
            this.draw();
        });
        
        btnRow.appendChild(regenerateBtn);
        btnRow.appendChild(clearBtn);
        controls.appendChild(btnRow);
    }
    
    createCanvasSection(F) {
        const canvasBox = document.createElement('div');
        canvasBox.style.cssText = `
            padding: ${F}px; 
            background: var(--c-bg); 
            display: flex; 
            align-items: center; 
            justify-content: center;
            min-height: ${F * 50}px;
        `;
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.config.canvas.width;
        this.canvas.height = this.config.canvas.height;
        this.canvas.style.cssText = `
            border: 1px solid var(--c-border); 
            background: var(--c-bg);
            image-rendering: pixelated;
        `;
        
        this.ctx = this.canvas.getContext('2d');
        
        canvasBox.appendChild(this.canvas);
        return canvasBox;
    }
    
    // Helper methods for button styles
    buttonStyle(F) {
        return `
            flex: 1 1 auto; 
            border: 1px solid var(--c-border); 
            background: var(--c-bg); 
            color: var(--c-text); 
            cursor: pointer; 
            padding: ${Math.floor(F/2)}px ${F}px;
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F}px;
        `;
    }
    
    primaryButtonStyle(F) {
        return `
            flex: 1 1 auto; 
            border: 1px solid var(--c-text); 
            background: var(--c-text); 
            color: var(--c-bg); 
            cursor: pointer; 
            padding: ${Math.floor(F/2)}px ${F}px; 
            font-weight: bold;
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F}px;
        `;
    }
    
    // ========================================
    // ASTEROID BELT CORE FUNCTIONALITY
    // ========================================
    
    /**
     * Generate random asteroid particles with noise pattern
     * Each particle is randomly black or white for speckled effect
     */
    generate() {
        this.particles = [];
        const colors = this.config.asteroidBelt.colors;
        const innerRadius = this.config.asteroidBelt.innerRadius;
        const outerRadius = this.config.asteroidBelt.outerRadius;
        const particleCount = this.config.asteroidBelt.particleCount;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                angle: Math.random() * this.CONSTANTS.TWO_PI,
                distance: innerRadius + Math.random() * (outerRadius - innerRadius),
                color: colors[Math.floor(Math.random() * colors.length)]  // Random color from array
            });
        }
        this.cached = null;
    }
    
    /**
     * Distance scaling function
     * Converts logical distance to canvas pixels
     */
    scaleFunc(distance) {
        return distance * this.config.canvas.scale;
    }
    
    /**
     * Draw asteroid belt with noise pattern
     * Supports optional rotation for animation
     */
    draw() {
        if (!this.ctx || !this.canvas) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fill background
        this.ctx.fillStyle = 'var(--c-bg)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw center point (sun)
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.beginPath();
        this.ctx.arc(this.config.canvas.centerX, this.config.canvas.centerY, 5, 0, this.CONSTANTS.TWO_PI);
        this.ctx.fill();
        
        // Generate cache if needed
        if (!this.cached) {
            this.cached = [];
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                const scaledDist = this.scaleFunc(p.distance);
                this.cached.push({
                    x: scaledDist * Math.cos(p.angle),
                    y: scaledDist * Math.sin(p.angle),
                    color: p.color  // Store color in cache
                });
            }
        }
        
        // Apply rotation if animating
        const rotation = this.config.animation.enabled ? this.rotationAngle : 0;
        
        // Render each particle with its assigned color
        for (let i = 0; i < this.cached.length; i++) {
            let x = this.cached[i].x;
            let y = this.cached[i].y;
            
            // Apply rotation
            if (rotation !== 0) {
                const cos = Math.cos(rotation);
                const sin = Math.sin(rotation);
                const rotatedX = x * cos - y * sin;
                const rotatedY = x * sin + y * cos;
                x = rotatedX;
                y = rotatedY;
            }
            
            // Translate to center and draw
            const screenX = this.config.canvas.centerX + x;
            const screenY = this.config.canvas.centerY + y;
            
            this.ctx.fillStyle = this.cached[i].color;
            this.ctx.fillRect(screenX - 0.5, screenY - 0.5, 1, 1);
        }
        
        // Draw reference circles (inner and outer radius)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        
        // Inner radius circle
        this.ctx.beginPath();
        this.ctx.arc(
            this.config.canvas.centerX, 
            this.config.canvas.centerY, 
            this.scaleFunc(this.config.asteroidBelt.innerRadius), 
            0, 
            this.CONSTANTS.TWO_PI
        );
        this.ctx.stroke();
        
        // Outer radius circle
        this.ctx.beginPath();
        this.ctx.arc(
            this.config.canvas.centerX, 
            this.config.canvas.centerY, 
            this.scaleFunc(this.config.asteroidBelt.outerRadius), 
            0, 
            this.CONSTANTS.TWO_PI
        );
        this.ctx.stroke();
    }
    
    /**
     * Initialize unified animation system
     */
    initializeAnimator() {
        // Use AnimationLoop for smooth requestAnimationFrame-based rotation
        this.animator = new window.AnimationFoundation.AnimationLoop({
            onFrame: (deltaTime) => {
                // Update rotation based on speed and deltaTime
                this.rotationAngle += this.config.animation.speed * 0.01 * (deltaTime / 16.67);
                this.draw();
            },
            fps: 60 // Smooth 60fps rotation
        });
    }
    
    /**
     * Start animation loop
     */
    startAnimation() {
        if (this.animator) {
            this.animator.start();
        }
    }
    
    /**
     * Stop animation loop
     */
    stopAnimation() {
        if (this.animator) {
            this.animator.stop();
        }
    }
    
    // Cleanup
    destroy() {
        // Destroy animator first (unified cleanup)
        if (this.animator) {
            this.animator.destroy();
            this.animator = null;
        }
        
        for (const instance of this.componentInstances) {
            if (instance && typeof instance.destroy === 'function') {
                instance.destroy();
            }
        }
        this.componentInstances = [];
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.cached = null;
    }
}

// Export for window global access
window.AsteroidBeltTool = AsteroidBeltTool;

console.log('🌌 Asteroid Belt Tool loaded');

