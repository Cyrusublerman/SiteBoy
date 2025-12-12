/**
 * ToolTestUI - Component Testbed using ToolBase
 * 
 * Demonstrates all tool components using the declarative ToolBase pattern.
 * This is the reference implementation for how tool pages should be built.
 * 
 * @version 2.1.0 - Fixed components
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CONFIGURATION - Declarative UI Definition
    // ═══════════════════════════════════════════════════════════════════════════════

    const TOOL_CONFIG = {
        title: 'Tool Test UI',
        
        sidebar: [
            // ═══════════════════════════════════════════════════════════════════════
            // TAB 1: INPUT COMPONENTS
            // ═══════════════════════════════════════════════════════════════════════
            ['INPUT', [
                // Block: Numeric Input variations
                ['Numeric Input', [
                    ['slider', 'Slider Only', 0, 100, 1, { value: 50, withNumber: false }],
                    ['slider', 'Slider + Number', 0, 100, 1, { value: 50, withNumber: true }],
                    ['stepper', 'Slider + Steppers', 0, 100, 1, { value: 50 }],
                ]],
                
                // Block: Text Input
                ['Text Input', [
                    ['text', 'Single Line', '', { placeholder: 'Enter text...' }],
                ]],
                
                // Block: Dropdown
                ['Dropdown', [
                    ['dropdown', 'Custom Dropdown', [
                        { value: 'option1', label: 'Option One' },
                        { value: 'option2', label: 'Option Two' },
                        { value: 'option3', label: 'Option Three' },
                    ]],
                ]],
                
                // Block: Buttons
                ['Button', [
                    ['button', 'Action Button', function() { alert('Button clicked!'); }],
                ]],
                
                // Block: Toggle Group (checkboxes)
                ['Toggle Group', [
                    ['toggle', 'Options', ['Show Grid', 'Animate', 'Fill']],
                ]],
                
                // Block: Radio Group
                ['Radio Group', [
                    ['radio', 'Mode', ['Fast', 'Normal', 'Slow'], { selectedValue: 'Normal' }],
                ]],
                
                // Block: Color Input
                ['Color Input', [
                    ['color', 'Pick Color', '#FF5500', { showHex: true }],
                ]],
                
                // Block: File Input
                ['File Input', [
                    ['file', 'Upload Image', 'image/*', { buttonText: 'Choose...' }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════════
            // TAB 2: OUTPUT COMPONENTS
            // ═══════════════════════════════════════════════════════════════════════
            ['OUTPUT', [
                // Block: Text variants
                ['Text Variants', [
                    ['label', 'Heading Level 3', { variant: 'heading', level: 3 }],
                    ['label', 'This is body text demonstrating the standard paragraph styling.', { variant: 'body' }],
                    ['label', 'Success message!', { variant: 'status', status: 'success' }],
                    ['value', '60', { label: 'Frame Rate', unit: 'fps' }],
                ]],
                
                // Block: Progress Bar
                ['Progress Bar', [
                    ['progress', 'Loading', 65, { key: 'loading_progress' }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════════
            // TAB 3: SPECIAL COMPONENTS
            // ═══════════════════════════════════════════════════════════════════════
            ['SPECIAL', [
                // Block: Equation Editor
                ['Equation Editor', [
                    ['equation', 'y = {A} × sin({f} × x + {φ})', {
                        A: { value: 1.0, min: 0, max: 2, step: 0.1, precision: 1 },
                        f: { value: 2.0, min: 0.1, max: 10, step: 0.1, precision: 1 },
                        φ: { value: 0, min: 0, max: 6.28, step: 0.01, precision: 2 },
                    }],
                ]],
                
                // Block: Combined controls
                ['Combined', [
                    ['slider', 'Amplitude', 0, 100, 1, { value: 75, withNumber: true }],
                    ['dropdown', 'Wave Type', ['Sine', 'Square', 'Triangle', 'Sawtooth']],
                    ['toggle', 'Display', ['Overlay', 'Markers']],
                ]],
            ]],
        ],
        
        canvas: { size: 420 },
        
        // ═══════════════════════════════════════════════════════════════════════════
        // CALLBACKS
        // ═══════════════════════════════════════════════════════════════════════════
        
        onInit: function(values) {
            console.log('🎯 Tool Test UI initialized with values:', values);
            this.frameCount = 0;
        },
        
        onUpdate: function(key, value, allValues) {
            console.log('📝 ' + key + ' changed to:', value);
        },
        
        onDraw: function(ctx, canvas, values) {
            var width = canvas.width;
            var height = canvas.height;
            
            // Clear
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);
            
            // Draw based on values
            var sliderValue = values.slider_only || 50;
            var color = values.pick_color || '#FF5500';
            
            // Draw a circle whose size is controlled by the slider
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            var radius = (sliderValue / 100) * (width / 3);
            ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw crosshairs
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
            ctx.moveTo(width / 2, 0);
            ctx.lineTo(width / 2, height);
            ctx.stroke();
            
            // Draw equation if values exist
            var A = values['equation.A'] || 1;
            var f = values['equation.f'] || 2;
            var phi = values['equation.φ'] || 0;
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (var x = 0; x < width; x++) {
                var normalizedX = (x / width) * Math.PI * 4;
                var y = height / 2 - A * 50 * Math.sin(f * normalizedX + phi);
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CLASS - Wrapper for section integration
    // ═══════════════════════════════════════════════════════════════════════════════

    function ToolTestUI(container, deps) {
        this.container = container;
        this.deps = deps || {};
        this.tool = null;
        this.progressInterval = null;
        
        this.render();
    }
    
    ToolTestUI.prototype.render = function() {
        var self = this;
        
        try {
            // Check if ToolBase is available
            if (!window.ToolBase) {
                throw new Error('ToolBase not loaded');
            }
            
            // Create tool using ToolBase
            this.tool = new window.ToolBase(TOOL_CONFIG, this.deps);
            this.tool.mount(this.container);
            
            // Initial draw
            this.tool.draw();
            
            // Animate progress bar for demo
            this._startProgressAnimation();
            
            console.log('✅ ToolTestUI rendered successfully using ToolBase');
        } catch (error) {
            console.error('❌ ToolTestUI render error:', error);
            this.container.innerHTML = 
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>TOOL TEST UI</h2>' +
                '<p style="color: red;">Error: ' + error.message + '</p>' +
                '<pre style="font-size: 12px; overflow: auto;">' + error.stack + '</pre>' +
                '</div>';
        }
    };
    
    ToolTestUI.prototype._startProgressAnimation = function() {
        var self = this;
        var progress = 0;
        
        this.progressInterval = setInterval(function() {
            progress = (progress + 1) % 101;
            var progressComponent = self.tool && self.tool.getComponent('loading_progress');
            if (progressComponent && typeof progressComponent.setValue === 'function') {
                progressComponent.setValue(progress);
            }
        }, 50);
    };
    
    ToolTestUI.prototype.destroy = function() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    };

    // Make globally available for section routing
    window.ToolTestUI = ToolTestUI;
    
    console.log('✅ ToolTestUI loaded');
})();
