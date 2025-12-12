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
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    // Wait for ComponentLibrary to be available
    const getComponentClass = (className) => {
        const lib = window.ComponentLibrary;
        if (!lib) {
            console.error('ComponentLibrary not available');
            return null;
        }
        // Try Tool namespace first, then direct
        return lib.Tool?.[className] || lib[`Tool${className}`] || null;
    };

    // Component type shortcuts for compact declarations
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
        'button': 'Button',
        'equation': 'EquationEditor',
        
        // Outputs
        'label': 'Text',
        'value': 'Text',
        'progress': 'ProgressBar',
        
        // Containers
        'section': 'Section',
        'grid': 'Grid',
    };

    class ToolBase {
        constructor(config = {}, deps = {}) {
            this.config = config;
            this.deps = deps;
            this.title = config.title ?? 'Tool';
            this.sidebarConfig = config.sidebar ?? [];
            this.canvasConfig = config.canvas ?? {};
            
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
            this.F = deps.MF?.F || parseInt(getComputedStyle(document.documentElement).getPropertyValue('--F')) || 14;
            this.F2 = this.F / 2;
            this.SIDEBAR_WIDTH = this.F * 30; // 30F = 420px
        }
        
        render() {
            if (this.element) return this.element;
            
            // Detect portrait/landscape
            const isPortrait = window.innerWidth < window.innerHeight || window.innerWidth < 800;
            
            this.element = document.createElement('div');
            this.element.className = 'tool-base';
            
            if (isPortrait) {
                // Portrait: stack vertically (canvas on top, sidebar below)
                this.element.style.cssText = `
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    background: var(--c-bg);
                `;
            } else {
                // Landscape: sidebar left, canvas right
                this.element.style.cssText = `
                    width: 100%;
                    height: 100%;
                    display: grid;
                    grid-template-columns: ${this.SIDEBAR_WIDTH}px 1fr;
                    gap: 0;
                    overflow: hidden;
                    background: var(--c-bg);
                `;
            }
            
            // Build canvas area (add first for portrait)
            this.canvasArea = this._buildCanvasArea(isPortrait);
            
            // Build sidebar
            this.sidebar = this._buildSidebar(isPortrait);
            
            if (isPortrait) {
                // Portrait: canvas first, then sidebar
                this.element.appendChild(this.canvasArea);
                this.element.appendChild(this.sidebar);
            } else {
                // Landscape: sidebar first, then canvas
                this.element.appendChild(this.sidebar);
                this.element.appendChild(this.canvasArea);
            }
            
            // Initialize values and trigger onInit
            this._collectInitialValues();
            this.onInit.call(this, this.values);
            
            // Listen for resize to switch layouts
            this._resizeHandler = () => this._handleResize();
            window.addEventListener('resize', this._resizeHandler);
            
            return this.element;
        }
        
        _handleResize() {
            const isPortrait = window.innerWidth < window.innerHeight || window.innerWidth < 800;
            const wasPortrait = this.element.style.flexDirection === 'column';
            
            if (isPortrait !== wasPortrait) {
                // Layout changed - rebuild
                const parent = this.element.parentNode;
                if (parent) {
                    this.destroy();
                    parent.appendChild(this.render());
                    this.draw();
                }
            }
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
                // Single panel - just blocks
                const panel = this._buildPanel(this.sidebarConfig);
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
                    tab.style.background = 'var(--c-text)';
                    tab.style.color = 'var(--c-bg)';
                });
                tab.addEventListener('mouseleave', () => {
                    // Check if this tab is currently active
                    const activeIndex = tabs.findIndex(t => t.style.background === 'var(--c-text)' && panels[tabs.indexOf(t)]?.style.display === 'flex');
                    if (tabs.indexOf(tab) !== activeIndex) {
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
            
            blocks.forEach(([blockTitle, components], blockIndex) => {
                const block = this._buildBlock(blockTitle, components, blockIndex === 0);
                panel.appendChild(block);
                this.blocks.push(block);
            });
            
            return panel;
        }
        
        _buildBlock(title, components, isFirst = false) {
            const block = document.createElement('div');
            block.className = 'tool-block';
            // No padding on block - divider lines extend to edges
            block.style.cssText = `
                ${isFirst ? '' : `border-top: 1px solid var(--c-border);`}
            `;
            
            // Block header - full width, padding inside
            if (title) {
                const header = document.createElement('div');
                header.className = 'tool-block-header';
                header.textContent = title;
                header.style.cssText = `
                    font-family: 'Atkinson Hyperlegible', monospace;
                    font-size: ${this.F}px;
                    font-weight: bold;
                    color: var(--c-text);
                    text-transform: uppercase;
                    padding: ${this.F}px;
                    border-bottom: 1px solid var(--c-border);
                `;
                block.appendChild(header);
            }
            
            // Block content - padded
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
                    content.appendChild(component.render());
                    this.componentInstances.push(component);
                }
            });
            
            block.appendChild(content);
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
            return getComponentClass(className);
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
                        key: extraOptions.key ?? this._makeKey(args[0]),
                        onChange: (v) => this._handleChange(options.key, v),
                    };
                    break;
                    
                case 'button':
                    options = {
                        text: args[0],
                        onClick: args[1] ?? (() => {}),
                        size: extraOptions.size ?? 'm',
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
                // Portrait: fixed size canvas area at top
                area.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: ${this.F}px;
                    background: var(--c-bg);
                    flex-shrink: 0;
                `;
            } else {
                area.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    min-height: 0;
                    overflow: hidden;
                    background: var(--c-bg);
                `;
            }
            
            // Canvas
            const size = this._calculateCanvasSize();
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'tool-canvas';
            this.canvas.width = size;
            this.canvas.height = size;
            this.canvas.style.cssText = `
                border: 1px solid var(--c-border);
                background: var(--c-bg);
            `;
            this.ctx = this.canvas.getContext('2d');
            
            area.appendChild(this.canvas);
            
            // Status text
            const status = document.createElement('div');
            status.className = 'tool-status';
            status.textContent = `Canvas: ${size}×${size}px`;
            status.style.cssText = `
                margin-top: ${this.F}px;
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${this.F}px;
                color: var(--c-text);
                opacity: 0.7;
            `;
            area.appendChild(status);
            this.statusEl = status;
            
            return area;
        }
        
        _calculateCanvasSize() {
            if (this.canvasConfig.width && this.canvasConfig.height) {
                return Math.min(this.canvasConfig.width, this.canvasConfig.height);
            }
            const targetSize = this.canvasConfig.size ?? this.F * 30;
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
            return this;
        }
        
        getValue(key) {
            return this.values[key];
        }
        
        getValues() {
            return { ...this.values };
        }
        
        setValue(key, value) {
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
        
        draw() {
            if (this.onDraw && this.ctx) {
                this.onDraw.call(this, this.ctx, this.canvas, this.values);
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

    // Make globally available
    window.ToolBase = ToolBase;
    
    console.log('✅ ToolBase loaded');
})();
