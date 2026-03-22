/**
 * ToolBase - Declarative Tool Page Builder
 *
 * Converts simple configuration arrays into fully rendered tool interfaces.
 * Single point of control for tool page layout, styling, and component wiring.
 *
 * USAGE:
 * ```javascript
 * const tool = new ToolBase({
 *     title: 'My Tool',
 *     sidebar: [
 *         ['TAB NAME', [
 *             ['Block Title', [
 *                 ['slider', 'Label', min, max, step, { withNumber: true }],
 *                 ['color', 'Color', '#FF0000'],
 *                 ['toggle', 'Options', ['A', 'B', 'C']],
 *             ]],
 *         ]],
 *     ],
 *     canvas: { width: 600, height: 600 },
 *     onInit: (values) => {},
 *     onUpdate: (key, value, allValues) => {},
 * });
 * tool.mount(container);
 * ```
 *
 * @version 2.0.0 - ES Module Migration
 */

// ES Module imports
import { BaseComponent } from '../../shared/foundation.js';
import { F, DERIVED_VALUES } from '../../core/f-config.js';

// Component type mappings
const COMPONENT_TYPES = {
    // Numeric inputs
    'slider': 'NumericInput',
    'number': 'NumericInput',
    'stepper': 'NumericInput',

    // Text inputs
    'text': 'TextInput',
    'textarea': 'TextInput',

    // Selection
    'dropdown': 'Dropdown',
    'select': 'Dropdown',
    'toggle': 'ToggleGroup',
    'radio': 'ToggleGroup',
    'checkbox': 'ToggleGroup',

    // Other inputs
    'color': 'ColorInput',
    'file': 'FileInput',
    'dropzone': 'DropZone',
    'button': 'Button',
    'equation': 'EquationEditor',
    'filament-picker': 'FilamentPicker',
    'navdropdown': 'NavigationDropdown',
    'canvas-tabs': 'CanvasTabs',
    'seed': 'NumericInput',  // Seed inputs are numeric

    // Outputs
    'label': 'Text',
    'markdown': 'Text',
    'value': 'Text',
    'imageviewport': 'ImageViewport',
    'image-viewport': 'ImageViewport',
    'palettepreview': 'PalettePreview',
    'palette-preview': 'PalettePreview',
    'progress': 'ProgressBar',

    // Image Adjustment Bundles
    'adjustment-bundle': 'AdjustmentBundle',

    // Containers
    'section': 'Section',
    'grid': 'Grid',
    'tabs': 'Tabs',
    'file-table': 'FileTable'
};

// Component access helper - uses deps instead of globals
const getComponentClass = (className, deps) => {
    const lib = deps.ComponentLibrary;
    if (!lib) {
        console.error('❌ ComponentLibrary not available in deps');
        return null;
    }

    const result = lib[className];

    if (!result) {
        console.error(`❌ Component '${className}' not found in ComponentLibrary`);
        return null;
    }

    return result;
};

export class ToolBase extends BaseComponent {
    constructor(config = {}, deps = {}) {
        // If ComponentLibrary missing, throw error immediately
        if (!deps.ComponentLibrary?.BaseComponent) {
            throw new Error(
                'ComponentLibrary must be passed in deps: ' +
                'new ToolBase(config, { ComponentLibrary })'
            );
        }

        super({ componentType: 'tool' }, deps);

        this.config = config;
        this.title = config.title ?? 'Tool';
        this.deps = deps;
        this.sidebarConfig = config.sidebar ?? [];
        this.canvasConfig = config.canvas ?? {};
        this.animationConfig = config.animation ?? null;
        
        // Auto-inject CANVAS tab if showControls is true (matches tool comments)
        if (this.canvasConfig.showControls) {
            const canvasSize = this._calculateCanvasSize();
            this.sidebarConfig.push(['CANVAS', [
                ['Canvas Controls', [
                    ['label', `Size: ${canvasSize}×${canvasSize}px`, { variant: 'caption' }],
                    ['radio', 'Display Mode', ['Fit', 'Fill', 'Actual'], { 
                        key: 'displayMode', 
                        selectedValue: 'Fit' 
                    }],
                ]],
            ]]);
        }
        
        // Auto-inject ANIMATION tab if animation config present
        // Animation export controls go in sidebar, NOT in canvas area
        if (this.animationConfig) {
            const animBlocks = [];
            if (this.animationConfig.type === 'sequence') {
                animBlocks.push(['Sequence', []]);
            }
            animBlocks.push(['Export Settings', []]);
            this.sidebarConfig.push(['ANIMATION', animBlocks]);
        }

        // Callbacks
        this.onInit = config.onInit ?? (() => {});
        this.onUpdate = config.onUpdate ?? (() => {});
        this.onDraw = config.onDraw ?? (() => {});

        // State
        this.values = {};
        this.components = new Map();
        this.componentInstances = [];
        this.blocks = [];

        // Layout refs
        this.element = null;
        this.mainGrid = null;
        this.sidebar = null;
        this.canvasArea = null;
        this.canvas = null;
        this.ctx = null;

        // Get F values
        this.F = deps.MF?.F || F;
        this.F2 = this.F / 2;
        this.SIDEBAR_WIDTH = this.F * 30; // 30F = 420px
        
        // Loading state (component-based)
        this.loadingOverlayComponent = null;
        
        // Advanced tab configs
        this.categoryTabsConfig = config.categoryTabs ?? null;
        this.canvasModeTabsConfig = config.canvasModeTabs ?? null;
        this.categoryTabsComponent = null;
        this.canvasModeTabsComponent = null;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // LOADING STATE MANAGEMENT (Component-Based)
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Show loading overlay with spinner and optional message
     * @param {string} message - Loading message
     * @param {number} progress - Optional progress (0-100), shows progress bar if provided
     */
    showLoading(message = 'Processing...', progress = null) {
        if (!this.element) return;
        
        // Import LoadingOverlay component
        const LoadingOverlay = this.deps.ComponentLibrary?.LoadingOverlay;
        if (!LoadingOverlay) {
            console.error('LoadingOverlay component not available in ComponentLibrary');
            return;
        }
        
        // Remove existing overlay if present
        if (this.loadingOverlayComponent) {
            this.hideLoading();
        }
        
        // Create loading overlay component
        this.loadingOverlayComponent = new LoadingOverlay({
            message,
            progress
        }, this.deps);
        
        // Render and mount to canvas area (or element if no canvas area)
        const target = this.canvasArea || this.element;
        if (target.style.position !== 'relative' && target.style.position !== 'absolute') {
            target.style.position = 'relative';
        }
        
        const overlayElement = this.loadingOverlayComponent.render();
        target.appendChild(overlayElement);
    }
    
    /**
     * Hide loading overlay
     */
    hideLoading() {
        if (this.loadingOverlayComponent) {
            this.loadingOverlayComponent.destroy();
            this.loadingOverlayComponent = null;
        }
    }
    
    /**
     * Update loading progress
     * @param {number} percent - Progress percentage (0-100)
     * @param {string} message - Optional new message
     */
    updateProgress(percent, message = null) {
        if (this.loadingOverlayComponent) {
            this.loadingOverlayComponent.setProgress(percent, message);
        } else {
            // No overlay shown yet, create one with progress
            this.showLoading(message || 'Processing...', percent);
        }
    }

    render() {
        if (this.element) return this.element;

        // Detect portrait/landscape (lower threshold for tools to ensure sidebar is visible)
        const isPortrait = window.innerWidth < window.innerHeight || window.innerWidth < 800;

        this.element = document.createElement('div');
        this.element.className = 'tool-base';
        
        // If category tabs present, element needs to be positioned for absolute children
        if (this.categoryTabsConfig) {
            this.element.style.position = 'relative';
        }

        if (isPortrait) {
            // Portrait: stack vertically (canvas on top, sidebar below)
            this.element.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                position: relative;
            `;
        } else {
            // Landscape: sidebar left, canvas right
            this.element.style.cssText = `
                width: 100%;
                height: 100%;
                display: grid;
                position: relative;
                grid-template-columns: ${this.SIDEBAR_WIDTH}px 1fr;
                gap: 0;
                overflow: hidden;
            `;
        }

        // Build category tabs at top if configured
        if (this.categoryTabsConfig) {
            this._buildCategoryTabs();
        }

        // Create main content area (offset if category tabs present)
        const mainContent = document.createElement('div');
        mainContent.className = 'tool-main-content';
        const topOffset = this.categoryTabsConfig ? this.F * 2 : 0;
        
        if (isPortrait) {
            mainContent.style.cssText = `
                display: flex;
                flex-direction: column;
                overflow: hidden;
                flex: 1;
                ${this.categoryTabsConfig ? `margin-top: ${topOffset}px;` : ''}
            `;
        } else {
            mainContent.style.cssText = `
                display: grid;
                grid-template-columns: ${this.SIDEBAR_WIDTH}px 1fr;
                gap: 0;
                overflow: hidden;
                position: absolute;
                top: ${topOffset}px;
                left: 0;
                right: 0;
                bottom: 0;
            `;
        }

        // Build canvas area (add first for portrait)
        this.canvasArea = this._buildCanvasArea(isPortrait);

        // Build sidebar
        this.sidebar = this._buildSidebar(isPortrait);

        if (isPortrait) {
            // Portrait: canvas first, then sidebar
            mainContent.appendChild(this.canvasArea);
            mainContent.appendChild(this.sidebar);
        } else {
            // Landscape: sidebar first, then canvas
            mainContent.appendChild(this.sidebar);
            mainContent.appendChild(this.canvasArea);
        }
        
        this.element.appendChild(mainContent);

        // Inject AnimationExport into ANIMATION tab if animation config present
        if (this.animationConfig && this.canvas) {
            this._injectAnimationExportIntoSidebar();
        }

        // Inject SequencerV2 if animation type is sequence
        if (this.animationConfig && this.animationConfig.type === 'sequence') {
            this._injectSequencerV2();
        }

        // Initialize values and trigger onInit
        this._collectInitialValues();
        this.onInit.call(this, this.values);

        // Wire up auto-injected controls
        this._wireAutoControls();

        // Initial draw after onInit completes (ensures canvas is ready and initialized)
        if (this.onDraw && this.ctx) {
            this.draw();
        }

        // Listen for resize to switch layouts
        this._resizeHandler = () => this._handleResize();
        window.addEventListener('resize', this._resizeHandler);

        return this.element;
    }

    _handleResize() {
        const isPortrait = window.innerWidth < window.innerHeight || window.innerWidth < 800;
        const wasPortrait = this.element.style.flexDirection === 'column';

        if (isPortrait !== wasPortrait) {
            // Layout orientation changed - full rebuild
            const parent = this.element.parentNode;
            if (parent) {
                this.destroy();
                parent.appendChild(this.render());
                this.draw();
            }
        } else {
            // Same orientation - update positioning if category tabs present
            if (this.categoryTabsConfig) {
                // Recalculate F from CSS or deps
                const cssF = getComputedStyle(document.documentElement).getPropertyValue('--f');
                const newF = cssF ? parseInt(cssF, 10) : (this.deps.MF?.F || 14);
                
                if (newF && !isNaN(newF)) {
                    this.F = newF;
                    this.F2 = this.F / 2;
                    this.SIDEBAR_WIDTH = this.F * 30;
                    const topOffset = this.F * 2;
                    
                    // Update mainContent positioning
                    const mainContent = this.element.querySelector('.tool-main-content');
                    if (mainContent) {
                        if (isPortrait) {
                            mainContent.style.marginTop = `${topOffset}px`;
                        } else {
                            mainContent.style.top = `${topOffset}px`;
                            mainContent.style.gridTemplateColumns = `${this.SIDEBAR_WIDTH}px 1fr`;
                        }
                        window.debugLog('LAYOUT', `ToolBase: Updated layout - F=${newF}, offset=${topOffset}px, sidebarWidth=${this.SIDEBAR_WIDTH}px`);
                    }
                    
                    // Update canvas area padding if needed
                    if (this.canvasArea && isPortrait) {
                        this.canvasArea.style.padding = `${this.F}px`;
                    }
                }
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CATEGORY TABS (TOP-LEVEL)
    // ═══════════════════════════════════════════════════════════════════════════
    
    _buildCategoryTabs() {
        const { CategoryTabsBar } = this.deps.ComponentLibrary;
        if (!CategoryTabsBar) {
            console.error('❌ CategoryTabsBar component not available in ComponentLibrary');
            return;
        }
        
        this.categoryTabsComponent = new CategoryTabsBar({
            categories: this.categoryTabsConfig.categories,
            activeCategory: this.categoryTabsConfig.activeCategory,
            enableScrollbar: this.categoryTabsConfig.enableScrollbar ?? true,
            onCategoryChange: (id) => {
                if (this.categoryTabsConfig.onCategoryChange) {
                    this.categoryTabsConfig.onCategoryChange(id, this);
                }
            }
        }, this.deps);
        
        const el = this.categoryTabsComponent.render();
        el.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 5;
        `;
        this.element.appendChild(el);
        this.componentInstances.push(this.categoryTabsComponent);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SIDEBAR BUILDING
    // ═══════════════════════════════════════════════════════════════════════════

    _buildSidebar(isPortrait = false) {
        const sidebar = document.createElement('div');
        sidebar.className = 'tool-sidebar';

        if (isPortrait) {
            sidebar.style.cssText = `
                flex: 1;
                min-height: 0;
                overflow-y: auto;
                overflow-x: hidden;
                background: var(--c-bg);
                border-top: 1px solid var(--c-border);
                box-sizing: border-box;
            `;
        } else {
            sidebar.style.cssText = `
                height: 100%;
                overflow-y: auto;
                overflow-x: hidden;
                background: var(--c-bg);
                border-right: 1px solid var(--c-border);
                box-sizing: border-box;
            `;
        }

        // Check if we have tabs (multiple top-level items with string names)
        const hasTabs = this.sidebarConfig.length > 1 &&
                        this.sidebarConfig.every(item => Array.isArray(item) && typeof item[0] === 'string');

        if (hasTabs) {
            sidebar.appendChild(this._buildTabs());
        } else {
            // Single panel - extract blocks from single tab or use config directly
            let blocks;
            if (this.sidebarConfig.length === 1 && Array.isArray(this.sidebarConfig[0]) && this.sidebarConfig[0].length === 2) {
                // Single tab format: [['TAB NAME', [blocks...]]]
                blocks = this.sidebarConfig[0][1];
            } else {
                // Direct blocks format: [[blockTitle, components], ...]
                blocks = this.sidebarConfig;
            }
            const panel = this._buildPanel(blocks);
            // Ensure panel fills sidebar height and scrolls
            panel.style.height = '100%';
            panel.style.overflowY = 'auto';
            sidebar.appendChild(panel);
        }

        return sidebar;
    }

    _buildTabs() {
        const container = document.createElement('div');
        container.className = 'tool-tabs-container';
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            height: 100%;
        `;

        // Tab bar - no gap, tabs share borders
        const tabBar = document.createElement('div');
        tabBar.className = 'tool-tab-bar';
        tabBar.style.cssText = `
            display: flex;
            border-bottom: 1px solid var(--c-border);
            flex-shrink: 0;
        `;

        // Panels container
        const panelsContainer = document.createElement('div');
        panelsContainer.className = 'tool-panels';
        panelsContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            min-height: 0;
        `;

        const panels = [];
        const tabs = [];

        this.sidebarConfig.forEach(([tabName, blocks], index) => {
            // Create tab button - shared borders between tabs
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.className = 'tool-tab';
            tab.textContent = tabName;
            const isActive = index === 0;

            tab.style.cssText = `
                flex: 1;
                height: ${this.F * 2}px;
                padding: 0 ${this.F}px;
                border: none;
                border-right: 1px solid var(--c-border);
                background: ${isActive ? 'var(--c-text)' : 'var(--c-bg)'};
                color: ${isActive ? 'var(--c-bg)' : 'var(--c-text)'};
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${this.F}px;
                text-transform: uppercase;
                cursor: pointer;
            `;

            // Remove right border from last tab
            if (index === this.sidebarConfig.length - 1) {
                tab.style.borderRight = 'none';
            }

            tabs.push(tab);

            // Create panel
            const panel = this._buildPanel(blocks);
            panel.style.display = index === 0 ? 'flex' : 'none';
            panels.push(panel);

            // Tab click handler
            tab.addEventListener('click', () => {
                // Update all tabs
                tabs.forEach((t, i) => {
                    const active = i === index;
                    t.style.background = active ? 'var(--c-text)' : 'var(--c-bg)';
                    t.style.color = active ? 'var(--c-bg)' : 'var(--c-text)';
                });
                // Show/hide panels
                panels.forEach((p, i) => {
                    p.style.display = i === index ? 'flex' : 'none';
                });
            });

            // Hover effect (only for non-active)
            tab.addEventListener('mouseenter', () => {
                if (panels[index].style.display !== 'flex') {
                    tab.style.background = 'var(--c-text)';
                    tab.style.color = 'var(--c-bg)';
                }
            });
            tab.addEventListener('mouseleave', () => {
                if (panels[index].style.display !== 'flex') {
                    tab.style.background = 'var(--c-bg)';
                    tab.style.color = 'var(--c-text)';
                }
            });

            tabBar.appendChild(tab);
            panelsContainer.appendChild(panel);
        });

        container.appendChild(tabBar);
        container.appendChild(panelsContainer);
        return container;
    }

    _buildPanel(blocks) {
        const panel = document.createElement('div');
        panel.className = 'tool-panel';
        panel.style.cssText = `
            display: flex;
            flex-direction: column;
        `;

        // Detect if blocks have extra nesting level (panel → blocks → components)
        // vs direct structure (blocks → components)
        const hasNestedPanels = this._hasNestedPanelStructure(blocks);

        if (hasNestedPanels) {
            // 3-level: panels contain blocks contain components
            // Flatten to a single list first so we can identify first/last reliably.
            const flatDefs = [];
            blocks.forEach(([, nestedBlocks]) => {
                nestedBlocks.forEach(blockDef => flatDefs.push(blockDef));
            });
            flatDefs.forEach((blockDef, i) => {
                const [blockTitle, components, options = {}] = blockDef;
                const block = this._buildBlock(blockTitle, components, i === 0, i === flatDefs.length - 1, options);
                panel.appendChild(block);
                this.blocks.push(block);
            });
        } else {
            // 2-level: blocks contain components (standard)
            blocks.forEach((blockDef, blockIndex) => {
                const [blockTitle, components, options = {}] = blockDef;
                const isLast = blockIndex === blocks.length - 1;
                const block = this._buildBlock(blockTitle, components, blockIndex === 0, isLast, options);
                panel.appendChild(block);
                this.blocks.push(block);
            });
        }

        return panel;
    }

    /**
     * Detect if blocks array has nested panel structure
     * 3-level: ['PANEL', [['Block', [['slider', ...]]]]]
     * 2-level: ['Block', [['slider', ...]]]
     */
    _hasNestedPanelStructure(blocks) {
        if (!blocks || blocks.length === 0) return false;
        
        const [, firstContent] = blocks[0];
        if (!Array.isArray(firstContent) || firstContent.length === 0) return false;
        
        const [firstItem] = firstContent;
        if (!Array.isArray(firstItem) || firstItem.length < 2) return false;
        
        // Check if the first item's first element is a known component type
        const [potentialType] = firstItem;
        const isComponentType = typeof potentialType === 'string' && 
            COMPONENT_TYPES[potentialType.toLowerCase()] !== undefined;
        
        // If NOT a component type, it's likely a nested block title
        return !isComponentType;
    }

    _buildBlock(title, components, isFirst = false, isLast = false, options = {}) {
        const block = document.createElement('div');
        block.className = 'tool-block';
        block.style.cssText = `
            ${isFirst ? '' : `border-top: 1px solid var(--c-border);`}
            ${isLast  ? `border-bottom: 1px solid var(--c-border);` : ''}
        `;

        const isSelectable = options.mode === 'selectable';
        const isSelectableCollapsible = options.mode === 'selectableCollapsible';
        const hasControls = components && components.length > 0;

        // Block header - full width, padding inside
        if (title) {
            const header = document.createElement('div');
            const headerClass = isSelectableCollapsible 
                ? 'tool-block-header tool-block-header--selectable-collapsible'
                : isSelectable 
                    ? 'tool-block-header tool-block-header--selectable' 
                    : 'tool-block-header tool-block-header--container';
            header.className = headerClass;
            
            // Store block ID if provided (for selectable items)
            if (options.id) {
                header.dataset.blockId = options.id;
            }
            
            header.style.cssText = `
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${this.F}px;
                font-weight: bold;
                color: var(--c-text);
                text-transform: uppercase;
                padding: ${this.F}px;
                border-bottom: 1px solid var(--c-border);
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            const titleEl = document.createElement('span');
            titleEl.textContent = title;
            titleEl.style.cssText = 'flex: 1; user-select: none;';
            header.appendChild(titleEl);
            
            if (isSelectable && !hasControls) {
                // SELECTABLE MODE (NO CONTROLS): No toggle icon, emit selection event on click
                
                // Hover effect
                header.addEventListener('mouseenter', () => {
                    if (!header.classList.contains('active')) {
                        header.style.background = 'var(--vga-gray)';
                        header.style.color = 'var(--vga-white)';
                    }
                });
                header.addEventListener('mouseleave', () => {
                    if (!header.classList.contains('active')) {
                        header.style.background = 'transparent';
                        header.style.color = 'var(--c-text)';
                    }
                });
                
                // Click handler - emit selection event
                header.addEventListener('click', () => {
                    if (options.id) {
                        // Trigger onUpdate with selection
                        this.onUpdate(options.key || 'selectedItem', options.id);
                    }
                });
                
                block.appendChild(header);
            } else if (isSelectable && hasControls || isSelectableCollapsible) {
                // SELECTABLE + COLLAPSIBLE MODE: Split-zone interaction
                // Title area = select, toggle icon = expand/collapse
                
                // Add toggle icon
                const toggleIcon = document.createElement('span');
                toggleIcon.textContent = '−';
                toggleIcon.style.cssText = `
                    font-size: ${this.F}px;
                    font-weight: normal;
                    padding: ${this.F2}px ${this.F}px;
                    margin: -${this.F}px -${this.F}px -${this.F}px ${this.F2}px;
                    user-select: none;
                `;
                toggleIcon.className = 'toggle-zone';
                header.appendChild(toggleIcon);
                
                // Store collapsed state (default expanded if selectable)
                let collapsed = options.defaultCollapsed !== undefined ? options.defaultCollapsed : false;
                
                // Title zone hover effect
                titleEl.addEventListener('mouseenter', () => {
                    if (!header.classList.contains('active')) {
                        titleEl.style.textDecoration = 'underline';
                    }
                });
                titleEl.addEventListener('mouseleave', () => {
                    titleEl.style.textDecoration = 'none';
                });
                
                // Toggle zone hover effect
                toggleIcon.addEventListener('mouseenter', () => {
                    toggleIcon.style.background = 'var(--vga-gray)';
                    toggleIcon.style.color = 'var(--vga-white)';
                });
                toggleIcon.addEventListener('mouseleave', () => {
                    toggleIcon.style.background = 'transparent';
                    toggleIcon.style.color = 'inherit';
                });
                
                block.appendChild(header);
                
                // Block content - padded
                const content = document.createElement('div');
                content.className = 'tool-block-content';
                content.style.cssText = `
                    display: ${collapsed ? 'none' : 'flex'};
                    flex-direction: column;
                    gap: ${this.F2}px;
                    padding: ${this.F}px;
                `;

                components.forEach(componentDef => {
                    const component = this._buildComponent(componentDef);
                    if (component) {
                        const rendered = component.render();
                        if (rendered) {
                            content.appendChild(rendered);
                            this.componentInstances.push(component);
                        }
                    }
                });

                block.appendChild(content);
                
                // Title click = select
                titleEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (options.id) {
                        this.onUpdate(options.key || 'selectedItem', options.id);
                    }
                });
                
                // Toggle icon click = expand/collapse
                toggleIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    collapsed = !collapsed;
                    content.style.display = collapsed ? 'none' : 'flex';
                    toggleIcon.textContent = collapsed ? '+' : '−';
                    header.style.borderBottom = collapsed ? 'none' : `1px solid var(--c-border)`;
                });
                
                // Set initial border state
                header.style.borderBottom = collapsed ? 'none' : `1px solid var(--c-border)`;
            } else {
                // CONTAINER MODE: Collapsible with toggle icon
                
                // Store collapsed state (must define before using in toggleIcon)
                let collapsed = options.defaultCollapsed !== undefined ? options.defaultCollapsed : false;
                
                // Add toggle icon
                const toggleIcon = document.createElement('span');
                toggleIcon.textContent = collapsed ? '+' : '−';
                toggleIcon.style.cssText = `
                    font-size: ${this.F}px;
                    font-weight: normal;
                `;
                header.appendChild(toggleIcon);
                
                // Hover effect
                header.addEventListener('mouseenter', () => {
                    header.style.background = 'var(--c-text)';
                    header.style.color = 'var(--c-bg)';
                });
                header.addEventListener('mouseleave', () => {
                    header.style.background = 'transparent';
                    header.style.color = 'var(--c-text)';
                });
                
                block.appendChild(header);
                
                // Block content - padded
                const content = document.createElement('div');
                content.className = 'tool-block-content';
                content.style.cssText = `
                    display: ${collapsed ? 'none' : 'flex'};
                    flex-direction: column;
                    gap: ${this.F2}px;
                    padding: ${this.F}px;
                `;

                components.forEach(componentDef => {
                    const component = this._buildComponent(componentDef);
                    if (component) {
                        const rendered = component.render();
                        if (rendered) {
                            content.appendChild(rendered);
                            this.componentInstances.push(component);
                        }
                    }
                });

                block.appendChild(content);
                
                // Set initial border state
                header.style.borderBottom = collapsed ? 'none' : `1px solid var(--c-border)`;
                
                // Add click handler to toggle
                header.addEventListener('click', () => {
                    collapsed = !collapsed;
                    content.style.display = collapsed ? 'none' : 'flex';
                    toggleIcon.textContent = collapsed ? '+' : '−';
                    header.style.borderBottom = collapsed ? 'none' : `1px solid var(--c-border)`;
                });
            }
        } else {
            // No header - just content
            const content = document.createElement('div');
            content.className = 'tool-block-content';
            content.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: ${this.F2}px;
                padding: ${this.F}px;
            `;

            components.forEach(componentDef => {
                const component = this._buildComponent(componentDef);
                if (component) {
                    const rendered = component.render();
                    if (rendered) {
                        content.appendChild(rendered);
                        this.componentInstances.push(component);
                    }
                }
            });

            block.appendChild(content);
        }

        return block;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // COMPONENT BUILDING
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Build a component from a compact definition array
     */
    _buildComponent(def) {
        if (!Array.isArray(def) || def.length < 2) {
            console.warn('Invalid component definition:', def);
            return null;
        }

        const [type, ...args] = def;
        const ComponentClass = this._resolveComponentClass(type);

        if (!ComponentClass) {
            console.warn('Unknown component type:', type, '- ComponentLibrary.Tool may not have:', COMPONENT_TYPES[type.toLowerCase()]);
            return null;
        }

        const options = this._parseComponentOptions(type, args);
        const component = new ComponentClass(options, this.deps);

        // Store reference by key
        if (options.key) {
            this.components.set(options.key, component);
        }

        return component;
    }

    _resolveComponentClass(type) {
        const className = COMPONENT_TYPES[type.toLowerCase()];
        if (!className) return null;
        return getComponentClass(className, this.deps);
    }

    _parseComponentOptions(type, args) {
        const typeLower = type.toLowerCase();
        let options = {};

        // Extract trailing options object if present
        const lastArg = args[args.length - 1];
        const hasOptionsObj = lastArg && typeof lastArg === 'object' && !Array.isArray(lastArg);
        const extraOptions = hasOptionsObj ? args.pop() : {};

        switch (typeLower) {
            case 'slider':
            case 'number':
            case 'stepper':
                options = {
                    label: args[0],
                    min: args[1] ?? 0,
                    max: args[2] ?? 100,
                    step: args[3] ?? 1,
                    value: extraOptions.value ?? args[1] ?? 0,
                    // slider = slider only; number = field only; stepper = slider + field + steppers
                    display: typeLower === 'number' ? 'field' :
                             typeLower === 'slider' && extraOptions.withNumber === false ? 'slider' : 'both',
                    showSteppers: typeLower === 'stepper' || extraOptions.withStepper,
                    precision: extraOptions.precision ?? this._inferPrecision(args[3] ?? 1),
                    key: extraOptions.key ?? this._makeKey(args[0]),
                    onChange: (v) => this._handleChange(options.key, v),
                };
                break;

            case 'text':
            case 'textarea':
                options = {
                    label: args[0],
                    value: args[1] ?? '',
                    placeholder: extraOptions.placeholder ?? '',
                    multiline: typeLower === 'textarea',
                    inputClassName: extraOptions.inputClassName ?? null,
                    rows: extraOptions.rows ?? 4,
                    key: extraOptions.key ?? this._makeKey(args[0]),
                    onChange: (v) => this._handleChange(options.key, v),
                };
                break;

            case 'dropdown':
            case 'select':
                options = {
                    label: args[0],
                    options: args[1] ?? [],
                    value: extraOptions.value ?? (args[1]?.[0]?.value ?? args[1]?.[0]),
                    key: extraOptions.key ?? this._makeKey(args[0]),
                    onChange: (v) => this._handleChange(options.key, v),
                };
                break;

            case 'toggle':
            case 'radio':
            case 'checkbox':
                options = {
                    label: args[0],
                    items: args[1] ?? [],
                    exclusive: typeLower === 'radio',
                    layout: extraOptions.layout ?? 'list',
                    selectedValues: extraOptions.selectedValues ?? [],
                    selectedValue: extraOptions.selectedValue ?? null,
                    key: extraOptions.key ?? this._makeKey(args[0]),
                    onChange: (v) => this._handleChange(options.key, v),
                };
                break;

            case 'color':
                options = {
                    label: args[0],
                    value: args[1] ?? '#000000',
                    showHex: extraOptions.showHex ?? true,
                    key: extraOptions.key ?? this._makeKey(args[0]),
                    onChange: (v) => this._handleChange(options.key, v),
                };
                break;

            case 'file':
                options = {
                    label: args[0],
                    accept: args[1] ?? '*/*',
                    buttonText: extraOptions.buttonText ?? 'Choose...',
                    multiple: extraOptions.multiple ?? false,
                    key: extraOptions.key ?? this._makeKey(args[0]),
                    onChange: (v) => this._handleChange(options.key, v),
                };
                break;

            case 'filament-picker':
                options = {
                    label: args[0],
                    palette: args[1] ?? [], // [{h: '#hex', n: 'name'}]
                    min: extraOptions.min ?? 2,
                    max: extraOptions.max ?? 10,
                    selectedIndices: extraOptions.selectedIndices ?? [],
                    key: extraOptions.key ?? this._makeKey(args[0]),
                    onChange: (indices, colors) => {
                        this._handleChange(options.key + '_indices', indices);
                        this._handleChange(options.key + '_colors', colors);
                    },
                };
                break;

            case 'adjustment-bundle':
                // args[0] is bundle type: 'minimal', 'standard', 'professional'
                // args[1] is unused (null placeholder)
                // extraOptions contains: key, onChange, onTransform
                options = {
                    bundleType: args[0] ?? 'standard',
                    key: extraOptions.key ?? 'adjustmentBundle',
                    onChange: extraOptions.onChange ?? null,
                    onTransform: extraOptions.onTransform ?? null,
                };
                break;

            case 'button': {
                const buttonKey = extraOptions.key ?? this._makeKey(args[0]);
                options = {
                    text: args[0],
                    onClick: args[1] ?? (() => {
                        // Trigger onUpdate when clicked
                        this._handleChange(buttonKey, true);
                    }),
                    size: extraOptions.size ?? 'm',
                    fill: extraOptions.fill ?? true,
                    key: buttonKey,
                };
                break;
            }

            case 'markdown':
                options = {
                    variant: 'markdown',
                    content: args[0],
                };
                break;

            case 'label':
            case 'value':
                options = {
                    variant: extraOptions.variant ?? (typeLower === 'value' ? 'value' : 'body'),
                    content: args[0],
                    label: extraOptions.label,
                    unit: extraOptions.unit,
                    level: extraOptions.level,
                    status: extraOptions.status,
                };
                break;

            case 'progress':
                options = {
                    label: args[0],
                    value: args[1] ?? 0,
                    showLabel: extraOptions.showLabel ?? true,
                    key: extraOptions.key ?? this._makeKey(args[0]),
                };
                break;

            case 'equation':
                // For equation, the params object IS the extraOptions (after pop)
                // Filter out the special keys to get the actual params
                const equationKey = extraOptions.key ?? 'equation';
                const equationParams = {};
                for (const [k, v] of Object.entries(extraOptions)) {
                    if (k !== 'key' && typeof v === 'object' && v !== null && 'value' in v) {
                        equationParams[k] = v;
                    }
                }
                options = {
                    template: args[0],
                    params: equationParams,
                    key: equationKey,
                    onChange: (k, v) => this._handleChange(`equation.${k}`, v),
                };
                // Don't spread extraOptions for equation - we've already extracted what we need
                return options;
        }

        return { ...options, ...extraOptions };
    }

    _makeKey(label) {
        if (!label) return `comp_${Date.now()}`;
        return label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    }

    _inferPrecision(step) {
        const stepStr = String(step);
        const decimalIndex = stepStr.indexOf('.');
        return decimalIndex === -1 ? 0 : stepStr.length - decimalIndex - 1;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CANVAS AREA
    // ═══════════════════════════════════════════════════════════════════════════

    _buildCanvasArea(isPortrait = false) {
        const area = document.createElement('div');
        area.className = 'tool-canvas-area';

        if (isPortrait) {
            // Portrait: canvas area at top, flexible height
            area.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: stretch;
                justify-content: stretch;
                padding: ${this.F}px;
                background: var(--c-bg);
                flex: 1;
                min-height: 200px;
                min-width: 0;
                overflow-x: hidden;
            `;
        } else {
            // Landscape: fill available space, allow Canvas component to manage overflow
            area.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: stretch;
                justify-content: stretch;
                height: 100%;
                min-height: 0;
                min-width: 0;
                overflow: hidden;
                background: var(--c-bg);
            `;
        }

        // Store reference for later size calculation
        this.canvasArea = area;
        
        // Build canvas mode tabs if configured
        if (this.canvasModeTabsConfig) {
            const { CanvasModeTabs } = this.deps.ComponentLibrary;
            if (!CanvasModeTabs) {
                console.error('❌ CanvasModeTabs component not available in ComponentLibrary');
            } else {
                this.canvasModeTabsComponent = new CanvasModeTabs({
                    tabs: this.canvasModeTabsConfig.tabs,
                    activeTab: this.canvasModeTabsConfig.defaultTab || this.canvasModeTabsConfig.tabs[0]?.id,
                    onChange: (id) => {
                        if (this.canvasModeTabsConfig.onTabChange) {
                            this.canvasModeTabsConfig.onTabChange(id, this);
                        }
                    }
                }, this.deps);
                
                const tabsElement = this.canvasModeTabsComponent.render();
                area.appendChild(tabsElement);
                this.componentInstances.push(this.canvasModeTabsComponent);
            }
        }
        
        // Calculate initial size
        let size = this._calculateCanvasSize();
        
        // Check for 'none' mode - tool will manage canvas area directly
        if (this.canvasConfig.mode === 'none') {
            window.debugLog('INIT', 'ToolBase: Canvas mode set to "none", tool will manage canvas area');
            return area;
        }
        
        // Check for ImageViewport mode
        const useImageViewport = this.canvasConfig.mode === 'imageViewport';
        
        if (useImageViewport) {
            // Use ImageViewport component for image display
            const { ImageViewport } = this.deps.ComponentLibrary;
            if (!ImageViewport) {
                console.warn('⚠️ ImageViewport component not available');
                return area;
            }
            
            this.imageViewport = new ImageViewport({
                width: size,
                height: size,
                displayMode: this.canvasConfig.displayMode ?? 'fit',
                enableZoom: this.canvasConfig.enableZoom ?? false,
                enablePan: this.canvasConfig.enablePan ?? false,
                minZoom: this.canvasConfig.minZoom ?? 0.1,
                maxZoom: this.canvasConfig.maxZoom ?? 10,
            }, this.deps);
            
            const viewportElement = this.imageViewport.render();
            this.canvas = this.imageViewport.canvasEl;
            this.ctx = this.imageViewport.ctx;
            this.componentInstances.push(this.imageViewport);
            area.appendChild(viewportElement);
            
            console.log('✅ Using ImageViewport component');
        } else {
            // ALWAYS use Canvas component for procedural rendering
            const { Canvas } = this.deps.ComponentLibrary;
            if (!Canvas) {
                console.error('❌ Canvas component not available in ComponentLibrary');
                return area;
            }
            
            // Use configured canvas dimensions for buffer resolution (NOT container size)
            const canvasWidth = this.canvasConfig.width ?? size;
            const canvasHeight = this.canvasConfig.height ?? size;
            
            // Hook up tool's onDraw to Canvas component's draw callback
            const toolOnDraw = this.onDraw;
            const toolValues = () => this.values;
            const self = this;
            
            this.canvasComponent = new Canvas({
                width: canvasWidth,
                height: canvasHeight,
                context: this.canvasConfig.context ?? '2d',
                
                // Feature flags
                enableZoom: this.canvasConfig.enableZoom ?? false,
                enablePan: this.canvasConfig.enablePan ?? false,
                displayMode: this.canvasConfig.displayMode ?? 'fit',  // Default to 'fit' mode
                enableHUD: this.canvasConfig.enableHUD ?? false,
                hud: this.canvasConfig.hud ?? [],
                
                // Zoom/pan config
                minZoom: this.canvasConfig.minZoom ?? 0.1,
                maxZoom: this.canvasConfig.maxZoom ?? 10,
                zoomSpeed: this.canvasConfig.zoomSpeed ?? 0.1,
                
                // Interactive features
                interactive: this.canvasConfig.interactive ?? false,
                onClick: this.canvasConfig.onClick ?? null,
                onDrag: this.canvasConfig.onDrag ?? null,
                onWheel: this.canvasConfig.onWheel ?? null,
                
                // Draw callback
                // Note: self.canvas may not be assigned yet during initial render,
                // so fall back to canvasComponent.canvasEl for the initial draw
                draw: (ctx, width, height) => {
                    if (toolOnDraw) {
                        const canvasEl = self.canvas || self.canvasComponent?.canvasEl;
                        if (canvasEl) {
                            toolOnDraw.call(self, ctx, canvasEl, toolValues());
                        }
                    }
                },
                
                // Resize notification
                onResize: (width, height, oldWidth, oldHeight) => {
                    self.onUpdate.call(self, '_canvasResize', {
                        width,
                        height,
                        previousWidth: oldWidth,
                        previousHeight: oldHeight
                    }, self.values);
                }
            }, this.deps);
            
            const canvasElement = this.canvasComponent.render();
            
            // Expose for tool access (API unchanged for tools)
            this.canvas = this.canvasComponent.canvasEl;
            this.ctx = this.canvasComponent.ctx;
            
            // Track component for cleanup
            this.componentInstances.push(this.canvasComponent);
            area.appendChild(canvasElement);
            
            console.log('✅ Using Canvas component');
        }

        return area;
    }

    _calculateCanvasSize() {
        // If fillContainer is true, calculate size based on available space
        if (this.canvasConfig.fillContainer && this.element) {
            const container = this.canvasArea || this.element.querySelector('.tool-canvas-area');
            if (container) {
                const rect = container.getBoundingClientRect();
                // Use smaller dimension to keep square, subtract padding
                const availableWidth = rect.width - (this.F * 2);
                const availableHeight = rect.height - (this.F * 2);
                const size = Math.min(availableWidth, availableHeight);
                // Snap to F grid
                return Math.floor(size / this.F) * this.F;
            }
        }
        
        // If explicit dimensions provided, use smaller dimension for square canvas
        if (this.canvasConfig.width && this.canvasConfig.height) {
            return Math.min(this.canvasConfig.width, this.canvasConfig.height);
        }
        
        // Default: 30F (420px at F=14)
        const targetSize = this.canvasConfig.size ?? this.F * 30;
        return Math.floor(targetSize / this.F) * this.F;
    }
    
    _resizeCanvasToFit() {
        if (!this.canvasArea) {
            console.warn('⚠️ Cannot resize: canvasArea not available');
            return;
        }
        
        const rect = this.canvasArea.getBoundingClientRect();
        const padding = this.F * 2;
        const availableWidth = rect.width - padding;
        const availableHeight = rect.height - padding;
        
        // Snap to F-grid
        const width = Math.floor(availableWidth / this.F) * this.F;
        const height = Math.floor(availableHeight / this.F) * this.F;
        
        console.log('📐 Resizing canvas to fit container:', {
            container: { width: rect.width, height: rect.height },
            available: { width: availableWidth, height: availableHeight },
            canvas: { width, height }
        });
        
        if (this.canvasComponent) {
            // Use Canvas component's public resize API
            // This triggers onResize callback which fires _canvasResize event
            this.canvasComponent.resize(width, height, { resetTransform: true });
            
            // Update local refs
            this.canvas = this.canvasComponent.canvasEl;
            this.ctx = this.canvasComponent.ctx;
            
            console.log('✅ Canvas resized via component API');
        } else if (this.imageViewport) {
            // Use ImageViewport's resize API
            this.imageViewport.resize(width, height);
            
            // Update local refs
            this.canvas = this.imageViewport.canvasEl;
            this.ctx = this.imageViewport.ctx;
            
            console.log('✅ ImageViewport resized');
        }
    }
    
    /**
     * Set canvas display mode (fit/fill/actual)
     */
    setCanvasDisplayMode(mode) {
        if (this.canvasComponent) {
            this.canvasComponent.setDisplayMode(mode);
        } else if (this.imageViewport) {
            this.imageViewport.setDisplayMode(mode);
        }
    }
    
    _injectAnimationExportIntoSidebar() {
        const { AnimationExport } = this.deps.ComponentLibrary;
        if (!AnimationExport) {
            console.warn('⚠️ AnimationExport not available in ComponentLibrary');
            return;
        }
        
        window.debugLog('INIT', `🎬 Injecting AnimationExport into sidebar for ${this.title}`);
        
        // Find the ANIMATION tab panel in the sidebar
        // Look for the panel that was created for the ANIMATION tab
        const animationTabIndex = this.sidebarConfig.findIndex(
            ([tabName]) => tabName === 'ANIMATION'
        );
        
        if (animationTabIndex === -1) {
            console.warn('⚠️ ANIMATION tab not found in sidebar config');
            return;
        }
        
        // Find the panel container (tool-panels) and get the correct panel
        const panelsContainer = this.sidebar.querySelector('.tool-panels');
        if (!panelsContainer) {
            console.warn('⚠️ Panels container not found in sidebar');
            return;
        }
        
        const panels = panelsContainer.querySelectorAll('.tool-panel');
        const animationPanel = panels[animationTabIndex];
        
        if (!animationPanel) {
            console.warn('⚠️ Animation panel not found at index', animationTabIndex);
            return;
        }
        
        // Find the Export Settings block content
        const blockContent = animationPanel.querySelector('.tool-block-content');
        if (!blockContent) {
            console.warn('⚠️ Block content not found in animation panel');
            return;
        }
        
        // Create export component
        const exportComponent = new AnimationExport({
            canvas: this.canvas,
            getCanvas: () => this.canvas,
            type: this.animationConfig.type || 'infinite',
            loopFrames: this.animationConfig.loopFrames || 0,
            loopDuration: this.animationConfig.loopDuration || 0,
            sequenceLength: this.animationConfig.sequenceLength || 0,
            sequenceDuration: this.animationConfig.sequenceDuration || 0,
            defaultFps: this.animationConfig.defaultFps || 60,
            canPrerender: this.animationConfig.canPrerender !== false,
            renderFrame: (frameIndex, totalFrames) => {
                // Call tool's draw function for this frame
                if (this.onDraw && this.ctx) {
                    this.onDraw(this.ctx, this.canvas, this.values);
                }
            },
            getState: () => ({ ...this.values }),
            setState: (state) => {
                Object.assign(this.values, state);
            }
        }, this.deps);
        
        this.addChild(exportComponent);
        this.componentInstances.push(exportComponent);
        
        // Render and append to block content (no extra styling needed - block provides padding)
        const exportElement = exportComponent.render();
        if (exportElement) {
            blockContent.appendChild(exportElement);
            window.debugLog('INIT', `✅ AnimationExport injected into ANIMATION tab for ${this.title}`);
        }
    }

    _injectSequencerV2() {
        const { SequencerV2 } = this.deps.ComponentLibrary;
        if (!SequencerV2) {
            console.warn('⚠️ SequencerV2 not available in ComponentLibrary');
            return;
        }

        // Find ANIMATION tab panel
        const animationTabIndex = this.sidebarConfig.findIndex(([name]) => name === 'ANIMATION');
        if (animationTabIndex === -1) return;

        const panelsContainer = this.sidebar.querySelector('.tool-panels');
        if (!panelsContainer) return;

        const panels = panelsContainer.querySelectorAll('.tool-panel');
        const animationPanel = panels[animationTabIndex];
        if (!animationPanel) return;

        // Find the Sequence block content (first block in ANIMATION tab)
        const blockContents = animationPanel.querySelectorAll('.tool-block-content');
        const seqBlockContent = blockContents[0]; // Sequence block is first
        if (!seqBlockContent) return;

        const animCfg = this.animationConfig;

        const seq = new SequencerV2({
            fps: animCfg.defaultFps || 60,
            loop: animCfg.loop !== false,
            defaultHold: animCfg.defaultHold || 2,
            defaultSegmentDuration: animCfg.defaultSegmentDuration || 1.5,
            defaultEasing: animCfg.defaultEasing || 'easeInOutCubic',
            onSave: () => {
                if (animCfg.onSave) return animCfg.onSave(this);
                return { ...this.values };
            },
            onLoad: (params) => {
                if (animCfg.onLoad) {
                    animCfg.onLoad(params, this);
                } else {
                    Object.assign(this.values, params);
                    this.draw();
                }
            },
            onFrame: (params) => {
                if (animCfg.onFrame) {
                    animCfg.onFrame(params, this);
                } else {
                    Object.assign(this.values, params);
                    this.draw();
                }
            },
            renderToBuffer: animCfg.renderToBuffer || null,
            onTotalDurationChange: (duration) => {
                // Keep AnimationExport in sync with sequence duration if present
                if (animCfg.onTotalDurationChange) animCfg.onTotalDurationChange(duration, this);
            }
        }, this.deps);

        this.addChild(seq);
        this.componentInstances.push(seq);

        // Mount panel into sidebar Sequence block
        const panelEl = seq.render();
        if (panelEl) seqBlockContent.appendChild(panelEl);

        // Mount strip below canvas area
        const stripEl = seq.getStripElement();
        if (stripEl && this.canvasArea) this.canvasArea.appendChild(stripEl);

        // Expose for tool scripts that want direct access
        this.sequencerV2 = seq;

        window.debugLog('INIT', `✅ SequencerV2 injected for ${this.title}`);
    }

    _wireAutoControls() {
        // Wire up fit canvas button if it exists (auto-injected when showControls: true)
        const fitBtn = this.getComponent('fitCanvas');
        if (fitBtn && fitBtn.element) {
            fitBtn.element.addEventListener('click', () => this._toggleCanvasDisplay());
        }
    }


    _toggleCanvasDisplay() {
        if (!this.canvas) return;

        const isFit = this.canvas.style.width === '100%';
        if (isFit) {
            // Switch to actual size
            this.canvas.style.width = `${this.canvas.width}px`;
            this.canvas.style.height = `${this.canvas.height}px`;
            this.canvas.style.imageRendering = 'pixelated';
        } else {
            // Switch to fit container
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.imageRendering = 'auto';
        }
    }

    _snapToGrid(targetSize) {
        return Math.floor(targetSize / this.F) * this.F;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // VALUE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    _collectInitialValues() {
        this.components.forEach((component, key) => {
            if (typeof component.getValue === 'function') {
                this.values[key] = component.getValue();
            } else if (component.value !== undefined) {
                this.values[key] = component.value;
            }
        });
    }

    _handleChange(key, value) {
        // Handle displayMode radio button
        if (key === 'displayMode') {
            const modeMap = { 'Fit': 'fit', 'Fill': 'fill', 'Actual': 'actual' };
            const mode = modeMap[value] || 'fit';
            this.setCanvasDisplayMode(mode);
            // Don't store in values or call onUpdate for internal controls
            return;
        }
        
        this.values[key] = value;
        this.onUpdate.call(this, key, value, this.values);

        // Auto-redraw if onDraw is defined
        if (this.onDraw) {
            this.draw();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════

    mount(container) {
        container.innerHTML = '';
        container.appendChild(this.render());
        
        // If fillContainer is enabled, resize canvas after mount
        if (this.canvasConfig.fillContainer) {
            console.log('🔍 fillContainer enabled, resizing after mount');
            // Use a longer delay to ensure Canvas component is fully initialized
            setTimeout(() => {
                console.log('🔍 Executing resize callback after mount');
                this._resizeCanvasToFit();
            }, 200);
        }
        
        return this;
    }

    getValue(key) {
        return this.values[key];
    }

    getValues() {
        return { ...this.values };
    }

    setValue(key, value) {
        // Handle special _filename suffix for FileInput components
        if (key.endsWith('_filename')) {
            const baseKey = key.slice(0, -9); // Remove '_filename'
            const fileInput = this.components.get(baseKey);
            if (fileInput && typeof fileInput.setFilename === 'function') {
                fileInput.setFilename(value);
            }
            return;
        }
        
        const component = this.components.get(key);
        if (component && typeof component.setValue === 'function') {
            component.setValue(value);
        }
        this.values[key] = value;
    }

    getCanvas() {
        return this.canvas;
    }

    getContext() {
        return this.ctx;
    }

    /**
     * Trigger canvas redraw - calls the onDraw callback
     */
    draw() {
        if (this.canvasComponent) {
            this.canvasComponent.redraw();
        }
    }

    setStatus(text) {
        if (this.statusEl) {
            this.statusEl.textContent = text;
        }
    }

    getComponent(key) {
        return this.components.get(key);
    }

    // =========================================================================
    // IMAGE DATA METHODS
    // =========================================================================

    /**
     * Display ImageData on canvas
     * @param {ImageData} imageData - ImageData to display
     * @param {number} x - X offset (default 0)
     * @param {number} y - Y offset (default 0)
     */
    setImageData(imageData, x = 0, y = 0) {
        if (this.canvasComponent) {
            this.canvasComponent.setImageData(imageData, x, y);
        }
    }

    /**
     * Get current canvas content as ImageData
     * @returns {ImageData|null}
     */
    getImageData() {
        return this.canvasComponent?.getImageData() ?? null;
    }

    // =========================================================================
    // EXPORT METHODS
    // =========================================================================

    /**
     * Download canvas as PNG file
     * @param {string} filename - Filename for download
     */
    exportPNG(filename = 'export.png') {
        if (this.canvasComponent) {
            this.canvasComponent.download(filename);
        }
    }

    /**
     * Get canvas content as Blob (for batch processing)
     * @param {string} type - MIME type (default 'image/png')
     * @returns {Promise<Blob|null>}
     */
    async exportBlob(type = 'image/png') {
        return this.canvasComponent?.toBlob(type) ?? null;
    }

    /**
     * Convert ImageData to Blob without affecting canvas display
     * Useful for batch processing where you don't want to change what's shown
     * @param {ImageData} imageData - ImageData to convert
     * @param {string} type - MIME type (default 'image/png')
     * @returns {Promise<Blob>}
     */
    imageDataToBlob(imageData, type = 'image/png') {
        return new Promise((resolve) => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = imageData.width;
            tempCanvas.height = imageData.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(imageData, 0, 0);
            tempCanvas.toBlob(resolve, type);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DYNAMIC SIDEBAR REBUILDING
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Rebuild sidebar with new configuration without destroying canvas
     * Useful for dynamic tools that change sidebar content based on user selection
     * @param {Array} newSidebarConfig - New sidebar configuration array
     */
    rebuildSidebar(newSidebarConfig) {
        if (!this.sidebar || !this.element) {
            console.warn('⚠️ Cannot rebuild sidebar: sidebar or element not initialized');
            return;
        }
        
        // Store current scroll position
        const scrollTop = this.sidebar.scrollTop;
        
        // Destroy existing sidebar components
        this.blocks.forEach(block => {
            if (block.componentInstances) {
                block.componentInstances.forEach(c => c.destroy && c.destroy());
            }
        });
        
        // Clear sidebar DOM
        while (this.sidebar.firstChild) {
            this.sidebar.removeChild(this.sidebar.firstChild);
        }
        
        // Update config
        this.sidebarConfig = newSidebarConfig;
        
        // Rebuild content
        const isPortrait = this.element.style.flexDirection === 'column';
        const hasTabs = newSidebarConfig.length > 1 &&
                        newSidebarConfig.every(item => Array.isArray(item) && typeof item[0] === 'string');
        
        if (hasTabs) {
            this.sidebar.appendChild(this._buildTabs());
        } else {
            // Single panel
            let blocks;
            if (newSidebarConfig.length === 1 && Array.isArray(newSidebarConfig[0]) && newSidebarConfig[0].length === 2) {
                blocks = newSidebarConfig[0][1];
            } else {
                blocks = newSidebarConfig;
            }
            const panel = this._buildPanel(blocks);
            panel.style.height = '100%';
            panel.style.overflowY = 'auto';
            this.sidebar.appendChild(panel);
        }
        
        // Restore scroll position
        this.sidebar.scrollTop = scrollTop;
        
        // Re-collect values and notify
        this._collectInitialValues();
        
        // Trigger onInit with new values
        this.onInit.call(this, this.values);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CONVENIENCE METHODS FOR TAB CONTROL
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Set active category tab (if category tabs are configured)
     * @param {string} id - Category ID to activate
     */
    setActiveCategory(id) {
        if (this.categoryTabsComponent && this.categoryTabsComponent.setActiveCategory) {
            this.categoryTabsComponent.setActiveCategory(id);
        }
    }
    
    /**
     * Set active canvas mode tab (if canvas mode tabs are configured)
     * @param {string} id - Tab ID to activate
     */
    setActiveCanvasTab(id) {
        if (this.canvasModeTabsComponent && this.canvasModeTabsComponent.setActiveTab) {
            this.canvasModeTabsComponent.setActiveTab(id);
        }
    }

    destroy() {
        // Remove resize listener
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
            this._resizeHandler = null;
        }

        this.componentInstances.forEach(c => c.destroy && c.destroy());
        this.componentInstances = [];
        this.components.clear();
        this.blocks = [];
        this.values = {};
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}

console.log('✅ ToolBase loaded (ES Module)');