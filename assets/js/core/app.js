/**
 * SiteBoy App - Clean Page Building System
 * 
 * FOCUSED RESPONSIBILITIES:
 * - Page structure creation and management
 * - JSON content loading and validation  
 * - Component integration and lifecycle
 * - Router integration for content rendering
 * - ⚠️ AUTOMATIC CLEANUP SYSTEM (see below)
 * 
 * @version 3.0.0 - Simplified Architecture
 * @dependencies ['ComponentLibrary', 'Router', './config.js']
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️ CRITICAL: CLEANUP LIFECYCLE SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This app AUTOMATICALLY cleans up sections when navigating between pages.
 * 
 * WHY THIS EXISTS:
 * Without cleanup, page-specific code persists across navigation causing:
 * ❌ Mouse tracking still active after leaving page
 * ❌ Intervals/timeouts running forever
 * ❌ Canvas elements accumulating in body
 * ❌ Memory leaks from uncleaned resources
 * ❌ Multiple event handlers stacking up
 * 
 * HOW IT WORKS:
 * 1. User navigates from Page A → Page B
 * 2. buildPageForRoute() calls cleanupCurrentSection()
 * 3. Page A's section.cleanup() is invoked
 * 4. section.cleanup() calls ComponentLibrary.destroyTracked()
 * 5. Each tool's destroy() removes listeners, intervals, canvases
 * 6. DOM cleared, Page B loads fresh
 * 
 * REQUIREMENTS FOR ALL DEVELOPERS:
 * 
 * ✅ SECTIONS MUST:
 * - Implement cleanup() method
 * - Call ComponentLibrary.destroyTracked(this.componentInstances)
 * - Clear this.currentContainer.innerHTML
 * 
 * ✅ TOOLS MUST:
 * - Implement destroy() method
 * - Store event handlers: this.boundHandlers = { mouseMove: null, ... }
 * - Remove ALL event listeners in destroy()
 * - Clear ALL intervals/timeouts
 * - Remove ALL elements added to body (canvas, etc.)
 * - Destroy ALL componentInstances
 * 
 * TESTING YOUR CLEANUP:
 * 1. Navigate to your page
 * 2. Open DevTools Console
 * 3. Navigate away
 * 4. Look for: "🧹 Cleaning up section: YourSection"
 * 5. Look for: "✅ YourSection cleanup completed"
 * 
 * ⚠️ IF YOU SEE: "⚠️ has no cleanup() method" → FIX IMMEDIATELY!
 * 
 * EXAMPLES:
 * @see cleanupCurrentSection() method for automatic system
 * @see AboutYouTool for complete cleanup implementation
 * @see ToolsSection.cleanup() for section cleanup pattern
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Config, LayoutCalculator, ComponentCalculator } from './config.js';

// =================================================================
// UTILITY MANAGERS - Simple, focused responsibilities
// =================================================================

const ResizeManager = {
    handlers: new Map(),
    tokenCounter: 0,
    
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
    
    unsubscribe(token) {
        if (this.handlers.has(token)) this.handlers.delete(token);
    },
    
    executeAllHandlers() {
        const evt = { width: window.innerWidth, height: window.innerHeight };
        this.handlers.forEach((handler, token) => {
            try { handler(evt); } 
            catch (error) { console.error(`ResizeManager error for ${token}:`, error); }
        });
    }
};

const BlockRenderer = {
    allowedBlockTypes: ['markdown', 'media', 'graph', 'custom'],
    
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
        const component = new ComponentLibrary.MarkdownBody({ 
            markdownText: block.content || '*No content*' 
        }, { MF: LayoutCalculator, Resize: ResizeManager });
        tracker.push(component);
        return component.render();
    },
    
    renderMediaBlock(block, tracker) {
        const { mediaType, src, caption, size = 'M' } = block;
        if (!mediaType || !src) return this.renderErrorBlock('Media block missing fields', tracker);
        
        let component;
        const deps = { MF: LayoutCalculator, Resize: ResizeManager };
        
        switch (mediaType.toLowerCase()) {
            case 'image': 
                component = new ComponentLibrary.Image({ src, caption, size: size.toLowerCase() }, deps); 
                break;
            case 'video': 
                component = new ComponentLibrary.Video({ src, caption, size: size.toLowerCase(), controls: true }, deps); 
                break;
            case 'audio': 
                component = new ComponentLibrary.Audio({ src, caption, controls: true }, deps); 
                break;
            default: 
                return this.renderErrorBlock(`Unknown media type: ${mediaType}`, tracker);
        }
        
        tracker.push(component);
        return component.render();
    },
    
    renderGraphBlock(block, tracker) {
        const { graphType, data, labels = [], title, size = 'm' } = block;
        if (!graphType || !Array.isArray(data)) return this.renderErrorBlock('Graph block missing fields', tracker);
        
        let component;
        const deps = { MF: LayoutCalculator, Resize: ResizeManager };
        
        switch (graphType.toLowerCase()) {
            case 'bar': 
                component = new ComponentLibrary.BarGraph({ data, labels, size, title }, deps); 
                break;
            case 'line': 
                component = new ComponentLibrary.LineGraph({ data, labels, size, title }, deps); 
                break;
            case 'pie': 
                component = new ComponentLibrary.PieGraph({ data, labels, size, title }, deps); 
                break;
            default: 
                return this.renderErrorBlock(`Unknown graph type: ${graphType}`, tracker);
        }
        
        tracker.push(component);
        return component.render();
    },
    
    renderCustomBlock(block, tracker) {
        const { component: compName, vars = {} } = block;
        if (!compName || !ComponentLibrary[compName]) {
            return this.renderErrorBlock(`Component ${compName} not found`, tracker);
        }
        
        try {
            const component = new ComponentLibrary[compName](vars, { 
                MF: LayoutCalculator, 
                Resize: ResizeManager 
            });
            tracker.push(component);
            return component.render();
        } catch (error) {
            return this.renderErrorBlock(`Error creating ${compName}: ${error.message}`, tracker);
        }
    },
    
    renderErrorBlock(errorMessage, tracker) {
        const component = new ComponentLibrary.Paragraph({ content: `⚠️ ${errorMessage}` }, {
            MF: LayoutCalculator, Resize: ResizeManager
        });
        component.addClass('block-error');
        tracker.push(component);
        return component.render();
    },
    
    renderBlocks(blocks, container, tracker = []) {
        if (!Array.isArray(blocks)) return;
        blocks.forEach(block => {
            const element = this.renderBlock(block, tracker);
            if (element) container.appendChild(element);
        });
    }
};

// =================================================================
// SITEBOY APP - Clean Page Building System
// =================================================================

const SiteBoyApp = {
    version: '3.0.0',
    
    // Application state
    state: {
        isInitialized: false,
        currentTheme: 'normal',
        currentSection: null,
        currentSectionModule: null, // Track section module for cleanup
        currentSectionName: null,   // Track section name for cleanup
        hasSubheader: false
    },
    
    // Component references
    pageContainer: null,
    contentContainer: null,
    
    // JSON content cache
    jsonCache: new Map(),
    
    /**
     * Initialize SiteBoy application - SINGLE ENTRY POINT
     */
    async init() {
        if (this.state.isInitialized) {
            console.log('🔄 SiteBoy App already initialized');
            return true;
        }
        
        console.log(`🚀 Initializing SiteBoy App v${this.version}...`);
        console.log('📋 Clean Page Building System');
        
        try {
            // Initialize CSS variables and core utilities first
            this.initializeCoreUtilities();
            
            // Validate dependencies
            if (!this.checkDependencies()) {
                throw new Error('Missing required dependencies');
            }
            
            // Create page structure
            this.createPageStructure();
            
            // Initialize integrated routing
            this.initializeRouting();
            
            // Initialize global features
            this.initializeGlobalFeatures();
            
            this.state.isInitialized = true;
            
            console.log('✅ SiteBoy App initialized successfully');
            console.log(`📊 F=${Config.F}px Mathematical Layout Active`);
            console.log(`📄 JSON-Driven Content System Ready`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize SiteBoy App:', error);
            this.showCriticalError(error.message);
            return false;
        }
    },
    
    /**
     * Initialize core utilities (CSS vars, resize handling)
     */
    initializeCoreUtilities() {
        LayoutCalculator.initializeCSSVars();
        ResizeManager.init();
        
        // Subscribe to resize events for page rebuilding
        this.resizeToken = ResizeManager.subscribe((evt) => {
            this.handlePageResize(evt);
        });
        
        // Make utilities globally available for legacy compatibility
        window.MathematicalFoundation = LayoutCalculator;
        window.ResizeManager = ResizeManager;
        window.BlockRenderer = BlockRenderer;
        window.Config = Config;
        window.SiteBoyApp = this;
        
        // Import and expose DynamicFManager
        import('../shared/dynamic-f-utils.js').then(module => {
            window.DynamicFManager = module.DynamicFManager;
        });
        
        console.log('✅ Core utilities initialized');
    },
    
    /**
     * Check required dependencies  
     */
    checkDependencies() {
        const required = ['ComponentLibrary'];
        
        for (const dep of required) {
            if (!window[dep]) {
                console.error(`❌ Missing dependency: ${dep}`);
                return false;
            }
        }
        
        console.log('✅ All dependencies available');
        return true;
    },
    
    /**
     * Create unified page structure
     */
    createPageStructure() {
        console.log('🏗️ Creating page structure...');
        
        // Get app root
        const appRoot = document.getElementById('app-root');
        if (!appRoot) {
            throw new Error('app-root element not found');
        }
        
        // Clear any existing content
        appRoot.innerHTML = '';
        
        // Create navigation items for header
        const navigationItems = [
            { title: 'HOME', onClick: () => this.navigateToSection('home') },
            { title: 'BLOG', onClick: () => this.navigateToSection('blog') },
            { title: 'ART', onClick: () => this.navigateToSection('art') },
            { title: 'TOOLS', onClick: () => this.navigateToSection('tools') },
            { title: 'PROJECTS', onClick: () => this.navigateToSection('projects') }
        ];
        
        // Create page container with dependencies
        const deps = {
            MF: LayoutCalculator,
            Resize: ResizeManager
        };
        
        const { container: pageElement, component: pageComponent } = ComponentLibrary.pageContainer({
            navigationItems: navigationItems,
            onNavigate: (item) => {
                if (item.onClick) {
                    item.onClick();
                } else if (item.title === 'HOME') {
                    // Handle direct home navigation from header
                    this.navigateToSection('home');
                }
            }
        }, deps);
        
        this.pageContainer = pageComponent;
        
        // Render and inject page structure
        appRoot.appendChild(pageElement);
        
        // Get content container reference
        this.contentContainer = this.pageContainer.getContentContainer();
        
        // Store references globally for sections to access  
        window.Subheader = this.pageContainer.subheaderComponent;
        
        console.log('✅ Page structure created');
    },
    
    /**
     * Set subheader state
     */
    setSubheaderState(hasSubheader) {
        this.state.hasSubheader = hasSubheader;
        
        if (this.pageContainer && this.pageContainer.setSubheaderState) {
            this.pageContainer.setSubheaderState(hasSubheader);
        }
        
        console.log(`📐 Subheader state: ${hasSubheader ? 'with' : 'no'} subheader`);
    },
    
    // =================================================================
    // INTEGRATED ROUTING - App tells what to build based on URL
    // =================================================================
    
    /**
     * Initialize integrated routing system
     */
    initializeRouting() {
        console.log('🧭 Initializing integrated routing...');
        
        // Available sections
        this.sections = {
            'home': 'HomeSection',
            'blog': 'BlogSection',
            'art': 'ArtSection', 
            'tools': 'ToolsSection',
            'projects': 'ProjectsSection',
            'contact': 'ContactSection'
        };
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRouteChange());
        
        // Handle initial route
        this.handleRouteChange();
        
        // Restore UI state after initial load
        setTimeout(() => {
            this.restoreUIState();
        }, 200);
        
        // Make navigation available globally for backward compatibility
        window.Router = {
            navigateToSection: (section, subsection = null) => this.navigateToSection(section, subsection),
            getCurrentRoute: () => this.getCurrentRoute()
        };
        
        console.log('✅ Integrated routing initialized');
    },
    
    /**
     * Parse current URL hash into section and subsection
     */
    parseRoute() {
        const hash = window.location.hash.slice(1); // Remove #
        
        if (!hash || hash === 'home') {
            return { section: 'home', subsection: null };
        }
        
        const parts = hash.split('/');
        const section = parts[0] || 'home';
        const subsection = parts.length > 1 ? parts.slice(1).join('/') : null;
        
        return { section, subsection };
    },
    
    /**
     * Handle route changes - app decides what to build
     */
    handleRouteChange() {
        const route = this.parseRoute();
        const { section, subsection } = route;
        
        console.log(`🧭 Route change: ${section}${subsection ? '/' + subsection : ''}`);
        
        // Update app state
        this.state.currentSection = section;
        
        // App tells what to build based on the route
        this.buildPageForRoute(section, subsection);
    },
    
    /**
     * Build page content for the given route
     * 
     * ⚠️ CLEANUP LIFECYCLE SYSTEM:
     * 
     * This method ensures proper cleanup when navigating between pages.
     * ALL sections and tools MUST implement cleanup to prevent:
     * - Event listeners persisting across pages
     * - Intervals/timeouts continuing after navigation
     * - Canvas/DOM elements staying in body
     * - Memory leaks from uncleaned resources
     * 
     * LIFECYCLE ORDER:
     * 1. cleanupCurrentSection() ← Calls section.cleanup()
     * 2. section.cleanup() ← Calls ComponentLibrary.destroyTracked()
     * 3. tool.destroy() ← Removes listeners, intervals, canvases
     * 4. DOM cleared (innerHTML = '')
     * 5. New section loaded
     * 
     * REQUIRED PATTERN FOR SECTIONS:
     * const MySection = {
     *     cleanup() {
     *         if (this.currentContainer) this.currentContainer.innerHTML = '';
     *         ComponentLibrary.destroyTracked(this.componentInstances);
     *     }
     * };
     * 
     * REQUIRED PATTERN FOR TOOLS:
     * class MyTool {
     *     constructor() {
     *         this.boundHandlers = {}; // Store for removal
     *         this.updateInterval = null;
     *     }
     *     destroy() {
     *         // Remove event listeners
     *         document.removeEventListener('mousemove', this.boundHandlers.mouseMove);
     *         // Clear intervals
     *         clearInterval(this.updateInterval);
     *         // Remove body elements
     *         if (this.canvas) this.canvas.parentNode.removeChild(this.canvas);
     *         // Destroy components
     *         ComponentLibrary.destroyTracked(this.componentInstances);
     *     }
     * }
     * 
     * TEST: Watch console for "🧹 Cleaning up section: X" and "✅ cleanup completed"
     * WARNING: If you see "⚠️ has no cleanup() method" → FIX IMMEDIATELY
     */
    buildPageForRoute(sectionName, subsectionName) {
        if (!this.contentContainer) {
            console.error('❌ No content container available');
            return;
        }
        
        // ⚠️ CRITICAL: Clean up previous section BEFORE clearing DOM
        // This prevents resource leaks (listeners, intervals, canvases, etc.)
        this.cleanupCurrentSection();
        
        // Clear content container
        this.contentContainer.innerHTML = '';
        
        // Clear subheader state before switching sections to prevent stale content
        if (window.Subheader) {
            console.log(`🧹 Clearing subheader before switching to: ${sectionName}/${subsectionName || 'index'}`);
            window.Subheader.hide();
            window.Subheader.clearContent();
            console.log(`✅ Subheader cleared, now calling section: ${sectionName}`);
        }
        
        try {
            // Get section class
            const sectionClass = this.sections[sectionName];
            
            if (!sectionClass) {
                console.error(`❌ Unknown section: ${sectionName}`);
                this.buildErrorPage(`Section not found: ${sectionName}`);
                return;
            }
            
            // Check if section module exists
            const SectionModule = window[sectionClass];
            if (!SectionModule) {
                console.error(`❌ Section module not loaded: ${sectionClass}`);
                this.buildErrorPage(`Section module not available: ${sectionClass}`);
                return;
            }
            
            // Track current section for cleanup
            this.state.currentSectionModule = SectionModule;
            this.state.currentSectionName = sectionName;
            
            // FIX: Tool pages need special layout - they manage their own sizing/scrolling
            if (sectionName === 'tools' && subsectionName && subsectionName !== 'tools-toc') {
                // Tools fill the entire content container with no padding
                this.contentContainer.style.padding = '0';
                // Get COMPUTED min-height (CSS sets it via variables, not inline)
                const computedMinHeight = getComputedStyle(this.contentContainer).minHeight;
                // Use explicit height so children can fill with height: 100%
                this.contentContainer.style.height = computedMinHeight;
                this.contentContainer.style.minHeight = 'auto';
                // Tools manage their own scrolling
                this.contentContainer.style.overflow = 'hidden';
                console.log('📐 Tool page detected - applied tool layout mode, height:', computedMinHeight);
            } else {
                // Restore default styling for non-tool pages
                this.contentContainer.style.padding = '';
                this.contentContainer.style.height = '';
                this.contentContainer.style.minHeight = '';
                this.contentContainer.style.overflow = '';
            }
            
            // App coordinates the section building (async support)
            if (typeof SectionModule.handleRoute === 'function') {
                const routeResult = SectionModule.handleRoute(subsectionName, this.contentContainer, {
                    navigateToSection: (section, subsection = null) => this.navigateToSection(section, subsection),
                    getCurrentRoute: () => this.getCurrentRoute()
                });
                
                // Handle async sections
                if (routeResult && typeof routeResult.then === 'function') {
                    routeResult.catch(error => {
                        console.error(`❌ Error in async section ${sectionName}:`, error);
                        this.buildErrorPage(`Error loading ${sectionName}: ${error.message}`);
                    });
                }
            } else if (typeof SectionModule.init === 'function') {
                SectionModule.init();
                if (typeof SectionModule.render === 'function') {
                    const sectionContent = SectionModule.render(subsectionName);
                    this.contentContainer.appendChild(sectionContent);
                }
            } else {
                console.error(`❌ Section ${sectionClass} missing handleRoute or init method`);
                this.buildErrorPage(`Section ${sectionName} not properly implemented`);
            }
            
        } catch (error) {
            console.error(`❌ Error building page for ${sectionName}:`, error);
            this.buildErrorPage(`Failed to load ${sectionName}: ${error.message}`);
        }
    },
    
    /**
     * Clean up current section before switching
     * 
     * ⚠️ AUTOMATIC CLEANUP SYSTEM:
     * 
     * This method is called AUTOMATICALLY before every page navigation.
     * It ensures all page-specific code is removed to prevent:
     * 
     * COMMON LEAKS:
     * ❌ Event listeners on document/window (e.g., mousemove, click, scroll)
     * ❌ setInterval/setTimeout still running
     * ❌ Canvas elements appended to body
     * ❌ Global state modifications
     * ❌ WebSocket/fetch requests not aborted
     * 
     * WHAT GETS CLEANED:
     * ✅ section.cleanup() is called (if exists)
     * ✅ Section clears container: this.currentContainer.innerHTML = ''
     * ✅ Section calls: ComponentLibrary.destroyTracked(this.componentInstances)
     * ✅ Each tool's destroy() method removes its resources
     * 
     * DEBUGGING:
     * - Console shows: "🧹 Cleaning up section: X"
     * - Console shows: "✅ Section X cleanup completed"
     * - Console warns: "⚠️ Section X has no cleanup() method" ← FIX THIS!
     * 
     * HOW TO TEST:
     * 1. Navigate to your page
     * 2. Add event listener: document.addEventListener('mousemove', handler)
     * 3. Navigate away to another page
     * 4. Move mouse - handler should NOT fire
     * 5. Check console for cleanup logs
     * 
     * REQUIREMENTS FOR ALL SECTIONS:
     * - MUST implement cleanup() method
     * - MUST call ComponentLibrary.destroyTracked(this.componentInstances)
     * - MUST clear this.currentContainer.innerHTML
     * 
     * REQUIREMENTS FOR ALL TOOLS:
     * - MUST implement destroy() method
     * - MUST store event handlers as this.boundHandlers = {}
     * - MUST remove all event listeners in destroy()
     * - MUST clear all intervals/timeouts
     * - MUST remove all elements added to body
     * - MUST call destroy() on all componentInstances
     * 
     * @see AboutYouTool for complete cleanup example
     */
    cleanupCurrentSection() {
        if (!this.state.currentSectionModule) {
            return; // No section to clean up (first load)
        }
        
        const sectionName = this.state.currentSectionName || 'Unknown';
        console.log(`🧹 Cleaning up section: ${sectionName}`);
        
        try {
            // Call section's cleanup method if it exists
            if (typeof this.state.currentSectionModule.cleanup === 'function') {
                this.state.currentSectionModule.cleanup();
                console.log(`✅ Section ${sectionName} cleanup completed`);
            } else {
                // ⚠️ CRITICAL WARNING: Missing cleanup method
                // This section WILL leak resources!
                console.warn(`⚠️ Section ${sectionName} has no cleanup() method - may leak resources`);
                console.warn(`⚠️ Add cleanup() method to ${sectionName} to remove event listeners, intervals, etc.`);
            }
        } catch (error) {
            console.error(`❌ Error cleaning up section ${sectionName}:`, error);
            console.error(`❌ Section may have left resources in inconsistent state`);
        }
        
        // Clear tracking references
        this.state.currentSectionModule = null;
        this.state.currentSectionName = null;
    },
    
    /**
     * Navigate to section (programmatic navigation)
     */
    navigateToSection(section, subsection = null) {
        const hash = `#${section}${subsection ? '/' + subsection : ''}`;
        
        if (window.location.hash !== hash) {
            window.location.hash = hash;
            // hashchange event will trigger handleRouteChange
        }
    },
    
    /**
     * Get current route info
     */
    getCurrentRoute() {
        const route = this.parseRoute();
        return {
            section: route.section,
            subsection: route.subsection
        };
    },
    
    /**
     * Handle page resize - rebuild current section while preserving scroll position
     */
    handlePageResize(evt) {
        if (!this.state.isInitialized || !this.state.currentSection) {
            return;
        }
        
        // Get current route
        const route = this.parseRoute();
        
        // Skip rebuild for active animations/tools to prevent breaking running scripts
        if (route.section === 'art' && route.subsection && route.subsection.includes('generative/') && route.subsection !== 'generative') {
            console.log(`⏭️ Skipping resize rebuild for active animation: ${route.subsection}`);
            return;
        }
        
        // Skip rebuild for tool pages - tools manage their own resize/state
        if (route.section === 'tools' && route.subsection) {
            console.log(`⏭️ Skipping resize rebuild for tool: ${route.subsection}`);
            return;
        }
        
        console.log(`🔄 Page resize detected (${evt.width}x${evt.height}) - rebuilding current section`);
        
        // Store current state before rebuild
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const uiState = this.saveUIState();
        
        // Rebuild the current page for the new dimensions
        this.buildPageForRoute(route.section, route.subsection);
        
        // Restore state after a brief delay to allow rendering
        requestAnimationFrame(() => {
            setTimeout(() => {
                this.restoreUIState(uiState);
                window.scrollTo(0, scrollTop);
                console.log(`✅ Section rebuilt and scroll position restored (${scrollTop}px)`);
            }, 100); // Allow time for DOM to stabilize
        });
    },
    
    /**
     * Save current UI state (collapsible sections, dropdowns, etc.)
     */
    saveUIState() {
        const state = {
            collapsibleStates: {},
            dropdownStates: [],
            timestamp: Date.now()
        };
        
        // Save collapsible section states
        document.querySelectorAll('[data-collapsible-id]').forEach(element => {
            const id = element.getAttribute('data-collapsible-id');
            const isExpanded = !element.classList.contains('collapsed') && 
                              element.style.display !== 'none';
            state.collapsibleStates[id] = isExpanded;
        });
        
        // Save dropdown states
        document.querySelectorAll('.dropdown, [id*="dropdown"]').forEach(dropdown => {
            if (!dropdown.classList.contains('hidden') && dropdown.style.display !== 'none') {
                state.dropdownStates.push(dropdown.id || dropdown.className);
            }
        });
        
        // Also save to localStorage for refresh persistence
        localStorage.setItem('siteboy-ui-state', JSON.stringify(state));
        
        return state;
    },
    
    /**
     * Restore UI state after rebuild
     */
    restoreUIState(state) {
        // If no state provided, try to load from localStorage
        if (!state) {
            try {
                const savedState = localStorage.getItem('siteboy-ui-state');
                if (savedState) {
                    state = JSON.parse(savedState);
                }
            } catch (e) {
                console.warn('Could not restore UI state from localStorage:', e);
                return;
            }
        }
        
        if (!state || Date.now() - state.timestamp > 30000) {
            return; // Don't restore very old state (30 seconds max)
        }
        
        // Restore collapsible states
        Object.entries(state.collapsibleStates).forEach(([id, isExpanded]) => {
            const element = document.querySelector(`[data-collapsible-id="${id}"]`);
            if (element) {
                if (isExpanded) {
                    element.classList.remove('collapsed');
                    element.style.display = 'block';
                } else {
                    element.classList.add('collapsed');
                    element.style.display = 'none';
                }
            }
        });
        
        // Restore dropdown states (if any were open)
        state.dropdownStates.forEach(dropdownId => {
            const dropdown = document.getElementById(dropdownId) || 
                            document.querySelector(`.${dropdownId}`);
            if (dropdown) {
                dropdown.classList.remove('hidden');
                dropdown.style.display = 'block';
            }
        });
    },
    
    /**
     * Build error page using ComponentLibrary
     */
    buildErrorPage(message) {
        console.error(`❌ Building error page: ${message}`);
        
        // Use ComponentLibrary if available
        if (window.ComponentLibrary) {
            try {
                const errorHeading = new ComponentLibrary.Heading({
                    level: 1,
                    content: 'SYSTEM ERROR'
                });
                
                const errorMessage = new ComponentLibrary.Paragraph({
                    content: message
                });
                
                const reloadButton = new ComponentLibrary.Button({
                    text: 'RELOAD APPLICATION',
                    onClick: () => window.location.reload()
                });
                
                this.contentContainer.appendChild(errorHeading.render());
                this.contentContainer.appendChild(errorMessage.render());
                this.contentContainer.appendChild(reloadButton.render());
                
                return;
            } catch (componentError) {
                console.error('Failed to use ComponentLibrary for error page:', componentError);
            }
        }
        
        // Fallback to basic DOM creation
        const errorContainer = document.createElement('div');
        errorContainer.style.cssText = `
            padding: 48px;
            text-align: center;
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: 12px;
        `;
        
        const errorTitle = document.createElement('h1');
        errorTitle.textContent = 'SYSTEM ERROR';
        errorTitle.style.cssText = `
            font-size: 24px;
            margin-bottom: 24px;
            color: var(--vga-red);
            text-transform: uppercase;
        `;
        
        const errorMsg = document.createElement('p');
        errorMsg.textContent = message;
        errorMsg.style.cssText = `
            color: var(--c-border);
            margin-bottom: 24px;
        `;
        
        const reloadButton = document.createElement('button');
        reloadButton.textContent = 'RELOAD APPLICATION';
        reloadButton.style.cssText = `
            background: var(--c-border);
            color: var(--c-bg);
            border: none;
            padding: 12px 24px;
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: 12px;
            cursor: pointer;
            text-transform: uppercase;
        `;
        reloadButton.onclick = () => window.location.reload();
        
        errorContainer.appendChild(errorTitle);
        errorContainer.appendChild(errorMsg);
        errorContainer.appendChild(reloadButton);
        
        this.contentContainer.appendChild(errorContainer);
    },
    
    // =================================================================
    // JSON LOADING & CONTENT MANAGEMENT
    // =================================================================
    
    /**
     * Load page JSON from section directory
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
            return this.createFallbackJSON(sectionName, pageName, error.message);
        }
    },
    
    /**
     * Validate JSON schema compliance
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
        
        // Validate blocks array and types
        if (jsonData.blocks && Array.isArray(jsonData.blocks)) {
            const allowedBlockTypes = ['markdown', 'media', 'graph', 'custom'];
            
            jsonData.blocks.forEach((block, index) => {
                if (!block.type) {
                    console.warn(`⚠️ Block ${index} missing type in ${context}`);
                } else if (!allowedBlockTypes.includes(block.type)) {
                    console.warn(`⚠️ Invalid block type '${block.type}' in ${context}`);
                }
            });
        }
        
        console.log(`✅ JSON schema validation passed for ${context}`);
    },
    
    /**
     * Create fallback JSON when loading fails
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
    // SECTION MANAGEMENT & DISCOVERY
    // =================================================================
    
    /**
     * Get all pages in a section (simplified)
     */
    async getSectionPages(sectionName) {
        try {
            // For now, return known pages - could be enhanced to auto-discover
            const knownPages = {
                blog: ['example', 'getting-started', 'framework-design'],
                art: ['gallery', 'portfolio'],
                tools: ['ui-test-tool', 'performance'],
                projects: ['siteboy', 'portfolio']
            };
            
            const pages = knownPages[sectionName] || [];
            return pages.map(slug => ({
                title: slug.replace(/-/g, ' ').toUpperCase(),
                slug: slug
            }));
            
        } catch (error) {
            console.error(`❌ Failed to get section pages for ${sectionName}:`, error);
            return [];
        }
    },
    
    // =================================================================
    // GLOBAL FEATURES
    // =================================================================
    
    /**
     * Initialize minimal global features
     */
    initializeGlobalFeatures() {
        // Theme toggle shortcut
        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === '/') {
                event.preventDefault();
                this.toggleTheme();
            }
        });
        
        console.log('✅ Global features initialized');
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
                    font-family: 'Atkinson Hyperlegible Mono', monospace;
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
     * Cleanup application
     */
    destroy() {
        console.log('🧹 Destroying SiteBoy App...');
        
        // Unsubscribe from resize events
        if (this.resizeToken) {
            ResizeManager.unsubscribe(this.resizeToken);
            this.resizeToken = null;
        }
        
        if (this.pageContainer) {
            this.pageContainer.destroy();
            this.pageContainer = null;
        }
        
        this.contentContainer = null;
        this.jsonCache.clear();
        this.state.isInitialized = false;
        
        console.log('✅ SiteBoy App destroyed');
    }
};

// =================================================================
// GLOBAL REGISTRATION & AUTO-INITIALIZATION
// =================================================================

// Make SiteBoyApp globally available
window.SiteBoyApp = SiteBoyApp;

// App initialization is now handled manually from index.html
// to ensure all dependencies (including ES6 modules) are loaded first

export default SiteBoyApp;
