/**
 * Blog Section - SiteBoy Framework
 * 
 * JSON-DRIVEN BLOG SECTION - Page Build Guide Compliant
 * Implements complete file call order: JSON → subheader → blocks → render
 * Uses only ComponentLibrary, no router coupling
 * 
 * @version 2.0.0 - JSON-Driven Content System
 * @dependencies ['ComponentLibrary', 'JSONLoader', 'BlockRenderer'] - JSON system
 */

const BlogSection = {
    version: '2.0.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    currentPageData: null,
    
    /**
     * Handle route changes for blog section - STEP 5 in File Call Order
     * @param {string|null} subsection - Page slug or null for index
     * @param {HTMLElement} container - Content container
     * @param {Object} callbacks - Navigation callbacks (injected from router)
     */
    async handleRoute(subsection, container, callbacks = {}) {
        console.log(`📝 Blog Section v${this.version} handling route: ${subsection || 'index'}`);
        console.log('📋 Following Page Build Guide File Call Order...');
        
        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        
        // STEP 3: Destroy previous section components
        this.cleanup();
        
        // Apply proper body sizing for blog section (with subheader)
        if (window.MathematicalFoundation) {
            const contentContainer = this.currentContainer.closest('.content-container');
            if (contentContainer) {
                window.MathematicalFoundation.applyContainerVars(contentContainer, { 
                    withSubheader: true 
                });
                console.log('✅ Applied with-subheader body sizing for blog section');
            }
        }
        
        // Determine page to load
        const pageName = subsection || 'example'; // Default to example page
        
        try {
            // STEP 6: Fetch page JSON using SiteBoyApp
            console.log('📄 STEP 6: Fetching page JSON...');
            this.currentPageData = await window.SiteBoyApp.loadPageJSON('blog', pageName);
            
            // STEP 7: Render subheader (dropdown + prev/next)
            console.log('🧭 STEP 7: Building subheader navigation...');
            await this.buildSubheader('blog', pageName);
            
            // STEP 8: Parse JSON (validation already done in JSONLoader)
            console.log('✅ STEP 8: JSON parsing complete');
            
            // STEP 9 & 10: Render blocks from JSON using ComponentLibrary
            console.log('🧩 STEPS 9-10: Rendering JSON blocks to ComponentLibrary components...');
            await this.renderPageContent();
            
            // STEP 11: URL hash already updated by router
            console.log('✅ STEP 11: URL hash managed by router');
            
            console.log('✅ Blog page loaded successfully following File Call Order');
            
        } catch (error) {
            console.error('❌ Failed to load blog page:', error);
            this.renderErrorPage(error.message);
        }
    },
    
    /**
     * STEP 7: Build subheader with dropdown and prev/next navigation
     * @param {string} sectionName - Current section
     * @param {string} currentPage - Current page slug
     */
    async buildSubheader(sectionName, currentPage) {
        if (!window.Subheader) {
            console.warn('⚠️ Subheader component not available');
            return;
        }
        
        // Check if page wants subheader
        if (!this.currentPageData.subheader || !this.currentPageData.subheader.show) {
            window.Subheader.hide();
            return;
        }
        
        // Update subheader title
        const pageTitle = this.currentPageData.meta.title || 'BLOG';
        window.Subheader.updateTitle(pageTitle);
        
        // Build dropdown navigation (left half)
        console.log('🔍 Building dropdown navigation...');
        const dropdownItems = await this.buildDropdownNavigation(sectionName, currentPage);
        
        // Build prev/next navigation (right half)  
        console.log('⏭️ Building prev/next navigation...');
        const navigation = await this.buildPrevNextNavigation(sectionName, currentPage);
        
        // Update subheader with navigation
        window.Subheader.setDropdownContent(dropdownItems);
        window.Subheader.updateNavigation(
            navigation.prev ? () => this.navigateToPage(navigation.prev.url) : null,
            navigation.next ? () => this.navigateToPage(navigation.next.url) : null
        );
        
        // Show subheader
        window.Subheader.show();
        
        console.log('✅ Subheader navigation built successfully');
    },
    
    /**
     * Build dropdown navigation for left half of subheader
     * @param {string} sectionName - Current section
     * @param {string} currentPage - Current page slug
     * @returns {Array} - Dropdown items
     */
    async buildDropdownNavigation(sectionName, currentPage) {
        try {
            // Get all pages in section for dropdown
            // Simplified dropdown - just current page for now
            const dropdownItems = [{ label: currentPage, path: `#${sectionName}/${currentPage}` }];
            
            console.log(`📋 Found ${dropdownItems.length} pages for dropdown:`, dropdownItems.map(item => item.label));
            
            console.log('📋 Dropdown navigation ready:', dropdownItems.length, 'items');
            return dropdownItems;
            
        } catch (error) {
            console.error('❌ Failed to build dropdown navigation:', error);
            return [];
        }
    },
    
    /**
     * Build prev/next navigation for right half of subheader
     * @param {string} sectionName - Current section  
     * @param {string} currentPage - Current page slug
     * @returns {Object} - Navigation data {prev, next}
     */
    async buildPrevNextNavigation(sectionName, currentPage) {
        try {
            // Get prev/next page info
            // Simplified navigation - no prev/next for now  
            const navigation = { prev: null, next: null };
            
            console.log('⏭️ Prev/Next navigation:', navigation);
            console.log('✅ Prev/Next navigation ready');
            
            return navigation;
            
        } catch (error) {
            console.error('❌ Failed to build prev/next navigation:', error);
            return { prev: null, next: null };
        }
    },
    
    /**
     * Navigate to a page using injected navigation callbacks
     * @param {string} url - Page URL (e.g., '#blog/example')
     */
    navigateToPage(url) {
        if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
            const hashPath = url.replace('#', '');
            const [section, pageName] = hashPath.split('/');
            this.navigationCallbacks.navigateToSection(section, pageName);
        } else {
            console.warn('⚠️ Navigation callbacks not available');
        }
    },
    
    /**
     * STEPS 9-10: Render page content from JSON blocks using ComponentLibrary
     */
    async renderPageContent() {
        if (!this.currentPageData || !this.currentPageData.blocks) {
            console.error('❌ No page data or blocks available');
            return;
        }
        
        console.log(`🧩 Rendering ${this.currentPageData.blocks.length} blocks from JSON...`);
        
        // Apply layout configuration
        this.applyLayoutConfiguration();
        
        // Render blocks in order using BlockRenderer (now in SiteBoyApp)
        window.BlockRenderer.renderBlocks(
            this.currentPageData.blocks,
            this.currentContainer,
            this.componentInstances
        );
        
        console.log('✅ Page content rendered successfully');
    },
    
    /**
     * Apply layout configuration from JSON
     */
    applyLayoutConfiguration() {
        if (!this.currentPageData.layout) return;
        
        const { columns, theme } = this.currentPageData.layout;
        
        // Apply layout classes to container
        if (columns) {
            this.currentContainer.classList.add(`layout-columns-${columns}`);
        }
        
        if (theme && theme !== 'default') {
            this.currentContainer.classList.add(`layout-theme-${theme}`);
        }
        
        console.log(`📐 Applied layout: ${columns} columns, ${theme} theme`);
    },
    
    /**
     * Render error page when JSON loading fails
     * @param {string} errorMessage - Error description
     */
    renderErrorPage(errorMessage) {
        console.error(`❌ Rendering error page: ${errorMessage}`);
        
        // Hide subheader
        if (window.Subheader) {
            window.Subheader.hide();
        }
        
        // Create error content using ComponentLibrary
        const errorHeading = new ComponentLibrary.Heading({
            level: 1,
            content: 'Blog Loading Error'
        });
        this.componentInstances.push(errorHeading);
        this.currentContainer.appendChild(errorHeading.render());
        
        const errorMessage_component = new ComponentLibrary.Paragraph({
            content: `Failed to load blog page: ${errorMessage}`
        });
        this.componentInstances.push(errorMessage_component);
        this.currentContainer.appendChild(errorMessage_component.render());
        
        const reloadButton = new ComponentLibrary.Button({
            text: 'Reload Page',
            onClick: () => window.location.reload()
        });
        this.componentInstances.push(reloadButton);
        this.currentContainer.appendChild(reloadButton.render());
    },
    
    /**
     * STEP 3: Cleanup section - destroy all component instances
     */
    cleanup() {
        console.log('🧹 STEP 3: Destroying previous section components...');
        
        if (this.currentContainer) {
            this.currentContainer.innerHTML = '';
            // Remove layout classes
            this.currentContainer.className = this.currentContainer.className
                .replace(/layout-\w+-\w+/g, '')
                .trim();
        }
        
        // Destroy tracked components using ComponentLibrary method
        ComponentLibrary.destroyTracked(this.componentInstances);
        
        this.currentPageData = null;
        
        console.log('✅ Section cleanup complete');
    },
    
    /**
     * Get section info for navigation
     */
    getSectionInfo() {
        return {
            name: 'blog',
            title: 'BLOG',
            currentPage: this.currentPageData ? this.currentPageData.meta.slug : null,
            pageCount: this.componentInstances.length
        };
    },
    
    /**
     * Initialize section (legacy support)
     */
    init() {
        console.log(`📝 Blog Section v${this.version} initialized - JSON-Driven Content System`);
    },
    
    /**
     * Render section (legacy support)
     */
    render(subsection) {
        const container = document.createElement('div');
        this.handleRoute(subsection, container);
        return container;
    }
};

// Global registration
window.BlogSection = BlogSection;

console.log(`📝 Blog Section v${BlogSection.version} ready - JSON-Driven Content System`);