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
import { AnimationExport } from '../../../shared/components/output/AnimationExport.js';
import { ComputeScheduler } from './compute-scheduler.js';

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
        this._p5CanvasEl = null;
        this._p5ViewportEl = null;
        this._p5ViewportState = null;
        
        // ComputeScheduler (Tier 2+3 — initialised after script load)
        this._scheduler = null;
        this._redrawScheduled = false; // Tier 1 coalesce flag
        
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

        // Destroy existing scheduler before tearing down the tool
        if (this._scheduler) {
            this._scheduler.destroy();
            this._scheduler = null;
        }
        
        // Cleanup existing p5 instance
        if (this.p5Instance) {
            this.p5Instance.remove();
            this.p5Instance = null;
        }
        this._destroyP5Viewport();
        
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
        // Destroy any existing SequencerV2 from previous script
        if (this.sequencerV2) {
            this.sequencerV2.destroy();
            this.sequencerV2 = null;
        }

        this.tool = new ToolBase(toolConfig, {
            ComponentLibrary: this.deps.ComponentLibrary,
            MF: this.deps.MF,
            Resize: this.deps.Resize
        });
        this.tool.mount(this.toolContentEl);
        
        // Apply initial display mode
        this.tool.setCanvasDisplayMode(this.displayMode);

        // Inject SequencerV2 + AnimationExport UI — only for generators that animate.
        // type: 'none' generators have no ANIMATE/EXPORT tabs so injection targets don't exist.
        // Set animation.sequencer = false to suppress SequencerV2.
        // Set animation.animationExport = false to suppress AnimationExport.
        const animType = this.scriptConfig.animation?.type;
        if (this.scriptConfig.animation && animType !== 'none') {
            setTimeout(() => {
                if (this.scriptConfig.animation.sequencer === true) {
                    this._injectSequencer();
                }
                if (this.scriptConfig.animation.animationExport !== false) {
                    this._injectExportUI();
                }
            }, 0);
        }
        
        // Initialize p5.js if p5 context
        if (this.isP5Context) {
            await this._initP5Instance();
        }
        
        // Draw initial frame
        this.draw();

        // Initialise ComputeScheduler (Tiers 2 & 3) when the script declares
        // a compute config.  p5 scripts are excluded (p5 manages its own canvas).
        if (this.scriptConfig.compute && !this.isP5Context) {
            this._scheduler = new ComputeScheduler({
                computeConfig:     this.scriptConfig.compute,
                draw:              () => this.draw(),
                getCanvasComponent: () => this.tool?.canvasComponent ?? null,
                getCtx:            () => this.tool?.ctx ?? null,
                getCanvas:         () => this.tool?.canvas ?? null,
                getParams:         () => this.params,
                getFrame:          () => this.frame,
                computePixels:     this.scriptConfig.computePixels ?? null,
            });
        }

        // Update URL query parameter without triggering navigation
        this._updateUrlQueryParam(scriptId);
        
        // Notify host consumer that the active script changed (e.g. to update subheader nav)
        if (typeof this.deps.onScriptChange === 'function') {
            this.deps.onScriptChange(scriptId);
        }

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
        this._sidebarTabs = sidebar; // store for tab index lookup
        
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
                p.pixelDensity(1);
                
                // Style to match ToolBase canvas positioning
                canvas.style('display', 'block');
                host._attachP5Canvas(canvas.elt, canvasContainer);
                
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

    _attachP5Canvas(canvasEl, viewportEl) {
        if (!canvasEl || !viewportEl) return;

        this._destroyP5Viewport();

        this._p5CanvasEl = canvasEl;
        this._p5ViewportEl = viewportEl;
        this._p5ViewportState = {
            x: 0,
            y: 0,
            scale: 1,
            isDragging: false,
            startX: 0,
            startY: 0,
            activePointers: new Map(),
            pinchStartDistance: 0,
            pinchStartScale: 1,
            handlers: null
        };

        canvasEl.style.position = 'absolute';
        canvasEl.style.top = '0';
        canvasEl.style.left = '0';
        canvasEl.style.transformOrigin = '0 0';
        canvasEl.style.touchAction = 'none';

        const onWheel = (e) => {
            e.preventDefault();
            const state = this._p5ViewportState;
            if (!state) return;
            const rect = viewportEl.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rawDelta = -e.deltaY;
            const normDelta = e.deltaMode === 1 ? rawDelta * 16 :
                e.deltaMode === 2 ? rawDelta * 400 : rawDelta;
            const factor = Math.max(0.5, Math.min(2.0, Math.pow(1.002, normDelta)));
            this._zoomP5ToPoint(x, y, factor);
        };

        const onPointerDown = (e) => {
            if (e.button === 2) return;
            const state = this._p5ViewportState;
            if (!state) return;
            state.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

            if (state.activePointers.size === 1) {
                viewportEl.setPointerCapture(e.pointerId);
                state.isDragging = true;
                state.startX = e.clientX - state.x;
                state.startY = e.clientY - state.y;
            } else if (state.activePointers.size === 2) {
                const pts = [...state.activePointers.values()];
                state.pinchStartDistance = this._getPointerDistance(pts[0], pts[1]);
                state.pinchStartScale = state.scale;
            }
        };

        const onPointerMove = (e) => {
            const state = this._p5ViewportState;
            if (!state || !state.activePointers.has(e.pointerId)) return;
            state.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

            if (state.activePointers.size >= 2) {
                const pts = [...state.activePointers.values()];
                const currentDistance = this._getPointerDistance(pts[0], pts[1]);
                if (state.pinchStartDistance < 1) return;
                const newScale = Math.max(0.1, Math.min(10, state.pinchStartScale * (currentDistance / state.pinchStartDistance)));
                const midpoint = this._getPointerMidpoint(pts[0], pts[1]);
                const rect = viewportEl.getBoundingClientRect();
                const midX = midpoint.x - rect.left;
                const midY = midpoint.y - rect.top;
                const oldScale = state.scale;
                state.x = midX - (midX - state.x) * (newScale / oldScale);
                state.y = midY - (midY - state.y) * (newScale / oldScale);
                state.scale = newScale;
                this._clampP5PanBounds();
                this._applyP5ViewportTransform();
            } else if (state.isDragging) {
                state.x = e.clientX - state.startX;
                state.y = e.clientY - state.startY;
                this._clampP5PanBounds();
                this._applyP5ViewportTransform();
            }
        };

        const onPointerUp = (e) => {
            const state = this._p5ViewportState;
            if (!state) return;
            state.activePointers.delete(e.pointerId);

            if (state.activePointers.size === 1 && state.isDragging) {
                const [remaining] = state.activePointers.values();
                state.startX = remaining.x - state.x;
                state.startY = remaining.y - state.y;
            } else if (state.activePointers.size === 0) {
                state.isDragging = false;
            }
        };

        const onDoubleClick = () => this._applyP5DisplayMode();

        this._p5ViewportState.handlers = {
            wheel: onWheel,
            pointerdown: onPointerDown,
            pointermove: onPointerMove,
            pointerup: onPointerUp,
            pointercancel: onPointerUp,
            dblclick: onDoubleClick
        };

        viewportEl.addEventListener('wheel', onWheel, { passive: false });
        viewportEl.addEventListener('pointerdown', onPointerDown);
        viewportEl.addEventListener('pointermove', onPointerMove);
        viewportEl.addEventListener('pointerup', onPointerUp);
        viewportEl.addEventListener('pointercancel', onPointerUp);
        viewportEl.addEventListener('dblclick', onDoubleClick);

        this._applyP5DisplayMode();
    }

    _applyP5DisplayMode() {
        if (!this._p5CanvasEl || !this._p5ViewportEl || !this._p5ViewportState || !this.scriptConfig?.canvas) {
            return;
        }

        const state = this._p5ViewportState;
        const rect = this._p5ViewportEl.getBoundingClientRect();
        const canvasWidth = this.scriptConfig.canvas.width;
        const canvasHeight = this.scriptConfig.canvas.height;
        const viewportWidth = rect.width || canvasWidth;
        const viewportHeight = rect.height || canvasHeight;

        let scale = 1;
        let x = 0;
        let y = 0;

        if (this.displayMode === 'fit') {
            scale = Math.min(viewportWidth / canvasWidth, viewportHeight / canvasHeight);
            x = (viewportWidth - canvasWidth * scale) / 2;
            y = (viewportHeight - canvasHeight * scale) / 2;
        } else if (this.displayMode === 'fill') {
            scale = Math.max(viewportWidth / canvasWidth, viewportHeight / canvasHeight);
            x = (viewportWidth - canvasWidth * scale) / 2;
            y = (viewportHeight - canvasHeight * scale) / 2;
        } else {
            x = (viewportWidth - canvasWidth) / 2;
            y = (viewportHeight - canvasHeight) / 2;
        }

        state.x = x;
        state.y = y;
        state.scale = scale;
        this._applyP5ViewportTransform();
    }

    _applyP5ViewportTransform() {
        if (!this._p5CanvasEl || !this._p5ViewportState) return;
        const { x, y, scale } = this._p5ViewportState;
        this._p5CanvasEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    }

    _zoomP5ToPoint(x, y, factor) {
        const state = this._p5ViewportState;
        if (!state) return;
        const oldScale = state.scale;
        const newScale = Math.max(0.1, Math.min(10, oldScale * factor));
        if (newScale === oldScale) return;

        state.x = x - (x - state.x) * (newScale / oldScale);
        state.y = y - (y - state.y) * (newScale / oldScale);
        state.scale = newScale;
        this._clampP5PanBounds();
        this._applyP5ViewportTransform();
    }

    _clampP5PanBounds() {
        if (!this._p5ViewportEl || !this._p5ViewportState || !this.scriptConfig?.canvas) return;
        const rect = this._p5ViewportEl.getBoundingClientRect();
        const state = this._p5ViewportState;
        const width = this.scriptConfig.canvas.width * state.scale;
        const height = this.scriptConfig.canvas.height * state.scale;
        const margin = 0.25;

        state.x = Math.max(-(width * (1 - margin)), Math.min(rect.width * (1 - margin), state.x));
        state.y = Math.max(-(height * (1 - margin)), Math.min(rect.height * (1 - margin), state.y));
    }

    _destroyP5Viewport() {
        if (this._p5ViewportEl && this._p5ViewportState?.handlers) {
            const handlers = this._p5ViewportState.handlers;
            this._p5ViewportEl.removeEventListener('wheel', handlers.wheel);
            this._p5ViewportEl.removeEventListener('pointerdown', handlers.pointerdown);
            this._p5ViewportEl.removeEventListener('pointermove', handlers.pointermove);
            this._p5ViewportEl.removeEventListener('pointerup', handlers.pointerup);
            this._p5ViewportEl.removeEventListener('pointercancel', handlers.pointercancel);
            this._p5ViewportEl.removeEventListener('dblclick', handlers.dblclick);
        }

        this._p5CanvasEl = null;
        this._p5ViewportEl = null;
        this._p5ViewportState = null;
    }

    _getPointerDistance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    _getPointerMidpoint(a, b) {
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }
    
    // === TOOLBAR HANDLERS ===
    
    /**
     * Switch to a generator script by ID — public API for external callers
     */
    async switchToScript(scriptId) {
        await this._loadScript(scriptId);
    }

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
        if (this.isP5Context) {
            this._applyP5DisplayMode();
        } else if (this.tool) {
            this.tool.setCanvasDisplayMode(mode);
        }
    }
    
    /**
     * Export current frame as PNG (toolbar SAVE PNG button)
     */
    _handleExport(format) {
        this._exportCurrentFrame();
    }

    _exportCurrentFrame() {
        const canvas = this._getActiveCanvas();
        if (!canvas) return;
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = this.createElement('a');
            a.href = url;
            a.download = `${this.scriptId}-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    /**
     * Inject AnimationExport UI into the toolbar EXPORT dropdown's animation mount point.
     * The toolbar owns export (component-patterns §4, §6.6); sidebar EXPORT tab is removed.
     */
    _injectExportUI() {
        if (!this.scriptConfig.animation) return;

        const mountEl = this.toolbar?.getAnimExportMount?.();
        if (!mountEl) return;

        // Clear any previously injected UI (script switch)
        mountEl.innerHTML = '';

        let savedFrame = 0;
        let savedParams = {};

        this.animationExporter = new AnimationExport({
            type: 'loop',
            loopFrames: this.scriptConfig.animation.loopFrames || 300,
            defaultFps: this.scriptConfig.animation.defaultFps || 60,
            canPrerender: this.scriptConfig.animation.canPrerender ?? true,
            getCanvas: () => this._getActiveCanvas(),
            renderFrame: (i) => {
                this.frame = i;
                this.updatePhaseAnimations();
                this.draw();
            },
            getState: () => ({ frame: this.frame, params: JSON.parse(JSON.stringify(this.params)) }),
            setState: (s) => {
                this.frame = s.frame ?? 0;
                Object.assign(this.params, s.params);
                this.draw();
            },
            onExportStart: () => {
                savedFrame = this.frame;
                savedParams = JSON.parse(JSON.stringify(this.params));
                if (this.isPlaying) this.pause();
            },
            onExportComplete: () => {
                this.frame = savedFrame;
                Object.assign(this.params, savedParams);
                this.draw();
                window.debugLog('TOOLS', '✅ Export complete');
            },
        }, {});

        mountEl.appendChild(this.animationExporter.render());
        window.debugLog('TOOLS', `✅ AnimationExport UI injected into toolbar for "${this.scriptId}"`);
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
        
        // Regular parameter update
        this.params[key] = value;
        this.scheduleRedraw();
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
        this._scheduler?.setAnimating(true);
        window.debugLog('TOOLS', '▶️ Animation started');
        
        if (!this.animator) {
            this.animator = new AnimationLoop({
                fps: this.scriptConfig.animation?.defaultFps || 60,
                onFrame: () => {
                    if (!this.isPlaying) return;
                    // Yield to sequencer when it is playing — it drives the frame
                    if (this.sequencerV2?._isPlaying) return;
                    this.frame++;
                    this.updatePhaseAnimations();
                    if (this._scheduler && !this.isP5Context) {
                        this._scheduler.animationFrame();
                    } else {
                        this.draw();
                    }
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
        this._scheduler?.setAnimating(false);
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
        this._scheduler?.setAnimating(false);
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
     * Tier 1 — RAF coalesce.
     * Coalesces rapid parameter changes (e.g. slider drag) into a single draw
     * per animation frame. Multiple calls within the same frame are no-ops.
     * Animation playback and discrete actions (preset, reset) bypass this and
     * call draw() directly so they are never delayed.
     */
    scheduleRedraw() {
        if (this._scheduler) {
            this._scheduler.scheduleRedraw();
            return;
        }
        if (this._redrawScheduled) return;
        this._redrawScheduled = true;
        requestAnimationFrame(() => {
            this._redrawScheduled = false;
            this.draw();
        });
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
     * Inject SequencerV2 into the Sequence block of the ANIMATE tab.
     */
    _injectSequencer() {
        const SequencerV2 = this.deps.ComponentLibrary?.SequencerV2 || window.ComponentLibrary?.SequencerV2;
        if (!SequencerV2) {
            console.warn('⚠️ SequencerV2 not available, skipping sequencer injection');
            return;
        }

        this.sequencerV2 = new SequencerV2({
            fps: this.scriptConfig.animation?.defaultFps || 60,
            loop: true,
            defaultHold: 2,
            defaultSegmentDuration: 1.5,
            defaultEasing: 'easeInOutCubic',
            onSave: () => JSON.parse(JSON.stringify(this.params)),
            onLoad: (cpParams) => {
                Object.assign(this.params, cpParams);
                for (const key in cpParams) {
                    this.tool.setValue(key, cpParams[key]);
                }
                // Align phase baseValues so animation resumes relative to loaded state
                for (const key in this.phaseAnimationState) {
                    if (cpParams[key] !== undefined) {
                        this.phaseAnimationState[key].baseValue = cpParams[key];
                    }
                }
                this.draw();
            },
            onFrame: (interpolated) => {
                // Set checkpoint-interpolated base values
                Object.assign(this.params, interpolated);
                // Track phase baseValue to the sequencer position so offsets stay relative
                for (const key in this.phaseAnimationState) {
                    if (key in interpolated && this.phaseAnimationState[key].mode === 'phase') {
                        this.phaseAnimationState[key].baseValue = interpolated[key];
                    }
                }
                // Apply phase animation on top if it is active
                const phaseActive = Object.values(this.phaseAnimationState).some(s => s.enabled);
                if (phaseActive && this.isPlaying) {
                    this.frame++;
                    this.updatePhaseAnimations();
                }
                this.draw();
            }
        }, {});

        const stripEl = this.sequencerV2.getStripElement();
        if (stripEl && this.tool.canvasArea) {
            this.tool.canvasArea.appendChild(stripEl);
        }

        window.debugLog('TOOLS', `✅ SequencerV2 injected for "${this.scriptId}"`);
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
        this._destroyP5Viewport();

        if (this._scheduler) {
            this._scheduler.destroy();
            this._scheduler = null;
        }
        
        if (this.animator) {
            this.animator.destroy();
            this.animator = null;
        }

        if (this.sequencerV2) {
            this.sequencerV2.destroy();
            this.sequencerV2 = null;
        }

        if (this.animationExporter) {
            this.animationExporter.destroy();
            this.animationExporter = null;
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
