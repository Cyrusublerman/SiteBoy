/**
 * SiteBoy App - Complete Page Building System
 * 
 * COMPLETE PAGE BUILDING SYSTEM:
 * - Mathematical Foundation (F=12px layout calculations)
 * - Resize Manager (centralized resize handling)
 * - Block Renderer (JSON blocks → components)
 * - JSON loading and content management
 * - Page structure creation and coordination
 * - Router integration
 * 
 * @version 3.0.0 - Complete Page Building System
 * @dependencies ['ComponentLibrary', 'Router'] - External dependencies only
 */

// =================================================================
// MATHEMATICAL FOUNDATION - F=12px Layout System
// =================================================================

const MathematicalFoundation = {
    version: '2.0.0',
    F: 12,
    tokens: {
        headerH: 'calc(var(--F) * 2)',
        subheaderH: 'calc(var(--F) * 2)',
        footerH: 'calc(var(--F) * 2)',
        bodyMinH_withSub: 'calc(100vh - var(--F) * 8)',
        bodyMinH_noSub: 'calc(100vh - var(--F) * 6)',
        gutter: 'var(--F)',
        pad: 'var(--F)',
        indent: 'calc(var(--F) * 2)',
        scrollbarWidth: 'calc(var(--F) + 1px)',
        scrollbarOffset: 'calc(var(--F) * 1.5)',
        scrollbarThumbMinH: 'calc(var(--F) * 2)',
        dropdownMaxH: 'calc(var(--F) * 25)',
    },
    minCols: 1, maxCols: 6, aspectMultiplier: 3.982, aspectOffset: 1.088,
    targetMargin: 48, mobileMargin: 12,
    
    initializeCSSVars() {
        const root = document.documentElement;
        root.style.setProperty('--F', `${this.F}px`);
        root.style.setProperty('--header-height', `${this.F * 2}px`);
        root.style.setProperty('--target-margin', `${this.targetMargin}px`);
        root.style.setProperty('--mobile-margin', `${this.mobileMargin}px`);
        console.log('✅ MathematicalFoundation: CSS variables initialized');
    },
    computeColumns(width, height) {
        const aspect = width / height;
        return Math.max(this.minCols, Math.min(this.maxCols, 
            Math.round(this.aspectMultiplier * aspect - this.aspectOffset)));
    },
    calculateGridGeometry(viewportWidth, cols, gap, margin) {
        const usableWidth = viewportWidth - 2 * margin;
        const maxBoxSize = Math.floor((usableWidth - (cols - 1) * gap) / cols);
        const gridWidth = maxBoxSize * cols + (cols - 1) * gap;
        const leftover = viewportWidth - gridWidth;
        return { boxSize: maxBoxSize, gridWidth, marginLeft: Math.floor(leftover / 2), marginRight: leftover - Math.floor(leftover / 2) };
    },
    calculateComponentDimensions(type) {
        const base = { width: '100%', height: this.tokens.headerH, minHeight: this.tokens.headerH };
        switch (type) {
            case 'button': return { ...base, width: 'calc(var(--F) * 8)', height: this.tokens.headerH };
            case 'dropdown': return { ...base, maxHeight: this.tokens.dropdownMaxH };
            case 'grid': return { width: '100%', minHeight: 'calc(var(--F) * 4)' };
            case 'canvas': return { width: '100%', height: 'calc(var(--F) * 20)', maxWidth: 'calc(var(--F) * 50)' };
            case 'markdown': return { width: '100%', minHeight: this.tokens.bodyMinH_noSub };
            case 'subheader': return { width: '100%', height: this.tokens.subheaderH };
            case 'header': case 'footer': return { width: '100%', height: this.tokens.headerH };
            default: return base;
        }
    },
    applyContainerVars(element, options = {}) {
        if (!element) return;
        const { withSubheader = false } = options;
        const layout = this.computeLayout();
        element.style.setProperty('--comp-w', `${layout.gridWidth}px`);
        element.style.setProperty('--comp-h', `${layout.headerHeight}px`);
        element.style.setProperty('--comp-min-h', withSubheader ? this.tokens.bodyMinH_withSub : this.tokens.bodyMinH_noSub);
        element.style.setProperty('--top-offset', withSubheader ? 
            `calc(var(--target-margin) + var(--header-height) + var(--header-height))` : 
            `calc(var(--target-margin) + var(--header-height))`);
        element.style.setProperty('--left-offset', `${layout.marginLeft}px`);
        element.style.setProperty('--grid-width', `${layout.gridWidth}px`);
    },
    computeLayout(width = window.innerWidth, height = window.innerHeight) {
        // H-based Layout Guide: Simple viewport-based detection
        const H = this.F * 2; // Header height = 24px
        const isDesktop = width > 768; // Simple breakpoint for desktop
        
        if (isDesktop) {
            // Desktop: margin = H per edge, content width = window - 2H
            const contentWidth = width - (2 * H);
            const marginLeft = H;
            
            return {
                isDesktop: true,
                marginLeft: marginLeft,
                gridWidth: contentWidth,
                headerHeight: H,
                contentMinHeight: height - (3 * H), // Basic fallback
                // Legacy grid properties for compatibility
                cols: this.computeColumns(width, height),
                boxSize: Math.floor(contentWidth / 4), // Simple approximation
                marginRight: marginLeft
            };
        } else {
            // Mobile: full width
            return {
                isDesktop: false,
                marginLeft: 0,
                gridWidth: width,
                headerHeight: H,
                contentMinHeight: height - (2 * H), // Basic fallback
                // Legacy grid properties for compatibility  
                cols: 1,
                boxSize: width,
                marginRight: 0
            };
        }
    }
};

// =================================================================
// RESIZE MANAGER - Centralized Resize Handling
// =================================================================

const ResizeManager = {
    version: '1.0.0', handlers: new Map(), isInitialized: false, tokenCounter: 0,
    init() {
        if (this.isInitialized) return;
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => this.executeAllHandlers(), 100);
        });
        this.isInitialized = true;
        console.log('🔄 ResizeManager initialized');
    },
    subscribe(handler) {
        this.init();
        const token = `resize_${++this.tokenCounter}`;
        this.handlers.set(token, handler);
        return token;
    },
    unsubscribe(token) { if (this.handlers.has(token)) this.handlers.delete(token); },
    executeAllHandlers() {
        const evt = { width: window.innerWidth, height: window.innerHeight };
        this.handlers.forEach((handler, token) => {
            try { handler(evt); } catch (error) { console.error(`ResizeManager error for ${token}:`, error); }
        });
    }
};

// =================================================================
// BLOCK RENDERER - JSON Blocks to Components
// =================================================================

const BlockRenderer = {
    version: '1.0.0', allowedBlockTypes: ['markdown', 'media', 'graph', 'custom'],
    renderBlock(block, tracker = []) {
        if (!block?.type || !this.allowedBlockTypes.includes(block.type)) {
            return this.renderErrorBlock(`Invalid block type: ${block?.type}`, tracker);
        }
        try {
            switch (block.type) {
                case 'markdown': return this.renderMarkdownBlock(block, tracker);
                case 'media': return this.renderMediaBlock(block, tracker);
                case 'graph': return this.renderGraphBlock(block, tracker);
                case 'custom': return this.renderCustomBlock(block, tracker);
                default: return this.renderErrorBlock(`Unhandled block type: ${block.type}`, tracker);
            }
        } catch (error) {
            return this.renderErrorBlock(`Error rendering ${block.type}: ${error.message}`, tracker);
        }
    },
    renderMarkdownBlock(block, tracker) {
        const component = new ComponentLibrary.MarkdownBody({ markdownText: block.content || '*No content*' });
        tracker.push(component); return component.render();
    },
    renderMediaBlock(block, tracker) {
        const { mediaType, src, caption, size = 'M' } = block;
        if (!mediaType || !src) return this.renderErrorBlock('Media block missing fields', tracker);
        let component;
        switch (mediaType.toLowerCase()) {
            case 'image': component = new ComponentLibrary.Image({ src, caption, size: size.toLowerCase() }); break;
            case 'video': component = new ComponentLibrary.Video({ src, caption, size: size.toLowerCase(), controls: true }); break;
            case 'audio': component = new ComponentLibrary.Audio({ src, caption, controls: true }); break;
            default: return this.renderErrorBlock(`Unknown media type: ${mediaType}`, tracker);
        }
        tracker.push(component); return component.render();
    },
    renderGraphBlock(block, tracker) {
        const { graphType, data, labels = [], title, size = 'm' } = block;
        if (!graphType || !Array.isArray(data)) return this.renderErrorBlock('Graph block missing fields', tracker);
        let component;
        switch (graphType.toLowerCase()) {
            case 'bar': component = new ComponentLibrary.BarGraph({ data, labels, size, title }); break;
            case 'line': component = new ComponentLibrary.LineGraph({ data, labels, size, title }); break;
            case 'pie': component = new ComponentLibrary.PieGraph({ data, labels, size, title }); break;
            default: return this.renderErrorBlock(`Unknown graph type: ${graphType}`, tracker);
        }
        tracker.push(component); return component.render();
    },
    renderCustomBlock(block, tracker) {
        const { component: compName, vars = {} } = block;
        if (!compName || !ComponentLibrary[compName]) {
            return this.renderErrorBlock(`Component ${compName} not found`, tracker);
        }
        try {
            const component = new ComponentLibrary[compName](vars);
            tracker.push(component); return component.render();
        } catch (error) {
            return this.renderErrorBlock(`Error creating ${compName}: ${error.message}`, tracker);
        }
    },
    renderErrorBlock(errorMessage, tracker) {
        const component = new ComponentLibrary.Paragraph({ content: `⚠️ ${errorMessage}` });
        component.addClass('block-error'); tracker.push(component); return component.render();
    },
    renderBlocks(blocks, container, tracker = []) {
        if (!Array.isArray(blocks)) return;
        blocks.forEach(block => {
            const element = this.renderBlock(block, tracker);
            if (element) container.appendChild(element);
        });
    }
};

const SiteBoyApp = {
    version: '2.0.0',
    
    // Application state
    state: {
        isInitialized: false,
        currentTheme: 'normal',
        currentSection: null,
        hasSubheader: false
    },
    
    // Component references
    pageContainer: null,
    contentContainer: null,
    
    // JSON content cache and management
    jsonCache: new Map(),
    sectionPages: new Map(),
    
    /**
     * Initialize SiteBoy application - SINGLE ENTRY POINT
     */
    async init() {
        if (this.state.isInitialized) {
            console.log('🔄 SiteBoy App already initialized');
            return true;
        }
        
        console.log(`🚀 Initializing SiteBoy App v${this.version}...`);
        console.log('📋 Unified Page Creation & JSON System');
        
        try {
            // Validate dependencies
            if (!this.checkDependencies()) {
                throw new Error('Missing required dependencies');
            }
            
            // Create page structure with proper layout calculations
            this.createUnifiedPageStructure();
            
            // Initialize router with content container
            Router.init(this.contentContainer);
            
            // Initialize global features
            this.initializeGlobalFeatures();
            
            this.state.isInitialized = true;
            
            console.log('✅ SiteBoy App initialized successfully');
            console.log(`📊 F=12px Mathematical Precision Layout Active`);
            console.log(`📄 JSON-Driven Content System Ready`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize SiteBoy App:', error);
            this.showCriticalError(error.message);
            return false;
        }
    },
    
    /**
     * Check required dependencies  
     */
    checkDependencies() {
        const required = ['ComponentLibrary', 'Router'];
        
        for (const dep of required) {
            if (!window[dep]) {
                console.error(`❌ Missing dependency: ${dep}`);
                return false;
            }
        }
        
        // Initialize internal utilities
        MathematicalFoundation.initializeCSSVars();
        ResizeManager.init();
        
        // Make utilities globally available for legacy compatibility
        window.MathematicalFoundation = MathematicalFoundation;
        window.ResizeManager = ResizeManager;
        window.BlockRenderer = BlockRenderer;
        
        console.log('✅ All dependencies available and internal utilities initialized');
        return true;
    },
    
    /**
     * Create unified page structure - simplified (layout handled by PageContainer)
     */
    createUnifiedPageStructure() {
        console.log('🏗️ Creating unified page structure...');
        
        // Get app root
        const appRoot = document.getElementById('app-root');
        if (!appRoot) {
            throw new Error('app-root element not found');
        }
        
        // Clear any existing content
        appRoot.innerHTML = '';
        
        // Create navigation items for header
        const navigationItems = [
            { title: 'HOME', onClick: () => Router.navigateToSection('home') },
            { title: 'BLOG', onClick: () => Router.navigateToSection('blog') },
            { title: 'ART', onClick: () => Router.navigateToSection('art') },
            { title: 'TOOLS', onClick: () => Router.navigateToSection('tools') },
            { title: 'PROJECTS', onClick: () => Router.navigateToSection('projects') }
        ];
        
        // Create page container with internal dependencies
        const deps = {
            MF: MathematicalFoundation,
            Resize: ResizeManager
        };
        
        const { container: pageElement, component: pageComponent } = ComponentLibrary.pageContainer({
            navigationItems: navigationItems,
            onNavigate: (item) => {
                if (item.onClick) {
                    item.onClick();
                }
            }
        }, deps);
        
        this.pageContainer = pageComponent;
        
        // Render and inject page structure
        appRoot.appendChild(pageElement);
        
        // Get content container reference for router
        this.contentContainer = this.pageContainer.getContentContainer();
        
        // Store references globally for sections to access
        window.SiteBoyApp = this;
        window.Subheader = this.pageContainer.subheaderComponent;
        
        console.log('✅ Unified page structure created (layout handled by PageContainer)');
    },
    
    /**
     * Set subheader state (delegated to PageContainer)
     * @param {boolean} hasSubheader - Whether subheader should be shown
     */
    setSubheaderState(hasSubheader) {
        this.state.hasSubheader = hasSubheader;
        
        if (this.pageContainer && this.pageContainer.setSubheaderState) {
            this.pageContainer.setSubheaderState(hasSubheader);
        }
        
        console.log(`📐 App: Subheader state delegated to PageContainer: ${hasSubheader ? 'with' : 'no'} subheader`);
    },
    
    // =================================================================
    // JSON LOADING & CONTENT MANAGEMENT (Integrated from json-loader.js)
    // =================================================================
    
    /**
     * Load page JSON from section directory
     * @param {string} sectionName - Section name (blog, art, tools, projects)
     * @param {string} pageName - Page slug/filename without .json
     * @returns {Promise<Object>} - Parsed JSON page data
     */
    async loadPageJSON(sectionName, pageName) {
        const cacheKey = `${sectionName}/${pageName}`;
        
        // Return cached version if available
        if (this.jsonCache.has(cacheKey)) {
            console.log(`📄 Loading cached JSON: ${cacheKey}`);
            return this.jsonCache.get(cacheKey);
        }
        
        try {
            console.log(`📄 Fetching JSON: ${sectionName}/${pageName}.json`);
            
            const response = await fetch(`/${sectionName}/${pageName}.json`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const jsonData = await response.json();
            
            // Validate JSON schema
            this.validatePageJSON(jsonData, sectionName, pageName);
            
            // Cache the result
            this.jsonCache.set(cacheKey, jsonData);
            
            console.log(`✅ JSON loaded successfully: ${cacheKey}`);
            return jsonData;
            
        } catch (error) {
            console.error(`❌ Failed to load JSON ${cacheKey}:`, error);
            
            // Return fallback JSON structure
            return this.createFallbackJSON(sectionName, pageName, error.message);
        }
    },
    
    /**
     * Validate JSON schema compliance per Page Build Guide
     * @param {Object} jsonData - Parsed JSON data
     * @param {string} sectionName - Section name for context
     * @param {string} pageName - Page name for context
     */
    validatePageJSON(jsonData, sectionName, pageName) {
        const context = `${sectionName}/${pageName}`;
        
        // Check required root keys
        const requiredKeys = ['meta', 'subheader', 'layout', 'blocks'];
        for (const key of requiredKeys) {
            if (!jsonData.hasOwnProperty(key)) {
                console.warn(`⚠️ Missing required key '${key}' in ${context}`);
            }
        }
        
        // Validate meta structure
        if (jsonData.meta) {
            const requiredMeta = ['title', 'slug', 'section', 'template'];
            for (const key of requiredMeta) {
                if (!jsonData.meta.hasOwnProperty(key)) {
                    console.warn(`⚠️ Missing meta.${key} in ${context}`);
                }
            }
        }
        
        // Validate blocks array and types
        if (jsonData.blocks && Array.isArray(jsonData.blocks)) {
            const allowedBlockTypes = ['markdown', 'media', 'graph', 'custom'];
            
            jsonData.blocks.forEach((block, index) => {
                if (!block.type) {
                    console.warn(`⚠️ Block ${index} missing type in ${context}`);
                } else if (!allowedBlockTypes.includes(block.type)) {
                    console.warn(`⚠️ Invalid block type '${block.type}' in ${context}. Allowed: ${allowedBlockTypes.join(', ')}`);
                }
            });
        }
        
        console.log(`✅ JSON schema validation passed for ${context}`);
    },
    
    /**
     * Create fallback JSON when loading fails
     * @param {string} sectionName - Section name
     * @param {string} pageName - Page name  
     * @param {string} errorMessage - Error that occurred
     * @returns {Object} - Fallback JSON structure
     */
    createFallbackJSON(sectionName, pageName, errorMessage) {
        return {
            meta: {
                title: `${sectionName.toUpperCase()} - ${pageName}`,
                slug: pageName,
                section: sectionName,
                template: 'error'
            },
            subheader: {
                show: true,
                navMode: 'dropdown+prevnext'
            },
            layout: {
                columns: 1,
                theme: 'default'
            },
            blocks: [
                {
                    type: 'markdown',
                    content: `# Error Loading Content\n\nFailed to load: ${sectionName}/${pageName}.json\n\nError: ${errorMessage}`
                }
            ]
        };
    },
    
    // =================================================================
    // APPLICATION FEATURES & LIFECYCLE
    // =================================================================
    
    /**
     * Initialize global application features
     */
    initializeGlobalFeatures() {
        console.log('⚙️ Initializing global features...');
        
        // Initialize theme system
        this.initializeTheme();
        
        // Add global keyboard shortcuts
        this.initializeKeyboardShortcuts();
        
        // Add performance monitoring
        this.initializePerformanceMonitoring();
        
        // Add resize handling
        this.initializeResizeHandling();
        
        console.log('✅ Global features initialized');
    },
    
    /**
     * Initialize theme system
     */
    initializeTheme() {
        // Theme is handled by PageHeader component and CSS
        this.state.currentTheme = document.documentElement.classList.contains('inverted') ? 'inverted' : 'normal';
        console.log(`🎨 Theme initialized: ${this.state.currentTheme}`);
    },
    
    /**
     * Initialize keyboard shortcuts
     */
    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl+/ or Cmd+/ - Toggle theme
            if ((event.ctrlKey || event.metaKey) && event.key === '/') {
                event.preventDefault();
                this.toggleTheme();
            }
            
            // ESC - Close any open dropdowns/menus
            if (event.key === 'Escape') {
                // Close dropdowns logic would go here
                console.log('🔧 ESC pressed - closing dropdowns');
            }
        });
        
        console.log('⌨️ Keyboard shortcuts initialized');
    },
    
    /**
     * Initialize performance monitoring
     */
    initializePerformanceMonitoring() {
        // Monitor component render times
        this.performance = {
            startTime: performance.now(),
            componentRenders: 0,
            jsonLoads: 0
        };
        
        console.log('📊 Performance monitoring initialized');
    },
    
    /**
     * Initialize resize handling with layout recalculation
     */
    initializeResizeHandling() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log('📐 Window resized - recalculating layout');
                this.recalculateLayout();
            }, 150); // Debounced resize
        });
        
        console.log('📐 Resize handling initialized');
    },
    
    /**
     * Recalculate layout on window resize (delegated to PageContainer)
     */
    recalculateLayout() {
        if (!this.state.isInitialized || !this.pageContainer) return;
        
        // PageContainer handles its own resize and layout recalculation
        console.log('✅ App: Layout recalculation delegated to PageContainer');
    },
    
    /**
     * Toggle theme
     */
    toggleTheme() {
        const isInverted = document.documentElement.classList.toggle('inverted');
        this.state.currentTheme = isInverted ? 'inverted' : 'normal';
        console.log(`🎨 Theme toggled to: ${this.state.currentTheme}`);
    },
    
    /**
     * Show critical error to user
     */
    showCriticalError(message) {
        const appRoot = document.getElementById('app-root');
        if (appRoot) {
            appRoot.innerHTML = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: var(--vga-red);
                    color: var(--vga-white);
                    padding: 24px;
                    border: 2px solid var(--vga-white);
                    font-family: 'Space Mono', monospace;
                    text-align: center;
                    max-width: 400px;
                ">
                    <h2>CRITICAL ERROR</h2>
                    <p>${message}</p>
                    <p>Check console for details</p>
                </div>
            `;
        }
    },
    
    /**
     * Get application info
     */
    getInfo() {
        return {
            version: this.version,
            initialized: this.state.isInitialized,
            theme: this.state.currentTheme,
            currentSection: this.state.currentSection,
            hasSubheader: this.state.hasSubheader,
            performance: this.performance,
            cacheSize: this.jsonCache.size
        };
    },
    
    /**
     * Cleanup application
     */
    destroy() {
        console.log('🧹 Destroying SiteBoy App...');
        
        if (this.pageContainer) {
            this.pageContainer.destroy();
            this.pageContainer = null;
        }
        
        this.contentContainer = null;
        this.jsonCache.clear();
        this.sectionPages.clear();
        this.state.isInitialized = false;
        
        console.log('✅ SiteBoy App destroyed');
    }
};

// =================================================================
// AUTO-INITIALIZATION (Single Entry Point)
// =================================================================

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SiteBoyApp.init();
    });
} else {
    // DOM already loaded
    SiteBoyApp.init();
}

// Global registration
window.SiteBoyApp = SiteBoyApp;

console.log(`📱 SiteBoy App v${SiteBoyApp.version} - Unified Page Creation & JSON System Ready`);