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
import { buildSidebarConfig, buildTransportConfig } from './parameter-builder.js';
import { getDefaultParams, applyPreset, randomizeParams } from '../shared/presets.js';
import { AnimationLoop } from '../../../core/animation-foundation.js';
import { GeneratorToolbar } from '../../../shared/components/tool/GeneratorToolbar.js';
import { GeneratorTransportStrip } from '../../../shared/components/tool/TransportStrip.js';
import { GenerativeCanvasDock } from '../../../shared/components/tool/GenerativeCanvasDock.js';
import { P5Canvas } from '../../../shared/p5-integration.js';
import { AnimationExport } from '../../../shared/components/output/AnimationExport.js';
import { ComputeScheduler } from './compute-scheduler.js';
import { evaluateModulators } from './modulation-engine.js';
import { buildContext } from './expression-context.js';
import { _migrateScriptConfig } from './script-types.js';

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
        this.displayMode = 'fit';
        this.p5Instance = null;  // p5.js instance for context: 'p5'
        this.isP5Context = false; // Flag for p5 mode
        this._p5CanvasEl = null;
        this._p5ViewportEl = null;
        this._p5ViewportState = null;
        
        // ComputeScheduler (Tier 2+3 — initialised after script load)
        this._scheduler = null;
        this._redrawScheduled = false; // Tier 1 coalesce flag
        /** @type {import('../../../shared/components/tool/GenerativeCanvasDock.js').GenerativeCanvasDock|null} */
        this.generativeDock = null;
        
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
            this.clearElement(this.container);
            const errorEl = this.createElement('div', 'generative-host-error');
            const titleEl = this.createElement('h2', '', 'Generator Load Error');
            const messageEl = this.createElement('p', '', error.message);
            this.appendElement(errorEl, titleEl);
            this.appendElement(errorEl, messageEl);
            this.appendElement(this.container, errorEl);
        }
    }
    
    /**
     * Build the container layout with toolbar at top
     */
    _buildContainerLayout() {
        // Clear container
        this.clearElement(this.container);
        
        // Create wrapper
        this.wrapperEl = this.createElement('div');
        this.wrapperEl.className = 'generative-host-wrapper';
        this.wrapperEl.style.cssText = `
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            min-height: 0;
            overflow: hidden;
        `;
        
        // Create toolbar (using direct import)
        this.toolbar = new GeneratorToolbar({
            generators: this.generators,
            activeGenerator: this.scriptId,
            displayMode: this.displayMode,
            onGeneratorChange: (id) => this._handleGeneratorChange(id),
            onDisplayModeChange: (mode) => this._handleDisplayModeChange(mode),
            onExport: (format, exportState) => this._handleExport(format, exportState)
        }, this.deps);
        
        this.appendElement(this.wrapperEl, this.toolbar.render());
        this.componentInstances.push(this.toolbar);
        
        // Create tool content area (where ToolBase renders)
        // Must be positioned for ToolBase's absolute positioning to work correctly
        this.toolContentEl = this.createElement('div');
        this.toolContentEl.className = 'generative-host-content';
        this.toolContentEl.style.cssText = `
            flex: 1;
            min-height: 0;
            overflow: hidden;
            position: relative;
        `;
        this.appendElement(this.wrapperEl, this.toolContentEl);

        // Transport region — placeholder; actual mount happens after ToolBase
        // creates canvasArea, so we can place the strip below the canvas only.
        this.transportRegionEl = null;

        this.appendElement(this.container, this.wrapperEl);

        // X-001: Spacebar play/stop — bound to the host wrapper, not the document,
        // so it only fires when focus is within the generator page.
        this._onKeyDown = (e) => {
            if (e.code !== 'Space' || e.repeat) return;
            // Do not intercept when an input, textarea, select, or contenteditable
            // element has focus — the user may be typing in a param field.
            const active = document.activeElement;
            if (active && (
                active.tagName === 'INPUT' ||
                active.tagName === 'TEXTAREA' ||
                active.tagName === 'SELECT' ||
                active.isContentEditable
            )) return;
            // Only act when an animating generator is loaded
            if (!this.scriptConfig?.animation || this.scriptConfig.animation.type === 'none') return;
            e.preventDefault();
            this.togglePlay();
        };
        this.wrapperEl.setAttribute('tabindex', '-1');
        this.wrapperEl.addEventListener('keydown', this._onKeyDown);
        // Also listen at document level so focus is not required to be on wrapper
        document.addEventListener('keydown', this._onKeyDown);
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

        // Tear down dock + strip before ToolBase — dock owns Resize subscriptions and
        // wraps canvasArea children; skipping dock.destroy() leaves listeners attached.
        if (this.transportStrip) {
            this.transportStrip.destroy();
            this.transportStrip = null;
        }
        this._stripEl = null;
        if (this.generativeDock) {
            this.generativeDock.destroy();
            this.generativeDock = null;
        }

        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        
        // Clear content
        this.clearElement(this.toolContentEl);
        
        // Load script config
        this.scriptId = scriptId;
        const rawConfig = await ScriptRegistry.load(scriptId);
        this.scriptConfig = _migrateScriptConfig(rawConfig);
        
        // Get default parameter values
        this.params = getDefaultParams(this.scriptConfig.parameters);
        
        // Build modulators array from new schema (post-migration)
        this.modulators = this.scriptConfig.animation?.modulators ?? [];
        
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
        this._sequencerStripEl      = null;
        // Timeline dock: SPEED strip sits above sequencer strip; TIMELINE ▾ expands rows below transport.
        this._sequencerStripVisible = this.scriptConfig.animation?.sequencer !== true;

        this.tool = new ToolBase(toolConfig, {
            ComponentLibrary: this.deps.ComponentLibrary,
            MF: this.deps.MF,
            Resize: this.deps.Resize
        });
        this.tool.mount(this.toolContentEl);
        
        // Apply initial display mode
        this.tool.setCanvasDisplayMode(this.displayMode);

        // Mount TransportStrip at the bottom of the canvas column (in-flow dock).
        if (this.transportStrip) {
            this.transportStrip.destroy();
            this.transportStrip = null;
        }
        this._stripEl = null;
        if (this.scriptConfig.animation && this.scriptConfig.animation.type !== 'none') {
            const transportConfig = buildTransportConfig(this.scriptConfig);
            this.transportStrip = new GeneratorTransportStrip({
                ...transportConfig,
                onChange: (key, value) => this._handleTransportChange(key, value),
            }, this.deps);
            const stripEl = this.transportStrip.render();
            if (this.tool?.canvasArea) {
                this._stripEl = stripEl;
                this._stripElClearFixedOverrides(stripEl);
                this.generativeDock = new GenerativeCanvasDock({
                    showTimelineSlot: this.scriptConfig.animation.sequencer === true,
                }, this.deps);
                this.generativeDock.render();
                this.generativeDock.mountIntoCanvasArea(this.tool.canvasArea);
                this.generativeDock.appendTransportStrip(stripEl);
                this.generativeDock.setTimelineVisible(this._sequencerStripVisible);
                this.componentInstances.push(this.generativeDock);
            }
            this.componentInstances.push(this.transportStrip);
        }

        // Inject SequencerV2 + AnimationExport UI — only for generators that animate.
        const animType = this.scriptConfig.animation?.type;
        if (this.scriptConfig.animation && animType !== 'none') {
            queueMicrotask(() => {
                if (this.scriptConfig.animation.sequencer === true) {
                    this._injectSequencer();
                }
                if (this.scriptConfig.animation.animationExport !== false) {
                    this._injectExportUI();
                }
            });
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

        // Sync toolbar dropdown label to the newly loaded script
        if (this.toolbar) {
            this.toolbar.setActiveGenerator(scriptId);
            // Supply info content to toolbar INFO button panel
            const infoSections = this.scriptConfig.infoSections?.length
                ? this.scriptConfig.infoSections
                : this.scriptConfig.description
                    ? [{ heading: 'About', body: this.scriptConfig.description }]
                    : null;
            this.toolbar.setInfoContent(infoSections);
        }
        
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
            onDraw: (ctx, canvas, values) => this.handleDraw(ctx, canvas, values),
            onAfterRender: (toolBase) => {
                try {
                    if (this.scriptConfig?.animation?.type !== 'none' && toolBase?.canvasArea && this.generativeDock) {
                        this._syncGenerativeCanvasDock();
                    }
                } catch (err) {
                    console.error('[GenerativeToolHost] onAfterRender dock sync failed:', err);
                }
            },
        };
    }

    /** Remove legacy viewport-fixed overrides from GeneratorTransportStrip. */
    _stripElClearFixedOverrides(stripEl) {
        ['position', 'bottom', 'left', 'width', 'z-index'].forEach((p) => {
            stripEl.style.removeProperty(p);
        });
    }

    /**
     * Rebuild dock chrome after ToolBase re-render (orientation change rebuild).
     */
    _syncGenerativeCanvasDock() {
        if (!this.tool?.canvasArea || !this.generativeDock || !this._stripEl) return;
        this.generativeDock.mountIntoCanvasArea(this.tool.canvasArea);
        this.generativeDock.appendTransportStrip(this._stripEl);
        this._stripElClearFixedOverrides(this._stripEl);
        this._reattachSequencerStrip();
        this.generativeDock.setTimelineVisible(this._sequencerStripVisible);
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

                // FIB-03: wire script-level audio emitter into AnimationExport if present
                if (typeof scriptConfig.getAudioEmitter === 'function' && host.animationExporter) {
                    const emitter = scriptConfig.getAudioEmitter.call(scriptConfig);
                    if (emitter) host.animationExporter.setAudioEmitter(emitter);
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
     * Route export requests from the toolbar panel.
     * format: image type string ('png','jpeg','webp','avif') or 'animation'.
     * exportState: export panel state object (animation mode only).
     */
    _handleExport(format, exportState) {
        if (format === 'animation') {
            this._handleAnimationExport(exportState);
        } else {
            this._exportCurrentFrame(format);
        }
    }

    _exportCurrentFrame(format = 'png') {
        const canvas = this._getActiveCanvas();
        if (!canvas) return;
        const mimeMap = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif' };
        const mime = mimeMap[format] ?? 'image/png';
        const ext  = format === 'jpeg' ? 'jpg' : format;
        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = this.createElement('a');
            a.href = url;
            a.download = `${this.scriptId}-${Date.now()}.${ext}`;
            this.attachToBody(a);
            a.click();
            this.detachElement(a);
            URL.revokeObjectURL(url);
        }, mime);
    }

    _handleAnimationExport(exportState) {
        if (!this.animationExporter) return;
        // Push current panel state into the engine before starting
        this.animationExporter.state.format    = exportState.animFormat === 'zip' ? 'frames' : exportState.animFormat;
        this.animationExporter.state.fps       = exportState.fps;
        this.animationExporter.state.frameCount= exportState.frames;
        this.animationExporter.state.duration  = exportState.duration;
        this.animationExporter.state.bitrate   = exportState.bitrate;
        // ZIP image type: stored separately on the engine for _createFrameZip to read
        this.animationExporter._zipImageType   = exportState.zipImageType ?? 'png';
        this.animationExporter.startExport();
    }

    /**
     * Initialise the AnimationExport engine for the current script (no UI render).
     * The toolbar panel owns all UI; this method only sets up the engine.
     */
    _injectExportUI() {
        if (!this.scriptConfig.animation) return;

        // Destroy previous engine if switching scripts
        if (this.animationExporter) {
            this.animationExporter.destroy();
            this.animationExporter = null;
        }

        const anim = this.scriptConfig.animation;
        const loopFrames = anim.loopFrames || 300;
        const defaultFps = anim.defaultFps || 60;

        let savedFrame  = 0;
        let savedParams = {};

        this.animationExporter = new AnimationExport({
            type:         'loop',
            loopFrames,
            defaultFps,
            canPrerender: anim.canPrerender ?? true,
            getCanvas:    () => this._getActiveCanvas(),
            renderFrame:  (i) => {
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
                savedFrame  = this.frame;
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

        // Push metadata into toolbar panel so it can seed defaults and show loop info
        this.toolbar?.setExportConfig?.({ loopFrames, defaultFps });

        window.debugLog('TOOLS', `✅ AnimationExport engine ready for "${this.scriptId}"`);
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

        if (key === 'toggleTimeline') {
            if (this.generativeDock?.getTimelineSlot()) {
                this._sequencerStripVisible = !this._sequencerStripVisible;
                this.generativeDock.setTimelineVisible(this._sequencerStripVisible);
            }
            return;
        }
        
        if (key === 'phaseToggles') {
            this.handlePhaseToggles(value);
            return;
        }

        if (key.startsWith('animParam__')) {
            // Legacy animParam__ events — no-op; modulator state now managed via mod__ keys
            return;
        }

        // New modulation engine — mod__<targetKey> updates a ModulatorDescriptor
        if (key.startsWith('mod__')) {
            const targetKey = key.replace(/^mod__/, '');
            const modIdx = this.modulators.findIndex(m => m.targetKey === targetKey);
            if (modIdx >= 0) {
                this.modulators[modIdx] = { ...this.modulators[modIdx], ...value };
            } else if (value) {
                this.modulators.push({ targetKey, ...value });
            }
            return;
        }

        // Palette row — palette__<id>: { colour, alpha, lineWidth }
        if (key.startsWith('palette__')) {
            const layerId = key.replace(/^palette__/, '');
            this._handlePaletteLayerUpdate(layerId, value);
            return;
        }
        
        if (key === 'exportImage') {
            this._exportCurrentFrame();
            return;
        }

        if (key === 'canvasWidth' || key === 'canvasHeight') {
            this._handleCanvasResize(key, value);
            return;
        }

        if (key === 'canvasBackground') {
            this._handleCanvasBackground(value);
            return;
        }

        if (key.startsWith('colourway__')) {
            this._handleCanvasColourway(key, value);
            return;
        }

        // Regular parameter update
        this.params[key] = value;
        this.scheduleRedraw();
    }
    
    /**
     * Handle canvas resize from CANVAS tab sliders.
     * Updates the script config and resizes the ToolBase canvas.
     */
    _handleCanvasResize(key, value) {
        if (!this.scriptConfig?.canvas) return;
        if (key === 'canvasWidth')  this.scriptConfig.canvas.width  = value;
        if (key === 'canvasHeight') this.scriptConfig.canvas.height = value;

        if (this.isP5Context && this.p5Instance) {
            this.p5Instance.resizeCanvas(
                this.scriptConfig.canvas.width,
                this.scriptConfig.canvas.height
            );
            this._applyP5DisplayMode();
        } else if (this.tool?.canvas) {
            this.tool.canvas.width  = this.scriptConfig.canvas.width;
            this.tool.canvas.height = this.scriptConfig.canvas.height;
            // Re-apply display mode so CSS scaling re-calculates for the new dimensions.
            this.tool.setCanvasDisplayMode(this.displayMode);
        }

        // X-003: Re-mount sequencer strip if it was detached by a layout rebuild.
        // This can happen when canvas orientation flips cause the canvasArea to
        // re-render, detaching the strip element from the live DOM.
        this._reattachSequencerStrip();

        this.draw();
    }

    /**
     * Re-attach the sequencer strip to canvasArea if it has been detached.
     * Preserves current visibility state.
     */
    _reattachSequencerStrip() {
        if (!this._sequencerStripEl) return;
        const tl = this.generativeDock?.getTimelineSlot();
        if (!tl || !tl.isConnected) return;
        if (!tl.contains(this._sequencerStripEl)) {
            this.appendElement(tl, this._sequencerStripEl);
        }
        this.generativeDock?.setTimelineVisible(this._sequencerStripVisible);
    }

    /**
     * Handle palette row update (OUTPUT tab new-schema path).
     * value: { colour?, alpha?, lineWidth? }
     */
    _handlePaletteLayerUpdate(layerId, value) {
        if (!this.scriptConfig?.canvas?.colourway) return;
        const layer = this.scriptConfig.canvas.colourway.find(l => l.id === layerId);
        if (!layer) return;
        if (value.colour    !== undefined) layer.colour    = value.colour;
        if (value.alpha     !== undefined) layer.alpha     = value.alpha;
        if (value.lineWidth !== undefined) layer.lineWidth = value.lineWidth;
        this.scheduleRedraw();
    }

    /**
     * Handle transport strip events (play/pause/stop/speed/timeline).
     * Mirrors the sidebar handleUpdate branches but routes to TransportStrip.
     */
    _handleTransportChange(key, value) {
        if (key === 'playPause')      { this.togglePlay(); return; }
        if (key === 'stopReset')      { this.stop();       return; }
        if (key === 'animSpeed')      {
            // Store speed so updatePhaseAnimations and the modulation engine can read it
            this._animSpeed = value;
            return;
        }
        if (key === 'toggleTimeline') {
            if (this.generativeDock?.getTimelineSlot()) {
                this._sequencerStripVisible = !this._sequencerStripVisible;
                this.generativeDock.setTimelineVisible(this._sequencerStripVisible);
            }
            return;
        }
    }

    /**
     * Handle background colour change from CANVAS tab (legacy single-colour path).
     */
    _handleCanvasBackground(colour) {
        if (!this.scriptConfig?.canvas) return;
        this.scriptConfig.canvas.background = colour;
        // Also keep colourway[0] in sync if the schema is present
        if (this.scriptConfig.canvas.colourway?.[0]) {
            this.scriptConfig.canvas.colourway[0].colour = colour;
        }
        this.draw();
    }

    /**
     * Handle a per-layer colourway change from the CANVAS tab.
     * key format: 'colourway__<layerId>'
     */
    _handleCanvasColourway(key, colour) {
        if (!this.scriptConfig?.canvas?.colourway) return;
        const layerId = key.replace(/^colourway__/, '');
        const layer = this.scriptConfig.canvas.colourway.find(l => l.id === layerId);
        if (layer) {
            layer.colour = colour;
            // Keep legacy .background in sync when background layer changes
            if (layerId === 'background') this.scriptConfig.canvas.background = colour;
        }
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
     * Handle reset — rewinds to frame 0, re-runs lifecycle.onInit, restores
     * default params. Stops animation so the generator starts from a clean state.
     */
    handleReset() {
        window.debugLog('TOOLS', '🔄 Resetting parameters');

        // Stop animation and rewind frame counter
        if (this.isPlaying) this.stop();
        this.frame = 0;

        this.params = getDefaultParams(this.scriptConfig.parameters);

        // Re-run script lifecycle init if defined (resets any internal state)
        if (typeof this.scriptConfig.lifecycle?.onInit === 'function') {
            try {
                this.scriptConfig.lifecycle.onInit(this.params);
            } catch (err) {
                console.warn('lifecycle.onInit error during reset:', err);
            }
        }

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
     * Reflect current play state onto the Play / Pause button.
     * Inverted (bg=text, color=bg) = playing; normal = stopped/paused.
     * A data-playing attribute is set so the corrective mouseleave handler
     * can restore the playing colour after hover, rather than always
     * restoring to the default idle colours.
     */
    _syncPlayButton() {
        // Update transport strip (new path)
        this.transportStrip?.setPlaying(this.isPlaying);

        // Update legacy sidebar button (kept during transition period)
        const btn = this.tool?.getComponent?.('playPause');
        if (!btn?.element) return;
        const playing = this.isPlaying;
        btn.setText(playing ? 'PAUSE' : 'PLAY');
        btn.element.dataset.playing = playing ? '1' : '';
        btn.element.style.background = playing ? 'var(--c-text)' : 'var(--c-bg)';
        btn.element.style.color      = playing ? 'var(--c-bg)'   : 'var(--c-text)';

        // Attach corrective mouseleave only once (guarded by flag on element)
        if (!btn.element._playStateLeaveAttached) {
            btn.element._playStateLeaveAttached = true;
            btn.element.addEventListener('mouseleave', () => {
                if (btn.element.dataset.playing === '1') {
                    btn.element.style.background = 'var(--c-text)';
                    btn.element.style.color      = 'var(--c-bg)';
                }
            });
        }
    }

    /**
     * Start or resume animation.
     * AnimationLoop.start() only works from a stopped/fresh state; after pause()
     * the loop's isRunning stays true, so the correct call is resume().
     */
    play() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this._syncPlayButton();
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

        // Resume if paused, start fresh otherwise
        if (this.animator.isPaused) {
            this.animator.resume();
        } else {
            this.animator.start();
        }
    }
    
    /**
     * Pause animation
     */
    pause() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        this._syncPlayButton();
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
        this._syncPlayButton();
        this._scheduler?.setAnimating(false);
        this.frame = 0;
        
        if (this.animator) {
            this.animator.stop();
        }
        
        this.draw();
        window.debugLog('TOOLS', '⏹️ Animation stopped');
    }
    
    /**
     * Evaluate all declared modulators for the current frame, writing output into params.
     */
    updatePhaseAnimations() {
        if (!this.modulators || this.modulators.length === 0) return;
        const speed      = this._animSpeed ?? 1;
        const loopFrames = this.scriptConfig.animation?.loopFrames || 360;
        const fps        = this.scriptConfig.animation?.defaultFps || 60;
        const t          = loopFrames > 0 ? (this.frame % loopFrames) / loopFrames : 0;
        const ctx = buildContext({
            t, frame: this.frame, fps, loop: loopFrames, speed,
            params: this.params, mods: {},
        });
        evaluateModulators(this.modulators, this.params, this.frame, ctx);
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
        
        // Clear/background — prefer new colourway[] schema; fall back to legacy .background
        const cv = this.scriptConfig.canvas;
        const bgColour = cv.colourway?.[0]?.colour ?? cv.background ?? null;
        if (bgColour) {
            ctx.fillStyle = bgColour;
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
                this.draw();
            },
            onFrame: (interpolated) => {
                // Set checkpoint-interpolated base values
                Object.assign(this.params, interpolated);
                this.draw();
            }
        }, {});

        const stripEl = this.sequencerV2.getStripElement();
        const tl = this.generativeDock?.getTimelineSlot();
        if (stripEl && tl) {
            this.appendElement(tl, stripEl);
            this._sequencerStripEl = stripEl;
            this.generativeDock.setTimelineVisible(this._sequencerStripVisible);
        }

        window.debugLog('TOOLS', `✅ SequencerV2 injected for "${this.scriptId}"`);
    }

    /**
     * Cleanup
     */
    destroy() {
        window.debugLog('TOOLS', `🗑️ Destroying GenerativeToolHost`);

        if (this._onKeyDown) {
            document.removeEventListener('keydown', this._onKeyDown);
            this._onKeyDown = null;
        }
        
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

        if (this.transportStrip) {
            this.transportStrip.destroy();
            this.transportStrip = null;
        }
        this._stripEl = null;

        if (this.generativeDock) {
            this.generativeDock.destroy();
            this.generativeDock = null;
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
