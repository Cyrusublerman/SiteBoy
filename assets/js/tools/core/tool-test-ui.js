/**
 * ToolTestUI - Component Testbed Tool
 *
 * Tests ALL ToolBase components and features:
 * - All input component types (sliders, dropdowns, buttons, etc.)
 * - Multiple sidebar tabs
 * - Animation controls with AnimationFoundation
 * - Canvas sizing and export
 * - File upload and processing
 * - Audio synthesis and visualization
 *
 * @version 9.0.0 - ES Module Migration
 */

// ES Module imports
import { ToolBase } from './tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { AnimationLoop } from '../../core/animation-foundation.js';

// Use window.ComponentLibrary to ensure compatibility
const ComponentLib = window.ComponentLibrary || ComponentLibrary;

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════════════════

export class ToolTestUI {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = {
            ComponentLibrary: ComponentLib,
            ...deps
        };
        this.tool = null;
        this.wrapper = null;
        this.modeTabs = null;
        this.contentArea = null;

        // Mode-specific state
        this.currentMode = 'ANIMATION';
        this.balls = [];
        this.sourceImage = null;
        this.svgVertices = [];
        this.graphData = [];
        this.audioNodes = null;
        this.isPlaying = false;

        this.render();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CALLBACK METHODS
    // ═══════════════════════════════════════════════════════════════════════════════

    _onInit(values) {
        window.debugLog('TOOLS', '🎯 Tool Test UI initialized with values:', values);

        // Initialize mode-specific state based on current mode
        switch (this.currentMode) {
            case 'ANIMATION':
                this.balls = this._generateBalls(values.ballCount || 5, values.ballColor || '#FF5500');
                this._startAnimationMode();
                break;
            case 'IMAGE':
                this.sourceImage = null;
                break;
            case 'SVG':
                this.svgVertices = this._generatePolygon(values.sides || 6, values.radius || 100);
                break;
            case 'GRAPHS':
                this.graphData = this._generateDataSet(values.dataPoints || 8, values.minValue || 10, values.maxValue || 500);
                break;
            case 'AUDIO':
                this.audioNodes = null;
                this.isPlaying = false;
                break;
        }

        // Wire buttons
        this._wireButtons(values);
    }

    _onUpdate(key, value, allValues) {
        window.debugLog('TOOLS', '📝 ' + key + ' changed to:', value);

        // Update mode-specific parameters
        switch (this.currentMode) {
            case 'ANIMATION':
                if (['ballCount', 'ballColor'].includes(key)) {
                    this.balls = this._generateBalls(allValues.ballCount || 5, allValues.ballColor || '#FF5500');
                }
                break;

            case 'SVG':
                if (key === 'sides' || key === 'radius') {
                    this.svgVertices = this._generatePolygon(allValues.sides || 6, allValues.radius || 100);
                }
                break;

            case 'GRAPHS':
                if (['dataPoints', 'minValue', 'maxValue'].includes(key)) {
                    this.graphData = this._generateDataSet(
                        allValues.dataPoints || 8,
                        allValues.minValue || 10,
                        allValues.maxValue || 500
                    );
                }
                break;

            case 'AUDIO':
                if (this.isPlaying) {
                    this._updateAudio(allValues);
                }
                break;
        }
    }

    _onDraw(ctx, canvas, values) {
        // Clear
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Store canvas dimensions for drawing methods
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;

        switch(this.currentMode) {
            case 'ANIMATION':
                this._drawAnimation(ctx, values);
                break;
            case 'IMAGE':
                this._drawImage(ctx, values);
                break;
            case 'SVG':
                this._drawSVG(ctx, values);
                break;
            case 'GRAPHS':
                this._drawGraphs(ctx, values);
                break;
            case 'AUDIO':
                this._drawAudio(ctx, values);
                break;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════════

    _createConfigForMode(mode) {
        // Get sidebar config for this mode
        const sidebarConfig = this._getSidebarConfigForMode(mode);

        const config = {
            title: 'TOOL TEST UI',
            sidebar: sidebarConfig,
            canvas: {
                fillContainer: true,     // Viewport fills panel (rectangular)
                contentWidth: 2100,      // Canvas width (2x typical viewport width)
                contentHeight: 1400,     // Canvas height (2x typical viewport height)
                showControls: false,
                enableZoom: true,
                enablePan: true,
                minZoom: 0.25,
                maxZoom: 4.0
            },
            onInit: (values) => this._onInit(values),
            onUpdate: (key, value, allValues) => this._onUpdate(key, value, allValues),
            onDraw: (ctx, canvas, values) => this._onDraw(ctx, canvas, values)
        };
        
        window.debugLog('TOOLS', '🎨 ToolTestUI /core/ creating config with canvas:', config.canvas);
        return config;
    }

    _getSidebarConfigForMode(mode) {
        switch (mode) {
            case 'ANIMATION':
                return [
                    ['ANIMATION', [
                        ['Physics Settings', [
                            ['slider', 'Ball Count', 1, 20, 1, { key: 'ballCount', value: 5, withNumber: true }],
                            ['slider', 'Gravity', 0.1, 2.0, 0.1, { key: 'gravity', value: 0.5, precision: 1, withNumber: true }],
                            ['slider', 'Bounce', 0.1, 1.0, 0.1, { key: 'bounce', value: 0.8, precision: 1, withNumber: true }]
                        ]],
                        ['Appearance', [
                            ['color', 'Ball Color', '#FF5500', { key: 'ballColor' }],
                            ['toggle', 'Display Options', ['Show Trails', 'Wireframe', 'Debug Info'], { key: 'displayOpts', selectedValues: [] }]
                        ]]
                    ]]
                ];

            case 'IMAGE':
                return [
                    ['IMAGE', [
                        ['File Input', [
                            ['file', 'Upload Image', 'image/*', { key: 'imageFile', buttonText: 'Choose Image' }]
                        ]],
                        ['Processing', [
                            ['slider', 'Brightness', -100, 100, 1, { key: 'brightness', value: 0, withNumber: true }],
                            ['slider', 'Contrast', 0.5, 2.0, 0.1, { key: 'contrast', value: 1.0, precision: 1, withNumber: true }],
                            ['dropdown', 'Filter', [
                                { value: 'none', label: 'None' },
                                { value: 'grayscale', label: 'Grayscale' },
                                { value: 'sepia', label: 'Sepia' },
                                { value: 'invert', label: 'Invert' }
                            ], { key: 'filter', value: 'none' }]
                        ]],
                        ['Export', [
                            ['button', 'Download PNG', null, { key: 'exportPng', variant: 'primary' }]
                        ]]
                    ]]
                ];

            case 'SVG':
                return [
                    ['SVG', [
                        ['Shape Properties', [
                            ['slider', 'Sides', 3, 12, 1, { key: 'sides', value: 6, withNumber: true }],
                            ['slider', 'Radius', 20, 200, 1, { key: 'radius', value: 100, withNumber: true }]
                        ]],
                        ['Styling', [
                            ['color', 'Fill Color', '#FF5500', { key: 'fillColor' }],
                            ['color', 'Stroke Color', '#FFFFFF', { key: 'strokeColor' }],
                            ['slider', 'Stroke Width', 1, 10, 1, { key: 'strokeWidth', value: 2, withNumber: true }]
                        ]],
                        ['Actions', [
                            ['button', 'Generate Polygon', null, { key: 'generatePolygon', variant: 'primary' }],
                            ['button', 'Export SVG', null, { key: 'exportSvg' }]
                        ]]
                    ]]
                ];

            case 'GRAPHS':
                return [
                    ['GRAPHS', [
                        ['Data Settings', [
                            ['slider', 'Data Points', 4, 20, 1, { key: 'dataPoints', value: 8, withNumber: true }],
                            ['slider', 'Min Value', 1, 100, 1, { key: 'minValue', value: 10, withNumber: true }],
                            ['slider', 'Max Value', 100, 1000, 10, { key: 'maxValue', value: 500, withNumber: true }]
                        ]],
                        ['Chart Type', [
                            ['dropdown', 'Visualization', [
                                { value: 'bar', label: 'Bar Chart' },
                                { value: 'line', label: 'Line Chart' },
                                { value: 'pie', label: 'Pie Chart' },
                                { value: 'scatter', label: 'Scatter Plot' }
                            ], { key: 'visualization', value: 'bar' }]
                        ]],
                        ['Actions', [
                            ['button', 'Regenerate Data', null, { key: 'regenerateData', variant: 'primary' }]
                        ]]
                    ]]
                ];

            case 'AUDIO':
                return [
                    ['AUDIO', [
                        ['Synthesis', [
                            ['slider', 'Volume', 0, 100, 1, { key: 'volume', value: 50, withNumber: true }],
                            ['slider', 'Frequency', 20, 2000, 1, { key: 'frequency', value: 440, withNumber: true }],
                            ['slider', 'FM Depth', 0, 1000, 10, { key: 'fmDepth', value: 100, withNumber: true }]
                        ]],
                        ['Waveform', [
                            ['dropdown', 'Oscillator Type', [
                                { value: 'sine', label: 'Sine' },
                                { value: 'square', label: 'Square' },
                                { value: 'sawtooth', label: 'Sawtooth' },
                                { value: 'triangle', label: 'Triangle' }
                            ], { key: 'oscillatorType', value: 'sine' }]
                        ]],
                        ['Controls', [
                            ['button', 'Play', null, { key: 'audioPlay', variant: 'success' }],
                            ['button', 'Stop', null, { key: 'audioStop', variant: 'danger' }]
                        ]]
                    ]]
                ];

            default:
                return [];
        }
    }

    render() {
        try {
            const F = this.deps.MF?.F || 14;

            // Clear container
            this.container.innerHTML = '';

            // Create container wrapper with flex layout
            this.wrapper = document.createElement('div');
            this.wrapper.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; position: relative;';

            // Create mode tabs bar above sidebar/canvas
            this.modeTabs = this._buildModeTabs();
            this.wrapper.appendChild(this.modeTabs);

            // Content area for ToolBase - must fill remaining space
            this.contentArea = document.createElement('div');
            this.contentArea.style.cssText = `
                flex: 1;
                min-height: 0;
                overflow: hidden;
                width: 100%;
            `;
            this.wrapper.appendChild(this.contentArea);

            this.container.appendChild(this.wrapper);

            // Build ToolBase with initial mode
            this._rebuildToolForMode(this.currentMode);

            window.debugLog('TOOLS', '✅ ToolTestUI rendered');
        } catch (error) {
            console.error('❌ ToolTestUI error:', error);
            this.container.innerHTML =
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>TOOL TEST UI ERROR</h2>' +
                '<p style="color: red;">' + error.message + '</p>' +
                '</div>';
        }
    };

    _buildModeTabs() {
        const F = this.deps.MF?.F || 14;
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            border-bottom: 1px solid var(--c-border);
            flex-shrink: 0;
            background: var(--c-bg);
        `;

        const modes = [
            { id: 'ANIMATION', label: 'ANIMATION' },
            { id: 'IMAGE', label: 'IMAGE' },
            { id: 'SVG', label: 'SVG' },
            { id: 'GRAPHS', label: 'GRAPHS' },
            { id: 'AUDIO', label: 'AUDIO' }
        ];

        const tabs = [];
        modes.forEach((mode, index) => {
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.textContent = mode.label;
            const isActive = mode.id === this.currentMode;

            tab.style.cssText = `
                flex: 1;
                height: ${F * 2}px;
                padding: 0 ${F}px;
                border: none;
                border-right: 1px solid var(--c-border);
                background: ${isActive ? 'var(--c-text)' : 'var(--c-bg)'};
                color: ${isActive ? 'var(--c-bg)' : 'var(--c-text)'};
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                text-transform: uppercase;
                cursor: pointer;
            `;

            if (index === modes.length - 1) {
                tab.style.borderRight = 'none';
            }

            tab.addEventListener('click', () => this._switchMode(mode.id));

            if (!isActive) {
                tab.addEventListener('mouseenter', () => {
                    tab.style.background = 'var(--c-text)';
                    tab.style.color = 'var(--c-bg)';
                });
                tab.addEventListener('mouseleave', () => {
                    if (this.currentMode !== mode.id) {
                        tab.style.background = 'var(--c-bg)';
                        tab.style.color = 'var(--c-text)';
                    }
                });
            }

            container.appendChild(tab);
            tabs.push(tab);
        });

        return container;
    }

    _rebuildToolForMode(mode) {
        // Cleanup old tool
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }

        // Clear content area
        this.contentArea.innerHTML = '';

        // Create config for this mode
        const config = this._createConfigForMode(mode);

        this.tool = new ToolBase(config, this.deps);

        // Mount tool using mount method (handles initialization)
        this.tool.mount(this.contentArea);

        // Ensure ToolBase element fills the content area
        if (this.tool.element) {
            this.tool.element.style.width = '100%';
            this.tool.element.style.height = '100%';
        }

        // Draw canvas
        this.tool.draw();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // MODE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    _switchMode(newMode) {
        if (this.currentMode === newMode) return;

        // Cleanup current mode
        this._cleanupCurrentMode();

        // Switch to new mode
        this.currentMode = newMode;

        // Update tab buttons
        const tabs = this.modeTabs.querySelectorAll('button');
        tabs.forEach((tab, index) => {
            const modes = ['ANIMATION', 'IMAGE', 'SVG', 'GRAPHS', 'AUDIO'];
            const isActive = modes[index] === newMode;
            tab.style.background = isActive ? 'var(--c-text)' : 'var(--c-bg)';
            tab.style.color = isActive ? 'var(--c-bg)' : 'var(--c-text)';
        });

        // Rebuild tool with new mode's sidebar (this will trigger onInit which handles mode initialization)
        this._rebuildToolForMode(newMode);

        if (this.tool) {
            this.tool.draw();
        }
    };

    _cleanupCurrentMode() {
        // Stop animation
        if (this.animationLoop) {
            this.animationLoop.destroy();
            this.animationLoop = null;
        }

        // Stop audio
        this._stopAudio();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ANIMATION MODE
    // ═══════════════════════════════════════════════════════════════════════════════

    _startAnimationMode() {
        // AnimationFoundation will be imported when needed
        if (!AnimationLoop) {
            console.warn('AnimationLoop not available');
            return;
        }

        var self = this;
        this.animationLoop = new AnimationLoop({
            fps: 60,
            onFrame: function() {
                self._updateAnimation();
                self.tool.draw();
            }
        });

        this.animationLoop.start();
    }

    _updateAnimation() {
        if (!this.tool) return;  // Guard against null tool
        
        var values = this.tool.getValues();
        var gravity = values.gravity || 0.5;
        var bounce = values.bounce || 0.8;
        
        // Use stored canvas dimensions (default to 420 for backwards compat)
        var canvasWidth = this.canvasWidth || 420;
        var canvasHeight = this.canvasHeight || 420;

        this.balls.forEach(function(ball) {
            ball.x += ball.vx;
            ball.y += ball.vy;
            ball.vy += gravity;

            // Bounce off walls
            if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvasWidth) {
                ball.vx *= -0.8;
                ball.x = Math.max(ball.radius, Math.min(canvasWidth - ball.radius, ball.x));
            }

            // Bounce off bottom
            if (ball.y + ball.radius > canvasHeight) {
                ball.vy *= -bounce;
                ball.y = canvasHeight - ball.radius;
                if (Math.abs(ball.vy) < 0.1) ball.vy = 0;
            }
        });
    };

    _generateBalls(count, color) {
        count = count || 5;
        color = color || '#FF5500';
        
        // Use stored canvas dimensions (default to 420 for backwards compat)
        var canvasWidth = this.canvasWidth || 420;
        var canvasHeight = this.canvasHeight || 420;

        var balls = [];
        for (var i = 0; i < count; i++) {
            balls.push({
                x: Math.random() * canvasWidth,
                y: Math.random() * (canvasHeight * 0.5),  // Top half
                vx: (Math.random() - 0.5) * 4,
                vy: 0,
                radius: 10 + Math.random() * 10,
                color: color
            });
        }
        return balls;
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // IMAGE MODE
    // ═══════════════════════════════════════════════════════════════════════════════

    _startImageMode() {
        // Ready for image upload
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SVG MODE
    // ═══════════════════════════════════════════════════════════════════════════════

    _startSVGMode() {
        // SVG mode ready
    }

    _generatePolygon(sides, radius) {
        sides = sides || 6;
        radius = radius || 100;

        var vertices = [];
        var cx = 210, cy = 210; // Center of 420x420 canvas

        for (var i = 0; i < sides; i++) {
            var angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            vertices.push({
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius
            });
        }
        return vertices;
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // GRAPHS MODE
    // ═══════════════════════════════════════════════════════════════════════════════

    _startGraphsMode() {
        // Graphs mode ready
    }

    _generateDataSet(count, minVal, maxVal) {
        count = count || 8;
        minVal = minVal || 10;
        maxVal = maxVal || 500;

        var data = [];
        for (var i = 0; i < count; i++) {
            data.push({
                label: 'Item ' + (i + 1),
                value: Math.random() * (maxVal - minVal) + minVal
            });
        }
        return data;
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // AUDIO MODE
    // ═══════════════════════════════════════════════════════════════════════════════

    _startAudioMode() {
        // Audio context will be created on play
    }

    _startAudio() {
        var values = this.tool.getValues();

        // Create AudioContext on first use
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create nodes
            this.gainNode = this.audioContext.createGain();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;

            this.gainNode.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
        }

        // Resume if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Create oscillator
        var oscillator = this.audioContext.createOscillator();
        var modulator = this.audioContext.createOscillator();

        // FM setup
        oscillator.frequency.value = values.frequency || 440;
        modulator.frequency.value = (values.frequency || 440) * 2;
        modulator.connect(oscillator.frequency);
        oscillator.connect(this.gainNode);

        // Set FM depth
        var modulationIndex = (values.fmDepth || 100) / 100;
        oscillator.frequency.value = (values.frequency || 440) + (modulator.frequency.value * modulationIndex);

        oscillator.type = values.oscillatorType || 'sine';
        this.gainNode.gain.value = (values.volume || 50) / 100 * 0.3;

        // Start
        oscillator.start();
        modulator.start();

        this.audioNodes = {
            oscillator: oscillator,
            modulator: modulator,
            gainNode: this.gainNode,
            analyser: this.analyser
        };

        this.isPlaying = true;
    };

    _stopAudio() {
        if (this.audioNodes) {
            if (this.audioNodes.oscillator) {
                this.audioNodes.oscillator.stop();
            }
            if (this.audioNodes.modulator) {
                this.audioNodes.modulator.stop();
            }
            this.isPlaying = false;
            this.audioNodes = null;
        }
    };

    _updateAudio(values) {
        if (!this.audioNodes) return;

        this.audioNodes.oscillator.frequency.value = values.frequency || 440;
        this.audioNodes.oscillator.type = values.oscillatorType || 'sine';
        this.audioNodes.gainNode.gain.value = (values.volume || 50) / 100 * 0.3;
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // DRAWING METHODS
    // ═══════════════════════════════════════════════════════════════════════════════

    _drawAnimation(ctx, values) {
        window.debugLog('LAYOUT', '🎨 Drawing animation - balls:', this.balls.length, 'canvas dims:', this.canvasWidth, 'x', this.canvasHeight);
        if (this.balls.length > 0) {
            window.debugLog('TOOLS', '   First ball position:', this.balls[0].x, this.balls[0].y);
        }
        
        this.balls.forEach(function(ball) {
            ctx.fillStyle = ball.color;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    _drawImage(ctx, values) {
        if (this.sourceImage) {
            ctx.drawImage(this.sourceImage, 0, 0, 420, 420);
        } else {
            ctx.fillStyle = '#333333';
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Upload an image to begin', 210, 210);
        }
    };

    _drawSVG(ctx, values) {
        if (!this.svgVertices || this.svgVertices.length === 0) {
            ctx.fillStyle = '#333333';
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Click "Generate Polygon"', 210, 210);
            return;
        }

        var fillColor = values.fillColor || '#FF5500';
        var strokeColor = values.strokeColor || '#FFFFFF';
        var strokeWidth = values.strokeWidth || 2;

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.fillStyle = fillColor;

        ctx.beginPath();
        this.svgVertices.forEach(function(v, i) {
            if (i === 0) {
                ctx.moveTo(v.x, v.y);
            } else {
                ctx.lineTo(v.x, v.y);
            }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw vertices
        ctx.fillStyle = '#FFFFFF';
        this.svgVertices.forEach(function(v) {
            ctx.beginPath();
            ctx.arc(v.x, v.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    _drawGraphs(ctx, values) {
        if (!this.graphData || this.graphData.length === 0) {
            ctx.fillStyle = '#333333';
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Click "Regenerate Data"', 210, 210);
            return;
        }

        var data = this.graphData;
        var barWidth = (420 - 40) / data.length;
        var maxValue = Math.max.apply(Math, data.map(function(d) { return d.value; }));

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px monospace';

        data.forEach(function(item, i) {
            var x = 20 + i * barWidth;
            var height = (item.value / maxValue) * (420 - 60);
            var y = 420 - 30 - height;

            // Bar
            ctx.fillStyle = '#FF5500';
            ctx.fillRect(x, y, barWidth - 4, height);

            // Label
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x + barWidth / 2, 420 - 15);
        });
    };

    _drawAudio(ctx, values) {
        if (!this.isPlaying) {
            ctx.fillStyle = '#333333';
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Click "Play" to start audio', 210, 210);
            return;
        }

        if (!this.audioNodes || !this.audioNodes.analyser) return;

        // Draw frequency bars
        var analyser = this.audioNodes.analyser;
        var dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        var numBars = 64;
        var step = Math.floor(dataArray.length / numBars);
        var barWidth = (420 - 20) / numBars;

        ctx.fillStyle = '#FFFFFF';
        for (var i = 0; i < numBars; i++) {
            var avg = 0;
            for (var j = 0; j < step; j++) {
                avg += dataArray[i * step + j];
            }
            avg /= step;

            var barHeight = (avg / 255) * (420 - 40);
            ctx.fillRect(
                10 + i * barWidth,
                420 - 20 - barHeight,
                barWidth - 2,
                barHeight
            );
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // BUTTON WIRING
    // ═══════════════════════════════════════════════════════════════════════════════

    _wireButtons(values) {
        var self = this;

        // Wire buttons
        var buttonMappings = {
            'exportPng': function() {
                var canvas = self.tool.getCanvas();
                if (canvas) {
                    var a = document.createElement('a');
                    a.href = canvas.toDataURL('image/png');
                    a.download = 'tool-test.png';
                    a.click();
                }
            },
            'generatePolygon': function() {
                var values = self.tool.getValues();
                self.svgVertices = self._generatePolygon(values.sides || 6, values.radius || 100);
                self.tool.draw();
            },
            'exportSvg': function() {
                if (!self.svgVertices) return;

                var values = self.tool.getValues();
                var fillColor = values.fillColor || '#FF5500';
                var strokeColor = values.strokeColor || '#FFFFFF';
                var strokeWidth = values.strokeWidth || 2;

                var pathData = self.svgVertices.map(function(v, i) {
                    return (i === 0 ? 'M' : 'L') + v.x + ' ' + v.y;
                }).join(' ') + ' Z';

                var svg = '<svg width="420" height="420" xmlns="http://www.w3.org/2000/svg">' +
                          '<path d="' + pathData + '" fill="' + fillColor + '" stroke="' + strokeColor + '" stroke-width="' + strokeWidth + '"/>' +
                          '</svg>';

                var blob = new Blob([svg], { type: 'image/svg+xml' });
                var url = URL.createObjectURL(blob);

                var a = document.createElement('a');
                a.href = url;
                a.download = 'polygon.svg';
                a.click();

                URL.revokeObjectURL(url);
            },
            'regenerateData': function() {
                var values = self.tool.getValues();
                self.graphData = self._generateDataSet(
                    values.dataPoints || 8,
                    values.minValue || 10,
                    values.maxValue || 500
                );
                self.tool.draw();
            },
            'audioPlay': function() {
                self._startAudio();
            },
            'audioStop': function() {
                self._stopAudio();
            }
        };

        // Wire each button
        Object.keys(buttonMappings).forEach(function(key) {
            var button = self.tool.getComponent(key);
            if (button && button.element) {
                button.element.addEventListener('click', buttonMappings[key]);
            }
        });
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // CLEANUP
    // ═══════════════════════════════════════════════════════════════════════════════

    destroy() {
        // Stop animation
        if (this.animationLoop) {
            this.animationLoop.destroy();
            this.animationLoop = null;
        }

        // Stop audio
        this._stopAudio();

        // Close audio context
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        // Destroy ToolBase
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }

        // Clean up wrapper
        if (this.wrapper && this.wrapper.parentNode) {
            this.wrapper.parentNode.removeChild(this.wrapper);
        }
        this.wrapper = null;
        this.modeTabs = null;
        this.contentArea = null;
    }
}

// Export as ToolTest for naming convention (tool-test → ToolTest)
export { ToolTestUI as ToolTest };
// Export as default for default export lookup
export default ToolTestUI;

window.debugLog('TOOLS', '✅ ToolTestUI loaded (ES Module)');