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
        
        // Initialize phase animation state
        this.phaseAnimationState = {};
        if (this.scriptConfig.animation?.animatableParams) {
            for (const key of this.scriptConfig.animation.animatableParams) {
                this.phaseAnimationState[key] = {
                    enabled: false,
                    baseValue: this.params[key] || 0
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
     * Handle phase animation toggles
     */
    handlePhaseToggles(selectedLabels) {
        if (!this.scriptConfig.animation?.animatableParams) return;
        
        const animParams = this.scriptConfig.animation.animatableParams;
        
        // Update enabled state for each animatable param
        animParams.forEach((key, index) => {
            const label = key.replace('phi_', 'φ').replace(/_/g, '');
            const enabled = selectedLabels.includes(label);
            
            if (this.phaseAnimationState[key]) {
                this.phaseAnimationState[key].enabled = enabled;
                if (enabled) {
                    // Store base value when enabling
                    this.phaseAnimationState[key].baseValue = this.params[key];
                }
            }
        });
        
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
        
        // Reset phase values to base
        for (const key in this.phaseAnimationState) {
            if (this.phaseAnimationState[key].enabled) {
                this.params[key] = this.phaseAnimationState[key].baseValue;
            }
        }
        
        this.draw();
        window.debugLog('TOOLS', '⏹️ Animation stopped');
    }
    
    /**
     * Update phase animations
     */
    updatePhaseAnimations() {
        const speed = this.tool?.getValue('animSpeed') || 1;
        const TWO_PI = Math.PI * 2;
        
        for (const key in this.phaseAnimationState) {
            const state = this.phaseAnimationState[key];
            if (state.enabled) {
                // Animate phase: base + frame * speed * 2π / 60
                const increment = this.frame * speed * TWO_PI / 60;
                this.params[key] = state.baseValue + increment;
                
                // Wrap to [-π, π]
                while (this.params[key] > Math.PI) this.params[key] -= TWO_PI;
                while (this.params[key] < -Math.PI) this.params[key] += TWO_PI;
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
