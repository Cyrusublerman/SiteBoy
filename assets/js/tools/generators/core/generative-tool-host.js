/**
 * GenerativeToolHost - Host component for generative art scripts
 * 
 * Responsibilities:
 * - Display toolbar for script selection, display mode, and export
 * - Load script configurations from registry
 * - Generate ToolBase UI from script parameters
 * - Manage animation lifecycle
 * - Handle presets, randomization, reset
 * - Coordinate exports
 * 
 * Single Responsibility: Host scripts, delegate drawing to script's draw function
 * 
 * Architecture:
 * - Toolbar (top): Generator dropdown, Fit/Fill/Actual, Export
 * - Sidebar (left): Dynamic controls for current script
 * - Canvas (right): Script rendering
 * 
 * @extends BaseComponent
 * @version 2.0.0 - Toolbar-based unified interface
 */

import { BaseComponent } from '../../../shared/foundation.js';
import { ToolBase } from '../../core/tool-base.js';
import ScriptRegistry from './script-registry.js';
import { buildSidebarConfig } from './parameter-builder.js';
import { getDefaultParams, applyPreset, randomizeParams } from '../shared/presets.js';
import { AnimationLoop } from '../../../core/animation-foundation.js';
import { GeneratorToolbar } from '../../../shared/components/tool/GeneratorToolbar.js';
import { P5Canvas } from '../../../shared/p5-integration.js';

export class GenerativeToolHost extends BaseComponent {
    constructor(container, initialScriptId = null, deps = {}) {
        // Validate deps BEFORE calling super
        if (!deps.ComponentLibrary) {
            console.error('❌ GenerativeToolHost: ComponentLibrary missing in deps!');
            if (window.ComponentLibrary) {
                console.warn('⚠️ Using window.ComponentLibrary as fallback');
                deps.ComponentLibrary = window.ComponentLibrary;
            } else {
                throw new Error('ComponentLibrary not available - cannot initialize GenerativeToolHost');
            }
        }
        
        super({ componentType: 'generative-host' }, deps);
        
        window.debugLog('TOOLS', '🎨 GenerativeToolHost constructor called');
        
        this.container = container;
        this.deps = deps;
        this.componentInstances = []; // Track child components for cleanup
        
        // State
        this.scriptId = initialScriptId || 'harmonics'; // Default to harmonics
        this.scriptConfig = null;
        this.params = {};
        this.tool = null;
        this.toolbar = null;
        this.animator = null;
        this.frame = 0;
        this.isPlaying = false;
        this.phaseAnimationState = {};
        this.displayMode = 'fit';
        this.p5Instance = null;  // p5.js instance for context: 'p5'
        this.isP5Context = false; // Flag for p5 mode
        
        // Get all available generators from registry
        this.generators = this._buildGeneratorList();
        
        // Initialize
        this.init();
    }
    
    /**
     * Build list of generators from registry for toolbar dropdown
     */
    _buildGeneratorList() {
        const byCategory = ScriptRegistry.getByCategory();
        const generators = [];
        
        for (const [category, scriptIds] of Object.entries(byCategory)) {
            for (const id of scriptIds) {
                const meta = ScriptRegistry.getMetadata(id);
                generators.push({
                    id: id,
                    title: meta.title,
                    category: category
                });
            }
        }
        
        return generators;
    }
    
    /**
     * Initialize host - build container layout
     */
    async init() {
        try {
            window.debugLog('TOOLS', `🎨 Initializing GenerativeToolHost`);
            
            // Build the overall container structure
            this._buildContainerLayout();
            
            // Load initial script
            await this._loadScript(this.scriptId);
            
            window.debugLog('TOOLS', `✅ GenerativeToolHost initialized with "${this.scriptId}"`);
            
        } catch (error) {
            console.error('❌ Failed to initialize GenerativeToolHost:', error);
            this.container.innerHTML = `
                <div style="padding: 20px; color: var(--c-text);">
                    <h2>Generator Load Error</h2>
                    <p style="color: red;">${error.message}</p>
                </div>
            `;
        }
    }
    
    /**
     * Build the container layout with toolbar at top
     */
    _buildContainerLayout() {
        // Clear container
        this.container.innerHTML = '';
        
        // Create wrapper
        this.wrapperEl = document.createElement('div');
        this.wrapperEl.className = 'generative-host-wrapper';
        this.wrapperEl.style.cssText = `
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            overflow: hidden;
        `;
        
        // Create toolbar (using direct import)
        this.toolbar = new GeneratorToolbar({
            generators: this.generators,
            activeGenerator: this.scriptId,
            displayMode: this.displayMode,
            onGeneratorChange: (id) => this._handleGeneratorChange(id),
            onDisplayModeChange: (mode) => this._handleDisplayModeChange(mode),
            onExport: (frameCount) => this._handleExport(frameCount)
        }, this.deps);
        
        this.wrapperEl.appendChild(this.toolbar.render());
        this.componentInstances.push(this.toolbar);
        
        // Create tool content area (where ToolBase renders)
        // Must be positioned for ToolBase's absolute positioning to work correctly
        this.toolContentEl = document.createElement('div');
        this.toolContentEl.className = 'generative-host-content';
        this.toolContentEl.style.cssText = `
            flex: 1;
            min-height: 0;
            overflow: hidden;
            position: relative;
        `;
        this.wrapperEl.appendChild(this.toolContentEl);
        
        this.container.appendChild(this.wrapperEl);
    }
    
    /**
     * Load and display a script
     */
    async _loadScript(scriptId) {
        window.debugLog('TOOLS', `🔄 Loading script: ${scriptId}`);
        
        // Stop any running animation
        this.stop();
        
        // Cleanup existing p5 instance
        if (this.p5Instance) {
            this.p5Instance.remove();
            this.p5Instance = null;
        }
        
        // Destroy existing tool
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        
        // Clear content
        this.toolContentEl.innerHTML = '';
        
        // Load script config
        this.scriptId = scriptId;
        this.scriptConfig = await ScriptRegistry.load(scriptId);
        
        // Get default parameter values
        this.params = getDefaultParams(this.scriptConfig.parameters);
        
        // Initialize animation state for each animatable param.
        // Each entry in animatableParams may be either a plain string (key)
        // or an object: { key, label?, mode?, rate?, min?, max? }
        //   mode: 'phase'     — linear phase increment, wraps at param range
        //   mode: 'oscillate' — sinusoidal between min/max, period ~4s at speed=1
        //   rate: multiplier applied on top of the global speed slider (default 1)
        this.phaseAnimationState = {};
        if (this.scriptConfig.animation?.animatableParams) {
            for (const entry of this.scriptConfig.animation.animatableParams) {
                const cfg = typeof entry === 'string' ? { key: entry } : entry;
                const key = cfg.key;
                const paramDef = this._findParamDef(key);
                this.phaseAnimationState[key] = {
                    enabled:   false,
                    baseValue: this.params[key] ?? 0,
                    label:     cfg.label ?? this._deriveAnimLabel(key),
                    mode:      cfg.mode  ?? 'phase',
                    rate:      cfg.rate  ?? 1,
                    // Explicit min/max wins; fall back to param definition; then ±2π
                    min: cfg.min ?? paramDef?.min ?? -(Math.PI * 2),
                    max: cfg.max ?? paramDef?.max ??  (Math.PI * 2),
                };
            }
        }
        
        // Check if this is a p5 context script
        this.isP5Context = this.scriptConfig.canvas.context === 'p5';
        
        // Build ToolBase config
        const toolConfig = this._buildToolConfig();
        
        // Create ToolBase instance
        this.tool = new ToolBase(toolConfig, {
            ComponentLibrary: this.deps.ComponentLibrary,
            MF: this.deps.MF,
            Resize: this.deps.Resize
        });
        this.tool.mount(this.toolContentEl);
        
        // Apply initial display mode
        this.tool.setCanvasDisplayMode(this.displayMode);
        
        // Initialize p5.js if p5 context
        if (this.isP5Context) {
            await this._initP5Instance();
        }
        
        // Draw initial frame
        this.draw();
        
        // Update URL query parameter without triggering navigation
        this._updateUrlQueryParam(scriptId);
        
        window.debugLog('TOOLS', `✅ Script "${scriptId}" loaded${this.isP5Context ? ' (p5.js)' : ''}`);
    }
    
    /**
     * Update URL hash to include script ID
     * Format: #tools/generators?script=harmonics (query in hash, not main URL)
     */
    _updateUrlQueryParam(scriptId) {
        // Build new hash with query param inside hash
        const baseHash = 'tools/generators';
        const newHash = `#${baseHash}?script=${scriptId}`;
        window.history.replaceState(null, '', newHash);
    }
    
    /**
     * Build ToolBase configuration from script config
     * Sidebar only - toolbar is handled separately
     */
    _buildToolConfig() {
        // Build sidebar from script parameters
        const sidebar = buildSidebarConfig(this.scriptConfig);
        
        // For p5 context, ToolBase creates canvas but we'll overlay p5's canvas
        const canvasContext = this.isP5Context ? '2d' : (this.scriptConfig.canvas.context || '2d');
        
        return {
            title: this.scriptConfig.title,
            sidebar: sidebar,
            canvas: {
                width: this.scriptConfig.canvas.width,
                height: this.scriptConfig.canvas.height,
                context: canvasContext,
                displayMode: this.displayMode,
                enableZoom: true,
                enablePan: true,
                showControls: false // Controls are in toolbar now
            },
            onInit: (values) => this.handleInit(values),
            onUpdate: (key, value, allValues) => this.handleUpdate(key, value, allValues),
            onDraw: (ctx, canvas, values) => this.handleDraw(ctx, canvas, values)
        };
    }
    
    /**
     * Initialize p5.js instance for p5 context scripts
     * Creates p5 in instance mode, attached to ToolBase's canvas container
     */
    async _initP5Instance() {
        window.debugLog('TOOLS', '🎨 Initializing p5.js instance...');
        
        // Ensure p5.js library is loaded
        await P5Canvas.ensureP5Loaded();
        
        // Get the canvas element from ToolBase - we'll replace it with p5's canvas
        const toolCanvas = this.tool.canvas;
        if (!toolCanvas) {
            console.error('❌ ToolBase canvas not available for p5 init');
            return;
        }
        
        // Get the canvas container (parent of ToolBase canvas)
        const canvasContainer = toolCanvas.parentElement;
        
        // Hide ToolBase's canvas - p5 will create its own
        toolCanvas.style.display = 'none';
        
        // Create p5 instance in instance mode
        const scriptConfig = this.scriptConfig;
        const host = this;
        
        this.p5Instance = new window.p5((p) => {
            p.setup = () => {
                // Create canvas with script dimensions
                const canvas = p.createCanvas(
                    scriptConfig.canvas.width,
                    scriptConfig.canvas.height
                );
                
                // Style to match ToolBase canvas positioning
                canvas.style('display', 'block');
                
                // Disable p5's internal loop - we control animation
                p.noLoop();
                
                // Call script's p5Setup if defined
                if (scriptConfig.p5Setup) {
                    try {
                        scriptConfig.p5Setup.call(scriptConfig, p, host.params);
                    } catch (error) {
                        console.error('p5Setup error:', error);
                    }
                }
                
                window.debugLog('TOOLS', '✅ p5.js instance created');
            };
            
            p.draw = () => {
                // Call script's p5Draw
                if (scriptConfig.p5Draw) {
                    try {
                        scriptConfig.p5Draw.call(scriptConfig, p, host.params, host.frame);
                    } catch (error) {
                        console.error('p5Draw error:', error);
                    }
                }
            };
        }, canvasContainer);
    }
    
    // === TOOLBAR HANDLERS ===
    
    /**
     * Handle generator change from toolbar
     */
    async _handleGeneratorChange(scriptId) {
        window.debugLog('TOOLS', `🎨 Generator change: ${scriptId}`);
        await this._loadScript(scriptId);
    }
    
    /**
     * Handle display mode change from toolbar
     */
    _handleDisplayModeChange(mode) {
        window.debugLog('TOOLS', `📐 Display mode: ${mode}`);
        this.displayMode = mode;
        if (this.tool) {
            this.tool.setCanvasDisplayMode(mode);
        }
    }
    
    /**
     * Handle export from toolbar
     */
    _handleExport(frameCount) {
        window.debugLog('TOOLS', `🎬 Export requested: ${frameCount} frames`);
        
        const canvas = this._getActiveCanvas();
        if (!canvas) {
            console.warn('⚠️ No canvas available for export');
            return;
        }
        
        // For now, export current frame as PNG
        // TODO: Implement frame sequence export
        if (frameCount === 1 || !this.scriptConfig.animation) {
            this._exportCurrentFrame();
        } else {
            this._exportFrameSequence(frameCount);
        }
    }
    
    /**
     * Export current frame as PNG
     */
    _exportCurrentFrame() {
        const canvas = this._getActiveCanvas();
        if (!canvas) return;
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.scriptId}-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }
    
    /**
     * Export frame sequence
     */
    async _exportFrameSequence(frameCount) {
        window.debugLog('TOOLS', `📦 Exporting ${frameCount} frames...`);
        
        const canvas = this._getActiveCanvas();
        if (!canvas) return;
        
        const wasPlaying = this.isPlaying;
        if (wasPlaying) this.pause();
        
        const originalFrame = this.frame;
        const frames = [];
        
        for (let i = 0; i < frameCount; i++) {
            this.frame = i;
            this.updatePhaseAnimations();
            this.draw();
            
            // Capture frame
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });
            frames.push({ index: i, blob });
            
            // Progress update every 10 frames
            if (i % 10 === 0) {
                window.debugLog('TOOLS', `  Frame ${i}/${frameCount}`);
            }
        }
        
        // Restore state
        this.frame = originalFrame;
        if (wasPlaying) this.play();
        else this.draw();
        
        // Download frames as ZIP (or individual files)
        this._downloadFrames(frames);
    }
    
    /**
     * Download captured frames
     */
    _downloadFrames(frames) {
        // For now, download first frame only as demo
        // TODO: Implement ZIP packaging
        if (frames.length > 0) {
            const url = URL.createObjectURL(frames[0].blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.scriptId}-frame-000.png`;
            a.click();
            URL.revokeObjectURL(url);
            
            window.debugLog('TOOLS', `✅ Downloaded frame 0 (ZIP export coming soon)`);
        }
    }
    
    // === TOOLBASE HANDLERS ===
    
    /**
     * Handle ToolBase initialization
     */
    handleInit(values) {
        window.debugLog('TOOLS', `🎬 Tool initialized with ${Object.keys(values).length} values`);
        
        // Call script's setup if defined
        if (this.scriptConfig.setup && this.tool.ctx) {
            try {
                this.scriptConfig.setup(this.tool.ctx, this.tool.canvas, this.params);
            } catch (error) {
                console.error('Script setup error:', error);
            }
        }
    }
    
    /**
     * Handle parameter updates
     */
    handleUpdate(key, value, allValues) {
        // Special keys handled by host
        if (key === 'preset') {
            this.handlePresetChange(value);
            return;
        }
        
        if (key === 'randomise') {
            this.handleRandomize();
            return;
        }
        
        if (key === 'resetAll') {
            this.handleReset();
            return;
        }
        
        if (key === 'playPause') {
            this.togglePlay();
            return;
        }
        
        if (key === 'stopReset') {
            this.stop();
            return;
        }
        
        if (key === 'phaseToggles') {
            this.handlePhaseToggles(value);
            return;
        }
        
        if (key === 'exportImage') {
            this._exportCurrentFrame();
            return;
        }
        
        if (key === 'exportAnimation') {
            this._handleExport(allValues.exportFrames || 60);
            return;
        }
        
        // Regular parameter update
        this.params[key] = value;
        this.draw();
    }
    
    /**
     * Handle preset selection
     */
    handlePresetChange(presetName) {
        if (presetName === '— Select Preset —') return;
        
        const preset = this.scriptConfig.presets.find(p => p.name === presetName);
        if (!preset) {
            console.warn(`Preset not found: ${presetName}`);
            return;
        }
        
        window.debugLog('TOOLS', `🎨 Applying preset: ${presetName}`);
        
        // Apply preset
        this.params = applyPreset(this.params, preset, this.scriptConfig.parameters);
        
        // Update UI values
        for (const key in this.params) {
            this.tool.setValue(key, this.params[key]);
        }
        
        // Reset dropdown to placeholder
        setTimeout(() => {
            this.tool.setValue('preset', '— Select Preset —');
        }, 100);
        
        this.draw();
    }
    
    /**
     * Handle randomize
     */
    handleRandomize() {
        window.debugLog('TOOLS', '🎲 Randomizing parameters');
        
        const randomParams = randomizeParams(this.scriptConfig.parameters);
        this.params = { ...this.params, ...randomParams };
        
        // Update UI
        for (const key in randomParams) {
            this.tool.setValue(key, randomParams[key]);
        }
        
        this.draw();
    }
    
    /**
     * Handle reset
     */
    handleReset() {
        window.debugLog('TOOLS', '🔄 Resetting parameters');
        
        this.params = getDefaultParams(this.scriptConfig.parameters);
        
        // Update UI
        for (const key in this.params) {
            this.tool.setValue(key, this.params[key]);
        }
        
        this.draw();
    }
    
    /**
     * Derive a short display label from a parameter key.
     * e.g. phi_x1 → φx1,  wx1 → ωx1,  Ax2 → Ax2
     */
    _deriveAnimLabel(key) {
        return key
            .replace(/^phi_/, 'φ')
            .replace(/^w([xy])/, 'ω$1')
            .replace(/_/g, '');
    }

    /**
     * Find a parameter's slider definition (carries min/max) by key.
     * Walks the nested group → params structure in scriptConfig.parameters.
     */
    _findParamDef(key) {
        for (const group of (this.scriptConfig.parameters || [])) {
            for (const p of (group.params || [])) {
                if (p.key === key) return p;
            }
        }
        return null;
    }

    /**
     * Handle phase animation toggles.
     * selectedLabels is the list of label strings currently toggled on.
     */
    handlePhaseToggles(selectedLabels) {
        if (!this.scriptConfig.animation?.animatableParams) return;
        
        for (const key in this.phaseAnimationState) {
            const state = this.phaseAnimationState[key];
            const nowEnabled = selectedLabels.includes(state.label);
            
            if (nowEnabled && !state.enabled) {
                // Capture the live value as base when first enabling
                state.baseValue = this.params[key] ?? 0;
            }
            state.enabled = nowEnabled;
        }
        
        window.debugLog('TOOLS', `🎬 Phase animation: ${selectedLabels.length} params enabled`);
    }
    
    /**
     * Toggle play/pause animation
     */
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    /**
     * Start animation
     */
    play() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        window.debugLog('TOOLS', '▶️ Animation started');
        
        if (!this.animator) {
            this.animator = new AnimationLoop({
                fps: this.scriptConfig.animation?.defaultFps || 60,
                onFrame: () => {
                    if (!this.isPlaying) return;
                    this.frame++;
                    this.updatePhaseAnimations();
                    this.draw();
                }
            });
        }
        
        this.animator.start();
    }
    
    /**
     * Pause animation
     */
    pause() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        if (this.animator) {
            this.animator.pause();
        }
        window.debugLog('TOOLS', '⏸️ Animation paused');
    }
    
    /**
     * Stop and reset animation
     */
    stop() {
        this.isPlaying = false;
        this.frame = 0;
        
        if (this.animator) {
            this.animator.stop();
        }
        
        // Reset animated params to their rest position
        for (const key in this.phaseAnimationState) {
            const state = this.phaseAnimationState[key];
            if (!state.enabled) continue;
            if (state.mode === 'oscillate') {
                // Oscillate rests at center of range
                this.params[key] = (state.min + state.max) / 2;
            } else {
                this.params[key] = state.baseValue;
            }
        }
        
        this.draw();
        window.debugLog('TOOLS', '⏹️ Animation stopped');
    }
    
    /**
     * Update all enabled param animations each frame.
     *
     * Two modes are supported:
     *
     *   'phase'     — Continuously increments the value and wraps it within
     *                 the param's min/max range.  Good for phases (φ) and any
     *                 parameter where you want perpetual drift.
     *                 Formula: value = baseValue + frame × globalSpeed × rate × 2π/60
     *
     *   'oscillate' — Sinusoidally bounces between the param's min and max.
     *                 Good for amplitudes, frequencies, and modulation amounts.
     *                 Formula: value = center + half × sin(frame × globalSpeed × rate × 2π / 240)
     *                 (240 frames ≈ 4 s per cycle at speed=1, rate=1)
     *
     * The global speed slider scales both modes uniformly.
     * The per-param `rate` field scales an individual param relative to global speed.
     */
    updatePhaseAnimations() {
        const speed = this.tool?.getValue('animSpeed') || 1;
        const TWO_PI = Math.PI * 2;
        
        for (const key in this.phaseAnimationState) {
            const state = this.phaseAnimationState[key];
            if (!state.enabled) continue;
            
            const t = this.frame * speed * (state.rate ?? 1);
            
            if (state.mode === 'oscillate') {
                const center = (state.min + state.max) / 2;
                const half   = (state.max - state.min) / 2;
                this.params[key] = center + half * Math.sin(t * TWO_PI / 240);
            } else {
                // 'phase' — linear increment with wrapping
                const range = state.max - state.min;
                let val = state.baseValue + t * TWO_PI / 60;
                if (range > 0) {
                    val = ((val - state.min) % range + range) % range + state.min;
                }
                this.params[key] = val;
            }
        }
    }
    
    /**
     * Draw current frame
     */
    handleDraw(ctx, canvas, values) {
        this.draw();
    }
    
    /**
     * Main draw function
     */
    draw() {
        // Handle p5.js context
        if (this.isP5Context) {
            if (this.p5Instance) {
                // Trigger p5's draw() which calls p5Draw
                this.p5Instance.redraw();
            }
            return;
        }
        
        // Standard 2d/webgl context
        if (!this.tool?.ctx || !this.tool?.canvas) return;
        
        const ctx = this.tool.ctx;
        const canvas = this.tool.canvas;
        
        // Clear/background
        if (this.scriptConfig.canvas.background) {
            ctx.fillStyle = this.scriptConfig.canvas.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Call script's draw function
        try {
            this.scriptConfig.draw(ctx, canvas, this.params, this.frame);
        } catch (error) {
            console.error(`Draw error in "${this.scriptId}":`, error);
        }
    }
    
    /**
     * Get the active canvas element (p5 or ToolBase)
     * Used for exports
     */
    _getActiveCanvas() {
        if (this.isP5Context && this.p5Instance) {
            // p5's canvas is a p5.Renderer, get the underlying canvas element
            return this.p5Instance.canvas;
        }
        return this.tool?.canvas;
    }
    
    /**
     * Cleanup
     */
    destroy() {
        window.debugLog('TOOLS', `🗑️ Destroying GenerativeToolHost`);
        
        // Cleanup p5 instance
        if (this.p5Instance) {
            this.p5Instance.remove();
            this.p5Instance = null;
        }
        
        if (this.animator) {
            this.animator.destroy();
            this.animator = null;
        }
        
        if (this.toolbar) {
            this.toolbar.destroy();
            this.toolbar = null;
        }
        
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        
        super.destroy();
    }
}

/**
 * Export as default
 */
export default GenerativeToolHost;

console.log('✅ GenerativeToolHost v2.0.0 loaded (toolbar-based)');
