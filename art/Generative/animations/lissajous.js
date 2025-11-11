/**
 * Lissajous Animation - Enhanced SiteBoy Component
 * Parametric harmonic curves with full parameter control
 * 
 * FEATURES:
 * - Full parameter editor (amplitude, frequency, power, phase)
 * - 20 curated presets from original
 * - Rotation control
 * - Real-time parameter adjustment
 * 
 * @version 2.0.0
 */

import { BaseComponent } from '../../../assets/js/shared/foundation.js';
import { AnimationContainer } from '../../../assets/js/shared/animation-container.js';
import { AnimationLoop } from '../../../assets/js/core/animation-foundation.js';

export class LissajousAnimation extends BaseComponent {
    constructor(container, deps = {}) {
        super({ componentType: 'animation-canvas' }, deps);
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.animator = null;
        this.t = 0;
        
        // Parameters (simplified from 27-param system)
        this.params = {
            // X-axis term 1
            Ax1: 1, wx1: 1, px1: 1, phi_x1: 0,
            // X-axis term 2
            Ax2: 0, wx2: 1, px2: 1, phi_x2: 0,
            // Y-axis term 1
            Ay1: 1, wy1: 1, py1: 1, phi_y1: 0,
            // Y-axis term 2
            Ay2: 0, wy2: 1, py2: 1, phi_y2: 0,
            // Modulation
            Mx: 0, wxm1: 1, pxm1: 1, wxm2: 1, pxm2: 1,
            My: 0, wym1: 1, pym1: 1, wym2: 1, pym2: 1,
            // Global
            rotation: 0
        };
        
        // Curated presets from original
        this.presets = [
            { name: 'Rosette: 1:3', Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 3, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 3, py2: 1 },
            { name: 'Rosette: 1:5', Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 5, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 5, py2: 1 },
            { name: 'Dense Rosette: 1:10', Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 10, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 10, py2: 1 },
            { name: 'Asymmetric Flow: 3:5', Ax1: 1, wx1: 3, px1: 1, Ax2: -1, wx2: 5, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 5, py2: 1 },
            { name: 'Asymmetric Flow: 3:5:6', Ax1: 1, wx1: 3, px1: 1, Ax2: -1, wx2: 5, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 6, py2: 1 },
            { name: 'Asymmetric Flow: 1:5:7', Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 5, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 7, py2: 1 },
            { name: 'Cubic Star: 1:2', Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 2, px2: 3, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 2, py2: 3 },
            { name: 'Cubic Spiro: 1:7', Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 7, px2: 3, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 7, py2: 3 },
            { name: 'Involute Rosette: 1:3', Ax1: 1, wx1: 1, px1: 1, Ax2: 1, wx2: 3, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 3, py2: 1 },
            { name: 'Involute Rosette: 1:5', Ax1: 1, wx1: 1, px1: 1, Ax2: 1, wx2: 5, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 5, py2: 1 },
            { name: 'Spiroform: 3:5', Ax1: 1, wx1: 3, px1: 1, Ax2: -1, wx2: 5, px2: 1, Ay1: 1, wy1: 3, py1: 1, Ay2: -1, wy2: 5, py2: 1 },
            { name: 'Offset Loop: 1:2:3', Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 2, px2: 1, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 3, py2: 1 },
            { name: 'Cubic Filament: 180hz', Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 180, px2: 3, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 180, py2: 3 },
            { name: 'Cubic Static: 550hz', Ax1: 1, wx1: 1, px1: 1, Ax2: -1, wx2: 550, px2: 3, Ay1: 1, wy1: 1, py1: 1, Ay2: -1, wy2: 550, py2: 3 },
            { name: 'Cubic Weave: 100hz', Ax1: 1, wx1: 1, px1: 3, Ax2: -1, wx2: 100, px2: 3, Ay1: 1, wy1: 1, py1: 3, Ay2: -1, wy2: 100, py2: 3 },
            { name: 'Woven Web: 80hz', Ax1: 1, wx1: 1, px1: 1, Ay1: 1, wy1: 1, py1: 1, Mx: -1, wxm1: 1, pxm1: 1, wxm2: 80, pxm2: 1, Ay2: -1, wy2: 80, py2: 1 },
            { name: 'Woven Bloom: 120hz', Ax1: 2, wx1: 1, px1: 1, Ay1: 1, wy1: 1, py1: 1, Mx: -1, wxm1: 1, pxm1: 1, wxm2: 120, pxm2: 1, My: -1, wym1: 2, pym1: 1, wym2: 120, pym2: 1 },
            { name: 'Modulated Ring: 60hz', Ax1: 1, wx1: 60, px1: 1, Ay1: 1, wy1: 60, py1: 1, Mx: -1, wxm1: 60, pxm1: 1, wxm2: 1, pxm2: 1, Ay2: -1, wy2: 1, py2: 1 },
            { name: 'Fine Web: 80hz', Ax1: 0.1, wx1: 1, px1: 1, Ay1: 1, wy1: 1, py1: 1, Mx: -1, wxm1: 1, pxm1: 1, wxm2: 80, pxm2: 1, Ay2: -1, wy2: 80, py2: 1 },
            { name: 'Warped Field: 100hz', Ax1: 1, wx1: 1, px1: 1, Ay1: 1, wy1: 1, py1: 1, Mx: -1, wxm1: 100, pxm1: 1, wxm2: 2, pxm2: 1, Ay2: -1, wy2: 100, py2: 1 }
        ];
        
        this.loopFrames = 0;
        this.exportScale = 1;
        this.pointCount = 20000;
    }
    
    render() {
        this.destroy();
        
        const dims = this.calculateDimensions('animation-canvas');
        const F = dims.F || 12;
        
        // Create canvas
        this.canvas = this.createElement('canvas', 'animation-canvas');
        this.canvas.width = dims.dimensions ? dims.dimensions.width : (F * 67);
        this.canvas.height = dims.dimensions ? dims.dimensions.height : (F * 67);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        
        // Create animation container
        const animContainer = new AnimationContainer({
            enableExport: true,
            animationInstance: this,
            loopFrames: this.loopFrames
        }, this.deps);
        this.addChild(animContainer);
        
        animContainer.setCanvas(this.canvas);
        
        // Build UI
        this.buildUI(animContainer);
        
        // Render container
        const rendered = animContainer.render();
        this.container.appendChild(rendered);
        
        // Start animation
        this.startAnimation();
        
        return rendered;
    }
    
    buildUI(animContainer) {
        const { Button, Input, Heading, Select } = window.ComponentLibrary;
        
        // PRESETS
        const presetsHeading = new Heading({ text: 'PRESETS', level: 3 }, this.deps);
        this.addChild(presetsHeading);
        animContainer.addToSidebar(presetsHeading.render());
        
        const presetSelect = new Select({
            options: [
                { value: '-1', label: 'Select Preset...' },
                ...this.presets.map((p, i) => ({ value: String(i), label: p.name }))
            ],
            selected: '-1',
            onChange: (value) => {
                if (value !== '-1') {
                    this.loadPreset(this.presets[parseInt(value)]);
                }
            }
        }, this.deps);
        this.addChild(presetSelect);
        animContainer.addToSidebar(presetSelect.render());
        
        // X-AXIS PARAMETERS
        const xHeading = new Heading({ text: 'X-AXIS (Term 1)', level: 3 }, this.deps);
        this.addChild(xHeading);
        animContainer.addToSidebar(xHeading.render());
        
        this.createParamRow(animContainer, 'Amp (Ax1)', 'Ax1', -2, 2, 0.1);
        this.createParamRow(animContainer, 'Freq (wx1)', 'wx1', -20, 20, 1);
        this.createParamRow(animContainer, 'Power (px1)', 'px1', -5, 5, 0.5);
        this.createParamRow(animContainer, 'Phase (φx1)', 'phi_x1', -6.28, 6.28, 0.1);
        
        // X-AXIS TERM 2
        const x2Heading = new Heading({ text: 'X-AXIS (Term 2)', level: 3 }, this.deps);
        this.addChild(x2Heading);
        animContainer.addToSidebar(x2Heading.render());
        
        this.createParamRow(animContainer, 'Amp (Ax2)', 'Ax2', -2, 2, 0.1);
        this.createParamRow(animContainer, 'Freq (wx2)', 'wx2', -20, 20, 1);
        this.createParamRow(animContainer, 'Power (px2)', 'px2', -5, 5, 0.5);
        
        // Y-AXIS PARAMETERS
        const yHeading = new Heading({ text: 'Y-AXIS (Term 1)', level: 3 }, this.deps);
        this.addChild(yHeading);
        animContainer.addToSidebar(yHeading.render());
        
        this.createParamRow(animContainer, 'Amp (Ay1)', 'Ay1', -2, 2, 0.1);
        this.createParamRow(animContainer, 'Freq (wy1)', 'wy1', -20, 20, 1);
        this.createParamRow(animContainer, 'Power (py1)', 'py1', -5, 5, 0.5);
        this.createParamRow(animContainer, 'Phase (φy1)', 'phi_y1', -6.28, 6.28, 0.1);
        
        // Y-AXIS TERM 2
        const y2Heading = new Heading({ text: 'Y-AXIS (Term 2)', level: 3 }, this.deps);
        this.addChild(y2Heading);
        animContainer.addToSidebar(y2Heading.render());
        
        this.createParamRow(animContainer, 'Amp (Ay2)', 'Ay2', -2, 2, 0.1);
        this.createParamRow(animContainer, 'Freq (wy2)', 'wy2', -20, 20, 1);
        this.createParamRow(animContainer, 'Power (py2)', 'py2', -5, 5, 0.5);
        
        // MODULATION
        const modHeading = new Heading({ text: 'MODULATION', level: 3 }, this.deps);
        this.addChild(modHeading);
        animContainer.addToSidebar(modHeading.render());
        
        this.createParamRow(animContainer, 'X Mod (Mx)', 'Mx', -2, 2, 0.1);
        this.createParamRow(animContainer, 'X Mod Freq 1', 'wxm1', 0, 100, 1);
        this.createParamRow(animContainer, 'X Mod Freq 2', 'wxm2', 0, 100, 1);
        this.createParamRow(animContainer, 'Y Mod (My)', 'My', -2, 2, 0.1);
        this.createParamRow(animContainer, 'Y Mod Freq 1', 'wym1', 0, 100, 1);
        this.createParamRow(animContainer, 'Y Mod Freq 2', 'wym2', 0, 100, 1);
        
        // GLOBAL CONTROLS
        const globalHeading = new Heading({ text: 'GLOBAL', level: 3 }, this.deps);
        this.addChild(globalHeading);
        animContainer.addToSidebar(globalHeading.render());
        
        this.createParamRow(animContainer, 'Rotation (°)', 'rotation', 0, 360, 1);
        this.createParamRow(animContainer, 'Points', 'pointCount', 1000, 50000, 1000, true);
        
        // RESET BUTTON
        const resetBtn = new Button({
            text: 'RESET ALL',
            onClick: () => this.resetParameters()
        }, this.deps);
        this.addChild(resetBtn);
        animContainer.addToSidebar(resetBtn.render());
    }
    
    createParamRow(animContainer, label, key, min, max, step, isGlobal = false) {
        const { Input } = window.ComponentLibrary;
        
        const row = this.createElement('div', 'param-row');
        row.style.cssText = `
            display: flex;
            align-items: center;
            gap: calc(var(--f));
            margin-bottom: calc(var(--f) / 2);
        `;
        
        const labelEl = this.createElement('label');
        labelEl.textContent = label + ':';
        labelEl.style.cssText = `
            min-width: calc(var(--f) * 10);
            font-size: calc(var(--f) * 0.85);
        `;
        
        const value = isGlobal ? this[key] : this.params[key];
        
        const input = new Input({
            type: 'number',
            value: value,
            min: min,
            max: max,
            step: step,
            onChange: (val) => {
                if (isGlobal) {
                    this[key] = parseFloat(val);
                } else {
                    this.params[key] = parseFloat(val);
                }
            }
        }, this.deps);
        this.addChild(input);
        
        row.appendChild(labelEl);
        row.appendChild(input.render());
        animContainer.addToSidebar(row);
    }
    
    loadPreset(preset) {
        // Reset all to defaults first
        this.resetParameters();
        
        // Apply preset values
        Object.keys(preset).forEach(key => {
            if (key !== 'name' && this.params.hasOwnProperty(key)) {
                this.params[key] = preset[key];
            }
        });
    }
    
    resetParameters() {
        this.params = {
            Ax1: 1, wx1: 1, px1: 1, phi_x1: 0,
            Ax2: 0, wx2: 1, px2: 1, phi_x2: 0,
            Ay1: 1, wy1: 1, py1: 1, phi_y1: 0,
            Ay2: 0, wy2: 1, py2: 1, phi_y2: 0,
            Mx: 0, wxm1: 1, pxm1: 1, wxm2: 1, pxm2: 1,
            My: 0, wym1: 1, pym1: 1, wym2: 1, pym2: 1,
            rotation: 0
        };
    }
    
    startAnimation() {
        this.animator = new AnimationLoop({
            onFrame: () => this.draw()
        });
        this.animator.start();
    }
    
    evaluate(t) {
        const p = this.params;
        const safePow = (base, exp) => {
            if (Math.abs(base) < 1e-9 && exp < 0) return 0;
            return Math.sign(base) * Math.pow(Math.abs(base), exp);
        };
        
        // Rotation transform
        const rot = (p.rotation || 0) * Math.PI / 180;
        const cosRot = Math.cos(rot);
        const sinRot = Math.sin(rot);
        
        // X equation: Ax1*cos(wx1*t)^px1 + Ax2*cos(wx2*t)^px2 + Mx*cos(wxm1*t)^pxm1*sin(wxm2*t)^pxm2
        const x = p.Ax1 * safePow(Math.cos(p.wx1 * t + p.phi_x1), p.px1) +
                  p.Ax2 * safePow(Math.cos(p.wx2 * t + p.phi_x2), p.px2) +
                  p.Mx * safePow(Math.cos(p.wxm1 * t), p.pxm1) * safePow(Math.sin(p.wxm2 * t), p.pxm2);
        
        // Y equation: similar structure
        const y = p.Ay1 * safePow(Math.sin(p.wy1 * t + p.phi_y1), p.py1) +
                  p.Ay2 * safePow(Math.sin(p.wy2 * t + p.phi_y2), p.py2) +
                  p.My * safePow(Math.sin(p.wym1 * t), p.pym1) * safePow(Math.cos(p.wym2 * t), p.pym2);
        
        // Apply rotation
        if (rot !== 0) {
            return {
                x: x * cosRot - y * sinRot,
                y: x * sinRot + y * cosRot
            };
        }
        
        return { x, y };
    }
    
    draw() {
        if (!this.ctx) return;
        
        this.t += 0.01;
        
        // Clear
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw curve
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const scale = Math.min(w, h) * 0.35;
        
        // Apply export scale if set
        const exportScale = this.exportScale || 1;
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.scale(exportScale, exportScale);
        this.ctx.translate(-cx, -cy);
        
        this.ctx.strokeStyle = '#f5f5f5';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        
        let started = false;
        for (let i = 0; i <= this.pointCount; i++) {
            const t = (i / this.pointCount) * 2 * Math.PI;
            const { x, y } = this.evaluate(t);
            
            if (!isFinite(x) || !isFinite(y)) {
                started = false;
                continue;
            }
            
            const screenX = cx + x * scale;
            const screenY = cy - y * scale;
            
            if (!started) {
                this.ctx.moveTo(screenX, screenY);
                started = true;
            } else {
                this.ctx.lineTo(screenX, screenY);
            }
        }
        
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    destroy() {
        if (this.animator) {
            this.animator.destroy();
            this.animator = null;
        }
        super.destroy();
    }
}

window.LissajousAnimation = LissajousAnimation;
