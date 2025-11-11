/**
 * Cymatics Animation - Complete SiteBoy Component
 * Wave interference patterns with full UI controls
 * 
 * FEATURES:
 * - 3 visualization modes (Particle, Density, Radial)
 * - Musical frequency system (12-tone chromatic)
 * - 8 chord presets
 * - 8 template layouts
 * - Parameter controls (Amp, Speed, Boost, Radial Res)
 * - Source management UI
 * - Click to add sources
 * 
 * @version 2.0.0
 */

import { BaseComponent } from '../../../assets/js/shared/foundation.js';
import { AnimationContainer } from '../../../assets/js/shared/animation-container.js';
import { AnimationLoop } from '../../../assets/js/core/animation-foundation.js';

// Musical frequency system
const CHORDS = {
    maj: [0, 4, 7],
    min: [0, 3, 7],
    dim: [0, 3, 6],
    aug: [0, 4, 8],
    maj7: [0, 4, 7, 11],
    min7: [0, 3, 7, 10],
    dom7: [0, 4, 7, 10],
    sus4: [0, 5, 7]
};

class WaveSource {
    constructor(x, y, semitone, amp, id, baseFreq = 440) {
        this.x = x;
        this.y = y;
        this.semitone = semitone;
        this.amp = amp;
        this.id = id;
        this.baseFreq = baseFreq;
        this.updateFreq();
    }

    updateFreq() {
        this.noteFreq = this.baseFreq * Math.pow(2, this.semitone / 12);
        this.freq = this.noteFreq / 10; // Wavelength factor
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

export class CymaticsAnimation extends BaseComponent {
    constructor(container, deps = {}) {
        super({ componentType: 'animation-canvas' }, deps);
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.animator = null;
        this.sources = [];
        this.particles = [];
        this.densityData = null;
        this.t = 0;
        
        // State
        this.vizMode = 'particle';
        this.baseFreq = 440; // A4
        this.selectedSemitone = 0;
        this.currentChord = null;
        this.currentTemplate = null;
        this.sourceIdCounter = 0;
        
        // Parameters
        this.amp = 3;
        this.speed = 0.08;
        this.boost = 3;
        this.radialRes = 1;
        
        this.loopFrames = 0; // Infinite - user controlled
        
        // UI element references
        this.sourceListEl = null;
        this.sourceCountEl = null;
        this.nextFreqEl = null;
    }
    
    render() {
        this.destroy();
        
        const dims = this.calculateDimensions('animation-canvas');
        const F = dims.F || 12;
        
        // Create canvas
        this.canvas = this.createElement('canvas', 'animation-canvas');
        this.canvas.width = dims.dimensions ? dims.dimensions.width : (F * 67);
        this.canvas.height = dims.dimensions ? dims.dimensions.height : (F * 67);
        this.canvas.style.cursor = 'crosshair';
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize
        this.initParticles();
        this.densityData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        
        // Canvas click handler
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
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
        
        // Setup default (Major chord triangle)
        this.setupChord('maj');
        
        // Start animation
        this.startAnimation();
        
        return rendered;
    }
    
    buildUI(animContainer) {
        const { Button, ButtonGroup, Select, Input, Heading } = window.ComponentLibrary;
        
        // VISUALIZATION MODES
        const vizHeading = new Heading({ text: 'VISUALIZATION', level: 3 }, this.deps);
        this.addChild(vizHeading);
        animContainer.addToSidebar(vizHeading.render());
        
        const vizButtons = new ButtonGroup({
            buttons: [
                { label: 'PARTICLE', value: 'particle', active: this.vizMode === 'particle' },
                { label: 'DENSITY', value: 'density', active: this.vizMode === 'density' },
                { label: 'RADIAL', value: 'radial', active: this.vizMode === 'radial' }
            ],
            onSelect: (value) => { this.vizMode = value; }
        }, this.deps);
        this.addChild(vizButtons);
        animContainer.addToSidebar(vizButtons.render());
        
        // BASE NOTE SELECTOR
        const noteHeading = new Heading({ text: 'BASE NOTE', level: 3 }, this.deps);
        this.addChild(noteHeading);
        animContainer.addToSidebar(noteHeading.render());
        
        const noteSelect = new Select({
            options: [
                { value: '261.63', label: 'C4' },
                { value: '277.18', label: 'C#4' },
                { value: '293.66', label: 'D4' },
                { value: '311.13', label: 'D#4' },
                { value: '329.63', label: 'E4' },
                { value: '349.23', label: 'F4' },
                { value: '369.99', label: 'F#4' },
                { value: '392.00', label: 'G4' },
                { value: '415.30', label: 'G#4' },
                { value: '440.00', label: 'A4' },
                { value: '466.16', label: 'A#4' },
                { value: '493.88', label: 'B4' }
            ],
            selected: String(this.baseFreq),
            onChange: (value) => {
                this.baseFreq = parseFloat(value);
                this.updateAllSourceFreqs();
                this.updateNextFreqDisplay();
            }
        }, this.deps);
        this.addChild(noteSelect);
        animContainer.addToSidebar(noteSelect.render());
        
        // NEXT FREQUENCY DISPLAY
        const nextFreqContainer = this.createElement('p');
        nextFreqContainer.style.cssText = `
            margin: calc(var(--f) / 2) 0;
            font-size: calc(var(--f) * 0.85);
            opacity: 0.8;
        `;
        nextFreqContainer.textContent = 'Next click: ';
        this.nextFreqEl = this.createElement('span');
        this.nextFreqEl.style.fontWeight = 'bold';
        nextFreqContainer.appendChild(this.nextFreqEl);
        animContainer.addToSidebar(nextFreqContainer);
        this.updateNextFreqDisplay();
        
        // SEMITONE SELECTOR
        const semitoneHeading = new Heading({ text: 'SEMITONE (NEXT CLICK)', level: 3 }, this.deps);
        this.addChild(semitoneHeading);
        animContainer.addToSidebar(semitoneHeading.render());
        
        const semitoneButtons = new ButtonGroup({
            buttons: Array.from({ length: 12 }, (_, i) => ({
                label: i === 0 ? 'ROOT' : `+${i}`,
                value: i,
                active: this.selectedSemitone === i
            })),
            onSelect: (value) => {
                this.selectedSemitone = value;
                this.updateNextFreqDisplay();
            }
        }, this.deps);
        this.addChild(semitoneButtons);
        animContainer.addToSidebar(semitoneButtons.render());
        
        // CHORD PRESETS
        const chordHeading = new Heading({ text: 'CHORD PRESETS', level: 3 }, this.deps);
        this.addChild(chordHeading);
        animContainer.addToSidebar(chordHeading.render());
        
        const chordInfo = this.createElement('p');
        chordInfo.style.cssText = `
            margin: 0 0 calc(var(--f) / 2) 0;
            font-size: calc(var(--f) * 0.75);
            opacity: 0.6;
        `;
        chordInfo.textContent = 'Sets frequencies, then pick template for positions';
        animContainer.addToSidebar(chordInfo);
        
        const chordButtons = new ButtonGroup({
            buttons: [
                { label: 'MAJOR', value: 'maj', active: false },
                { label: 'MINOR', value: 'min', active: false },
                { label: 'DIM', value: 'dim', active: false },
                { label: 'AUG', value: 'aug', active: false },
                { label: 'MAJ7', value: 'maj7', active: false },
                { label: 'MIN7', value: 'min7', active: false },
                { label: 'DOM7', value: 'dom7', active: false },
                { label: 'SUS4', value: 'sus4', active: false }
            ],
            onSelect: (value) => { this.setupChord(value); }
        }, this.deps);
        this.addChild(chordButtons);
        animContainer.addToSidebar(chordButtons.render());
        
        // TEMPLATE PRESETS
        const templateHeading = new Heading({ text: 'TEMPLATES', level: 3 }, this.deps);
        this.addChild(templateHeading);
        animContainer.addToSidebar(templateHeading.render());
        
        const templateInfo = this.createElement('p');
        templateInfo.style.cssText = `
            margin: 0 0 calc(var(--f) / 2) 0;
            font-size: calc(var(--f) * 0.75);
            opacity: 0.6;
        `;
        templateInfo.textContent = 'Changes positions, keeps frequencies';
        animContainer.addToSidebar(templateInfo);
        
        const templateButtons = new ButtonGroup({
            buttons: [
                { label: 'CIRCLE 6', value: 'circle6', active: false },
                { label: 'CIRCLE 12', value: 'circle12', active: false },
                { label: 'GRID 3×3', value: 'grid3', active: false },
                { label: 'GRID 4×4', value: 'grid4', active: false },
                { label: 'STAR 5', value: 'star5', active: false },
                { label: 'STAR 8', value: 'star8', active: false },
                { label: 'CORNERS', value: 'corners', active: false },
                { label: 'CROSS', value: 'cross', active: false }
            ],
            onSelect: (value) => { this.setupTemplate(value); }
        }, this.deps);
        this.addChild(templateButtons);
        animContainer.addToSidebar(templateButtons.render());
        
        // PARAMETERS
        const paramsHeading = new Heading({ text: 'PARAMETERS', level: 3 }, this.deps);
        this.addChild(paramsHeading);
        animContainer.addToSidebar(paramsHeading.render());
        
        // Amp
        const ampRow = this.createElement('div', 'param-row');
        ampRow.style.cssText = `display: flex; align-items: center; gap: calc(var(--f)); margin-bottom: calc(var(--f) / 2);`;
        const ampLabel = this.createElement('label');
        ampLabel.textContent = 'Amp:';
        ampLabel.style.minWidth = `calc(var(--f) * 6)`;
        const ampInput = new Input({
            type: 'number',
            value: this.amp,
            step: 0.5,
            onChange: (value) => { this.amp = parseFloat(value); }
        }, this.deps);
        this.addChild(ampInput);
        ampRow.appendChild(ampLabel);
        ampRow.appendChild(ampInput.render());
        animContainer.addToSidebar(ampRow);
        
        // Speed
        const speedRow = this.createElement('div', 'param-row');
        speedRow.style.cssText = `display: flex; align-items: center; gap: calc(var(--f)); margin-bottom: calc(var(--f) / 2);`;
        const speedLabel = this.createElement('label');
        speedLabel.textContent = 'Speed:';
        speedLabel.style.minWidth = `calc(var(--f) * 6)`;
        const speedInput = new Input({
            type: 'number',
            value: this.speed,
            step: 0.01,
            onChange: (value) => { this.speed = parseFloat(value); }
        }, this.deps);
        this.addChild(speedInput);
        speedRow.appendChild(speedLabel);
        speedRow.appendChild(speedInput.render());
        animContainer.addToSidebar(speedRow);
        
        // Boost
        const boostRow = this.createElement('div', 'param-row');
        boostRow.style.cssText = `display: flex; align-items: center; gap: calc(var(--f)); margin-bottom: calc(var(--f) / 2);`;
        const boostLabel = this.createElement('label');
        boostLabel.textContent = 'Boost:';
        boostLabel.style.minWidth = `calc(var(--f) * 6)`;
        const boostInput = new Input({
            type: 'number',
            value: this.boost,
            step: 0.1,
            min: 0.1,
            max: 10,
            onChange: (value) => { this.boost = parseFloat(value); }
        }, this.deps);
        this.addChild(boostInput);
        boostRow.appendChild(boostLabel);
        boostRow.appendChild(boostInput.render());
        animContainer.addToSidebar(boostRow);
        
        // Radial Res
        const radialRow = this.createElement('div', 'param-row');
        radialRow.style.cssText = `display: flex; align-items: center; gap: calc(var(--f)); margin-bottom: calc(var(--f) / 2);`;
        const radialLabel = this.createElement('label');
        radialLabel.textContent = 'Radial Res:';
        radialLabel.style.minWidth = `calc(var(--f) * 6)`;
        const radialInput = new Input({
            type: 'number',
            value: this.radialRes,
            step: 1,
            min: 1,
            max: 10,
            onChange: (value) => { this.radialRes = parseInt(value); }
        }, this.deps);
        this.addChild(radialInput);
        radialRow.appendChild(radialLabel);
        radialRow.appendChild(radialInput.render());
        animContainer.addToSidebar(radialRow);
        
        // SOURCE LIST
        const sourcesHeading = new Heading({ text: 'SOURCES', level: 3 }, this.deps);
        this.addChild(sourcesHeading);
        animContainer.addToSidebar(sourcesHeading.render());
        
        const sourceHeader = this.createElement('p');
        sourceHeader.style.cssText = `
            margin: 0 0 calc(var(--f) / 2) 0;
            font-size: calc(var(--f) * 0.85);
        `;
        sourceHeader.textContent = 'Count: ';
        this.sourceCountEl = this.createElement('span');
        this.sourceCountEl.style.fontWeight = 'bold';
        sourceHeader.appendChild(this.sourceCountEl);
        animContainer.addToSidebar(sourceHeader);
        
        this.sourceListEl = this.createElement('div', 'source-list');
        this.sourceListEl.style.cssText = `
            max-height: calc(var(--f) * 15);
            overflow-y: auto;
            border: 1px solid var(--c-border);
            padding: calc(var(--f) / 2);
            font-size: calc(var(--f) * 0.85);
            margin-bottom: calc(var(--f));
        `;
        animContainer.addToSidebar(this.sourceListEl);
        
        // CLEAR BUTTON
        const clearBtn = new Button({
            text: 'CLEAR ALL',
            onClick: () => this.clearSources()
        }, this.deps);
        this.addChild(clearBtn);
        animContainer.addToSidebar(clearBtn.render());
        
        // Initial update
        this.updateSourceList();
    }
    
    initParticles() {
        this.particles = [];
        for (let y = 0; y < this.canvas.height; y += 5) {
            for (let x = 0; x < this.canvas.width; x += 5) {
                this.particles.push({ x, y, ox: x, oy: y });
            }
        }
    }
    
    startAnimation() {
        this.animator = new AnimationLoop({
            onFrame: () => this.draw()
        });
        this.animator.start();
    }
    
    onResize(width, height) {
        if (!this.canvas) return;
        this.canvas.width = width;
        this.canvas.height = height;
        this.initParticles();
        this.densityData = this.ctx.createImageData(width, height);
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        this.addSource(x, y, this.selectedSemitone, this.amp);
    }
    
    addSource(x, y, semitone, amp) {
        const id = this.sourceIdCounter++;
        this.sources.push(new WaveSource(x, y, semitone, amp, id, this.baseFreq));
        this.updateSourceList();
    }
    
    removeSource(id) {
        const idx = this.sources.findIndex(s => s.id === id);
        if (idx !== -1) {
            this.sources.splice(idx, 1);
            this.updateSourceList();
        }
    }
    
    clearSources() {
        this.sources = [];
        this.currentChord = null;
        this.currentTemplate = null;
        this.updateSourceList();
    }
    
    updateAllSourceFreqs() {
        this.sources.forEach(s => {
            s.baseFreq = this.baseFreq;
            s.updateFreq();
        });
        this.updateSourceList();
    }
    
    updateNextFreqDisplay() {
        if (this.nextFreqEl) {
            const nextFreq = this.baseFreq * Math.pow(2, this.selectedSemitone / 12);
            this.nextFreqEl.textContent = `${Math.round(nextFreq)} Hz`;
        }
    }
    
    updateSourceList() {
        if (this.sourceCountEl) {
            this.sourceCountEl.textContent = this.sources.length;
        }
        
        if (!this.sourceListEl) return;
        
        if (this.sources.length === 0) {
            this.sourceListEl.textContent = 'No sources - click canvas or use presets';
            return;
        }
        
        this.sourceListEl.innerHTML = '';
        this.sources.forEach(s => {
            const item = this.createElement('div', 'source-item');
            item.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: calc(var(--f) / 4) 0;
                border-bottom: 1px solid var(--c-border-light);
            `;
            
            const info = this.createElement('span');
            info.textContent = `S${s.id}: +${s.semitone} (${Math.round(s.noteFreq)}Hz) A=${s.amp.toFixed(1)}`;
            
            const removeBtn = this.createElement('button');
            removeBtn.textContent = 'X';
            removeBtn.style.cssText = `
                padding: 0 calc(var(--f) / 2);
                font-size: calc(var(--f) * 0.75);
                min-width: unset;
            `;
            removeBtn.addEventListener('click', () => this.removeSource(s.id));
            
            item.appendChild(info);
            item.appendChild(removeBtn);
            this.sourceListEl.appendChild(item);
        });
    }
    
    setupChord(chordType) {
        this.currentChord = chordType;
        this.applyChordAndTemplate();
    }
    
    setupTemplate(template) {
        this.currentTemplate = template;
        this.applyChordAndTemplate();
    }
    
    applyChordAndTemplate() {
        this.sources = [];
        this.sourceIdCounter = 0;
        
        let positions;
        const W = this.canvas.width;
        const H = this.canvas.height;
        const cx = W / 2;
        const cy = H / 2;
        
        // Get positions from template
        if (this.currentTemplate) {
            positions = this.getTemplatePositions(this.currentTemplate);
        } else if (this.currentChord) {
            const intervals = CHORDS[this.currentChord];
            positions = intervals.length === 3 ? 
                [[W/2, H/4], [W/4, 3*H/4], [3*W/4, 3*H/4]] :
                [[W/3, H/3], [2*W/3, H/3], [W/3, 2*H/3], [2*W/3, 2*H/3]];
        } else {
            return;
        }
        
        // Get semitones from chord
        const semitones = this.currentChord ? CHORDS[this.currentChord] : [0];
        
        // Create sources
        positions.forEach((pos, i) => {
            const semitone = semitones[i % semitones.length];
            this.addSource(pos[0], pos[1], semitone, this.amp);
        });
    }
    
    getTemplatePositions(template) {
        const W = this.canvas.width;
        const H = this.canvas.height;
        const cx = W / 2;
        const cy = H / 2;
        const positions = [];
        
        switch(template) {
            case 'circle6':
                for (let i = 0; i < 6; i++) {
                    const a = (i / 6) * Math.PI * 2;
                    positions.push([cx + Math.cos(a) * (W * 0.3), cy + Math.sin(a) * (H * 0.3)]);
                }
                break;
            case 'circle12':
                for (let i = 0; i < 12; i++) {
                    const a = (i / 12) * Math.PI * 2;
                    positions.push([cx + Math.cos(a) * (W * 0.35), cy + Math.sin(a) * (H * 0.35)]);
                }
                break;
            case 'grid3':
                const spacing3 = W / 4;
                for (let i = 1; i <= 3; i++) {
                    for (let j = 1; j <= 3; j++) {
                        positions.push([spacing3 * i, (H / 4) * j]);
                    }
                }
                break;
            case 'grid4':
                const spacing4 = W / 5;
                for (let i = 1; i <= 4; i++) {
                    for (let j = 1; j <= 4; j++) {
                        positions.push([spacing4 * i, (H / 5) * j]);
                    }
                }
                break;
            case 'star5':
                for (let i = 0; i < 5; i++) {
                    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
                    positions.push([cx + Math.cos(a) * (W * 0.3), cy + Math.sin(a) * (H * 0.3)]);
                }
                break;
            case 'star8':
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8) * Math.PI * 2;
                    positions.push([cx + Math.cos(a) * (W * 0.33), cy + Math.sin(a) * (H * 0.33)]);
                }
                break;
            case 'corners':
                const m = W * 0.15;
                positions.push([m, m], [W - m, m], [m, H - m], [W - m, H - m]);
                break;
            case 'cross':
                positions.push([cx, H * 0.15], [cx, H * 0.85], [W * 0.15, cy], [W * 0.85, cy], [cx, cy]);
                break;
        }
        
        return positions;
    }
    
    draw() {
        if (!this.ctx) return;
        
        this.t += this.speed;
        
        if (this.vizMode === 'particle') {
            this.drawParticle();
        } else if (this.vizMode === 'density') {
            this.drawDensity();
        } else if (this.vizMode === 'radial') {
            this.drawRadial();
        }
    }
    
    drawParticle() {
        // Update particles
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
        
        // Draw
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let p of this.particles) {
            const disp = Math.sqrt((p.x - p.ox) ** 2 + (p.y - p.oy) ** 2);
            const alpha = Math.min(disp * 0.15, 1);
            if (alpha > 0.05) {
                this.ctx.fillStyle = `rgba(192, 192, 192, ${alpha})`;
                this.ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
            }
        }
        
        this.drawSources();
    }
    
    drawDensity() {
        if (this.sources.length === 0) {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        
        const data = this.densityData.data;
        const W = this.canvas.width;
        const H = this.canvas.height;
        
        let minIntensity = Infinity;
        let maxIntensity = -Infinity;
        const intensities = new Float32Array(W * H);
        
        let idx = 0;
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                let total = 0;
                for (let s of this.sources) {
                    total += Math.abs(s.getWave(x, y, this.t));
                }
                intensities[idx] = total;
                if (total < minIntensity) minIntensity = total;
                if (total > maxIntensity) maxIntensity = total;
                idx++;
            }
        }
        
        const range = maxIntensity - minIntensity || 1;
        
        for (let i = 0; i < intensities.length; i++) {
            let normalized = (intensities[i] - minIntensity) / range;
            normalized = Math.pow(normalized, 1 / this.boost);
            const grey = Math.floor(normalized * 255);
            
            const pixelIdx = i * 4;
            data[pixelIdx] = grey;
            data[pixelIdx + 1] = grey;
            data[pixelIdx + 2] = grey;
            data[pixelIdx + 3] = 255;
        }
        
        this.ctx.putImageData(this.densityData, 0, 0);
        this.drawSources();
    }
    
    drawRadial() {
        if (this.sources.length === 0) {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const W = this.canvas.width;
        const H = this.canvas.height;
        const res = Math.max(1, this.radialRes);
        
        let minIntensity = Infinity;
        let maxIntensity = -Infinity;
        const points = [];
        
        for (let y = 0; y < H; y += res) {
            for (let x = 0; x < W; x += res) {
                let total = 0;
                for (let s of this.sources) {
                    total += Math.abs(s.getWave(x, y, this.t));
                }
                points.push({ x, y, intensity: total });
                if (total < minIntensity) minIntensity = total;
                if (total > maxIntensity) maxIntensity = total;
            }
        }
        
        const range = maxIntensity - minIntensity || 1;
        
        for (let p of points) {
            let normalized = (p.intensity - minIntensity) / range;
            normalized = Math.pow(normalized, 1 / this.boost);
            
            if (normalized > 0.05) {
                const grey = Math.floor(normalized * 255);
                this.ctx.fillStyle = `rgb(${grey},${grey},${grey})`;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, Math.max(1, res * 0.8), 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        this.drawSources();
    }
    
    drawSources() {
        this.ctx.fillStyle = '#fff';
        for (let s of this.sources) {
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    destroy() {
        if (this.animator) {
            this.animator.destroy();
            this.animator = null;
        }
        super.destroy();
    }
}

// Export globally for art_section.js compatibility
window.CymaticsAnimation = CymaticsAnimation;
