/**
 * P5.js Integration Component - SiteBoy Framework
 * 
 * Seamless p5.js integration with F=12px VGA/Mono aesthetic
 * Handles styling, loading, and component lifecycle
 * 
 * @version 1.0.0 - VGA/Mono Perfect Integration
 */

import { BaseComponent } from './foundation.js';

/**
 * P5Canvas - Wrapper component for p5.js sketches with SiteBoy styling
 */
export class P5Canvas extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'p5-canvas' }, deps);
        
        this.sketchFunction = options.sketchFunction || this.defaultSketch;
        this.width = options.width || 640;
        this.height = options.height || 640;
        this.containerClass = options.containerClass || 'p5-canvas-container';
        this.p5Instance = null;
        this.canvasId = `p5-canvas-${Math.random().toString(36).substr(2, 9)}`;
        
        // Load p5.js if not already loaded (will be called in render)
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', this.containerClass);
            this.element.id = this.canvasId;
            
            // Apply SiteBoy framework styling
            this.element.style.cssText = `
                border: 1px solid var(--c-border);
                background: var(--c-bg);
                padding: var(--f);
                margin: calc(var(--f) * 2) 0;
                max-width: 100%;
                overflow: hidden;
                box-sizing: border-box;
            `;
            
            // Initialize p5.js when ready
            this.initializeP5();
        }
        return this.element;
    }
    
    static async ensureP5Loaded() {
        if (typeof window.p5 !== 'undefined') {
            console.log('✅ p5.js already loaded');
            return Promise.resolve();
        }
        
        console.log('📦 Loading p5.js library...');
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.2/p5.min.js';
            script.onload = () => {
                console.log('✅ p5.js library loaded successfully');
                resolve();
            };
            script.onerror = (error) => {
                console.error('❌ Failed to load p5.js library:', error);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }
    
    async initializeP5() {
        await P5Canvas.ensureP5Loaded();
        
        if (this.p5Instance) {
            this.p5Instance.remove();
        }
        
        // Create p5.js instance with SiteBoy styling integration
        this.p5Instance = new p5((p) => {
            this.setupP5Sketch(p);
        }, this.canvasId);
    }
    
    setupP5Sketch(p) {
        // Inject SiteBoy CSS variables and styling helpers
        const siteboy = this.createSiteBoyHelpers(p);
        
        // Call the user's sketch function with SiteBoy integration
        this.sketchFunction(p, siteboy);
    }
    
    createSiteBoyHelpers(p) {
        // Use the ACTUAL F system from MathematicalFoundation - CRITICAL for dynamic F
        const F = window.MathematicalFoundation?.F || 12;
        
        return {
            // F=12px system
            F: F,
            spacing: {
                xs: F * 0.5,   // 6px
                sm: F,         // 12px  
                md: F * 2,     // 24px
                lg: F * 3,     // 36px
                xl: F * 4      // 48px
            },
            
            // VGA color palette with p5.js color objects  
            colors: {
                bg: this.getVGAColor('--c-bg'),
                text: this.getVGAColor('--c-text'),
                border: this.getVGAColor('--c-border'),
                accent: this.getVGAColor('--c-accent'),
                
                // Full VGA palette
                black: '#000000',
                maroon: '#800000',
                green: '#008000',
                olive: '#808000',
                navy: '#000080',
                purple: '#800080',
                teal: '#008080',
                silver: '#c0c0c0',
                gray: '#808080',
                red: '#ff0000',
                lime: '#00ff00',
                yellow: '#ffff00',
                blue: '#0000ff',
                fuchsia: '#ff00ff',
                aqua: '#00ffff',
                white: '#ffffff'
            },
            
            // Typography helpers
            typography: {
                setAtkinsonFont: () => {
                    p.textFont('Atkinson Hyperlegible, Atkinson Hyperlegible Mono, monospace');
                },
                sizes: {
                    xs: F * 0.75,    // 9px
                    sm: F,           // 12px (base)
                    md: F * 1.33,    // 16px
                    lg: F * 1.67,    // 20px
                    xl: F * 2        // 24px
                }
            },
            
            // UI component helpers
            ui: {
                createVGAButton: (x, y, w, h, label, onClick) => {
                    return this.createVGAButton(p, x, y, w, h, label, onClick);
                },
                createVGASlider: (x, y, w, min, max, value) => {
                    return this.createVGASlider(p, x, y, w, min, max, value);
                },
                createVGAInput: (x, y, w, placeholder) => {
                    return this.createVGAInput(p, x, y, w, placeholder);
                }
            },
            
            // Utility functions
            utils: {
                isThemeInverted: () => document.documentElement.classList.contains('inverted'),
                getCurrentF: () => window.MathematicalFoundation?.F || 12, // Dynamic F access
                updateScaling: (newF) => {
                    // Helper to update spacing when F changes dynamically
                    const scale = newF / 12; // Scale relative to base F=12
                    return {
                        xs: newF * 0.5,
                        sm: newF,
                        md: newF * 2,
                        lg: newF * 3,
                        xl: newF * 4
                    };
                }
            }
        };
    }
    
    getVGAColor(cssVar) {
        return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    }
    
    createVGAButton(p, x, y, w, h, label, onClick) {
        const button = p.createButton(label);
        button.position(x, y);
        button.size(w, h);
        button.mousePressed(onClick);
        
        // Apply SiteBoy button styling
        button.style(`
            background: var(--c-bg);
            color: var(--c-text);
            border: 1px solid var(--c-border);
            font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
            font-size: var(--f)px;
            padding: calc(var(--f) * 0.5)px var(--f)px;
            cursor: pointer;
            transition: none;
        `);
        
        button.mouseOver(() => {
            button.style('background', 'var(--c-accent)');
            button.style('color', 'var(--c-bg)');
        });
        
        button.mouseOut(() => {
            button.style('background', 'var(--c-bg)');
            button.style('color', 'var(--c-text)');
        });
        
        return button;
    }
    
    createVGASlider(p, x, y, w, min, max, value) {
        const slider = p.createSlider(min, max, value);
        slider.position(x, y);
        slider.size(w, 20);
        
        // Style the slider to match VGA aesthetic
        slider.style(`
            background: var(--c-border);
            outline: none;
            opacity: 0.7;
            transition: opacity 0.2s;
        `);
        
        return slider;
    }
    
    createVGAInput(p, x, y, w, placeholder) {
        const input = p.createInput('');
        input.position(x, y);
        input.size(w, 24);
        input.attribute('placeholder', placeholder);
        
        input.style(`
            background: var(--c-bg);
            color: var(--c-text);
            border: 1px solid var(--c-border);
            font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
            font-size: var(--f)px;
            padding: calc(var(--f) * 0.25)px calc(var(--f) * 0.5)px;
            outline: none;
        `);
        
        return input;
    }
    
    defaultSketch(p, siteboy) {
        p.setup = function() {
            p.createCanvas(400, 400);
            p.background(siteboy.colors.bg);
            siteboy.typography.setSpaceMonoFont();
        };
        
        p.draw = function() {
            p.background(siteboy.colors.bg);
            p.fill(siteboy.colors.text);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(siteboy.typography.sizes.md);
            p.text('SiteBoy P5.js Integration', p.width/2, p.height/2);
        };
    }
    
    updateSketch(newSketchFunction) {
        this.sketchFunction = newSketchFunction;
        this.initializeP5();
    }
    
    destroy() {
        if (this.p5Instance) {
            this.p5Instance.remove();
            this.p5Instance = null;
        }
        super.destroy();
    }
}

/**
 * P5EmbeddedSketch - Component for embedding existing p5.js sketches
 */
export class P5EmbeddedSketch extends P5Canvas {
    constructor(options = {}, deps = {}) {
        super(options, deps);
        this.scriptPath = options.scriptPath;
        this.targetElementId = options.targetElementId;
    }
    
    async loadExternalSketch() {
        if (!this.scriptPath) {
            console.error('P5EmbeddedSketch: No scriptPath provided');
            return;
        }
        
        try {
            // Ensure p5.js is loaded first
            await P5Canvas.ensureP5Loaded();
            
            // Create script element and load the external sketch
            const script = document.createElement('script');
            script.src = this.scriptPath;
            script.onload = () => {
                console.log(`✅ P5.js sketch loaded: ${this.scriptPath}`);
            };
            script.onerror = (error) => {
                console.error(`❌ Failed to load P5.js sketch: ${this.scriptPath}`, error);
            };
            
            document.head.appendChild(script);
        } catch (error) {
            console.error('Error loading P5.js sketch:', error);
        }
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', this.containerClass);
            if (this.targetElementId) {
                this.element.id = this.targetElementId;
            }
            
            // Apply SiteBoy framework styling
            this.element.style.cssText = `
                border: 1px solid var(--c-border);
                background: var(--c-bg);
                padding: var(--f);
                margin: calc(var(--f) * 2) 0;
                max-width: 100%;
                overflow: hidden;
                box-sizing: border-box;
            `;
            
            // Load the external sketch
            this.loadExternalSketch();
        }
        return this.element;
    }
}

/**
 * P5ControlledSketch - ColorQuantizer-style p5.js integration with controls
 * Follows exact ColorQuantizer aesthetic and minimal DOM pattern
 */
export class P5ControlledSketch extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'p5-controlled' }, deps);
        
        this.scriptPath = options.scriptPath;
        this.targetElementId = options.targetElementId;
        this.controls = options.controls || [];
        this.canvasWidth = options.canvasWidth || 640;
        this.canvasHeight = options.canvasHeight || 640;
        
        // State management
        this.state = {};
        this.p5Instance = null;
        this.ui = {};
        this.resizeHandler = null; // Track resize handler for cleanup
        
        // Fibonacci sequence instances
        this.fibonacciInstances = {};
        
        // Initialize state from controls
        this.controls.forEach(control => {
            // Apply logarithmic conversion to defaultValue if needed
            let initialValue = control.defaultValue;
            if (control.logScale && control.logMin && control.logMax) {
                if (control.defaultValue === 0) {
                    initialValue = 0;
                } else {
                    const logMin = Math.log(control.logMin);
                    const logMax = Math.log(control.logMax);
                    const logValue = logMin + (control.defaultValue / 100) * (logMax - logMin);
                    initialValue = Math.exp(logValue);
                }
            }
            
            this.state[control.key] = initialValue;
            
            // Initialize Fibonacci instances for controls that use them
            if (control.fibonacci && control.fibonacciId) {
                if (!this.fibonacciInstances[control.fibonacciId]) {
                    // Proper Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418, 317811, 514229
                    const fibSequence = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418, 317811, 514229];
                    
                    // Find current position in sequence
                    let currentIndex = fibSequence.indexOf(control.defaultValue);
                    if (currentIndex === -1) {
                        // If default value not in sequence, start at index for value 8
                        currentIndex = fibSequence.indexOf(8);
                    }
                    
                    this.fibonacciInstances[control.fibonacciId] = {
                        sequence: fibSequence,
                        currentIndex: currentIndex,
                        getCurrentValue: function() { return this.sequence[this.currentIndex]; },
                        next: function() {
                            if (this.currentIndex < this.sequence.length - 1) {
                                this.currentIndex++;
                            }
                            return this.getCurrentValue();
                        },
                        previous: function() {
                            if (this.currentIndex > 0) {
                                this.currentIndex--;
                            }
                            return this.getCurrentValue();
                        }
                    };
                }
            }
        });
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'p5-controlled-container');
        }
        
        const F = this.deps.MF ? this.deps.MF.F : 12;
        
        // Responsive grid - side-by-side on desktop, stacked on mobile
        const container = document.createElement('div');
        container.className = 'p5-container';
        container.style.cssText = `
            display: grid; 
            grid-template-columns: 1fr;
            gap: ${F}px;
        `;
        
        // Add responsive behavior via media query
        // On desktop (>768px), use side-by-side layout
        if (window.matchMedia('(min-width: 768px)').matches) {
            container.style.gridTemplateColumns = `${F*36}px 1fr`;
        }
        
        // Listen for window resize to adjust layout
        this.resizeHandler = () => {
            if (window.matchMedia('(min-width: 768px)').matches) {
                container.style.gridTemplateColumns = `${F*36}px 1fr`;
            } else {
                container.style.gridTemplateColumns = '1fr';
            }
            
            // Notify p5 instance to resize canvas if needed
            if (this.p5Instance && this.p5Instance.windowResized) {
                this.p5Instance.windowResized();
            }
        };
        window.addEventListener('resize', this.resizeHandler);
        
        // Controls column
        if (this.controls.length > 0) {
            const controls = document.createElement('div');
            controls.className = 'p5-controls';
            container.appendChild(controls);
            
            // Create control sections using ColorQuantizer makeBox pattern
            this.createAllSections(controls, F);
        }
        
        // Canvas section - MINIMAL like ColorQuantizer
        const canvasBox = this.createCanvasSection(F);
        container.appendChild(canvasBox);
        
        this.element.appendChild(container);
        
        // Initialize p5.js after DOM is ready
        setTimeout(() => this.initializeAfterDOMInsertion(), 0);
        
        return this.element;
    }
    
    createCanvasSection(F) {
        // EXACT ColorQuantizer pattern - minimal DOM
        const canvasBox = document.createElement('div');
        canvasBox.className = 'p5-canvas-box';
        canvasBox.style.cssText = `border:1px solid var(--c-border); padding:${F}px; background: var(--c-bg); min-height:${F*30}px; display:flex; align-items:center; justify-content:center; overflow:auto;`;
        
        // Canvas container - direct, no wrapper divs
        const canvasContainer = document.createElement('div');
        canvasContainer.id = this.targetElementId;
        canvasContainer.className = 'p5-canvas';
        canvasContainer.style.cssText = `width:100%; height:100%; background: var(--c-bg);`;
        
        canvasBox.appendChild(canvasContainer);
        return canvasBox;
    }
    
    createAllSections(controls, F) {
        // ColorQuantizer makeBox helper - EXACT pattern
        const makeBox = (titleText) => {
            const box = document.createElement('div');
            box.className = 'p5-box';
            box.style.cssText = `
                border: 1px solid var(--c-border); 
                background: var(--c-bg); 
                padding: ${F}px;
            `;
            
            const h = document.createElement('div');
            h.className = 'p5-box-title';
            h.textContent = titleText;
            h.style.cssText = `
                font-weight: 700; 
                border-bottom: 1px solid var(--c-border); 
                margin-bottom: ${F}px;
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F}px;
                color: var(--c-text);
                text-transform: uppercase;
                line-height: 1.2;
            `;
            box.appendChild(h);
            
            // Avoid double border between stacked boxes
            if (controls && controls.children && controls.children.length > 0) {
                box.style.borderTop = 'none';
            }
            return box;
        };
        
        // Group controls logically for phyllo-manual and phyllo-sweep
        const basicControls = this.controls.filter(c => ['pointCount', 'deltaTheta', 'dotSize'].includes(c.key));
        const connectionControls = this.controls.filter(c => ['connectNth1', 'nth1', 'connectNth2', 'nth2', 'fibonacciLock'].includes(c.key));
        const equationControls = this.controls.filter(c => ['paramA', 'paramB', 'paramC', 'paramK', 'paramM'].includes(c.key));
        const animationControls = this.controls.filter(c => ['animationSpeed'].includes(c.key));
        const rotationControls = this.controls.filter(c => ['rotation'].includes(c.key));
        
        // Create sections based on available controls
        if (basicControls.length > 0) {
            this.createControlSection(makeBox, controls, F, 'SPIRAL PARAMETERS', basicControls);
        }
        if (connectionControls.length > 0) {
            this.createControlSection(makeBox, controls, F, 'CONNECTIONS', connectionControls);
        }
        if (equationControls.length > 0) {
            this.createControlSection(makeBox, controls, F, 'EQUATION PARAMETERS', equationControls);
        }
        if (animationControls.length > 0) {
            this.createControlSection(makeBox, controls, F, 'ANIMATION', animationControls);
        }
        if (rotationControls.length > 0) {
            this.createControlSection(makeBox, controls, F, 'ROTATION', rotationControls);
        }
    }
    
    createControlSection(makeBox, controls, F, title, sectionControls) {
        const box = makeBox(title);
        
        sectionControls.forEach(control => {
            const controlElement = this.createControl(control, F);
            box.appendChild(controlElement);
        });
        
        controls.appendChild(box);
    }
    
    createControl(control, F) {
        const container = document.createElement('div');
        container.style.cssText = `margin-bottom: ${F}px;`;
        
        // Label
        const label = document.createElement('div');
        const labelText = control.units ? `${control.label.toUpperCase()} (${control.units.toUpperCase()})` : control.label.toUpperCase();
        label.textContent = labelText;
        label.style.cssText = `
            font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F}px;
            font-weight: 400;
            color: var(--c-text);
            margin-bottom: ${F/2}px;
            line-height: 1.5;
            text-transform: uppercase;
        `;
        container.appendChild(label);
        
        if (control.type === 'range') {
            const rangeContainer = document.createElement('div');
            rangeContainer.style.cssText = `display: flex; gap: ${F/4}px; align-items: center;`;
            
            // Decrement button
            const decrementBtn = document.createElement('button');
            decrementBtn.textContent = '-';
            decrementBtn.style.cssText = `
                width: ${F * 1.5}px;
                height: ${F * 1.5}px;
                background: var(--c-bg);
                color: var(--c-text);
                border: 1px solid var(--c-border);
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F}px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = control.min || 0;
            slider.max = control.max || 100;
            slider.step = control.step || 1;
            slider.value = control.defaultValue;
            slider.style.cssText = `flex: 1; background: var(--c-bg); border: 1px solid var(--c-border);`;
            
            // Increment button
            const incrementBtn = document.createElement('button');
            incrementBtn.textContent = '+';
            incrementBtn.style.cssText = `
                width: ${F * 1.5}px;
                height: ${F * 1.5}px;
                background: var(--c-bg);
                color: var(--c-text);
                border: 1px solid var(--c-border);
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F}px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            const valueDisplay = document.createElement('span');
            
            // Calculate initial actual value for logarithmic controls
            let initialActualValue = control.defaultValue;
            if (control.logScale && control.logMin && control.logMax) {
                if (control.defaultValue === 0) {
                    initialActualValue = 0;
                } else {
                    const logMin = Math.log(control.logMin);
                    const logMax = Math.log(control.logMax);
                    const logValue = logMin + (control.defaultValue / 100) * (logMax - logMin);
                    initialActualValue = Math.exp(logValue);
                }
            }
            
            const displayValue = control.min === 0 ? `0|${initialActualValue.toFixed(3)}` : initialActualValue.toFixed(3);
            valueDisplay.textContent = displayValue;
            valueDisplay.style.cssText = `
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F}px;
                font-weight: 400;
                color: var(--c-text);
                min-width: ${F * 4}px;
                text-align: right;
                background: var(--c-bg);
                border: 1px solid var(--c-border);
                padding: ${F/4}px ${F/2}px;
                line-height: 1.5;
            `;
            
            // Function to update display and state
            const updateValue = (newSliderValue) => {
                let actualValue = newSliderValue;
                
                // Handle logarithmic scaling
                if (control.logScale && control.logMin && control.logMax) {
                    if (newSliderValue === 0) {
                        actualValue = 0;
                    } else {
                        // Convert linear slider (0-100) to logarithmic scale (logMin-logMax)
                        const logMin = Math.log(control.logMin);
                        const logMax = Math.log(control.logMax);
                        const logValue = logMin + (newSliderValue / 100) * (logMax - logMin);
                        actualValue = Math.exp(logValue);
                    }
                }
                
                // Show "0|+" pattern for controls that start at 0
                const displayValue = control.min === 0 ? `0|${actualValue.toFixed(3)}` : actualValue.toFixed(3);
                valueDisplay.textContent = displayValue;
                this.updateState(control.key, actualValue);
                return actualValue;
            };
            
            // Slider event listener
            slider.addEventListener('input', (e) => {
                let value = parseFloat(e.target.value);
                
                // Handle golden angle lock for deltaTheta
                if (control.key === 'deltaTheta' && this.state.goldenAngleLock) {
                    value = 137.508; // Lock to exact golden angle
                    slider.value = value;
                }
                
                updateValue(value);
            });
            
            // Decrement button event listener
            decrementBtn.addEventListener('click', () => {
                const currentValue = parseFloat(slider.value);
                const newValue = Math.max(control.min, currentValue - control.step);
                slider.value = newValue;
                updateValue(newValue);
            });
            
            // Increment button event listener
            incrementBtn.addEventListener('click', () => {
                const currentValue = parseFloat(slider.value);
                const newValue = Math.min(control.max, currentValue + control.step);
                slider.value = newValue;
                updateValue(newValue);
            });
            
            // Button hover effects
            decrementBtn.addEventListener('mouseenter', () => {
                decrementBtn.style.background = 'var(--c-text)';
                decrementBtn.style.color = 'var(--c-bg)';
            });
            decrementBtn.addEventListener('mouseleave', () => {
                decrementBtn.style.background = 'var(--c-bg)';
                decrementBtn.style.color = 'var(--c-text)';
            });
            
            incrementBtn.addEventListener('mouseenter', () => {
                incrementBtn.style.background = 'var(--c-text)';
                incrementBtn.style.color = 'var(--c-bg)';
            });
            incrementBtn.addEventListener('mouseleave', () => {
                incrementBtn.style.background = 'var(--c-bg)';
                incrementBtn.style.color = 'var(--c-text)';
            });
            
            rangeContainer.appendChild(decrementBtn);
            rangeContainer.appendChild(slider);
            rangeContainer.appendChild(incrementBtn);
            rangeContainer.appendChild(valueDisplay);
            
            container.appendChild(rangeContainer);
            
        } else if (control.type === 'number') {
            const numberContainer = document.createElement('div');
            numberContainer.style.cssText = `display: flex; gap: ${F/4}px; align-items: center;`;
            
            // Decrement button (with Fibonacci support)
            const decrementBtn = document.createElement('button');
            decrementBtn.textContent = '-';
            decrementBtn.style.cssText = `
                width: ${F * 1.5}px;
                height: ${F * 1.5}px;
                background: var(--c-bg);
                color: var(--c-text);
                border: 1px solid var(--c-border);
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F}px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            const numberInput = document.createElement('input');
            numberInput.type = 'number';
            numberInput.min = control.min;
            numberInput.max = control.max;
            numberInput.step = control.step;
            numberInput.value = control.defaultValue;
            numberInput.style.cssText = `
                flex: 1;
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F}px;
                background: var(--c-bg);
                color: var(--c-text);
                border: 1px solid var(--c-border);
                padding: ${F/2}px;
            `;
            
            // Increment button (with Fibonacci support)
            const incrementBtn = document.createElement('button');
            incrementBtn.textContent = '+';
            incrementBtn.style.cssText = `
                width: ${F * 1.5}px;
                height: ${F * 1.5}px;
                background: var(--c-bg);
                color: var(--c-text);
                border: 1px solid var(--c-border);
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F}px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            // Fibonacci methods
            const fibNext = (fibId) => {
                const fib = this.fibonacciInstances[fibId];
                return fib.next();
            };
            
            const fibPrevious = (fibId) => {
                const fib = this.fibonacciInstances[fibId];
                return fib.previous();
            };
            
            // Event listeners
            numberInput.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.updateState(control.key, value);
            });
            
            decrementBtn.addEventListener('click', () => {
                let newValue;
                if (control.fibonacci && control.fibonacciId && this.state.fibonacciLock) {
                    newValue = fibPrevious(control.fibonacciId);
                } else {
                    const currentValue = parseInt(numberInput.value);
                    newValue = Math.max(control.min, currentValue - control.step);
                }
                numberInput.value = newValue;
                this.updateState(control.key, newValue);
            });
            
            incrementBtn.addEventListener('click', () => {
                let newValue;
                if (control.fibonacci && control.fibonacciId && this.state.fibonacciLock) {
                    newValue = fibNext(control.fibonacciId);
                } else {
                    const currentValue = parseInt(numberInput.value);
                    newValue = Math.min(control.max, currentValue + control.step);
                }
                numberInput.value = newValue;
                this.updateState(control.key, newValue);
            });
            
            // Button hover effects
            decrementBtn.addEventListener('mouseenter', () => {
                decrementBtn.style.background = 'var(--c-text)';
                decrementBtn.style.color = 'var(--c-bg)';
            });
            decrementBtn.addEventListener('mouseleave', () => {
                decrementBtn.style.background = 'var(--c-bg)';
                decrementBtn.style.color = 'var(--c-text)';
            });
            
            incrementBtn.addEventListener('mouseenter', () => {
                incrementBtn.style.background = 'var(--c-text)';
                incrementBtn.style.color = 'var(--c-bg)';
            });
            incrementBtn.addEventListener('mouseleave', () => {
                incrementBtn.style.background = 'var(--c-bg)';
                incrementBtn.style.color = 'var(--c-text)';
            });
            
            numberContainer.appendChild(decrementBtn);
            numberContainer.appendChild(numberInput);
            numberContainer.appendChild(incrementBtn);
            
            container.appendChild(numberContainer);
            
        } else if (control.type === 'checkbox') {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = control.defaultValue;
            checkbox.style.cssText = `width: ${F}px; height: ${F}px;`;
            
            checkbox.addEventListener('change', (e) => {
                this.updateState(control.key, e.target.checked);
                
                // Handle golden angle lock
                if (control.key === 'goldenAngleLock' && e.target.checked) {
                    // Find and update deltaTheta slider to golden angle
                    const deltaThetaControl = this.controls.find(c => c.key === 'deltaTheta');
                    if (deltaThetaControl) {
                        this.updateState('deltaTheta', 137.508);
                        // Update the actual slider value in the UI
                        const deltaThetaSlider = container.parentElement.querySelector('input[type="range"]');
                        if (deltaThetaSlider) {
                            deltaThetaSlider.value = 137.508;
                        }
                    }
                }
            });
            
            container.appendChild(checkbox);
        }
        
        return container;
    }
    
    updateState(key, value) {
        this.state[key] = value;
        
        // Notify p5.js instance
        if (this.p5Instance && this.p5Instance.updateFromSiteBoy) {
            this.p5Instance.updateFromSiteBoy(key, value, this.state);
        }
        
        // Make state available globally
        window.siteBoyP5State = this.state;
    }
    
    async initializeAfterDOMInsertion() {
        try {
            await P5Canvas.ensureP5Loaded();
            
            // Wait for target element
            await this.waitForTargetElement();
            
            // Make state available globally
            window.siteBoyP5State = this.state;
            window.siteBoyP5Component = this;
            
            // Load external sketch
            if (this.scriptPath) {
                await this.loadExternalSketch();
            }
            
            console.log(`✅ P5ControlledSketch initialized: ${this.targetElementId}`);
        } catch (error) {
            console.error(`❌ Failed to initialize P5ControlledSketch: ${this.targetElementId}`, error);
        }
    }
    
    async waitForTargetElement(maxWait = 5000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            const element = document.getElementById(this.targetElementId);
            if (element) {
                return element;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        throw new Error(`Target element ${this.targetElementId} not found after ${maxWait}ms`);
    }
    
    async loadExternalSketch() {
        if (!this.scriptPath) return;
        
        try {
            const response = await fetch(this.scriptPath, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`Failed to fetch: ${this.scriptPath}`);
            
            const scriptContent = await response.text();
            
            const scriptElement = document.createElement('script');
            scriptElement.textContent = scriptContent;
            document.head.appendChild(scriptElement);
            
            console.log(`✅ P5.js sketch loaded: ${this.scriptPath}`);
        } catch (error) {
            console.error(`❌ Failed to load P5.js sketch: ${this.scriptPath}`, error);
        }
    }
    
    destroy() {
        if (this.p5Instance && this.p5Instance.remove) {
            this.p5Instance.remove();
        }
        
        // Clean up resize handler
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        
        // Clean up global references
        if (window.siteBoyP5State) delete window.siteBoyP5State;
        if (window.siteBoyP5Component) delete window.siteBoyP5Component;
        
        super.destroy();
    }
}
